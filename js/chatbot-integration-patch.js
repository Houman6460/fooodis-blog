
/**
 * 🔗 CHATBOT INTEGRATION PATCH
 * Connects the enhanced message rendering to the chatbot widget
 */

(function() {
    'use strict';

    console.log('🔗 Chatbot Integration Patch loading...');

    // Wait for all chatbot components to load
    function waitForChatbotComponents() {
        return new Promise((resolve) => {
            const checkComponents = () => {
                const hasWidget = typeof window.FoodisChatbot !== 'undefined';
                const hasEnhancer = typeof window.ChatbotMessageEnhancer !== 'undefined';
                const hasManager = typeof window.chatbotManager !== 'undefined';
                
                if (hasWidget && hasEnhancer) {
                    console.log('✅ All chatbot components loaded');
                    resolve();
                } else {
                    console.log('⏳ Waiting for components:', { hasWidget, hasEnhancer, hasManager });
                    setTimeout(checkComponents, 100);
                }
            };
            checkComponents();
        });
    }

    // Patch chatbot message enhancement
    function patchMessageEnhancement() {
        if (window.FoodisChatbot && window.ChatbotMessageEnhancer) {
            const originalAddMessage = window.FoodisChatbot.addMessage;
            
            window.FoodisChatbot.addMessage = function(content, sender) {
                // Enhance message content before adding
                if (sender === 'assistant' && window.ChatbotMessageEnhancer) {
                    content = window.ChatbotMessageEnhancer.enhanceMessage(content);
                }
                
                // Call original method
                return originalAddMessage.call(this, content, sender);
            };
            
            console.log('✅ Message enhancement patched');
        }
    }

    // Patch API integration
    function patchApiIntegration() {
        if (window.FoodisChatbot) {
            // Ensure API endpoint is correctly set
            const currentOrigin = window.location.origin;
            window.FoodisChatbot.config.apiEndpoint = currentOrigin + '/api/chatbot';
            
            console.log('✅ API endpoint configured:', window.FoodisChatbot.config.apiEndpoint);
        }
    }

    // Initialize patches
    async function initializePatches() {
        try {
            await waitForChatbotComponents();
            patchMessageEnhancement();
            patchApiIntegration();
            console.log('🔗 Chatbot Integration Patch applied successfully');
        } catch (error) {
            console.error('❌ Chatbot Integration Patch failed:', error);
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePatches);
    } else {
        initializePatches();
    }

})();
