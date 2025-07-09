/**
 * AI Config Integration Fix
 * Fixes duplicate method definition issues in the AI Config system
 */

(function() {
    console.log('AI Config Integration Fix: Initializing');
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initAIConfigIntegrationFix);
    
    // Also try after a delay to ensure all scripts are loaded
    setTimeout(initAIConfigIntegrationFix, 1000);
    
    /**
     * Initialize the AI config integration fix
     */
    function initAIConfigIntegrationFix() {
        console.log('AI Config Integration Fix: Running initialization');
        
        // Ensure we have a single aiConfig object
        if (!window.aiConfig) {
            window.aiConfig = {};
            console.log('AI Config Integration Fix: Created aiConfig object');
        }
        
        // Track methods that have been added to prevent duplicates
        const methodsAdded = {};
        
        // Add getConfig method safely if needed
        if (!window.aiConfig.getConfig && !methodsAdded.getConfig) {
            window.aiConfig.getConfig = function(configId) {
                // Default implementation
                if (!window.aiConfig.configs) {
                    window.aiConfig.configs = [];
                }
                
                return window.aiConfig.configs.find(config => config.id === configId) || null;
            };
            
            methodsAdded.getConfig = true;
            console.log('AI Config Integration Fix: Added getConfig method');
        }
        
        // Add getCustomAssistants method safely if needed
        if (!window.aiConfig.getCustomAssistants && !methodsAdded.getCustomAssistants) {
            window.aiConfig.getCustomAssistants = function() {
                // Default implementation
                if (!window.aiConfig.customAssistants) {
                    window.aiConfig.customAssistants = [];
                }
                
                return window.aiConfig.customAssistants;
            };
            
            methodsAdded.getCustomAssistants = true;
            console.log('AI Config Integration Fix: Added getCustomAssistants method');
        }
        
        // Ensure customAssistants property exists
        if (!window.aiConfig.customAssistants) {
            window.aiConfig.customAssistants = [];
            console.log('AI Config Integration Fix: Added customAssistants property');
        }
        
        // Add configs property if needed
        if (!window.aiConfig.configs) {
            window.aiConfig.configs = [];
            console.log('AI Config Integration Fix: Added configs property');
        }
        
        // Replace any duplicate method adding code
        replaceAIConfigDuplicateMethods();
    }
    
    /**
     * Replace duplicate method adding code in ai-config-complete-fix.js
     */
    function replaceAIConfigDuplicateMethods() {
        // Attempt to find and fix the initAIConfigCompleteFix function
        if (window.initAIConfigCompleteFix) {
            // Store the original function
            const originalInitAIConfigCompleteFix = window.initAIConfigCompleteFix;
            
            // Override with our version that prevents duplicate methods
            window.initAIConfigCompleteFix = function() {
                console.log('AI Config Integration Fix: Using fixed initAIConfigCompleteFix');
                
                // Call original function but catch any errors from duplicate method definitions
                try {
                    originalInitAIConfigCompleteFix();
                } catch (e) {
                    console.warn('AI Config Integration Fix: Caught error in originalInitAIConfigCompleteFix', e);
                }
                
                // Ensure our methods are still intact
                initAIConfigIntegrationFix();
            };
            
            console.log('AI Config Integration Fix: Successfully replaced initAIConfigCompleteFix');
        }
    }
})();
