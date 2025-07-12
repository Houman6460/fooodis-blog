
/**
 * AI Configuration Complete Fix
 * Handles OpenAI API configuration, testing, and integration
 */

(function() {
    console.log('AI Config Fix: Initializing complete fix...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIConfigComplete);
    } else {
        initAIConfigComplete();
    }
    
    function initAIConfigComplete() {
        console.log('AI Config Fix: DOM ready, initializing...');
        
        // Initialize AI Config object
        initializeAIConfigObject();
        
        // Setup event listeners
        setupAIConfigEventListeners();
        
        // Load saved configuration
        loadSavedConfiguration();
        
        // Setup test connection functionality
        setupTestConnection();
        
        console.log('AI Config Fix: Complete initialization finished');
    }
    
    /**
     * Initialize AI Config object with all required methods
     */
    function initializeAIConfigObject() {
        if (!window.aiConfig) {
            window.aiConfig = {};
        }
        
        // Ensure all required properties exist
        window.aiConfig = {
            ...window.aiConfig,
            apiKey: window.aiConfig.apiKey || '',
            model: window.aiConfig.model || 'gpt-3.5-turbo',
            maxTokens: window.aiConfig.maxTokens || 1000,
            temperature: window.aiConfig.temperature || 0.7,
            customAssistants: window.aiConfig.customAssistants || []
        };
        
        // Add required methods
        window.aiConfig.getConfig = function() {
            return {
                apiKey: this.apiKey,
                model: this.model,
                maxTokens: this.maxTokens,
                temperature: this.temperature,
                customAssistants: this.customAssistants
            };
        };
        
        window.aiConfig.setConfig = function(config) {
            if (config.apiKey !== undefined) this.apiKey = config.apiKey;
            if (config.model !== undefined) this.model = config.model;
            if (config.maxTokens !== undefined) this.maxTokens = config.maxTokens;
            if (config.temperature !== undefined) this.temperature = config.temperature;
            if (config.customAssistants !== undefined) this.customAssistants = config.customAssistants;
        };
        
        window.aiConfig.isConfigured = function() {
            return this.apiKey && this.apiKey.length > 0;
        };
        
        window.aiConfig.testConnection = async function() {
            if (!this.apiKey) {
                throw new Error('API key is required');
            }
            
            try {
                const response = await fetch('https://api.openai.com/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`API test failed: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                return {
                    success: true,
                    message: 'Connection successful',
                    models: data.data || []
                };
            } catch (error) {
                throw new Error(`Connection test failed: ${error.message}`);
            }
        };
        
        // Make functions available globally
        window.getAIConfig = () => window.aiConfig.getConfig();
        window.isAIConfigured = () => window.aiConfig.isConfigured();
    }
    
    /**
     * Setup event listeners for AI config form
     */
    function setupAIConfigEventListeners() {
        // API Key input
        const apiKeyInput = document.getElementById('openaiApiKey');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                window.aiConfig.apiKey = e.target.value.trim();
                updateConnectionStatus('', 'info');
            });
            
            apiKeyInput.addEventListener('blur', saveConfiguration);
        }
        
        // Model selection
        const modelSelect = document.getElementById('aiModel');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                window.aiConfig.model = e.target.value;
                saveConfiguration();
            });
        }
        
        // Max tokens
        const maxTokensInput = document.getElementById('maxTokens');
        if (maxTokensInput) {
            maxTokensInput.addEventListener('input', (e) => {
                window.aiConfig.maxTokens = parseInt(e.target.value) || 1000;
                saveConfiguration();
            });
        }
        
        // Temperature
        const temperatureInput = document.getElementById('temperature');
        if (temperatureInput) {
            temperatureInput.addEventListener('input', (e) => {
                window.aiConfig.temperature = parseFloat(e.target.value) || 0.7;
                saveConfiguration();
            });
        }
        
        // Save button
        const saveBtn = document.getElementById('saveAIConfig');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                saveConfiguration();
                showSaveMessage('Configuration saved successfully!', 'success');
            });
        }
        
        // Test connection button
        const testBtn = document.getElementById('testAIConnection');
        if (testBtn) {
            testBtn.addEventListener('click', handleTestConnection);
        }
    }
    
    /**
     * Load saved configuration from storage
     */
    function loadSavedConfiguration() {
        try {
            // Try multiple storage locations
            let config = null;
            
            // Primary storage
            const savedConfig = localStorage.getItem('aiConfig');
            if (savedConfig) {
                config = JSON.parse(savedConfig);
            }
            
            // Fallback storage
            if (!config) {
                const altConfig = localStorage.getItem('fooodis-aiConfig');
                if (altConfig) {
                    config = JSON.parse(altConfig);
                }
            }
            
            // StorageManager if available
            if (!config && window.StorageManager) {
                config = StorageManager.get('ai-config');
            }
            
            if (config) {
                window.aiConfig.setConfig(config);
                updateUIFromConfig();
                console.log('AI Config: Loaded saved configuration');
            }
        } catch (error) {
            console.error('AI Config: Error loading configuration:', error);
        }
    }
    
    /**
     * Save configuration to storage
     */
    function saveConfiguration() {
        try {
            const config = window.aiConfig.getConfig();
            const configString = JSON.stringify(config);
            
            // Save to multiple locations for redundancy
            localStorage.setItem('aiConfig', configString);
            localStorage.setItem('fooodis-aiConfig', configString);
            
            // Save to StorageManager if available
            if (window.StorageManager) {
                StorageManager.set('ai-config', config);
            }
            
            console.log('AI Config: Configuration saved');
        } catch (error) {
            console.error('AI Config: Error saving configuration:', error);
        }
    }
    
    /**
     * Update UI from current configuration
     */
    function updateUIFromConfig() {
        const config = window.aiConfig.getConfig();
        
        const apiKeyInput = document.getElementById('openaiApiKey');
        if (apiKeyInput && config.apiKey) {
            apiKeyInput.value = config.apiKey;
        }
        
        const modelSelect = document.getElementById('aiModel');
        if (modelSelect && config.model) {
            modelSelect.value = config.model;
        }
        
        const maxTokensInput = document.getElementById('maxTokens');
        if (maxTokensInput && config.maxTokens) {
            maxTokensInput.value = config.maxTokens;
        }
        
        const temperatureInput = document.getElementById('temperature');
        if (temperatureInput && config.temperature) {
            temperatureInput.value = config.temperature;
        }
    }
    
    /**
     * Setup test connection functionality
     */
    function setupTestConnection() {
        // Create test button if it doesn't exist
        const testBtn = document.getElementById('testAIConnection');
        if (!testBtn) {
            createTestConnectionButton();
        }
    }
    
    /**
     * Create test connection button
     */
    function createTestConnectionButton() {
        const aiConfigSection = document.getElementById('ai-config-section');
        if (!aiConfigSection) return;
        
        const actionsDiv = aiConfigSection.querySelector('.ai-config-actions') || createActionsDiv();
        
        const testBtn = document.createElement('button');
        testBtn.id = 'testAIConnection';
        testBtn.type = 'button';
        testBtn.className = 'test-btn';
        testBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        testBtn.addEventListener('click', handleTestConnection);
        
        actionsDiv.appendChild(testBtn);
    }
    
    /**
     * Create actions div if it doesn't exist
     */
    function createActionsDiv() {
        const aiConfigSection = document.getElementById('ai-config-section');
        if (!aiConfigSection) return null;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ai-config-actions';
        aiConfigSection.appendChild(actionsDiv);
        
        return actionsDiv;
    }
    
    /**
     * Handle test connection button click
     */
    async function handleTestConnection(e) {
        e.preventDefault();
        
        const testBtn = e.target;
        const originalText = testBtn.innerHTML;
        
        // Update button state
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        
        updateConnectionStatus('Testing connection...', 'info');
        
        try {
            const result = await window.aiConfig.testConnection();
            updateConnectionStatus('✅ Connection successful! API key is valid.', 'success');
            showSaveMessage('Connection test passed!', 'success');
        } catch (error) {
            updateConnectionStatus(`❌ ${error.message}`, 'error');
            showSaveMessage(`Connection failed: ${error.message}`, 'error');
        } finally {
            // Restore button state
            testBtn.disabled = false;
            testBtn.innerHTML = originalText;
        }
    }
    
    /**
     * Update connection status display
     */
    function updateConnectionStatus(message, type) {
        let statusDiv = document.getElementById('ai-connection-status');
        
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'ai-connection-status';
            statusDiv.className = 'connection-status';
            
            const aiConfigSection = document.getElementById('ai-config-section');
            if (aiConfigSection) {
                aiConfigSection.appendChild(statusDiv);
            }
        }
        
        statusDiv.textContent = message;
        statusDiv.className = `connection-status ${type}`;
        
        if (message) {
            statusDiv.style.display = 'block';
        } else {
            statusDiv.style.display = 'none';
        }
    }
    
    /**
     * Show save message
     */
    function showSaveMessage(message, type = 'success') {
        let messageDiv = document.getElementById('ai-config-save-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'ai-config-save-message';
            messageDiv.className = 'alert';
            messageDiv.style.position = 'fixed';
            messageDiv.style.top = '20px';
            messageDiv.style.right = '20px';
            messageDiv.style.zIndex = '9999';
            messageDiv.style.padding = '10px 15px';
            messageDiv.style.borderRadius = '4px';
            messageDiv.style.fontWeight = '500';
            document.body.appendChild(messageDiv);
        }
        
        messageDiv.textContent = message;
        messageDiv.className = `alert alert-${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
    
})();
