
/**
 * 🔄 CHATBOT AVATAR SYNCHRONIZATION
 * Ensures avatar consistency across all pages
 */

(function() {
    'use strict';

    console.log('🔄 Chatbot Avatar Sync loading...');

    // Avatar synchronization manager
    const AvatarSync = {
        // Get avatar from any available source
        getStoredAvatar: function() {
            const sources = [
                // Direct avatar storage
                { key: 'chatbot-widget-avatar', direct: true },
                
                // Settings with avatar property
                { key: 'fooodis-chatbot-settings', property: 'avatar' },
                { key: 'chatbot-settings-backup', property: 'avatar' },
                { key: 'chatbot-avatar-settings', property: 'avatar' },
                
                // Config file backup
                { key: 'chatbot-config-avatar', direct: true }
            ];

            for (const source of sources) {
                try {
                    const stored = localStorage.getItem(source.key);
                    if (stored) {
                        if (source.direct) {
                            if (this.isValidAvatar(stored)) {
                                console.log(`📥 Found avatar from ${source.key}:`, stored.substring(0, 50) + '...');
                                return stored;
                            }
                        } else {
                            const parsed = JSON.parse(stored);
                            if (parsed && parsed[source.property] && this.isValidAvatar(parsed[source.property])) {
                                console.log(`📥 Found avatar from ${source.key}.${source.property}:`, parsed[source.property].substring(0, 50) + '...');
                                return parsed[source.property];
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to parse ${source.key}:`, error);
                }
            }

            return null;
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

        // Store avatar in all relevant locations
        storeAvatar: function(avatarUrl) {
            if (!this.isValidAvatar(avatarUrl)) return;

            try {
                // Direct storage
                localStorage.setItem('chatbot-widget-avatar', avatarUrl);
                localStorage.setItem('chatbot-config-avatar', avatarUrl);

                // Update main settings
                const settingsKeys = ['fooodis-chatbot-settings', 'chatbot-settings-backup'];
                settingsKeys.forEach(key => {
                    const existing = localStorage.getItem(key);
                    if (existing) {
                        try {
                            const settings = JSON.parse(existing);
                            settings.avatar = avatarUrl;
                            localStorage.setItem(key, JSON.stringify(settings));
                        } catch (e) {
                            console.warn(`Could not update ${key} with avatar`);
                        }
                    }
                });

                // Create dedicated avatar settings
                const avatarSettings = {
                    avatar: avatarUrl,
                    timestamp: Date.now(),
                    page: window.location.pathname,
                    userAgent: navigator.userAgent.substring(0, 100)
                };
                localStorage.setItem('chatbot-avatar-settings', JSON.stringify(avatarSettings));

                console.log('💾 Avatar stored in all locations:', avatarUrl.substring(0, 50) + '...');
            } catch (error) {
                console.error('Error storing avatar:', error);
            }
        },

        // Apply avatar to chatbot if available
        applyToWidget: function() {
            const avatar = this.getStoredAvatar();
            if (!avatar) {
                console.log('📭 No stored avatar found');
                return;
            }

            console.log('🔄 Applying stored avatar to widget...');

            // Wait for chatbot to be available
            const applyAvatar = () => {
                if (window.FoodisChatbot) {
                    if (typeof window.FoodisChatbot.updateAvatar === 'function') {
                        window.FoodisChatbot.updateAvatar(avatar);
                        console.log('✅ Avatar applied to chatbot widget');
                    } else if (window.FoodisChatbot.config) {
                        window.FoodisChatbot.config.avatar = avatar;
                        console.log('✅ Avatar applied to chatbot config');
                    }
                } else {
                    setTimeout(applyAvatar, 100);
                }
            };

            // Apply immediately if chatbot exists, otherwise wait
            if (window.FoodisChatbot) {
                applyAvatar();
            } else {
                setTimeout(applyAvatar, 500);
            }
        },

        // Listen for avatar changes from other pages
        setupCrossPageSync: function() {
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot'))) {
                    console.log('🔄 Avatar change detected from another page');
                    setTimeout(() => this.applyToWidget(), 100);
                }
            });

            // Also listen for custom events
            window.addEventListener('chatbotAvatarUpdated', (e) => {
                if (e.detail && e.detail.avatar) {
                    this.storeAvatar(e.detail.avatar);
                    this.applyToWidget();
                }
            });
        }
    };

    // Initialize avatar sync
    function initAvatarSync() {
        console.log('🔄 Initializing avatar synchronization...');
        
        AvatarSync.setupCrossPageSync();
        
        // Apply stored avatar after a short delay to ensure chatbot is loaded
        setTimeout(() => {
            AvatarSync.applyToWidget();
        }, 1000);

        // Make AvatarSync globally available
        window.ChatbotAvatarSync = AvatarSync;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarSync);
    } else {
        initAvatarSync();
    }

    console.log('✅ Chatbot Avatar Sync loaded');
})();
