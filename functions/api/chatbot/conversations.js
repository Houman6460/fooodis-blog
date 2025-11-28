/**
 * Chatbot Conversations API
 * GET /api/chatbot/conversations - List conversations (admin)
 * POST /api/chatbot/conversations - Create/update conversation
 * DELETE /api/chatbot/conversations - Delete conversation
 */

/**
 * GET /api/chatbot/conversations - List all conversations
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const status = url.searchParams.get('status');
  const userId = url.searchParams.get('user_id');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM chatbot_messages WHERE conversation_id = c.id) as actual_message_count,
        (SELECT content FROM chatbot_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chatbot_conversations c
    `;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("c.status = ?");
      params.push(status);
    }

    if (userId) {
      conditions.push("c.user_id = ?");
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY c.last_message_at DESC, c.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results: conversations } = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM chatbot_conversations c";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 
      ? await countStmt.bind(...countParams).first()
      : await countStmt.first();

    // Format conversations
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      conversationId: conv.id,
      visitorId: conv.visitor_id,
      userId: conv.user_id,
      threadId: conv.thread_id,
      userName: conv.user_name || 'Anonymous User',
      userEmail: conv.user_email,
      userPhone: conv.user_phone,
      restaurantName: conv.restaurant_name,
      userType: conv.user_type,
      language: conv.language,
      languageFlag: conv.language_flag || (conv.language === 'sv' ? '🇸🇪' : '🇺🇸'),
      displayFlag: conv.language_flag || (conv.language === 'sv' ? '🇸🇪' : '🇺🇸'),
      status: conv.status,
      userRegistered: conv.is_registered === 1,
      rating: conv.rating,
      ratingFeedback: conv.rating_feedback,
      messageCount: conv.actual_message_count || conv.message_count || 0,
      lastMessage: conv.last_message,
      firstMessageAt: conv.first_message_at,
      lastMessageAt: conv.last_message_at,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      conversations: formattedConversations,
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
 * POST /api/chatbot/conversations - Create or update conversation
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

    // Check if updating existing conversation
    if (data.conversationId || data.id) {
      const convId = data.conversationId || data.id;
      
      const updates = [];
      const values = [];

      if (data.userName !== undefined) {
        updates.push('user_name = ?');
        values.push(data.userName);
      }
      if (data.userEmail !== undefined) {
        updates.push('user_email = ?');
        values.push(data.userEmail);
      }
      if (data.userPhone !== undefined) {
        updates.push('user_phone = ?');
        values.push(data.userPhone);
      }
      if (data.restaurantName !== undefined) {
        updates.push('restaurant_name = ?');
        values.push(data.restaurantName);
      }
      if (data.userType !== undefined) {
        updates.push('user_type = ?');
        values.push(data.userType);
      }
      if (data.language !== undefined) {
        updates.push('language = ?');
        values.push(data.language);
      }
      if (data.languageFlag !== undefined) {
        updates.push('language_flag = ?');
        values.push(data.languageFlag);
      }
      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }
      if (data.rating !== undefined) {
        updates.push('rating = ?');
        values.push(data.rating);
      }
      if (data.ratingFeedback !== undefined) {
        updates.push('rating_feedback = ?');
        values.push(data.ratingFeedback);
      }
      if (data.isRegistered !== undefined || data.userRegistered !== undefined) {
        updates.push('is_registered = ?');
        values.push((data.isRegistered || data.userRegistered) ? 1 : 0);
      }
      if (data.userId !== undefined) {
        updates.push('user_id = ?');
        values.push(data.userId);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(now);
        values.push(convId);

        await env.DB.prepare(`
          UPDATE chatbot_conversations SET ${updates.join(', ')} WHERE id = ?
        `).bind(...values).run();
      }

      const updated = await env.DB.prepare(
        "SELECT * FROM chatbot_conversations WHERE id = ?"
      ).bind(convId).first();

      return new Response(JSON.stringify({
        success: true,
        conversation: updated
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create new conversation
    const convId = data.id || `conv_${crypto.randomUUID().split('-')[0]}`;

    await env.DB.prepare(`
      INSERT INTO chatbot_conversations (
        id, visitor_id, user_id, thread_id, assistant_id, user_name, user_email,
        user_phone, restaurant_name, user_type, language, language_flag, status,
        is_registered, first_message_at, last_message_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      convId,
      data.visitorId || null,
      data.userId || null,
      data.threadId || null,
      data.assistantId || null,
      data.userName || null,
      data.userEmail || null,
      data.userPhone || null,
      data.restaurantName || null,
      data.userType || null,
      data.language || 'en',
      data.languageFlag || '🇺🇸',
      data.status || 'active',
      (data.isRegistered || data.userRegistered) ? 1 : 0,
      now,
      now,
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      conversation: { id: convId }
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
 * DELETE /api/chatbot/conversations - Delete conversation
 */
export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Conversation ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(
      "DELETE FROM chatbot_conversations WHERE id = ?"
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
