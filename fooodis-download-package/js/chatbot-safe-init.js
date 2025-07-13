
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
