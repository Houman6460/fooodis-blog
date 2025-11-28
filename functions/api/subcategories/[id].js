/**
 * Single Subcategory API
 * GET /api/subcategories/:id - Get subcategory details
 * PUT /api/subcategories/:id - Update a subcategory  
 * DELETE /api/subcategories/:id - Delete a subcategory
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
    const subcategory = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE id = ?"
    ).bind(id).first();

    if (!subcategory) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(subcategory), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

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

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
      
      // Auto-update slug
      updates.push('slug = ?');
      values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
    if (data.parent_category_id !== undefined) {
      updates.push('parent_category_id = ?');
      values.push(data.parent_category_id);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
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
      UPDATE subcategories SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    const subcategory = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE id = ?"
    ).bind(id).first();

    return new Response(JSON.stringify({ success: true, subcategory }), {
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
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get subcategory name for updating posts
    const subcategory = await env.DB.prepare(
      "SELECT name FROM subcategories WHERE id = ?"
    ).bind(id).first();

    if (!subcategory) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update blog posts that use this subcategory
    await env.DB.prepare(
      "UPDATE blog_posts SET subcategory = NULL WHERE subcategory = ?"
    ).bind(subcategory.name).run();

    // Delete the subcategory
    const result = await env.DB.prepare(
      "DELETE FROM subcategories WHERE id = ?"
    ).bind(id).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Clear KV cache if available
    if (env.KV) {
      try {
        await env.KV.delete('categories_cache');
      } catch (e) {
        console.error('KV delete error:', e);
      }
    }

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
