/**
 * Chatbot Scenarios API
 * GET /api/chatbot/scenarios - List all scenarios
 * POST /api/chatbot/scenarios - Create new scenario
 * PUT /api/chatbot/scenarios - Update scenario
 * DELETE /api/chatbot/scenarios - Delete scenario
 */

/**
 * GET /api/chatbot/scenarios - List scenarios
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get('active_only') !== 'false';

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM chatbot_scenarios";
    if (activeOnly) {
      query += " WHERE is_active = 1";
    }
    query += " ORDER BY priority DESC, name ASC";

    const { results: scenarios } = await env.DB.prepare(query).all();

    // Parse flow_data JSON
    const formattedScenarios = scenarios.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      triggerType: s.trigger_type,
      triggerValue: s.trigger_value,
      language: s.language,
      flowData: s.flow_data ? JSON.parse(s.flow_data) : {},
      isActive: s.is_active === 1,
      active: s.is_active === 1,
      priority: s.priority,
      usageCount: s.usage_count,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      scenarios: formattedScenarios
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST /api/chatbot/scenarios - Create scenario
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
      return new Response(JSON.stringify({ success: false, error: "Scenario name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = data.id || `scenario_${crypto.randomUUID().split('-')[0]}`;
    const now = Date.now();

    // Convert flowData to proper format
    let flowData = data.flowData || data.flow_data || {};
    if (data.questions || data.responses) {
      flowData = {
        questions: data.questions,
        responses: data.responses
      };
    }

    await env.DB.prepare(`
      INSERT INTO chatbot_scenarios (
        id, name, description, trigger_type, trigger_value, language,
        flow_data, is_active, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.description || '',
      data.triggerType || data.trigger_type || 'keyword',
      data.triggerValue || data.trigger_value || '',
      data.language || 'all',
      JSON.stringify(flowData),
      (data.isActive !== false && data.active !== false) ? 1 : 0,
      data.priority || 0,
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      scenario: { id, name: data.name }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * PUT /api/chatbot/scenarios - Update scenario
 */
export async function onRequestPut(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const id = data.id;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Scenario ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const updates = ['updated_at = ?'];
    const values = [now];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.triggerType !== undefined || data.trigger_type !== undefined) {
      updates.push('trigger_type = ?');
      values.push(data.triggerType || data.trigger_type);
    }
    if (data.triggerValue !== undefined || data.trigger_value !== undefined) {
      updates.push('trigger_value = ?');
      values.push(data.triggerValue || data.trigger_value);
    }
    if (data.language !== undefined) {
      updates.push('language = ?');
      values.push(data.language);
    }
    if (data.flowData !== undefined || data.flow_data !== undefined || data.questions !== undefined) {
      let flowData = data.flowData || data.flow_data || {};
      if (data.questions || data.responses) {
        flowData = { questions: data.questions, responses: data.responses };
      }
      updates.push('flow_data = ?');
      values.push(JSON.stringify(flowData));
    }
    if (data.isActive !== undefined || data.active !== undefined) {
      updates.push('is_active = ?');
      values.push((data.isActive || data.active) ? 1 : 0);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(data.priority);
    }

    values.push(id);

    await env.DB.prepare(`
      UPDATE chatbot_scenarios SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * DELETE /api/chatbot/scenarios - Delete scenario
 */
export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Scenario ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(
      "DELETE FROM chatbot_scenarios WHERE id = ?"
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
