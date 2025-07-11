(function() {
    'use strict';

    console.log('🤖 Initializing Fooodis Chatbot System...');

    // Create core FoodisChatbot object
    window.FoodisChatbot = {
        version: '1.0.0',
        initialized: false,

        // Core API interface
        api: {
            sendMessage: async function(message, conversationId) {
                try {
                    const response = await fetch('/api/chatbot', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            conversationId: conversationId,
                            timestamp: new Date().toISOString()
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    return await response.json();
                } catch (error) {
                    console.error('Chatbot API Error:', error);
                    return {
                        success: false,
                        message: 'Sorry, I\'m having trouble connecting right now. Please try again.',
                        error: error.message
                    };
                }
            },

            loadConversations: async function() {
                try {
                    const response = await fetch('/api/chatbot/conversations');
                    if (response.ok) {
                        const data = await response.json();
                        return data.conversations || [];
                    }
                } catch (error) {
                    console.error('Failed to load conversations:', error);
                }
                return [];
            },

            loadUsers: async function() {
                try {
                    const response = await fetch('/api/chatbot/users');
                    if (response.ok) {
                        const data = await response.json();
                        return data.users || [];
                    }
                } catch (error) {
                    console.error('Failed to load users:', error);
                }
                return [];
            }
        },

        // Initialize the chatbot system
        init: function() {
            if (this.initialized) {
                console.log('🔄 Chatbot already initialized');
                return;
            }

            console.log('🚀 Starting chatbot initialization...');

            // Set up global error handling
            this.setupErrorHandling();

            // Initialize data persistence
            this.initializeStorage();

            // Mark as initialized
            this.initialized = true;
            console.log('✅ Fooodis Chatbot initialized successfully');

            // Trigger initialization event
            document.dispatchEvent(new CustomEvent('chatbotInitialized', {
                detail: { chatbot: this }
            }));
        },

        setupErrorHandling: function() {
            window.addEventListener('error', (event) => {
                if (event.error && event.error.message && 
                    event.error.message.includes('FoodisChatbot')) {
                    console.log('🔧 Chatbot error intercepted and handled');
                    event.preventDefault();
                }
            });
        },

        initializeStorage: function() {
            // Ensure localStorage keys exist
            const keys = [
                'fooodis-chatbot-conversations',
                'fooodis-chatbot-users', 
                'chatbot-current-user',
                'chatbot-registrations'
            ];

            keys.forEach(key => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify([]));
                }
            });
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.FoodisChatbot.init();
        });
    } else {
        window.FoodisChatbot.init();
    }

    console.log('🎯 Chatbot initialization script loaded');

})();

/**
 * 🤖 CHATBOT INITIALIZATION COORDINATOR
 * Ensures proper chatbot startup sequence
 */

(function() {
    'use strict';

    window.ChatbotInitializer = {
        initialized: false,
        retryCount: 0,
        maxRetries: 10,

        init: function() {
            if (this.initialized) {
                console.log('🤖 Chatbot already initialized');
                return;
            }

            console.log('🤖 Starting chatbot initialization...');
            this.checkAndInitialize();
        },

        checkAndInitialize: function() {
            const self = this;

            // Check if all required components are loaded
            const hasWidget = typeof window.FoodisChatbot !== 'undefined';
            const hasEnhancer = typeof window.ChatbotMessageEnhancer !== 'undefined';
            const hasIntegrationFixes = typeof window.ChatbotMessageEnhancer !== 'undefined';

            if (hasWidget) {
                try {
                    // Initialize chatbot with proper configuration
                    window.FoodisChatbot.init({
                        apiEndpoint: window.location.origin + '/api/chatbot',
                        position: 'bottom-right',
                        primaryColor: '#e8f24c',
                        language: 'en',
                        enabled: true,
                        assistants: [{
                            id: 'fooodis-assistant',
                            name: 'Fooodis Assistant',
                            assistantId: ''
                        }]
                    });

                    this.initialized = true;
                    console.log('✅ Chatbot initialized successfully');

                    // Trigger success event
                    document.dispatchEvent(new CustomEvent('chatbotInitialized'));

                } catch (error) {
                    console.error('❌ Chatbot initialization error:', error);
                    this.retryInitialization();
                }
            } else {
                console.log('⏳ Chatbot widget not ready, retrying...');
                this.retryInitialization();
            }
        },

        retryInitialization: function() {
            this.retryCount++;

            if (this.retryCount < this.maxRetries) {
                const delay = Math.min(1000 * this.retryCount, 5000);
                setTimeout(() => this.checkAndInitialize(), delay);
            } else {
                console.error('❌ Chatbot initialization failed after', this.maxRetries, 'attempts');
            }
        }
    };

    // Auto-start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.ChatbotInitializer.init(), 100);
        });
    } else {
        setTimeout(() => window.ChatbotInitializer.init(), 100);
    }

})();

// Fix avatar loading issues on the blog page by checking storage and updating the avatar URL.
(function() {
    'use strict';

    function initializeChatbot() {
        window.ChatbotInitializer.init();
    }

    // Blog page specific avatar loading with enhanced detection
    function ensureBlogPageAvatar() {
        // Check if we're on blog page
        if (window.location.pathname.includes('blog.html') || 
            window.location.pathname.endsWith('blog')) {

            console.log('🔧 Blog page detected, ensuring avatar loads correctly');

            // Enhanced avatar source checking
            const avatarSources = [
                localStorage.getItem('chatbot-widget-avatar'),
                localStorage.getItem('chatbot-current-avatar'),
                localStorage.getItem('dashboard-avatar-cache'),
                localStorage.getItem('chatbot-avatar-settings'),
                localStorage.getItem('fooodis-chatbot-settings'),
                sessionStorage.getItem('chatbot-avatar-current')
            ];

            let avatarUrl = null;
            for (const source of avatarSources) {
                if (source) {
                    try {
                        if (source.startsWith('http') || source.startsWith('data:') || source.startsWith('/') || source.startsWith('images/')) {
                            avatarUrl = source;
                            console.log('📥 Found direct avatar URL:', source.substring(0, 50) + '...');
                            break;
                        } else {
                            const parsed = JSON.parse(source);
                            if (parsed.avatar) {
                                avatarUrl = parsed.avatar;
                                console.log('📥 Found parsed avatar URL:', parsed.avatar.substring(0, 50) + '...');
                                break;
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            // If no avatar found locally, try server config
            if (!avatarUrl) {
                console.log('📥 No local avatar found, trying server config...');
                fetch('/chatbot-config.json')
                    .then(response => response.json())
                    .then(config => {
                        if (config.avatar) {
                            avatarUrl = config.avatar;
                            console.log('📥 Found avatar from server config:', avatarUrl.substring(0, 50) + '...');
                            applyAvatarToBlogChatbot(avatarUrl);
                        }
                    })
                    .catch(error => console.warn('Failed to fetch server config:', error));
            } else {
                applyAvatarToBlogChatbot(avatarUrl);
            }
        }
    }

    // Apply avatar specifically for blog page chatbot
    function applyAvatarToBlogChatbot(avatarUrl) {
        if (!avatarUrl) return;

        console.log('🖼️ Applying avatar to blog page chatbot:', avatarUrl.substring(0, 50) + '...');

        // Make URL absolute
        let absoluteUrl = avatarUrl;
        if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('data:')) {
            const baseUrl = window.location.origin;
            if (avatarUrl.startsWith('./')) {
                absoluteUrl = baseUrl + '/' + avatarUrl.substring(2);
            } else if (avatarUrl.startsWith('/')) {
                absoluteUrl = baseUrl + avatarUrl;
            } else if (avatarUrl.startsWith('images/')) {
                absoluteUrl = baseUrl + '/' + avatarUrl;
            } else {
                absoluteUrl = baseUrl + '/images/avatars/' + avatarUrl;
            }
        }

        let retryCount = 0;
        const maxRetries = 15;

        // Enhanced avatar application with multiple retries
        const checkAndUpdateAvatar = () => {
            retryCount++;
            
            if (window.FoodisChatbot) {
                let applied = false;
                
                // Try multiple methods
                if (typeof window.FoodisChatbot.updateAvatar === 'function') {
                    window.FoodisChatbot.updateAvatar(absoluteUrl);
                    applied = true;
                    console.log('✅ Avatar applied via updateAvatar method');
                }
                
                if (window.FoodisChatbot.config) {
                    window.FoodisChatbot.config.avatar = absoluteUrl;
                    applied = true;
                    console.log('✅ Avatar applied to config');
                }
                
                if (window.FoodisChatbot.currentAgent) {
                    window.FoodisChatbot.currentAgent.avatar = absoluteUrl;
                    applied = true;
                    console.log('✅ Avatar applied to current agent');
                }
                
                // Force refresh all avatars
                if (window.FoodisChatbot.setupAllAvatars) {
                    setTimeout(() => {
                        window.FoodisChatbot.setupAllAvatars();
                        console.log('✅ All avatars refreshed');
                    }, 100);
                }
                
                if (applied) {
                    // Store for persistence
                    localStorage.setItem('chatbot-widget-avatar', absoluteUrl);
                    localStorage.setItem('chatbot-current-avatar', absoluteUrl);
                    sessionStorage.setItem('chatbot-avatar-current', absoluteUrl);
                    return;
                }
            }
            
            // Retry if not successful and within limit
            if (retryCount < maxRetries) {
                const delay = Math.min(200 * retryCount, 2000);
                setTimeout(checkAndUpdateAvatar, delay);
            } else {
                console.warn('⚠️ Failed to apply avatar after', maxRetries, 'attempts');
            }
        };

        checkAndUpdateAvatar();
    }

    // Initialize chatbot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeChatbot();
            ensureBlogPageAvatar();
        });
    } else {
        initializeChatbot();
        ensureBlogPageAvatar();
    }
})();