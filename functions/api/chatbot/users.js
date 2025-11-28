/**
 * Chatbot Users/Leads API
 * GET /api/chatbot/users - List all leads captured from chatbot
 * POST /api/chatbot/users - Register/update a user from chatbot
 */

/**
 * GET /api/chatbot/users - List all leads
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
    let query = "SELECT * FROM chatbot_users";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ? OR restaurant_name LIKE ? OR phone LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results: users } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM chatbot_users";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 
      ? await countStmt.bind(...countParams).first()
      : await countStmt.first();

    // Get stats
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN status = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified
      FROM chatbot_users
    `).first();

    // Format users with proper field names
    const formattedUsers = users.map(u => ({
      id: u.id,
      visitorId: u.visitor_id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      company: u.company,
      restaurantName: u.restaurant_name,
      userType: u.user_type,
      systemUsage: u.system_usage,
      language: u.language,
      source: u.source,
      status: u.status,
      totalConversations: u.total_conversations,
      totalMessages: u.total_messages,
      lastConversationAt: u.last_conversation_at,
      customFields: u.custom_fields ? JSON.parse(u.custom_fields) : {},
      tags: u.tags ? JSON.parse(u.tags) : [],
      notes: u.notes,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      users: formattedUsers,
      stats: {
        total: stats?.total || 0,
        leads: stats?.leads || 0,
        customers: stats?.customers || 0,
        qualified: stats?.qualified || 0
      },
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
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
 * POST /api/chatbot/users - Register or update user from chatbot
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
    const now = Date.now();

    // Email is required for user registration
    if (!data.email && !data.userEmail) {
      // Check if we're just updating by visitorId
      if (data.visitorId) {
        const existing = await env.DB.prepare(
          "SELECT * FROM chatbot_users WHERE visitor_id = ?"
        ).bind(data.visitorId).first();

        if (existing) {
          // Update existing user
          const updates = [];
          const values = [];

          if (data.name) { updates.push('name = ?'); values.push(data.name); }
          if (data.phone) { updates.push('phone = ?'); values.push(data.phone); }
          if (data.restaurantName) { updates.push('restaurant_name = ?'); values.push(data.restaurantName); }
          if (data.userType) { updates.push('user_type = ?'); values.push(data.userType); }
          if (data.systemUsage) { updates.push('system_usage = ?'); values.push(data.systemUsage); }
          if (data.language) { updates.push('language = ?'); values.push(data.language); }

          if (updates.length > 0) {
            updates.push('updated_at = ?');
            values.push(now);
            values.push(existing.id);

            await env.DB.prepare(`
              UPDATE chatbot_users SET ${updates.join(', ')} WHERE id = ?
            `).bind(...values).run();
          }

          return new Response(JSON.stringify({
            success: true,
            user: { id: existing.id },
            updated: true
          }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      return new Response(JSON.stringify({ success: false, error: "Email is required for registration" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const email = (data.email || data.userEmail).toLowerCase().trim();

    // Check if user exists
    const existing = await env.DB.prepare(
      "SELECT * FROM chatbot_users WHERE email = ?"
    ).bind(email).first();

    if (existing) {
      // Update existing user
      const updates = ['updated_at = ?'];
      const values = [now];

      if (data.name) { updates.push('name = ?'); values.push(data.name); }
      if (data.phone || data.userPhone) { updates.push('phone = ?'); values.push(data.phone || data.userPhone); }
      if (data.restaurantName) { updates.push('restaurant_name = ?'); values.push(data.restaurantName); }
      if (data.userType) { updates.push('user_type = ?'); values.push(data.userType); }
      if (data.systemUsage) { updates.push('system_usage = ?'); values.push(data.systemUsage); }
      if (data.language) { updates.push('language = ?'); values.push(data.language); }
      if (data.visitorId) { updates.push('visitor_id = ?'); values.push(data.visitorId); }

      values.push(existing.id);

      await env.DB.prepare(`
        UPDATE chatbot_users SET ${updates.join(', ')} WHERE id = ?
      `).bind(...values).run();

      // Link conversations to this user
      if (data.visitorId || data.conversationId) {
        await env.DB.prepare(`
          UPDATE chatbot_conversations 
          SET user_id = ?, user_name = ?, user_email = ?, user_phone = ?,
              restaurant_name = ?, user_type = ?, is_registered = 1, updated_at = ?
          WHERE (visitor_id = ? OR id = ?) AND user_id IS NULL
        `).bind(
          existing.id,
          data.name || existing.name,
          email,
          data.phone || data.userPhone || existing.phone,
          data.restaurantName || existing.restaurant_name,
          data.userType || existing.user_type,
          now,
          data.visitorId || '',
          data.conversationId || ''
        ).run();
      }

      return new Response(JSON.stringify({
        success: true,
        user: { id: existing.id, email: existing.email },
        updated: true
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create new user
    const userId = `user_${crypto.randomUUID().split('-')[0]}`;

    await env.DB.prepare(`
      INSERT INTO chatbot_users (
        id, visitor_id, email, name, phone, restaurant_name, user_type,
        system_usage, language, source, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'lead', ?, ?)
    `).bind(
      userId,
      data.visitorId || null,
      email,
      data.name || null,
      data.phone || data.userPhone || null,
      data.restaurantName || null,
      data.userType || null,
      data.systemUsage || null,
      data.language || 'en',
      data.source || 'chatbot',
      now,
      now
    ).run();

    // Link conversations to this user
    if (data.visitorId || data.conversationId) {
      await env.DB.prepare(`
        UPDATE chatbot_conversations 
        SET user_id = ?, user_name = ?, user_email = ?, user_phone = ?,
            restaurant_name = ?, user_type = ?, is_registered = 1, updated_at = ?
        WHERE (visitor_id = ? OR id = ?)
      `).bind(
        userId,
        data.name,
        email,
        data.phone || data.userPhone,
        data.restaurantName,
        data.userType,
        now,
        data.visitorId || '',
        data.conversationId || ''
      ).run();
    }

    // Update daily analytics for lead capture
    try {
      const today = new Date().toISOString().split('T')[0];
      await env.DB.prepare(`
        INSERT INTO chatbot_analytics (id, date, leads_captured, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(date) DO UPDATE SET 
          leads_captured = leads_captured + 1,
          updated_at = ?
      `).bind(`analytics_${today}`, today, now, now, now).run();
    } catch (e) {
      // Analytics update is not critical
    }

    return new Response(JSON.stringify({
      success: true,
      user: { id: userId, email },
      created: true
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
