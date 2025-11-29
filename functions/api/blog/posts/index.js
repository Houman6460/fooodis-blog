/**
 * GET /api/blog/posts - List all blog posts with filtering, search, pagination
 * POST /api/blog/posts - Create a new blog post
 * DELETE /api/blog/posts - Bulk delete posts (with ?ids=id1,id2,id3)
 * 
 * Query Parameters for GET:
 * - search: Search in title and content
 * - category: Filter by category name
 * - status: Filter by status (published, draft, scheduled, archived)
 * - featured: Filter by featured (true/false)
 * - sort: Sort field (created_at, updated_at, title, published_date)
 * - order: Sort order (asc, desc)
 * - limit: Number of results (default 50)
 * - offset: Pagination offset (default 0)
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  // Query parameters
  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const featured = url.searchParams.get('featured');
  const sortField = url.searchParams.get('sort') || 'created_at';
  const sortOrder = url.searchParams.get('order') || 'desc';
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Build query dynamically
    let query = "SELECT * FROM blog_posts";
    let countQuery = "SELECT COUNT(*) as total FROM blog_posts";
    const conditions = [];
    const params = [];

    // Search filter
    if (search) {
      conditions.push("(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    // Status filter
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    // Featured filter
    if (featured !== null && featured !== undefined) {
      const featuredValue = featured === 'true' || featured === '1' ? 1 : 0;
      conditions.push("featured = ?");
      params.push(featuredValue);
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'published_date', 'category', 'status'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute queries
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    // Get total count for pagination
    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0
      ? await countStmt.bind(...params).first()
      : await countStmt.first();

    // Parse JSON fields and transform to camelCase for frontend compatibility
    const posts = results.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.image_url || '',  // Transform to camelCase
      image_url: post.image_url || '', // Keep snake_case for backward compatibility
      author: post.author,
      category: post.category,
      subcategory: post.subcategory,
      tags: post.tags ? JSON.parse(post.tags) : [],
      publishedDate: post.published_date,  // Transform to camelCase
      published_date: post.published_date, // Keep snake_case for backward compatibility
      scheduledDate: post.scheduled_date,
      scheduled_date: post.scheduled_date,
      status: post.status,
      featured: post.featured === 1 || post.featured === true,
      views: post.views || 0,
      likes: post.likes || 0,
      commentsCount: post.comments_count || 0,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      slug: post.slug
    }));

    return new Response(JSON.stringify({
      posts,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: (offset + posts.length) < (countResult?.total || 0)
      }
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
      subcategory: data.subcategory || null,
      tags: JSON.stringify(data.tags || []),
      published_date: data.published_date || data.publishedDate || new Date().toISOString(),
      scheduled_date: data.scheduled_date || data.scheduledDate || null,
      status: data.status || 'draft',
      featured: data.featured ? 1 : 0,
      views: 0,
      likes: data.likes || 0,
      comments_count: data.comments_count || data.commentsCount || 0,
      created_at: now,
      updated_at: now,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    };

    await env.DB.prepare(`
      INSERT INTO blog_posts (
        id, title, content, excerpt, image_url, author, category, subcategory, tags,
        published_date, scheduled_date, status, featured, views, likes, comments_count, 
        created_at, updated_at, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id, post.title, post.content, post.excerpt, post.image_url, post.author, 
      post.category, post.subcategory, post.tags, post.published_date, post.scheduled_date,
      post.status, post.featured, post.views, post.likes, post.comments_count, 
      post.created_at, post.updated_at, post.slug
    ).run();

    // Update category post count
    if (post.category && post.category !== 'Uncategorized') {
      await env.DB.prepare(
        "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
      ).bind(post.category).run();
    }

    // Transform response to include both camelCase and snake_case for compatibility
    const responsePost = {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.image_url,  // camelCase for frontend
      image_url: post.image_url, // snake_case for backward compatibility
      author: post.author,
      category: post.category,
      subcategory: post.subcategory,
      tags: JSON.parse(post.tags),
      publishedDate: post.published_date,
      published_date: post.published_date,
      scheduledDate: post.scheduled_date,
      scheduled_date: post.scheduled_date,
      status: post.status,
      featured: post.featured === 1,
      views: post.views,
      likes: post.likes,
      commentsCount: post.comments_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      slug: post.slug
    };

    return new Response(JSON.stringify({ 
      success: true, 
      post: responsePost 
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

/**
 * DELETE /api/blog/posts - Bulk delete posts
 * Query: ?ids=id1,id2,id3
 */
export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const idsParam = url.searchParams.get('ids');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!idsParam) {
    return new Response(JSON.stringify({ error: "No post IDs provided. Use ?ids=id1,id2,id3" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
    
    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: "No valid post IDs provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Delete posts one by one (D1 doesn't support IN with bindings well)
    let deletedCount = 0;
    const errors = [];

    for (const id of ids) {
      try {
        const result = await env.DB.prepare(
          "DELETE FROM blog_posts WHERE id = ?"
        ).bind(id).run();
        
        if (result.meta.changes > 0) {
          deletedCount++;
        }
      } catch (e) {
        errors.push({ id, error: e.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deleted: deletedCount,
      requested: ids.length,
      errors: errors.length > 0 ? errors : undefined
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
