/**
 * Chatbot Configuration API
 * POST /api/chatbot/config - Save chatbot configuration (called by chatbot-management.js)
 * GET /api/chatbot/config - Get full chatbot configuration
 * 
 * This endpoint syncs the chatbot config from dashboard to D1/KV storage
 */

/**
 * GET /api/chatbot/config - Get full configuration
 */
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get settings from chatbot_settings table
    const { results: settingsRows } = await env.DB.prepare(
      "SELECT key, value, type FROM chatbot_settings"
    ).all();

    const settings = {};
    settingsRows?.forEach(row => {
      let value = row.value;
      if (row.type === 'boolean') value = row.value === 'true';
      else if (row.type === 'number') value = parseInt(row.value);
      else if (row.type === 'json') {
        try { value = JSON.parse(row.value); } catch (e) { }
      }
      settings[row.key] = value;
    });

    // Get assistants
    const { results: assistants } = await env.DB.prepare(
      "SELECT * FROM ai_assistants ORDER BY is_default DESC, name ASC"
    ).all();

    // Get scenarios
    const { results: scenarios } = await env.DB.prepare(
      "SELECT * FROM chatbot_scenarios ORDER BY priority DESC, name ASC"
    ).all();

    // Format assistants
    const formattedAssistants = assistants?.map(a => ({
      id: a.id,
      openaiAssistantId: a.openai_assistant_id,
      name: a.name,
      description: a.description,
      type: a.type,
      model: a.model,
      instructions: a.instructions,
      systemPrompt: a.instructions,
      temperature: a.temperature,
      maxTokens: a.max_tokens,
      isActive: a.is_active === 1,
      status: a.is_active === 1 ? 'active' : 'inactive',
      isDefault: a.is_default === 1,
      usageCount: a.usage_count,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    })) || [];

    // Format scenarios
    const formattedScenarios = scenarios?.map(s => ({
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
    })) || [];

    return new Response(JSON.stringify({
      success: true,
      config: {
        enabled: settings.enabled !== false,
        chatbotName: settings.chatbot_name || 'Fooodis Assistant',
        welcomeMessage: settings.welcome_message || 'Hello! How can I help you today?',
        defaultModel: settings.default_model || 'gpt-4',
        widgetPosition: settings.widget_position || 'bottom-right',
        widgetColor: settings.widget_color || '#e8f24c',
        languages: settings.supported_languages || ['en', 'sv'],
        enableRating: settings.enable_rating !== false,
        enableLeadCapture: settings.enable_lead_capture !== false,
        allowFileUpload: settings.enable_file_upload !== false,
        showTypingIndicator: settings.enable_typing_indicator !== false
      },
      assistants: formattedAssistants,
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

/**
 * POST /api/chatbot/config - Save full configuration
 * Called by chatbot-management.js saveConfigToServer()
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

    // Save settings to chatbot_settings table
    const settingsToSave = {
      enabled: { value: data.enabled ? 'true' : 'false', type: 'boolean', category: 'general' },
      chatbot_name: { value: data.chatbotName || 'Fooodis Assistant', type: 'string', category: 'general' },
      welcome_message: { value: data.welcomeMessage || '', type: 'string', category: 'general' },
      default_model: { value: data.defaultModel || 'gpt-4', type: 'string', category: 'ai' },
      widget_position: { value: data.widgetPosition || 'bottom-right', type: 'string', category: 'widget' },
      widget_color: { value: data.widgetColor || '#e8f24c', type: 'string', category: 'widget' },
      enable_file_upload: { value: data.allowFileUpload ? 'true' : 'false', type: 'boolean', category: 'features' },
      enable_typing_indicator: { value: data.showTypingIndicator ? 'true' : 'false', type: 'boolean', category: 'features' },
      supported_languages: { value: JSON.stringify(data.languages || ['en', 'sv']), type: 'json', category: 'general' }
    };

    // Upsert each setting
    for (const [key, setting] of Object.entries(settingsToSave)) {
      await env.DB.prepare(`
        INSERT INTO chatbot_settings (key, value, type, category, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          type = excluded.type,
          updated_at = excluded.updated_at
      `).bind(key, setting.value, setting.type, setting.category, now).run();
    }

    // Store OpenAI API key in KV (secure storage)
    if (data.openaiApiKey && env.KV) {
      await env.KV.put('OPENAI_API_KEY', data.openaiApiKey);
    }

    // Sync assistants to ai_assistants table
    if (data.assistants && Array.isArray(data.assistants)) {
      for (const assistant of data.assistants) {
        const assistantId = assistant.id || `asst_${crypto.randomUUID().split('-')[0]}`;
        
        // Check if exists
        const existing = await env.DB.prepare(
          "SELECT id FROM ai_assistants WHERE id = ?"
        ).bind(assistantId).first();

        if (existing) {
          // Update existing
          await env.DB.prepare(`
            UPDATE ai_assistants SET
              name = ?, description = ?, openai_assistant_id = ?,
              model = ?, instructions = ?, is_active = ?, updated_at = ?
            WHERE id = ?
          `).bind(
            assistant.name,
            assistant.description || '',
            assistant.assistantId || assistant.openaiAssistantId || '',
            assistant.model || 'gpt-4',
            assistant.systemPrompt || assistant.instructions || '',
            assistant.status === 'active' ? 1 : 0,
            now,
            assistantId
          ).run();
        } else {
          // Insert new
          await env.DB.prepare(`
            INSERT INTO ai_assistants (
              id, openai_assistant_id, name, description, type, model, instructions,
              is_active, is_default, usage_count, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'custom', ?, ?, ?, 0, 0, ?, ?)
          `).bind(
            assistantId,
            assistant.assistantId || assistant.openaiAssistantId || '',
            assistant.name,
            assistant.description || '',
            assistant.model || 'gpt-4',
            assistant.systemPrompt || assistant.instructions || '',
            assistant.status === 'active' ? 1 : 0,
            assistant.createdAt || now,
            now
          ).run();
        }
      }
    }

    // Cache config in KV for faster frontend access
    if (env.KV) {
      try {
        await env.KV.put('chatbot_config', JSON.stringify({
          enabled: data.enabled,
          chatbotName: data.chatbotName,
          welcomeMessage: data.welcomeMessage,
          defaultModel: data.defaultModel,
          widgetPosition: data.widgetPosition,
          widgetColor: data.widgetColor,
          languages: data.languages,
          updatedAt: now
        }), { expirationTtl: 3600 }); // Cache for 1 hour
      } catch (e) {
        console.error('KV cache error:', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Configuration saved successfully"
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
