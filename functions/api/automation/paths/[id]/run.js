/**
 * Manually Run Automation Path API
 * POST /api/automation/paths/:id/run - Trigger an automation path execution
 */

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const pathId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get the automation path
    const path = await env.DB.prepare(
      "SELECT * FROM automation_paths WHERE id = ?"
    ).bind(pathId).first();

    if (!path) {
      return new Response(JSON.stringify({ error: "Automation path not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse JSON fields
    const pathData = {
      ...path,
      topics: path.topics ? JSON.parse(path.topics) : [],
      languages: path.languages ? JSON.parse(path.languages) : ['en']
    };

    // Create a generation log entry
    const logId = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(`
      INSERT INTO ai_generation_logs (
        id, automation_path_id, path_name, status, content_type, category,
        topic, language, started_at, created_at
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `).bind(
      logId,
      pathId,
      path.name,
      path.content_type,
      path.category,
      pathData.topics[0] || '',
      pathData.languages[0] || 'en',
      now,
      now
    ).run();

    // Update last_run timestamp on the path
    await env.DB.prepare(
      "UPDATE automation_paths SET last_run = ? WHERE id = ?"
    ).bind(now, pathId).run();

    // Return the path data and log ID for the frontend to handle generation
    // The actual OpenAI API call will be made from the frontend since we don't
    // store the API key in the backend for security reasons
    return new Response(JSON.stringify({
      success: true,
      message: "Automation run initiated",
      path: pathData,
      log_id: logId,
      started_at: now
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
 * PATCH /api/automation/paths/:id/run - Update generation status
 * Used to update the log entry after frontend completes generation
 */
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const pathId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    if (!data.log_id) {
      return new Response(JSON.stringify({ error: "log_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update the log entry
    const updates = ['completed_at = ?', 'status = ?'];
    const values = [now, data.status || 'completed'];

    if (data.generated_title) {
      updates.push('generated_title = ?');
      values.push(data.generated_title);
    }
    if (data.generated_content) {
      updates.push('generated_content = ?');
      values.push(data.generated_content);
    }
    if (data.generated_excerpt) {
      updates.push('generated_excerpt = ?');
      values.push(data.generated_excerpt);
    }
    if (data.tokens_used !== undefined) {
      updates.push('tokens_used = ?');
      values.push(data.tokens_used);
    }
    if (data.generation_time_ms !== undefined) {
      updates.push('generation_time_ms = ?');
      values.push(data.generation_time_ms);
    }
    if (data.published_post_id) {
      updates.push('published_post_id = ?');
      values.push(data.published_post_id);
      updates.push('published_at = ?');
      values.push(now);
    }
    if (data.error_message) {
      updates.push('error_message = ?');
      values.push(data.error_message);
    }
    if (data.model_used) {
      updates.push('model_used = ?');
      values.push(data.model_used);
    }
    if (data.prompt_used) {
      updates.push('prompt_used = ?');
      values.push(data.prompt_used);
    }

    values.push(data.log_id);

    await env.DB.prepare(`
      UPDATE ai_generation_logs SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();

    // Update API usage stats
    if (data.tokens_used) {
      const today = new Date().toISOString().split('T')[0];
      const isSuccess = data.status === 'completed';

      await env.DB.prepare(`
        INSERT INTO ai_api_usage (id, date, total_tokens, requests_count, successful_requests, failed_requests, updated_at)
        VALUES (?, ?, ?, 1, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          total_tokens = total_tokens + excluded.total_tokens,
          requests_count = requests_count + 1,
          successful_requests = successful_requests + excluded.successful_requests,
          failed_requests = failed_requests + excluded.failed_requests,
          updated_at = excluded.updated_at
      `).bind(
        crypto.randomUUID(),
        today,
        data.tokens_used,
        isSuccess ? 1 : 0,
        isSuccess ? 0 : 1,
        now
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      log_id: data.log_id,
      status: data.status
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
