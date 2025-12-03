/**
 * Email Subscribers API
 * GET /api/subscribers - List all subscribers with filtering/pagination
 * POST /api/subscribers - Add a new subscriber (from popup or manual)
 * 
 * Integrates with:
 * - Email Subscribers dashboard section
 * - Email popup on blog frontend
 * - Email Marketing campaigns
 */

/**
 * GET /api/subscribers - List subscribers
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const status = url.searchParams.get('status'); // active, unsubscribed, bounced
  const source = url.searchParams.get('source'); // popup, import, manual, api
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const sortBy = url.searchParams.get('sort') || 'subscribed_at';
  const sortOrder = url.searchParams.get('order') || 'DESC';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Ensure all columns exist (safe migration)
    const migrations = [
      "ALTER TABLE email_subscribers ADD COLUMN country TEXT",
      "ALTER TABLE email_subscribers ADD COLUMN ip_address TEXT",
      "ALTER TABLE email_subscribers ADD COLUMN preferences TEXT",
      "ALTER TABLE email_subscribers ADD COLUMN tags TEXT",
      "ALTER TABLE email_subscribers ADD COLUMN custom_fields TEXT"
    ];
    
    for (const sql of migrations) {
      try {
        await env.DB.prepare(sql).run();
      } catch (e) {
        // Column may already exist - safe to ignore
      }
    }
    // Build query
    let query = "SELECT * FROM email_subscribers";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (source) {
      conditions.push("source = ?");
      params.push(source);
    }

    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Validate sort column
    const allowedSorts = ['email', 'name', 'status', 'source', 'subscribed_at', 'created_at'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'subscribed_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM email_subscribers";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    
    const countParams = params.slice(0, -2); // Remove limit and offset
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 
      ? await countStmt.bind(...countParams).first()
      : await countStmt.first();

    // Get stats
    const statsResult = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM email_subscribers
    `).first();

    return new Response(JSON.stringify({
      subscribers: results || [],
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: (offset + results.length) < (countResult?.total || 0)
      },
      stats: {
        total: statsResult?.total || 0,
        active: statsResult?.active || 0,
        unsubscribed: statsResult?.unsubscribed || 0,
        bounced: statsResult?.bounced || 0
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST /api/subscribers - Add new subscriber
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    // Validate email
    if (!data.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const email = data.email.toLowerCase().trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if already subscribed
    const existing = await env.DB.prepare(
      "SELECT id, status FROM email_subscribers WHERE email = ?"
    ).bind(email).first();

    if (existing) {
      if (existing.status === 'active') {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Already subscribed",
          existing: true,
          subscriber_id: existing.id
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        // Reactivate unsubscribed user
        const now = Date.now();
        await env.DB.prepare(`
          UPDATE email_subscribers 
          SET status = 'active', subscribed_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(now, now, existing.id).run();

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Subscription reactivated",
          reactivated: true,
          subscriber_id: existing.id
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Create new subscriber
    const id = `sub_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();
    
    // Get IP from headers
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For')?.split(',')[0] || 
               null;

    const subscriber = {
      id,
      email,
      name: data.name || null,
      status: 'active',
      source: data.source || 'popup',
      ip_address: ip,
      country: request.cf?.country || null,
      subscribed_at: now,
      preferences: data.preferences ? JSON.stringify(data.preferences) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      custom_fields: data.custom_fields ? JSON.stringify(data.custom_fields) : null,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO email_subscribers (
        id, email, name, status, source, ip_address, country,
        subscribed_at, preferences, tags, custom_fields, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      subscriber.id, subscriber.email, subscriber.name, subscriber.status,
      subscriber.source, subscriber.ip_address, subscriber.country,
      subscriber.subscribed_at, subscriber.preferences, subscriber.tags,
      subscriber.custom_fields, subscriber.created_at, subscriber.updated_at
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Successfully subscribed",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // Handle duplicate email error
    if (error.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Already subscribed",
        existing: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
