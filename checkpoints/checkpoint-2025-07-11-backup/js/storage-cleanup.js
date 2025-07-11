
/**
 * Storage Cleanup System
 * Manages localStorage size and removes outdated data
 */

(function() {
    'use strict';
    
    const StorageCleanup = {
        // Maximum storage size in KB
        MAX_STORAGE_SIZE: 5000, // 5MB
        
        // Keys that should never be cleaned
        PROTECTED_KEYS: [
            'fooodis-blog-posts',
            'aiConfig', 
            'fooodis-ai-config',
            'aiAutomationPaths',
            'fooodis-ai-automation-paths'
        ],
        
        init: function() {
            console.log('Storage Cleanup: Initializing...');
            
            // Clean on startup
            this.cleanupOldData();
            
            // Set up periodic cleanup every 10 minutes
            setInterval(() => {
                this.cleanupOldData();
            }, 600000);
        },
        
        getStorageSize: function() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return Math.round(total / 1024); // Size in KB
        },
        
        cleanupOldData: function() {
            const currentSize = this.getStorageSize();
            console.log('Storage Cleanup: Current size:', currentSize, 'KB');
            
            if (currentSize > this.MAX_STORAGE_SIZE) {
                console.log('Storage Cleanup: Size exceeded, cleaning up...');
                
                // Remove throttle keys older than 1 hour
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                const keysToRemove = [];
                
                for (let key in localStorage) {
                    if (key.startsWith('throttle_')) {
                        const timestamp = parseInt(localStorage[key]);
                        if (timestamp < oneHourAgo) {
                            keysToRemove.push(key);
                        }
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                console.log('Storage Cleanup: Removed', keysToRemove.length, 'throttle keys');
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => StorageCleanup.init());
    } else {
        StorageCleanup.init();
    }
    
    // Make available globally
    window.StorageCleanup = StorageCleanup;
})();
