/**
 * Health Check API - Quick platform health verification
 * GET /api/health/check - Run quick health checks
 * GET /api/health/check?full=true - Run comprehensive tests
 * 
 * Used for: monitoring, alerting, continuous testing
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const fullCheck = url.searchParams.get('full') === 'true';
  
  const startTime = Date.now();
  const results = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
    metrics: {},
    errors: []
  };

  // Check 1: Database
  try {
    const dbStart = Date.now();
    if (env.DB) {
      const { results: rows } = await env.DB.prepare("SELECT 1 as test").all();
      results.checks.database = 'ok';
      results.metrics.db_latency = Date.now() - dbStart;
    } else {
      results.checks.database = 'not_configured';
    }
  } catch (e) {
    results.checks.database = 'error';
    results.errors.push({ service: 'database', error: e.message });
    results.status = 'degraded';
  }

  // Check 2: KV
  try {
    const kvStart = Date.now();
    if (env.KV) {
      await env.KV.get('health_check_test');
      results.checks.kv = 'ok';
      results.metrics.kv_latency = Date.now() - kvStart;
    } else {
      results.checks.kv = 'not_configured';
    }
  } catch (e) {
    results.checks.kv = 'error';
    results.errors.push({ service: 'kv', error: e.message });
  }

  // Check 3: R2
  try {
    if (env.MEDIA_BUCKET) {
      results.checks.r2 = 'ok';
    } else {
      results.checks.r2 = 'not_configured';
    }
  } catch (e) {
    results.checks.r2 = 'error';
    results.errors.push({ service: 'r2', error: e.message });
  }

  // Check 4: Vectorize
  try {
    if (env.VECTORIZE) {
      results.checks.vectorize = 'ok';
    } else {
      results.checks.vectorize = 'not_configured';
    }
  } catch (e) {
    results.checks.vectorize = 'error';
  }

  // Check 5: Workers AI
  try {
    if (env.AI) {
      results.checks.workers_ai = 'ok';
    } else {
      results.checks.workers_ai = 'not_configured';
    }
  } catch (e) {
    results.checks.workers_ai = 'error';
  }

  // Check 6: Queue Producer
  try {
    if (env.NEWSLETTER_QUEUE) {
      results.checks.queue = 'ok';
    } else {
      results.checks.queue = 'not_configured';
    }
  } catch (e) {
    results.checks.queue = 'error';
  }

  // Full check - test actual functionality
  if (fullCheck) {
    // Test chatbot settings
    try {
      if (env.DB) {
        const settings = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM chatbot_settings"
        ).first();
        results.checks.chatbot_settings = settings?.count >= 0 ? 'ok' : 'empty';
      }
    } catch (e) {
      results.checks.chatbot_settings = 'error';
      results.errors.push({ service: 'chatbot_settings', error: e.message });
    }

    // Test blog posts
    try {
      if (env.DB) {
        const posts = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM blog_posts"
        ).first();
        results.checks.blog_posts = posts?.count >= 0 ? 'ok' : 'empty';
        results.metrics.blog_post_count = posts?.count || 0;
      }
    } catch (e) {
      results.checks.blog_posts = 'error';
      results.errors.push({ service: 'blog_posts', error: e.message });
    }

    // Test subscribers
    try {
      if (env.DB) {
        const subs = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM email_subscribers"
        ).first();
        results.checks.subscribers = subs?.count >= 0 ? 'ok' : 'empty';
        results.metrics.subscriber_count = subs?.count || 0;
      }
    } catch (e) {
      results.checks.subscribers = 'error';
    }

    // Test tickets
    try {
      if (env.DB) {
        const tickets = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM support_tickets"
        ).first();
        results.checks.tickets = tickets?.count >= 0 ? 'ok' : 'empty';
        results.metrics.ticket_count = tickets?.count || 0;
      }
    } catch (e) {
      results.checks.tickets = 'error';
    }

    // Test OpenAI key availability
    try {
      if (env.KV) {
        const apiKey = await env.KV.get('OPENAI_API_KEY');
        results.checks.openai_key = apiKey ? 'configured' : 'not_configured';
      }
    } catch (e) {
      results.checks.openai_key = 'error';
    }
  }

  // Calculate overall status
  const errorCount = results.errors.length;
  const criticalServices = ['database', 'kv'];
  const criticalErrors = results.errors.filter(e => criticalServices.includes(e.service));
  
  if (criticalErrors.length > 0) {
    results.status = 'unhealthy';
  } else if (errorCount > 0) {
    results.status = 'degraded';
  }

  results.metrics.total_check_time = Date.now() - startTime;
  results.metrics.error_count = errorCount;

  // Set appropriate status code
  const statusCode = results.status === 'healthy' ? 200 : 
                     results.status === 'degraded' ? 200 : 503;

  return new Response(JSON.stringify(results, null, 2), {
    status: statusCode,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
}
