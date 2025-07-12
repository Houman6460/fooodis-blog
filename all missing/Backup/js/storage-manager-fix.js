/**
 * Storage Manager Fix
 * Ensures the StorageManager has all required functionality and aliases
 */

(function() {
    console.log('Storage Manager Fix: Initializing...');
    
    // Wait for DOM content to be loaded
    document.addEventListener('DOMContentLoaded', function() {
        initStorageManagerFix();
    });
    
    // Also run on window load to ensure it's applied even for late loading scripts
    window.addEventListener('load', function() {
        initStorageManagerFix();
        
        // Run again after a delay to catch any late initialization
        setTimeout(initStorageManagerFix, 1000);
    });
    
    /**
     * Initialize Storage Manager Fix
     * This ensures that the StorageManager has all required methods
     */
    function initStorageManagerFix() {
        console.log('Storage Manager Fix: Checking StorageManager object...');
        
        // Ensure window.StorageManager exists
        if (!window.StorageManager) {
            console.error('Storage Manager Fix: StorageManager not found, creating it');
            window.StorageManager = {
                PREFIX: 'fooodis-',
                storageEngine: window.localStorage
            };
        }
        
        // Add missing 'get' method (alias for 'load')
        if (typeof window.StorageManager.get !== 'function') {
            console.warn('Storage Manager Fix: Adding missing get() method');
            
            window.StorageManager.get = function(key, defaultValue = null) {
                // If the native load method exists, use it
                if (typeof window.StorageManager.load === 'function') {
                    return window.StorageManager.load(key, { defaultValue: defaultValue });
                }
                
                // Fallback implementation
                try {
                    // Try with prefix first
                    const prefixedKey = window.StorageManager.PREFIX + key;
                    let data = localStorage.getItem(prefixedKey);
                    
                    // Try without prefix if not found
                    if (data === null) {
                        data = localStorage.getItem(key);
                    }
                    
                    // Return parsed data if found, otherwise default value
                    return data !== null ? JSON.parse(data) : defaultValue;
                } catch (error) {
                    console.error('Storage Manager Fix: Error in get() method', error);
                    return defaultValue;
                }
            };
            
            console.log('Storage Manager Fix: Added get() method to StorageManager');
        }
        
        // Add missing 'set' method (alias for 'save')
        if (typeof window.StorageManager.set !== 'function') {
            console.warn('Storage Manager Fix: Adding missing set() method');
            
            window.StorageManager.set = function(key, data) {
                // If the native save method exists, use it
                if (typeof window.StorageManager.save === 'function') {
                    return window.StorageManager.save(key, data);
                }
                
                // Fallback implementation
                try {
                    const prefixedKey = window.StorageManager.PREFIX + key;
                    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
                    localStorage.setItem(prefixedKey, dataString);
                    return true;
                } catch (error) {
                    console.error('Storage Manager Fix: Error in set() method', error);
                    return false;
                }
            };
            
            console.log('Storage Manager Fix: Added set() method to StorageManager');
        }
        
        console.log('Storage Manager Fix: StorageManager is now properly configured');
    }
})();
