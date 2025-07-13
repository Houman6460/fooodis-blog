
/**
 * 🖼️ CHATBOT AVATAR DISPLAY FIX
 * Ensures uploaded avatars are properly displayed in the chatbot widget
 */

(function() {
    'use strict';

    console.log('🖼️ Chatbot Avatar Display Fix loading...');

    const AvatarDisplayFix = {
        targetAvatar: null,
        retryCount: 0,
        maxRetries: 10,
        
        init: function() {
            console.log('🔄 Initializing avatar display fix...');
            
            // Load target avatar immediately
            this.loadTargetAvatar();
            
            // Wait for chatbot to be ready
            this.waitForChatbot();
            
            // Set up periodic checks with increasing intervals
            setTimeout(() => this.forceAvatarUpdate(), 500);
            setTimeout(() => this.forceAvatarUpdate(), 1000);
            setTimeout(() => this.forceAvatarUpdate(), 2000);
            
            // Set up regular monitoring
            setInterval(() => this.checkAndFixAvatars(), 3000);
            
            // Listen for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('chatbot') || e.key.includes('avatar'))) {
                    console.log('🔄 Storage change detected, refreshing avatars...');
                    this.loadTargetAvatar();
                    setTimeout(() => this.forceAvatarUpdate(), 500);
                }
            });

            // Listen for DOM changes
            this.setupDOMObserver();
        },

        loadTargetAvatar: function() {
            // Try multiple sources for uploaded avatar
            const sources = [
                'fooodis-chatbot-settings',
                'chatbot-settings-backup',
                'chatbot-avatar-settings',
                'chatbot-widget-avatar',
                'chatbot-current-avatar',
                'dashboard-avatar-cache'
            ];

            for (const key of sources) {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        let avatarUrl = null;
                        
                        if (key.includes('settings')) {
                            const parsed = JSON.parse(stored);
                            avatarUrl = parsed.avatar;
                        } else {
                            avatarUrl = stored;
                        }
                        
                        if (avatarUrl && this.isValidUploadedAvatar(avatarUrl)) {
                            this.targetAvatar = this.makeAbsoluteUrl(avatarUrl);
                            console.log('🎯 Found target avatar from', key + ':', this.targetAvatar.substring(0, 50) + '...');
                            return;
                        }
                    }
                } catch (error) {
                    console.warn('Error parsing', key + ':', error);
                }
            }
            
            console.warn('⚠️ No uploaded avatar found in storage');
            this.targetAvatar = null;
        },

        isValidUploadedAvatar: function(url) {
            if (!url || typeof url !== 'string' || url.trim() === '') return false;
            
            // Skip default SVG avatars - we want uploaded images only
            if (url.includes('data:image/svg+xml')) return false;
            
            return url.startsWith('data:image/') || 
                   url.startsWith('http://') || 
                   url.startsWith('https://') || 
                   url.startsWith('/') || 
                   url.startsWith('./') ||
                   url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        },

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
            } else {
                return baseUrl + '/' + url;
            }
        },

        waitForChatbot: function() {
            if (window.FoodisChatbot && window.FoodisChatbot.widget) {
                console.log('✅ Chatbot found, applying avatar fix...');
                setTimeout(() => this.forceAvatarUpdate(), 1000);
            } else {
                console.log('⏳ Waiting for chatbot...');
                setTimeout(() => this.waitForChatbot(), 1000);
            }
        },

        forceAvatarUpdate: function() {
            if (!this.targetAvatar) {
                this.loadTargetAvatar();
                if (!this.targetAvatar) {
                    console.log('⚠️ No target avatar available for update');
                    return;
                }
            }

            console.log('🔄 Forcing avatar update with:', this.targetAvatar.substring(0, 50) + '...');

            // Update chatbot config if available
            if (window.FoodisChatbot) {
                if (window.FoodisChatbot.config) {
                    window.FoodisChatbot.config.avatar = this.targetAvatar;
                }
                if (window.FoodisChatbot.currentAgent) {
                    window.FoodisChatbot.currentAgent.avatar = this.targetAvatar;
                }
            }

            // Update all avatar images
            this.updateAllAvatarImages(this.targetAvatar);
        },

        updateAllAvatarImages: function(avatarUrl) {
            const selectors = [
                '.chatbot-avatar img',
                '.chatbot-avatar-header img', 
                '.chatbot-avatar-small img',
                '.message-avatar img',
                '#chatbot-button img',
                '.chatbot-button img'
            ];

            let updatedCount = 0;

            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach((img, index) => {
                    if (img.src !== avatarUrl) {
                        console.log(`🖼️ Updating ${selector} [${index}]`);
                        
                        // Create a new image to test loading first
                        const testImg = new Image();
                        testImg.onload = () => {
                            // Success - update the actual image
                            img.src = avatarUrl;
                            img.style.display = 'block';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '50%';
                            img.style.width = '100%';
                            img.style.height = '100%';
                            console.log(`✅ Avatar updated successfully for ${selector} [${index}]`);
                        };
                        
                        testImg.onerror = () => {
                            console.warn(`❌ Avatar failed to load for ${selector} [${index}]:`, avatarUrl);
                        };
                        
                        testImg.src = avatarUrl;
                        updatedCount++;
                    }
                });
            });

            if (updatedCount > 0) {
                console.log(`✅ Attempted to update ${updatedCount} avatar images`);
            } else {
                console.log('ℹ️ All avatars already using target URL');
            }
        },

        checkAndFixAvatars: function() {
            if (!this.targetAvatar) return;

            // Check if any avatars are showing defaults when they should show uploaded
            const avatarImages = document.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-header img, .message-avatar img, #chatbot-button img');
            let needsUpdate = false;

            avatarImages.forEach(img => {
                if (img.src.includes('data:image/svg+xml') || 
                    !img.src.includes(this.targetAvatar) ||
                    img.src === '' ||
                    img.naturalWidth === 0) {
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                console.log('🔧 Avatar mismatch detected, fixing...');
                this.updateAllAvatarImages(this.targetAvatar);
            }
        },

        setupDOMObserver: function() {
            if (this.observer) return;
            
            this.observer = new MutationObserver((mutations) => {
                let avatarChanged = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.querySelector) {
                                if (node.querySelector('.chatbot-avatar img') || 
                                    node.querySelector('#chatbot-button img') ||
                                    node.classList?.contains('chatbot-avatar')) {
                                    avatarChanged = true;
                                }
                            }
                        });
                    }
                });

                if (avatarChanged) {
                    console.log('🔄 Avatar DOM change detected, applying fix...');
                    setTimeout(() => this.forceAvatarUpdate(), 100);
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => AvatarDisplayFix.init(), 500);
        });
    } else {
        setTimeout(() => AvatarDisplayFix.init(), 500);
    }

    // Make globally available
    window.ChatbotAvatarDisplayFix = AvatarDisplayFix;

    console.log('✅ Enhanced Chatbot Avatar Display Fix loaded');
})();
