
/**
 * Reset Conversation Test Script
 * Safely resets the chatbot to test the conversation flow
 */

(function() {
    'use strict';

    console.log('🔄 Starting conversation reset for testing...');

    // Clear conversation data
    const conversationKeys = [
        'fooodis-chatbot-conversations',
        'chatbot-conversations',
        'chatbot-conversation-id',
        'chatbot-session-id'
    ];

    conversationKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    // Reset persistent agent
    localStorage.removeItem('chatbot-current-agent-avatar');
    localStorage.removeItem('chatbot-current-agent-data');

    // Clear user data for testing
    const userKeys = [
        'chatbot-current-user',
        'chatbot-user-data',
        'fooodis-user-name',
        'fooodis-restaurant-name',
        'fooodis-language'
    ];

    userKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    // Reset chatbot widget if available
    if (window.FoodisChatbot) {
        window.FoodisChatbot.conversationPhase = 'welcome';
        window.FoodisChatbot.handoffComplete = false;
        window.FoodisChatbot.currentAgent = null;
        window.FoodisChatbot.userRegistered = false;
        window.FoodisChatbot.userName = null;
        window.FoodisChatbot.restaurantName = null;
        window.FoodisChatbot.messages = [];

        if (typeof window.FoodisChatbot.resetPersistentAgent === 'function') {
            window.FoodisChatbot.resetPersistentAgent();
        }

        console.log('✅ Chatbot widget reset completed');
    }

    console.log('🎯 Conversation reset completed - ready for testing');
    console.log('📝 Next steps:');
    console.log('1. Refresh the page');
    console.log('2. Start a new conversation');
    console.log('3. The agent avatar should persist throughout the conversation');

})();
