/**
 * ⭐ FOOODIS CHATBOT RATING SYSTEM
 * Comprehensive rating system with inactivity detection, personalized messages, and analytics
 */

window.ChatbotRatingSystem = {
    
    // Configuration
    config: {
        inactivityTimeoutMs: 300000, // 5 minutes
        thankYouDelayMs: 2000, // 2 seconds after sending thank you
        ratingCategories: [
            { id: 'helpful', label: { en: 'Was this helpful?', sv: 'Var detta till hjälp?' }},
            { id: 'accurate', label: { en: 'Accuracy of information', sv: 'Informationens noggrannhet' }},
            { id: 'speed', label: { en: 'Response speed', sv: 'Svarshastighet' }},
            { id: 'satisfaction', label: { en: 'Overall satisfaction', sv: 'Övergripande nöjdhet' }}
        ]
    },
    
    // State management
    state: {
        inactivityTimer: null,
        conversationId: null,
        userId: null,
        userName: null,
        userLanguage: 'en',
        hasShownThankYou: false,
        lastUserActivity: Date.now()
    },
    
    // Initialize rating system
    init: function(conversationId, userId = null, userName = null, language = 'en') {
        console.log('⭐ Initializing Chat Rating System...', { conversationId, userId, userName, language });
        
        this.state.conversationId = conversationId;
        this.state.userId = userId;
        this.state.userName = userName;
        this.state.userLanguage = language;
        this.state.lastUserActivity = Date.now();
        
        this.setupInactivityDetection();
        this.injectRatingStyles();
        
        console.log('✅ Chat Rating System initialized');
    },
    
    // Setup inactivity detection
    setupInactivityDetection: function() {
        // Clear existing timer
        if (this.state.inactivityTimer) {
            clearTimeout(this.state.inactivityTimer);
        }
        
        // Start new inactivity timer
        this.state.inactivityTimer = setTimeout(() => {
            this.handleInactivity();
        }, this.config.inactivityTimeoutMs);
        
        console.log('⏰ Inactivity timer set for', this.config.inactivityTimeoutMs / 1000, 'seconds');
    },
    
    // Reset inactivity timer on user activity
    resetInactivityTimer: function() {
        this.state.lastUserActivity = Date.now();
        this.setupInactivityDetection();
        console.log('🔄 Inactivity timer reset');
    },
    
    // Handle user inactivity
    handleInactivity: function() {
        if (this.state.hasShownThankYou) {
            return; // Already shown thank you
        }
        
        console.log('😴 User inactivity detected, showing thank you message');
        this.showThankYouMessage();
        this.state.hasShownThankYou = true;
        
        // Show rating popup after thank you message
        setTimeout(() => {
            this.showRatingPopup();
        }, this.config.thankYouDelayMs);
    },
    
    // Show personalized thank you message
    showThankYouMessage: function() {
        const userName = this.state.userName || 'valued user';
        const lang = this.state.userLanguage;
        
        const thankYouMessages = {
            en: `Thank you for your time today ${userName}, the team and myself remain at your disposal for any other support you may need in the future. Have a good day!`,
            sv: `Tack för din tid idag ${userName}, teamet och jag står fortsatt till ditt förfogande för eventuell annan support du kan behöva i framtiden. Ha en bra dag!`
        };
        
        const message = thankYouMessages[lang] || thankYouMessages.en;
        
        // Add message to chat (using the chatbot widget's addMessage function)
        if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
            window.FoodisChatbot.addMessage(message, 'assistant');
        }
        
        console.log('💬 Thank you message sent:', { userName, language: lang });
    },
    
    // Show rating popup
    showRatingPopup: function() {
        const lang = this.state.userLanguage;
        
        const popup = document.createElement('div');
        popup.id = 'chatbot-rating-popup';
        popup.className = 'chatbot-rating-popup';
        
        const titles = {
            en: 'Rate Your Experience',
            sv: 'Betygsätt Din Upplevelse'
        };
        
        const submitLabels = {
            en: 'Submit Rating',
            sv: 'Skicka Betyg'
        };
        
        const skipLabels = {
            en: 'Skip',
            sv: 'Hoppa över'
        };
        
        popup.innerHTML = `
            <div class="rating-popup-content">
                <div class="rating-popup-header">
                    <h3>${titles[lang] || titles.en}</h3>
                    <button class="rating-close-btn" onclick="ChatbotRatingSystem.closeRatingPopup()">✖</button>
                </div>
                <div class="rating-categories">
                    ${this.config.ratingCategories.map(category => `
                        <div class="rating-category">
                            <label>${category.label[lang] || category.label.en}</label>
                            <div class="star-rating" data-category="${category.id}">
                                ${[1,2,3,4,5].map(star => `
                                    <span class="star" data-rating="${star}" onclick="ChatbotRatingSystem.setRating('${category.id}', ${star})">⭐</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="rating-actions">
                    <button class="rating-submit-btn" onclick="ChatbotRatingSystem.submitRating()">
                        ${submitLabels[lang] || submitLabels.en}
                    </button>
                    <button class="rating-skip-btn" onclick="ChatbotRatingSystem.closeRatingPopup()">
                        ${skipLabels[lang] || skipLabels.en}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 100);
        
        console.log('⭐ Rating popup displayed');
    },
    
    // Set rating for category
    setRating: function(category, rating) {
        if (!this.state.ratings) {
            this.state.ratings = {};
        }
        
        this.state.ratings[category] = rating;
        
        // Update visual feedback
        const categoryEl = document.querySelector(`[data-category="${category}"]`);
        if (categoryEl) {
            const stars = categoryEl.querySelectorAll('.star');
            stars.forEach((star, index) => {
                star.classList.toggle('selected', index < rating);
            });
        }
        
        console.log('⭐ Rating set:', { category, rating });
    },
    
    // Submit rating
    submitRating: function() {
        const ratings = this.state.ratings || {};
        const ratingData = {
            conversationId: this.state.conversationId,
            userId: this.state.userId,
            userName: this.state.userName,
            language: this.state.userLanguage,
            ratings: ratings,
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - (this.state.lastUserActivity - this.config.inactivityTimeoutMs)
        };
        
        console.log('📊 Submitting rating data:', ratingData);
        
        // Send to backend API
        this.sendRatingToBackend(ratingData);
        
        // Show thank you and close popup
        this.showRatingThankYou();
        this.closeRatingPopup();
    },
    
    // Send rating to backend
    sendRatingToBackend: function(ratingData) {
        fetch('/api/chatbot/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ratingData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Rating submitted successfully:', data);
        })
        .catch(error => {
            console.error('❌ Error submitting rating:', error);
            // Store locally if backend fails
            this.storeRatingLocally(ratingData);
        });
    },
    
    // Store rating locally as fallback
    storeRatingLocally: function(ratingData) {
        try {
            const localRatings = JSON.parse(localStorage.getItem('chatbot-ratings') || '[]');
            localRatings.push(ratingData);
            localStorage.setItem('chatbot-ratings', JSON.stringify(localRatings));
            console.log('💾 Rating stored locally as fallback');
        } catch (error) {
            console.error('❌ Failed to store rating locally:', error);
        }
    },
    
    // Show rating thank you
    showRatingThankYou: function() {
        const lang = this.state.userLanguage;
        const messages = {
            en: 'Thank you for your feedback! 🙏',
            sv: 'Tack för din feedback! 🙏'
        };
        
        // Show temporary notification
        const notification = document.createElement('div');
        notification.className = 'rating-thank-you-notification';
        notification.textContent = messages[lang] || messages.en;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    // Close rating popup
    closeRatingPopup: function() {
        const popup = document.getElementById('chatbot-rating-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }
    },
    
    // Inject rating styles
    injectRatingStyles: function() {
        if (document.getElementById('chatbot-rating-styles')) {
            return; // Already injected
        }
        
        const styles = document.createElement('style');
        styles.id = 'chatbot-rating-styles';
        styles.textContent = `
            /* Rating Popup Styles */
            .chatbot-rating-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .chatbot-rating-popup.show {
                opacity: 1;
                visibility: visible;
            }
            
            .rating-popup-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 480px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .chatbot-rating-popup.show .rating-popup-content {
                transform: scale(1);
            }
            
            .rating-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #e8f24c;
                padding-bottom: 12px;
            }
            
            .rating-popup-header h3 {
                margin: 0;
                color: #2c3e50;
                font-size: 20px;
                font-weight: 600;
            }
            
            .rating-close-btn {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #7f8c8d;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .rating-close-btn:hover {
                background: #ecf0f1;
                color: #2c3e50;
            }
            
            .rating-category {
                margin-bottom: 20px;
            }
            
            .rating-category label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
            }
            
            .star-rating {
                display: flex;
                gap: 4px;
            }
            
            .star {
                font-size: 24px;
                cursor: pointer;
                opacity: 0.3;
                transition: all 0.2s ease;
                user-select: none;
            }
            
            .star:hover,
            .star.selected {
                opacity: 1;
                transform: scale(1.1);
            }
            
            .star:hover {
                filter: drop-shadow(0 0 8px rgba(232, 242, 76, 0.6));
            }
            
            .rating-actions {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                justify-content: flex-end;
            }
            
            .rating-submit-btn {
                background: linear-gradient(135deg, #e8f24c 0%, #d4e635 100%);
                color: #2c3e50;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(232, 242, 76, 0.3);
            }
            
            .rating-submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(232, 242, 76, 0.4);
            }
            
            .rating-skip-btn {
                background: #ecf0f1;
                color: #7f8c8d;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .rating-skip-btn:hover {
                background: #d5dbdb;
                color: #2c3e50;
            }
            
            /* Rating Thank You Notification */
            .rating-thank-you-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                font-weight: 600;
                z-index: 10001;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
            }
            
            .rating-thank-you-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            /* Mobile Responsive */
            @media (max-width: 768px) {
                .rating-popup-content {
                    margin: 20px;
                    padding: 20px;
                }
                
                .rating-actions {
                    flex-direction: column;
                }
                
                .rating-submit-btn,
                .rating-skip-btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
        console.log('🎨 Rating system styles injected');
    },
    
    // Manual rating trigger (for testing or immediate feedback)
    triggerRating: function() {
        this.showRatingPopup();
    },
    
    // Performance: Cleanup when conversation ends
    cleanup: function() {
        if (this.state.inactivityTimer) {
            clearTimeout(this.state.inactivityTimer);
            this.state.inactivityTimer = null;
        }
        
        // Reset state
        this.state = {
            inactivityTimer: null,
            conversationId: null,
            userId: null,
            userName: null,
            userLanguage: 'en',
            hasShownThankYou: false,
            lastUserActivity: Date.now()
        };
        
        console.log('🧹 Rating system cleaned up');
    }
};

console.log('⭐ Chatbot Rating System loaded successfully!');
