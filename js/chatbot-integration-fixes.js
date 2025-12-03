
/**
 * 🔧 CHATBOT INTEGRATION FIXES
 * Fixes common integration issues and ensures smooth operation
 */

(function() {
    'use strict';

    // Fix for chatbot initialization timing
    function ensureChatbotInitialization() {
        if (typeof window.FoodisChatbot === 'undefined') {
            console.warn('FoodisChatbot not found, retrying...');
            setTimeout(ensureChatbotInitialization, 500);
            return;
        }

        // Initialize chatbot if not already done
        if (!window.FoodisChatbot.widget) {
            try {
                window.FoodisChatbot.init({
                    apiEndpoint: window.location.origin + '/api/chatbot',
                    position: 'bottom-right',
                    primaryColor: '#e8f24c',
                    language: 'en'
                });
                console.log('✅ Chatbot initialized via integration fix');
            } catch (error) {
                console.error('❌ Chatbot initialization error:', error);
            }
        }
    }

    // Fix for missing event handlers
    function attachMissingEventHandlers() {
        // Quick reply buttons are now handled in chatbot-widget.js
        // Removed duplicate handler to prevent double messages

        // Handle rating buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('chatbot-rating-star')) {
                const rating = e.target.getAttribute('data-rating');
                const stars = e.target.parentNode.querySelectorAll('.chatbot-rating-star');
                
                // Update star display
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });

                // Send rating feedback
                if (window.FoodisChatbot) {
                    setTimeout(() => {
                        window.FoodisChatbot.addMessage(`Thank you for the ${rating}-star rating!`, 'assistant');
                    }, 500);
                }
            }
        });
    }

    // Fix for chatbot positioning on different screen sizes
    function fixChatbotPositioning() {
        const chatbot = document.getElementById('fooodis-chatbot');
        if (chatbot) {
            // Ensure proper positioning on mobile devices
            if (window.innerWidth < 768) {
                chatbot.style.bottom = '10px';
                chatbot.style.right = '10px';
            } else {
                chatbot.style.bottom = '20px';
                chatbot.style.right = '20px';
            }
        }
    }

    // Fix for chatbot message enhancement
    function enhanceExistingMessages() {
        const messages = document.querySelectorAll('.message-content');
        messages.forEach(messageEl => {
            if (!messageEl.dataset.enhanced && window.ChatbotMessageEnhancer) {
                const originalContent = messageEl.innerHTML;
                const enhancedContent = window.ChatbotMessageEnhancer.enhanceMessage(originalContent);
                messageEl.innerHTML = enhancedContent;
                messageEl.dataset.enhanced = 'true';
            }
        });
    }

    // Apply all fixes
    function applyIntegrationFixes() {
        console.log('🔧 Applying chatbot integration fixes...');
        
        ensureChatbotInitialization();
        attachMissingEventHandlers();
        fixChatbotPositioning();
        
        // Periodically enhance new messages
        setInterval(enhanceExistingMessages, 1000);
        
        // Fix positioning on window resize
        window.addEventListener('resize', fixChatbotPositioning);
        
        console.log('✅ Chatbot integration fixes applied');
    }

    // Initialize fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyIntegrationFixes);
    } else {
        applyIntegrationFixes();
    }

})();
