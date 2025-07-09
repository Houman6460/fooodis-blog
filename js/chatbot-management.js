/**
 * 🤖 CHATBOT MANAGEMENT SYSTEM
 * Comprehensive chatbot management for the Fooodis platform
 */

(function() {
    'use strict';

    window.ChatbotManager = class {
        constructor() {
            this.settings = {
                enabled: true,
                chatbotName: 'Fooodis Assistant',
                welcomeMessage: 'Hello! How can I help you today?',
                avatar: '',
                enableMultipleAgents: false,
                agents: [],
                allowFileUpload: false,
                maxFileSize: 5,
                allowedFileTypes: ['image/*', '.pdf', '.doc', '.docx', '.txt']
            };

            this.conversations = [];
            this.currentConversation = null;
            this.isInitialized = false;

            console.log('🤖 ChatbotManager constructor called');
        }

        async init() {
            if (this.isInitialized) {
                console.log('ChatbotManager already initialized');
                return;
            }

            console.log('🤖 Initializing ChatbotManager...');

            try {
                await this.loadSettings();
                await this.loadConversations();
                this.setupEventListeners();
                this.isInitialized = true;

                console.log('✅ ChatbotManager initialized successfully');

                // Trigger initialization event
                document.dispatchEvent(new CustomEvent('chatbotManagerReady'));

            } catch (error) {
                console.error('❌ ChatbotManager initialization error:', error);
            }
        }

        async loadSettings() {
            try {
                // Load from localStorage first
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    this.settings = { ...this.settings, ...parsed };
                    console.log('Settings loaded from localStorage:', this.settings);
                }

                // Try to load from server as backup
                try {
                    const response = await fetch('/api/chatbot/settings');
                    if (response.ok) {
                        const serverSettings = await response.json();
                        if (serverSettings) {
                            this.settings = { ...this.settings, ...serverSettings };
                            console.log('Settings updated from server:', this.settings);
                        }
                    }
                } catch (serverError) {
                    console.log('Server settings not available, using localStorage/defaults');
                }

            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }

        async loadConversations() {
            try {
                // Load conversations from localStorage
                const savedConversations = localStorage.getItem('fooodis-chatbot-conversations');
                if (savedConversations) {
                    this.conversations = JSON.parse(savedConversations);
                    console.log(`Loaded ${this.conversations.length} conversations`);
                }

                // Try to load from server
                try {
                    const response = await fetch('/api/chatbot/conversations');
                    if (response.ok) {
                        const serverConversations = await response.json();
                        if (serverConversations && Array.isArray(serverConversations)) {
                            this.conversations = serverConversations;
                            this.saveConversationsToStorage();
                        }
                    }
                } catch (serverError) {
                    console.log('Server conversations not available, using localStorage');
                }

            } catch (error) {
                console.error('Error loading conversations:', error);
                this.conversations = [];
            }
        }

        setupEventListeners() {
            // Listen for chatbot widget ready
            document.addEventListener('chatbotWidgetReady', () => {
                console.log('Chatbot widget ready, connecting to manager');
                this.connectToWidget();
            });

            // Listen for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key === 'fooodis-chatbot-settings') {
                    this.loadSettings();
                }
            });
        }

        connectToWidget() {
            if (window.chatbotWidget) {
                console.log('Connected to chatbot widget');
                // Widget is available, can set up bidirectional communication
            }
        }

        async generateAgentResponse(options) {
            const {
                message,
                conversationId,
                language = 'en',
                agent = null,
                userName = null,
                userRegistered = false,
                recentMessages = []
            } = options;

            try {
                console.log('Generating agent response for:', message);

                // Create conversation if it doesn't exist
                let conversation = this.getConversation(conversationId);
                if (!conversation) {
                    conversation = this.createConversation(conversationId, userName);
                }

                // Add user message to conversation
                this.addMessageToConversation(conversationId, {
                    content: message,
                    sender: 'user',
                    timestamp: new Date().toISOString()
                });

                // Determine response based on context
                let response = await this.generateContextualResponse(message, {
                    language,
                    agent,
                    userName,
                    userRegistered,
                    recentMessages,
                    conversation
                });

                // Add assistant response to conversation
                this.addMessageToConversation(conversationId, {
                    content: response,
                    sender: 'assistant',
                    timestamp: new Date().toISOString()
                });

                // Save conversations
                this.saveConversationsToStorage();

                return {
                    success: true,
                    message: response,
                    conversationId: conversationId
                };

            } catch (error) {
                console.error('Error generating agent response:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        async generateContextualResponse(message, context) {
            const { language, agent, userName, userRegistered, conversation } = context;

            // Analyze message intent
            const intent = this.analyzeIntent(message.toLowerCase());

            // Generate response based on intent and context
            let response = '';

            switch (intent) {
                case 'greeting':
                    response = this.generateGreeting(language, userName);
                    break;
                case 'help':
                    response = this.generateHelpResponse(language);
                    break;
                case 'product_inquiry':
                    response = this.generateProductResponse(language);
                    break;
                case 'support':
                    response = this.generateSupportResponse(language);
                    break;
                case 'pricing':
                    response = this.generatePricingResponse(language);
                    break;
                default:
                    response = this.generateGeneralResponse(message, language);
            }

            return response;
        }

        analyzeIntent(message) {
            const greetingWords = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'hej', 'hallo'];
            const helpWords = ['help', 'assist', 'support', 'hjälp'];
            const productWords = ['product', 'feature', 'restaurant', 'food', 'order', 'menu', 'produkt'];
            const supportWords = ['problem', 'issue', 'bug', 'error', 'not working', 'problem', 'fel'];
            const pricingWords = ['price', 'cost', 'pricing', 'plan', 'subscription', 'pris', 'kostnad'];

            if (greetingWords.some(word => message.includes(word))) {
                return 'greeting';
            }
            if (helpWords.some(word => message.includes(word))) {
                return 'help';
            }
            if (productWords.some(word => message.includes(word))) {
                return 'product_inquiry';
            }
            if (supportWords.some(word => message.includes(word))) {
                return 'support';
            }
            if (pricingWords.some(word => message.includes(word))) {
                return 'pricing';
            }

            return 'general';
        }

        generateGreeting(language, userName) {
            const name = userName ? ` ${userName}` : '';

            if (language === 'sv') {
                return `Hej${name}! Välkommen till Fooodis. Jag är din AI-assistent och jag hjälper gärna till med frågor om våra restauranglösningar. Vad kan jag hjälpa dig med idag?`;
            }

            return `Hello${name}! Welcome to Fooodis. I'm your AI assistant and I'm here to help with any questions about our restaurant solutions. How can I assist you today?`;
        }

        generateHelpResponse(language) {
            if (language === 'sv') {
                return `Jag kan hjälpa dig med:
• Frågor om Fooodis produkter och funktioner
• Teknisk support och felsökning
• Information om priser och abonnemang
• Hjälp med att komma igång
• Kontakt med vårt supportteam

Vad är du specifikt intresserad av?`;
            }

            return `I can help you with:
• Questions about Fooodis products and features
• Technical support and troubleshooting
• Pricing and subscription information
• Getting started guidance
• Connecting you with our support team

What are you specifically interested in?`;
        }

        generateProductResponse(language) {
            if (language === 'sv') {
                return `Fooodis erbjuder omfattande restauranglösningar:

🍽️ **Orderhantering** - Hantera beställningar från flera kanaler
📱 **Mobilappar** - Anpassade appar för dina kunder
💳 **Betalningslösningar** - Säkra och snabba betalningar
📊 **Analytics** - Detaljerade rapporter och insikter
🎯 **Marknadsföring** - Verktyg för att nå fler kunder

Vill du veta mer om någon specifik funktion?`;
            }

            return `Fooodis offers comprehensive restaurant solutions:

🍽️ **Order Management** - Handle orders from multiple channels
📱 **Mobile Apps** - Custom apps for your customers
💳 **Payment Solutions** - Secure and fast payments
📊 **Analytics** - Detailed reports and insights
🎯 **Marketing** - Tools to reach more customers

Would you like to know more about any specific feature?`;
        }

        generateSupportResponse(language) {
            if (language === 'sv') {
                return `Jag hjälper gärna till med teknisk support! 

För att ge dig bästa möjliga hjälp, kan du berätta:
• Vad är det specifika problemet?
• Vilken del av systemet gäller det?
• Vilka felmeddelanden ser du (om några)?

Du kan också kontakta vårt supportteam direkt på support@fooodis.com för mer avancerad hjälp.`;
            }

            return `I'm happy to help with technical support!

To provide you with the best assistance, could you tell me:
• What is the specific problem?
• Which part of the system does it involve?
• What error messages are you seeing (if any)?

You can also contact our support team directly at support@fooodis.com for more advanced help.`;
        }

        generatePricingResponse(language) {
            if (language === 'sv') {
                return `Fooodis erbjuder flexibla prisplaner för alla typer av restauranger:

💡 **Starter** - Perfekt för små restauranger
🚀 **Professional** - För växande verksamheter
🏢 **Enterprise** - Avancerade funktioner för större kedjor

Våra priser baseras på:
• Antal beställningar per månad
• Valda funktioner och moduler
• Anpassningsnivå

Vill du ha en personlig offert? Jag kan sätta dig i kontakt med vårt säljteam!`;
            }

            return `Fooodis offers flexible pricing plans for all types of restaurants:

💡 **Starter** - Perfect for small restaurants
🚀 **Professional** - For growing businesses
🏢 **Enterprise** - Advanced features for larger chains

Our pricing is based on:
• Number of orders per month
• Selected features and modules
• Level of customization

Would you like a personalized quote? I can connect you with our sales team!`;
        }

        generateGeneralResponse(message, language) {
            // Try to provide a helpful general response
            if (language === 'sv') {
                return `Tack för din fråga! Jag gör mitt bästa för att hjälpa dig. Om du har specifika frågor om Fooodis produkter, priser eller support så hjälper jag gärna till. 

Du kan också:
• Besöka vår webbplats för mer information
• Kontakta vårt säljteam för en demo
• Nå vårt supportteam för teknisk hjälp

Vad kan jag hjälpa dig med?`;
            }

            return `Thank you for your question! I'm doing my best to help you. If you have specific questions about Fooodis products, pricing, or support, I'm happy to assist.

You can also:
• Visit our website for more information
• Contact our sales team for a demo
• Reach our support team for technical help

How can I help you?`;
        }

        getConversation(conversationId) {
            return this.conversations.find(conv => conv.id === conversationId);
        }

        createConversation(conversationId, userName = null) {
            const conversation = {
                id: conversationId,
                userName: userName,
                startTime: new Date().toISOString(),
                messages: [],
                status: 'active'
            };

            this.conversations.push(conversation);
            return conversation;
        }

        addMessageToConversation(conversationId, message) {
            const conversation = this.getConversation(conversationId);
            if (conversation) {
                conversation.messages.push(message);
                conversation.lastActivity = new Date().toISOString();
            }
        }

        saveConversationsToStorage() {
            try {
                localStorage.setItem('fooodis-chatbot-conversations', JSON.stringify(this.conversations));
            } catch (error) {
                console.error('Error saving conversations:', error);
            }
        }

        saveSettings() {
            try {
                localStorage.setItem('fooodis-chatbot-settings', JSON.stringify(this.settings));
                console.log('Settings saved to localStorage');

                // Trigger settings update event
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'fooodis-chatbot-settings',
                    newValue: JSON.stringify(this.settings)
                }));

            } catch (error) {
                console.error('Error saving settings:', error);
            }
        }

        updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings };
            this.saveSettings();
        }

        // Public API methods
        isEnabled() {
            return this.settings.enabled;
        }

        getSettings() {
            return { ...this.settings };
        }

        getConversations() {
            return [...this.conversations];
        }
    };

    // Initialize chatbot manager
    window.chatbotManager = new ChatbotManager();

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chatbotManager.init();
        });
    } else {
        window.chatbotManager.init();
    }

    console.log('✅ ChatbotManager class loaded and instance created');

})();