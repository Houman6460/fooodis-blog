/**
 * AI Configuration Complete Fix
 * Provides a complete solution for AI configuration issues
 * Ensures all required methods are available and properly initialized
 */

(function() {
    console.log('AI Config Complete Fix: Initializing...');
    
    // Run immediately
    initAIConfigCompleteFix();
    
    // Run again when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initAIConfigCompleteFix();
    });
    
    // Run one more time when window loads
    window.addEventListener('load', function() {
        initAIConfigCompleteFix();
        
        // Run again after a delay to ensure all dynamic content is loaded
        setTimeout(initAIConfigCompleteFix, 1500);
    });
    
    /**
     * Initialize a complete fix for all AI configuration issues
     */
    function initAIConfigCompleteFix() {
        console.log('AI Config Complete Fix: Applying fixes');
        
        // Ensure window.aiConfig exists
        if (!window.aiConfig) {
            console.warn('AI Config Complete Fix: window.aiConfig does not exist, creating it');
            window.aiConfig = {};
        }
        
        // Load the saved configuration from all possible sources
        const savedConfig = loadSavedConfig();
        
        // Create default configuration object if none was found
        const defaultConfig = {
            apiKey: '',
            modelName: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
            customAssistants: []
        };
        
        // Merge saved config with default config
        const config = savedConfig ? { ...defaultConfig, ...savedConfig } : defaultConfig;
        
        // Ensure custom assistants is always an array
        if (!Array.isArray(config.customAssistants)) {
            config.customAssistants = [];
        }
        
        // Fix or create the getConfig method
        if (typeof window.aiConfig.getConfig !== 'function') {
            console.warn('AI Config Complete Fix: Adding getConfig method');
            
            window.aiConfig.getConfig = function() {
                return config;
            };
        }
        
        // Fix or create the getCustomAssistants method
        if (typeof window.aiConfig.getCustomAssistants !== 'function') {
            console.warn('AI Config Complete Fix: Adding getCustomAssistants method');
            
            window.aiConfig.getCustomAssistants = function() {
                return config.customAssistants || [];
            };
        }
        
        // Fix or create the customAssistants property
        if (!window.aiConfig.customAssistants) {
            console.warn('AI Config Complete Fix: Adding customAssistants property');
            window.aiConfig.customAssistants = config.customAssistants || [];
        }
        
        // Save the config to ensure it's available for all components
        saveConfig(config);
        
        console.log('AI Config Complete Fix: All fixes applied successfully');
    }
    
    /**
     * Load saved configuration from all possible sources
     * @returns {Object|null} - The loaded configuration or null if not found
     */
    function loadSavedConfig() {
        let config = null;
        
        // Try to load from localStorage with all possible keys
        const keys = ['aiConfig', 'fooodis-aiConfig', 'ai-config'];
        
        for (const key of keys) {
            try {
                const savedData = localStorage.getItem(key);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    if (parsedData && typeof parsedData === 'object') {
                        console.log(`AI Config Complete Fix: Found configuration in localStorage with key '${key}'`);
                        config = parsedData;
                        break;
                    }
                }
            } catch (error) {
                console.error(`AI Config Complete Fix: Error loading from localStorage key '${key}'`, error);
            }
        }
        
        // Try to load from window.StorageManager if available
        if (!config && window.StorageManager) {
            try {
                if (typeof window.StorageManager.get === 'function') {
                    const managerData = window.StorageManager.get('aiConfig');
                    if (managerData && typeof managerData === 'object') {
                        console.log('AI Config Complete Fix: Found configuration in StorageManager');
                        config = managerData;
                    }
                }
            } catch (error) {
                console.error('AI Config Complete Fix: Error loading from StorageManager', error);
            }
        }
        
        // If config is still null, check if there's an existing one in window.aiConfig
        if (!config && window.aiConfig) {
            if (typeof window.aiConfig.getConfig === 'function') {
                try {
                    const existingConfig = window.aiConfig.getConfig();
                    if (existingConfig && typeof existingConfig === 'object') {
                        console.log('AI Config Complete Fix: Using existing config from window.aiConfig.getConfig()');
                        config = existingConfig;
                    }
                } catch (error) {
                    console.error('AI Config Complete Fix: Error getting existing config', error);
                }
            }
        }
        
        return config;
    }
    
    /**
     * Save configuration to localStorage and StorageManager
     * @param {Object} config - The configuration to save
     */
    function saveConfig(config) {
        try {
            // Save to localStorage
            localStorage.setItem('aiConfig', JSON.stringify(config));
            
            // Save to StorageManager if available
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('aiConfig', config);
            }
            
            console.log('AI Config Complete Fix: Saved configuration to storage');
        } catch (error) {
            console.error('AI Config Complete Fix: Error saving configuration', error);
        }
    }
})();
