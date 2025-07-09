
/**
 * 🔧 CHATBOT AVATAR OVERRIDE
 * Forces the correct avatar to be displayed on all pages
 */

(function() {
    'use strict';

    console.log('🔧 Chatbot Avatar Override loading...');

    const AvatarOverride = {
        // Target avatar URL from storage or config
        targetAvatar: null,
        
        // Observer for DOM changes
        observer: null,
        
        // Initialize the override system
        init: function() {
            // Remove duplicates first
            this.removeDuplicateButtons();
            
            this.loadTargetAvatar();
            this.setupDOMObserver();
            this.forceAvatarUpdate();
            
            // Set up periodic checks
            setInterval(() => this.forceAvatarUpdate(), 2000);
        },

        // Load the target avatar from storage
        loadTargetAvatar: function() {
            const sources = [
                localStorage.getItem('chatbot-widget-avatar'),
                localStorage.getItem('chatbot-current-avatar'),
                localStorage.getItem('dashboard-avatar-cache'),
                sessionStorage.getItem('chatbot-avatar-current')
            ];

            for (const source of sources) {
                if (source && this.isValidAvatar(source)) {
                    this.targetAvatar = this.makeAbsoluteUrl(source);
                    console.log('🎯 Target avatar loaded:', this.targetAvatar.substring(0, 50) + '...');
                    return;
                }
            }

            // Try to get from settings
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
                console.warn('Failed to parse settings for avatar');
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

        // Set up DOM observer to catch avatar changes
        setupDOMObserver: function() {
            this.observer = new MutationObserver((mutations) => {
                let avatarChanged = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // Check if chatbot avatar elements were added
                                if (node.querySelector && 
                                    (node.querySelector('.chatbot-avatar img') || 
                                     node.querySelector('#chatbot-button img') ||
                                     node.classList?.contains('chatbot-avatar'))) {
                                    avatarChanged = true;
                                }
                            }
                        });
                    }
                    
                    // Check for attribute changes on existing avatar images
                    if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
                        const img = mutation.target;
                        if (img.closest('.chatbot-avatar') || img.closest('#chatbot-button')) {
                            avatarChanged = true;
                        }
                    }
                });

                if (avatarChanged) {
                    console.log('🔄 Avatar DOM change detected, applying override...');
                    setTimeout(() => this.forceAvatarUpdate(), 100);
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src']
            });
        },

        // Force avatar update on all chatbot elements and remove duplicates
        forceAvatarUpdate: function() {
            // First, remove duplicate chatbot buttons
            this.removeDuplicateButtons();
            
            if (!this.targetAvatar) return;

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
                        img.style.display = 'block';
                        img.style.objectFit = 'cover';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.borderRadius = '50%';
                        updatedCount++;
                    }
                });
            });

            // Also update chatbot config if available
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

        // Remove duplicate chatbot buttons
        removeDuplicateButtons: function() {
            const buttons = document.querySelectorAll('.chatbot-button, #chatbot-button');
            if (buttons.length > 1) {
                console.log(`🗑️ Found ${buttons.length} chatbot buttons, removing duplicates...`);
                
                // Keep only the first one, remove the rest
                for (let i = 1; i < buttons.length; i++) {
                    buttons[i].remove();
                    console.log(`🗑️ Removed duplicate chatbot button ${i + 1}`);
                }
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
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => AvatarOverride.init(), 500);
        });
    } else {
        setTimeout(() => AvatarOverride.init(), 500);
    }

    // Make globally available
    window.ChatbotAvatarOverride = AvatarOverride;

    console.log('✅ Chatbot Avatar Override loaded');
})();
