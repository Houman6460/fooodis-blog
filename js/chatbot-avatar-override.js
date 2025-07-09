
/**
 * 🔧 ENHANCED CHATBOT AVATAR OVERRIDE
 * Prevents duplicate buttons and forces correct avatar display
 */

(function() {
    'use strict';

    console.log('🔧 Enhanced Chatbot Avatar Override loading...');

    const AvatarOverride = {
        // Configuration
        targetAvatar: null,
        observer: null,
        intervalId: null,
        isInitialized: false,
        
        // Initialize the override system
        init: function() {
            if (this.isInitialized) {
                console.log('🔧 Avatar Override already initialized');
                return;
            }
            
            this.isInitialized = true;
            console.log('🔧 Initializing Enhanced Avatar Override...');
            
            // Step 1: Immediate cleanup
            this.removeDuplicateButtons();
            
            // Step 2: Load target avatar
            this.loadTargetAvatar();
            
            // Step 3: Setup observers and periodic checks
            this.setupDOMObserver();
            this.startPeriodicChecks();
            
            // Step 4: Initial avatar application
            setTimeout(() => this.forceAvatarUpdate(), 1000);
        },

        // Start periodic checks to prevent duplicates
        startPeriodicChecks: function() {
            // Clear any existing interval
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            
            // Check every 3 seconds
            this.intervalId = setInterval(() => {
                this.removeDuplicateButtons();
                this.forceAvatarUpdate();
            }, 3000);
        },

        // Enhanced duplicate button removal
        removeDuplicateButtons: function() {
            const buttons = document.querySelectorAll('.chatbot-button, #chatbot-button');
            
            if (buttons.length <= 1) {
                return; // No duplicates
            }
            
            console.log(`🗑️ Found ${buttons.length} chatbot buttons, removing duplicates...`);
            
            // Keep the first properly positioned button
            let keptButton = null;
            
            buttons.forEach((button, index) => {
                if (index === 0) {
                    keptButton = button;
                    // Ensure proper styling
                    this.ensureButtonStyling(button);
                } else {
                    console.log(`🗑️ Removing duplicate button ${index + 1}`);
                    button.remove();
                }
            });
            
            // Ensure the kept button has proper ID
            if (keptButton && !keptButton.id) {
                keptButton.id = 'chatbot-button';
            }
        },

        // Ensure proper button styling
        ensureButtonStyling: function(button) {
            if (!button) return;
            
            // Apply essential styles
            button.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 60px !important;
                height: 60px !important;
                border-radius: 50% !important;
                background: #e8f24c !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                z-index: 999999 !important;
                transition: all 0.3s ease !important;
            `;
        },

        // Load target avatar from multiple sources
        loadTargetAvatar: function() {
            const sources = [
                localStorage.getItem('chatbot-widget-avatar'),
                localStorage.getItem('chatbot-current-avatar'),
                localStorage.getItem('dashboard-avatar-cache'),
                sessionStorage.getItem('chatbot-avatar-current')
            ];

            // Try direct sources first
            for (const source of sources) {
                if (source && this.isValidAvatar(source)) {
                    this.targetAvatar = this.makeAbsoluteUrl(source);
                    console.log('🎯 Target avatar loaded from storage:', this.targetAvatar.substring(0, 50) + '...');
                    return;
                }
            }

            // Try settings object
            try {
                const settings = localStorage.getItem('fooodis-chatbot-settings');
                if (settings) {
                    const parsed = JSON.parse(settings);
                    if (parsed.avatar && this.isValidAvatar(parsed.avatar)) {
                        this.targetAvatar = this.makeAbsoluteUrl(parsed.avatar);
                        console.log('🎯 Target avatar from settings:', this.targetAvatar.substring(0, 50) + '...');
                        return;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse chatbot settings for avatar');
            }

            // Fallback to config file
            this.fetchConfigAvatar();
        },

        // Fetch avatar from config file
        fetchConfigAvatar: async function() {
            try {
                const response = await fetch('/chatbot-config.json');
                if (response.ok) {
                    const config = await response.json();
                    if (config.avatar && this.isValidAvatar(config.avatar)) {
                        this.targetAvatar = this.makeAbsoluteUrl(config.avatar);
                        console.log('🎯 Target avatar from config:', this.targetAvatar.substring(0, 50) + '...');
                        this.forceAvatarUpdate();
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch config avatar:', error);
            }
        },

        // Enhanced DOM observer
        setupDOMObserver: function() {
            if (this.observer) {
                this.observer.disconnect();
            }

            this.observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;
                
                mutations.forEach((mutation) => {
                    // Check for added nodes
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // Check if chatbot elements were added
                                if (node.classList?.contains('chatbot-button') ||
                                    node.classList?.contains('chatbot-avatar') ||
                                    node.id === 'chatbot-button' ||
                                    node.querySelector && (
                                        node.querySelector('.chatbot-button') ||
                                        node.querySelector('#chatbot-button') ||
                                        node.querySelector('.chatbot-avatar')
                                    )) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                    }
                    
                    // Check for attribute changes on images
                    if (mutation.type === 'attributes' && 
                        mutation.target.tagName === 'IMG' &&
                        mutation.target.closest('.chatbot-avatar, .chatbot-button, #chatbot-button')) {
                        shouldUpdate = true;
                    }
                });

                if (shouldUpdate) {
                    console.log('🔄 Chatbot DOM change detected, applying fixes...');
                    setTimeout(() => {
                        this.removeDuplicateButtons();
                        this.forceAvatarUpdate();
                    }, 100);
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'class', 'id']
            });
        },

        // Enhanced avatar update
        forceAvatarUpdate: function() {
            // First, ensure no duplicates
            this.removeDuplicateButtons();
            
            if (!this.targetAvatar) {
                console.log('🔄 No target avatar available yet');
                return;
            }

            const selectors = [
                '.chatbot-avatar img',
                '#chatbot-button img',
                '.chatbot-button img',
                '.chatbot-avatar-small img',
                '[class*="avatar"] img'
            ];

            let updatedCount = 0;

            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== this.targetAvatar) {
                        console.log(`🔄 Updating avatar: ${selector}`);
                        img.src = this.targetAvatar;
                        img.style.cssText = `
                            display: block !important;
                            object-fit: cover !important;
                            width: 100% !important;
                            height: 100% !important;
                            border-radius: 50% !important;
                            background-color: #e8f24c !important;
                        `;
                        updatedCount++;
                    }
                });
            });

            // Update chatbot config objects
            if (window.FoodisChatbot) {
                if (window.FoodisChatbot.config && window.FoodisChatbot.config.avatar !== this.targetAvatar) {
                    window.FoodisChatbot.config.avatar = this.targetAvatar;
                    console.log('✅ Updated FoodisChatbot config avatar');
                }
                
                if (window.FoodisChatbot.currentAgent && window.FoodisChatbot.currentAgent.avatar !== this.targetAvatar) {
                    window.FoodisChatbot.currentAgent.avatar = this.targetAvatar;
                    console.log('✅ Updated current agent avatar');
                }
            }

            if (updatedCount > 0) {
                console.log(`✅ Avatar override applied to ${updatedCount} elements`);
            }
        },

        // Validate avatar URL
        isValidAvatar: function(url) {
            if (!url || typeof url !== 'string' || url.trim() === '') return false;
            
            return url.startsWith('data:image/') || 
                   url.startsWith('http://') || 
                   url.startsWith('https://') || 
                   url.startsWith('/') || 
                   url.startsWith('./') ||
                   url.startsWith('images/') ||
                   url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
        },

        // Make URL absolute
        makeAbsoluteUrl: function(url) {
            if (!url) return url;
            
            if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            const baseUrl = window.location.origin;
            
            if (url.startsWith('./')) {
                return baseUrl + '/' + url.substring(2);
            } else if (url.startsWith('/')) {
                return baseUrl + url;
            } else if (url.startsWith('images/')) {
                return baseUrl + '/' + url;
            } else {
                return baseUrl + '/images/avatars/' + url;
            }
        },

        // Cleanup method
        cleanup: function() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            this.isInitialized = false;
        }
    };

    // Initialize when DOM is ready
    function initializeOverride() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => AvatarOverride.init(), 500);
            });
        } else {
            setTimeout(() => AvatarOverride.init(), 500);
        }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        AvatarOverride.cleanup();
    });

    // Make globally available
    window.ChatbotAvatarOverride = AvatarOverride;

    // Initialize
    initializeOverride();

    console.log('✅ Enhanced Chatbot Avatar Override loaded');
})();
