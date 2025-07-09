
/**
 * 🖼️ CHATBOT AVATAR DISPLAY FIX
 * Ensures uploaded avatars are properly displayed in the chatbot widget
 */

(function() {
    'use strict';

    console.log('🖼️ Chatbot Avatar Display Fix loading...');

    const AvatarDisplayFix = {
        init: function() {
            // Wait for chatbot to be ready
            this.waitForChatbot();
            
            // Set up periodic checks
            setInterval(() => this.checkAndFixAvatars(), 3000);
            
            // Listen for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key && e.key.includes('chatbot') && e.key.includes('settings')) {
                    console.log('🔄 Settings changed, refreshing avatars...');
                    setTimeout(() => this.forceAvatarRefresh(), 500);
                }
            });
        },

        waitForChatbot: function() {
            if (window.FoodisChatbot && window.FoodisChatbot.widget) {
                console.log('✅ Chatbot found, applying avatar fix...');
                setTimeout(() => this.forceAvatarRefresh(), 1000);
            } else {
                console.log('⏳ Waiting for chatbot...');
                setTimeout(() => this.waitForChatbot(), 1000);
            }
        },

        getUploadedAvatar: function() {
            // Check multiple sources for uploaded avatar
            const sources = [
                'fooodis-chatbot-settings',
                'chatbot-settings-backup',
                'chatbot-avatar-settings'
            ];

            for (const key of sources) {
                try {
                    const settings = localStorage.getItem(key);
                    if (settings) {
                        const parsed = JSON.parse(settings);
                        if (parsed.avatar && !parsed.avatar.includes('data:image/svg+xml')) {
                            console.log('🖼️ Found uploaded avatar:', parsed.avatar.substring(0, 50) + '...');
                            return this.makeAbsoluteUrl(parsed.avatar);
                        }
                    }
                } catch (error) {
                    console.warn('Error parsing settings:', error);
                }
            }

            return null;
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

        forceAvatarRefresh: function() {
            if (!window.FoodisChatbot || !window.FoodisChatbot.widget) {
                console.log('⚠️ Chatbot not available for avatar refresh');
                return;
            }

            const uploadedAvatar = this.getUploadedAvatar();
            if (!uploadedAvatar) {
                console.log('⚠️ No uploaded avatar found');
                return;
            }

            console.log('🔄 Forcing avatar refresh with:', uploadedAvatar.substring(0, 50) + '...');

            // Update chatbot config
            if (window.FoodisChatbot.config) {
                window.FoodisChatbot.config.avatar = uploadedAvatar;
            }

            // Update current agent
            if (window.FoodisChatbot.currentAgent) {
                window.FoodisChatbot.currentAgent.avatar = uploadedAvatar;
            }

            // Find and update all avatar images
            this.updateAllAvatarImages(uploadedAvatar);

            // Call chatbot's setup function if available
            if (typeof window.FoodisChatbot.setupAllAvatars === 'function') {
                window.FoodisChatbot.setupAllAvatars();
            }
        },

        updateAllAvatarImages: function(avatarUrl) {
            const selectors = [
                '.chatbot-avatar img',
                '.chatbot-avatar-header img', 
                '.chatbot-avatar-small img',
                '.message-avatar img',
                '#chatbot-button img'
            ];

            let updatedCount = 0;

            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== avatarUrl) {
                        console.log(`🖼️ Updating ${selector}`);
                        
                        // Set up error handler
                        img.onerror = () => {
                            console.warn('Avatar failed to load, keeping current');
                        };
                        
                        img.onload = () => {
                            console.log('✅ Avatar updated successfully');
                        };
                        
                        // Update image
                        img.src = avatarUrl;
                        img.style.display = 'block';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '50%';
                        updatedCount++;
                    }
                });
            });

            if (updatedCount > 0) {
                console.log(`✅ Updated ${updatedCount} avatar images`);
            }
        },

        checkAndFixAvatars: function() {
            if (!window.FoodisChatbot || !window.FoodisChatbot.widget) {
                return;
            }

            const uploadedAvatar = this.getUploadedAvatar();
            if (!uploadedAvatar) {
                return;
            }

            // Check if any avatars are showing defaults when they should show uploaded
            const avatarImages = document.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-header img, .message-avatar img');
            let needsUpdate = false;

            avatarImages.forEach(img => {
                if (img.src.includes('data:image/svg+xml') || !img.src.includes(uploadedAvatar)) {
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                console.log('🔧 Avatar mismatch detected, fixing...');
                this.updateAllAvatarImages(uploadedAvatar);
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => AvatarDisplayFix.init(), 1000);
        });
    } else {
        setTimeout(() => AvatarDisplayFix.init(), 1000);
    }

    // Make globally available
    window.ChatbotAvatarDisplayFix = AvatarDisplayFix;

    console.log('✅ Chatbot Avatar Display Fix loaded');
})();
