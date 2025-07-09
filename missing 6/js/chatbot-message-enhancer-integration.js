/**
 * 🎨 Chatbot Message Enhancer Integration
 * Post-load override to integrate ChatbotMessageEnhancer with existing addMessage function
 * This approach bypasses the duplicate function patterns in chatbot-widget.js
 */

(function() {
    'use strict';
    
    console.log('🎨 Initializing ChatbotMessageEnhancer integration...');
    
    function integrateMessageEnhancer() {
        // Wait for chatbot widget to be available
        if (!window.chatbotWidget || typeof window.chatbotWidget.addMessage !== 'function') {
            console.log('⏳ Waiting for chatbot widget...');
            setTimeout(integrateMessageEnhancer, 500);
            return;
        }
        
        // Store the original addMessage function
        const originalAddMessage = window.chatbotWidget.addMessage;
        
        // Override addMessage with enhanced version
        window.chatbotWidget.addMessage = function(content, isFromUser = false, agentName = null, agentAvatar = null, isHandoff = false) {
            console.log('🎨 Processing message through enhanced addMessage:', content);
            
            // Process content with ChatbotMessageEnhancer if available
            let processedContent = content;
            if (window.ChatbotMessageEnhancer && typeof window.ChatbotMessageEnhancer.processMessageContent === 'function') {
                try {
                    processedContent = window.ChatbotMessageEnhancer.processMessageContent(content);
                    console.log('✅ Message enhanced successfully:', processedContent);
                } catch (error) {
                    console.error('❌ Error enhancing message content:', error);
                    processedContent = content; // Fallback to original content
                }
            } else {
                console.warn('⚠️ ChatbotMessageEnhancer not available - using raw content');
            }
            
            // Call the original addMessage function with processed content
            return originalAddMessage.call(this, processedContent, isFromUser, agentName, agentAvatar, isHandoff);
        };
        
        console.log('✅ ChatbotMessageEnhancer integration complete - addMessage function overridden');
    }
    
    // Start integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', integrateMessageEnhancer);
    } else {
        integrateMessageEnhancer();
    }
    
    // Also try integration after a delay to handle async loading
    setTimeout(integrateMessageEnhancer, 2000);
    
})();
