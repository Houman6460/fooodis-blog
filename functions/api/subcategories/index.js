/**
 * Subcategories API
 * GET /api/subcategories - List all subcategories (optionally filter by parent)
 * POST /api/subcategories - Create a new subcategory
 */

/**
 * GET /api/subcategories - List subcategories
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const parentId = url.searchParams.get('parent_id');
  const parentName = url.searchParams.get('parent_name');
  const activeOnly = url.searchParams.get('active_only') !== 'false';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT s.*, c.name as parent_name FROM subcategories s LEFT JOIN categories c ON s.parent_category_id = c.id";
    const conditions = [];
    const params = [];

    if (parentId) {
      conditions.push("s.parent_category_id = ?");
      params.push(parentId);
    }
    if (parentName) {
      conditions.push("c.name = ?");
      params.push(parentName);
    }
    if (activeOnly) {
      conditions.push("s.is_active = 1");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY s.sort_order ASC, s.name ASC";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

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
 * POST /api/subcategories - Create a new subcategory
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
      return new Response(JSON.stringify({ error: "Subcategory name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!data.parent_category_id && !data.parent_name) {
      return new Response(JSON.stringify({ error: "Parent category is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // If parent_name is provided instead of parent_category_id, look it up
    let parentCategoryId = data.parent_category_id;
    if (!parentCategoryId && data.parent_name) {
      const parent = await env.DB.prepare(
        "SELECT id FROM categories WHERE name = ?"
      ).bind(data.parent_name).first();

      if (!parent) {
        return new Response(JSON.stringify({ error: "Parent category not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      parentCategoryId = parent.id;
    }

    const id = `subcat_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check if slug already exists under the same parent
    const existing = await env.DB.prepare(
      "SELECT id FROM subcategories WHERE slug = ? AND parent_category_id = ?"
    ).bind(slug, parentCategoryId).first();

    if (existing) {
      return new Response(JSON.stringify({ error: "A subcategory with this slug already exists under this parent" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get max sort_order for this parent
    const maxOrder = await env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM subcategories WHERE parent_category_id = ?"
    ).bind(parentCategoryId).first();

    const subcategory = {
      id,
      name: data.name,
      slug,
      parent_category_id: parentCategoryId,
      description: data.description || '',
      post_count: 0,
      sort_order: (maxOrder?.max_order || 0) + 1,
      is_active: data.is_active !== false ? 1 : 0,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO subcategories (
        id, name, slug, parent_category_id, description,
        post_count, sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      subcategory.id, subcategory.name, subcategory.slug, subcategory.parent_category_id,
      subcategory.description, subcategory.post_count, subcategory.sort_order,
      subcategory.is_active, subcategory.created_at, subcategory.updated_at
    ).run();

    return new Response(JSON.stringify({ success: true, subcategory }), {
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
