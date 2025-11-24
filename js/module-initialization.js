/**
 * Module Initialization Script
 * Loads and initializes all modules for the Fooodis Blog System
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Fooodis Blog System modules...');
  
  // Helper function to create toast notifications
  window.showToast = function(message, type = 'info') {
    console.log(`Toast (${type}): ${message}`);
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.top = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.minWidth = '250px';
    toast.style.margin = '10px';
    toast.style.padding = '15px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    toast.style.backgroundColor = type === 'error' ? '#f44336' : 
                                type === 'success' ? '#4CAF50' : 
                                type === 'warning' ? '#ff9800' : '#2196F3';
    toast.style.color = 'white';
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 500);
    }, 4000);
  };
  
  // Helper function for logging
  window.log = function(message, level = 'info') {
    const prefix = `[Fooodis ${level.toUpperCase()}]`;
    switch (level) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      case 'debug':
        console.debug(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  };
  
  // Create a global recovery history state
  window.recoveryHistory = [];
  
  // Function to show recovery history
  window.showRecoveryHistory = function() {
    console.log('Showing recovery history...');
    
    // Get recovery container
    const container = document.getElementById('recovery-history-container') || 
                      document.querySelector('.recovery-section') ||
                      document.body;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'recovery-history-modal';
    modal.style.position = 'fixed';
    modal.style.top = '10%';
    modal.style.left = '50%';
    modal.style.transform = 'translateX(-50%)';
    modal.style.width = '80%';
    modal.style.maxHeight = '80%';
    modal.style.backgroundColor = 'white';
    modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
    modal.style.zIndex = '9999';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.overflow = 'auto';
    
    // Create header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '15px';
    
    const title = document.createElement('h3');
    title.textContent = 'Recovery History';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => modal.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);
    
    // Create content
    const content = document.createElement('div');
    
    if (window.recoveryHistory && window.recoveryHistory.length > 0) {
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      ['Time', 'Status', 'Type', 'ID'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #ddd';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create body rows
      const tbody = document.createElement('tbody');
      
      window.recoveryHistory.forEach(record => {
        const row = document.createElement('tr');
        
        // Time column
        const timeCell = document.createElement('td');
        const date = new Date(record.timestamp);
        timeCell.textContent = date.toLocaleString();
        timeCell.style.padding = '8px';
        timeCell.style.borderBottom = '1px solid #ddd';
        
        // Status column
        const statusCell = document.createElement('td');
        statusCell.textContent = record.status || 'Unknown';
        statusCell.style.padding = '8px';
        statusCell.style.borderBottom = '1px solid #ddd';
        
        // Type column
        const typeCell = document.createElement('td');
        typeCell.textContent = record.type || 'System';
        typeCell.style.padding = '8px';
        typeCell.style.borderBottom = '1px solid #ddd';
        
        // ID column
        const idCell = document.createElement('td');
        idCell.textContent = record.id || record.recoveryId || 'N/A';
        idCell.style.padding = '8px';
        idCell.style.borderBottom = '1px solid #ddd';
        
        row.appendChild(timeCell);
        row.appendChild(statusCell);
        row.appendChild(typeCell);
        row.appendChild(idCell);
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      content.appendChild(table);
    } else {
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No recovery history available.';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = '#666';
      content.appendChild(emptyMessage);
    }
    
    modal.appendChild(content);
    
    // Add buttons
    const footer = document.createElement('div');
    footer.style.marginTop = '15px';
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear History';
    clearBtn.className = 'btn btn-danger';
    clearBtn.onclick = () => {
      window.recoveryHistory = [];
      
      if (window.storageManager) {
        window.storageManager.save('fooodis_recovery_history', []);
      }
      
      modal.remove();
      window.showToast('Recovery history cleared', 'success');
    };
    
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export History';
    exportBtn.className = 'btn btn-primary';
    exportBtn.onclick = () => {
      if (!window.recoveryHistory || window.recoveryHistory.length === 0) {
        window.showToast('No history to export', 'warning');
        return;
      }
      
      const exportData = JSON.stringify(window.recoveryHistory, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'fooodis_recovery_history.json';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      window.showToast('Recovery history exported', 'success');
    };
    
    footer.appendChild(clearBtn);
    footer.appendChild(exportBtn);
    modal.appendChild(footer);
    
    // Add modal to container
    container.appendChild(modal);
  };
  
  // Function to perform health check
  window.performHealthCheck = function() {
    console.log('Performing system health check...');
    
    // Get results container
    const resultsContainer = document.getElementById('health-check-results') || 
                            document.querySelector('.health-check-container');
    
    if (!resultsContainer) {
      console.error('Health check results container not found');
      window.showToast('Results display area not found', 'error');
      return;
    }
    
    resultsContainer.innerHTML = '<p>Checking system health...</p>';
    
    // Check if API service is available
    if (window.apiService && window.apiService.checkHealth) {
      window.apiService.checkHealth()
        .then(data => {
          console.log('Health check response:', data);
          
          // Create result HTML
          let resultHtml = `
            <div class="health-check-result">
              <h4>System Health Status: <span class="status-${data.status === 'healthy' ? 'good' : 'bad'}">${data.status}</span></h4>
              <div class="health-details">
                <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                <p><strong>Server Uptime:</strong> ${Math.floor(data.uptime)} seconds</p>
                <p><strong>Node.js Version:</strong> ${data.version}</p>
              </div>
              <div class="memory-usage">
                <h5>Memory Usage:</h5>
                <ul>
                  <li>RSS: ${Math.round(data.memory.rss / 1024 / 1024)} MB</li>
                  <li>Heap Total: ${Math.round(data.memory.heapTotal / 1024 / 1024)} MB</li>
                  <li>Heap Used: ${Math.round(data.memory.heapUsed / 1024 / 1024)} MB</li>
                </ul>
              </div>
            </div>
          `;
          
          resultsContainer.innerHTML = resultHtml;
          window.showToast('Health check completed', 'success');
        })
        .catch(error => {
          console.error('Health check failed:', error);
          resultsContainer.innerHTML = `
            <div class="health-check-result error">
              <h4>System Health Status: <span class="status-bad">ERROR</span></h4>
              <p>Could not connect to health check API. The server may be offline or experiencing issues.</p>
              <p>Error: ${error.message}</p>
            </div>
          `;
          window.showToast('Health check failed', 'error');
        });
    } else {
      console.error('API service not available');
      resultsContainer.innerHTML = `
        <div class="health-check-result error">
          <h4>System Health Status: <span class="status-bad">UNAVAILABLE</span></h4>
          <p>API service is not available. Make sure the modules are properly loaded.</p>
        </div>
      `;
      window.showToast('API service not available', 'error');
    }
  };

  // Load the module loader first
  const moduleLoaderScript = document.createElement('script');
  moduleLoaderScript.src = './js/modules/module-loader.js';
  moduleLoaderScript.onload = function() {
    console.log('Module loader loaded successfully');
    
    // Initialize core modules
    if (window.ModuleLoader) {
      window.ModuleLoader.initCoreModules()
        .then(modules => {
          console.log('Core modules initialized:', modules);
          window.showToast('All modules loaded successfully', 'success');
          
          // Initialize recovery history if storage manager is available
          if (window.storageManager) {
            window.recoveryHistory = window.storageManager.get('fooodis_recovery_history', []);
          }
          
          // Add event listeners to UI elements after modules are loaded
          initializeUIEvents();
        })
        .catch(error => {
          console.error('Failed to initialize core modules:', error);
          window.showToast('Some modules failed to load', 'error');
          
          // Try to initialize UI anyway
          initializeUIEvents();
        });
    } else {
      console.error('Module loader not available');
      window.showToast('Module loader not available', 'error');
    }
  };
  
  moduleLoaderScript.onerror = function() {
    console.error('Failed to load module loader');
    window.showToast('Failed to load module system', 'error');
  };
  
  document.head.appendChild(moduleLoaderScript);
  
  // Initialize UI event listeners
  function initializeUIEvents() {
    // Look for recovery button
    const recoveryBtn = document.getElementById('show-recovery-history-btn') || 
                        document.querySelector('.btn-show-recovery-history');
    if (recoveryBtn) {
      recoveryBtn.addEventListener('click', function() {
        window.showRecoveryHistory();
      });
    }
    
    // Look for health check button
    const healthCheckBtn = document.getElementById('perform-health-check-btn') || 
                          document.querySelector('.btn-health-check');
    if (healthCheckBtn) {
      healthCheckBtn.addEventListener('click', function() {
        window.performHealthCheck();
      });
    }
    
    console.log('UI events initialized');
  }
});
