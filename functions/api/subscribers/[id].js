/**
 * Single Subscriber API
 * GET /api/subscribers/:id - Get subscriber details
 * PUT /api/subscribers/:id - Update subscriber
 * DELETE /api/subscribers/:id - Delete subscriber
 */

/**
 * GET - Get subscriber details
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const subscriber = await env.DB.prepare(
      "SELECT * FROM email_subscribers WHERE id = ?"
    ).bind(id).first();

    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse JSON fields
    subscriber.preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
    subscriber.tags = subscriber.tags ? JSON.parse(subscriber.tags) : [];
    subscriber.custom_fields = subscriber.custom_fields ? JSON.parse(subscriber.custom_fields) : {};

    // Get email activity
    const { results: activity } = await env.DB.prepare(`
      SELECT es.*, ec.name as campaign_name, ec.subject as campaign_subject
      FROM email_sends es
      LEFT JOIN email_campaigns ec ON es.campaign_id = ec.id
      WHERE es.subscriber_id = ?
      ORDER BY es.created_at DESC
      LIMIT 10
    `).bind(id).all();

    return new Response(JSON.stringify({
      subscriber,
      activity: activity || []
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
 * PUT - Update subscriber
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    // Build update query
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
      
      // Track unsubscribe
      if (data.status === 'unsubscribed') {
        updates.push('unsubscribed_at = ?');
        values.push(now);
      }
    }
    if (data.preferences !== undefined) {
      updates.push('preferences = ?');
      values.push(JSON.stringify(data.preferences));
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags));
    }
    if (data.custom_fields !== undefined) {
      updates.push('custom_fields = ?');
      values.push(JSON.stringify(data.custom_fields));
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await env.DB.prepare(`
      UPDATE email_subscribers SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Fetch updated subscriber
    const subscriber = await env.DB.prepare(
      "SELECT * FROM email_subscribers WHERE id = ?"
    ).bind(id).first();

    return new Response(JSON.stringify({ success: true, subscriber }), {
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
 * DELETE - Delete subscriber
 */
export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Check if exists
    const subscriber = await env.DB.prepare(
      "SELECT email FROM email_subscribers WHERE id = ?"
    ).bind(id).first();

    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Delete subscriber
    await env.DB.prepare(
      "DELETE FROM email_subscribers WHERE id = ?"
    ).bind(id).run();

    return new Response(JSON.stringify({ 
      success: true, 
      id,
      email: subscriber.email
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
