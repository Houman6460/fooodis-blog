
/**
 * 🎯 OPTIMIZED UNIFIED CHATBOT AVATAR FIX
 * Single efficient solution for avatar display with proper z-index management
 */

(function() {
    'use strict';

    console.log('🎯 Optimized Unified Chatbot Avatar Fix loading...');

    const UnifiedAvatarFix = {
        targetAvatar: null,
        isProcessing: false,
        retryCount: 0,
        maxRetries: 3,
        
        // Performance optimization
        updateQueue: [],
        isUpdating: false,
        lastUpdate: 0,
        updateDelay: 250, // Reduced frequency
        
        init: function() {
            console.log('🔄 Initializing optimized avatar fix...');
            
            // Load target avatar
            this.loadTargetAvatar();
            
            // Set up efficient monitoring with debouncing
            this.setupOptimizedMonitoring();
            
            // Initial update with delay to avoid blocking
            setTimeout(() => this.scheduleUpdate(), 500);
            
            // Clean up conflicting scripts
            this.cleanupConflictingScripts();
        },

        loadTargetAvatar: function() {
            const sources = [
                { key: 'fooodis-chatbot-settings', prop: 'avatar' },
                { key: 'chatbot-widget-avatar', direct: true },
                { key: 'chatbot-current-avatar', direct: true }
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
                    // Silent fail, continue to next source
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
            if (this.isProcessing || !this.targetAvatar) return;
            
            // Use requestAnimationFrame for better performance
            if (!this.isUpdating) {
                this.isUpdating = true;
                requestAnimationFrame(() => {
                    this.performUpdate();
                    this.isUpdating = false;
                });
            }
        },

        performUpdate: function() {
            if (this.isProcessing || !this.targetAvatar) return;
            
            this.isProcessing = true;
            const now = Date.now();
            
            try {
                // Update chatbot configuration efficiently
                this.updateChatbotConfig();
                
                // Update DOM elements with batching
                this.updateAvatarElementsBatched();
                
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

        updateAvatarElementsBatched: function() {
            const selectors = [
                '.chatbot-avatar img',
                '.chatbot-avatar-header img', 
                '.message-avatar img',
                '#chatbot-button img'
            ];

            // Create document fragment for efficient DOM manipulation
            const updates = [];
            
            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== this.targetAvatar) {
                        updates.push(img);
                    }
                });
            });

            // Batch DOM updates
            if (updates.length > 0) {
                updates.forEach(img => this.updateSingleImageOptimized(img));
                console.log(`✅ Updated ${updates.length} avatar images`);
            }
        },

        updateSingleImageOptimized: function(img) {
            // Apply proper z-index management
            const parent = img.closest('.chatbot-avatar, .chatbot-button, #chatbot-button');
            if (parent) {
                // Use reasonable z-index values
                parent.style.zIndex = '1002';
            }
            
            // Pre-load image efficiently
            if (img.src !== this.targetAvatar) {
                img.src = this.targetAvatar;
                img.style.display = 'block';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%';
                
                // Remove excessive z-index
                img.style.zIndex = 'inherit';
            }
        },

        storeAvatar: function() {
            try {
                localStorage.setItem('chatbot-current-avatar', this.targetAvatar);
            } catch (error) {
                // Silent fail for storage issues
            }
        },

        handleUpdateError: function() {
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.isProcessing = false;
                    this.scheduleUpdate();
                }, Math.min(2000 * this.retryCount, 10000));
            }
        },

        setupOptimizedMonitoring: function() {
            // Listen for storage changes with debouncing
            let storageTimeout;
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot'))) {
                    clearTimeout(storageTimeout);
                    storageTimeout = setTimeout(() => {
                        this.loadTargetAvatar();
                        this.scheduleUpdate();
                    }, 100);
                }
            });

            // Optimized DOM observer with debouncing
            if (this.observer) return;
            
            let observerTimeout;
            this.observer = new MutationObserver(() => {
                clearTimeout(observerTimeout);
                observerTimeout = setTimeout(() => {
                    this.scheduleUpdate();
                }, 200);
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false // Disable attribute watching for performance
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
                        // Silent cleanup
                    }
                }
            });

            // Clean up excessive z-index values
            this.cleanupZIndexValues();
        },

        cleanupZIndexValues: function() {
            // Find and fix elements with excessive z-index
            const highZIndexElements = document.querySelectorAll('[style*="z-index"]');
            highZIndexElements.forEach(el => {
                const style = el.style.zIndex;
                if (style && parseInt(style) > 1500) {
                    // Reset to reasonable value
                    if (el.classList.contains('chatbot-widget') || 
                        el.classList.contains('chatbot-button') ||
                        el.id === 'chatbot-button') {
                        el.style.zIndex = '1002';
                    } else {
                        el.style.zIndex = '1000';
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

    // Initialize when DOM is ready with delay to avoid blocking
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => UnifiedAvatarFix.init(), 200);
        });
    } else {
        setTimeout(() => UnifiedAvatarFix.init(), 200);
    }

    // Make globally available
    window.UnifiedAvatarFix = UnifiedAvatarFix;

    console.log('✅ Optimized Unified Chatbot Avatar Fix loaded');
})();
