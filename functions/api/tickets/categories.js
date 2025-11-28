/**
 * Ticket Categories API
 * GET /api/tickets/categories - List ticket categories
 * POST /api/tickets/categories - Create new category (admin)
 */

/**
 * GET - List categories
 */
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { results: categories } = await env.DB.prepare(`
      SELECT * FROM ticket_categories 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, name ASC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      data: { categories: categories || [] }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // Table might not exist, return defaults
    const defaultCategories = [
      { id: 'general', name: 'General', color: '#478ac9', icon: 'question-circle' },
      { id: 'technical', name: 'Technical', color: '#e74c3c', icon: 'bug' },
      { id: 'billing', name: 'Billing', color: '#27ae60', icon: 'credit-card' },
      { id: 'feature', name: 'Feature Request', color: '#9b59b6', icon: 'lightbulb' },
      { id: 'feedback', name: 'Feedback', color: '#f39c12', icon: 'comment' }
    ];

    return new Response(JSON.stringify({
      success: true,
      data: { categories: defaultCategories }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST - Create category
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    if (!data.name) {
      return new Response(JSON.stringify({ success: false, error: "Category name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const id = `cat_${data.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    await env.DB.prepare(`
      INSERT INTO ticket_categories (id, name, description, color, icon, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.description || '',
      data.color || '#478ac9',
      data.icon || 'tag',
      data.sort_order || 99,
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      data: { category: { id, name: data.name, color: data.color, icon: data.icon } }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    if (error.message?.includes('UNIQUE constraint')) {
      return new Response(JSON.stringify({ success: false, error: "Category already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
