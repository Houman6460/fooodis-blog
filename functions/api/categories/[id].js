/**
 * Single Category API
 * GET /api/categories/:id - Get a single category
 * PUT /api/categories/:id - Update a category
 * DELETE /api/categories/:id - Delete a category
 */

/**
 * GET /api/categories/:id - Get a single category with subcategories
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
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();

    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get subcategories
    const { results: subcategories } = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE parent_category_id = ? ORDER BY sort_order ASC"
    ).bind(id).all();

    return new Response(JSON.stringify({
      ...category,
      subcategories
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
 * PUT /api/categories/:id - Update a category
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

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
      // Update slug if name changes
      if (!data.slug) {
        updates.push('slug = ?');
        values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      }
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(data.icon);
    }
    if (data.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(data.sort_order);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
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
      UPDATE categories SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Fetch updated category
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();

    // Clear KV cache if available
    if (env.KV) {
      try {
        await env.KV.delete('categories_cache');
      } catch (e) {
        console.error('KV cache clear error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, category }), {
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
 * DELETE /api/categories/:id - Delete a category
 * Note: This will cascade delete subcategories and update related posts
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
    // Check if category exists
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();

    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update blog posts to remove category reference
    await env.DB.prepare(
      "UPDATE blog_posts SET category = 'Uncategorized' WHERE category = ?"
    ).bind(category.name).run();

    // Delete subcategories (cascade)
    await env.DB.prepare(
      "DELETE FROM subcategories WHERE parent_category_id = ?"
    ).bind(id).run();

    // Delete the category
    await env.DB.prepare(
      "DELETE FROM categories WHERE id = ?"
    ).bind(id).run();

    // Clear KV cache if available
    if (env.KV) {
      try {
        await env.KV.delete('categories_cache');
      } catch (e) {
        console.error('KV cache clear error:', e);
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
