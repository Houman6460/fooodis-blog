/**
 * Scheduled Posts API
 * GET /api/scheduled-posts - List scheduled posts with filtering
 * POST /api/scheduled-posts - Create a new scheduled post
 * 
 * Integrates with:
 * - AI Content Automation (source = 'ai_automation')
 * - Create New Blog Post (source = 'manual')
 * - Manage Blog Posts (view scheduled status)
 */

/**
 * GET /api/scheduled-posts
 * Query params: status, source, from_date, to_date, automation_path_id, limit, offset
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const status = url.searchParams.get('status');
  const source = url.searchParams.get('source');
  const fromDate = url.searchParams.get('from_date');
  const toDate = url.searchParams.get('to_date');
  const automationPathId = url.searchParams.get('automation_path_id');
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;
  const includePublished = url.searchParams.get('include_published') === 'true';

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM scheduled_posts";
    let countQuery = "SELECT COUNT(*) as total FROM scheduled_posts";
    const conditions = [];
    const params = [];

    // Default: only show pending posts unless explicitly including published
    if (!includePublished) {
      conditions.push("status IN ('pending', 'publishing', 'failed')");
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (source) {
      conditions.push("source = ?");
      params.push(source);
    }
    if (automationPathId) {
      conditions.push("automation_path_id = ?");
      params.push(automationPathId);
    }
    if (fromDate) {
      conditions.push("scheduled_datetime >= ?");
      params.push(new Date(fromDate).getTime());
    }
    if (toDate) {
      conditions.push("scheduled_datetime <= ?");
      params.push(new Date(toDate).getTime());
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY scheduled_datetime ASC";
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0
      ? await countStmt.bind(...params).first()
      : await countStmt.first();

    // Parse JSON fields and format dates
    const posts = results.map(post => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_featured: post.is_featured === 1
    }));

    // Group by date for calendar view
    const groupedByDate = {};
    posts.forEach(post => {
      const dateKey = new Date(post.scheduled_datetime).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(post);
    });

    return new Response(JSON.stringify({
      posts,
      grouped: groupedByDate,
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

/**
 * POST /api/scheduled-posts - Create a new scheduled post
 */
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

    // Validate required fields
    if (!data.title) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!data.scheduled_datetime && !data.scheduledDate) {
      return new Response(JSON.stringify({ error: "Scheduled date/time is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    // Parse scheduled datetime
    let scheduledDatetime;
    if (data.scheduled_datetime) {
      scheduledDatetime = typeof data.scheduled_datetime === 'number' 
        ? data.scheduled_datetime 
        : new Date(data.scheduled_datetime).getTime();
    } else if (data.scheduledDate) {
      scheduledDatetime = new Date(data.scheduledDate).getTime();
    }

    // Validate not in the past
    if (scheduledDatetime <= now) {
      return new Response(JSON.stringify({ error: "Cannot schedule in the past" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const post = {
      id,
      title: data.title,
      content: data.content || '',
      excerpt: data.excerpt || '',
      image_url: data.image_url || data.imageUrl || '',
      category: data.category || 'Uncategorized',
      subcategory: data.subcategory || null,
      tags: JSON.stringify(data.tags || []),
      author: data.author || 'Admin',
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      scheduled_datetime: scheduledDatetime,
      timezone: data.timezone || 'UTC',
      source: data.source || 'manual',
      automation_path_id: data.automation_path_id || data.automationPathId || null,
      automation_path_name: data.automation_path_name || data.automationPathName || null,
      generation_log_id: data.generation_log_id || data.generationLogId || null,
      status: 'pending',
      is_featured: data.is_featured || data.featured ? 1 : 0,
      priority: data.priority || 0,
      notify_on_publish: data.notify_on_publish ? 1 : 0,
      created_at: now,
      updated_at: now
    };

    await env.DB.prepare(`
      INSERT INTO scheduled_posts (
        id, title, content, excerpt, image_url, category, subcategory, tags, author, slug,
        scheduled_datetime, timezone, source, automation_path_id, automation_path_name,
        generation_log_id, status, is_featured, priority, notify_on_publish, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id, post.title, post.content, post.excerpt, post.image_url, post.category,
      post.subcategory, post.tags, post.author, post.slug, post.scheduled_datetime,
      post.timezone, post.source, post.automation_path_id, post.automation_path_name,
      post.generation_log_id, post.status, post.is_featured, post.priority,
      post.notify_on_publish, post.created_at, post.updated_at
    ).run();

    // Log the creation event
    await env.DB.prepare(`
      INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
      VALUES (?, ?, 'created', ?, ?)
    `).bind(
      crypto.randomUUID(),
      post.id,
      JSON.stringify({ source: post.source, scheduled_for: new Date(scheduledDatetime).toISOString() }),
      now
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      post: {
        ...post,
        tags: JSON.parse(post.tags),
        scheduled_date: new Date(scheduledDatetime).toISOString(),
        is_featured: post.is_featured === 1
      }
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
