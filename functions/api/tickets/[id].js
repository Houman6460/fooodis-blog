/**
 * Single Ticket API
 * GET /api/tickets/:id - Get ticket details with messages
 * PUT /api/tickets/:id - Update ticket (status, priority, assignee, etc.)
 * DELETE /api/tickets/:id - Delete ticket
 */

/**
 * GET - Get ticket with messages
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get ticket - support both ID and ticket_number
    const ticket = await env.DB.prepare(`
      SELECT * FROM support_tickets 
      WHERE id = ? OR ticket_number = ?
    `).bind(id, id).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get messages
    const { results: messages } = await env.DB.prepare(`
      SELECT * FROM support_messages 
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).bind(ticket.id).all();

    // Get attachments
    const { results: attachments } = await env.DB.prepare(`
      SELECT * FROM ticket_attachments
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).bind(ticket.id).all();

    // Parse JSON fields
    ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];
    
    messages.forEach(msg => {
      msg.attachments = msg.attachments ? JSON.parse(msg.attachments) : [];
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        ticket,
        messages,
        attachments
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
 * PUT - Update ticket
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    // Get existing ticket
    const existing = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(id, id).first();

    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build update query
    const updates = [];
    const values = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      
      // Track status changes
      if (data.status === 'resolved' && existing.status !== 'resolved') {
        updates.push('resolved_at = ?');
        values.push(now);
      }
      if (data.status === 'closed' && existing.status !== 'closed') {
        updates.push('closed_at = ?');
        values.push(now);
      }
      if (data.status === 'open' && existing.status === 'closed') {
        updates.push('reopened_count = reopened_count + 1');
      }
    }

    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }

    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }

    if (data.assignee_id !== undefined) {
      updates.push('assignee_id = ?');
      values.push(data.assignee_id);
    }

    if (data.assignee_name !== undefined) {
      updates.push('assignee_name = ?');
      values.push(data.assignee_name);
    }

    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }

    if (data.internal_notes !== undefined) {
      updates.push('internal_notes = ?');
      values.push(data.internal_notes);
    }

    if (data.resolution !== undefined) {
      updates.push('resolution = ?');
      values.push(data.resolution);
    }

    if (data.satisfaction_rating !== undefined) {
      updates.push('satisfaction_rating = ?');
      values.push(data.satisfaction_rating);
    }

    if (data.satisfaction_feedback !== undefined) {
      updates.push('satisfaction_feedback = ?');
      values.push(data.satisfaction_feedback);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(existing.id);

    await env.DB.prepare(`
      UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Fetch updated ticket
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ?"
    ).bind(existing.id).first();

    ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];

    // Invalidate KV cache
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${existing.ticket_number}`);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      data: { ticket }
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
 * DELETE - Delete ticket
 */
export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get ticket
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(id, id).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Delete attachments from R2 if configured
    if (env.MEDIA_BUCKET) {
      const { results: attachments } = await env.DB.prepare(
        "SELECT r2_key FROM ticket_attachments WHERE ticket_id = ?"
      ).bind(ticket.id).all();

      for (const att of attachments) {
        try {
          await env.MEDIA_BUCKET.delete(att.r2_key);
        } catch (e) {
          console.error('Error deleting attachment:', e);
        }
      }
    }

    // Delete ticket (cascades to messages and attachments)
    await env.DB.prepare(
      "DELETE FROM support_tickets WHERE id = ?"
    ).bind(ticket.id).run();

    // Invalidate KV cache
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${ticket.ticket_number}`);
      } catch (e) {}
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Ticket #${ticket.ticket_number} deleted`
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
