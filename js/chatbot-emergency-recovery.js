
/**
 * 🆘 CHATBOT EMERGENCY RECOVERY
 * Ensures chatbot always has a fallback when main systems fail
 */

(function() {
    'use strict';

    console.log('🆘 Chatbot Emergency Recovery System loading...');

    window.ChatbotEmergencyRecovery = {
        isActive: false,
        checkInterval: null,

        init: function() {
            console.log('🆘 Starting emergency recovery monitoring...');
            
            // Check immediately
            setTimeout(() => this.checkChatbotStatus(), 2000);
            
            // Set up periodic checks
            this.checkInterval = setInterval(() => {
                this.checkChatbotStatus();
            }, 10000); // Check every 10 seconds

            // Listen for page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    setTimeout(() => this.checkChatbotStatus(), 1000);
                }
            });
        },

        checkChatbotStatus: function() {
            const chatbotExists = document.getElementById('fooodis-chatbot');
            const chatbotWorking = window.FoodisChatbot && window.FoodisChatbot.widget;

            if (!chatbotExists || !chatbotWorking) {
                console.warn('🆘 Chatbot missing or not working, attempting recovery...');
                this.attemptRecovery();
            } else {
                // Reset emergency state if chatbot is working
                if (this.isActive) {
                    console.log('✅ Chatbot recovered, deactivating emergency mode');
                    this.isActive = false;
                }
            }
        },

        attemptRecovery: function() {
            if (this.isActive) {
                console.log('🆘 Recovery already in progress');
                return;
            }

            this.isActive = true;
            console.log('🆘 Attempting chatbot recovery...');

            try {
                // Method 1: Try to reinitialize existing chatbot
                if (window.FoodisChatbot) {
                    console.log('🔄 Attempting to reinitialize existing chatbot...');
                    window.FoodisChatbot.init({
                        apiEndpoint: window.location.origin + '/api/chatbot',
                        position: 'bottom-right',
                        primaryColor: '#e8f24c',
                        enabled: true
                    });
                    
                    // Check if it worked
                    setTimeout(() => {
                        if (document.getElementById('fooodis-chatbot')) {
                            console.log('✅ Chatbot recovery successful via reinit');
                            this.isActive = false;
                            return;
                        } else {
                            this.createEmergencyWidget();
                        }
                    }, 1000);
                } else {
                    // Method 2: Load chatbot scripts if missing
                    this.loadChatbotScripts();
                }

            } catch (error) {
                console.error('🆘 Recovery attempt failed:', error);
                this.createEmergencyWidget();
            }
        },

        loadChatbotScripts: function() {
            console.log('📜 Loading chatbot scripts...');

            const scripts = [
                'js/chatbot-widget.js',
                'js/chatbot-message-enhancer.js',
                'js/chatbot-integration-fixes.js'
            ];

            let loadedCount = 0;
            
            scripts.forEach(scriptPath => {
                // Check if script is already loaded
                if (document.querySelector(`script[src="${scriptPath}"]`)) {
                    loadedCount++;
                    if (loadedCount === scripts.length) {
                        this.initializeChatbot();
                    }
                    return;
                }

                const script = document.createElement('script');
                script.src = scriptPath;
                script.onload = () => {
                    console.log('✅ Loaded:', scriptPath);
                    loadedCount++;
                    if (loadedCount === scripts.length) {
                        this.initializeChatbot();
                    }
                };
                script.onerror = () => {
                    console.error('❌ Failed to load:', scriptPath);
                    loadedCount++;
                    if (loadedCount === scripts.length) {
                        this.createEmergencyWidget();
                    }
                };
                document.head.appendChild(script);
            });
        },

        initializeChatbot: function() {
            console.log('🔄 Initializing recovered chatbot...');
            
            setTimeout(() => {
                if (window.FoodisChatbot) {
                    window.FoodisChatbot.init({
                        apiEndpoint: window.location.origin + '/api/chatbot',
                        position: 'bottom-right',
                        primaryColor: '#e8f24c',
                        enabled: true
                    });
                    
                    setTimeout(() => {
                        if (document.getElementById('fooodis-chatbot')) {
                            console.log('✅ Chatbot recovery successful');
                            this.isActive = false;
                        } else {
                            this.createEmergencyWidget();
                        }
                    }, 1000);
                } else {
                    this.createEmergencyWidget();
                }
            }, 500);
        },

        createEmergencyWidget: function() {
            console.log('🆘 Creating emergency chatbot widget...');
            
            // Remove any existing emergency widget
            const existing = document.getElementById('emergency-chatbot');
            if (existing) {
                existing.remove();
            }

            const widget = document.createElement('div');
            widget.id = 'emergency-chatbot';
            widget.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 999999 !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            `;

            widget.innerHTML = `
                <div style="
                    width: 60px !important;
                    height: 60px !important;
                    border-radius: 50% !important;
                    background: #ff6b6b !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                    transition: all 0.3s ease !important;
                    animation: pulse 2s infinite !important;
                " onclick="ChatbotEmergencyRecovery.handleEmergencyClick()">
                    <div style="
                        color: white !important;
                        font-size: 24px !important;
                        font-weight: bold !important;
                    ">🆘</div>
                </div>
                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                </style>
            `;

            document.body.appendChild(widget);
            console.log('🆘 Emergency widget created');
        },

        handleEmergencyClick: function() {
            const options = [
                'Try to recover chatbot',
                'Reload the page',
                'Contact support'
            ];

            const choice = prompt(
                'Chatbot is not responding. What would you like to do?\n\n' +
                '1. Try to recover chatbot\n' +
                '2. Reload the page\n' +
                '3. Contact support\n\n' +
                'Enter 1, 2, or 3:'
            );

            switch(choice) {
                case '1':
                    this.isActive = false;
                    this.attemptRecovery();
                    break;
                case '2':
                    window.location.reload();
                    break;
                case '3':
                    window.open('support.html', '_blank');
                    break;
                default:
                    alert('Refreshing the page often resolves chatbot issues.');
                    window.location.reload();
            }
        },

        destroy: function() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
            }
            
            const emergency = document.getElementById('emergency-chatbot');
            if (emergency) {
                emergency.remove();
            }
            
            this.isActive = false;
            console.log('🆘 Emergency recovery system destroyed');
        }
    };

    // Auto-start emergency recovery
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.ChatbotEmergencyRecovery.init(), 3000);
        });
    } else {
        setTimeout(() => window.ChatbotEmergencyRecovery.init(), 3000);
    }

    console.log('✅ Chatbot Emergency Recovery System loaded');

})();
