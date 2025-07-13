
/**
 * Force Conversation Refresh System
 * Ensures immediate UI updates after user registration
 */

(function() {
    'use strict';
    
    class ConversationRefreshManager {
        constructor() {
            this.init();
        }
        
        init() {
            console.log('🔄 Initializing Conversation Refresh Manager...');
            this.setupEventListeners();
            this.setupPeriodicRefresh();
        }
        
        setupEventListeners() {
            // Listen for registration completion
            window.addEventListener('userRegistered', (e) => {
                console.log('👤 User registered, forcing refresh...', e.detail);
                this.forceRefresh();
            });
            
            // Listen for conversation updates
            window.addEventListener('conversationsUpdated', (e) => {
                console.log('💬 Conversations updated, refreshing displays...', e.detail);
                this.refreshConversationDisplays();
            });
            
            // Listen for lead updates
            window.addEventListener('leadsUpdated', (e) => {
                console.log('📋 Leads updated, refreshing displays...', e.detail);
                this.refreshLeadDisplays();
            });
        }
        
        setupPeriodicRefresh() {
            // Refresh every 30 seconds to catch updates
            setInterval(() => {
                this.softRefresh();
            }, 30000);
        }
        
        forceRefresh() {
            console.log('🔄 FORCE REFRESH: Starting comprehensive refresh...');
            
            // Refresh conversations
            this.refreshConversationDisplays();
            
            // Refresh leads
            this.refreshLeadDisplays();
            
            // Refresh chatbot manager
            if (window.chatbotManager) {
                if (typeof window.chatbotManager.loadConversations === 'function') {
                    window.chatbotManager.loadConversations();
                }
            }
            
            // Refresh dashboard
            if (window.dashboardManager) {
                if (typeof window.dashboardManager.loadLeads === 'function') {
                    window.dashboardManager.loadLeads();
                }
            }
            
            console.log('✅ FORCE REFRESH: Completed');
        }
        
        softRefresh() {
            // Lighter refresh for periodic updates
            const conversationsList = document.getElementById('conversations-list');
            const leadsList = document.getElementById('leads-list');
            
            if (conversationsList) {
                this.refreshConversationDisplays();
            }
            
            if (leadsList) {
                this.refreshLeadDisplays();
            }
        }
        
        refreshConversationDisplays() {
            console.log('💬 Refreshing conversation displays...');
            
            const conversationsList = document.getElementById('conversations-list');
            if (!conversationsList) return;
            
            const conversations = JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]');
            
            // Sort by most recent first
            conversations.sort((a, b) => {
                const dateA = new Date(a.lastMessageAt || a.createdAt || 0);
                const dateB = new Date(b.lastMessageAt || b.createdAt || 0);
                return dateB - dateA;
            });
            
            // Clear and rebuild
            conversationsList.innerHTML = '';
            
            conversations.forEach(conversation => {
                const element = this.createConversationElement(conversation);
                conversationsList.appendChild(element);
            });
            
            console.log('✅ Refreshed', conversations.length, 'conversations');
        }
        
        refreshLeadDisplays() {
            console.log('📋 Refreshing lead displays...');
            
            const leadsList = document.getElementById('leads-list');
            if (!leadsList) return;
            
            const leads = JSON.parse(localStorage.getItem('user-leads') || '[]');
            
            // Sort by most recent first
            leads.sort((a, b) => {
                const dateA = new Date(a.registeredAt || a.timestamp || 0);
                const dateB = new Date(b.registeredAt || b.timestamp || 0);
                return dateB - dateA;
            });
            
            // Clear and rebuild
            leadsList.innerHTML = '';
            
            leads.forEach(lead => {
                const element = this.createLeadElement(lead);
                leadsList.appendChild(element);
            });
            
            console.log('✅ Refreshed', leads.length, 'leads');
        }
        
        createConversationElement(conversation) {
            const element = document.createElement('div');
            element.className = 'conversation-item';
            element.innerHTML = `
                <div class="conversation-header">
                    <div class="conversation-user">
                        <span class="user-name">${conversation.userName || 'Anonymous User'}</span>
                        <span class="language-flag">${conversation.languageFlag || '🌐'}</span>
                    </div>
                    <div class="conversation-time">
                        ${new Date(conversation.lastMessageAt || conversation.createdAt).toLocaleString()}
                    </div>
                </div>
                <div class="conversation-preview">
                    ${conversation.lastMessage || 'No messages yet'}
                </div>
                <div class="conversation-details">
                    <div class="conversation-email">${conversation.userEmail || 'No email'}</div>
                    <div class="conversation-restaurant">${conversation.restaurantName || 'No restaurant'}</div>
                </div>
            `;
            return element;
        }
        
        createLeadElement(lead) {
            const element = document.createElement('div');
            element.className = 'lead-item';
            element.innerHTML = `
                <div class="lead-header">
                    <div class="lead-name">
                        <span class="name">${lead.name || 'Unknown'}</span>
                        <span class="language-flag">${lead.languageFlag || '🌐'}</span>
                    </div>
                    <div class="lead-status ${lead.status || 'new'}">${lead.status || 'new'}</div>
                </div>
                <div class="lead-details">
                    <div class="lead-email">${lead.email || 'No email'}</div>
                    <div class="lead-restaurant">${lead.restaurantName || 'No restaurant'}</div>
                    <div class="lead-type">${lead.userType || 'Unknown type'}</div>
                </div>
                <div class="lead-time">
                    ${new Date(lead.registeredAt || lead.timestamp).toLocaleString()}
                </div>
            `;
            return element;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.conversationRefreshManager = new ConversationRefreshManager();
        });
    } else {
        window.conversationRefreshManager = new ConversationRefreshManager();
    }
    
})();

    // Force refresh conversations display
    window.forceRefreshConversations = function() {
        console.log('🔄 FORCE REFRESH: Starting conversation display refresh...');
        
        // Multiple refresh strategies
        const refreshMethods = [
            // Method 1: Direct chatbotManager refresh
            () => {
                if (window.chatbotManager && window.chatbotManager.renderConversations) {
                    window.chatbotManager.renderConversations();
                    console.log('✅ REFRESH: chatbotManager.renderConversations() called');
                }
            },
            
            // Method 2: Force reload conversations from localStorage
            () => {
                if (window.chatbotManager && window.chatbotManager.loadConversationsFromServer) {
                    window.chatbotManager.loadConversationsFromServer().then(() => {
                        window.chatbotManager.renderConversations();
                        console.log('✅ REFRESH: Conversations reloaded and rendered');
                    });
                }
            },
            
            // Method 3: DOM manipulation refresh
            () => {
                const conversationsList = document.getElementById('conversationsList');
                if (conversationsList) {
                    // Force re-render by triggering a data refresh
                    const event = new CustomEvent('conversationsRefresh', { 
                        detail: { force: true } 
                    });
                    document.dispatchEvent(event);
                    console.log('✅ REFRESH: DOM refresh event dispatched');
                }
            }
        ];
        
        // Execute all refresh methods with delays
        refreshMethods.forEach((method, index) => {
            setTimeout(() => {
                try {
                    method();
                } catch (error) {
                    console.warn(`⚠️ REFRESH: Method ${index + 1} failed:`, error);
                }
            }, index * 200);
        });
    };

    // Listen for user registration completion
    window.addEventListener('userIdentityUpdated', (event) => {
        console.log('🎯 FORCE REFRESH: User identity updated, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 500);
        setTimeout(window.forceRefreshConversations, 2000); // Second refresh after 2s
    });

    document.addEventListener('userRegistered', (event) => {
        console.log('🎯 FORCE REFRESH: User registered, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 500);
        setTimeout(window.forceRefreshConversations, 2000); // Second refresh after 2s
    });

    // Add to registration form completion
    window.addEventListener('registrationFormCompleted', (event) => {
        console.log('🎯 FORCE REFRESH: Registration form completed, forcing refresh...');
        setTimeout(window.forceRefreshConversations, 100);
        setTimeout(window.forceRefreshConversations, 1000);
        setTimeout(window.forceRefreshConversations, 3000);
    });

    console.log('🔄 Force conversation refresh system initialized');
})();
