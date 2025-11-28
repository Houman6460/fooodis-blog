/**
 * Prompts Library API
 * GET /api/automation/prompts - List all prompt templates
 * POST /api/automation/prompts - Create a new prompt template
 */

/**
 * GET /api/automation/prompts - List prompt templates
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const defaultsOnly = url.searchParams.get('defaults_only') === 'true';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM prompts_library";
    const conditions = [];
    const params = [];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (defaultsOnly) {
      conditions.push("is_default = 1");
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY is_default DESC, usage_count DESC, name ASC";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    // Parse JSON fields
    const prompts = results.map(p => ({
      ...p,
      variables: p.variables ? JSON.parse(p.variables) : [],
      is_default: p.is_default === 1,
      is_public: p.is_public === 1
    }));

    return new Response(JSON.stringify(prompts), {
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
 * POST /api/automation/prompts - Create a new prompt template
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

    if (!data.name || !data.prompt_template) {
      return new Response(JSON.stringify({ error: "Name and prompt_template are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = `prompt_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();

    const prompt = {
      id,
      name: data.name,
      description: data.description || '',
      category: data.category || 'general',
      prompt_template: data.prompt_template,
      system_message: data.system_message || '',
      variables: JSON.stringify(data.variables || []),
      example_output: data.example_output || '',
      is_default: data.is_default ? 1 : 0,
      is_public: data.is_public !== false ? 1 : 0,
      usage_count: 0,
      rating: 0,
      created_by: data.created_by || 'Admin',
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO prompts_library (
        id, name, description, category, prompt_template, system_message,
        variables, example_output, is_default, is_public, usage_count,
        rating, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      prompt.id, prompt.name, prompt.description, prompt.category,
      prompt.prompt_template, prompt.system_message, prompt.variables,
      prompt.example_output, prompt.is_default, prompt.is_public,
      prompt.usage_count, prompt.rating, prompt.created_by,
      prompt.created_at, prompt.updated_at
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      prompt: {
        ...prompt,
        variables: JSON.parse(prompt.variables),
        is_default: prompt.is_default === 1,
        is_public: prompt.is_public === 1
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
