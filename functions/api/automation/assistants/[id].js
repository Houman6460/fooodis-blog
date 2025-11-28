/**
 * Single AI Assistant API
 * GET /api/automation/assistants/:id - Get assistant details
 * PUT /api/automation/assistants/:id - Update an assistant
 * DELETE /api/automation/assistants/:id - Delete an assistant
 */

/**
 * GET /api/automation/assistants/:id
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
    const assistant = await env.DB.prepare(
      "SELECT * FROM ai_assistants WHERE id = ?"
    ).bind(id).first();

    if (!assistant) {
      return new Response(JSON.stringify({ error: "Assistant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      ...assistant,
      is_active: assistant.is_active === 1,
      is_default: assistant.is_default === 1
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
 * PUT /api/automation/assistants/:id - Update an assistant
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

    const updates = [];
    const values = [];

    if (data.openai_assistant_id !== undefined) {
      updates.push('openai_assistant_id = ?');
      values.push(data.openai_assistant_id);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.model !== undefined) {
      updates.push('model = ?');
      values.push(data.model);
    }
    if (data.instructions !== undefined) {
      updates.push('instructions = ?');
      values.push(data.instructions);
    }
    if (data.temperature !== undefined) {
      updates.push('temperature = ?');
      values.push(data.temperature);
    }
    if (data.max_tokens !== undefined) {
      updates.push('max_tokens = ?');
      values.push(data.max_tokens);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }
    if (data.is_default !== undefined) {
      updates.push('is_default = ?');
      values.push(data.is_default ? 1 : 0);
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
      UPDATE ai_assistants SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    const assistant = await env.DB.prepare(
      "SELECT * FROM ai_assistants WHERE id = ?"
    ).bind(id).first();

    return new Response(JSON.stringify({ 
      success: true, 
      assistant: {
        ...assistant,
        is_active: assistant?.is_active === 1,
        is_default: assistant?.is_default === 1
      }
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
 * DELETE /api/automation/assistants/:id
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
    // Don't allow deleting default assistants
    const assistant = await env.DB.prepare(
      "SELECT is_default FROM ai_assistants WHERE id = ?"
    ).bind(id).first();

    if (assistant?.is_default === 1) {
      return new Response(JSON.stringify({ error: "Cannot delete default assistant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await env.DB.prepare(
      "DELETE FROM ai_assistants WHERE id = ?"
    ).bind(id).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Assistant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
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
