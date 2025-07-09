/**
 * 🔄 CHATBOT AVATAR SYNCHRONIZATION
 * Ensures avatar consistency across all pages with immediate application
 */

(function() {
    'use strict';

    console.log('🔄 Enhanced Chatbot Avatar Sync loading...');

    const AvatarSync = {
        getStoredAvatar: function() {
            const sources = [
                // Settings with avatar property (prioritize these for uploaded avatars)
                { key: 'fooodis-chatbot-settings', property: 'avatar' },
                { key: 'chatbot-settings-backup', property: 'avatar' },
                { key: 'chatbot-avatar-settings', property: 'avatar' },

                // Direct avatar storage
                { key: 'chatbot-widget-avatar', direct: true },
                { key: 'chatbot-config-avatar', direct: true },
                { key: 'chatbot-current-avatar', direct: true },
                { key: 'dashboard-avatar-cache', direct: true }
            ];

            // First pass: look for uploaded avatars (non-SVG)
            for (const source of sources) {
                try {
                    const stored = localStorage.getItem(source.key);
                    if (stored) {
                        let avatarUrl = null;

                        if (source.direct) {
                            avatarUrl = stored;
                        } else {
                            const parsed = JSON.parse(stored);
                            avatarUrl = parsed[source.property];
                        }

                        if (avatarUrl && this.isValidUploadedAvatar(avatarUrl)) {
                            console.log(`📥 Found uploaded avatar from ${source.key}:`, avatarUrl.substring(0, 50) + '...');
                            return this.makeAbsoluteUrl(avatarUrl);
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to parse ${source.key}:`, error);
                }
            }

            console.log('📭 No uploaded avatar found in storage');
            return null;
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

            if (url.startsWith('data:') || 
                url.startsWith('http://') || 
                url.startsWith('https://')) {
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

        storeAvatar: function(avatarUrl) {
            if (!this.isValidUploadedAvatar(avatarUrl)) return;

            try {
                const absoluteUrl = this.makeAbsoluteUrl(avatarUrl);

                // Store in multiple locations
                localStorage.setItem('chatbot-widget-avatar', absoluteUrl);
                localStorage.setItem('chatbot-config-avatar', absoluteUrl);
                localStorage.setItem('chatbot-current-avatar', absoluteUrl);
                localStorage.setItem('dashboard-avatar-cache', absoluteUrl);

                // Update main settings
                const settingsKeys = ['fooodis-chatbot-settings', 'chatbot-settings-backup'];
                settingsKeys.forEach(key => {
                    const existing = localStorage.getItem(key);
                    if (existing) {
                        try {
                            const settings = JSON.parse(existing);
                            settings.avatar = absoluteUrl;
                            localStorage.setItem(key, JSON.stringify(settings));
                        } catch (e) {
                            console.warn(`Could not update ${key} with avatar`);
                        }
                    }
                });

                console.log('💾 Avatar stored in all locations:', absoluteUrl.substring(0, 50) + '...');

                // Trigger custom event
                window.dispatchEvent(new CustomEvent('chatbotAvatarStored', {
                    detail: { avatar: absoluteUrl }
                }));

            } catch (error) {
                console.error('Error storing avatar:', error);
            }
        },

        applyToWidget: function() {
            const avatar = this.getStoredAvatar();
            if (!avatar) {
                console.log('📭 No uploaded avatar found for application');
                return;
            }

            console.log('🔄 Applying avatar to widget:', avatar.substring(0, 50) + '...');
            this.applyAvatarToWidget(avatar);
        },

        applyAvatarToWidget: function(avatar) {
            let retryCount = 0;
            const maxRetries = 15;

            const applyAvatar = () => {
                retryCount++;

                // Try multiple methods to apply avatar
                let applied = false;

                // Method 1: Direct widget update
                if (window.FoodisChatbot) {
                    if (typeof window.FoodisChatbot.updateAvatar === 'function') {
                        window.FoodisChatbot.updateAvatar(avatar);
                        applied = true;
                        console.log('✅ Avatar applied via updateAvatar method');
                    }

                    if (window.FoodisChatbot.config) {
                        window.FoodisChatbot.config.avatar = avatar;
                        applied = true;
                        console.log('✅ Avatar applied to chatbot config');
                    }

                    if (window.FoodisChatbot.currentAgent) {
                        window.FoodisChatbot.currentAgent.avatar = avatar;
                        console.log('✅ Avatar applied to current agent');
                    }
                }

                // Method 2: Direct DOM update
                const avatarImages = document.querySelectorAll('.chatbot-avatar img, .chatbot-avatar-header img, .message-avatar img, #chatbot-button img');
                if (avatarImages.length > 0) {
                    avatarImages.forEach((img, index) => {
                        if (img.src !== avatar) {
                            img.src = avatar;
                            img.style.display = 'block';
                            img.style.objectFit = 'cover';
                            img.style.borderRadius = '50%';
                            console.log(`✅ Avatar applied to DOM element ${index + 1}`);
                        }
                    });
                    applied = true;
                }

                // Method 3: Call setup functions
                if (window.FoodisChatbot && window.FoodisChatbot.setupAllAvatars) {
                    setTimeout(() => {
                        window.FoodisChatbot.setupAllAvatars();
                        console.log('✅ All avatars refreshed via setupAllAvatars');
                    }, 100);
                    applied = true;
                }

                if (applied) {
                    this.storeAvatar(avatar);
                    console.log('✅ Avatar application completed successfully');
                    return;
                }

                // Retry if not applied and within retry limit
                if (retryCount < maxRetries) {
                    const delay = Math.min(200 * retryCount, 2000);
                    console.log(`⏳ Avatar not applied, retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
                    setTimeout(applyAvatar, delay);
                } else {
                    console.warn('⚠️ Failed to apply avatar after', maxRetries, 'attempts');
                }
            };

            applyAvatar();
        },

        setupCrossPageSync: function() {
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot'))) {
                    console.log('🔄 Avatar change detected from another page');
                    setTimeout(() => this.applyToWidget(), 100);
                }
            });

            window.addEventListener('chatbotAvatarUpdated', (e) => {
                if (e.detail && e.detail.avatar) {
                    console.log('🔄 Avatar update event received');
                    this.storeAvatar(e.detail.avatar);
                    this.applyToWidget();
                }
            });
        }
    };

    function initAvatarSync() {
        console.log('🔄 Initializing enhanced avatar synchronization...');

        const currentPage = window.location.pathname;
        console.log('📍 Current page:', currentPage);

        AvatarSync.setupCrossPageSync();

        // Immediate application
        setTimeout(() => AvatarSync.applyToWidget(), 200);

        // Follow-up applications with increasing delays
        setTimeout(() => AvatarSync.applyToWidget(), 1000);
        setTimeout(() => AvatarSync.applyToWidget(), 3000);

        // Periodic check
        setInterval(() => {
            if (window.FoodisChatbot && !window.FoodisChatbot.config?.avatar) {
                console.log('🔄 Avatar missing, reapplying...');
                AvatarSync.applyToWidget();
            }
        }, 5000);

        // Make globally available
        window.ChatbotAvatarSync = AvatarSync;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarSync);
    } else {
        initAvatarSync();
    }

    console.log('✅ Enhanced Chatbot Avatar Sync loaded');
})();