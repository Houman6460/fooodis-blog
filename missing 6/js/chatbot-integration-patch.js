/**
 * 🔗 CHATBOT INTEGRATION PATCH
 * Connects the enhanced message rendering to the chatbot widget
 */

// Wait for both the chatbot widget and message enhancer to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Apply integration after a short delay to ensure all modules are loaded
    setTimeout(function() {
        if (window.FoodisChatbot && window.ChatbotMessageEnhancer) {
            console.log('🔗 Applying enhanced message rendering integration...');
            
            // Store the original addMessage function
            const originalAddMessage = window.FoodisChatbot.addMessage;
            
            // Override the addMessage function to use enhanced processing
            window.FoodisChatbot.addMessage = function(content, sender, isHandoff = false) {
                // Process content with enhanced features if it's from assistant
                let processedContent = content;
                if (sender === 'assistant' && typeof content === 'string') {
                    processedContent = window.ChatbotMessageEnhancer.processMessageContent(content);
                    console.log('🎨 Enhanced message rendering applied:', {
                        original: content.substring(0, 100),
                        processed: processedContent.substring(0, 100)
                    });
                }
                
                // Call the original function with processed content
                return originalAddMessage.call(this, processedContent, sender, isHandoff);
            };
            
            console.log('✅ Enhanced message rendering integration complete!');
        } else {
            console.warn('⚠️ Integration failed - Missing modules:', {
                chatbot: !!window.FoodisChatbot,
                enhancer: !!window.ChatbotMessageEnhancer
            });
        }
    }, 500);
});

console.log('🔗 Chatbot Integration Patch loaded!');
