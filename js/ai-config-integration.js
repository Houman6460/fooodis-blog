/**
 * AI Configuration Integration
 * Integrates the AI Configuration section with the dashboard navigation
 */

// Ensure the document is fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Config Integration: DOM content loaded');
    // Initialize the AI Configuration integration with a slight delay to ensure all elements are ready
    setTimeout(function() {
        initAIConfigIntegration();
    }, 300);
});

/**
 * Initialize AI Configuration integration
 */
function initAIConfigIntegration() {
    console.log('AI Config Integration: Initializing');
    
    try {
        // Check if the AI config section exists
        const aiConfigSection = document.getElementById('ai-config-section');
        if (!aiConfigSection) {
            console.error('AI Config Integration: AI config section not found');
            return;
        }
        
        // Load saved configuration
        loadSavedConfig();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('AI Config Integration: Initialization complete');
    } catch (error) {
        console.error('AI Config Integration: Initialization error:', error);
    }
}

/**
 * Load saved configuration from backend API (with localStorage fallback)
 */
async function loadSavedConfig() {
    console.log('AI Config Integration: Loading config from API...');
    
    try {
        // First, try to load from backend API
        const response = await fetch('/api/automation/config');
        
        if (response.ok) {
            const configArray = await response.json();
            console.log('AI Config Integration: Loaded config from API:', configArray.length, 'settings');
            
            // Convert array format to object format for the form
            const config = {};
            configArray.forEach(item => {
                if (item.key === 'openai_api_key') config.apiKey = item.value;
                else if (item.key === 'model') config.model = item.value;
                else if (item.key === 'assistant_type') config.assistant = item.value;
                else if (item.key === 'custom_assistant') config.customAssistant = item.value;
            });
            
            // Also update localStorage for offline access
            localStorage.setItem('aiConfig', JSON.stringify(config));
            
            // Apply the configuration to the form
            setTimeout(() => {
                applyConfigToForm(config);
            }, 100);
            return;
        }
    } catch (error) {
        console.warn('AI Config Integration: API fetch failed, falling back to localStorage:', error);
    }
    
    // Fallback to localStorage
    const savedConfig = localStorage.getItem('aiConfig');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            setTimeout(() => {
                applyConfigToForm(config);
            }, 100);
        } catch (error) {
            console.error('Error loading saved AI configuration:', error);
        }
    }
}

/**
 * Apply the configuration to the form
 * @param {Object} config - The configuration object
 */
function applyConfigToForm(config) {
    // Set API key
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKeyInput && config.apiKey) {
        apiKeyInput.value = config.apiKey;
    }
    
    // Set model
    if (config.model) {
        const modelOptions = document.querySelectorAll('.model-option');
        modelOptions.forEach(option => {
            if (option.dataset.model === config.model) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // Set assistant
    if (config.assistant) {
        const assistantOptions = document.querySelectorAll('.assistant-option');
        assistantOptions.forEach(option => {
            if (option.dataset.assistant === config.assistant) {
                option.classList.add('selected');
                
                // Show custom assistant form if needed
                if (config.assistant === 'custom') {
                    const customAssistantForm = document.querySelector('.custom-assistant-form');
                    if (customAssistantForm) {
                        customAssistantForm.classList.add('visible');
                    }
                }
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    // Set custom assistant details
    if (config.customAssistant) {
        const assistantIdInput = document.getElementById('custom-assistant-id');
        if (assistantIdInput && config.customAssistant.id) {
            assistantIdInput.value = config.customAssistant.id;
        }
        
        const assistantNameInput = document.getElementById('custom-assistant-name');
        if (assistantNameInput && config.customAssistant.name) {
            assistantNameInput.value = config.customAssistant.name;
        }
        
        const assistantInstructionsInput = document.getElementById('custom-assistant-instructions');
        if (assistantInstructionsInput && config.customAssistant.instructions) {
            assistantInstructionsInput.value = config.customAssistant.instructions;
        }
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    console.log('AI Config Integration: Setting up event listeners');
    
    try {
        // Toggle API key visibility
        const toggleVisibilityBtn = document.querySelector('.toggle-visibility');
        if (toggleVisibilityBtn) {
            console.log('AI Config Integration: Found toggle visibility button');
            toggleVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
        } else {
            console.error('AI Config Integration: Toggle visibility button not found');
        }
        
        // Model selection
        const modelOptions = document.querySelectorAll('.model-option');
        if (modelOptions.length > 0) {
            console.log(`AI Config Integration: Found ${modelOptions.length} model options`);
            modelOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectModel(this);
                });
            });
        } else {
            console.error('AI Config Integration: No model options found');
        }
        
        // Assistant selection
        const assistantOptions = document.querySelectorAll('.assistant-option');
        if (assistantOptions.length > 0) {
            console.log(`AI Config Integration: Found ${assistantOptions.length} assistant options`);
            assistantOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectAssistant(this);
                });
            });
        } else {
            console.error('AI Config Integration: No assistant options found');
        }
        
        // Test connection
        const testBtn = document.getElementById('test-connection');
        if (testBtn) {
            console.log('AI Config Integration: Found test connection button');
            testBtn.addEventListener('click', testConnection);
        } else {
            console.error('AI Config Integration: Test connection button not found');
        }
        
        // Save configuration
        const saveBtn = document.getElementById('save-config');
        if (saveBtn) {
            console.log('AI Config Integration: Found save configuration button');
            saveBtn.addEventListener('click', saveConfiguration);
        } else {
            console.error('AI Config Integration: Save configuration button not found');
        }
        
        // Reset configuration
        const resetBtn = document.getElementById('reset-config');
        if (resetBtn) {
            console.log('AI Config Integration: Found reset configuration button');
            resetBtn.addEventListener('click', resetConfiguration);
        } else {
            console.error('AI Config Integration: Reset configuration button not found');
        }
        
        console.log('AI Config Integration: Event listeners setup complete');
    } catch (error) {
        console.error('AI Config Integration: Error setting up event listeners:', error);
    }
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('openai-api-key');
    const toggleButton = document.querySelector('.toggle-visibility i');
    
    if (apiKeyInput && toggleButton) {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleButton.className = 'fas fa-eye-slash';
        } else {
            apiKeyInput.type = 'password';
            toggleButton.className = 'fas fa-eye';
        }
    }
}

/**
 * Select a model
 * @param {HTMLElement} modelOption - The selected model option element
 */
function selectModel(modelOption) {
    // Remove selected class from all options
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to the clicked option
    modelOption.classList.add('selected');
}

/**
 * Select an assistant
 * @param {HTMLElement} assistantOption - The selected assistant option element
 */
function selectAssistant(assistantOption) {
    // Remove selected class from all options
    const assistantOptions = document.querySelectorAll('.assistant-option');
    assistantOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to the clicked option
    assistantOption.classList.add('selected');
    
    // Show/hide custom assistant form
    const customAssistantForm = document.querySelector('.custom-assistant-form');
    if (customAssistantForm) {
        if (assistantOption.dataset.assistant === 'custom') {
            customAssistantForm.classList.add('visible');
        } else {
            customAssistantForm.classList.remove('visible');
        }
    }
}

/**
 * Test the OpenAI API connection
 */
function testConnection() {
    // Get the API key
    const apiKey = document.getElementById('openai-api-key').value.trim();
    
    if (!apiKey) {
        showConnectionStatus('error', 'API key is required');
        return;
    }
    
    // Show loading status
    showConnectionStatus('warning', 'Testing connection...', true);
    
    // Make a test request to the OpenAI API
    fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Connection successful
        showConnectionStatus('success', 'Connection successful! API key is valid.');
    })
    .catch(error => {
        // Connection failed
        showConnectionStatus('error', `Connection failed: ${error.message}`);
    });
}

/**
 * Show connection status
 * @param {string} type - The status type (success, error, warning)
 * @param {string} message - The status message
 * @param {boolean} loading - Whether to show loading indicator
 */
function showConnectionStatus(type, message, loading = false) {
    const statusElement = document.getElementById('connection-status');
    
    if (statusElement) {
        // Set the class and content
        statusElement.className = `connection-status ${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = loading ? 
                    '<i class="fas fa-spinner fa-spin"></i>' : 
                    '<i class="fas fa-exclamation-triangle"></i>';
                break;
        }
        
        statusElement.innerHTML = `${icon} ${message}`;
    }
}

/**
 * Save the configuration to backend API and localStorage
 */
async function saveConfiguration() {
    // Get the configuration values
    const config = {
        apiKey: document.getElementById('openai-api-key').value.trim(),
        model: document.querySelector('.model-option.selected')?.dataset.model || 'gpt-4',
        assistant: document.querySelector('.assistant-option.selected')?.dataset.assistant || 'default',
        customAssistant: {
            id: document.getElementById('custom-assistant-id')?.value.trim() || '',
            name: document.getElementById('custom-assistant-name')?.value.trim() || '',
            instructions: document.getElementById('custom-assistant-instructions')?.value.trim() || ''
        }
    };
    
    // Validate the configuration
    if (!config.apiKey) {
        showConnectionStatus('error', 'API key is required');
        return;
    }
    
    if (config.assistant === 'custom' && !config.customAssistant.id) {
        showConnectionStatus('error', 'Assistant ID is required for custom assistant');
        return;
    }
    
    // Show saving status
    showConnectionStatus('warning', 'Saving configuration...', true);
    
    try {
        // Save to backend API (D1 + KV)
        const configData = {
            config: [
                { key: 'openai_api_key', value: config.apiKey, type: 'string', is_secret: true },
                { key: 'model', value: config.model, type: 'string', is_secret: false },
                { key: 'assistant_type', value: config.assistant, type: 'string', is_secret: false },
                { key: 'custom_assistant', value: config.customAssistant, type: 'json', is_secret: false }
            ]
        };
        
        const response = await fetch('/api/automation/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(configData)
        });
        
        if (response.ok) {
            console.log('AI Config Integration: Configuration saved to backend');
            
            // Also save to localStorage for offline access
            localStorage.setItem('aiConfig', JSON.stringify(config));
            
            // Also sync to KV for scheduled worker
            if (typeof window.syncAutomationToCloud === 'function') {
                window.syncAutomationToCloud().catch(e => console.warn('Cloud sync failed:', e));
            }
            
            showConnectionStatus('success', 'Configuration saved successfully to cloud!');
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to save to backend');
        }
    } catch (error) {
        console.error('AI Config Integration: Backend save failed:', error);
        
        // Fallback: save to localStorage only
        try {
            localStorage.setItem('aiConfig', JSON.stringify(config));
            showConnectionStatus('warning', 'Saved locally (backend unavailable)');
        } catch (localError) {
            showConnectionStatus('error', `Failed to save: ${error.message}`);
        }
    }
}

/**
 * Reset the configuration
 */
function resetConfiguration() {
    // Clear localStorage
    localStorage.removeItem('aiConfig');
    
    // Reset form to defaults
    const defaultConfig = {
        apiKey: '',
        model: 'gpt-4',
        assistant: 'default',
        customAssistant: {
            id: '',
            name: '',
            instructions: ''
        }
    };
    
    // Apply default configuration
    applyConfigToForm(defaultConfig);
    
    // Show status
    showConnectionStatus('warning', 'Configuration reset to defaults');
}

// Make functions available globally
window.aiConfigIntegration = {
    init: initAIConfigIntegration,
    loadSavedConfig,
    testConnection,
    saveConfiguration,
    resetConfiguration,
    toggleApiKeyVisibility,
    selectModel,
    selectAssistant
};

// Reinitialize when the page is fully loaded
window.addEventListener('load', function() {
    console.log('AI Config Integration: Window fully loaded, reinitializing');
    setTimeout(function() {
        initAIConfigIntegration();
    }, 500);
});
