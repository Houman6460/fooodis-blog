/**
 * Storage Manager Module
 * Handles local storage operations for the Fooodis Blog System
 */

const storageManager = {
  /**
   * Save data to browser's local storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @return {boolean} Success status
   */
  save: function(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Storage save failed:', error);
      return false;
    }
  },
  
  /**
   * Retrieve data from browser's local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @return {any} Retrieved data or defaultValue
   */
  get: function(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return defaultValue;
      return JSON.parse(data);
    } catch (error) {
      console.error('Storage retrieval failed:', error);
      return defaultValue;
    }
  },
  
  /**
   * Delete data from browser's local storage
   * @param {string} key - Storage key to remove
   * @return {boolean} Success status
   */
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removal failed:', error);
      return false;
    }
  },
  
  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key to check
   * @return {boolean} Whether the key exists
   */
  has: function(key) {
    return localStorage.getItem(key) !== null;
  },
  
  /**
   * Clear all application storage data
   * @param {string} prefix - Optional prefix to clear only related items
   * @return {boolean} Success status
   */
  clear: function(prefix = '') {
    try {
      if (!prefix) {
        localStorage.clear();
        return true;
      }
      
      // Clear only items with the given prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  },
  
  /**
   * Get all keys in storage
   * @param {string} prefix - Optional prefix to filter keys
   * @return {Array} List of storage keys
   */
  keys: function(prefix = '') {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!prefix || key.startsWith(prefix)) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error('Error retrieving storage keys:', error);
    }
    return keys;
  }
};

// Make storageManager globally available
window.storageManager = storageManager;
