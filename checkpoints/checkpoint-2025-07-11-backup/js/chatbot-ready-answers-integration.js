
/**
 * Chatbot Ready Answers Integration
 * Displays ready answer buttons in chat conversations
 */
(function() {
    'use strict';

    window.ChatbotReadyAnswers = {
        readyAnswers: [],
        currentScenario: 'default',
        language: 'english',

        async init() {
            console.log('🔘 Initializing Chatbot Ready Answers...');
            await this.loadReadyAnswers();
            this.setupEventListeners();
        },

        async loadReadyAnswers() {
            try {
                const response = await fetch('/api/ready-answers');
                if (response.ok) {
                    const result = await response.json();
                    this.readyAnswers = result.answers || [];
                    console.log('✅ Ready answers loaded for chatbot:', this.readyAnswers.length);
                }
            } catch (error) {
                console.error('❌ Error loading ready answers:', error);
            }
        },

        setupEventListeners() {
            // Listen for ready answer button clicks
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('chatbot-ready-answer-btn')) {
                    e.preventDefault();
                    const answerId = e.target.dataset.answerId;
                    const language = e.target.dataset.language;
                    this.handleReadyAnswerClick(answerId, language);
                }
            });

            // Listen for language changes
            document.addEventListener('chatbotLanguageChanged', (e) => {
                this.language = e.detail.language;
                this.refreshReadyAnswers();
            });

            // Listen for scenario changes
            document.addEventListener('chatbotScenarioChanged', (e) => {
                this.currentScenario = e.detail.scenario;
                this.refreshReadyAnswers();
            });
        },

        showReadyAnswers(scenario = 'default', language = 'english') {
            this.currentScenario = scenario;
            this.language = language;

            const relevantAnswers = this.readyAnswers.filter(answer => 
                answer.visible && answer.scenario_ids.includes(scenario)
            );

            if (relevantAnswers.length === 0) return;

            const buttonsHtml = this.renderReadyAnswerButtons(relevantAnswers, language);
            this.appendToChat(buttonsHtml);
        },

        renderReadyAnswerButtons(answers, language) {
            const langSuffix = language === 'svenska' ? '_sv' : '_en';
            
            return `
                <div class="chatbot-ready-answers">
                    <div class="ready-answers-container">
                        ${answers.map(answer => `
                            <button class="chatbot-ready-answer-btn" 
                                    data-answer-id="${answer.id}" 
                                    data-language="${language}"
                                    title="${answer['reply' + langSuffix]}">
                                ${answer['label' + langSuffix]}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        handleReadyAnswerClick(answerId, language) {
            const answer = this.readyAnswers.find(a => a.id === answerId);
            if (!answer) return;

            const langSuffix = language === 'svenska' ? '_sv' : '_en';
            const response = answer['reply' + langSuffix];

            // Add user message (button click)
            const buttonLabel = answer['label' + langSuffix];
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                window.FoodisChatbot.addMessage(`🔘 ${buttonLabel}`, 'user');
                
                // Add assistant response
                setTimeout(() => {
                    window.FoodisChatbot.addMessage(response, 'assistant');
                    
                    // Log interaction
                    this.logReadyAnswerInteraction(answerId, language);
                }, 500);
            }

            // Hide ready answers after selection
            this.hideReadyAnswers();
        },

        appendToChat(html) {
            // Find chat messages container
            const chatContainer = document.querySelector('.chatbot-messages, .chat-messages, #chatMessages');
            if (!chatContainer) return;

            // Remove existing ready answers
            this.hideReadyAnswers();

            // Create ready answers element
            const readyAnswersElement = document.createElement('div');
            readyAnswersElement.className = 'chatbot-ready-answers-wrapper';
            readyAnswersElement.innerHTML = html;

            // Add to chat
            chatContainer.appendChild(readyAnswersElement);

            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        },

        hideReadyAnswers() {
            const existingAnswers = document.querySelectorAll('.chatbot-ready-answers-wrapper');
            existingAnswers.forEach(el => el.remove());
        },

        refreshReadyAnswers() {
            // If ready answers are currently shown, refresh them
            const existingAnswers = document.querySelector('.chatbot-ready-answers-wrapper');
            if (existingAnswers) {
                this.showReadyAnswers(this.currentScenario, this.language);
            }
        },

        logReadyAnswerInteraction(answerId, language) {
            // Log the interaction for analytics
            console.log('📊 Ready answer interaction:', { answerId, language });
            
            // Send to analytics if available
            if (window.gtag) {
                window.gtag('event', 'ready_answer_click', {
                    answer_id: answerId,
                    language: language,
                    scenario: this.currentScenario
                });
            }
        },

        // Public API for triggering ready answers
        triggerForScenario(scenario, language = 'english') {
            setTimeout(() => {
                this.showReadyAnswers(scenario, language);
            }, 1000); // Delay to allow welcome message to appear first
        }
    };

    // Auto-initialize
    document.addEventListener('DOMContentLoaded', () => {
        window.ChatbotReadyAnswers.init();
    });

    // Integration with existing chatbot
    document.addEventListener('chatbotInitialized', () => {
        console.log('🔗 Integrating ready answers with chatbot...');
        
        // Show ready answers on conversation start
        if (window.FoodisChatbot) {
            const originalAddMessage = window.FoodisChatbot.addMessage;
            
            window.FoodisChatbot.addMessage = function(message, sender, ...args) {
                const result = originalAddMessage.call(this, message, sender, ...args);
                
                // Show ready answers after assistant welcome message
                if (sender === 'assistant' && message.toLowerCase().includes('help')) {
                    const language = window.FoodisChatbot.currentLanguage || 'english';
                    window.ChatbotReadyAnswers.triggerForScenario('default', language);
                }
                
                return result;
            };
        }
    });

})();
