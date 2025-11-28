/**
 * Chatbot Messages API
 * GET /api/chatbot/messages - Get messages for a conversation
 * POST /api/chatbot/messages - Store a message (used by widget)
 */

/**
 * GET /api/chatbot/messages - Get conversation messages
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const conversationId = url.searchParams.get('conversation_id');
  const limit = parseInt(url.searchParams.get('limit')) || 100;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!conversationId) {
    return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { results: messages } = await env.DB.prepare(`
      SELECT * FROM chatbot_messages 
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `).bind(conversationId, limit, offset).all();

    // Get total count
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM chatbot_messages WHERE conversation_id = ?"
    ).bind(conversationId).first();

    // Format messages
    const formattedMessages = messages.map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      role: m.role,
      content: m.content,
      assistantId: m.assistant_id,
      assistantName: m.assistant_name,
      tokensUsed: m.tokens_used,
      responseTimeMs: m.response_time_ms,
      metadata: m.metadata ? JSON.parse(m.metadata) : {},
      createdAt: m.created_at,
      timestamp: m.created_at
    }));

    return new Response(JSON.stringify({
      success: true,
      messages: formattedMessages,
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
 * POST /api/chatbot/messages - Store a message
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

    if (!data.conversation_id && !data.conversationId) {
      return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!data.content && !data.message) {
      return new Response(JSON.stringify({ success: false, error: "content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const msgId = `msg_${crypto.randomUUID().split('-')[0]}`;
    const conversationId = data.conversation_id || data.conversationId;

    await env.DB.prepare(`
      INSERT INTO chatbot_messages (
        id, conversation_id, role, content, assistant_id, assistant_name,
        tokens_used, response_time_ms, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      data.role || 'user',
      data.content || data.message,
      data.assistant_id || data.assistantId || null,
      data.assistant_name || data.assistantName || null,
      data.tokens_used || data.tokensUsed || 0,
      data.response_time_ms || data.responseTimeMs || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now
    ).run();

    // Update conversation message count and timestamp
    await env.DB.prepare(`
      UPDATE chatbot_conversations 
      SET message_count = message_count + 1, last_message_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, now, conversationId).run();

    return new Response(JSON.stringify({
      success: true,
      message: { id: msgId, conversationId }
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
