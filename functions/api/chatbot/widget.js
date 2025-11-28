/**
 * Chatbot Widget Code API
 * GET /api/chatbot/widget - Get widget embed code
 * POST /api/chatbot/widget - Track widget deployment
 */

/**
 * GET /api/chatbot/widget - Generate widget embed code
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const deploymentId = url.searchParams.get('deployment_id');
  const format = url.searchParams.get('format') || 'js'; // js, html, react

  try {
    const baseUrl = new URL(request.url).origin;
    
    // Get settings for widget configuration
    let settings = {};
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT key, value, type FROM chatbot_settings WHERE category IN ('general', 'widget', 'features')"
      ).all();

      results?.forEach(row => {
        let value = row.value;
        if (row.type === 'boolean') value = row.value === 'true';
        else if (row.type === 'number') value = parseInt(row.value);
        else if (row.type === 'json') {
          try { value = JSON.parse(row.value); } catch (e) { }
        }
        settings[row.key] = value;
      });
    }

    // Generate widget configuration
    const widgetConfig = {
      apiEndpoint: `${baseUrl}/api/chatbot`,
      position: settings.widget_position || 'bottom-right',
      primaryColor: settings.widget_color || '#e8f24c',
      chatbotName: settings.chatbot_name || 'Fooodis Assistant',
      welcomeMessage: settings.welcome_message || 'Hello! How can I help you today?',
      languages: settings.supported_languages || ['en', 'sv'],
      enableRating: settings.enable_rating !== false,
      enableFileUpload: settings.enable_file_upload !== false,
      deploymentId
    };

    // Generate embed codes based on format
    let embedCode;
    let embedCodeMinified;

    if (format === 'react') {
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

    } else if (format === 'html') {
      embedCode = `<!-- Fooodis Chatbot Widget -->
<script>
  window.FoodisChatbotConfig = ${JSON.stringify(widgetConfig, null, 2)};
</script>
<script src="${baseUrl}/js/chatbot-widget.js" async></script>`;

      embedCodeMinified = `<script>window.FoodisChatbotConfig=${JSON.stringify(widgetConfig)};</script><script src="${baseUrl}/js/chatbot-widget.js" async></script>`;

    } else {
      // Default JavaScript
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

    // Get deployments if admin request
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

/**
 * POST /api/chatbot/widget - Register widget deployment
 */
export async function onRequestPost(context) {
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

    // Check for existing deployment
    if (data.deployment_id) {
      const existing = await env.DB.prepare(
        "SELECT * FROM chatbot_deployments WHERE id = ?"
      ).bind(data.deployment_id).first();

      if (existing) {
        // Update ping
        await env.DB.prepare(`
          UPDATE chatbot_deployments 
          SET last_ping = ?, total_loads = total_loads + 1, updated_at = ?
          WHERE id = ?
        `).bind(now, now, data.deployment_id).run();

        return new Response(JSON.stringify({
          success: true,
          deployment: { id: existing.id },
          action: 'updated'
        }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Create new deployment
    const id = data.deployment_id || `deploy_${crypto.randomUUID().split('-')[0]}`;

    await env.DB.prepare(`
      INSERT INTO chatbot_deployments (
        id, name, domain, config, is_active, last_ping, total_loads, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, ?, 1, ?, ?)
    `).bind(
      id,
      data.name || data.domain || 'Unnamed Deployment',
      data.domain || null,
      data.config ? JSON.stringify(data.config) : null,
      now,
      now,
      now
    ).run();

    return new Response(JSON.stringify({
      success: true,
      deployment: { id },
      action: 'created'
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
