/**
 * Chatbot Widget - Complete Implementation
 * Handles chatbot UI, conversations, and AI integration
 */
class ChatbotWidget {
    constructor() {
        this.isOpen = false;
        this.currentConversation = null;
        this.conversations = [];
        this.departments = [];
        this.nodeFlow = null;
        this.scenarioActive = false;
        this.currentNode = null;
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createWidget();
        this.loadDepartments();
        this.loadConversations();
        this.setupEventListeners();
        this.initializeNodeFlow();
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'chatbot-widget';
        widget.className = 'chatbot-widget';
        widget.innerHTML = `
            <div class="chatbot-toggle" id="chatbot-toggle">
                <div class="chatbot-avatar">
                    <img src="${this.settings.avatar || '/images/avatars/default.jpg'}" alt="Chat">
                </div>
                <div class="notification-badge" id="notification-badge" style="display: none;">
                    <span id="notification-count">0</span>
                </div>
            </div>
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <div class="header-info">
                        <img src="${this.settings.avatar || '/images/avatars/default.jpg'}" alt="Avatar" class="header-avatar">
                        <div class="header-text">
                            <h3>${this.settings.name || 'Support Chat'}</h3>
                            <span class="status">Online</span>
                        </div>
                    </div>
                    <button class="close-btn" id="chatbot-close">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="welcome-message">
                        <div class="message bot-message">
                            <div class="message-content">
                                ${this.settings.welcomeMessage || 'Hello! How can I help you today?'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="department-selector" id="department-selector">
                    <div class="department-title">Choose a department:</div>
                    <div class="department-buttons" id="department-buttons"></div>
                </div>
                <div class="chatbot-input-area" id="chatbot-input-area">
                    <div class="input-container">
                        <input type="text" id="chatbot-input" placeholder="Type your message..." autocomplete="off">
                        <button id="chatbot-send">Send</button>
                    </div>
                </div>
                <div class="typing-indicator" id="typing-indicator" style="display: none;">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <span class="typing-text">Agent is typing...</span>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('chatbot-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'chatbot-styles';
        styles.textContent = `
            .chatbot-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .chatbot-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
                position: relative;
            }

            .chatbot-toggle:hover {
                transform: scale(1.05);
            }

            .chatbot-avatar img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }

            .chatbot-window {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .chatbot-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .header-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .header-avatar {
                width: 35px;
                height: 35px;
                border-radius: 50%;
                object-fit: cover;
            }

            .header-text h3 {
                margin: 0;
                font-size: 16px;
            }

            .status {
                font-size: 12px;
                opacity: 0.9;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
            }

            .chatbot-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .message {
                max-width: 80%;
                margin-bottom: 10px;
            }

            .bot-message {
                align-self: flex-start;
            }

            .user-message {
                align-self: flex-end;
            }

            .message-content {
                padding: 10px 15px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.4;
            }

            .bot-message .message-content {
                background: #f1f3f5;
                color: #333;
            }

            .user-message .message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .department-selector {
                padding: 15px;
                border-top: 1px solid #eee;
                display: none;
            }

            .department-title {
                font-size: 14px;
                margin-bottom: 10px;
                color: #666;
            }

            .department-buttons {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .department-btn {
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .department-btn:hover {
                background: #f8f9fa;
                border-color: #667eea;
            }

            .chatbot-input-area {
                padding: 15px;
                border-top: 1px solid #eee;
            }

            .input-container {
                display: flex;
                gap: 10px;
            }

            #chatbot-input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
            }

            #chatbot-input:focus {
                border-color: #667eea;
            }

            #chatbot-send {
                padding: 10px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
            }

            .typing-indicator {
                padding: 10px 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #666;
                font-size: 12px;
            }

            .typing-dots {
                display: flex;
                gap: 3px;
            }

            .typing-dots span {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #ccc;
                animation: typing 1.4s infinite ease-in-out;
            }

            .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
            .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;

        document.head.appendChild(styles);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');

        toggle.addEventListener('click', () => this.toggleWidget());
        close.addEventListener('click', () => this.closeWidget());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        send.addEventListener('click', () => this.sendMessage());
    }

    toggleWidget() {
        const window = document.getElementById('chatbot-window');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            window.style.display = 'flex';
            this.clearNotifications();
        } else {
            window.style.display = 'none';
        }
    }

    closeWidget() {
        const window = document.getElementById('chatbot-window');
        window.style.display = 'none';
        this.isOpen = false;
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('chatbot-settings');
            return stored ? JSON.parse(stored) : {
                name: 'Fooodis Support',
                avatar: '/images/avatars/default.jpg',
                welcomeMessage: 'Hello! Welcome to Fooodis. How can I help you today?'
            };
        } catch (error) {
            console.error('Error loading chatbot settings:', error);
            return {
                name: 'Fooodis Support',
                avatar: '/images/avatars/default.jpg',
                welcomeMessage: 'Hello! How can I help you today?'
            };
        }
    }

    loadDepartments() {
        try {
            const stored = localStorage.getItem('chatbot-departments');
            this.departments = stored ? JSON.parse(stored) : [
                { id: 'general', name: 'General Inquiries', color: '#667eea' },
                { id: 'support', name: 'Technical Support', color: '#e74c3c' },
                { id: 'sales', name: 'Sales', color: '#27ae60' },
                { id: 'billing', name: 'Billing', color: '#f39c12' }
            ];
            this.renderDepartments();
        } catch (error) {
            console.error('Error loading departments:', error);
            this.departments = [];
        }
    }

    renderDepartments() {
        const container = document.getElementById('department-buttons');
        if (!container) return;

        container.innerHTML = '';

        this.departments.forEach(dept => {
            const btn = document.createElement('button');
            btn.className = 'department-btn';
            btn.textContent = dept.name;
            btn.style.borderColor = dept.color;
            btn.addEventListener('click', () => this.selectDepartment(dept));
            container.appendChild(btn);
        });
    }

    selectDepartment(department) {
        const selector = document.getElementById('department-selector');
        const inputArea = document.getElementById('chatbot-input-area');

        selector.style.display = 'none';
        inputArea.style.display = 'block';

        this.addMessage('bot', `Great! You've been connected to our ${department.name} team. How can we help you?`);
        this.currentDepartment = department;
    }

    loadConversations() {
        try {
            const stored = localStorage.getItem('chatbot-conversations');
            this.conversations = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.conversations = [];
        }
    }

    saveConversations() {
        try {
            localStorage.setItem('chatbot-conversations', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('Error saving conversations:', error);
        }
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Process message
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(message);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chatbot-messages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to current conversation
        if (!this.currentConversation) {
            this.currentConversation = {
                id: Date.now(),
                department: this.currentDepartment?.id || 'general',
                messages: [],
                created: new Date().toISOString()
            };
            this.conversations.push(this.currentConversation);
        }

        this.currentConversation.messages.push({
            sender,
            content,
            timestamp: new Date().toISOString()
        });

        this.saveConversations();
    }

    processMessage(message) {
        // Check if we're in a node flow scenario
        if (this.scenarioActive && this.currentNode) {
            return this.processNodeFlowMessage(message);
        }

        // Check for ready answers
        const readyAnswer = this.findReadyAnswer(message);
        if (readyAnswer) {
            return this.addMessage('bot', readyAnswer.answer);
        }

        // Default AI processing
        this.processWithAI(message);
    }

    findReadyAnswer(message) {
        try {
            const readyAnswers = JSON.parse(localStorage.getItem('chatbot-ready-answers') || '[]');
            const lowerMessage = message.toLowerCase();

            return readyAnswers.find(answer => 
                answer.keywords.some(keyword => 
                    lowerMessage.includes(keyword.toLowerCase())
                )
            );
        } catch (error) {
            console.error('Error finding ready answer:', error);
            return null;
        }
    }

    async processWithAI(message) {
        try {
            // Get AI configuration
            const aiConfig = this.getAIConfig();
            if (!aiConfig || !aiConfig.openaiApiKey) {
                return this.addMessage('bot', 'I apologize, but AI assistance is not currently configured. Please contact our support team for help.');
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiConfig.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful customer service assistant for Fooodis, a food blog platform. Be friendly, helpful, and concise.'
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 150
                })
            });

            if (response.ok) {
                const data = await response.json();
                const aiMessage = data.choices[0].message.content;
                this.addMessage('bot', aiMessage);
            } else {
                throw new Error('AI service unavailable');
            }
        } catch (error) {
            console.error('AI processing error:', error);
            this.addMessage('bot', 'I apologize, but I\'m having trouble processing your request. A human agent will assist you shortly.');
        }
    }

    getAIConfig() {
        try {
            // Check multiple storage locations for AI config
            const configs = [
                localStorage.getItem('aiConfig'),
                localStorage.getItem('fooodis-aiConfig'),
                localStorage.getItem('ai-config')
            ].filter(Boolean);

            for (let configStr of configs) {
                try {
                    const config = JSON.parse(configStr);
                    if (config.openaiApiKey) {
                        return config;
                    }
                } catch (e) {
                    continue;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting AI config:', error);
            return null;
        }
    }

    showTyping() {
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'flex';
    }

    hideTyping() {
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'none';
    }

    clearNotifications() {
        const badge = document.getElementById('notification-badge');
        badge.style.display = 'none';
        document.getElementById('notification-count').textContent = '0';
    }

    // Node Flow Integration
    initializeNodeFlow() {
        try {
            const flowData = localStorage.getItem('chatbot-node-flow');
            if (flowData) {
                this.nodeFlow = JSON.parse(flowData);
            }
        } catch (error) {
            console.error('Error loading node flow:', error);
        }
    }

    startScenario(scenarioId) {
        if (!this.nodeFlow) return false;

        const startNode = this.nodeFlow.nodes.find(node => 
            node.type === 'start' && node.scenario === scenarioId
        );

        if (startNode) {
            this.scenarioActive = true;
            this.currentNode = startNode;
            this.addMessage('bot', startNode.message || 'Starting scenario...');
            return true;
        }
        return false;
    }

    processNodeFlowMessage(userMessage) {
        if (!this.nodeFlow || !this.currentNode) return;

        const nextNode = this.moveToNextNode(this.currentNode.id, userMessage);
        if (nextNode) {
            this.currentNode = nextNode;

            if (nextNode.type === 'ai' && nextNode.assistantId) {
                this.processWithNodeAI(userMessage, nextNode.assistantId);
            } else {
                this.addMessage('bot', nextNode.message || 'Continuing...');
            }
        } else {
            // End of scenario
            this.scenarioActive = false;
            this.currentNode = null;
            this.addMessage('bot', 'Thank you! Is there anything else I can help you with?');
        }
    }

    moveToNextNode(currentNodeId, userMessage = '') {
        if (!this.nodeFlow || !this.nodeFlow.connections) return null;

        const outgoingConnections = this.nodeFlow.connections.filter(conn => conn.from === currentNodeId);

        if (outgoingConnections.length === 0) {
            this.scenarioActive = false;
            this.currentNode = null;
            return null;
        }

        const nextConnection = outgoingConnections[0];
        const nextNode = this.nodeFlow.nodes.find(node => node.id === nextConnection.to);

        return nextNode;
    }

    async processWithNodeAI(message, assistantId) {
        try {
            const aiConfig = this.getAIConfig();
            if (!aiConfig || !aiConfig.openaiApiKey) {
                return this.addMessage('bot', 'AI assistance is not available right now.');
            }

            // Get assistant configuration
            const assistants = JSON.parse(localStorage.getItem('ai-assistants') || '[]');
            const assistant = assistants.find(a => a.id === assistantId);

            const systemPrompt = assistant ? assistant.prompt : 
                'You are a helpful customer service assistant. Be friendly and helpful.';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiConfig.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 200
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.addMessage('bot', data.choices[0].message.content);
            } else {
                throw new Error('AI service error');
            }
        } catch (error) {
            console.error('Node AI processing error:', error);
            this.addMessage('bot', 'I apologize for the technical difficulty. Let me connect you with a human agent.');
        }
    }
}

// Initialize chatbot when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbotWidget = new ChatbotWidget();
    });
} else {
    window.chatbotWidget = new ChatbotWidget();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotWidget;
}