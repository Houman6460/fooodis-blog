/**
 * GET /api/automation/paths - List all automation paths with filtering
 * POST /api/automation/paths - Create a new automation path
 * 
 * Query Parameters for GET:
 * - status: Filter by status (active, inactive, paused)
 * - category: Filter by category
 * - content_type: Filter by content type
 * - include_stats: Include generation statistics (true/false)
 */

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const contentType = url.searchParams.get('content_type');
  const includeStats = url.searchParams.get('include_stats') === 'true';
  
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM automation_paths";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (contentType) {
      conditions.push("content_type = ?");
      params.push(contentType);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 
      ? await stmt.bind(...params).all()
      : await stmt.all();

    // Parse JSON fields
    let paths = results.map(path => ({
      ...path,
      topics: path.topics ? JSON.parse(path.topics) : [],
      languages: path.languages ? JSON.parse(path.languages) : [],
      include_images: !!path.include_images
    }));

    // Include generation stats if requested
    if (includeStats && paths.length > 0) {
      const pathIds = paths.map(p => p.id);
      
      // Get stats for each path
      for (const path of paths) {
        const statsResult = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_generations,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(tokens_used) as total_tokens
          FROM ai_generation_logs
          WHERE automation_path_id = ?
        `).bind(path.id).first();

        path.stats = {
          total_generations: statsResult?.total_generations || 0,
          successful: statsResult?.successful || 0,
          failed: statsResult?.failed || 0,
          total_tokens: statsResult?.total_tokens || 0,
          success_rate: statsResult?.total_generations > 0 
            ? ((statsResult.successful / statsResult.total_generations) * 100).toFixed(1)
            : 0
        };
      }
    }

    return new Response(JSON.stringify(paths), {
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
    
    // Validation (basic)
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    
    const path = {
      id,
      name: data.name,
      content_type: data.contentType || data.content_type || 'General Blog Post',
      assistant_id: data.assistantId || data.assistant_id,
      category: data.category,
      subcategory: data.subcategory,
      topics: JSON.stringify(data.topics || []),
      mode: data.mode || 'schedule',
      schedule_type: data.scheduleType || data.schedule_type,
      schedule_time: data.scheduleTime || data.schedule_time,
      prompt_template: data.promptTemplate || data.prompt_template,
      include_images: data.includeImages ? 1 : 0,
      media_folder: data.mediaFolder || data.media_folder,
      languages: JSON.stringify(data.languages || ['en']),
      created_at: now,
      last_run: null,
      status: 'active'
    };

    await env.DB.prepare(`
      INSERT INTO automation_paths (
        id, name, content_type, assistant_id, category, subcategory,
        topics, mode, schedule_type, schedule_time, prompt_template,
        include_images, media_folder, languages, created_at, last_run, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      path.id, path.name, path.content_type, path.assistant_id, path.category, path.subcategory,
      path.topics, path.mode, path.schedule_type, path.schedule_time, path.prompt_template,
      path.include_images, path.media_folder, path.languages, path.created_at, path.last_run, path.status
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      path: { ...path, include_images: !!path.include_images, topics: JSON.parse(path.topics), languages: JSON.parse(path.languages) } 
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
