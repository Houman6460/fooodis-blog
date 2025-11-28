/**
 * Post Statistics API
 * GET /api/stats/posts/:id - Get statistics for a specific post
 * PUT /api/stats/posts/:id - Update statistics for a post
 */

/**
 * GET - Get stats for a specific post
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const postId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get post info with stats
    const post = await env.DB.prepare(`
      SELECT p.id, p.title, p.category, p.published_date, p.created_at,
             ps.views, ps.unique_views, 
             ps.shares_facebook, ps.shares_twitter, ps.shares_linkedin, ps.shares_email, ps.shares_total,
             ps.avg_read_time, ps.bounce_rate
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.id = ?
    `).bind(postId).first();

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get comments count
    const commentsCount = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND status = 'approved'"
    ).bind(postId).first();

    // Get daily views for last 30 days
    let dailyViews = [];
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const { results } = await env.DB.prepare(`
        SELECT DATE(created_at / 1000, 'unixepoch') as date, COUNT(*) as views
        FROM page_views
        WHERE post_id = ? AND created_at >= ?
        GROUP BY date
        ORDER BY date ASC
      `).bind(postId, thirtyDaysAgo).all();
      dailyViews = results || [];
    } catch (e) {
      // Table might not exist
    }

    // Get referrer breakdown
    let referrers = [];
    try {
      const { results } = await env.DB.prepare(`
        SELECT referrer, COUNT(*) as count
        FROM page_views
        WHERE post_id = ?
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `).bind(postId).all();
      referrers = results || [];
    } catch (e) {
      // Table might not exist
    }

    return new Response(JSON.stringify({
      post: {
        id: post.id,
        title: post.title,
        category: post.category,
        published_date: post.published_date
      },
      stats: {
        views: post.views || 0,
        uniqueViews: post.unique_views || 0,
        shares: {
          facebook: post.shares_facebook || 0,
          twitter: post.shares_twitter || 0,
          linkedin: post.shares_linkedin || 0,
          email: post.shares_email || 0,
          total: post.shares_total || 0
        },
        comments: commentsCount?.total || 0,
        avgReadTime: Math.round((post.avg_read_time || 0) / 60), // In minutes
        bounceRate: post.bounce_rate || 0
      },
      dailyViews,
      referrers
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
 * PUT - Manually update stats for a post
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const postId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    // Check if stats record exists
    const existing = await env.DB.prepare(
      "SELECT id FROM post_stats WHERE post_id = ?"
    ).bind(postId).first();

    if (!existing) {
      // Create new stats record
      await env.DB.prepare(`
        INSERT INTO post_stats (id, post_id, views, unique_views, shares_total, avg_read_time, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `stats_${postId}`,
        postId,
        data.views || 0,
        data.unique_views || 0,
        data.shares_total || 0,
        data.avg_read_time || 0,
        now
      ).run();
    } else {
      // Build update query
      const updates = [];
      const values = [];

      if (data.views !== undefined) {
        updates.push('views = ?');
        values.push(data.views);
      }
      if (data.unique_views !== undefined) {
        updates.push('unique_views = ?');
        values.push(data.unique_views);
      }
      if (data.shares_facebook !== undefined) {
        updates.push('shares_facebook = ?');
        values.push(data.shares_facebook);
      }
      if (data.shares_twitter !== undefined) {
        updates.push('shares_twitter = ?');
        values.push(data.shares_twitter);
      }
      if (data.shares_linkedin !== undefined) {
        updates.push('shares_linkedin = ?');
        values.push(data.shares_linkedin);
      }
      if (data.shares_email !== undefined) {
        updates.push('shares_email = ?');
        values.push(data.shares_email);
      }
      if (data.shares_total !== undefined) {
        updates.push('shares_total = ?');
        values.push(data.shares_total);
      }
      if (data.avg_read_time !== undefined) {
        updates.push('avg_read_time = ?');
        values.push(data.avg_read_time);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(now);
        values.push(postId);

        await env.DB.prepare(`
          UPDATE post_stats SET ${updates.join(', ')} WHERE post_id = ?
        `).bind(...values).run();
      }
    }

    // Also update the blog_posts table
    if (data.views !== undefined) {
      await env.DB.prepare(
        "UPDATE blog_posts SET views = ?, updated_at = ? WHERE id = ?"
      ).bind(data.views, now, postId).run();
    }

    return new Response(JSON.stringify({ success: true, post_id: postId }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
