/**
 * Single Scheduled Post API
 * GET /api/scheduled-posts/:id - Get scheduled post details
 * PUT /api/scheduled-posts/:id - Update a scheduled post
 * DELETE /api/scheduled-posts/:id - Cancel/delete a scheduled post
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
    const post = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();

    if (!post) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get history
    const { results: history } = await env.DB.prepare(
      "SELECT * FROM scheduled_post_history WHERE scheduled_post_id = ? ORDER BY created_at DESC"
    ).bind(id).all();

    return new Response(JSON.stringify({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_featured: post.is_featured === 1,
      history: history.map(h => ({
        ...h,
        event_data: h.event_data ? JSON.parse(h.event_data) : null
      }))
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
 * PUT - Update scheduled post (reschedule, edit content)
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

    // Check if post exists and is not already published
    const existing = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (existing.status === 'published') {
      return new Response(JSON.stringify({ error: "Cannot update a published post" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    const changes = {};

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
      changes.title = data.title;
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.image_url !== undefined || data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(data.image_url || data.imageUrl);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.subcategory !== undefined) {
      updates.push('subcategory = ?');
      values.push(data.subcategory);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags || []));
    }
    if (data.scheduled_datetime !== undefined || data.scheduledDate !== undefined) {
      const newDatetime = data.scheduled_datetime 
        ? (typeof data.scheduled_datetime === 'number' ? data.scheduled_datetime : new Date(data.scheduled_datetime).getTime())
        : new Date(data.scheduledDate).getTime();
      
      if (newDatetime <= now) {
        return new Response(JSON.stringify({ error: "Cannot schedule in the past" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      updates.push('scheduled_datetime = ?');
      values.push(newDatetime);
      changes.rescheduled_to = new Date(newDatetime).toISOString();
    }
    if (data.is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(data.is_featured ? 1 : 0);
    }
    if (data.status !== undefined && ['pending', 'cancelled'].includes(data.status)) {
      updates.push('status = ?');
      values.push(data.status);
      changes.status = data.status;
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (updates.length === 1) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(`
      UPDATE scheduled_posts SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Log the update
    const eventType = changes.rescheduled_to ? 'rescheduled' : 'updated';
    await env.DB.prepare(`
      INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      id,
      eventType,
      JSON.stringify(changes),
      now
    ).run();

    // Fetch updated post
    const updatedPost = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();

    return new Response(JSON.stringify({ 
      success: true, 
      post: {
        ...updatedPost,
        tags: updatedPost.tags ? JSON.parse(updatedPost.tags) : [],
        scheduled_date: new Date(updatedPost.scheduled_datetime).toISOString(),
        is_featured: updatedPost.is_featured === 1
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
 * DELETE - Cancel/delete a scheduled post
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
    const existing = await env.DB.prepare(
      "SELECT status FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // If already published, just mark as cancelled (keep for history)
    if (existing.status === 'published') {
      return new Response(JSON.stringify({ error: "Cannot delete a published post" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();

    // Log cancellation before delete
    await env.DB.prepare(`
      INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
      VALUES (?, ?, 'cancelled', ?, ?)
    `).bind(
      crypto.randomUUID(),
      id,
      JSON.stringify({ cancelled_at: new Date(now).toISOString() }),
      now
    ).run();

    // Delete the post
    await env.DB.prepare(
      "DELETE FROM scheduled_posts WHERE id = ?"
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
