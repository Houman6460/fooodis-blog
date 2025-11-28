/**
 * Check and Publish Due Posts API
 * POST /api/scheduled-posts/check - Check for due posts and publish them
 * GET /api/scheduled-posts/check - Get posts that are due for publishing
 * 
 * This should be called periodically (e.g., via Cloudflare Cron Trigger or client polling)
 */

/**
 * GET - Get posts that are due for publishing
 */
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();

    // Get posts that are due (scheduled_datetime <= now and status is pending)
    const { results } = await env.DB.prepare(`
      SELECT * FROM scheduled_posts 
      WHERE scheduled_datetime <= ? AND status = 'pending'
      ORDER BY priority DESC, scheduled_datetime ASC
    `).bind(now).all();

    const duePosts = results.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_overdue: post.scheduled_datetime < now
    }));

    return new Response(JSON.stringify({
      due_count: duePosts.length,
      posts: duePosts
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
 * POST - Check and publish all due posts
 */
export async function onRequestPost(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();
    const results = {
      checked: 0,
      published: 0,
      failed: 0,
      details: []
    };

    // Get all due posts
    const { results: duePosts } = await env.DB.prepare(`
      SELECT * FROM scheduled_posts 
      WHERE scheduled_datetime <= ? AND status = 'pending'
      ORDER BY priority DESC, scheduled_datetime ASC
    `).bind(now).all();

    results.checked = duePosts.length;

    // Publish each due post
    for (const scheduledPost of duePosts) {
      try {
        // Update status to publishing
        await env.DB.prepare(
          "UPDATE scheduled_posts SET status = 'publishing', last_attempt = ? WHERE id = ?"
        ).bind(now, scheduledPost.id).run();

        // Create the blog post
        const blogPostId = crypto.randomUUID();
        
        await env.DB.prepare(`
          INSERT INTO blog_posts (
            id, title, content, excerpt, image_url, author, category, subcategory, tags,
            published_date, status, featured, views, likes, comments_count, created_at, updated_at, slug
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 0, 0, 0, ?, ?, ?)
        `).bind(
          blogPostId,
          scheduledPost.title,
          scheduledPost.content,
          scheduledPost.excerpt,
          scheduledPost.image_url,
          scheduledPost.author,
          scheduledPost.category,
          scheduledPost.subcategory,
          scheduledPost.tags,
          new Date().toISOString(),
          scheduledPost.is_featured,
          now,
          now,
          scheduledPost.slug
        ).run();

        // Update scheduled post as published
        await env.DB.prepare(`
          UPDATE scheduled_posts SET 
            status = 'published', 
            published_post_id = ?, 
            updated_at = ? 
          WHERE id = ?
        `).bind(blogPostId, now, scheduledPost.id).run();

        // Log the event
        await env.DB.prepare(`
          INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
          VALUES (?, ?, 'published', ?, ?)
        `).bind(
          crypto.randomUUID(),
          scheduledPost.id,
          JSON.stringify({ 
            blog_post_id: blogPostId,
            published_at: new Date(now).toISOString(),
            auto_published: true
          }),
          now
        ).run();

        // Update category count
        if (scheduledPost.category && scheduledPost.category !== 'Uncategorized') {
          await env.DB.prepare(
            "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
          ).bind(scheduledPost.category).run();
        }

        results.published++;
        results.details.push({
          id: scheduledPost.id,
          title: scheduledPost.title,
          status: 'published',
          blog_post_id: blogPostId
        });

      } catch (publishError) {
        // Handle publish error
        const retryCount = (scheduledPost.retry_count || 0) + 1;
        const newStatus = retryCount >= (scheduledPost.max_retries || 3) ? 'failed' : 'pending';

        await env.DB.prepare(`
          UPDATE scheduled_posts SET 
            status = ?, 
            retry_count = ?, 
            error_message = ?,
            last_attempt = ?,
            updated_at = ? 
          WHERE id = ?
        `).bind(newStatus, retryCount, publishError.message, now, now, scheduledPost.id).run();

        await env.DB.prepare(`
          INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
          VALUES (?, ?, 'failed', ?, ?)
        `).bind(
          crypto.randomUUID(),
          scheduledPost.id,
          JSON.stringify({ error: publishError.message, retry_count: retryCount }),
          now
        ).run();

        results.failed++;
        results.details.push({
          id: scheduledPost.id,
          title: scheduledPost.title,
          status: 'failed',
          error: publishError.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date(now).toISOString(),
      ...results
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
