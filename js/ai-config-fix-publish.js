
/**
 * AI Config Publish Fix
 * This script ensures the aiConfig object is properly initialized with all required functions
 * It specifically fixes the "window.aiConfig.getConfig is not a function" error
 */

(function() {
    'use strict';

    console.log('🔧 AI Config Fix: Starting comprehensive fix...');

    // Initialize aiConfig object if it doesn't exist
    if (!window.aiConfig) {
        window.aiConfig = {};
        console.log('✅ AI Config Fix: Created aiConfig object');
    }

    // Core configuration management
    window.aiConfig.getConfig = function() {
        console.log('🔍 AI Config Fix: Getting configuration...');
        
        // Check multiple storage locations
        const storageKeys = [
            'aiConfig',
            'fooodis-aiConfig', 
            'fooodis-ai-config',
            'openai-config',
            'ai-automation-config'
        ];

        let config = null;
        
        for (const key of storageKeys) {
            try {
                const stored = localStorage.getItem(key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && (parsed.apiKey || parsed.openaiApiKey)) {
                        config = parsed;
                        console.log(`✅ Found config in: ${key}`);
                        break;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Error parsing config from ${key}:`, e);
            }
        }

        // Default configuration
        const defaultConfig = {
            apiKey: '',
            openaiApiKey: '',
            modelName: 'gpt-4',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000,
            assistant: 'default',
            customAssistants: [],
            enabled: true,
            timestamp: Date.now()
        };

        // Merge with defaults
        config = config ? { ...defaultConfig, ...config } : defaultConfig;

        // Normalize API key field
        if (config.openaiApiKey && !config.apiKey) {
            config.apiKey = config.openaiApiKey;
        } else if (config.apiKey && !config.openaiApiKey) {
            config.openaiApiKey = config.apiKey;
        }

        console.log('🔧 AI Config Fix: Configuration retrieved');
        return config;
    };

    window.aiConfig.saveConfig = function(config) {
        console.log('💾 AI Config Fix: Saving configuration...');
        
        if (!config) {
            console.error('❌ AI Config Fix: No config provided to save');
            return false;
        }

        // Add timestamp
        config.timestamp = Date.now();
        
        // Ensure both API key fields are set
        if (config.apiKey && !config.openaiApiKey) {
            config.openaiApiKey = config.apiKey;
        } else if (config.openaiApiKey && !config.apiKey) {
            config.apiKey = config.openaiApiKey;
        }

        try {
            const configJson = JSON.stringify(config);
            
            // Save to multiple locations for redundancy
            const storageKeys = [
                'aiConfig',
                'fooodis-aiConfig',
                'fooodis-ai-config',
                'openai-config'
            ];

            let saveSuccess = false;
            for (const key of storageKeys) {
                try {
                    localStorage.setItem(key, configJson);
                    saveSuccess = true;
                    console.log(`✅ Saved config to: ${key}`);
                } catch (e) {
                    console.warn(`⚠️ Failed to save to ${key}:`, e);
                }
            }

            // Save API key separately for ai-automation compatibility
            if (config.apiKey) {
                try {
                    localStorage.setItem('openai-api-key', config.apiKey);
                    localStorage.setItem('OPENAI_API_KEY', config.apiKey);
                    console.log('✅ Saved API key for automation compatibility');
                } catch (e) {
                    console.warn('⚠️ Failed to save API key separately:', e);
                }
            }

            // Trigger update events for other systems
            window.dispatchEvent(new CustomEvent('aiConfigUpdated', { 
                detail: { config: config } 
            }));

            console.log('💾 AI Config Fix: Configuration saved successfully');
            return saveSuccess;

        } catch (error) {
            console.error('❌ AI Config Fix: Error saving configuration:', error);
            return false;
        }
    };

    window.aiConfig.getCustomAssistants = function() {
        const config = this.getConfig();
        return config.customAssistants || [];
    };

    window.aiConfig.addCustomAssistant = function(assistant) {
        const config = this.getConfig();
        if (!config.customAssistants) {
            config.customAssistants = [];
        }
        
        assistant.id = assistant.id || 'assistant_' + Date.now();
        assistant.createdAt = assistant.createdAt || new Date().toISOString();
        
        config.customAssistants.push(assistant);
        return this.saveConfig(config);
    };

    window.aiConfig.removeCustomAssistant = function(assistantId) {
        const config = this.getConfig();
        if (config.customAssistants) {
            config.customAssistants = config.customAssistants.filter(a => a.id !== assistantId);
            return this.saveConfig(config);
        }
        return false;
    };

    window.aiConfig.getApiKey = function() {
        const config = this.getConfig();
        return config.apiKey || config.openaiApiKey || '';
    };

    window.aiConfig.isConfigured = function() {
        const apiKey = this.getApiKey();
        return apiKey && apiKey.trim().length > 0;
    };

    // Integration with AI Automation
    window.aiConfig.getAutomationConfig = function() {
        const config = this.getConfig();
        return {
            apiKey: config.apiKey || config.openaiApiKey,
            model: config.model || config.modelName,
            temperature: config.temperature || 0.7,
            maxTokens: config.maxTokens || 1000
        };
    };

    // Ensure customAssistants property exists
    if (!window.aiConfig.customAssistants) {
        window.aiConfig.customAssistants = [];
    }

    // Ensure configs property exists for backwards compatibility
    if (!window.aiConfig.configs) {
        window.aiConfig.configs = [];
    }

    // Setup integration with existing AI Automation system
    function integrateWithAIAutomation() {
        // Check if AI Automation is available
        if (window.aiAutomation || window.automationPaths) {
            console.log('🔗 AI Config Fix: Integrating with AI Automation...');
            
            // Ensure API key is available for automation
            const config = window.aiConfig.getConfig();
            if (config.apiKey) {
                // Set global API key for automation scripts
                window.OPENAI_API_KEY = config.apiKey;
                
                // Also set in localStorage for persistence
                localStorage.setItem('openai-api-key', config.apiKey);
                localStorage.setItem('OPENAI_API_KEY', config.apiKey);
                
                console.log('✅ AI Config Fix: API key integrated with automation system');
            }
        }
    }

    // Run integration
    integrateWithAIAutomation();

    // Listen for AI Automation initialization
    window.addEventListener('aiAutomationReady', integrateWithAIAutomation);

    // Initialize configuration on page load
    try {
        const initialConfig = window.aiConfig.getConfig();
        console.log('🎯 AI Config Fix: Initial configuration loaded');
        
        // Trigger integration event
        window.dispatchEvent(new CustomEvent('aiConfigReady', { 
            detail: { config: initialConfig } 
        }));
        
    } catch (error) {
        console.error('❌ AI Config Fix: Error during initialization:', error);
    }

    console.log('✅ AI Config Fix: Comprehensive fix applied successfully');

})();
