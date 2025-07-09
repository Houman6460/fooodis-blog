
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
