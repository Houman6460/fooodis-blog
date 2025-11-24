/**
 * Schedule AI Config Fix
 * Ensures AI configuration is properly integrated with scheduling system
 */
(function() {
    console.log('Initializing Schedule AI Config Fix...');
    
    // Make sure we have the AI config object
    if (!window.aiConfig) {
        window.aiConfig = {};
    }
    
    // Add integration with scheduling system
    window.aiConfig.scheduleGeneration = function(config, scheduleTime) {
        if (!window.automationScheduler) {
            console.error('Automation scheduler not available');
            return false;
        }
        
        return window.automationScheduler.scheduleGeneration(config, scheduleTime);
    };
    
    // Initialize the custom assistants array if it doesn't exist
    if (!window.aiConfig.customAssistants) {
        window.aiConfig.customAssistants = [];
    }
    
    // Add helper method to find assistant by ID
    window.aiConfig.findAssistantById = function(id) {
        if (!window.aiConfig.customAssistants) return null;
        return window.aiConfig.customAssistants.find(assistant => assistant.id === id);
    };
    
    console.log('Schedule AI Config Fix initialized successfully');
})();
