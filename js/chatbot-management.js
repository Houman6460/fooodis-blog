/**
 * Fooodis Chatbot Management System
 * Enhanced with full API integration and proper error handling
 */

(function() {
    'use strict';

    // Chatbot Manager
    window.chatbotManager = {
        isInitialized: false,
        settings: {
            enabled: true,
            widgetColor: '#e8f24c',
            allowFileUpload: true,
            avatar: '',
            welcomeMessage: '',
            enableMultipleAgents: true,
            agents: []
        },
        conversations: [],
        ratings: [],
        activeAgent: null,

        init: function() {
            console.log('🤖 Initializing Chatbot Management System...');

            this.loadSettings();
            this.loadConversations();
            this.loadRatings();
            this.loadAgents();
            this.setupEventListeners();
            this.renderDashboard();

            this.isInitialized = true;

            // Notify widget
            window.dispatchEvent(new CustomEvent('chatbotManagerReady'));
            console.log('✅ Chatbot Management System initialized');
        },

        loadSettings: function() {
            try {
                const saved = localStorage.getItem('fooodis-chatbot-settings');
                if (saved) {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                }
            } catch (error) {
                console.error('Error loading chatbot settings:', error);
            }
        },

        saveSettings: function() {
            try {
                localStorage.setItem('fooodis-chatbot-settings', JSON.stringify(this.settings));
                this.notifyWidget('settingsChanged', { settings: this.settings });
            } catch (error) {
                console.error('Error saving chatbot settings:', error);
            }
        },

        async loadConversations() {
            try {
                const response = await fetch('/api/chatbot/conversations');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.conversations = data.conversations;
                        this.renderConversations();
                    }
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
            }
        },

        async loadAgents() {
            try {
                const response = await fetch('/api/chatbot/agents');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        this.settings.agents = data.agents;
                        this.renderAgents();
                    }
                }
            } catch (error) {
                console.error('Error loading agents:', error);
            }
        },

        loadRatings: function() {
            // Load ratings from localStorage for now
            try {
                const saved = localStorage.getItem('fooodis-chatbot-ratings');
                if (saved) {
                    this.ratings = JSON.parse(saved);
                }
            } catch (error) {
                console.error('Error loading ratings:', error);
            }
        },

        setupEventListeners: function() {
            // Settings form
            const settingsForm = document.getElementById('chatbot-settings-form');
            if (settingsForm) {
                settingsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.updateSettings(new FormData(settingsForm));
                });
            }

            // Enable/disable toggle
            const enableToggle = document.getElementById('chatbot-enabled');
            if (enableToggle) {
                enableToggle.addEventListener('change', (e) => {
                    this.settings.enabled = e.target.checked;
                    this.saveSettings();
                    this.updateStatus();
                });
            }

            // File upload toggle
            const fileUploadToggle = document.getElementById('allow-file-upload');
            if (fileUploadToggle) {
                fileUploadToggle.addEventListener('change', (e) => {
                    this.settings.allowFileUpload = e.target.checked;
                    this.saveSettings();
                });
            }

            // Avatar upload
            const avatarInput = document.getElementById('chatbot-avatar-input');
            if (avatarInput) {
                avatarInput.addEventListener('change', (e) => {
                    this.handleAvatarUpload(e.target.files[0]);
                });
            }

            // Test chatbot button
            const testButton = document.getElementById('test-chatbot');
            if (testButton) {
                testButton.addEventListener('click', () => {
                    this.testChatbot();
                });
            }
        },

        updateSettings: function(formData) {
            this.settings.welcomeMessage = formData.get('welcome-message') || '';
            this.settings.widgetColor = formData.get('widget-color') || '#e8f24c';
            this.settings.enableMultipleAgents = formData.get('enable-multiple-agents') === 'on';

            this.saveSettings();
            this.showNotification('Settings updated successfully!', 'success');
        },

        handleAvatarUpload: function(file) {
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.settings.avatar = e.target.result;
                this.saveSettings();
                this.updateAvatarPreview(e.target.result);
                this.showNotification('Avatar updated!', 'success');
            };
            reader.readAsDataURL(file);
        },

        updateAvatarPreview: function(avatarUrl) {
            const preview = document.getElementById('avatar-preview');
            if (preview) {
                preview.src = avatarUrl;
            }
        },

        renderDashboard: function() {
            this.renderStats();
            this.renderConversations();
            this.renderAgents();
            this.updateStatus();
            this.renderSettings();
        },

        renderStats: function() {
            const statsContainer = document.getElementById('chatbot-stats');
            if (!statsContainer) return;

            const totalConversations = this.conversations.length;
            const todayConversations = this.conversations.filter(conv => {
                const today = new Date().toDateString();
                const convDate = new Date(conv.lastActivity).toDateString();
                return today === convDate;
            }).length;

            const avgRating = this.ratings.length > 0 
                ? (this.ratings.reduce((sum, r) => sum + r.rating, 0) / this.ratings.length).toFixed(1)
                : 'N/A';

            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>Total Conversations</h3>
                    <div class="stat-number">${totalConversations}</div>
                </div>
                <div class="stat-card">
                    <h3>Today</h3>
                    <div class="stat-number">${todayConversations}</div>
                </div>
                <div class="stat-card">
                    <h3>Average Rating</h3>
                    <div class="stat-number">${avgRating}</div>
                </div>
                <div class="stat-card">
                    <h3>Status</h3>
                    <div class="stat-status ${this.settings.enabled ? 'online' : 'offline'}">
                        ${this.settings.enabled ? 'Online' : 'Offline'}
                    </div>
                </div>
            `;
        },

        renderConversations: function() {
            const container = document.getElementById('conversations-list');
            if (!container) return;

            if (this.conversations.length === 0) {
                container.innerHTML = '<p class="no-data">No conversations yet.</p>';
                return;
            }

            const conversationsHTML = this.conversations.map(conv => `
                <div class="conversation-item" onclick="chatbotManager.viewConversation('${conv.id}')">
                    <div class="conversation-info">
                        <strong>Conversation ${conv.id.slice(-8)}</strong>
                        <span class="conversation-meta">${conv.messageCount} messages • ${conv.agent}</span>
                        <p class="last-message">${conv.lastMessage.substring(0, 100)}...</p>
                    </div>
                    <div class="conversation-time">
                        ${new Date(conv.lastActivity).toLocaleDateString()}
                    </div>
                </div>
            `).join('');

            container.innerHTML = conversationsHTML;
        },

        renderAgents: function() {
            const container = document.getElementById('agents-list');
            if (!container) return;

            if (!this.settings.agents || this.settings.agents.length === 0) {
                container.innerHTML = '<p class="no-data">No agents configured.</p>';
                return;
            }

            const agentsHTML = this.settings.agents.map(agent => `
                <div class="agent-item">
                    <div class="agent-avatar">
                        <img src="${agent.avatar}" alt="${agent.name}" />
                    </div>
                    <div class="agent-info">
                        <strong>${agent.name}</strong>
                        <p>${agent.personality}</p>
                    </div>
                    <div class="agent-actions">
                        <button onclick="chatbotManager.setActiveAgent('${agent.name}')" 
                                class="btn btn-sm ${this.activeAgent?.name === agent.name ? 'btn-primary' : 'btn-outline'}">
                            ${this.activeAgent?.name === agent.name ? 'Active' : 'Activate'}
                        </button>
                    </div>
                </div>
            `).join('');

            container.innerHTML = agentsHTML;
        },

        renderSettings: function() {
            // Update form fields with current settings
            const enabledToggle = document.getElementById('chatbot-enabled');
            if (enabledToggle) {
                enabledToggle.checked = this.settings.enabled;
            }

            const fileUploadToggle = document.getElementById('allow-file-upload');
            if (fileUploadToggle) {
                fileUploadToggle.checked = this.settings.allowFileUpload;
            }

            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.value = this.settings.welcomeMessage || '';
            }

            const widgetColor = document.getElementById('widget-color');
            if (widgetColor) {
                widgetColor.value = this.settings.widgetColor || '#e8f24c';
            }

            const multipleAgentsToggle = document.getElementById('enable-multiple-agents');
            if (multipleAgentsToggle) {
                multipleAgentsToggle.checked = this.settings.enableMultipleAgents;
            }

            // Update avatar preview
            if (this.settings.avatar) {
                this.updateAvatarPreview(this.settings.avatar);
            }
        },

        updateStatus: function() {
            const statusElements = document.querySelectorAll('.chatbot-status');
            statusElements.forEach(element => {
                element.textContent = this.settings.enabled ? 'Online' : 'Offline';
                element.className = `chatbot-status ${this.settings.enabled ? 'status-online' : 'status-offline'}`;
            });
        },

        setActiveAgent: function(agentName) {
            const agent = this.settings.agents.find(a => a.name === agentName);
            if (agent) {
                this.activeAgent = agent;
                this.renderAgents();
                this.notifyWidget('assistantUpdate', { assistant: agent });
                this.showNotification(`${agent.name} is now the active agent`, 'success');
            }
        },

        getActiveAgent: function() {
            return this.activeAgent || (this.settings.agents && this.settings.agents[0]) || null;
        },

        async generateAgentResponse(context) {
            try {
                const response = await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(context)
                });

                if (response.ok) {
                    return await response.json();
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                console.error('Error generating agent response:', error);
                return {
                    success: false,
                    message: 'Sorry, I encountered an error. Please try again.'
                };
            }
        },

        viewConversation: function(conversationId) {
            // Implementation for viewing conversation details
            console.log('Viewing conversation:', conversationId);
            this.showNotification('Conversation viewer coming soon!', 'info');
        },

        testChatbot: function() {
            // Open widget for testing
            if (window.FoodisChatbot) {
                window.FoodisChatbot.toggleChat();
                this.showNotification('Chatbot widget opened for testing', 'success');
            } else {
                this.showNotification('Chatbot widget not found', 'error');
            }
        },

        notifyWidget: function(eventType, data) {
            if (window.chatbotEvents) {
                window.chatbotEvents.dispatchEvent(new CustomEvent(eventType, { detail: data }));
            }
        },

        showNotification: function(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;

            // Add to page
            document.body.appendChild(notification);

            // Auto remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        },

        exportData: function() {
            const data = {
                settings: this.settings,
                conversations: this.conversations,
                ratings: this.ratings,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `fooodis-chatbot-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();

            URL.revokeObjectURL(url);
            this.showNotification('Data exported successfully!', 'success');
        },

        resetChatbot: function() {
            if (confirm('Are you sure you want to reset all chatbot data? This action cannot be undone.')) {
                localStorage.removeItem('fooodis-chatbot-settings');
                localStorage.removeItem('fooodis-chatbot-conversations');
                localStorage.removeItem('fooodis-chatbot-ratings');

                // Reset to defaults
                this.settings = {
                    enabled: true,
                    widgetColor: '#e8f24c',
                    allowFileUpload: true,
                    avatar: '',
                    welcomeMessage: '',
                    enableMultipleAgents: true,
                    agents: []
                };

                this.conversations = [];
                this.ratings = [];
                this.activeAgent = null;

                this.renderDashboard();
                this.showNotification('Chatbot reset successfully!', 'success');
            }
        }
    };

    // Event dispatcher for communication
    window.chatbotEvents = new EventTarget();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chatbotManager.init();
        });
    } else {
        window.chatbotManager.init();
    }

})();