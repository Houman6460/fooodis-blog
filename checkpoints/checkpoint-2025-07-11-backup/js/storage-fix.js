/**
 * Storage Fix - Resolves data persistence issues
 * This script runs on page load to ensure data is properly loaded and saved
 */

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Storage Fix: Initializing...');
    
    // Fix OpenAI API key persistence
    fixOpenAIKeyPersistence();
    
    // Fix automation paths persistence
    fixAutomationPathsPersistence();
});

/**
 * Fix OpenAI API key persistence issues
 */
function fixOpenAIKeyPersistence() {
    console.log('Storage Fix: Checking OpenAI API key persistence...');
    
    // This will be handled when loadSavedConfig is called in ai-config-dark.js
    // We're just adding a backup check here
    
    setTimeout(function() {
        if (window.aiConfig && !window.aiConfig.apiKey) {
            console.log('Storage Fix: No API key found in window.aiConfig, checking storage...');
            
            // Try to load from localStorage directly
            try {
                const savedConfig = localStorage.getItem('aiConfig');
                if (savedConfig) {
                    const config = JSON.parse(savedConfig);
                    if (config && config.apiKey) {
                        console.log('Storage Fix: Found API key in localStorage, applying fix...');
                        window.aiConfig = config;
                    }
                }
            } catch (e) {
                console.error('Storage Fix: Error loading API key from localStorage:', e);
            }
        }
    }, 1000); // Wait 1 second to ensure other scripts have loaded
}

/**
 * Fix automation paths persistence issues
 */
function fixAutomationPathsPersistence() {
    console.log('Storage Fix: Checking automation paths persistence...');
    
    // This will be handled when loadAutomationPaths is called in ai-automation.js
    // We're just adding a backup check here
    
    setTimeout(function() {
        if (!window.automationPaths || !Array.isArray(window.automationPaths) || window.automationPaths.length === 0) {
            console.log('Storage Fix: No automation paths found in window.automationPaths, checking storage...');
            
            // Try to load from all possible storage locations
            let bestPaths = [];
            
            // 1. Try StorageManager
            if (window.StorageManager && typeof window.StorageManager.load === 'function') {
                try {
                    const managerPaths = window.StorageManager.load('ai-automation-paths');
                    if (managerPaths && Array.isArray(managerPaths) && managerPaths.length > bestPaths.length) {
                        console.log(`Storage Fix: Found ${managerPaths.length} paths via StorageManager`);
                        bestPaths = managerPaths;
                    }
                } catch (e) {
                    console.error('Storage Fix: Error loading from StorageManager:', e);
                }
            }
            
            // 2. Try direct localStorage
            try {
                const savedPaths = localStorage.getItem('aiAutomationPaths');
                if (savedPaths) {
                    const parsedPaths = JSON.parse(savedPaths);
                    if (Array.isArray(parsedPaths) && parsedPaths.length > bestPaths.length) {
                        console.log(`Storage Fix: Found ${parsedPaths.length} paths in direct localStorage`);
                        bestPaths = parsedPaths;
                    }
                }
            } catch (e) {
                console.error('Storage Fix: Error loading from direct localStorage:', e);
            }
            
            // 3. Try prefixed localStorage
            try {
                const prefixedPaths = localStorage.getItem('fooodis-ai-automation-paths');
                if (prefixedPaths) {
                    const parsedPaths = JSON.parse(prefixedPaths);
                    if (Array.isArray(parsedPaths) && parsedPaths.length > bestPaths.length) {
                        console.log(`Storage Fix: Found ${parsedPaths.length} paths in prefixed localStorage`);
                        bestPaths = parsedPaths;
                    }
                }
            } catch (e) {
                console.error('Storage Fix: Error loading from prefixed localStorage:', e);
            }
            
            // 4. Try sessionStorage
            try {
                const sessionPaths = sessionStorage.getItem('aiAutomationPaths');
                if (sessionPaths) {
                    const parsedPaths = JSON.parse(sessionPaths);
                    if (Array.isArray(parsedPaths) && parsedPaths.length > bestPaths.length) {
                        console.log(`Storage Fix: Found ${parsedPaths.length} paths in sessionStorage`);
                        bestPaths = parsedPaths;
                    }
                }
            } catch (e) {
                console.error('Storage Fix: Error loading from sessionStorage:', e);
            }
            
            // If we found paths, apply them
            if (bestPaths.length > 0) {
                console.log(`Storage Fix: Applying ${bestPaths.length} automation paths from storage...`);
                window.automationPaths = bestPaths;
                console.log('Storage Fix: Updated window.automationPaths');
                
                // Re-render automation paths if the function exists
                if (typeof window.renderAutomationPaths === 'function') {
                    window.renderAutomationPaths();
                    console.log('Storage Fix: Re-rendered automation paths in the UI');
                }
            }
            
            console.log('Storage Fix: Automation paths saved to all storage locations');
        }
    }, 2000); // Wait 2 seconds to ensure other scripts have loaded
}

// Add a global helper function to force reload all data
window.reloadAllData = function() {
    console.log('Manually reloading all data...');
    fixOpenAIKeyPersistence();
    fixAutomationPathsPersistence();
    
    // Reload the page after a short delay
    setTimeout(function() {
        location.reload();
    }, 1000);
};
