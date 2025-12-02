/**
 * Post Rating API
 * POST /api/posts/:id/rating - Submit a rating for a post
 * GET /api/posts/:id/rating - Get ratings for a post
 */

export async function onRequestPost(context) {
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
    const rating = parseInt(data.rating);

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Rating must be between 1 and 5" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';

    // Check if post exists
    const post = await env.DB.prepare(
      "SELECT id FROM blog_posts WHERE id = ?"
    ).bind(postId).first();

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Try to insert or update rating
    try {
      // Check if user already rated this post
      const existingRating = await env.DB.prepare(
        "SELECT id, rating FROM post_ratings WHERE post_id = ? AND visitor_ip = ?"
      ).bind(postId, clientIP).first();

      if (existingRating) {
        // Update existing rating
        await env.DB.prepare(
          "UPDATE post_ratings SET rating = ?, updated_at = ? WHERE id = ?"
        ).bind(rating, now, existingRating.id).run();
      } else {
        // Insert new rating
        await env.DB.prepare(`
          INSERT INTO post_ratings (id, post_id, rating, visitor_ip, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          `rating_${postId}_${now}`,
          postId,
          rating,
          clientIP,
          now,
          now
        ).run();
      }

      // Calculate new average
      const stats = await env.DB.prepare(`
        SELECT AVG(rating) as average, COUNT(*) as count 
        FROM post_ratings 
        WHERE post_id = ?
      `).bind(postId).first();

      // Update blog_posts with rating info
      await env.DB.prepare(
        "UPDATE blog_posts SET rating_avg = ?, rating_count = ?, updated_at = ? WHERE id = ?"
      ).bind(
        Math.round((stats.average || 0) * 10) / 10,
        stats.count || 0,
        now,
        postId
      ).run();

      return new Response(JSON.stringify({
        success: true,
        post_id: postId,
        rating: rating,
        average: Math.round((stats.average || 0) * 10) / 10,
        count: stats.count || 0
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (tableError) {
      // If post_ratings table doesn't exist, create it and retry
      console.log('Rating table error, attempting to create:', tableError.message);
      
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS post_ratings (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            rating INTEGER NOT NULL,
            visitor_ip TEXT,
            created_at INTEGER,
            updated_at INTEGER
          )
        `).run();

        // Retry insert
        await env.DB.prepare(`
          INSERT INTO post_ratings (id, post_id, rating, visitor_ip, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          `rating_${postId}_${now}`,
          postId,
          rating,
          clientIP,
          now,
          now
        ).run();

        return new Response(JSON.stringify({
          success: true,
          post_id: postId,
          rating: rating,
          average: rating,
          count: 1
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (createError) {
        throw createError;
      }
    }

  } catch (error) {
    console.error('Rating error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

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
    // Get rating stats
    const stats = await env.DB.prepare(`
      SELECT AVG(rating) as average, COUNT(*) as count 
      FROM post_ratings 
      WHERE post_id = ?
    `).bind(postId).first();

    return new Response(JSON.stringify({
      post_id: postId,
      average: Math.round((stats?.average || 0) * 10) / 10,
      count: stats?.count || 0
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    // Table might not exist
    return new Response(JSON.stringify({
      post_id: postId,
      average: 0,
      count: 0
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
