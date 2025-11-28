/**
 * Publish Scheduled Post API
 * POST /api/scheduled-posts/:id/publish - Manually publish a scheduled post
 * 
 * This endpoint:
 * 1. Creates a new blog_post from the scheduled post data
 * 2. Updates the scheduled post status to 'published'
 * 3. Links the published post back to scheduled_posts
 */

export async function onRequestPost(context) {
  const { env, params } = context;
  const scheduledPostId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const now = Date.now();

    // Get the scheduled post
    const scheduledPost = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(scheduledPostId).first();

    if (!scheduledPost) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (scheduledPost.status === 'published') {
      return new Response(JSON.stringify({ 
        error: "Post already published",
        published_post_id: scheduledPost.published_post_id
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update status to publishing
    await env.DB.prepare(
      "UPDATE scheduled_posts SET status = 'publishing', last_attempt = ?, updated_at = ? WHERE id = ?"
    ).bind(now, now, scheduledPostId).run();

    // Create the blog post
    const blogPostId = crypto.randomUUID();
    
    try {
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
        scheduledPost.tags, // Already JSON string
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
      `).bind(blogPostId, now, scheduledPostId).run();

      // Log the publish event
      await env.DB.prepare(`
        INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
        VALUES (?, ?, 'published', ?, ?)
      `).bind(
        crypto.randomUUID(),
        scheduledPostId,
        JSON.stringify({ 
          blog_post_id: blogPostId,
          published_at: new Date(now).toISOString(),
          source: scheduledPost.source
        }),
        now
      ).run();

      // Update category post count
      if (scheduledPost.category && scheduledPost.category !== 'Uncategorized') {
        await env.DB.prepare(
          "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
        ).bind(scheduledPost.category).run();
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: "Post published successfully",
        scheduled_post_id: scheduledPostId,
        blog_post_id: blogPostId,
        title: scheduledPost.title
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (publishError) {
      // Update scheduled post with error
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
      `).bind(newStatus, retryCount, publishError.message, now, now, scheduledPostId).run();

      // Log the failure
      await env.DB.prepare(`
        INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
        VALUES (?, ?, 'failed', ?, ?)
      `).bind(
        crypto.randomUUID(),
        scheduledPostId,
        JSON.stringify({ 
          error: publishError.message,
          retry_count: retryCount
        }),
        now
      ).run();

      throw publishError;
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
