/**
 * Tags API
 * GET /api/tags - List all tags
 * POST /api/tags - Create a new tag
 * 
 * Shared with: Create Post, Manage Posts, Blog Frontend
 */

/**
 * GET /api/tags - List all tags
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const sortBy = url.searchParams.get('sort') || 'name'; // 'name', 'count', 'recent'
  const limit = parseInt(url.searchParams.get('limit')) || 100;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM tags";
    
    switch (sortBy) {
      case 'count':
        query += " ORDER BY post_count DESC, name ASC";
        break;
      case 'recent':
        query += " ORDER BY created_at DESC";
        break;
      default:
        query += " ORDER BY name ASC";
    }
    
    query += ` LIMIT ${limit}`;

    const { results } = await env.DB.prepare(query).all();

    return new Response(JSON.stringify(results), {
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
 * POST /api/tags - Create a new tag (or return existing)
 */
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

    if (!data.name) {
      return new Response(JSON.stringify({ error: "Tag name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check if tag already exists
    const existing = await env.DB.prepare(
      "SELECT * FROM tags WHERE slug = ? OR name = ?"
    ).bind(slug, data.name).first();

    if (existing) {
      // Return existing tag instead of error (idempotent operation)
      return new Response(JSON.stringify({ 
        success: true, 
        tag: existing,
        existing: true 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = `tag_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();

    const tag = {
      id,
      name: data.name,
      slug,
      description: data.description || '',
      color: data.color || '#e8f24c',
      post_count: 0,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO tags (
        id, name, slug, description, color, post_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tag.id, tag.name, tag.slug, tag.description,
      tag.color, tag.post_count, tag.created_at, tag.updated_at
    ).run();

    return new Response(JSON.stringify({ success: true, tag }), {
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

/**
 * Handle bulk tag operations
 * POST /api/tags/bulk - Create multiple tags at once
 */
export async function onRequestPatch(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    if (!data.tags || !Array.isArray(data.tags)) {
      return new Response(JSON.stringify({ error: "Tags array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = [];
    const now = Date.now();

    for (const tagName of data.tags) {
      if (!tagName || typeof tagName !== 'string') continue;

      const name = tagName.trim();
      if (!name) continue;

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Check if exists
      const existing = await env.DB.prepare(
        "SELECT * FROM tags WHERE slug = ?"
      ).bind(slug).first();

      if (existing) {
        results.push({ ...existing, existing: true });
      } else {
        const id = `tag_${crypto.randomUUID().split('-')[0]}`;
        const tag = {
          id,
          name,
          slug,
          description: '',
          color: '#e8f24c',
          post_count: 0,
          created_at: now,
          updated_at: now
        };

        await env.DB.prepare(`
          INSERT INTO tags (id, name, slug, description, color, post_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(tag.id, tag.name, tag.slug, tag.description, tag.color, tag.post_count, tag.created_at, tag.updated_at).run();

        results.push(tag);
      }
    }

    return new Response(JSON.stringify({ success: true, tags: results }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
