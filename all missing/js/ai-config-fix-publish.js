/**
 * AI Config Publish Fix
 * This script ensures the aiConfig object is properly initialized with all required functions
 * It specifically fixes the "window.aiConfig.getConfig is not a function" error
 */

(function() {
    console.log('AI Config Publish Fix: Initializing...');

    // Initialize immediately and also on DOM load
    initAIConfigFix();

    // Also wait for the DOM to be fully loaded as backup
    document.addEventListener('DOMContentLoaded', function() {
        // Slightly delay execution to ensure other scripts have loaded
        setTimeout(initAIConfigFix, 100);
    });

    /**
     * Initialize AI Config Fix
     */
    function initAIConfigFix() {
        console.log('AI Config Publish Fix: Checking aiConfig object...');

        // Ensure window.aiConfig exists
        if (!window.aiConfig) {
            console.log('AI Config Publish Fix: Creating window.aiConfig object');
            window.aiConfig = {};
        }

        // Create getConfig function if missing
        if (typeof window.aiConfig.getConfig !== 'function') {
            console.log('AI Config Publish Fix: Creating getConfig function');
            window.aiConfig.getConfig = function() {
                try {
                    // Try localStorage first
                    const savedConfig = localStorage.getItem('aiConfig');
                    if (savedConfig) {
                        const config = JSON.parse(savedConfig);
                        // Ensure all required properties exist
                        return {
                            apiKey: config.apiKey || '',
                            modelName: config.modelName || 'gpt-4',
                            temperature: config.temperature || 0.7,
                            maxTokens: config.maxTokens || 1000,
                            customAssistants: config.customAssistants || []
                        };
                    }
                } catch (e) {
                    console.error('AI Config Publish Fix: Error parsing saved config', e);
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
        }

        // Create saveConfig function if missing
        if (typeof window.aiConfig.saveConfig !== 'function') {
            console.log('AI Config Publish Fix: Creating saveConfig function');
            window.aiConfig.saveConfig = function(config) {
                try {
                    localStorage.setItem('aiConfig', JSON.stringify(config));
                    console.log('AI Config Publish Fix: Config saved successfully');
                    return true;
                } catch (e) {
                    console.error('AI Config Publish Fix: Error saving config', e);
                    return false;
                }
            };
        }

        // Create getCustomAssistants function if missing
        if (typeof window.aiConfig.getCustomAssistants !== 'function') {
            console.log('AI Config Publish Fix: Creating getCustomAssistants function');
            window.aiConfig.getCustomAssistants = function() {
                const config = window.aiConfig.getConfig();
                return config && config.customAssistants ? config.customAssistants : [];
            };
        }

        // Create hasValidApiKey function for publishing checks
        if (typeof window.aiConfig.hasValidApiKey !== 'function') {
            console.log('AI Config Publish Fix: Creating hasValidApiKey function');
            window.aiConfig.hasValidApiKey = function() {
                const config = window.aiConfig.getConfig();
                return config && config.apiKey && config.apiKey.trim().length > 0;
            };
        }

        // Create global getAIConfig function as backup
        if (typeof window.getAIConfig !== 'function') {
            console.log('AI Config Publish Fix: Creating global getAIConfig function');
            window.getAIConfig = function() {
                return window.aiConfig.getConfig();
            };
        }

        // Initialize customAssistants property
        if (!window.aiConfig.customAssistants) {
            window.aiConfig.customAssistants = [];
        }

        console.log('AI Config Publish Fix: Initialization complete');

        // Test the configuration
        try {
            const testConfig = window.aiConfig.getConfig();
            console.log('AI Config Publish Fix: Test config retrieved:', {
                hasApiKey: !!testConfig.apiKey,
                modelName: testConfig.modelName,
                customAssistantsCount: testConfig.customAssistants ? testConfig.customAssistants.length : 0
            });
        } catch (e) {
            console.error('AI Config Publish Fix: Error testing config', e);
        }
    }
})();