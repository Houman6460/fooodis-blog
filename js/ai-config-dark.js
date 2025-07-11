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
    const apiKeyInput = document.getElementById('openai-api-key');
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
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            // Remove selected class from all options
            modelOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            
            window.aiConfig.model = option.dataset.model;
            saveConfiguration();
        });
    });

    // Assistant selection
    const assistantOptions = document.querySelectorAll('.assistant-option');
    assistantOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            // Remove selected class from all options
            assistantOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            
            window.aiConfig.assistant = option.dataset.assistant;
            
            // Show/hide custom assistant form
            const customForm = document.querySelector('.custom-assistant-form');
            if (customForm) {
                if (option.dataset.assistant === 'custom') {
                    customForm.style.display = 'block';
                } else {
                    customForm.style.display = 'none';
                }
            }
            
            saveConfiguration();
        });
    });

    // Test connection button
    const testBtn = document.getElementById('test-connection');
    if (testBtn) {
        testBtn.addEventListener('click', testConnection);
    }

    // Save button
    const saveBtn = document.getElementById('save-config');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveConfiguration();
            showConfigSavedMessage();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-config');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConfiguration);
    }

    // API key visibility toggle
    const toggleBtn = document.querySelector('.toggle-visibility');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = document.getElementById('openai-api-key');
            const icon = toggleBtn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
}

/**
 * Test OpenAI API connection
 */
async function testConnection() {
    const statusElement = document.getElementById('connection-status');
    const apiKeyInput = document.getElementById('openai-api-key');
    
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
        showConnectionStatus('error', 'API key is required');
        return;
    }

    const apiKey = apiKeyInput.value.trim();
    
    // Validate API key format
    if (!apiKey.startsWith('sk-') && !apiKey.includes('openai')) {
        showConnectionStatus('error', 'Invalid API key format');
        return;
    }

    showConnectionStatus('testing', 'Testing connection...');

    try {
        // Test the API connection
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showConnectionStatus('success', 'Connection successful!');
            
            // Save the working API key
            window.aiConfig.apiKey = apiKey;
            saveConfiguration();
        } else if (response.status === 401) {
            showConnectionStatus('error', 'Invalid API key');
        } else if (response.status === 429) {
            showConnectionStatus('error', 'Rate limit exceeded');
        } else {
            showConnectionStatus('error', `Connection failed (${response.status})`);
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        showConnectionStatus('error', 'Connection failed - check your internet connection');
    }
}

/**
 * Show connection status
 */
function showConnectionStatus(type, message) {
    let statusElement = document.getElementById('connection-status');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'connection-status';
        statusElement.className = 'status';
        
        // Insert after the actions
        const actions = document.querySelector('.ai-config-actions');
        if (actions) {
            actions.parentNode.insertBefore(statusElement, actions.nextSibling);
        }
    }

    statusElement.className = `status ${type}`;
    
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'testing':
            icon = '<i class="fas fa-spinner fa-spin"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }

    statusElement.innerHTML = `${icon} ${message}`;
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            if (statusElement.className.includes(type)) {
                statusElement.style.display = 'none';
            }
        }, 5000);
    }
}

/**
 * Reset configuration to defaults
 */
function resetConfiguration() {
    if (confirm('Are you sure you want to reset all AI configuration to defaults?')) {
        // Reset to defaults
        window.aiConfig = {
            apiKey: '',
            model: 'gpt-4',
            maxTokens: 1000,
            temperature: 0.7,
            assistant: 'default'
        };

        // Update UI
        updateConfigUI();
        
        // Clear storage
        localStorage.removeItem('aiConfig');
        localStorage.removeItem('fooodis-aiConfig');
        
        showConnectionStatus('success', 'Configuration reset to defaults');
    }
}

/**
 * Update configuration UI
 */
function updateConfigUI() {
    // Update API key input
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKeyInput && window.aiConfig.apiKey) {
        apiKeyInput.value = window.aiConfig.apiKey;
    }

    // Update model selection
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        if (option.dataset.model === window.aiConfig.model) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Update assistant selection
    const assistantOptions = document.querySelectorAll('.assistant-option');
    assistantOptions.forEach(option => {
        if (option.dataset.assistant === window.aiConfig.assistant) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Show/hide custom assistant form
    const customForm = document.querySelector('.custom-assistant-form');
    if (customForm) {
        if (window.aiConfig.assistant === 'custom') {
            customForm.style.display = 'block';
        } else {
            customForm.style.display = 'none';
        }
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