/**
 * GET /api/automation/paths - List all automation paths
 * POST /api/automation/paths - Create a new automation path
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
      "SELECT * FROM automation_paths ORDER BY created_at DESC"
    ).all();

    // Parse JSON fields
    const paths = results.map(path => ({
      ...path,
      topics: path.topics ? JSON.parse(path.topics) : [],
      languages: path.languages ? JSON.parse(path.languages) : [],
      include_images: !!path.include_images
    }));

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
