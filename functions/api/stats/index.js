/**
 * Blog Statistics API
 * GET /api/stats - Get aggregate blog statistics
 * POST /api/stats - Record a page view or event
 * 
 * Integrates with:
 * - Blog Statistics dashboard
 * - Individual post views
 * - AI Automation metrics
 * - All dashboard sections
 */

/**
 * GET /api/stats - Get aggregate statistics
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '30d'; // 7d, 30d, 90d, all
  const type = url.searchParams.get('type') || 'overview'; // overview, posts, categories, trends

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();
    let startTime = 0;

    // Calculate period start time
    switch (period) {
      case '7d':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = now - (90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = 0;
    }

    let stats = {};

    if (type === 'overview' || type === 'all') {
      // Get total posts count
      const postsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'"
      ).first();

      // Get total views from post_stats
      const viewsTotal = await env.DB.prepare(
        "SELECT SUM(views) as total, SUM(unique_views) as unique_total FROM post_stats"
      ).first();

      // Get total comments
      const commentsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM comments WHERE status = 'approved'"
      ).first();

      // Get total shares
      const sharesTotal = await env.DB.prepare(
        "SELECT SUM(shares_total) as total FROM post_stats"
      ).first();

      // Get categories count
      const categoriesCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM categories WHERE is_active = 1"
      ).first();

      // Get tags count
      const tagsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM tags"
      ).first();

      // Get scheduled posts count
      const scheduledCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM scheduled_posts WHERE status = 'pending'"
      ).first();

      // Get media count
      const mediaCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM media_library"
      ).first();

      // Calculate average read time
      const avgReadTime = await env.DB.prepare(
        "SELECT AVG(avg_read_time) as average FROM post_stats WHERE avg_read_time > 0"
      ).first();

      stats.overview = {
        totalPosts: postsCount?.total || 0,
        totalViews: viewsTotal?.total || 0,
        uniqueViews: viewsTotal?.unique_total || 0,
        totalComments: commentsCount?.total || 0,
        totalShares: sharesTotal?.total || 0,
        totalCategories: categoriesCount?.total || 0,
        totalTags: tagsCount?.total || 0,
        scheduledPosts: scheduledCount?.total || 0,
        mediaFiles: mediaCount?.total || 0,
        averageReadTime: Math.round((avgReadTime?.average || 0) / 60) // Convert to minutes
      };
    }

    if (type === 'posts' || type === 'all') {
      // Get top performing posts
      const { results: topPosts } = await env.DB.prepare(`
        SELECT p.id, p.title, p.category, p.published_date, 
               ps.views, ps.unique_views, ps.shares_total
        FROM blog_posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE p.status = 'published'
        ORDER BY ps.views DESC
        LIMIT 10
      `).all();

      // Get recent posts performance
      const { results: recentPosts } = await env.DB.prepare(`
        SELECT p.id, p.title, p.category, p.published_date,
               ps.views, ps.unique_views, ps.shares_total
        FROM blog_posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC
        LIMIT 10
      `).all();

      stats.posts = {
        topPosts: topPosts || [],
        recentPosts: recentPosts || []
      };
    }

    if (type === 'categories' || type === 'all') {
      // Get category statistics
      const { results: categoryStats } = await env.DB.prepare(`
        SELECT c.name, c.post_count, c.color,
               SUM(ps.views) as total_views,
               SUM(ps.shares_total) as total_shares
        FROM categories c
        LEFT JOIN blog_posts p ON c.name = p.category
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE c.is_active = 1
        GROUP BY c.id, c.name
        ORDER BY total_views DESC
      `).all();

      stats.categories = categoryStats || [];
    }

    if (type === 'trends' || type === 'all') {
      // Get daily views for the period (from page_views if exists)
      let dailyViews = [];
      try {
        const { results } = await env.DB.prepare(`
          SELECT DATE(created_at / 1000, 'unixepoch') as date,
                 COUNT(*) as views,
                 COUNT(DISTINCT visitor_id) as unique_views
          FROM page_views
          WHERE created_at >= ?
          GROUP BY date
          ORDER BY date ASC
        `).bind(startTime).all();
        dailyViews = results || [];
      } catch (e) {
        // Table might not exist
        dailyViews = [];
      }

      // Calculate trends (compare current vs previous period)
      const previousStart = startTime - (now - startTime);
      
      let currentViews = 0, previousViews = 0;
      try {
        const current = await env.DB.prepare(
          "SELECT SUM(views) as total FROM page_views WHERE created_at >= ?"
        ).bind(startTime).first();
        currentViews = current?.total || 0;

        const previous = await env.DB.prepare(
          "SELECT SUM(views) as total FROM page_views WHERE created_at >= ? AND created_at < ?"
        ).bind(previousStart, startTime).first();
        previousViews = previous?.total || 0;
      } catch (e) {
        // Use post_stats as fallback
      }

      const viewsChange = previousViews > 0 
        ? ((currentViews - previousViews) / previousViews) * 100 
        : 0;

      stats.trends = {
        dailyViews,
        viewsChange: Math.round(viewsChange * 10) / 10,
        period
      };
    }

    // Cache result in KV if available
    if (env.KV) {
      try {
        await env.KV.put(`stats_${type}_${period}`, JSON.stringify(stats), { expirationTtl: 300 });
      } catch (e) {
        console.error('KV cache error:', e);
      }
    }

    return new Response(JSON.stringify(stats), {
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
 * POST /api/stats - Record a page view or event
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
    const { type, post_id, event_data } = data;

    const now = Date.now();
    
    // Get visitor identifier (from header or generate)
    const visitorId = request.headers.get('X-Visitor-ID') || 
                      request.headers.get('CF-Connecting-IP') ||
                      crypto.randomUUID();

    switch (type) {
      case 'page_view':
        // Record page view
        try {
          await env.DB.prepare(`
            INSERT INTO page_views (id, post_id, visitor_id, page_url, referrer, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            post_id || null,
            visitorId,
            data.page_url || '',
            data.referrer || '',
            request.headers.get('User-Agent') || '',
            now
          ).run();
        } catch (e) {
          // Table might not exist, just update post_stats
        }

        // Update post_stats if post_id is provided
        if (post_id) {
          await env.DB.prepare(`
            INSERT INTO post_stats (id, post_id, views, unique_views, updated_at)
            VALUES (?, ?, 1, 1, ?)
            ON CONFLICT(post_id) DO UPDATE SET 
              views = views + 1,
              updated_at = ?
          `).bind(
            `stats_${post_id}`,
            post_id,
            now,
            now
          ).run();
        }
        break;

      case 'share':
        // Record share event
        const platform = data.platform || 'other';
        const shareColumn = `shares_${platform}`;
        
        if (post_id) {
          // Update share count
          await env.DB.prepare(`
            UPDATE post_stats SET 
              ${shareColumn} = ${shareColumn} + 1,
              shares_total = shares_total + 1,
              updated_at = ?
            WHERE post_id = ?
          `).bind(now, post_id).run();
        }
        break;

      case 'read_time':
        // Update average read time
        if (post_id && data.read_time) {
          await env.DB.prepare(`
            UPDATE post_stats SET 
              avg_read_time = (avg_read_time + ?) / 2,
              updated_at = ?
            WHERE post_id = ?
          `).bind(data.read_time, now, post_id).run();
        }
        break;

      case 'event':
        // Record generic event
        try {
          await env.DB.prepare(`
            INSERT INTO analytics_events (id, event_type, event_data, visitor_id, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            data.event_type || 'unknown',
            JSON.stringify(event_data || {}),
            visitorId,
            now
          ).run();
        } catch (e) {
          // Table might not exist
        }
        break;
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
