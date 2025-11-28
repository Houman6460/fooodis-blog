/**
 * Single Media API
 * GET /api/media/:id - Get media metadata
 * PUT /api/media/:id - Update media metadata
 * DELETE /api/media/:id - Delete media file from R2 and D1
 */

/**
 * GET /api/media/:id - Get single media metadata
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
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();

    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(media), {
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
 * PUT /api/media/:id - Update media metadata
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

    // Only allow updating certain fields
    const updates = [];
    const values = [];

    if (data.alt_text !== undefined) {
      updates.push('alt_text = ?');
      values.push(data.alt_text);
    }
    if (data.caption !== undefined) {
      updates.push('caption = ?');
      values.push(data.caption);
    }
    if (data.folder !== undefined) {
      updates.push('folder = ?');
      values.push(data.folder);
    }
    if (data.is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(data.is_featured ? 1 : 0);
    }
    if (data.post_id !== undefined) {
      updates.push('post_id = ?');
      values.push(data.post_id);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await env.DB.prepare(`
      UPDATE media_library SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Fetch updated record
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();

    return new Response(JSON.stringify({ success: true, media }), {
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
 * DELETE /api/media/:id - Delete media file from R2 and D1
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
    // Get media record to find R2 key
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();

    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Delete from R2 if bucket is configured
    if (env.MEDIA_BUCKET && media.r2_key) {
      try {
        await env.MEDIA_BUCKET.delete(media.r2_key);
        // Also delete thumbnail if exists
        if (media.thumbnail_key) {
          await env.MEDIA_BUCKET.delete(media.thumbnail_key);
        }
      } catch (r2Error) {
        console.error('R2 delete error:', r2Error);
        // Continue with D1 deletion even if R2 fails
      }
    }

    // Delete from D1
    await env.DB.prepare(
      "DELETE FROM media_library WHERE id = ?"
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
