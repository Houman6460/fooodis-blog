/**
 * PUT /api/automation/paths/:id - Update an automation path
 * DELETE /api/automation/paths/:id - Delete an automation path
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
    
    // Check if exists
    const exists = await env.DB.prepare("SELECT id FROM automation_paths WHERE id = ?").bind(id).first();
    if (!exists) {
      return new Response(JSON.stringify({ error: "Path not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // We only update fields that are provided (partial update) or full update
    // For simplicity, we assume full object is sent or we merge carefully.
    // But usually PUT is replacement. Let's assume the UI sends the full updated object.
    
    // To be safe, we construct the update query based on what's valid.
    // But since the UI is likely sending mostly the same structure as POST:
    
    const includeImages = data.includeImages !== undefined ? (data.includeImages ? 1 : 0) : 
                          (data.include_images !== undefined ? (data.include_images ? 1 : 0) : 0);

    await env.DB.prepare(`
      UPDATE automation_paths SET
        name = ?,
        content_type = ?,
        assistant_id = ?,
        category = ?,
        subcategory = ?,
        topics = ?,
        mode = ?,
        schedule_type = ?,
        schedule_time = ?,
        prompt_template = ?,
        include_images = ?,
        media_folder = ?,
        languages = ?,
        status = ?,
        last_run = ?
      WHERE id = ?
    `).bind(
      data.name || '',
      data.contentType || data.content_type || 'blog-post',
      data.assistantId || data.assistant_id || null,
      data.category || 'Uncategorized',
      data.subcategory || null,
      JSON.stringify(data.topics || []),
      data.mode || 'immediate',
      data.scheduleType || data.schedule_type || null,
      data.scheduleTime || data.schedule_time || null,
      data.promptTemplate || data.prompt_template || '',
      includeImages,
      data.mediaFolder || data.media_folder || null,
      JSON.stringify(data.languages || ['en']),
      data.status || 'active',
      data.lastRun || data.last_run || null,
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
    const result = await env.DB.prepare("DELETE FROM automation_paths WHERE id = ?").bind(id).run();
    
    if (result.meta.changes === 0) {
        // D1 run() returns meta with changes count
         return new Response(JSON.stringify({ error: "Path not found or already deleted" }), {
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
