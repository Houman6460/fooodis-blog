/**
 * AI Assistants API
 * GET /api/automation/assistants - List all assistants
 * POST /api/automation/assistants - Create/register a new assistant
 */

/**
 * GET /api/automation/assistants - List all assistants
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get('active_only') !== 'false';
  const type = url.searchParams.get('type');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM ai_assistants";
    const conditions = [];
    const params = [];

    if (activeOnly) {
      conditions.push("is_active = 1");
    }
    if (type) {
      conditions.push("type = ?");
      params.push(type);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY is_default DESC, name ASC";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    // Convert integer booleans to actual booleans
    const assistants = results.map(a => ({
      ...a,
      is_active: a.is_active === 1,
      is_default: a.is_default === 1,
      code_interpreter: a.code_interpreter === 1,
      retrieval: a.retrieval === 1,
      function_calling: a.function_calling === 1
    }));

    return new Response(JSON.stringify(assistants), {
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
 * POST /api/automation/assistants - Create/register a new assistant
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
      return new Response(JSON.stringify({ error: "Assistant name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = `asst_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();

    const assistant = {
      id,
      openai_assistant_id: data.openai_assistant_id || data.openaiAssistantId || '',
      name: data.name,
      description: data.description || '',
      type: data.type || 'custom',
      model: data.model || 'gpt-4',
      instructions: data.instructions || '',
      temperature: data.temperature ?? 0.7,
      max_tokens: data.max_tokens || data.maxTokens || 2000,
      top_p: data.top_p || data.topP || 1.0,
      code_interpreter: data.code_interpreter ? 1 : 0,
      retrieval: data.retrieval ? 1 : 0,
      function_calling: data.function_calling ? 1 : 0,
      is_active: data.is_active !== false ? 1 : 0,
      is_default: data.is_default ? 1 : 0,
      usage_count: 0,
      last_used: null,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO ai_assistants (
        id, openai_assistant_id, name, description, type, model, instructions,
        temperature, max_tokens, top_p, code_interpreter, retrieval, function_calling,
        is_active, is_default, usage_count, last_used, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      assistant.id, assistant.openai_assistant_id, assistant.name, assistant.description,
      assistant.type, assistant.model, assistant.instructions, assistant.temperature,
      assistant.max_tokens, assistant.top_p, assistant.code_interpreter, assistant.retrieval,
      assistant.function_calling, assistant.is_active, assistant.is_default,
      assistant.usage_count, assistant.last_used, assistant.created_at, assistant.updated_at
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      assistant: {
        ...assistant,
        is_active: assistant.is_active === 1,
        is_default: assistant.is_default === 1
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
