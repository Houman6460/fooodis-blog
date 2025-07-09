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

    // Blog page specific avatar loading
    function ensureBlogPageAvatar() {
        // Check if we're on blog page
        if (window.location.pathname.includes('blog.html') || 
            window.location.pathname.endsWith('blog')) {

            console.log('🔧 Blog page detected, ensuring avatar loads correctly');

            // Try to get avatar from various storage locations
            const avatarSources = [
                localStorage.getItem('chatbot-widget-avatar'),
                localStorage.getItem('chatbot-avatar-settings'),
                localStorage.getItem('fooodis-chatbot-settings')
            ];

            let avatarUrl = null;
            for (const source of avatarSources) {
                if (source) {
                    try {
                        if (source.startsWith('http') || source.startsWith('data:') || source.startsWith('/') || source.startsWith('images/')) {
                            avatarUrl = source;
                            break;
                        } else {
                            const parsed = JSON.parse(source);
                            if (parsed.avatar) {
                                avatarUrl = parsed.avatar;
                                break;
                            }
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            if (avatarUrl) {
                console.log('🖼️ Found avatar for blog page:', avatarUrl.substring(0, 50) + '...');

                // Wait for chatbot to initialize, then update avatar
                const checkAndUpdateAvatar = () => {
                    if (window.FoodisChatbot && window.FoodisChatbot.updateAvatar) {
                        window.FoodisChatbot.updateAvatar(avatarUrl);
                        console.log('✅ Avatar updated on blog page');
                    } else {
                        setTimeout(checkAndUpdateAvatar, 100);
                    }
                };

                setTimeout(checkAndUpdateAvatar, 500);
            }
        }
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