/**
 * AI Generation Logs API
 * GET /api/automation/logs - List generation logs with filtering
 * POST /api/automation/logs - Create a new log entry
 */

/**
 * GET /api/automation/logs - List generation logs
 * Query params: path_id, status, limit, offset, from_date, to_date
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const pathId = url.searchParams.get('path_id');
  const status = url.searchParams.get('status');
  const fromDate = url.searchParams.get('from_date');
  const toDate = url.searchParams.get('to_date');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM ai_generation_logs";
    let countQuery = "SELECT COUNT(*) as total FROM ai_generation_logs";
    const conditions = [];
    const params = [];

    if (pathId) {
      conditions.push("automation_path_id = ?");
      params.push(pathId);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (fromDate) {
      conditions.push("created_at >= ?");
      params.push(new Date(fromDate).getTime());
    }
    if (toDate) {
      conditions.push("created_at <= ?");
      params.push(new Date(toDate).getTime());
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY created_at DESC";
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0
      ? await countStmt.bind(...params).first()
      : await countStmt.first();

    return new Response(JSON.stringify({
      logs: results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
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
 * POST /api/automation/logs - Create a new log entry
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const now = Date.now();

    // Helper function to ensure value is a primitive (string, number, null)
    const toPrimitive = (val, defaultVal = null) => {
      if (val === undefined || val === null) return defaultVal;
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    };

    const log = {
      id,
      automation_path_id: toPrimitive(data.automation_path_id || data.pathId),
      path_name: toPrimitive(data.path_name || data.pathName),
      status: toPrimitive(data.status || 'pending'),
      prompt_used: toPrimitive(data.prompt_used || data.prompt),
      model_used: toPrimitive(data.model_used || data.model || 'gpt-4'),
      assistant_id: toPrimitive(data.assistant_id || data.assistantId),
      content_type: toPrimitive(data.content_type || data.contentType),
      category: toPrimitive(data.category),
      topic: toPrimitive(data.topic),
      language: toPrimitive(data.language || 'en'),
      generated_title: toPrimitive(data.generated_title || data.title),
      generated_content: toPrimitive(data.generated_content || data.content),
      generated_excerpt: toPrimitive(data.generated_excerpt || data.excerpt),
      tokens_used: parseInt(data.tokens_used || data.tokensUsed || 0) || 0,
      generation_time_ms: parseInt(data.generation_time_ms || data.generationTime || 0) || null,
      published_post_id: toPrimitive(data.published_post_id || data.postId),
      published_at: toPrimitive(data.published_at),
      error_message: toPrimitive(data.error_message || data.error),
      error_code: toPrimitive(data.error_code),
      retry_count: parseInt(data.retry_count || 0) || 0,
      started_at: parseInt(data.started_at || now) || now,
      completed_at: data.completed_at ? parseInt(data.completed_at) : null,
      created_at: now
    };

    await env.DB.prepare(`
      INSERT INTO ai_generation_logs (
        id, automation_path_id, path_name, status, prompt_used, model_used,
        assistant_id, content_type, category, topic, language,
        generated_title, generated_content, generated_excerpt,
        tokens_used, generation_time_ms, published_post_id, published_at,
        error_message, error_code, retry_count, started_at, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      log.id, log.automation_path_id, log.path_name, log.status, log.prompt_used, log.model_used,
      log.assistant_id, log.content_type, log.category, log.topic, log.language,
      log.generated_title, log.generated_content, log.generated_excerpt,
      log.tokens_used, log.generation_time_ms, log.published_post_id, log.published_at,
      log.error_message, log.error_code, log.retry_count, log.started_at, log.completed_at, log.created_at
    ).run();

    // Update daily API usage
    const today = new Date().toISOString().split('T')[0];
    await env.DB.prepare(`
      INSERT INTO ai_api_usage (id, date, prompt_tokens, completion_tokens, total_tokens, requests_count, successful_requests, failed_requests, updated_at)
      VALUES (?, ?, 0, 0, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_tokens = total_tokens + excluded.total_tokens,
        requests_count = requests_count + 1,
        successful_requests = successful_requests + excluded.successful_requests,
        failed_requests = failed_requests + excluded.failed_requests,
        updated_at = excluded.updated_at
    `).bind(
      crypto.randomUUID(),
      today,
      log.tokens_used,
      log.status === 'completed' ? 1 : 0,
      log.status === 'failed' ? 1 : 0,
      now
    ).run();

    return new Response(JSON.stringify({ success: true, log }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
