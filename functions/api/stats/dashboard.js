/**
 * Dashboard Statistics API
 * GET /api/stats/dashboard - Get comprehensive dashboard statistics
 * 
 * Returns all data needed for the Blog Statistics dashboard section
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30d';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();
    let periodStart = 0;
    let previousPeriodStart = 0;

    switch (period) {
      case '7d':
        periodStart = now - (7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = periodStart - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        periodStart = now - (30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = periodStart - (30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        periodStart = now - (90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = periodStart - (90 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = 0;
        previousPeriodStart = 0;
    }

    // ========================================
    // OVERVIEW STATS
    // ========================================

    // Total posts
    const totalPosts = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'"
    ).first();

    // Posts in period
    const postsInPeriod = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published' AND created_at >= ?"
    ).bind(periodStart).first();

    // Total views
    const totalViews = await env.DB.prepare(
      "SELECT SUM(views) as total FROM post_stats"
    ).first();

    // Total comments
    const totalComments = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE status = 'approved'"
    ).first();

    // Comments in period
    const commentsInPeriod = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE status = 'approved' AND created_at >= ?"
    ).bind(periodStart).first();

    // Total shares
    const totalShares = await env.DB.prepare(
      "SELECT SUM(shares_total) as total FROM post_stats"
    ).first();

    // Average read time
    const avgReadTime = await env.DB.prepare(
      "SELECT AVG(avg_read_time) as avg FROM post_stats WHERE avg_read_time > 0"
    ).first();

    // ========================================
    // CATEGORY BREAKDOWN
    // ========================================

    const { results: categoryStats } = await env.DB.prepare(`
      SELECT 
        c.name,
        c.color,
        c.post_count,
        COALESCE(SUM(ps.views), 0) as total_views,
        COALESCE(SUM(ps.shares_total), 0) as total_shares
      FROM categories c
      LEFT JOIN blog_posts p ON c.name = p.category AND p.status = 'published'
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY total_views DESC
      LIMIT 10
    `).all();

    // ========================================
    // TOP POSTS
    // ========================================

    const { results: topPosts } = await env.DB.prepare(`
      SELECT 
        p.id, p.title, p.category, p.published_date, p.image_url,
        COALESCE(ps.views, 0) as views,
        COALESCE(ps.shares_total, 0) as shares,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comments
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.status = 'published'
      ORDER BY ps.views DESC
      LIMIT 5
    `).all();

    // ========================================
    // RECENT POSTS PERFORMANCE
    // ========================================

    const { results: recentPosts } = await env.DB.prepare(`
      SELECT 
        p.id, p.title, p.category, p.published_date,
        COALESCE(ps.views, 0) as views,
        COALESCE(ps.shares_total, 0) as shares
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.status = 'published' AND p.created_at >= ?
      ORDER BY p.created_at DESC
      LIMIT 5
    `).bind(periodStart).all();

    // ========================================
    // TRENDS DATA
    // ========================================

    // Calculate period change
    let viewsChange = 0;
    let commentsChange = 0;
    let postsChange = 0;

    if (previousPeriodStart > 0) {
      // Views change (compare post_stats updates)
      const currentPeriodViews = postsInPeriod?.total || 0;
      
      const previousPeriodPosts = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published' AND created_at >= ? AND created_at < ?"
      ).bind(previousPeriodStart, periodStart).first();
      
      const prevPosts = previousPeriodPosts?.total || 0;
      if (prevPosts > 0) {
        postsChange = ((currentPeriodViews - prevPosts) / prevPosts) * 100;
      }

      // Comments change
      const prevComments = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM comments WHERE status = 'approved' AND created_at >= ? AND created_at < ?"
      ).bind(previousPeriodStart, periodStart).first();
      
      const currentComments = commentsInPeriod?.total || 0;
      const previousComments = prevComments?.total || 0;
      if (previousComments > 0) {
        commentsChange = ((currentComments - previousComments) / previousComments) * 100;
      }
    }

    // ========================================
    // AUTOMATION STATS
    // ========================================

    let automationStats = {
      totalPaths: 0,
      activePaths: 0,
      totalGenerated: 0,
      scheduledPosts: 0
    };

    try {
      const pathsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM automation_paths"
      ).first();

      const scheduledCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM scheduled_posts WHERE status = 'pending'"
      ).first();

      const generatedCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM ai_generation_logs WHERE status = 'completed'"
      ).first();

      automationStats = {
        totalPaths: pathsCount?.total || 0,
        activePaths: pathsCount?.active || 0,
        totalGenerated: generatedCount?.total || 0,
        scheduledPosts: scheduledCount?.total || 0
      };
    } catch (e) {
      // Tables might not exist
    }

    // ========================================
    // MEDIA STATS
    // ========================================

    const mediaStats = await env.DB.prepare(`
      SELECT COUNT(*) as total, SUM(file_size) as total_size
      FROM media_library
    `).first();

    // ========================================
    // BUILD RESPONSE
    // ========================================

    const dashboard = {
      period,
      generatedAt: new Date().toISOString(),
      
      overview: {
        totalPosts: totalPosts?.total || 0,
        postsInPeriod: postsInPeriod?.total || 0,
        totalViews: totalViews?.total || 0,
        totalComments: totalComments?.total || 0,
        commentsInPeriod: commentsInPeriod?.total || 0,
        totalShares: totalShares?.total || 0,
        averageReadTime: Math.round((avgReadTime?.avg || 0) / 60)
      },

      trends: {
        postsChange: Math.round(postsChange * 10) / 10,
        viewsChange: Math.round(viewsChange * 10) / 10,
        commentsChange: Math.round(commentsChange * 10) / 10
      },

      categories: categoryStats || [],
      topPosts: topPosts || [],
      recentPosts: recentPosts || [],

      automation: automationStats,

      media: {
        totalFiles: mediaStats?.total || 0,
        totalSize: mediaStats?.total_size || 0
      }
    };

    // Cache in KV
    if (env.KV) {
      try {
        await env.KV.put(`dashboard_stats_${period}`, JSON.stringify(dashboard), { expirationTtl: 300 });
      } catch (e) {
        // Ignore cache errors
      }
    }

    return new Response(JSON.stringify(dashboard), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
