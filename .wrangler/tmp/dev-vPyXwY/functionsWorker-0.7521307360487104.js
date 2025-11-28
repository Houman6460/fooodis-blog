var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-jfwYHF/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/pages-CGgU9v/functionsWorker-0.7521307360487104.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
async function onRequestPost(context) {
  const { request, env, params } = context;
  const pathId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const path = await env.DB.prepare(
      "SELECT * FROM automation_paths WHERE id = ?"
    ).bind(pathId).first();
    if (!path) {
      return new Response(JSON.stringify({ error: "Automation path not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const pathData = {
      ...path,
      topics: path.topics ? JSON.parse(path.topics) : [],
      languages: path.languages ? JSON.parse(path.languages) : ["en"]
    };
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
      pathData.topics[0] || "",
      pathData.languages[0] || "en",
      now,
      now
    ).run();
    await env.DB.prepare(
      "UPDATE automation_paths SET last_run = ? WHERE id = ?"
    ).bind(now, pathId).run();
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
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestPatch(context) {
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
    const updates = ["completed_at = ?", "status = ?"];
    const values = [now, data.status || "completed"];
    if (data.generated_title) {
      updates.push("generated_title = ?");
      values.push(data.generated_title);
    }
    if (data.generated_content) {
      updates.push("generated_content = ?");
      values.push(data.generated_content);
    }
    if (data.generated_excerpt) {
      updates.push("generated_excerpt = ?");
      values.push(data.generated_excerpt);
    }
    if (data.tokens_used !== void 0) {
      updates.push("tokens_used = ?");
      values.push(data.tokens_used);
    }
    if (data.generation_time_ms !== void 0) {
      updates.push("generation_time_ms = ?");
      values.push(data.generation_time_ms);
    }
    if (data.published_post_id) {
      updates.push("published_post_id = ?");
      values.push(data.published_post_id);
      updates.push("published_at = ?");
      values.push(now);
    }
    if (data.error_message) {
      updates.push("error_message = ?");
      values.push(data.error_message);
    }
    if (data.model_used) {
      updates.push("model_used = ?");
      values.push(data.model_used);
    }
    if (data.prompt_used) {
      updates.push("prompt_used = ?");
      values.push(data.prompt_used);
    }
    values.push(data.log_id);
    await env.DB.prepare(`
      UPDATE ai_generation_logs SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    if (data.tokens_used) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const isSuccess = data.status === "completed";
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
__name(onRequestPatch, "onRequestPatch");
__name2(onRequestPatch, "onRequestPatch");
async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const assistant = await env.DB.prepare(
      "SELECT * FROM ai_assistants WHERE id = ?"
    ).bind(id).first();
    if (!assistant) {
      return new Response(JSON.stringify({ error: "Assistant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      ...assistant,
      is_active: assistant.is_active === 1,
      is_default: assistant.is_default === 1
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
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestPut(context) {
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
    const updates = [];
    const values = [];
    if (data.openai_assistant_id !== void 0) {
      updates.push("openai_assistant_id = ?");
      values.push(data.openai_assistant_id);
    }
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== void 0) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.type !== void 0) {
      updates.push("type = ?");
      values.push(data.type);
    }
    if (data.model !== void 0) {
      updates.push("model = ?");
      values.push(data.model);
    }
    if (data.instructions !== void 0) {
      updates.push("instructions = ?");
      values.push(data.instructions);
    }
    if (data.temperature !== void 0) {
      updates.push("temperature = ?");
      values.push(data.temperature);
    }
    if (data.max_tokens !== void 0) {
      updates.push("max_tokens = ?");
      values.push(data.max_tokens);
    }
    if (data.is_active !== void 0) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }
    if (data.is_default !== void 0) {
      updates.push("is_default = ?");
      values.push(data.is_default ? 1 : 0);
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    if (updates.length === 1) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
      UPDATE ai_assistants SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const assistant = await env.DB.prepare(
      "SELECT * FROM ai_assistants WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({
      success: true,
      assistant: {
        ...assistant,
        is_active: assistant?.is_active === 1,
        is_default: assistant?.is_default === 1
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
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
async function onRequestDelete(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const assistant = await env.DB.prepare(
      "SELECT is_default FROM ai_assistants WHERE id = ?"
    ).bind(id).first();
    if (assistant?.is_default === 1) {
      return new Response(JSON.stringify({ error: "Cannot delete default assistant" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await env.DB.prepare(
      "DELETE FROM ai_assistants WHERE id = ?"
    ).bind(id).run();
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Assistant not found" }), {
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
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
async function onRequestPut2(context) {
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
    const exists = await env.DB.prepare("SELECT id FROM automation_paths WHERE id = ?").bind(id).first();
    if (!exists) {
      return new Response(JSON.stringify({ error: "Path not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const includeImages = data.includeImages !== void 0 ? data.includeImages ? 1 : 0 : data.include_images !== void 0 ? data.include_images ? 1 : 0 : 0;
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
      data.name,
      data.contentType || data.content_type,
      data.assistantId || data.assistant_id,
      data.category,
      data.subcategory,
      JSON.stringify(data.topics || []),
      data.mode,
      data.scheduleType || data.schedule_type,
      data.scheduleTime || data.schedule_time,
      data.promptTemplate || data.prompt_template,
      includeImages,
      data.mediaFolder || data.media_folder,
      JSON.stringify(data.languages || []),
      data.status || "active",
      data.lastRun || data.last_run,
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
__name(onRequestPut2, "onRequestPut2");
__name2(onRequestPut2, "onRequestPut");
async function onRequestDelete2(context) {
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
__name(onRequestDelete2, "onRequestDelete2");
__name2(onRequestDelete2, "onRequestDelete");
async function onRequestGet2(context) {
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
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPut3(context) {
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
    const currentPost = await env.DB.prepare(
      "SELECT * FROM blog_posts WHERE id = ?"
    ).bind(id).first();
    if (!currentPost) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updates = [];
    const values = [];
    if (data.title !== void 0) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.content !== void 0) {
      updates.push("content = ?");
      values.push(data.content);
    }
    if (data.excerpt !== void 0) {
      updates.push("excerpt = ?");
      values.push(data.excerpt);
    }
    if (data.image_url !== void 0 || data.imageUrl !== void 0) {
      updates.push("image_url = ?");
      values.push(data.image_url || data.imageUrl);
    }
    if (data.author !== void 0) {
      updates.push("author = ?");
      values.push(data.author);
    }
    if (data.category !== void 0) {
      updates.push("category = ?");
      values.push(data.category);
    }
    if (data.subcategory !== void 0) {
      updates.push("subcategory = ?");
      values.push(data.subcategory);
    }
    if (data.tags !== void 0) {
      updates.push("tags = ?");
      values.push(JSON.stringify(data.tags || []));
    }
    if (data.published_date !== void 0 || data.publishedDate !== void 0) {
      updates.push("published_date = ?");
      values.push(data.published_date || data.publishedDate);
    }
    if (data.scheduled_date !== void 0 || data.scheduledDate !== void 0) {
      updates.push("scheduled_date = ?");
      values.push(data.scheduled_date || data.scheduledDate);
    }
    if (data.status !== void 0) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.featured !== void 0) {
      updates.push("featured = ?");
      values.push(data.featured ? 1 : 0);
    }
    if (data.likes !== void 0) {
      updates.push("likes = ?");
      values.push(data.likes);
    }
    if (data.views !== void 0) {
      updates.push("views = ?");
      values.push(data.views);
    }
    if (data.slug !== void 0) {
      updates.push("slug = ?");
      values.push(data.slug);
    } else if (data.title !== void 0) {
      updates.push("slug = ?");
      values.push(data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
    updates.push("updated_at = ?");
    values.push(now);
    if (updates.length === 1) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    values.push(id);
    await env.DB.prepare(`
      UPDATE blog_posts SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const updatedPost = await env.DB.prepare(
      "SELECT * FROM blog_posts WHERE id = ?"
    ).bind(id).first();
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
__name(onRequestPut3, "onRequestPut3");
__name2(onRequestPut3, "onRequestPut");
async function onRequestPatch2(context) {
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
    if (data.toggle === "featured") {
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
    if (data.increment === "views") {
      await env.DB.prepare(
        "UPDATE blog_posts SET views = views + 1 WHERE id = ?"
      ).bind(id).run();
      return new Response(JSON.stringify({ success: true, id }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (data.increment === "likes") {
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
__name(onRequestPatch2, "onRequestPatch2");
__name2(onRequestPatch2, "onRequestPatch");
async function onRequestDelete3(context) {
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
__name(onRequestDelete3, "onRequestDelete3");
__name2(onRequestDelete3, "onRequestDelete");
async function onRequestGet3(context) {
  const { env, params } = context;
  const postId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const post = await env.DB.prepare(`
      SELECT p.id, p.title, p.category, p.published_date, p.created_at,
             ps.views, ps.unique_views, 
             ps.shares_facebook, ps.shares_twitter, ps.shares_linkedin, ps.shares_email, ps.shares_total,
             ps.avg_read_time, ps.bounce_rate
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.id = ?
    `).bind(postId).first();
    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const commentsCount = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE post_id = ? AND status = 'approved'"
    ).bind(postId).first();
    let dailyViews = [];
    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
      const { results } = await env.DB.prepare(`
        SELECT DATE(created_at / 1000, 'unixepoch') as date, COUNT(*) as views
        FROM page_views
        WHERE post_id = ? AND created_at >= ?
        GROUP BY date
        ORDER BY date ASC
      `).bind(postId, thirtyDaysAgo).all();
      dailyViews = results || [];
    } catch (e) {
    }
    let referrers = [];
    try {
      const { results } = await env.DB.prepare(`
        SELECT referrer, COUNT(*) as count
        FROM page_views
        WHERE post_id = ?
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `).bind(postId).all();
      referrers = results || [];
    } catch (e) {
    }
    return new Response(JSON.stringify({
      post: {
        id: post.id,
        title: post.title,
        category: post.category,
        published_date: post.published_date
      },
      stats: {
        views: post.views || 0,
        uniqueViews: post.unique_views || 0,
        shares: {
          facebook: post.shares_facebook || 0,
          twitter: post.shares_twitter || 0,
          linkedin: post.shares_linkedin || 0,
          email: post.shares_email || 0,
          total: post.shares_total || 0
        },
        comments: commentsCount?.total || 0,
        avgReadTime: Math.round((post.avg_read_time || 0) / 60),
        // In minutes
        bounceRate: post.bounce_rate || 0
      },
      dailyViews,
      referrers
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
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestPut4(context) {
  const { request, env, params } = context;
  const postId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const existing = await env.DB.prepare(
      "SELECT id FROM post_stats WHERE post_id = ?"
    ).bind(postId).first();
    if (!existing) {
      await env.DB.prepare(`
        INSERT INTO post_stats (id, post_id, views, unique_views, shares_total, avg_read_time, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        `stats_${postId}`,
        postId,
        data.views || 0,
        data.unique_views || 0,
        data.shares_total || 0,
        data.avg_read_time || 0,
        now
      ).run();
    } else {
      const updates = [];
      const values = [];
      if (data.views !== void 0) {
        updates.push("views = ?");
        values.push(data.views);
      }
      if (data.unique_views !== void 0) {
        updates.push("unique_views = ?");
        values.push(data.unique_views);
      }
      if (data.shares_facebook !== void 0) {
        updates.push("shares_facebook = ?");
        values.push(data.shares_facebook);
      }
      if (data.shares_twitter !== void 0) {
        updates.push("shares_twitter = ?");
        values.push(data.shares_twitter);
      }
      if (data.shares_linkedin !== void 0) {
        updates.push("shares_linkedin = ?");
        values.push(data.shares_linkedin);
      }
      if (data.shares_email !== void 0) {
        updates.push("shares_email = ?");
        values.push(data.shares_email);
      }
      if (data.shares_total !== void 0) {
        updates.push("shares_total = ?");
        values.push(data.shares_total);
      }
      if (data.avg_read_time !== void 0) {
        updates.push("avg_read_time = ?");
        values.push(data.avg_read_time);
      }
      if (updates.length > 0) {
        updates.push("updated_at = ?");
        values.push(now);
        values.push(postId);
        await env.DB.prepare(`
          UPDATE post_stats SET ${updates.join(", ")} WHERE post_id = ?
        `).bind(...values).run();
      }
    }
    if (data.views !== void 0) {
      await env.DB.prepare(
        "UPDATE blog_posts SET views = ?, updated_at = ? WHERE id = ?"
      ).bind(data.views, now, postId).run();
    }
    return new Response(JSON.stringify({ success: true, post_id: postId }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut4, "onRequestPut4");
__name2(onRequestPut4, "onRequestPut");
async function onRequestGet4(context) {
  const { env, params, request } = context;
  if (!env.MEDIA_BUCKET) {
    return new Response("R2 bucket not configured", { status: 500 });
  }
  try {
    const path = params.path ? params.path.join("/") : "";
    if (!path) {
      return new Response("File path required", { status: 400 });
    }
    const r2Key = decodeURIComponent(path);
    const object = await env.MEDIA_BUCKET.get(r2Key);
    if (!object) {
      return new Response("File not found", { status: 404 });
    }
    const contentType = object.httpMetadata?.contentType || inferContentType(r2Key);
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("ETag", object.httpEtag);
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Media serve error:", error);
    return new Response(error.message, { status: 500 });
  }
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
__name2(onRequestOptions, "onRequestOptions");
function inferContentType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "pdf": "application/pdf",
    "json": "application/json",
    "txt": "text/plain",
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript"
  };
  return mimeTypes[ext] || "application/octet-stream";
}
__name(inferContentType, "inferContentType");
__name2(inferContentType, "inferContentType");
async function onRequestPost2(context) {
  const { env, params } = context;
  const scheduledPostId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    const scheduledPost = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(scheduledPostId).first();
    if (!scheduledPost) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (scheduledPost.status === "published") {
      return new Response(JSON.stringify({
        error: "Post already published",
        published_post_id: scheduledPost.published_post_id
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "UPDATE scheduled_posts SET status = 'publishing', last_attempt = ?, updated_at = ? WHERE id = ?"
    ).bind(now, now, scheduledPostId).run();
    const blogPostId = crypto.randomUUID();
    try {
      await env.DB.prepare(`
        INSERT INTO blog_posts (
          id, title, content, excerpt, image_url, author, category, subcategory, tags,
          published_date, status, featured, views, likes, comments_count, created_at, updated_at, slug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 0, 0, 0, ?, ?, ?)
      `).bind(
        blogPostId,
        scheduledPost.title,
        scheduledPost.content,
        scheduledPost.excerpt,
        scheduledPost.image_url,
        scheduledPost.author,
        scheduledPost.category,
        scheduledPost.subcategory,
        scheduledPost.tags,
        // Already JSON string
        (/* @__PURE__ */ new Date()).toISOString(),
        scheduledPost.is_featured,
        now,
        now,
        scheduledPost.slug
      ).run();
      await env.DB.prepare(`
        UPDATE scheduled_posts SET 
          status = 'published', 
          published_post_id = ?, 
          updated_at = ? 
        WHERE id = ?
      `).bind(blogPostId, now, scheduledPostId).run();
      await env.DB.prepare(`
        INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
        VALUES (?, ?, 'published', ?, ?)
      `).bind(
        crypto.randomUUID(),
        scheduledPostId,
        JSON.stringify({
          blog_post_id: blogPostId,
          published_at: new Date(now).toISOString(),
          source: scheduledPost.source
        }),
        now
      ).run();
      if (scheduledPost.category && scheduledPost.category !== "Uncategorized") {
        await env.DB.prepare(
          "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
        ).bind(scheduledPost.category).run();
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Post published successfully",
        scheduled_post_id: scheduledPostId,
        blog_post_id: blogPostId,
        title: scheduledPost.title
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (publishError) {
      const retryCount = (scheduledPost.retry_count || 0) + 1;
      const newStatus = retryCount >= (scheduledPost.max_retries || 3) ? "failed" : "pending";
      await env.DB.prepare(`
        UPDATE scheduled_posts SET 
          status = ?, 
          retry_count = ?, 
          error_message = ?, 
          last_attempt = ?,
          updated_at = ? 
        WHERE id = ?
      `).bind(newStatus, retryCount, publishError.message, now, now, scheduledPostId).run();
      await env.DB.prepare(`
        INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
        VALUES (?, ?, 'failed', ?, ?)
      `).bind(
        crypto.randomUUID(),
        scheduledPostId,
        JSON.stringify({
          error: publishError.message,
          retry_count: retryCount
        }),
        now
      ).run();
      throw publishError;
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
var ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv"
];
var MAX_SIZE = 10 * 1024 * 1024;
async function onRequestGet5(context) {
  const { env, params } = context;
  const ticketId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const ticket = await env.DB.prepare(
      "SELECT id FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results: attachments } = await env.DB.prepare(`
      SELECT * FROM ticket_attachments WHERE ticket_id = ? ORDER BY created_at DESC
    `).bind(ticket.id).all();
    return new Response(JSON.stringify({
      success: true,
      data: { attachments }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet5, "onRequestGet5");
__name2(onRequestGet5, "onRequestGet");
async function onRequestPost3(context) {
  const { request, env, params } = context;
  const ticketId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ success: false, error: "R2 bucket not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ success: false, error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("attachment");
    const messageId = formData.get("message_id");
    const uploadedBy = formData.get("uploaded_by") || "customer";
    const uploadedById = formData.get("uploaded_by_id");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ success: false, error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: "File type not allowed",
        allowed: ALLOWED_TYPES
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({
        success: false,
        error: "File too large. Maximum size is 10MB"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const attachmentId = `att_${crypto.randomUUID().split("-")[0]}`;
    const ext = file.name.split(".").pop() || "bin";
    const r2Key = `tickets/${ticket.ticket_number}/${attachmentId}.${ext}`;
    const fileBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type
      },
      customMetadata: {
        originalFilename: file.name,
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    const r2Url = `/api/media/serve/${encodeURIComponent(r2Key)}`;
    const attachment = {
      id: attachmentId,
      ticket_id: ticket.id,
      message_id: messageId || null,
      filename: `${attachmentId}.${ext}`,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      r2_key: r2Key,
      r2_url: r2Url,
      uploaded_by: uploadedById,
      uploaded_by_type: uploadedBy,
      created_at: now
    };
    await env.DB.prepare(`
      INSERT INTO ticket_attachments (
        id, ticket_id, message_id, filename, original_filename, mime_type,
        file_size, r2_key, r2_url, uploaded_by, uploaded_by_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      attachment.id,
      attachment.ticket_id,
      attachment.message_id,
      attachment.filename,
      attachment.original_filename,
      attachment.mime_type,
      attachment.file_size,
      attachment.r2_key,
      attachment.r2_url,
      attachment.uploaded_by,
      attachment.uploaded_by_type,
      attachment.created_at
    ).run();
    await env.DB.prepare(
      "UPDATE support_tickets SET updated_at = ? WHERE id = ?"
    ).bind(now, ticket.id).run();
    return new Response(JSON.stringify({
      success: true,
      data: { attachment }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestGet6(context) {
  const { env, params } = context;
  const ticketId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const ticket = await env.DB.prepare(
      "SELECT id FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results: messages } = await env.DB.prepare(`
      SELECT m.*, 
        (SELECT GROUP_CONCAT(a.id || '|' || a.filename || '|' || a.r2_url)
         FROM ticket_attachments a WHERE a.message_id = m.id) as attachment_list
      FROM support_messages m
      WHERE m.ticket_id = ?
      ORDER BY m.created_at ASC
    `).bind(ticket.id).all();
    const formattedMessages = messages.map((msg) => {
      const attachments = [];
      if (msg.attachment_list) {
        msg.attachment_list.split(",").forEach((att) => {
          const [id, filename, url] = att.split("|");
          if (id && filename) {
            attachments.push({ id, filename, url });
          }
        });
      }
      delete msg.attachment_list;
      return { ...msg, attachments };
    });
    return new Response(JSON.stringify({
      success: true,
      data: { messages: formattedMessages }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet6, "onRequestGet6");
__name2(onRequestGet6, "onRequestGet");
async function onRequestPost4(context) {
  const { request, env, params } = context;
  const ticketId = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.content) {
      return new Response(JSON.stringify({ success: false, error: "Message content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const messageId = `msg_${crypto.randomUUID().split("-")[0]}`;
    const authorType = data.author_type || (data.author_email === ticket.customer_email ? "customer" : "admin");
    const message = {
      id: messageId,
      ticket_id: ticket.id,
      author_type: authorType,
      author_id: data.author_id || null,
      author_name: data.author_name || data.author || "Support Team",
      author_email: data.author_email || null,
      content: data.content,
      is_internal: data.is_internal ? 1 : 0,
      created_at: now
    };
    await env.DB.prepare(`
      INSERT INTO support_messages (
        id, ticket_id, author_type, author_id, author_name, author_email,
        content, is_internal, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      message.id,
      message.ticket_id,
      message.author_type,
      message.author_id,
      message.author_name,
      message.author_email,
      message.content,
      message.is_internal,
      message.created_at
    ).run();
    const updates = ["message_count = message_count + 1", "updated_at = ?"];
    const values = [now];
    if (authorType === "admin" && !ticket.first_response_at) {
      updates.push("first_response_at = ?");
      values.push(now);
    }
    if (data.update_status) {
      updates.push("status = ?");
      values.push(data.update_status);
      if (data.update_status === "resolved") {
        updates.push("resolved_at = ?");
        values.push(now);
      }
      if (data.update_status === "closed") {
        updates.push("closed_at = ?");
        values.push(now);
      }
    } else if (authorType === "admin" && ticket.status === "open") {
      updates.push("status = ?");
      values.push("in-progress");
    }
    values.push(ticket.id);
    await env.DB.prepare(`
      UPDATE support_tickets SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${ticket.ticket_number}`);
      } catch (e) {
      }
    }
    return new Response(JSON.stringify({
      success: true,
      data: { message }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestGet7(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("active_only") !== "false";
  const type = url.searchParams.get("type");
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM ai_assistants";
    const conditions = [];
    const params = [];
    if (activeOnly) {
      conditions.push("is_active = 1");
    }
    if (type) {
      conditions.push("type = ?");
      params.push(type);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY is_default DESC, name ASC";
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const assistants = results.map((a) => ({
      ...a,
      is_active: a.is_active === 1,
      is_default: a.is_default === 1,
      code_interpreter: a.code_interpreter === 1,
      retrieval: a.retrieval === 1,
      function_calling: a.function_calling === 1
    }));
    return new Response(JSON.stringify(assistants), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet7, "onRequestGet7");
__name2(onRequestGet7, "onRequestGet");
async function onRequestPost5(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Assistant name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = `asst_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const assistant = {
      id,
      openai_assistant_id: data.openai_assistant_id || data.openaiAssistantId || "",
      name: data.name,
      description: data.description || "",
      type: data.type || "custom",
      model: data.model || "gpt-4",
      instructions: data.instructions || "",
      temperature: data.temperature ?? 0.7,
      max_tokens: data.max_tokens || data.maxTokens || 2e3,
      top_p: data.top_p || data.topP || 1,
      code_interpreter: data.code_interpreter ? 1 : 0,
      retrieval: data.retrieval ? 1 : 0,
      function_calling: data.function_calling ? 1 : 0,
      is_active: data.is_active !== false ? 1 : 0,
      is_default: data.is_default ? 1 : 0,
      usage_count: 0,
      last_used: null,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO ai_assistants (
        id, openai_assistant_id, name, description, type, model, instructions,
        temperature, max_tokens, top_p, code_interpreter, retrieval, function_calling,
        is_active, is_default, usage_count, last_used, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      assistant.id,
      assistant.openai_assistant_id,
      assistant.name,
      assistant.description,
      assistant.type,
      assistant.model,
      assistant.instructions,
      assistant.temperature,
      assistant.max_tokens,
      assistant.top_p,
      assistant.code_interpreter,
      assistant.retrieval,
      assistant.function_calling,
      assistant.is_active,
      assistant.is_default,
      assistant.usage_count,
      assistant.last_used,
      assistant.created_at,
      assistant.updated_at
    ).run();
    return new Response(JSON.stringify({
      success: true,
      assistant: {
        ...assistant,
        is_active: assistant.is_active === 1,
        is_default: assistant.is_default === 1
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
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
var KV_CONFIG_KEY = "ai_config";
var KV_CACHE_TTL = 3600;
async function onRequestGet8(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (env.KV) {
    try {
      const cached = await env.KV.get(KV_CONFIG_KEY, "json");
      if (cached) {
        if (key) {
          const setting = cached.find((c) => c.key === key);
          return new Response(JSON.stringify(setting || null), {
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
          });
        }
        return new Response(JSON.stringify(cached), {
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
      }
    } catch (e) {
      console.error("KV read error:", e);
    }
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM ai_config";
    if (key) {
      query += " WHERE key = ?";
    }
    query += " ORDER BY key ASC";
    const stmt = env.DB.prepare(query);
    const { results } = key ? await stmt.bind(key).all() : await stmt.all();
    const config = results.map((c) => ({
      ...c,
      value: parseConfigValue(c.value, c.type),
      is_secret: c.is_secret === 1
    }));
    if (env.KV && !key) {
      try {
        await env.KV.put(KV_CONFIG_KEY, JSON.stringify(config), {
          expirationTtl: KV_CACHE_TTL
        });
      } catch (e) {
        console.error("KV write error:", e);
      }
    }
    if (key) {
      return new Response(JSON.stringify(config[0] || null), {
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    }
    return new Response(JSON.stringify(config), {
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet8, "onRequestGet8");
__name2(onRequestGet8, "onRequestGet");
async function onRequestPut5(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const updates = [];
    if (data.key && data.value !== void 0) {
      updates.push({ key: data.key, value: data.value, type: data.type, is_secret: data.is_secret });
    } else if (data.config && Array.isArray(data.config)) {
      updates.push(...data.config);
    } else {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    for (const setting of updates) {
      if (!setting.key) continue;
      let type = setting.type;
      if (!type) {
        if (typeof setting.value === "boolean") type = "boolean";
        else if (typeof setting.value === "number") type = "number";
        else if (typeof setting.value === "object") type = "json";
        else type = "string";
      }
      const valueStr = type === "json" ? JSON.stringify(setting.value) : String(setting.value);
      await env.DB.prepare(`
        INSERT INTO ai_config (key, value, type, is_secret, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          is_secret = excluded.is_secret,
          updated_at = excluded.updated_at
      `).bind(
        setting.key,
        valueStr,
        type,
        setting.is_secret ? 1 : 0,
        now
      ).run();
    }
    if (env.KV) {
      try {
        await env.KV.delete(KV_CONFIG_KEY);
      } catch (e) {
        console.error("KV delete error:", e);
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut5, "onRequestPut5");
__name2(onRequestPut5, "onRequestPut");
async function onRequestPost6(context) {
  return onRequestPut5(context);
}
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
function parseConfigValue(value, type) {
  switch (type) {
    case "boolean":
      return value === "true" || value === "1" || value === true;
    case "number":
      return Number(value);
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}
__name(parseConfigValue, "parseConfigValue");
__name2(parseConfigValue, "parseConfigValue");
async function onRequestGet9(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pathId = url.searchParams.get("path_id");
  const status = url.searchParams.get("status");
  const fromDate = url.searchParams.get("from_date");
  const toDate = url.searchParams.get("to_date");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM ai_generation_logs";
    let countQuery = "SELECT COUNT(*) as total FROM ai_generation_logs";
    const conditions = [];
    const params = [];
    if (pathId) {
      conditions.push("automation_path_id = ?");
      params.push(pathId);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (fromDate) {
      conditions.push("created_at >= ?");
      params.push(new Date(fromDate).getTime());
    }
    if (toDate) {
      conditions.push("created_at <= ?");
      params.push(new Date(toDate).getTime());
    }
    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }
    query += " ORDER BY created_at DESC";
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
    return new Response(JSON.stringify({
      logs: results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
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
__name(onRequestGet9, "onRequestGet9");
__name2(onRequestGet9, "onRequestGet");
async function onRequestPost7(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const now = Date.now();
    const log = {
      id,
      automation_path_id: data.automation_path_id || data.pathId,
      path_name: data.path_name || data.pathName,
      status: data.status || "pending",
      prompt_used: data.prompt_used || data.prompt,
      model_used: data.model_used || data.model || "gpt-4",
      assistant_id: data.assistant_id || data.assistantId,
      content_type: data.content_type || data.contentType,
      category: data.category,
      topic: data.topic,
      language: data.language || "en",
      generated_title: data.generated_title || data.title,
      generated_content: data.generated_content || data.content,
      generated_excerpt: data.generated_excerpt || data.excerpt,
      tokens_used: data.tokens_used || data.tokensUsed || 0,
      generation_time_ms: data.generation_time_ms || data.generationTime,
      published_post_id: data.published_post_id || data.postId,
      published_at: data.published_at,
      error_message: data.error_message || data.error,
      error_code: data.error_code,
      retry_count: data.retry_count || 0,
      started_at: data.started_at || now,
      completed_at: data.completed_at,
      created_at: now
    };
    await env.DB.prepare(`
      INSERT INTO ai_generation_logs (
        id, automation_path_id, path_name, status, prompt_used, model_used,
        assistant_id, content_type, category, topic, language,
        generated_title, generated_content, generated_excerpt,
        tokens_used, generation_time_ms, published_post_id, published_at,
        error_message, error_code, retry_count, started_at, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      log.id,
      log.automation_path_id,
      log.path_name,
      log.status,
      log.prompt_used,
      log.model_used,
      log.assistant_id,
      log.content_type,
      log.category,
      log.topic,
      log.language,
      log.generated_title,
      log.generated_content,
      log.generated_excerpt,
      log.tokens_used,
      log.generation_time_ms,
      log.published_post_id,
      log.published_at,
      log.error_message,
      log.error_code,
      log.retry_count,
      log.started_at,
      log.completed_at,
      log.created_at
    ).run();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await env.DB.prepare(`
      INSERT INTO ai_api_usage (id, date, prompt_tokens, completion_tokens, total_tokens, requests_count, successful_requests, failed_requests, updated_at)
      VALUES (?, ?, 0, 0, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        total_tokens = total_tokens + excluded.total_tokens,
        requests_count = requests_count + 1,
        successful_requests = successful_requests + excluded.successful_requests,
        failed_requests = failed_requests + excluded.failed_requests,
        updated_at = excluded.updated_at
    `).bind(
      crypto.randomUUID(),
      today,
      log.tokens_used,
      log.status === "completed" ? 1 : 0,
      log.status === "failed" ? 1 : 0,
      now
    ).run();
    return new Response(JSON.stringify({ success: true, log }), {
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
__name(onRequestPost7, "onRequestPost7");
__name2(onRequestPost7, "onRequestPost");
async function onRequestGet10(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const contentType = url.searchParams.get("content_type");
  const includeStats = url.searchParams.get("include_stats") === "true";
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
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    let paths = results.map((path) => ({
      ...path,
      topics: path.topics ? JSON.parse(path.topics) : [],
      languages: path.languages ? JSON.parse(path.languages) : [],
      include_images: !!path.include_images
    }));
    if (includeStats && paths.length > 0) {
      const pathIds = paths.map((p) => p.id);
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
          success_rate: statsResult?.total_generations > 0 ? (statsResult.successful / statsResult.total_generations * 100).toFixed(1) : 0
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
__name(onRequestGet10, "onRequestGet10");
__name2(onRequestGet10, "onRequestGet");
async function onRequestPost8(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
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
      content_type: data.contentType || data.content_type || "General Blog Post",
      assistant_id: data.assistantId || data.assistant_id,
      category: data.category,
      subcategory: data.subcategory,
      topics: JSON.stringify(data.topics || []),
      mode: data.mode || "schedule",
      schedule_type: data.scheduleType || data.schedule_type,
      schedule_time: data.scheduleTime || data.schedule_time,
      prompt_template: data.promptTemplate || data.prompt_template,
      include_images: data.includeImages ? 1 : 0,
      media_folder: data.mediaFolder || data.media_folder,
      languages: JSON.stringify(data.languages || ["en"]),
      created_at: now,
      last_run: null,
      status: "active"
    };
    await env.DB.prepare(`
      INSERT INTO automation_paths (
        id, name, content_type, assistant_id, category, subcategory,
        topics, mode, schedule_type, schedule_time, prompt_template,
        include_images, media_folder, languages, created_at, last_run, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      path.id,
      path.name,
      path.content_type,
      path.assistant_id,
      path.category,
      path.subcategory,
      path.topics,
      path.mode,
      path.schedule_type,
      path.schedule_time,
      path.prompt_template,
      path.include_images,
      path.media_folder,
      path.languages,
      path.created_at,
      path.last_run,
      path.status
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
__name(onRequestPost8, "onRequestPost8");
__name2(onRequestPost8, "onRequestPost");
async function onRequestGet11(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const defaultsOnly = url.searchParams.get("defaults_only") === "true";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM prompts_library";
    const conditions = [];
    const params = [];
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (defaultsOnly) {
      conditions.push("is_default = 1");
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY is_default DESC, usage_count DESC, name ASC";
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const prompts = results.map((p) => ({
      ...p,
      variables: p.variables ? JSON.parse(p.variables) : [],
      is_default: p.is_default === 1,
      is_public: p.is_public === 1
    }));
    return new Response(JSON.stringify(prompts), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet11, "onRequestGet11");
__name2(onRequestGet11, "onRequestGet");
async function onRequestPost9(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name || !data.prompt_template) {
      return new Response(JSON.stringify({ error: "Name and prompt_template are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = `prompt_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const prompt = {
      id,
      name: data.name,
      description: data.description || "",
      category: data.category || "general",
      prompt_template: data.prompt_template,
      system_message: data.system_message || "",
      variables: JSON.stringify(data.variables || []),
      example_output: data.example_output || "",
      is_default: data.is_default ? 1 : 0,
      is_public: data.is_public !== false ? 1 : 0,
      usage_count: 0,
      rating: 0,
      created_by: data.created_by || "Admin",
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO prompts_library (
        id, name, description, category, prompt_template, system_message,
        variables, example_output, is_default, is_public, usage_count,
        rating, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      prompt.id,
      prompt.name,
      prompt.description,
      prompt.category,
      prompt.prompt_template,
      prompt.system_message,
      prompt.variables,
      prompt.example_output,
      prompt.is_default,
      prompt.is_public,
      prompt.usage_count,
      prompt.rating,
      prompt.created_by,
      prompt.created_at,
      prompt.updated_at
    ).run();
    return new Response(JSON.stringify({
      success: true,
      prompt: {
        ...prompt,
        variables: JSON.parse(prompt.variables),
        is_default: prompt.is_default === 1,
        is_public: prompt.is_public === 1
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
__name(onRequestPost9, "onRequestPost9");
__name2(onRequestPost9, "onRequestPost");
async function onRequestGet12(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "30";
  const pathId = url.searchParams.get("path_id");
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    const periodMs = parseInt(period) * 24 * 60 * 60 * 1e3;
    const fromDate = now - periodMs;
    let logsQuery = `
      SELECT 
        COUNT(*) as total_generations,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(tokens_used) as total_tokens,
        AVG(generation_time_ms) as avg_generation_time
      FROM ai_generation_logs
      WHERE created_at >= ?
    `;
    const logsParams = [fromDate];
    if (pathId) {
      logsQuery += " AND automation_path_id = ?";
      logsParams.push(pathId);
    }
    const logsStmt = env.DB.prepare(logsQuery);
    const logsStats = await logsStmt.bind(...logsParams).first();
    const dailyQuery = `
      SELECT 
        date,
        requests_count,
        successful_requests,
        failed_requests,
        total_tokens,
        estimated_cost_cents
      FROM ai_api_usage
      WHERE date >= date(?, 'unixepoch', 'localtime')
      ORDER BY date DESC
      LIMIT ?
    `;
    const { results: dailyStats } = await env.DB.prepare(dailyQuery).bind(Math.floor(fromDate / 1e3), parseInt(period)).all();
    const pathsQuery = `
      SELECT 
        automation_path_id,
        path_name,
        COUNT(*) as generation_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as success_count,
        SUM(tokens_used) as tokens_used
      FROM ai_generation_logs
      WHERE created_at >= ?
      GROUP BY automation_path_id
      ORDER BY generation_count DESC
      LIMIT 10
    `;
    const { results: topPaths } = await env.DB.prepare(pathsQuery).bind(fromDate).all();
    const recentQuery = `
      SELECT id, path_name, status, generated_title, created_at, generation_time_ms
      FROM ai_generation_logs
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const { results: recentActivity } = await env.DB.prepare(recentQuery).all();
    const activePathsResult = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM automation_paths WHERE status = 'active'"
    ).first();
    const successRate = logsStats?.total_generations > 0 ? (logsStats.successful / logsStats.total_generations * 100).toFixed(1) : 0;
    return new Response(JSON.stringify({
      summary: {
        total_generations: logsStats?.total_generations || 0,
        successful: logsStats?.successful || 0,
        failed: logsStats?.failed || 0,
        success_rate: parseFloat(successRate),
        total_tokens: logsStats?.total_tokens || 0,
        avg_generation_time_ms: Math.round(logsStats?.avg_generation_time || 0),
        active_paths: activePathsResult?.count || 0,
        period_days: parseInt(period)
      },
      daily: dailyStats,
      top_paths: topPaths,
      recent_activity: recentActivity
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
__name(onRequestGet12, "onRequestGet12");
__name2(onRequestGet12, "onRequestGet");
async function onRequestGet13(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");
  const featured = url.searchParams.get("featured");
  const sortField = url.searchParams.get("sort") || "created_at";
  const sortOrder = url.searchParams.get("order") || "desc";
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM blog_posts";
    let countQuery = "SELECT COUNT(*) as total FROM blog_posts";
    const conditions = [];
    const params = [];
    if (search) {
      conditions.push("(title LIKE ? OR content LIKE ? OR excerpt LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (featured !== null && featured !== void 0) {
      const featuredValue = featured === "true" || featured === "1" ? 1 : 0;
      conditions.push("featured = ?");
      params.push(featuredValue);
    }
    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }
    const allowedSortFields = ["created_at", "updated_at", "title", "published_date", "category", "status"];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : "created_at";
    const safeSortOrder = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
    query += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
    const posts = results.map((post) => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      featured: post.featured === 1 || post.featured === true
    }));
    return new Response(JSON.stringify({
      posts,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: offset + posts.length < (countResult?.total || 0)
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
__name(onRequestGet13, "onRequestGet13");
__name2(onRequestGet13, "onRequestGet");
async function onRequestPost10(context) {
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
      content: data.content || "",
      excerpt: data.excerpt || "",
      image_url: data.image_url || data.imageUrl || "",
      author: data.author || "Admin",
      category: data.category || "Uncategorized",
      subcategory: data.subcategory || null,
      tags: JSON.stringify(data.tags || []),
      published_date: data.published_date || data.publishedDate || (/* @__PURE__ */ new Date()).toISOString(),
      scheduled_date: data.scheduled_date || data.scheduledDate || null,
      status: data.status || "draft",
      featured: data.featured ? 1 : 0,
      views: 0,
      likes: data.likes || 0,
      comments_count: data.comments_count || data.commentsCount || 0,
      created_at: now,
      updated_at: now,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    };
    await env.DB.prepare(`
      INSERT INTO blog_posts (
        id, title, content, excerpt, image_url, author, category, subcategory, tags,
        published_date, scheduled_date, status, featured, views, likes, comments_count, 
        created_at, updated_at, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id,
      post.title,
      post.content,
      post.excerpt,
      post.image_url,
      post.author,
      post.category,
      post.subcategory,
      post.tags,
      post.published_date,
      post.scheduled_date,
      post.status,
      post.featured,
      post.views,
      post.likes,
      post.comments_count,
      post.created_at,
      post.updated_at,
      post.slug
    ).run();
    if (post.category && post.category !== "Uncategorized") {
      await env.DB.prepare(
        "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
      ).bind(post.category).run();
    }
    return new Response(JSON.stringify({
      success: true,
      post: { ...post, tags: JSON.parse(post.tags), featured: post.featured === 1 }
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
__name(onRequestPost10, "onRequestPost10");
__name2(onRequestPost10, "onRequestPost");
async function onRequestDelete4(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");
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
    const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      return new Response(JSON.stringify({ error: "No valid post IDs provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
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
      errors: errors.length > 0 ? errors : void 0
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
__name(onRequestDelete4, "onRequestDelete4");
__name2(onRequestDelete4, "onRequestDelete");
async function onRequestGet14(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "30d";
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let fromDate;
    const toDate = /* @__PURE__ */ new Date();
    if (startDate && endDate) {
      fromDate = new Date(startDate);
    } else {
      const days = parseInt(period) || 30;
      fromDate = /* @__PURE__ */ new Date();
      fromDate.setDate(fromDate.getDate() - days);
    }
    const fromTimestamp = fromDate.getTime();
    const toTimestamp = toDate.getTime();
    const { results: dailyStats } = await env.DB.prepare(`
      SELECT * FROM chatbot_analytics
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `).bind(
      fromDate.toISOString().split("T")[0],
      toDate.toISOString().split("T")[0]
    ).all();
    const convStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_conversations,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_conversations,
        SUM(message_count) as total_messages,
        AVG(message_count) as avg_messages_per_conversation,
        SUM(CASE WHEN rating IS NOT NULL THEN 1 ELSE 0 END) as rated_conversations,
        SUM(CASE WHEN rating IS NOT NULL THEN rating ELSE 0 END) as rating_sum,
        AVG(rating) as avg_rating
      FROM chatbot_conversations
      WHERE created_at >= ?
    `).bind(fromTimestamp, fromTimestamp).first();
    const userStats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as new_users,
        SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN status = 'customer' THEN 1 ELSE 0 END) as customers
      FROM chatbot_users
    `).bind(fromTimestamp).first();
    const { results: languages } = await env.DB.prepare(`
      SELECT language, COUNT(*) as count
      FROM chatbot_conversations
      WHERE created_at >= ?
      GROUP BY language
      ORDER BY count DESC
    `).bind(fromTimestamp).all();
    const { results: assistantUsage } = await env.DB.prepare(`
      SELECT 
        assistant_id,
        (SELECT name FROM ai_assistants WHERE id = assistant_id OR openai_assistant_id = assistant_id LIMIT 1) as assistant_name,
        COUNT(*) as usage_count
      FROM chatbot_conversations
      WHERE assistant_id IS NOT NULL AND created_at >= ?
      GROUP BY assistant_id
      ORDER BY usage_count DESC
      LIMIT 5
    `).bind(fromTimestamp).all();
    const totalConversations = convStats?.total_conversations || 0;
    const totalMessages = convStats?.total_messages || 0;
    const avgMessagesPerConversation = convStats?.avg_messages_per_conversation || 0;
    const avgRating = convStats?.avg_rating || 0;
    const ratedConversations = convStats?.rated_conversations || 0;
    const satisfactionRate = ratedConversations > 0 ? (convStats?.rating_sum / ratedConversations / 5 * 100).toFixed(1) : 0;
    const aggregatedDailyStats = dailyStats.map((day) => ({
      date: day.date,
      conversations: day.total_conversations || 0,
      messages: day.total_messages || 0,
      tokens: day.total_tokens_used || 0,
      leads: day.leads_captured || 0,
      avgResponseTime: day.avg_response_time_ms || 0,
      avgRating: day.avg_rating || 0
    }));
    return new Response(JSON.stringify({
      success: true,
      period,
      dateRange: {
        from: fromDate.toISOString().split("T")[0],
        to: toDate.toISOString().split("T")[0]
      },
      summary: {
        totalConversations,
        newConversations: convStats?.new_conversations || 0,
        totalMessages,
        avgMessagesPerConversation: parseFloat(avgMessagesPerConversation.toFixed(2)),
        avgRating: parseFloat(avgRating.toFixed(2)),
        satisfactionRate: parseFloat(satisfactionRate),
        totalUsers: userStats?.total_users || 0,
        newUsers: userStats?.new_users || 0,
        totalLeads: userStats?.leads || 0,
        totalCustomers: userStats?.customers || 0
      },
      dailyStats: aggregatedDailyStats,
      languages: languages.map((l) => ({
        language: l.language,
        count: l.count,
        percentage: totalConversations > 0 ? (l.count / totalConversations * 100).toFixed(1) : 0
      })),
      topAssistants: assistantUsage.map((a) => ({
        id: a.assistant_id,
        name: a.assistant_name || "Unknown",
        usageCount: a.usage_count
      }))
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet14, "onRequestGet14");
__name2(onRequestGet14, "onRequestGet");
async function onRequestPost11(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const now = Date.now();
    const updates = [];
    const values = [];
    if (data.type === "conversation") {
      updates.push("total_conversations = total_conversations + 1");
      if (data.isNew) updates.push("new_conversations = new_conversations + 1");
      if (data.isReturning) updates.push("returning_users = returning_users + 1");
    }
    if (data.type === "message") {
      updates.push("total_messages = total_messages + 1");
      if (data.tokens) {
        updates.push("total_tokens_used = total_tokens_used + ?");
        values.push(data.tokens);
      }
      if (data.responseTime) {
        updates.push("avg_response_time_ms = (avg_response_time_ms * total_messages + ?) / (total_messages + 1)");
        values.push(data.responseTime);
      }
    }
    if (data.type === "lead") {
      updates.push("leads_captured = leads_captured + 1");
    }
    if (data.type === "rating" && data.rating) {
      updates.push("ratings_count = ratings_count + 1");
      updates.push("ratings_sum = ratings_sum + ?");
      updates.push("avg_rating = CAST(ratings_sum + ? AS REAL) / (ratings_count + 1)");
      values.push(data.rating, data.rating);
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No updates needed" }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    values.push(today, now, now);
    updates.push("updated_at = ?");
    const query = `
      INSERT INTO chatbot_analytics (id, date, ${updates.map(() => "").join("")} created_at, updated_at)
      VALUES (?, ?, ${values.slice(0, -2).map(() => "0").join(", ")}, ?, ?)
      ON CONFLICT(date) DO UPDATE SET ${updates.join(", ")}
    `;
    await env.DB.prepare(`
      INSERT INTO chatbot_analytics (id, date, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET updated_at = ?
    `).bind(`analytics_${today}`, today, now, now, now).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost11, "onRequestPost11");
__name2(onRequestPost11, "onRequestPost");
async function onRequestGet15(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const userId = url.searchParams.get("user_id");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM chatbot_messages WHERE conversation_id = c.id) as actual_message_count,
        (SELECT content FROM chatbot_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chatbot_conversations c
    `;
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("c.status = ?");
      params.push(status);
    }
    if (userId) {
      conditions.push("c.user_id = ?");
      params.push(userId);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY c.last_message_at DESC, c.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const { results: conversations } = await env.DB.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM chatbot_conversations c";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 ? await countStmt.bind(...countParams).first() : await countStmt.first();
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      conversationId: conv.id,
      visitorId: conv.visitor_id,
      userId: conv.user_id,
      threadId: conv.thread_id,
      userName: conv.user_name || "Anonymous User",
      userEmail: conv.user_email,
      userPhone: conv.user_phone,
      restaurantName: conv.restaurant_name,
      userType: conv.user_type,
      language: conv.language,
      languageFlag: conv.language_flag || (conv.language === "sv" ? "\u{1F1F8}\u{1F1EA}" : "\u{1F1FA}\u{1F1F8}"),
      displayFlag: conv.language_flag || (conv.language === "sv" ? "\u{1F1F8}\u{1F1EA}" : "\u{1F1FA}\u{1F1F8}"),
      status: conv.status,
      userRegistered: conv.is_registered === 1,
      rating: conv.rating,
      ratingFeedback: conv.rating_feedback,
      messageCount: conv.actual_message_count || conv.message_count || 0,
      lastMessage: conv.last_message,
      firstMessageAt: conv.first_message_at,
      lastMessageAt: conv.last_message_at,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at
    }));
    return new Response(JSON.stringify({
      success: true,
      conversations: formattedConversations,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet15, "onRequestGet15");
__name2(onRequestGet15, "onRequestGet");
async function onRequestPost12(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    if (data.conversationId || data.id) {
      const convId2 = data.conversationId || data.id;
      const updates = [];
      const values = [];
      if (data.userName !== void 0) {
        updates.push("user_name = ?");
        values.push(data.userName);
      }
      if (data.userEmail !== void 0) {
        updates.push("user_email = ?");
        values.push(data.userEmail);
      }
      if (data.userPhone !== void 0) {
        updates.push("user_phone = ?");
        values.push(data.userPhone);
      }
      if (data.restaurantName !== void 0) {
        updates.push("restaurant_name = ?");
        values.push(data.restaurantName);
      }
      if (data.userType !== void 0) {
        updates.push("user_type = ?");
        values.push(data.userType);
      }
      if (data.language !== void 0) {
        updates.push("language = ?");
        values.push(data.language);
      }
      if (data.languageFlag !== void 0) {
        updates.push("language_flag = ?");
        values.push(data.languageFlag);
      }
      if (data.status !== void 0) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.rating !== void 0) {
        updates.push("rating = ?");
        values.push(data.rating);
      }
      if (data.ratingFeedback !== void 0) {
        updates.push("rating_feedback = ?");
        values.push(data.ratingFeedback);
      }
      if (data.isRegistered !== void 0 || data.userRegistered !== void 0) {
        updates.push("is_registered = ?");
        values.push(data.isRegistered || data.userRegistered ? 1 : 0);
      }
      if (data.userId !== void 0) {
        updates.push("user_id = ?");
        values.push(data.userId);
      }
      if (updates.length > 0) {
        updates.push("updated_at = ?");
        values.push(now);
        values.push(convId2);
        await env.DB.prepare(`
          UPDATE chatbot_conversations SET ${updates.join(", ")} WHERE id = ?
        `).bind(...values).run();
      }
      const updated = await env.DB.prepare(
        "SELECT * FROM chatbot_conversations WHERE id = ?"
      ).bind(convId2).first();
      return new Response(JSON.stringify({
        success: true,
        conversation: updated
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const convId = data.id || `conv_${crypto.randomUUID().split("-")[0]}`;
    await env.DB.prepare(`
      INSERT INTO chatbot_conversations (
        id, visitor_id, user_id, thread_id, assistant_id, user_name, user_email,
        user_phone, restaurant_name, user_type, language, language_flag, status,
        is_registered, first_message_at, last_message_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      convId,
      data.visitorId || null,
      data.userId || null,
      data.threadId || null,
      data.assistantId || null,
      data.userName || null,
      data.userEmail || null,
      data.userPhone || null,
      data.restaurantName || null,
      data.userType || null,
      data.language || "en",
      data.languageFlag || "\u{1F1FA}\u{1F1F8}",
      data.status || "active",
      data.isRegistered || data.userRegistered ? 1 : 0,
      now,
      now,
      now,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      conversation: { id: convId }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost12, "onRequestPost12");
__name2(onRequestPost12, "onRequestPost");
async function onRequestDelete5(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Conversation ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "DELETE FROM chatbot_conversations WHERE id = ?"
    ).bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete5, "onRequestDelete5");
__name2(onRequestDelete5, "onRequestDelete");
async function onRequestGet16(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversation_id");
  const limit = parseInt(url.searchParams.get("limit")) || 100;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!conversationId) {
    return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { results: messages } = await env.DB.prepare(`
      SELECT * FROM chatbot_messages 
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `).bind(conversationId, limit, offset).all();
    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM chatbot_messages WHERE conversation_id = ?"
    ).bind(conversationId).first();
    const formattedMessages = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      role: m.role,
      content: m.content,
      assistantId: m.assistant_id,
      assistantName: m.assistant_name,
      tokensUsed: m.tokens_used,
      responseTimeMs: m.response_time_ms,
      metadata: m.metadata ? JSON.parse(m.metadata) : {},
      createdAt: m.created_at,
      timestamp: m.created_at
    }));
    return new Response(JSON.stringify({
      success: true,
      messages: formattedMessages,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet16, "onRequestGet16");
__name2(onRequestGet16, "onRequestGet");
async function onRequestPost13(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.conversation_id && !data.conversationId) {
      return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!data.content && !data.message) {
      return new Response(JSON.stringify({ success: false, error: "content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const msgId = `msg_${crypto.randomUUID().split("-")[0]}`;
    const conversationId = data.conversation_id || data.conversationId;
    await env.DB.prepare(`
      INSERT INTO chatbot_messages (
        id, conversation_id, role, content, assistant_id, assistant_name,
        tokens_used, response_time_ms, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      msgId,
      conversationId,
      data.role || "user",
      data.content || data.message,
      data.assistant_id || data.assistantId || null,
      data.assistant_name || data.assistantName || null,
      data.tokens_used || data.tokensUsed || 0,
      data.response_time_ms || data.responseTimeMs || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now
    ).run();
    await env.DB.prepare(`
      UPDATE chatbot_conversations 
      SET message_count = message_count + 1, last_message_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(now, now, conversationId).run();
    return new Response(JSON.stringify({
      success: true,
      message: { id: msgId, conversationId }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost13, "onRequestPost13");
__name2(onRequestPost13, "onRequestPost");
async function onRequestPost14(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.conversationId && !data.conversation_id) {
      return new Response(JSON.stringify({ success: false, error: "conversation_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (data.rating === void 0) {
      return new Response(JSON.stringify({ success: false, error: "rating is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const conversationId = data.conversationId || data.conversation_id;
    const rating = parseInt(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ success: false, error: "rating must be between 1 and 5" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    await env.DB.prepare(`
      UPDATE chatbot_conversations 
      SET rating = ?, rating_feedback = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      rating,
      data.feedback || data.ratingFeedback || null,
      now,
      conversationId
    ).run();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await env.DB.prepare(`
      INSERT INTO chatbot_analytics (id, date, ratings_count, ratings_sum, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET 
        ratings_count = ratings_count + 1,
        ratings_sum = ratings_sum + ?,
        avg_rating = CAST(ratings_sum + ? AS REAL) / (ratings_count + 1),
        updated_at = ?
    `).bind(
      `analytics_${today}`,
      today,
      rating,
      now,
      now,
      rating,
      rating,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Thank you for your feedback!"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost14, "onRequestPost14");
__name2(onRequestPost14, "onRequestPost");
async function onRequestGet17(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("active_only") !== "false";
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM chatbot_scenarios";
    if (activeOnly) {
      query += " WHERE is_active = 1";
    }
    query += " ORDER BY priority DESC, name ASC";
    const { results: scenarios } = await env.DB.prepare(query).all();
    const formattedScenarios = scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      triggerType: s.trigger_type,
      triggerValue: s.trigger_value,
      language: s.language,
      flowData: s.flow_data ? JSON.parse(s.flow_data) : {},
      isActive: s.is_active === 1,
      active: s.is_active === 1,
      priority: s.priority,
      usageCount: s.usage_count,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
    return new Response(JSON.stringify({
      success: true,
      scenarios: formattedScenarios
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet17, "onRequestGet17");
__name2(onRequestGet17, "onRequestGet");
async function onRequestPost15(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ success: false, error: "Scenario name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = data.id || `scenario_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    let flowData = data.flowData || data.flow_data || {};
    if (data.questions || data.responses) {
      flowData = {
        questions: data.questions,
        responses: data.responses
      };
    }
    await env.DB.prepare(`
      INSERT INTO chatbot_scenarios (
        id, name, description, trigger_type, trigger_value, language,
        flow_data, is_active, priority, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.description || "",
      data.triggerType || data.trigger_type || "keyword",
      data.triggerValue || data.trigger_value || "",
      data.language || "all",
      JSON.stringify(flowData),
      data.isActive !== false && data.active !== false ? 1 : 0,
      data.priority || 0,
      now,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      scenario: { id, name: data.name }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost15, "onRequestPost15");
__name2(onRequestPost15, "onRequestPost");
async function onRequestPut6(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const id = data.id;
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Scenario ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const updates = ["updated_at = ?"];
    const values = [now];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== void 0) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.triggerType !== void 0 || data.trigger_type !== void 0) {
      updates.push("trigger_type = ?");
      values.push(data.triggerType || data.trigger_type);
    }
    if (data.triggerValue !== void 0 || data.trigger_value !== void 0) {
      updates.push("trigger_value = ?");
      values.push(data.triggerValue || data.trigger_value);
    }
    if (data.language !== void 0) {
      updates.push("language = ?");
      values.push(data.language);
    }
    if (data.flowData !== void 0 || data.flow_data !== void 0 || data.questions !== void 0) {
      let flowData = data.flowData || data.flow_data || {};
      if (data.questions || data.responses) {
        flowData = { questions: data.questions, responses: data.responses };
      }
      updates.push("flow_data = ?");
      values.push(JSON.stringify(flowData));
    }
    if (data.isActive !== void 0 || data.active !== void 0) {
      updates.push("is_active = ?");
      values.push(data.isActive || data.active ? 1 : 0);
    }
    if (data.priority !== void 0) {
      updates.push("priority = ?");
      values.push(data.priority);
    }
    values.push(id);
    await env.DB.prepare(`
      UPDATE chatbot_scenarios SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut6, "onRequestPut6");
__name2(onRequestPut6, "onRequestPut");
async function onRequestDelete6(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: "Scenario ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "DELETE FROM chatbot_scenarios WHERE id = ?"
    ).bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete6, "onRequestDelete6");
__name2(onRequestDelete6, "onRequestDelete");
async function onRequestGet18(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM chatbot_settings";
    const params = [];
    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const settings = {};
    results.forEach((row) => {
      let value = row.value;
      if (row.type === "boolean") {
        value = row.value === "true" || row.value === "1";
      } else if (row.type === "number") {
        value = parseFloat(row.value);
      } else if (row.type === "json") {
        try {
          value = JSON.parse(row.value);
        } catch (e) {
        }
      }
      settings[row.key] = value;
    });
    const rawSettings = results.map((r) => ({
      key: r.key,
      value: r.value,
      type: r.type,
      category: r.category,
      description: r.description,
      updatedAt: r.updated_at
    }));
    return new Response(JSON.stringify({
      success: true,
      settings,
      rawSettings
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet18, "onRequestGet18");
__name2(onRequestGet18, "onRequestGet");
async function onRequestPut7(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    for (const [key, rawValue] of Object.entries(data)) {
      let type = "string";
      let value = String(rawValue);
      if (typeof rawValue === "boolean") {
        type = "boolean";
        value = rawValue ? "true" : "false";
      } else if (typeof rawValue === "number") {
        type = "number";
        value = String(rawValue);
      } else if (typeof rawValue === "object") {
        type = "json";
        value = JSON.stringify(rawValue);
      }
      let category = "general";
      if (key.startsWith("widget_")) category = "widget";
      else if (key.startsWith("enable_") || key.startsWith("allow_")) category = "features";
      else if (key.includes("model") || key.includes("openai") || key.includes("api")) category = "ai";
      else if (key.includes("delay") || key.includes("timeout")) category = "behavior";
      await env.DB.prepare(`
        INSERT INTO chatbot_settings (key, value, type, category, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          type = excluded.type,
          updated_at = excluded.updated_at
      `).bind(key, value, type, category, now).run();
    }
    if (data.openai_api_key && env.KV) {
      await env.KV.put("OPENAI_API_KEY", data.openai_api_key);
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Settings updated successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut7, "onRequestPut7");
__name2(onRequestPut7, "onRequestPut");
async function onRequestPost16(context) {
  return onRequestPut7(context);
}
__name(onRequestPost16, "onRequestPost16");
__name2(onRequestPost16, "onRequestPost");
async function onRequestGet19(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM chatbot_users";
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ? OR restaurant_name LIKE ? OR phone LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const { results: users } = await env.DB.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM chatbot_users";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 ? await countStmt.bind(...countParams).first() : await countStmt.first();
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN status = 'customer' THEN 1 ELSE 0 END) as customers,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified
      FROM chatbot_users
    `).first();
    const formattedUsers = users.map((u) => ({
      id: u.id,
      visitorId: u.visitor_id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      company: u.company,
      restaurantName: u.restaurant_name,
      userType: u.user_type,
      systemUsage: u.system_usage,
      language: u.language,
      source: u.source,
      status: u.status,
      totalConversations: u.total_conversations,
      totalMessages: u.total_messages,
      lastConversationAt: u.last_conversation_at,
      customFields: u.custom_fields ? JSON.parse(u.custom_fields) : {},
      tags: u.tags ? JSON.parse(u.tags) : [],
      notes: u.notes,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }));
    return new Response(JSON.stringify({
      success: true,
      users: formattedUsers,
      stats: {
        total: stats?.total || 0,
        leads: stats?.leads || 0,
        customers: stats?.customers || 0,
        qualified: stats?.qualified || 0
      },
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet19, "onRequestGet19");
__name2(onRequestGet19, "onRequestGet");
async function onRequestPost17(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    if (!data.email && !data.userEmail) {
      if (data.visitorId) {
        const existing2 = await env.DB.prepare(
          "SELECT * FROM chatbot_users WHERE visitor_id = ?"
        ).bind(data.visitorId).first();
        if (existing2) {
          const updates = [];
          const values = [];
          if (data.name) {
            updates.push("name = ?");
            values.push(data.name);
          }
          if (data.phone) {
            updates.push("phone = ?");
            values.push(data.phone);
          }
          if (data.restaurantName) {
            updates.push("restaurant_name = ?");
            values.push(data.restaurantName);
          }
          if (data.userType) {
            updates.push("user_type = ?");
            values.push(data.userType);
          }
          if (data.systemUsage) {
            updates.push("system_usage = ?");
            values.push(data.systemUsage);
          }
          if (data.language) {
            updates.push("language = ?");
            values.push(data.language);
          }
          if (updates.length > 0) {
            updates.push("updated_at = ?");
            values.push(now);
            values.push(existing2.id);
            await env.DB.prepare(`
              UPDATE chatbot_users SET ${updates.join(", ")} WHERE id = ?
            `).bind(...values).run();
          }
          return new Response(JSON.stringify({
            success: true,
            user: { id: existing2.id },
            updated: true
          }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      return new Response(JSON.stringify({ success: false, error: "Email is required for registration" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const email = (data.email || data.userEmail).toLowerCase().trim();
    const existing = await env.DB.prepare(
      "SELECT * FROM chatbot_users WHERE email = ?"
    ).bind(email).first();
    if (existing) {
      const updates = ["updated_at = ?"];
      const values = [now];
      if (data.name) {
        updates.push("name = ?");
        values.push(data.name);
      }
      if (data.phone || data.userPhone) {
        updates.push("phone = ?");
        values.push(data.phone || data.userPhone);
      }
      if (data.restaurantName) {
        updates.push("restaurant_name = ?");
        values.push(data.restaurantName);
      }
      if (data.userType) {
        updates.push("user_type = ?");
        values.push(data.userType);
      }
      if (data.systemUsage) {
        updates.push("system_usage = ?");
        values.push(data.systemUsage);
      }
      if (data.language) {
        updates.push("language = ?");
        values.push(data.language);
      }
      if (data.visitorId) {
        updates.push("visitor_id = ?");
        values.push(data.visitorId);
      }
      values.push(existing.id);
      await env.DB.prepare(`
        UPDATE chatbot_users SET ${updates.join(", ")} WHERE id = ?
      `).bind(...values).run();
      if (data.visitorId || data.conversationId) {
        await env.DB.prepare(`
          UPDATE chatbot_conversations 
          SET user_id = ?, user_name = ?, user_email = ?, user_phone = ?,
              restaurant_name = ?, user_type = ?, is_registered = 1, updated_at = ?
          WHERE (visitor_id = ? OR id = ?) AND user_id IS NULL
        `).bind(
          existing.id,
          data.name || existing.name,
          email,
          data.phone || data.userPhone || existing.phone,
          data.restaurantName || existing.restaurant_name,
          data.userType || existing.user_type,
          now,
          data.visitorId || "",
          data.conversationId || ""
        ).run();
      }
      return new Response(JSON.stringify({
        success: true,
        user: { id: existing.id, email: existing.email },
        updated: true
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = `user_${crypto.randomUUID().split("-")[0]}`;
    await env.DB.prepare(`
      INSERT INTO chatbot_users (
        id, visitor_id, email, name, phone, restaurant_name, user_type,
        system_usage, language, source, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'lead', ?, ?)
    `).bind(
      userId,
      data.visitorId || null,
      email,
      data.name || null,
      data.phone || data.userPhone || null,
      data.restaurantName || null,
      data.userType || null,
      data.systemUsage || null,
      data.language || "en",
      data.source || "chatbot",
      now,
      now
    ).run();
    if (data.visitorId || data.conversationId) {
      await env.DB.prepare(`
        UPDATE chatbot_conversations 
        SET user_id = ?, user_name = ?, user_email = ?, user_phone = ?,
            restaurant_name = ?, user_type = ?, is_registered = 1, updated_at = ?
        WHERE (visitor_id = ? OR id = ?)
      `).bind(
        userId,
        data.name,
        email,
        data.phone || data.userPhone,
        data.restaurantName,
        data.userType,
        now,
        data.visitorId || "",
        data.conversationId || ""
      ).run();
    }
    try {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await env.DB.prepare(`
        INSERT INTO chatbot_analytics (id, date, leads_captured, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(date) DO UPDATE SET 
          leads_captured = leads_captured + 1,
          updated_at = ?
      `).bind(`analytics_${today}`, today, now, now, now).run();
    } catch (e) {
    }
    return new Response(JSON.stringify({
      success: true,
      user: { id: userId, email },
      created: true
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost17, "onRequestPost17");
__name2(onRequestPost17, "onRequestPost");
async function onRequestGet20(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const deploymentId = url.searchParams.get("deployment_id");
  const format = url.searchParams.get("format") || "js";
  try {
    const baseUrl = new URL(request.url).origin;
    let settings = {};
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT key, value, type FROM chatbot_settings WHERE category IN ('general', 'widget', 'features')"
      ).all();
      results?.forEach((row) => {
        let value = row.value;
        if (row.type === "boolean") value = row.value === "true";
        else if (row.type === "number") value = parseInt(row.value);
        else if (row.type === "json") {
          try {
            value = JSON.parse(row.value);
          } catch (e) {
          }
        }
        settings[row.key] = value;
      });
    }
    const widgetConfig = {
      apiEndpoint: `${baseUrl}/api/chatbot`,
      position: settings.widget_position || "bottom-right",
      primaryColor: settings.widget_color || "#e8f24c",
      chatbotName: settings.chatbot_name || "Fooodis Assistant",
      welcomeMessage: settings.welcome_message || "Hello! How can I help you today?",
      languages: settings.supported_languages || ["en", "sv"],
      enableRating: settings.enable_rating !== false,
      enableFileUpload: settings.enable_file_upload !== false,
      deploymentId
    };
    let embedCode;
    let embedCodeMinified;
    if (format === "react") {
      embedCode = `// React Component
import React, { useEffect } from 'react';

const FoodisChatbot = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${baseUrl}/js/chatbot-widget.js';
    script.async = true;
    script.onload = () => {
      if (window.FoodisChatbot) {
        window.FoodisChatbot.init(${JSON.stringify(widgetConfig, null, 2)});
      }
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default FoodisChatbot;`;
    } else if (format === "html") {
      embedCode = `<!-- Fooodis Chatbot Widget -->
<script>
  window.FoodisChatbotConfig = ${JSON.stringify(widgetConfig, null, 2)};
<\/script>
<script src="${baseUrl}/js/chatbot-widget.js" async><\/script>`;
      embedCodeMinified = `<script>window.FoodisChatbotConfig=${JSON.stringify(widgetConfig)};<\/script><script src="${baseUrl}/js/chatbot-widget.js" async><\/script>`;
    } else {
      embedCode = `// Fooodis Chatbot Widget
(function() {
  var config = ${JSON.stringify(widgetConfig, null, 2)};
  
  var script = document.createElement('script');
  script.src = '${baseUrl}/js/chatbot-widget.js';
  script.async = true;
  script.onload = function() {
    if (window.FoodisChatbot) {
      window.FoodisChatbot.init(config);
    }
  };
  document.body.appendChild(script);
})();`;
      embedCodeMinified = `(function(){var c=${JSON.stringify(widgetConfig)};var s=document.createElement('script');s.src='${baseUrl}/js/chatbot-widget.js';s.async=!0;s.onload=function(){window.FoodisChatbot&&window.FoodisChatbot.init(c)};document.body.appendChild(s)})();`;
    }
    let deployments = [];
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM chatbot_deployments ORDER BY created_at DESC LIMIT 10"
      ).all();
      deployments = results || [];
    }
    return new Response(JSON.stringify({
      success: true,
      embedCode,
      embedCodeMinified,
      config: widgetConfig,
      deployments
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet20, "onRequestGet20");
__name2(onRequestGet20, "onRequestGet");
async function onRequestPost18(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    if (data.deployment_id) {
      const existing = await env.DB.prepare(
        "SELECT * FROM chatbot_deployments WHERE id = ?"
      ).bind(data.deployment_id).first();
      if (existing) {
        await env.DB.prepare(`
          UPDATE chatbot_deployments 
          SET last_ping = ?, total_loads = total_loads + 1, updated_at = ?
          WHERE id = ?
        `).bind(now, now, data.deployment_id).run();
        return new Response(JSON.stringify({
          success: true,
          deployment: { id: existing.id },
          action: "updated"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    const id = data.deployment_id || `deploy_${crypto.randomUUID().split("-")[0]}`;
    await env.DB.prepare(`
      INSERT INTO chatbot_deployments (
        id, name, domain, config, is_active, last_ping, total_loads, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, ?, 1, ?, ?)
    `).bind(
      id,
      data.name || data.domain || "Unnamed Deployment",
      data.domain || null,
      data.config ? JSON.stringify(data.config) : null,
      now,
      now,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      deployment: { id },
      action: "created"
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost18, "onRequestPost18");
__name2(onRequestPost18, "onRequestPost");
async function onRequestGet21(context) {
  const { request, env } = context;
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ success: false, error: "No token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const token = authHeader.substring(7);
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let tokenData = null;
    if (env.KV) {
      try {
        const cached = await env.KV.get(`auth_${token}`);
        if (cached) {
          tokenData = JSON.parse(cached);
        }
      } catch (e) {
        console.error("KV error:", e);
      }
    }
    if (!tokenData) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const customer = await env.DB.prepare(
      "SELECT id, email, name, phone, company, status, total_tickets, last_login FROM support_customers WHERE id = ?"
    ).bind(tokenData.customer_id).first();
    if (!customer || customer.status !== "active") {
      return new Response(JSON.stringify({ success: false, error: "Account not found or inactive" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      data: { customer }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet21, "onRequestGet21");
__name2(onRequestGet21, "onRequestGet");
async function onRequestPost19(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const email = data.email.toLowerCase().trim();
    const customer = await env.DB.prepare(
      "SELECT * FROM support_customers WHERE email = ?"
    ).bind(email).first();
    if (!customer) {
      const now2 = Date.now();
      const customerId = `cust_${crypto.randomUUID().split("-")[0]}`;
      await env.DB.prepare(`
        INSERT INTO support_customers (id, email, name, status, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
      `).bind(customerId, email, data.name || email.split("@")[0], now2, now2).run();
      const token2 = await generateToken(customerId, email);
      if (env.KV) {
        await env.KV.put(`auth_${token2}`, JSON.stringify({
          customer_id: customerId,
          email,
          created_at: now2
        }), { expirationTtl: 86400 * 7 });
      }
      return new Response(JSON.stringify({
        success: true,
        message: "Account created and logged in",
        data: {
          customer: {
            id: customerId,
            email,
            name: data.name || email.split("@")[0]
          },
          token: token2,
          newAccount: true
        }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (customer.password_hash && data.password) {
      const passwordHash = await hashPassword(data.password);
      if (passwordHash !== customer.password_hash) {
        return new Response(JSON.stringify({ success: false, error: "Invalid password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (customer.status !== "active") {
      return new Response(JSON.stringify({ success: false, error: "Account is inactive" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const token = await generateToken(customer.id, email);
    if (env.KV) {
      await env.KV.put(`auth_${token}`, JSON.stringify({
        customer_id: customer.id,
        email,
        created_at: now
      }), { expirationTtl: 86400 * 7 });
    }
    await env.DB.prepare(
      "UPDATE support_customers SET last_login = ?, login_count = login_count + 1 WHERE id = ?"
    ).bind(now, customer.id).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Login successful",
      data: {
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          company: customer.company,
          total_tickets: customer.total_tickets
        },
        token
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost19, "onRequestPost19");
__name2(onRequestPost19, "onRequestPost");
async function onRequestDelete7(context) {
  const { request, env } = context;
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (env.KV) {
      try {
        await env.KV.delete(`auth_${token}`);
      } catch (e) {
        console.error("KV error:", e);
      }
    }
  }
  return new Response(JSON.stringify({
    success: true,
    message: "Logged out successfully"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
__name(onRequestDelete7, "onRequestDelete7");
__name2(onRequestDelete7, "onRequestDelete");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "fooodis_support_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
__name2(hashPassword, "hashPassword");
async function generateToken(customerId, email) {
  const data = `${customerId}:${email}:${Date.now()}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateToken, "generateToken");
__name2(generateToken, "generateToken");
async function onRequestPost20(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const { operation, ids, options } = data;
    if (!operation) {
      return new Response(JSON.stringify({ error: "Operation is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: "Media IDs array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const results = {
      operation,
      total: ids.length,
      success: 0,
      failed: 0,
      details: []
    };
    switch (operation) {
      case "delete":
        for (const id of ids) {
          try {
            const media = await env.DB.prepare(
              "SELECT r2_key, thumbnail_key FROM media_library WHERE id = ?"
            ).bind(id).first();
            if (media) {
              if (env.MEDIA_BUCKET && media.r2_key) {
                try {
                  await env.MEDIA_BUCKET.delete(media.r2_key);
                  if (media.thumbnail_key) {
                    await env.MEDIA_BUCKET.delete(media.thumbnail_key);
                  }
                } catch (r2Error) {
                  console.error("R2 delete error:", r2Error);
                }
              }
              await env.DB.prepare(
                "DELETE FROM media_library WHERE id = ?"
              ).bind(id).run();
              results.success++;
              results.details.push({ id, status: "deleted" });
            } else {
              results.failed++;
              results.details.push({ id, status: "not_found" });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: "error", error: err.message });
          }
        }
        break;
      case "move":
        const targetFolder = options?.folder;
        if (!targetFolder) {
          return new Response(JSON.stringify({ error: "Target folder is required for move operation" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const now = Date.now();
        for (const id of ids) {
          try {
            const result = await env.DB.prepare(
              "UPDATE media_library SET folder = ?, updated_at = ? WHERE id = ?"
            ).bind(targetFolder, now, id).run();
            if (result.meta.changes > 0) {
              results.success++;
              results.details.push({ id, status: "moved", folder: targetFolder });
            } else {
              results.failed++;
              results.details.push({ id, status: "not_found" });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: "error", error: err.message });
          }
        }
        break;
      case "update":
        const updates = options?.updates || {};
        if (Object.keys(updates).length === 0) {
          return new Response(JSON.stringify({ error: "Updates object is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const allowedFields = ["alt_text", "caption", "folder", "is_featured"];
        const setClauses = [];
        const values = [];
        for (const [key, value] of Object.entries(updates)) {
          if (allowedFields.includes(key)) {
            setClauses.push(`${key} = ?`);
            values.push(key === "is_featured" ? value ? 1 : 0 : value);
          }
        }
        if (setClauses.length === 0) {
          return new Response(JSON.stringify({ error: "No valid fields to update" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        setClauses.push("updated_at = ?");
        values.push(Date.now());
        for (const id of ids) {
          try {
            const result = await env.DB.prepare(
              `UPDATE media_library SET ${setClauses.join(", ")} WHERE id = ?`
            ).bind(...values, id).run();
            if (result.meta.changes > 0) {
              results.success++;
              results.details.push({ id, status: "updated" });
            } else {
              results.failed++;
              results.details.push({ id, status: "not_found" });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: "error", error: err.message });
          }
        }
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost20, "onRequestPost20");
__name2(onRequestPost20, "onRequestPost");
async function onRequestGet22(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let definedFolders = [];
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM media_folders ORDER BY is_system DESC, name ASC"
      ).all();
      definedFolders = results || [];
    } catch (e) {
      console.log("media_folders table not available, using fallback");
    }
    const { results: fileCounts } = await env.DB.prepare(`
      SELECT folder, COUNT(*) as file_count, SUM(file_size) as total_size
      FROM media_library 
      GROUP BY folder
    `).all();
    const fileCountMap = /* @__PURE__ */ new Map();
    fileCounts.forEach((row) => {
      fileCountMap.set(row.folder, {
        file_count: row.file_count,
        total_size: row.total_size || 0
      });
    });
    const folderMap = /* @__PURE__ */ new Map();
    definedFolders.forEach((folder) => {
      const counts = fileCountMap.get(folder.name) || { file_count: 0, total_size: 0 };
      folderMap.set(folder.name, {
        id: folder.id,
        name: folder.name,
        display_name: folder.display_name || folder.name,
        description: folder.description,
        file_count: counts.file_count,
        total_size: counts.total_size,
        color: folder.color,
        icon: folder.icon,
        is_system: folder.is_system === 1
      });
    });
    fileCounts.forEach((row) => {
      if (!folderMap.has(row.folder)) {
        folderMap.set(row.folder, {
          name: row.folder,
          display_name: row.folder,
          file_count: row.file_count,
          total_size: row.total_size || 0,
          is_system: false
        });
      }
    });
    if (env.MEDIA_BUCKET) {
      try {
        const listed = await env.MEDIA_BUCKET.list({ delimiter: "/" });
        if (listed.delimitedPrefixes) {
          listed.delimitedPrefixes.forEach((prefix) => {
            const folderName = prefix.replace(/\/$/, "");
            if (!folderMap.has(folderName)) {
              folderMap.set(folderName, {
                name: folderName,
                display_name: folderName,
                file_count: 0,
                total_size: 0,
                source: "r2",
                is_system: false
              });
            }
          });
        }
      } catch (r2Error) {
        console.error("R2 listing error:", r2Error);
      }
    }
    const defaultFolders = [
      { name: "uploads", display_name: "Uploads", is_system: true },
      { name: "blog-images", display_name: "Blog Images", is_system: true },
      { name: "ai-generated", display_name: "AI Generated", is_system: true },
      { name: "featured", display_name: "Featured", is_system: true }
    ];
    defaultFolders.forEach((df) => {
      if (!folderMap.has(df.name)) {
        folderMap.set(df.name, {
          name: df.name,
          display_name: df.display_name,
          file_count: 0,
          total_size: 0,
          is_system: df.is_system
        });
      }
    });
    const folders = Array.from(folderMap.values()).sort((a, b) => {
      if (a.is_system && !b.is_system) return -1;
      if (!a.is_system && b.is_system) return 1;
      return a.name.localeCompare(b.name);
    });
    return new Response(JSON.stringify(folders), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet22, "onRequestGet22");
__name2(onRequestGet22, "onRequestGet");
async function onRequestPost21(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Folder name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const folderName = data.name.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const displayName = data.display_name || data.name;
    const now = Date.now();
    const id = `folder_${crypto.randomUUID().split("-")[0]}`;
    try {
      await env.DB.prepare(`
        INSERT INTO media_folders (id, name, display_name, description, color, icon, is_system, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        folderName,
        displayName,
        data.description || "",
        data.color || "#478ac9",
        data.icon || "folder",
        now,
        now
      ).run();
    } catch (dbError) {
      if (dbError.message?.includes("UNIQUE")) {
        return new Response(JSON.stringify({ error: "Folder already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log("Could not insert into media_folders:", dbError.message);
    }
    if (env.MEDIA_BUCKET) {
      try {
        await env.MEDIA_BUCKET.put(`${folderName}/.folder`, "", {
          customMetadata: {
            created: (/* @__PURE__ */ new Date()).toISOString(),
            display_name: displayName
          }
        });
      } catch (r2Error) {
        console.error("R2 folder creation error:", r2Error);
      }
    }
    const folder = {
      id,
      name: folderName,
      display_name: displayName,
      description: data.description || "",
      file_count: 0,
      total_size: 0,
      is_system: false
    };
    return new Response(JSON.stringify({
      success: true,
      folder
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
__name(onRequestPost21, "onRequestPost21");
__name2(onRequestPost21, "onRequestPost");
async function onRequestDelete8(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const url = new URL(request.url);
    const folderName = url.searchParams.get("name");
    if (!folderName) {
      return new Response(JSON.stringify({ error: "Folder name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      const folder = await env.DB.prepare(
        "SELECT is_system FROM media_folders WHERE name = ?"
      ).bind(folderName).first();
      if (folder && folder.is_system === 1) {
        return new Response(JSON.stringify({ error: "Cannot delete system folder" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (e) {
    }
    await env.DB.prepare(
      "UPDATE media_library SET folder = 'uploads', updated_at = ? WHERE folder = ?"
    ).bind(Date.now(), folderName).run();
    try {
      await env.DB.prepare(
        "DELETE FROM media_folders WHERE name = ? AND is_system = 0"
      ).bind(folderName).run();
    } catch (e) {
    }
    if (env.MEDIA_BUCKET) {
      try {
        await env.MEDIA_BUCKET.delete(`${folderName}/.folder`);
      } catch (r2Error) {
      }
    }
    return new Response(JSON.stringify({ success: true, folder: folderName }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete8, "onRequestDelete8");
__name2(onRequestDelete8, "onRequestDelete");
var ALLOWED_TYPES2 = ["image/jpeg", "image/png", "image/gif", "image/webp"];
var MAX_SIZE2 = 5 * 1024 * 1024;
async function onRequestPost22(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const formData = await request.formData();
    const file = formData.get("avatar") || formData.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No avatar file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!ALLOWED_TYPES2.includes(file.type)) {
      return new Response(JSON.stringify({
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        allowed: ALLOWED_TYPES2
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (file.size > MAX_SIZE2) {
      return new Response(JSON.stringify({
        error: "File too large. Maximum size is 5MB",
        maxSize: MAX_SIZE2
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const currentProfile = await env.DB.prepare(
      "SELECT avatar_url FROM user_profiles WHERE user_id = 'admin'"
    ).first();
    if (currentProfile?.avatar_url) {
      try {
        const oldKey = currentProfile.avatar_url.replace("/api/media/serve/", "");
        if (oldKey.startsWith("avatars/")) {
          await env.MEDIA_BUCKET.delete(decodeURIComponent(oldKey));
        }
      } catch (e) {
        console.error("Error deleting old avatar:", e);
      }
    }
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const r2Key = `avatars/admin-${timestamp}.${ext}`;
    const fileBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type
      },
      customMetadata: {
        originalFilename: file.name,
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        userId: "admin"
      }
    });
    const avatarUrl = `/api/media/serve/${encodeURIComponent(r2Key)}`;
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET avatar_url = ?, updated_at = ? WHERE user_id = 'admin'"
    ).bind(avatarUrl, now).run();
    await env.DB.prepare(`
      INSERT INTO media_library (
        id, filename, original_filename, mime_type, file_size, 
        r2_key, r2_url, folder, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'avatars', ?, ?)
    `).bind(
      `avatar_admin_${timestamp}`,
      `admin-${timestamp}.${ext}`,
      file.name,
      file.type,
      file.size,
      r2Key,
      avatarUrl,
      now,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      avatar_url: avatarUrl,
      message: "Avatar uploaded successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost22, "onRequestPost22");
__name2(onRequestPost22, "onRequestPost");
async function onRequestDelete9(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const profile = await env.DB.prepare(
      "SELECT avatar_url FROM user_profiles WHERE user_id = 'admin'"
    ).first();
    if (profile?.avatar_url && env.MEDIA_BUCKET) {
      try {
        const r2Key = profile.avatar_url.replace("/api/media/serve/", "");
        if (r2Key.startsWith("avatars/")) {
          await env.MEDIA_BUCKET.delete(decodeURIComponent(r2Key));
        }
      } catch (e) {
        console.error("Error deleting avatar from R2:", e);
      }
    }
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET avatar_url = NULL, updated_at = ? WHERE user_id = 'admin'"
    ).bind(now).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Avatar removed successfully"
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
__name(onRequestDelete9, "onRequestDelete9");
__name2(onRequestDelete9, "onRequestDelete");
async function onRequestPost23(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const { current_password, new_password, confirm_password } = data;
    if (!current_password || !new_password || !confirm_password) {
      return new Response(JSON.stringify({ error: "All password fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (new_password !== confirm_password) {
      return new Response(JSON.stringify({ error: "New passwords do not match" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (new_password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const profile = await env.DB.prepare(
      "SELECT password_hash FROM user_profiles WHERE user_id = 'admin'"
    ).first();
    const currentHash = await hashPassword2(current_password);
    if (profile?.password_hash && profile.password_hash !== currentHash) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const newHash = await hashPassword2(new_password);
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE user_id = 'admin'"
    ).bind(newHash, now, now).run();
    try {
      await env.DB.prepare(`
        INSERT INTO activity_log (id, user_id, action, details, created_at)
        VALUES (?, 'admin', 'password_change', ?, ?)
      `).bind(
        crypto.randomUUID(),
        JSON.stringify({ timestamp: (/* @__PURE__ */ new Date()).toISOString() }),
        now
      ).run();
    } catch (e) {
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Password updated successfully"
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
__name(onRequestPost23, "onRequestPost23");
__name2(onRequestPost23, "onRequestPost");
async function hashPassword2(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "fooodis_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword2, "hashPassword2");
__name2(hashPassword2, "hashPassword");
async function onRequestGet23(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    const { results } = await env.DB.prepare(`
      SELECT * FROM scheduled_posts 
      WHERE scheduled_datetime <= ? AND status = 'pending'
      ORDER BY priority DESC, scheduled_datetime ASC
    `).bind(now).all();
    const duePosts = results.map((post) => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_overdue: post.scheduled_datetime < now
    }));
    return new Response(JSON.stringify({
      due_count: duePosts.length,
      posts: duePosts
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
__name(onRequestGet23, "onRequestGet23");
__name2(onRequestGet23, "onRequestGet");
async function onRequestPost24(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    const results = {
      checked: 0,
      published: 0,
      failed: 0,
      details: []
    };
    const { results: duePosts } = await env.DB.prepare(`
      SELECT * FROM scheduled_posts 
      WHERE scheduled_datetime <= ? AND status = 'pending'
      ORDER BY priority DESC, scheduled_datetime ASC
    `).bind(now).all();
    results.checked = duePosts.length;
    for (const scheduledPost of duePosts) {
      try {
        await env.DB.prepare(
          "UPDATE scheduled_posts SET status = 'publishing', last_attempt = ? WHERE id = ?"
        ).bind(now, scheduledPost.id).run();
        const blogPostId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO blog_posts (
            id, title, content, excerpt, image_url, author, category, subcategory, tags,
            published_date, status, featured, views, likes, comments_count, created_at, updated_at, slug
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 0, 0, 0, ?, ?, ?)
        `).bind(
          blogPostId,
          scheduledPost.title,
          scheduledPost.content,
          scheduledPost.excerpt,
          scheduledPost.image_url,
          scheduledPost.author,
          scheduledPost.category,
          scheduledPost.subcategory,
          scheduledPost.tags,
          (/* @__PURE__ */ new Date()).toISOString(),
          scheduledPost.is_featured,
          now,
          now,
          scheduledPost.slug
        ).run();
        await env.DB.prepare(`
          UPDATE scheduled_posts SET 
            status = 'published', 
            published_post_id = ?, 
            updated_at = ? 
          WHERE id = ?
        `).bind(blogPostId, now, scheduledPost.id).run();
        await env.DB.prepare(`
          INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
          VALUES (?, ?, 'published', ?, ?)
        `).bind(
          crypto.randomUUID(),
          scheduledPost.id,
          JSON.stringify({
            blog_post_id: blogPostId,
            published_at: new Date(now).toISOString(),
            auto_published: true
          }),
          now
        ).run();
        if (scheduledPost.category && scheduledPost.category !== "Uncategorized") {
          await env.DB.prepare(
            "UPDATE categories SET post_count = post_count + 1 WHERE name = ?"
          ).bind(scheduledPost.category).run();
        }
        results.published++;
        results.details.push({
          id: scheduledPost.id,
          title: scheduledPost.title,
          status: "published",
          blog_post_id: blogPostId
        });
      } catch (publishError) {
        const retryCount = (scheduledPost.retry_count || 0) + 1;
        const newStatus = retryCount >= (scheduledPost.max_retries || 3) ? "failed" : "pending";
        await env.DB.prepare(`
          UPDATE scheduled_posts SET 
            status = ?, 
            retry_count = ?, 
            error_message = ?,
            last_attempt = ?,
            updated_at = ? 
          WHERE id = ?
        `).bind(newStatus, retryCount, publishError.message, now, now, scheduledPost.id).run();
        await env.DB.prepare(`
          INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
          VALUES (?, ?, 'failed', ?, ?)
        `).bind(
          crypto.randomUUID(),
          scheduledPost.id,
          JSON.stringify({ error: publishError.message, retry_count: retryCount }),
          now
        ).run();
        results.failed++;
        results.details.push({
          id: scheduledPost.id,
          title: scheduledPost.title,
          status: "failed",
          error: publishError.message
        });
      }
    }
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date(now).toISOString(),
      ...results
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
__name(onRequestPost24, "onRequestPost24");
__name2(onRequestPost24, "onRequestPost");
async function onRequestGet24(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "30d";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    let periodStart = 0;
    let previousPeriodStart = 0;
    switch (period) {
      case "7d":
        periodStart = now - 7 * 24 * 60 * 60 * 1e3;
        previousPeriodStart = periodStart - 7 * 24 * 60 * 60 * 1e3;
        break;
      case "30d":
        periodStart = now - 30 * 24 * 60 * 60 * 1e3;
        previousPeriodStart = periodStart - 30 * 24 * 60 * 60 * 1e3;
        break;
      case "90d":
        periodStart = now - 90 * 24 * 60 * 60 * 1e3;
        previousPeriodStart = periodStart - 90 * 24 * 60 * 60 * 1e3;
        break;
      default:
        periodStart = 0;
        previousPeriodStart = 0;
    }
    const totalPosts = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'"
    ).first();
    const postsInPeriod = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published' AND created_at >= ?"
    ).bind(periodStart).first();
    const totalViews = await env.DB.prepare(
      "SELECT SUM(views) as total FROM post_stats"
    ).first();
    const totalComments = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE status = 'approved'"
    ).first();
    const commentsInPeriod = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM comments WHERE status = 'approved' AND created_at >= ?"
    ).bind(periodStart).first();
    const totalShares = await env.DB.prepare(
      "SELECT SUM(shares_total) as total FROM post_stats"
    ).first();
    const avgReadTime = await env.DB.prepare(
      "SELECT AVG(avg_read_time) as avg FROM post_stats WHERE avg_read_time > 0"
    ).first();
    const { results: categoryStats } = await env.DB.prepare(`
      SELECT 
        c.name,
        c.color,
        c.post_count,
        COALESCE(SUM(ps.views), 0) as total_views,
        COALESCE(SUM(ps.shares_total), 0) as total_shares
      FROM categories c
      LEFT JOIN blog_posts p ON c.name = p.category AND p.status = 'published'
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY total_views DESC
      LIMIT 10
    `).all();
    const { results: topPosts } = await env.DB.prepare(`
      SELECT 
        p.id, p.title, p.category, p.published_date, p.image_url,
        COALESCE(ps.views, 0) as views,
        COALESCE(ps.shares_total, 0) as shares,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comments
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.status = 'published'
      ORDER BY ps.views DESC
      LIMIT 5
    `).all();
    const { results: recentPosts } = await env.DB.prepare(`
      SELECT 
        p.id, p.title, p.category, p.published_date,
        COALESCE(ps.views, 0) as views,
        COALESCE(ps.shares_total, 0) as shares
      FROM blog_posts p
      LEFT JOIN post_stats ps ON p.id = ps.post_id
      WHERE p.status = 'published' AND p.created_at >= ?
      ORDER BY p.created_at DESC
      LIMIT 5
    `).bind(periodStart).all();
    let viewsChange = 0;
    let commentsChange = 0;
    let postsChange = 0;
    if (previousPeriodStart > 0) {
      const currentPeriodViews = postsInPeriod?.total || 0;
      const previousPeriodPosts = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published' AND created_at >= ? AND created_at < ?"
      ).bind(previousPeriodStart, periodStart).first();
      const prevPosts = previousPeriodPosts?.total || 0;
      if (prevPosts > 0) {
        postsChange = (currentPeriodViews - prevPosts) / prevPosts * 100;
      }
      const prevComments = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM comments WHERE status = 'approved' AND created_at >= ? AND created_at < ?"
      ).bind(previousPeriodStart, periodStart).first();
      const currentComments = commentsInPeriod?.total || 0;
      const previousComments = prevComments?.total || 0;
      if (previousComments > 0) {
        commentsChange = (currentComments - previousComments) / previousComments * 100;
      }
    }
    let automationStats = {
      totalPaths: 0,
      activePaths: 0,
      totalGenerated: 0,
      scheduledPosts: 0
    };
    try {
      const pathsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM automation_paths"
      ).first();
      const scheduledCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM scheduled_posts WHERE status = 'pending'"
      ).first();
      const generatedCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM ai_generation_logs WHERE status = 'completed'"
      ).first();
      automationStats = {
        totalPaths: pathsCount?.total || 0,
        activePaths: pathsCount?.active || 0,
        totalGenerated: generatedCount?.total || 0,
        scheduledPosts: scheduledCount?.total || 0
      };
    } catch (e) {
    }
    const mediaStats = await env.DB.prepare(`
      SELECT COUNT(*) as total, SUM(file_size) as total_size
      FROM media_library
    `).first();
    const dashboard = {
      period,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      overview: {
        totalPosts: totalPosts?.total || 0,
        postsInPeriod: postsInPeriod?.total || 0,
        totalViews: totalViews?.total || 0,
        totalComments: totalComments?.total || 0,
        commentsInPeriod: commentsInPeriod?.total || 0,
        totalShares: totalShares?.total || 0,
        averageReadTime: Math.round((avgReadTime?.avg || 0) / 60)
      },
      trends: {
        postsChange: Math.round(postsChange * 10) / 10,
        viewsChange: Math.round(viewsChange * 10) / 10,
        commentsChange: Math.round(commentsChange * 10) / 10
      },
      categories: categoryStats || [],
      topPosts: topPosts || [],
      recentPosts: recentPosts || [],
      automation: automationStats,
      media: {
        totalFiles: mediaStats?.total || 0,
        totalSize: mediaStats?.total_size || 0
      }
    };
    if (env.KV) {
      try {
        await env.KV.put(`dashboard_stats_${period}`, JSON.stringify(dashboard), { expirationTtl: 300 });
      } catch (e) {
      }
    }
    return new Response(JSON.stringify(dashboard), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet24, "onRequestGet24");
__name2(onRequestGet24, "onRequestGet");
async function onRequestGet25(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT email, name, status, source, subscribed_at, country FROM email_subscribers";
    const params = [];
    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }
    query += " ORDER BY subscribed_at DESC";
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const headers = ["email", "name", "status", "source", "subscribed_at", "country"];
    let csv = headers.join(",") + "\n";
    results.forEach((row) => {
      const values = headers.map((h) => {
        let val = row[h] || "";
        if (h === "subscribed_at" && val) {
          val = new Date(val).toISOString();
        }
        if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csv += values.join(",") + "\n";
    });
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet25, "onRequestGet25");
__name2(onRequestGet25, "onRequestGet");
async function onRequestPost25(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const contentType = request.headers.get("content-type") || "";
    let csvData;
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      csvData = await file.text();
    } else if (contentType.includes("text/csv") || contentType.includes("application/json")) {
      const data = await request.json();
      csvData = data.csv;
    } else {
      csvData = await request.text();
    }
    if (!csvData) {
      return new Response(JSON.stringify({ error: "No CSV data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const lines = csvData.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return new Response(JSON.stringify({ error: "CSV must have header and at least one data row" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    const emailIndex = headers.indexOf("email");
    if (emailIndex === -1) {
      return new Response(JSON.stringify({ error: "CSV must have an 'email' column" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const nameIndex = headers.indexOf("name");
    const tagsIndex = headers.indexOf("tags");
    const now = Date.now();
    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };
    for (let i = 1; i < lines.length; i++) {
      results.total++;
      const values = parseCSVLine(lines[i]);
      const email = values[emailIndex]?.toLowerCase().trim();
      if (!email) {
        results.skipped++;
        continue;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.errors.push({ line: i + 1, email, error: "Invalid email format" });
        results.skipped++;
        continue;
      }
      try {
        const id = `sub_${crypto.randomUUID().split("-")[0]}`;
        const name = nameIndex !== -1 ? values[nameIndex]?.trim() || null : null;
        const tags = tagsIndex !== -1 ? values[tagsIndex]?.trim() || null : null;
        await env.DB.prepare(`
          INSERT INTO email_subscribers (id, email, name, status, source, tags, subscribed_at, created_at, updated_at)
          VALUES (?, ?, ?, 'active', 'import', ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            name = COALESCE(excluded.name, email_subscribers.name),
            tags = COALESCE(excluded.tags, email_subscribers.tags),
            updated_at = excluded.updated_at
        `).bind(id, email, name, tags ? JSON.stringify([tags]) : null, now, now, now).run();
        results.imported++;
      } catch (err) {
        results.errors.push({ line: i + 1, email, error: err.message });
        results.skipped++;
      }
    }
    return new Response(JSON.stringify({
      success: true,
      results
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
__name(onRequestPost25, "onRequestPost25");
__name2(onRequestPost25, "onRequestPost");
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
__name(parseCSVLine, "parseCSVLine");
__name2(parseCSVLine, "parseCSVLine");
async function onRequestGet26(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let config = await env.DB.prepare(
      "SELECT * FROM email_popup_config WHERE id = 'default'"
    ).first();
    if (!config) {
      const now = Date.now();
      await env.DB.prepare(`
        INSERT INTO email_popup_config (id, enabled, title, description, button_text, 
          placeholder_text, success_message, trigger_type, trigger_delay, 
          trigger_scroll_percent, show_once, show_every_days, updated_at)
        VALUES ('default', 1, 'Subscribe to Our Newsletter', 
          'Get the latest food news and recipes delivered to your inbox!',
          'Subscribe', 'Enter your email address', 'Thank you for subscribing!',
          'time', 5, 50, 1, 7, ?)
      `).bind(now).run();
      config = await env.DB.prepare(
        "SELECT * FROM email_popup_config WHERE id = 'default'"
      ).first();
    }
    return new Response(JSON.stringify(config), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet26, "onRequestGet26");
__name2(onRequestGet26, "onRequestGet");
async function onRequestPut8(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const updates = [];
    const values = [];
    const allowedFields = [
      "enabled",
      "title",
      "description",
      "button_text",
      "placeholder_text",
      "success_message",
      "trigger_type",
      "trigger_delay",
      "trigger_scroll_percent",
      "show_once",
      "show_every_days",
      "background_color",
      "text_color",
      "button_color",
      "popup_image",
      "custom_css"
    ];
    allowedFields.forEach((field) => {
      if (data[field] !== void 0) {
        updates.push(`${field} = ?`);
        if (field === "enabled" || field === "show_once") {
          values.push(data[field] ? 1 : 0);
        } else {
          values.push(data[field]);
        }
      }
    });
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    await env.DB.prepare(`
      UPDATE email_popup_config SET ${updates.join(", ")} WHERE id = 'default'
    `).bind(...values).run();
    const config = await env.DB.prepare(
      "SELECT * FROM email_popup_config WHERE id = 'default'"
    ).first();
    if (env.KV) {
      try {
        await env.KV.put("email_popup_config", JSON.stringify(config));
      } catch (e) {
        console.error("KV cache error:", e);
      }
    }
    return new Response(JSON.stringify({ success: true, config }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut8, "onRequestPut8");
__name2(onRequestPut8, "onRequestPut");
async function onRequestGet27(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const { results: categories } = await env.DB.prepare(`
      SELECT * FROM ticket_categories 
      WHERE is_active = 1 
      ORDER BY sort_order ASC, name ASC
    `).all();
    return new Response(JSON.stringify({
      success: true,
      data: { categories: categories || [] }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const defaultCategories = [
      { id: "general", name: "General", color: "#478ac9", icon: "question-circle" },
      { id: "technical", name: "Technical", color: "#e74c3c", icon: "bug" },
      { id: "billing", name: "Billing", color: "#27ae60", icon: "credit-card" },
      { id: "feature", name: "Feature Request", color: "#9b59b6", icon: "lightbulb" },
      { id: "feedback", name: "Feedback", color: "#f39c12", icon: "comment" }
    ];
    return new Response(JSON.stringify({
      success: true,
      data: { categories: defaultCategories }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet27, "onRequestGet27");
__name2(onRequestGet27, "onRequestGet");
async function onRequestPost26(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ success: false, error: "Category name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const id = `cat_${data.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    await env.DB.prepare(`
      INSERT INTO ticket_categories (id, name, description, color, icon, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.description || "",
      data.color || "#478ac9",
      data.icon || "tag",
      data.sort_order || 99,
      now,
      now
    ).run();
    return new Response(JSON.stringify({
      success: true,
      data: { category: { id, name: data.name, color: data.color, icon: data.icon } }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint")) {
      return new Response(JSON.stringify({ success: false, error: "Category already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost26, "onRequestPost26");
__name2(onRequestPost26, "onRequestPost");
async function onRequestGet28(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();
    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results: subcategories } = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE parent_category_id = ? ORDER BY sort_order ASC"
    ).bind(id).all();
    return new Response(JSON.stringify({
      ...category,
      subcategories
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
__name(onRequestGet28, "onRequestGet28");
__name2(onRequestGet28, "onRequestGet");
async function onRequestPut9(context) {
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
    const updates = [];
    const values = [];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
      if (!data.slug) {
        updates.push("slug = ?");
        values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
      }
    }
    if (data.slug !== void 0) {
      updates.push("slug = ?");
      values.push(data.slug);
    }
    if (data.description !== void 0) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.color !== void 0) {
      updates.push("color = ?");
      values.push(data.color);
    }
    if (data.icon !== void 0) {
      updates.push("icon = ?");
      values.push(data.icon);
    }
    if (data.sort_order !== void 0) {
      updates.push("sort_order = ?");
      values.push(data.sort_order);
    }
    if (data.is_active !== void 0) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    await env.DB.prepare(`
      UPDATE categories SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();
    if (env.KV) {
      try {
        await env.KV.delete("categories_cache");
      } catch (e) {
        console.error("KV cache clear error:", e);
      }
    }
    return new Response(JSON.stringify({ success: true, category }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut9, "onRequestPut9");
__name2(onRequestPut9, "onRequestPut");
async function onRequestDelete10(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const category = await env.DB.prepare(
      "SELECT * FROM categories WHERE id = ?"
    ).bind(id).first();
    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "UPDATE blog_posts SET category = 'Uncategorized' WHERE category = ?"
    ).bind(category.name).run();
    await env.DB.prepare(
      "DELETE FROM subcategories WHERE parent_category_id = ?"
    ).bind(id).run();
    await env.DB.prepare(
      "DELETE FROM categories WHERE id = ?"
    ).bind(id).run();
    if (env.KV) {
      try {
        await env.KV.delete("categories_cache");
      } catch (e) {
        console.error("KV cache clear error:", e);
      }
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
__name(onRequestDelete10, "onRequestDelete10");
__name2(onRequestDelete10, "onRequestDelete");
async function onRequestGet29(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();
    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(media), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet29, "onRequestGet29");
__name2(onRequestGet29, "onRequestGet");
async function onRequestPut10(context) {
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
    const updates = [];
    const values = [];
    if (data.alt_text !== void 0) {
      updates.push("alt_text = ?");
      values.push(data.alt_text);
    }
    if (data.caption !== void 0) {
      updates.push("caption = ?");
      values.push(data.caption);
    }
    if (data.folder !== void 0) {
      updates.push("folder = ?");
      values.push(data.folder);
    }
    if (data.is_featured !== void 0) {
      updates.push("is_featured = ?");
      values.push(data.is_featured ? 1 : 0);
    }
    if (data.post_id !== void 0) {
      updates.push("post_id = ?");
      values.push(data.post_id);
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    await env.DB.prepare(`
      UPDATE media_library SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({ success: true, media }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut10, "onRequestPut10");
__name2(onRequestPut10, "onRequestPut");
async function onRequestDelete11(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const media = await env.DB.prepare(
      "SELECT * FROM media_library WHERE id = ?"
    ).bind(id).first();
    if (!media) {
      return new Response(JSON.stringify({ error: "Media not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (env.MEDIA_BUCKET && media.r2_key) {
      try {
        await env.MEDIA_BUCKET.delete(media.r2_key);
        if (media.thumbnail_key) {
          await env.MEDIA_BUCKET.delete(media.thumbnail_key);
        }
      } catch (r2Error) {
        console.error("R2 delete error:", r2Error);
      }
    }
    await env.DB.prepare(
      "DELETE FROM media_library WHERE id = ?"
    ).bind(id).run();
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
__name(onRequestDelete11, "onRequestDelete11");
__name2(onRequestDelete11, "onRequestDelete");
async function onRequestGet30(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const post = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();
    if (!post) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results: history } = await env.DB.prepare(
      "SELECT * FROM scheduled_post_history WHERE scheduled_post_id = ? ORDER BY created_at DESC"
    ).bind(id).all();
    return new Response(JSON.stringify({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_featured: post.is_featured === 1,
      history: history.map((h) => ({
        ...h,
        event_data: h.event_data ? JSON.parse(h.event_data) : null
      }))
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
__name(onRequestGet30, "onRequestGet30");
__name2(onRequestGet30, "onRequestGet");
async function onRequestPut11(context) {
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
    const existing = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (existing.status === "published") {
      return new Response(JSON.stringify({ error: "Cannot update a published post" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updates = [];
    const values = [];
    const changes = {};
    if (data.title !== void 0) {
      updates.push("title = ?");
      values.push(data.title);
      changes.title = data.title;
    }
    if (data.content !== void 0) {
      updates.push("content = ?");
      values.push(data.content);
    }
    if (data.excerpt !== void 0) {
      updates.push("excerpt = ?");
      values.push(data.excerpt);
    }
    if (data.image_url !== void 0 || data.imageUrl !== void 0) {
      updates.push("image_url = ?");
      values.push(data.image_url || data.imageUrl);
    }
    if (data.category !== void 0) {
      updates.push("category = ?");
      values.push(data.category);
    }
    if (data.subcategory !== void 0) {
      updates.push("subcategory = ?");
      values.push(data.subcategory);
    }
    if (data.tags !== void 0) {
      updates.push("tags = ?");
      values.push(JSON.stringify(data.tags || []));
    }
    if (data.scheduled_datetime !== void 0 || data.scheduledDate !== void 0) {
      const newDatetime = data.scheduled_datetime ? typeof data.scheduled_datetime === "number" ? data.scheduled_datetime : new Date(data.scheduled_datetime).getTime() : new Date(data.scheduledDate).getTime();
      if (newDatetime <= now) {
        return new Response(JSON.stringify({ error: "Cannot schedule in the past" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      updates.push("scheduled_datetime = ?");
      values.push(newDatetime);
      changes.rescheduled_to = new Date(newDatetime).toISOString();
    }
    if (data.is_featured !== void 0) {
      updates.push("is_featured = ?");
      values.push(data.is_featured ? 1 : 0);
    }
    if (data.status !== void 0 && ["pending", "cancelled"].includes(data.status)) {
      updates.push("status = ?");
      values.push(data.status);
      changes.status = data.status;
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    if (updates.length === 1) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
      UPDATE scheduled_posts SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const eventType = changes.rescheduled_to ? "rescheduled" : "updated";
    await env.DB.prepare(`
      INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      id,
      eventType,
      JSON.stringify(changes),
      now
    ).run();
    const updatedPost = await env.DB.prepare(
      "SELECT * FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({
      success: true,
      post: {
        ...updatedPost,
        tags: updatedPost.tags ? JSON.parse(updatedPost.tags) : [],
        scheduled_date: new Date(updatedPost.scheduled_datetime).toISOString(),
        is_featured: updatedPost.is_featured === 1
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
__name(onRequestPut11, "onRequestPut11");
__name2(onRequestPut11, "onRequestPut");
async function onRequestDelete12(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const existing = await env.DB.prepare(
      "SELECT status FROM scheduled_posts WHERE id = ?"
    ).bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: "Scheduled post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (existing.status === "published") {
      return new Response(JSON.stringify({ error: "Cannot delete a published post" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    await env.DB.prepare(`
      INSERT INTO scheduled_post_history (id, scheduled_post_id, event_type, event_data, created_at)
      VALUES (?, ?, 'cancelled', ?, ?)
    `).bind(
      crypto.randomUUID(),
      id,
      JSON.stringify({ cancelled_at: new Date(now).toISOString() }),
      now
    ).run();
    await env.DB.prepare(
      "DELETE FROM scheduled_posts WHERE id = ?"
    ).bind(id).run();
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
__name(onRequestDelete12, "onRequestDelete12");
__name2(onRequestDelete12, "onRequestDelete");
async function onRequestGet31(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const subcategory = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE id = ?"
    ).bind(id).first();
    if (!subcategory) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(subcategory), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet31, "onRequestGet31");
__name2(onRequestGet31, "onRequestGet");
async function onRequestPut12(context) {
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
    const updates = [];
    const values = [];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
      updates.push("slug = ?");
      values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
    if (data.parent_category_id !== void 0) {
      updates.push("parent_category_id = ?");
      values.push(data.parent_category_id);
    }
    if (data.description !== void 0) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.is_active !== void 0) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    if (updates.length === 1) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
      UPDATE subcategories SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const subcategory = await env.DB.prepare(
      "SELECT * FROM subcategories WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({ success: true, subcategory }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut12, "onRequestPut12");
__name2(onRequestPut12, "onRequestPut");
async function onRequestDelete13(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const subcategory = await env.DB.prepare(
      "SELECT name FROM subcategories WHERE id = ?"
    ).bind(id).first();
    if (!subcategory) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "UPDATE blog_posts SET subcategory = NULL WHERE subcategory = ?"
    ).bind(subcategory.name).run();
    const result = await env.DB.prepare(
      "DELETE FROM subcategories WHERE id = ?"
    ).bind(id).run();
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Subcategory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (env.KV) {
      try {
        await env.KV.delete("categories_cache");
      } catch (e) {
        console.error("KV delete error:", e);
      }
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
__name(onRequestDelete13, "onRequestDelete13");
__name2(onRequestDelete13, "onRequestDelete");
async function onRequestGet32(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const subscriber = await env.DB.prepare(
      "SELECT * FROM email_subscribers WHERE id = ?"
    ).bind(id).first();
    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    subscriber.preferences = subscriber.preferences ? JSON.parse(subscriber.preferences) : {};
    subscriber.tags = subscriber.tags ? JSON.parse(subscriber.tags) : [];
    subscriber.custom_fields = subscriber.custom_fields ? JSON.parse(subscriber.custom_fields) : {};
    const { results: activity } = await env.DB.prepare(`
      SELECT es.*, ec.name as campaign_name, ec.subject as campaign_subject
      FROM email_sends es
      LEFT JOIN email_campaigns ec ON es.campaign_id = ec.id
      WHERE es.subscriber_id = ?
      ORDER BY es.created_at DESC
      LIMIT 10
    `).bind(id).all();
    return new Response(JSON.stringify({
      subscriber,
      activity: activity || []
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
__name(onRequestGet32, "onRequestGet32");
__name2(onRequestGet32, "onRequestGet");
async function onRequestPut13(context) {
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
    const updates = [];
    const values = [];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.status !== void 0) {
      updates.push("status = ?");
      values.push(data.status);
      if (data.status === "unsubscribed") {
        updates.push("unsubscribed_at = ?");
        values.push(now);
      }
    }
    if (data.preferences !== void 0) {
      updates.push("preferences = ?");
      values.push(JSON.stringify(data.preferences));
    }
    if (data.tags !== void 0) {
      updates.push("tags = ?");
      values.push(JSON.stringify(data.tags));
    }
    if (data.custom_fields !== void 0) {
      updates.push("custom_fields = ?");
      values.push(JSON.stringify(data.custom_fields));
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    await env.DB.prepare(`
      UPDATE email_subscribers SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const subscriber = await env.DB.prepare(
      "SELECT * FROM email_subscribers WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({ success: true, subscriber }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut13, "onRequestPut13");
__name2(onRequestPut13, "onRequestPut");
async function onRequestDelete14(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const subscriber = await env.DB.prepare(
      "SELECT email FROM email_subscribers WHERE id = ?"
    ).bind(id).first();
    if (!subscriber) {
      return new Response(JSON.stringify({ error: "Subscriber not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(
      "DELETE FROM email_subscribers WHERE id = ?"
    ).bind(id).run();
    return new Response(JSON.stringify({
      success: true,
      id,
      email: subscriber.email
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
__name(onRequestDelete14, "onRequestDelete14");
__name2(onRequestDelete14, "onRequestDelete");
async function onRequestGet33(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const tag = await env.DB.prepare(
      "SELECT * FROM tags WHERE id = ?"
    ).bind(id).first();
    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(tag), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet33, "onRequestGet33");
__name2(onRequestGet33, "onRequestGet");
async function onRequestPut14(context) {
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
    const updates = [];
    const values = [];
    if (data.name !== void 0) {
      updates.push("name = ?");
      values.push(data.name);
      if (!data.slug) {
        updates.push("slug = ?");
        values.push(data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
      }
    }
    if (data.slug !== void 0) {
      updates.push("slug = ?");
      values.push(data.slug);
    }
    if (data.description !== void 0) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.color !== void 0) {
      updates.push("color = ?");
      values.push(data.color);
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No valid fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(id);
    await env.DB.prepare(`
      UPDATE tags SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const tag = await env.DB.prepare(
      "SELECT * FROM tags WHERE id = ?"
    ).bind(id).first();
    return new Response(JSON.stringify({ success: true, tag }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut14, "onRequestPut14");
__name2(onRequestPut14, "onRequestPut");
async function onRequestDelete15(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    await env.DB.prepare(
      "DELETE FROM post_tags WHERE tag_id = ?"
    ).bind(id).run();
    const result = await env.DB.prepare(
      "DELETE FROM tags WHERE id = ?"
    ).bind(id).run();
    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
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
__name(onRequestDelete15, "onRequestDelete15");
__name2(onRequestDelete15, "onRequestDelete");
async function onRequestGet34(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const ticket = await env.DB.prepare(`
      SELECT * FROM support_tickets 
      WHERE id = ? OR ticket_number = ?
    `).bind(id, id).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { results: messages } = await env.DB.prepare(`
      SELECT * FROM support_messages 
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).bind(ticket.id).all();
    const { results: attachments } = await env.DB.prepare(`
      SELECT * FROM ticket_attachments
      WHERE ticket_id = ?
      ORDER BY created_at ASC
    `).bind(ticket.id).all();
    ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];
    messages.forEach((msg) => {
      msg.attachments = msg.attachments ? JSON.parse(msg.attachments) : [];
    });
    return new Response(JSON.stringify({
      success: true,
      data: {
        ticket,
        messages,
        attachments
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet34, "onRequestGet34");
__name2(onRequestGet34, "onRequestGet");
async function onRequestPut15(context) {
  const { request, env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const existing = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(id, id).first();
    if (!existing) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const updates = [];
    const values = [];
    if (data.status !== void 0) {
      updates.push("status = ?");
      values.push(data.status);
      if (data.status === "resolved" && existing.status !== "resolved") {
        updates.push("resolved_at = ?");
        values.push(now);
      }
      if (data.status === "closed" && existing.status !== "closed") {
        updates.push("closed_at = ?");
        values.push(now);
      }
      if (data.status === "open" && existing.status === "closed") {
        updates.push("reopened_count = reopened_count + 1");
      }
    }
    if (data.priority !== void 0) {
      updates.push("priority = ?");
      values.push(data.priority);
    }
    if (data.category !== void 0) {
      updates.push("category = ?");
      values.push(data.category);
    }
    if (data.assignee_id !== void 0) {
      updates.push("assignee_id = ?");
      values.push(data.assignee_id);
    }
    if (data.assignee_name !== void 0) {
      updates.push("assignee_name = ?");
      values.push(data.assignee_name);
    }
    if (data.tags !== void 0) {
      updates.push("tags = ?");
      values.push(JSON.stringify(data.tags));
    }
    if (data.internal_notes !== void 0) {
      updates.push("internal_notes = ?");
      values.push(data.internal_notes);
    }
    if (data.resolution !== void 0) {
      updates.push("resolution = ?");
      values.push(data.resolution);
    }
    if (data.satisfaction_rating !== void 0) {
      updates.push("satisfaction_rating = ?");
      values.push(data.satisfaction_rating);
    }
    if (data.satisfaction_feedback !== void 0) {
      updates.push("satisfaction_feedback = ?");
      values.push(data.satisfaction_feedback);
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push(existing.id);
    await env.DB.prepare(`
      UPDATE support_tickets SET ${updates.join(", ")} WHERE id = ?
    `).bind(...values).run();
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ?"
    ).bind(existing.id).first();
    ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${existing.ticket_number}`);
      } catch (e) {
      }
    }
    return new Response(JSON.stringify({
      success: true,
      data: { ticket }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut15, "onRequestPut15");
__name2(onRequestPut15, "onRequestPut");
async function onRequestDelete16(context) {
  const { env, params } = context;
  const id = params.id;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(id, id).first();
    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (env.MEDIA_BUCKET) {
      const { results: attachments } = await env.DB.prepare(
        "SELECT r2_key FROM ticket_attachments WHERE ticket_id = ?"
      ).bind(ticket.id).all();
      for (const att of attachments) {
        try {
          await env.MEDIA_BUCKET.delete(att.r2_key);
        } catch (e) {
          console.error("Error deleting attachment:", e);
        }
      }
    }
    await env.DB.prepare(
      "DELETE FROM support_tickets WHERE id = ?"
    ).bind(ticket.id).run();
    if (env.KV) {
      try {
        await env.KV.delete(`ticket_${ticket.ticket_number}`);
      } catch (e) {
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Ticket #${ticket.ticket_number} deleted`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete16, "onRequestDelete16");
__name2(onRequestDelete16, "onRequestDelete");
async function onRequestGet35(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const includeSubcategories = url.searchParams.get("include_subcategories") !== "false";
  const activeOnly = url.searchParams.get("active_only") !== "false";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let categoryQuery = "SELECT * FROM categories";
    if (activeOnly) {
      categoryQuery += " WHERE is_active = 1";
    }
    categoryQuery += " ORDER BY sort_order ASC, name ASC";
    const { results: categories } = await env.DB.prepare(categoryQuery).all();
    if (includeSubcategories && categories.length > 0) {
      let subQuery = "SELECT * FROM subcategories";
      if (activeOnly) {
        subQuery += " WHERE is_active = 1";
      }
      subQuery += " ORDER BY sort_order ASC, name ASC";
      const { results: subcategories } = await env.DB.prepare(subQuery).all();
      const categoriesWithSubs = categories.map((cat) => ({
        ...cat,
        subcategories: subcategories.filter((sub) => sub.parent_category_id === cat.id)
      }));
      return new Response(JSON.stringify(categoriesWithSubs), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(categories), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet35, "onRequestGet35");
__name2(onRequestGet35, "onRequestGet");
async function onRequestPost27(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Category name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = `cat_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await env.DB.prepare(
      "SELECT id FROM categories WHERE slug = ?"
    ).bind(slug).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "A category with this slug already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const maxOrder = await env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM categories"
    ).first();
    const category = {
      id,
      name: data.name,
      slug,
      description: data.description || "",
      color: data.color || "#478ac9",
      icon: data.icon || null,
      post_count: 0,
      sort_order: (maxOrder?.max_order || 0) + 1,
      is_active: data.is_active !== false ? 1 : 0,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO categories (
        id, name, slug, description, color, icon, post_count,
        sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category.id,
      category.name,
      category.slug,
      category.description,
      category.color,
      category.icon,
      category.post_count,
      category.sort_order,
      category.is_active,
      category.created_at,
      category.updated_at
    ).run();
    if (env.KV) {
      try {
        await env.KV.delete("categories_cache");
      } catch (e) {
        console.error("KV cache clear error:", e);
      }
    }
    return new Response(JSON.stringify({ success: true, category }), {
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
__name(onRequestPost27, "onRequestPost27");
__name2(onRequestPost27, "onRequestPost");
async function onRequestGet36(context) {
  const { env } = context;
  try {
    let settings = {};
    let assistants = [];
    if (env.DB) {
      const { results: settingsRows } = await env.DB.prepare(
        "SELECT key, value, type FROM chatbot_settings"
      ).all();
      settingsRows?.forEach((row) => {
        let value = row.value;
        if (row.type === "boolean") value = row.value === "true";
        else if (row.type === "number") value = parseInt(row.value);
        else if (row.type === "json") {
          try {
            value = JSON.parse(row.value);
          } catch (e) {
          }
        }
        settings[row.key] = value;
      });
      const { results: assistantRows } = await env.DB.prepare(
        "SELECT id, name, description, type FROM ai_assistants WHERE is_active = 1"
      ).all();
      assistants = assistantRows || [];
    }
    return new Response(JSON.stringify({
      success: true,
      enabled: settings.enabled !== false,
      config: {
        chatbotName: settings.chatbot_name || "Fooodis Assistant",
        welcomeMessage: settings.welcome_message || "Hello! How can I help you today?",
        position: settings.widget_position || "bottom-right",
        color: settings.widget_color || "#e8f24c",
        languages: settings.supported_languages || ["en", "sv"],
        enableRating: settings.enable_rating !== false,
        enableLeadCapture: settings.enable_lead_capture !== false
      },
      assistants
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: true, enabled: true, config: {} }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet36, "onRequestGet36");
__name2(onRequestGet36, "onRequestGet");
async function onRequestPost28(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { message, conversationId, visitorId, assistantId, language } = data;
    if (!message) {
      return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    let convId = conversationId;
    let threadId = data.threadId;
    if (env.DB) {
      if (!convId) {
        convId = `conv_${crypto.randomUUID().split("-")[0]}`;
        await env.DB.prepare(`
          INSERT INTO chatbot_conversations (
            id, visitor_id, assistant_id, language, status, 
            first_message_at, last_message_at, message_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'active', ?, ?, 1, ?, ?)
        `).bind(
          convId,
          visitorId || null,
          assistantId || null,
          language || "en",
          now,
          now,
          now,
          now
        ).run();
      } else {
        await env.DB.prepare(`
          UPDATE chatbot_conversations 
          SET message_count = message_count + 1, last_message_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(now, now, convId).run();
      }
      await env.DB.prepare(`
        INSERT INTO chatbot_messages (id, conversation_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `).bind(`msg_${crypto.randomUUID().split("-")[0]}`, convId, message, now).run();
    }
    let apiKey = null;
    if (env.KV) {
      apiKey = await env.KV.get("OPENAI_API_KEY");
    }
    if (!apiKey && env.OPENAI_API_KEY) {
      apiKey = env.OPENAI_API_KEY;
    }
    let assistant = null;
    let systemPrompt = "You are a helpful assistant for Fooodis, a food delivery and restaurant management platform. Help users with their questions about food, restaurants, and the platform.";
    if (env.DB && assistantId) {
      assistant = await env.DB.prepare(
        "SELECT * FROM ai_assistants WHERE id = ? OR openai_assistant_id = ?"
      ).bind(assistantId, assistantId).first();
      if (assistant?.instructions) {
        systemPrompt = assistant.instructions;
      }
    }
    let aiResponse = "I'm here to help! However, I'm currently unable to process your request. Please try again later.";
    let tokensUsed = 0;
    const startTime = Date.now();
    if (apiKey) {
      try {
        if (assistant?.openai_assistant_id) {
          const response = await callOpenAIAssistant(apiKey, assistant.openai_assistant_id, message, threadId);
          aiResponse = response.message;
          threadId = response.threadId;
          tokensUsed = response.tokens || 0;
        } else {
          const response = await callOpenAIChatCompletion(apiKey, systemPrompt, message, assistant?.model || "gpt-4");
          aiResponse = response.message;
          tokensUsed = response.tokens || 0;
        }
      } catch (error) {
        console.error("OpenAI API error:", error);
        aiResponse = getErrorResponse(language);
      }
    }
    const responseTime = Date.now() - startTime;
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO chatbot_messages (
          id, conversation_id, role, content, assistant_id, assistant_name, 
          tokens_used, response_time_ms, created_at
        ) VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?, ?)
      `).bind(
        `msg_${crypto.randomUUID().split("-")[0]}`,
        convId,
        aiResponse,
        assistantId || null,
        assistant?.name || "Fooodis Assistant",
        tokensUsed,
        responseTime,
        Date.now()
      ).run();
      if (threadId) {
        await env.DB.prepare(
          "UPDATE chatbot_conversations SET thread_id = ? WHERE id = ?"
        ).bind(threadId, convId).run();
      }
      await updateDailyAnalytics(env.DB, tokensUsed);
    }
    return new Response(JSON.stringify({
      success: true,
      conversationId: convId,
      threadId,
      message: aiResponse,
      tokensUsed,
      responseTimeMs: responseTime
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost28, "onRequestPost28");
__name2(onRequestPost28, "onRequestPost");
async function callOpenAIChatCompletion(apiKey, systemPrompt, userMessage, model) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1e3,
      temperature: 0.7
    })
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  const data = await response.json();
  return {
    message: data.choices[0]?.message?.content || "No response generated.",
    tokens: data.usage?.total_tokens || 0
  };
}
__name(callOpenAIChatCompletion, "callOpenAIChatCompletion");
__name2(callOpenAIChatCompletion, "callOpenAIChatCompletion");
async function callOpenAIAssistant(apiKey, assistantId, userMessage, existingThreadId) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "OpenAI-Beta": "assistants=v2"
  };
  let threadId = existingThreadId;
  if (!threadId) {
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers
    });
    const threadData = await threadResponse.json();
    threadId = threadData.id;
  }
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ role: "user", content: userMessage })
  });
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: "POST",
    headers,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  const runData = await runResponse.json();
  let run = runData;
  let attempts = 0;
  while (run.status !== "completed" && run.status !== "failed" && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, { headers });
    run = await statusResponse.json();
    attempts++;
  }
  if (run.status !== "completed") {
    throw new Error("Assistant run did not complete");
  }
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, { headers });
  const messagesData = await messagesResponse.json();
  const assistantMessage = messagesData.data[0]?.content[0]?.text?.value || "No response generated.";
  return {
    message: assistantMessage,
    threadId,
    tokens: run.usage?.total_tokens || 0
  };
}
__name(callOpenAIAssistant, "callOpenAIAssistant");
__name2(callOpenAIAssistant, "callOpenAIAssistant");
async function updateDailyAnalytics(db, tokensUsed) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  try {
    await db.prepare(`
      INSERT INTO chatbot_analytics (id, date, total_messages, total_tokens_used, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET 
        total_messages = total_messages + 1,
        total_tokens_used = total_tokens_used + ?,
        updated_at = ?
    `).bind(
      `analytics_${today}`,
      today,
      tokensUsed,
      Date.now(),
      Date.now(),
      tokensUsed,
      Date.now()
    ).run();
  } catch (e) {
    console.error("Analytics update error:", e);
  }
}
__name(updateDailyAnalytics, "updateDailyAnalytics");
__name2(updateDailyAnalytics, "updateDailyAnalytics");
function getErrorResponse(language) {
  const errors = {
    en: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    sv: "Jag ber om urs\xE4kt, men jag har problem med att behandla din f\xF6rfr\xE5gan just nu. V\xE4nligen f\xF6rs\xF6k igen om en stund."
  };
  return errors[language] || errors.en;
}
__name(getErrorResponse, "getErrorResponse");
__name2(getErrorResponse, "getErrorResponse");
async function onRequestGet37(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT id, email, name, phone, company, status, email_verified, last_login, total_tickets, created_at FROM support_customers";
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ? OR company LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const { results: customers } = await env.DB.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM support_customers";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 ? await countStmt.bind(...countParams).first() : await countStmt.first();
    return new Response(JSON.stringify({
      success: true,
      data: {
        customers,
        pagination: {
          total: countResult?.total || 0,
          limit,
          offset
        }
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet37, "onRequestGet37");
__name2(onRequestGet37, "onRequestGet");
async function onRequestPost29(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const email = data.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existing = await env.DB.prepare(
      "SELECT id, email, name FROM support_customers WHERE email = ?"
    ).bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: true,
        message: "Customer already exists",
        existing: true,
        data: {
          customer: {
            id: existing.id,
            email: existing.email,
            name: existing.name
          }
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (data.password && data.password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const customerId = `cust_${crypto.randomUUID().split("-")[0]}`;
    let passwordHash = null;
    if (data.password) {
      passwordHash = await hashPassword3(data.password);
    }
    const verificationToken = crypto.randomUUID();
    const customer = {
      id: customerId,
      email,
      name: data.name || email.split("@")[0],
      phone: data.phone || null,
      company: data.company || null,
      password_hash: passwordHash,
      status: "active",
      email_verified: 0,
      verification_token: verificationToken,
      preferences: data.preferences ? JSON.stringify(data.preferences) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO support_customers (
        id, email, name, phone, company, password_hash, status,
        email_verified, verification_token, preferences, metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customer.id,
      customer.email,
      customer.name,
      customer.phone,
      customer.company,
      customer.password_hash,
      customer.status,
      customer.email_verified,
      customer.verification_token,
      customer.preferences,
      customer.metadata,
      customer.created_at,
      customer.updated_at
    ).run();
    const authToken = await generateToken2(customerId, email);
    if (env.KV) {
      try {
        await env.KV.put(`auth_${authToken}`, JSON.stringify({
          customer_id: customerId,
          email,
          created_at: now
        }), { expirationTtl: 86400 * 7 });
      } catch (e) {
        console.error("KV error:", e);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Registration successful",
      data: {
        customer: {
          id: customerId,
          email: customer.email,
          name: customer.name
        },
        token: authToken
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint")) {
      return new Response(JSON.stringify({ success: false, error: "Email already registered" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost29, "onRequestPost29");
__name2(onRequestPost29, "onRequestPost");
async function hashPassword3(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "fooodis_support_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword3, "hashPassword3");
__name2(hashPassword3, "hashPassword");
async function generateToken2(customerId, email) {
  const data = `${customerId}:${email}:${Date.now()}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateToken2, "generateToken2");
__name2(generateToken2, "generateToken");
var ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "application/pdf"
];
var MAX_FILE_SIZE = 10 * 1024 * 1024;
async function onRequestGet38(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") || null;
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM media_library";
    let params = [];
    if (folder) {
      query += " WHERE folder = ?";
      params.push(folder);
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const stmt = env.DB.prepare(query);
    const { results } = await stmt.bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM media_library";
    if (folder) {
      countQuery += " WHERE folder = ?";
    }
    const countStmt = env.DB.prepare(countQuery);
    const countResult = folder ? await countStmt.bind(folder).first() : await countStmt.first();
    return new Response(JSON.stringify({
      media: results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: offset + results.length < (countResult?.total || 0)
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
__name(onRequestGet38, "onRequestGet38");
__name2(onRequestGet38, "onRequestGet");
async function onRequestPost30(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const folder = formData.get("folder") || "uploads";
      const altText = formData.get("alt_text") || "";
      const caption = formData.get("caption") || "";
      const postId = formData.get("post_id") || null;
      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({
          error: "File type not allowed",
          allowed: ALLOWED_MIME_TYPES
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (file.size > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({
          error: "File too large",
          maxSize: MAX_FILE_SIZE
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const id = crypto.randomUUID();
      const ext = file.name.split(".").pop() || "bin";
      const timestamp = Date.now();
      const r2Key = `${folder}/${timestamp}-${id}.${ext}`;
      const fileBuffer = await file.arrayBuffer();
      await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
        httpMetadata: {
          contentType: file.type
        },
        customMetadata: {
          originalFilename: file.name,
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const r2Url = `/api/media/serve/${encodeURIComponent(r2Key)}`;
      let width = null;
      let height = null;
      const now = Date.now();
      await env.DB.prepare(`
        INSERT INTO media_library (
          id, filename, original_filename, mime_type, file_size,
          width, height, r2_key, r2_url, alt_text, caption, folder,
          post_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        `${timestamp}-${id}.${ext}`,
        file.name,
        file.type,
        file.size,
        width,
        height,
        r2Key,
        r2Url,
        altText,
        caption,
        folder,
        postId,
        now,
        now
      ).run();
      return new Response(JSON.stringify({
        success: true,
        media: {
          id,
          filename: `${timestamp}-${id}.${ext}`,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          r2_key: r2Key,
          r2_url: r2Url,
          url: r2Url,
          // Alias for convenience
          alt_text: altText,
          caption,
          folder
        }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Media upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost30, "onRequestPost30");
__name2(onRequestPost30, "onRequestPost");
async function onRequestGet39(context) {
  const { env, request } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let profile = await env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = 'admin'"
    ).first();
    if (!profile) {
      const now = Date.now();
      const defaultProfile = {
        user_id: "admin",
        display_name: "Admin User",
        email: "admin@fooodis.com",
        role: "Administrator",
        bio: "",
        avatar_url: null,
        social_links: JSON.stringify({}),
        preferences: JSON.stringify({
          theme: "dark",
          notifications: true,
          language: "en"
        }),
        created_at: now,
        updated_at: now
      };
      await env.DB.prepare(`
        INSERT INTO user_profiles (
          user_id, display_name, email, role, bio, avatar_url, 
          social_links, preferences, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        defaultProfile.user_id,
        defaultProfile.display_name,
        defaultProfile.email,
        defaultProfile.role,
        defaultProfile.bio,
        defaultProfile.avatar_url,
        defaultProfile.social_links,
        defaultProfile.preferences,
        defaultProfile.created_at,
        defaultProfile.updated_at
      ).run();
      profile = defaultProfile;
    }
    const formattedProfile = {
      ...profile,
      social_links: profile.social_links ? JSON.parse(profile.social_links) : {},
      preferences: profile.preferences ? JSON.parse(profile.preferences) : {}
    };
    return new Response(JSON.stringify(formattedProfile), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet39, "onRequestGet39");
__name2(onRequestGet39, "onRequestGet");
async function onRequestPut16(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const updates = [];
    const values = [];
    if (data.display_name !== void 0) {
      updates.push("display_name = ?");
      values.push(data.display_name);
    }
    if (data.email !== void 0) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.role !== void 0) {
      updates.push("role = ?");
      values.push(data.role);
    }
    if (data.bio !== void 0) {
      updates.push("bio = ?");
      values.push(data.bio);
    }
    if (data.avatar_url !== void 0) {
      updates.push("avatar_url = ?");
      values.push(data.avatar_url);
    }
    if (data.social_links !== void 0) {
      updates.push("social_links = ?");
      values.push(JSON.stringify(data.social_links));
    }
    if (data.preferences !== void 0) {
      updates.push("preferences = ?");
      values.push(JSON.stringify(data.preferences));
    }
    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    updates.push("updated_at = ?");
    values.push(now);
    values.push("admin");
    await env.DB.prepare(`
      UPDATE user_profiles SET ${updates.join(", ")} WHERE user_id = ?
    `).bind(...values).run();
    const profile = await env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = 'admin'"
    ).first();
    if (data.display_name) {
      await env.DB.prepare(
        "UPDATE blog_posts SET author = ? WHERE author = 'Admin' OR author = 'Admin User'"
      ).bind(data.display_name).run();
    }
    return new Response(JSON.stringify({
      success: true,
      profile: {
        ...profile,
        social_links: profile.social_links ? JSON.parse(profile.social_links) : {},
        preferences: profile.preferences ? JSON.parse(profile.preferences) : {}
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
__name(onRequestPut16, "onRequestPut16");
__name2(onRequestPut16, "onRequestPut");
async function onRequestGet40(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const fromDate = url.searchParams.get("from_date");
  const toDate = url.searchParams.get("to_date");
  const automationPathId = url.searchParams.get("automation_path_id");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const includePublished = url.searchParams.get("include_published") === "true";
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
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    const countStmt = env.DB.prepare(countQuery);
    const countResult = params.length > 0 ? await countStmt.bind(...params).first() : await countStmt.first();
    const posts = results.map((post) => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : [],
      scheduled_date: new Date(post.scheduled_datetime).toISOString(),
      is_featured: post.is_featured === 1
    }));
    const groupedByDate = {};
    posts.forEach((post) => {
      const dateKey = new Date(post.scheduled_datetime).toISOString().split("T")[0];
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
        hasMore: offset + posts.length < (countResult?.total || 0)
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
__name(onRequestGet40, "onRequestGet40");
__name2(onRequestGet40, "onRequestGet");
async function onRequestPost31(context) {
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
    if (!data.scheduled_datetime && !data.scheduledDate) {
      return new Response(JSON.stringify({ error: "Scheduled date/time is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = crypto.randomUUID();
    const now = Date.now();
    let scheduledDatetime;
    if (data.scheduled_datetime) {
      scheduledDatetime = typeof data.scheduled_datetime === "number" ? data.scheduled_datetime : new Date(data.scheduled_datetime).getTime();
    } else if (data.scheduledDate) {
      scheduledDatetime = new Date(data.scheduledDate).getTime();
    }
    if (scheduledDatetime <= now) {
      return new Response(JSON.stringify({ error: "Cannot schedule in the past" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const post = {
      id,
      title: data.title,
      content: data.content || "",
      excerpt: data.excerpt || "",
      image_url: data.image_url || data.imageUrl || "",
      category: data.category || "Uncategorized",
      subcategory: data.subcategory || null,
      tags: JSON.stringify(data.tags || []),
      author: data.author || "Admin",
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      scheduled_datetime: scheduledDatetime,
      timezone: data.timezone || "UTC",
      source: data.source || "manual",
      automation_path_id: data.automation_path_id || data.automationPathId || null,
      automation_path_name: data.automation_path_name || data.automationPathName || null,
      generation_log_id: data.generation_log_id || data.generationLogId || null,
      status: "pending",
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
      post.id,
      post.title,
      post.content,
      post.excerpt,
      post.image_url,
      post.category,
      post.subcategory,
      post.tags,
      post.author,
      post.slug,
      post.scheduled_datetime,
      post.timezone,
      post.source,
      post.automation_path_id,
      post.automation_path_name,
      post.generation_log_id,
      post.status,
      post.is_featured,
      post.priority,
      post.notify_on_publish,
      post.created_at,
      post.updated_at
    ).run();
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
__name(onRequestPost31, "onRequestPost31");
__name2(onRequestPost31, "onRequestPost");
var KV_SETTINGS_KEY = "blog_settings";
var KV_CACHE_TTL2 = 3600;
async function onRequestGet41(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (env.KV) {
    try {
      const cached = await env.KV.get(KV_SETTINGS_KEY, "json");
      if (cached) {
        if (key) {
          const setting = cached.find((s) => s.key === key);
          return new Response(JSON.stringify(setting || { error: "Setting not found" }), {
            status: setting ? 200 : 404,
            headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
          });
        }
        return new Response(JSON.stringify(cached), {
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" }
        });
      }
    } catch (e) {
      console.error("KV read error:", e);
    }
  }
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM blog_settings";
    if (key) {
      query += " WHERE key = ?";
    }
    query += " ORDER BY key ASC";
    const stmt = env.DB.prepare(query);
    const { results } = key ? await stmt.bind(key).all() : await stmt.all();
    const settings = results.map((setting) => ({
      ...setting,
      value: parseSettingValue(setting.value, setting.type)
    }));
    if (env.KV && !key) {
      try {
        await env.KV.put(KV_SETTINGS_KEY, JSON.stringify(settings), {
          expirationTtl: KV_CACHE_TTL2
        });
      } catch (e) {
        console.error("KV write error:", e);
      }
    }
    if (key) {
      const setting = settings[0];
      return new Response(JSON.stringify(setting || { error: "Setting not found" }), {
        status: setting ? 200 : 404,
        headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    }
    return new Response(JSON.stringify(settings), {
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet41, "onRequestGet41");
__name2(onRequestGet41, "onRequestGet");
async function onRequestPut17(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const now = Date.now();
    const updates = [];
    if (data.key && data.value !== void 0) {
      updates.push({ key: data.key, value: data.value, type: data.type });
    } else if (data.settings && Array.isArray(data.settings)) {
      updates.push(...data.settings);
    } else {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    for (const setting of updates) {
      if (!setting.key) continue;
      let type = setting.type;
      if (!type) {
        if (typeof setting.value === "boolean") type = "boolean";
        else if (typeof setting.value === "number") type = "number";
        else if (typeof setting.value === "object") type = "json";
        else type = "string";
      }
      const valueStr = type === "json" ? JSON.stringify(setting.value) : String(setting.value);
      await env.DB.prepare(`
        INSERT INTO blog_settings (key, value, type, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          updated_at = excluded.updated_at
      `).bind(setting.key, valueStr, type, now).run();
    }
    if (env.KV) {
      try {
        await env.KV.delete(KV_SETTINGS_KEY);
      } catch (e) {
        console.error("KV delete error:", e);
      }
    }
    const { results } = await env.DB.prepare(
      "SELECT * FROM blog_settings ORDER BY key ASC"
    ).all();
    const settings = results.map((s) => ({
      ...s,
      value: parseSettingValue(s.value, s.type)
    }));
    if (env.KV) {
      try {
        await env.KV.put(KV_SETTINGS_KEY, JSON.stringify(settings), {
          expirationTtl: KV_CACHE_TTL2
        });
      } catch (e) {
        console.error("KV write error:", e);
      }
    }
    return new Response(JSON.stringify({ success: true, settings }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut17, "onRequestPut17");
__name2(onRequestPut17, "onRequestPut");
async function onRequestPost32(context) {
  return onRequestPut17(context);
}
__name(onRequestPost32, "onRequestPost32");
__name2(onRequestPost32, "onRequestPost");
function parseSettingValue(value, type) {
  switch (type) {
    case "boolean":
      return value === "true" || value === "1" || value === true;
    case "number":
      return Number(value);
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}
__name(parseSettingValue, "parseSettingValue");
__name2(parseSettingValue, "parseSettingValue");
async function onRequestGet42(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "30d";
  const type = url.searchParams.get("type") || "overview";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const now = Date.now();
    let startTime = 0;
    switch (period) {
      case "7d":
        startTime = now - 7 * 24 * 60 * 60 * 1e3;
        break;
      case "30d":
        startTime = now - 30 * 24 * 60 * 60 * 1e3;
        break;
      case "90d":
        startTime = now - 90 * 24 * 60 * 60 * 1e3;
        break;
      default:
        startTime = 0;
    }
    let stats = {};
    if (type === "overview" || type === "all") {
      const postsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'"
      ).first();
      const viewsTotal = await env.DB.prepare(
        "SELECT SUM(views) as total, SUM(unique_views) as unique_total FROM post_stats"
      ).first();
      const commentsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM comments WHERE status = 'approved'"
      ).first();
      const sharesTotal = await env.DB.prepare(
        "SELECT SUM(shares_total) as total FROM post_stats"
      ).first();
      const categoriesCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM categories WHERE is_active = 1"
      ).first();
      const tagsCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM tags"
      ).first();
      const scheduledCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM scheduled_posts WHERE status = 'pending'"
      ).first();
      const mediaCount = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM media_library"
      ).first();
      const avgReadTime = await env.DB.prepare(
        "SELECT AVG(avg_read_time) as average FROM post_stats WHERE avg_read_time > 0"
      ).first();
      stats.overview = {
        totalPosts: postsCount?.total || 0,
        totalViews: viewsTotal?.total || 0,
        uniqueViews: viewsTotal?.unique_total || 0,
        totalComments: commentsCount?.total || 0,
        totalShares: sharesTotal?.total || 0,
        totalCategories: categoriesCount?.total || 0,
        totalTags: tagsCount?.total || 0,
        scheduledPosts: scheduledCount?.total || 0,
        mediaFiles: mediaCount?.total || 0,
        averageReadTime: Math.round((avgReadTime?.average || 0) / 60)
        // Convert to minutes
      };
    }
    if (type === "posts" || type === "all") {
      const { results: topPosts } = await env.DB.prepare(`
        SELECT p.id, p.title, p.category, p.published_date, 
               ps.views, ps.unique_views, ps.shares_total
        FROM blog_posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE p.status = 'published'
        ORDER BY ps.views DESC
        LIMIT 10
      `).all();
      const { results: recentPosts } = await env.DB.prepare(`
        SELECT p.id, p.title, p.category, p.published_date,
               ps.views, ps.unique_views, ps.shares_total
        FROM blog_posts p
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC
        LIMIT 10
      `).all();
      stats.posts = {
        topPosts: topPosts || [],
        recentPosts: recentPosts || []
      };
    }
    if (type === "categories" || type === "all") {
      const { results: categoryStats } = await env.DB.prepare(`
        SELECT c.name, c.post_count, c.color,
               SUM(ps.views) as total_views,
               SUM(ps.shares_total) as total_shares
        FROM categories c
        LEFT JOIN blog_posts p ON c.name = p.category
        LEFT JOIN post_stats ps ON p.id = ps.post_id
        WHERE c.is_active = 1
        GROUP BY c.id, c.name
        ORDER BY total_views DESC
      `).all();
      stats.categories = categoryStats || [];
    }
    if (type === "trends" || type === "all") {
      let dailyViews = [];
      try {
        const { results } = await env.DB.prepare(`
          SELECT DATE(created_at / 1000, 'unixepoch') as date,
                 COUNT(*) as views,
                 COUNT(DISTINCT visitor_id) as unique_views
          FROM page_views
          WHERE created_at >= ?
          GROUP BY date
          ORDER BY date ASC
        `).bind(startTime).all();
        dailyViews = results || [];
      } catch (e) {
        dailyViews = [];
      }
      const previousStart = startTime - (now - startTime);
      let currentViews = 0, previousViews = 0;
      try {
        const current = await env.DB.prepare(
          "SELECT SUM(views) as total FROM page_views WHERE created_at >= ?"
        ).bind(startTime).first();
        currentViews = current?.total || 0;
        const previous = await env.DB.prepare(
          "SELECT SUM(views) as total FROM page_views WHERE created_at >= ? AND created_at < ?"
        ).bind(previousStart, startTime).first();
        previousViews = previous?.total || 0;
      } catch (e) {
      }
      const viewsChange = previousViews > 0 ? (currentViews - previousViews) / previousViews * 100 : 0;
      stats.trends = {
        dailyViews,
        viewsChange: Math.round(viewsChange * 10) / 10,
        period
      };
    }
    if (env.KV) {
      try {
        await env.KV.put(`stats_${type}_${period}`, JSON.stringify(stats), { expirationTtl: 300 });
      } catch (e) {
        console.error("KV cache error:", e);
      }
    }
    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet42, "onRequestGet42");
__name2(onRequestGet42, "onRequestGet");
async function onRequestPost33(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    const { type, post_id, event_data } = data;
    const now = Date.now();
    const visitorId = request.headers.get("X-Visitor-ID") || request.headers.get("CF-Connecting-IP") || crypto.randomUUID();
    switch (type) {
      case "page_view":
        try {
          await env.DB.prepare(`
            INSERT INTO page_views (id, post_id, visitor_id, page_url, referrer, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            post_id || null,
            visitorId,
            data.page_url || "",
            data.referrer || "",
            request.headers.get("User-Agent") || "",
            now
          ).run();
        } catch (e) {
        }
        if (post_id) {
          await env.DB.prepare(`
            INSERT INTO post_stats (id, post_id, views, unique_views, updated_at)
            VALUES (?, ?, 1, 1, ?)
            ON CONFLICT(post_id) DO UPDATE SET 
              views = views + 1,
              updated_at = ?
          `).bind(
            `stats_${post_id}`,
            post_id,
            now,
            now
          ).run();
        }
        break;
      case "share":
        const platform = data.platform || "other";
        const shareColumn = `shares_${platform}`;
        if (post_id) {
          await env.DB.prepare(`
            UPDATE post_stats SET 
              ${shareColumn} = ${shareColumn} + 1,
              shares_total = shares_total + 1,
              updated_at = ?
            WHERE post_id = ?
          `).bind(now, post_id).run();
        }
        break;
      case "read_time":
        if (post_id && data.read_time) {
          await env.DB.prepare(`
            UPDATE post_stats SET 
              avg_read_time = (avg_read_time + ?) / 2,
              updated_at = ?
            WHERE post_id = ?
          `).bind(data.read_time, now, post_id).run();
        }
        break;
      case "event":
        try {
          await env.DB.prepare(`
            INSERT INTO analytics_events (id, event_type, event_data, visitor_id, created_at)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            data.event_type || "unknown",
            JSON.stringify(event_data || {}),
            visitorId,
            now
          ).run();
        } catch (e) {
        }
        break;
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost33, "onRequestPost33");
__name2(onRequestPost33, "onRequestPost");
async function onRequestGet43(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const parentId = url.searchParams.get("parent_id");
  const parentName = url.searchParams.get("parent_name");
  const activeOnly = url.searchParams.get("active_only") !== "false";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT s.*, c.name as parent_name FROM subcategories s LEFT JOIN categories c ON s.parent_category_id = c.id";
    const conditions = [];
    const params = [];
    if (parentId) {
      conditions.push("s.parent_category_id = ?");
      params.push(parentId);
    }
    if (parentName) {
      conditions.push("c.name = ?");
      params.push(parentName);
    }
    if (activeOnly) {
      conditions.push("s.is_active = 1");
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY s.sort_order ASC, s.name ASC";
    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet43, "onRequestGet43");
__name2(onRequestGet43, "onRequestGet");
async function onRequestPost34(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Subcategory name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!data.parent_category_id && !data.parent_name) {
      return new Response(JSON.stringify({ error: "Parent category is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let parentCategoryId = data.parent_category_id;
    if (!parentCategoryId && data.parent_name) {
      const parent = await env.DB.prepare(
        "SELECT id FROM categories WHERE name = ?"
      ).bind(data.parent_name).first();
      if (!parent) {
        return new Response(JSON.stringify({ error: "Parent category not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      parentCategoryId = parent.id;
    }
    const id = `subcat_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await env.DB.prepare(
      "SELECT id FROM subcategories WHERE slug = ? AND parent_category_id = ?"
    ).bind(slug, parentCategoryId).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "A subcategory with this slug already exists under this parent" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }
    const maxOrder = await env.DB.prepare(
      "SELECT MAX(sort_order) as max_order FROM subcategories WHERE parent_category_id = ?"
    ).bind(parentCategoryId).first();
    const subcategory = {
      id,
      name: data.name,
      slug,
      parent_category_id: parentCategoryId,
      description: data.description || "",
      post_count: 0,
      sort_order: (maxOrder?.max_order || 0) + 1,
      is_active: data.is_active !== false ? 1 : 0,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO subcategories (
        id, name, slug, parent_category_id, description,
        post_count, sort_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      subcategory.id,
      subcategory.name,
      subcategory.slug,
      subcategory.parent_category_id,
      subcategory.description,
      subcategory.post_count,
      subcategory.sort_order,
      subcategory.is_active,
      subcategory.created_at,
      subcategory.updated_at
    ).run();
    return new Response(JSON.stringify({ success: true, subcategory }), {
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
__name(onRequestPost34, "onRequestPost34");
__name2(onRequestPost34, "onRequestPost");
async function onRequestGet44(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const source = url.searchParams.get("source");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const sortBy = url.searchParams.get("sort") || "subscribed_at";
  const sortOrder = url.searchParams.get("order") || "DESC";
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM email_subscribers";
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (source) {
      conditions.push("source = ?");
      params.push(source);
    }
    if (search) {
      conditions.push("(email LIKE ? OR name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    const allowedSorts = ["email", "name", "status", "source", "subscribed_at", "created_at"];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : "subscribed_at";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const { results } = await env.DB.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM email_subscribers";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 ? await countStmt.bind(...countParams).first() : await countStmt.first();
    const statsResult = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM email_subscribers
    `).first();
    return new Response(JSON.stringify({
      subscribers: results || [],
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: offset + results.length < (countResult?.total || 0)
      },
      stats: {
        total: statsResult?.total || 0,
        active: statsResult?.active || 0,
        unsubscribed: statsResult?.unsubscribed || 0,
        bounced: statsResult?.bounced || 0
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
__name(onRequestGet44, "onRequestGet44");
__name2(onRequestGet44, "onRequestGet");
async function onRequestPost35(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const email = data.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existing = await env.DB.prepare(
      "SELECT id, status FROM email_subscribers WHERE email = ?"
    ).bind(email).first();
    if (existing) {
      if (existing.status === "active") {
        return new Response(JSON.stringify({
          success: true,
          message: "Already subscribed",
          existing: true,
          subscriber_id: existing.id
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        const now2 = Date.now();
        await env.DB.prepare(`
          UPDATE email_subscribers 
          SET status = 'active', subscribed_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(now2, now2, existing.id).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Subscription reactivated",
          reactivated: true,
          subscriber_id: existing.id
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    const id = `sub_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0] || null;
    const subscriber = {
      id,
      email,
      name: data.name || null,
      status: "active",
      source: data.source || "popup",
      ip_address: ip,
      country: request.cf?.country || null,
      subscribed_at: now,
      preferences: data.preferences ? JSON.stringify(data.preferences) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      custom_fields: data.custom_fields ? JSON.stringify(data.custom_fields) : null,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO email_subscribers (
        id, email, name, status, source, ip_address, country,
        subscribed_at, preferences, tags, custom_fields, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      subscriber.id,
      subscriber.email,
      subscriber.name,
      subscriber.status,
      subscriber.source,
      subscriber.ip_address,
      subscriber.country,
      subscriber.subscribed_at,
      subscriber.preferences,
      subscriber.tags,
      subscriber.custom_fields,
      subscriber.created_at,
      subscriber.updated_at
    ).run();
    return new Response(JSON.stringify({
      success: true,
      message: "Successfully subscribed",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error.message?.includes("UNIQUE constraint")) {
      return new Response(JSON.stringify({
        success: true,
        message: "Already subscribed",
        existing: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost35, "onRequestPost35");
__name2(onRequestPost35, "onRequestPost");
async function onRequestGet45(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const sortBy = url.searchParams.get("sort") || "name";
  const limit = parseInt(url.searchParams.get("limit")) || 100;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM tags";
    switch (sortBy) {
      case "count":
        query += " ORDER BY post_count DESC, name ASC";
        break;
      case "recent":
        query += " ORDER BY created_at DESC";
        break;
      default:
        query += " ORDER BY name ASC";
    }
    query += ` LIMIT ${limit}`;
    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet45, "onRequestGet45");
__name2(onRequestGet45, "onRequestGet");
async function onRequestPost36(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Tag name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const existing = await env.DB.prepare(
      "SELECT * FROM tags WHERE slug = ? OR name = ?"
    ).bind(slug, data.name).first();
    if (existing) {
      return new Response(JSON.stringify({
        success: true,
        tag: existing,
        existing: true
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = `tag_${crypto.randomUUID().split("-")[0]}`;
    const now = Date.now();
    const tag = {
      id,
      name: data.name,
      slug,
      description: data.description || "",
      color: data.color || "#e8f24c",
      post_count: 0,
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO tags (
        id, name, slug, description, color, post_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tag.id,
      tag.name,
      tag.slug,
      tag.description,
      tag.color,
      tag.post_count,
      tag.created_at,
      tag.updated_at
    ).run();
    return new Response(JSON.stringify({ success: true, tag }), {
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
__name(onRequestPost36, "onRequestPost36");
__name2(onRequestPost36, "onRequestPost");
async function onRequestPatch3(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.tags || !Array.isArray(data.tags)) {
      return new Response(JSON.stringify({ error: "Tags array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const results = [];
    const now = Date.now();
    for (const tagName of data.tags) {
      if (!tagName || typeof tagName !== "string") continue;
      const name = tagName.trim();
      if (!name) continue;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const existing = await env.DB.prepare(
        "SELECT * FROM tags WHERE slug = ?"
      ).bind(slug).first();
      if (existing) {
        results.push({ ...existing, existing: true });
      } else {
        const id = `tag_${crypto.randomUUID().split("-")[0]}`;
        const tag = {
          id,
          name,
          slug,
          description: "",
          color: "#e8f24c",
          post_count: 0,
          created_at: now,
          updated_at: now
        };
        await env.DB.prepare(`
          INSERT INTO tags (id, name, slug, description, color, post_count, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(tag.id, tag.name, tag.slug, tag.description, tag.color, tag.post_count, tag.created_at, tag.updated_at).run();
        results.push(tag);
      }
    }
    return new Response(JSON.stringify({ success: true, tags: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPatch3, "onRequestPatch3");
__name2(onRequestPatch3, "onRequestPatch");
async function onRequestGet46(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const customer = url.searchParams.get("customer");
  const customerId = url.searchParams.get("customer_id");
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const category = url.searchParams.get("category");
  const assignee = url.searchParams.get("assignee");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit")) || 50;
  const offset = parseInt(url.searchParams.get("offset")) || 0;
  const sortBy = url.searchParams.get("sort") || "created_at";
  const sortOrder = url.searchParams.get("order") || "DESC";
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    let query = "SELECT * FROM support_tickets";
    const conditions = [];
    const params = [];
    if (customer) {
      conditions.push("customer_email = ?");
      params.push(customer.toLowerCase());
    }
    if (customerId) {
      conditions.push("customer_id = ?");
      params.push(customerId);
    }
    if (status && status !== "all") {
      conditions.push("status = ?");
      params.push(status);
    }
    if (priority && priority !== "all") {
      conditions.push("priority = ?");
      params.push(priority);
    }
    if (category && category !== "all") {
      conditions.push("category = ?");
      params.push(category);
    }
    if (assignee) {
      conditions.push("assignee_id = ?");
      params.push(assignee);
    }
    if (search) {
      conditions.push("(subject LIKE ? OR description LIKE ? OR customer_name LIKE ? OR ticket_number LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    const allowedSorts = ["created_at", "updated_at", "priority", "status", "ticket_number"];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
    query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const { results: tickets } = await env.DB.prepare(query).bind(...params).all();
    let countQuery = "SELECT COUNT(*) as total FROM support_tickets";
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }
    const countParams = params.slice(0, -2);
    const countStmt = env.DB.prepare(countQuery);
    const countResult = countParams.length > 0 ? await countStmt.bind(...countParams).first() : await countStmt.first();
    const stats = await getTicketStats(env.DB, customer);
    const formattedTickets = tickets.map((t) => ({
      ...t,
      tags: t.tags ? JSON.parse(t.tags) : []
    }));
    return new Response(JSON.stringify({
      success: true,
      data: {
        tickets: formattedTickets,
        pagination: {
          total: countResult?.total || 0,
          limit,
          offset,
          hasMore: offset + tickets.length < (countResult?.total || 0)
        },
        stats
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet46, "onRequestGet46");
__name2(onRequestGet46, "onRequestGet");
async function onRequestPost37(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const data = await request.json();
    if (!data.subject || !data.description) {
      return new Response(JSON.stringify({ success: false, error: "Subject and description are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!data.email && !data.customer_email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = Date.now();
    const ticketNumber = await generateTicketNumber(env.DB);
    const ticketId = `tkt_${crypto.randomUUID().split("-")[0]}`;
    const email = (data.email || data.customer_email).toLowerCase().trim();
    const customerName = data.customer || data.name || email.split("@")[0];
    let customerId = data.userId || data.customer_id || null;
    if (!customerId) {
      const existingCustomer = await env.DB.prepare(
        "SELECT id FROM support_customers WHERE email = ?"
      ).bind(email).first();
      if (existingCustomer) {
        customerId = existingCustomer.id;
      }
    }
    const ticket = {
      id: ticketId,
      ticket_number: ticketNumber,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: email,
      subject: data.subject,
      description: data.description,
      category: data.category || "general",
      priority: data.priority || "medium",
      status: "open",
      tags: data.tags ? JSON.stringify(data.tags) : null,
      source: data.source || "web",
      created_at: now,
      updated_at: now
    };
    await env.DB.prepare(`
      INSERT INTO support_tickets (
        id, ticket_number, customer_id, customer_name, customer_email,
        subject, description, category, priority, status, tags, source,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ticket.id,
      ticket.ticket_number,
      ticket.customer_id,
      ticket.customer_name,
      ticket.customer_email,
      ticket.subject,
      ticket.description,
      ticket.category,
      ticket.priority,
      ticket.status,
      ticket.tags,
      ticket.source,
      ticket.created_at,
      ticket.updated_at
    ).run();
    await env.DB.prepare(`
      INSERT INTO support_messages (
        id, ticket_id, author_type, author_id, author_name, author_email, content, created_at
      ) VALUES (?, ?, 'customer', ?, ?, ?, ?, ?)
    `).bind(
      `msg_${crypto.randomUUID().split("-")[0]}`,
      ticketId,
      customerId,
      customerName,
      email,
      data.description,
      now
    ).run();
    await env.DB.prepare(
      "UPDATE support_tickets SET message_count = 1 WHERE id = ?"
    ).bind(ticketId).run();
    if (customerId) {
      await env.DB.prepare(
        "UPDATE support_customers SET total_tickets = total_tickets + 1 WHERE id = ?"
      ).bind(customerId).run();
    }
    if (env.KV) {
      try {
        await env.KV.put(`ticket_${ticketNumber}`, JSON.stringify(ticket), { expirationTtl: 86400 });
      } catch (e) {
        console.error("KV cache error:", e);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Ticket #${ticketNumber} created successfully`,
      data: {
        id: ticketId,
        ticket_number: ticketNumber,
        ...ticket
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost37, "onRequestPost37");
__name2(onRequestPost37, "onRequestPost");
async function generateTicketNumber(db) {
  const today = /* @__PURE__ */ new Date();
  const prefix = `TKT-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
  const count = await db.prepare(
    "SELECT COUNT(*) as count FROM support_tickets WHERE ticket_number LIKE ?"
  ).bind(`${prefix}%`).first();
  const num = (count?.count || 0) + 1;
  return `${prefix}-${String(num).padStart(4, "0")}`;
}
__name(generateTicketNumber, "generateTicketNumber");
__name2(generateTicketNumber, "generateTicketNumber");
async function getTicketStats(db, customerEmail = null) {
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
      SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
    FROM support_tickets
  `;
  if (customerEmail) {
    query += " WHERE customer_email = ?";
    return await db.prepare(query).bind(customerEmail).first();
  }
  return await db.prepare(query).first();
}
__name(getTicketStats, "getTicketStats");
__name2(getTicketStats, "getTicketStats");
var routes = [
  {
    routePath: "/api/automation/paths/:id/run",
    mountPath: "/api/automation/paths/:id",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/automation/paths/:id/run",
    mountPath: "/api/automation/paths/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/automation/assistants/:id",
    mountPath: "/api/automation/assistants",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/automation/assistants/:id",
    mountPath: "/api/automation/assistants",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/automation/assistants/:id",
    mountPath: "/api/automation/assistants",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/automation/paths/:id",
    mountPath: "/api/automation/paths",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/automation/paths/:id",
    mountPath: "/api/automation/paths",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/blog/posts/:id",
    mountPath: "/api/blog/posts",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete3]
  },
  {
    routePath: "/api/blog/posts/:id",
    mountPath: "/api/blog/posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/blog/posts/:id",
    mountPath: "/api/blog/posts",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch2]
  },
  {
    routePath: "/api/blog/posts/:id",
    mountPath: "/api/blog/posts",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut3]
  },
  {
    routePath: "/api/stats/posts/:id",
    mountPath: "/api/stats/posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/stats/posts/:id",
    mountPath: "/api/stats/posts",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut4]
  },
  {
    routePath: "/api/media/serve/:path*",
    mountPath: "/api/media/serve",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/media/serve/:path*",
    mountPath: "/api/media/serve",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/scheduled-posts/:id/publish",
    mountPath: "/api/scheduled-posts/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/tickets/:id/attachments",
    mountPath: "/api/tickets/:id",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/tickets/:id/attachments",
    mountPath: "/api/tickets/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/tickets/:id/messages",
    mountPath: "/api/tickets/:id",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/tickets/:id/messages",
    mountPath: "/api/tickets/:id",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/automation/assistants",
    mountPath: "/api/automation/assistants",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/automation/assistants",
    mountPath: "/api/automation/assistants",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/automation/config",
    mountPath: "/api/automation/config",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/api/automation/config",
    mountPath: "/api/automation/config",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/automation/config",
    mountPath: "/api/automation/config",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut5]
  },
  {
    routePath: "/api/automation/logs",
    mountPath: "/api/automation/logs",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/api/automation/logs",
    mountPath: "/api/automation/logs",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/automation/paths",
    mountPath: "/api/automation/paths",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/api/automation/paths",
    mountPath: "/api/automation/paths",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/automation/prompts",
    mountPath: "/api/automation/prompts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/api/automation/prompts",
    mountPath: "/api/automation/prompts",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  },
  {
    routePath: "/api/automation/stats",
    mountPath: "/api/automation/stats",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/api/blog/posts",
    mountPath: "/api/blog/posts",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete4]
  },
  {
    routePath: "/api/blog/posts",
    mountPath: "/api/blog/posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/api/blog/posts",
    mountPath: "/api/blog/posts",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost10]
  },
  {
    routePath: "/api/chatbot/analytics",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/api/chatbot/analytics",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost11]
  },
  {
    routePath: "/api/chatbot/conversations",
    mountPath: "/api/chatbot",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete5]
  },
  {
    routePath: "/api/chatbot/conversations",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/api/chatbot/conversations",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost12]
  },
  {
    routePath: "/api/chatbot/messages",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/api/chatbot/messages",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost13]
  },
  {
    routePath: "/api/chatbot/rate",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost14]
  },
  {
    routePath: "/api/chatbot/scenarios",
    mountPath: "/api/chatbot",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete6]
  },
  {
    routePath: "/api/chatbot/scenarios",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/api/chatbot/scenarios",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost15]
  },
  {
    routePath: "/api/chatbot/scenarios",
    mountPath: "/api/chatbot",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut6]
  },
  {
    routePath: "/api/chatbot/settings",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/api/chatbot/settings",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost16]
  },
  {
    routePath: "/api/chatbot/settings",
    mountPath: "/api/chatbot",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut7]
  },
  {
    routePath: "/api/chatbot/users",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/api/chatbot/users",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost17]
  },
  {
    routePath: "/api/chatbot/widget",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/api/chatbot/widget",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost18]
  },
  {
    routePath: "/api/customers/auth",
    mountPath: "/api/customers",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete7]
  },
  {
    routePath: "/api/customers/auth",
    mountPath: "/api/customers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/api/customers/auth",
    mountPath: "/api/customers",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost19]
  },
  {
    routePath: "/api/media/bulk",
    mountPath: "/api/media",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost20]
  },
  {
    routePath: "/api/media/folders",
    mountPath: "/api/media/folders",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete8]
  },
  {
    routePath: "/api/media/folders",
    mountPath: "/api/media/folders",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/api/media/folders",
    mountPath: "/api/media/folders",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost21]
  },
  {
    routePath: "/api/profile/avatar",
    mountPath: "/api/profile",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete9]
  },
  {
    routePath: "/api/profile/avatar",
    mountPath: "/api/profile",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost22]
  },
  {
    routePath: "/api/profile/password",
    mountPath: "/api/profile",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost23]
  },
  {
    routePath: "/api/scheduled-posts/check",
    mountPath: "/api/scheduled-posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/api/scheduled-posts/check",
    mountPath: "/api/scheduled-posts",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost24]
  },
  {
    routePath: "/api/stats/dashboard",
    mountPath: "/api/stats",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet24]
  },
  {
    routePath: "/api/subscribers/import",
    mountPath: "/api/subscribers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet25]
  },
  {
    routePath: "/api/subscribers/import",
    mountPath: "/api/subscribers",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost25]
  },
  {
    routePath: "/api/subscribers/popup-config",
    mountPath: "/api/subscribers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet26]
  },
  {
    routePath: "/api/subscribers/popup-config",
    mountPath: "/api/subscribers",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut8]
  },
  {
    routePath: "/api/tickets/categories",
    mountPath: "/api/tickets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet27]
  },
  {
    routePath: "/api/tickets/categories",
    mountPath: "/api/tickets",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost26]
  },
  {
    routePath: "/api/categories/:id",
    mountPath: "/api/categories",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete10]
  },
  {
    routePath: "/api/categories/:id",
    mountPath: "/api/categories",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet28]
  },
  {
    routePath: "/api/categories/:id",
    mountPath: "/api/categories",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut9]
  },
  {
    routePath: "/api/media/:id",
    mountPath: "/api/media",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete11]
  },
  {
    routePath: "/api/media/:id",
    mountPath: "/api/media",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet29]
  },
  {
    routePath: "/api/media/:id",
    mountPath: "/api/media",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut10]
  },
  {
    routePath: "/api/scheduled-posts/:id",
    mountPath: "/api/scheduled-posts",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete12]
  },
  {
    routePath: "/api/scheduled-posts/:id",
    mountPath: "/api/scheduled-posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet30]
  },
  {
    routePath: "/api/scheduled-posts/:id",
    mountPath: "/api/scheduled-posts",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut11]
  },
  {
    routePath: "/api/subcategories/:id",
    mountPath: "/api/subcategories",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete13]
  },
  {
    routePath: "/api/subcategories/:id",
    mountPath: "/api/subcategories",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet31]
  },
  {
    routePath: "/api/subcategories/:id",
    mountPath: "/api/subcategories",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut12]
  },
  {
    routePath: "/api/subscribers/:id",
    mountPath: "/api/subscribers",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete14]
  },
  {
    routePath: "/api/subscribers/:id",
    mountPath: "/api/subscribers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet32]
  },
  {
    routePath: "/api/subscribers/:id",
    mountPath: "/api/subscribers",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut13]
  },
  {
    routePath: "/api/tags/:id",
    mountPath: "/api/tags",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete15]
  },
  {
    routePath: "/api/tags/:id",
    mountPath: "/api/tags",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet33]
  },
  {
    routePath: "/api/tags/:id",
    mountPath: "/api/tags",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut14]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete16]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet34]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut15]
  },
  {
    routePath: "/api/categories",
    mountPath: "/api/categories",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet35]
  },
  {
    routePath: "/api/categories",
    mountPath: "/api/categories",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost27]
  },
  {
    routePath: "/api/chatbot",
    mountPath: "/api/chatbot",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet36]
  },
  {
    routePath: "/api/chatbot",
    mountPath: "/api/chatbot",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost28]
  },
  {
    routePath: "/api/customers",
    mountPath: "/api/customers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet37]
  },
  {
    routePath: "/api/customers",
    mountPath: "/api/customers",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost29]
  },
  {
    routePath: "/api/media",
    mountPath: "/api/media",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet38]
  },
  {
    routePath: "/api/media",
    mountPath: "/api/media",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost30]
  },
  {
    routePath: "/api/profile",
    mountPath: "/api/profile",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet39]
  },
  {
    routePath: "/api/profile",
    mountPath: "/api/profile",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut16]
  },
  {
    routePath: "/api/scheduled-posts",
    mountPath: "/api/scheduled-posts",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet40]
  },
  {
    routePath: "/api/scheduled-posts",
    mountPath: "/api/scheduled-posts",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost31]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet41]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost32]
  },
  {
    routePath: "/api/settings",
    mountPath: "/api/settings",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut17]
  },
  {
    routePath: "/api/stats",
    mountPath: "/api/stats",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet42]
  },
  {
    routePath: "/api/stats",
    mountPath: "/api/stats",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost33]
  },
  {
    routePath: "/api/subcategories",
    mountPath: "/api/subcategories",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet43]
  },
  {
    routePath: "/api/subcategories",
    mountPath: "/api/subcategories",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost34]
  },
  {
    routePath: "/api/subscribers",
    mountPath: "/api/subscribers",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet44]
  },
  {
    routePath: "/api/subscribers",
    mountPath: "/api/subscribers",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost35]
  },
  {
    routePath: "/api/tags",
    mountPath: "/api/tags",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet45]
  },
  {
    routePath: "/api/tags",
    mountPath: "/api/tags",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch3]
  },
  {
    routePath: "/api/tags",
    mountPath: "/api/tags",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost36]
  },
  {
    routePath: "/api/tickets",
    mountPath: "/api/tickets",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet46]
  },
  {
    routePath: "/api/tickets",
    mountPath: "/api/tickets",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost37]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../../../usr/local/Cellar/node@20/20.19.5/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../../../usr/local/Cellar/node@20/20.19.5/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-jfwYHF/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../../../usr/local/Cellar/node@20/20.19.5/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-jfwYHF/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.7521307360487104.js.map
