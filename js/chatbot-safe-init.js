
/**
 * Safe Chatbot Initialization
 * Ensures chatbot loads without breaking the page
 */

(function() {
    'use strict';

    console.log('🤖 Safe Chatbot Init: Starting...');

    function safeChatbotInit() {
        try {
            // Check if FoodisChatbot exists
            if (!window.FoodisChatbot) {
                console.warn('⚠️ FoodisChatbot not found, will retry...');
                return false;
            }

            // Check if init function exists
            if (typeof window.FoodisChatbot.init !== 'function') {
                console.warn('⚠️ FoodisChatbot.init not found, will retry...');
                return false;
            }

            // Initialize with safe config
            window.FoodisChatbot.init({
                apiEndpoint: window.location.origin + '/api/chatbot',
                position: 'bottom-right',
                primaryColor: '#e8f24c',
                language: 'en',
                enabled: true,
                allowFileUpload: true
            });

            console.log('✅ Chatbot initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Chatbot initialization error:', error);
            return false;
        }
    }

    // Try initialization with retries
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000;

    function tryInit() {
        if (safeChatbotInit()) {
            return; // Success!
        }

        retryCount++;
        if (retryCount < maxRetries) {
            console.log(`🔄 Retrying chatbot init (${retryCount}/${maxRetries})...`);
            setTimeout(tryInit, retryDelay);
        } else {
            console.error('❌ Chatbot initialization failed after', maxRetries, 'attempts');
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        // DOM already loaded
        setTimeout(tryInit, 100);
    }

    // Expose function for manual initialization
    window.initChatbotSafely = safeChatbotInit;

})();
/**
 * Safe Chatbot Initialization
 * Ensures chatbot loads even if registration system fails
 */

(function() {
    'use strict';

    console.log('🚀 Starting safe chatbot initialization...');

    // Ensure ChatbotRegistrationData exists safely
    if (!window.ChatbotRegistrationData) {
        window.ChatbotRegistrationData = {
            initialized: false,
            init: function() {
                console.log('🔧 Fallback registration data init');
                this.initialized = true;
            },
            showRegistrationFormIfNeeded: function() {
                console.log('🔧 Fallback registration check - skipping');
                return false;
            }
        };
    }

    // Ensure ChatbotRegistrationForm exists safely
    if (!window.ChatbotRegistrationForm) {
        window.ChatbotRegistrationForm = {
            initialized: false,
            init: function() {
                console.log('🔧 Fallback registration form init');
                this.initialized = true;
            },
            shouldShowRegistrationForm: function() {
                return false;
            },
            showRegistrationForm: function() {
                console.log('🔧 Fallback registration form show - skipping');
            }
        };
    }

    // Initialize chatbot widget when DOM is ready
    function initializeChatbot() {
        if (window.FoodisChatbot && typeof window.FoodisChatbot.init === 'function') {
            try {
                console.log('✅ Initializing Fooodis Chatbot...');
                
                window.FoodisChatbot.init({
                    apiEndpoint: window.location.origin + '/api/chatbot',
                    position: 'bottom-right',
                    primaryColor: '#e8f24c',
                    language: 'en',
                    enabled: true
                });

                console.log('✅ Chatbot initialized successfully');
                
                // Trigger ready event
                window.dispatchEvent(new CustomEvent('chatbotInitialized', {
                    detail: { success: true }
                }));

            } catch (error) {
                console.error('❌ Chatbot initialization failed:', error);
                
                // Try again in 2 seconds
                setTimeout(() => {
                    console.log('🔄 Retrying chatbot initialization...');
                    initializeChatbot();
                }, 2000);
            }
        } else {
            console.log('⏳ Chatbot widget not ready, retrying...');
            setTimeout(initializeChatbot, 1000);
        }
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatbot);
    } else {
        // DOM is already ready
        setTimeout(initializeChatbot, 100);
    }

    console.log('🛡️ Safe chatbot initialization script loaded');

})();
