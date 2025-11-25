/**
 * GET /api/blog/posts - List all blog posts
 * POST /api/blog/posts - Create a new blog post
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
    const { results } = await env.DB.prepare(
      "SELECT * FROM blog_posts ORDER BY created_at DESC"
    ).all();

    // Parse JSON fields
    const posts = results.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : []
    }));

    return new Response(JSON.stringify(posts), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

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
    
    if (!data.title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    
    const post = {
      id,
      title: data.title,
      content: data.content || '',
      excerpt: data.excerpt || '',
      image_url: data.image_url || data.imageUrl || '',
      author: data.author || 'Admin',
      category: data.category || 'Uncategorized',
      tags: JSON.stringify(data.tags || []),
      published_date: data.published_date || data.publishedDate || new Date().toISOString(),
      status: data.status || 'draft',
      likes: data.likes || 0,
      comments_count: data.comments_count || data.commentsCount || 0,
      created_at: now,
      updated_at: now,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    };

    await env.DB.prepare(`
      INSERT INTO blog_posts (
        id, title, content, excerpt, image_url, author, category, tags,
        published_date, status, likes, comments_count, created_at, updated_at, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id, post.title, post.content, post.excerpt, post.image_url, post.author, post.category, post.tags,
      post.published_date, post.status, post.likes, post.comments_count, post.created_at, post.updated_at, post.slug
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      post: { ...post, tags: JSON.parse(post.tags) } 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
