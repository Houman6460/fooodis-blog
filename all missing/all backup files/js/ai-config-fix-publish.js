/**
 * AI Config Publish Fix
 * This script ensures the aiConfig object is properly initialized with all required functions
 * It specifically fixes the "window.aiConfig.getConfig is not a function" error
 */

(function() {
    console.log('AI Config Publish Fix: Initializing...');
    
    // Wait for the DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Slightly delay execution to ensure other scripts have loaded
        setTimeout(initAIConfigFix, 500);
    });
    
    /**
     * Initialize AI Config Fix
     */
    function initAIConfigFix() {
        console.log('AI Config Publish Fix: Checking aiConfig object...');
        
        // Check if window.aiConfig exists
        if (!window.aiConfig) {
            console.error('AI Config Publish Fix: window.aiConfig is undefined, creating it');
            window.aiConfig = {};
        }
        
        // Check if getConfig is missing
        if (typeof window.aiConfig.getConfig !== 'function') {
            console.warn('AI Config Publish Fix: window.aiConfig.getConfig is not a function, fixing...');
            
            // Store the original getConfig if it exists
            const originalGetConfig = window.aiConfig.getConfig;
            
            // Define getAIConfig function if it doesn't exist
            if (typeof window.getAIConfig !== 'function') {
                window.getAIConfig = function() {
                    // Get config from localStorage
                    const savedConfig = localStorage.getItem('aiConfig');
                    if (savedConfig) {
                        try {
                            return JSON.parse(savedConfig);
                        } catch (e) {
                            console.error('AI Config Publish Fix: Error parsing saved config', e);
                        }
                    }
                    
                    // Return default config
                    return {
                        apiKey: '',
                        modelName: 'gpt-4',
                        temperature: 0.7,
                        maxTokens: 1000,
                        customAssistants: []
                    };
                };
            }
            
            // Define the getConfig function properly
            window.aiConfig.getConfig = function() {
                // Try original method first if it was just a reference issue
                if (typeof originalGetConfig === 'function') {
                    try {
                        const result = originalGetConfig();
                        if (result) return result;
                    } catch (e) {
                        console.warn('AI Config Publish Fix: Original getConfig failed', e);
                    }
                }
                
                // Fallback to getAIConfig
                if (typeof window.getAIConfig === 'function') {
                    return window.getAIConfig();
                }
                
                // Final fallback - read directly from localStorage
                const savedConfig = localStorage.getItem('aiConfig');
                if (savedConfig) {
                    try {
                        return JSON.parse(savedConfig);
                    } catch (e) {
                        console.error('AI Config Publish Fix: Error parsing saved config', e);
                    }
                }
                
                // Return default config if all else fails
                return {
                    apiKey: '',
                    modelName: 'gpt-4',
                    temperature: 0.7,
                    maxTokens: 1000,
                    customAssistants: []
                };
            };
            
            console.log('AI Config Publish Fix: getConfig function has been fixed');
        } else {
            console.log('AI Config Publish Fix: getConfig function exists, no fix needed');
        }
        
        // Check if customAssistants is missing
        if (!window.aiConfig.customAssistants) {
            console.warn('AI Config Publish Fix: customAssistants is missing, initializing...');
            window.aiConfig.customAssistants = [];
        }
        
        // Check if getCustomAssistants is missing
        if (typeof window.aiConfig.getCustomAssistants !== 'function') {
            console.warn('AI Config Publish Fix: getCustomAssistants is missing, adding...');
            window.aiConfig.getCustomAssistants = function() {
                const config = window.aiConfig.getConfig();
                return config && config.customAssistants ? config.customAssistants : [];
            };
        }
        
        console.log('AI Config Publish Fix: Initialization complete');
    }
    
    // Also run on window load to ensure everything is ready
    window.addEventListener('load', function() {
        initAIConfigFix();
        
        // Run one more time after a delay to ensure it catches late initialization issues
        setTimeout(initAIConfigFix, 2000);
    });
})();
