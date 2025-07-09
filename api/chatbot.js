const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Mock OpenAI integration (replace with actual OpenAI API key)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'mock-key';

// Agent configurations
const AGENTS = {
    customer_support: {
        name: "David Kim",
        personality: "Helpful and friendly customer support representative",
        systemPrompt: "You are David Kim, a helpful Fooodis customer support representative. Be friendly, professional, and focus on resolving customer issues.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlOGYyNGMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iIzI2MjgyZiIvPgo8L3N2Zz4KPC9zdmc+"
    },
    sales: {
        name: "Emma Wilson",
        personality: "Knowledgeable sales consultant focused on helping customers find the right solutions",
        systemPrompt: "You are Emma Wilson, a Fooodis sales consultant. Help customers understand our products and services, provide pricing information, and guide them through purchasing decisions.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmZjcwNDMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+"
    },
    billing: {
        name: "Alex Chen",
        personality: "Professional billing specialist who handles payment and invoice inquiries",
        systemPrompt: "You are Alex Chen, a Fooodis billing specialist. Help customers with payment issues, invoices, refunds, and billing questions.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Y2FmNTAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+"
    },
    technical: {
        name: "Mike Johnson",
        personality: "Expert technical support specialist who solves technical problems",
        systemPrompt: "You are Mike Johnson, a Fooodis technical support specialist. Help customers troubleshoot technical issues, provide technical guidance, and resolve system problems.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMyMTk2ZjMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+"
    },
    delivery: {
        name: "Sarah Davis",
        personality: "Helpful delivery coordinator who tracks orders and shipping",
        systemPrompt: "You are Sarah Davis, a Fooodis delivery coordinator. Help customers track orders, resolve delivery issues, and provide shipping information.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM5YzI3YjAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+"
    },
    general: {
        name: "Lisa Anderson",
        personality: "Friendly general inquiries specialist for all other questions",
        systemPrompt: "You are Lisa Anderson, a Fooodis general inquiries specialist. Help customers with any questions or concerns, and direct them to appropriate departments when needed.",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmZjU3MjIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+"
    }
};

// Language responses
const LANGUAGE_RESPONSES = {
    en: {
        welcome: "🇬🇧 Hello! I'm your Fooodis assistant. How can I help you today?",
        error: "Sorry, I encountered an error. Please try again.",
        goodbye: "Thank you for contacting Fooodis. Have a great day!",
        registration_prompt: "Would you like to register for a personalized experience?",
        agent_handoff: "Let me connect you with the right specialist.",
        rating_request: "How would you rate your experience today?"
    },
    sv: {
        welcome: "🇸🇪 Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?",
        error: "Tyvärr uppstod ett fel. Vänligen försök igen.",
        goodbye: "Tack för att du kontaktade Fooodis. Ha en bra dag!",
        registration_prompt: "Vill du registrera dig för en personlig upplevelse?",
        agent_handoff: "Låt mig koppla dig till rätt specialist.",
        rating_request: "Hur skulle du betygsätta din upplevelse idag?"
    }
};

// File paths
const CONVERSATIONS_FILE = path.join(__dirname, '..', 'chatbot-conversations.json');
const USERS_FILE = path.join(__dirname, '..', 'chatbot-users.json');
const RATINGS_FILE = path.join(__dirname, '..', 'chatbot-ratings.json');

// Helper functions
async function loadJSONFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(`Creating new file: ${filePath}`);
        await saveJSONFile(filePath, defaultValue);
        return defaultValue;
    }
}

async function saveJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving file ${filePath}:`, error);
    }
}

function detectLanguage(text) {
    const swedishPatterns = [
        /\b(hej|tack|ja|nej|kanske|varför|när|var|vad|vem|hur)\b/i,
        /\b(svenska|sverige|stockholm|göteborg|malmö)\b/i,
        /\b(hjälpa|beställa|mat|restaurang)\b/i
    ];

    const swedishMatches = swedishPatterns.filter(pattern => pattern.test(text)).length;
    return swedishMatches > 0 ? 'sv' : 'en';
}

function selectAgent(message, language = 'en') {
    const text = message.toLowerCase();

    if (text.includes('billing') || text.includes('payment') || text.includes('invoice') || 
        text.includes('faktura') || text.includes('betalning')) {
        return AGENTS.billing;
    }
    if (text.includes('technical') || text.includes('bug') || text.includes('error') || 
        text.includes('teknisk') || text.includes('fel')) {
        return AGENTS.technical;
    }
    if (text.includes('delivery') || text.includes('order') || text.includes('shipping') || 
        text.includes('leverans') || text.includes('beställning')) {
        return AGENTS.delivery;
    }
    if (text.includes('sales') || text.includes('buy') || text.includes('price') || 
        text.includes('försäljning') || text.includes('köpa') || text.includes('pris')) {
        return AGENTS.sales;
    }

    return AGENTS.customer_support; // Default agent
}

async function generateResponse(message, context) {
    const { language = 'en', agent, conversationHistory = [] } = context;

    // Mock AI response (replace with actual OpenAI API call)
    const responses = {
        en: [
            "I'd be happy to help you with that! Fooodis is a modern food delivery platform that connects you with great restaurants. What specific information are you looking for?",
            "Thanks for reaching out! As your Fooodis assistant, I can help you with orders, restaurant recommendations, account questions, and more. What can I assist you with today?",
            "Hello! I'm here to help with all your Fooodis needs. Whether it's placing an order, tracking a delivery, or finding the perfect restaurant, I'm ready to assist you.",
            "Great question! Let me help you with that. Fooodis makes it easy to discover and order from your favorite restaurants. Is there something specific you'd like to know?",
            "Welcome to Fooodis! I'm here to make your food ordering experience as smooth as possible. How can I help you today?"
        ],
        sv: [
            "Jag hjälper dig gärna med det! Fooodis är en modern matleveransplattform som kopplar dig till fantastiska restauranger. Vilken specifik information letar du efter?",
            "Tack för att du hörde av dig! Som din Fooodis-assistent kan jag hjälpa dig med beställningar, restaurangrekommendationer, kontofrågor och mer. Vad kan jag hjälpa dig med idag?",
            "Hej! Jag är här för att hjälpa till med alla dina Fooodis-behov. Oavsett om det handlar om att lägga en beställning, spåra en leverans eller hitta den perfekta restaurangen, är jag redo att hjälpa dig.",
            "Bra fråga! Låt mig hjälpa dig med det. Fooodis gör det enkelt att upptäcka och beställa från dina favoritrestauranger. Finns det något specifikt du vill veta?",
            "Välkommen till Fooodis! Jag är här för att göra din matbeställningsupplevelse så smidig som möjligt. Hur kan jag hjälpa dig idag?"
        ]
    };

    const responseList = responses[language] || responses.en;
    const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];

    return {
        success: true,
        message: randomResponse,
        agent: agent,
        language: language,
        timestamp: new Date().toISOString()
    };
}

// API Routes

// Main chat endpoint
router.post('/', async (req, res) => {
    try {
        const { message, conversationId, language, agent, userInfo, recentMessages } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Detect language if not provided
        const detectedLanguage = language || detectLanguage(message);

        // Select appropriate agent
        const selectedAgent = agent || selectAgent(message, detectedLanguage);

        // Load conversation history
        const conversations = await loadJSONFile(CONVERSATIONS_FILE, []);
        let conversation = conversations.find(c => c.id === conversationId);

        if (!conversation) {
            conversation = {
                id: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                messages: [],
                userInfo: userInfo || null,
                language: detectedLanguage,
                agent: selectedAgent,
                startTime: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            conversations.push(conversation);
        }

        // Add user message
        conversation.messages.push({
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
        });

        // Generate AI response
        const context = {
            language: detectedLanguage,
            agent: selectedAgent,
            conversationHistory: conversation.messages,
            userInfo: userInfo
        };

        const aiResponse = await generateResponse(message, context);

        if (aiResponse.success) {
            // Add AI response to conversation
            conversation.messages.push({
                content: aiResponse.message,
                sender: 'assistant',
                timestamp: new Date().toISOString(),
                agent: selectedAgent.name
            });

            conversation.lastActivity = new Date().toISOString();
            conversation.messageCount = conversation.messages.length;
            conversation.lastMessage = aiResponse.message;

            // Save conversation
            await saveJSONFile(CONVERSATIONS_FILE, conversations);

            res.json({
                success: true,
                message: aiResponse.message,
                conversationId: conversation.id,
                agent: selectedAgent,
                language: detectedLanguage
            });
        } else {
            throw new Error('Failed to generate response');
        }

    } catch (error) {
        console.error('Chat API error:', error);
        const language = req.body.language || 'en';
        res.status(500).json({
            success: false,
            message: LANGUAGE_RESPONSES[language].error,
            error: error.message
        });
    }
});

// User registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, company, language, systemUsage, conversationId } = req.body;

        const users = await loadJSONFile(USERS_FILE, []);

        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            email,
            phone,
            company,
            language: language || 'en',
            systemUsage,
            conversationId,
            registrationTime: new Date().toISOString(),
            leadScore: calculateLeadScore(systemUsage)
        };

        users.push(newUser);
        await saveJSONFile(USERS_FILE, users);

        res.json({
            success: true,
            user: newUser,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rating submission endpoint
router.post('/rating', async (req, res) => {
    try {
        const { conversationId, rating, resolved, feedback, language } = req.body;

        const ratings = await loadJSONFile(RATINGS_FILE, []);

        const newRating = {
            id: `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conversationId,
            rating: parseInt(rating),
            resolved: resolved === true || resolved === 'true',
            feedback: feedback || '',
            language: language || 'en',
            timestamp: new Date().toISOString()
        };

        ratings.push(newRating);
        await saveJSONFile(RATINGS_FILE, ratings);

        res.json({
            success: true,
            rating: newRating,
            message: LANGUAGE_RESPONSES[language || 'en'].goodbye
        });

    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get conversations endpoint
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await loadJSONFile(CONVERSATIONS_FILE, []);
        res.json({
            success: true,
            conversations: conversations.map(conv => ({
                id: conv.id,
                messageCount: conv.messages.length,
                lastMessage: conv.lastMessage || (conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : ''),
                lastActivity: conv.lastActivity,
                language: conv.language,
                agent: conv.agent?.name || 'Unknown'
            }))
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get agents endpoint
router.get('/agents', (req, res) => {
    res.json({
        success: true,
        agents: Object.values(AGENTS)
    });
});

// Configuration endpoint
router.get('/config', (req, res) => {
    res.json({
        success: true,
        config: {
            enabled: true,
            languages: ['en', 'sv'],
            agents: Object.keys(AGENTS),
            features: {
                registration: true,
                rating: true,
                fileUpload: true,
                multiLanguage: true
            }
        }
    });
});

function calculateLeadScore(systemUsage) {
    const scores = {
        'new_user': 10,
        'existing_customer': 8,
        'business_inquiry': 15,
        'technical_support': 5
    };
    return scores[systemUsage] || 5;
}

module.exports = router;