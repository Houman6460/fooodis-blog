/**
 * Email History Manager
 * Handles state management, auto-save, manual save, undo and redo functionality
 * for the Fooodis Email Builder
 */

(function() {
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('💾 Initializing Email History Manager...');
    // Delay initialization slightly to ensure email builder elements are fully loaded
    setTimeout(initHistoryManager, 300);
  });
  
  // Email state history variables
  let stateHistory = [];
  let currentStateIndex = -1;
  let maxHistoryStates = 50;
  let autoSaveInterval = null;
  let lastSavedState = null;
  
  // Initialize the history manager
  function initHistoryManager() {
    // Initialize buttons
    setupButtons();
    
    // Initialize auto-save
    setupAutoSave();
    
    // Initialize with empty state
    saveState('initial');
    
    // Load any saved email if available
    loadSavedEmail();
  }
  
  // Setup buttons for save, undo, redo
  function setupButtons() {
    // Find the buttons in the email studio actions
    const actionButtons = document.querySelector('.email-studio-actions');
    if (!actionButtons) return;
    
    // Add IDs to the buttons for easier selection
    const buttons = actionButtons.querySelectorAll('button');
    if (buttons.length >= 5) {
      // Undo button (first icon button)
      const undoBtn = buttons[0];
      undoBtn.id = 'undo-btn';
      undoBtn.addEventListener('click', undo);
      
      // Redo button (second icon button) 
      const redoBtn = buttons[1];
      redoBtn.id = 'redo-btn';
      redoBtn.addEventListener('click', redo);
      
      // Theme toggle button (skip)
      
      // Save draft button
      const saveBtn = buttons[3];
      saveBtn.id = 'save-email-btn';
      saveBtn.addEventListener('click', function() {
        saveEmail();
        updateStatusIndicator('Email saved successfully');
      });
    }
    
    // We'll also look for the "Save & choose recipients" button
    const saveAndContinueBtn = actionButtons.querySelector('.btn-success');
    if (saveAndContinueBtn) {
      saveAndContinueBtn.id = 'save-continue-btn';
      saveAndContinueBtn.addEventListener('click', function() {
        const saved = saveEmail();
        if (saved) {
          updateStatusIndicator('Email saved and ready to send');
          // Here you could navigate to the recipients selection page
          // window.location.href = 'recipients-selection.html';
        }
      });
    }
  }
  
  // Setup auto-save functionality
  function setupAutoSave() {
    console.log('🔄 Setting up auto-save...');
    
    // Clear any existing interval
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }
    
    // Set up auto-save every 15 seconds (more frequent)
    autoSaveInterval = setInterval(function() {
      console.log('💾 Auto-save interval triggered');
      const saved = saveEmail(true); // true = auto-save
      if (saved) {
        updateStatusIndicator('Auto-saved');
      }
    }, 15000); // 15 seconds
    
    // Also save on any content change
    setupContentChangeListeners();
    
    // Add additional save triggers for better reliability
    setupAdditionalSaveTriggers();
    
    // Initial save to ensure we have a base state
    setTimeout(function() {
      saveEmail(true);
    }, 5000); // Initial save after 5 seconds
    
    console.log('✅ Auto-save setup complete');
  }
  
  // Set up listeners for content changes to trigger state saving
  function setupContentChangeListeners() {
    const emailDocument = document.getElementById('email-document');
    if (!emailDocument) {
      console.error('Email document not found for content change listeners');
      return;
    }
    
    console.log('🔍 Setting up content change listeners');
    
    // Create a mutation observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
      // Process mutations to detect substantive changes
      let shouldSave = false;
      let contentChanged = false;
      let structureChanged = false;
      
      for (const mutation of mutations) {
        // Detect different types of changes
        if (mutation.type === 'childList') {
          structureChanged = true;
          shouldSave = true;
          console.log('📝 Structure change detected, will save');
          break;
        } else if (mutation.type === 'characterData') {
          contentChanged = true;
          shouldSave = true;
          console.log('📝 Text content change detected, will save');
          break;
        } else if (mutation.type === 'attributes') {
          // Exclude non-substantive attribute changes
          const ignoredAttributes = ['data-selected', 'data-active', 'contenteditable', 'class', 'style'];
          if (!ignoredAttributes.includes(mutation.attributeName)) {
            shouldSave = true;
            console.log('📝 Attribute change detected: ' + mutation.attributeName + ', will save');
            break;
          }
        }
      }
      
      if (shouldSave) {
        // Debounce the save to avoid saving too frequently
        clearTimeout(window.saveStateTimeout);
        window.saveStateTimeout = setTimeout(function() {
          saveState(contentChanged ? 'content-change' : (structureChanged ? 'structure-change' : 'attribute-change'));
          updateStatusIndicator('Changes saved');
        }, 1000);
      }
    });
    
    // Configure the observer to watch for relevant changes
    observer.observe(emailDocument, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('✅ Content change listeners set up');
    
    // Also listen for property panel changes
    listenForPropertyChanges();
  }
  
  // Set up additional save triggers for better reliability
  function setupAdditionalSaveTriggers() {
    console.log('🔍 Setting up additional save triggers');
    
    // Capture all mouse up events on the document (after drag operations)
    document.addEventListener('mouseup', function() {
      // Short delay to let other events finish
      setTimeout(function() {
        const emailDocument = document.getElementById('email-document');
        if (emailDocument) {
          // Check if content has changed since last save
          const currentContent = emailDocument.innerHTML;
          if (lastSavedState !== currentContent) {
            console.log('💾 Saving after mouse interaction');
            saveState('mouse-interaction');
            updateStatusIndicator('Changes saved');
          }
        }
      }, 500);
    });
    
    // Save on focusout from the email canvas (when user clicks away)
    const emailCanvas = document.querySelector('.email-canvas');
    if (emailCanvas) {
      emailCanvas.addEventListener('focusout', function(e) {
        if (!emailCanvas.contains(e.relatedTarget)) {
          // User has moved focus outside the canvas
          console.log('💾 Saving on focus change');
          saveEmail(true);
        }
      });
    }
    
    // Save when user interacts with controls or toolbar
    const studioActions = document.querySelector('.email-studio-actions');
    if (studioActions) {
      studioActions.addEventListener('click', function() {
        setTimeout(function() {
          console.log('💾 Saving after toolbar interaction');
          saveEmail(true);
        }, 500);
      });
    }
    
    // Save before user navigates away
    window.addEventListener('beforeunload', function() {
      console.log('💾 Final save before unload');
      saveEmail(false); // Not auto-save, this is an explicit save
    });
    
    console.log('✅ Additional save triggers set up');
  }
  
  // Listen for changes made via the property panel
  function listenForPropertyChanges() {
    console.log('🔍 Setting up property change listeners');
    
    const settingsPanels = document.querySelectorAll('.settings-panel');
    if (settingsPanels.length === 0) {
      console.log('⚠️ No settings panels found for property change detection');
    }
    
    // Track which properties have changed to avoid duplicate saves
    let propertyChangeDebounceTimer = null;
    let pendingPropertyChanges = {};
    
    settingsPanels.forEach((panel, index) => {
      console.log(`Adding listeners to settings panel ${index + 1}`);
      
      // Watch for input changes with improved detection
      panel.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
          const propertyName = e.target.getAttribute('data-property') || e.target.id || 'unknown';
          pendingPropertyChanges[propertyName] = true;
          
          // Debounce to avoid excessive saves during typing/sliding
          clearTimeout(propertyChangeDebounceTimer);
          propertyChangeDebounceTimer = setTimeout(() => {
            const changeCount = Object.keys(pendingPropertyChanges).length;
            console.log(`💾 Saving after ${changeCount} property changes`);
            saveState('property-input-change');
            updateStatusIndicator(`${changeCount} ${changeCount === 1 ? 'property' : 'properties'} updated`);
            pendingPropertyChanges = {};
          }, 800);
        }
      });
      
      // Also watch for standard change events (for select boxes, checkboxes, etc.)
      panel.addEventListener('change', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
          const propertyName = e.target.getAttribute('data-property') || e.target.id || 'unknown';
          console.log(`💾 Property changed: ${propertyName}`);
          saveState(`property-changed-${propertyName}`);
          updateStatusIndicator('Property updated');
        }
      });
      
      // Watch for button clicks that modify content with more specific detection
      panel.addEventListener('click', function(e) {
        // Find the button (could be the target or a parent)
        const button = e.target.closest('button');
        if (!button) return;
        
        // Skip color swatches as they have their own handlers
        if (button.classList.contains('color-swatch')) return;
        
        // Get button info for better tracking
        const buttonText = button.textContent?.trim() || '';
        const buttonAction = button.getAttribute('data-action') || 
                           button.getAttribute('data-format') ||
                           buttonText;
                           
        console.log(`💾 Action button clicked: ${buttonAction}`);
        
        // Delay to allow the action to complete
        setTimeout(() => {
          saveState(`button-action-${buttonAction}`);
          updateStatusIndicator('Changes applied');
        }, 300);
      });
    });
    
    // Additionally, listen for color picker changes which often use custom events
    document.addEventListener('colorChanged', function(e) {
      console.log('💾 Color property changed');
      saveState('color-change');
      updateStatusIndicator('Color updated');
    });
    
    console.log('✅ Property change listeners set up');
  }
  
  // Save the current state to history
  function saveState(action) {
    const emailDocument = document.getElementById('email-document');
    if (!emailDocument) return false;
    
    // Get current email HTML content
    const emailContent = emailDocument.innerHTML;
    
    // If no changes from current state, don't save
    if (currentStateIndex >= 0 && stateHistory[currentStateIndex].content === emailContent) {
      return false;
    }
    
    // If we're in the middle of the history and taking a new action,
    // discard all states after the current one
    if (currentStateIndex < stateHistory.length - 1) {
      stateHistory = stateHistory.slice(0, currentStateIndex + 1);
    }
    
    // Add the new state
    stateHistory.push({
      content: emailContent,
      timestamp: new Date().toISOString(),
      action: action
    });
    
    // Move to the new state
    currentStateIndex = stateHistory.length - 1;
    
    // Limit history size
    if (stateHistory.length > maxHistoryStates) {
      stateHistory.shift();
      currentStateIndex--;
    }
    
    // Update undo/redo button states
    updateUndoRedoButtons();
    
    return true;
  }
  
  // Check available localStorage space to manage storage quota
  function checkStorageQuota() {
    try {
      const testKey = '_quota_test_'; 
      let usedSpace = 0;
      let totalSpace = 0;
      
      // Calculate current usage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          usedSpace += key.length + value.length;
        }
      }
      
      // Estimate total capacity (varies by browser)
      try { 
        // Generate strings of increasing length until we hit quota
        let testValue = '';
        const increment = 1024 * 50; // 50KB increments
        
        localStorage.setItem(testKey, testValue);
        for (let i = 0; i < 100; i++) { // Try up to ~5MB
          testValue += new Array(increment).fill('a').join('');
          localStorage.setItem(testKey, testValue);
          totalSpace = testKey.length + testValue.length + usedSpace;
        }
      } catch (e) {
        // We've hit the limit
      } finally {
        localStorage.removeItem(testKey);
      }
      
      const percentUsed = Math.floor((usedSpace / totalSpace) * 100);
      console.log(`Storage usage: ${Math.round(usedSpace/1024)}KB / ~${Math.round(totalSpace/1024)}KB (${percentUsed}%)`);
      
      return {
        usedSpace,
        totalSpace,
        percentUsed,
        availableSpace: totalSpace - usedSpace,
        isFull: percentUsed > 90
      };
    } catch (error) {
      console.error('Error checking storage quota:', error);
      return { isFull: false }; // Default to assuming there's space
    }
  }
  
  // Clean up storage to make room for new data
  function cleanupStorage() {
    try {
      console.log('🧹 Cleaning up storage to free space...');
      
      // First try to remove known problematic items
      const problematicItems = [
        'fooodisEmailBuilder_backup_',
        'fooodisEmailBuilder_state_',
        'fooodisEmailBuilder_history_'
      ];
      
      let removedCount = 0;
      
      // First pass: remove old backups and history items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        for (const prefix of problematicItems) {
          if (key.startsWith(prefix)) {
            try {
              localStorage.removeItem(key);
              console.log(`Removed ${key} to free space`);
              removedCount++;
              // Adjust index since we removed an item
              i--;
              break;
            } catch (e) {
              // Continue even if removal fails
              console.warn('Failed to remove item:', key);
            }
          }
        }
        
        // If we've removed enough items, we can stop
        if (removedCount >= 10) {
          console.log('Removed 10 items, checking if we have enough space...');
          return true;
        }
      }
      
      // Second pass: get all remaining email builder keys
      const emailKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fooodisEmailBuilder_')) {
          // Don't include the last email in cleanup list
          if (key !== 'fooodisEmailBuilder_lastEmail') {
            emailKeys.push({
              key: key,
              isBackup: key.includes('backup'),
              timestamp: key.includes('_backup_') ? parseInt(key.split('_').pop() || '0') : 0
            });
          }
        }
      }
      
      if (emailKeys.length === 0) {
        // If we've already removed some items in first pass, consider it successful
        if (removedCount > 0) {
          return true;
        }
        console.log('No email data to clean up');
        return false;
      }
      
      // Sort by type (backups first) and then by timestamp (oldest first)
      emailKeys.sort((a, b) => {
        if (a.isBackup !== b.isBackup) return a.isBackup ? -1 : 1;
        return a.timestamp - b.timestamp;
      });
      
      // More aggressive cleanup - remove up to 75% of items if needed
      const removeCount = Math.max(2, Math.ceil(emailKeys.length * 0.75));
      for (let i = 0; i < removeCount && i < emailKeys.length; i++) {
        try {
          localStorage.removeItem(emailKeys[i].key);
          console.log(`Removed ${emailKeys[i].key} to free space`);
          removedCount++;
        } catch (e) {
          console.warn('Failed to remove item:', emailKeys[i].key);
        }
      }
      
      // Last resort: If still not enough space, clear everything except last email
      if (removedCount === 0) {
        const lastEmail = localStorage.getItem('fooodisEmailBuilder_lastEmail');
        localStorage.clear();
        if (lastEmail) {
          localStorage.setItem('fooodisEmailBuilder_lastEmail', lastEmail);
        }
        console.log('🧨 Emergency cleanup: cleared all storage except last email');
        return true;
      }
      
      return removedCount > 0;
    } catch (error) {
      console.error('Error cleaning up storage:', error);
      
      // Last resort fallback - if everything fails, clear all storage
      try {
        localStorage.clear();
        console.log('🧨 Emergency cleanup: cleared all storage');
        return true;
      } catch (finalError) {
        console.error('Complete failure in storage cleanup:', finalError);
        return false;
      }
    }
  }

  // Save the email to localStorage with optimized storage strategies
  function saveEmail(isAutoSave = false) {
    try {
      // Get the email document element
      const emailDocument = document.getElementById('email-document');
      if (!emailDocument) {
        console.error('❌ Email document not found');
        return false;
      }
      
      // Get the current content directly from the DOM
      const currentContent = emailDocument.innerHTML;
      
      // Check if there's actually content to save
      if (!currentContent || currentContent.trim() === '') {
        if (!isAutoSave) {
          console.log('⚠️ Empty content detected, not saving');
        }
        return false;
      }
      
      // Check if content has actually changed since last save
      if (currentContent === lastSavedState && isAutoSave) {
        // Silent no-op for auto-save to reduce console spam
        return true;
      }
      
      // Get the campaign name
      const campaignNameInput = document.getElementById('campaign-name');
      let campaignName = campaignNameInput ? campaignNameInput.value.trim() : '';
      
      // Handle case where campaign name is not set
      if (!campaignName) {
        campaignName = 'Untitled_' + new Date().toISOString().split('T')[0];
        if (!isAutoSave) {
          console.log('Using default campaign name:', campaignName);
        }
      }
      
      // Create safe key from campaign name
      const safeKey = campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      // Create minimal data object to save (reduced size)
      const emailData = {
        n: campaignName,           // name
        c: compressContent(currentContent), // content (compressed)
        t: Date.now()              // timestamp
      };
      
      // Pre-emptively clean up storage before trying to save
      if (Math.random() < 0.25) { // Only do cleanup 25% of the time
        silentCleanup();
      }
      
      // Try multiple storage strategies in sequence
      let savedSuccessfully = false;
      
      // Strategy 1: Try saving only the most important data
      try {
        localStorage.setItem('fooodisEmailBuilder_lastEmail', JSON.stringify(emailData));
        savedSuccessfully = true;
      } catch (error1) {
        if (!isAutoSave) {
          console.log('Storage strategy 1 failed, trying next method');
        }
      }
      
      // Strategy 2: If that failed, clear space and try with truncated content
      if (!savedSuccessfully) {
        try {
          // More aggressive cleanup
          aggressiveCleanup();
          
          // Create minimal version with truncated content
          const minimalData = {
            n: campaignName,
            c: currentContent.length > 5000 ? 
                currentContent.substring(0, 5000) + '...[truncated]' : 
                currentContent,
            t: Date.now()
          };
          
          localStorage.setItem('fooodisEmailBuilder_lastEmail', JSON.stringify(minimalData));
          savedSuccessfully = true;
        } catch (error2) {
          if (!isAutoSave) {
            console.log('Storage strategy 2 failed, trying emergency method');
          }
        }
      }
      
      // Strategy 3: Last resort - clear everything and save tiny fragment
      if (!savedSuccessfully) {
        try {
          // Clear everything except critical system items
          clearAllEmailStorage();
          
          // Create emergency minimal version
          const emergencyData = {
            n: campaignName,
            c: currentContent.substring(0, 1000) + '...[emergency truncated]',
            t: Date.now()
          };
          
          localStorage.setItem('fooodisEmailBuilder_lastEmail', JSON.stringify(emergencyData));
          savedSuccessfully = true;
        } catch (error3) {
          if (!isAutoSave) {
            console.error('All storage strategies failed');
          }
          updateStatusIndicator('Failed to save - storage full');
          return false;
        }
      }
      
      // Rarely create a campaign-specific backup (5% chance on manual saves only)
      if (savedSuccessfully && !isAutoSave && Math.random() < 0.05) {
        try {
          // Try to save campaign-specific version (minimal)
          const campaignKey = 'fooodisEmailBuilder_' + safeKey;
          const minimalBackup = {
            n: campaignName,
            t: Date.now()
          };
          localStorage.setItem(campaignKey, JSON.stringify(minimalBackup));
        } catch (e) {
          // Silently ignore backup failures
        }
      }
      
      // Update the last saved state only if successful
      lastSavedState = currentContent;
      
      // Update UI but avoid too many updates
      if (!isAutoSave) {
        updateStatusIndicator(savedSuccessfully ? 'Email saved' : 'Save failed');
      }
      
      return savedSuccessfully;
    } catch (error) {
      if (!isAutoSave) {
        console.error('Error saving email:', error);
        updateStatusIndicator('Error saving');
      }
      return false;
    }
  }
  
  // Helper function to compress content 
  function compressContent(content) {
    if (!content) return '';
    try {
      // Basic compression by removing excessive whitespace
      return content
        .replace(/\s{2,}/g, ' ')       // Replace multiple spaces with single space
        .replace(/\n\s*/g, '\n')      // Remove spaces after newlines
        .replace(/\s*\n/g, '\n')      // Remove spaces before newlines
        .replace(/\n{3,}/g, '\n\n');  // Replace 3+ newlines with just 2
    } catch (e) {
      return content; // Return original if compression fails
    }
  }
  
  // Quiet cleanup that doesn't log anything
  function silentCleanup() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fooodisEmailBuilder_')) {
          // Skip the current email
          if (key !== 'fooodisEmailBuilder_lastEmail') {
            keysToRemove.push(key);
          }
        }
      }
      
      // Remove backup and history items first
      keysToRemove.forEach(key => {
        if (key.includes('backup') || key.includes('history') || key.includes('state')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Silently continue
    }
  }
  
  // More aggressive cleanup that removes most items
  function aggressiveCleanup() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'fooodisEmailBuilder_lastEmail') {
          keysToRemove.push(key);
        }
      }
      
      // Remove 90% of all other storage items
      const removeCount = Math.ceil(keysToRemove.length * 0.9);
      for (let i = 0; i < removeCount && i < keysToRemove.length; i++) {
        localStorage.removeItem(keysToRemove[i]);
      }
    } catch (e) {
      // Continue even if cleanup fails
    }
  }
  
  // Clear all email-related storage
  function clearAllEmailStorage() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fooodisEmailBuilder_')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all email builder items
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      // Continue even if cleanup fails
    }
  }
  
  // More aggressive cleanup that removes all but the most essential items
  function aggressiveStorageCleanup() {
    const lastEmail = localStorage.getItem('fooodisEmailBuilder_lastEmail');
    
    // Get all keys that aren't the last email
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('fooodisEmailBuilder_') && key !== 'fooodisEmailBuilder_lastEmail') {
        keysToRemove.push(key);
      }
    }
    
    // Remove 90% of all other email builder keys
    const removeCount = Math.ceil(keysToRemove.length * 0.9);
    for (let i = 0; i < removeCount && i < keysToRemove.length; i++) {
      localStorage.removeItem(keysToRemove[i]);
    }
    
    return keysToRemove.length > 0;
  }
  
  // Clear all storage except absolute essentials
  function clearNonEssentialStorage() {
    try {
      // Save last email content
      const lastEmail = localStorage.getItem('fooodisEmailBuilder_lastEmail');
      
      // Clear everything
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fooodisEmailBuilder_')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all but save the key indexes so we don't mess up iteration
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Put back last email if we had it
      if (lastEmail) {
        try {
          const parsedEmail = JSON.parse(lastEmail);
          // Further reduce the size if needed
          if (parsedEmail.c && parsedEmail.c.length > 10000) {
            parsedEmail.c = parsedEmail.c.substring(0, 10000) + '... [truncated for storage]';
          }
          localStorage.setItem('fooodisEmailBuilder_lastEmail', JSON.stringify(parsedEmail));
          return true;
        } catch (parseError) {
          return false;
        }
      }
    } catch (e) {
      console.error('Complete storage failure:', e);
      return false;
    }
  }
  
  // Clean up old backups, keeping only the most recent ones
  function cleanupOldBackups(campaignKey) {
    try {
      // Find all backup keys for this campaign
      const backupPrefix = 'fooodisEmailBuilder_backup_' + campaignKey + '_';
      const backupKeys = [];
      
      // Collect all backup keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(backupPrefix)) {
          backupKeys.push(key);
        }
      }
      
      // Sort by timestamp (newest first)
      backupKeys.sort().reverse();
      
      // Keep only the 5 most recent backups
      if (backupKeys.length > 5) {
        // Remove older backups
        for (let i = 5; i < backupKeys.length; i++) {
          localStorage.removeItem(backupKeys[i]);
          console.log('🗑️ Removed old backup: ' + backupKeys[i]);
        }
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error);
    }
  }
  
  // Load the saved email from localStorage
  function loadSavedEmail() {
    console.log('🔄 Attempting to load saved email...');
    try {
      // Try to load the last email
      const savedEmailJSON = localStorage.getItem('fooodisEmailBuilder_lastEmail');
      if (!savedEmailJSON) {
        console.log('No saved email found in localStorage');
        return false;
      }
      
      const savedEmail = JSON.parse(savedEmailJSON);
      if (!savedEmail || !savedEmail.content) {
        console.log('Invalid saved email data');
        return false;
      }
      
      console.log('Found saved email from:', savedEmail.lastSaved);
      
      // Find the email document
      const emailDocument = document.getElementById('email-document');
      if (!emailDocument) {
        console.log('Email document element not found');
        return false;
      }
      
      // Set the campaign name if available
      const campaignNameInput = document.getElementById('campaign-name');
      if (campaignNameInput && savedEmail.name) {
        campaignNameInput.value = savedEmail.name;
      }
      
      // Replace the email content with saved content
      emailDocument.innerHTML = savedEmail.content;
      
      // Save this as our initial state
      saveState('loaded');
      lastSavedState = savedEmail.content;
      
      // Make sure the blocks are interactive
      makeBlocksInteractive();
      
      updateStatusIndicator('Email loaded');
      console.log('✅ Email loaded successfully!');
      return true;
    } catch (error) {
      console.error('Error loading email:', error);
    }
    
    return false;
  }
  
  // Make sure all blocks in the loaded email are interactive
  function makeBlocksInteractive() {
    // Find all email blocks
    const contentBlocks = document.querySelectorAll('.email-content-block');
    if (contentBlocks.length === 0) return;
    
    console.log(`Making ${contentBlocks.length} blocks interactive...`);
    
    // Check if the makeBlockDraggable function exists (from email-builder-modern.js)
    if (typeof window.makeBlockDraggable === 'function') {
      contentBlocks.forEach(block => {
        window.makeBlockDraggable(block);
        if (typeof window.makeBlockEditable === 'function') {
          window.makeBlockEditable(block);
        }
      });
    } else {
      // If the function doesn't exist as a global, try to find it in the window object
      const emailBuilder = document.querySelector('.email-builder-main');
      if (emailBuilder && emailBuilder.makeBlockDraggable) {
        contentBlocks.forEach(block => {
          emailBuilder.makeBlockDraggable(block);
          if (emailBuilder.makeBlockEditable) {
            emailBuilder.makeBlockEditable(block);
          }
        });
      } else {
        // Alternative approach using event listeners directly
        contentBlocks.forEach(block => {
          block.setAttribute('draggable', 'true');
          
          // Add selection functionality
          block.addEventListener('click', function(e) {
            if (e.target === block || block.contains(e.target)) {
              e.stopPropagation();
              // Remove selection from other blocks
              document.querySelectorAll('.email-content-block.selected').forEach(b => {
                if (b !== block) b.classList.remove('selected');
              });
              // Select this block
              block.classList.add('selected');
            }
          });
        });
      }
    }
  }
  
  // Undo the last action
  function undo() {
    // Check if we can undo
    if (currentStateIndex <= 0) {
      updateStatusIndicator('Nothing to undo');
      return false;
    }
    
    // Move back one state
    currentStateIndex--;
    
    // Apply the previous state
    applyState(currentStateIndex);
    
    // Update the UI
    updateStatusIndicator('Undo successful');
    updateUndoRedoButtons();
    
    return true;
  }
  
  // Redo the previously undone action
  function redo() {
    // Check if we can redo
    if (currentStateIndex >= stateHistory.length - 1) {
      updateStatusIndicator('Nothing to redo');
      return false;
    }
    
    // Move forward one state
    currentStateIndex++;
    
    // Apply the next state
    applyState(currentStateIndex);
    
    // Update the UI
    updateStatusIndicator('Redo successful');
    updateUndoRedoButtons();
    
    return true;
  }
  
  // Apply a state from history
  function applyState(index) {
    const emailDocument = document.getElementById('email-document');
    if (!emailDocument) return false;
    
    // Get the target state
    const state = stateHistory[index];
    if (!state) return false;
    
    // Apply the HTML content
    emailDocument.innerHTML = state.content;
    
    // Reattach any event handlers to the blocks
    reattachEventHandlers();
    
    return true;
  }
  
  // Reattach event handlers after applying a state
  function reattachEventHandlers() {
    // This is important to handle after applying a state
    // because we're replacing HTML which removes existing event listeners
    
    // Re-initialize block interactions if the function exists
    if (typeof makeBlockDraggable === 'function') {
      const contentBlocks = document.querySelectorAll('.email-content-block');
      contentBlocks.forEach(block => {
        makeBlockDraggable(block);
        if (typeof makeBlockEditable === 'function') {
          makeBlockEditable(block);
        }
      });
    }
  }
  
  // Update the UI elements that show undo/redo availability
  function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      // Enable/disable the undo button
      if (currentStateIndex <= 0) {
        undoBtn.classList.add('disabled');
        undoBtn.setAttribute('disabled', 'disabled');
      } else {
        undoBtn.classList.remove('disabled');
        undoBtn.removeAttribute('disabled');
      }
    }
    
    if (redoBtn) {
      // Enable/disable the redo button
      if (currentStateIndex >= stateHistory.length - 1) {
        redoBtn.classList.add('disabled');
        redoBtn.setAttribute('disabled', 'disabled');
      } else {
        redoBtn.classList.remove('disabled');
        redoBtn.removeAttribute('disabled');
      }
    }
  }
  
  // Update the status indicator text with enhanced visual feedback
  function updateStatusIndicator(text) {
    const statusIndicator = document.querySelector('.status-indicator');
    if (!statusIndicator) return;
    
    // Remove existing status classes
    statusIndicator.classList.remove('status-updated', 'auto-saved', 'manual-saved', 'error', 'saving');
    
    // Set the text
    statusIndicator.textContent = text;
    
    // Add appropriate class based on the status message
    if (text === 'Auto-saved') {
      statusIndicator.classList.add('auto-saved');
    } else if (text === 'Email saved') {
      statusIndicator.classList.add('manual-saved');
    } else if (text.includes('Error') || text.includes('error')) {
      statusIndicator.classList.add('error');
    } else if (text === 'Saving...') {
      statusIndicator.classList.add('saving');
    }
    
    // Add the updated animation class
    statusIndicator.classList.add('status-updated');
    
    // Remove the visual feedback after a delay, but keep the type class
    setTimeout(() => {
      statusIndicator.classList.remove('status-updated');
    }, 2000);
    
    // If this was a saving indicator, switch back to normal after a longer delay
    if (text === 'Saving...') {
      setTimeout(() => {
        statusIndicator.classList.remove('saving');
        statusIndicator.textContent = 'Ready';
      }, 3000);
    }
  }
  
  // Initialize the history manager - make it a global function so it can be called from other scripts
  window.initEmailHistoryManager = initHistoryManager;
  
  // Try to initialize one more time after all scripts are loaded
  window.addEventListener('load', function() {
    console.log('⚡ Window fully loaded, ensuring email history is initialized...');
    // Check if email builder exists and has content, but no state history yet
    const emailDocument = document.getElementById('email-document');
    if (emailDocument && stateHistory.length === 0) {
      console.log('📋 Re-initializing email history manager on window load');
      initHistoryManager();
    }
  });
  
  // Expose public functions
  window.emailHistoryManager = {
    undo: undo,
    redo: redo,
    saveEmail: saveEmail,
    saveState: saveState,
    loadSavedEmail: loadSavedEmail
  };
})();
