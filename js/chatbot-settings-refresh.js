
// Chatbot Settings Refresh Fix
// Ensures chatbot widget updates when configuration changes

(function() {
    'use strict';
    
    console.log('🔄 Chatbot Settings Refresh: Initializing...');
    
    // Function to refresh chatbot widget
    function refreshChatbotWidget() {
        console.log('🔄 Refreshing chatbot widget...');
        
        // Remove existing chatbot widget
        const existingWidget = document.getElementById('fooodis-chatbot');
        if (existingWidget) {
            existingWidget.remove();
            console.log('🗑️ Removed existing chatbot widget');
        }
        
        // Wait a moment then reinitialize
        setTimeout(() => {
            if (window.FoodisChatbot && typeof window.FoodisChatbot.init === 'function') {
                window.FoodisChatbot.init({
                    apiEndpoint: '/api/chatbot',
                    position: 'bottom-right',
                    primaryColor: '#e8f24c',
                    language: 'en',
                    assistants: [{
                        id: 'fooodis-assistant',
                        name: 'Fooodis Assistant',
                        assistantId: ''
                    }]
                });
                console.log('✅ Chatbot widget reinitialized');
            }
        }, 500);
    }
    
    // Listen for configuration changes
    window.addEventListener('chatbot-config-updated', refreshChatbotWidget);
    
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'chatbot-config' || e.key === 'aiConfig' || e.key === 'fooodis-chatbot-settings') {
            console.log('🔄 Chatbot configuration changed, refreshing widget...');
            refreshChatbotWidget();
        }
    });
    
    // Trigger refresh when chatbot management saves settings
    const originalSaveConfig = window.ChatbotManager?.saveConfiguration;
    if (originalSaveConfig) {
        window.ChatbotManager.saveConfiguration = function() {
            const result = originalSaveConfig.apply(this, arguments);
            
            // Trigger refresh event
            window.dispatchEvent(new CustomEvent('chatbot-config-updated'));
            
            return result;
        };
    }
    
    console.log('✅ Chatbot Settings Refresh: Ready');
})();
