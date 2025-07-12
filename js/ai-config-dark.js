/**
 * AI Configuration Manager for Fooodis Blog System
 * Handles OpenAI API key and AI settings
 */

// Global AI configuration
window.aiConfig = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7
};

/**
 * Initialize AI Configuration
 */
function initializeAIConfig() {
    console.log('AI Config: Initializing...');

    // Load saved configuration
    loadSavedConfig();

    // Setup event listeners
    setupAIConfigEventListeners();

    console.log('AI Config: Initialized successfully');
}

/**
 * Load saved AI configuration
 */
function loadSavedConfig() {
    try {
        let config = null;

        // Try multiple storage locations
        const savedConfig = localStorage.getItem('aiConfig');
        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }

        // Try StorageManager if available
        if (!config && window.StorageManager) {
            config = StorageManager.get('ai-config');
        }

        // Try alternative key
        if (!config) {
            const altConfig = localStorage.getItem('fooodis-aiConfig');
            if (altConfig) {
                config = JSON.parse(altConfig);
            }
        }

        if (config) {
            window.aiConfig = { ...window.aiConfig, ...config };
            console.log('AI Config: Loaded saved configuration');

            // Update UI if elements exist
            updateConfigUI();

            // Save to all storage locations for consistency
            saveConfiguration();
        } else {
            console.log('AI Config: No saved configuration found');
        }

    } catch (error) {
        console.error('AI Config: Error loading saved configuration:', error);
    }
}

/**
 * Save AI configuration
 */
async function saveConfiguration() {
    const apiKey = document.getElementById('openai-api-key')?.value;

    if (!apiKey) {
        showConnectionStatus('error', 'Please enter an API key');
        return;
    }

    // Test connection first
    showConnectionStatus('testing', 'Testing connection before saving...');
    const connectionValid = await testConnection();

    if (!connectionValid) {
        showConnectionStatus('error', 'Cannot save invalid API key');
        return;
    }

    // Save to multiple storage locations for redundancy
    const config = {
        apiKey: apiKey,
        timestamp: Date.now(),
        validated: true
    };

    try {
        // Save to localStorage with multiple keys
        localStorage.setItem('aiConfig', JSON.stringify(config));
        localStorage.setItem('fooodis-aiConfig', JSON.stringify(config));
        localStorage.setItem('openai-api-key', apiKey);

        // Save via StorageManager if available
        if (typeof StorageManager !== 'undefined') {
            StorageManager.save('ai-config', config);
        }

        // Save to sessionStorage as backup
        sessionStorage.setItem('aiConfig-backup', JSON.stringify(config));

        showConnectionStatus('success', 'Configuration saved and validated successfully!');

        // Verify the save worked
        const verification = localStorage.getItem('aiConfig');
        if (!verification) {
            console.warn('Configuration save verification failed');
            showConnectionStatus('error', 'Save verification failed');
        } else {
            console.log('✅ AI Configuration saved successfully');
        }

    } catch (error) {
        console.error('Error saving configuration:', error);
        showConnectionStatus('error', 'Failed to save configuration: ' + error.message);
    }
}

/**
 * Setup event listeners for AI config
 */
function setupAIConfigEventListeners() {
    // API Key input
    const apiKeyInput = document.getElementById('openaiApiKey');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('change', (e) => {
            window.aiConfig.apiKey = e.target.value.trim();
            saveConfiguration();
        });

        apiKeyInput.addEventListener('blur', (e) => {
            window.aiConfig.apiKey = e.target.value.trim();
            saveConfiguration();
        });
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
        maxTokensInput.addEventListener('change', (e) => {
            window.aiConfig.maxTokens = parseInt(e.target.value) || 1000;
            saveConfiguration();
        });
    }

    // Temperature
    const temperatureInput = document.getElementById('temperature');
    if (temperatureInput) {
        temperatureInput.addEventListener('change', (e) => {
            window.aiConfig.temperature = parseFloat(e.target.value) || 0.7;
            saveConfiguration();
        });
    }

    // Save button
    const saveBtn = document.getElementById('saveAIConfig');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveConfiguration();
            showConfigSavedMessage();
        });
    }
}

/**
 * Update configuration UI
 */
function updateConfigUI() {
    const apiKeyInput = document.getElementById('openaiApiKey');
    if (apiKeyInput && window.aiConfig.apiKey) {
        apiKeyInput.value = window.aiConfig.apiKey;
    }

    const modelSelect = document.getElementById('aiModel');
    if (modelSelect && window.aiConfig.model) {
        modelSelect.value = window.aiConfig.model;
    }

    const maxTokensInput = document.getElementById('maxTokens');
    if (maxTokensInput && window.aiConfig.maxTokens) {
        maxTokensInput.value = window.aiConfig.maxTokens;
    }

    const temperatureInput = document.getElementById('temperature');
    if (temperatureInput && window.aiConfig.temperature) {
        temperatureInput.value = window.aiConfig.temperature;
    }
}

/**
 * Show configuration saved message
 */
function showConfigSavedMessage() {
    // Create or update save message
    let saveMessage = document.getElementById('configSaveMessage');
    if (!saveMessage) {
        saveMessage = document.createElement('div');
        saveMessage.id = 'configSaveMessage';
        saveMessage.className = 'alert alert-success';
        saveMessage.style.position = 'fixed';
        saveMessage.style.top = '20px';
        saveMessage.style.right = '20px';
        saveMessage.style.zIndex = '9999';
        document.body.appendChild(saveMessage);
    }

    saveMessage.textContent = 'AI Configuration saved successfully!';
    saveMessage.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        saveMessage.style.display = 'none';
    }, 3000);
}

/**
 * Validate API key
 */
function validateAPIKey(apiKey) {
    if (!apiKey || apiKey.length < 10) {
        return false;
    }

    // Basic OpenAI API key format validation
    return apiKey.startsWith('sk-') || apiKey.includes('openai');
}

/**
 * Get AI configuration
 */
function getAIConfig() {
    return window.aiConfig;
}

/**
 * Check if AI is configured
 */
function isAIConfigured() {
    return window.aiConfig.apiKey && window.aiConfig.apiKey.length > 0;
}

/**
 * Connection test
 */
async function testConnection() {
    const apiKey = document.getElementById('openai-api-key')?.value;

    if (!apiKey) {
        showConnectionStatus('error', 'Please enter an API key first');
        return;
    }

    showConnectionStatus('testing', 'Testing connection...');

    try {
        // Test with OpenAI API directly
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                showConnectionStatus('success', 'Connection successful! API key is valid.');
                return true;
            } else {
                showConnectionStatus('error', 'API key is invalid or has no access to models');
                return false;
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            showConnectionStatus('error', `Connection failed: ${errorData.error?.message || response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error('Error in testConnection:', error);
        showConnectionStatus('error', `Connection error: ${error.message}`);
        return false;
    }
}

/**
 * Connection status display
 */
function showConnectionStatus(type, message) {
    let statusElement = document.getElementById('connection-status');

    // Create status element if it doesn't exist
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'connection-status';
        statusElement.className = 'status';

        // Find a good place to insert it
        const configForm = document.querySelector('.ai-config-form');
        const testButton = document.getElementById('test-connection-btn');

        if (testButton && testButton.parentNode) {
            testButton.parentNode.insertBefore(statusElement, testButton.nextSibling);
        } else if (configForm) {
            configForm.appendChild(statusElement);
        } else {
            document.body.appendChild(statusElement);
        }
    }

    statusElement.className = `status ${type}`;
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    statusElement.style.padding = '10px';
    statusElement.style.margin = '10px 0';
    statusElement.style.borderRadius = '4px';
    statusElement.style.fontSize = '14px';

    // Style based on type
    switch(type) {
        case 'success':
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            statusElement.style.border = '1px solid #c3e6cb';
            break;
        case 'error':
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
            statusElement.style.border = '1px solid #f5c6cb';
            break;
        case 'testing':
            statusElement.style.backgroundColor = '#d1ecf1';
            statusElement.style.color = '#0c5460';
            statusElement.style.border = '1px solid #bee5eb';
            break;
        default:
            statusElement.style.backgroundColor = '#e2e3e5';
            statusElement.style.color = '#383d41';
            statusElement.style.border = '1px solid #d6d8db';
    }

    // Hide status after 5 seconds for success/error
    if (type !== 'testing') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAIConfig);

// Export functions for global access
window.initializeAIConfig = initializeAIConfig;
window.loadSavedConfig = loadSavedConfig;
window.saveConfiguration = saveConfiguration;
window.getAIConfig = getAIConfig;
window.isAIConfigured = isAIConfigured;
window.validateAPIKey = validateAPIKey;
window.testConnection = testConnection;
window.showConnectionStatus = showConnectionStatus;