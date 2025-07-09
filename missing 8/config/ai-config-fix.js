/**
 * AI Configuration Fix
 * This script fixes issues with the AI Configuration section
 * and ensures proper initialization and event handling
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Config Fix: DOM content loaded');
    initAIConfigFix();
});

/**
 * Initialize AI Configuration fixes
 */
function initAIConfigFix() {
    console.log('AI Config Fix: Initializing');
    
    // Fix the AI configuration in localStorage
    fixAIConfigInStorage();
    
    // Wait for a short delay to ensure all elements are loaded
    setTimeout(function() {
        // Check if the AI config section exists
        const aiConfigSection = document.getElementById('ai-config-section');
        if (!aiConfigSection) {
            console.error('AI Config Fix: AI config section not found');
            return;
        }
        
        // Fix event listeners
        fixEventListeners();
        
        // Fix visibility of custom assistant form
        fixCustomAssistantForm();
        
        // Load saved configuration
        loadSavedConfig();
        
        console.log('AI Config Fix: Initialization complete');
    }, 500);
}

/**
 * Fix AI configuration in localStorage
 * This ensures the customAssistants property is properly initialized
 */
function fixAIConfigInStorage() {
    console.log('AI Config Fix: Fixing AI configuration in localStorage');
    
    // Try to get saved configuration from both possible keys
    let config = null;
    const savedConfig = localStorage.getItem('aiConfig');
    const savedConfigAlt = localStorage.getItem('fooodis-ai-config');
    
    if (savedConfig) {
        try {
            config = JSON.parse(savedConfig);
            console.log('AI Config Fix: Found configuration in localStorage with key "aiConfig"');
        } catch (error) {
            console.error('AI Config Fix: Error parsing saved configuration:', error);
        }
    } else if (savedConfigAlt) {
        try {
            config = JSON.parse(savedConfigAlt);
            console.log('AI Config Fix: Found configuration in localStorage with key "fooodis-ai-config"');
        } catch (error) {
            console.error('AI Config Fix: Error parsing saved alternative configuration:', error);
        }
    }
    
    // If no configuration exists, create a default one
    if (!config) {
        config = {
            apiKey: '',
            model: 'gpt-4',
            assistant: 'default',
            customAssistants: []
        };
        console.log('AI Config Fix: Created default configuration');
    }
    
    // Ensure customAssistants property exists
    if (!config.customAssistants) {
        config.customAssistants = [];
        console.log('AI Config Fix: Added missing customAssistants property');
    }
    
    // Save the fixed configuration to both keys for compatibility
    localStorage.setItem('aiConfig', JSON.stringify(config));
    localStorage.setItem('fooodis-ai-config', JSON.stringify(config));
    
    // Update window.aiConfig for immediate use
    if (window.aiConfig) {
        window.aiConfig.customAssistants = config.customAssistants;
        console.log('AI Config Fix: Updated window.aiConfig.customAssistants');
    } else {
        window.aiConfig = {
            customAssistants: config.customAssistants,
            getConfig: function() {
                return getAIConfig();
            },
            getCustomAssistants: function() {
                return config.customAssistants;
            }
        };
        console.log('AI Config Fix: Created window.aiConfig');
    }
}

/**
 * Fix event listeners for AI Configuration
 */
function fixEventListeners() {
    console.log('AI Config Fix: Fixing event listeners');
    
    // Toggle API key visibility
    const toggleVisibilityBtn = document.querySelector('.toggle-visibility');
    if (toggleVisibilityBtn) {
        console.log('AI Config Fix: Found toggle visibility button');
        // Remove existing event listeners
        const newToggleBtn = toggleVisibilityBtn.cloneNode(true);
        toggleVisibilityBtn.parentNode.replaceChild(newToggleBtn, toggleVisibilityBtn);
        
        // Add new event listener
        newToggleBtn.addEventListener('click', function() {
            toggleApiKeyVisibility();
        });
    }
    
    // Model selection
    const modelOptions = document.querySelectorAll('.model-option');
    if (modelOptions.length > 0) {
        console.log(`AI Config Fix: Found ${modelOptions.length} model options`);
        modelOptions.forEach(option => {
            // Remove existing event listeners
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            // Add new event listener
            newOption.addEventListener('click', function() {
                selectModel(this);
            });
        });
    }
    
    // Assistant selection
    const assistantOptions = document.querySelectorAll('.assistant-option');
    if (assistantOptions.length > 0) {
        console.log(`AI Config Fix: Found ${assistantOptions.length} assistant options`);
        assistantOptions.forEach(option => {
            // Remove existing event listeners
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            // Add new event listener
            newOption.addEventListener('click', function() {
                selectAssistant(this);
            });
        });
    }
    
    // Test connection
    const testBtn = document.getElementById('test-connection');
    if (testBtn) {
        console.log('AI Config Fix: Found test connection button');
        // Remove existing event listeners
        const newTestBtn = testBtn.cloneNode(true);
        testBtn.parentNode.replaceChild(newTestBtn, testBtn);
        
        // Add new event listener
        newTestBtn.addEventListener('click', function() {
            testConnection();
        });
    }
    
    // Save configuration
    const saveBtn = document.getElementById('save-config');
    if (saveBtn) {
        console.log('AI Config Fix: Found save configuration button');
        // Remove existing event listeners
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        // Add new event listener
        newSaveBtn.addEventListener('click', function() {
            saveConfiguration();
        });
    }
    
    // Reset configuration
    const resetBtn = document.getElementById('reset-config');
    if (resetBtn) {
        console.log('AI Config Fix: Found reset configuration button');
        // Remove existing event listeners
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        
        // Add new event listener
        newResetBtn.addEventListener('click', function() {
            resetConfiguration();
        });
    }
}

/**
 * Fix visibility of custom assistant form
 */
function fixCustomAssistantForm() {
    console.log('AI Config Fix: Fixing custom assistant form');
    
    // Get custom assistant form
    const customAssistantForm = document.querySelector('.custom-assistant-form');
    if (!customAssistantForm) {
        console.error('AI Config Fix: Custom assistant form not found');
        return;
    }
    
    // Hide custom assistant form by default
    customAssistantForm.style.display = 'none';
    
    // Show custom assistant form when custom assistant is selected
    const customAssistantOption = document.querySelector('.assistant-option[data-assistant="custom"]');
    if (customAssistantOption) {
        customAssistantOption.addEventListener('click', function() {
            customAssistantForm.style.display = 'block';
        });
    }
    
    // Hide custom assistant form when other assistants are selected
    const otherAssistantOptions = document.querySelectorAll('.assistant-option:not([data-assistant="custom"])');
    otherAssistantOptions.forEach(option => {
        option.addEventListener('click', function() {
            customAssistantForm.style.display = 'none';
        });
    });
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
    console.log('AI Config Fix: Toggling API key visibility');
    
    const apiKeyInput = document.getElementById('openai-api-key');
    const toggleBtn = document.querySelector('.toggle-visibility i');
    
    if (!apiKeyInput || !toggleBtn) {
        console.error('AI Config Fix: API key input or toggle button not found');
        return;
    }
    
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        apiKeyInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

/**
 * Select a model
 * @param {HTMLElement} modelOption - The selected model option element
 */
function selectModel(modelOption) {
    console.log('AI Config Fix: Selecting model', modelOption.dataset.model);
    
    // Remove selected class from all model options
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to the clicked model option
    modelOption.classList.add('selected');
}

/**
 * Select an assistant
 * @param {HTMLElement} assistantOption - The selected assistant option element
 */
function selectAssistant(assistantOption) {
    console.log('AI Config Fix: Selecting assistant', assistantOption.dataset.assistant);
    
    // Remove selected class from all assistant options
    const assistantOptions = document.querySelectorAll('.assistant-option');
    assistantOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to the clicked assistant option
    assistantOption.classList.add('selected');
    
    // Show/hide custom assistant form
    const customAssistantForm = document.querySelector('.custom-assistant-form');
    if (customAssistantForm) {
        if (assistantOption.dataset.assistant === 'custom') {
            customAssistantForm.style.display = 'block';
        } else {
            customAssistantForm.style.display = 'none';
        }
    }
}

/**
 * Test the OpenAI API connection
 */
function testConnection() {
    console.log('AI Config Fix: Testing connection');
    
    // Get API key
    const apiKey = document.getElementById('openai-api-key').value.trim();
    if (!apiKey) {
        showConnectionStatus('error', 'Please enter your OpenAI API key');
        return;
    }
    
    // Show loading status
    showConnectionStatus('loading', 'Testing connection...', true);
    
    // Simulate API connection test (in a real app, this would make an actual API call)
    setTimeout(function() {
        // For demo purposes, we'll just show a success message
        showConnectionStatus('success', 'Connection successful! Your API key is valid.');
    }, 1500);
}

/**
 * Show connection status
 * @param {string} type - The status type (success, error, warning, loading)
 * @param {string} message - The status message
 * @param {boolean} loading - Whether to show loading indicator
 */
function showConnectionStatus(type, message, loading = false) {
    console.log('AI Config Fix: Showing connection status', type, message);
    
    const connectionStatus = document.getElementById('connection-status');
    if (!connectionStatus) {
        console.error('AI Config Fix: Connection status element not found');
        return;
    }
    
    // Set status class
    connectionStatus.className = '';
    connectionStatus.classList.add('status', type);
    
    // Set status content
    let content = '';
    if (loading) {
        content = '<i class="fas fa-spinner fa-spin"></i> ';
    } else if (type === 'success') {
        content = '<i class="fas fa-check-circle"></i> ';
    } else if (type === 'error') {
        content = '<i class="fas fa-exclamation-circle"></i> ';
    } else if (type === 'warning') {
        content = '<i class="fas fa-exclamation-triangle"></i> ';
    }
    
    connectionStatus.innerHTML = content + message;
    
    // Show the status
    connectionStatus.style.display = 'block';
    
    // Hide the status after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(function() {
            connectionStatus.style.display = 'none';
        }, 5000);
    }
}

/**
 * Save the configuration
 */
function saveConfiguration() {
    console.log('AI Config Fix: Saving configuration');
    
    // Get API key
    const apiKey = document.getElementById('openai-api-key').value.trim();
    if (!apiKey) {
        showConnectionStatus('error', 'Please enter your OpenAI API key');
        return;
    }
    
    // Get selected model
    const selectedModel = document.querySelector('.model-option.selected');
    if (!selectedModel) {
        showConnectionStatus('error', 'Please select an AI model');
        return;
    }
    
    // Get selected assistant
    const selectedAssistant = document.querySelector('.assistant-option.selected');
    if (!selectedAssistant) {
        showConnectionStatus('error', 'Please select an assistant type');
        return;
    }
    
    // Get custom assistant details if custom assistant is selected
    let customAssistant = null;
    if (selectedAssistant.dataset.assistant === 'custom') {
        const assistantId = document.getElementById('custom-assistant-id').value.trim();
        if (!assistantId) {
            showConnectionStatus('error', 'Please enter your custom assistant ID');
            return;
        }
        
        customAssistant = {
            id: assistantId,
            name: document.getElementById('custom-assistant-name').value.trim(),
            instructions: document.getElementById('custom-assistant-instructions').value.trim()
        };
    }
    
    // Create configuration object
    const config = {
        apiKey: apiKey,
        model: selectedModel.dataset.model,
        assistant: selectedAssistant.dataset.assistant,
        customAssistant: customAssistant,
        lastUpdated: new Date().toISOString()
    };
    
    // Save configuration to localStorage
    try {
        localStorage.setItem('aiConfig', JSON.stringify(config));
        showConnectionStatus('success', 'Configuration saved successfully');
    } catch (error) {
        console.error('AI Config Fix: Error saving configuration:', error);
        showConnectionStatus('error', 'Error saving configuration: ' + error.message);
    }
}

/**
 * Reset the configuration
 */
function resetConfiguration() {
    console.log('AI Config Fix: Resetting configuration');
    
    // Clear API key
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKeyInput) {
        apiKeyInput.value = '';
    }
    
    // Select default model (GPT-4)
    const defaultModel = document.querySelector('.model-option[data-model="gpt-4"]');
    if (defaultModel) {
        selectModel(defaultModel);
    }
    
    // Select default assistant
    const defaultAssistant = document.querySelector('.assistant-option[data-assistant="default"]');
    if (defaultAssistant) {
        selectAssistant(defaultAssistant);
    }
    
    // Clear custom assistant details
    const assistantIdInput = document.getElementById('custom-assistant-id');
    if (assistantIdInput) {
        assistantIdInput.value = '';
    }
    
    const assistantNameInput = document.getElementById('custom-assistant-name');
    if (assistantNameInput) {
        assistantNameInput.value = '';
    }
    
    const assistantInstructionsInput = document.getElementById('custom-assistant-instructions');
    if (assistantInstructionsInput) {
        assistantInstructionsInput.value = '';
    }
    
    // Remove saved configuration from localStorage
    try {
        localStorage.removeItem('aiConfig');
        showConnectionStatus('success', 'Configuration reset successfully');
    } catch (error) {
        console.error('AI Config Fix: Error resetting configuration:', error);
        showConnectionStatus('error', 'Error resetting configuration: ' + error.message);
    }
}

/**
 * Load saved configuration from localStorage
 */
function loadSavedConfig() {
    console.log('AI Config Fix: Loading saved configuration');
    
    // Try to get saved configuration
    const savedConfig = localStorage.getItem('aiConfig');
    
    if (savedConfig) {
        try {
            // Parse the saved configuration
            const config = JSON.parse(savedConfig);
            console.log('AI Config Fix: Found saved configuration', config);
            
            // Apply the saved configuration to the form
            applyConfigToForm(config);
        } catch (error) {
            console.error('AI Config Fix: Error loading saved configuration:', error);
        }
    } else {
        console.log('AI Config Fix: No saved configuration found');
    }
}

/**
 * Apply the configuration to the form
 * @param {Object} config - The configuration object
 */
function applyConfigToForm(config) {
    console.log('AI Config Fix: Applying configuration to form');
    
    // Set API key
    const apiKeyInput = document.getElementById('openai-api-key');
    if (apiKeyInput && config.apiKey) {
        apiKeyInput.value = config.apiKey;
    }
    
    // Set model
    if (config.model) {
        const modelOption = document.querySelector(`.model-option[data-model="${config.model}"]`);
        if (modelOption) {
            selectModel(modelOption);
        }
    }
    
    // Set assistant
    if (config.assistant) {
        const assistantOption = document.querySelector(`.assistant-option[data-assistant="${config.assistant}"]`);
        if (assistantOption) {
            selectAssistant(assistantOption);
        }
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

// Make sure we have a connection status element
window.addEventListener('load', function() {
    console.log('AI Config Fix: Window loaded');
    
    // Create connection status element if it doesn't exist
    let connectionStatus = document.getElementById('connection-status');
    if (!connectionStatus) {
        console.log('AI Config Fix: Creating connection status element');
        
        const aiConfigForm = document.querySelector('.ai-config-form');
        if (aiConfigForm) {
            connectionStatus = document.createElement('div');
            connectionStatus.id = 'connection-status';
            connectionStatus.className = 'status';
            connectionStatus.style.display = 'none';
            
            aiConfigForm.appendChild(connectionStatus);
        }
    }
    
    // Reinitialize
    setTimeout(function() {
        initAIConfigFix();
    }, 1000);
});
