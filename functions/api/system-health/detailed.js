/**
 * Detailed System Health API
 * GET /api/system-health/detailed - Get detailed system diagnostics
 */

export async function onRequestGet(context) {
  const { env } = context;
  const startTime = Date.now();
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'development',
    services: {},
    tables: {},
    performance: {}
  };

  // Check all D1 tables
  if (env.DB) {
    const tables = [
      'blog_posts', 'categories', 'tags', 'post_tags', 'comments',
      'media', 'subscribers', 'scheduled_posts', 'support_tickets',
      'ticket_messages', 'ai_assistants', 'chatbot_scenarios',
      'chatbot_conversations', 'chatbot_messages', 'chatbot_users',
      'chatbot_settings', 'chatbot_analytics'
    ];

    for (const table of tables) {
      try {
        const result = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
        diagnostics.tables[table] = {
          status: 'ok',
          count: result?.count || 0
        };
      } catch (error) {
        diagnostics.tables[table] = {
          status: 'error',
          error: error.message
        };
      }
    }
  }

  // Check KV keys
  if (env.KV) {
    try {
      const keys = ['OPENAI_API_KEY', 'chatbot_config', 'site_settings'];
      diagnostics.services.kv = { status: 'healthy', keys: {} };
      
      for (const key of keys) {
        const value = await env.KV.get(key);
        diagnostics.services.kv.keys[key] = value ? 'set' : 'not_set';
      }
    } catch (error) {
      diagnostics.services.kv = { status: 'error', error: error.message };
    }
  }

  // Check R2
  if (env.MEDIA_BUCKET) {
    try {
      const list = await env.MEDIA_BUCKET.list({ limit: 1 });
      diagnostics.services.r2 = {
        status: 'healthy',
        hasObjects: list.objects.length > 0
      };
    } catch (error) {
      diagnostics.services.r2 = { status: 'error', error: error.message };
    }
  }

  diagnostics.performance.totalTime = Date.now() - startTime;

  return new Response(JSON.stringify(diagnostics, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
