/**
 * Chatbot Avatar Unified Fix
 * Resolves avatar display corruption and loading issues
 */

(function() {
    'use strict';

    console.log('🖼️ Chatbot Avatar Fix: Initializing...');

    class AvatarManager {
        constructor() {
            this.defaultAvatars = [
                '/images/avatars/sarah.jpg',
                '/images/avatars/alex.jpg',
                '/images/avatars/david.jpg',
                '/images/avatars/emma.jpg',
                '/images/avatars/lisa.jpg',
                '/images/avatars/mike.jpg'
            ];
            this.fallbackAvatar = '/images/avatars/default.jpg';
            this.init();
        }

        init() {
            this.fixCorruptedAvatars();
            this.setupAvatarValidation();
            this.setupDOMObserver();
        }

        fixCorruptedAvatars() {
            console.log('🔧 Fixing corrupted avatar data...');

            // Fix localStorage corruption
            const keys = ['chatbot-settings', 'fooodis-chatbot-settings', 'avatar-settings'];

            keys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        if (parsed.avatar && this.isCorruptedBase64(parsed.avatar)) {
                            console.log(`🔄 Replacing corrupted avatar in ${key}`);
                            parsed.avatar = this.getRandomDefaultAvatar();
                            localStorage.setItem(key, JSON.stringify(parsed));
                        }
                    }
                } catch (error) {
                    console.warn(`Error processing ${key}:`, error);
                    localStorage.removeItem(key);
                }
            });

            // Fix DOM avatar elements
            this.fixDOMImages();
        }

        isCorruptedBase64(data) {
            if (!data || typeof data !== 'string') return false;

            // Check for truncated or corrupted base64
            if (data.startsWith('data:image/')) {
                const base64Part = data.split(',')[1];
                if (!base64Part || base64Part.includes('[TRUNCATED]') || base64Part.length < 100) {
                    return true;
                }

                // Try to validate base64
                try {
                    atob(base64Part);
                    return false;
                } catch (e) {
                    return true;
                }
            }

            return false;
        }

        getRandomDefaultAvatar() {
            return this.defaultAvatars[Math.floor(Math.random() * this.defaultAvatars.length)];
        }

        fixDOMImages() {
            console.log('🖼️ Fixing DOM avatar images...');

            const avatarSelectors = [
                '.chatbot-avatar img',
                '.header-avatar',
                '.avatar-preview',
                '.chatbot-toggle img',
                '[src*="base64"]'
            ];

            avatarSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(img => {
                    if (img.src && this.isCorruptedBase64(img.src)) {
                        console.log('🔄 Replacing corrupted DOM avatar');
                        img.src = this.getRandomDefaultAvatar();
                    }
                });
            });
        }

        setupAvatarValidation() {
            // Override image loading to validate avatars
            const originalSetAttribute = HTMLImageElement.prototype.setAttribute;

            HTMLImageElement.prototype.setAttribute = function(name, value) {
                if (name === 'src' && value && this.closest('.chatbot-avatar, .header-avatar, .avatar-preview')) {
                    if (window.avatarManager && window.avatarManager.isCorruptedBase64(value)) {
                        value = window.avatarManager.getRandomDefaultAvatar();
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };

            // Add error handlers for avatar images
            document.addEventListener('error', (e) => {
                if (e.target.tagName === 'IMG' && e.target.closest('.chatbot-avatar, .header-avatar, .avatar-preview')) {
                    console.log('🚨 Avatar load error, using fallback');
                    e.target.src = this.fallbackAvatar;
                }
            }, true);
        }

        setupDOMObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const avatarImages = node.querySelectorAll ? 
                                node.querySelectorAll('.chatbot-avatar img, .header-avatar, .avatar-preview') : [];

                            avatarImages.forEach(img => {
                                if (img.src && this.isCorruptedBase64(img.src)) {
                                    img.src = this.getRandomDefaultAvatar();
                                }
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Clean up all avatar storage
        cleanStorage() {
            console.log('🧹 Cleaning avatar storage...');

            const keys = Object.keys(localStorage).filter(key => 
                key.includes('avatar') || key.includes('chatbot')
            );

            keys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    const parsed = JSON.parse(data);

                    if (parsed.avatar && this.isCorruptedBase64(parsed.avatar)) {
                        parsed.avatar = this.getRandomDefaultAvatar();
                        localStorage.setItem(key, JSON.stringify(parsed));
                    }
                } catch (error) {
                    console.warn(`Removing corrupted key: ${key}`);
                    localStorage.removeItem(key);
                }
            });
        }

        // Get clean avatar settings
        getCleanAvatarSettings() {
            const settings = {
                avatar: this.getRandomDefaultAvatar(),
                name: 'Fooodis Support',
                welcomeMessage: 'Hello! Welcome to Fooodis. How can I help you today?'
            };

            // Save clean settings
            localStorage.setItem('chatbot-settings', JSON.stringify(settings));

            return settings;
        }
    }

    // Initialize avatar manager
    window.avatarManager = new AvatarManager();

    // Provide global cleanup function
    window.fixAvatarCorruption = () => {
        window.avatarManager.cleanStorage();
        window.avatarManager.fixDOMImages();
        console.log('✅ Avatar corruption fix complete');
    };

    console.log('✅ Chatbot Avatar Fix: Initialized successfully');

})();