/**
 * Chatbot Flows API - Cloud Storage for Node Flow Builder
 * GET /api/chatbot/flows - Get all flows
 * GET /api/chatbot/flows?language=en - Get flow for specific language
 * POST /api/chatbot/flows - Save flow
 * DELETE /api/chatbot/flows?id=xxx - Delete flow
 */

/**
 * GET /api/chatbot/flows - Get flows
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Run migration to ensure table exists
    await runMigration(env.DB);

    const url = new URL(request.url);
    const language = url.searchParams.get('language');

    let query = "SELECT * FROM chatbot_flows ORDER BY language ASC, updated_at DESC";
    let results;

    if (language) {
      const { results: langResults } = await env.DB.prepare(
        "SELECT * FROM chatbot_flows WHERE language = ? ORDER BY updated_at DESC LIMIT 1"
      ).bind(language).all();
      results = langResults;
    } else {
      const { results: allResults } = await env.DB.prepare(query).all();
      results = allResults;
    }

    const flows = (results || []).map(flow => ({
      id: flow.id,
      name: flow.name,
      language: flow.language,
      nodes: flow.nodes ? JSON.parse(flow.nodes) : [],
      connections: flow.connections ? JSON.parse(flow.connections) : [],
      isActive: flow.is_active === 1,
      createdAt: flow.created_at,
      updatedAt: flow.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      flows: flows,
      // Return the latest flow for each language for quick access
      flowsByLanguage: {
        en: flows.find(f => f.language === 'en') || null,
        sv: flows.find(f => f.language === 'sv') || null
      }
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
 * POST /api/chatbot/flows - Save flow
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

    const flowId = data.id || `flow_${data.language || 'en'}_${now}`;
    const language = data.language || 'en';
    const name = data.name || `${language.toUpperCase()} Flow`;
    const nodes = JSON.stringify(data.nodes || []);
    const connections = JSON.stringify(data.connections || []);

    // Check if flow for this language exists
    const existing = await env.DB.prepare(
      "SELECT id FROM chatbot_flows WHERE language = ?"
    ).bind(language).first();

    if (existing) {
      // Update existing flow for this language
      await env.DB.prepare(`
        UPDATE chatbot_flows SET
          name = ?, nodes = ?, connections = ?, is_active = ?, updated_at = ?
        WHERE language = ?
      `).bind(
        name,
        nodes,
        connections,
        data.isActive !== false ? 1 : 0,
        now,
        language
      ).run();
    } else {
      // Insert new flow
      await env.DB.prepare(`
        INSERT INTO chatbot_flows (id, name, language, nodes, connections, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        flowId,
        name,
        language,
        nodes,
        connections,
        data.isActive !== false ? 1 : 0,
        now,
        now
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      flowId: existing ? existing.id : flowId,
      message: `Flow saved for ${language.toUpperCase()}`
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
 * DELETE /api/chatbot/flows - Delete flow
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
    const flowId = url.searchParams.get('id');
    const language = url.searchParams.get('language');

    if (flowId) {
      await env.DB.prepare("DELETE FROM chatbot_flows WHERE id = ?").bind(flowId).run();
    } else if (language) {
      await env.DB.prepare("DELETE FROM chatbot_flows WHERE language = ?").bind(language).run();
    } else {
      return new Response(JSON.stringify({ success: false, error: "Flow ID or language required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Flow deleted successfully"
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
 * Run database migration
 */
async function runMigration(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS chatbot_flows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'en',
        nodes TEXT,
        connections TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();
    
    // Create index for language lookups
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_flows_language ON chatbot_flows(language)
    `).run();
  } catch (e) {
    // Table/index may already exist
  }
}
