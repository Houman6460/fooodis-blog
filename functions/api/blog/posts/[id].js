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
    const dbPost = await env.DB.prepare("SELECT * FROM blog_posts WHERE id = ?").bind(id).first();
    
    if (!dbPost) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Transform to camelCase for frontend compatibility
    const post = {
      id: dbPost.id,
      title: dbPost.title,
      content: dbPost.content,
      excerpt: dbPost.excerpt,
      imageUrl: dbPost.image_url || '',  // camelCase for frontend
      image_url: dbPost.image_url || '', // snake_case for backward compatibility
      author: dbPost.author,
      category: dbPost.category,
      subcategory: dbPost.subcategory,
      tags: dbPost.tags ? JSON.parse(dbPost.tags) : [],
      publishedDate: dbPost.published_date,
      published_date: dbPost.published_date,
      scheduledDate: dbPost.scheduled_date,
      scheduled_date: dbPost.scheduled_date,
      status: dbPost.status,
      featured: dbPost.featured === 1,
      views: dbPost.views || 0,
      likes: dbPost.likes || 0,
      commentsCount: dbPost.comments_count || 0,
      createdAt: dbPost.created_at,
      updatedAt: dbPost.updated_at,
      slug: dbPost.slug
    };

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

    // Helper function to ensure value is a primitive (string, number, null)
    const toPrimitive = (val, defaultVal = null) => {
      if (val === undefined || val === null) return defaultVal;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };
    
    const toNumber = (val, defaultVal = 0) => {
      if (val === undefined || val === null) return defaultVal;
      const num = parseInt(val);
      return isNaN(num) ? defaultVal : num;
    };

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
      values.push(toPrimitive(data.title, 'Untitled'));
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(toPrimitive(data.content, ''));
    }
    if (data.excerpt !== undefined) {
      updates.push('excerpt = ?');
      values.push(toPrimitive(data.excerpt, ''));
    }
    if (data.image_url !== undefined || data.imageUrl !== undefined) {
      updates.push('image_url = ?');
      values.push(toPrimitive(data.image_url || data.imageUrl, ''));
    }
    if (data.author !== undefined) {
      updates.push('author = ?');
      values.push(toPrimitive(data.author, 'Admin'));
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(toPrimitive(data.category, 'Uncategorized'));
    }
    if (data.subcategory !== undefined) {
      updates.push('subcategory = ?');
      values.push(data.subcategory ? toPrimitive(data.subcategory) : null);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      let tagsString = '[]';
      if (data.tags) {
        if (typeof data.tags === 'string') {
          try {
            JSON.parse(data.tags);
            tagsString = data.tags;
          } catch (e) {
            tagsString = JSON.stringify([data.tags]);
          }
        } else if (Array.isArray(data.tags)) {
          tagsString = JSON.stringify(data.tags);
        } else if (typeof data.tags === 'object') {
          tagsString = JSON.stringify(Object.values(data.tags));
        }
      }
      values.push(tagsString);
    }
    if (data.published_date !== undefined || data.publishedDate !== undefined) {
      updates.push('published_date = ?');
      values.push(toPrimitive(data.published_date || data.publishedDate, new Date().toISOString()));
    }
    if (data.scheduled_date !== undefined || data.scheduledDate !== undefined) {
      updates.push('scheduled_date = ?');
      const schedDate = data.scheduled_date || data.scheduledDate;
      values.push(schedDate ? toPrimitive(schedDate) : null);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(toPrimitive(data.status, 'draft'));
    }
    if (data.featured !== undefined) {
      updates.push('featured = ?');
      values.push(data.featured ? 1 : 0);
    }
    if (data.likes !== undefined) {
      updates.push('likes = ?');
      values.push(toNumber(data.likes, 0));
    }
    if (data.views !== undefined) {
      updates.push('views = ?');
      values.push(toNumber(data.views, 0));
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(toPrimitive(data.slug, ''));
    } else if (data.title !== undefined) {
      // Auto-generate slug if title changed
      updates.push('slug = ?');
      const titleStr = toPrimitive(data.title, 'untitled');
      values.push(titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
    const dbPost = await env.DB.prepare(
      "SELECT * FROM blog_posts WHERE id = ?"
    ).bind(id).first();

    // Transform to camelCase for frontend compatibility
    const updatedPost = dbPost ? {
      id: dbPost.id,
      title: dbPost.title,
      content: dbPost.content,
      excerpt: dbPost.excerpt,
      imageUrl: dbPost.image_url || '',
      image_url: dbPost.image_url || '',
      author: dbPost.author,
      category: dbPost.category,
      subcategory: dbPost.subcategory,
      tags: dbPost.tags ? JSON.parse(dbPost.tags) : [],
      publishedDate: dbPost.published_date,
      published_date: dbPost.published_date,
      scheduledDate: dbPost.scheduled_date,
      scheduled_date: dbPost.scheduled_date,
      status: dbPost.status,
      featured: dbPost.featured === 1,
      views: dbPost.views || 0,
      likes: dbPost.likes || 0,
      commentsCount: dbPost.comments_count || 0,
      createdAt: dbPost.created_at,
      updatedAt: dbPost.updated_at,
      slug: dbPost.slug
    } : null;

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
    // First, get the post to know its category (for decrementing count)
    const post = await env.DB.prepare(
      "SELECT category FROM blog_posts WHERE id = ?"
    ).bind(id).first();
    
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Delete the post
    const result = await env.DB.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id).run();
    
    if (result.meta.changes === 0) {
         return new Response(JSON.stringify({ error: "Post not found or already deleted" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
         });
    }
    
    // Decrement category post count
    if (post.category && post.category !== 'Uncategorized') {
      await env.DB.prepare(
        "UPDATE categories SET post_count = MAX(0, post_count - 1) WHERE name = ?"
      ).bind(post.category).run();
    }

    return new Response(JSON.stringify({ success: true, id, category: post.category }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
