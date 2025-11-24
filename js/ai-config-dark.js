/**
 * AI Configuration for OpenAI Integration
 * Handles configuration settings for connecting to OpenAI API and assistants
 */

// Initialize global aiConfig object
window.aiConfig = window.aiConfig || {
    customAssistants: [],
    getConfig: function() {
        return getAIConfig();
    },
    getCustomAssistants: function() {
        return getCustomAssistants();
    },
    generateContent: function(prompt, callback) {
        return generateContent(prompt, callback);
    }
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Config: Initializing...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Wait a short moment to ensure StorageManager is initialized
    setTimeout(function() {
        // Load saved configuration
        loadAndApplyConfig();
        console.log('AI Config: Initialized');
    }, 100);
});

// Also initialize on window load to ensure everything is loaded
window.addEventListener('load', function() {
    console.log('AI Config: Window loaded, ensuring configuration is applied...');
    
    // Small delay to ensure StorageManager is fully initialized
    setTimeout(function() {
        // Check if config is already loaded
        if (!window.aiConfig || !window.aiConfig.apiKey) {
            console.log('AI Config: Configuration not loaded yet, loading now...');
            loadAndApplyConfig();
        } else {
            console.log('AI Config: Configuration already loaded');
        }
    }, 200);
});

/**
 * Load and apply the configuration
 */
function loadAndApplyConfig() {
    try {
        console.log('AI Config: Loading and applying configuration...');
        
        // Load saved configuration
        const config = loadSavedConfig();
        
        // Create the AI configuration section if it doesn't exist
        createAIConfigSection();
        
        // Apply the saved configuration to the form
        if (config) {
            applyConfigToForm(config);
            
            // Store in window for global access
            window.aiConfig = config;
            console.log('AI Config: Configuration loaded and applied successfully', config);
        } else {
            console.warn('AI Config: No saved configuration found');
        }
        
        // Initialize the custom assistants list with a slight delay
        setTimeout(() => {
            renderCustomAssistants();
            
            // Show the saved assistants section by default
            const customAssistantForm = document.querySelector('.custom-assistant-form');
            const savedAssistantsSection = document.querySelector('.saved-assistants-section');
            
            if (customAssistantForm && savedAssistantsSection) {
                customAssistantForm.style.display = 'none';
                savedAssistantsSection.style.display = 'block';
            }
        }, 100);
    } catch (error) {
        console.error('AI Config: Error loading and applying configuration:', error);
    }
}

/**
 * Initialize the AI configuration
 */
function initAIConfig() {
    console.log('AI Config: Initializing');
    
    try {
        // Load saved configuration from localStorage
        const config = loadSavedConfig();
        
        // Create the AI configuration section if it doesn't exist
        createAIConfigSection();
        
        // Apply the saved configuration to the form
        if (config) {
            applyConfigToForm(config);
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize the custom assistants list
        setTimeout(() => {
            renderCustomAssistants();
            
            // Show the saved assistants section by default
            const customAssistantForm = document.querySelector('.custom-assistant-form');
            const savedAssistantsSection = document.querySelector('.saved-assistants-section');
            
            if (customAssistantForm && savedAssistantsSection) {
                customAssistantForm.style.display = 'none';
                savedAssistantsSection.style.display = 'block';
            }
            
            console.log('AI Config: Initialization complete');
        }, 200);
    } catch (error) {
        console.error('AI Config: Initialization error:', error);
    }
}

/**
 * Load saved configuration from storage
 */
function loadSavedConfig() {
    console.log('AI Config: Loading saved configuration from all possible storage locations...');
    
    try {
        let bestConfig = null;
        let configLoaded = false;
        
        // Check all possible storage locations and use the one with valid API key
        
        // 1. Try direct localStorage with key 'aiConfig'
        try {
            const savedConfig = localStorage.getItem('aiConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                if (parsedConfig && typeof parsedConfig === 'object' && parsedConfig.apiKey) {
                    console.log('AI Config: Found configuration with API key in direct localStorage');
                    bestConfig = parsedConfig;
                    configLoaded = true;
                }
            }
        } catch (directError) {
            console.error('AI Config: Error loading from direct localStorage:', directError);
        }
        
        // 2. Try prefixed localStorage with key 'fooodis-aiConfig'
        if (!configLoaded || !bestConfig?.apiKey) {
            try {
                const prefixedConfig = localStorage.getItem('fooodis-aiConfig');
                if (prefixedConfig) {
                    const parsedConfig = JSON.parse(prefixedConfig);
                    if (parsedConfig && typeof parsedConfig === 'object' && parsedConfig.apiKey) {
                        console.log('AI Config: Found configuration with API key in prefixed localStorage');
                        bestConfig = parsedConfig;
                        configLoaded = true;
                    }
                }
            } catch (prefixError) {
                console.error('AI Config: Error loading from prefixed localStorage:', prefixError);
            }
        }
        
        // 3. Try StorageManager with key 'ai-config'
        if ((!configLoaded || !bestConfig?.apiKey) && window.StorageManager && typeof window.StorageManager.load === 'function') {
            try {
                const managerConfig = window.StorageManager.load('ai-config', {
                    defaultValue: null,
                    onSuccess: function(data) {
                        console.log('AI Config: Configuration loaded successfully via StorageManager');
                    },
                    onError: function(error) {
                        console.error('AI Config: Error loading configuration via StorageManager:', error);
                    }
                });
                
                if (managerConfig && typeof managerConfig === 'object' && managerConfig.apiKey) {
                    console.log('AI Config: Found configuration with API key via StorageManager');
                    bestConfig = managerConfig;
                    configLoaded = true;
                }
            } catch (storageError) {
                console.error('AI Config: Unexpected error using StorageManager:', storageError);
            }
        }
        
        // 4. Try sessionStorage as a last resort
        if (!configLoaded || !bestConfig?.apiKey) {
            try {
                const sessionConfig = sessionStorage.getItem('aiConfig');
                if (sessionConfig) {
                    const parsedConfig = JSON.parse(sessionConfig);
                    if (parsedConfig && typeof parsedConfig === 'object' && parsedConfig.apiKey) {
                        console.log('AI Config: Found configuration with API key in sessionStorage');
                        bestConfig = parsedConfig;
                        configLoaded = true;
                    }
                }
            } catch (sessionError) {
                console.error('AI Config: Error loading from sessionStorage:', sessionError);
            }
        }
        
        // If we loaded a configuration, ensure it has all required properties
        if (configLoaded && bestConfig) {
            console.log('AI Config: Using configuration with API key:', bestConfig.apiKey.substring(0, 3) + '...');
            
            // Ensure customAssistants property exists
            if (!bestConfig.customAssistants) {
                bestConfig.customAssistants = [];
                console.log('AI Config: Added missing customAssistants property');
            }
            
            // Ensure customAssistant property exists
            if (!bestConfig.customAssistant) {
                bestConfig.customAssistant = {
                    id: '',
                    name: '',
                    instructions: ''
                };
                console.log('AI Config: Added missing customAssistant property');
            }
            
            // Save the best config to all storage locations for consistency
            try {
                // Update timestamp
                bestConfig.lastLoaded = new Date().toISOString();
                
                // Save to all storage locations
                const configJson = JSON.stringify(bestConfig);
                localStorage.setItem('aiConfig', configJson);
                localStorage.setItem('fooodis-aiConfig', configJson);
                
                if (window.StorageManager && typeof window.StorageManager.save === 'function') {
                    window.StorageManager.save('ai-config', bestConfig);
                }
                
                console.log('AI Config: Saved best configuration to all storage locations for consistency');
            } catch (saveError) {
                console.warn('AI Config: Error saving best configuration to all locations:', saveError);
            }
            
            // Store in window for global access
            window.aiConfig = bestConfig;
            console.log('AI Config: Configuration stored in window.aiConfig');
            
            return bestConfig;
        }
        
        // If no configuration was loaded, return default
        console.log('AI Config: No saved configuration found with API key, using default');
        const defaultConfig = {
            apiKey: '',
            model: 'gpt-4',
            customAssistants: [],
            assistant: 'default',
            customAssistant: {
                id: '',
                name: '',
                instructions: ''
            }
        };
        
        // Store default in window for global access
        window.aiConfig = defaultConfig;
        
        return defaultConfig;
    } catch (error) {
        console.error('AI Config: Unexpected error loading configuration:', error);
        
        // Return default configuration on error
        const defaultConfig = {
            apiKey: '',
            model: 'gpt-4',
            customAssistants: [],
            assistant: 'default',
            customAssistant: {
                id: '',
                name: '',
                instructions: ''
            }
        };
        
        // Store default in window for global access
        window.aiConfig = defaultConfig;
        
        return defaultConfig;
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
    
    // Select model
    const modelOption = document.querySelector(`.model-option[data-model="${config.model}"]`);
    if (modelOption) {
        selectModel(modelOption);
    }
    
    // Select assistant
    const assistantOption = document.querySelector(`.assistant-option[data-assistant="${config.assistant}"]`);
    if (assistantOption) {
        selectAssistant(assistantOption);
    }
    
    // Set custom assistant details if applicable
    if (config.assistant === 'custom') {
        const customAssistantId = document.getElementById('custom-assistant-id');
        const customAssistantName = document.getElementById('custom-assistant-name');
        const customAssistantInstructions = document.getElementById('custom-assistant-instructions');
        
        if (customAssistantId && config.customAssistant && config.customAssistant.id) {
            customAssistantId.value = config.customAssistant.id;
        }
        
        if (customAssistantName && config.customAssistant && config.customAssistant.name) {
            customAssistantName.value = config.customAssistant.name;
        }
        
        if (customAssistantInstructions && config.customAssistant && config.customAssistant.instructions) {
            customAssistantInstructions.value = config.customAssistant.instructions;
        }
    }
    
    // Render custom assistants list
    renderCustomAssistants();
}

/**
 * Create the AI configuration section
 */
function createAIConfigSection() {
    console.log('AI Config: Creating section');
    
    try {
        // Check if the section already exists
        if (document.getElementById('ai-config-section')) {
            console.log('AI Config: Section already exists');
            return;
        }
        
        // Create the section
        const section = document.createElement('section');
        section.id = 'ai-config-section';
        section.className = 'dashboard-section';
        
        // Set the HTML content
        section.innerHTML = `
            <div class="section-header">
                <h2 class="section-title"><i class="fas fa-cog"></i> AI Configuration</h2>
                <p class="section-description">Configure your OpenAI API settings</p>
            </div>
            <div class="ai-config-form">
                <div class="form-group api-key-field">
                    <label for="openai-api-key">OpenAI API Key</label>
                    <div class="input-group">
                        <input type="password" id="openai-api-key" placeholder="Enter your OpenAI API key">
                        <button type="button" class="toggle-visibility" title="Toggle visibility">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <small class="form-text">Your API key is stored locally and never sent to our servers.</small>
                </div>
            
            <div class="form-group model-selection">
                <label>Select AI Model</label>
                <div class="model-options">
                    <div class="model-option selected" data-model="gpt-4">
                        <h4>GPT-4</h4>
                        <p>Most capable model, best quality</p>
                    </div>
                    <div class="model-option" data-model="gpt-4-turbo">
                        <h4>GPT-4 Turbo</h4>
                        <p>Faster, more recent knowledge</p>
                    </div>
                    <div class="model-option" data-model="gpt-3.5-turbo">
                        <h4>GPT-3.5 Turbo</h4>
                        <p>Faster, more economical</p>
                    </div>
                </div>
            </div>
            
            <div class="form-group assistant-selection">
                <label>Select Assistant Type</label>
                <div class="assistant-options">
                    <div class="assistant-option selected" data-assistant="default">
                        <h4><i class="fas fa-robot"></i> Default Assistant</h4>
                        <p>Optimized for food blog content creation</p>
                    </div>
                    <div class="assistant-option" data-assistant="recipe">
                        <h4><i class="fas fa-utensils"></i> Recipe Creator</h4>
                        <p>Specialized in creating detailed recipes</p>
                    </div>
                    <div class="assistant-option" data-assistant="review">
                        <h4><i class="fas fa-star"></i> Restaurant Reviewer</h4>
                        <p>Expert in writing engaging restaurant reviews</p>
                    </div>
                    <div class="assistant-option" data-assistant="custom">
                        <h4><i class="fas fa-user-cog"></i> Custom Assistant</h4>
                        <p>Use your own OpenAI assistant</p>
                    </div>
                </div>
                
                <div class="custom-assistant-form">
                    <h4><i class="fas fa-cogs"></i> Custom Assistant Details</h4>
                    <div class="form-group">
                        <label for="custom-assistant-id">Assistant ID</label>
                        <input type="text" id="custom-assistant-id" placeholder="Enter your OpenAI Assistant ID">
                    </div>
                    <div class="form-group">
                        <label for="custom-assistant-name">Assistant Name (Optional)</label>
                        <input type="text" id="custom-assistant-name" placeholder="Enter a name for this assistant">
                    </div>
                    <div class="form-group">
                        <label for="custom-assistant-instructions">Instructions (Optional)</label>
                        <textarea id="custom-assistant-instructions" rows="4" placeholder="Enter custom instructions for this assistant"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="save-custom-assistant" class="btn btn-primary">Save Assistant</button>
                    </div>
                </div>
                
                <div class="saved-assistants-section">
                    <h4><i class="fas fa-list"></i> Saved Custom Assistants</h4>
                    <div class="saved-assistants-list">
                        <!-- Saved assistants will be listed here -->
                        <p class="no-assistants-message">No custom assistants saved yet.</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" id="add-new-assistant" class="btn btn-secondary">Add New Assistant</button>
                    </div>
                </div>
            </div>
            
            <div class="ai-config-actions">
                <button type="button" class="test-btn" id="test-connection">
                    <i class="fas fa-vial"></i> Test Connection
                </button>
                <button type="button" class="save-btn" id="save-config">
                    <i class="fas fa-save"></i> Save Configuration
                </button>
                <button type="button" class="reset-btn" id="reset-config">
                    <i class="fas fa-undo"></i> Reset
                </button>
            </div>
            
            <div id="connection-status"></div>
        </div>
    `;
    
    // Find the appropriate place to insert the section
    // Try multiple selectors to ensure we find a valid insertion point
    let inserted = false;
    
    // Try to insert before the AI assistant section
    const aiAssistantSection = document.getElementById('ai-assistant-section');
    if (aiAssistantSection) {
        aiAssistantSection.parentNode.insertBefore(section, aiAssistantSection);
        inserted = true;
    }
    
    // If that didn't work, try to insert as the first section in the dashboard content
    if (!inserted) {
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            const firstSection = dashboardContent.querySelector('.dashboard-section');
            if (firstSection) {
                dashboardContent.insertBefore(section, firstSection);
                inserted = true;
            } else {
                dashboardContent.appendChild(section);
                inserted = true;
            }
        }
    }
    
    // If that didn't work, try to insert into the main content area
    if (!inserted) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(section);
            inserted = true;
        }
    }
    
    // Last resort: append to the body
    if (!inserted) {
        document.body.appendChild(section);
    }
    
    // Log the result
    if (inserted) {
        console.log('AI Config: Section inserted into DOM');
    } else {
        console.error('AI Config: Failed to insert section into DOM');
    }
    
    console.log('AI Configuration section created and inserted into the DOM');
    } catch (error) {
        console.error('AI Config: Error creating section:', error);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Toggle API key visibility
    const toggleVisibilityBtn = document.querySelector('.toggle-visibility');
    if (toggleVisibilityBtn) {
        toggleVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
    }
    
    // Model selection
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectModel(this);
        });
    });
    
    // Assistant selection
    const assistantOptions = document.querySelectorAll('.assistant-option');
    assistantOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectAssistant(this);
        });
    });
    
    // Save custom assistant
    const saveAssistantBtn = document.getElementById('save-custom-assistant');
    if (saveAssistantBtn) {
        saveAssistantBtn.addEventListener('click', saveCustomAssistant);
    }
    
    // Add new assistant
    const addAssistantBtn = document.getElementById('add-new-assistant');
    if (addAssistantBtn) {
        addAssistantBtn.addEventListener('click', addNewAssistant);
    }
    
    // Test connection
    const testBtn = document.getElementById('test-connection');
    if (testBtn) {
        testBtn.addEventListener('click', testConnection);
    }
    
    // Save configuration
    const saveBtn = document.getElementById('save-config');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveConfiguration);
    }
    
    // Reset configuration
    const resetBtn = document.getElementById('reset-config');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConfiguration);
    }
    
    // Delete custom assistant (delegated event)
    document.addEventListener('click', function(event) {
        if (event.target.closest('.delete-assistant-btn')) {
            const assistantElement = event.target.closest('.saved-assistant-item');
            if (assistantElement && assistantElement.dataset.id) {
                deleteCustomAssistant(assistantElement.dataset.id);
            }
        }
        
        // Edit custom assistant (delegated event)
        if (event.target.closest('.edit-assistant-btn')) {
            const assistantElement = event.target.closest('.saved-assistant-item');
            if (assistantElement && assistantElement.dataset.id) {
                editCustomAssistant(assistantElement.dataset.id);
            }
        }
    });
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
    const options = document.querySelectorAll('.assistant-option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to the clicked option
    assistantOption.classList.add('selected');
    
    // Show/hide custom assistant form and saved assistants section
    const customAssistantForm = document.querySelector('.custom-assistant-form');
    const savedAssistantsSection = document.querySelector('.saved-assistants-section');
    
    if (customAssistantForm && savedAssistantsSection) {
        if (assistantOption.dataset.assistant === 'custom') {
            // For custom assistant option, show the saved assistants section first
            customAssistantForm.style.display = 'none';
            savedAssistantsSection.style.display = 'block';
        } else {
            // For other options, hide both custom sections
            customAssistantForm.style.display = 'none';
            savedAssistantsSection.style.display = 'none';
        }
    }
}

/**
 * Test the OpenAI API connection
 */
function testConnection() {
    try {
        // Get the API key element
        const apiKeyElement = document.getElementById('openai-api-key');
        
        if (!apiKeyElement) {
            showConnectionStatus('error', 'API key field not found');
            return;
        }
        
        const apiKey = apiKeyElement.value.trim();
        
        if (!apiKey) {
            showConnectionStatus('error', 'API key is required');
            return;
        }
        
        // Show loading status
        showConnectionStatus('warning', 'Testing connection...', true);
        
        console.log('Testing connection with API key:', apiKey.substring(0, 3) + '...');
        
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
    } catch (error) {
        console.error('Error in testConnection:', error);
        showConnectionStatus('error', `Test connection error: ${error.message}`);
    }
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
    try {
        // Get the configuration values
        const apiKeyElement = document.getElementById('openai-api-key');
        const selectedModelElement = document.querySelector('.model-option.selected');
        const selectedAssistantElement = document.querySelector('.assistant-option.selected');
        const customAssistantIdElement = document.getElementById('custom-assistant-id');
        const customAssistantNameElement = document.getElementById('custom-assistant-name');
        const customAssistantInstructionsElement = document.getElementById('custom-assistant-instructions');
        
        // Check if elements exist
        if (!apiKeyElement) {
            showConnectionStatus('error', 'API key field not found');
            return;
        }
        
        if (!selectedModelElement) {
            showConnectionStatus('error', 'No model selected');
            return;
        }
        
        if (!selectedAssistantElement) {
            showConnectionStatus('error', 'No assistant type selected');
            return;
        }
        
        // Build configuration object
        const config = {
            apiKey: apiKeyElement.value.trim(),
            model: selectedModelElement.dataset.model,
            assistant: selectedAssistantElement.dataset.assistant,
            customAssistant: {
                id: customAssistantIdElement ? customAssistantIdElement.value.trim() : '',
                name: customAssistantNameElement ? customAssistantNameElement.value.trim() : '',
                instructions: customAssistantInstructionsElement ? customAssistantInstructionsElement.value.trim() : ''
            },
            // Preserve existing custom assistants
            customAssistants: [],
            // Add timestamp for verification
            lastSaved: new Date().toISOString()
        };
        
        // Get existing configuration to preserve custom assistants
        const existingConfig = getAIConfig();
        if (existingConfig && Array.isArray(existingConfig.customAssistants)) {
            config.customAssistants = existingConfig.customAssistants;
        }
        
        // Validate the configuration
        if (!config.apiKey) {
            showConnectionStatus('error', 'API key is required');
            return;
        }
        
        if (config.assistant === 'custom' && !config.customAssistant.id) {
            showConnectionStatus('error', 'Assistant ID is required for custom assistant');
            return;
        }
        
        // Save to all possible storage locations for maximum reliability
        let savedSuccessfully = false;
        
        // 1. Save directly to localStorage with both keys
        try {
            const configJson = JSON.stringify(config);
            
            // Save with direct key
            localStorage.setItem('aiConfig', configJson);
            console.log('AI Config: Configuration saved directly to localStorage with key "aiConfig"');
            
            // Also save with prefixed key for redundancy
            localStorage.setItem('fooodis-aiConfig', configJson);
            console.log('AI Config: Configuration also saved with prefixed key "fooodis-aiConfig"');
            
            savedSuccessfully = true;
        } catch (error) {
            console.error('AI Config: Error saving configuration to localStorage:', error);
        }
        
        // 2. Save using StorageManager if available
        if (window.StorageManager && typeof window.StorageManager.save === 'function') {
            try {
                const saved = window.StorageManager.save('ai-config', config, {
                    compress: false, // Don't compress for better compatibility
                    onSuccess: function() {
                        console.log('AI Config: Configuration saved successfully via StorageManager');
                    },
                    onError: function(error, status) {
                        console.error('AI Config: Error saving configuration via StorageManager:', error, status);
                    }
                });
                
                if (saved) {
                    savedSuccessfully = true;
                }
            } catch (storageError) {
                console.error('AI Config: Unexpected error using StorageManager:', storageError);
            }
        }
        
        // 3. Save to sessionStorage as additional backup
        try {
            sessionStorage.setItem('aiConfig', JSON.stringify(config));
            console.log('AI Config: Configuration saved to sessionStorage as additional backup');
        } catch (sessionError) {
            console.error('AI Config: Error saving to sessionStorage:', sessionError);
        }
        
        // 4. Store in window for immediate access
        window.aiConfig = config;
        console.log('AI Config: Configuration stored in window.aiConfig for immediate access');
        
        // 5. Verify the save was successful by reading it back
        try {
            const verifyConfig = localStorage.getItem('aiConfig');
            if (verifyConfig) {
                const parsed = JSON.parse(verifyConfig);
                if (parsed && parsed.apiKey === config.apiKey) {
                    console.log('AI Config: Save verification successful');
                } else {
                    console.warn('AI Config: Save verification failed - API key mismatch');
                }
            } else {
                console.warn('AI Config: Save verification failed - config not found in localStorage');
            }
        } catch (verifyError) {
            console.error('AI Config: Error during save verification:', verifyError);
        }
        
        // Show status message
        if (savedSuccessfully) {
            showConnectionStatus('success', 'Configuration saved successfully');
        } else {
            showConnectionStatus('error', 'Failed to save configuration. Please try again.');
        }
        
        console.log('Configuration saved:', config);
    } catch (error) {
        console.error('Error saving configuration:', error);
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

/**
 * Get the current AI configuration
 * @returns {Object} The current AI configuration
 */
function getAIConfig() {
    return loadSavedConfig();
}

/**
 * Generate content using OpenAI API
 * @param {Object} options - Content generation options
 * @param {string} options.prompt - The prompt for content generation
 * @param {string} options.title - The post title
 * @param {string} options.category - The post category
 * @param {string} options.tags - The post tags
 * @param {Function} callback - Callback function to handle the generated content
 */
function generateContent(options, callback) {
    // Get the configuration
    const config = getAIConfig();
    
    if (!config.apiKey) {
        callback({
            success: false,
            error: 'API key is not configured. Please set up your OpenAI API key in the AI Configuration section.'
        });
        return;
    }
    
    // Prepare the API request based on the selected assistant type
    let apiUrl, requestData;
    
    if (config.assistant === 'custom' && config.customAssistant.id) {
        // Use the OpenAI Assistants API with custom assistant
        apiUrl = 'https://api.openai.com/v1/threads';
        
        // First create a thread
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(threadData => {
            // Add a message to the thread
            return fetch(`https://api.openai.com/v1/threads/${threadData.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: 'user',
                    content: buildPrompt(options)
                })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(messageData => {
            // Run the assistant on the thread
            return fetch(`https://api.openai.com/v1/threads/${messageData.thread_id}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assistant_id: config.customAssistant.id
                })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(runData => {
            // Poll for completion
            pollRunStatus(config.apiKey, runData.thread_id, runData.id, callback);
        })
        .catch(error => {
            callback({
                success: false,
                error: `Error generating content: ${error.message}`
            });
        });
    } else {
        // Use the OpenAI Chat Completions API with built-in assistants
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        
        // Build the system message based on assistant type
        let systemMessage = '';
        switch (config.assistant) {
            case 'recipe':
                systemMessage = 'You are an expert recipe creator for a food blog. Create detailed, engaging recipes with ingredients, instructions, and tips.';
                break;
            case 'review':
                systemMessage = 'You are an expert restaurant reviewer. Create engaging, detailed restaurant reviews that highlight ambiance, service, and food quality.';
                break;
            default:
                systemMessage = 'You are an expert food blog content creator. Create engaging, informative content for a food blog.';
        }
        
        requestData = {
            model: config.model,
            messages: [
                {
                    role: 'system',
                    content: systemMessage
                },
                {
                    role: 'user',
                    content: buildPrompt(options)
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // Make the API request
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback({
                success: true,
                content: data.choices[0].message.content
            });
        })
        .catch(error => {
            callback({
                success: false,
                error: `Error generating content: ${error.message}`
            });
        });
    }
}

/**
 * Poll for the run status
 * @param {string} apiKey - The OpenAI API key
 * @param {string} threadId - The thread ID
 * @param {string} runId - The run ID
 * @param {Function} callback - Callback function
 */
function pollRunStatus(apiKey, threadId, runId, callback) {
    // Check the run status
    fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
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
    .then(runData => {
        if (runData.status === 'completed') {
            // Get the assistant's response
            fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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
            .then(messagesData => {
                // Get the assistant's message (should be the last one)
                const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');
                
                if (assistantMessage) {
                    callback({
                        success: true,
                        content: assistantMessage.content[0].text.value
                    });
                } else {
                    throw new Error('No assistant response found');
                }
            });
        } else if (runData.status === 'failed') {
            throw new Error(`Run failed: ${runData.last_error?.message || 'Unknown error'}`);
        } else {
            // Status is still in progress, poll again after a delay
            setTimeout(() => {
                pollRunStatus(apiKey, threadId, runId, callback);
            }, 1000);
        }
    })
    .catch(error => {
        callback({
            success: false,
            error: `Error polling run status: ${error.message}`
        });
    });
}

/**
 * Build the prompt for content generation
 * @param {Object} options - Content generation options
 * @returns {string} The formatted prompt
 */
function buildPrompt(options) {
    return `
Create a high-quality blog post for a food blog with the following details:

Title: ${options.title || 'N/A'}
Category: ${options.category || 'N/A'}
Tags: ${options.tags || 'N/A'}
${options.prompt ? `Additional instructions: ${options.prompt}` : ''}

Please format the content with proper HTML tags for a blog post. Include headings, paragraphs, and any other relevant formatting. Make the content engaging, informative, and optimized for SEO.
    `.trim();
}

/**
 * Save a custom assistant
 */
function saveCustomAssistant() {
    try {
        // Get form elements
        const assistantIdElement = document.getElementById('custom-assistant-id');
        const assistantNameElement = document.getElementById('custom-assistant-name');
        const assistantInstructionsElement = document.getElementById('custom-assistant-instructions');
        
        // Check if elements exist
        if (!assistantIdElement) {
            showConnectionStatus('error', 'Assistant ID field not found');
            return;
        }
        
        const assistantId = assistantIdElement.value.trim();
        const assistantName = assistantNameElement ? (assistantNameElement.value.trim() || 'Custom Assistant') : 'Custom Assistant';
        const assistantInstructions = assistantInstructionsElement ? assistantInstructionsElement.value.trim() : '';
        
        if (!assistantId) {
            showConnectionStatus('error', 'Please enter an Assistant ID');
            return;
        }
        
        // Get current configuration
        const config = getAIConfig();
        
        // Initialize customAssistants array if it doesn't exist
        if (!config.customAssistants) {
            config.customAssistants = [];
        }
        
        // Check if we're editing an existing assistant
        const editingId = assistantIdElement.dataset.editingId;
        
        if (editingId) {
            // Update existing assistant
            const index = config.customAssistants.findIndex(a => a.id === editingId);
            if (index !== -1) {
                config.customAssistants[index] = {
                    id: assistantId,
                    name: assistantName,
                    instructions: assistantInstructions,
                    createdAt: config.customAssistants[index].createdAt,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new assistant
            config.customAssistants.push({
                id: assistantId,
                name: assistantName,
                instructions: assistantInstructions,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        // Save the updated configuration
        localStorage.setItem('aiConfig', JSON.stringify(config));
        
        // Update window.aiConfig for immediate use
        if (window.aiConfig) {
            window.aiConfig.customAssistants = config.customAssistants;
        }
        
        // Clear the form
        assistantIdElement.value = '';
        assistantIdElement.dataset.editingId = '';
        if (assistantNameElement) assistantNameElement.value = '';
        if (assistantInstructionsElement) assistantInstructionsElement.value = '';
        
        // Refresh the assistants list
        renderCustomAssistants();
        
        // Show success message
        showConnectionStatus('success', 'Assistant saved successfully');
        
        // Hide the form and show the saved assistants section
        const formElement = document.querySelector('.custom-assistant-form');
        const savedSection = document.querySelector('.saved-assistants-section');
        
        if (formElement) formElement.style.display = 'none';
        if (savedSection) savedSection.style.display = 'block';
        
        console.log('Custom assistant saved:', assistantId);
    } catch (error) {
        console.error('Error saving custom assistant:', error);
        showConnectionStatus('error', `Failed to save assistant: ${error.message}`);
    }
}

/**
 * Add a new assistant (clear form and show it)
 */
function addNewAssistant() {
    // Clear the form
    document.getElementById('custom-assistant-id').value = '';
    document.getElementById('custom-assistant-name').value = '';
    document.getElementById('custom-assistant-instructions').value = '';
    document.getElementById('custom-assistant-id').dataset.editingId = '';
    
    // Show the form and hide the saved assistants section
    const customAssistantForm = document.querySelector('.custom-assistant-form');
    const savedAssistantsSection = document.querySelector('.saved-assistants-section');
    
    if (customAssistantForm && savedAssistantsSection) {
        customAssistantForm.style.display = 'block';
        savedAssistantsSection.style.display = 'none';
    }
    
    // Select the custom assistant option if not already selected
    const customOption = document.querySelector('.assistant-option[data-assistant="custom"]');
    if (customOption && !customOption.classList.contains('selected')) {
        // Just add the selected class without calling selectAssistant
        // to avoid hiding the form we just showed
        const options = document.querySelectorAll('.assistant-option');
        options.forEach(opt => opt.classList.remove('selected'));
        customOption.classList.add('selected');
    }
}

/**
 * Edit a custom assistant
 * @param {string} assistantId - The ID of the assistant to edit
 */
function editCustomAssistant(assistantId) {
    // Get current configuration
    const config = getAIConfig();
    
    // Find the assistant
    const assistant = config.customAssistants.find(a => a.id === assistantId);
    if (!assistant) return;
    
    // Fill the form
    document.getElementById('custom-assistant-id').value = assistant.id;
    document.getElementById('custom-assistant-name').value = assistant.name || '';
    document.getElementById('custom-assistant-instructions').value = assistant.instructions || '';
    document.getElementById('custom-assistant-id').dataset.editingId = assistant.id;
    
    // Show the form
    document.querySelector('.custom-assistant-form').style.display = 'block';
    document.querySelector('.saved-assistants-section').style.display = 'none';
    
    // Select the custom assistant option
    const customOption = document.querySelector('.assistant-option[data-assistant="custom"]');
    if (customOption) {
        selectAssistant(customOption);
    }
}

/**
 * Delete a custom assistant
 * @param {string} assistantId - The ID of the assistant to delete
 */
function deleteCustomAssistant(assistantId) {
    if (!confirm('Are you sure you want to delete this assistant?')) return;
    
    // Get current configuration
    const config = getAIConfig();
    
    // Remove the assistant
    config.customAssistants = config.customAssistants.filter(a => a.id !== assistantId);
    
    // Save the updated configuration
    localStorage.setItem('aiConfig', JSON.stringify(config));
    
    // Refresh the assistants list
    renderCustomAssistants();
    
    // Show success message
    showConnectionStatus('success', 'Assistant deleted successfully');
}

/**
 * Render the list of custom assistants
 */
function renderCustomAssistants() {
    const assistantsList = document.querySelector('.saved-assistants-list');
    if (!assistantsList) return;
    
    // Get current configuration
    const config = getAIConfig();
    
    // Clear the list
    assistantsList.innerHTML = '';
    
    // Check if there are any assistants
    if (!config.customAssistants || config.customAssistants.length === 0) {
        assistantsList.innerHTML = '<p class="no-assistants-message">No custom assistants saved yet.</p>';
        return;
    }
    
    // Add each assistant to the list
    config.customAssistants.forEach(assistant => {
        const assistantElement = document.createElement('div');
        assistantElement.className = 'saved-assistant-item';
        assistantElement.dataset.id = assistant.id;
        
        assistantElement.innerHTML = `
            <div class="assistant-info">
                <h4>${assistant.name || 'Custom Assistant'}</h4>
                <p class="assistant-id">ID: ${assistant.id}</p>
                ${assistant.instructions ? `<p class="assistant-instructions">${assistant.instructions.substring(0, 50)}${assistant.instructions.length > 50 ? '...' : ''}</p>` : ''}
            </div>
            <div class="assistant-actions">
                <button type="button" class="edit-assistant-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button type="button" class="delete-assistant-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        
        assistantsList.appendChild(assistantElement);
    });
}

/**
 * Get all custom assistants
 * @returns {Array} Array of custom assistants
 */
function getCustomAssistants() {
    try {
        // Get the AI config
        const config = getAIConfig();
        
        // If no config exists, create a default one with empty customAssistants
        if (!config) {
            const defaultConfig = {
                apiKey: '',
                model: 'gpt-4',
                assistant: 'default',
                customAssistants: []
            };
            
            // Save the default config to localStorage
            localStorage.setItem('aiConfig', JSON.stringify(defaultConfig));
            return [];
        }
        
        // If customAssistants doesn't exist in the config, initialize it
        if (!config.customAssistants) {
            config.customAssistants = [];
            
            // Save the updated config to localStorage
            localStorage.setItem('aiConfig', JSON.stringify(config));
        }
        
        return config.customAssistants;
    } catch (error) {
        console.error('Error getting custom assistants:', error);
        return [];
    }
}

// Export functions for use in other scripts
window.aiConfig = {
    getConfig: getAIConfig,
    generateContent: generateContent,
    getCustomAssistants: getCustomAssistants,
    customAssistants: getAIConfig().customAssistants || []
};

// Initialize window.aiConfig.customAssistants if it doesn't exist
document.addEventListener('DOMContentLoaded', function() {
    // Ensure window.aiConfig.customAssistants is initialized
    if (!window.aiConfig.customAssistants) {
        window.aiConfig.customAssistants = [];
        
        // Try to get custom assistants from localStorage
        const savedConfig = localStorage.getItem('aiConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (config && Array.isArray(config.customAssistants)) {
                    window.aiConfig.customAssistants = config.customAssistants;
                    console.log('Initialized window.aiConfig.customAssistants from localStorage');
                }
            } catch (e) {
                console.warn('Error parsing saved AI configuration:', e);
            }
        }
    }
});
