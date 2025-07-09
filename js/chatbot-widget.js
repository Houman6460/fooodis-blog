
/**
 * Fooodis AI Chatbot Widget - Complete Implementation
 * A comprehensive chatbot widget matching the technical specification
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
            avatar: '',
            enabled: true,
            allowFileUpload: true
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
        conversationPhase: 'welcome', // welcome -> registration -> handoff -> agent -> rating
        userName: null,
        handoffComplete: false,
        currentLanguage: null,
        languageDetected: false,
        inactivityTimer: null,
        soundEnabled: true,
        conversationStartTime: null,

        // Multi-language support
        translations: {
            en: {
                welcome: "🇬🇧 Hello! I'm your Fooodis assistant. How can I help you today?",
                typing: "is typing...",
                sendPlaceholder: "Type your message...",
                registrationTitle: "Welcome to Fooodis!",
                registrationSubtitle: "Let's personalize your experience",
                skipRegistration: "Skip Registration",
                continueToChat: "Continue to Chat",
                ratingTitle: "Rate Your Experience",
                ratingSubtitle: "How was your experience today?",
                submitRating: "Submit Rating",
                thankYou: "Thank you for your feedback!",
                agentHandoff: "Let me connect you with the right specialist...",
                online: "Online"
            },
            sv: {
                welcome: "🇸🇪 Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?",
                typing: "skriver...",
                sendPlaceholder: "Skriv ditt meddelande...",
                registrationTitle: "Välkommen till Fooodis!",
                registrationSubtitle: "Låt oss personalisera din upplevelse",
                skipRegistration: "Hoppa över registrering",
                continueToChat: "Fortsätt till chatten",
                ratingTitle: "Betygsätt din upplevelse",
                ratingSubtitle: "Hur var din upplevelse idag?",
                submitRating: "Skicka betyg",
                thankYou: "Tack för din feedback!",
                agentHandoff: "Låt mig koppla dig till rätt specialist...",
                online: "Online"
            }
        },

        init: function(options = {}) {
            console.log('🚀 Initializing Fooodis Chatbot Widget...');

            // Merge configuration
            this.config = { ...this.config, ...options };

            // Set default API endpoint if not provided
            if (!this.config.apiEndpoint) {
                this.config.apiEndpoint = window.location.origin + '/api/chatbot';
            }

            // Initialize chat state
            this.conversationPhase = 'welcome';
            this.userName = localStorage.getItem('fooodis-user-name') || null;
            this.conversationStartTime = new Date().toISOString();

            // Load saved settings and prepare agents
            this.loadSavedSettings();
            this.loadLanguagePreference();
            this.checkChatbotEnabled();
            this.setupDashboardCommunication();

            // Create and inject widget
            this.createWidget();
            this.attachEventListeners();
            this.setupAvatarUpdateListener();
            this.setupInactivityTimer();

            // Load available agents
            this.loadAgents();

            // Notify that widget is ready
            window.dispatchEvent(new CustomEvent('chatbotWidgetReady'));
            console.log('✅ Fooodis Chatbot Widget initialized successfully');
        },

        loadSavedSettings: function() {
            try {
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    this.chatbotSettings = settings;
                    this.config.avatar = settings.avatar || this.getDefaultAvatar();
                    this.config.enabled = settings.enabled !== false;
                    this.config.allowFileUpload = settings.allowFileUpload !== false;

                    if (settings.enableMultipleAgents && settings.agents) {
                        this.availableAgents = settings.agents.filter(agent => agent.enabled !== false);
                    }
                }

                this.currentAgent = {
                    name: 'David Kim',
                    avatar: this.config.avatar || this.getDefaultAvatar(),
                    personality: 'Friendly Fooodis assistant'
                };
            } catch (error) {
                console.error('Error loading saved settings:', error);
                this.setDefaultAgent();
            }
        },

        setDefaultAgent: function() {
            this.currentAgent = {
                name: 'Fooodis Assistant',
                avatar: this.getDefaultAvatar(),
                personality: 'Friendly assistant'
            };
        },

        getDefaultAvatar: function() {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlOGYyNGMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iIzI2MjgyZiIvPgo8L3N2Zz4KPC9zdmc+';
        },

        loadLanguagePreference: function() {
            const savedLang = localStorage.getItem('fooodis-language');
            if (savedLang) {
                this.currentLanguage = savedLang;
            } else {
                const browserLang = navigator.language || navigator.userLanguage;
                this.currentLanguage = browserLang.startsWith('sv') ? 'sv' : 'en';
            }
            console.log('🌐 Language set to:', this.currentLanguage);
        },

        translate: function(key) {
            return this.translations[this.currentLanguage]?.[key] || this.translations.en[key] || key;
        },

        detectLanguage: function(text) {
            const swedishPatterns = [
                /\b(hej|tack|ja|nej|kanske|varför|när|var|vad|vem|hur)\b/i,
                /\b(svenska|sverige|stockholm|göteborg|malmö)\b/i,
                /\b(hjälpa|beställa|mat|restaurang)\b/i
            ];

            const swedishMatches = swedishPatterns.filter(pattern => pattern.test(text)).length;
            if (swedishMatches > 0 && !this.languageDetected) {
                this.currentLanguage = 'sv';
                this.languageDetected = true;
                localStorage.setItem('fooodis-language', 'sv');
                this.updateLanguageInterface();
            } else if (!this.languageDetected) {
                this.currentLanguage = 'en';
                this.languageDetected = true;
                localStorage.setItem('fooodis-language', 'en');
            }
        },

        updateLanguageInterface: function() {
            // Update placeholder
            const messageInput = document.getElementById('chatbot-message-input');
            if (messageInput) {
                messageInput.placeholder = this.translate('sendPlaceholder');
            }

            // Update typing indicator
            const typingText = this.widget.querySelector('.chatbot-typing span:last-child');
            if (typingText) {
                typingText.textContent = `${this.currentAgent.name} ${this.translate('typing')}`;
            }

            // Update status
            const statusText = this.widget.querySelector('.status');
            if (statusText) {
                statusText.textContent = this.translate('online');
            }
        },

        checkChatbotEnabled: function() {
            try {
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    this.config.enabled = settings.enabled !== false;
                } else {
                    this.fetchServerConfig();
                }
            } catch (error) {
                console.error('Error checking chatbot enabled state:', error);
                this.config.enabled = true;
            }
        },

        async fetchServerConfig() {
            try {
                const response = await fetch('/api/chatbot/config');
                if (response.ok) {
                    const config = await response.json();
                    this.config.enabled = config.enabled !== false;
                }
            } catch (error) {
                console.error('Error fetching server config:', error);
                this.config.enabled = true;
            }
        },

        async loadAgents() {
            try {
                const response = await fetch('/api/chatbot/agents');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.availableAgents = data.agents;
                        console.log('📋 Loaded agents:', this.availableAgents.length);
                    }
                }
            } catch (error) {
                console.error('Error loading agents:', error);
            }
        },

        setupDashboardCommunication: function() {
            if (window.chatbotEvents) {
                window.chatbotEvents.addEventListener('settingsChanged', (e) => {
                    this.handleDashboardSettingsChange(e.detail);
                });
            }

            window.addEventListener('chatbotManagerReady', () => {
                console.log('🔗 Dashboard manager ready, syncing settings...');
                this.syncWithDashboard();
            });
        },

        handleDashboardSettingsChange: function(data) {
            console.log('📡 Widget received settings change:', data);
            if (data.settings) {
                this.config.enabled = data.settings.enabled;
                this.config.allowFileUpload = data.settings.allowFileUpload;
                
                if (this.widget) {
                    this.widget.style.display = this.config.enabled ? 'block' : 'none';
                }
                this.updateFileUploadVisibility();
            }
        },

        setupAvatarUpdateListener: function() {
            window.addEventListener('storage', (e) => {
                if (e.key === 'fooodis-chatbot-settings') {
                    try {
                        const settings = JSON.parse(e.newValue);
                        if (settings?.avatar && settings.avatar !== this.config.avatar) {
                            this.updateAvatar(settings.avatar);
                        }
                        if (typeof settings?.allowFileUpload !== 'undefined') {
                            this.config.allowFileUpload = settings.allowFileUpload;
                            this.updateFileUploadVisibility();
                        }
                    } catch (error) {
                        console.error('Error handling settings update:', error);
                    }
                }
            });
        },

        setupInactivityTimer: function() {
            this.resetInactivityTimer();
        },

        resetInactivityTimer: function() {
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
            }

            // Set 5 minute inactivity timer
            this.inactivityTimer = setTimeout(() => {
                if (this.isOpen && this.conversationPhase === 'agent') {
                    this.handleInactivity();
                }
            }, 5 * 60 * 1000);
        },

        handleInactivity: function() {
            const inactivityMessage = this.currentLanguage === 'sv' 
                ? "Är du fortfarande där? Kan jag hjälpa dig med något annat?"
                : "Are you still there? Can I help you with anything else?";
            
            this.addMessage(inactivityMessage, 'assistant');
            this.playNotificationSound();
        },

        createWidget: function() {
            const existingWidget = document.getElementById('fooodis-chatbot');
            if (existingWidget) {
                existingWidget.remove();
            }

            const agentName = this.currentAgent?.name || 'Fooodis Assistant';
            const agentAvatar = this.currentAgent?.avatar || this.getDefaultAvatar();

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
                        <div class="chatbot-header">
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
                                        <span class="status">${this.translate('online')}</span>
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
                            <span>${agentName} ${this.translate('typing')}</span>
                        </div>

                        <div class="chatbot-input">
                            <div class="input-container">
                                <input type="file" id="chatbot-file-input" style="display: none;" accept="image/*,.pdf,.doc,.docx,.txt" />
                                <button type="button" id="chatbot-upload" class="upload-btn" style="display: ${this.config.allowFileUpload ? 'flex' : 'none'};">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <input type="text" id="chatbot-message-input" placeholder="${this.translate('sendPlaceholder')}" />
                                <button id="chatbot-send" type="button">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 11L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Registration Modal -->
                    <div class="registration-modal" id="registration-modal" style="display: none;">
                        <div class="registration-content">
                            <h3>${this.translate('registrationTitle')}</h3>
                            <p>${this.translate('registrationSubtitle')}</p>
                            <form id="registration-form">
                                <input type="text" name="name" placeholder="Full Name" required />
                                <input type="email" name="email" placeholder="Email" required />
                                <input type="tel" name="phone" placeholder="Phone" />
                                <input type="text" name="company" placeholder="Company" />
                                <select name="system_usage" required>
                                    <option value="">How will you use Fooodis?</option>
                                    <option value="new_user">New User</option>
                                    <option value="existing_customer">Existing Customer</option>
                                    <option value="business_inquiry">Business Inquiry</option>
                                    <option value="technical_support">Technical Support</option>
                                </select>
                                <div class="language-selection">
                                    <button type="button" class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">🇬🇧 English</button>
                                    <button type="button" class="lang-btn ${this.currentLanguage === 'sv' ? 'active' : ''}" data-lang="sv">🇸🇪 Svenska</button>
                                </div>
                                <div class="registration-buttons">
                                    <button type="submit">${this.translate('continueToChat')}</button>
                                    <button type="button" id="skip-registration">${this.translate('skipRegistration')}</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Rating Modal -->
                    <div class="rating-modal" id="rating-modal" style="display: none;">
                        <div class="rating-content">
                            <h3>${this.translate('ratingTitle')}</h3>
                            <p>${this.translate('ratingSubtitle')}</p>
                            <form id="rating-form">
                                <div class="star-rating">
                                    <span class="star" data-rating="1">★</span>
                                    <span class="star" data-rating="2">★</span>
                                    <span class="star" data-rating="3">★</span>
                                    <span class="star" data-rating="4">★</span>
                                    <span class="star" data-rating="5">★</span>
                                </div>
                                <div class="resolution-selection">
                                    <label>Was your issue resolved?</label>
                                    <div class="resolution-buttons">
                                        <button type="button" class="resolution-btn" data-resolved="true">Yes</button>
                                        <button type="button" class="resolution-btn" data-resolved="false">No</button>
                                    </div>
                                </div>
                                <textarea name="feedback" placeholder="Additional feedback (optional)"></textarea>
                                <button type="submit">${this.translate('submitRating')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            this.injectStyles();

            if (!this.config.enabled) {
                widget.style.display = 'none';
            }

            document.body.appendChild(widget);
            this.widget = widget;
        },

        getInitialWelcomeMessage: function() {
            if (this.chatbotSettings?.welcomeMessage) {
                return this.chatbotSettings.welcomeMessage;
            }

            return `
                <div class="bilingual-welcome">
                    <div class="welcome-en">🇬🇧 <strong>English:</strong> Hello! I'm your Fooodis assistant. How can I help you today?</div>
                    <div class="welcome-sv">🇸🇪 <strong>Svenska:</strong> Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?</div>
                </div>
            `;
        },

        injectStyles: function() {
            if (document.getElementById('fooodis-chatbot-styles')) {
                return;
            }

            const styles = document.createElement('style');
            styles.id = 'fooodis-chatbot-styles';
            styles.textContent = `
                /* Fooodis Chatbot Widget Styles */
                #fooodis-chatbot {
                    position: fixed !important;
                    z-index: 999999 !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                }

                #fooodis-chatbot.bottom-right {
                    bottom: 20px !important;
                    right: 20px !important;
                }

                .chatbot-button {
                    width: 60px !important;
                    height: 60px !important;
                    border-radius: 50% !important;
                    background: #e8f24c !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                    transition: all 0.3s ease !important;
                    position: relative !important;
                }

                .chatbot-button:hover {
                    transform: scale(1.1) !important;
                }

                .chatbot-avatar, .chatbot-avatar-small, .message-avatar {
                    border-radius: 50% !important;
                    overflow: hidden !important;
                }

                .chatbot-avatar {
                    width: 40px !important;
                    height: 40px !important;
                }

                .chatbot-avatar-small {
                    width: 30px !important;
                    height: 30px !important;
                }

                .message-avatar {
                    width: 30px !important;
                    height: 30px !important;
                    flex-shrink: 0 !important;
                }

                .chatbot-avatar img, .chatbot-avatar-small img, .message-avatar img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }

                .notification-badge {
                    position: absolute !important;
                    top: -5px !important;
                    right: -5px !important;
                    background: #ff4444 !important;
                    color: white !important;
                    border-radius: 50% !important;
                    width: 20px !important;
                    height: 20px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 12px !important;
                    font-weight: bold !important;
                }

                .chatbot-window {
                    display: none !important;
                    position: absolute !important;
                    bottom: 80px !important;
                    right: 0 !important;
                    width: 350px !important;
                    height: 500px !important;
                    background: #ffffff !important;
                    border-radius: 12px !important;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
                    flex-direction: column !important;
                    overflow: hidden !important;
                }

                .chatbot-window.open {
                    display: flex !important;
                }

                .chatbot-header {
                    padding: 15px !important;
                    background: #26282f !important;
                    color: white !important;
                }

                .header-top {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 10px !important;
                }

                .header-logo {
                    height: 25px !important;
                }

                .close-button {
                    background: none !important;
                    border: none !important;
                    color: white !important;
                    cursor: pointer !important;
                    padding: 5px !important;
                }

                .agent-info {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                }

                .header-text h4 {
                    margin: 0 !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                }

                .status {
                    font-size: 12px !important;
                    color: #4caf50 !important;
                }

                .chatbot-messages {
                    flex: 1 !important;
                    padding: 15px !important;
                    overflow-y: auto !important;
                    background: #f8f9fa !important;
                }

                .message {
                    display: flex !important;
                    margin-bottom: 15px !important;
                    align-items: flex-start !important;
                    gap: 10px !important;
                }

                .message.user {
                    flex-direction: row-reverse !important;
                }

                .message-content {
                    background: white !important;
                    padding: 10px 15px !important;
                    border-radius: 18px !important;
                    max-width: 80% !important;
                    word-wrap: break-word !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    color: #333 !important;
                }

                .message.user .message-content {
                    background: #e8f24c !important;
                    color: #26282f !important;
                }

                .bilingual-welcome {
                    line-height: 1.6 !important;
                }

                .welcome-en, .welcome-sv {
                    margin-bottom: 8px !important;
                }

                .chatbot-typing {
                    display: none !important;
                    padding: 15px !important;
                    align-items: center !important;
                    gap: 10px !important;
                    background: #f8f9fa !important;
                    border-top: 1px solid #e9ecef !important;
                }

                .typing-indicator {
                    display: flex !important;
                    gap: 3px !important;
                }

                .typing-indicator span {
                    width: 6px !important;
                    height: 6px !important;
                    background: #999 !important;
                    border-radius: 50% !important;
                    animation: typing 1.4s infinite !important;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s !important;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s !important;
                }

                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-10px); }
                }

                .chatbot-input {
                    padding: 15px !important;
                    background: white !important;
                    border-top: 1px solid #e9ecef !important;
                }

                .input-container {
                    display: flex !important;
                    gap: 10px !important;
                    align-items: center !important;
                }

                .upload-btn {
                    background: none !important;
                    border: none !important;
                    color: #666 !important;
                    cursor: pointer !important;
                    padding: 8px !important;
                    border-radius: 4px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

                .upload-btn:hover {
                    background: #f0f0f0 !important;
                }

                #chatbot-message-input {
                    flex: 1 !important;
                    padding: 10px 15px !important;
                    border: 1px solid #ddd !important;
                    border-radius: 20px !important;
                    outline: none !important;
                    font-size: 14px !important;
                }

                #chatbot-message-input:focus {
                    border-color: #e8f24c !important;
                }

                #chatbot-send {
                    background: #e8f24c !important;
                    border: none !important;
                    color: #26282f !important;
                    cursor: pointer !important;
                    padding: 10px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 40px !important;
                    height: 40px !important;
                }

                #chatbot-send:hover {
                    background: #d4db43 !important;
                }

                /* Registration Modal */
                .registration-modal, .rating-modal {
                    position: absolute !important;
                    bottom: 80px !important;
                    right: 0 !important;
                    width: 350px !important;
                    height: 500px !important;
                    background: white !important;
                    border-radius: 12px !important;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
                    z-index: 1000000 !important;
                }

                .registration-content, .rating-content {
                    padding: 30px 25px !important;
                    height: 100% !important;
                    overflow-y: auto !important;
                }

                .registration-content h3, .rating-content h3 {
                    margin: 0 0 10px 0 !important;
                    color: #26282f !important;
                    font-size: 20px !important;
                }

                .registration-content p, .rating-content p {
                    margin: 0 0 20px 0 !important;
                    color: #666 !important;
                    font-size: 14px !important;
                }

                #registration-form input, #registration-form select {
                    width: 100% !important;
                    padding: 12px !important;
                    margin-bottom: 15px !important;
                    border: 1px solid #ddd !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    box-sizing: border-box !important;
                }

                .language-selection {
                    display: flex !important;
                    gap: 10px !important;
                    margin-bottom: 20px !important;
                }

                .lang-btn {
                    flex: 1 !important;
                    padding: 10px !important;
                    border: 2px solid #e8f24c !important;
                    background: white !important;
                    border-radius: 8px !important;
                    cursor: pointer !important;
                    font-size: 14px !important;
                    transition: all 0.2s !important;
                }

                .lang-btn.active {
                    background: #e8f24c !important;
                    color: #26282f !important;
                }

                .registration-buttons {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                }

                .registration-buttons button {
                    width: 100% !important;
                    padding: 12px !important;
                    border: none !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                }

                .registration-buttons button[type="submit"] {
                    background: #e8f24c !important;
                    color: #26282f !important;
                    font-weight: 600 !important;
                }

                .registration-buttons button[type="button"] {
                    background: #f8f9fa !important;
                    color: #666 !important;
                }

                /* Rating Modal */
                .star-rating {
                    display: flex !important;
                    gap: 5px !important;
                    margin-bottom: 20px !important;
                    justify-content: center !important;
                }

                .star {
                    font-size: 30px !important;
                    color: #ddd !important;
                    cursor: pointer !important;
                    transition: color 0.2s !important;
                }

                .star.active, .star:hover {
                    color: #ffc107 !important;
                }

                .resolution-selection {
                    margin-bottom: 20px !important;
                    text-align: center !important;
                }

                .resolution-selection label {
                    display: block !important;
                    margin-bottom: 10px !important;
                    font-weight: 500 !important;
                    color: #26282f !important;
                }

                .resolution-buttons {
                    display: flex !important;
                    gap: 10px !important;
                    justify-content: center !important;
                }

                .resolution-btn {
                    padding: 8px 20px !important;
                    border: 2px solid #e8f24c !important;
                    background: white !important;
                    border-radius: 20px !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                }

                .resolution-btn.active {
                    background: #e8f24c !important;
                    color: #26282f !important;
                }

                #rating-form textarea {
                    width: 100% !important;
                    padding: 12px !important;
                    border: 1px solid #ddd !important;
                    border-radius: 8px !important;
                    margin-bottom: 20px !important;
                    resize: vertical !important;
                    min-height: 80px !important;
                    box-sizing: border-box !important;
                }

                #rating-form button[type="submit"] {
                    width: 100% !important;
                    padding: 12px !important;
                    background: #e8f24c !important;
                    color: #26282f !important;
                    border: none !important;
                    border-radius: 8px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    cursor: pointer !important;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .chatbot-window, .registration-modal, .rating-modal {
                        width: 320px !important;
                        height: 450px !important;
                        bottom: 80px !important;
                        right: 10px !important;
                    }
                }
            `;

            document.head.appendChild(styles);
        },

        attachEventListeners: function() {
            const chatButton = document.getElementById('chatbot-button');
            const closeButton = document.getElementById('chatbot-close');
            const sendButton = document.getElementById('chatbot-send');
            const messageInput = document.getElementById('chatbot-message-input');

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

                messageInput.addEventListener('input', () => {
                    this.resetInactivityTimer();
                });
            }

            // File upload
            this.setupFileUpload();

            // Registration form
            this.setupRegistrationForm();

            // Rating form
            this.setupRatingForm();

            this.updateFileUploadVisibility();
        },

        setupFileUpload: function() {
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
        },

        setupRegistrationForm: function() {
            const form = document.getElementById('registration-form');
            const skipButton = document.getElementById('skip-registration');
            const langButtons = document.querySelectorAll('.lang-btn');

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitRegistration(new FormData(form));
                });
            }

            if (skipButton) {
                skipButton.addEventListener('click', () => {
                    this.skipRegistration();
                });
            }

            langButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const lang = btn.dataset.lang;
                    this.switchLanguage(lang);
                    langButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        },

        setupRatingForm: function() {
            const ratingForm = document.getElementById('rating-form');
            const stars = document.querySelectorAll('.star');
            const resolutionBtns = document.querySelectorAll('.resolution-btn');
            let selectedRating = 0;
            let selectedResolution = null;

            // Star rating
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    selectedRating = index + 1;
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < selectedRating);
                    });
                });

                star.addEventListener('mouseover', () => {
                    stars.forEach((s, i) => {
                        s.style.color = i <= index ? '#ffc107' : '#ddd';
                    });
                });

                star.addEventListener('mouseout', () => {
                    stars.forEach((s, i) => {
                        s.style.color = i < selectedRating ? '#ffc107' : '#ddd';
                    });
                });
            });

            // Resolution selection
            resolutionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    selectedResolution = btn.dataset.resolved === 'true';
                    resolutionBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });

            // Form submission
            if (ratingForm) {
                ratingForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(ratingForm);
                    this.submitRating({
                        rating: selectedRating,
                        resolved: selectedResolution,
                        feedback: formData.get('feedback')
                    });
                });
            }
        },

        updateFileUploadVisibility: function() {
            const uploadButton = document.getElementById('chatbot-upload');
            if (uploadButton) {
                uploadButton.style.display = this.config.allowFileUpload ? 'flex' : 'none';
            }
        },

        toggleChat: function() {
            const chatWindow = document.getElementById('chatbot-window');
            const notificationBadge = document.getElementById('notification-badge');

            if (chatWindow) {
                if (this.isOpen) {
                    chatWindow.classList.remove('open');
                    this.isOpen = false;
                } else {
                    // Show registration modal first for new users
                    if (this.conversationPhase === 'welcome' && !this.userRegistered) {
                        this.showRegistrationModal();
                    } else {
                        chatWindow.classList.add('open');
                        this.isOpen = true;
                    }

                    if (notificationBadge) {
                        notificationBadge.style.display = 'none';
                    }

                    const messageInput = document.getElementById('chatbot-message-input');
                    if (messageInput) {
                        setTimeout(() => messageInput.focus(), 100);
                    }
                }
            }
        },

        closeChat: function() {
            const chatWindow = document.getElementById('chatbot-window');
            if (chatWindow) {
                chatWindow.classList.remove('open');
                this.isOpen = false;
            }

            this.hideAllModals();

            if (this.conversationPhase === 'agent' && this.messages.length > 2) {
                this.showRatingModal();
            }
        },

        showRegistrationModal: function() {
            this.hideAllModals();
            const modal = document.getElementById('registration-modal');
            if (modal) {
                modal.style.display = 'block';
                this.conversationPhase = 'registration';
            }
        },

        showRatingModal: function() {
            this.hideAllModals();
            const modal = document.getElementById('rating-modal');
            if (modal) {
                modal.style.display = 'block';
                this.conversationPhase = 'rating';
            }
        },

        hideAllModals: function() {
            const modals = ['registration-modal', 'rating-modal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        },

        async submitRegistration(formData) {
            try {
                const registrationData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    company: formData.get('company'),
                    language: this.currentLanguage,
                    systemUsage: formData.get('system_usage'),
                    conversationId: this.conversationId
                };

                const response = await fetch(`${this.config.apiEndpoint}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData)
                });

                if (response.ok) {
                    const data = await response.json();
                    this.userInfo = data.user;
                    this.userRegistered = true;
                    this.userName = registrationData.name;
                    localStorage.setItem('fooodis-user-name', this.userName);

                    this.hideAllModals();
                    this.openChatWindow();
                    this.performAgentHandoff();
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.addMessage('Registration failed. Continuing with anonymous chat.', 'assistant');
                this.skipRegistration();
            }
        },

        skipRegistration: function() {
            this.userRegistered = false;
            this.conversationPhase = 'handoff';
            this.hideAllModals();
            this.openChatWindow();
            this.performAgentHandoff();
        },

        openChatWindow: function() {
            const chatWindow = document.getElementById('chatbot-window');
            if (chatWindow) {
                chatWindow.classList.add('open');
                this.isOpen = true;
            }
        },

        performAgentHandoff: function() {
            this.conversationPhase = 'handoff';
            
            const handoffMessage = this.currentLanguage === 'sv' 
                ? "Låt mig koppla dig till rätt specialist..."
                : "Let me connect you with the right specialist...";
            
            this.addMessage(handoffMessage, 'assistant');
            
            setTimeout(() => {
                this.conversationPhase = 'agent';
                const readyMessage = this.currentLanguage === 'sv'
                    ? "Jag är här för att hjälpa dig! Vad kan jag göra för dig idag?"
                    : "I'm here to help you! What can I do for you today?";
                
                this.addMessage(readyMessage, 'assistant');
            }, 1500);
        },

        switchLanguage: function(language) {
            this.currentLanguage = language;
            this.languageDetected = true;
            localStorage.setItem('fooodis-language', language);
            this.updateLanguageInterface();
        },

        sendMessage: function() {
            const messageInput = document.getElementById('chatbot-message-input');
            if (!messageInput) return;

            const message = messageInput.value.trim();
            if (!message) return;

            // Detect language from user input
            this.detectLanguage(message);

            // Add user message to chat
            this.addMessage(message, 'user');
            messageInput.value = '';

            // Reset inactivity timer
            this.resetInactivityTimer();

            // Show typing indicator
            this.showTyping();

            // Check if user is ending conversation
            if (this.isUserFinishingConversation(message)) {
                setTimeout(() => {
                    this.hideTyping();
                    this.handleConversationExit();
                }, 1500);
                return;
            }

            // Process message
            this.processMessage(message);
        },

        addMessage: function(content, sender) {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}`;

            const avatar = sender === 'user' 
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiM2NjY2NjYiLz4KPHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMUM5LjggMSAxMC41IDEuNyAxMC41IDIuNUMxMC41IDMuMyA5LjggNCA5IDRDOC4yIDQgNy41IDMuMyA3LjUgMi41QzcuNSAxLjcgOC4yIDEgOSAxWk0xNS41IDE0LjJWMTVIMi41VjE0LjJDMi41IDEyLjIgNiAxMS4yIDYuOCAxMS4ySDExLjJDMTIgMTEuMiAxNS41IDEyLjIgMTUuNSAxNC4yWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+'
                : (this.currentAgent?.avatar || this.getDefaultAvatar());

            messageElement.innerHTML = `
                <div class="message-avatar">
                    <img src="${avatar}" alt="${sender} Avatar" />
                </div>
                <div class="message-content">${content}</div>
            `;

            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Store message
            this.messages.push({
                content: content,
                sender: sender,
                timestamp: new Date().toISOString()
            });

            // Auto-save conversation
            this.autoSaveConversation();

            // Play notification sound for assistant messages
            if (sender === 'assistant' && this.isOpen) {
                this.playNotificationSound();
            }
        },

        showTyping: function() {
            const typingIndicator = document.getElementById('chatbot-typing');
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
                this.isTyping = true;
            }
        },

        hideTyping: function() {
            const typingIndicator = document.getElementById('chatbot-typing');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
                this.isTyping = false;
            }
        },

        async processMessage(message) {
            try {
                // Generate conversation ID if not exists
                if (!this.conversationId) {
                    this.conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }

                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        conversationId: this.conversationId,
                        language: this.currentLanguage,
                        agent: this.currentAgent,
                        userInfo: this.userInfo,
                        recentMessages: this.messages.slice(-5)
                    })
                });

                this.hideTyping();

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.addMessage(data.message, 'assistant');
                        
                        // Update agent if changed
                        if (data.agent && data.agent.name !== this.currentAgent.name) {
                            this.currentAgent = data.agent;
                            this.updateAgentHeader();
                        }
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    }
                } else {
                    this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'assistant');
                }
            } catch (error) {
                console.error('Error processing message:', error);
                this.hideTyping();
                this.addMessage('Sorry, I\'m having trouble processing your request. Please try again.', 'assistant');
            }
        },

        updateAgentHeader: function() {
            if (!this.widget || !this.currentAgent) return;

            const headerText = this.widget.querySelector('.header-text h4');
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .message-avatar img');

            if (headerText) {
                headerText.textContent = this.currentAgent.name;
            }

            avatarImages.forEach(img => {
                img.src = this.currentAgent.avatar;
                img.alt = this.currentAgent.name + ' Avatar';
            });
        },

        updateAvatar: function(avatarUrl) {
            this.config.avatar = avatarUrl;
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .message-avatar img');
            avatarImages.forEach(img => {
                img.src = avatarUrl;
            });
        },

        isUserFinishingConversation: function(message) {
            const finishKeywords = {
                en: ['bye', 'goodbye', 'thank you', 'thanks', 'done', 'that\'s all', 'finished'],
                sv: ['hej då', 'tack', 'tack så mycket', 'klar', 'det var allt', 'färdig']
            };

            const keywords = finishKeywords[this.currentLanguage] || finishKeywords.en;
            const lowerMessage = message.toLowerCase();
            
            return keywords.some(keyword => lowerMessage.includes(keyword));
        },

        handleConversationExit: function() {
            const goodbyeMessage = this.currentLanguage === 'sv'
                ? "Tack för att du kontaktade Fooodis! Ha en bra dag!"
                : "Thank you for contacting Fooodis! Have a great day!";
            
            this.addMessage(goodbyeMessage, 'assistant');
            
            setTimeout(() => {
                this.showRatingModal();
            }, 2000);
        },

        async submitRating(ratingData) {
            try {
                const response = await fetch(`${this.config.apiEndpoint}/rating`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        conversationId: this.conversationId,
                        rating: ratingData.rating,
                        resolved: ratingData.resolved,
                        feedback: ratingData.feedback,
                        language: this.currentLanguage
                    })
                });

                if (response.ok) {
                    this.hideAllModals();
                    this.addMessage(this.translate('thankYou'), 'assistant');
                    this.resetChatSession();
                }
            } catch (error) {
                console.error('Rating submission error:', error);
                this.hideAllModals();
                this.addMessage(this.translate('thankYou'), 'assistant');
                this.resetChatSession();
            }
        },

        resetChatSession: function() {
            setTimeout(() => {
                this.conversationId = null;
                this.messages = [];
                this.conversationPhase = 'welcome';
                this.languageDetected = false;
                this.handoffComplete = false;
                
                const messagesContainer = document.getElementById('chatbot-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = `
                        <div class="message assistant">
                            <div class="message-avatar">
                                <img src="${this.getDefaultAvatar()}" alt="Assistant Avatar" />
                            </div>
                            <div class="message-content">${this.getInitialWelcomeMessage()}</div>
                        </div>
                    `;
                }
                
                this.closeChat();
            }, 3000);
        },

        autoSaveConversation: function() {
            if (!this.conversationId) return;

            const conversationData = {
                id: this.conversationId,
                messages: this.messages,
                userInfo: this.userInfo,
                currentAgent: this.currentAgent,
                language: this.currentLanguage,
                phase: this.conversationPhase,
                startTime: this.conversationStartTime,
                lastActivity: new Date().toISOString()
            };

            localStorage.setItem('fooodis-current-conversation', JSON.stringify(conversationData));
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

            this.addMessage(`📎 File uploaded: ${file.name}`, 'user');
            
            const response = this.currentLanguage === 'sv'
                ? "Tack för att du laddat upp filen. Jag kan se filen men kan för närvarande inte bearbeta filinnehåll direkt. Beskriv vad du behöver hjälp med angående denna fil."
                : "Thank you for uploading the file. I can see the file but currently cannot process file contents directly. Please describe what you need help with regarding this file.";
            
            this.addMessage(response, 'assistant');
        },

        playNotificationSound: function() {
            if (!this.soundEnabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                // Sound not supported, ignore
            }
        },

        syncWithDashboard: function() {
            if (window.chatbotManager?.isInitialized) {
                const manager = window.chatbotManager;
                this.config.enabled = manager.settings.enabled;
                this.config.allowFileUpload = manager.settings.allowFileUpload;
                this.currentAgent = manager.getActiveAgent();
                console.log('✅ Widget synced with dashboard');
            }
        }
    };
})();

// Auto-initialize if not already done
document.addEventListener('DOMContentLoaded', function() {
    if (!window.FoodisChatbot.widget) {
        window.FoodisChatbot.init();
    }
});
