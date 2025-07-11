/**
 * Fooodis AI Chatbot API
 * Handles chat requests and integrates with OpenAI Assistant API
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
    console.log(`📡 Chatbot API: ${req.method} ${req.path}`);
    next();
});

// Store for conversations and users (in production, use a proper database)
const conversations = new Map();
const assistants = new Map();
const registeredUsers = new Map();

// Load existing conversations from storage
function loadConversationsFromStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const conversationsPath = path.join(__dirname, '../chatbot-conversations.json');

        if (fs.existsSync(conversationsPath)) {
            const data = fs.readFileSync(conversationsPath, 'utf8');
            const savedConversations = JSON.parse(data);

            savedConversations.forEach(conv => {
                conversations.set(conv.id, conv);
            });

            console.log(`Loaded ${savedConversations.length} conversations from storage`);
        }
    } catch (error) {
        console.error('Error loading conversations from storage:', error);
    }
}

// Save conversations to storage
function saveConversationsToStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const conversationsPath = path.join(__dirname, '../chatbot-conversations.json');

        const conversationsArray = Array.from(conversations.values());
        fs.writeFileSync(conversationsPath, JSON.stringify(conversationsArray, null, 2));

        console.log(`Saved ${conversationsArray.length} conversations to storage`);
    } catch (error) {
        console.error('Error saving conversations to storage:', error);
    }
}

// Load users from storage
function loadUsersFromStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const usersPath = path.join(__dirname, '../chatbot-users.json');

        if (fs.existsSync(usersPath)) {
            const data = fs.readFileSync(usersPath, 'utf8');
            const savedUsers = JSON.parse(data);

            savedUsers.forEach(user => {
                registeredUsers.set(user.id, user);
            });

            console.log(`Loaded ${savedUsers.length} users from storage`);
        }
    } catch (error) {
        console.error('Error loading users from storage:', error);
    }
}

// Save users to storage
function saveUsersToStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const usersPath = path.join(__dirname, '../chatbot-users.json');

        const usersArray = Array.from(registeredUsers.values());
        fs.writeFileSync(usersPath, JSON.stringify(usersArray, null, 2));

        console.log(`Saved ${usersArray.length} users to storage`);
    } catch (error) {
        console.error('Error saving users to storage:', error);
    }
}

// Load conversations and users on startup
loadConversationsFromStorage();
loadUsersFromStorage();

// Load chatbot settings
function getChatbotSettings() {
    try {
        // Try to load settings from localStorage (simulating database)
        // In a real application, this would come from your database
        const fs = require('fs');
        const path = require('path');

        // For now, we'll use environment variables and allow override from a config file
        let settings = {
            enabled: true,
            openaiApiKey: process.env.OPENAI_API_KEY || '',
            defaultModel: 'gpt-4',
            assistants: []
        };

        // Try to load from a config file (this would be saved by the dashboard)
        try {
            const configPath = path.join(__dirname, '../chatbot-config.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configData);
                settings = { ...settings, ...config };
            }
        } catch (configError) {
            console.log('No chatbot config file found, using defaults');
        }

        // If no assistants configured, add default
        if (settings.assistants.length === 0) {
            settings.assistants = [
                {
                    id: 'default',
                    name: 'Fooodis Assistant',
                    assistantId: process.env.OPENAI_ASSISTANT_ID || '',
                    systemPrompt: 'You are a helpful restaurant assistant for Fooodis. Help customers with menu questions, reservations, and general restaurant information.'
                }
            ];
        }

        return settings;
    } catch (error) {
        console.error('Error loading chatbot settings:', error);
        return {
            enabled: false,
            openaiApiKey: '',
            defaultModel: 'gpt-4',
            assistants: []
        };
    }
}

// Get conversations
router.get('/conversations', async (req, res) => {
    try {
        const conversationsArray = Array.from(conversations.values());
        res.json({
            success: true,
            conversations: conversationsArray
        });
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        });
    }
});

// Get users/leads
router.get('/users', async (req, res) => {
    try {
        const usersArray = Array.from(registeredUsers.values());
        res.json({
            success: true,
            users: usersArray
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users'
        });
    }
});

// Save configuration
router.post('/config', async (req, res) => {
    try {
        const configData = req.body;

        // Save config to file
        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '../chatbot-config.json');

        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

        res.json({
            success: true,
            message: 'Configuration saved successfully'
        });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save configuration'
        });
    }
});

// Get configuration
router.get('/config', async (req, res) => {
    try {
        const settings = getChatbotSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error getting config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get configuration'
        });
    }
});

// Handle chat message
router.post('/', async (req, res) => {
    try {
        console.log('Received chat request:', { 
            message: req.body.message ? req.body.message.substring(0, 100) + '...' : 'No message',
            conversationId: req.body.conversationId,
            language: req.body.language 
        });

        const { message, conversationId, language = 'en', assistants: requestAssistants, agent, nodeContext } = req.body;

        if (!message || !message.trim()) {
            console.error('No message provided in request');
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const settings = getChatbotSettings();
        console.log('Chatbot settings loaded:', { 
            enabled: settings.enabled, 
            hasApiKey: !!settings.openaiApiKey,
            assistantsCount: settings.assistants.length 
        });

        if (!settings.enabled) {
            console.log('Chatbot is disabled');
            return res.status(503).json({
                success: false,
                error: 'Chatbot is currently disabled'
            });
        }

        // Get or create conversation
        let conversation;
        const currentConversationId = conversationId || generateConversationId();

        if (conversations.has(currentConversationId)) {
            conversation = conversations.get(currentConversationId);
        } else {
            conversation = {
                id: currentConversationId,
                messages: [],
                createdAt: new Date(),
                lastMessageAt: new Date(),
                language: language,
                status: 'active',
                threadId: null, // For OpenAI thread persistence
                agent: agent || null // Store agent information
            };
            conversations.set(currentConversationId, conversation);
        }

        // Add user message to conversation
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        conversation.messages.push(userMessage);

        // Store the user message for proper display in dashboard
        conversation.lastUserMessage = message; // Store last user message separately
        conversation.lastMessageAt = new Date();

        // Get AI response
        let aiResponse;
        let useAssistant = null;
        let selectedAgent = null;

        // If node context is provided, use the specified assistant
        if (nodeContext && nodeContext.assistantId) {
            console.log('🎯 Using node-specified assistant:', nodeContext.assistantId);
            useAssistant = settings.assistants.find(a => a.assistantId === nodeContext.assistantId);
            if (useAssistant) {
                selectedAgent = {
                    name: useAssistant.name,
                    personality: useAssistant.systemPrompt || 'helpful assistant',
                    prompt: nodeContext.aiPrompt || ''
                };
                console.log('✅ Found assistant for node:', selectedAgent.name);
            }
        }

        // Fallback: Check if multiple agents are enabled and select random agent
        if (!selectedAgent && settings.enableMultipleAgents && settings.agents && settings.agents.length > 0) {
            // Select a random agent from the available agents
            const randomIndex = Math.floor(Math.random() * settings.agents.length);
            selectedAgent = settings.agents[randomIndex];
            console.log('Selected random agent:', selectedAgent.name, 'with personality:', selectedAgent.personality);

            // Store selected agent info in conversation for consistency
            conversation.currentAgent = selectedAgent;
        }

        // PERFORMANCE FIX: Use fast OpenAI Chat API instead of slow Assistant API
        if (settings.openaiApiKey) {
            console.log('🚀 Using FAST OpenAI Chat API for instant responses');

            // Detect language for bilingual support
            const detectedLanguage = detectLanguage(message);
            console.log('🌐 Detected language:', detectedLanguage);

            try {
                aiResponse = await getFastOpenAIResponse(message, conversation, settings, selectedAgent, detectedLanguage);
                console.log('✅ Fast OpenAI response received');
            } catch (error) {
                console.error('OpenAI Chat API error:', error);
                console.log('🔄 Falling back to dynamic response due to OpenAI error');
                aiResponse = getDynamicFallbackResponse(message, conversation, selectedAgent);
            }
        } else {
            console.log('ℹ️ No OpenAI API key, using dynamic fallback');
            aiResponse = getDynamicFallbackResponse(message, conversation, selectedAgent);
        }

        // Add AI response to conversation
        const assistantMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        };
        conversation.messages.push(assistantMessage);

        conversation.messageCount = conversation.messages.length;

        // Save conversations to storage
        saveConversationsToStorage();

        console.log('Sending response:', {
            success: true,
            conversationId: currentConversationId,
            messageLength: aiResponse.length
        });

        res.json({
            success: true,
            message: aiResponse,
            conversationId: currentConversationId,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Chatbot API error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get OpenAI response using Assistant API
async function getOpenAIResponse(message, conversation, settings, assistant, selectedAgent) {
    try {
        if (!settings.openaiApiKey) {
            console.log('No OpenAI API key configured, using fallback');
            return getDynamicFallbackResponse(message, conversation, selectedAgent);
        }

        if (!assistant.assistantId) {
            console.log('No assistant ID configured, using fallback');
            return getDynamicFallbackResponse(message, conversation, selectedAgent);
        }

        console.log('Using OpenAI Assistant:', assistant.assistantId);

        // Create a thread for this conversation if not exists
        let threadId = conversation.threadId;

        if (!threadId) {
            const threadResponse = await fetch('https://api.openai.com/v1/threads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${settings.openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({})
            });

            if (!threadResponse.ok) {
                const errorText = await threadResponse.text();
                console.error('Thread creation failed:', errorText);
                throw new Error(`Failed to create thread: ${threadResponse.status}`);
            }

            const threadData = await threadResponse.json();
            threadId = threadData.id;
            conversation.threadId = threadId;
            console.log('Created new thread:', threadId);
        }

        // Add the user message to the thread
        const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                role: 'user',
                content: message
            })
        });

        if (!messageResponse.ok) {
            const errorText = await messageResponse.text();
            console.error('Message add failed:', errorText);
            throw new Error(`Failed to add message: ${messageResponse.status}`);
        }

        // Run the assistant
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                assistant_id: assistant.assistantId
            })
        });

        if (!runResponse.ok) {
            const errorText = await runResponse.text();
            console.error('Run creation failed:', errorText);
            throw new Error(`Failed to run assistant: ${runResponse.status}`);
        }

        const runData = await runResponse.json();
        const runId = runData.id;
        console.log('Started run:', runId);

        // Poll for completion with aggressive optimization for speed
        let runStatus = 'queued';
        let attempts = 0;
        const maxAttempts = 30; // Increased timeout but with faster polling
        let pollInterval = 100; // Start very fast for immediate responses

        console.log('Polling for assistant response...');
        const startTime = Date.now();

        while (runStatus !== 'completed' && attempts < maxAttempts) {
            // Aggressive dynamic polling - prioritize speed
            if (attempts < 3) {
                pollInterval = 100; // 100ms for first 300ms - catch instant responses
            } else if (attempts < 8) {
                pollInterval = 250; // 250ms for next 1.25 seconds
            } else if (attempts < 15) {
                pollInterval = 500; // 500ms for next 3.5 seconds
            } else {
                pollInterval = 800; // 800ms for remaining time
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));

            const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                headers: {
                    'Authorization': `Bearer ${settings.openaiApiKey}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                runStatus = statusData.status;
                const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`Run status: ${runStatus} (${elapsedTime}s elapsed)`);

                if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
                    const errorInfo = statusData.last_error || 'Unknown error';
                    console.error('Assistant run failed:', errorInfo);
                    throw new Error(`Assistant run failed with status: ${runStatus}`);
                }

                // If completed, break immediately
                if (runStatus === 'completed') {
                    console.log(`Assistant response completed in ${elapsedTime}s`);
                    break;
                }
            }

            attempts++;
        }

        if (runStatus !== 'completed') {
            console.warn(`Assistant run timed out after ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
            throw new Error('Assistant run timed out');
        }

        // Get the assistant's response
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
                'Authorization': `Bearer ${settings.openaiApiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        if (!messagesResponse.ok) {
            throw new Error(`Failed to get messages: ${messagesResponse.status}`);
        }

        const messagesData = await messagesResponse.json();
        const messages = messagesData.data;

        // Find the latest assistant message (first in the list since they're ordered by created_at desc)
        const assistantMessage = messages.find(msg => msg.role === 'assistant' && msg.run_id === runId);

        if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
            const responseText = assistantMessage.content[0].text.value;
            console.log('OpenAI response received:', responseText.substring(0, 100) + '...');
            return responseText;
        } else {
            console.error('No assistant message found in response');
            throw new Error('No response from assistant');
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(` Fast OpenAI API failed after ${responseTime}ms:`, error);
        throw error;
    }
}

// FAST OpenAI Chat API - replaces slow Assistant API for instant responses
async function getFastOpenAIResponse(message, conversation, settings, selectedAgent, detectedLanguage) {
    console.log('🚀 Starting FAST OpenAI Chat API call...');
    const startTime = Date.now();

    // COMPREHENSIVE NULL SAFETY - ensure selectedAgent is never null
    const safeAgent = selectedAgent || {
        name: 'Sarah Johnson',
        personality: 'friendly and knowledgeable customer support representative for Fooodis'
    };

    console.log('🔍 Agent check - selectedAgent:', selectedAgent ? 'exists' : 'null', 'safeAgent:', safeAgent.name);

    // Build bilingual system prompt based on detected language
    const languageInstruction = detectedLanguage === 'swedish' 
        ? 'Respond in Swedish (svenska). Use natural Swedish language throughout your response.'
        : 'Respond in English unless the user specifically writes in Swedish.';

    // Use safe agent with guaranteed non-null values
    const agentName = safeAgent.name;
    const agentPersonality = safeAgent.personality;
    const agentPrompt = safeAgent.prompt || '';

    const systemPrompt = `You are ${agentName}, a ${agentPersonality} for Fooodis.
${languageInstruction}

${agentPersonality}

${agentPrompt ? `IMPORTANT PROMPT: ${agentPrompt}

` : ''}Context: Fooodis is a modern food delivery and restaurant platform. Help customers with:
- Menu questions and recommendations
- Order status and delivery tracking  
- Account and payment issues
- Restaurant information and locations
- Technical support

Provide helpful, accurate, and friendly responses. If you include URLs, make them clickable by using proper markdown links like [POS System](https://fooodis.com/fooodis/Pos.html).`;

    // Build conversation history for context
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 6 messages for context)
    if (conversation.messages && conversation.messages.length > 0) {
        const recentMessages = conversation.messages.slice(-6);
        for (const msg of recentMessages) {
            if (msg.sender === 'user') {
                messages.push({ role: 'user', content: msg.content });
            } else if (msg.sender === 'assistant') {
                messages.push({ role: 'assistant', content: msg.content });
            }
        }
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    console.log('📝 Chat API request - Language:', detectedLanguage, 'Messages:', messages.length);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Fast and cost-effective model
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI Chat API error:', errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const responseTime = Date.now() - startTime;

        console.log(`⚡ FAST OpenAI response completed in ${responseTime}ms`);

        const aiResponse = data.choices[0].message.content.trim();
        console.log('✅ Fast OpenAI response length:', aiResponse.length, 'chars');

        return aiResponse;

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`❌ Fast OpenAI API failed after ${responseTime}ms:`, error);
        throw error;
    }
}

// Detect message language
function detectLanguage(message) {
    const swedishWords = ['hej', 'tack', 'ja', 'nej', 'hur', 'vad', 'när', 'var', 'varför', 'som', 'är', 'och', 'att', 'det', 'på', 'svenska', 'meny', 'mat', 'restaurang', 'boka', 'öppettider'];
    const englishWords = ['hello', 'hi', 'thank', 'yes', 'no', 'how', 'what', 'when', 'where', 'why', 'the', 'and', 'to', 'of', 'in', 'menu', 'food', 'restaurant', 'book', 'hours'];

    const lowerMessage = message.toLowerCase();
    let swedishScore = 0;
    let englishScore = 0;

    swedishWords.forEach(word => {
        if (lowerMessage.includes(word)) swedishScore++;
    });

    englishWords.forEach(word => {
        if (lowerMessage.includes(word)) englishScore++;
    });

    englishWords.forEach(word => {
        if (lowerMessage.includes(word)) englishScore++;
    });

    // Check for explicit language indicators
    if (lowerMessage.includes('svenska') || lowerMessage.includes('på svenska')) return 'sv';
    if (lowerMessage.includes('english') || lowerMessage.includes('in english')) return 'en';

    return swedishScore > englishScore ? 'sv' : 'en';
}

// Dynamic fallback response when AI is not available
function getDynamicFallbackResponse(message, conversation, selectedAgent) {
    const keywords = message.toLowerCase().trim();
    const detectedLanguage = detectLanguage(message);

    // Add agent personality to responses if agent is selected
    let agentIntro = '';
    let agentStyle = '';

    if (selectedAgent) {
        // Use agent's introduction based on language
        const intro = selectedAgent.introduction[detectedLanguage] || selectedAgent.introduction['en'];
        agentIntro = intro + '\n\n';

        // Adjust response style based on agent personality
        if (selectedAgent.personality.toLowerCase().includes('friendly')) {
            agentStyle = 'friendly';
        } else if (selectedAgent.personality.toLowerCase().includes('professional')) {
            agentStyle = 'professional';
        } else if (selectedAgent.personality.toLowerCase().includes('enthusiastic')) {
            agentStyle = 'enthusiastic';
        } else if (selectedAgent.personality.toLowerCase().includes('calm')) {
            agentStyle = 'calm';
        } else if (selectedAgent.personality.toLowerCase().includes('tech-savvy')) {
            agentStyle = 'technical';
        } else if (selectedAgent.personality.toLowerCase().includes('warm')) {
            agentStyle = 'warm';
        } else if (selectedAgent.personality.toLowerCase().includes('experienced')) {
            agentStyle = 'experienced';
        }
    }

    // Only treat as greeting if it's primarily a greeting (not mixed with other content)
    const isSimpleGreeting = /^(hello|hi|hey)(\s*[!.]*\s*)?$/i.test(keywords) || 
                           /^(hello|hi|hey)\s+(there|everyone|fooodis)(\s*[!.]*\s*)?$/i.test(keywords);

    if (isSimpleGreeting) {
        if (selectedAgent) {
            return agentIntro + getStyledResponse("Welcome to Fooodis! How can I help you today?", agentStyle, detectedLanguage);
        }
        return "Hello! Welcome to Fooodis! I'm here to assist you with any questions about our restaurant. How can I help you today?";
    }

    // Check for questions about Fooodis specifically
    if (keywords.includes('about fooodis') || keywords.includes('about foodis') || 
        keywords.includes('tell me about') || keywords.includes('know about') ||
        keywords.includes('more about fooodis') || keywords.includes('more about foodis') ||
        keywords.includes('om fooodis') || keywords.includes('om foodis') || keywords.includes('berätta om')) {

        let response;
        if (detectedLanguage === 'sv') {
            response = "Fooodis är en modern plattform som hjälper restauranger att skapa professionella webbplatser med kraftfulla verktyg. Vi erbjuder allt från kassasystem och lagerstyrning till marknadsföring och kundhantering. Vår plattform inkluderar avancerade funktioner som AI-assistenter, automatiserad innehållsskapande, e-postmarknadsföring och mycket mer. Fooodis hjälper restauranger att digitalisera sin verksamhet och nå fler kunder online. Vilken specifik funktion eller tjänst skulle du vilja veta mer om?";
        } else {
            response = "Fooodis is a modern platform that helps restaurants create professional websites with powerful tools. We offer everything from POS systems and inventory management to marketing and customer management. Our platform includes advanced features like AI assistants, automated content creation, email marketing, and much more. Fooodis helps restaurants digitize their operations and reach more customers online. What specific feature or service would you like to know more about?";
        }

        if (selectedAgent) {
            return agentIntro + getStyledResponse(response, agentStyle, detectedLanguage);
        }
        return response;
    }

    // Menu inquiries
    if (keywords.includes('menu') || keywords.includes('food') || keywords.includes('eat') || keywords.includes('dish') ||
        keywords.includes('meny') || keywords.includes('mat') || keywords.includes('äta') || keywords.includes('rätt')) {

        let response;
        if (detectedLanguage === 'sv') {
            response = "Jag hjälper gärna till med vår meny! Vi erbjuder ett varierat utbud av läckra rätter tillagade med färska ingredienser. Skulle du vilja veta om våra specialiteter, dagens rätter eller diettillägg?";
        } else {
            response = "I'd love to help you with our menu! We offer a variety of delicious dishes prepared with fresh ingredients. Would you like to know about our specialties, daily specials, or dietary options?";
        }

        if (selectedAgent) {
            return agentIntro + getStyledResponse(response, agentStyle, detectedLanguage);
        }
        return response;
    }

    // Reservation inquiries
    if (keywords.includes('reservation') || keywords.includes('book') || keywords.includes('table') ||
        keywords.includes('bokning') || keywords.includes('boka') || keywords.includes('bord')) {

        let response;
        if (detectedLanguage === 'sv') {
            response = "Jag hjälper gärna till med bokningar! Du kan boka ett bord genom att ringa oss direkt eller använda vårt online-bokningssystem. Vilken tid och datum tänkte du på?";
        } else {
            response = "I'd be happy to help with reservations! You can book a table by calling us directly or using our online booking system. What time and date were you thinking?";
        }

        if (selectedAgent) {
            return agentIntro + getStyledResponse(response, agentStyle, detectedLanguage);
        }
        return response;
    }

    // Hours inquiries
    if (keywords.includes('hours') || keywords.includes('open') || keywords.includes('close') || keywords.includes('time') ||
        keywords.includes('öppettider') || keywords.includes('öppet') || keywords.includes('stängt') || keywords.includes('tid')) {
        if (detectedLanguage === 'sv') {
            return "Våra restaurangtider är vanligtvis måndag-söndag, men de kan variera under helger. Skulle du vilja att jag hjälper dig hitta våra aktuella öppettider eller kontaktinformation?";
        }
        return "Our restaurant hours are typically Monday-Sunday, but they may vary for holidays. Would you like me to help you find our current hours or contact information?";
    }

    // Location inquiries
    if (keywords.includes('location') || keywords.includes('address') || keywords.includes('directions') || keywords.includes('where') ||
        keywords.includes('plats') || keywords.includes('adress') || keywords.includes('vägbeskrivning') || keywords.includes('var')) {
        if (detectedLanguage === 'sv') {
            return "Vi är bekvämt belägna och lätt tillgängliga. Jag kan hjälpa dig med vägbeskrivning eller parkeringsinformation. Planerar du att besöka oss snart?";
        }
        return "We're conveniently located and easily accessible. I can help you with directions or parking information. Are you looking to visit us soon?";
    }

    // Price inquiries
    if (keywords.includes('price') || keywords.includes('cost') || keywords.includes('expensive') || keywords.includes('cheap') ||
        keywords.includes('pris') || keywords.includes('kostnad') || keywords.includes('dyr') || keywords.includes('billig')) {
        if (detectedLanguage === 'sv') {
            return "Våra priser är konkurrenskraftiga och vi erbjuder bra valuta för kvalitetsmiddag. Skulle du vilja ha information om specifika rätter eller våra aktuella erbjudanden?";
        }
        return "Our prices are competitive and we offer great value for quality dining. Would you like information about specific dishes or our current promotions?";
    }

    // Service inquiries
    if (keywords.includes('service') || keywords.includes('staff') || keywords.includes('waiter') ||
        keywords.includes('service') || keywords.includes('personal') || keywords.includes('servitör')) {
        if (detectedLanguage === 'sv') {
            return "Vi är stolta över vår utmärkta kundservice! Vår vänliga personal är här för att göra din matupplevelse minnesvärd. Finns det något specifikt jag kan hjälpa dig med?";
        }
        return "We pride ourselves on excellent customer service! Our friendly staff is here to make your dining experience memorable. Is there something specific I can help you with?";
    }

    // POS System inquiries
    if (keywords.includes('pos') || keywords.includes('point of sale') || keywords.includes('payment system') ||
        keywords.includes('kassasystem') || keywords.includes('betalningssystem')) {
        if (detectedLanguage === 'sv') {
            return "Vårt kassasystem (POS) är en modern lösning som hanterar alla transaktioner, lageruppföljning och kundhantering. Det integreras med vårt köksdisplaysystem för effektiv orderbehandling och stöder olika betalningsmetoder inklusive kort, mobilbetalningar och kontaktlösa alternativ. Skulle du vilja veta mer om våra betalningsalternativ eller beställningsprocessen?";
        }
        return "Our POS (Point of Sale) system is a modern solution that handles all transactions, inventory tracking, and customer management. It integrates with our kitchen display system for efficient order processing and supports various payment methods including cards, mobile payments, and contactless options. Would you like to know more about our payment options or ordering process?";
    }```text
    // Technology inquiries
    if (keywords.includes('technology') || keywords.includes('system') || keywords.includes('software') ||
        keywords.includes('teknik') || keywords.includes('system') || keywords.includes('mjukvara')) {
        if (detectedLanguage === 'sv') {
            return "Vi använder avancerad restaurangteknik för att förbättra din matupplevelse, inklusive moderna kassasystem, kökhanteringsprogramvara och online-beställningsplattformar. Detta hjälper oss att servera dig snabbare och mer effektivt. Finns det något specifikt om vår teknik du skulle vilja veta?";
        }
        return "We use advanced restaurant technology to enhance your dining experience, including modern POS systems, kitchen management software, and online ordering platforms. This helps us serve you faster and more efficiently. Is there something specific about our technology you'd like to know?";
    }

    // Thank you responses
    if (keywords.includes('thank') || keywords.includes('thanks') || keywords.includes('tack') || keywords.includes('tackar')) {
        if (detectedLanguage === 'sv') {
            return "Varsågod! Jag är här när du behöver hjälp. Finns det något annat jag kan hjälpa dig med idag?";
        }
        return "You're very welcome! I'm here whenever you need assistance. Is there anything else I can help you with today?";
    }

    // Swedish language detection
    if (keywords.includes('svenska') || keywords.includes('svensk') || keywords.includes('på svenska') || 
        keywords.includes('talar du svenska') || keywords.includes('kan du svenska')) {
        return "🇸🇪 Ja, jag kan hjälpa dig på svenska! Jag är din Fooodis-assistent och kan svara på frågor om vår restaurang, meny, bokningar och öppettider. Vad kan jag hjälpa dig med?\n\n🇬🇧 Yes, I can help you in Swedish! I'm your Fooodis assistant and can answer questions about our restaurant, menu, reservations, and hours. How can I help you?";
    }

    // Default response - language-aware
    if (detectedLanguage === 'sv') {
        const swedishResponses = [
            "Jag är här för att hjälpa dig med frågor om Fooodis restaurang! Oavsett om du behöver information om vår meny, bokningar, öppettider eller något annat, låt mig veta hur jag kan hjälpa dig.",
            "Tack för att du hör av dig! Jag hjälper gärna till med information om vår restaurang. Vad skulle du vilja veta om vår meny, tjänster eller matupplevelser?",
            "Jag är din Fooodis-assistent och jag är här för att hjälpa! Fråga gärna om vår meny, bokningar, öppettider, plats eller något annat som rör vår restaurang."
        ];
        return swedishResponses[Math.floor(Math.random() * swedishResponses.length)];
    } else {
        const englishResponses = [
            "I'm here to help with any questions about Fooodis restaurant! Whether you need information about our menu, reservations, hours, or anything else, just let me know how I can assist you.",
            "Thanks for reaching out! I'd love to help you with information about our restaurant. What would you like to know about our menu, services, or dining experiences?",
            "I'm your Fooodis assistant and I'm here to help! Feel free to ask about our menu, reservations, hours, location, or anything else related to our restaurant."
        ];
        return englishResponses[Math.floor(Math.random() * englishResponses.length)];
    }
}

// Styled response function
function getStyledResponse(response, style, detectedLanguage) {
    if (!response) {
        console.error('Empty response provided to getStyledResponse');
        return "Sorry, I couldn't generate a response at this time.";
    }

    const trimmedResponse = response.trim();

    if (!trimmedResponse) {
        console.error('Empty trimmed response provided to getStyledResponse');
        return "Sorry, I couldn't generate a response at this time.";
    }

    // Language-specific styling
    const greeting = detectedLanguage === 'sv' ? "Här är en hjälpande svar:" : "Here's a helpful response:";
    const closing = detectedLanguage === 'sv' ? "Hoppas det hjälper!" : "Hope that helps!";

    switch (style) {
        case 'friendly':
            return `${greeting}\n\n${trimmedResponse}\n\n${closing} 😊`;
        case 'professional':
            return `${greeting}\n\n${trimmedResponse}\n\nBest regards.`;
        case 'enthusiastic':
            return `${greeting}\n\n${trimmedResponse}\n\nSo exciting! 🎉`;
        case 'calm':
            return `${greeting}\n\n${trimmedResponse}\n\nLet me know if you need further assistance.`;
        case 'technical':
            return `${greeting}\n\n${trimmedResponse}\n\nFor more details, consult the documentation.`;
        case 'warm':
            return `${greeting}\n\n${trimmedResponse}\n\nHave a wonderful day! ☀️`;
        case 'experienced':
            return `${greeting}\n\n${trimmedResponse}\n\nBased on my experience, that should resolve the issue.`;
        default:
            return `${greeting}\n\n${trimmedResponse}\n\nHope this helps!`;
    }
}

// Generate conversation ID
function generateConversationId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Load conversations
async function loadConversations() {
    try {
        const data = await fs.readFile(path.join(__dirname, '../chatbot-conversations.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
    }
}

// Load users
async function loadUsers() {
    try {
        const data = await fs.readFile(path.join(__dirname, '../chatbot-users.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ success: true, status: 'Chatbot API is running' });
});

// Ensure conversations endpoint exists
if (!router.stack.find(layer => layer.route && layer.route.path === '/conversations')) {
    router.get('/conversations', async (req, res) => {
        try {
            const conversations = await loadConversations();
            res.json({ success: true, conversations });
        } catch (error) {
            console.error('Error loading conversations:', error);
            res.json({ success: true, conversations: [] });
        }
    });
}

// Ensure users endpoint exists
if (!router.stack.find(layer => layer.route && layer.route.path === '/users')) {
    router.get('/users', async (req, res) => {
        try {
            const users = await loadUsers();
            res.json({ success: true, users });
        } catch (error) {
            console.error('Error loading users:', error);
            res.json({ success: true, users: [] });
        }
    });
}

// Ensure config endpoint exists
if (!router.stack.find(layer => layer.route && layer.route.path === '/config')) {
    router.post('/config', (req, res) => {
        console.log('Config update received:', req.body);
        res.json({ success: true });
    });
}

module.exports = router;