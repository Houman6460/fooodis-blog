
/**
 * Force Conversation Refresh System
 * Ensures immediate UI updates after user registration
 */

(function() {
    'use strict';

    // Force refresh conversations display
    window.forceRefreshConversations = function() {
        console.log('🔄 FORCE REFRESH: Starting conversation display refresh...');
        
        // Multiple refresh strategies
        const refreshMethods = [
            // Method 1: Direct chatbotManager refresh
            () => {
                if (window.chatbotManager && window.chatbotManager.renderConversations) {
                    window.chatbotManager.renderConversations();
                    console.log('✅ REFRESH: chatbotManager.renderConversations() called');
                }
            },
            
            // Method 2: Force reload conversations from localStorage
            () => {
                if (window.chatbotManager && window.chatbotManager.loadConversationsFromServer) {
                    window.chatbotManager.loadConversationsFromServer().then(() => {
                        window.chatbotManager.renderConversations();
                        console.log('✅ REFRESH: Conversations reloaded and rendered');
                    });
                }
            },
            
            // Method 3: DOM manipulation refresh
            () => {
                const conversationsList = document.getElementById('conversationsList');
                if (conversationsList) {
                    // Force re-render by triggering a data refresh
                    const event = new CustomEvent('conversationsRefresh', { 
                        detail: { force: true } 
                    });
                    document.dispatchEvent(event);
                    console.log('✅ REFRESH: DOM refresh event dispatched');
                }
            }
        ];
        
        // Execute all refresh methods with delays
        refreshMethods.forEach((method, index) => {
            setTimeout(() => {
                try {
                    method();
                } catch (error) {
                    console.warn(`⚠️ REFRESH: Method ${index + 1} failed:`, error);
                }
            }, index * 200);
        });
    };

    // Listen for user registration completion
    window.addEventListener('userIdentityUpdated', (event) => {
        console.log('🎯 FORCE REFRESH: User identity updated, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 500);
        setTimeout(window.forceRefreshConversations, 2000); // Second refresh after 2s
    });

    document.addEventListener('userRegistered', (event) => {
        console.log('🎯 FORCE REFRESH: User registered, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 500);
        setTimeout(window.forceRefreshConversations, 2000); // Second refresh after 2s
    });

    // Add to registration form completion
    window.addEventListener('registrationFormCompleted', (event) => {
        console.log('🎯 FORCE REFRESH: Registration form completed, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 100);
        setTimeout(window.forceRefreshConversations, 1000);
        setTimeout(window.forceRefreshConversations, 3000);
    });

    console.log('🔄 Force conversation refresh system initialized');
})();
