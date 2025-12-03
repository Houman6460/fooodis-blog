/**
 * Chatbot Agents API
 * GET /api/chatbot/agents - List all agents
 * POST /api/chatbot/agents - Create new agent
 * PUT /api/chatbot/agents - Update agent
 * DELETE /api/chatbot/agents - Delete agent
 */

/**
 * GET /api/chatbot/agents - Get all configured agents
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
    // Run migration to ensure table exists
    await runMigration(env.DB);

    const { results } = await env.DB.prepare(
      "SELECT * FROM chatbot_agents ORDER BY created_at ASC"
    ).all();

    const agents = (results || []).map(agent => ({
      id: agent.id,
      name: agent.name,
      realName: agent.real_name,
      department: agent.department,
      description: agent.description,
      color: agent.color,
      active: agent.is_active === 1,
      assistantId: agent.assistant_id,
      assignedAssistantId: agent.assigned_assistant_id,
      model: agent.model,
      systemPrompt: agent.system_prompt,
      personality: agent.personality,
      introduction: agent.introduction ? JSON.parse(agent.introduction) : { en: '', sv: '' },
      avatar: agent.avatar,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      agents: agents
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
 * POST /api/chatbot/agents - Create new agent or bulk sync
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
    await runMigration(env.DB);
    
    const data = await request.json();
    const now = Date.now();

    // Handle bulk sync (array of agents)
    if (Array.isArray(data.agents)) {
      // Get existing agent IDs
      const { results: existingAgents } = await env.DB.prepare(
        "SELECT id FROM chatbot_agents"
      ).all();
      const existingIds = new Set(existingAgents?.map(a => a.id) || []);
      const incomingIds = new Set(data.agents.map(a => a.id));

      // Delete agents not in incoming list
      for (const existingId of existingIds) {
        if (!incomingIds.has(existingId)) {
          await env.DB.prepare("DELETE FROM chatbot_agents WHERE id = ?").bind(existingId).run();
        }
      }

      // Upsert all incoming agents
      for (const agent of data.agents) {
        await upsertAgent(env.DB, agent, now);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Synced ${data.agents.length} agents`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle single agent creation
    const agent = data;
    const agentId = agent.id || `agent_${crypto.randomUUID().split('-')[0]}`;
    
    await upsertAgent(env.DB, { ...agent, id: agentId }, now);

    return new Response(JSON.stringify({
      success: true,
      agent: { id: agentId },
      message: "Agent created successfully"
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
 * PUT /api/chatbot/agents - Update agent
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
    await runMigration(env.DB);
    
    const agent = await request.json();
    const now = Date.now();

    if (!agent.id) {
      return new Response(JSON.stringify({ success: false, error: "Agent ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await upsertAgent(env.DB, agent, now);

    return new Response(JSON.stringify({
      success: true,
      message: "Agent updated successfully"
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
 * DELETE /api/chatbot/agents - Delete agent
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
    const agentId = url.searchParams.get('id');

    if (!agentId) {
      return new Response(JSON.stringify({ success: false, error: "Agent ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare("DELETE FROM chatbot_agents WHERE id = ?").bind(agentId).run();

    return new Response(JSON.stringify({
      success: true,
      message: "Agent deleted successfully"
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
 * Upsert agent into database
 */
async function upsertAgent(db, agent, now) {
  const existing = await db.prepare(
    "SELECT id FROM chatbot_agents WHERE id = ?"
  ).bind(agent.id).first();

  const introduction = typeof agent.introduction === 'object' 
    ? JSON.stringify(agent.introduction) 
    : agent.introduction || '{"en":"","sv":""}';

  if (existing) {
    await db.prepare(`
      UPDATE chatbot_agents SET
        name = ?, real_name = ?, department = ?, description = ?,
        color = ?, is_active = ?, assistant_id = ?, assigned_assistant_id = ?,
        model = ?, system_prompt = ?, personality = ?, introduction = ?,
        avatar = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      agent.name || '',
      agent.realName || agent.name || '',
      agent.department || '',
      agent.description || '',
      agent.color || '#28a745',
      agent.active !== false ? 1 : 0,
      agent.assistantId || '',
      agent.assignedAssistantId || agent.assistantId || '',
      agent.model || 'gpt-4',
      agent.systemPrompt || '',
      agent.personality || '',
      introduction,
      agent.avatar || '',
      now,
      agent.id
    ).run();
  } else {
    await db.prepare(`
      INSERT INTO chatbot_agents (
        id, name, real_name, department, description, color, is_active,
        assistant_id, assigned_assistant_id, model, system_prompt, personality,
        introduction, avatar, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      agent.id,
      agent.name || '',
      agent.realName || agent.name || '',
      agent.department || '',
      agent.description || '',
      agent.color || '#28a745',
      agent.active !== false ? 1 : 0,
      agent.assistantId || '',
      agent.assignedAssistantId || agent.assistantId || '',
      agent.model || 'gpt-4',
      agent.systemPrompt || '',
      agent.personality || '',
      introduction,
      agent.avatar || '',
      now,
      now
    ).run();
  }
}

/**
 * Run database migration
 */
async function runMigration(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS chatbot_agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        real_name TEXT,
        department TEXT,
        description TEXT,
        color TEXT DEFAULT '#28a745',
        is_active INTEGER DEFAULT 1,
        assistant_id TEXT,
        assigned_assistant_id TEXT,
        model TEXT DEFAULT 'gpt-4',
        system_prompt TEXT,
        personality TEXT,
        introduction TEXT,
        avatar TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();
  } catch (e) {
    // Table may already exist
  }
}
