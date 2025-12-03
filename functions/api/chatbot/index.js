/**
 * AI Chatbot Main API
 * POST /api/chatbot - Send a message to the chatbot and get response
 * GET /api/chatbot - Get chatbot status and configuration
 * 
 * This is the main endpoint for the chatbot widget on the frontend
 */

/**
 * GET /api/chatbot - Get chatbot status and public configuration
 */
export async function onRequestGet(context) {
  const { env } = context;

  try {
    let settings = {};
    let assistants = [];

    if (env.DB) {
      // Get settings
      const { results: settingsRows } = await env.DB.prepare(
        "SELECT key, value, type FROM chatbot_settings"
      ).all();

      settingsRows?.forEach(row => {
        let value = row.value;
        if (row.type === 'boolean') value = row.value === 'true';
        else if (row.type === 'number') value = parseInt(row.value);
        else if (row.type === 'json') {
          try { value = JSON.parse(row.value); } catch (e) { }
        }
        settings[row.key] = value;
      });

      // Get active assistants
      const { results: assistantRows } = await env.DB.prepare(
        "SELECT id, name, description, type FROM ai_assistants WHERE is_active = 1"
      ).all();
      assistants = assistantRows || [];
    }

    return new Response(JSON.stringify({
      success: true,
      enabled: settings.enabled !== false,
      config: {
        chatbotName: settings.chatbot_name || 'Fooodis Assistant',
        welcomeMessage: settings.welcome_message || 'Hello! How can I help you today?',
        position: settings.widget_position || 'bottom-right',
        color: settings.widget_color || '#e8f24c',
        languages: settings.supported_languages || ['en', 'sv'],
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

/**
 * POST /api/chatbot - Send message and get AI response
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { message, conversationId, visitorId, assistantId, language, agentName, agentSystemPrompt } = data;

    if (!message) {
      return new Response(JSON.stringify({ success: false, error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    let convId = conversationId;
    let threadId = data.threadId;

    // Get or create conversation
    if (env.DB) {
      if (!convId) {
        // Create new conversation
        convId = `conv_${crypto.randomUUID().split('-')[0]}`;
        await env.DB.prepare(`
          INSERT INTO chatbot_conversations (
            id, visitor_id, assistant_id, language, status, 
            first_message_at, last_message_at, message_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, 'active', ?, ?, 1, ?, ?)
        `).bind(
          convId, visitorId || null, assistantId || null, 
          language || 'en', now, now, now, now
        ).run();
      } else {
        // Update existing conversation
        await env.DB.prepare(`
          UPDATE chatbot_conversations 
          SET message_count = message_count + 1, last_message_at = ?, updated_at = ?
          WHERE id = ?
        `).bind(now, now, convId).run();
      }

      // Store user message
      await env.DB.prepare(`
        INSERT INTO chatbot_messages (id, conversation_id, role, content, created_at)
        VALUES (?, ?, 'user', ?, ?)
      `).bind(`msg_${crypto.randomUUID().split('-')[0]}`, convId, message, now).run();
    }

    // Get OpenAI API key
    let apiKey = null;
    if (env.KV) {
      apiKey = await env.KV.get('OPENAI_API_KEY');
    }
    if (!apiKey && env.OPENAI_API_KEY) {
      apiKey = env.OPENAI_API_KEY;
    }

    // Get assistant configuration
    let assistant = null;
    let systemPrompt = agentSystemPrompt || 'You are a helpful assistant for Fooodis, a food delivery and restaurant management platform. Help users with their questions about food, restaurants, and the platform.';
    
    // If agent system prompt provided, use it directly
    if (agentSystemPrompt) {
      console.log('Using agent system prompt for:', agentName);
    } else if (env.DB && assistantId) {
      assistant = await env.DB.prepare(
        "SELECT * FROM ai_assistants WHERE id = ? OR openai_assistant_id = ?"
      ).bind(assistantId, assistantId).first();
      
      if (assistant?.instructions) {
        systemPrompt = assistant.instructions;
      }
    }

    // Fetch conversation history for context
    let conversationHistory = [];
    if (env.DB && convId) {
      try {
        const historyResult = await env.DB.prepare(`
          SELECT role, content FROM chatbot_messages 
          WHERE conversation_id = ? 
          ORDER BY created_at DESC LIMIT 10
        `).bind(convId).all();
        
        if (historyResult?.results) {
          // Reverse to get chronological order and format for OpenAI
          conversationHistory = historyResult.results.reverse().map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          }));
        }
      } catch (historyError) {
        console.error('Error fetching conversation history:', historyError);
      }
    }

    // Call OpenAI API
    let aiResponse = "I'm here to help! However, I'm currently unable to process your request. Please try again later.";
    let tokensUsed = 0;
    const startTime = Date.now();

    if (apiKey) {
      try {
        // If we have an OpenAI assistant ID, use the Assistants API
        if (assistant?.openai_assistant_id) {
          const response = await callOpenAIAssistant(apiKey, assistant.openai_assistant_id, message, threadId);
          aiResponse = response.message;
          threadId = response.threadId;
          tokensUsed = response.tokens || 0;
        } else {
          // Use Chat Completions API with conversation history
          const response = await callOpenAIChatCompletion(apiKey, systemPrompt, message, assistant?.model || 'gpt-4', conversationHistory);
          aiResponse = response.message;
          tokensUsed = response.tokens || 0;
        }
      } catch (error) {
        console.error('OpenAI API error:', error);
        aiResponse = getErrorResponse(language);
      }
    }

    const responseTime = Date.now() - startTime;

    // Store AI response in database
    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO chatbot_messages (
          id, conversation_id, role, content, assistant_id, assistant_name, 
          tokens_used, response_time_ms, created_at
        ) VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?, ?)
      `).bind(
        `msg_${crypto.randomUUID().split('-')[0]}`,
        convId,
        aiResponse,
        assistantId || null,
        assistant?.name || 'Fooodis Assistant',
        tokensUsed,
        responseTime,
        Date.now()
      ).run();

      // Update conversation with thread_id
      if (threadId) {
        await env.DB.prepare(
          "UPDATE chatbot_conversations SET thread_id = ? WHERE id = ?"
        ).bind(threadId, convId).run();
      }

      // Update daily analytics
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

/**
 * Call OpenAI Chat Completion API
 */
async function callOpenAIChatCompletion(apiKey, systemPrompt, userMessage, model, conversationHistory = []) {
  // Build messages array with system prompt, history, and current message
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add conversation history for context (last 10 messages)
  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });
  
  console.log(`Calling OpenAI with ${messages.length} messages (including ${conversationHistory.length} history)`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    message: data.choices[0]?.message?.content || 'No response generated.',
    tokens: data.usage?.total_tokens || 0
  };
}

/**
 * Call OpenAI Assistants API
 */
async function callOpenAIAssistant(apiKey, assistantId, userMessage, existingThreadId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2'
  };

  // Create or reuse thread
  let threadId = existingThreadId;
  if (!threadId) {
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers
    });
    const threadData = await threadResponse.json();
    threadId = threadData.id;
  }

  // Add message to thread
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role: 'user', content: userMessage })
  });

  // Run assistant
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  const runData = await runResponse.json();

  // Poll for completion
  let run = runData;
  let attempts = 0;
  while (run.status !== 'completed' && run.status !== 'failed' && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, { headers });
    run = await statusResponse.json();
    attempts++;
  }

  if (run.status !== 'completed') {
    throw new Error('Assistant run did not complete');
  }

  // Get messages
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, { headers });
  const messagesData = await messagesResponse.json();
  const assistantMessage = messagesData.data[0]?.content[0]?.text?.value || 'No response generated.';

  return {
    message: assistantMessage,
    threadId,
    tokens: run.usage?.total_tokens || 0
  };
}

/**
 * Update daily analytics
 */
async function updateDailyAnalytics(db, tokensUsed) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    await db.prepare(`
      INSERT INTO chatbot_analytics (id, date, total_messages, total_tokens_used, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET 
        total_messages = total_messages + 1,
        total_tokens_used = total_tokens_used + ?,
        updated_at = ?
    `).bind(
      `analytics_${today}`, today, tokensUsed, Date.now(), Date.now(),
      tokensUsed, Date.now()
    ).run();
  } catch (e) {
    console.error('Analytics update error:', e);
  }
}

/**
 * Get localized error response
 */
function getErrorResponse(language) {
  const errors = {
    en: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    sv: "Jag ber om ursäkt, men jag har problem med att behandla din förfrågan just nu. Vänligen försök igen om en stund."
  };
  return errors[language] || errors.en;
}
