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
            const hasRegistration = typeof window.FoodisRegistrationForm !== 'undefined';

            console.log('🔍 Component check:', {
                widget: hasWidget,
                enhancer: hasEnhancer,
                registration: hasRegistration,
                attempt: this.retryCount + 1
            });

            if (hasWidget) {
                try {
                    // Initialize chatbot widget
                    window.FoodisChatbot.init({
                        apiEndpoint: window.location.origin + '/api/chatbot',
                        position: 'bottom-right',
                        primaryColor: '#e8f24c',
                        language: 'en',
                        assistants: [{
                            id: 'fooodis-assistant',
                            name: 'Fooodis Assistant',
                            assistantId: ''
                        }]
                    });

                    this.initialized = true;
                    console.log('✅ Chatbot initialized successfully');

                    // Initialize registration form if available
                    if (hasRegistration && window.FoodisRegistrationForm.init) {
                        window.FoodisRegistrationForm.init();
                        console.log('✅ Registration form initialized');
                    }

                    return;
                } catch (error) {
                    console.error('❌ Chatbot initialization error:', error);
                }
            }

            // Retry logic
            this.retryCount++;
            console.log('🔄 Retrying initialization in', Math.min(1000 * this.retryCount, 5000), 'ms, attempt', this.retryCount, 'of', this.maxRetries);

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

// Blog page specific avatar loading with enhanced detection
(function() {
    'use strict';

    function ensureBlogPageAvatar() {
        // Check if we're on blog page
        if (window.location.pathname.includes('blog.html') || 
            window.location.pathname.endsWith('blog')) {

            console.log('🔧 Blog page detected, ensuring avatar setup...');

            let attempts = 0;
            const maxAttempts = 20;

            const checkAndUpdateAvatar = () => {
                attempts++;

                if (window.FoodisChatbot && window.FoodisChatbot.setupAllAvatars) {
                    console.log('🖼️ Setting up avatars on blog page, attempt:', attempts);
                    window.FoodisChatbot.setupAllAvatars();

                    // Also update with any stored avatar
                    const storedAvatar = localStorage.getItem('chatbot-widget-avatar') || 
                                       localStorage.getItem('fooodis-chatbot-avatar');
                    if (storedAvatar && window.FoodisChatbot.updateAvatar) {
                        window.FoodisChatbot.updateAvatar(storedAvatar);
                        console.log('🖼️ Updated with stored avatar');
                    }
                    return;
                }

                if (attempts < maxAttempts) {
                    setTimeout(checkAndUpdateAvatar, 500);
                } else {
                    console.warn('⚠️ Could not setup avatars after', maxAttempts, 'attempts');
                }
            };

            checkAndUpdateAvatar();
        }
    }

    // Initialize avatar setup when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(ensureBlogPageAvatar, 1000);
        });
    } else {
        setTimeout(ensureBlogPageAvatar, 1000);
    }

})();