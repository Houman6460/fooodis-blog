/**
 * Chatbot Settings API
 * GET /api/chatbot/settings - Get all settings
 * PUT /api/chatbot/settings - Update settings
 */

/**
 * GET /api/chatbot/settings - Get all settings
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get('category');

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM chatbot_settings";
    const params = [];

    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    // Convert to settings object
    const settings = {};
    results.forEach(row => {
      let value = row.value;
      
      // Parse based on type
      if (row.type === 'boolean') {
        value = row.value === 'true' || row.value === '1';
      } else if (row.type === 'number') {
        value = parseFloat(row.value);
      } else if (row.type === 'json') {
        try {
          value = JSON.parse(row.value);
        } catch (e) {
          // Keep as string if parse fails
        }
      }
      
      settings[row.key] = value;
    });

    // Include raw settings for reference
    const rawSettings = results.map(r => ({
      key: r.key,
      value: r.value,
      type: r.type,
      category: r.category,
      description: r.description,
      updatedAt: r.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      settings,
      rawSettings
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
 * PUT /api/chatbot/settings - Update settings
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
    const now = Date.now();

    // Process each setting
    for (const [key, rawValue] of Object.entries(data)) {
      // Determine type and convert value to string
      let type = 'string';
      let value = String(rawValue);

      if (typeof rawValue === 'boolean') {
        type = 'boolean';
        value = rawValue ? 'true' : 'false';
      } else if (typeof rawValue === 'number') {
        type = 'number';
        value = String(rawValue);
      } else if (typeof rawValue === 'object') {
        type = 'json';
        value = JSON.stringify(rawValue);
      }

      // Determine category based on key
      let category = 'general';
      if (key.startsWith('widget_')) category = 'widget';
      else if (key.startsWith('enable_') || key.startsWith('allow_')) category = 'features';
      else if (key.includes('model') || key.includes('openai') || key.includes('api')) category = 'ai';
      else if (key.includes('delay') || key.includes('timeout')) category = 'behavior';

      // Upsert setting
      await env.DB.prepare(`
        INSERT INTO chatbot_settings (key, value, type, category, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          type = excluded.type,
          updated_at = excluded.updated_at
      `).bind(key, value, type, category, now).run();
    }

    // Store OpenAI API key in KV for secure access
    if (data.openai_api_key && env.KV) {
      await env.KV.put('OPENAI_API_KEY', data.openai_api_key);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Settings updated successfully"
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
 * POST /api/chatbot/settings - Batch update settings
 */
export async function onRequestPost(context) {
  // Alias to PUT
  return onRequestPut(context);
}
