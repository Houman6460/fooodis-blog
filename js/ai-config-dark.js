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
function saveConfiguration() {
    try {
        // Add timestamp for verification
        const configWithTimestamp = {
            ...window.aiConfig,
            lastSaved: new Date().toISOString()
        };

        const configString = JSON.stringify(configWithTimestamp);

        // Save to multiple storage locations for redundancy
        localStorage.setItem('aiConfig', configString);
        localStorage.setItem('fooodis-aiConfig', configString);

        // Save to StorageManager if available
        if (window.StorageManager) {
            StorageManager.set('ai-config', configWithTimestamp);
        }

        // Save to sessionStorage as backup
        sessionStorage.setItem('aiConfig', configString);

        console.log('AI Config: Configuration saved successfully');

        // Verify save was successful
        const verification = localStorage.getItem('aiConfig');
        if (verification) {
            const verifiedConfig = JSON.parse(verification);
            if (verifiedConfig.apiKey === window.aiConfig.apiKey) {
                console.log('AI Config: Save verified successfully');
            } else {
                console.warn('AI Config: Save verification failed - API key mismatch');
            }
        } else {
            console.warn('AI Config: Save verification failed - no data found');
        }

    } catch (error) {
        console.error('AI Config: Error saving configuration:', error);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAIConfig);

// Export functions for global access
window.initializeAIConfig = initializeAIConfig;
window.loadSavedConfig = loadSavedConfig;
window.saveConfiguration = saveConfiguration;
window.getAIConfig = getAIConfig;
window.isAIConfigured = isAIConfigured;
window.validateAPIKey = validateAPIKey;