/**
 * API Service Module
 * Handles all API requests for the Fooodis Blog System
 */

const apiService = {
  /**
   * Base URL for API requests
   */
  baseUrl: window.location.origin,
  
  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint path
   * @param {Object} params - URL parameters
   * @return {Promise} Promise resolving with response data
   */
  get: function(endpoint, params = {}) {
    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    // Make the request
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error(`API GET request failed for ${endpoint}:`, error);
        throw error;
      });
  },
  
  /**
   * Make a POST request to the API
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Data to be sent in the request body
   * @return {Promise} Promise resolving with response data
   */
  post: function(endpoint, data = {}) {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error(`API POST request failed for ${endpoint}:`, error);
      throw error;
    });
  },
  
  /**
   * Check system health
   * @return {Promise} Promise resolving with health status
   */
  checkHealth: function() {
    return this.get('/api/system-health');
  },
  
  /**
   * Perform recovery action
   * @param {string} action - Recovery action type
   * @return {Promise} Promise resolving with recovery status
   */
  performRecovery: function(action = 'localhost') {
    return this.get('/api/recovery', { action });
  },
  
  /**
   * Initialize the API service
   * @return {Promise} Promise that resolves when initialization is complete
   */
  init: function() {
    console.log('API Service initialized');
    // Test API connectivity
    return this.checkHealth()
      .then(data => {
        console.log('API health check successful:', data);
        return data;
      })
      .catch(error => {
        console.warn('API health check failed, system may be offline:', error);
        // Don't throw error to allow offline functionality
        return { status: 'offline', error: error.message };
      });
  }
};

// Make apiService globally available
window.apiService = apiService;
