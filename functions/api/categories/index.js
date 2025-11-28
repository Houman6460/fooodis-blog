/**
 * Categories API
 * GET /api/categories - List all categories
 * POST /api/categories - Create a new category
 * 
 * Shared with: Create Post, Manage Posts, AI Automation
 */

/**
 * GET /api/categories - List all categories with subcategories
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const includeSubcategories = url.searchParams.get('include_subcategories') !== 'false';
  const activeOnly = url.searchParams.get('active_only') !== 'false';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get categories
    let categoryQuery = "SELECT * FROM categories";
    if (activeOnly) {
      categoryQuery += " WHERE is_active = 1";
    }
    categoryQuery += " ORDER BY sort_order ASC, name ASC";
    
    const { results: categories } = await env.DB.prepare(categoryQuery).all();

    // If including subcategories, fetch them too
    if (includeSubcategories && categories.length > 0) {
      let subQuery = "SELECT * FROM subcategories";
      if (activeOnly) {
        subQuery += " WHERE is_active = 1";
      }
      subQuery += " ORDER BY sort_order ASC, name ASC";
      
      const { results: subcategories } = await env.DB.prepare(subQuery).all();

      // Group subcategories by parent category
      const categoriesWithSubs = categories.map(cat => ({
        ...cat,
        subcategories: subcategories.filter(sub => sub.parent_category_id === cat.id)
      }));

      return new Response(JSON.stringify(categoriesWithSubs), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(categories), {
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
 * POST /api/categories - Create a new category
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
      return new Response(JSON.stringify({ error: "Category name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = `cat_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check if slug already exists
    const existing = await env.DB.prepare(
      "SELECT id FROM categories WHERE slug = ?"
    ).bind(slug).first();

    if (existing) {
      return new Response(JSON.stringify({ error: "A category with this slug already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get max sort_order
    const maxOrder = await env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM categories"
    ).first();

    const category = {
      id,
      name: data.name,
      slug,
      description: data.description || '',
      color: data.color || '#478ac9',
      icon: data.icon || null,
      post_count: 0,
      sort_order: (maxOrder?.max_order || 0) + 1,
      is_active: data.is_active !== false ? 1 : 0,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO categories (
        id, name, slug, description, color, icon, post_count,
        sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category.id, category.name, category.slug, category.description,
      category.color, category.icon, category.post_count, category.sort_order,
      category.is_active, category.created_at, category.updated_at
    ).run();

    // Cache in KV if available
    if (env.KV) {
      try {
        await env.KV.delete('categories_cache');
      } catch (e) {
        console.error('KV cache clear error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, category }), {
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
