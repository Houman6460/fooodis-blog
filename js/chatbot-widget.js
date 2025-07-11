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
        conversationPhase: 'welcome',
        userName: null,
        restaurantName: null,
        handoffComplete: false,
        currentLanguage: null,
        languageDetected: false,

        init: function(options = {}) {
            console.log('Initializing Fooodis Chatbot Widget...');

            this.config = { ...this.config, ...options };

            if (!this.config.apiEndpoint) {
                this.config.apiEndpoint = window.location.origin + '/api/chatbot';
            }

            this.conversationPhase = 'welcome';
            this.userName = localStorage.getItem('fooodis-user-name') || null;
            this.restaurantName = localStorage.getItem('fooodis-restaurant-name') || null;
            this.handoffComplete = false;

            this.loadSavedSettings();
            this.loadLanguagePreference();
            this.checkChatbotEnabled();
            this.setupDashboardCommunication();
            this.createWidget();
            this.attachEventListeners();
            this.setupAvatarUpdateListener();

            window.dispatchEvent(new CustomEvent('chatbotWidgetReady'));

            console.log('Fooodis Chatbot Widget initialized successfully');
        },

        getInitialWelcomeMessage: function() {
            console.log('Getting initial welcome message...');

            this.loadLanguagePreference();

            if (this.chatbotSettings && this.chatbotSettings.welcomeMessage) {
                console.log('Using configured welcome message:', this.chatbotSettings.welcomeMessage);
                return this.chatbotSettings.welcomeMessage;
            }

            const fallbackMessage = `
                <div class="bilingual-welcome">
                    <div class="welcome-en">🇬🇧 <strong>English:</strong> Hello! I'm your Fooodis assistant. How can I help you today?</div>
                    <div class="welcome-sv">🇸🇪 <strong>Svenska:</strong> Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?</div>
                </div>
            `;

            console.log('Using fallback bilingual welcome message');
            return fallbackMessage;
        },

        loadSavedSettings: function() {
            try {
                console.log('Widget: Starting loadSavedSettings...');

                let settings = null;
                const storageKeys = [
                    'fooodis-chatbot-settings', 
                    'chatbot-settings-backup',
                    'chatbot-widget-settings',
                    'chatbot-avatar-settings'
                ];

                for (const key of storageKeys) {
                    const savedSettings = localStorage.getItem(key);
                    if (savedSettings) {
                        try {
                            settings = JSON.parse(savedSettings);
                            console.log('Widget loaded settings from:', key);

                            if (settings && (settings.avatar || settings.chatbotName)) {
                                break;
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse settings from', key, parseError);
                            continue;
                        }
                    }
                }

                if (!settings) {
                    console.log('No localStorage settings, attempting to load from config file...');
                    this.loadFromConfigFile();
                    return;
                }

                if (settings) {
                    this.chatbotSettings = settings;

                    let avatarUrl = this.getDefaultAvatar();
                    if (settings.avatar && settings.avatar.trim() !== '' && this.isValidAvatarUrl(settings.avatar)) {
                        avatarUrl = this.getAbsoluteAvatarUrl(settings.avatar);
                        console.log('Using uploaded avatar from settings');
                    } else {
                        console.log('Using default avatar');
                    }

                    this.config.avatar = avatarUrl;
                    this.config.enabled = settings.enabled !== false;
                    this.config.allowFileUpload = settings.allowFileUpload !== false;

                    if (settings.agents && settings.agents.length > 0) {
                        this.availableAgents = settings.agents.filter(agent => 
                            agent.active !== false
                        );
                        console.log('Widget loaded', this.availableAgents.length, 'active agents from settings');

                        this.availableAgents.forEach(agent => {
                            if (!agent.avatar || agent.avatar === this.getDefaultAvatar()) {
                                agent.avatar = avatarUrl;
                            } else {
                                agent.avatar = this.getAbsoluteAvatarUrl(agent.avatar);
                            }
                        });
                    }

                    if (settings.assistants && settings.assistants.length > 0) {
                        const legacyAgents = settings.assistants.filter(agent => 
                            agent.status === 'active' || agent.enabled !== false
                        );
                        if (legacyAgents.length > 0 && (!this.availableAgents || this.availableAgents.length === 0)) {
                            this.availableAgents = legacyAgents;
                            console.log('Widget loaded', this.availableAgents.length, 'active legacy assistants');
                        }
                    }

                    this.currentAgent = {
                        name: settings.chatbotName || 'Fooodis Assistant',
                        avatar: avatarUrl,
                        personality: 'General assistant',
                        isGeneral: true
                    };

                    console.log('Starting with General Settings agent:', this.currentAgent.name);
                } else {
                    console.warn('No settings found in any storage location');
                    this.setDefaultAgent();
                }
            } catch (error) {
                console.error('Error loading saved settings:', error);
                this.setDefaultAgent();
            }
        },

        isValidAvatarUrl: function(url) {
            if (!url || typeof url !== 'string' || url.trim() === '') return false;

            return url.startsWith('data:image/') || 
                   url.startsWith('http://') || 
                   url.startsWith('https://') || 
                   url.startsWith('/') || 
                   url.startsWith('./') ||
                   url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
        },

        getAbsoluteAvatarUrl: function(avatarUrl) {
            if (!avatarUrl) return this.getDefaultAvatar();

            if (avatarUrl.startsWith('data:') || 
                avatarUrl.startsWith('http://') || 
                avatarUrl.startsWith('https://')) {
                return avatarUrl;
            }

            let baseUrl = window.location.origin;

            if (window.parent && window.parent !== window) {
                try {
                    baseUrl = window.parent.location.origin;
                } catch (e) {
                    baseUrl = window.location.origin;
                }
            }

            if (avatarUrl.startsWith('./')) {
                return baseUrl + '/' + avatarUrl.substring(2);
            } else if (avatarUrl.startsWith('/')) {
                return baseUrl + avatarUrl;
            } else if (avatarUrl.startsWith('images/')) {
                return baseUrl + '/' + avatarUrl;
            } else {
                return baseUrl + '/images/avatars/' + avatarUrl;
            }
        },

        getDefaultAvatar: function() {
            return 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="20" fill="#e8f24c"/>
                    <circle cx="20" cy="15" r="6" fill="#26282f"/>
                    <path d="M8 35c0-6 5-10 12-10s12 4 12 10z" fill="#26282f"/>
                </svg>
            `);
        },

        loadLanguagePreference: function() {
            const savedLang = localStorage.getItem('fooodis-language');
            if (savedLang) {
                this.currentLanguage = savedLang;
                console.log('Loaded saved language:', this.currentLanguage);
            } else {
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

        setupDashboardCommunication: function() {
            if (window.chatbotEvents) {
                window.chatbotEvents.addEventListener('settingsChanged', (e) => {
                    this.handleDashboardSettingsChange(e.detail);
                });

                window.chatbotEvents.addEventListener('assistantUpdate', (e) => {
                    this.handleAssistantUpdate(e.detail);
                });
            }

            window.addEventListener('chatbotManagerReady', () => {
                console.log('Dashboard manager ready, syncing settings...');
                this.syncWithDashboard();
            });
        },

        handleDashboardSettingsChange: function(data) {
            console.log('Widget received settings change:', data);

            if (data.settings) {
                this.config.enabled = data.settings.enabled;
                this.config.primaryColor = data.settings.widgetColor;
                this.config.allowFileUpload = data.settings.allowFileUpload;

                if (data.settings.avatar) {
                    this.updateAvatar(data.settings.avatar);
                }

                if (this.widget) {
                    this.widget.style.display = this.config.enabled ? 'block' : 'none';
                }

                this.updateFileUploadVisibility();
            }
        },

        handleAssistantUpdate: function(data) {
            console.log('Widget received assistant update:', data);

            if (data.assistant && this.widget) {
                this.currentAgent = {
                    id: data.assistant.id,
                    name: data.assistant.name,
                    avatar: data.assistant.avatar || this.config.avatar,
                    personality: data.assistant.description
                };

                this.updateAgentHeader();
            }
        },

        syncWithDashboard: function() {
            if (window.chatbotManager && window.chatbotManager.isInitialized) {
                const manager = window.chatbotManager;

                this.config.enabled = manager.settings.enabled;
                this.config.primaryColor = manager.settings.widgetColor;
                this.config.allowFileUpload = manager.settings.allowFileUpload;

                if (manager.settings.avatar) {
                    this.updateAvatar(manager.settings.avatar);
                }

                this.currentAgent = manager.getActiveAgent();

                console.log('Widget synced with dashboard');
            }
        },

        updateAgentHeader: function() {
            if (!this.widget || !this.currentAgent) return;

            const headerText = this.widget.querySelector('.header-text h4');
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .chatbot-avatar-header img, .message-avatar img');

            if (headerText) {
                headerText.textContent = this.currentAgent.name;
            }

            let avatarUrl = this.config.avatar || this.getDefaultAvatar();
            console.log('Updating avatar with URL:', avatarUrl.substring(0, 50) + '...');

            avatarImages.forEach((img, index) => {
                this.setAvatarImage(img, avatarUrl, index + 1);
            });

            console.log('Updated agent header with avatar');
        },

        setAvatarImage: function(imgElement, avatarUrl, index) {
            if (!imgElement) return;

            console.log(`Setting avatar ${index} with URL:`, avatarUrl?.substring(0, 50) + '...');

            imgElement.style.display = 'block';
            imgElement.style.objectFit = 'cover';
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.borderRadius = '50%';
            imgElement.style.backgroundColor = '#e8f24c';
            imgElement.alt = (this.currentAgent?.name || 'Assistant') + ' Avatar';

            imgElement.onerror = null;
            imgElement.onload = null;

            if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim() === '') {
                console.warn(`Avatar ${index} URL is invalid, using default`);
                imgElement.src = this.getDefaultAvatar();
                return;
            }

            const setFallback = () => {
                console.warn(`Avatar ${index} failed to load, trying fallbacks...`);

                const fallbacks = [
                    this.config.avatar,
                    this.chatbotSettings?.avatar,
                    localStorage.getItem('chatbot-widget-avatar'),
                    this.getDefaultAvatar()
                ];

                for (const fallback of fallbacks) {
                    if (fallback && fallback !== avatarUrl && this.isValidAvatarUrl(fallback)) {
                        console.log(`Trying fallback avatar ${index}:`, fallback.substring(0, 50) + '...');
                        imgElement.src = this.getAbsoluteAvatarUrl(fallback);
                        return;
                    }
                }

                imgElement.src = this.getDefaultAvatar();
                imgElement.style.display = 'block';
            };

            imgElement.onerror = setFallback;

            imgElement.onload = () => {
                console.log(`Avatar ${index} loaded successfully`);
                imgElement.style.display = 'block';
            };

            const finalAvatarUrl = this.getAbsoluteAvatarUrl(avatarUrl);
            console.log(`Final avatar URL: ${finalAvatarUrl.substring(0, 50)}...`);

            imgElement.src = finalAvatarUrl;
        },

        setupAvatarUpdateListener: function() {
            window.addEventListener('storage', (e) => {
                if (e.key === 'fooodis-chatbot-settings') {
                    try {
                        const settings = JSON.parse(e.newValue);
                        if (settings && settings.avatar && settings.avatar !== this.config.avatar) {
                            this.updateAvatar(settings.avatar);
                        }
                        if (settings && typeof settings.allowFileUpload !== 'undefined') {
                            this.config.allowFileUpload = settings.allowFileUpload;
                            this.updateFileUploadVisibility();
                        }
                    } catch (error) {
                        console.error('Error handling settings update:', error);
                    }
                }
            });

            window.updateChatbotWidgetAvatar = (avatarUrl) => {
                this.updateAvatar(avatarUrl);
            };
        },

        setupAllAvatars: function() {
            if (!this.widget) return;

            const avatarUrl = this.config.avatar || this.getDefaultAvatar();
            const avatarImages = this.widget.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-small img, .chatbot-avatar-header img, .message-avatar img');

            console.log(`Setting up ${avatarImages.length} avatar images`);

            avatarImages.forEach((img, index) => {
                this.setAvatarImage(img, avatarUrl, index + 1);
            });
        },

        updateAvatar: function(avatarUrl) {
            this.config.avatar = avatarUrl;

            if (this.currentAgent) {
                this.currentAgent.avatar = avatarUrl;
            }

            try {
                const avatarData = {
                    avatar: avatarUrl,
                    timestamp: Date.now(),
                    page: window.location.pathname
                };

                localStorage.setItem('chatbot-avatar-settings', JSON.stringify(avatarData));
                localStorage.setItem('chatbot-widget-avatar', avatarUrl);

                const mainSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (mainSettings) {
                    try {
                        const settings = JSON.parse(mainSettings);
                        settings.avatar = avatarUrl;
                        localStorage.setItem('fooodis-chatbot-settings', JSON.stringify(settings));
                    } catch (e) {
                        console.warn('Could not update main settings with avatar');
                    }
                }
            } catch (error) {
                console.error('Error storing avatar settings:', error);
            }

            if (this.widget) {
                this.setupAllAvatars();
            }

            console.log('Avatar updated and persisted in chatbot widget');
        },

        updateFileUploadVisibility: function() {
            const uploadButton = document.getElementById('chatbot-upload');
            if (uploadButton) {
                uploadButton.style.display = this.config.allowFileUpload ? 'flex' : 'none';
            }
        },

        playSound: function(type) {
            // 🔧 FIX: Add sound feedback for chat interactions
            if (!this.config.soundEnabled) return;

            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                let frequency = 440; // Default frequency

                switch(type) {
                    case 'send':
                        frequency = 800; // Higher pitch for send
                        break;
                    case 'receive':
                        frequency = 600; // Medium pitch for receive
                        break;
                    case 'typing':
                        frequency = 400; // Lower pitch for typing
                        break;
                }

                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gain.gain.setValueAtTime(0.1, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                // Silently fail if audio context is not supported
                console.log('Audio feedback not available');
            }
        },

        createWidget: function() {
            const existingWidget = document.getElementById('fooodis-chatbot');
            if (existingWidget) {
                existingWidget.remove();
            }

            const agentName = this.currentAgent ? this.currentAgent.name : 'Fooodis Assistant';
            let agentAvatar = this.config.avatar || this.getDefaultAvatar();

            console.log('Creating widget with avatar:', agentAvatar.substring(0, 50) + '...');

            const widget = document.createElement('div');
            widget.id = 'fooodis-chatbot';
            widget.className = `chatbot-widget ${this.config.position}`;

            widget.innerHTML = `
                <div class="chatbot-container">
                    <div class="chatbot-button" id="chatbot-button">
                        <div class="chatbot-avatar">
                            <img src="${agentAvatar}" alt="${agentName} Avatar" style="display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;" />
                        </div>
                        <div class="notification-badge" id="notification-badge">1</div>
                    </div>

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
                                <div class="chatbot-avatar-header">
                                    <img src="${agentAvatar}" alt="${agentName} Avatar" style="display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;" />
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
                                    <img src="${agentAvatar}" alt="${agentName} Avatar" style="display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;" />
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

            this.injectStyles();

            if (!this.config.enabled) {
                widget.style.display = 'none';
            } else {
                widget.style.display = 'block';
            }

            document.body.appendChild(widget);
            this.widget = widget;

            setTimeout(() => {
                this.setupAllAvatars();
                console.log('Avatar setup completed after widget creation');
            }, 100);
        },

        injectStyles: function() {
            if (document.getElementById('fooodis-chatbot-styles')) {
                return;
            }

            const styles = document.createElement('style');
            styles.id = 'fooodis-chatbot-styles';
            styles.textContent = `
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
                    position: relative !important;
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

                .chatbot-avatar-header {
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                    border: 2px solid #e8f24c !important;
                    flex-shrink: 0 !important;
                }

                .chatbot-avatar-header img {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    display: block !important;
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
                    color: #333333 !important;
                }

                .message.user .message-content {
                    background: #e8f24c !important;
                    color: #26282f !important;
                }

                .message.assistant .message-content {
                    background: #f8f9fa !important;
                    color: #333333 !important;
                    border: 1px solid #e9ecef !important;
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

                @media (max-width: 768px) {
                    .chatbot-window {
                        width: 320px !important;
                        height: 450px !important;
                        bottom: 80px !important;
                        right: 10px !important;
                    }
                }

                .chatbot-quick-replies {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                    margin-top: 10px !important;
                }

                .chatbot-quick-reply {
                    background: #e0e0e0 !important;
                    border: none !important;
                    color: #333 !important;
                    cursor: pointer !important;
                    padding: 8px 12px !important;
                    border-radius: 20px !important;
                    font-size: 14px !important;
                    transition: background-color 0.2s !important;
                }

                .chatbot-quick-reply:hover {
                    background: #d0d0d0 !important;
                }
            `;

            document.head.appendChild(styles);
        },

        attachEventListeners: function() {
            const chatButton = document.getElementById('chatbot-button');
            const closeButton = document.getElementById('chatbot-close');
            const sendButton = document.getElementById('chatbot-send');
            const messageInput = document.getElementById('chatbot-message-input');

            if (chatButton) {
                chatButton.addEventListener('click', () => this.toggleChat());
            }

            if (closeButton) {
                closeButton.addEventListener('click', () => this.closeChat());
            }

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

            this.updateFileUploadVisibility();

            document.addEventListener('click', (event) => {
                if (event.target.classList.contains('chatbot-quick-reply')) {
                    const reply = event.target.dataset.reply;
                    this.handleQuickReply(reply);
                }
            });
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
        },

        sendMessage: function() {
            const messageInput = document.getElementById('chatbot-message-input');
            if (!messageInput) return;

            const message = messageInput.value.trim();
            if (!message) return;

            this.addMessage(message, 'user');
            messageInput.value = '';

            this.showTyping();

            this.playSound('send'); // Play sound when sending a message

            this.processMessage(message);
        },

        addMessage: function(content, sender, quickReplies = null) {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}`;

            let avatarHtml = '';

            if (sender === 'assistant' || sender === 'system') {
                const avatar = this.config.avatar || this.getDefaultAvatar();

                const avatarImg = document.createElement('img');
                avatarImg.alt = sender + ' Avatar';
                avatarImg.style.width = '100%';
                avatarImg.style.height = '100%';
                avatarImg.style.objectFit = 'cover';
                avatarImg.style.display = 'block';
                avatarImg.style.backgroundColor = '#e8f24c';
                avatarImg.style.borderRadius = '50%';

                avatarImg.onerror = function() {
                    console.warn('Message avatar failed to load:', avatar);
                    avatarImg.src = this.getDefaultAvatar();
                    avatarImg.style.display = 'block';
                }.bind(this);

                avatarImg.onload = function() {
                    avatarImg.style.display = 'block';
                };

                avatarImg.src = avatar;

                avatarHtml = `
                    <div class="message-avatar">
                        ${avatarImg.outerHTML}
                    </div>
                `;

                if (sender === 'assistant') {
                    this.playSound('receive'); // Play sound when receiving a message
                }
            }

            let quickRepliesHtml = '';

            // 🔧 FIX: Only show quick replies if explicitly provided and not using AI Message Nodes
            if (quickReplies && Array.isArray(quickReplies) && quickReplies.length > 0) {
                // Don't show default buttons when AI Message Nodes are active
                if (!this.shouldUseNodeFlow() || quickReplies[0] !== 'Menu') {
                    quickRepliesHtml = this.generateQuickReplyButtons(quickReplies);
                }
            }

            messageElement.innerHTML = `
                ${avatarHtml}
                <div class="message-content" style="color: #333333 !important; background: ${sender === 'user' ? '#e8f24c' : '#f8f9fa'} !important;">${content}</div>
                ${quickRepliesHtml}
            `;

            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

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

                const agentName = this.currentAgent?.name || 'Assistant';
                const typingText = typingIndicator.querySelector('span');
                if (typingText) {
                    if (this.currentLanguage === 'sv') {
                        typingText.textContent = `${agentName} skriver...`;
                    } else {
                        typingText.textContent = `${agentName} is typing...`;
                    }
                }
                this.playSound('typing'); // Play sound when typing
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
                if (!this.conversationId) {
                    this.conversationId = 'conv_' + Date.now() + '_'+ Math.random().toString(36).substr(2, 9);
                }

                console.log('Processing message:', message.substring(0, 50) + '...');

                if (!this.languageDetected) {
                    this.detectAndSetLanguage(message);
                    this.languageDetected = true;
                }

                const isFirstMessage = this.messages.filter(msg => msg.sender === 'user').length === 1;

                // 🔧 FIX: Always prioritize Node Flow Builder AI Message Nodes
                if (window.nodeFlowBuilder && this.shouldUseNodeFlow(message)) {
                    console.log('🤖 Using Node Flow Builder AI Message Node for response');
                    const response = await this.processWithNodeFlow(message);
                    this.hideTyping();
                    if (response) {
                        // Don't add default buttons when AI generates response
                        this.addMessage(response, 'assistant', null);
                        return;
                    }
                }

                if (isFirstMessage && this.conversationPhase === 'welcome') {
                    console.log('First message detected, performing agent handoff...');
                    await this.performAgentHandoff();
                    return;
                }

                if (window.chatbotManager && typeof window.chatbotManager.generateAgentResponse === 'function') {
                    console.log('Using chatbot manager for response');
                    const response = await window.chatbotManager.generateAgentResponse({
                        message: message,
                        conversationId: this.conversationId,
                        language: this.currentLanguage || 'en',
                        agent: this.currentAgent,
                        userName: this.userName,
                        userRegistered: this.userRegistered,
                        recentMessages: this.messages.slice(-5),
                        assistantId: this.currentAgent?.assignedAssistantId
                    });

                    this.hideTyping();
                    if (response && response.success) {
                        this.addMessage(response.message, 'assistant');
                        return;
                    } else {
                        console.warn('Manager response failed, trying API fallback');
                    }
                }

                try {
                    console.log('Trying API endpoint:', this.config.apiEndpoint);
                    const response = await fetch(this.config.apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            conversationId: this.conversationId,
                            language: this.currentLanguage || 'en',
                            agent: this.currentAgent,
                            assistantId: this.currentAgent?.assignedAssistantId
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        this.hideTyping();
                        if (data.success && data.message) {
                            this.addMessage(data.message, 'assistant');
                            return;
                        }
                    }
                } catch (apiError) {
                    console.warn('API endpoint failed:', apiError);
                }

                setTimeout(() => {
                    this.hideTyping();
                    const fallbackResponse = this.generateIntelligentFallback(message);
                    this.addMessage(fallbackResponse, 'assistant');
                }, 1000 + Math.random() * 2000);

            } catch (error) {
                console.error('Error processing message:', error);
                setTimeout(() => {
                    this.hideTyping();
                    const errorResponse = this.currentLanguage === 'sv' 
                        ? 'Jag kan inte svara just nu på grund av tekniska problem. Vänligen försök igen om ett ögonblick.'
                        : 'I\'m unable to respond right now due to technical issues. Please try again in a moment.';
                    this.addMessage(errorResponse, 'assistant');
                }, 500);
            }
        },

        detectAndSetLanguage: function(message) {
            const swedishWords = ['hej', 'hallo', 'tjena', 'morn', 'god', 'dag', 'kväll', 'morgon', 'vad', 'hur', 'kan', 'jag', 'du', 'är', 'det', 'och', 'eller', 'tack', 'bra', 'här', 'där', 'när', 'vem', 'vilken', 'svenska', 'sverige'];
            const englishWords = ['hello', 'hi', 'hey', 'good', 'morning', 'evening', 'what', 'how', 'can', 'you', 'are', 'is', 'and', 'or', 'thanks', 'thank', 'here', 'there', 'when', 'who', 'which', 'english'];

            const messageLower = message.toLowerCase();
            let swedishScore = 0;
            let englishScore = 0;

            swedishWords.forEach(word => {
                if (messageLower.includes(word)) {
                    swedishScore++;
                }
            });

            englishWords.forEach(word => {
                if (messageLower.includes(word)) {
                    englishScore++;
                }
            });

            if (swedishScore > englishScore) {
                this.currentLanguage = 'sv';
                console.log('Swedish language detected');
            } else {
                this.currentLanguage = 'en';
                console.log('English language detected');
            }

            localStorage.setItem('fooodis-language', this.currentLanguage);
        },

        performAgentHandoff: async function() {
            console.log('Starting agent handoff process...');

            const handoffMessage = this.currentLanguage === 'sv'
                ? "Ett ögonblick, vi kopplar dig till en av våra supportagenter..."
                : "Hold on, we're connecting you to one of our support agents...";

            this.hideTyping();
            this.addMessage(handoffMessage, 'assistant');

            await new Promise(resolve => setTimeout(resolve, 1500));

            this.selectRandomAgent();

            this.showTyping();

            setTimeout(() => {
                this.hideTyping();
                const introMessage = this.getAgentIntroduction();
                this.addMessage(introMessage, 'assistant');

                this.conversationPhase = 'agent';
            }, 2000 + Math.random() * 1000);
        },

        selectRandomAgent: function() {
            console.log('Selecting random agent from available agents...');

            if (this.availableAgents && this.availableAgents.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.availableAgents.length);
                const selectedAgent = this.availableAgents[randomIndex];

                const agentAvatar = selectedAgent.avatar && selectedAgent.avatar !== this.getDefaultAvatar() 
                    ? selectedAgent.avatar
                    : this.config.avatar || this.getDefaultAvatar();

                const agentData = {
                    id: selectedAgent.id,
                    name: selectedAgent.name || selectedAgent.realName,
                    avatar: agentAvatar,
                    personality: selectedAgent.personality || selectedAgent.description,
                    assignedAssistantId: selectedAgent.assistantId || selectedAgent.assignedAssistantId,
                    department: selectedAgent.department
                };

                console.log('Selected agent:', agentData.name, 'with avatar:', agentAvatar.substring(0, 50) + '...');

                this.switchAgent(agentData);
            } else {
                console.log('No available agents, using config fallback');
                this.loadAgentsFromConfig();
            }
        },

        loadAgentsFromConfig: function() {
            if (window.chatbotManager && window.chatbotManager.assistants) {
                const activeAssistants = window.chatbotManager.assistants.filter(a => a.status === 'active');
                if (activeAssistants.length > 0) {
                    const randomIndex = Math.floor(Math.random() * activeAssistants.length);
                    const selectedAssistant = activeAssistants[randomIndex];

                    this.currentAgent = {
                        id: selectedAssistant.id,
                        name: selectedAssistant.name,
                        avatar: this.config.avatar || this.getDefaultAvatar(),
                        personality: selectedAssistant.description || 'Professional assistant',
                        assignedAssistantId: selectedAssistant.assistantId
                    };

                    console.log('Selected agent from config:', this.currentAgent.name);
                } else {
                    this.setDefaultAgent();
                }
            } else {
                this.setDefaultAgent();
            }
        },

        getAgentIntroduction: function() {
            const agentName = this.currentAgent?.name || 'Support Agent';
            const userGreeting = this.userName ? ` ${this.userName}` : '';
            const restaurantGreeting = this.restaurantName ? ` from ${this.restaurantName}` : '';

            if (this.currentLanguage === 'sv') {
                return `Hej${userGreeting}! Jag heter ${agentName} och jag kommer att hjälpa dig idag. Vad kan jag assistera dig med?`;
            } else {
                return `Hello${userGreeting}${restaurantGreeting}! I'm ${agentName} and I'll be helping you today. What can I assist you with?`;
            }
        },

        shouldUseNodeFlow: function(message) {
            // 🔧 FIX: Always prioritize AI Message Nodes when available
            if (!window.nodeFlowBuilder || !window.nodeFlowBuilder.nodes) {
                console.log('⚠️ NodeFlowBuilder not available or no nodes found');
                return false;
            }

            const aiNodes = window.nodeFlowBuilder.nodes.filter(node => 
                node.type === 'message' && node.data.aiMode && node.data.selectedAssistant
            );

            console.log(`🔍 Found ${aiNodes.length} AI-enabled Message Nodes`);
            return aiNodes.length > 0;
        },

        processWithNodeFlow: async function(message) {
            try {
                if (!window.nodeFlowBuilder) {
                    console.log('⚠️ NodeFlowBuilder not available');
                    return null;
                }

                // Find AI-enabled message nodes
                const aiNodes = window.nodeFlowBuilder.nodes.filter(node => 
                    node.type === 'message' && node.data.aiMode && node.data.selectedAssistant
                );

                if (aiNodes.length === 0) {
                    console.log('⚠️ No AI-enabled Message Nodes found');
                    return null;
                }

                // Use the first AI node for simplicity (could be enhanced with intent matching)
                const aiNode = aiNodes[0];
                console.log(`🤖 Using AI Message Node: ${aiNode.data.title} with assistant: ${aiNode.data.selectedAssistant}`);

                // Get the assistant from chatbot manager
                if (window.chatbotManager && window.chatbotManager.assistants) {
                    const assistant = window.chatbotManager.assistants.find(a => 
                        a.id === aiNode.data.selectedAssistant
                    );

                    if (assistant && assistant.assistantId) {
                        console.log(`🎯 Found assistant: ${assistant.name} (${assistant.assistantId})`);

                        const response = await window.chatbotManager.generateAgentResponse({
                            message: message,
                            conversationId: this.conversationId,
                            language: this.currentLanguage || 'en',
                            agent: this.currentAgent,
                            userName: this.userName,
                            userRegistered: this.userRegistered,
                            recentMessages: this.messages.slice(-5),
                            assistantId: assistant.assistantId,
                            customPrompt: aiNode.data.aiPrompt,
                            useCustomPrompt: true // Flag to indicate this is from Node Flow
                        });

                        if (response && response.success) {
                            console.log('✅ AI Message Node generated response successfully');
                            return response.message;
                        } else {
                            console.error('❌ AI Message Node failed to generate response:', response);
                        }
                    } else {
                        console.error('❌ Assistant not found or missing assistantId:', aiNode.data.selectedAssistant);
                    }
                } else {
                    console.error('❌ ChatbotManager not available or no assistants');
                }

                return null;
            } catch (error) {
                console.error('❌ Error processing with Node Flow:', error);
                return null;
            }
        },

        generateIntelligentFallback: function(message) {
            const messageLower = message.toLowerCase();

            // 🔧 FIX: Don't provide specific responses that might trigger default buttons
            // when AI Message Nodes should be handling the conversation
            if (this.shouldUseNodeFlow(message)) {
                return this.currentLanguage === 'sv'
                    ? "Jag förstår din förfrågan och arbetar på ett svar. Kan du vänta ett ögonblick?"
                    : "I understand your request and I'm working on a response. Please wait a moment.";
            }

            if (messageLower.includes('order') || messageLower.includes('delivery') || messageLower.includes('beställ') || messageLower.includes('leverans')) {
                return this.currentLanguage === 'sv'
                    ? "Jag kan hjälpa dig med beställningar och leveranser. Vad vill du veta?"
                    : "I can help you with orders and deliveries. What would you like to know?";
            } else if (messageLower.includes('menu') || messageLower.includes('food') || messageLower.includes('meny') || messageLower.includes('mat')) {
                return this.currentLanguage === 'sv'
                    ? "Jag kan visa dig vår meny. Vilken typ av mat är du intresserad av?"
                    : "I can show you our menu. What kind of food are you interested in?";
            } else if (messageLower.includes('hours') || messageLower.includes('open') || messageLower.includes('öppet') || messageLower.includes('öppettider')) {
                return this.currentLanguage === 'sv'
                    ? "Våra öppettider är 10:00 till 22:00 varje dag."
                    : "Our opening hours are 10:00 AM to 10:00 PM every day.";
            } else {
                return this.currentLanguage === 'sv'
                    ? "Tack för ditt meddelande. Kan du berätta mer om vad du behöver hjälp med?"
                    : "Thank you for your message. Can you tell me more about what you need help with?";
            }
        },

        handleFileUpload: function(file) {
            if (!this.config.allowFileUpload) {
                this.addMessage('File uploads are currently disabled.', 'assistant');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
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

        loadFromConfigFile: function() {
            fetch('./chatbot-config.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(config => {
                    console.log('Loaded config from file:', config);

                    this.chatbotSettings = {
                        enabled: config.enabled !== false,
                        chatbotName: config.chatbotName || 'Fooodis Assistant',
                        welcomeMessage: config.welcomeMessage || this.getInitialWelcomeMessage(),
                        avatar: config.avatar || this.getDefaultAvatar(),
                        allowFileUpload: config.allowFileUpload !== false,
                        assistants: config.assistants || [],
                        openaiApiKey: config.openaiApiKey || '',
                        defaultModel: config.defaultModel || 'gpt-4'
                    };

                    if (config.openaiApiKey) {
                        localStorage.setItem('openai-api-key', config.openaiApiKey);
                        localStorage.setItem('OPENAI_API_KEY', config.openaiApiKey);
                    }

                    if (this.chatbotSettings.assistants && this.chatbotSettings.assistants.length > 0) {
                        this.availableAgents = this.chatbotSettings.assistants.filter(a => 
                            a.status === 'active' || a.enabled !== false
                        );
                        console.log('Loaded', this.availableAgents.length, 'active agents from config');
                    }

                    if (this.availableAgents && this.availableAgents.length > 0) {
                        this.currentAgent = {
                            id: this.availableAgents[0].id,
                            name: this.availableAgents[0].name,
                            avatar: this.availableAgents[0].avatar || this.chatbotSettings.avatar,
                            personality: this.availableAgents[0].personality || 'Friendly assistant',
                            assignedAssistantId: this.availableAgents[0].assistantId
                        };
                    } else {
                        this.setDefaultAgent();
                    }

                    localStorage.setItem('fooodis-chatbot-settings', JSON.stringify(this.chatbotSettings));
                    localStorage.setItem('chatbot-settings-backup', JSON.stringify(this.chatbotSettings));
                    console.log('Config loaded and saved to localStorage');
                })
                .catch(error => {
                    console.error('Failed to load config file:', error);
                    this.setDefaultAgent();
                });
        },

        setDefaultAgent: function() {
            this.currentAgent = {
                id: 'general-settings',
                name: 'Fooodis Assistant',
                avatar: this.getDefaultAvatar(),
                personality: 'General assistant',
                assignedAssistantId: null,
                isGeneral: true
            };
            console.log('Set default general settings agent:', this.currentAgent.name);
        },

        switchAgent: function(agentData) {
            if (!agentData) return;

            console.log('Switching to agent:', agentData.name);

            const previousAgent = this.currentAgent;

            let newAvatarUrl = agentData.avatar;

            if (!newAvatarUrl || newAvatarUrl === this.getDefaultAvatar()) {
                newAvatarUrl = this.config.avatar || this.getDefaultAvatar();
            }

            newAvatarUrl = this.getAbsoluteAvatarUrl(newAvatarUrl);

            this.currentAgent = {
                ...agentData,
                avatar: newAvatarUrl
            };

            this.config.avatar = newAvatarUrl;

            console.log('Switching to agent avatar:', newAvatarUrl.substring(0, 50) + '...');

            this.updateAgentHeader();

            this.setupAllAvatars();

            this.addMessage(`Hello! I'm ${agentData.name} and I'll be helping you today. What can I assist you with?`, 'assistant');

            this.updateAvatar(newAvatarUrl);

            window.dispatchEvent(new CustomEvent('chatbotAgentSwitched', {
                detail: { 
                    agent: {
                        ...agentData,
                        avatar: newAvatarUrl
                    },
                    previousAgent: previousAgent 
                }
            }));

            console.log('Agent switched successfully to:', agentData.name, 'with avatar:', newAvatarUrl.substring(0, 50) + '...');
        },

        playSound: function(type) {
            try {
                // Check if sounds are enabled (can be controlled by user preference)
                const soundsEnabled = localStorage.getItem('chatbot-sounds-enabled') !== 'false';
                if (!soundsEnabled) return;

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

                // Configure oscillator
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

                // Configure gain (volume)
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                // Start and stop the sound
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);

                console.log(`🔊 Played ${type} sound (${frequency}Hz, ${duration}ms)`);

            } catch (error) {
                console.warn('Could not play sound:', error);
            }
        },

        generateQuickReplyButtons: function(buttons = null) {
            if (buttons && Array.isArray(buttons)) {
                // Use AI-generated buttons
                const buttonElements = buttons.map(button => 
                    `<button class="chatbot-quick-reply" data-reply="${button.action}" data-action="${button.action}">${button.text}</button>`
                ).join('');

                return `
                    <div class="chatbot-quick-replies">
                        ${buttonElements}
                    </div>
                `;
            }

            // Fallback to default buttons
            return `
                <div class="chatbot-quick-replies">
                    <button class="chatbot-quick-reply" data-reply="menu">Menu</button>
                    <button class="chatbot-quick-reply" data-reply="hours">Hours</button>
                    <button class="chatbot-quick-reply" data-reply="location">Location</button>
                    <button class="chatbot-quick-reply" data-reply="contact">Contact</button>
                </div>
            `;
        },

        handleQuickReply: function(reply) {
            this.addMessage(reply, 'user');
            this.showTyping();
            this.processMessage(reply);
        }
    };
})();

// Chatbot Registration Form
(function() {
    'use strict';

    const formContainerId = 'chatbot-registration-form';
    const thankYouMessageId = 'chatbot-thank-you-message';

    window.ChatbotRegistrationData = {
        init: function() {
            console.log('Initializing Chatbot Registration Data...');
        
            // Load settings from localStorage
            let settings = {};
            try {
                const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
                if (savedSettings) {
                    settings = JSON.parse(savedSettings);
                    console.log('Loaded settings from localStorage:', settings);
                } else {
                    console.warn('No settings found in localStorage, using defaults.');
                }
            } catch (error) {
                console.error('Error parsing settings from localStorage:', error);
            }
        
            // Default settings
            this.settings = {
                requireRegistration: true,
                registrationFields: ['name', 'email', 'phone', 'location'],
                ...settings
            };
        
            this.attachFormSubmission();
            console.log('Chatbot Registration Data initialized.');
        },

        attachFormSubmission: function() {
            const form = document.getElementById(formContainerId);

            if (form) {
                form.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.submitForm();
                });
                console.log('Form submission listener attached.');
            } else {
                console.warn('Registration form not found. Ensure the form is present in the DOM.');
            }
        },

        submitForm: function() {
            console.log('Submitting registration form...');

            const form = document.getElementById(formContainerId);
            if (!form) {
                console.error('Form not found.');
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const userData = {};
            formData.forEach((value, key) => {
                userData[key] = value;
            });

            // Validate form data (basic validation)
            if (!userData.name || !userData.email) {
                alert('Please fill in all required fields.');
                return;
            }

            // Save user data to local storage
            localStorage.setItem('chatbot-user-data', JSON.stringify(userData));

            // Hide the form and show thank you message
            this.hideRegistrationForm();
            this.showThankYouMessage();

            // Update chatbot state
            if (window.FoodisChatbot) {
                window.FoodisChatbot.userRegistered = true;
                window.FoodisChatbot.userInfo = userData;
                console.log('Updated chatbot user info:', userData);
            } else {
                console.warn('Chatbot widget not found.');
            }

            console.log('Registration form submitted successfully.');
        },

        showRegistrationForm: function() {
            const formContainer = document.getElementById(formContainerId);
            if (formContainer) {
                formContainer.style.display = 'block';
            } else {
                console.warn('Registration form container not found.');
            }
        },

        hideRegistrationForm: function() {
            const formContainer = document.getElementById(formContainerId);
            if (formContainer) {
                formContainer.style.display = 'none';
            }
        },

        showThankYouMessage: function() {
            const thankYouMessage = document.getElementById(thankYouMessageId);
            if (thankYouMessage) {
                thankYouMessage.style.display = 'block';
            } else {
                console.warn('Thank you message container not found.');
            }
        },

        hideThankYouMessage: function() {
            const thankYouMessage = document.getElementById(thankYouMessageId);
            if (thankYouMessage) {
                thankYouMessage.style.display = 'none';
            }
        },

        // Show registration form if needed
        showRegistrationFormIfNeeded: function() {
            // Check if user needs to register
            const hasUserData = localStorage.getItem('chatbot-user-data');
            if (!hasUserData && this.settings.requireRegistration !== false) {
                console.log('👤 User registration required, showing form...');

                // Ensure registration system is initialized
                if (window.ChatbotRegistrationData && typeof window.ChatbotRegistrationData.init === 'function') {
                    try {
                        window.ChatbotRegistrationData.init();
                        console.log('✅ Registration data system initialized');
                    } catch (error) {
                        console.error('❌ Error initializing registration data:', error);
                    }
                }

                this.showRegistrationForm();
                return true;
            }
            return false;
        }
    };
})();

// Integrate with chatbot widget
window.addEventListener('chatbotWidgetReady', () => {
    console.log('Chatbot widget ready, integrating registration form...');

    if (window.ChatbotRegistrationData && typeof window.ChatbotRegistrationData.showRegistrationFormIfNeeded === 'function') {
        // Delay to ensure the form is fully rendered
        setTimeout(() => {
            window.ChatbotRegistrationData.showRegistrationFormIfNeeded();
        }, 500);
    } else {
        console.warn('Registration data system not found or not initialized.');
    }
});