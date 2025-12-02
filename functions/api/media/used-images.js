/**
 * Used Images Tracking API
 * Tracks which media images have been used by automation paths
 * GET /api/media/used-images - Get list of used images
 * POST /api/media/used-images - Mark an image as used
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pathId = url.searchParams.get('path_id');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS used_images (
        id TEXT PRIMARY KEY,
        media_id TEXT NOT NULL,
        path_id TEXT,
        post_id TEXT,
        used_at INTEGER,
        UNIQUE(media_id, path_id)
      )
    `).run();

    let query = "SELECT media_id FROM used_images";
    let params = [];

    if (pathId) {
      query += " WHERE path_id = ?";
      params.push(pathId);
    }

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    return new Response(JSON.stringify({
      usedImageIds: results.map(r => r.media_id)
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
    const { mediaId, pathId, postId } = data;

    if (!mediaId) {
      return new Response(JSON.stringify({ error: "mediaId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS used_images (
        id TEXT PRIMARY KEY,
        media_id TEXT NOT NULL,
        path_id TEXT,
        post_id TEXT,
        used_at INTEGER,
        UNIQUE(media_id, path_id)
      )
    `).run();

    const id = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(`
      INSERT OR REPLACE INTO used_images (id, media_id, path_id, post_id, used_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, mediaId, pathId || null, postId || null, now).run();

    return new Response(JSON.stringify({
      success: true,
      id,
      mediaId,
      pathId,
      postId
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
