/**
 * Support Customers API
 * GET /api/customers - List customers (admin only)
 * POST /api/customers - Register a new customer
 */

/**
 * GET /api/customers - List customers
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT id, email, name, phone, company, status, email_verified, last_login, total_tickets, created_at FROM support_customers";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ? OR company LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results: customers } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM support_customers";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 
      ? await countStmt.bind(...countParams).first()
      : await countStmt.first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        customers,
        pagination: {
          total: countResult?.total || 0,
          limit,
          offset
        }
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST /api/customers - Register new customer
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    // Validation
    if (!data.email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const email = data.email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if customer exists
    const existing = await env.DB.prepare(
      "SELECT id, email, name FROM support_customers WHERE email = ?"
    ).bind(email).first();

    if (existing) {
      return new Response(JSON.stringify({ 
        success: true,
        message: "Customer already exists",
        existing: true,
        data: {
          customer: {
            id: existing.id,
            email: existing.email,
            name: existing.name
          }
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate password if provided
    if (data.password && data.password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const customerId = `cust_${crypto.randomUUID().split('-')[0]}`;
    
    // Hash password if provided
    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    const customer = {
      id: customerId,
      email,
      name: data.name || email.split('@')[0],
      phone: data.phone || null,
      company: data.company || null,
      password_hash: passwordHash,
      status: 'active',
      email_verified: 0,
      verification_token: verificationToken,
      preferences: data.preferences ? JSON.stringify(data.preferences) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO support_customers (
        id, email, name, phone, company, password_hash, status,
        email_verified, verification_token, preferences, metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customer.id, customer.email, customer.name, customer.phone,
      customer.company, customer.password_hash, customer.status,
      customer.email_verified, customer.verification_token,
      customer.preferences, customer.metadata, customer.created_at,
      customer.updated_at
    ).run();

    // Generate token for immediate login
    const authToken = await generateToken(customerId, email);

    // Store token in KV for validation
    if (env.KV) {
      try {
        await env.KV.put(`auth_${authToken}`, JSON.stringify({
          customer_id: customerId,
          email,
          created_at: now
        }), { expirationTtl: 86400 * 7 }); // 7 days
      } catch (e) {
        console.error('KV error:', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Registration successful",
      data: {
        customer: {
          id: customerId,
          email: customer.email,
          name: customer.name
        },
        token: authToken
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // Handle duplicate email
    if (error.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ success: false, error: "Email already registered" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * Hash password
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fooodis_support_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate auth token
 */
async function generateToken(customerId, email) {
  const data = `${customerId}:${email}:${Date.now()}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
