/**
 * 🎨 Chatbot Message Enhancer Integration
 * Post-load override to integrate ChatbotMessageEnhancer with existing addMessage function
 * This approach bypasses the duplicate function patterns in chatbot-widget.js
 */

(function() {
    'use strict';
    
    console.log('🎨 Initializing ChatbotMessageEnhancer integration...');
    
    let integrationAttempts = 0;
    const MAX_ATTEMPTS = 10;
    let integrationComplete = false;
    
    function integrateMessageEnhancer() {
        // Avoid duplicate integration
        if (integrationComplete) {
            return;
        }
        
        integrationAttempts++;
        
        // Check for fooodisWidget (actual name) or chatbotWidget
        const widget = window.fooodisWidget || window.chatbotWidget;
        
        // Wait for chatbot widget to be available (with max attempts)
        if (!widget || typeof widget.addMessage !== 'function') {
            if (integrationAttempts < MAX_ATTEMPTS) {
                setTimeout(integrateMessageEnhancer, 1000);
            } else {
                console.log('🎨 ChatbotMessageEnhancer: Max attempts reached, integration skipped');
            }
            return;
        }
        
        // Mark as complete to prevent further attempts
        integrationComplete = true;
        
        // Store the original addMessage function
        const originalAddMessage = widget.addMessage.bind(widget);
        
        // Override addMessage with enhanced version
        widget.addMessage = function(content, sender, isHandoff = false) {
            // Process content with ChatbotMessageEnhancer if available
            let processedContent = content;
            if (window.ChatbotMessageEnhancer && typeof window.ChatbotMessageEnhancer.processMessageContent === 'function') {
                try {
                    processedContent = window.ChatbotMessageEnhancer.processMessageContent(content);
                } catch (error) {
                    console.error('❌ Error enhancing message content:', error);
                    processedContent = content; // Fallback to original content
                }
            }
            
            // Call the original addMessage function with processed content
            return originalAddMessage(processedContent, sender, isHandoff);
        };
        
        console.log('✅ ChatbotMessageEnhancer integration complete');
    }
    
    // Start integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', integrateMessageEnhancer);
    } else {
        integrateMessageEnhancer();
    }
    
})();
