/**
 * Failed Posts API
 * Tracks automation posts that failed to publish (e.g., no available images)
 * GET /api/automation/failed-posts - Get list of failed posts
 * POST /api/automation/failed-posts - Record a failed post
 * DELETE /api/automation/failed-posts/:id - Dismiss/resolve a failed post
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending'; // pending, resolved, dismissed

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS failed_posts (
        id TEXT PRIMARY KEY,
        path_id TEXT,
        path_name TEXT,
        scheduled_date TEXT,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'pending',
        created_at INTEGER,
        resolved_at INTEGER
      )
    `).run();

    let query = "SELECT * FROM failed_posts";
    let params = [];

    if (status !== 'all') {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT 50";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    // Get count of pending failures for badge
    const pendingCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM failed_posts WHERE status = 'pending'"
    ).first();

    return new Response(JSON.stringify({
      failedPosts: results,
      pendingCount: pendingCount?.count || 0
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
    const { pathId, pathName, scheduledDate, reason, details } = data;

    if (!reason) {
      return new Response(JSON.stringify({ error: "reason is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS failed_posts (
        id TEXT PRIMARY KEY,
        path_id TEXT,
        path_name TEXT,
        scheduled_date TEXT,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'pending',
        created_at INTEGER,
        resolved_at INTEGER
      )
    `).run();

    const id = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(`
      INSERT INTO failed_posts (id, path_id, path_name, scheduled_date, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id, 
      pathId || null, 
      pathName || 'Unknown Path', 
      scheduledDate || new Date().toISOString(),
      reason,
      details || null,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      failedPost: {
        id,
        pathId,
        pathName,
        scheduledDate,
        reason,
        details,
        status: 'pending',
        createdAt: now
      }
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

export async function onRequestDelete(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const action = url.searchParams.get('action') || 'dismiss'; // dismiss or resolve

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    if (!id) {
      return new Response(JSON.stringify({ error: "id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';

    await env.DB.prepare(`
      UPDATE failed_posts SET status = ?, resolved_at = ? WHERE id = ?
    `).bind(newStatus, now, id).run();

    return new Response(JSON.stringify({
      success: true,
      id,
      status: newStatus
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
