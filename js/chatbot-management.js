/**
 * Fooodis AI Chatbot Management System
 * Handles assistant management, conversations, settings, and analytics
 */

class ChatbotManager {
    constructor() {
        this.assistants = [];
        this.scenarios = [];
        this.conversations = [];
        this.settings = this.getDefaultSettings();
        this.analytics = this.getDefaultAnalytics();
        this.currentTab = 'assistants';
        this.nodeFlow = null; // Initialize node flow property

        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.setupTabs();
        this.renderAssistants();
        this.renderScenarios();
        this.renderConversations();
        this.renderAnalytics();
        this.updateStatus();
        await this.loadLeads(); // Load leads data
        this.renderLeads(); // Render leads

        // Set up periodic refresh of conversations and leads
        setInterval(() => {
            this.loadConversationsFromServer();
            if (this.currentTab === 'conversations') {
                this.renderConversations();
            }
            if (this.currentTab === 'leads') {
                this.loadLeads();
                this.renderLeads();
            }
        }, 30000); // Refresh every 30 seconds

        this.setupAvatarUpload(); // Initialize avatar upload
        
        // Add a test function to manually check data loading
        window.testDashboardData = () => {
            console.log('🧪 Manual Dashboard Test - Starting...');
            console.log('🧪 Current leads data:', this.leads);
            console.log('🧪 Current conversations data:', this.conversations);
            this.loadLeads().then(() => {
                console.log('🧪 After loadLeads - leads count:', this.leads ? this.leads.length : 'undefined');
                this.renderLeads();
                console.log('🧪 Manual test completed');
            }).catch(error => {
                console.error('🧪 Manual test error:', error);
            });
        };
        
        console.log('💡 Run testDashboardData() in console to debug manually');
    }

    getDefaultSettings() {
        return {
            enabled: false,
            chatbotName: 'Fooodis Assistant',
            welcomeMessage: 'Hello! I\'m your Fooodis assistant. How can I help you today?',
            languages: ['en', 'sv'],
            openaiApiKey: '',
            defaultModel: 'gpt-4',
            widgetPosition: 'bottom-right',
            widgetColor: '#e8f24c',
            allowFileUpload: true,
            showTypingIndicator: true,
            enableMemory: true,
            enableMultipleAgents: true,
            agents: this.getDefaultAgents(),
            avatar: this.getDefaultAvatar(),
            enableNodeFlow: false,
            enableAgentHandoff: true,
            enableAgentCollaboration: true,
            handoffRules: {}
        };
    }

    getDefaultAnalytics() {
        return {
            totalConversations: 0,
            avgResponseTime: 0,
            satisfactionRate: 0,
            languagesUsed: 2,
            dailyStats: []
        };
    }

    async loadData() {
        console.log('📁 LOADING CONFIG - Starting configuration load process...');
        
        // First, try to load from chatbot-config.json file
        try {
            const configResponse = await fetch('./chatbot-config.json');
            if (configResponse.ok) {
                const configData = await configResponse.json();
                console.log('🔑 CONFIG LOADED - chatbot-config.json loaded successfully:', {
                    enabled: configData.enabled,
                    hasApiKey: !!configData.openaiApiKey,
                    apiKeyPrefix: configData.openaiApiKey ? configData.openaiApiKey.substring(0, 15) + '...' : 'NONE',
                    assistantsCount: configData.assistants ? configData.assistants.length : 0
                });
                
                // Store the loaded config for use throughout the class
                this.config = configData;
                
                // Set OpenAI API key in localStorage for immediate access
                if (configData.openaiApiKey) {
                    localStorage.setItem('openai-api-key', configData.openaiApiKey);
                    localStorage.setItem('OPENAI_API_KEY', configData.openaiApiKey);
                    console.log('✅ API KEY STORED - OpenAI API key stored in localStorage');
                }
                
                // Load assistants from config if available
                if (configData.assistants && configData.assistants.length > 0) {
                    this.assistants = configData.assistants;
                    console.log('✅ ASSISTANTS LOADED - Loaded', configData.assistants.length, 'assistants from config');
                }
            } else {
                console.warn('⚠️ CONFIG WARNING - Could not load chatbot-config.json, using localStorage/defaults');
            }
        } catch (error) {
            console.error('❌ CONFIG ERROR - Error loading chatbot-config.json:', error);
        }
        
        // Load from localStorage (fallback or override)
        const savedAssistants = localStorage.getItem('fooodis-chatbot-assistants');
        const savedScenarios = localStorage.getItem('fooodis-chatbot-scenarios');
        const savedSettings = localStorage.getItem('fooodis-chatbot-settings');
        const savedAnalytics = localStorage.getItem('fooodis-chatbot-analytics');
        const savedNodeFlow = localStorage.getItem('fooodis-chatbot-nodeflow'); // Load node flow

        // Override with localStorage assistants if they exist (user customizations)
        if (savedAssistants) {
            const localAssistants = JSON.parse(savedAssistants);
            console.log('💾 OVERRIDE - Using localStorage assistants:', localAssistants.length);
            this.assistants = localAssistants;
        } else if (!this.assistants || this.assistants.length === 0) {
            // Create default assistant only if no config assistants were loaded
            console.log('🆕 DEFAULT - Creating default assistant (no config or localStorage found)');
            this.assistants = [{
                id: 'default-' + Date.now(),
                name: 'Restaurant Assistant',
                description: 'Helps customers with restaurant information, menu questions, and reservations',
                assistantId: '',
                status: 'inactive',
                model: 'gpt-4',
                systemPrompt: 'You are a helpful restaurant assistant for Fooodis. Help customers with menu questions, reservations, and general restaurant information.',
                createdAt: new Date().toISOString()
            }];
        }

        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        } else {
            this.settings = this.getDefaultSettings();
        }
        
        // Override settings with config data if available
        if (this.config) {
            this.settings.enabled = this.config.enabled !== undefined ? this.config.enabled : this.settings.enabled;
            this.settings.openaiApiKey = this.config.openaiApiKey || this.settings.openaiApiKey;
            this.settings.defaultModel = this.config.defaultModel || this.settings.defaultModel;
            this.settings.chatbotName = this.config.chatbotName || this.settings.chatbotName;
            this.settings.welcomeMessage = this.config.welcomeMessage || this.settings.welcomeMessage;
            console.log('⚙️ SETTINGS MERGED - Config data merged into settings:', {
                enabled: this.settings.enabled,
                hasApiKey: !!this.settings.openaiApiKey,
                model: this.settings.defaultModel
            });
        }

        if (savedScenarios) {
            this.scenarios = JSON.parse(savedScenarios);
        } else {
            // Create default scenarios
            this.scenarios = [
                {
                    id: 'welcome-' + Date.now(),
                    name: 'Welcome Flow',
                    description: 'Initial welcome questions for new users',
                    active: true,
                    language: 'en',
                    questions: {
                        en: [
                            'Are you currently using a delivery system for your restaurant?',
                            'What type of restaurant do you operate?',
                            'How many customers do you serve daily?'
                        ],
                        sv: [
                            'Använder du för närvarande ett leveranssystem för din restaurang?',
                            'Vilken typ av restaurang driver du?',
                            'Hur många kunder betjänar du dagligen?'
                        ]
                    },
                    responses: {
                        en: {
                            'Are you currently using a delivery system for your restaurant?': [
                                { text: 'Yes, I\'m currently using Fooodis', value: 'current_user', next: 'restaurant_name' },
                                { text: 'Yes, I\'m using another system', value: 'competitor_user', next: 'competitor_system' },
                                { text: 'No, I\'m looking for a solution', value: 'potential_user', next: 'restaurant_type' }
                            ]
                        },
                        sv: {
                            'Använder du för närvarande ett leveranssystem för din restaurang?': [
                                { text: 'Ja, jag använder för närvarande Fooodis', value: 'current_user', next: 'restaurant_name' },
                                { text: 'Ja, jag använder ett annat system', value: 'competitor_user', next: 'competitor_system' },
                                { text: 'Nej, jag letar efter en lösning', value: 'potential_user', next: 'restaurant_type' }
                            ]
                        }
                    },
                    createdAt: new Date().toISOString()
                }
            ];
        }

        // Load conversations from server
        await this.loadConversationsFromServer();

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            // Ensure agents array is properly initialized if it exists in saved settings
            if (this.settings.agents && Array.isArray(this.settings.agents)) {
                // Agents already loaded from savedSettings
            } else {
                this.settings.agents = [];
            }
        } else {
            // Initialize default settings including empty agents array
            this.settings.agents = [];
        }

        if (savedAnalytics) {
            this.analytics = { ...this.analytics, ...JSON.parse(savedAnalytics) };
        }

        if (savedNodeFlow) {
            try {
                this.nodeFlow = JSON.parse(savedNodeFlow);
                console.log(' Node flow loaded from storage:', this.nodeFlow);
            } catch (error) {
                console.error('Error loading node flow:', error);
                this.nodeFlow = null;
            }
        }
    }

    async loadConversationsFromServer() {
        try {
            // Always check localStorage first for most recent data
            const savedConversations = localStorage.getItem('fooodis-chatbot-conversations');
            if (savedConversations) {
                const localConversations = JSON.parse(savedConversations);
                console.log('📦 Found localStorage conversations:', localConversations.length);
                console.log('🔍 Sample conversation data:', localConversations[0] || 'No conversations');
                this.conversations = localConversations;
            }
            
            console.log('🔄 Loading conversations from server...');
            const response = await fetch('/api/chatbot/conversations');
            console.log('📡 Server response status:', response.status, response.ok);
            
            if (response.ok) {
                const result = await response.json();
                console.log('📋 Server response data:', result);
                
                if (result.success && result.conversations) {
                    // Merge server and localStorage data, prioritizing localStorage for recent updates
                    const serverConversations = result.conversations;
                    const mergedConversations = this.mergeConversationData(this.conversations, serverConversations);
                    this.conversations = mergedConversations;
                    console.log('✅ Merged conversations from server and localStorage:', this.conversations.length);
                    console.log('🔍 Final conversation data sample:', this.conversations[0] || 'No conversations');

                    // Update analytics based on conversations
                    this.analytics.totalConversations = this.conversations.length;
                    this.saveData();
                } else {
                    console.error('❌ Server returned success: false or no conversations');
                }
            } else {
                console.error('❌ Server response not OK:', response.status);
                console.log('📦 Using localStorage data only');
            }
        } catch (error) {
            console.error('💥 Error loading conversations from server:', error);
            // Fallback to localStorage
            if (!savedConversations) {
                const savedConversations = localStorage.getItem('fooodis-chatbot-conversations');
                if (savedConversations) {
                    this.conversations = JSON.parse(savedConversations);
                    console.log('📦 Fallback: Loaded from localStorage:', this.conversations.length);
                }
            }
        }
    }

    mergeConversationData(localConversations, serverConversations) {
        if (!localConversations || localConversations.length === 0) {
            return serverConversations || [];
        }
        if (!serverConversations || serverConversations.length === 0) {
            return localConversations;
        }

        // Create a map for faster lookups
        const conversationMap = new Map();
        
        // Add server conversations first
        serverConversations.forEach(conv => {
            const id = conv.conversationId || conv.id;
            if (id) {
                conversationMap.set(id, conv);
            }
        });
        
        // Override with localStorage data (more recent/accurate)
        localConversations.forEach(conv => {
            const id = conv.conversationId || conv.id;
            if (id) {
                const existing = conversationMap.get(id);
                // Merge data, prioritizing localStorage for user info
                conversationMap.set(id, {
                    ...existing,
                    ...conv,
                    // Prioritize user data from localStorage
                    userName: conv.userName || existing?.userName,
                    userEmail: conv.userEmail || existing?.userEmail,
                    userPhone: conv.userPhone || existing?.userPhone,
                    userType: conv.userType || existing?.userType,
                    languageFlag: conv.languageFlag || existing?.languageFlag,
                    displayFlag: conv.displayFlag || existing?.displayFlag
                });
            }
        });
        
        return Array.from(conversationMap.values());
    }

    updateConversationIdentity(identityData) {
        console.log('🔄 UpdateConversationIdentity called with:', identityData);
        
        if (!this.conversations) {
            console.log('⚠️ No conversations array found');
            this.conversations = [];
            return;
        }

        let updated = false;
        
        // AGGRESSIVE APPROACH: Update ALL anonymous conversations
        this.conversations.forEach((conversation, index) => {
            // Check if this is an anonymous conversation that needs updating
            const isAnonymous = !conversation.userName || 
                               conversation.userName === 'Anonymous User' || 
                               conversation.userName === '' ||
                               conversation.userName.trim() === '';
            
            if (isAnonymous) {
                console.log(`🎯 UPDATING ANONYMOUS CONVERSATION ${index + 1}:`, conversation.id);
                
                const oldUserName = conversation.userName || 'Anonymous User';
                
                // Apply complete identity update
                const newUserName = identityData.name || identityData.userName || identityData.email || identityData.userEmail;
                conversation.userName = newUserName;
                conversation.userEmail = identityData.email || identityData.userEmail;
                conversation.restaurantName = identityData.restaurantName;
                conversation.userPhone = identityData.phone || identityData.userPhone;
                conversation.userType = identityData.userType || identityData.systemUsage;
                conversation.systemUsage = identityData.systemUsage;
                conversation.language = identityData.language;
                conversation.languageCode = identityData.languageCode;
                
                // Enhanced language flag mapping
                const flagMap = {
                    'svenska': '🇸🇪',
                    'swedish': '🇸🇪',
                    'english': '🇺🇸',
                    'sv': '🇸🇪',
                    'en': '🇺🇸',
                    'sv-SE': '🇸🇪',
                    'en-US': '🇺🇸'
                };
                
                // Determine correct flag
                let correctFlag = '🇺🇸'; // Default
                
                if (identityData.languageFlag && identityData.languageFlag.trim()) {
                    correctFlag = identityData.languageFlag.trim();
                } else if (identityData.displayFlag && identityData.displayFlag.trim()) {
                    correctFlag = identityData.displayFlag.trim();
                } else if (identityData.language) {
                    correctFlag = flagMap[identityData.language.toLowerCase()] || '🇺🇸';
                } else if (identityData.languageCode) {
                    correctFlag = flagMap[identityData.languageCode.toLowerCase()] || '🇺🇸';
                }
                
                conversation.languageFlag = correctFlag;
                conversation.displayFlag = correctFlag;
                conversation.userRegistered = true;
                conversation.identityLinked = true;
                conversation.lastUpdated = identityData.timestamp || new Date().toISOString();
                conversation.previousName = oldUserName;

                console.log(`✅ UPDATED: ${oldUserName} → ${conversation.userName} (${conversation.languageFlag})`);
                updated = true;
            }
        });

        if (updated) {
            // Save updated conversations to multiple storage locations
            localStorage.setItem('fooodis-chatbot-conversations', JSON.stringify(this.conversations));
            localStorage.setItem('chatbot-conversations', JSON.stringify(this.conversations));
            
            console.log('💾 SAVED TO STORAGE - Updated conversations count:', this.conversations.length);
            
            // Force immediate UI refresh with aggressive scheduling
            this.renderConversations();
            console.log('🔄 IMMEDIATE REFRESH - Conversations re-rendered');
            
            // Multiple delayed refreshes to ensure update
            [50, 100, 200, 500, 1000].forEach((delay, index) => {
                setTimeout(() => {
                    this.renderConversations();
                    console.log(`✅ DELAYED REFRESH ${index + 1} (${delay}ms) - UI updated`);
                }, delay);
            });
            
            console.log('✅ COMPLETE - All anonymous conversations updated with identity');
        } else {
            console.log('⚠️ NO UPDATES - No anonymous conversations found to update');
            console.log('🔍 Current conversations:', this.conversations.map(c => ({
                id: c.id || c.conversationId,
                userName: c.userName,
                isAnonymous: !c.userName || c.userName === 'Anonymous User' || c.userName === ''
            })));
        }
    }

    applyIdentityUpdate(conversation, identityData) {
        const oldUserName = conversation.userName || 'Anonymous User';
        
        // Update conversation with complete user identity
        const newUserName = identityData.name || identityData.userName || identityData.email || identityData.userEmail;
        conversation.userName = newUserName;
        conversation.userEmail = identityData.email || identityData.userEmail;
        conversation.restaurantName = identityData.restaurantName;
        conversation.userPhone = identityData.phone || identityData.userPhone;
        conversation.userType = identityData.userType || identityData.systemUsage;
        conversation.systemUsage = identityData.systemUsage;
        conversation.language = identityData.language;
        conversation.languageCode = identityData.languageCode;
        
        // Enhanced flag mapping
        const flagMap = {
            'svenska': '🇸🇪',
            'swedish': '🇸🇪',
            'english': '🇺🇸',
            'sv': '🇸🇪',
            'en': '🇺🇸',
            'sv-SE': '🇸🇪',
            'en-US': '🇺🇸'
        };
        
        let correctFlag = '🇺🇸';
        if (identityData.languageFlag && identityData.languageFlag.trim()) {
            correctFlag = identityData.languageFlag.trim();
        } else if (identityData.displayFlag && identityData.displayFlag.trim()) {
            correctFlag = identityData.displayFlag.trim();
        } else if (identityData.language) {
            correctFlag = flagMap[identityData.language.toLowerCase()] || '🇺🇸';
        } else if (identityData.languageCode) {
            correctFlag = flagMap[identityData.languageCode.toLowerCase()] || '🇺🇸';
        }
        
        conversation.languageFlag = correctFlag;
        conversation.displayFlag = correctFlag;
        conversation.userRegistered = true;
        conversation.identityLinked = true;
        conversation.lastUpdated = identityData.timestamp || new Date().toISOString();
        conversation.previousName = oldUserName;

        console.log(`✅ Applied identity update: ${oldUserName} → ${conversation.userName} (${conversation.languageFlag})`);
        return conversation;
    }

    async loadLeads() {
        try {
            console.log('🔍 Dashboard: Starting loadLeads()');
            const response = await fetch('/api/chatbot/users');
            console.log('🔍 Dashboard: Fetch response status:', response.status, response.statusText);
            
            if (response.ok) {
                const result = await response.json();
                console.log('🔍 Dashboard: API result:', result);
                
                if (result.success) {
                    this.leads = result.users;
                    console.log('✅ Dashboard: Loaded leads from server:', this.leads.length);
                    console.log('📊 Dashboard: Lead data sample:', this.leads.slice(0, 2));
                } else {
                    console.log('❌ Dashboard: API returned success=false:', result);
                    this.leads = [];
                }
            } else {
                console.log('❌ Dashboard: Fetch failed with status:', response.status);
                this.leads = [];
            }
        } catch (error) {
            console.error('❌ Dashboard: Error loading leads from server:', error);
            this.leads = [];
        }
    }

    saveData() {
        try {
            // Clean up storage first
            this.cleanupStorage();
            
            // Optimize settings before saving
            const optimizedSettings = { ...this.settings };
            
            // Compress agent avatars if they're too large
            if (optimizedSettings.agents) {
                optimizedSettings.agents = optimizedSettings.agents.map(agent => {
                    if (agent.avatar && agent.avatar.length > 50000) { // > 50KB
                        console.log('Large avatar detected for agent:', agent.name);
                        // Keep original for now, compression happens during upload
                    }
                    return agent;
                });
            }
            
            const dataString = JSON.stringify(optimizedSettings);
            const dataSize = dataString.length;
            
            console.log('Attempting to save data size:', Math.round(dataSize / 1024), 'KB');
            
            // Check if data is too large (close to 5MB limit)
            if (dataSize > 4 * 1024 * 1024) { // 4MB threshold
                throw new Error('Data too large for localStorage. Try removing some agents or avatars.');
            }
            
            localStorage.setItem('fooodis-chatbot-settings', dataString);
            
            // Also save assistants separately for proper loading
            localStorage.setItem('fooodis-chatbot-assistants', JSON.stringify(this.assistants));
            localStorage.setItem('fooodis-chatbot-scenarios', JSON.stringify(this.scenarios));
            localStorage.setItem('fooodis-chatbot-analytics', JSON.stringify(this.analytics));
            
            console.log('Data saved successfully');
            
        } catch (error) {
            console.error('Save data error:', error);
            
            if (error.message.includes('quota')) {
                // Storage quota exceeded - try emergency cleanup
                this.emergencyStorageCleanup();
                throw new Error('Storage full. Please refresh the page and try again with smaller images.');
            } else {
                throw error;
            }
        }
    }

    // Compress image to reduce storage size
    compressImage(file, maxWidth = 150, maxHeight = 150, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    // Clean up localStorage to free space
    cleanupStorage() {
        try {
            // Remove old/unused keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('temp-') || key.includes('cache-') || key.includes('old-'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Check current storage usage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            console.log('Storage cleanup completed. Total size:', Math.round(totalSize / 1024), 'KB');
            return totalSize;
        } catch (error) {
            console.warn('Storage cleanup failed:', error);
            return 0;
        }
    }

    // Debug function to test data flow and API endpoints
    async testDashboardDataFlow() {
        console.log('🔍 Testing Dashboard Data Flow...');
        
        // Test API endpoints
        try {
            console.log('Testing /api/chatbot/conversations...');
            const convResponse = await fetch('/api/chatbot/conversations');
            console.log('Conversations API Status:', convResponse.status);
            if (convResponse.ok) {
                const convData = await convResponse.json();
                console.log('Conversations API Data:', convData);
            }
        } catch (error) {
            console.error('Conversations API Error:', error);
        }
        
        try {
            console.log('Testing /api/chatbot/users...');
            const usersResponse = await fetch('/api/chatbot/users');
            console.log('Users API Status:', usersResponse.status);
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                console.log('Users API Data:', usersData);
            }
        } catch (error) {
            console.error('Users API Error:', error);
        }
        
        // Test localStorage data
        console.log('Testing localStorage...');
        const localConversations = localStorage.getItem('fooodis-chatbot-conversations');
        const localUsers = localStorage.getItem('fooodis-chatbot-users');
        console.log('Local Conversations:', localConversations ? JSON.parse(localConversations) : 'None');
        console.log('Local Users:', localUsers ? JSON.parse(localUsers) : 'None');
        
        // Test current dashboard data
        console.log('Current Dashboard Data:');
        console.log('- Conversations:', this.conversations);
        console.log('- Leads:', this.leads);
        
        return {
            apiEndpoints: true,
            localStorage: { conversations: localConversations, users: localUsers },
            dashboardData: { conversations: this.conversations, leads: this.leads }
        };
    }

    // Emergency cleanup when storage is full
    emergencyStorageCleanup() {
        try {
            console.log('Emergency storage cleanup initiated');
            
            // Remove all non-essential data
            const essentialKeys = ['fooodis-chatbot-settings'];
            const allKeys = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                allKeys.push(localStorage.key(i));
            }
            
            allKeys.forEach(key => {
                if (!essentialKeys.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('Emergency cleanup completed');
        } catch (error) {
            console.error('Emergency cleanup failed:', error);
        }
    }

    setupEventListeners() {
        // Listen for user identity updates from registration form
        window.addEventListener('userIdentityUpdated', (event) => {
            console.log('🔄 ChatbotManager: Received user identity update:', event.detail);
            this.updateConversationIdentity(event.detail);
            // Force immediate UI refresh
            setTimeout(() => {
                this.renderConversations();
                console.log('🔄 Forced conversation refresh after identity update');
            }, 100);
        });

        window.addEventListener('conversationDataUpdated', (event) => {
            console.log('🔄 ChatbotManager: Received conversation data update:', event.detail);
            if (event.detail.action === 'identity_update') {
                this.updateConversationIdentity(event.detail.data);
                // Force immediate UI refresh
                setTimeout(() => {
                    this.renderConversations();
                    console.log('🔄 Forced conversation refresh after data update');
                }, 100);
            }
        });

        // Also listen for the userRegistered event as fallback
        document.addEventListener('userRegistered', (event) => {
            console.log('🔄 ChatbotManager: Received userRegistered event:', event.detail);
            this.updateConversationIdentity(event.detail);
            // Force immediate UI refresh
            setTimeout(() => {
                this.renderConversations();
                console.log('🔄 Forced conversation refresh after user registration');
            }, 100);
        });

        // Status toggle
        const chatbotToggle = document.getElementById('chatbotToggle');
        if (chatbotToggle) {
            chatbotToggle.checked = this.settings.enabled;
            chatbotToggle.addEventListener('change', (e) => {
                this.settings.enabled = e.target.checked;
                this.updateStatus();
                this.saveData();
            });
        }

        // Add Assistant button
        const addAssistantBtn = document.getElementById('addAssistantBtn');
        if (addAssistantBtn) {
            addAssistantBtn.addEventListener('click', () => {
                this.showAssistantModal();
            });
        }

        // Add Scenario button
        const addScenarioBtn = document.getElementById('addScenarioBtn');
        if (addScenarioBtn) {
            addScenarioBtn.addEventListener('click', () => {
                this.showScenarioModal();
            });
        }

        // Settings form
        this.setupSettingsForm();

        // Copy widget code
        const copyWidgetBtn = document.getElementById('copyWidgetCode');
        if (copyWidgetBtn) {
            copyWidgetBtn.addEventListener('click', () => {
                this.copyWidgetCode();
            });
        }

        // Refresh conversations button
        const refreshConversationsBtn = document.getElementById('refreshConversationsBtn');
        if (refreshConversationsBtn) {
            refreshConversationsBtn.addEventListener('click', async () => {
                await this.loadConversationsFromServer();
                this.renderConversations();
                this.showNotification('Conversations refreshed successfully!', 'success');
            });
        }

        // Refresh leads button
        const refreshLeadsBtn = document.getElementById('refreshLeadsBtn');
        if (refreshLeadsBtn) {
            refreshLeadsBtn.addEventListener('click', async () => {
                await this.loadLeads();
                this.renderLeads();
                this.showNotification('Leads refreshed successfully!', 'success');
            });
        }

        // Export leads button
        const exportLeadsBtn = document.getElementById('exportLeadsBtn');
        if (exportLeadsBtn) {
            exportLeadsBtn.addEventListener('click', () => {
                this.exportLeads();
            });
        }

        // Clear all leads button
        const clearAllLeadsBtn = document.getElementById('clearAllLeadsBtn');
        if (clearAllLeadsBtn) {
            clearAllLeadsBtn.addEventListener('click', () => {
                this.clearAllLeads();
            });
        }

        // Clear all conversations button
        const clearAllConversationsBtn = document.getElementById('clearAllConversationsBtn');
        if (clearAllConversationsBtn) {
            clearAllConversationsBtn.addEventListener('click', () => {
                this.clearAllConversations();
            });
        }

        // Multiple agents toggle
        const enableMultipleAgents = document.getElementById('enableMultipleAgents');
        if (enableMultipleAgents) {
            enableMultipleAgents.addEventListener('change', (e) => {
                this.toggleMultipleAgents(e.target.checked);
            });
        }

        // Add agent button
        const addAgentBtn = document.getElementById('addAgentBtn');
        if (addAgentBtn) {
            addAgentBtn.addEventListener('click', () => {
                this.showAddAgentModal();
            });
        }

        // Conversations search functionality
        const conversationSearch = document.getElementById('conversationSearch');
        if (conversationSearch) {
            conversationSearch.addEventListener('input', () => {
                this.renderConversations();
            });
        }
        
        // Conversation filter functionality
        const conversationFilter = document.getElementById('conversationFilter');
        if (conversationFilter) {
            conversationFilter.addEventListener('change', () => {
                this.renderConversations();
            });
        }

        // Leads search and filter
        const leadsSearch = document.getElementById('leadsSearch');
        if (leadsSearch) {
            leadsSearch.addEventListener('input', () => {
                this.renderLeads();
            });
        }

        const leadsDateFilter = document.getElementById('leadsDateFilter');
        if (leadsDateFilter) {
            leadsDateFilter.addEventListener('change', () => {
                this.renderLeads();
            });
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.chatbot-tab');
        const panels = document.querySelectorAll('.chatbot-tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');

                // Remove active class from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked tab and corresponding panel
                tab.classList.add('active');
                document.getElementById(`${targetTab}-panel`).classList.add('active');

                this.currentTab = targetTab;

                // Load tab-specific content
                if (targetTab === 'scenarios') {
                    this.renderScenarios();
                } else if (targetTab === 'conversations') {
                    this.renderConversations();
                } else if (targetTab === 'leads') {
                    this.renderLeads();
                } else if (targetTab === 'analytics') {
                    this.renderAnalytics();
                }
            });
        });
    }

    setupSettingsForm() {
        // Populate form with current settings
        this.populateSettingsForm();

        // Save settings button
        const saveBtn = document.getElementById('saveChatbotSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Reset settings button
        const resetBtn = document.getElementById('resetChatbotSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // API key visibility toggle
        const toggleVisibility = document.querySelector('.toggle-visibility');
        if (toggleVisibility) {
            toggleVisibility.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('openaiApiKey');
                const icon = toggleVisibility.querySelector('i');

                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    apiKeyInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    }

    populateSettingsForm() {
        const fields = [
            'chatbotName',
            'welcomeMessage',
            'openaiApiKey',
            'defaultModel',
            'widgetPosition',
            'widgetColor',
            'allowFileUpload',
            'showTypingIndicator',
            'enableMemory',
            'enableMultipleAgents'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[field];
                } else {
                    element.value = this.settings[field] || '';
                }
            }
        });

        // Handle language checkboxes
        const languageCheckboxes = document.querySelectorAll('input[type="checkbox"][value="en"], input[type="checkbox"][value="sv"]');
        languageCheckboxes.forEach(checkbox => {
            checkbox.checked = this.settings.languages.includes(checkbox.value);
        });

        // Load chatbot avatar
        this.loadChatbotAvatar();
    }

    saveSettings() {
        try {
            // Collect form data with validation
            const chatbotName = document.getElementById('chatbotName')?.value?.trim();
            const welcomeMessage = document.getElementById('welcomeMessage')?.value?.trim();
            const openaiApiKey = document.getElementById('openaiApiKey')?.value?.trim();
            const defaultModel = document.getElementById('defaultModel')?.value || 'gpt-4';
            const widgetPosition = document.getElementById('widgetPosition')?.value || 'bottom-right';
            const widgetColor = document.getElementById('widgetColor')?.value || '#e8f24c';

            // Validate required fields
            if (!chatbotName) {
                this.showNotification('Chatbot name is required!', 'error');
                return false;
            }

            // Update settings object
            this.settings.chatbotName = chatbotName;
            this.settings.welcomeMessage = welcomeMessage || '';
            this.settings.openaiApiKey = openaiApiKey || '';
            this.settings.defaultModel = defaultModel;
            this.settings.widgetPosition = widgetPosition;
            this.settings.widgetColor = widgetColor;
            this.settings.allowFileUpload = document.getElementById('allowFileUpload')?.checked || false;
            this.settings.showTypingIndicator = document.getElementById('showTypingIndicator')?.checked || false;
            this.settings.enableMemory = document.getElementById('enableMemory')?.checked || false;
            this.settings.enableMultipleAgents = document.getElementById('enableMultipleAgents')?.checked || false;

            // Collect selected languages safely
            const languageCheckboxes = document.querySelectorAll('input[type="checkbox"][value="en"], input[type="checkbox"][value="sv"]');
            this.settings.languages = Array.from(languageCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            // Ensure at least one language is selected
            if (this.settings.languages.length === 0) {
                this.settings.languages = ['en']; // Default to English
            }

            // Save data with error handling
            this.saveData();
            this.updateWidgetCode();

            // Save configuration to server with error handling
            try {
                this.saveConfigToServer();
            } catch (serverError) {
                console.warn('Failed to save config to server:', serverError);
                // Continue with success message since local save worked
            }

            this.showNotification('Settings saved successfully!', 'success');
            return true;

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Failed to save settings. Please try again.', 'error');
            return false;
        }
    }

    async saveConfigToServer() {
        try {
            const configData = {
                enabled: this.settings.enabled,
                openaiApiKey: this.settings.openaiApiKey,
                defaultModel: this.settings.defaultModel,
                chatbotName: this.settings.chatbotName,
                welcomeMessage: this.settings.welcomeMessage,
                assistants: this.assistants.map(a => ({
                    id: a.id,
                    name: a.name,
                    assistantId: a.assistantId,
                    model: a.model,
                    systemPrompt: a.systemPrompt,
                    status: a.status
                }))
            };

            console.log('Saving config to server:', {
                enabled: configData.enabled,
                hasApiKey: !!configData.openaiApiKey,
                assistantsCount: configData.assistants.length,
                activeAssistants: configData.assistants.filter(a => a.status === 'active').length
            });

            const response = await fetch('/api/chatbot/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(configData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to save config to server:', errorText);
            } else {
                console.log('Config saved successfully to server');
            }
        } catch (error) {
            console.error('Error saving config to server:', error);
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.settings = this.getDefaultSettings();
            this.populateSettingsForm();
            this.saveData();
            this.updateStatus();
            this.showNotification('Settings reset to default values', 'info');
        }
    }

    updateStatus() {
        const statusIcon = document.getElementById('chatbot-status-icon');
        const statusText = document.getElementById('chatbot-status-text');
        const statusDesc = document.getElementById('chatbot-status-desc');

        if (this.settings.enabled) {
            statusIcon.className = 'fas fa-toggle-on';
            statusText.textContent = 'Chatbot Enabled';
            statusDesc.textContent = 'Chatbot is active and receiving messages';
        } else {
            statusIcon.className = 'fas fa-toggle-off';
            statusText.textContent = 'Chatbot Disabled';
            statusDesc.textContent = 'Enable chatbot to start receiving messages';
        }
    }

    renderAssistants() {
        const assistantsGrid = document.getElementById('assistantsGrid');
        if (!assistantsGrid) return;

        if (this.assistants.length === 0) {
            assistantsGrid.innerHTML = '<p class="no-assistants">No assistants configured. Click "Add Assistant" to create your first assistant.</p>';
            return;
        }

        assistantsGrid.innerHTML = this.assistants.map(assistant => `
            <div class="assistant-card" data-assistant-id="${assistant.id}">
                <div class="assistant-header">
                    <h4 class="assistant-name">${assistant.name}</h4>
                    <span class="assistant-status ${assistant.status}">${assistant.status}</span>
                </div>
                <p class="assistant-description">${assistant.description}</p>
                <div class="assistant-id">
                    Assistant ID: ${assistant.assistantId || 'Not set'}
                </div>
                <div class="assistant-actions">
                    <button class="btn btn-secondary btn-sm" onclick="chatbotManager.editAssistant('${assistant.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="chatbotManager.toggleAssistant('${assistant.id}')">
                        <i class="fas fa-power-off"></i> ${assistant.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="chatbotManager.deleteAssistant('${assistant.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;

        if (this.conversations.length === 0) {
            conversationsList.innerHTML = '<p class="no-conversations">No conversations yet. Conversations will appear here when users start chatting with your assistants.</p>';
            return;
        }

        // Get search and filter values
        const searchTerm = (document.getElementById('conversationSearch')?.value || '').toLowerCase();
        const filterValue = document.getElementById('conversationFilter')?.value || 'all';
        
        // Filter conversations based on search and filter criteria
        let filteredConversations = [...this.conversations];
        
        // Apply search filter
        if (searchTerm) {
            filteredConversations = filteredConversations.filter(conversation => {
                const userName = (conversation.userName || '').toLowerCase();
                const userEmail = (conversation.userEmail || '').toLowerCase();
                const lastMessage = (conversation.lastUserMessage || '').toLowerCase();
                return userName.includes(searchTerm) || 
                       userEmail.includes(searchTerm) || 
                       lastMessage.includes(searchTerm);
            });
        }
        
        // Apply status filter
        if (filterValue !== 'all') {
            filteredConversations = filteredConversations.filter(conversation => 
                (conversation.status || 'active') === filterValue
            );
        }
        
        // Sort conversations by most recent first (ensure lastMessageAt exists)
        const sortedConversations = filteredConversations.sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || a.createdAt || 0);
            const dateB = new Date(b.lastMessageAt || b.createdAt || 0);
            return dateB - dateA;
        });

        conversationsList.innerHTML = sortedConversations.map(conversation => {
            console.log('🎯 Rendering conversation:', {
                id: conversation.id || conversation.conversationId,
                userName: conversation.userName,
                userEmail: conversation.userEmail,
                languageFlag: conversation.languageFlag,
                displayFlag: conversation.displayFlag,
                userRegistered: conversation.userRegistered,
                identityLinked: conversation.identityLinked
            });
            
            const messageCount = conversation.messageCount || (conversation.messages ? conversation.messages.length : 0);

            // Get the actual last user message, not the assistant response
            let lastUserMessage = 'No messages';
            if (conversation.lastUserMessage) {
                lastUserMessage = conversation.lastUserMessage;
            } else if (conversation.messages && conversation.messages.length > 0) {
                // Find the last user message (stored data uses 'sender' not 'role')
                const userMessages = conversation.messages.filter(msg => msg.sender === 'user');
                if (userMessages.length > 0) {
                    lastUserMessage = userMessages[userMessages.length - 1].content;
                }
            }

            const status = conversation.status || 'active';

            // Determine user category based on system usage
            let userCategory = 'Anonymous';
            if (conversation.userRegistered && conversation.systemUsage) {
                switch (conversation.systemUsage) {
                    case 'current_user':
                        userCategory = 'Current User';
                        break;
                    case 'competitor_user':
                        userCategory = 'Competitor User';
                        break;
                    case 'potential_user':
                        userCategory = 'Potential User';
                        break;
                    default:
                        userCategory = conversation.userCategory || 'Registered User';
                }
            }
            const categoryClass = userCategory.toLowerCase().replace(/\s+/g, '-');
            
            // Enhanced user display logic with fallback chain
            let userDisplay = 'Anonymous User';
            let flagDisplay = '';
            
            // Debug log the conversation data
            console.log('🔍 Rendering conversation user data:', {
                id: conversation.id,
                userName: conversation.userName,
                userEmail: conversation.userEmail,
                userRegistered: conversation.userRegistered,
                identityLinked: conversation.identityLinked,
                language: conversation.language,
                languageCode: conversation.languageCode
            });
            
            // Priority order: registered name > email > fallback
            if (conversation.userName && conversation.userName.trim() && conversation.userName !== 'Anonymous User') {
                userDisplay = conversation.userName.trim();
                console.log('✅ Using userName:', userDisplay);
            } else if (conversation.userEmail && conversation.userEmail.trim()) {
                userDisplay = conversation.userEmail.trim();
                console.log('✅ Using userEmail:', userDisplay);
            } else {
                console.log('⚠️ Using default Anonymous User');
            }
            
            // Enhanced flag display with comprehensive language detection
            if (conversation.languageFlag && conversation.languageFlag.trim()) {
                flagDisplay = conversation.languageFlag.trim();
            } else if (conversation.displayFlag && conversation.displayFlag.trim()) {
                flagDisplay = conversation.displayFlag.trim();
            } else {
                // Comprehensive flag mapping with multiple language detection methods
                const flagMap = {
                    'svenska': '🇸🇪',
                    'swedish': '🇸🇪',
                    'english': '🇺🇸',
                    'sv': '🇸🇪',
                    'en': '🇺🇸',
                    'sv-SE': '🇸🇪',
                    'en-US': '🇺🇸'
                };
                
                // Check multiple language fields
                const detectedLanguage = conversation.language || 
                                       conversation.languageCode || 
                                       conversation.userLanguage ||
                                       'english';
                
                flagDisplay = flagMap[detectedLanguage.toLowerCase()] || '🇺🇸';
                
                // Update the conversation object with the generated flag
                conversation.languageFlag = flagDisplay;
                conversation.displayFlag = flagDisplay;
                
                console.log('🏳️ Flag detection:', {
                    detectedLanguage,
                    flagDisplay,
                    originalLanguage: conversation.language,
                    languageCode: conversation.languageCode
                });
            }
            
            console.log('🏷️ User display resolved:', { 
                userDisplay, 
                flagDisplay, 
                userRegistered: conversation.userRegistered,
                category: userCategory 
            });

            return `
                <div class="conversation-card" data-conversation-id="${conversation.id || conversation.conversationId}">
                    <div class="conversation-header">
                        <div class="conversation-user">
                            <i class="fas fa-user"></i> 
                            ${flagDisplay} 
                            ${userDisplay}
                            <span class="message-count">(${messageCount} messages)</span>
                            <span class="user-category-badge ${categoryClass}">${userCategory}</span>
                        </div>
                        <div class="conversation-time">${this.formatDate(conversation.lastMessageAt)}</div>
                    </div>
                    <div class="conversation-preview">
                        <strong>Last user message:</strong> ${this.truncateText(lastUserMessage, 80)}
                    </div>
                    <div class="conversation-meta">
                        <span class="conversation-status ${status}">${status}</span>
                        <button class="btn btn-sm btn-secondary" onclick="chatbotManager.viewConversation('${conversation.id || conversation.conversationId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="chatbotManager.deleteConversation('${conversation.id || conversation.conversationId}')" title="Delete Conversation">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    async renderAnalytics() {
        // Update basic analytics cards
        document.getElementById('totalConversations').textContent = this.analytics.totalConversations;
        document.getElementById('avgResponseTime').textContent = this.analytics.avgResponseTime + 's';
        document.getElementById('satisfactionRate').textContent = this.analytics.satisfactionRate + '%';
        document.getElementById('languagesUsed').textContent = this.analytics.languagesUsed;

        // ⭐ Fetch and display rating analytics
        await this.loadRatingAnalytics();

        // Render chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.renderConversationsChart();
            this.renderRatingAnalyticsChart();
        }
    }

    // ⭐ Load rating analytics from backend
    async loadRatingAnalytics() {
        try {
            console.log('📊 Loading rating analytics...');
            const response = await fetch('/api/chatbot/ratings');
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.analytics) {
                    const analytics = result.analytics;
                    
                    // Update analytics display
                    this.updateRatingAnalyticsDisplay(analytics);
                    
                    // Store for chart rendering
                    this.ratingAnalytics = analytics;
                    
                    console.log('✅ Rating analytics loaded:', analytics);
                } else {
                    console.log('⚠️ No rating analytics data available');
                    this.updateRatingAnalyticsDisplay({});
                }
            } else {
                console.warn('⚠️ Failed to fetch rating analytics:', response.status);
                this.updateRatingAnalyticsDisplay({});
            }
        } catch (error) {
            console.error('❌ Error loading rating analytics:', error);
            this.updateRatingAnalyticsDisplay({});
        }
    }

    // ⭐ Update rating analytics display in dashboard
    updateRatingAnalyticsDisplay(analytics) {
        // Update or create rating analytics section
        const analyticsPanel = document.getElementById('analytics-panel');
        if (!analyticsPanel) return;

        // Check if rating analytics section already exists
        let ratingSection = document.getElementById('rating-analytics-section');
        
        if (!ratingSection) {
            // Create rating analytics section
            ratingSection = document.createElement('div');
            ratingSection.id = 'rating-analytics-section';
            ratingSection.className = 'analytics-section';
            
            // Insert after existing analytics overview
            const analyticsOverview = analyticsPanel.querySelector('.analytics-overview');
            if (analyticsOverview) {
                analyticsOverview.insertAdjacentElement('afterend', ratingSection);
            } else {
                analyticsPanel.appendChild(ratingSection);
            }
        }

        const totalRatings = analytics.totalRatings || 0;
        const avgRating = analytics.averageOverallRating || 0;
        const categoryAverages = analytics.categoryAverages || {};
        const languageBreakdown = analytics.languageBreakdown || {};

        ratingSection.innerHTML = `
            <div class="rating-analytics-content">
                <h3 class="analytics-title">⭐ Rating Analytics</h3>
                
                <div class="rating-stats-grid">
                    <div class="rating-stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <h4>Total Ratings</h4>
                            <span class="stat-value">${totalRatings}</span>
                        </div>
                    </div>
                    
                    <div class="rating-stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <h4>Average Rating</h4>
                            <span class="stat-value">${avgRating}/5</span>
                        </div>
                    </div>
                    
                    <div class="rating-stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-content">
                            <h4>Rated Conversations</h4>
                            <span class="stat-value">${Math.round((totalRatings / Math.max(this.analytics.totalConversations, 1)) * 100)}%</span>
                        </div>
                    </div>
                </div>

                ${Object.keys(categoryAverages).length > 0 ? `
                    <div class="category-ratings">
                        <h4>Category Averages</h4>
                        <div class="category-ratings-grid">
                            ${Object.entries(categoryAverages).map(([category, avg]) => `
                                <div class="category-rating-item">
                                    <span class="category-name">${this.formatCategoryName(category)}</span>
                                    <div class="category-rating">
                                        <span class="rating-stars">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</span>
                                        <span class="rating-number">${avg}/5</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${Object.keys(languageBreakdown).length > 0 ? `
                    <div class="language-ratings">
                        <h4>Ratings by Language</h4>
                        <div class="language-breakdown">
                            ${Object.entries(languageBreakdown).map(([lang, count]) => `
                                <div class="language-item">
                                    <span class="language-flag">${this.getLanguageFlag(lang)}</span>
                                    <span class="language-name">${this.getLanguageName(lang)}</span>
                                    <span class="language-count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="rating-chart-container">
                    <canvas id="ratingAnalyticsChart" width="400" height="200"></canvas>
                </div>
            </div>

            <style>
                .rating-analytics-content {
                    background: var(--dark-input);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    border-left: 4px solid #ffc107;
                }
                .analytics-title {
                    color: var(--primary-color);
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .rating-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 25px;
                }
                .rating-stat-card {
                    background: var(--dark-card);
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid var(--dark-border);
                }
                .stat-icon {
                    font-size: 24px;
                    opacity: 0.8;
                }
                .stat-content h4 {
                    color: var(--dark-text);
                    margin: 0 0 5px 0;
                    font-size: 14px;
                }
                .stat-value {
                    color: var(--primary-color);
                    font-size: 20px;
                    font-weight: bold;
                }
                .category-ratings, .language-ratings {
                    margin: 20px 0;
                }
                .category-ratings h4, .language-ratings h4 {
                    color: var(--dark-text);
                    margin-bottom: 12px;
                }
                .category-ratings-grid {
                    display: grid;
                    gap: 10px;
                }
                .category-rating-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--dark-card);
                    border-radius: 6px;
                }
                .category-name {
                    color: var(--dark-text);
                }
                .category-rating {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .rating-stars {
                    color: #ffc107;
                }
                .rating-number {
                    color: var(--primary-color);
                    font-weight: bold;
                    font-size: 14px;
                }
                .language-breakdown {
                    display: grid;
                    gap: 8px;
                }
                .language-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 10px;
                    background: var(--dark-card);
                    border-radius: 6px;
                }
                .language-flag {
                    font-size: 16px;
                }
                .language-name {
                    color: var(--dark-text);
                    flex: 1;
                }
                .language-count {
                    color: var(--primary-color);
                    font-weight: bold;
                }
                .rating-chart-container {
                    margin-top: 20px;
                    height: 200px;
                }
            </style>
        `;
    }

    // ⭐ Helper method to format category names for display
    formatCategoryName(category) {
        const categoryMap = {
            'helpful': 'Helpfulness',
            'accurate': 'Accuracy',
            'speed': 'Response Speed',
            'satisfaction': 'Overall Satisfaction',
            'clarity': 'Clarity',
            'relevance': 'Relevance'
        };
        return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    // ⭐ Get language flag emoji
    getLanguageFlag(languageCode) {
        const flags = {
            'en': '🇺🇸',
            'sv': '🇸🇪',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'nl': '🇳🇱',
            'no': '🇳🇴',
            'da': '🇩🇰',
            'fi': '🇫🇮'
        };
        return flags[languageCode] || '🌐';
    }

    // ⭐ Get language display name
    getLanguageName(languageCode) {
        const names = {
            'en': 'English',
            'sv': 'Swedish',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'nl': 'Dutch',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish'
        };
        return names[languageCode] || languageCode.toUpperCase();
    }

    // ⭐ Render rating analytics chart
    renderRatingAnalyticsChart() {
        const ctx = document.getElementById('ratingAnalyticsChart');
        if (!ctx || !this.ratingAnalytics) return;

        // Destroy existing chart if it exists
        if (this.ratingChart) {
            this.ratingChart.destroy();
        }

        const analytics = this.ratingAnalytics;
        const categoryAverages = analytics.categoryAverages || {};

        // Prepare data for chart
        const categories = Object.keys(categoryAverages);
        const averages = Object.values(categoryAverages);

        if (categories.length === 0) {
            // Show empty state
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.fillStyle = '#6c757d';
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText('No rating data available', ctx.width / 2, ctx.height / 2);
            return;
        }

        this.ratingChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categories.map(cat => this.formatCategoryName(cat)),
                datasets: [{
                    label: 'Average Rating',
                    data: averages,
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: '#ffc107',
                    borderWidth: 2,
                    pointBackgroundColor: '#ffc107',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ffc107'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Rating Categories Overview',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            color: '#ffffff',
                            backdropColor: 'rgba(0, 0, 0, 0.5)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    renderConversationsChart() {
        const ctx = document.getElementById('conversationsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Conversations',
                    data: [12, 19, 8, 15, 22, 18, 14],
                    borderColor: '#e8f24c',
                    backgroundColor: 'rgba(232, 242, 76, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Conversations This Week',
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    renderScenarios() {
        const scenariosList = document.getElementById('scenariosList');
        if (!scenariosList) return;

        if (this.scenarios.length === 0) {
            scenariosList.innerHTML = '<p class="no-scenarios">No conversation scenarios configured. Click "Add Scenario" to create your first guided conversation flow.</p>';
            return;
        }

        scenariosList.innerHTML = this.scenarios.map(scenario => {
            const questionCount = scenario.questions ? 
                (scenario.questions.en ? scenario.questions.en.length : 0) + 
                (scenario.questions.sv ? scenario.questions.sv.length : 0) : 0;

            return `
                <div class="scenario-card" data-scenario-id="${scenario.id}">
                    <div class="scenario-header">
                        <h4 class="scenario-title">${scenario.name}</h4>
                        <div class="scenario-controls">
                            <div class="scenario-toggle">
                                <input type="checkbox" id="scenario-${scenario.id}" ${scenario.active ? 'checked' : ''} 
                                       onchange="chatbotManager.toggleScenario('${scenario.id}')">
                                <span class="scenario-slider"></span>
                            </div>
                            <span class="scenario-status ${scenario.active ? 'active' : 'inactive'}">
                                ${scenario.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <p class="scenario-description">${scenario.description}</p>

                    <div class="scenario-questions">
                        <h5>Questions (${questionCount} total)</h5>

                        ${scenario.questions.en ? `
                            <div class="language-questions">
                                <span class="language-label">English:</span>
                                <div class="questions-list">
                                    ${scenario.questions.en.map(q => `
                                        <div class="question-item">
                                            <span class="question-text">${q}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${scenario.questions.sv ? `
                            <div class="language-questions">
                                <span class="language-label">Swedish:</span>
                                <div class="questions-list">
                                    ${scenario.questions.sv.map(q => `
                                        <div class="question-item">
                                            <span class="question-text">${q}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="scenario-actions">
                        <button class="btn btn-secondary btn-sm" onclick="chatbotManager.editScenario('${scenario.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="chatbotManager.testScenario('${scenario.id}')">
                            <i class="fas fa-play"></i> Test
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="chatbotManager.deleteScenario('${scenario.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        const checkbox = document.getElementById(`scenario-${scenarioId}`);
        if (checkbox) {
            scenario.active = checkbox.checked;
        } else {
            scenario.active = !scenario.active;
        }

        this.saveData();
        this.renderScenarios();

        const action = scenario.active ? 'activated' : 'deactivated';
        this.showNotification(`Scenario ${action} successfully!`, 'success');
    }

    editScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        const modal = this.createModal('Edit Scenario', `
            <form id="scenarioForm" class="scenario-form">
                <div class="form-group">
                    <label for="scenarioName">Scenario Name</label>
                    <input type="text" id="scenarioName" value="${scenario.name}" required>
                </div>
                <div class="form-group">
                    <label for="scenarioDescription">Description</label>
                    <textarea id="scenarioDescription" rows="3">${scenario.description}</textarea>
                </div>

                <div class="form-group">
                    <h4>English Questions</h4>
                    <div id="englishQuestions">
                        ${scenario.questions.en ? scenario.questions.en.map((q, i) => `
                            <div class="question-input-group">
                                <input type="text" value="${q}" placeholder="Enter question">
                                <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') : ''}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="chatbotManager.addQuestionInput('englishQuestions')">
                        <i class="fas fa-plus"></i> Add English Question
                    </button>
                </div>

                <div class="form-group">
                    <h4>Swedish Questions</h4>
                    <div id="swedishQuestions">
                        ${scenario.questions.sv ? scenario.questions.sv.map((q, i) => `
                            <div class="question-input-group">
                                <input type="text" value="${q}" placeholder="Ange fråga">
                                <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') : ''}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="chatbotManager.addQuestionInput('swedishQuestions')">
                        <i class="fas fa-plus"></i> Add Swedish Question
                    </button>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Scenario</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);

        document.getElementById('scenarioForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScenarioFromForm(scenarioId);
            modal.remove();
        });
    }

    testScenario(scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (!scenario) return;

        this.showNotification(`Testing scenario: ${scenario.name}`, 'info');
        // Here you could open a test chat window or redirect to a test page
    }

    deleteScenario(scenarioId) {
        if (confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
            this.scenarios = this.scenarios.filter(s => s.id !== scenarioId);
            this.saveData();
            this.renderScenarios();
            this.showNotification('Scenario deleted successfully!', 'success');
        }
    }

    addQuestionInput(containerId) {
        const container = document.getElementById(containerId);
        const placeholder = containerId === 'englishQuestions' ? 'Enter question' : 'Ange fråga';

        const questionGroup = document.createElement('div');
        questionGroup.className = 'question-input-group';
        questionGroup.innerHTML = `
            <input type="text" placeholder="${placeholder}">
            <button type="button" class="btn btn-small btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(questionGroup);
    }

    saveScenarioFromForm(scenarioId = null) {
        const name = document.getElementById('scenarioName').value;
        const description = document.getElementById('scenarioDescription').value;

        // Collect English questions
        const englishInputs = document.querySelectorAll('#englishQuestions input');
        const englishQuestions = Array.from(englishInputs).map(input => input.value).filter(q => q.trim() !== '');

        // Collect Swedish questions
        const swedishInputs = document.querySelectorAll('#swedishQuestions input');
        const swedishQuestions = Array.from(swedishInputs).map(input => input.value).filter(q => q.trim() !== '');

        const scenarioData = {
            id: scenarioId || 'scenario-' + Date.now(),
            name: name,
            description: description,
            active: scenarioId ? this.scenarios.find(s => s.id === scenarioId).active : false,
            questions: {
                en: englishQuestions,
                sv: swedishQuestions
            },
            responses: scenarioId ? this.scenarios.find(s => s.id === scenarioId).responses : {},
            createdAt: scenarioId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (scenarioId) {
            // Update existing scenario
            const index = this.scenarios.findIndex(s => s.id === scenarioId);
            if (index !== -1) {
                this.scenarios[index] = { ...this.scenarios[index], ...scenarioData };
            }
        } else {
            // Add new scenario
            this.scenarios.push(scenarioData);
        }

        this.saveData();
        this.renderScenarios();
        this.showNotification('Scenario saved successfully!', 'success');
    }

    showAssistantModal() {
        // Create a modal for adding/editing assistants
        const modal = this.createModal('Add Assistant', `
            <form id="assistantForm">
                <div class="form-group">
                    <label for="assistantName">Assistant Name</label>
                    <input type="text" id="assistantName" required>
                </div>
                <div class="form-group">
                    <label for="assistantDescription">Description</label>
                    <textarea id="assistantDescription" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="assistantIdInput">OpenAI Assistant ID</label>
                    <input type="text" id="assistantIdInput" placeholder="asst_xxxxxxxxxxxxx">
                    <small>Get this from your OpenAI dashboard</small>
                                </div>
                <div class="form-group">
                    <label for="assistantModel">Model</label>
                    <select id="assistantModel">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assistantPrompt">System Prompt</label>
                    <textarea id="assistantPrompt" rows="4" placeholder="Enter the system prompt for this assistant"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Assistant</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('assistantForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAssistant();
            modal.remove();
        });
    }

    saveAssistant(assistantId = null) {
        // Get existing assistant to preserve status
        const existingAssistant = assistantId ? this.assistants.find(a => a.id === assistantId) : null;
        
        const formData = {
            id: assistantId || 'assistant-' + Date.now(),
            name: document.getElementById('assistantName').value,
            description: document.getElementById('assistantDescription').value,
            assistantId: document.getElementById('assistantIdInput').value,
            model: document.getElementById('assistantModel').value,
            systemPrompt: document.getElementById('assistantPrompt').value,
            status: existingAssistant ? existingAssistant.status : 'inactive', // Preserve existing status
            createdAt: assistantId ? undefined : new Date().toISOString()
        };

        if (assistantId) {
            // Update existing assistant
            const index = this.assistants.findIndex(a => a.id === assistantId);
            if (index !== -1) {
                this.assistants[index] = { ...this.assistants[index], ...formData };
            }
        } else {
            // Add new assistant
            this.assistants.push(formData);
        }

        this.saveData();
        this.renderAssistants();
        this.showNotification('Assistant saved successfully!', 'success');
    }

    editAssistant(assistantId) {
        const assistant = this.assistants.find(a => a.id === assistantId);
        if (!assistant) return;

        const modal = this.createModal('Edit Assistant', `
            <form id="assistantForm">
                <div class="form-group">
                    <label for="assistantName">Assistant Name</label>
                    <input type="text" id="assistantName" value="${assistant.name}" required>
                </div>
                <div class="form-group">
                    <label for="assistantDescription">Description</label>
                    <textarea id="assistantDescription" rows="3">${assistant.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="assistantIdInput">OpenAI Assistant ID</label>
                    <input type="text" id="assistantIdInput" value="${assistant.assistantId}" placeholder="asst_xxxxxxxxxxxxx">
                    <small>Get this from your OpenAI dashboard</small>
                                </div>
                <div class="form-group">
                    <label for="assistantModel">Model</label>
                    <select id="assistantModel">
                        <option value="gpt-4" ${assistant.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                        <option value="gpt-4-turbo" ${assistant.model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo" ${assistant.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assistantPrompt">System Prompt</label>
                    <textarea id="assistantPrompt" rows="4">${assistant.systemPrompt || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Assistant</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);

        document.getElementById('assistantForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAssistant(assistantId);
            modal.remove();
        });
    }

    toggleAssistant(assistantId) {
        const assistant = this.assistants.find(a => a.id === assistantId);
        if (!assistant) return;

        assistant.status = assistant.status === 'active' ? 'inactive' : 'active';
        this.saveData();
        this.renderAssistants();

        const action = assistant.status === 'active' ? 'enabled' : 'disabled';
        this.showNotification(`Assistant ${action} successfully!`, 'success');
    }

    deleteAssistant(assistantId) {
        if (confirm('Are you sure you want to delete this assistant? This action cannot be undone.')) {
            this.assistants = this.assistants.filter(a => a.id !== assistantId);
            this.saveData();
            this.renderAssistants();
            this.showNotification('Assistant deleted successfully!', 'success');
        }
    }

    async viewConversation(conversationId) {
        try {
            // Get conversation details from server
            const response = await fetch(`/api/chatbot/conversations/${conversationId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showConversationModal(result.conversation);
                } else {
                    throw new Error(result.error || 'Failed to load conversation');
                }
            } else {
                throw new Error('Failed to fetch conversation details');
            }
        } catch (error) {
            console.error('Error viewing conversation:', error);

            // Fallback to local storage
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                this.showConversationModal(conversation);
            } else {
                this.showNotification('Conversation not found', 'info');
            }
        }
    }

    showConversationModal(conversation) {
        const messages = conversation.messages || [];

        const messagesHtml = messages.map(msg => `
            <div class="conversation-message ${msg.sender || msg.role}">
                <div class="message-header">
                    <strong>${(msg.sender === 'user' || msg.role === 'user') ? 'User' : 'Assistant'}</strong>
                    <span class="message-time">${this.formatDate(msg.timestamp)}</span>
                </div>
                <div class="message-content">${msg.content}</div>
            </div>
        `).join('');

        // ⭐ Generate rating display HTML
        const ratingHtml = this.generateRatingDisplay(conversation);

        const modal = this.createModal('Conversation Details', `
            <div class="conversation-details">
                <div class="conversation-info">
                    <p><strong>Conversation ID:</strong> ${conversation.id}</p>
                    <p><strong>Started:</strong> ${this.formatDate(conversation.createdAt)}</p>
                    <p><strong>Last Message:</strong> ${this.formatDate(conversation.lastMessageAt)}</p>
                    <p><strong>Total Messages:</strong> ${messages.length}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${conversation.status || 'active'}">${conversation.status || 'active'}</span></p>
                    ${conversation.rated ? `<p><strong>Overall Rating:</strong> <span class="overall-rating">${conversation.overallRating || 'N/A'}/5 ⭐</span></p>` : ''}
                </div>
                ${ratingHtml}
                <div class="conversation-messages">
                    <h4>Messages</h4>
                    <div class="messages-list">
                        ${messagesHtml || '<p>No messages found in this conversation.</p>'}
                    </div>
                </div>
            </div>
            <style>
                .conversation-details {
                    max-height: 500px;
                    overflow-y: auto;
                }
                .conversation-info {
                    background-color: var(--dark-input);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .conversation-messages h4 {
                    margin-bottom: 15px;
                    color: var(--dark-text);
                }
                .messages-list {
                    max-height: 300px;
                    overflow-y: auto;
                    border: 1px solid var(--dark-border);
                    border-radius: 8px;
                    padding: 10px;
                }
                .conversation-message {
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 8px;
                    background-color: var(--dark-input);
                }
                .conversation-message.user {
                    background-color: rgba(232, 242, 76, 0.1);
                    border-left: 3px solid var(--primary-color);
                }
                .conversation-message.assistant {
                    background-color: rgba(33, 150, 243, 0.1);
                    border-left: 3px solid #2196f3;
                }
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 12px;
                }
                .message-header strong {
                    color: var(--primary-color);
                }
                .message-time {
                    color: var(--dark-text-secondary);
                }
                .message-content {
                    color: var(--dark-text);
                    line-height: 1.5;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .overall-rating {
                    color: #ffc107;
                    font-weight: bold;
                    font-size: 16px;
                }
                .rating-section {
                    background-color: var(--dark-input);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 3px solid #ffc107;
                }
                .rating-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .rating-stars {
                    color: #ffc107;
                    font-size: 16px;
                }
                .rating-label {
                    color: var(--dark-text);
                    font-weight: 500;
                }
                .rating-value {
                    color: var(--primary-color);
                    font-weight: bold;
                }
                .rating-timestamp {
                    color: var(--dark-text-secondary);
                    font-size: 12px;
                    margin-top: 10px;
                    text-align: center;
                }
            </style>
        `);

        document.body.appendChild(modal);
    }

    // ⭐ Generate rating display HTML for conversation modal
    generateRatingDisplay(conversation) {
        if (!conversation.rated || !conversation.ratingId) {
            return '';
        }

        // Fetch rating details from the backend or use cached data
        const ratingData = conversation.ratingData || this.getCachedRating(conversation.ratingId);
        
        if (!ratingData || !ratingData.ratings) {
            return `
                <div class="rating-section">
                    <h4>📊 User Rating</h4>
                    <div class="rating-item">
                        <span class="rating-label">Overall Rating:</span>
                        <span class="rating-value">${conversation.overallRating || 'N/A'}/5 ⭐</span>
                    </div>
                    <div class="rating-timestamp">Rating submitted</div>
                </div>
            `;
        }

        const categories = {
            helpful: 'Helpfulness',
            accurate: 'Accuracy', 
            speed: 'Response Speed',
            satisfaction: 'Overall Satisfaction'
        };

        const ratingsHtml = Object.entries(ratingData.ratings)
            .map(([category, value]) => {
                const stars = '★'.repeat(value) + '☆'.repeat(5 - value);
                return `
                    <div class="rating-item">
                        <span class="rating-label">${categories[category] || category}:</span>
                        <div>
                            <span class="rating-stars">${stars}</span>
                            <span class="rating-value">${value}/5</span>
                        </div>
                    </div>
                `;
            }).join('');

        return `
            <div class="rating-section">
                <h4>📊 User Rating</h4>
                ${ratingsHtml}
                <div class="rating-item">
                    <span class="rating-label">Overall Rating:</span>
                    <span class="rating-value">${ratingData.overallRating || 'N/A'}/5 ⭐</span>
                </div>
                <div class="rating-timestamp">
                    Submitted: ${this.formatDate(ratingData.timestamp)}
                    ${ratingData.userName ? ` by ${ratingData.userName}` : ''}
                </div>
            </div>
        `;
    }

    // Get cached rating data (placeholder for future caching implementation)
    getCachedRating(ratingId) {
        // In future, this could fetch from local storage or cache
        // For now, return null to trigger backend fetch
        return null;
    }

    updateWidgetCode() {
        const widgetCode = document.getElementById('widgetCode');
        if (!widgetCode) return;

        const code = `<!-- Fooodis AI Chatbot Widget -->
<script src="${window.location.origin}/js/chatbot-widget.js"></script>
<script>
  FoodisChatbot.init({
    apiEndpoint: '${window.location.origin}/api/chatbot',
    position: '${this.settings.widgetPosition}',
    primaryColor: '${this.settings.widgetColor}',
    language: '${this.settings.languages[0] || 'en'}',
    assistants: ${JSON.stringify(this.assistants.filter(a => a.status === 'active').map(a => ({
        id: a.id,
        name: a.name,
        assistantId: a.assistantId
    })))},
    avatar: '${this.settings.avatar || this.getDefaultAvatar()}'
  });
</script>`;

        widgetCode.querySelector('code').textContent = code;
    }

    copyWidgetCode() {
        const code = document.getElementById('widgetCode').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Widget code copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy code. Please select and copy manually.', 'error');
        });
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    }

    showNotification(message, type = 'info') {
        // Use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Setup avatar upload functionality
    setupAvatarUpload() {
        const uploadBtn = document.getElementById('uploadAvatarBtn');
        const removeBtn = document.getElementById('removeAvatarBtn');
        const avatarInput = document.getElementById('chatbotAvatarInput');
        const avatarPreview = document.getElementById('chatbotAvatarPreview');

        if (!uploadBtn || !removeBtn || !avatarInput || !avatarPreview) return;

        // Upload button click
        uploadBtn.addEventListener('click', function() {
            avatarInput.click();
        });

        // File input change
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    this.showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
                    e.target.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    this.showNotification('Image file size must be less than 5MB', 'error');
                    e.target.value = '';
                    return;
                }

                try {
                    // Show loading state
                    this.showNotification('Compressing image...', 'info');
                    
                    // Compress image to reduce storage size
                    const compressedDataUrl = await this.compressImage(file);
                    
                    if (avatarPreview) {
                        avatarPreview.src = compressedDataUrl;
                        avatarPreview.onload = () => {
                            // Save the avatar to settings
                            this.saveChatbotAvatar(compressedDataUrl);
                            this.showNotification('Avatar updated successfully!', 'success');
                        };
                        avatarPreview.onerror = () => {
                            this.showNotification('Failed to load image. Please try another file.', 'error');
                            avatarPreview.src = this.getDefaultAvatar();
                            avatarInput.value = '';
                        };
                    }
                } catch (error) {
                    console.error('Error processing avatar:', error);
                    this.showNotification('Failed to process image. Please try again.', 'error');
                    e.target.value = '';
                }
            }
        });

        // Remove button click
        removeBtn.addEventListener('click', () => {
            const img = avatarPreview;
            img.src = this.getDefaultAvatar();
            avatarInput.value = '';
        });

        // Load saved avatar
        this.loadChatbotAvatar();

        // Initialize multiple agents UI
        this.initializeMultipleAgents();
    }

    // Save chatbot avatar
    saveChatbotAvatar(avatarUrl) {
        try {
            this.settings.avatar = avatarUrl;

            // Save all settings data
            this.saveData();

            // Update widget code
            this.updateWidgetCode();

            // Update the widget avatar immediately if it exists
            if (window.updateChatbotWidgetAvatar) {
                window.updateChatbotWidgetAvatar(avatarUrl);
                console.log('Called updateChatbotWidgetAvatar with:', avatarUrl);
            }

            // Also try to update directly if widget exists
            if (window.FoodisChatbot && window.FoodisChatbot.updateAvatar) {
                window.FoodisChatbot.updateAvatar(avatarUrl);
                console.log('Called FoodisChatbot.updateAvatar with:', avatarUrl);
            }

            console.log('Avatar saved successfully:', avatarUrl);
        } catch (error) {
            console.error('Error saving avatar:', error);
        }
    }

    loadChatbotAvatar() {
        try {
            const avatarPreview = document.getElementById('chatbotAvatarPreview');
            console.log('loadChatbotAvatar - avatarPreview element:', avatarPreview);
            console.log('loadChatbotAvatar - this.settings.avatar:', this.settings.avatar);

            if (avatarPreview) {
                if (this.settings.avatar) {
                    avatarPreview.src = this.settings.avatar;
                    console.log('Avatar loaded from settings:', this.settings.avatar.substring(0, 50) + '...');
                } else {
                    avatarPreview.src = this.getDefaultAvatar();
                    console.log('Default avatar loaded');
                }
                
                // Ensure the image loads properly
                avatarPreview.onload = () => {
                    console.log('Avatar image loaded successfully');
                };
                avatarPreview.onerror = () => {
                    console.error('Avatar image failed to load, using default');
                    avatarPreview.src = this.getDefaultAvatar();
                };
            } else {
                console.error('chatbotAvatarPreview element not found');
            }
        } catch (error) {
            console.error('Error loading avatar:', error);
        }
    }

    initializeMultipleAgents() {
        const enableMultipleAgents = document.getElementById('enableMultipleAgents');
        if (enableMultipleAgents && this.settings.enableMultipleAgents) {
            this.toggleMultipleAgents(true);
            this.renderAgents();
        }
    }

    // Get default avatar
    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#e8f24c"/>
                <circle cx="32" cy="24" r="8" fill="#1e2127"/>
                <path d="M 35 35 Q 40 38 45 35" stroke="#1e2127" stroke-width="1" fill="none"/>
                <path d="M 28 55 Q 40 65 52 55" fill="#e74c3c"/>
                <rect x="35" y="45" width="10" height="15" fill="#2C3E50"/>
                <text x="40" y="72" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">Joe</text>
            </svg>
        `);
    }

    // Update widget avatar
    updateWidgetAvatar(avatarUrl) {
        // This will be handled by the widget when it loads
        if (window.updateChatbotWidgetAvatar) {
            window.updateChatbotWidgetAvatar(avatarUrl);
        }
    }

    renderLeads() {
        console.log('🎨 Dashboard: Starting renderLeads()');
        console.log('📊 Dashboard: Current leads data:', this.leads);
        
        if (!this.leads) {
            console.log('⚠️ Dashboard: No leads data - initializing empty array');
            this.leads = [];
        }

        // Update stats
        const totalLeads = this.leads.length;
        console.log('📊 Dashboard: Total leads count:', totalLeads);
        const today = new Date().toDateString();
        const todayLeads = this.leads.filter(lead => 
            new Date(lead.registeredAt).toDateString() === today
        ).length;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekLeads = this.leads.filter(lead => 
            new Date(lead.registeredAt) >= oneWeekAgo
        ).length;

        document.getElementById('totalLeads').textContent = totalLeads;
        document.getElementById('todayLeads').textContent = todayLeads;
        document.getElementById('weekLeads').textContent = weekLeads;

        // Filter leads based on search and date
        let filteredLeads = [...this.leads];

        const searchTerm = document.getElementById('leadsSearch')?.value.toLowerCase() || '';
        if (searchTerm) {
            filteredLeads = filteredLeads.filter(lead => 
                lead.name.toLowerCase().includes(searchTerm) ||
                lead.email.toLowerCase().includes(searchTerm)
            );
        }

        const dateFilter = document.getElementById('leadsDateFilter')?.value || '';
        if (dateFilter) {
            filteredLeads = filteredLeads.filter(lead => 
                new Date(lead.registeredAt).toDateString() === new Date(dateFilter).toDateString()
            );
        }

        // Render leads table
        const leadsTableBody = document.getElementById('leadsTableBody');
        if (!leadsTableBody) return;

        if (filteredLeads.length === 0) {
            leadsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--dark-text-secondary);">No leads found</td></tr>';
            return;
        }

        // Sort by registration date (newest first)
        filteredLeads.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

        leadsTableBody.innerHTML = filteredLeads.map(lead => {
            // Check both userType and systemUsage fields for compatibility
            const userType = lead.userType || lead.systemUsage || 'Anonymous';
            const leadScore = lead.leadScore || 0;
            const userTypeLabel = userType === 'current_user' ? 'Current User' : 
                                 userType === 'competitor_user' ? 'Competitor User' : 'Potential User';
            const userTypeClass = userType === 'current_user' ? 'current-user' : 
                                 userType === 'competitor_user' ? 'competitor-user' : 'potential-user';

            return `
            <tr>
                <td>${this.escapeHtml(lead.name)}</td>
                <td>
                    <a href="mailto:${lead.email}" style="color: var(--primary-color);">
                        ${this.escapeHtml(lead.email)}
                    </a>
                </td>
                <td>
                    <a href="tel:${lead.phone}" style="color: var(--primary-color);">
                        ${this.escapeHtml(lead.phone)}
                    </a>
                </td>
                <td>
                    <span class="user-type-badge ${userTypeClass}" title="Lead Score: ${leadScore}">
                        ${userTypeLabel}
                    </span>
                </td>
                <td>${lead.restaurantName ? this.escapeHtml(lead.restaurantName) : '-'}</td>
                <td>${this.formatDate(lead.registeredAt)}</td>
                <td>
                    <div class="lead-actions">
                        <button class="btn btn-sm btn-secondary" onclick="chatbotManager.viewLeadConversation('${lead.conversationId}')" title="View Conversation">
                            <i class="fas fa-comments"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="chatbotManager.contactLead('${lead.email}')" title="Send Email">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="chatbotManager.deleteLead('${lead.id || lead.email}')" title="Delete Lead">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    async exportLeads() {
        try {
            const response = await fetch('/api/chatbot/users/export');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chatbot-leads-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showNotification('Leads exported successfully!', 'success');
            } else {
                throw new Error('Failed to export leads');
            }
        } catch (error) {
            console.error('Error exporting leads:', error);
            this.showNotification('Failed to export leads', 'error');
        }
    }

    viewLeadConversation(conversationId) {
        if (conversationId) {
            this.viewConversation(conversationId);
        } else {
            this.showNotification('No conversation found for this lead', 'info');
        }
    }

    contactLead(email) {
        window.open(`mailto:${email}`, '_blank');
    }

    // Delete individual lead
    async deleteLead(leadId) {
        if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/chatbot/users/${leadId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from local array
                this.leads = this.leads.filter(lead => (lead.id || lead.email) !== leadId);
                this.renderLeads();
                this.showNotification('Lead deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            this.showNotification('Failed to delete lead', 'error');
        }
    }

    // Clear all leads
    async clearAllLeads() {
        if (!confirm('Are you sure you want to delete ALL leads? This action cannot be undone and will permanently remove all user lead data.')) {
            return;
        }

        try {
            const response = await fetch('/api/chatbot/users/clear-all', {
                method: 'DELETE'
            });

            if (response.ok) {
                this.leads = [];
                this.renderLeads();
                this.showNotification('All leads cleared successfully', 'success');
            } else {
                throw new Error('Failed to clear all leads');
            }
        } catch (error) {
            console.error('Error clearing all leads:', error);
            this.showNotification('Failed to clear all leads', 'error');
        }
    }

    // Delete individual conversation
    async deleteConversation(conversationId) {
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/chatbot/conversations/${conversationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from local array
                this.conversations = this.conversations.filter(conv => conv.id !== conversationId);
                this.renderConversations();
                this.showNotification('Conversation deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete conversation');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
            this.showNotification('Failed to delete conversation', 'error');
        }
    }

    // Clear all conversations
    async clearAllConversations() {
        if (!confirm('Are you sure you want to delete ALL conversations? This action cannot be undone and will permanently remove all conversation history.')) {
            return;
        }

        try {
            console.log('🗑️ Clearing all conversations from all sources...');
            
            // Clear from server
            const response = await fetch('/api/chatbot/conversations/clear-all', {
                method: 'DELETE'
            });

            // Clear from localStorage regardless of server response (for persistence)
            localStorage.removeItem('fooodis-chatbot-conversations');
            console.log('✅ Cleared conversations from localStorage');
            
            // Clear from memory
            this.conversations = [];
            
            // Update analytics
            this.analytics.totalConversations = 0;
            this.saveData();
            
            // Re-render UI
            this.renderConversations();
            
            if (response.ok) {
                console.log('✅ Cleared conversations from server');
                this.showNotification('All conversations cleared successfully', 'success');
            } else {
                console.warn('⚠️ Server clear failed, but localStorage and UI cleared');
                this.showNotification('Conversations cleared locally (server may need manual cleanup)', 'warning');
            }
            
        } catch (error) {
            console.error('💥 Error clearing conversations from server:', error);
            
            // Even if server fails, clear localStorage and UI for persistence
            localStorage.removeItem('fooodis-chatbot-conversations');
            this.conversations = [];
            this.analytics.totalConversations = 0;
            this.saveData();
            this.renderConversations();
            
            this.showNotification('Conversations cleared locally (server error occurred)', 'warning');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleMultipleAgents(enabled) {
        const agentsContainer = document.getElementById('agentsContainer');
        if (agentsContainer) {
            agentsContainer.style.display = enabled ? 'block' : 'none';
        }

        // Update the checkbox state to match the enabled parameter
        const enableMultipleAgents = document.getElementById('enableMultipleAgents');
        if (enableMultipleAgents) {
            enableMultipleAgents.checked = enabled;
        }

        // Only initialize default agents if enabling for the first time AND no agents exist
        if (enabled && (!this.settings.agents || this.settings.agents.length === 0)) {
            // Initialize with default agents if none exist
            this.settings.agents = this.getDefaultAgents();
        }

        // Update the setting
        this.settings.enableMultipleAgents = enabled;

        // Always render agents when enabling to show existing ones
        if (enabled) {
            this.renderAgents();
        }

        this.saveData();
    }

    getDefaultAgents() {
        return [
            {
                id: 'customer-support',
                name: 'Sarah Johnson',
                realName: 'Sarah Johnson',
                department: 'Customer Support',
                description: 'Handles general customer inquiries and support requests',
                color: '#28a745',
                active: true,
                assistantId: 'support-assistant',
                assignedAssistantId: 'support-assistant',
                model: 'gpt-4',
                systemPrompt: 'You are Sarah Johnson, a friendly customer support specialist for Fooodis. Help customers with general inquiries, account issues, and provide warm, helpful assistance.',
                personality: 'Friendly and helpful',
                introduction: {
                    en: "Hi! I'm Sarah from Customer Support. I'm here to help you with any questions or issues you might have.",
                    sv: "Hej! Jag heter Sarah och arbetar med kundsupport. Jag finns här för att hjälpa dig med frågor eller problem."
                }
            },
            {
                id: 'sales',
                name: 'Marcus Chen',
                realName: 'Marcus Chen',
                department: 'Sales',
                description: 'Assists with sales inquiries and product information',
                color: '#007bff',
                active: true,
                assistantId: 'sales-assistant',
                assignedAssistantId: 'sales-assistant',
                model: 'gpt-4',
                systemPrompt: 'You are Marcus Chen, an enthusiastic sales specialist for Fooodis. Help potential customers understand our products, pricing, and guide them through the sales process with expertise.',
                personality: 'Enthusiastic and knowledgeable',
                introduction: {
                    en: "Hello! I'm Marcus from Sales. I'd love to help you find the perfect Fooodis solution for your business.",
                    sv: "Hej! Jag heter Marcus och arbetar med försäljning. Jag hjälper gärna till med ditt företags behov."
                }
            },
            {
                id: 'billing',
                name: 'Elena Rodriguez',
                realName: 'Elena Rodriguez',
                department: 'Billing',
                description: 'Handles billing, payments, and subscription questions',
                color: '#ffc107',
                active: true,
                assistantId: 'billing-assistant',
                assignedAssistantId: 'billing-assistant',
                model: 'gpt-4',
                systemPrompt: 'You are Elena Rodriguez, a detail-oriented billing specialist for Fooodis. Help customers with billing questions, payment issues, and subscription management with precision and care.',
                personality: 'Detail-oriented and precise',
                introduction: {
                    en: "Hi! I'm Elena from Billing. I can help you with any payment or subscription questions you have.",
                    sv: "Hej! Jag heter Elena och arbetar med fakturering. Jag kan hjälpa dig med betalningar och prenumerationsfrågor."
                }
            },
            {
                id: 'technical-support',
                name: 'David Kim',
                realName: 'David Kim',
                department: 'Technical Support',
                description: 'Provides technical assistance and troubleshooting',
                color: '#dc3545',
                active: true,
                assistantId: 'technical-assistant',
                assignedAssistantId: 'technical-assistant',
                model: 'gpt-4',
                systemPrompt: 'You are David Kim, an expert technical support specialist for Fooodis. Help customers with technical issues, system problems, and provide detailed troubleshooting guidance with patience.',
                personality: 'Patient and technical',
                introduction: {
                    en: "Hello! I'm David from Technical Support. I'm here to help you solve any technical challenges you're facing.",
                    sv: "Hej! Jag heter David och arbetar med teknisk support. Jag hjälper dig gärna att lösa tekniska utmaningar."
                }
            },
            {
                id: 'delivery',
                name: 'Lisa Anderson',
                realName: 'Lisa Anderson',
                department: 'Delivery',
                description: 'Handles delivery-related inquiries and issues',
                color: '#17a2b8',
                active: true,
                assistantId: 'delivery-assistant',
                assignedAssistantId: 'delivery-assistant',
                model: 'gpt-4',
                systemPrompt: 'You are Lisa Anderson, a reliable delivery specialist for Fooodis. Help customers with delivery questions, tracking orders, and resolve delivery-related issues efficiently.',
                personality: 'Reliable and efficient',
                introduction: {
                    en: "Hi! I'm Lisa from Delivery. I can help you track your orders and resolve any delivery concerns.",
                    sv: "Hej! Jag heter Lisa och arbetar med leveranser. Jag kan hjälpa dig spåra beställningar och lösa leveransproblem."
                }
            },
            {
                id: 'general-inquiries',
                name: 'Alex Thompson',
                realName: 'Alex Thompson',
                department: 'General Inquiries',
                description: 'Handles general questions and routes to appropriate departments',
                color: '#6f42c1',
                active: true,
                assistantId: '',
                model: 'gpt-4',
                systemPrompt: 'You are Alex Thompson, a versatile general assistant for Fooodis. Provide helpful information and route customers to the appropriate department when needed with a welcoming approach.',
                personality: 'Welcoming and versatile',
                introduction: {
                    en: "Hello! I'm Alex, your general assistant. I can help with various questions or direct you to the right specialist.",
                    sv: "Hej! Jag heter Alex och är din allmänna assistent. Jag kan hjälpa med olika frågor eller hänvisa dig till rätt specialist."
                }
            }
        ];
    }

    renderAgents() {
        const agentsList = document.getElementById('agentsList');
        if (!agentsList) return;

        agentsList.innerHTML = this.settings.agents.map(agent => `
            <div class="agent-card" data-agent-id="${agent.id}">
                <div class="agent-avatar">
                    <img src="${agent.avatar || this.getDefaultAvatar()}" alt="${agent.name}" onerror="this.src='${this.getDefaultAvatar()}'" />
                </div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-personality">${agent.personality}</div>
                    <div class="agent-intro-preview">
                        EN: ${agent.introduction.en.substring(0, 50)}...
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="btn btn-sm btn-secondary" onclick="chatbotManager.editAgent('${agent.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="chatbotManager.deleteAgent('${agent.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadNodeFlow() {
        // Load node flow from localStorage
        const savedNodeFlow = localStorage.getItem('fooodis-chatbot-nodeflow');
        if (savedNodeFlow) {
            try {
                this.nodeFlow = JSON.parse(savedNodeFlow);
                console.log(' Node flow loaded from storage:', this.nodeFlow);
                return this.nodeFlow;
            } catch (error) {
                console.error('Error loading node flow:', error);
                this.nodeFlow = null;
            }
        }
        return null;
    }

    renderNodeFlowStatus() {
        // Show node flow status in admin panel
        const statusElement = document.getElementById('node-flow-status');
        if (statusElement && this.nodeFlow) {
            const nodeFlowIndicator = statusElement.querySelector('.nodeflow-status') || 
                document.createElement('div');
            
            if (!statusElement.querySelector('.nodeflow-status')) {
                nodeFlowIndicator.className = 'nodeflow-status';
                nodeFlowIndicator.innerHTML = `
                    <i class="fas fa-project-diagram"></i>
                    <span>Node Flow: ${this.nodeFlow.nodes ? this.nodeFlow.nodes.length : 0} nodes</span>
                `;
                statusElement.appendChild(nodeFlowIndicator);
            } else {
                nodeFlowIndicator.querySelector('span').textContent = 
                    `Node Flow: ${this.nodeFlow.nodes ? this.nodeFlow.nodes.length : 0} nodes`;
            }
        }
    }

    updateAnalytics(event, data) {
        // Update analytics data
        this.analytics[event] = data;
    }

    showToast(message, type = 'info') {
        // Use existing toast system
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    getActiveAssistants() {
        return this.assistants.filter(assistant => assistant.status === 'active');
    }

    generateAssistantDropdownOptions() {
        const activeAssistants = this.getActiveAssistants();
        let options = '<option value="">No AI Assistant (Manual Only)</option>';
        
        activeAssistants.forEach(assistant => {
            options += `<option value="${assistant.id}">${assistant.name} (${assistant.assistantId || 'No ID'})</option>`;
        });
        
        return options;
    }

    /**
     * Available departments for agent assignment
     */
    static DEPARTMENTS = [
        'Customer Support',
        'Sales', 
        'Billing',
        'Technical Support',
        'Delivery',
        'General Inquiries'
    ];

    /**
     * Get all available departments
     * @returns {Array} Array of department names
     */
    getAvailableDepartments() {
        return ChatbotManager.DEPARTMENTS;
    }

    /**
     * Generate department dropdown options HTML
     * @param {string} selectedDepartment - Currently selected department
     * @returns {string} HTML options for department dropdown
     */
    generateDepartmentDropdownOptions(selectedDepartment = '') {
        let options = '<option value="">Select Department</option>';
        
        this.getAvailableDepartments().forEach(department => {
            const selected = department === selectedDepartment ? 'selected' : '';
            options += `<option value="${department}" ${selected}>${department}</option>`;
        });
        
        return options;
    }

    /**
     * Get agents by department
     * @param {string} department - Department name
     * @returns {Array} Array of agents in the specified department
     */
    getAgentsByDepartment(department) {
        if (!department) return [];
        
        return this.settings.agents?.filter(agent => 
            agent.active && agent.department === department
        ) || [];
    }

    /**
     * Get department metadata for node flow builder integration
     * @returns {Array} Array of department objects with id, name, color, and agents
     */
    getAgentDepartments() {
        const departmentColors = {
            'Customer Support': '#007bff',
            'Sales': '#28a745',
            'Billing': '#ffc107',
            'Technical Support': '#dc3545',
            'Delivery': '#17a2b8',
            'General Inquiries': '#6f42c1'
        };

        return this.getAvailableDepartments().map(department => {
            const departmentAgents = this.getAgentsByDepartment(department);
            
            return {
                id: department.toLowerCase().replace(/\s+/g, '-'),
                name: department,
                color: departmentColors[department] || '#6c757d',
                agents: departmentAgents.map(agent => ({
                    id: agent.id,
                    name: agent.name || agent.realName,
                    active: agent.active
                }))
            };
        }).filter(dept => dept.agents.length > 0); // Only return departments with active agents
    }

    /**
     * Route to appropriate agent based on department selection
     * @param {string} department - Selected department
     * @param {Object} routingOptions - Additional routing options
     * @returns {Object|null} Selected agent or null if none available
     */
    routeAgentByDepartment(department, routingOptions = {}) {
        const availableAgents = this.getAgentsByDepartment(department);
        
        if (availableAgents.length === 0) {
            console.warn(`No active agents found for department: ${department}`);
            return null;
        }
        
        // If only one agent, return it
        if (availableAgents.length === 1) {
            return availableAgents[0];
        }
        
        // Apply existing routing logic (round-robin by default)
        return this.selectAgentFromPool(availableAgents, routingOptions);
    }

    /**
     * Select agent from pool using existing routing logic
     * @param {Array} agentPool - Available agents
     * @param {Object} options - Routing options
     * @returns {Object} Selected agent
     */
    selectAgentFromPool(agentPool, options = {}) {
        // Implement round-robin selection (can be extended with other strategies)
        const lastUsedKey = `lastUsedAgent_${options.department || 'default'}`;
        const lastUsedIndex = localStorage.getItem(lastUsedKey) || 0;
        
        let nextIndex = (parseInt(lastUsedIndex) + 1) % agentPool.length;
        localStorage.setItem(lastUsedKey, nextIndex.toString());
        
        return agentPool[nextIndex];
    }

    /**
     * Generate response using assigned AI Assistant if available
     * @param {Object} requestData - The request data from chatbot widget
     * @returns {Promise<Object>} Response object with success status and message
     */
    async generateAgentResponse(requestData) {
        try {
            const { message, agent, assistantId, language = 'en', conversationId } = requestData;
            
            console.log('🤖 AI ASSISTANT DEBUG - generateAgentResponse called with:', {
                message: message?.substring(0, 50) + '...',
                agentName: agent?.name,
                agentAssistantId: agent?.assignedAssistantId,
                requestedAssistantId: assistantId,
                language,
                conversationId
            });
            
            // If no agent is specified, use default response
            if (!agent) {
                console.log('🚨 AI ASSISTANT DEBUG - No agent specified, using default response');
                return this.getDefaultResponse(message, language);
            }

            // If agent has assigned assistant, use that assistant's configuration
            if (assistantId && agent.assignedAssistantId === assistantId) {
                console.log('🔍 AI ASSISTANT DEBUG - Looking for assigned assistant:', assistantId);
                const assignedAssistant = this.assistants.find(a => a.id === assistantId && a.status === 'active');
                
                console.log('🔍 AI ASSISTANT DEBUG - Available assistants:', this.assistants.map(a => ({id: a.id, status: a.status})));
                
                if (assignedAssistant) {
                    console.log('✅ AI ASSISTANT DEBUG - Found assigned assistant, calling generateAssistantResponse');
                    return await this.generateAssistantResponse(message, assignedAssistant, language, conversationId);
                } else {
                    console.log('❌ AI ASSISTANT DEBUG - Assigned assistant not found or inactive');
                }
            } else {
                console.log('🚨 AI ASSISTANT DEBUG - Assistant ID mismatch or missing:', {
                    requestedAssistantId: assistantId,
                    agentAssistantId: agent.assignedAssistantId,
                    match: assistantId === agent.assignedAssistantId
                });
            }

            // If no valid assistant found, return error instead of static fallback
            console.log('❌ AI ASSISTANT DEBUG - No valid assistant found for agent:', agent.name);
            return {
                success: false,
                message: language === 'sv' 
                    ? 'Jag har för närvarande tekniska problem. Vänligen försök igen om ett ögonblick.'
                    : 'I\'m experiencing technical difficulties right now. Please try again in a moment.',
                error: 'No valid assistant configuration found'
            };
            
        } catch (error) {
            console.error('Error generating agent response:', error);
            return {
                success: false,
                message: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
                error: error.message
            };
        }
    }

    /**
     * Generate response using specific AI Assistant
     * @param {string} message - User message
     * @param {Object} assistant - AI Assistant configuration
     * @param {string} language - Language code
     * @param {string} conversationId - Conversation ID
     * @returns {Promise<Object>} Response object
     */
    async generateAssistantResponse(message, assistant, language, conversationId) {
        try {
            console.log('🚀 AI ASSISTANT DEBUG - generateAssistantResponse called for:', {
                assistantName: assistant.name,
                assistantId: assistant.assistantId,
                message: message?.substring(0, 50) + '...',
                language
            });
            
            // Get OpenAI API configuration with multiple sources
            let apiKey = localStorage.getItem('openai-api-key') || 
                        localStorage.getItem('OPENAI_API_KEY') ||
                        this.config?.openaiApiKey ||
                        process?.env?.OPENAI_API_KEY;
                        
            console.log('🔑 AI ASSISTANT DEBUG - API Key check:', {
                hasApiKey: !!apiKey,
                keyLength: apiKey ? apiKey.length : 0,
                keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NONE',
                sources: {
                    localStorage_openai_api_key: !!localStorage.getItem('openai-api-key'),
                    localStorage_OPENAI_API_KEY: !!localStorage.getItem('OPENAI_API_KEY'),
                    config_openaiApiKey: !!this.config?.openaiApiKey,
                    env_OPENAI_API_KEY: !!(typeof process !== 'undefined' && process?.env?.OPENAI_API_KEY)
                }
            });
            
            if (!apiKey) {
                console.warn('❌ AI ASSISTANT DEBUG - OpenAI API key not configured from any source, using enhanced fallback');
                return this.enhancedFallbackResponse(message, assistant, language, conversationId);
            }

            const assistantId = assistant.assistantId; // This is the OpenAI assistant ID (asst_...)
            console.log('🎯 AI ASSISTANT DEBUG - Assistant routing decision:', {
                assistantId,
                isAssistantId: assistantId && assistantId.startsWith('asst_'),
                willUseAssistantsAPI: assistantId && assistantId.startsWith('asst_')
            });
            
            if (assistantId && assistantId.startsWith('asst_')) {
                console.log('🤖 AI ASSISTANT DEBUG - Using OpenAI Assistants API');
                // Use OpenAI Assistants API
                return await this.callOpenAIAssistant(message, assistantId, apiKey, assistant, language, conversationId);
            } else {
                console.log('💬 AI ASSISTANT DEBUG - Using OpenAI Chat Completions API');
                // Use OpenAI Chat Completions API with system prompt
                return await this.callOpenAIChat(message, assistant, apiKey, language, conversationId);
            }
            
        } catch (error) {
            console.error('❌ Error with OpenAI assistant response:', error);
            console.log('🔄 Falling back to enhanced response generation');
            // Fallback to enhanced simulation on error
            return this.enhancedFallbackResponse(message, assistant, language, conversationId);
        }
    }

    /**
     * Call OpenAI Assistants API
     */
    async callOpenAIAssistant(message, assistantId, apiKey, assistant, language, conversationId) {
        try {
            // Create a thread
            const threadResponse = await fetch('https://api.openai.com/v1/threads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({})
            });

            if (!threadResponse.ok) {
                throw new Error(`Thread creation failed: ${threadResponse.status}`);
            }

            const thread = await threadResponse.json();

            // Add message to thread
            const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    role: 'user',
                    content: message
                })
            });

            if (!messageResponse.ok) {
                throw new Error(`Message creation failed: ${messageResponse.status}`);
            }

            // Run the assistant
            const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    assistant_id: assistantId
                })
            });

            if (!runResponse.ok) {
                throw new Error(`Run creation failed: ${runResponse.status}`);
            }

            const run = await runResponse.json();

            // Wait for completion (with timeout)
            const response = await this.waitForRunCompletion(thread.id, run.id, apiKey);
            
            // Store conversation data
            this.storeConversationMessage(conversationId, message, response, assistant);
            
            return {
                success: true,
                message: response,
                conversationId: conversationId || 'conv-' + Date.now(),
                assistantUsed: assistant.name,
                assistantId: assistant.id
            };

        } catch (error) {
            console.error('OpenAI Assistant API error:', error);
            throw error;
        }
    }

    /**
     * Call OpenAI Chat Completions API
     */
    async callOpenAIChat(message, assistant, apiKey, language, conversationId) {
        try {
            const systemPrompt = assistant.systemPrompt || 'You are a helpful assistant.';
            const model = localStorage.getItem('openai-model') || 'gpt-4';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Chat completion failed: ${response.status}`);
            }

            const data = await response.json();
            const generatedResponse = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';
            
            // Store conversation data
            this.storeConversationMessage(conversationId, message, generatedResponse, assistant);
            
            return {
                success: true,
                message: generatedResponse,
                conversationId: conversationId || 'conv-' + Date.now(),
                assistantUsed: assistant.name,
                assistantId: assistant.id
            };

        } catch (error) {
            console.error('OpenAI Chat API error:', error);
            throw error;
        }
    }

    /**
     * Wait for OpenAI run completion - OPTIMIZED for faster responses
     */
    async waitForRunCompletion(threadId, runId, apiKey, maxAttempts = 20) {
        console.log('⏱️ RESPONSE TIMING - Starting OpenAI response polling...');
        const startTime = Date.now();
        
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            const run = await response.json();
            console.log(`🔄 POLLING STATUS - Attempt ${i+1}/${maxAttempts}, Status: ${run.status}`);

            if (run.status === 'completed') {
                const responseTime = Date.now() - startTime;
                console.log(`✅ RESPONSE COMPLETE - Generated in ${responseTime}ms after ${i+1} attempts`);
                
                // Get the messages
                const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });

                const messages = await messagesResponse.json();
                return messages.data[0]?.content[0]?.text?.value || 'No response generated.';
            } else if (run.status === 'failed') {
                console.error('❌ ASSISTANT FAILED - OpenAI run failed after', Date.now() - startTime, 'ms');
                throw new Error('Assistant run failed');
            }

            // OPTIMIZED: Use progressive delays - start fast, then slow down
            const delay = i < 3 ? 300 : i < 8 ? 500 : 1000; // 300ms, then 500ms, then 1s
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const totalTime = Date.now() - startTime;
        console.error(`⏰ TIMEOUT - Assistant run timed out after ${totalTime}ms (${maxAttempts} attempts)`);
        throw new Error(`Assistant run timed out after ${totalTime}ms`);
    }

    /**
     * Fallback assistant response using simulation
     */
    fallbackAssistantResponse(message, assistant, language, conversationId) {
        const enhancedResponse = this.simulateAssistantResponse(message, assistant, language);
        
        // Store conversation data
        this.storeConversationMessage(conversationId, message, enhancedResponse, assistant);
        
        return {
            success: true,
            message: enhancedResponse,
            conversationId: conversationId || 'conv-' + Date.now(),
            assistantUsed: assistant.name + ' (Simulated)',
            assistantId: assistant.id
        };
    }

    /**
     * Enhanced fallback response with better contextual analysis
     * @param {string} message - User message
     * @param {Object} assistant - AI Assistant configuration
     * @param {string} language - Language code
     * @param {string} conversationId - Conversation ID
     * @returns {Object} Response object
     */
    enhancedFallbackResponse(message, assistant, language, conversationId) {
        const enhancedResponse = this.generateContextualResponse(message, assistant, language);
        
        // Store conversation data
        this.storeConversationMessage(conversationId, message, enhancedResponse, assistant);
        
        return {
            success: true,
            message: enhancedResponse,
            conversationId: conversationId || 'conv-' + Date.now(),
            assistantUsed: assistant.name + ' (Enhanced Simulation)',
            assistantId: assistant.id
        };
    }

    /**
     * Simulate AI Assistant response based on configuration
     * @param {string} message - User message
     * @param {Object} assistant - AI Assistant configuration
     * @param {string} language - Language code
     * @returns {string} Generated response
     */
    simulateAssistantResponse(message, assistant, language) {
        const responses = {
            en: [
                `Based on ${assistant.name}'s expertise: ${this.getContextualResponse(message, assistant, 'en')}`,
                `As ${assistant.name}, I'd suggest: ${this.getContextualResponse(message, assistant, 'en')}`,
                `${assistant.name} here - ${this.getContextualResponse(message, assistant, 'en')}`
            ],
            sv: [
                `Baserat på ${assistant.name}'s expertis: ${this.getContextualResponse(message, assistant, 'sv')}`,
                `Som ${assistant.name} skulle jag föreslå: ${this.getContextualResponse(message, assistant, 'sv')}`,
                `${assistant.name} här - ${this.getContextualResponse(message, assistant, 'sv')}`
            ]
        };

        const langResponses = responses[language] || responses['en'];
        const template = langResponses[Math.floor(Math.random() * langResponses.length)];
        
        return template;
    }

    /**
     * Generate contextually-aware response that analyzes user input
     * @param {string} message - User message
     * @param {Object} assistant - AI Assistant configuration  
     * @param {string} language - Language code
     * @returns {string} Contextual response
     */
    generateContextualResponse(message, assistant, language) {
        const userMessage = message.toLowerCase();
        const agentName = assistant.name || 'AI Assistant';
        const agentRole = assistant.role || 'support agent';
        
        // Analyze user intent from message content
        const intents = {
            pricing: ['price', 'cost', 'expensive', 'cheap', 'fee', 'payment', 'billing'],
            technical: ['error', 'bug', 'broken', 'issue', 'problem', 'help', 'support', 'fix'],
            features: ['feature', 'function', 'how to', 'tutorial', 'guide', 'setup'],
            sales: ['demo', 'trial', 'buy', 'purchase', 'plan', 'upgrade'],
            general: ['hello', 'hi', 'info', 'about', 'what is']
        };
        
        let detectedIntent = 'general';
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => userMessage.includes(keyword))) {
                detectedIntent = intent;
                break;
            }
        }
        
        // Generate response based on agent role and detected intent
        const responses = this.getResponseTemplates(detectedIntent, agentRole, language);
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Personalize with agent name and add contextual elements
        return selectedResponse
            .replace('{agentName}', agentName)
            .replace('{userMessage}', message.substring(0, 50))
            .replace('{intent}', detectedIntent);
    }

    /**
     * Get response templates based on intent and agent role
     * @param {string} intent - Detected user intent
     * @param {string} agentRole - Agent role/department
     * @param {string} language - Language code
     * @returns {Array} Array of response templates
     */
    getResponseTemplates(intent, agentRole, language) {
        const templates = {
            en: {
                pricing: [
                    "Hi! I'm {agentName} from billing. I'd be happy to explain our pricing structure and help you find the right plan.",
                    "As your {agentName}, let me walk you through our pricing options that would work best for your restaurant.",
                    "Great question about pricing! I'm {agentName} and I can provide detailed information about our plans and features."
                ],
                technical: [
                    "I'm {agentName} from technical support. I understand you're experiencing an issue - let me help you resolve it quickly.",
                    "Hi there! {agentName} here. I see you mentioned a technical concern. Can you tell me more about what's happening?",
                    "Technical support here - I'm {agentName}. I'm ready to help troubleshoot and get your system running smoothly."
                ],
                features: [
                    "Hello! I'm {agentName} and I'd love to show you how our platform can enhance your restaurant's online presence.",
                    "Hi! {agentName} here from our features team. I can guide you through our tools and help you get the most out of Fooodis.",
                    "Great to meet you! I'm {agentName} and I specialize in helping restaurants maximize their website potential."
                ],
                sales: [
                    "Hi! I'm {agentName} from sales. I'd be delighted to show you how Fooodis can transform your restaurant's digital presence.",
                    "Hello! {agentName} here. I'm excited to discuss how our platform can help grow your restaurant business online.",
                    "Welcome! I'm {agentName} and I'd love to demonstrate how Fooodis creates beautiful, effective restaurant websites."
                ],
                general: [
                    "Hello! I'm {agentName}. Welcome to Fooodis - how can I help you create an amazing online presence for your restaurant today?",
                    "Hi there! {agentName} here. I'm ready to assist you with any questions about our restaurant website platform.",
                    "Welcome to Fooodis! I'm {agentName}, and I'm here to help you discover how we can elevate your restaurant's digital experience."
                ]
            },
            sv: {
                pricing: [
                    "Hej! Jag är {agentName} från fakturering. Jag hjälper gärna till att förklara våra priser och hitta rätt plan för dig.",
                    "Som din {agentName} kan jag visa dig våra prisalternativ som passar bäst för din restaurang.",
                    "Bra fråga om priser! Jag är {agentName} och kan ge detaljerad information om våra planer och funktioner."
                ],
                technical: [
                    "Jag är {agentName} från teknisk support. Jag förstår att du har ett problem - låt mig hjälpa dig lösa det snabbt.",
                    "Hej! {agentName} här. Jag ser att du nämnde ett tekniskt problem. Kan du berätta mer om vad som händer?",
                    "Teknisk support här - jag är {agentName}. Jag är redo att hjälpa till med felsökning och få ditt system att fungera smidigt."
                ],
                features: [
                    "Hej! Jag är {agentName} och jag skulle gärna visa dig hur vår plattform kan förbättra din restaurangs närvaro online.",
                    "Hej! {agentName} här från vårt funktionsteam. Jag kan guida dig genom våra verktyg och hjälpa dig få ut det mesta av Fooodis.",
                    "Kul att träffa dig! Jag är {agentName} och specialiserar mig på att hjälpa restauranger maximera sin webbpotential."
                ],
                sales: [
                    "Hej! Jag är {agentName} från försäljning. Jag skulle gärna visa dig hur Fooodis kan transformera din restaurangs digitala närvaro.",
                    "Hej! {agentName} här. Jag är exalterad över att diskutera hur vår plattform kan hjälpa ditt restaurangföretag växa online.",
                    "Välkommen! Jag är {agentName} och skulle gärna demonstrera hur Fooodis skapar vackra, effektiva restaurangwebbsidor."
                ],
                general: [
                    "Hej! Jag är {agentName}. Välkommen till Fooodis - hur kan jag hjälpa dig skapa en fantastisk närvaro online för din restaurang idag?",
                    "Hej! {agentName} här. Jag är redo att hjälpa dig med alla frågor om vår restaurangwebbplats-plattform.",
                    "Välkommen till Fooodis! Jag är {agentName}, och jag är här för att hjälpa dig upptäcka hur vi kan höja din restaurangs digitala upplevelse."
                ]
            }
        };
        
        return templates[language]?.[intent] || templates['en'][intent] || templates['en']['general'];
    }

    /**
     * Get contextual response based on assistant configuration (LEGACY - for backward compatibility)
     * @param {string} message - User message
     * @param {Object} assistant - AI Assistant configuration
     * @param {string} language - Language code
     * @returns {string} Contextual response
     */
    getContextualResponse(message, assistant, language) {
        // Use the enhanced contextual response generator
        return this.generateContextualResponse(message, assistant, language);
    }

    /**
     * Generate default agent response without AI Assistant
     * @param {string} message - User message
     * @param {Object} agent - Agent configuration
     * @param {string} language - Language code
     * @returns {Object} Response object
     */
    generateDefaultAgentResponse(message, agent, language) {
        const agentIntro = agent.introduction?.[language] || agent.introduction?.en || "Hello, I'm here to help!";
        const responses = {
            en: [
                `${agentIntro} How can I assist you today?`,
                `Thanks for your message! ${agentIntro}`,
                `I'm ${agent.name}. ${agentIntro}`
            ],
            sv: [
                `${agentIntro} Hur kan jag hjälpa dig idag?`,
                `Tack för ditt meddelande! ${agentIntro}`,
                `Jag är ${agent.name}. ${agentIntro}`
            ]
        };

        const langResponses = responses[language] || responses['en'];
        const response = langResponses[Math.floor(Math.random() * langResponses.length)];

        return {
            success: true,
            message: response,
            conversationId: 'conv-' + Date.now(),
            agent: agent.name
        };
    }

    /**
     * Get default response when no agent is available
     * @param {string} message - User message
     * @param {string} language - Language code
     * @returns {Object} Response object
     */
    getDefaultResponse(message, language) {
        const responses = {
            en: "Hello! Thanks for your message. One of our team members will be with you shortly.",
            sv: "Hej! Tack för ditt meddelande. En av våra teammedlemmar kommer att kontakta dig inom kort."
        };

        return {
            success: true,
            message: responses[language] || responses['en'],
            conversationId: 'conv-' + Date.now()
        };
    }

    /**
     * Store conversation message for analytics and history
     * @param {string} conversationId - Conversation ID
     * @param {string} userMessage - User's message
     * @param {string} response - Assistant's response
     * @param {Object} assistant - AI Assistant used
     */
    storeConversationMessage(conversationId, userMessage, response, assistant) {
        try {
            if (!this.conversations) {
                this.conversations = [];
            }

            let conversation = this.conversations.find(c => c.id === conversationId);
            if (!conversation) {
                conversation = {
                    id: conversationId,
                    startTime: new Date().toISOString(),
                    messages: [],
                    assistant: assistant ? assistant.name : null,
                    assistantId: assistant ? assistant.id : null
                };
                this.conversations.push(conversation);
            }

            conversation.messages.push(
                { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
                { role: 'assistant', content: response, timestamp: new Date().toISOString(), assistantUsed: assistant?.name }
            );

            // Keep only last 100 conversations to prevent storage overflow
            if (this.conversations.length > 100) {
                this.conversations = this.conversations.slice(-100);
            }

            // Save to localStorage
            localStorage.setItem('fooodis-chatbot-conversations', JSON.stringify(this.conversations));
            
        } catch (error) {
            console.error('Error storing conversation:', error);
        }
    }

    showAddAgentModal() {
        const modal = this.createModal('Add Agent', `
            <form id="agentForm" class="agent-form">
                <div class="form-group">
                    <label for="agentAvatar">Avatar Image</label>
                    <div class="avatar-upload-container">
                        <div class="avatar-preview" id="avatarPreview">
                            <img src="${this.getDefaultAvatar()}" alt="Avatar preview" />
                        </div>
                        <input type="file" id="agentAvatar" accept="image/*" style="display: none;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('agentAvatar').click()">
                            <i class="fas fa-upload"></i> Upload Image
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="resetAvatar">
                            <i class="fas fa-refresh"></i> Default
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="agentName">Agent Name</label>
                    <input type="text" id="agentName" required>
                </div>
                <div class="form-group">
                    <label for="agentPersonality">Personality</label>
                    <input type="text" id="agentPersonality" placeholder="e.g., Friendly and helpful">
                </div>
                <div class="form-group">
                    <label for="agentDepartment">Department</label>
                    <select id="agentDepartment" class="form-control" required>
                        ${this.generateDepartmentDropdownOptions()}
                    </select>
                    <small class="form-text text-muted">
                        Select the department this agent belongs to. This will be used for routing Agent Handoff nodes.
                    </small>
                </div>
                <div class="form-group">
                    <label for="agentAssistant">Assigned AI Assistant</label>
                    <select id="agentAssistant" class="form-control">
                        ${this.generateAssistantDropdownOptions()}
                    </select>
                    <small class="form-text text-muted">
                        Select an AI Assistant to handle automated responses for this agent. Leave unassigned for manual-only responses.
                    </small>
                </div>
                <div class="form-group">
                    <label for="agentIntroEn">Introduction (English)</label>
                    <textarea id="agentIntroEn" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="agentIntroSv">Introduction (Swedish)</label>
                    <textarea id="agentIntroSv" rows="2" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Agent</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);

        // Handle avatar upload and preview
        const avatarInput = document.getElementById('agentAvatar');
        const avatarPreview = document.getElementById('avatarPreview');
        const resetAvatarBtn = document.getElementById('resetAvatar');

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    this.showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
                    e.target.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    this.showNotification('Image file size must be less than 5MB', 'error');
                    e.target.value = '';
                    return;
                }

                try {
                    // Show loading state
                    this.showNotification('Compressing image...', 'info');
                    
                    // Compress image to reduce storage size
                    const compressedDataUrl = await this.compressImage(file);
                    
                    const img = avatarPreview;
                    if (img) {
                        img.src = compressedDataUrl;
                        img.onload = () => {
                            this.showNotification('Avatar updated successfully!', 'success');
                        };
                        img.onerror = () => {
                            this.showNotification('Failed to load image. Please try another file.', 'error');
                            img.src = this.getDefaultAvatar();
                            avatarInput.value = '';
                        };
                    }
                } catch (error) {
                    console.error('Error processing avatar:', error);
                    this.showNotification('Failed to process image. Please try again.', 'error');
                    e.target.value = '';
                }
            }
        });

        resetAvatarBtn.addEventListener('click', () => {
            const img = avatarPreview;
            img.src = this.getDefaultAvatar();
            avatarInput.value = '';
        });

        document.getElementById('agentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAgent();
            modal.remove();
        });
    }

    saveAgent(agentId = null) {
        try {
            console.log('saveAgent called with agentId:', agentId);
            
            const nameElement = document.getElementById('agentName');
            const personalityElement = document.getElementById('agentPersonality');
            const departmentElement = document.getElementById('agentDepartment');
            const introEnElement = document.getElementById('agentIntroEn');
            const introSvElement = document.getElementById('agentIntroSv');
            const assistantElement = document.getElementById('agentAssistant');
            
            console.log('Form elements found:', {
                nameElement: !!nameElement,
                personalityElement: !!personalityElement,
                departmentElement: !!departmentElement,
                introEnElement: !!introEnElement,
                introSvElement: !!introSvElement,
                assistantElement: !!assistantElement
            });

            const name = nameElement?.value?.trim();
            const personality = personalityElement?.value?.trim();
            const department = departmentElement?.value?.trim();
            const introEn = introEnElement?.value?.trim();
            const introSv = introSvElement?.value?.trim();
            const assignedAssistantId = assistantElement?.value?.trim() || null;

            console.log('Form values:', { name, personality, department, introEn, introSv, assignedAssistantId });

            // Validate required fields
            if (!name) {
                console.log('Validation failed: Agent name is required');
                this.showNotification('Agent name is required!', 'error');
                return false;
            }

            // Get avatar safely
            let avatarSrc = '';
            const avatarPreview = document.getElementById('avatarPreview');
            console.log('avatarPreview element found:', !!avatarPreview);
            
            if (avatarPreview) {
                const img = avatarPreview;
                console.log('Avatar img element found:', !!img);
                avatarSrc = img.src || this.getDefaultAvatar();
            } else {
                avatarSrc = this.getDefaultAvatar();
            }
            console.log('Avatar src:', avatarSrc);

            const agentData = {
                id: agentId || 'agent-' + Date.now(),
                name: name,
                personality: personality || '',
                avatar: avatarSrc,
                department: department || '',
                introduction: {
                    en: introEn || '',
                    sv: introSv || ''
                },
                assignedAssistantId: assignedAssistantId,
                enabled: true
            };

            console.log('Agent data created:', agentData);

            // Initialize agents array if needed
            if (!this.settings.agents) {
                console.log('Initializing agents array');
                this.settings.agents = [];
            }

            if (agentId) {
                // Update existing agent
                const index = this.settings.agents.findIndex(a => a.id === agentId);
                console.log('Agent index found:', index);
                if (index !== -1) {
                    this.settings.agents[index] = { ...this.settings.agents[index], ...agentData };
                }
            } else {
                // Add new agent
                this.settings.agents.push(agentData);
            }

            console.log('Current agents array:', this.settings.agents);

            // Save data with error handling
            console.log('Calling saveData...');
            this.saveData();
            console.log('saveData completed');
            
            console.log('Calling renderAgents...');
            this.renderAgents();
            console.log('renderAgents completed');
            
            this.showNotification('Agent saved successfully!', 'success');
            console.log('Agent save completed successfully');
            return true;

        } catch (error) {
            console.error('Error saving agent - detailed:', error);
            console.error('Error stack:', error.stack);
            console.error('Error message:', error.message);
            this.showNotification('Failed to save agent. Error: ' + error.message, 'error');
            return false;
        }
    }

    editAgent(agentId) {
        const agent = this.settings.agents?.find(a => a.id === agentId);
        if (!agent) return;

        const modal = this.createModal('Edit Agent', `
            <form id="agentForm">
                <div class="form-group">
                    <label for="agentAvatar">Avatar Image</label>
                    <div class="avatar-upload-container">
                        <div class="avatar-preview" id="avatarPreview">
                            <img src="${agent.avatar}" alt="Avatar preview" />
                        </div>
                        <input type="file" id="agentAvatar" accept="image/*" style="display: none;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('agentAvatar').click()">
                            <i class="fas fa-upload"></i> Upload Image
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="resetAvatar">
                            <i class="fas fa-refresh"></i> Default
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="agentName">Agent Name</label>
                    <input type="text" id="agentName" value="${agent.name}" required>
                </div>
                <div class="form-group">
                    <label for="agentPersonality">Personality</label>
                    <input type="text" id="agentPersonality" value="${agent.personality}" placeholder="e.g., Friendly and helpful">
                </div>
                <div class="form-group">
                    <label for="agentDepartment">Department</label>
                    <select id="agentDepartment" class="form-control" required>
                        ${this.generateDepartmentDropdownOptions(agent.department)}
                    </select>
                    <small class="form-text text-muted">
                        Select the department this agent belongs to. This will be used for routing Agent Handoff nodes.
                    </small>
                </div>
                <div class="form-group">
                    <label for="agentAssistant">Assigned AI Assistant</label>
                    <select id="agentAssistant" class="form-control">
                        ${this.generateAssistantDropdownOptions()}
                    </select>
                    <small class="form-text text-muted">
                        Select an AI Assistant to handle automated responses for this agent. Leave unassigned for manual-only responses.
                    </small>
                </div>
                <div class="form-group">
                    <label for="agentIntroEn">Introduction (English)</label>
                    <textarea id="agentIntroEn" rows="2" required>${agent.introduction.en}</textarea>
                </div>
                <div class="form-group">
                    <label for="agentIntroSv">Introduction (Swedish)</label>
                    <textarea id="agentIntroSv" rows="2" required>${agent.introduction.sv}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Agent</button>
                </div>
            </form>
        `);

        document.body.appendChild(modal);

        // Set the current assistant selection after modal is rendered
        const agentAssistantSelect = document.getElementById('agentAssistant');
        if (agentAssistantSelect && agent.assignedAssistantId) {
            agentAssistantSelect.value = agent.assignedAssistantId;
        }

        // Handle avatar upload and preview
        const avatarInput = document.getElementById('agentAvatar');
        const avatarPreview = document.getElementById('avatarPreview');
        const resetAvatarBtn = document.getElementById('resetAvatar');

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    this.showNotification('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
                    e.target.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    this.showNotification('Image file size must be less than 5MB', 'error');
                    e.target.value = '';
                    return;
                }

                try {
                    // Show loading state
                    this.showNotification('Compressing image...', 'info');
                    
                    // Compress image to reduce storage size
                    const compressedDataUrl = await this.compressImage(file);
                    
                    const img = avatarPreview;
                    if (img) {
                        img.src = compressedDataUrl;
                        img.onload = () => {
                            this.showNotification('Avatar updated successfully!', 'success');
                        };
                        img.onerror = () => {
                            this.showNotification('Failed to load image. Please try another file.', 'error');
                            img.src = this.getDefaultAvatar();
                            avatarInput.value = '';
                        };
                    }
                } catch (error) {
                    console.error('Error processing avatar:', error);
                    this.showNotification('Failed to process image. Please try again.', 'error');
                    e.target.value = '';
                }
            }
        });

        resetAvatarBtn.addEventListener('click', () => {
            const img = avatarPreview;
            img.src = this.getDefaultAvatar();
            avatarInput.value = '';
        });

        document.getElementById('agentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAgent(agentId);
            modal.remove();
        });
    }

    deleteAgent(agentId) {
        if (confirm('Are you sure you want to delete this agent?')) {
            this.settings.agents = this.settings.agents.filter(a => a.id !== agentId);
            this.saveData();
            this.renderAgents();
            this.showNotification('Agent deleted successfully!', 'success');
        }
    }

    /**
     * Update node flow data from the node flow builder
     * @param {Object} flowData - Node flow data with nodes and connections
     */
    updateNodeFlow(flowData) {
        try {
            console.log('Updating node flow data:', flowData);
            this.nodeFlow = flowData;
            
            // Save to localStorage
            localStorage.setItem('fooodis-chatbot-nodeflow', JSON.stringify(flowData));
            
            // Update status display
            this.renderNodeFlowStatus();
            
            // Notify widget about flow update
            if (window.chatbotWidget) {
                window.chatbotWidget.onNodeFlowUpdated(flowData);
            }
            
            console.log('Node flow updated successfully');
        } catch (error) {
            console.error('Error updating node flow:', error);
        }
    }

    /**
     * Get current handoff node department from node flow
     * @returns {string|null} Department ID for the current handoff node
     */
    getCurrentHandoffDepartment() {
        if (!this.nodeFlow || !this.nodeFlow.nodes) {
            console.log('No node flow available for department routing');
            return null;
        }

        // Find handoff nodes in the flow
        const handoffNodes = this.nodeFlow.nodes.filter(node => node.type === 'handoff');
        
        if (handoffNodes.length === 0) {
            console.log('No handoff nodes found in flow');
            return null;
        }

        // For now, use the first handoff node found
        // In a more sophisticated implementation, this would track conversation state
        const handoffNode = handoffNodes[0];
        
        if (handoffNode.data && handoffNode.data.department) {
            console.log('Found handoff department:', handoffNode.data.department);
            return handoffNode.data.department;
        }

        return null;
    }
}

// Initialize chatbot manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('chatbot-management-section')) {
        // Full dashboard functionality
        window.chatbotManager = new ChatbotManager();
    } else {
        // Lightweight ChatbotManager for widget-only pages (no UI rendering)
        window.chatbotManager = new ChatbotManager();
        // Skip UI rendering since we're not on dashboard
        window.chatbotManager.skipUIRendering = true;
    }
});