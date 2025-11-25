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

    await env.DB.prepare(`
      UPDATE blog_posts SET
        title = ?,
        content = ?,
        excerpt = ?,
        image_url = ?,
        author = ?,
        category = ?,
        tags = ?,
        published_date = ?,
        status = ?,
        updated_at = ?,
        slug = ?
      WHERE id = ?
    `).bind(
      data.title,
      data.content,
      data.excerpt,
      data.image_url || data.imageUrl,
      data.author,
      data.category,
      JSON.stringify(data.tags || []),
      data.published_date || data.publishedDate,
      data.status,
      now,
      data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      id
    ).run();

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
