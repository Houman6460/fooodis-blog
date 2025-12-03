/**
 * Email Popup Configuration API
 * GET /api/subscribers/popup-config - Get popup configuration
 * PUT /api/subscribers/popup-config - Update popup configuration
 */

/**
 * GET - Get popup config
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
    let config = await env.DB.prepare(
      "SELECT * FROM email_popup_config WHERE id = 'default'"
    ).first();

    // If no config exists, create default
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

    // Normalize field names for compatibility
    const normalizedConfig = {
      id: config.id,
      enabled: config.enabled,
      title: config.title,
      description: config.description,
      button_text: config.button_text,
      placeholder_text: config.placeholder_text || 'Enter your email address',
      success_message: config.success_message,
      // Support both old and new field names
      trigger_type: config.trigger_type || 'time',
      trigger_delay: config.trigger_delay || config.display_delay || 5,
      trigger_scroll_percent: config.trigger_scroll_percent || 50,
      show_once: config.show_once !== undefined ? config.show_once : 1,
      show_every_days: config.show_every_days || 7,
      background_color: config.background_color || '#1e1e24',
      text_color: config.text_color || '#e0e0e0',
      button_color: config.button_color || '#e8f24c',
      popup_image: config.popup_image || null,
      popup_image_enabled: config.popup_image_enabled ? true : false,
      popup_layout: config.popup_layout || 'standard',
      logo_image: config.logo_image || null,
      custom_css: config.custom_css || null,
      updated_at: config.updated_at
    };

    return new Response(JSON.stringify(normalizedConfig), {
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
 * PUT - Update popup config
 */
export async function onRequestPut(context) {
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

    // Build update query
    const updates = [];
    const values = [];

    const allowedFields = [
      'enabled', 'title', 'description', 'button_text', 'placeholder_text',
      'success_message', 'trigger_type', 'trigger_delay', 'trigger_scroll_percent',
      'show_once', 'show_every_days', 'background_color', 'text_color',
      'button_color', 'popup_image', 'popup_image_enabled', 'popup_layout',
      'logo_image', 'custom_css'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        // Convert boolean to integer for SQLite
        if (field === 'enabled' || field === 'show_once' || field === 'popup_image_enabled') {
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

    updates.push('updated_at = ?');
    values.push(now);

    await env.DB.prepare(`
      UPDATE email_popup_config SET ${updates.join(', ')} WHERE id = 'default'
    `).bind(...values).run();

    // Fetch updated config
    const config = await env.DB.prepare(
      "SELECT * FROM email_popup_config WHERE id = 'default'"
    ).first();

    // Also store in KV for fast frontend access
    if (env.KV) {
      try {
        await env.KV.put('email_popup_config', JSON.stringify(config));
      } catch (e) {
        console.error('KV cache error:', e);
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
