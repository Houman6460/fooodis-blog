/**
 * Post View Tracking API
 * POST /api/posts/:id/view - Track a view for a post
 */

export async function onRequestPost(context) {
  const { env, params, request } = context;
  const postId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();
    
    // Get client IP for unique view tracking
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';
    
    // Check if post exists
    const post = await env.DB.prepare(
      "SELECT id, views FROM blog_posts WHERE id = ?"
    ).bind(postId).first();

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Increment view count on blog_posts
    const newViews = (post.views || 0) + 1;
    await env.DB.prepare(
      "UPDATE blog_posts SET views = ?, updated_at = ? WHERE id = ?"
    ).bind(newViews, now, postId).run();

    // Try to update or create post_stats record
    try {
      const statsExist = await env.DB.prepare(
        "SELECT id FROM post_stats WHERE post_id = ?"
      ).bind(postId).first();

      if (statsExist) {
        await env.DB.prepare(
          "UPDATE post_stats SET views = views + 1, updated_at = ? WHERE post_id = ?"
        ).bind(now, postId).run();
      } else {
        await env.DB.prepare(`
          INSERT INTO post_stats (id, post_id, views, unique_views, updated_at)
          VALUES (?, ?, 1, 1, ?)
        `).bind(`stats_${postId}`, postId, now).run();
      }
    } catch (e) {
      // post_stats table might not exist, continue
      console.log('post_stats table update failed:', e.message);
    }

    // Try to log page view for analytics
    try {
      await env.DB.prepare(`
        INSERT INTO page_views (id, post_id, visitor_ip, referrer, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        `pv_${postId}_${now}`,
        postId,
        clientIP,
        request.headers.get('Referer') || '',
        now
      ).run();
    } catch (e) {
      // page_views table might not exist, continue
    }

    return new Response(JSON.stringify({ 
      success: true, 
      post_id: postId,
      views: newViews 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('View tracking error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
