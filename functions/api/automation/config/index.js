/**
 * AI Configuration API
 * GET /api/automation/config - Get AI configuration
 * PUT /api/automation/config - Update AI configuration
 * 
 * Uses KV for fast access with D1 backup
 */

const KV_CONFIG_KEY = 'ai_config';
const KV_CACHE_TTL = 3600;

/**
 * GET /api/automation/config
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  // Try KV first
  if (env.KV) {
    try {
      const cached = await env.KV.get(KV_CONFIG_KEY, 'json');
      if (cached) {
        if (key) {
          const setting = cached.find(c => c.key === key);
          return new Response(JSON.stringify(setting || null), {
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

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM ai_config";
    if (key) {
      query += " WHERE key = ?";
    }
    query += " ORDER BY key ASC";

    const stmt = env.DB.prepare(query);
    const { results } = key ? await stmt.bind(key).all() : await stmt.all();

    // Parse values
    const config = results.map(c => ({
      ...c,
      value: parseConfigValue(c.value, c.type),
      is_secret: c.is_secret === 1
    }));

    // Cache in KV
    if (env.KV && !key) {
      try {
        await env.KV.put(KV_CONFIG_KEY, JSON.stringify(config), {
          expirationTtl: KV_CACHE_TTL
        });
      } catch (e) {
        console.error('KV write error:', e);
      }
    }

    if (key) {
      return new Response(JSON.stringify(config[0] || null), {
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    }

    return new Response(JSON.stringify(config), {
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
 * PUT /api/automation/config - Update configuration
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

    // Handle single key update
    if (data.key && data.value !== undefined) {
      updates.push({ key: data.key, value: data.value, type: data.type, is_secret: data.is_secret });
    }
    // Handle bulk update
    else if (data.config && Array.isArray(data.config)) {
      updates.push(...data.config);
    } else {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    for (const setting of updates) {
      if (!setting.key) continue;

      let type = setting.type;
      if (!type) {
        if (typeof setting.value === 'boolean') type = 'boolean';
        else if (typeof setting.value === 'number') type = 'number';
        else if (typeof setting.value === 'object') type = 'json';
        else type = 'string';
      }

      const valueStr = type === 'json' 
        ? JSON.stringify(setting.value)
        : String(setting.value);

      await env.DB.prepare(`
        INSERT INTO ai_config (key, value, type, is_secret, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          is_secret = excluded.is_secret,
          updated_at = excluded.updated_at
      `).bind(
        setting.key, 
        valueStr, 
        type, 
        setting.is_secret ? 1 : 0,
        now
      ).run();
    }

    // Clear KV cache
    if (env.KV) {
      try {
        await env.KV.delete(KV_CONFIG_KEY);
      } catch (e) {
        console.error('KV delete error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  return onRequestPut(context);
}

function parseConfigValue(value, type) {
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
