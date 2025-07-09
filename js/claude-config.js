
/**
 * Claude Configuration Module
 * Handles Anthropic Claude API configuration and integration
 */

class ClaudeConfig {
    constructor() {
        this.apiKey = null;
        this.model = 'claude-3-opus-20240229';
        this.init();
    }

    init() {
        console.log('Claude Config: Initializing');
        this.loadSavedConfig();
        this.setupEventListeners();
    }

    loadSavedConfig() {
        // Try multiple storage locations for API key
        const sources = [
            () => localStorage.getItem('anthropic-api-key'),
            () => localStorage.getItem('ANTHROPIC_API_KEY'),
            () => this.getFromChatbotConfig()?.anthropicApiKey,
            () => sessionStorage.getItem('anthropic-api-key')
        ];

        for (const getKey of sources) {
            try {
                const key = getKey();
                if (key && key.startsWith('sk-ant-')) {
                    this.apiKey = key;
                    console.log('Claude Config: API key found');
                    break;
                }
            } catch (error) {
                console.log('Claude Config: Error checking source:', error.message);
            }
        }

        // Update UI if elements exist
        this.updateUI();
    }

    getFromChatbotConfig() {
        try {
            const configText = localStorage.getItem('chatbot-config');
            if (configText) {
                return JSON.parse(configText);
            }
        } catch (error) {
            console.log('Claude Config: Error parsing chatbot config');
        }
        return null;
    }

    updateUI() {
        // Update API key input if it exists
        const apiKeyInput = document.getElementById('anthropic-api-key');
        if (apiKeyInput && this.apiKey) {
            apiKeyInput.value = this.apiKey;
        }

        // Update provider selection
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            const claudeOption = providerSelect.querySelector('option[value="claude"]');
            if (claudeOption && this.apiKey) {
                providerSelect.value = 'claude';
            }
        }

        // Update model selection for Claude
        const modelSelect = document.getElementById('ai-model');
        if (modelSelect && this.apiKey) {
            // Add Claude models if not present
            this.addClaudeModels(modelSelect);
            modelSelect.value = this.model;
        }
    }

    addClaudeModels(selectElement) {
        const claudeModels = [
            { value: 'claude-3-opus-20240229', text: 'Claude 3 Opus (Most Capable)' },
            { value: 'claude-3-sonnet-20240229', text: 'Claude 3 Sonnet (Balanced)' },
            { value: 'claude-3-haiku-20240307', text: 'Claude 3 Haiku (Fast)' }
        ];

        // Remove existing Claude options
        const existingOptions = selectElement.querySelectorAll('option[value^="claude-"]');
        existingOptions.forEach(option => option.remove());

        // Add Claude models
        claudeModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            selectElement.appendChild(option);
        });
    }

    setupEventListeners() {
        // API key input handler
        const apiKeyInput = document.getElementById('anthropic-api-key');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value.trim();
                this.saveConfig();
            });
        }

        // Provider selection handler
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                if (e.target.value === 'claude') {
                    this.activateClaudeProvider();
                }
            });
        }

        // Test connection button
        const testButton = document.getElementById('test-claude-connection');
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.testConnection();
            });
        }
    }

    activateClaudeProvider() {
        console.log('Claude Config: Activating Claude provider');
        
        // Update chatbot configuration
        const chatbotConfig = this.getFromChatbotConfig() || {};
        chatbotConfig.aiProvider = 'claude';
        chatbotConfig.anthropicApiKey = this.apiKey;
        chatbotConfig.defaultModel = this.model;

        // Save updated config
        localStorage.setItem('chatbot-config', JSON.stringify(chatbotConfig));
        
        // Show Claude-specific UI elements
        this.showClaudeUI();
        
        console.log('Claude Config: Provider activated');
    }

    showClaudeUI() {
        // Show Claude configuration section
        const claudeSection = document.getElementById('claude-config-section');
        if (claudeSection) {
            claudeSection.style.display = 'block';
        }

        // Update model selector
        const modelSelect = document.getElementById('ai-model');
        if (modelSelect) {
            this.addClaudeModels(modelSelect);
        }
    }

    async testConnection() {
        if (!this.apiKey) {
            this.showStatus('error', 'Please enter your Anthropic API key first');
            return;
        }

        this.showStatus('loading', 'Testing Claude connection...');

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307', // Use fastest model for testing
                    max_tokens: 10,
                    messages: [{ role: 'user', content: 'Hi' }]
                })
            });

            if (response.ok) {
                this.showStatus('success', 'Claude API connection successful!');
                this.saveConfig();
            } else {
                const error = await response.text();
                this.showStatus('error', `Connection failed: ${response.status} - ${error}`);
            }
        } catch (error) {
            this.showStatus('error', `Connection failed: ${error.message}`);
        }
    }

    showStatus(type, message) {
        const statusElement = document.getElementById('claude-connection-status');
        if (statusElement) {
            statusElement.className = `status ${type}`;
            
            let icon = '';
            switch (type) {
                case 'success':
                    icon = '✅';
                    break;
                case 'error':
                    icon = '❌';
                    break;
                case 'loading':
                    icon = '⏳';
                    break;
            }
            
            statusElement.textContent = `${icon} ${message}`;
        }
    }

    saveConfig() {
        if (this.apiKey) {
            // Save to multiple locations for redundancy
            localStorage.setItem('anthropic-api-key', this.apiKey);
            sessionStorage.setItem('anthropic-api-key', this.apiKey);

            // Update chatbot config
            const chatbotConfig = this.getFromChatbotConfig() || {};
            chatbotConfig.anthropicApiKey = this.apiKey;
            chatbotConfig.aiProvider = 'claude';
            localStorage.setItem('chatbot-config', JSON.stringify(chatbotConfig));

            console.log('Claude Config: Configuration saved');
        }
    }

    getApiKey() {
        return this.apiKey;
    }

    isConfigured() {
        return !!(this.apiKey && this.apiKey.startsWith('sk-ant-'));
    }
}

// Initialize Claude configuration
const claudeConfig = new ClaudeConfig();

// Make available globally
window.ClaudeConfig = ClaudeConfig;
window.claudeConfig = claudeConfig;
