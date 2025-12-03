
/**
 * 🚀 CHATBOT MESSAGE ENHANCER
 * Enhances chatbot messages with rich content, buttons, and improved formatting
 */

(function() {
    'use strict';

    window.ChatbotMessageEnhancer = {
        init: function() {
            console.log('🚀 Chatbot Message Enhancer initialized');
        },

        // Enhanced message rendering with support for buttons and rich content
        enhanceMessage: function(message, messageType = 'text') {
            if (!message) return '';

            let enhancedMessage = message;

            // Convert markdown-style links to clickable buttons
            enhancedMessage = this.convertLinksToButtons(enhancedMessage);

            // Enhance formatting
            enhancedMessage = this.enhanceFormatting(enhancedMessage);

            // Add interactive elements for specific content types
            enhancedMessage = this.addInteractiveElements(enhancedMessage);

            return enhancedMessage;
        },

        // Convert markdown links to styled buttons
        convertLinksToButtons: function(message) {
            // Convert [Text](URL) to clickable buttons
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            
            return message.replace(linkRegex, (match, text, url) => {
                // Determine button style based on content
                let buttonClass = 'chatbot-link-button';
                
                if (text.toLowerCase().includes('pos') || text.toLowerCase().includes('system')) {
                    buttonClass += ' chatbot-button-primary';
                } else if (text.toLowerCase().includes('learn') || text.toLowerCase().includes('more')) {
                    buttonClass += ' chatbot-button-secondary';
                } else if (text.toLowerCase().includes('contact') || text.toLowerCase().includes('support')) {
                    buttonClass += ' chatbot-button-contact';
                }

                return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${buttonClass}">${text}</a>`;
            });
        },

        // Enhance text formatting
        enhanceFormatting: function(message) {
            // Convert **bold** to <strong>
            message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Convert *italic* to <em>
            message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Convert line breaks to <br>
            message = message.replace(/\n/g, '<br>');
            
            // Convert bullet points
            message = message.replace(/^- (.+)$/gm, '<li>$1</li>');
            message = message.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

            return message;
        },

        // Add interactive elements based on message content
        addInteractiveElements: function(message) {
            // Skip if message already has quick replies (prevent duplicates)
            if (message.includes('chatbot-quick-replies') || message.includes('chatbot-quick-reply')) {
                return message;
            }
            
            // Add quick reply buttons for common questions
            if (this.containsQuestionPrompt(message)) {
                message += this.generateQuickReplyButtons();
            }

            // Add rating buttons for satisfaction surveys (skip if already has rating)
            if (!message.includes('chatbot-rating') && 
                (message.toLowerCase().includes('how was') || message.toLowerCase().includes('rate'))) {
                message += this.generateRatingButtons();
            }

            return message;
        },

        // Check if message contains question prompts
        containsQuestionPrompt: function(message) {
            const questionPrompts = [
                'how can i help',
                'what would you like',
                'anything else',
                'can i assist',
                'need help with'
            ];
            
            const lowerMessage = message.toLowerCase();
            return questionPrompts.some(prompt => lowerMessage.includes(prompt));
        },

        // Generate quick reply buttons from intents or use defaults
        generateQuickReplyButtons: function(intents) {
            // Use dynamic intents if provided, otherwise use defaults
            const buttonIntents = intents || this.getDefaultIntents();
            
            if (!buttonIntents || buttonIntents.length === 0) {
                return '';
            }
            
            const buttons = buttonIntents.map(intent => {
                const label = this.formatIntentLabel(intent);
                return `<button class="chatbot-quick-reply" data-reply="${intent}">${label}</button>`;
            }).join('');
            
            return `<div class="chatbot-quick-replies">${buttons}</div>`;
        },
        
        // Format intent ID to human-readable label
        formatIntentLabel: function(intent) {
            // Convert intent-id format to readable label
            return intent
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        },
        
        // Get default intents (fallback)
        getDefaultIntents: function() {
            // Try to get intents from node flow
            if (window.fooodisWidget?.nodeFlow?.nodes) {
                const intentNode = window.fooodisWidget.nodeFlow.nodes.find(n => n.type === 'intent');
                if (intentNode?.data?.intents) {
                    return intentNode.data.intents;
                }
            }
            // Fallback to hardcoded defaults
            return ['menu-help', 'ordering-help', 'technical-support', 'billing-question'];
        },
        
        // Set current intents (called by chatbot widget)
        setCurrentIntents: function(intents) {
            this.currentIntents = intents;
        },

        // Generate rating buttons
        generateRatingButtons: function() {
            return `
                <div class="chatbot-rating-buttons">
                    <span class="rating-label">Rate this response:</span>
                    <div class="rating-stars">
                        <button class="chatbot-rating-star" data-rating="1">⭐</button>
                        <button class="chatbot-rating-star" data-rating="2">⭐</button>
                        <button class="chatbot-rating-star" data-rating="3">⭐</button>
                        <button class="chatbot-rating-star" data-rating="4">⭐</button>
                        <button class="chatbot-rating-star" data-rating="5">⭐</button>
                    </div>
                </div>
            `;
        },

        // Inject enhanced message styles
        injectStyles: function() {
            if (document.getElementById('chatbot-message-enhancer-styles')) {
                return; // Styles already injected
            }

            const styles = document.createElement('style');
            styles.id = 'chatbot-message-enhancer-styles';
            styles.textContent = `
                /* Enhanced Message Styles */
                .chatbot-link-button {
                    display: inline-block !important;
                    padding: 8px 16px !important;
                    margin: 4px 4px 4px 0 !important;
                    border-radius: 20px !important;
                    text-decoration: none !important;
                    font-weight: 500 !important;
                    font-size: 13px !important;
                    transition: all 0.2s ease !important;
                    border: 1px solid #ddd !important;
                    background: #f8f9fa !important;
                    color: #495057 !important;
                }

                .chatbot-link-button:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                }

                .chatbot-button-primary {
                    background: #e8f24c !important;
                    color: #26282f !important;
                    border-color: #e8f24c !important;
                }

                .chatbot-button-secondary {
                    background: #6c757d !important;
                    color: white !important;
                    border-color: #6c757d !important;
                }

                .chatbot-button-contact {
                    background: #28a745 !important;
                    color: white !important;
                    border-color: #28a745 !important;
                }

                .chatbot-quick-replies {
                    margin-top: 10px !important;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 6px !important;
                }

                .chatbot-quick-reply {
                    padding: 6px 12px !important;
                    border: 1px solid #e8f24c !important;
                    background: transparent !important;
                    color: #26282f !important;
                    border-radius: 15px !important;
                    font-size: 12px !important;
                    cursor: pointer !important;
                    transition: all 0.2s ease !important;
                }

                .chatbot-quick-reply:hover {
                    background: #e8f24c !important;
                    color: #26282f !important;
                }

                .chatbot-rating-buttons {
                    margin-top: 10px !important;
                    text-align: center !important;
                }

                .rating-label {
                    font-size: 12px !important;
                    color: #666 !important;
                    margin-bottom: 5px !important;
                    display: block !important;
                }

                .rating-stars {
                    display: flex !important;
                    justify-content: center !important;
                    gap: 2px !important;
                }

                .chatbot-rating-star {
                    background: none !important;
                    border: none !important;
                    font-size: 16px !important;
                    cursor: pointer !important;
                    opacity: 0.3 !important;
                    transition: opacity 0.2s ease !important;
                }

                .chatbot-rating-star:hover,
                .chatbot-rating-star.active {
                    opacity: 1 !important;
                }

                /* Enhanced formatting */
                .message-content ul {
                    margin: 8px 0 !important;
                    padding-left: 20px !important;
                }

                .message-content li {
                    margin-bottom: 4px !important;
                }

                .message-content strong {
                    font-weight: 600 !important;
                }

                .message-content em {
                    font-style: italic !important;
                    color: #666 !important;
                }
            `;
            
            document.head.appendChild(styles);
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.ChatbotMessageEnhancer.init();
        window.ChatbotMessageEnhancer.injectStyles();
    });

})();
