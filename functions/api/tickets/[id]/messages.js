/**
 * Ticket Messages API
 * GET /api/tickets/:id/messages - Get messages for a ticket
 * POST /api/tickets/:id/messages - Add a reply/message to a ticket
 */

/**
 * GET - Get ticket messages
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const ticketId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get ticket
    const ticket = await env.DB.prepare(
      "SELECT id FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get messages
    const { results: messages } = await env.DB.prepare(`
      SELECT m.*, 
        (SELECT GROUP_CONCAT(a.id || '|' || a.filename || '|' || a.r2_url)
         FROM ticket_attachments a WHERE a.message_id = m.id) as attachment_list
      FROM support_messages m
      WHERE m.ticket_id = ?
      ORDER BY m.created_at ASC
    `).bind(ticket.id).all();

    // Parse attachments
    const formattedMessages = messages.map(msg => {
      const attachments = [];
      if (msg.attachment_list) {
        msg.attachment_list.split(',').forEach(att => {
          const [id, filename, url] = att.split('|');
          if (id && filename) {
            attachments.push({ id, filename, url });
          }
        });
      }
      delete msg.attachment_list;
      return { ...msg, attachments };
    });

    return new Response(JSON.stringify({
      success: true,
      data: { messages: formattedMessages }
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
 * POST - Add message/reply to ticket
 */
export async function onRequestPost(context) {
  const { request, env, params } = context;
  const ticketId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    if (!data.content) {
      return new Response(JSON.stringify({ success: false, error: "Message content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get ticket
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const messageId = `msg_${crypto.randomUUID().split('-')[0]}`;

    // Determine author type (admin or customer)
    const authorType = data.author_type || 
      (data.author_email === ticket.customer_email ? 'customer' : 'admin');

    // Create message
    const message = {
      id: messageId,
      ticket_id: ticket.id,
      author_type: authorType,
      author_id: data.author_id || null,
      author_name: data.author_name || data.author || 'Support Team',
      author_email: data.author_email || null,
      content: data.content,
      is_internal: data.is_internal ? 1 : 0,
      created_at: now
    };

    await env.DB.prepare(`
      INSERT INTO support_messages (
        id, ticket_id, author_type, author_id, author_name, author_email,
        content, is_internal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      message.id, message.ticket_id, message.author_type, message.author_id,
      message.author_name, message.author_email, message.content,
      message.is_internal, message.created_at
    ).run();

    // Update ticket
    const updates = ['message_count = message_count + 1', 'updated_at = ?'];
    const values = [now];

    // Track first response time for admin replies
    if (authorType === 'admin' && !ticket.first_response_at) {
      updates.push('first_response_at = ?');
      values.push(now);
    }

    // Update status based on reply
    if (data.update_status) {
      updates.push('status = ?');
      values.push(data.update_status);

      if (data.update_status === 'resolved') {
        updates.push('resolved_at = ?');
        values.push(now);
      }
      if (data.update_status === 'closed') {
        updates.push('closed_at = ?');
        values.push(now);
      }
    } else if (authorType === 'admin' && ticket.status === 'open') {
      // Auto-update to in-progress on first admin reply
      updates.push('status = ?');
      values.push('in-progress');
    }

    values.push(ticket.id);

    await env.DB.prepare(`
      UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Invalidate KV cache
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${ticket.ticket_number}`);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      data: { message }
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
