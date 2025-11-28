/**
 * Fooodis AI Chatbot Widget
 * A comprehensive chatbot widget for customer interaction
 */

(function() {
    'use strict';

    window.FoodisChatbot = {
        config: {
            apiEndpoint: '',
            position: 'bottom-right',
            primaryColor: '#e8f24c',
            language: 'en',
            assistants: [],
            avatar: ''
        },
        conversationId: null,
        isOpen: false,
        isTyping: false,
        widget: null,
        messages: [],
        userRegistered: false,
        userInfo: null,
        availableAgents: [],
        currentAgent: null,
        chatbotSettings: null,
        conversationPhase: 'welcome', // welcome -> handoff -> agent -> personalized
        userName: null,
        handoffComplete: false,
        currentLanguage: null, // Will be detected from user input
        languageDetected: false,

        init: function(options = {}) {
            console.log('Initializing Fooodis Chatbot Widget...');

            // Merge configuration
            this.config = { ...this.config, ...options };

            // Set default API endpoint if not provided
            if (!this.config.apiEndpoint) {
                this.config.apiEndpoint = window.location.origin + '/api/chatbot';
            }

            // Initialize chat state
            this.conversationPhase = 'welcome'; // welcome -> handoff -> agent -> personalized
            this.userName = localStorage.getItem('fooodis-user-name') || null;
            this.handoffComplete = false;

            // Load saved settings and prepare agents
            this.loadSavedSettings();
            
            // Load language preferences
            this.loadLanguagePreference();

            // Check if chatbot is enabled before showing
            this.checkChatbotEnabled();

            // Create and inject widget
            this.createWidget();
            this.attachEventListeners();

            // Set up avatar update listener
            this.setupAvatarUpdateListener();

            console.log('Fooodis Chatbot Widget initialized successfully');
        },

        getInitialWelcomeMessage: function() {
            // Ensure language detection is loaded first
            this.loadLanguagePreference();
            
            // Use General Settings welcome message for initial greeting
            if (this.chatbotSettings && this.chatbotSettings.welcomeMessage) {
                console.log('🌐 Using configured welcome message:', this.chatbotSettings.welcomeMessage);
                return this.chatbotSettings.welcomeMessage;
            }
            
            // Fallback bilingual welcome message with proper formatting
            const fallbackMessage = `
                <div class="bilingual-welcome">
                    <div class="welcome-en">🇬🇧 <strong>English:</strong> Hello! I'm your Fooodis assistant. How can I help you today?</div>
                    <div class="welcome-sv">🇸🇪 <strong>Svenska:</strong> Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?</div>
                </div>
            `;
            
            console.log('🌐 Using fallback bilingual welcome message');
            return fallbackMessage;
        },

        getAgentHandoffMessage: function() {
            // Check multiple sources for language detection
            const storedLang = localStorage.getItem('fooodis-language');
            let currentLang = storedLang || this.currentLanguage || 'english';
            
            // Normalize language names to match message keys  
            if (currentLang === 'sv' || currentLang === 'svenska') {
                currentLang = 'swedish';
            } else if (currentLang === 'en' || currentLang === 'engelska') {
                currentLang = 'english';
            }
            
            console.log('🔧 Handoff message - Language sources:', {
                stored: storedLang,
                current: this.currentLanguage,
                using: currentLang
            });
            
            const messages = {
                english: [
                    "Thank you for contacting us! We are connecting you to one of our available agents...",
                    "Please wait a moment while we connect you to one of our support agents...",
                    "We're finding the best available agent to assist you right now...",
                    "Hold on, we're connecting you to one of our team members..."
                ],
                swedish: [
                    "Tack för att du kontaktar oss! Vi kopplar dig till en av våra tillgängliga agenter...",
                    "Vänta ett ögonblick medan vi kopplar dig till en av våra supportagenter...",
                    "Vi letar efter den bästa tillgängliga agenten för att hjälpa dig just nu...",
                    "Håll ut, vi kopplar dig till en av våra teammedlemmar..."
                ]
            };
            
            const langMessages = messages[currentLang] || messages.english;
            const selectedMessage = langMessages[Math.floor(Math.random() * langMessages.length)];
            
            console.log('🇸🇪 Selected handoff message:', selectedMessage);
            return selectedMessage;
        },

        performAgentHandoff: function(departmentId = null) {
            if (this.handoffComplete || !this.availableAgents || this.availableAgents.length === 0) {
                return;
            }
            
            console.log('Performing agent handoff...', departmentId ? `Department: ${departmentId}` : 'No department specified');
            
            // Add handoff message first
            this.addMessage(this.getAgentHandoffMessage(), 'assistant');
            
            // Show typing indicator during handoff
            this.showTyping();
            
            // Switch to agent after delay
            setTimeout(() => {
                this.hideTyping();
                
                // Select and switch to agent (with department preference if specified)
                this.conversationPhase = 'agent';
                this.selectAndSetAgent(departmentId);
                
                // FIXED: Only send agent introduction on FIRST handoff
                // Prevent duplicate welcome messages after AI responses
                if (!this.handoffComplete) {
                    console.log('🤝 AGENT HANDOFF - Sending first agent introduction');
                    const agentIntro = this.getLocalizedAgentIntroduction();
                    this.addMessage(agentIntro, 'assistant');
                } else {
                    console.log('🚫 DUPLICATE PREVENTED - Agent introduction already sent, skipping');
                }
                
                this.handoffComplete = true;
                
            }, 2500); // 2.5 second delay for realistic handoff
        },

        // Get localized agent introduction based on current language
        getLocalizedAgentIntroduction: function() {
            // Check multiple sources for language detection
            const storedLang = localStorage.getItem('fooodis-language');
            let currentLang = storedLang || this.currentLanguage || 'english';
            
            // Normalize language names to match introduction keys  
            if (currentLang === 'sv' || currentLang === 'svenska') {
                currentLang = 'swedish';
            } else if (currentLang === 'en' || currentLang === 'engelska') {
                currentLang = 'english';
            }
            
            const agentName = this.currentAgent ? this.currentAgent.name : 'Support Agent';
            
            console.log('🔧 Agent intro - Language sources:', {
                stored: storedLang,
                current: this.currentLanguage,
                using: currentLang,
                agent: agentName
            });
            
            const introductions = {
                english: {
                    withName: `Hello ${this.userName}! I'm ${agentName}, and I'll be assisting you today. How can I help you?`,
                    withoutName: `Hello! I'm ${agentName}, and I'll be assisting you today. How can I help you?`
                },
                swedish: {
                    withName: `Hej ${this.userName}! Jag heter ${agentName} och jag kommer att hjälpa dig idag. Vad kan jag hjälpa dig med?`,
                    withoutName: `Hej! Jag heter ${agentName} och jag kommer att hjälpa dig idag. Vad kan jag hjälpa dig med?`
                }
            };
            
            const langIntros = introductions[currentLang] || introductions.english;
            const selectedIntro = this.userName ? langIntros.withName : langIntros.withoutName;
            
            console.log('🇸🇪 Selected agent intro:', selectedIntro);
            return selectedIntro;
        },

        // Validate if agent switching is appropriate based on context
        shouldSwitchAgent: function(userMessage, currentContext) {
            // Don't switch agents unless explicitly needed
            if (!userMessage || !currentContext) return false;
            
            // Only switch if user explicitly asks for different department
            const departmentKeywords = {
                technical: ['technical', 'tech', 'bug', 'error', 'problem', 'broken', 'not working', 'teknisk', 'fel', 'fungerar inte'],
                sales: ['price', 'cost', 'buy', 'purchase', 'billing', 'payment', 'pris', 'köpa', 'betalning'],
                support: ['help', 'support', 'assistance', 'question', 'hjälp', 'stöd', 'fråga']
            };
            
            const messageWords = userMessage.toLowerCase().split(' ');
            
            // Check if user message contains department-specific keywords
            for (const [dept, keywords] of Object.entries(departmentKeywords)) {
                if (keywords.some(keyword => messageWords.includes(keyword))) {
                    // Only switch if current agent doesn't match the needed department
                    const currentDept = this.currentAgent?.department || 'general';
                    if (currentDept !== dept) {
                        console.log(`Agent switch needed: ${currentDept} -> ${dept}`);
                        return { shouldSwitch: true, targetDepartment: dept, reason: 'department_mismatch' };
                    }
                }
            }
            
            return { shouldSwitch: false, reason: 'no_department_change_needed' };
        },

        // Generate localized form content based on current language
        getLocalizedFormContent: function() {
            const currentLang = this.getCurrentLanguage();
            
            const formContent = {
                english: {
                    title: "Let's Get Started!",
                    subtitle: "Please provide your information to continue",
                    namePlaceholder: "Your Name",
                    emailPlaceholder: "Your Email",
                    phonePlaceholder: "Your Phone",
                    systemUsageLabel: "Are you currently using a delivery system for your restaurant?",
                    selectOptionText: "Please select an option",
                    currentUserOption: "Yes, I'm currently using Fooodis",
                    competitorUserOption: "Yes, I'm using another system",
                    potentialUserOption: "No, I'm looking for a solution",
                    restaurantPlaceholder: "Restaurant Name",
                    skipButton: "Skip for now",
                    submitButton: "Submit"
                },
                swedish: {
                    title: "Låt oss komma igång!",
                    subtitle: "Vänligen ange din information för att fortsätta",
                    namePlaceholder: "Ditt namn",
                    emailPlaceholder: "Din e-postadress",
                    phonePlaceholder: "Ditt telefonnummer",
                    systemUsageLabel: "Använder du för närvarande ett leveranssystem för din restaurang?",
                    selectOptionText: "Vänligen välj ett alternativ",
                    currentUserOption: "Ja, jag använder för närvarande Fooodis",
                    competitorUserOption: "Ja, jag använder ett annat leveranssystem",
                    potentialUserOption: "Nej, jag söker efter en lösning",
                    restaurantPlaceholder: "Restaurangnamn",
                    skipButton: "Hoppa över för tillfället",
                    submitButton: "Skicka"
                }
            };
            
            return formContent[currentLang] || formContent.english;
        },

        // Update form content with localized text
        updateFormLocalization: function() {
            const content = this.getLocalizedFormContent();
            
            // Update form elements with localized content
            const formTitle = document.querySelector('#registration-form h3');
            const formSubtitle = document.querySelector('#registration-form p');
            const nameInput = document.getElementById('user-name');
            const emailInput = document.getElementById('user-email');
            const phoneInput = document.getElementById('user-phone');
            const systemUsageLabel = document.querySelector('label[for="system-usage"]');
            const selectOption = document.querySelector('#system-usage option[value=""]');
            const currentUserOption = document.querySelector('#system-usage option[value="current_user"]');
            const competitorOption = document.querySelector('#system-usage option[value="competitor_user"]');
            const potentialOption = document.querySelector('#system-usage option[value="potential_user"]');
            const restaurantInput = document.getElementById('restaurant-name');
            const skipButton = document.getElementById('skip-registration');
            const submitButton = document.getElementById('submit-registration');
            
            // Update text content if elements exist
            if (formTitle) formTitle.textContent = content.title;
            if (formSubtitle) formSubtitle.textContent = content.subtitle;
            if (nameInput) nameInput.placeholder = content.namePlaceholder;
            if (emailInput) emailInput.placeholder = content.emailPlaceholder;
            if (phoneInput) phoneInput.placeholder = content.phonePlaceholder;
            if (systemUsageLabel) systemUsageLabel.textContent = content.systemUsageLabel;
            if (selectOption) selectOption.textContent = content.selectOptionText;
            if (currentUserOption) currentUserOption.textContent = content.currentUserOption;
            if (competitorOption) competitorOption.textContent = content.competitorUserOption;
            if (potentialOption) potentialOption.textContent = content.potentialUserOption;
            if (restaurantInput) restaurantInput.placeholder = content.restaurantPlaceholder;
            if (skipButton) skipButton.textContent = content.skipButton;
            if (submitButton) submitButton.textContent = content.submitButton;
            
            console.log(`Form localized to: ${this.getCurrentLanguage()}`);
        },

        // Get comprehensive conversation context for agents
        getConversationContext: function() {
            return {
                // User information
                user: {
                    name: this.userName || null,
                    email: this.userEmail || null,
                    phone: this.userPhone || null,
                    registered: this.userRegistered || false,
                    language: this.getCurrentLanguage(),
                    sessionId: this.conversationId
                },
                // Conversation details
                conversation: {
                    id: this.conversationId,
                    startTime: this.conversationStartTime,
                    phase: this.conversationPhase,
                    messageCount: this.messages.length,
                    duration: this.conversationStartTime ? 
                        Math.floor((new Date() - new Date(this.conversationStartTime)) / 1000) : 0,
                    handoffComplete: this.handoffComplete
                },
                // Agent information
                agent: {
                    current: this.currentAgent ? {
                        name: this.currentAgent.name,
                        department: this.currentAgent.department,
                        id: this.currentAgent.id,
                        assistantId: this.currentAgent.assignedAssistantId
                    } : null,
                    available: this.availableAgents || []
                },
                // Full message history (last 10 messages for context)
                recentMessages: this.messages.slice(-10).map(msg => ({
                    text: msg.text,
                    sender: msg.sender,
                    timestamp: msg.timestamp,
                    type: msg.type || 'text'
                })),
                // System state
                system: {
                    scenarioActive: this.scenarioActive,
                    currentNode: this.currentNode ? this.currentNode.id : null,
                    language: this.getCurrentLanguage(),
                    formShown: document.getElementById('registration-form') ? 
                        document.getElementById('registration-form').style.display !== 'none' : false
                }
            };
        },

        // Enhanced personalized response generation
        getPersonalizedResponse: function(baseResponse, context = null) {
            if (!baseResponse) return baseResponse;
            
            const conversationContext = context || this.getConversationContext();
            let personalizedResponse = baseResponse;
            
            // Add user name if available and appropriate
            if (conversationContext.user.name && !personalizedResponse.includes(conversationContext.user.name)) {
                // Only add name to certain types of responses (greetings, questions, etc.)
                const shouldPersonalize = /^(hi|hello|thank|great|excellent|i see|let me|i can help)/i.test(personalizedResponse);
                if (shouldPersonalize) {
                    personalizedResponse = personalizedResponse.replace(
                        /^(hi|hello|thank you)/i, 
                        `$1 ${conversationContext.user.name}`
                    );
                }
            }
            
            // Add context-aware elements based on conversation phase
            if (conversationContext.conversation.phase === 'agent' && conversationContext.agent.current) {
                // Agent is active - ensure responses are department-specific
                const dept = conversationContext.agent.current.department;
                if (dept && dept !== 'general') {
                    console.log(`Contextualizing response for ${dept} department`);
                }
            }
            
            return personalizedResponse;
        },

        // Perform agent switch with proper transition
        performAgentSwitch: function(targetDepartment, userMessage) {
            console.log(`Switching to ${targetDepartment} department`);
            
            // Find agent for target department
            const targetAgent = this.availableAgents.find(agent => 
                agent.department === targetDepartment
            );
            
            if (!targetAgent) {
                console.warn(`No agent found for department: ${targetDepartment}`);
                return;
            }
            
            // Store previous agent for smooth transition
            const previousAgent = this.currentAgent;
            
            // Switch to new agent
            this.currentAgent = targetAgent;
            
            // Add transition message
            const currentLang = this.getCurrentLanguage();
            const transitionMessages = {
                english: `Let me connect you with our ${targetDepartment} specialist, ${targetAgent.name}, who can better assist you with this.`,
                swedish: `Låt mig koppla dig till vår ${targetDepartment} specialist, ${targetAgent.name}, som bättre kan hjälpa dig med detta.`
            };
            
            const transitionMessage = transitionMessages[currentLang] || transitionMessages.english;
            this.addMessage(transitionMessage, 'assistant');
            
            // Show typing indicator for new agent
            this.showTyping();
            
            // Brief delay then continue with original message
            setTimeout(() => {
                this.hideTyping();
                const newAgentIntro = this.getLocalizedAgentIntroduction();
                this.addMessage(newAgentIntro, 'assistant');
                
                // Process the original message with new agent context
                this.processUserMessage(userMessage);
            }, 1500);
        },

        // Process user message with current agent context
        processUserMessage: function(message) {
            // Show typing indicator
            this.showTyping();
            
            // Check for conversation exit keywords
            if (this.isConversationExitRequest(message)) {
                this.handleConversationExit();
                return;
            }
            
            // Continue with normal message processing
            this.continueConversation(message);
        },

        // Check if user wants to exit conversation
        isConversationExitRequest: function(message) {
            const exitKeywords = {
                english: ['bye', 'goodbye', 'thank you', 'thanks', 'done', 'finished', 'end chat', 'stop'],
                swedish: ['hej då', 'adjö', 'tack', 'tack så mycket', 'klar', 'färdig', 'avsluta', 'slut']
            };
            
            const currentLang = this.getCurrentLanguage();
            const keywords = [...exitKeywords.english, ...(exitKeywords[currentLang] || [])];
            
            const messageWords = message.toLowerCase().split(' ');
            return keywords.some(keyword => messageWords.includes(keyword));
        },

        // Handle conversation exit with proper closure
        handleConversationExit: function() {
            const currentLang = this.getCurrentLanguage();
            const exitMessages = {
                english: "Thank you for contacting Fooodis! Have a great day and don't hesitate to reach out if you need any assistance.",
                swedish: "Tack för att du kontaktade Fooodis! Ha en bra dag och tveka inte att höra av dig om du behöver hjälp."
            };
            
            const exitMessage = exitMessages[currentLang] || exitMessages.english;
            this.hideTyping();
            this.addMessage(exitMessage, 'assistant');
            
            // Store final conversation state
            this.storeConversation();
            
            // Mark conversation as completed
            this.conversationPhase = 'completed';
            
            console.log('Conversation ended by user request');
        },

        // Continue conversation with proper context
        continueConversation: function(message) {
            const conversationContext = this.getConversationContext();
            
            // Use ChatbotManager if available
            if (window.chatbotManager && typeof window.chatbotManager.generateAgentResponse === 'function') {
                window.chatbotManager.generateAgentResponse({
                    message: message,
                    conversationId: this.conversationId,
                    language: conversationContext.user.language,
                    agent: this.currentAgent,
                    assistantId: this.currentAgent?.assignedAssistantId || null,
                    userName: conversationContext.user.name,
                    userRegistered: conversationContext.user.registered,
                    context: conversationContext,
                    recentMessages: conversationContext.recentMessages
                })
                .then(data => {
                    this.hideTyping();
                    if (data.success) {
                        // Add enhanced personalized response
                        const responseMessage = this.getPersonalizedResponse(data.message, conversationContext);
                        this.addMessage(responseMessage, 'assistant');
                        
                        // Trigger post-chat automation after assistant response
                        setTimeout(() => {
                            this.triggerEndOfConversationCheck();
                        }, 3000);
                        
                        // Log conversation activity for real-time tracking
                        this.logConversationActivity('agent_response', {
                            agentName: this.currentAgent?.name,
                            department: this.currentAgent?.department,
                            messageLength: responseMessage.length,
                            language: conversationContext.user.language,
                            userRegistered: conversationContext.user.registered
                        });
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    }
                })
                .catch(error => {
                    console.error('Error in conversation continuation:', error);
                    this.hideTyping();
                    this.addMessage('Sorry, I\'m having trouble processing your request. Please try again.', 'assistant');
                });
            } else {
                // Fallback response when ChatbotManager is not available
                this.hideTyping();
                const fallbackMessage = conversationContext.user.name ? 
                    `I understand, ${conversationContext.user.name}. Let me help you with that.` :
                    'I understand. Let me help you with that.';
                this.addMessage(fallbackMessage, 'assistant');
            }
        },

        // Enhanced logging system for real-time conversation tracking
        logConversationActivity: function(activityType, details = {}) {
            const timestamp = new Date().toISOString();
            const conversationContext = this.getConversationContext();
            
            const logEntry = {
                timestamp: timestamp,
                conversationId: this.conversationId,
                sessionId: conversationContext.user.sessionId,
                activityType: activityType, // 'user_message', 'agent_response', 'form_submission', 'agent_switch', etc.
                details: {
                    ...details,
                    messageCount: conversationContext.conversation.messageCount,
                    conversationPhase: conversationContext.conversation.phase,
                    currentAgent: conversationContext.agent.current?.name,
                    userLanguage: conversationContext.user.language,
                    duration: conversationContext.conversation.duration
                },
                userInfo: {
                    name: conversationContext.user.name,
                    registered: conversationContext.user.registered,
                    language: conversationContext.user.language
                }
            };
            
            // Store in local activity log
            this.storeActivityLog(logEntry);
            
            // Send to backend for real-time tracking
            this.sendLogToBackend(logEntry);
            
            console.log(`[ACTIVITY LOG] ${activityType}:`, logEntry);
        },

        // Store activity log locally
        storeActivityLog: function(logEntry) {
            try {
                const existingLogs = JSON.parse(localStorage.getItem('fooodis-chatbot-activity-logs') || '[]');
                existingLogs.push(logEntry);
                
                // Keep only last 100 log entries to prevent storage overflow
                if (existingLogs.length > 100) {
                    existingLogs.splice(0, existingLogs.length - 100);
                }
                
                localStorage.setItem('fooodis-chatbot-activity-logs', JSON.stringify(existingLogs));
            } catch (error) {
                console.error('Error storing activity log locally:', error);
            }
        },

        // Send log to backend for real-time tracking
        sendLogToBackend: function(logEntry) {
            if (!this.config.apiEndpoint) return;
            
            fetch(this.config.apiEndpoint.replace('/chatbot', '/chatbot/analytics'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            })
            .then(response => {
                if (!response.ok) {
                    console.warn('Backend activity logging failed, but saved locally');
                }
            })
            .catch(error => {
                console.error('Activity log network error:', error);
            });
        },

        storeUserName: function(name) {
            if (name && name.trim()) {
                this.userName = name.trim();
                localStorage.setItem('fooodis-user-name', this.userName);
                console.log('User name stored:', this.userName);
                
                // Update conversation phase to personalized
                this.conversationPhase = 'personalized';
            }
        },

        getPersonalizedResponse: function(originalResponse) {
            if (!this.userName || this.conversationPhase !== 'personalized') {
                return originalResponse;
            }
            
            // Add personalization to responses
            const personalizedIntros = [
                `${this.userName}, `,
                `Hi ${this.userName}, `,
                `Thank you ${this.userName}, `,
                `Great question ${this.userName}, `,
                `I understand ${this.userName}, `
            ];
            
            // 60% chance to add personalization
            if (Math.random() < 0.6) {
                const intro = personalizedIntros[Math.floor(Math.random() * personalizedIntros.length)];
                return intro + originalResponse.charAt(0).toLowerCase() + originalResponse.slice(1);
            }
            
            return originalResponse;
        },

        checkChatbotEnabled: function() {
            try {
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    this.config.enabled = settings.enabled !== false;
                } else {
                    // Check server config if no local settings
                    this.fetchServerConfig();
                }
            } catch (error) {
                console.error('Error checking chatbot enabled state:', error);
                this.config.enabled = true; // Default to enabled
            }
        },

        async fetchServerConfig() {
            try {
                const response = await fetch('/api/chatbot');
                if (response.ok) {
                    const config = await response.json();
                    this.config.enabled = config.enabled !== false;
                }
            } catch (error) {
                console.error('Error fetching server config:', error);
                this.config.enabled = true;
            }
        },

        showWidget: function() {
            if (this.widget) {
                this.widget.style.display = 'block';
                this.config.enabled = true;
            }
        },

        hideWidget: function() {
            if (this.widget) {
                this.widget.style.display = 'none';
                this.config.enabled = false;
            }
        },

        loadSavedSettings: function() {
            try {
                // Load from localStorage where chatbot settings are saved
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                console.log('Widget loadSavedSettings - raw savedSettings:', savedSettings);
                
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    console.log('Widget loadSavedSettings - parsed settings:', settings);
                    console.log('Widget loadSavedSettings - settings.avatar:', settings.avatar);

                    // Store available agents for later handoff (don't select immediately)
                    if (settings.enableMultipleAgents && settings.agents && settings.agents.length > 0) {
                        this.availableAgents = settings.agents.filter(agent => agent.enabled !== false);
                        console.log('Available agents loaded:', this.availableAgents.length);
                    }

                    // Use general settings for initial display (not agent-specific)
                    this.config.avatar = settings.avatar || this.getDefaultAvatar();
                    console.log('Widget avatar set to:', this.config.avatar ? this.config.avatar.substring(0, 50) + '...' : 'null');
                    
                    this.currentAgent = {
                        name: settings.chatbotName || 'Fooodis Assistant',
                        avatar: this.config.avatar,
                        personality: 'Friendly assistant'
                    };

                    // Store settings for later use
                    this.chatbotSettings = settings;
                    console.log('General settings loaded for initial welcome');
                } else {
                    console.log('No saved settings found, using defaults');
                    // Set default when no settings
                    this.currentAgent = {
                        name: 'Fooodis Assistant',
                        avatar: this.getDefaultAvatar(),
                        personality: 'Friendly assistant'
                    };
                }
            } catch (error) {
                console.error('Error loading saved settings:', error);
                // Fallback to default
                this.currentAgent = {
                    name: 'Fooodis Assistant',
                    avatar: this.getDefaultAvatar(),
                    personality: 'Friendly assistant'
                };
            }
        },

        selectAndSetRandomAgent: function() {
            if (this.availableAgents && this.availableAgents.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.availableAgents.length);
                this.currentAgent = this.availableAgents[randomIndex];
                this.config.avatar = this.currentAgent.avatar || this.getDefaultAvatar();
                
                console.log('New random agent selected:', this.currentAgent.name);
                
                // Update widget if it exists
                if (this.widget) {
                    this.updateWidgetAgent();
                }
                
                return this.currentAgent;
            }
            return null;
        },

        selectAndSetAgent: function(departmentId = null) {
            if (this.availableAgents && this.availableAgents.length > 0) {
                let selectedAgent = null;

                // Try to find an agent matching the specified department
                if (departmentId) {
                    selectedAgent = this.availableAgents.find(agent => agent.departmentId === departmentId);
                }

                // Fallback to random agent if no department match
                if (!selectedAgent) {
                    selectedAgent = this.availableAgents[Math.floor(Math.random() * this.availableAgents.length)];
                }

                this.currentAgent = selectedAgent;
                this.config.avatar = this.currentAgent.avatar || this.getDefaultAvatar();
                
                console.log('New agent selected:', this.currentAgent.name);
                
                // Update widget if it exists
                if (this.widget) {
                    this.updateWidgetAgent();
                }
                
                return this.currentAgent;
            }
            return null;
        },

        updateWidgetAgent: function() {
            if (!this.widget || !this.currentAgent) return;
            
            // Update all avatar images in the widget
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img');
            avatarImages.forEach(img => {
                img.src = this.currentAgent.avatar || this.getDefaultAvatar();
            });

            // Update agent name in header
            const headerName = this.widget.querySelector('.header-text h4');
            if (headerName) {
                headerName.textContent = this.currentAgent.name || 'Fooodis Assistant';
            }

            // Update typing indicator text
            const typingText = this.widget.querySelector('.chatbot-typing span:last-child');
            if (typingText) {
                typingText.textContent = `${this.currentAgent.name || 'Assistant'} is typing...`;
            }

            console.log('Widget updated with agent:', this.currentAgent.name);
        },

        rotateAgentRandomly: function() {
            // Change agent randomly during conversation (30% chance per message)
            if (this.availableAgents && this.availableAgents.length > 1 && Math.random() < 0.3) {
                const previousAgent = this.currentAgent;
                this.selectAndSetRandomAgent();
                
                // Make sure we actually got a different agent
                if (this.currentAgent.id === previousAgent.id && this.availableAgents.length > 1) {
                    // Force different agent
                    const otherAgents = this.availableAgents.filter(agent => agent.id !== previousAgent.id);
                    const randomIndex = Math.floor(Math.random() * otherAgents.length);
                    this.currentAgent = otherAgents[randomIndex];
                    this.config.avatar = this.currentAgent.avatar || this.getDefaultAvatar();
                    this.updateWidgetAgent();
                }
                
                return true; // Agent was rotated
            }
            return false; // No rotation
        },

        getAgentIntroduction: function(language = 'en') {
            if (this.currentAgent && this.currentAgent.introduction) {
                return this.currentAgent.introduction[language] || this.currentAgent.introduction.en;
            }

            // Fallback to default message
            if (language === 'sv') {
                return 'Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?';
            }
            return 'Hello! I\'m your Fooodis assistant. How can I help you today?';
        },

        updateAvatar: function(avatarUrl) {
            this.config.avatar = avatarUrl;

            // Update all avatar images in the widget
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .message-avatar img');
            avatarImages.forEach(img => {
                img.src = avatarUrl;
            });

            console.log('Avatar updated in chatbot widget:', avatarUrl);
        },

        setupAvatarUpdateListener: function() {
            // Listen for avatar updates from the dashboard
            window.addEventListener('storage', (e) => {
                if (e.key === 'fooodis-chatbot-settings') {
                    try {
                        const settings = JSON.parse(e.newValue);
                        if (settings && settings.avatar && settings.avatar !== this.config.avatar) {
                            this.updateAvatar(settings.avatar);
                        }
                        // Update file upload visibility
                        if (settings && typeof settings.allowFileUpload !== 'undefined') {
                            this.config.allowFileUpload = settings.allowFileUpload;
                            this.updateFileUploadVisibility();
                        }
                    } catch (error) {
                        console.error('Error handling settings update:', error);
                    }
                }
            });

            // Global function for direct avatar updates
            window.updateChatbotWidgetAvatar = (avatarUrl) => {
                this.updateAvatar(avatarUrl);
            };
        },

        updateFileUploadVisibility: function() {
            const uploadButton = document.getElementById('chatbot-upload');
            if (uploadButton) {
                uploadButton.style.display = this.config.allowFileUpload ? 'flex' : 'none';
            }
        },

        handleFileUpload: function(file) {
            if (!this.config.allowFileUpload) {
                this.addMessage('File uploads are currently disabled.', 'assistant');
                return;
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.addMessage('File size too large. Please select a file under 5MB.', 'assistant');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result
                };

                this.addMessage(`📎 File uploaded: ${file.name}`, 'user');
                this.addMessage('Thank you for uploading the file. I can see the file but currently cannot process file contents directly. Please describe what you need help with regarding this file.', 'assistant');
            };

            reader.readAsDataURL(file);
        },

        createWidget: function() {
            // Remove existing widget if present
            const existingWidget = document.getElementById('fooodis-chatbot');
            if (existingWidget) {
                existingWidget.remove();
            }

            // Ensure we have current agent info
            const agentName = this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant';
            const agentAvatar = this.currentAgent ? (this.currentAgent.avatar || this.getDefaultAvatar()) : this.getDefaultAvatar();

            // Create widget container
            const widget = document.createElement('div');
            widget.id = 'fooodis-chatbot';
            widget.className = `chatbot-widget ${this.config.position}`;

            widget.innerHTML = `
                <div class="chatbot-container">
                    <!-- Chat Button -->
                    <div class="chatbot-button" id="chatbot-button">
                        <div class="chatbot-avatar">
                            <img src="${agentAvatar}" alt="${agentName} Avatar" />
                        </div>
                        <div class="notification-badge" id="notification-badge">1</div>
                    </div>

                    <!-- Chat Window -->
                    <div class="chatbot-window" id="chatbot-window">
                        <div class="chatbot-header" style="background-color: #26282f;">
                            <div class="header-top">
                                <div class="chatbot-logo">
                                    <img src="images/Artboard17copy9.svg" alt="Fooodis Logo" class="header-logo" />
                                </div>
                                <button class="close-button" id="chatbot-close">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="agent-info">
                                <div class="chatbot-avatar-small">
                                    <img src="${agentAvatar}" alt="${agentName} Avatar" />
                                </div>
                                <div class="header-text">
                                    <h4>${agentName}</h4>
                                    <div class="status-line">
                                        <span class="status">Online</span>
                                        <span class="department-tag" id="agent-department-tag"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="chatbot-messages" id="chatbot-messages">
                            <div class="message assistant">
                                <div class="message-avatar">
                                    <img src="${agentAvatar}" alt="${agentName} Avatar" />
                                </div>
                                <div class="message-content">${this.getInitialWelcomeMessage()}</div>
                            </div>
                        </div>

                        <div class="chatbot-typing" id="chatbot-typing">
                            <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span>${agentName} is typing...</span>
                        </div>

                        <div class="chatbot-input">
                            <div class="input-container">
                                <input type="file" id="chatbot-file-input" style="display: none;" accept="image/*,.pdf,.doc,.docx,.txt" />
                                <button type="button" id="chatbot-upload" class="upload-btn" style="display: none;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <input type="text" id="chatbot-message-input" placeholder="Type your message..." />
                                <button id="chatbot-send" type="button">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Registration Form (Initially Hidden) -->
                        <div class="registration-form" id="registration-form" style="display: none;">
                            <!-- Language Toggle Tabs -->
                            <div class="language-tabs">
                                <button type="button" class="language-tab active" data-lang="en">English</button>
                                <button type="button" class="language-tab" data-lang="sv">Svenska</button>
                            </div>
                            
                            <!-- English Form -->
                            <div class="form-content active" id="form-en">
                                <div class="form-header">
                                    <h3>Let's Get Started!</h3>
                                    <p>Please provide your information to continue</p>
                                </div>
                                <form id="user-registration-form-en" class="registration-form-content">
                                    <div class="form-group">
                                        <input type="text" id="user-name-en" placeholder="Your Name" required />
                                    </div>
                                    <div class="form-group">
                                        <input type="email" id="user-email-en" placeholder="Your Email" required />
                                    </div>
                                    <div class="form-group">
                                        <input type="tel" id="user-phone-en" placeholder="Your Phone" required />
                                    </div>
                                    <div class="form-group">
                                        <label for="system-usage-en">Are you currently using a delivery system for your restaurant?</label>
                                        <select id="system-usage-en" required>
                                            <option value="" disabled selected>Please select an option</option>
                                            <option value="current_user">Yes, I'm currently using Fooodis</option>
                                            <option value="competitor_user">Yes, I'm using another system</option>
                                            <option value="potential_user">No, I'm looking for a solution</option>
                                        </select>
                                    </div>
                                    <div class="form-group conditional-field" id="restaurant-name-field-en" style="display: none;">
                                        <input type="text" id="restaurant-name-en" placeholder="Restaurant Name" />
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" id="skip-registration-en" class="btn-secondary">Skip for now</button>
                                        <button type="submit" id="submit-registration-en" class="btn-primary">Submit</button>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Swedish Form -->
                            <div class="form-content" id="form-sv">
                                <div class="form-header">
                                    <h3>Låt oss komma igång!</h3>
                                    <p>Vänligen ange din information för att fortsätta</p>
                                </div>
                                <form id="user-registration-form-sv" class="registration-form-content">
                                    <div class="form-group">
                                        <input type="text" id="user-name-sv" placeholder="Ditt namn" required />
                                    </div>
                                    <div class="form-group">
                                        <input type="email" id="user-email-sv" placeholder="Din e-post" required />
                                    </div>
                                    <div class="form-group">
                                        <input type="tel" id="user-phone-sv" placeholder="Ditt telefonnummer" required />
                                    </div>
                                    <div class="form-group">
                                        <label for="system-usage-sv">Använder du för närvarande ett leveranssystem för din restaurang?</label>
                                        <select id="system-usage-sv" required>
                                            <option value="" disabled selected>Vänligen välj ett alternativ</option>
                                            <option value="current_user">Ja, jag använder för närvarande Fooodis</option>
                                            <option value="competitor_user">Ja, jag använder ett annat leveranssystem</option>
                                            <option value="potential_user">Nej, jag söker efter en lösning</option>
                                        </select>
                                    </div>
                                    <div class="form-group conditional-field" id="restaurant-name-field-sv" style="display: none;">
                                        <input type="text" id="restaurant-name-sv" placeholder="Restaurangnamn" />
                                    </div>
                                    <div class="form-actions">
                                        <button type="button" id="skip-registration-sv" class="btn-secondary">Hoppa över för tillfället</button>
                                        <button type="submit" id="submit-registration-sv" class="btn-primary">Skicka</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add styles
            this.injectStyles();

            // Set initial visibility based on enabled state
            if (!this.config.enabled) {
                widget.style.display = 'none';
            }

            // Append to body
            document.body.appendChild(widget);
            this.widget = widget;
        },

        attachEventListeners: function() {
            const chatButton = document.getElementById('chatbot-button');
            const closeButton = document.getElementById('chatbot-close');
            const sendButton = document.getElementById('chatbot-send');
            const messageInput = document.getElementById('chatbot-message-input');
            const registrationFormEn = document.getElementById('user-registration-form-en');
            const registrationFormSv = document.getElementById('user-registration-form-sv');
            const skipButtonEn = document.getElementById('skip-registration-en');
            const skipButtonSv = document.getElementById('skip-registration-sv');
            const systemUsageSelectEn = document.getElementById('system-usage-en');
            const systemUsageSelectSv = document.getElementById('system-usage-sv');
            const languageTabs = document.querySelectorAll('.language-tab');

            // Language tab switching
            languageTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const lang = tab.dataset.lang;
                    this.switchLanguageTab(lang);
                });
            });

            // Toggle chat window
            if (chatButton) {
                chatButton.addEventListener('click', () => this.toggleChat());
            }

            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeChat());
            }

            // Send message
            if (sendButton) {
                sendButton.addEventListener('click', () => this.sendMessage());
            }

            if (messageInput) {
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }

            // File upload
            const uploadButton = document.getElementById('chatbot-upload');
            const fileInput = document.getElementById('chatbot-file-input');

            if (uploadButton) {
                uploadButton.addEventListener('click', () => {
                    fileInput.click();
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.handleFileUpload(file);
                    }
                });
            }

            // Show/hide upload button based on settings
            this.updateFileUploadVisibility();

            // Language tab switching
            languageTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const targetLang = e.target.getAttribute('data-lang');
                    this.switchLanguageTab(targetLang);
                });
            });

            // Registration forms
            if (registrationFormEn) {
                registrationFormEn.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitRegistration('en');
                });
            }

            if (registrationFormSv) {
                registrationFormSv.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitRegistration('sv');
                });
            }

            if (skipButtonEn) {
                skipButtonEn.addEventListener('click', () => this.skipRegistration());
            }

            if (skipButtonSv) {
                skipButtonSv.addEventListener('click', () => this.skipRegistration());
            }

            // Dropdown setup moved to showRegistrationForm() for proper timing
        },

        toggleChat: function() {
            const window = document.getElementById('chatbot-window');
            const badge = document.getElementById('notification-badge');

            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        },

        openChat: function() {
            const window = document.getElementById('chatbot-window');
            const badge = document.getElementById('notification-badge');

            if (window) {
                window.style.display = 'flex';
                this.isOpen = true;

                if (badge) {
                    badge.style.display = 'none';
                }
            }
        },

        closeChat: function() {
            const window = document.getElementById('chatbot-window');

            if (window) {
                window.style.display = 'none';
                this.isOpen = false;
            }
        },

        async sendMessage() {
            const messageInput = document.getElementById('chatbot-message-input');
            const message = messageInput.value.trim();

            if (!message) return;

            // Detect and persist language from user input
            this.detectLanguage(message);
            
            // Log user message activity
            this.logConversationActivity('user_message', {
                messageText: message,
                messageLength: message.length,
                currentPhase: this.conversationPhase,
                agentActive: !!this.currentAgent
            });
            
            // Reset inactivity timer when user sends message
            this.resetInactivityTimer();
            
            // Check if user wants to finish conversation and handle intelligently
            if (this.handleUserFinishMessage(message)) {
                // User finish message handled, don't process further
                this.addMessage(message, 'user');
                messageInput.value = '';
                return;
            }
            
            // Add user message
            this.addMessage(message, 'user');
            messageInput.value = '';

            // Show typing indicator
            this.showTyping();

            // Check if scenario is active and process accordingly
            if (this.scenarioActive && this.currentNode) {
                this.processScenarioMessage(message);
                return;
            }
            
            // Trigger agent handoff after first user message if not done (fallback behavior)
            if (this.conversationPhase === 'welcome' && !this.handoffComplete) {
                setTimeout(() => {
                    this.hideTyping();
                    // Get department from current handoff node if available
                    const departmentId = window.chatbotManager ? 
                        window.chatbotManager.getCurrentHandoffDepartment() : null;
                    this.performAgentHandoff(departmentId);
                }, 1000); // Brief delay before handoff
                return;
            }

            // Use local ChatbotManager for response generation instead of external API
            console.log('=== AGENT HANDOFF DEBUG ===');
            console.log('window.chatbotManager available:', !!window.chatbotManager);
            console.log('generateAgentResponse function:', typeof window.chatbotManager?.generateAgentResponse);
            console.log('Current agent:', this.currentAgent);
            console.log('Assigned assistant ID:', this.currentAgent?.assignedAssistantId);
            
            // FORCE EXTERNAL API: Skip ChatbotManager to use working backend API
            // Backend is now fast (1.6s) and error-free after null safety fixes
            if (false && window.chatbotManager && typeof window.chatbotManager.generateAgentResponse === 'function') {
                console.log('Using local ChatbotManager for response generation');
                // Check if agent switch is needed before generating response
                const switchAnalysis = this.shouldSwitchAgent(message, this.getConversationContext());
                if (switchAnalysis.shouldSwitch) {
                    console.log(`Agent switch requested: ${switchAnalysis.reason}`);
                    this.performAgentSwitch(switchAnalysis.targetDepartment, message);
                    return;
                }
                
                // Use local response generation with comprehensive context
                const conversationContext = this.getConversationContext();
                window.chatbotManager.generateAgentResponse({
                    message: message,
                    conversationId: this.conversationId,
                    language: conversationContext.user.language,
                    agent: this.currentAgent,
                    assistantId: this.currentAgent?.assignedAssistantId || null,
                    userName: conversationContext.user.name,
                    userRegistered: conversationContext.user.registered,
                    context: conversationContext,
                    recentMessages: conversationContext.recentMessages
                })
                .then(data => {
                    this.hideTyping();

                    if (data.success) {
                        // Store conversation ID
                        this.conversationId = data.conversationId;

                        // Add personalized assistant response
                        const responseMessage = this.getPersonalizedResponse(data.message);
                        this.addMessage(responseMessage, 'assistant');

                        // Trigger post-chat automation after assistant response
                        setTimeout(() => {
                            this.triggerEndOfConversationCheck();
                        }, 3000);

                        // CRITICAL: Also call backend API to persist conversation data
                        // This ensures conversations are saved even with local response generation
                        fetch(this.config.apiEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                message: message,
                                conversationId: this.conversationId,
                                language: conversationContext.user.language,
                                agent: this.currentAgent,
                                assistantId: this.currentAgent?.assignedAssistantId || null,
                                userName: conversationContext.user.name,
                                userRegistered: conversationContext.user.registered,
                                // Add flag to indicate this is for persistence only
                                persistOnly: true
                            })
                        })
                        .then(() => {
                            console.log('Conversation data persisted to backend');
                        })
                        .catch(persistError => {
                            console.error('Failed to persist conversation data:', persistError);
                            // Don't fail the user experience if persistence fails
                        });

                        // Log assistant usage for debugging
                        if (data.assistantUsed) {
                            console.log(`Response generated using AI Assistant: ${data.assistantUsed}`);
                        }

                        // Occasionally rotate agent during conversation (after handoff)
                        if (this.handoffComplete && this.conversationPhase === 'agent') {
                            // this.rotateAgentRandomly(); // Disabled to maintain agent consistency
                        }

                        // Show registration form after first assistant response if user hasn't registered
                        if (this.messages.length >= 3 && !this.userRegistered && !this.userName) {
                            setTimeout(() => {
                                this.showRegistrationForm();
                            }, 1500);
                        }
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    }
                })
                .catch(error => {
                    console.error('Error generating response:', error);
                    this.hideTyping();
                    this.addMessage('Sorry, I\'m having trouble processing your request. Please try again.', 'assistant');
                });
            } else {
                console.log('=== FALLING BACK TO EXTERNAL API ===');
                console.log('API Endpoint:', this.config.apiEndpoint);
                console.log('Reason: ChatbotManager not available or missing generateAgentResponse');
                
                // Fallback to external API if ChatbotManager is not available
                fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        conversationId: this.conversationId,
                        language: this.config.language,
                        agent: this.currentAgent,
                        assistantId: this.currentAgent?.assignedAssistantId || null,
                        userName: this.userName,
                        userRegistered: this.userRegistered
                    })
                })
                .then(response => response.json())
                .then(data => {
                    this.hideTyping();

                    if (data.success) {
                        // Store conversation ID
                        this.conversationId = data.conversationId;

                        // Add personalized assistant response
                        const responseMessage = this.getPersonalizedResponse(data.message);
                        this.addMessage(responseMessage, 'assistant');

                        // Trigger post-chat automation after assistant response
                        setTimeout(() => {
                            this.triggerEndOfConversationCheck();
                        }, 3000);

                        // Occasionally rotate agent during conversation (after handoff)
                        if (this.handoffComplete && this.conversationPhase === 'agent') {
                            // this.rotateAgentRandomly(); // Disabled to maintain agent consistency
                        }

                        // Show registration form after first assistant response if user hasn't registered
                        if (this.messages.length >= 3 && !this.userRegistered && !this.userName) {
                            setTimeout(() => {
                                this.showRegistrationForm();
                            }, 1500);
                        }
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    }
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    this.hideTyping();
                    this.addMessage('Sorry, I\'m having trouble connecting. Please try again.', 'assistant');
                });
            }
        },

        showRegistrationForm: function() {
            console.log('🔧 showRegistrationForm called');
            
            // Don't show if user is already registered
            if (this.isUserRegistered) {
                return;
            }
            
            const form = document.getElementById('registration-form');
            console.log('Registration form element:', form);
            if (form) {
                // Update form content to match current language
                this.updateFormLocalization();
                console.log('✅ Showing registration form with localized content');
                form.style.display = 'block';
                
                // Setup dropdowns NOW that the form is displayed and elements exist
                setTimeout(() => {
                    this.setupDropdownHandlers();
                }, 50);
                
                // Also scroll to form for visibility
                setTimeout(() => {
                    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            } else {
                console.log('❌ Form not shown:', {
                    formExists: !!form,
                    userRegistered: this.userRegistered
                });
            }
        },

        setupDropdownHandlers: function() {
            console.log('🔧 Setting up dropdown handlers after form display');
            
            const setupDropdown = (lang) => {
                const systemUsageSelect = document.getElementById(`system-usage-${lang}`);
                const restaurantNameField = document.getElementById(`restaurant-name-field-${lang}`);
                const restaurantNameInput = document.getElementById(`restaurant-name-${lang}`);
                
                console.log(`🔧 Setting up dropdown for language: ${lang}`);
                console.log(`Dropdown element found:`, systemUsageSelect);
                console.log(`Restaurant field found:`, restaurantNameField);
                
                if (!systemUsageSelect) {
                    console.error(`❌ Dropdown not found for language: ${lang}`);
                    return;
                }
                
                // Clear any existing event listeners
                if (systemUsageSelect._handleChange) {
                    systemUsageSelect.removeEventListener('change', systemUsageSelect._handleChange);
                    systemUsageSelect.removeEventListener('input', systemUsageSelect._handleChange);
                }
                
                // Completely reset and style the dropdown
                systemUsageSelect.disabled = false;
                systemUsageSelect.style.cssText = `
                    width: 100% !important;
                    padding: 12px !important;
                    border: 1px solid #ddd !important;
                    border-radius: 6px !important;
                    font-size: 14px !important;
                    color: #333333 !important;
                    background: white !important;
                    z-index: 10005 !important;
                    position: relative !important;
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    -webkit-appearance: menulist !important;
                    -moz-appearance: menulist !important;
                    appearance: menulist !important;
                `;
                
                // Style all options
                const options = systemUsageSelect.querySelectorAll('option');
                options.forEach(option => {
                    option.style.cssText = `
                        color: #333333 !important;
                        background: white !important;
                        padding: 8px !important;
                    `;
                });
                
                // Define the change handler
                const handleDropdownChange = (event) => {
                    const selectedValue = event.target.value;
                    console.log(`🎯 Dropdown changed for ${lang}:`, selectedValue);
                    
                    // Visual feedback
                    event.target.style.backgroundColor = '#e8f5e8';
                    setTimeout(() => {
                        event.target.style.backgroundColor = 'white';
                    }, 500);
                    
                    // Handle conditional field
                    if (restaurantNameField && restaurantNameInput) {
                        if (selectedValue === 'current_user') {
                            console.log(`🟢 Showing restaurant name field for ${lang}`);
                            restaurantNameField.style.display = 'block';
                            restaurantNameField.style.visibility = 'visible';
                            restaurantNameField.style.opacity = '1';
                            restaurantNameInput.required = true;
                            restaurantNameInput.style.display = 'block';
                        } else {
                            console.log(`🔴 Hiding restaurant name field for ${lang}`);
                            restaurantNameField.style.display = 'none';
                            restaurantNameField.style.visibility = 'hidden';
                            restaurantNameField.style.opacity = '0';
                            restaurantNameInput.required = false;
                            restaurantNameInput.value = '';
                        }
                    }
                };
                
                // Store reference for cleanup
                systemUsageSelect._handleChange = handleDropdownChange;
                
                // Attach event listeners
                systemUsageSelect.addEventListener('change', handleDropdownChange);
                systemUsageSelect.addEventListener('input', handleDropdownChange);
                
                // Force trigger if already has a value
                if (systemUsageSelect.value && systemUsageSelect.value !== '') {
                    handleDropdownChange({ target: systemUsageSelect });
                }
                
                console.log(`✅ Dropdown setup complete for ${lang}`);
            };
            
            // Setup dropdowns for both languages
            setupDropdown('en');
            setupDropdown('sv');
            
            // Verification after setup
            setTimeout(() => {
                const enDropdown = document.getElementById('system-usage-en');
                const svDropdown = document.getElementById('system-usage-sv');
                
                console.log('🔍 Dropdown verification after setup:');
                console.log('EN dropdown:', enDropdown, enDropdown ? 'Found & Ready' : 'Missing');
                console.log('SV dropdown:', svDropdown, svDropdown ? 'Found & Ready' : 'Missing');
                
                if (enDropdown) {
                    console.log('EN dropdown options:', enDropdown.querySelectorAll('option').length);
                    console.log('EN dropdown can click:', !enDropdown.disabled);
                }
                if (svDropdown) {
                    console.log('SV dropdown options:', svDropdown.querySelectorAll('option').length);
                    console.log('SV dropdown can click:', !svDropdown.disabled);
                }
            }, 100);
        },

        addMessage: function(content, sender, isHandoff = false) {
            const messagesContainer = document.getElementById('chatbot-messages');

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;

            if (sender === 'assistant') {
                // Use current agent info if available
                const agentName = this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant';
                const agentAvatar = this.currentAgent ? this.currentAgent.avatar : this.config.avatar || this.getDefaultAvatar();

                messageDiv.innerHTML = `
                    <div class="message-avatar">
                        <img src="${agentAvatar}" alt="${agentName} Avatar" />
                    </div>
                    <div class="message-content">${content}</div>
                `;
                // Play receive sound
                this.playSound('receive');
            } else {
                messageDiv.innerHTML = `
                    <div class="message-content">${content}</div>
                `;
                // Play send sound
                this.playSound('send');
            }

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.messages.push({ content, sender, timestamp: new Date() });

            // Auto-save conversation after every message
            this.autoSaveConversation();

            // Perform agent handoff after initial welcome message
            if (isHandoff && this.conversationPhase === 'welcome') {
                const departmentId = window.chatbotManager ? 
                    window.chatbotManager.getCurrentHandoffDepartment() : null;
                this.performAgentHandoff(departmentId);
            }
        },

        showTyping: function() {
            const typing = document.getElementById('chatbot-typing');
            if (typing) {
                typing.style.display = 'flex';
                this.isTyping = true;
            }
        },

        playSound: function(type) {
            try {
                let frequency, duration;

                switch(type) {
                    case 'send':
                        frequency = 800;
                        duration = 200;
                        break;
                    case 'receive':
                        frequency = 600;
                        duration = 300;
                        break;
                    case 'typing':
                        frequency = 400;
                        duration = 100;
                        break;
                    default:
                        return;
                }

                // Create audio context
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                // Silently fail if audio is not supported
                console.debug('Audio not supported:', error);
            }
        },

        showTyping: function() {
            const typing = document.getElementById('chatbot-typing');
            if (typing) {
                typing.style.display = 'flex';
                this.isTyping = true;
            }
        },

        hideTyping: function() {
            const typing = document.getElementById('chatbot-typing');
            if (typing) {
                typing.style.display = 'none';
                this.isTyping = false;
            }
        },

        switchLanguageTab: function(language) {
            console.log('Switching to language tab:', language);
            
            // Update active tab styling
            const allTabs = document.querySelectorAll('.language-tab');
            allTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.lang === language) {
                    tab.classList.add('active');
                }
            });
            
            // Show/hide language-specific form content
            const allForms = document.querySelectorAll('.form-content');
            allForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `form-${language}`) {
                    form.classList.add('active');
                }
            });
            
            // Store current language
            this.currentLanguage = language;
            console.log('Language switched to:', language);
        },

        async submitRegistration() {
            console.log('submitRegistration called');
            
            const submitButton = document.querySelector('#registration-form button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : 'Submit';
            
            // Show submitting state
            if (submitButton) {
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
            }
            
            // Determine current language from active form
            const lang = this.currentLanguage || 'en';
            console.log('Submitting registration for language:', lang);
            
            // Get form values with language-specific IDs
            const name = document.getElementById(`user-name-${lang}`)?.value;
            const email = document.getElementById(`user-email-${lang}`)?.value;
            const phone = document.getElementById(`user-phone-${lang}`)?.value;
            const systemUsage = document.getElementById(`system-usage-${lang}`)?.value;
            const restaurantName = document.getElementById(`restaurant-name-${lang}`)?.value;

            console.log('Form values:', { name, email, phone, systemUsage, restaurantName, language: lang });

            if (!name || !email || !phone || !systemUsage) {
                alert('Please fill in all required fields');
                // Reset button state
                if (submitButton) {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
                return;
            }

            if (systemUsage === 'current_user' && !restaurantName) {
                alert('Please provide your restaurant name');
                // Reset button state
                if (submitButton) {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
                return;
            }

            // Generate conversation ID if not exists
            if (!this.conversationId) {
                this.conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }

            // Set conversation start time if not exists
            if (!this.conversationStartTime) {
                this.conversationStartTime = new Date().toISOString();
            }

            // Store user email for conversation records
            this.userEmail = email;

            // Format data for dashboard compatibility
            const registrationData = {
                name,
                email,
                phone,
                systemUsage,
                userType: systemUsage,
                userCategory: this.getUserCategory(systemUsage),
                restaurantName: restaurantName || null,
                conversationId: this.conversationId,
                registeredAt: new Date().toISOString(),
                leadScore: this.calculateLeadScore(systemUsage),
                source: 'chatbot',
                status: 'new',
                language: lang,
                formLanguage: lang,
                preferredLanguage: lang
            };

            console.log('Registration data:', registrationData);

            try {
                // Store locally first as backup
                this.storeUserRegistration(registrationData);
                console.log('Registration stored locally');
                
                // Attempt to send to backend - try multiple endpoints
                let backendSuccess = false;
                const endpoints = ['/users', '/api/chatbot/users', '/chatbot/users'];
                
                for (const endpoint of endpoints) {
                    try {
                        console.log(`Trying endpoint: ${this.config.apiEndpoint}${endpoint}`);
                        const response = await fetch(this.config.apiEndpoint + endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(registrationData)
                        });

                        if (response.ok) {
                            console.log(`Registration successfully sent to backend via ${endpoint}`);
                            backendSuccess = true;
                            break;
                        } else {
                            console.warn(`Backend registration failed for ${endpoint}: ${response.status}`);
                        }
                    } catch (endpointError) {
                        console.warn(`Error with endpoint ${endpoint}:`, endpointError);
                    }
                }
                
                if (!backendSuccess) {
                    console.warn('All backend endpoints failed, but data stored locally');
                }
                
                // Store conversation after successful registration
                this.storeConversation();
                
                // Reset button state
                if (submitButton) {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
                
                // Always show success since we have local backup
                this.hideRegistrationForm();
                const welcomeMessage = this.currentLanguage === 'swedish' ? 
                    'Tack för att du registrerar dig! Hur kan jag hjälpa dig idag?' : 
                    'Thank you for registering! How can I help you today?';
                this.addMessage(welcomeMessage, 'assistant');
                this.storeUserName(name);
                
                // Show success message to user
                console.log('✅ Registration completed successfully!');
                
            } catch (error) {
                console.error('Registration error:', error);
                
                // Reset button state
                if (submitButton) {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
                
                // Still proceed since we have local storage backup
                this.hideRegistrationForm();
                const welcomeMessage = this.currentLanguage === 'swedish' ? 
                    'Tack för att du registrerar dig! Hur kan jag hjälpa dig idag?' : 
                    'Thank you for registering! How can I help you today?';
                this.addMessage(welcomeMessage, 'assistant');
                this.storeUserName(name);
                console.log('Registration stored locally despite network error');
            }
        },

        skipRegistration: function() {
            this.hideRegistrationForm();
        },

        hideRegistrationForm: function() {
            const form = document.getElementById('registration-form');
            if (form) {
                form.style.display = 'none';
            }
        },

        getUserCategory: function(systemUsage) {
            switch (systemUsage) {
                case 'current_user':
                    return 'Current Fooodis User';
                case 'competitor_user':
                    return 'Competitor User';
                case 'potential_user':
                    return 'Potential Customer';
                default:
                    return 'Unknown';
            }
        },

        calculateLeadScore: function(systemUsage) {
            switch (systemUsage) {
                case 'current_user':
                    return 90;
                case 'potential_user':
                    return 70;
                case 'competitor_user':
                    return 50;
                default:
                    return 30;
            }
        },

        storeUserRegistration: function(registrationData) {
            try {
                // Get existing registrations
                const existingRegistrations = JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]');
                
                // Add new registration
                existingRegistrations.push(registrationData);
                
                // Store back to localStorage
                localStorage.setItem('fooodis-chatbot-registrations', JSON.stringify(existingRegistrations));
                
                console.log('Registration stored locally:', registrationData.name);
            } catch (error) {
                console.error('Error storing registration locally:', error);
            }
        },

        getDefaultAvatar: function() {
            return 'data:image/svg+xml;base64,' + btoa(`
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#e8f24c"/>
                    <circle cx="32" cy="24" r="8" fill="#1e2127"/>
                    <path d="M16 48c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#1e2127"/>
                    <circle cx="24" cy="20" r="2" fill="#e8f24c"/>
                    <circle cx="40" cy="20" r="2" fill="#e8f24c"/>
                    <path d="M26 28c2 2 6 2 8 0" stroke="#e8f24c" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `);
        },

        injectStyles: function() {
            const existingStyles = document.getElementById('fooodis-chatbot-styles');
            if (existingStyles) {
                existingStyles.remove();
            }

            const style = document.createElement('style');
            style.id = 'fooodis-chatbot-styles';
            style.textContent = `
                /* Fooodis Chatbot Widget Styles */
                #fooodis-chatbot {
                    position: fixed;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                #fooodis-chatbot.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                #fooodis-chatbot.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .chatbot-button {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${this.config.primaryColor};
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .chatbot-button:hover {
                    transform: scale(1.1);
                }

                .chatbot-avatar,
                .chatbot-avatar-small {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                }

                .chatbot-avatar-small {
                    width: 32px;
                    height: 32px;
                }

                .chatbot-avatar img,
                .chatbot-avatar-small img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #ff4444;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chatbot-header {
                    background: #26282f;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    width: 100%;
                    margin-bottom: 16px;
                }

                .chatbot-logo {
                    width: 100px;
                    height: auto;
                    flex-shrink: 0;
                    margin-top: 8px;
                }

                .chatbot-logo img {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                }

                .agent-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-grow: 1;
                }

                .header-text h4 {
                    margin: 0;
                    font-size: 16px;
                    color: white;
                    font-weight: 600;
                }

                .status-line {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 2px;
                }

                .header-text .status {
                    font-size: 12px;
                    color: #a0a0a0;
                    margin: 0;
                }

                .department-tag {
                    font-size: 11px;
                    background: var(--primary-color, #e8f24c);
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                    display: none;
                    animation: slideIn 0.3s ease-out;
                }

                .department-tag.show {
                    display: inline-block;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .close-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    color: white;
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .close-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .chatbot-messages {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .message {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                }

                .message.user {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .message-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .message-content {
                    background: #f5f5f5;
                    padding: 8px 12px;
                    border-radius: 18px;
                    max-width: 80%;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #333333;
                }

                .message.user .message-content {
                    background: ${this.config.primaryColor};
                    color: #1e2127;
                }

                .message.assistant .message-content {
                    background: #f5f5f5;
                    color: #333333;
                }

                .chatbot-typing {
                    padding: 16px;
                    display: none;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #666;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                }

                .typing-indicator span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #666;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing {
                    0%, 80%, 100% { opacity: 0.3; }
                    40% { opacity: 1; }
                }

                .chatbot-input {
                    padding: 16px;
                    border-top: 1px solid #eee;
                }

                .input-container {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .input-container input {
                    flex: 1;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    padding: 8px 16px;
                    font-size: 14px;
                    box-sizing: border-box;
                    color: #333333 !important;
                    background: white !important;
                    position: relative;
                    z-index: 1000;
                    pointer-events: auto !important;
                    cursor: pointer;
                }

                .input-container select {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    box-sizing: border-box;
                    color: #333333 !important;
                    background: white !important;
                    position: relative;
                    z-index: 10002 !important;
                    pointer-events: auto !important;
                    cursor: pointer;
                    appearance: auto !important;
                    -webkit-appearance: menulist !important;
                    -moz-appearance: menulist !important;
                    min-height: 44px;
                    user-select: none;
                }

                .input-container select,
                .input-container select * {
                    color: #333333 !important;
                    background-color: white !important;
                }

                .input-container select:hover {
                    border-color: ${this.config.primaryColor};
                    box-shadow: 0 0 0 2px rgba(232, 242, 76, 0.2);
                    background: #fafafa !important;
                    color: #333333 !important;
                }

                .input-container select:focus {
                    outline: 2px solid ${this.config.primaryColor};
                    outline-offset: 1px;
                    border-color: ${this.config.primaryColor};
                    z-index: 10003 !important;
                    background: white !important;
                    color: #333333 !important;
                }

                .input-container select option {
                    color: #333333 !important;
                    background: white !important;
                    background-color: white !important;
                    padding: 8px 12px;
                    cursor: pointer;
                    min-height: 24px;
                    font-size: 14px;
                    font-weight: normal;
                }

                .input-container select option:hover {
                    background: #f0f0f0 !important;
                    background-color: #f0f0f0 !important;
                    color: #333333 !important;
                }

                .input-container select option:checked,
                .input-container select option:selected {
                    background: ${this.config.primaryColor} !important;
                    background-color: ${this.config.primaryColor} !important;
                    color: #1e2127 !important;
                }

                /* Additional fallback styles for better compatibility */
                select#system-usage {
                    color: #333333 !important;
                    background: white !important;
                }

                select#system-usage option {
                    color: #333333 !important;
                    background: white !important;
                }

                /* Custom dropdown button styling for fallback */
                .custom-select-button {
                    color: #333333 !important;
                    background: white !important;
                    font-weight: normal !important;
                }

                .custom-select-option {
                    color: #333333 !important;
                    background: white !important;
                    font-weight: normal !important;
                }

                .input-container input::placeholder {
                    color: #999999 !important;
                }

                .input-container input:focus {
                    outline: 2px solid ${this.config.primaryColor};
                    outline-offset: 1px;
                    border-color: ${this.config.primaryColor};
                }

                .upload-btn {
                    background: #f5f5f5 !important;
                    color: #666 !important;
                    width: 32px !important
                    height: 32px !important;
                    margin-right: 8px;
                }

                .upload-btn:hover {
                    background: #e5e5e5 !important;
                }

                .registration-form {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    z-index: 10001 !important;
                    overflow-y: auto;
                }

                .registration-form * {
                    pointer-events: auto !important;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .form-header h3 {
                    margin: 0 0 8px;
                    color: #1e2127;
                    font-weight: 600;
                }

                .form-header p {
                    margin: 0;
                    color: #666666;
                    font-size: 14px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    box-sizing: border-box;
                    color: #333333 !important;
                    background: white !important;
                }

                .form-group input::placeholder {
                    color: #999999 !important;
                }

                .form-group select {
                    color: #333333 !important;
                    background: white !important;
                    position: relative;
                    z-index: 10003;
                    cursor: pointer;
                    -webkit-appearance: menulist;
                    -moz-appearance: menulist;
                    appearance: menulist;
                }

                .form-group select:hover {
                    border-color: ${this.config.primaryColor};
                    box-shadow: 0 0 0 2px rgba(232, 242, 76, 0.2);
                }

                .form-group select option {
                    color: #333333 !important;
                    background: white !important;
                    padding: 8px 12px;
                    cursor: pointer;
                }

                .form-group select option:hover,
                .form-group select option:checked {
                    background: #f8f9fa !important;
                    color: #333333 !important;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: 2px solid ${this.config.primaryColor};
                    outline-offset: 1px;
                    border-color: ${this.config.primaryColor};
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #333333;
                    font-weight: 500;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: auto;
                }

                .btn-primary,
                .btn-secondary {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: ${this.config.primaryColor};
                    color: #1e2127;
                }

                .btn-secondary {
                    background: #f5f5f5;
                    color: #333333;
                    font-weight: 500;
                }

                .btn-primary:hover,
                .btn-secondary:hover {
                    opacity: 0.9;
                }

                /* Language Tab Styles */
                .language-tabs {
                    display: flex;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }

                .language-tab {
                    flex: 1;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }

                .language-tab:hover {
                    color: ${this.config.primaryColor};
                    background: rgba(232, 242, 76, 0.05);
                }

                .language-tab.active {
                    color: ${this.config.primaryColor};
                    border-bottom-color: ${this.config.primaryColor};
                    font-weight: 600;
                }

                .form-content {
                    display: none;
                }

                .form-content.active {
                    display: block;
                }

                @media (max-width: 480px) {
                    .chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 100px);
                        bottom: 20px;
                        right: 20px;
                    }
                }
            `;

            document.head.appendChild(style);
        },

        selectRandomAgent: function() {
            // Load agents from localStorage
            const savedAgents = localStorage.getItem('chatbot-agents');
            if (savedAgents) {
                const agents = JSON.parse(savedAgents);
                if (agents.length > 0) {
                    const randomIndex = Math.floor(Math.random() * agents.length);
                    this.currentAgent = agents[randomIndex];

                    // Update settings with selected agent
                    this.config.name = this.currentAgent.name;
                    this.config.avatar = this.currentAgent.avatar;
                    this.config.welcomeMessage = this.currentAgent.intro;
                }
            }
        },

        addMessage: function(content, sender, isHandoff = false) {
            const messagesContainer = document.getElementById('chatbot-messages');

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;

            if (sender === 'assistant') {
                // Use current agent info if available
                const agentName = this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant';
                const agentAvatar = this.currentAgent ? this.currentAgent.avatar : this.config.avatar || this.getDefaultAvatar();

                messageDiv.innerHTML = `
                    <div class="message-avatar">
                        <img src="${agentAvatar}" alt="${agentName} Avatar" />
                    </div>
                    <div class="message-content">${content}</div>
                `;
                // Play receive sound
                this.playSound('receive');
            } else {
                messageDiv.innerHTML = `
                    <div class="message-content">${content}</div>
                `;
                // Play send sound
                this.playSound('send');
            }

            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.messages.push({ content, sender, timestamp: new Date() });

            // Auto-save conversation after every message
            this.autoSaveConversation();

            // Perform agent handoff after initial welcome message
            if (isHandoff && this.conversationPhase === 'welcome') {
                const departmentId = window.chatbotManager ? 
                    window.chatbotManager.getCurrentHandoffDepartment() : null;
                this.performAgentHandoff(departmentId);
            }
        },

        onNodeFlowUpdated: function(flowData) {
            // Handle node flow updates from ChatbotManager
            console.log('Chatbot widget received node flow update:', flowData);
            // Store reference and initialize scenario state
            this.nodeFlow = flowData;
            this.initializeScenarioState();
        },

        // Initialize scenario state management
        initializeScenarioState: function() {
            if (!this.nodeFlow || !this.nodeFlow.nodes || this.nodeFlow.nodes.length === 0) {
                this.scenarioActive = false;
                this.currentNode = null;
                return;
            }

            // Find welcome/start node
            const welcomeNode = this.nodeFlow.nodes.find(node => node.type === 'welcome');
            if (welcomeNode) {
                this.scenarioActive = true;
                this.currentNode = welcomeNode;
                this.scenarioState = {
                    currentNodeId: welcomeNode.id,
                    visitedNodes: [],
                    userContext: {}
                };
                console.log('Scenario initialized with welcome node:', welcomeNode.id);
            } else {
                this.scenarioActive = false;
                this.currentNode = null;
            }
        },

        // Execute scenario node and determine next action
        executeScenarioNode: function(node, userMessage = '') {
            if (!node) return null;

            console.log('Executing scenario node:', node.type, node.id);
            this.scenarioState.visitedNodes.push(node.id);

            switch (node.type) {
                case 'welcome':
                case 'message':
                    return this.executeMessageNode(node);
                case 'handoff':
                    return this.executeHandoffNode(node);
                case 'intent':
                    return this.executeIntentNode(node, userMessage);
                default:
                    console.warn('Unknown node type:', node.type);
                    return null;
            }
        },

        // Execute message node
        executeMessageNode: function(node) {
            const language = this.getCurrentLanguage();
            const message = node.data.messages[language] || node.data.messages.english || 'Hello!';
            
            return {
                type: 'message',
                content: message,
                nextAction: this.getNextNodeAction(node)
            };
        },

        // Execute handoff node
        executeHandoffNode: function(node) {
            const handoffMessage = node.data.handoffMessage || 'Transferring you to a human agent...';
            
            // Trigger agent handoff
            setTimeout(() => {
                this.handleScenarioHandoff(node.data.department, node.data.selectedAgent);
            }, 1000);
            
            return {
                type: 'handoff',
                content: handoffMessage,
                nextAction: 'handoff'
            };
        },

        // Execute intent recognition node
        executeIntentNode: function(node, userMessage) {
            const detectedIntents = this.detectIntents(userMessage, node.data.intents);
            
            if (detectedIntents.length > 0) {
                // Intent matched, continue to next node
                return {
                    type: 'intent_match',
                    content: null, // No message to display
                    nextAction: this.getNextNodeAction(node),
                    detectedIntents: detectedIntents
                };
            } else {
                // No intent matched, ask for clarification
                return {
                    type: 'intent_no_match',
                    content: 'I\'m not sure I understand. Could you please clarify what you need help with?',
                    nextAction: 'wait_for_input'
                };
            }
        },

        // Handle scenario-driven agent handoff
        handleScenarioHandoff: function(department, selectedAgent) {
            console.log('Scenario handoff initiated:', { department, selectedAgent });
            
            if (selectedAgent && window.chatbotManager) {
                // Find the specific agent from ChatbotManager settings
                const agent = window.chatbotManager.settings.agents?.find(a => a.id === selectedAgent);
                if (agent && agent.active !== false) {
                    console.log('Handing off to specific agent:', agent.name);
                    this.assignSpecificAgent(agent);
                    return;
                }
            }
            
            // Auto-assign based on department or fall back to default
            if (department && window.chatbotManager) {
                const departmentAgents = window.chatbotManager.getAgentsByDepartment(department);
                if (departmentAgents.length > 0) {
                    console.log('Auto-assigning from department:', department);
                    this.performAgentHandoff(department);
                    return;
                }
            }
            
            // Final fallback - perform general handoff
            console.log('Performing general handoff');
            this.performAgentHandoff();
        },

        // Assign a specific agent during scenario handoff
        assignSpecificAgent: function(agent) {
            this.currentAgent = {
                id: agent.id,
                name: agent.name,
                department: agent.department,
                avatar: agent.avatar,
                assignedAssistantId: agent.assignedAssistantId
            };
            
            this.conversationPhase = 'agent';
            this.handoffComplete = true;
            
            // Show handoff confirmation message (language-aware)
            const handoffMessage = this.getLocalizedAgentIntroduction();
            this.addMessage(handoffMessage, 'assistant');
            
            // Update UI to show current agent
            this.updateAgentDisplay();
            
            console.log('Agent assigned:', this.currentAgent);
        },

        // Get next node action based on connections
        getNextNodeAction: function(currentNode) {
            if (!this.nodeFlow || !this.nodeFlow.connections) return 'end';
            
            const outgoingConnections = this.nodeFlow.connections.filter(conn => conn.from === currentNode.id);
            
            if (outgoingConnections.length === 0) {
                return 'end'; // No more nodes
            } else if (outgoingConnections.length === 1) {
                return 'continue'; // Single path
            } else {
                return 'branch'; // Multiple paths (decision point)
            }
        },

        // Move to next node in scenario
        moveToNextNode: function(currentNodeId, userMessage = '') {
            if (!this.nodeFlow || !this.nodeFlow.connections) return null;
            
            const outgoingConnections = this.nodeFlow.connections.filter(conn => conn.from === currentNodeId);
            
            if (outgoingConnections.length === 0) {
                // End of scenario
                this.scenarioActive = false;
                this.currentNode = null;
                return null;
            }
            
            // For now, take the first connection (later we can add decision logic)
            const nextConnection = outgoingConnections[0];
            const nextNode = this.nodeFlow.nodes.find(node => node.id === nextConnection.to);
            
            if (nextNode) {
                this.currentNode = nextNode;
                this.scenarioState.currentNodeId = nextNode.id;
                return nextNode;
            }
            
            return null;
        },

        // Simple intent detection (can be enhanced with NLP)
        detectIntents: function(userMessage, targetIntents) {
            if (!userMessage || !targetIntents || targetIntents.length === 0) return [];
            
            const lowerMessage = userMessage.toLowerCase();
            const detectedIntents = [];
            
            targetIntents.forEach(intent => {
                const lowerIntent = intent.toLowerCase();
                if (lowerMessage.includes(lowerIntent)) {
                    detectedIntents.push(intent);
                }
            });
            
            return detectedIntents;
        },

        // Get current language setting
        getCurrentLanguage: function() {
            return this.currentLanguage || 'english';
        },

        // Detect language from user input
        detectLanguage: function(text) {
            console.log('🔍 LANGUAGE DETECTION DEBUG:');
            console.log('- Input text:', text);
            console.log('- Language already detected?', this.languageDetected);
            console.log('- Current language:', this.currentLanguage);
            
            if (!text || this.languageDetected) {
                console.log('- Early return, using current language:', this.currentLanguage || 'english');
                return this.currentLanguage || 'english';
            }
            
            // Swedish language indicators
            const swedishWords = ['hej', 'hejsan', 'tack', 'tjena', 'morsning', 'god morgon', 'god kväll', 'vad', 'hur', 'när', 'var', 'vem', 'varför', 'svenska', 'hjälp', 'hjälpa', 'kanske', 'säkert', 'också', 'eller', 'och', 'att', 'det', 'den', 'denna', 'detta', 'är', 'har', 'hade', 'kommer', 'skulle', 'kunde', 'måste', 'vill', 'gillar', 'älskar'];
            const swedishChars = /[åäöÅÄÖ]/;
            
            const textLower = text.toLowerCase();
            const hasSwedishWords = swedishWords.some(word => textLower.includes(word));
            const hasSwedishChars = swedishChars.test(text);
            
            console.log('- Text lowercase:', textLower);
            console.log('- Has Swedish words?', hasSwedishWords);
            console.log('- Has Swedish characters?', hasSwedishChars);
            
            // If we detect Swedish, set it
            if (hasSwedishWords || hasSwedishChars) {
                this.currentLanguage = 'swedish';
                this.config.language = 'sv';
                this.languageDetected = true;
                localStorage.setItem('fooodis-language', 'swedish');
                console.log('✅ Language detected: Swedish - SETTING LANGUAGE');
                console.log('- this.currentLanguage now:', this.currentLanguage);
                console.log('- localStorage set to:', localStorage.getItem('fooodis-language'));
                return 'swedish';
            }
            
            // Otherwise assume English
            this.currentLanguage = 'english';
            this.config.language = 'en';
            this.languageDetected = true;
            localStorage.setItem('fooodis-language', 'english');
            console.log('❌ Language detected: English');
            return 'english';
        },

        // Load saved language preference
        loadLanguagePreference: function() {
            const savedLanguage = localStorage.getItem('fooodis-language');
            if (savedLanguage) {
                this.currentLanguage = savedLanguage;
                this.config.language = savedLanguage === 'swedish' ? 'sv' : 'en';
                this.languageDetected = true;
                console.log('Loaded saved language:', savedLanguage);
            }
        },

        // Process message in context of active scenario
        processScenarioMessage: function(userMessage) {
            setTimeout(() => {
                let currentNode = this.currentNode;
                let nodeResult = null;

                // If this is the first message and we have a welcome node, execute it
                if (this.messages.length <= 2 && currentNode.type === 'welcome') {
                    nodeResult = this.executeScenarioNode(currentNode);
                } else {
                    // Process user input through current node
                    nodeResult = this.executeScenarioNode(currentNode, userMessage);
                }

                if (nodeResult) {
                    // Handle the node result
                    this.handleScenarioResult(nodeResult, userMessage);
                } else {
                    // No scenario result, fall back to default response
                    this.hideTyping();
                    this.addMessage('I\'m sorry, I didn\'t understand that. Could you please try again?', 'assistant');
                }
            }, Math.random() * 1000 + 500);
        },

        // Handle scenario execution results
        handleScenarioResult: function(result, userMessage) {
            // Add bot message if there's content
            if (result.content) {
                this.addMessage(result.content, 'assistant');
            }

            // Handle next action
            switch (result.nextAction) {
                case 'continue':
                    // Move to next node automatically
                    const nextNode = this.moveToNextNode(this.currentNode.id, userMessage);
                    if (nextNode) {
                        // Auto-execute next node if it's a message node
                        if (nextNode.type === 'message' || nextNode.type === 'welcome') {
                            setTimeout(() => {
                                const nextResult = this.executeScenarioNode(nextNode);
                                if (nextResult && nextResult.content) {
                                    this.addMessage(nextResult.content, 'assistant');
                                }
                                this.hideTyping();
                            }, 800);
                        } else {
                            this.hideTyping();
                        }
                    } else {
                        this.hideTyping();
                    }
                    break;
                    
                case 'wait_for_input':
                    // Wait for user's next message
                    this.hideTyping();
                    break;
                    
                case 'handoff':
                    // Agent handoff in progress
                    this.hideTyping();
                    break;
                    
                case 'branch':
                    // Decision point - wait for user input to determine path
                    this.hideTyping();
                    break;
                    
                case 'end':
                    // End of scenario
                    this.scenarioActive = false;
                    this.currentNode = null;
                    this.hideTyping();
                    break;
                    
                default:
                    this.hideTyping();
                    break;
            }
        },

        // Auto-save conversation to localStorage after each message
        autoSaveConversation: function() {
            if (this.messages.length === 0) return;
            
            const conversationData = {
                conversationId: this.conversationId || 'conv_' + Date.now(),
                messages: this.messages,
                userName: this.userName,
                startedAt: this.conversationStartTime || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                phase: this.conversationPhase,
                agentName: this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant'
            };
            
            // Store in localStorage
            const conversations = JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]');
            const existingIndex = conversations.findIndex(conv => conv.conversationId === conversationData.conversationId);
            
            if (existingIndex >= 0) {
                conversations[existingIndex] = conversationData;
            } else {
                conversations.push(conversationData);
            }
            
            // Keep only last 50 conversations
            if (conversations.length > 50) {
                conversations.splice(0, conversations.length - 50);
            }
            
            localStorage.setItem('fooodis-chatbot-conversations', JSON.stringify(conversations));
        },

        // Store complete conversation to backend and localStorage
        storeConversation: function() {
            if (this.messages.length === 0) return;
            
            const conversationData = {
                conversationId: this.conversationId || 'conv_' + Date.now(),
                messages: this.messages,
                userName: this.userName,
                userEmail: this.userEmail || null,
                startedAt: this.conversationStartTime || new Date().toISOString(),
                endedAt: new Date().toISOString(),
                messageCount: this.messages.length,
                duration: this.conversationStartTime ? 
                    Math.floor((new Date() - new Date(this.conversationStartTime)) / 1000) : 0,
                phase: this.conversationPhase,
                agentName: this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant',
                status: 'completed'
            };
            
            // Store in localStorage
            this.autoSaveConversation();
            
            // Send to backend
            if (this.config.apiEndpoint) {
                fetch(this.config.apiEndpoint + '/conversations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(conversationData)
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Conversation successfully sent to backend');
                    } else {
                        console.warn('Backend conversation storage failed, but saved locally');
                    }
                })
                .catch(error => {
                    console.error('Conversation storage error:', error);
                    console.log('Conversation stored locally despite network error');
                });
            }
        },

        // Show department tag when agent responds
        showDepartmentTag: function() {
            if (!this.currentAgent || !this.currentAgent.department) return;
            
            const departmentTag = document.getElementById('agent-department-tag');
            if (departmentTag) {
                const departmentName = this.getDepartmentDisplayName(this.currentAgent.department);
                departmentTag.textContent = departmentName;
                departmentTag.classList.add('show');
            }
        },

        // Get department display name
        getDepartmentDisplayName: function(department) {
            const departmentNames = {
                'general': this.getCurrentLanguage() === 'sv' ? 'Allmän Support' : 'General Support',
                'technical': this.getCurrentLanguage() === 'sv' ? 'Teknisk Support' : 'Technical Support',
                'billing': this.getCurrentLanguage() === 'sv' ? 'Fakturering' : 'Billing',
                'salon': this.getCurrentLanguage() === 'sv' ? 'Salong' : 'Salon',
                'marketing': this.getCurrentLanguage() === 'sv' ? 'Marknadsföring' : 'Marketing'
            };
            return departmentNames[department] || department;
        },

        // Handle intelligent conversation flow patterns
        handleIntelligentConversationFlow: function(content) {
            // Don't interrupt if we're already in an end-of-conversation flow
            if (this.isInEndFlow) return;
            
            // Use ChatbotRatingSystem for inactivity detection instead of local timer
            if (window.ChatbotRatingSystem) {
                window.ChatbotRatingSystem.setupInactivityDetection();
                console.log('🔧 Using ChatbotRatingSystem for inactivity detection');
            }
        },

        // Start inactivity timer - now integrated with ChatbotRatingSystem
        startInactivityTimer: function() {
            if (window.ChatbotRatingSystem) {
                window.ChatbotRatingSystem.setupInactivityDetection();
            }
        },

        // Reset inactivity timer - now integrated with ChatbotRatingSystem
        resetInactivityTimer: function() {
            if (window.ChatbotRatingSystem) {
                window.ChatbotRatingSystem.resetInactivity();
            }
        },

        // Trigger end-of-conversation check
        triggerEndOfConversationCheck: function() {
            if (this.isInEndFlow) return;
            
            this.isInEndFlow = true;
            const checkMessage = this.getLocalizedEndCheckMessage();
            this.addMessage(checkMessage, 'assistant');
            
            // Set timer for thank you if no response in 40 seconds
            this.endCheckTimer = setTimeout(() => {
                this.sendThankYouAndRating();
            }, 40000);
        },

        // Get localized end-of-conversation check message
        getLocalizedEndCheckMessage: function() {
            const language = this.getCurrentLanguage();
            const userName = this.userName || '';
            
            const messages = {
                'sv': userName ? 
                    `${userName}, finns det något mer jag kan hjälpa dig med idag?` :
                    'Finns det något mer jag kan hjälpa dig med idag?',
                'en': userName ?
                    `${userName}, is there anything else I can help you with today?` :
                    'Is there anything else I can help you with today?'
            };
            
            return messages[language] || messages['en'];
        },

        // Detect if user message indicates they want to finish
        isUserFinishingConversation: function(message) {
            const lowerMessage = message.toLowerCase().trim();
            
            // English finish patterns
            const englishFinishPatterns = [
                'thank you', 'thanks', 'thx', 'ty', 'that\'s all', 
                'that is all', 'i\'m done', 'im done', 'goodbye', 
                'bye', 'see you', 'have a good day', 'that\'s it',
                'that is it', 'no more questions', 'all good',
                'perfect', 'great', 'awesome', 'that helps'
            ];
            
            // Swedish finish patterns
            const swedishFinishPatterns = [
                'tack', 'tack så mycket', 'tusen tack', 'det räcker',
                'det är allt', 'jag är klar', 'hej då', 'vi ses',
                'ha en bra dag', 'det var allt', 'inga fler frågor',
                'allt bra', 'perfekt', 'bra', 'det hjälper'
            ];
            
            const allPatterns = [...englishFinishPatterns, ...swedishFinishPatterns];
            
            return allPatterns.some(pattern => 
                lowerMessage.includes(pattern) || 
                lowerMessage === pattern
            );
        },

        // Handle user finish message
        handleUserFinishMessage: function(userMessage) {
            if (this.isInEndFlow) {
                // User already in end flow, check their response
                this.handleEndFlowResponse(userMessage);
                return true;
            }
            
            if (this.isUserFinishingConversation(userMessage)) {
                // User wants to finish, ask for confirmation
                this.isInEndFlow = true;
                const confirmMessage = this.getLocalizedFinishConfirmMessage();
                this.addMessage(confirmMessage, 'assistant');
                
                // Set timer for thank you if no response in 30 seconds
                this.endCheckTimer = setTimeout(() => {
                    this.sendThankYouAndRating();
                }, 30000);
                
                return true;
            }
            
            return false;
        },

        // Get localized finish confirmation message
        getLocalizedFinishConfirmMessage: function() {
            const language = this.getCurrentLanguage();
            const userName = this.userName || '';
            
            const messages = {
                'sv': userName ?
                    `Tack ${userName}! Innan vi avslutar, finns det något mer jag kan hjälpa dig med?` :
                    'Tack! Innan vi avslutar, finns det något mer jag kan hjälpa dig med?',
                'en': userName ?
                    `Thank you ${userName}! Before we finish, is there anything else I can help you with?` :
                    'Thank you! Before we finish, is there anything else I can help you with?'
            };
            
            return messages[language] || messages['en'];
        },

        // Handle end flow response
        handleEndFlowResponse: function(userMessage) {
            const lowerMessage = userMessage.toLowerCase().trim();
            
            // Clear the end check timer
            if (this.endCheckTimer) {
                clearTimeout(this.endCheckTimer);
                this.endCheckTimer = null;
            }
            
            // Check if user wants to continue (yes responses)
            const yesPatterns = ['yes', 'yeah', 'yep', 'sure', 'ja', 'yes please', 'actually yes'];
            const isYes = yesPatterns.some(pattern => lowerMessage.includes(pattern));
            
            // Check if user wants to finish (no responses)
            const noPatterns = ['no', 'nope', 'no thanks', 'nej', 'no thank you', 'that\'s all', 'i\'m good'];
            const isNo = noPatterns.some(pattern => lowerMessage.includes(pattern));
            
            if (isYes) {
                // User wants to continue
                this.isInEndFlow = false;
                const continueMessage = this.getLocalizedContinueMessage();
                this.addMessage(continueMessage, 'assistant');
            } else if (isNo || lowerMessage.length < 3) {
                // User wants to finish or gave very short response
                this.sendThankYouAndRating();
            } else {
                // User asked a new question, continue conversation
                this.isInEndFlow = false;
                this.continueConversation(userMessage);
            }
        },

        // Get localized continue message
        getLocalizedContinueMessage: function() {
            const language = this.getCurrentLanguage();
            
            const messages = {
                'sv': 'Perfekt! Vad kan jag hjälpa dig med?',
                'en': 'Perfect! What can I help you with?'
            };
            
            return messages[language] || messages['en'];
        },

        // Send thank you message and trigger rating
        sendThankYouAndRating: function() {
            // Clear any timers
            if (this.endCheckTimer) {
                clearTimeout(this.endCheckTimer);
                this.endCheckTimer = null;
            }
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
                this.inactivityTimer = null;
            }
            
            console.log('📝 Sending thank-you message and rating popup');
            
            // Send personalized thank you message
            const thankYouMessage = this.getLocalizedThankYouMessage();
            this.addMessage(thankYouMessage, 'assistant');
            
            // Trigger rating popup immediately
            setTimeout(() => {
                this.showRatingPopup();
            }, 300);
            
            this.isInEndFlow = false;
        },

        // Get localized thank you message
        getLocalizedThankYouMessage: function() {
            const language = this.getCurrentLanguage();
            const userName = this.userName || '';
            
            const messages = {
                'sv': userName ?
                    `Tack för idag, ${userName}. Vi hjälper gärna till nästa gång!` :
                    `Tack för idag. Vi hjälper gärna till nästa gång!`,
                'en': userName ?
                    `Thank you for today, ${userName}. We are happy to assist you next time!` :
                    `Thank you for today. We are happy to assist you next time!`
            };
            
            return messages[language] || messages['en'];
        },

        // Show rating popup
        showRatingPopup: function() {
            console.log('🌟 Attempting to show rating popup');
            
            // Use existing rating system
            if (window.chatbotRatingSystem && typeof window.chatbotRatingSystem.showRatingPopup === 'function') {
                const language = this.getCurrentLanguage();
                console.log('📋 Using external rating system');
                window.chatbotRatingSystem.showRatingPopup(language);
            } else {
                console.log('⚠️ External rating system not available, creating fallback popup');
                this.createFallbackRatingPopup();
            }
        },
        
        createFallbackRatingPopup: function() {
            const language = this.getCurrentLanguage();
            const messages = {
                'en': {
                    title: 'Rate Your Experience',
                    overallQuestion: 'How would you rate your overall chat experience?',
                    resolvedQuestion: 'Was your issue resolved?',
                    departmentQuestion: 'Which department helped you today?',
                    resolvedOptions: {
                        yes: '✅ Yes',
                        no: '❌ No', 
                        partially: '🔄 Partially'
                    },
                    departments: {
                        'general': 'General Inquiries',
                        'support': 'Customer Support',
                        'technical': 'Technical Support',
                        'salon': 'Salon',
                        'billing': 'Billing',
                        'delivery': 'Delivery'
                    },
                    submit: 'Submit Feedback',
                    cancel: 'Skip'
                },
                'sv': {
                    title: 'Betygsätt Din Upplevelse',
                    overallQuestion: 'Hur skulle du betygsätta din övergripande chattupplevelse?',
                    resolvedQuestion: 'Blev ditt problem löst?',
                    departmentQuestion: 'Vilken avdelning hjälpte dig idag?',
                    resolvedOptions: {
                        yes: '✅ Ja',
                        no: '❌ Nej',
                        partially: '🔄 Delvis'
                    },
                    departments: {
                        'general': 'Allmänna Förfrågningar',
                        'support': 'Kundsupport',
                        'technical': 'Teknisk Support',
                        'salon': 'Salong',
                        'billing': 'Fakturering',
                        'delivery': 'Leverans'
                    },
                    submit: 'Skicka Feedback',
                    cancel: 'Hoppa över'
                }
            };
            
            const msg = messages[language] || messages['en'];
            
            // Target the chatbot messages container directly
            const messagesContainer = document.getElementById('chatbot-messages');
            const chatWindow = document.getElementById('chatbot-window');
            
            if (!messagesContainer && !chatWindow) {
                console.warn('⚠️ Chat messages container not found');
                return;
            }
            
            // Create rating form that appears within the chat interface
            const popupHTML = `
                <div id="rating-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                    <div id="rating-form" style="background: white; padding: 25px; border-radius: 12px; max-width: 420px; width: 90%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3); max-height: 80vh; overflow-y: auto;">
                        <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">${msg.title}</h3>
                        
                        <!-- Overall Rating -->
                        <div style="margin-bottom: 20px;">
                            <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; font-weight: 500;">${msg.overallQuestion}</p>
                            <div style="display: flex; justify-content: center; gap: 8px; margin: 12px 0;">
                                <button onclick="FoodisChatbot.selectRating(1)" class="rating-btn" data-rating="1" style="background: #ff4444; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; font-size: 24px; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">😞</button>
                                <button onclick="FoodisChatbot.selectRating(2)" class="rating-btn" data-rating="2" style="background: #ff8844; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; font-size: 24px; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">😐</button>
                                <button onclick="FoodisChatbot.selectRating(3)" class="rating-btn" data-rating="3" style="background: #ffcc44; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; font-size: 24px; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">😌</button>
                                <button onclick="FoodisChatbot.selectRating(4)" class="rating-btn" data-rating="4" style="background: #88cc44; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; font-size: 24px; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">😀</button>
                                <button onclick="FoodisChatbot.selectRating(5)" class="rating-btn" data-rating="5" style="background: #44cc44; color: white; border: none; padding: 12px; border-radius: 50%; cursor: pointer; font-size: 24px; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">😀</button>
                            </div>
                        </div>
                        
                        <!-- Issue Resolved -->
                        <div style="margin-bottom: 20px; text-align: left;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 500;">${msg.resolvedQuestion}</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                                <button onclick="FoodisChatbot.selectResolved('yes')" class="resolved-btn" data-resolved="yes" style="background: #f8f9fa; border: 2px solid #e9ecef; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;">✅ ${msg.resolvedOptions.yes}</button>
                                <button onclick="FoodisChatbot.selectResolved('no')" class="resolved-btn" data-resolved="no" style="background: #f8f9fa; border: 2px solid #e9ecef; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;">❌ ${msg.resolvedOptions.no}</button>
                                <button onclick="FoodisChatbot.selectResolved('partially')" class="resolved-btn" data-resolved="partially" style="background: #f8f9fa; border: 2px solid #e9ecef; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;">🔄 ${msg.resolvedOptions.partially}</button>
                            </div>
                        </div>
                        
                        <!-- Department -->
                        <div style="margin-bottom: 25px; text-align: left;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 500;">${msg.departmentQuestion}</p>
                            <select id="department-select" style="width: 100%; padding: 10px; border: 2px solid #e9ecef; border-radius: 6px; font-size: 14px; background: white; cursor: pointer; position: relative; z-index: 1001;">
                                <option value="">-- Select Department --</option>
                                <option value="general">${msg.departments.general}</option>
                                <option value="support">${msg.departments.support}</option>
                                <option value="technical">${msg.departments.technical}</option>
                                <option value="sales">${msg.departments.sales}</option>
                                <option value="billing">${msg.departments.billing}</option>
                                <option value="delivery">${msg.departments.delivery}</option>
                            </select>
                        </div>
                        
                        <!-- Language Toggle -->
                        <div style="display: flex; justify-content: center; margin-bottom: 15px; background: #f8f9fa; border-radius: 25px; padding: 3px; width: fit-content; margin-left: auto; margin-right: auto;">
                            <button onclick="FoodisChatbot.switchRatingLanguage('en')" id="lang-en-btn" style="background: ${language === 'en' ? '#007bff' : 'transparent'}; color: ${language === 'en' ? 'white' : '#666'}; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s;">English</button>
                            <button onclick="FoodisChatbot.switchRatingLanguage('sv')" id="lang-sv-btn" style="background: ${language === 'sv' ? '#007bff' : 'transparent'}; color: ${language === 'sv' ? 'white' : '#666'}; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.2s;">Svenska</button>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="FoodisChatbot.closeRatingPopup()" style="background: #6c757d; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">Skip</button>
                            <button onclick="FoodisChatbot.submitEnhancedRating()" style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Submit Feedback</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Append to the chat window with proper positioning
            const targetContainer = chatWindow || messagesContainer;
            
            // Ensure the target container has relative positioning
            const currentPosition = window.getComputedStyle(targetContainer).position;
            if (currentPosition === 'static') {
                targetContainer.style.position = 'relative';
            }
            
            console.log('📋 Appending rating form to chat window');
            targetContainer.insertAdjacentHTML('beforeend', popupHTML);
            
            // Initialize form state
            this.ratingFormData = {
                rating: null,
                resolved: null,
                department: null
            };
        },
        
        // Form interaction functions for enhanced rating
        selectRating: function(rating) {
            this.ratingFormData.rating = rating;
            
            // Update button styles
            document.querySelectorAll('.rating-btn').forEach(btn => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
            
            const selectedBtn = document.querySelector(`[data-rating="${rating}"]`);
            if (selectedBtn) {
                selectedBtn.style.transform = 'scale(1.1)';
                selectedBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }
            
            console.log(`⭐ Rating selected: ${rating}`);
        },
        
        selectResolved: function(resolved) {
            this.ratingFormData.resolved = resolved;
            
            // Update button styles
            document.querySelectorAll('.resolved-btn').forEach(btn => {
                btn.style.background = '#f8f9fa';
                btn.style.borderColor = '#e9ecef';
                btn.style.color = '#6c757d';
            });
            
            const selectedBtn = document.querySelector(`[data-resolved="${resolved}"]`);
            if (selectedBtn) {
                selectedBtn.style.background = '#007bff';
                selectedBtn.style.borderColor = '#007bff';
                selectedBtn.style.color = 'white';
            }
            
            console.log(`✅ Issue resolved status: ${resolved}`);
        },
        
        submitEnhancedRating: function() {
            // Get department selection
            const departmentSelect = document.getElementById('department-select');
            this.ratingFormData.department = departmentSelect ? departmentSelect.value : null;
            
            // Validate form
            if (!this.ratingFormData.rating) {
                alert('Please select a rating before submitting.');
                return;
            }
            
            if (!this.ratingFormData.resolved) {
                alert('Please indicate if your issue was resolved.');
                return;
            }
            
            console.log('📊 Submitting enhanced rating:', this.ratingFormData);
            
            // Submit enhanced rating via API
            fetch(this.config.apiEndpoint.replace('/chatbot', '/chatbot/rate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: this.conversationId,
                    rating: this.ratingFormData.rating,
                    resolved: this.ratingFormData.resolved,
                    department: this.ratingFormData.department,
                    userName: this.userName,
                    language: this.getCurrentLanguage(),
                    timestamp: new Date().toISOString(),
                    agentName: this.currentAgent?.name || 'Unknown',
                    agentRole: this.currentAgent?.role || 'Unknown'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('✅ Enhanced rating submitted successfully:', data);
                
                // Show thank you message in chat
                const language = this.getCurrentLanguage();
                const thankYouMsg = language === 'sv' ? 
                    'Tack för din feedback! Vi uppskattar din tid.' :
                    'Thank you for your feedback! We appreciate your time.';
                    
                this.addMessage(thankYouMsg, 'assistant');
            })
            .catch(error => {
                console.error('❌ Enhanced rating submission failed:', error);
                alert('Failed to submit rating. Please try again.');
            });
            
            this.closeRatingPopup();
            
            // Reset chat after rating submission
            setTimeout(() => {
                this.resetChatSession();
            }, 2000);
        },
        
        // Language switcher for rating form - updates content without recreating form
        switchRatingLanguage: function(lang) {
            console.log(`🌐 Switching rating form language to: ${lang}`);
            
            // Update language toggle buttons
            const enBtn = document.getElementById('lang-en-btn');
            const svBtn = document.getElementById('lang-sv-btn');
            
            if (enBtn && svBtn) {
                if (lang === 'en') {
                    enBtn.style.background = '#007bff';
                    enBtn.style.color = 'white';
                    svBtn.style.background = 'transparent';
                    svBtn.style.color = '#666';
                } else {
                    svBtn.style.background = '#007bff';
                    svBtn.style.color = 'white';
                    enBtn.style.background = 'transparent';
                    enBtn.style.color = '#666';
                }
            }
            
            // Update form text content
            this.updateRatingFormLanguage(lang);
        },
        
        // Update rating form text content for language switching
        updateRatingFormLanguage: function(lang) {
            const messages = {
                'en': {
                    title: 'Rate Your Experience',
                    overallQuestion: 'How would you rate your overall chat experience?',
                    resolvedQuestion: 'Was your issue resolved?',
                    resolvedOptions: { yes: 'Yes', no: 'No', partially: 'Partially' },
                    departmentQuestion: 'Which department helped you today?',
                    departments: {
                        general: 'General Support',
                        support: 'Customer Support', 
                        technical: 'Technical Support',
                        sales: 'Sales',
                        billing: 'Billing',
                        delivery: 'Delivery'
                    }
                },
                'sv': {
                    title: 'Betygsätt din upplevelse',
                    overallQuestion: 'Hur skulle du betygsätta din totala chattupplevelse?',
                    resolvedQuestion: 'Löstes ditt problem?',
                    resolvedOptions: { yes: 'Ja', no: 'Nej', partially: 'Delvis' },
                    departmentQuestion: 'Vilken avdelning hjälpte dig idag?',
                    departments: {
                        general: 'Allmän support',
                        support: 'Kundsupport',
                        technical: 'Teknisk support', 
                        sales: 'Försäljning',
                        billing: 'Fakturering',
                        delivery: 'Leverans'
                    }
                }
            };
            
            const msg = messages[lang] || messages['en'];
            
            // Update form title
            const titleEl = document.querySelector('#rating-form h3');
            if (titleEl) titleEl.textContent = msg.title;
            
            // Update rating question
            const ratingQuestionEl = document.querySelector('#rating-form p');
            if (ratingQuestionEl) ratingQuestionEl.textContent = msg.overallQuestion;
            
            // Update resolved question and buttons
            const resolvedQuestionEl = document.querySelectorAll('#rating-form p')[1];
            if (resolvedQuestionEl) resolvedQuestionEl.textContent = msg.resolvedQuestion;
            
            // Update resolved buttons
            const resolvedBtns = document.querySelectorAll('.resolved-btn');
            if (resolvedBtns.length >= 3) {
                resolvedBtns[0].innerHTML = `✅ ${msg.resolvedOptions.yes}`;
                resolvedBtns[1].innerHTML = `❌ ${msg.resolvedOptions.no}`;
                resolvedBtns[2].innerHTML = `🔄 ${msg.resolvedOptions.partially}`;
            }
            
            // Update department question and options
            const departmentQuestionEl = document.querySelectorAll('#rating-form p')[2];
            if (departmentQuestionEl) departmentQuestionEl.textContent = msg.departmentQuestion;
            
            const departmentSelect = document.getElementById('department-select');
            if (departmentSelect) {
                const currentValue = departmentSelect.value;
                departmentSelect.innerHTML = `
                    <option value="">-- Select Department --</option>
                    <option value="general">${msg.departments.general}</option>
                    <option value="support">${msg.departments.support}</option>
                    <option value="technical">${msg.departments.technical}</option>
                    <option value="sales">${msg.departments.sales}</option>
                    <option value="billing">${msg.departments.billing}</option>
                    <option value="delivery">${msg.departments.delivery}</option>
                `;
                departmentSelect.value = currentValue; // Restore selection
            }
        },
        
        // Reset chat session to clean state
        resetChatSession: function() {
            console.log('🔄 Resetting chat session to clean state');
            
            // Clear messages from UI (but maintain internal logging)
            const messagesContainer = document.getElementById('chatbot-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            // Reset conversation state
            this.messages = [];
            this.isTyping = false;
            this.awaitingResponse = false;
            
            // Reset timers
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
                this.inactivityTimer = null;
            }
            
            // Show initial greeting
            const language = this.getCurrentLanguage();
            const greeting = language === 'sv' ? 
                'Hej! Hur kan jag hjälpa dig idag?' : 
                'Hello! How can I help you today?';
            
            setTimeout(() => {
                this.addMessage(greeting, 'assistant');
            }, 500);
        },
        
        // Legacy function for backward compatibility
        submitRating: function(rating) {
            this.selectRating(rating);
            this.ratingFormData.resolved = 'yes'; // Default for legacy
            this.submitEnhancedRating();
        },
        
        closeRatingPopup: function() {
            const overlay = document.getElementById('rating-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Chatbot widget DOM loaded, initializing...');

        // Initialize with default settings
        window.FoodisChatbot.init({
            apiEndpoint: window.location.origin + '/api/chatbot',
            position: 'bottom-right',
            primaryColor: '#e8f24c',
            language: 'en'
        });
    });

})();