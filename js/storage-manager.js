` tags and that no parts are skipped or omitted.

```text
Applying the specified optimizations to the StorageManager to reduce slowness.
```

<replit_final_file>
/**
 * Storage Manager for Fooodis Blog System
 * Provides a unified interface for storing and retrieving data with robust error handling
 * and fallback mechanisms to ensure data persistence.
 */

// Storage Manager namespace
const StorageManager = {
    // Storage prefix for all keys
    PREFIX: 'fooodis-',

    // Default storage engine (localStorage)
    storageEngine: window.localStorage,

    /**
     * Save data to storage
     * @param {string} key - The key to store data under (without prefix)
     * @param {any} data - The data to store
     * @param {Object} options - Additional options
     * @param {boolean} options.compress - Whether to compress the data
     * @param {boolean} options.useBackup - Whether to use backup storage if primary fails
     * @param {Function} options.onSuccess - Callback on successful save
     * @param {Function} options.onError - Callback on save error
     * @returns {boolean} - Whether the save was successful
     */
    save: function(key, data, options = {}) {
        const fullKey = this.PREFIX + key;
        const defaults = {
            compress: false,
            useBackup: true,
            onSuccess: null,
            onError: null
        };

        // Merge options with defaults
        const settings = { ...defaults, ...options };

        try {
            // Convert data to string if needed
            let dataString = typeof data === 'string' ? data : JSON.stringify(data);

            // Compress data if requested
            if (settings.compress && dataString.length > 10000) {
                dataString = this._compressData(dataString);
            }

            // Try to save to primary storage
            this.storageEngine.setItem(fullKey, dataString);

            // Verify data was saved correctly
            const savedData = this.storageEngine.getItem(fullKey);
            if (!savedData) {
                throw new Error('Data verification failed - storage may be full');
            }

            // Call success callback if provided
            if (typeof settings.onSuccess === 'function') {
                settings.onSuccess();
            }

            console.log(`StorageManager: Successfully saved data to ${fullKey}`);
            return true;
        } catch (error) {
            console.error(`StorageManager: Error saving data to ${fullKey}:`, error);

            // Try backup storage if requested
            if (settings.useBackup) {
                try {
                    // If data is too large, try to save a reduced version
                    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                        const reducedData = this._reduceDataSize(data);
                        this.storageEngine.setItem(fullKey, JSON.stringify(reducedData));
                        console.log(`StorageManager: Saved reduced data to ${fullKey}`);

                        // Call error callback if provided
                        if (typeof settings.onError === 'function') {
                            settings.onError(error, 'reduced');
                        }

                        return true;
                    }

                    // Try session storage as fallback
                    window.sessionStorage.setItem(fullKey, typeof data === 'string' ? data : JSON.stringify(data));
                    console.log(`StorageManager: Saved data to session storage as fallback for ${fullKey}`);

                    // Call error callback if provided
                    if (typeof settings.onError === 'function') {
                        settings.onError(error, 'session');
                    }

                    return true;
                } catch (backupError) {
                    console.error(`StorageManager: Backup storage also failed for ${fullKey}:`, backupError);

                    // Call error callback if provided
                    if (typeof settings.onError === 'function') {
                        settings.onError(backupError, 'failed');
                    }

                    return false;
                }
            } else {
                // Call error callback if provided
                if (typeof settings.onError === 'function') {
                    settings.onError(error, 'failed');
                }

                return false;
            }
        }
    },

    /**
     * Load data from storage
     * @param {string} key - The key to load data from (without prefix)
     * @param {Object} options - Additional options
     * @param {any} options.defaultValue - Default value if data not found
     * @param {boolean} options.useBackup - Whether to try backup storage if primary fails
     * @param {Function} options.onSuccess - Callback on successful load
     * @param {Function} options.onError - Callback on load error
     * @returns {any} - The loaded data or default value
     */
    load: function(key, options = {}) {
        const fullKey = this.PREFIX + key;
        const defaults = {
            defaultValue: null,
            useBackup: true,
            onSuccess: null,
            onError: null
        };

        // Merge options with defaults
        const settings = { ...defaults, ...options };

        try {
            // Try to load from primary storage
            let dataString = this.storageEngine.getItem(fullKey);

            // If not found, try backup storage if requested
            if (!dataString && settings.useBackup) {
                dataString = window.sessionStorage.getItem(fullKey);
                if (dataString) {
                    console.log(`StorageManager: Loaded data from session storage for ${fullKey}`);
                }
            }

            // If still not found, return default value
            if (!dataString) {
                console.log(`StorageManager: No data found for ${fullKey}, using default value`);
                return settings.defaultValue;
            }

            // Try to parse data as JSON
            try {
                // Check if data is compressed
                if (dataString.startsWith('COMPRESSED:')) {
                    dataString = this._decompressData(dataString);
                }

                const parsedData = JSON.parse(dataString);

                // Call success callback if provided
                if (typeof settings.onSuccess === 'function') {
                    settings.onSuccess(parsedData);
                }

                console.log(`StorageManager: Successfully loaded data from ${fullKey}`);
                return parsedData;
            } catch (parseError) {
                console.error(`StorageManager: Error parsing data from ${fullKey}:`, parseError);

                // Call error callback if provided
                if (typeof settings.onError === 'function') {
                    settings.onError(parseError, 'parse');
                }

                // Return the raw string if JSON parsing fails
                return dataString;
            }
        } catch (error) {
            console.error(`StorageManager: Error loading data from ${fullKey}:`, error);

            // Call error callback if provided
            if (typeof settings.onError === 'function') {
                settings.onError(error, 'load');
            }

            return settings.defaultValue;
        }
    },

    /**
     * Remove data from storage
     * @param {string} key - The key to remove (without prefix)
     * @returns {boolean} - Whether the removal was successful
     */
    remove: function(key) {
        const fullKey = this.PREFIX + key;

        try {
            // Remove from primary storage
            this.storageEngine.removeItem(fullKey);

            // Also remove from session storage
            try {
                window.sessionStorage.removeItem(fullKey);
            } catch (sessionError) {
                console.warn(`StorageManager: Could not remove from session storage for ${fullKey}:`, sessionError);
            }

            console.log(`StorageManager: Successfully removed data for ${fullKey}`);
            return true;
        } catch (error) {
            console.error(`StorageManager: Error removing data for ${fullKey}:`, error);
            return false;
        }
    },

    /**
     * Clear all storage (only items with our prefix)
     * @returns {boolean} - Whether the clear was successful
     */
    clear: function() {
        try {
            // Get all keys
            const keys = [];
            for (let i = 0; i < this.storageEngine.length; i++) {
                const key = this.storageEngine.key(i);
                if (key.startsWith(this.PREFIX)) {
                    keys.push(key);
                }
            }

            // Remove each key
            keys.forEach(key => {
                this.storageEngine.removeItem(key);
                try {
                    window.sessionStorage.removeItem(key);
                } catch (sessionError) {
                    // Ignore session storage errors
                }
            });

            console.log(`StorageManager: Successfully cleared all data (${keys.length} items)`);
            return true;
        } catch (error) {
            console.error('StorageManager: Error clearing data:', error);
            return false;
        }
    },

    /**
     * Check if storage is available
     * @returns {boolean} - Whether storage is available
     */
    isAvailable: function() {
        try {
            const testKey = this.PREFIX + 'test';
            this.storageEngine.setItem(testKey, 'test');
            const result = this.storageEngine.getItem(testKey) === 'test';
            this.storageEngine.removeItem(testKey);
            return result;
        } catch (error) {
            console.error('StorageManager: Storage is not available:', error);
            return false;
        }
    },

    /**
     * Get all keys in storage (only with our prefix)
     * @returns {Array} - Array of keys (without prefix)
     */
    getKeys: function() {
        const keys = [];

        try {
            for (let i = 0; i < this.storageEngine.length; i++) {
                const key = this.storageEngine.key(i);
                if (key.startsWith(this.PREFIX)) {
                    keys.push(key.substring(this.PREFIX.length));
                }
            }
        } catch (error) {
            console.error('StorageManager: Error getting keys:', error);
        }

        return keys;
    },

    /**
     * Compress data to save space
     * @private
     * @param {string} data - The data to compress
     * @returns {string} - The compressed data
     */
    _compressData: function(data) {
        // Simple compression by removing whitespace
        // In a real app, you would use a proper compression algorithm
        try {
            const compressed = data
                .replace(/\s+/g, ' ')
                .replace(/:\s+/g, ':')
                .replace(/,\s+/g, ',');

            return 'COMPRESSED:' + compressed;
        } catch (error) {
            console.error('StorageManager: Error compressing data:', error);
            return data;
        }
    },

    /**
     * Decompress data
     * @private
     * @param {string} data - The compressed data
     * @returns {string} - The decompressed data
     */
    _decompressData: function(data) {
        try {
            // Remove the compression marker
            return data.substring(11);
        } catch (error) {
            console.error('StorageManager: Error decompressing data:', error);
            return data;
        }
    },

    /**
     * Reduce data size for large objects
     * @private
     * @param {any} data - The data to reduce
     * @returns {any} - The reduced data
     */
    _reduceDataSize: function(data) {
        // If not an object, return as is
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        // If array, reduce each item
        if (Array.isArray(data)) {
            // If array is very large, only keep essential items
            if (data.length > 100) {
                return data.slice(0, 100);
            }

            return data.map(item => this._reduceDataSize(item));
        }

        // For objects, handle special cases
        const reducedData = {};

        // Copy only essential properties
        for (const key in data) {
            // Skip large binary data like images
            if (typeof data[key] === 'string' && data[key].length > 10000 && 
                (data[key].startsWith('data:image') || data[key].startsWith('blob:'))) {
                reducedData[key] = '[IMAGE DATA REMOVED DUE TO SIZE]';
                continue;
            }

            // Recursively reduce nested objects
            reducedData[key] = this._reduceDataSize(data[key]);
        }

        return reducedData;
    }
};

// Immediately initialize and expose StorageManager to window object
// Check if storage is available and set up fallback if needed
if (!StorageManager.isAvailable()) {
    console.error('StorageManager: Storage is not available, using fallback');

    // Use in-memory storage as fallback
    const memoryStorage = {};
    StorageManager.storageEngine = {
        getItem: function(key) {
            return memoryStorage[key] || null;
        },
        setItem: function(key, value) {
            memoryStorage[key] = value;
        },
        removeItem: function(key) {
            delete memoryStorage[key];
        },
        clear: function() {
            for (const key in memoryStorage) {
                if (key.startsWith(StorageManager.PREFIX)) {
                    delete memoryStorage[key];
                }
            }
        },
        key: function(index) {
            return Object.keys(memoryStorage)[index] || null;
        },
        get length() {
            return Object.keys(memoryStorage).length;
        }
    };
}

// Make StorageManager globally available immediately
window.StorageManager = StorageManager;

// Set a global flag to indicate StorageManager is fully initialized and available
window.isStorageManagerAvailable = true;

console.log('StorageManager: Initialized successfully and available globally');

// Also ensure initialization after DOM is loaded (for backward compatibility)
document.addEventListener('DOMContentLoaded', function() {
    console.log('StorageManager: DOM loaded, ensuring initialization is complete');

    // Re-expose StorageManager to window object to ensure it's available
    window.StorageManager = StorageManager;
    window.isStorageManagerAvailable = true;
});