
/**
 * 🎯 COMPLETE CHATBOT AVATAR MANAGEMENT SYSTEM
 * Handles main chatbot avatar, agent avatars, and proper display across all pages
 */

(function() {
    'use strict';

    console.log('🎯 Complete Avatar Management System loading...');

    const CompleteAvatarManager = {
        // Configuration
        isInitialized: false,
        currentAvatar: null,
        currentAgent: null,
        observers: [],
        intervalId: null,
        retryCount: 0,
        maxRetries: 15,
        
        // Avatar sources in priority order
        avatarSources: [
            'fooodis-chatbot-settings',    // Main settings with agent data
            'chatbot-widget-avatar',       // Direct widget avatar
            'chatbot-current-avatar',      // Current avatar cache
            'dashboard-avatar-cache',      // Dashboard cache
            'chatbot-config-avatar'        // Config file avatar
        ],

        init: function() {
            if (this.isInitialized) {
                console.log('🎯 Avatar Manager already initialized');
                return;
            }

            this.isInitialized = true;
            console.log('🎯 Initializing Complete Avatar Management...');

            // Step 1: Load all avatar data
            this.loadAvatarData();

            // Step 2: Clean up duplicates immediately
            this.removeDuplicateButtons();

            // Step 3: Apply current avatar
            this.applyCurrentAvatar();

            // Step 4: Setup monitoring
            this.setupComprehensiveMonitoring();

            // Step 5: Start periodic enforcement
            this.startPeriodicEnforcement();

            // Step 6: Setup agent rotation if enabled
            this.setupAgentRotation();
        },

        loadAvatarData: function() {
            console.log('📂 Loading avatar data from all sources...');

            // First, try to get current agent and avatar from settings
            try {
                const settingsStr = localStorage.getItem('fooodis-chatbot-settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    console.log('📋 Found chatbot settings:', {
                        hasAgents: !!(settings.agents && settings.agents.length),
                        agentCount: settings.agents ? settings.agents.length : 0,
                        hasMainAvatar: !!settings.avatar,
                        enableMultiple: settings.enableMultipleAgents
                    });

                    // If multiple agents are enabled and we have agents
                    if (settings.enableMultipleAgents && settings.agents && settings.agents.length > 0) {
                        // Get current agent or select random one
                        this.currentAgent = this.selectCurrentAgent(settings.agents);
                        if (this.currentAgent && this.currentAgent.avatar) {
                            this.currentAvatar = this.makeAbsoluteUrl(this.currentAgent.avatar);
                            console.log('👤 Using agent avatar:', this.currentAgent.name, this.currentAvatar.substring(0, 50) + '...');
                            this.storeCurrentAvatar(this.currentAvatar);
                            return;
                        }
                    }

                    // Fallback to main chatbot avatar
                    if (settings.avatar) {
                        this.currentAvatar = this.makeAbsoluteUrl(settings.avatar);
                        console.log('🤖 Using main chatbot avatar:', this.currentAvatar.substring(0, 50) + '...');
                        this.storeCurrentAvatar(this.currentAvatar);
                        return;
                    }
                }
            } catch (error) {
                console.warn('Error loading settings:', error);
            }

            // Try other sources
            for (const sourceKey of this.avatarSources) {
                try {
                    const stored = localStorage.getItem(sourceKey);
                    if (stored && this.isValidAvatar(stored)) {
                        this.currentAvatar = this.makeAbsoluteUrl(stored);
                        console.log(`✅ Avatar loaded from ${sourceKey}`);
                        this.storeCurrentAvatar(this.currentAvatar);
                        return;
                    }
                } catch (error) {
                    console.warn(`Failed to load from ${sourceKey}:`, error);
                }
            }

            // Try config file as last resort
            this.fetchConfigAvatar();
        },

        selectCurrentAgent: function(agents) {
            // Filter active agents
            const activeAgents = agents.filter(agent => agent.status === 'active' || !agent.status);
            
            if (activeAgents.length === 0) {
                console.log('⚠️ No active agents found');
                return null;
            }

            // Check if we have a stored current agent
            try {
                const storedAgentId = localStorage.getItem('chatbot-current-agent-id');
                if (storedAgentId) {
                    const storedAgent = activeAgents.find(a => a.id === storedAgentId);
                    if (storedAgent) {
                        console.log('🔄 Using stored current agent:', storedAgent.name);
                        return storedAgent;
                    }
                }
            } catch (error) {
                console.warn('Error loading stored agent:', error);
            }

            // Select random agent
            const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
            console.log('🎲 Selected random agent:', randomAgent.name);
            
            // Store for next time
            localStorage.setItem('chatbot-current-agent-id', randomAgent.id);
            
            return randomAgent;
        },

        fetchConfigAvatar: async function() {
            try {
                console.log('🌐 Fetching avatar from config file...');
                const response = await fetch('/chatbot-config.json');
                if (response.ok) {
                    const config = await response.json();
                    if (config.avatar && this.isValidAvatar(config.avatar)) {
                        this.currentAvatar = this.makeAbsoluteUrl(config.avatar);
                        console.log('✅ Avatar loaded from config file');
                        this.storeCurrentAvatar(this.currentAvatar);
                        this.applyCurrentAvatar();
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch config avatar:', error);
                // Use default avatar as absolute last resort
                this.currentAvatar = this.getDefaultAvatar();
                console.log('🔄 Using default avatar as fallback');
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

        applyCurrentAvatar: function() {
            if (!this.currentAvatar) {
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`🔄 No avatar yet, retry ${this.retryCount}/${this.maxRetries}`);
                    setTimeout(() => {
                        this.loadAvatarData();
                        this.applyCurrentAvatar();
                    }, 1000);
                }
                return;
            }

            console.log('🖼️ Applying avatar:', this.currentAvatar.substring(0, 50) + '...');

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
                '.chatbot img',
                '.agent-avatar img'
            ];

            let updatedCount = 0;

            selectors.forEach(selector => {
                const images = document.querySelectorAll(selector);
                images.forEach(img => {
                    if (img.src !== this.currentAvatar) {
                        console.log(`🔄 Updating avatar via selector: ${selector}`);
                        img.src = this.currentAvatar;
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

            // Update chatbot config objects
            this.updateChatbotConfigs();

            if (updatedCount > 0) {
                console.log(`✅ Avatar applied to ${updatedCount} elements`);
            }

            // Trigger custom events
            window.dispatchEvent(new CustomEvent('avatarUpdated', {
                detail: { 
                    avatar: this.currentAvatar,
                    agent: this.currentAgent
                }
            }));
        },

        updateChatbotConfigs: function() {
            // Update FoodisChatbot object if it exists
            if (window.FoodisChatbot) {
                if (window.FoodisChatbot.config) {
                    window.FoodisChatbot.config.avatar = this.currentAvatar;
                    if (this.currentAgent) {
                        window.FoodisChatbot.config.currentAgent = this.currentAgent;
                    }
                    console.log('✅ Updated FoodisChatbot.config');
                }
                
                if (window.FoodisChatbot.currentAgent) {
                    window.FoodisChatbot.currentAgent.avatar = this.currentAvatar;
                    console.log('✅ Updated FoodisChatbot.currentAgent');
                }

                // Call update methods if they exist
                if (typeof window.FoodisChatbot.updateAvatar === 'function') {
                    window.FoodisChatbot.updateAvatar(this.currentAvatar);
                    console.log('✅ Called FoodisChatbot.updateAvatar()');
                }

                if (typeof window.FoodisChatbot.setupAllAvatars === 'function') {
                    window.FoodisChatbot.setupAllAvatars();
                    console.log('✅ Called FoodisChatbot.setupAllAvatars()');
                }
            }

            // Update any other global chatbot objects
            if (window.chatbotManager && window.chatbotManager.settings) {
                window.chatbotManager.settings.avatar = this.currentAvatar;
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
                        this.applyCurrentAvatar();
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
                if (e.key && (e.key.includes('avatar') || e.key.includes('chatbot') || e.key.includes('agent'))) {
                    console.log('🔄 Avatar/agent storage change detected');
                    setTimeout(() => {
                        this.loadAvatarData();
                        this.applyCurrentAvatar();
                    }, 100);
                }
            });

            // Monitor for custom events
            window.addEventListener('chatbotAvatarUpdated', (e) => {
                if (e.detail && e.detail.avatar) {
                    console.log('🔄 Custom avatar update event received');
                    this.currentAvatar = this.makeAbsoluteUrl(e.detail.avatar);
                    this.storeCurrentAvatar(this.currentAvatar);
                    this.applyCurrentAvatar();
                }
            });

            // Monitor for agent changes
            window.addEventListener('chatbotAgentChanged', (e) => {
                if (e.detail && e.detail.agent) {
                    console.log('🔄 Agent change event received');
                    this.currentAgent = e.detail.agent;
                    if (this.currentAgent.avatar) {
                        this.currentAvatar = this.makeAbsoluteUrl(this.currentAgent.avatar);
                        this.storeCurrentAvatar(this.currentAvatar);
                        this.applyCurrentAvatar();
                    }
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
                this.applyCurrentAvatar();
            }, 3000);
        },

        setupAgentRotation: function() {
            // Optional: Setup agent rotation for multiple agent scenarios
            try {
                const settings = JSON.parse(localStorage.getItem('fooodis-chatbot-settings') || '{}');
                if (settings.enableMultipleAgents && settings.agents && settings.agents.length > 1) {
                    console.log('🔄 Multiple agents enabled, setting up rotation...');
                    
                    // Setup rotation every 5 minutes (optional feature)
                    if (settings.enableAgentRotation) {
                        setInterval(() => {
                            this.rotateAgent();
                        }, 5 * 60 * 1000); // 5 minutes
                    }
                }
            } catch (error) {
                console.warn('Error setting up agent rotation:', error);
            }
        },

        rotateAgent: function() {
            try {
                const settings = JSON.parse(localStorage.getItem('fooodis-chatbot-settings') || '{}');
                if (settings.agents && settings.agents.length > 1) {
                    const activeAgents = settings.agents.filter(agent => agent.status === 'active' || !agent.status);
                    if (activeAgents.length > 1) {
                        // Find current agent index
                        const currentIndex = activeAgents.findIndex(a => a.id === this.currentAgent?.id);
                        // Select next agent (or first if current not found)
                        const nextIndex = (currentIndex + 1) % activeAgents.length;
                        const nextAgent = activeAgents[nextIndex];
                        
                        console.log('🔄 Rotating to next agent:', nextAgent.name);
                        this.currentAgent = nextAgent;
                        
                        if (nextAgent.avatar) {
                            this.currentAvatar = this.makeAbsoluteUrl(nextAgent.avatar);
                            this.storeCurrentAvatar(this.currentAvatar);
                            localStorage.setItem('chatbot-current-agent-id', nextAgent.id);
                            this.applyCurrentAvatar();
                        }
                    }
                }
            } catch (error) {
                console.warn('Error rotating agent:', error);
            }
        },

        storeCurrentAvatar: function(avatarUrl) {
            if (!this.isValidAvatar(avatarUrl)) return;

            try {
                const absoluteUrl = this.makeAbsoluteUrl(avatarUrl);

                // Store in all relevant locations
                localStorage.setItem('chatbot-widget-avatar', absoluteUrl);
                localStorage.setItem('chatbot-current-avatar', absoluteUrl);
                localStorage.setItem('dashboard-avatar-cache', absoluteUrl);
                sessionStorage.setItem('chatbot-avatar-current', absoluteUrl);

                console.log('💾 Avatar stored in all locations');
            } catch (error) {
                console.error('Error storing avatar:', error);
            }
        },

        isChatbotElement: function(element) {
            if (!element || !element.classList) return false;

            const chatbotClasses = ['chatbot-button', 'chatbot-avatar', 'chatbot-widget', 'fooodis-chatbot', 'agent-avatar'];
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

        // Public API methods
        forceUpdate: function() {
            console.log('🔄 Force updating avatar...');
            this.loadAvatarData();
            this.applyCurrentAvatar();
        },

        setAvatar: function(avatarUrl) {
            if (this.isValidAvatar(avatarUrl)) {
                this.currentAvatar = this.makeAbsoluteUrl(avatarUrl);
                this.storeCurrentAvatar(this.currentAvatar);
                this.applyCurrentAvatar();
                console.log('✅ Avatar manually set');
            }
        },

        setAgent: function(agent) {
            this.currentAgent = agent;
            if (agent && agent.avatar) {
                this.setAvatar(agent.avatar);
                localStorage.setItem('chatbot-current-agent-id', agent.id);
                console.log('✅ Agent manually set:', agent.name);
            }
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
    function initializeCompleteAvatarManager() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => CompleteAvatarManager.init(), 500);
            });
        } else {
            setTimeout(() => CompleteAvatarManager.init(), 500);
        }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        CompleteAvatarManager.cleanup();
    });

    // Make globally available
    window.CompleteAvatarManager = CompleteAvatarManager;

    // Initialize immediately
    initializeCompleteAvatarManager();

    console.log('✅ Complete Avatar Management System loaded and ready');
})();
