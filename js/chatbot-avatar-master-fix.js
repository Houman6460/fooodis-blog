
/**
 * 🎯 CHATBOT AVATAR MASTER FIX
 * Comprehensive solution for all avatar display issues
 */

(function() {
    'use strict';

    console.log('🎯 Master Avatar Fix loading...');

    const MasterAvatarFix = {
        targetAvatar: null,
        observers: [],
        intervalId: null,
        isInitialized: false,
        retryCount: 0,
        maxRetries: 20,
        
        // Avatar sources in priority order
        avatarSources: [
            'chatbot-widget-avatar',
            'fooodis-chatbot-settings',
            'chatbot-current-avatar',
            'dashboard-avatar-cache',
            'chatbot-config-avatar'
        ],

        init: function() {
            if (this.isInitialized) {
                console.log('🎯 Master Avatar Fix already initialized');
                return;
            }

            this.isInitialized = true;
            console.log('🎯 Initializing Master Avatar Fix...');

            // Step 1: Load target avatar from all possible sources
            this.loadTargetAvatar();

            // Step 2: Clean up any existing duplicate buttons immediately
            this.removeDuplicateButtons();

            // Step 3: Apply avatar immediately
            this.forceAvatarUpdate();

            // Step 4: Set up monitoring
            this.setupComprehensiveMonitoring();

            // Step 5: Start periodic enforcement
            this.startPeriodicEnforcement();
        },

        loadTargetAvatar: function() {
            console.log('🔍 Loading target avatar from all sources...');

            // Try each source in priority order
            for (const sourceKey of this.avatarSources) {
                let avatarUrl = null;

                try {
                    if (sourceKey === 'fooodis-chatbot-settings') {
                        const settings = localStorage.getItem(sourceKey);
                        if (settings) {
                            const parsed = JSON.parse(settings);
                            avatarUrl = parsed.avatar;
                        }
                    } else {
                        avatarUrl = localStorage.getItem(sourceKey);
                    }

                    if (avatarUrl && this.isValidAvatar(avatarUrl)) {
                        this.targetAvatar = this.makeAbsoluteUrl(avatarUrl);
                        console.log(`✅ Target avatar loaded from ${sourceKey}:`, this.targetAvatar.substring(0, 50) + '...');
                        return;
                    }
                } catch (error) {
                    console.warn(`Failed to load avatar from ${sourceKey}:`, error);
                }
            }

            // Try fetching from config file as fallback
            this.fetchConfigAvatar();
        },

        fetchConfigAvatar: async function() {
            try {
                console.log('🌐 Fetching avatar from config file...');
                const response = await fetch('/chatbot-config.json');
                if (response.ok) {
                    const config = await response.json();
                    if (config.avatar && this.isValidAvatar(config.avatar)) {
                        this.targetAvatar = this.makeAbsoluteUrl(config.avatar);
                        console.log('✅ Avatar loaded from config file');
                        this.forceAvatarUpdate();
                        this.storeAvatarInAllSources(this.targetAvatar);
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch config avatar:', error);
                // Use default avatar as last resort
                this.targetAvatar = this.getDefaultAvatar();
                console.log('🔄 Using default avatar as fallback');
            }
        },

        storeAvatarInAllSources: function(avatarUrl) {
            if (!this.isValidAvatar(avatarUrl)) return;

            try {
                const absoluteUrl = this.makeAbsoluteUrl(avatarUrl);

                // Store in all direct sources
                this.avatarSources.forEach(sourceKey => {
                    if (sourceKey === 'fooodis-chatbot-settings') {
                        const existing = localStorage.getItem(sourceKey);
                        let settings = {};
                        try {
                            settings = existing ? JSON.parse(existing) : {};
                        } catch (e) {}
                        settings.avatar = absoluteUrl;
                        localStorage.setItem(sourceKey, JSON.stringify(settings));
                    } else {
                        localStorage.setItem(sourceKey, absoluteUrl);
                    }
                });

                // Also store in sessionStorage for immediate access
                sessionStorage.setItem('chatbot-avatar-current', absoluteUrl);

                console.log('💾 Avatar stored in all sources');
            } catch (error) {
                console.error('Error storing avatar:', error);
            }
        },

        removeDuplicateButtons: function() {
            const buttons = document.querySelectorAll('.chatbot-button, #chatbot-button');
            
            if (buttons.length <= 1) return;

            console.log(`🗑️ Found ${buttons.length} chatbot buttons, removing duplicates...`);

            // Keep the first properly positioned button
            let keptButton = buttons[0];
            
            // Remove all others
            for (let i = 1; i < buttons.length; i++) {
                console.log(`🗑️ Removing duplicate button ${i + 1}`);
                buttons[i].remove();
            }

            // Ensure the kept button has proper styling and ID
            if (keptButton) {
                if (!keptButton.id) keptButton.id = 'chatbot-button';
                this.ensureButtonStyling(keptButton);
            }
        },

        ensureButtonStyling: function(button) {
            if (!button) return;

            // Apply essential styles to prevent issues
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

        forceAvatarUpdate: function() {
            if (!this.targetAvatar) {
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`🔄 No target avatar yet, retry ${this.retryCount}/${this.maxRetries}`);
                    setTimeout(() => {
                        this.loadTargetAvatar();
                        this.forceAvatarUpdate();
                    }, 1000);
                }
                return;
            }

            console.log('🔄 Forcing avatar update with:', this.targetAvatar.substring(0, 50) + '...');

            // First ensure no duplicates
            this.removeDuplicateButtons();

            // Update all avatar images with comprehensive selectors
            const selectors = [
                '.chatbot-avatar img',
                '#chatbot-button img',
                '.chatbot-button img',
                '.chatbot-avatar-small img',
                '[class*="avatar"] img',
                '.fooodis-chatbot img',
                '.chatbot-widget img',
                '.chatbot img'
            ];

            let updatedCount = 0;

            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== this.targetAvatar) {
                        console.log(`🔄 Updating avatar via selector: ${selector}`);
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

            // Update chatbot config objects if they exist
            this.updateChatbotConfigs();

            if (updatedCount > 0) {
                console.log(`✅ Avatar update applied to ${updatedCount} elements`);
            }

            // Trigger custom event for other systems
            window.dispatchEvent(new CustomEvent('avatarUpdated', {
                detail: { avatar: this.targetAvatar }
            }));
        },

        updateChatbotConfigs: function() {
            // Update FoodisChatbot object if it exists
            if (window.FoodisChatbot) {
                if (window.FoodisChatbot.config) {
                    window.FoodisChatbot.config.avatar = this.targetAvatar;
                    console.log('✅ Updated FoodisChatbot.config.avatar');
                }
                
                if (window.FoodisChatbot.currentAgent) {
                    window.FoodisChatbot.currentAgent.avatar = this.targetAvatar;
                    console.log('✅ Updated FoodisChatbot.currentAgent.avatar');
                }

                // Call update methods if they exist
                if (typeof window.FoodisChatbot.updateAvatar === 'function') {
                    window.FoodisChatbot.updateAvatar(this.targetAvatar);
                    console.log('✅ Called FoodisChatbot.updateAvatar()');
                }

                if (typeof window.FoodisChatbot.setupAllAvatars === 'function') {
                    window.FoodisChatbot.setupAllAvatars();
                    console.log('✅ Called FoodisChatbot.setupAllAvatars()');
                }
            }

            // Update any other global chatbot objects
            if (window.chatbotManager && window.chatbotManager.settings) {
                window.chatbotManager.settings.avatar = this.targetAvatar;
                console.log('✅ Updated chatbotManager.settings.avatar');
            }
        },

        setupComprehensiveMonitoring: function() {
            // Monitor for DOM changes
            const domObserver = new MutationObserver((mutations) => {
                let shouldUpdate = false;

                mutations.forEach((mutation) => {
                    if (mutation.addedNodes) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) {
                                // Check if chatbot elements were added
                                if (this.isChatbotElement(node)) {
                                    shouldUpdate = true;
                                }
                            }
                        });
                    }

                    // Check for attribute changes on images
                    if (mutation.type === 'attributes' && 
                        mutation.target.tagName === 'IMG' &&
                        this.isChatbotElement(mutation.target)) {
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

            domObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'class', 'id']
            });

            this.observers.push(domObserver);

            // Monitor for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot'))) {
                    console.log('🔄 Avatar storage change detected');
                    setTimeout(() => {
                        this.loadTargetAvatar();
                        this.forceAvatarUpdate();
                    }, 100);
                }
            });

            // Monitor for custom events
            window.addEventListener('chatbotAvatarUpdated', (e) => {
                if (e.detail && e.detail.avatar) {
                    console.log('🔄 Custom avatar update event received');
                    this.targetAvatar = this.makeAbsoluteUrl(e.detail.avatar);
                    this.storeAvatarInAllSources(this.targetAvatar);
                    this.forceAvatarUpdate();
                }
            });
        },

        startPeriodicEnforcement: function() {
            // Clear any existing interval
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            // Check and enforce every 3 seconds
            this.intervalId = setInterval(() => {
                this.removeDuplicateButtons();
                this.forceAvatarUpdate();
            }, 3000);
        },

        isChatbotElement: function(element) {
            if (!element || !element.classList) return false;

            const chatbotClasses = ['chatbot-button', 'chatbot-avatar', 'chatbot-widget', 'fooodis-chatbot'];
            const chatbotIds = ['chatbot-button', 'chatbot-widget'];

            return chatbotClasses.some(cls => element.classList.contains(cls)) ||
                   chatbotIds.includes(element.id) ||
                   element.querySelector && (
                       element.querySelector('.chatbot-button') ||
                       element.querySelector('#chatbot-button') ||
                       element.querySelector('.chatbot-avatar')
                   );
        },

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

        getDefaultAvatar: function() {
            return 'data:image/svg+xml;base64,' + btoa(`
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="32" fill="#e8f24c"/>
                    <circle cx="32" cy="24" r="8" fill="#1e2127"/>
                    <path d="M 35 35 Q 40 38 45 35" stroke="#1e2127" stroke-width="1" fill="none"/>
                    <path d="M 28 55 Q 40 65 52 55" fill="#e74c3c"/>
                    <rect x="35" y="45" width="10" height="15" fill="#2C3E50"/>
                    <text x="40" y="72" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">Assistant</text>
                </svg>
            `);
        },

        cleanup: function() {
            this.observers.forEach(observer => observer.disconnect());
            this.observers = [];
            
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            this.isInitialized = false;
        }
    };

    // Initialize when DOM is ready
    function initializeMasterFix() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => MasterAvatarFix.init(), 500);
            });
        } else {
            setTimeout(() => MasterAvatarFix.init(), 500);
        }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        MasterAvatarFix.cleanup();
    });

    // Make globally available
    window.MasterAvatarFix = MasterAvatarFix;

    // Initialize immediately
    initializeMasterFix();

    console.log('✅ Master Avatar Fix loaded and ready');
})();
