
// Storage Initialization Fix - Ensures proper storage system startup
(function() {
    'use strict';
    
    console.log('Storage Initialization Fix: Starting');
    
    function initializeStorage() {
        // Initialize core storage keys
        const defaultKeys = {
            'aiConfig': {},
            'fooodis-ai-config': {},
            'aiAutomationPaths': [],
            'fooodis-ai-automation-paths': [],
            'chatbotConversations': [],
            'fooodis-chatbot-conversations': [],
            'dashboardSettings': {},
            'fooodis-dashboard-settings': {}
        };
        
        // Ensure all core keys exist
        Object.keys(defaultKeys).forEach(key => {
            if (!localStorage.getItem(key)) {
                try {
                    localStorage.setItem(key, JSON.stringify(defaultKeys[key]));
                    console.log(`Storage Init: Initialized ${key}`);
                } catch (e) {
                    console.warn(`Storage Init: Failed to initialize ${key}:`, e);
                }
            }
        });
    }
    
    function fixStorageConsistency() {
        // Fix AI Config consistency
        const aiConfigKeys = ['aiConfig', 'fooodis-ai-config'];
        let bestConfig = null;
        
        aiConfigKeys.forEach(key => {
            try {
                const config = localStorage.getItem(key);
                if (config && config !== '{}' && config !== 'null') {
                    const parsed = JSON.parse(config);
                    if (parsed && Object.keys(parsed).length > 0) {
                        bestConfig = parsed;
                    }
                }
            } catch (e) {
                console.warn(`Storage Init: Error reading ${key}:`, e);
            }
        });
        
        if (bestConfig) {
            aiConfigKeys.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(bestConfig));
                } catch (e) {
                    console.warn(`Storage Init: Error saving ${key}:`, e);
                }
            });
            console.log('Storage Init: AI Config synchronized');
        }
        
        // Fix Automation Paths consistency
        const automationKeys = ['aiAutomationPaths', 'fooodis-ai-automation-paths'];
        let bestPaths = [];
        
        automationKeys.forEach(key => {
            try {
                const paths = localStorage.getItem(key);
                if (paths && paths !== '[]' && paths !== 'null') {
                    const parsed = JSON.parse(paths);
                    if (Array.isArray(parsed) && parsed.length > bestPaths.length) {
                        bestPaths = parsed;
                    }
                }
            } catch (e) {
                console.warn(`Storage Init: Error reading ${key}:`, e);
            }
        });
        
        if (bestPaths.length > 0) {
            automationKeys.forEach(key => {
                try {
                    localStorage.setItem(key, JSON.stringify(bestPaths));
                } catch (e) {
                    console.warn(`Storage Init: Error saving ${key}:`, e);
                }
            });
            console.log('Storage Init: Automation paths synchronized');
        }
    }
    
    function setupStorageMonitoring() {
        // Monitor storage changes and maintain consistency
        window.addEventListener('storage', function(e) {
            if (e.key && e.key.includes('ai') && e.newValue) {
                console.log('Storage Init: Storage change detected:', e.key);
                
                // Maintain consistency across related keys
                if (e.key === 'aiConfig' || e.key === 'fooodis-ai-config') {
                    setTimeout(() => {
                        try {
                            const value = e.newValue;
                            if (e.key === 'aiConfig') {
                                localStorage.setItem('fooodis-ai-config', value);
                            } else {
                                localStorage.setItem('aiConfig', value);
                            }
                        } catch (err) {
                            console.warn('Storage Init: Sync error:', err);
                        }
                    }, 100);
                }
            }
        });
    }
    
    function validateStorage() {
        // Validate storage integrity
        const criticalKeys = ['aiConfig', 'aiAutomationPaths'];
        let isValid = true;
        
        criticalKeys.forEach(key => {
            try {
                const value = localStorage.getItem(key);
                if (value) {
                    JSON.parse(value); // Test if it's valid JSON
                }
            } catch (e) {
                console.error(`Storage Init: Invalid JSON in ${key}:`, e);
                localStorage.removeItem(key);
                isValid = false;
            }
        });
        
        if (!isValid) {
            console.log('Storage Init: Reinitializing due to corruption');
            initializeStorage();
        }
        
        return isValid;
    }
    
    // Run initialization
    try {
        validateStorage();
        initializeStorage();
        fixStorageConsistency();
        setupStorageMonitoring();
        
        console.log('Storage Initialization Fix: Completed successfully');
        
        // Set global flag
        window.storageInitialized = true;
        
    } catch (e) {
        console.error('Storage Initialization Fix: Failed:', e);
    }
})();
