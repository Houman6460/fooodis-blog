/**
 * AI Automation Stats API
 * GET /api/automation/stats - Get automation statistics and API usage
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30'; // days
  const pathId = url.searchParams.get('path_id');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();
    const periodMs = parseInt(period) * 24 * 60 * 60 * 1000;
    const fromDate = now - periodMs;

    // Get overall stats
    let logsQuery = `
      SELECT 
        COUNT(*) as total_generations,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(tokens_used) as total_tokens,
        AVG(generation_time_ms) as avg_generation_time
      FROM ai_generation_logs
      WHERE created_at >= ?
    `;
    const logsParams = [fromDate];

    if (pathId) {
      logsQuery += " AND automation_path_id = ?";
      logsParams.push(pathId);
    }

    const logsStmt = env.DB.prepare(logsQuery);
    const logsStats = await logsStmt.bind(...logsParams).first();

    // Get daily breakdown
    const dailyQuery = `
      SELECT 
        date,
        requests_count,
        successful_requests,
        failed_requests,
        total_tokens,
        estimated_cost_cents
      FROM ai_api_usage
      WHERE date >= date(?, 'unixepoch', 'localtime')
      ORDER BY date DESC
      LIMIT ?
    `;
    const { results: dailyStats } = await env.DB.prepare(dailyQuery)
      .bind(Math.floor(fromDate / 1000), parseInt(period))
      .all();

    // Get top performing paths
    const pathsQuery = `
      SELECT 
        automation_path_id,
        path_name,
        COUNT(*) as generation_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success_count,
        SUM(tokens_used) as tokens_used
      FROM ai_generation_logs
      WHERE created_at >= ?
      GROUP BY automation_path_id
      ORDER BY generation_count DESC
      LIMIT 10
    `;
    const { results: topPaths } = await env.DB.prepare(pathsQuery)
      .bind(fromDate)
      .all();

    // Get recent activity
    const recentQuery = `
      SELECT id, path_name, status, generated_title, created_at, generation_time_ms
      FROM ai_generation_logs
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const { results: recentActivity } = await env.DB.prepare(recentQuery).all();

    // Get active automation paths count
    const activePathsResult = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM automation_paths WHERE status = 'active'"
    ).first();

    // Calculate success rate
    const successRate = logsStats?.total_generations > 0
      ? ((logsStats.successful / logsStats.total_generations) * 100).toFixed(1)
      : 0;

    return new Response(JSON.stringify({
      summary: {
        total_generations: logsStats?.total_generations || 0,
        successful: logsStats?.successful || 0,
        failed: logsStats?.failed || 0,
        success_rate: parseFloat(successRate),
        total_tokens: logsStats?.total_tokens || 0,
        avg_generation_time_ms: Math.round(logsStats?.avg_generation_time || 0),
        active_paths: activePathsResult?.count || 0,
        period_days: parseInt(period)
      },
      daily: dailyStats,
      top_paths: topPaths,
      recent_activity: recentActivity
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
