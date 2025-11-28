/**
 * Support Tickets API
 * GET /api/tickets - List tickets (with filtering for admin/customer)
 * POST /api/tickets - Create a new ticket
 * 
 * Supports both admin dashboard and customer support portal
 */

/**
 * GET /api/tickets - List tickets
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // Query parameters
  const customer = url.searchParams.get('customer'); // Filter by customer email
  const customerId = url.searchParams.get('customer_id');
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const category = url.searchParams.get('category');
  const assignee = url.searchParams.get('assignee');
  const search = url.searchParams.get('search');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const sortBy = url.searchParams.get('sort') || 'created_at';
  const sortOrder = url.searchParams.get('order') || 'DESC';

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Build query
    let query = "SELECT * FROM support_tickets";
    const conditions = [];
    const params = [];

    // Filter by customer email (for customer portal)
    if (customer) {
      conditions.push("customer_email = ?");
      params.push(customer.toLowerCase());
    }

    // Filter by customer ID
    if (customerId) {
      conditions.push("customer_id = ?");
      params.push(customerId);
    }

    // Filter by status
    if (status && status !== 'all') {
      conditions.push("status = ?");
      params.push(status);
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      conditions.push("priority = ?");
      params.push(priority);
    }

    // Filter by category
    if (category && category !== 'all') {
      conditions.push("category = ?");
      params.push(category);
    }

    // Filter by assignee
    if (assignee) {
      conditions.push("assignee_id = ?");
      params.push(assignee);
    }

    // Search
    if (search) {
      conditions.push("(subject LIKE ? OR description LIKE ? OR customer_name LIKE ? OR ticket_number LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Validate sort column
    const allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'ticket_number'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const { results: tickets } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM support_tickets";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 
      ? await countStmt.bind(...countParams).first()
      : await countStmt.first();

    // Get stats
    const stats = await getTicketStats(env.DB, customer);

    // Parse tags for each ticket
    const formattedTickets = tickets.map(t => ({
      ...t,
      tags: t.tags ? JSON.parse(t.tags) : []
    }));

    return new Response(JSON.stringify({
      success: true,
      data: {
        tickets: formattedTickets,
        pagination: {
          total: countResult?.total || 0,
          limit,
          offset,
          hasMore: (offset + tickets.length) < (countResult?.total || 0)
        },
        stats
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
 * POST /api/tickets - Create new ticket
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
    if (!data.subject || !data.description) {
      return new Response(JSON.stringify({ success: false, error: "Subject and description are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!data.email && !data.customer_email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const ticketNumber = await generateTicketNumber(env.DB);
    const ticketId = `tkt_${crypto.randomUUID().split('-')[0]}`;

    // Get or create customer
    const email = (data.email || data.customer_email).toLowerCase().trim();
    const customerName = data.customer || data.name || email.split('@')[0];
    let customerId = data.userId || data.customer_id || null;

    // Try to find existing customer
    if (!customerId) {
      const existingCustomer = await env.DB.prepare(
        "SELECT id FROM support_customers WHERE email = ?"
      ).bind(email).first();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }

    // Create ticket
    const ticket = {
      id: ticketId,
      ticket_number: ticketNumber,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: email,
      subject: data.subject,
      description: data.description,
      category: data.category || 'general',
      priority: data.priority || 'medium',
      status: 'open',
      tags: data.tags ? JSON.stringify(data.tags) : null,
      source: data.source || 'web',
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO support_tickets (
        id, ticket_number, customer_id, customer_name, customer_email,
        subject, description, category, priority, status, tags, source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ticket.id, ticket.ticket_number, ticket.customer_id, ticket.customer_name,
      ticket.customer_email, ticket.subject, ticket.description, ticket.category,
      ticket.priority, ticket.status, ticket.tags, ticket.source,
      ticket.created_at, ticket.updated_at
    ).run();

    // Add initial message
    await env.DB.prepare(`
      INSERT INTO support_messages (
        id, ticket_id, author_type, author_id, author_name, author_email, content, created_at
      ) VALUES (?, ?, 'customer', ?, ?, ?, ?, ?)
    `).bind(
      `msg_${crypto.randomUUID().split('-')[0]}`,
      ticketId,
      customerId,
      customerName,
      email,
      data.description,
      now
    ).run();

    // Update message count
    await env.DB.prepare(
      "UPDATE support_tickets SET message_count = 1 WHERE id = ?"
    ).bind(ticketId).run();

    // Update customer total tickets if exists
    if (customerId) {
      await env.DB.prepare(
        "UPDATE support_customers SET total_tickets = total_tickets + 1 WHERE id = ?"
      ).bind(customerId).run();
    }

    // Cache in KV for quick access
    if (env.KV) {
      try {
        await env.KV.put(`ticket_${ticketNumber}`, JSON.stringify(ticket), { expirationTtl: 86400 });
      } catch (e) {
        console.error('KV cache error:', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Ticket #${ticketNumber} created successfully`,
      data: {
        id: ticketId,
        ticket_number: ticketNumber,
        ...ticket
      }
    }), {
      status: 201,
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
 * Generate unique ticket number
 */
async function generateTicketNumber(db) {
  const today = new Date();
  const prefix = `TKT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // Get count of tickets today
  const count = await db.prepare(
    "SELECT COUNT(*) as count FROM support_tickets WHERE ticket_number LIKE ?"
  ).bind(`${prefix}%`).first();

  const num = (count?.count || 0) + 1;
  return `${prefix}-${String(num).padStart(4, '0')}`;
}

/**
 * Get ticket stats
 */
async function getTicketStats(db, customerEmail = null) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
      SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
    FROM support_tickets
  `;

  if (customerEmail) {
    query += " WHERE customer_email = ?";
    return await db.prepare(query).bind(customerEmail).first();
  }

  return await db.prepare(query).first();
}
