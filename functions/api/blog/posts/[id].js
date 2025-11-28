/**
 * GET /api/blog/posts/:id - Get a single blog post
 * PUT /api/blog/posts/:id - Update a blog post
 * DELETE /api/blog/posts/:id - Delete a blog post
 */

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const post = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
    
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse JSON fields
    post.tags = post.tags ? JSON.parse(post.tags) : [];

    return new Response(JSON.stringify(post), {
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
 * PUT /api/blog/posts/:id - Update a blog post (supports partial updates)
 */
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    // Get current post to support partial updates
    const currentPost = await env.DB.prepare(
      "SELECT * FROM blog_posts WHERE id = ?"
    ).bind(id).first();

    if (!currentPost) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Build dynamic update - only update provided fields
    const updates = [];
    const values = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(data.excerpt);
    }
    if (data.image_url !== undefined || data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(data.image_url || data.imageUrl);
    }
    if (data.author !== undefined) {
      updates.push('author = ?');
      values.push(data.author);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.subcategory !== undefined) {
      updates.push('subcategory = ?');
      values.push(data.subcategory);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(data.tags || []));
    }
    if (data.published_date !== undefined || data.publishedDate !== undefined) {
      updates.push('published_date = ?');
      values.push(data.published_date || data.publishedDate);
    }
    if (data.scheduled_date !== undefined || data.scheduledDate !== undefined) {
      updates.push('scheduled_date = ?');
      values.push(data.scheduled_date || data.scheduledDate);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.featured !== undefined) {
      updates.push('featured = ?');
      values.push(data.featured ? 1 : 0);
    }
    if (data.likes !== undefined) {
      updates.push('likes = ?');
      values.push(data.likes);
    }
    if (data.views !== undefined) {
      updates.push('views = ?');
      values.push(data.views);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(data.slug);
    } else if (data.title !== undefined) {
      // Auto-generate slug if title changed
      updates.push('slug = ?');
      values.push(data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }

    // Always update updated_at
    updates.push('updated_at = ?');
    values.push(now);

    if (updates.length === 1) { // Only updated_at
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Add ID for WHERE clause
    values.push(id);

    await env.DB.prepare(`
      UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Fetch updated post
    const updatedPost = await env.DB.prepare(
      "SELECT * FROM blog_posts WHERE id = ?"
    ).bind(id).first();

    // Parse JSON fields for response
    if (updatedPost) {
      updatedPost.tags = updatedPost.tags ? JSON.parse(updatedPost.tags) : [];
      updatedPost.featured = updatedPost.featured === 1;
    }

    return new Response(JSON.stringify({ success: true, post: updatedPost }), {
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
 * PATCH /api/blog/posts/:id - Toggle featured status (convenience endpoint)
 */
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();

    // If toggling featured status
    if (data.toggle === 'featured') {
      const post = await env.DB.prepare(
        "SELECT featured FROM blog_posts WHERE id = ?"
      ).bind(id).first();

      if (!post) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const newFeatured = post.featured === 1 ? 0 : 1;
      
      await env.DB.prepare(
        "UPDATE blog_posts SET featured = ?, updated_at = ? WHERE id = ?"
      ).bind(newFeatured, Date.now(), id).run();

      return new Response(JSON.stringify({ 
        success: true, 
        id,
        featured: newFeatured === 1
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // If incrementing views
    if (data.increment === 'views') {
      await env.DB.prepare(
        "UPDATE blog_posts SET views = views + 1 WHERE id = ?"
      ).bind(id).run();

      return new Response(JSON.stringify({ success: true, id }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // If incrementing likes
    if (data.increment === 'likes') {
      await env.DB.prepare(
        "UPDATE blog_posts SET likes = likes + 1 WHERE id = ?"
      ).bind(id).run();

      return new Response(JSON.stringify({ success: true, id }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid patch operation" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const result = await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id).run();
    
    if (result.meta.changes === 0) {
         return new Response(JSON.stringify({ error: "Post not found or already deleted" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
         });
    }

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
