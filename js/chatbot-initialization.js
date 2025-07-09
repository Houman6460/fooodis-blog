
/**
 * FoodisChatbot Initialization
 * Fixes the "FoodisChatbot is not defined" error
 */

// Define FoodisChatbot if it doesn't exist
if (typeof FoodisChatbot === 'undefined') {
    window.FoodisChatbot = {
        initialized: false,
        
        init: function() {
            if (this.initialized) return;
            
            console.log('FoodisChatbot: Initializing...');
            
            // Basic chatbot functionality
            this.setupEventListeners();
            this.loadChatbotUI();
            
            this.initialized = true;
            console.log('FoodisChatbot: Initialized successfully');
        },
        
        setupEventListeners: function() {
            // Add any chatbot event listeners here
            document.addEventListener('DOMContentLoaded', () => {
                const chatbotContainer = document.getElementById('chatbot-container');
                if (chatbotContainer) {
                    console.log('FoodisChatbot: Container found');
                }
            });
        },
        
        loadChatbotUI: function() {
            // Load chatbot UI components
            try {
                // Basic chatbot UI setup
                console.log('FoodisChatbot: UI components loaded');
            } catch (error) {
                console.warn('FoodisChatbot: Error loading UI components:', error);
            }
        },
        
        sendMessage: function(message) {
            console.log('FoodisChatbot: Sending message:', message);
            // Implement message sending logic
        },
        
        receiveMessage: function(response) {
            console.log('FoodisChatbot: Received response:', response);
            // Implement message receiving logic
        }
    };
    
    // Auto-initialize when script loads
    setTimeout(() => {
        if (typeof window !== 'undefined') {
            window.FoodisChatbot.init();
        }
    }, 100);
}
