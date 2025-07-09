
/**
 * 🔄 CHATBOT AVATAR SYNCHRONIZATION
 * Ensures avatar consistency across all pages
 */

(function() {
    'use strict';

    console.log('🔄 Chatbot Avatar Sync loading...');

    // Avatar synchronization manager
    const AvatarSync = {
        // Get avatar from any available source with enhanced detection
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

            for (const source of sources) {
                try {
                    const stored = localStorage.getItem(source.key);
                    if (stored) {
                        if (source.direct) {
                            if (this.isValidAvatar(stored) && !stored.includes('data:image/svg+xml')) {
                                console.log(`📥 Found uploaded avatar from ${source.key}:`, stored.substring(0, 50) + '...');
                                return this.makeAbsoluteUrl(stored);
                            }
                        } else {
                            const parsed = JSON.parse(stored);
                            if (parsed && parsed[source.property] && this.isValidAvatar(parsed[source.property])) {
                                // Prioritize non-default avatars (uploaded ones)
                                if (!parsed[source.property].includes('data:image/svg+xml')) {
                                    console.log(`📥 Found uploaded avatar from ${source.key}.${source.property}:`, parsed[source.property].substring(0, 50) + '...');
                                    return this.makeAbsoluteUrl(parsed[source.property]);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to parse ${source.key}:`, error);
                }
            }

            // Second pass: look for any valid avatar (including defaults)
            for (const source of sources) {
                try {
                    const stored = localStorage.getItem(source.key);
                    if (stored) {
                        if (source.direct) {
                            if (this.isValidAvatar(stored)) {
                                console.log(`📥 Found fallback avatar from ${source.key}:`, stored.substring(0, 50) + '...');
                                return this.makeAbsoluteUrl(stored);
                            }
                        } else {
                            const parsed = JSON.parse(stored);
                            if (parsed && parsed[source.property] && this.isValidAvatar(parsed[source.property])) {
                                console.log(`📥 Found fallback avatar from ${source.key}.${source.property}:`, parsed[source.property].substring(0, 50) + '...');
                                return this.makeAbsoluteUrl(parsed[source.property]);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to parse ${source.key}:`, error);
                }
            }

            // Try to fetch from server as last resort
            console.log('📥 No local avatar found, trying server config...');
            this.fetchServerAvatar();
            return null;
        },

        // Convert relative URLs to absolute for consistent loading
        makeAbsoluteUrl: function(url) {
            if (!url) return url;
            
            // Already absolute or data URI
            if (url.startsWith('data:') || 
                url.startsWith('http://') || 
                url.startsWith('https://')) {
                return url;
            }
            
            // Get base URL
            const baseUrl = window.location.origin;
            
            // Convert relative paths
            if (url.startsWith('./')) {
                return baseUrl + '/' + url.substring(2);
            } else if (url.startsWith('/')) {
                return baseUrl + url;
            } else if (url.startsWith('images/')) {
                return baseUrl + '/' + url;
            } else {
                // Assume it's in images/avatars/
                return baseUrl + '/images/avatars/' + url;
            }
        },

        // Fetch avatar from server config
        fetchServerAvatar: async function() {
            try {
                const response = await fetch('/chatbot-config.json');
                if (response.ok) {
                    const config = await response.json();
                    if (config.avatar && this.isValidAvatar(config.avatar)) {
                        const avatarUrl = this.makeAbsoluteUrl(config.avatar);
                        console.log('📥 Found avatar from server config:', avatarUrl.substring(0, 50) + '...');
                        this.storeAvatar(avatarUrl);
                        return avatarUrl;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch server avatar:', error);
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

        // Store avatar in all relevant locations with enhanced persistence
        storeAvatar: function(avatarUrl) {
            if (!this.isValidAvatar(avatarUrl)) return;

            try {
                // Make URL absolute before storing
                const absoluteUrl = this.makeAbsoluteUrl(avatarUrl);
                
                // Direct storage
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
                    } else {
                        // Create new settings if none exist
                        const newSettings = {
                            avatar: absoluteUrl,
                            enabled: true,
                            chatbotName: 'Fooodis Assistant'
                        };
                        localStorage.setItem(key, JSON.stringify(newSettings));
                    }
                });

                // Create dedicated avatar settings with enhanced metadata
                const avatarSettings = {
                    avatar: absoluteUrl,
                    timestamp: Date.now(),
                    page: window.location.pathname,
                    hostname: window.location.hostname,
                    userAgent: navigator.userAgent.substring(0, 100),
                    sessionId: Date.now() + Math.random().toString(36).substr(2, 9)
                };
                localStorage.setItem('chatbot-avatar-settings', JSON.stringify(avatarSettings));

                // Also store in sessionStorage for immediate access
                sessionStorage.setItem('chatbot-avatar-current', absoluteUrl);

                console.log('💾 Avatar stored in all locations:', absoluteUrl.substring(0, 50) + '...');
                
                // Trigger custom event for other components
                window.dispatchEvent(new CustomEvent('chatbotAvatarStored', {
                    detail: { avatar: absoluteUrl }
                }));
                
            } catch (error) {
                console.error('Error storing avatar:', error);
            }
        },

        // Apply avatar to chatbot if available with enhanced retry logic
        applyToWidget: function() {
            const avatar = this.getStoredAvatar();
            if (!avatar) {
                console.log('📭 No stored avatar found, trying server...');
                // Try to get from server and then apply
                this.fetchServerAvatar().then(serverAvatar => {
                    if (serverAvatar) {
                        this.applyAvatarToWidget(serverAvatar);
                    }
                });
                return;
            }

            console.log('🔄 Applying stored avatar to widget:', avatar.substring(0, 50) + '...');
            this.applyAvatarToWidget(avatar);
        },

        // Apply specific avatar URL to widget with retry logic
        applyAvatarToWidget: function(avatar) {
            let retryCount = 0;
            const maxRetries = 10;

            const applyAvatar = () => {
                retryCount++;
                
                if (window.FoodisChatbot) {
                    // Try multiple application methods
                    let applied = false;
                    
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
                    
                    // Force update of current agent avatar
                    if (window.FoodisChatbot.currentAgent) {
                        window.FoodisChatbot.currentAgent.avatar = avatar;
                        console.log('✅ Avatar applied to current agent');
                    }
                    
                    // Update all avatar images directly
                    if (window.FoodisChatbot.setupAllAvatars) {
                        setTimeout(() => {
                            window.FoodisChatbot.setupAllAvatars();
                            console.log('✅ All avatars refreshed');
                        }, 100);
                    }
                    
                    if (applied) {
                        // Store for persistence
                        this.storeAvatar(avatar);
                        return;
                    }
                }

                // Retry if not applied and within retry limit
                if (retryCount < maxRetries) {
                    const delay = Math.min(100 * retryCount, 1000);
                    setTimeout(applyAvatar, delay);
                } else {
                    console.warn('⚠️ Failed to apply avatar after', maxRetries, 'attempts');
                }
            };

            applyAvatar();
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

    // Initialize avatar sync with page detection
    function initAvatarSync() {
        console.log('🔄 Initializing avatar synchronization...');
        
        // Detect current page for better handling
        const currentPage = window.location.pathname;
        const isBlogPage = currentPage.includes('blog.html') || currentPage.endsWith('blog');
        const isDashboardPage = currentPage.includes('dashboard.html') || currentPage.endsWith('dashboard');
        
        console.log('📍 Current page detected:', currentPage, { isBlogPage, isDashboardPage });
        
        AvatarSync.setupCrossPageSync();
        
        // Different timing based on page type
        if (isBlogPage) {
            // Blog page needs more time for all scripts to load
            console.log('📖 Blog page detected, using enhanced avatar sync...');
            
            // Try immediate application
            setTimeout(() => AvatarSync.applyToWidget(), 500);
            
            // Retry after chatbot should be fully loaded
            setTimeout(() => AvatarSync.applyToWidget(), 2000);
            
            // Final retry to ensure it's applied
            setTimeout(() => AvatarSync.applyToWidget(), 5000);
            
        } else if (isDashboardPage) {
            // Dashboard page - standard timing
            setTimeout(() => AvatarSync.applyToWidget(), 1000);
        } else {
            // Other pages - quick application
            setTimeout(() => AvatarSync.applyToWidget(), 500);
        }

        // Make AvatarSync globally available
        window.ChatbotAvatarSync = AvatarSync;
        
        // Set up periodic check for blog pages
        if (isBlogPage) {
            setInterval(() => {
                if (window.FoodisChatbot && !window.FoodisChatbot.config.avatar) {
                    console.log('🔄 Avatar missing on blog page, reapplying...');
                    AvatarSync.applyToWidget();
                }
            }, 3000);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarSync);
    } else {
        initAvatarSync();
    }

    console.log('✅ Chatbot Avatar Sync loaded');
})();
