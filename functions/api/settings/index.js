/**
 * Blog Settings API
 * GET /api/settings - Get all settings
 * PUT /api/settings - Update multiple settings
 * 
 * Uses KV for fast access with D1 as persistent backup
 * Shared with: Create Post, Blog Frontend, Dashboard
 */

const KV_SETTINGS_KEY = 'blog_settings';
const KV_CACHE_TTL = 3600; // 1 hour in seconds

/**
 * GET /api/settings - Get all blog settings
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key'); // Optional: get specific setting

  // Try KV first for fast access
  if (env.KV) {
    try {
      const cached = await env.KV.get(KV_SETTINGS_KEY, 'json');
      if (cached) {
        if (key) {
          const setting = cached.find(s => s.key === key);
          return new Response(JSON.stringify(setting || { error: "Setting not found" }), {
            status: setting ? 200 : 404,
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
          });
        }
        return new Response(JSON.stringify(cached), {
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
      }
    } catch (e) {
      console.error('KV read error:', e);
    }
  }

  // Fallback to D1
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM blog_settings";
    if (key) {
      query += " WHERE key = ?";
    }
    query += " ORDER BY key ASC";

    const stmt = env.DB.prepare(query);
    const { results } = key ? await stmt.bind(key).all() : await stmt.all();

    // Parse values based on type
    const settings = results.map(setting => ({
      ...setting,
      value: parseSettingValue(setting.value, setting.type)
    }));

    // Cache in KV if available
    if (env.KV && !key) {
      try {
        await env.KV.put(KV_SETTINGS_KEY, JSON.stringify(settings), {
          expirationTtl: KV_CACHE_TTL
        });
      } catch (e) {
        console.error('KV write error:', e);
      }
    }

    if (key) {
      const setting = settings[0];
      return new Response(JSON.stringify(setting || { error: "Setting not found" }), {
        status: setting ? 200 : 404,
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    }

    return new Response(JSON.stringify(settings), {
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * PUT /api/settings - Update settings
 * Body can be: { key: "setting_key", value: "new_value" }
 * Or: { settings: [{ key: "key1", value: "val1" }, ...] }
 */
export async function onRequestPut(context) {
  const { request, env } = context;

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

    // Handle single setting update
    if (data.key && data.value !== undefined) {
      updates.push({ key: data.key, value: data.value, type: data.type });
    }
    // Handle bulk settings update
    else if (data.settings && Array.isArray(data.settings)) {
      updates.push(...data.settings);
    } else {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    for (const setting of updates) {
      if (!setting.key) continue;

      // Determine the type if not provided
      let type = setting.type;
      if (!type) {
        if (typeof setting.value === 'boolean') type = 'boolean';
        else if (typeof setting.value === 'number') type = 'number';
        else if (typeof setting.value === 'object') type = 'json';
        else type = 'string';
      }

      // Convert value to string for storage
      const valueStr = type === 'json' 
        ? JSON.stringify(setting.value)
        : String(setting.value);

      // Upsert setting
      await env.DB.prepare(`
        INSERT INTO blog_settings (key, value, type, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          updated_at = excluded.updated_at
      `).bind(setting.key, valueStr, type, now).run();
    }

    // Clear KV cache
    if (env.KV) {
      try {
        await env.KV.delete(KV_SETTINGS_KEY);
      } catch (e) {
        console.error('KV delete error:', e);
      }
    }

    // Fetch and return updated settings
    const { results } = await env.DB.prepare(
      "SELECT * FROM blog_settings ORDER BY key ASC"
    ).all();

    const settings = results.map(s => ({
      ...s,
      value: parseSettingValue(s.value, s.type)
    }));

    // Re-cache in KV
    if (env.KV) {
      try {
        await env.KV.put(KV_SETTINGS_KEY, JSON.stringify(settings), {
          expirationTtl: KV_CACHE_TTL
        });
      } catch (e) {
        console.error('KV write error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, settings }), {
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
 * POST /api/settings - Same as PUT for convenience
 */
export async function onRequestPost(context) {
  return onRequestPut(context);
}

/**
 * Parse setting value based on type
 */
function parseSettingValue(value, type) {
  switch (type) {
    case 'boolean':
      return value === 'true' || value === '1' || value === true;
    case 'number':
      return Number(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}
