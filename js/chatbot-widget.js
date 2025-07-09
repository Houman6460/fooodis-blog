
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

        loadSavedSettings: function() {
            try {
                // Load from localStorage where chatbot settings are saved
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                console.log('Widget loadSavedSettings - raw savedSettings:', savedSettings);
                
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    console.log('Widget loadSavedSettings - parsed settings:', settings);

                    // Store available agents for later handoff (don't select immediately)
                    if (settings.enableMultipleAgents && settings.agents && settings.agents.length > 0) {
                        this.availableAgents = settings.agents.filter(agent => agent.enabled !== false);
                        console.log('Available agents loaded:', this.availableAgents.length);
                    }

                    // Use general settings for initial display (not agent-specific)
                    this.config.avatar = settings.avatar || this.getDefaultAvatar();
                    
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

        getDefaultAvatar: function() {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlOGYyNGMiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgOCAxNSA5IDE1SDE1QzE2IDE1IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iIzI2MjgyZiIvPgo8L3N2Zz4KPC9zdmc+';
        },

        loadLanguagePreference: function() {
            // Load language preference from localStorage or detect from browser
            const savedLang = localStorage.getItem('fooodis-language');
            if (savedLang) {
                this.currentLanguage = savedLang;
                console.log('Loaded saved language:', this.currentLanguage);
            } else {
                // Detect from browser language
                const browserLang = navigator.language || navigator.userLanguage;
                this.currentLanguage = browserLang.startsWith('sv') ? 'sv' : 'en';
                console.log('Detected browser language:', this.currentLanguage);
            }
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

        updateAvatar: function(avatarUrl) {
            this.config.avatar = avatarUrl;

            // Update all avatar images in the widget
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .message-avatar img');
            avatarImages.forEach(img => {
                img.src = avatarUrl;
            });

            console.log('Avatar updated in chatbot widget:', avatarUrl);
        },

        updateFileUploadVisibility: function() {
            const uploadButton = document.getElementById('chatbot-upload');
            if (uploadButton) {
                uploadButton.style.display = this.config.allowFileUpload ? 'flex' : 'none';
            }
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

        injectStyles: function() {
            if (document.getElementById('fooodis-chatbot-styles')) {
                return; // Styles already injected
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
                
                .chatbot-avatar {
                    width: 40px !important;
                    height: 40px !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                }
                
                .chatbot-avatar img {
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
                
                .chatbot-avatar-small {
                    width: 30px !important;
                    height: 30px !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                }
                
                .chatbot-avatar-small img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
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
                
                .message-avatar {
                    width: 30px !important;
                    height: 30px !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                    flex-shrink: 0 !important;
                }
                
                .message-avatar img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
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
                }
                
                .message.user .message-content {
                    background: #e8f24c !important;
                    color: #26282f !important;
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
                
                .bilingual-welcome {
                    line-height: 1.6 !important;
                }
                
                .welcome-en, .welcome-sv {
                    margin-bottom: 8px !important;
                }
                
                .welcome-en:last-child, .welcome-sv:last-child {
                    margin-bottom: 0 !important;
                }
                
                /* Mobile responsive */
                @media (max-width: 768px) {
                    .chatbot-window {
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
        },

        toggleChat: function() {
            const chatWindow = document.getElementById('chatbot-window');
            const notificationBadge = document.getElementById('notification-badge');
            
            if (chatWindow) {
                if (this.isOpen) {
                    chatWindow.classList.remove('open');
                    this.isOpen = false;
                } else {
                    chatWindow.classList.add('open');
                    this.isOpen = true;
                    
                    // Hide notification badge when chat is opened
                    if (notificationBadge) {
                        notificationBadge.style.display = 'none';
                    }
                    
                    // Focus on input
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
        },

        sendMessage: function() {
            const messageInput = document.getElementById('chatbot-message-input');
            if (!messageInput) return;

            const message = messageInput.value.trim();
            if (!message) return;

            // Add user message to chat
            this.addMessage(message, 'user');
            messageInput.value = '';

            // Show typing indicator
            this.showTyping();

            // Process message
            this.processMessage(message);
        },

        addMessage: function(content, sender) {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}`;

            const avatar = sender === 'user' ? 
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiM2NjY2NjYiLz4KPHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMUM5LjggMSAxMC41IDEuNyAxMC41IDIuNUMxMC41IDMuMyA5LjggNCA5IDRDOC4yIDQgNy41IDMuMyA3LjUgMi41QzcuNSAxLjcgOC4yIDEgOSAxWk0xNS41IDE0LjJWMTVIMi41VjE0LjJDMi41IDEyLjIgNiAxMS4yIDYuOCAxMS4ySDExLjJDMTIgMTEuMiAxNS41IDEyLjIgMTUuNSAxNC4yWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+' :
                (this.currentAgent?.avatar || this.getDefaultAvatar());

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

        processMessage: async function(message) {
            try {
                // Generate conversation ID if not exists
                if (!this.conversationId) {
                    this.conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }

                // Try to use chatbot manager if available
                if (window.chatbotManager && typeof window.chatbotManager.generateAgentResponse === 'function') {
                    const response = await window.chatbotManager.generateAgentResponse({
                        message: message,
                        conversationId: this.conversationId,
                        language: this.currentLanguage || 'en',
                        agent: this.currentAgent,
                        userName: this.userName,
                        userRegistered: this.userRegistered,
                        recentMessages: this.messages.slice(-5)
                    });

                    this.hideTyping();
                    if (response.success) {
                        this.addMessage(response.message, 'assistant');
                    } else {
                        this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                    }
                } else {
                    // Fallback to API call
                    const response = await fetch(this.config.apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            conversationId: this.conversationId,
                            language: this.currentLanguage || 'en'
                        })
                    });

                    this.hideTyping();

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            this.addMessage(data.message, 'assistant');
                        } else {
                            this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
                        }
                    } else {
                        this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'assistant');
                    }
                }
            } catch (error) {
                console.error('Error processing message:', error);
                this.hideTyping();
                this.addMessage('Sorry, I\'m having trouble processing your request. Please try again.', 'assistant');
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
        }
    };
})();
