/**
 * System Health API
 * GET /api/system-health - Check system health and component status
 */

export async function onRequestGet(context) {
  const { env } = context;
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: {},
    version: '1.0.0',
    environment: env.ENVIRONMENT || 'development'
  };

  // Check D1 Database
  try {
    if (env.DB) {
      const result = await env.DB.prepare('SELECT 1 as test').first();
      health.components.database = {
        status: result ? 'healthy' : 'degraded',
        type: 'D1',
        latency: Date.now() - startTime
      };
    } else {
      health.components.database = { status: 'not_configured', type: 'D1' };
    }
  } catch (error) {
    health.components.database = { 
      status: 'unhealthy', 
      type: 'D1',
      error: error.message 
    };
    health.status = 'degraded';
  }

  // Check KV Storage
  try {
    if (env.KV) {
      const kvStart = Date.now();
      await env.KV.get('health-check-test');
      health.components.kv = {
        status: 'healthy',
        type: 'KV',
        latency: Date.now() - kvStart
      };
    } else {
      health.components.kv = { status: 'not_configured', type: 'KV' };
    }
  } catch (error) {
    health.components.kv = { 
      status: 'unhealthy', 
      type: 'KV',
      error: error.message 
    };
    health.status = 'degraded';
  }

  // Check R2 Storage
  try {
    if (env.MEDIA_BUCKET) {
      health.components.storage = {
        status: 'healthy',
        type: 'R2'
      };
    } else {
      health.components.storage = { status: 'not_configured', type: 'R2' };
    }
  } catch (error) {
    health.components.storage = { 
      status: 'unhealthy', 
      type: 'R2',
      error: error.message 
    };
    health.status = 'degraded';
  }

  // Get database stats if available
  if (env.DB && health.components.database.status === 'healthy') {
    try {
      const [posts, categories, users] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM categories').first(),
        env.DB.prepare('SELECT COUNT(*) as count FROM chatbot_users').first().catch(() => ({ count: 0 }))
      ]);
      
      health.stats = {
        posts: posts?.count || 0,
        categories: categories?.count || 0,
        chatbotUsers: users?.count || 0
      };
    } catch (error) {
      health.stats = { error: error.message };
    }
  }

  health.responseTime = Date.now() - startTime;

  return new Response(JSON.stringify(health, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
