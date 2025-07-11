/**
 * Email Canvas Clear
 * Provides functionality to clear the email canvas
 */

(function() {
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🧹 Initializing Email Canvas Clear functionality...');
    initCanvasClear();
  });
  
  // Initialize the clear canvas functionality
  function initCanvasClear() {
    // Add the clear button to the UI
    addClearButton();
    
    // Set up the event listeners
    setupEventListeners();
    
    // Expose the clearCanvas function to the global scope for API access
    window.clearEmailCanvas = clearCanvas;
    
    console.log('📝 Clear Canvas button added and API ready');    
  }
  
  // Add the clear canvas button to the email studio actions area
  function addClearButton() {
    // Find the email studio actions container
    const actionsContainer = document.querySelector('.email-studio-actions');
    if (!actionsContainer) {
      console.error('Could not find email-studio-actions container');
      return;
    }
    
    // Insert the clear button after the theme toggle button but before the Save Draft button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      // Create the clear button
      const clearButton = document.createElement('button');
      clearButton.id = 'clear-canvas-btn';
      clearButton.className = 'btn btn-icon';
      clearButton.title = 'Clear Canvas';
      clearButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      
      // Insert after theme toggle
      themeToggle.parentNode.insertBefore(clearButton, themeToggle.nextSibling);
      console.log('✅ Clear Canvas button added');
    } else {
      // Fallback - append to actions container
      const clearButton = document.createElement('button');
      clearButton.id = 'clear-canvas-btn';
      clearButton.className = 'btn btn-danger';
      clearButton.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Canvas';
      
      // Check where to insert it
      const saveButton = actionsContainer.querySelector('.btn-secondary');
      if (saveButton) {
        // Insert before save button
        actionsContainer.insertBefore(clearButton, saveButton);
      } else {
        // Just append to the container
        actionsContainer.appendChild(clearButton);
      }
      console.log('✅ Clear Canvas button added (fallback method)');
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Add click event listener to the clear button
    document.addEventListener('click', function(e) {
      const clearButton = e.target.closest('#clear-canvas-btn');
      if (clearButton) {
        handleClearCanvas();
      }
    });
  }
  
  // Handle clearing the canvas
  function handleClearCanvas() {
    // Ask for confirmation before clearing
    if (confirm('Are you sure you want to clear the email canvas? This will remove all content and cannot be undone.')) {
      clearCanvas();
    }
  }
  
  // Clear the email canvas
  function clearCanvas() {
    // Get the email document element
    const emailDocument = document.getElementById('email-document');
    if (!emailDocument) {
      console.error('Could not find email-document');
      return;
    }
    
    console.log('🧹 Clearing email canvas - complete reset...');
    
    // Store the original content for potential history tracking
    const originalContent = emailDocument.innerHTML;
    
    try {
      // Actually remove all content (including any placeholders)
      while (emailDocument.firstChild) {
        emailDocument.removeChild(emailDocument.firstChild);
      }
      
      // Instead of adding a placeholder, just clear everything
      // This ensures we don't leave any elements behind, including the dashed box
      
      // Save this state in the history if available
      if (window.emailHistoryManager && window.emailHistoryManager.saveState) {
        window.emailHistoryManager.saveState('canvas-cleared');
        // Also save to localStorage
        if (window.emailHistoryManager.saveEmail) {
          window.emailHistoryManager.saveEmail();
        }
      }
      
      // Update status if available
      const statusIndicator = document.querySelector('.status-indicator');
      if (statusIndicator) {
        statusIndicator.textContent = 'Canvas cleared';
        statusIndicator.classList.add('status-updated');
        setTimeout(() => {
          statusIndicator.classList.remove('status-updated');
        }, 2000);
      }
      
      console.log('✅ Email canvas cleared successfully');
    } catch (error) {
      console.error('Error clearing canvas:', error);
      
      // Try to restore the original content in case of error
      try {
        emailDocument.innerHTML = originalContent;
      } catch (restoreError) {
        console.error('Error restoring original content:', restoreError);
      }
    }
  }
  
  // Expose functionality globally
  window.emailCanvasClear = {
    clearCanvas: clearCanvas
  };
})();
