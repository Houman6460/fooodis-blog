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
 * Load saved configuration from localStorage
 */
function loadSavedConfig() {
    // Try to get saved configuration
    const savedConfig = localStorage.getItem('aiConfig');
    
    if (savedConfig) {
        try {
            // Parse the saved configuration
            const config = JSON.parse(savedConfig);
            
            // Apply the saved configuration to the form
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
 * Save the configuration
 */
function saveConfiguration() {
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
    
    // Save the configuration to localStorage
    try {
        localStorage.setItem('aiConfig', JSON.stringify(config));
        showConnectionStatus('success', 'Configuration saved successfully');
    } catch (error) {
        showConnectionStatus('error', `Failed to save configuration: ${error.message}`);
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
/**
 * AI Configuration Integration
 * Ensures AI Config works properly with the dashboard system
 */

(function() {
    console.log('AI Config Integration: Starting...');
    
    // Wait for dashboard to be ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initAIConfigIntegration, 1000);
    });
    
    function initAIConfigIntegration() {
        console.log('AI Config Integration: Initializing...');
        
        // Check if AI config section exists in dashboard
        ensureAIConfigSection();
        
        // Setup AI config in dashboard navigation
        setupAIConfigNavigation();
        
        // Initialize form elements
        initializeFormElements();
        
        console.log('AI Config Integration: Complete');
    }
    
    /**
     * Ensure AI config section exists
     */
    function ensureAIConfigSection() {
        let aiConfigSection = document.getElementById('ai-config-section');
        
        if (!aiConfigSection) {
            console.log('AI Config Integration: Creating AI config section...');
            createAIConfigSection();
        }
    }
    
    /**
     * Create AI config section if it doesn't exist
     */
    function createAIConfigSection() {
        // Find a suitable container
        const dashboard = document.querySelector('.dashboard-content') || 
                         document.querySelector('.main-content') || 
                         document.querySelector('#dashboard') ||
                         document.body;
        
        const aiConfigHTML = `
            <div id="ai-config-section" class="dashboard-section" style="display: none;">
                <h3><i class="fas fa-robot"></i> AI Configuration</h3>
                
                <form class="ai-config-form">
                    <div class="form-group">
                        <label for="openaiApiKey">OpenAI API Key</label>
                        <div class="password-toggle">
                            <input type="password" id="openaiApiKey" placeholder="Enter your OpenAI API key" required>
                            <button type="button" class="toggle-btn" onclick="togglePasswordVisibility('openaiApiKey')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="help-text">Your API key will be stored securely and used for AI content generation.</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="aiModel">AI Model</label>
                        <select id="aiModel">
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                        </select>
                        <div class="help-text">Choose the AI model for content generation.</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="maxTokens">Max Tokens</label>
                        <input type="number" id="maxTokens" min="100" max="4000" value="1000">
                        <div class="help-text">Maximum number of tokens for AI responses (100-4000).</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="temperature">Temperature <span class="range-value" id="temperatureValue">0.7</span></label>
                        <input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7">
                        <div class="help-text">Controls randomness: 0 = focused, 2 = creative.</div>
                    </div>
                    
                    <div class="ai-config-actions">
                        <button type="button" id="testAIConnection" class="test-btn">
                            <i class="fas fa-plug"></i> Test Connection
                        </button>
                        <button type="button" id="saveAIConfig" class="save-btn">
                            <i class="fas fa-save"></i> Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        dashboard.insertAdjacentHTML('beforeend', aiConfigHTML);
        
        // Setup temperature value display
        setupTemperatureDisplay();
    }
    
    /**
     * Setup AI config navigation
     */
    function setupAIConfigNavigation() {
        // Add to sidebar navigation if it exists
        const sidebar = document.querySelector('.sidebar') || 
                       document.querySelector('.navigation') ||
                       document.querySelector('.nav-menu');
        
        if (sidebar && !document.querySelector('[data-section="ai-config"]')) {
            const navItem = document.createElement('li');
            navItem.innerHTML = `
                <a href="#" data-section="ai-config" class="nav-link">
                    <i class="fas fa-robot"></i>
                    <span>AI Configuration</span>
                </a>
            `;
            
            sidebar.appendChild(navItem);
            
            // Add click handler
            navItem.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                showAIConfigSection();
            });
        }
    }
    
    /**
     * Show AI config section
     */
    function showAIConfigSection() {
        // Hide other sections
        const allSections = document.querySelectorAll('.dashboard-section');
        allSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show AI config section
        const aiConfigSection = document.getElementById('ai-config-section');
        if (aiConfigSection) {
            aiConfigSection.style.display = 'block';
        }
        
        // Update navigation active state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        const aiConfigLink = document.querySelector('[data-section="ai-config"]');
        if (aiConfigLink) {
            aiConfigLink.classList.add('active');
        }
    }
    
    /**
     * Initialize form elements
     */
    function initializeFormElements() {
        // Setup temperature value display
        setupTemperatureDisplay();
        
        // Add global toggle function for password visibility
        window.togglePasswordVisibility = function(inputId) {
            const input = document.getElementById(inputId);
            const toggleBtn = input.parentNode.querySelector('.toggle-btn i');
            
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                toggleBtn.className = 'fas fa-eye';
            }
        };
    }
    
    /**
     * Setup temperature display
     */
    function setupTemperatureDisplay() {
        const temperatureInput = document.getElementById('temperature');
        const temperatureValue = document.getElementById('temperatureValue');
        
        if (temperatureInput && temperatureValue) {
            temperatureInput.addEventListener('input', function() {
                temperatureValue.textContent = this.value;
            });
        }
    }
    
    // Make show function globally available
    window.showAIConfigSection = showAIConfigSection;
    
})();
