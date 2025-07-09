
/**
 * 🎯 UNIFIED CHATBOT AVATAR FIX
 * Single optimized solution for all avatar display issues
 */

(function() {
    'use strict';

    console.log('🎯 Unified Chatbot Avatar Fix loading...');

    const UnifiedAvatarFix = {
        targetAvatar: null,
        isProcessing: false,
        retryCount: 0,
        maxRetries: 5,
        
        // Throttled update function to prevent performance issues
        updateThrottled: null,
        lastUpdate: 0,
        updateDelay: 100,
        
        init: function() {
            console.log('🔄 Initializing unified avatar fix...');
            
            // Create throttled update function
            this.updateThrottled = this.throttle(this.performUpdate.bind(this), this.updateDelay);
            
            // Load target avatar
            this.loadTargetAvatar();
            
            // Initial update
            this.scheduleUpdate();
            
            // Set up efficient monitoring
            this.setupMonitoring();
            
            // Clean up any conflicting scripts
            this.cleanupConflictingScripts();
        },

        loadTargetAvatar: function() {
            const sources = [
                { key: 'fooodis-chatbot-settings', prop: 'avatar' },
                { key: 'chatbot-widget-avatar', direct: true },
                { key: 'chatbot-current-avatar', direct: true },
                { key: 'dashboard-avatar-cache', direct: true }
            ];

            for (const source of sources) {
                try {
                    const stored = localStorage.getItem(source.key);
                    if (!stored) continue;
                    
                    let avatarUrl = source.direct ? stored : JSON.parse(stored)[source.prop];
                    
                    if (this.isValidUploadedAvatar(avatarUrl)) {
                        this.targetAvatar = this.makeAbsoluteUrl(avatarUrl);
                        console.log('🎯 Target avatar loaded:', this.targetAvatar.substring(0, 50) + '...');
                        return;
                    }
                } catch (error) {
                    console.warn(`Could not parse ${source.key}:`, error);
                }
            }
            
            console.log('📭 No uploaded avatar found');
        },

        isValidUploadedAvatar: function(url) {
            if (!url || typeof url !== 'string' || url.trim() === '') return false;
            if (url.includes('data:image/svg+xml')) return false; // Skip default SVG
            
            return url.startsWith('data:image/') || 
                   url.startsWith('http') || 
                   url.startsWith('/') || 
                   url.startsWith('./') ||
                   url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        },

        makeAbsoluteUrl: function(url) {
            if (!url || url.startsWith('data:') || url.startsWith('http')) return url;
            
            const baseUrl = window.location.origin;
            if (url.startsWith('./')) return baseUrl + '/' + url.substring(2);
            if (url.startsWith('/')) return baseUrl + url;
            return baseUrl + '/' + url;
        },

        scheduleUpdate: function() {
            if (this.isProcessing) return;
            requestAnimationFrame(() => this.updateThrottled());
        },

        performUpdate: function() {
            if (this.isProcessing || !this.targetAvatar) return;
            
            this.isProcessing = true;
            const now = Date.now();
            
            try {
                // Update chatbot configuration
                this.updateChatbotConfig();
                
                // Update DOM elements efficiently
                this.updateAvatarElements();
                
                // Store avatar for persistence
                this.storeAvatar();
                
                console.log('✅ Avatar update completed');
                this.retryCount = 0;
            } catch (error) {
                console.error('❌ Avatar update failed:', error);
                this.handleUpdateError();
            } finally {
                this.isProcessing = false;
                this.lastUpdate = now;
            }
        },

        updateChatbotConfig: function() {
            if (!window.FoodisChatbot) return;
            
            if (window.FoodisChatbot.config) {
                window.FoodisChatbot.config.avatar = this.targetAvatar;
            }
            
            if (window.FoodisChatbot.currentAgent) {
                window.FoodisChatbot.currentAgent.avatar = this.targetAvatar;
            }
        },

        updateAvatarElements: function() {
            const selectors = [
                '.chatbot-avatar img',
                '.chatbot-avatar-header img', 
                '.message-avatar img',
                '#chatbot-button img'
            ];

            // Use document fragment for efficient DOM updates
            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== this.targetAvatar) {
                        this.updateSingleImage(img);
                    }
                });
            });
        },

        updateSingleImage: function(img) {
            // Pre-load image to avoid broken displays
            const tempImg = new Image();
            tempImg.onload = () => {
                img.src = this.targetAvatar;
                img.style.display = 'block';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%';
            };
            tempImg.onerror = () => {
                console.warn('❌ Failed to load avatar:', this.targetAvatar);
            };
            tempImg.src = this.targetAvatar;
        },

        storeAvatar: function() {
            try {
                localStorage.setItem('chatbot-current-avatar', this.targetAvatar);
                localStorage.setItem('dashboard-avatar-cache', this.targetAvatar);
            } catch (error) {
                console.warn('Could not store avatar:', error);
            }
        },

        handleUpdateError: function() {
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.isProcessing = false;
                    this.scheduleUpdate();
                }, Math.min(1000 * this.retryCount, 5000));
            }
        },

        setupMonitoring: function() {
            // Listen for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot'))) {
                    this.loadTargetAvatar();
                    this.scheduleUpdate();
                }
            });

            // Efficient DOM observer
            if (this.observer) return;
            
            this.observer = new MutationObserver(this.throttle((mutations) => {
                let needsUpdate = false;
                
                for (const mutation of mutations) {
                    if (mutation.addedNodes?.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1 && node.querySelector) {
                                if (node.querySelector('.chatbot-avatar, #chatbot-button')) {
                                    needsUpdate = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (needsUpdate) break;
                }

                if (needsUpdate) {
                    this.scheduleUpdate();
                }
            }, 200));

            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        cleanupConflictingScripts: function() {
            // Remove other avatar fix scripts to prevent conflicts
            const conflictingScripts = [
                'ChatbotAvatarDisplayFix',
                'ChatbotAvatarSync', 
                'AvatarOverride'
            ];
            
            conflictingScripts.forEach(script => {
                if (window[script]) {
                    console.log(`🧹 Cleaning up conflicting script: ${script}`);
                    try {
                        if (window[script].observer) {
                            window[script].observer.disconnect();
                        }
                        delete window[script];
                    } catch (error) {
                        console.warn(`Could not clean up ${script}:`, error);
                    }
                }
            });
        },

        // Utility function for throttling
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => UnifiedAvatarFix.init(), 100);
        });
    } else {
        setTimeout(() => UnifiedAvatarFix.init(), 100);
    }

    // Make globally available
    window.UnifiedAvatarFix = UnifiedAvatarFix;

    console.log('✅ Unified Chatbot Avatar Fix loaded');
})();
