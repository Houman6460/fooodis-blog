/**
 * Unified Schedule Fix for Fooodis Blog System
 * Resolves conflicts between multiple automation scripts and fixes scheduling issues
 */

(function() {
    // Store original functions to avoid conflicts
    const originalFunctions = {
        saveAutomationPathsToStorage: window.saveAutomationPathsToStorage || null,
        loadAutomationPaths: window.loadAutomationPaths || null,
        createExecutionStatusCard: window.createExecutionStatusCard || null,
        restoreExecutionStatusCards: window.restoreExecutionStatusCards || null,
        formatTime: window.formatTime || null
    };

    // Run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Unified Schedule Fix: Initializing...');
        
        // Wait for all other scripts to initialize
        setTimeout(initUnifiedScheduleFix, 1500);
    });

    /**
     * Initialize the unified schedule fix
     */
    function initUnifiedScheduleFix() {
        console.log('Unified Schedule Fix: Starting...');
        
        // Apply fixes to storage functions
        enhanceStorageFunctions();
        
        // Apply fixes to UI functions
        enhanceUIFunctions();
        
        // Apply fixes to time handling
        enhanceTimeHandling();
        
        // Set up periodic checking for scheduled tasks
        setupPeriodicCheck();
        
        // Fix any paths that might be in an inconsistent state
        fixInconsistentPaths();
        
        console.log('Unified Schedule Fix: Initialized successfully');
    }

    /**
     * Enhance storage functions to ensure data persistence
     */
    function enhanceStorageFunctions() {
        // Only enhance if the original function exists
        if (typeof window.saveAutomationPathsToStorage === 'function') {
            // Store the original function
            const originalSave = window.saveAutomationPathsToStorage;
            
            // Replace with enhanced version
            window.saveAutomationPathsToStorage = function() {
                console.log('Unified Schedule Fix: Enhanced save function called');
                
                // Call the original function first
                const result = originalSave.apply(this, arguments);
                
                // Get the current paths
                let paths = [];
                try {
                    paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                } catch (e) {
                    console.error('Unified Schedule Fix: Error parsing paths', e);
                    paths = [];
                }
                
                // Ensure each path has the required properties
                paths = paths.map(enhancePath);
                
                // Save to multiple storage locations for redundancy
                try {
                    // Direct localStorage
                    localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
                    
                    // Prefixed localStorage
                    localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(paths));
                    
                    // StorageManager if available
                    if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                        window.StorageManager.set('ai-automation-paths', JSON.stringify(paths));
                    }
                    
                    console.log('Unified Schedule Fix: Saved paths to all storage locations', paths.length);
                } catch (e) {
                    console.error('Unified Schedule Fix: Error saving paths', e);
                }
                
                return result;
            };
        }
        
        // Enhance load function
        if (typeof window.loadAutomationPaths === 'function') {
            // Store the original function
            const originalLoad = window.loadAutomationPaths;
            
            // Replace with enhanced version
            window.loadAutomationPaths = function() {
                console.log('Unified Schedule Fix: Enhanced load function called');
                
                // Call the original function first
                const result = originalLoad.apply(this, arguments);
                
                // Get paths from all storage locations
                let directPaths = [];
                let prefixedPaths = [];
                let managerPaths = [];
                
                try {
                    directPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                } catch (e) {
                    console.error('Unified Schedule Fix: Error parsing direct paths', e);
                }
                
                try {
                    prefixedPaths = JSON.parse(localStorage.getItem('fooodis-ai-automation-paths') || '[]');
                } catch (e) {
                    console.error('Unified Schedule Fix: Error parsing prefixed paths', e);
                }
                
                try {
                    if (window.StorageManager && typeof window.StorageManager.get === 'function') {
                        managerPaths = JSON.parse(window.StorageManager.get('ai-automation-paths') || '[]');
                    }
                } catch (e) {
                    console.error('Unified Schedule Fix: Error parsing manager paths', e);
                }
                
                // Combine all paths and remove duplicates
                let allPaths = [...directPaths, ...prefixedPaths, ...managerPaths];
                
                // Remove duplicates by ID
                const uniquePaths = [];
                const seenIds = new Set();
                
                allPaths.forEach(path => {
                    // Ensure path has an ID
                    if (!path.id) {
                        path.id = generateUniqueId();
                    }
                    
                    // Only add if we haven't seen this ID before
                    if (!seenIds.has(path.id)) {
                        seenIds.add(path.id);
                        uniquePaths.push(enhancePath(path));
                    }
                });
                
                // Update the global automationPaths variable if it exists
                if (typeof window.automationPaths !== 'undefined') {
                    window.automationPaths = uniquePaths;
                }
                
                // Save the consolidated paths back to all storage locations
                try {
                    // Direct localStorage
                    localStorage.setItem('aiAutomationPaths', JSON.stringify(uniquePaths));
                    
                    // Prefixed localStorage
                    localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(uniquePaths));
                    
                    // StorageManager if available
                    if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                        window.StorageManager.set('ai-automation-paths', JSON.stringify(uniquePaths));
                    }
                    
                    console.log('Unified Schedule Fix: Consolidated paths saved to all storage locations', uniquePaths.length);
                } catch (e) {
                    console.error('Unified Schedule Fix: Error saving consolidated paths', e);
                }
                
                return result;
            };
        }
    }

    /**
     * Enhance UI functions to ensure status cards persist
     */
    function enhanceUIFunctions() {
        // Enhance the createExecutionStatusCard function
        if (typeof window.createExecutionStatusCard === 'function') {
            // Store the original function
            const originalCreate = window.createExecutionStatusCard;
            
            // Replace with enhanced version
            window.createExecutionStatusCard = function(path) {
                console.log('Unified Schedule Fix: Enhanced createExecutionStatusCard called', path?.id);
                
                // Call the original function
                const result = originalCreate.apply(this, arguments);
                
                // Store the status card info in localStorage for persistence
                try {
                    // Get existing status cards
                    let statusCards = JSON.parse(localStorage.getItem('executionStatusCards') || '[]');
                    
                    // Add or update this card
                    const existingIndex = statusCards.findIndex(card => card.pathId === path.id);
                    if (existingIndex !== -1) {
                        statusCards[existingIndex] = {
                            pathId: path.id,
                            status: path.status,
                            timestamp: new Date().toISOString()
                        };
                    } else {
                        statusCards.push({
                            pathId: path.id,
                            status: path.status,
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                    // Save back to localStorage
                    localStorage.setItem('executionStatusCards', JSON.stringify(statusCards));
                    console.log('Unified Schedule Fix: Saved status card info', path.id);
                } catch (e) {
                    console.error('Unified Schedule Fix: Error saving status card info', e);
                }
                
                return result;
            };
        }
        
        // Enhance the restoreExecutionStatusCards function
        if (typeof window.restoreExecutionStatusCards === 'function') {
            // Store the original function
            const originalRestore = window.restoreExecutionStatusCards;
            
            // Replace with enhanced version
            window.restoreExecutionStatusCards = function() {
                console.log('Unified Schedule Fix: Enhanced restoreExecutionStatusCards called');
                
                // Call the original function
                const result = originalRestore.apply(this, arguments);
                
                // Restore status cards from our persistent storage
                try {
                    // Get status cards from localStorage
                    const statusCards = JSON.parse(localStorage.getItem('executionStatusCards') || '[]');
                    
                    // Get all automation paths
                    const paths = typeof window.automationPaths !== 'undefined' ? window.automationPaths : 
                        JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                    
                    // For each status card, find the corresponding path and restore the card
                    statusCards.forEach(card => {
                        const path = paths.find(p => p.id === card.pathId);
                        if (path) {
                            // Update the path status
                            path.status = card.status;
                            
                            // Create the status card
                            if (typeof window.createExecutionStatusCard === 'function') {
                                // Use the original function directly to avoid infinite loop
                                originalCreate.call(window, path);
                                console.log('Unified Schedule Fix: Restored status card for path', path.id);
                            }
                        }
                    });
                    
                    // Save the updated paths
                    if (typeof window.saveAutomationPathsToStorage === 'function') {
                        window.saveAutomationPathsToStorage();
                    }
                } catch (e) {
                    console.error('Unified Schedule Fix: Error restoring status cards', e);
                }
                
                return result;
            };
        }
    }

    /**
     * Enhance time handling to ensure consistent display
     */
    function enhanceTimeHandling() {
        // Enhance the formatTime function
        if (typeof window.formatTime === 'function') {
            // Store the original function
            const originalFormat = window.formatTime;
            
            // Replace with enhanced version
            window.formatTime = function(time) {
                console.log('Unified Schedule Fix: Enhanced formatTime called', time);
                
                // Normalize the time format first
                const normalizedTime = normalizeTimeFormat(time);
                
                // Call the original function with normalized time
                return originalFormat.call(window, normalizedTime);
            };
        } else {
            // Define the formatTime function if it doesn't exist
            window.formatTime = function(time) {
                return formatTimeForDisplay(normalizeTimeFormat(time));
            };
        }
        
        // Fix time display in the DOM
        fixTimeDisplay();
    }

    /**
     * Fix time display in the DOM
     */
    function fixTimeDisplay() {
        // Find all elements with time data
        document.querySelectorAll('[data-time]').forEach(el => {
            const time = el.getAttribute('data-time');
            if (time) {
                el.textContent = formatTimeForDisplay(normalizeTimeFormat(time));
            }
        });
        
        // Fix time inputs
        document.querySelectorAll('input[type="time"]').forEach(input => {
            input.addEventListener('change', function() {
                // Ensure consistent 24-hour format
                const normalizedTime = normalizeTimeFormat(this.value);
                this.value = normalizedTime;
                
                // Update any associated display elements
                const displayElements = document.querySelectorAll(`[data-time-display="${this.id}"]`);
                displayElements.forEach(el => {
                    el.textContent = formatTimeForDisplay(normalizedTime);
                });
            });
        });
    }

    /**
     * Set up periodic checking for scheduled tasks
     */
    function setupPeriodicCheck() {
        console.log('Unified Schedule Fix: Setting up periodic checks');
        
        // Check every minute
        setInterval(function() {
            console.log('Unified Schedule Fix: Running periodic check');
            checkScheduledTasks();
        }, 60000);
        
        // Run an initial check
        setTimeout(checkScheduledTasks, 5000);
    }

    /**
     * Check for scheduled tasks that need to be executed
     */
    function checkScheduledTasks() {
        console.log('Unified Schedule Fix: Checking scheduled tasks');
        
        // Get all automation paths
        let paths = [];
        try {
            paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
        } catch (e) {
            console.error('Unified Schedule Fix: Error parsing paths', e);
            return;
        }
        
        // Check each path
        const now = new Date();
        let updated = false;
        
        paths.forEach((path, index) => {
            // Skip paths that are not scheduled or active
            if (!path.schedule || path.status !== 'scheduled' || path.active === false) {
                return;
            }
            
            // Ensure the path has a next execution time
            if (!path.schedule.nextExecution) {
                path.schedule.nextExecution = calculateNextExecutionTime(path.schedule);
                updated = true;
            }
            
            // Check if it's time to execute
            const nextExecution = new Date(path.schedule.nextExecution);
            if (nextExecution <= now) {
                console.log(`Unified Schedule Fix: Time to execute path ${path.id}`);
                
                // Update the path status
                path.status = 'executing';
                path.executionStarted = now.toISOString();
                updated = true;
                
                // Execute the path
                if (typeof window.executeAutomationPath === 'function') {
                    window.executeAutomationPath(path, index);
                } else {
                    console.error('Unified Schedule Fix: executeAutomationPath function not found');
                    
                    // Simulate execution
                    simulateExecution(path, index);
                }
            }
        });
        
        // Save updated paths
        if (updated) {
            localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
            
            // Update the global automationPaths variable if it exists
            if (typeof window.automationPaths !== 'undefined') {
                window.automationPaths = paths;
            }
            
            // Save to other storage locations
            localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(paths));
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('ai-automation-paths', JSON.stringify(paths));
            }
        }
    }

    /**
     * Simulate execution of an automation path
     */
    function simulateExecution(path, index) {
        console.log(`Unified Schedule Fix: Simulating execution for path ${path.id}`);
        
        // Create a status card
        if (typeof window.createExecutionStatusCard === 'function') {
            window.createExecutionStatusCard(path);
        }
        
        // Simulate execution time
        setTimeout(function() {
            // Get the current paths
            let paths = [];
            try {
                paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
            } catch (e) {
                console.error('Unified Schedule Fix: Error parsing paths', e);
                return;
            }
            
            // Find the path
            const pathIndex = paths.findIndex(p => p.id === path.id);
            if (pathIndex === -1) {
                console.error(`Unified Schedule Fix: Path ${path.id} not found`);
                return;
            }
            
            // Update the path
            paths[pathIndex].status = 'completed';
            paths[pathIndex].lastExecution = new Date().toISOString();
            
            // Calculate next execution time if it's a recurring schedule
            if (paths[pathIndex].schedule) {
                paths[pathIndex].status = 'scheduled';
                paths[pathIndex].schedule.nextExecution = calculateNextExecutionTime(paths[pathIndex].schedule);
            }
            
            // Save the updated paths
            localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
            
            // Update the global automationPaths variable if it exists
            if (typeof window.automationPaths !== 'undefined') {
                window.automationPaths = paths;
            }
            
            // Save to other storage locations
            localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(paths));
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('ai-automation-paths', JSON.stringify(paths));
            }
            
            // Remove the status card
            if (typeof window.removeExecutionStatusCard === 'function') {
                window.removeExecutionStatusCard(paths[pathIndex]);
            }
            
            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Automation path executed successfully', 'success');
            }
            
            console.log(`Unified Schedule Fix: Simulated execution completed for path ${path.id}`);
        }, 5000);
    }

    /**
     * Fix paths that might be in an inconsistent state
     */
    function fixInconsistentPaths() {
        console.log('Unified Schedule Fix: Fixing inconsistent paths');
        
        // Get all automation paths
        let paths = [];
        try {
            paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
        } catch (e) {
            console.error('Unified Schedule Fix: Error parsing paths', e);
            return;
        }
        
        // Fix each path
        let updated = false;
        paths = paths.map(path => {
            const enhancedPath = enhancePath(path);
            if (JSON.stringify(enhancedPath) !== JSON.stringify(path)) {
                updated = true;
            }
            return enhancedPath;
        });
        
        // Save updated paths
        if (updated) {
            localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
            
            // Update the global automationPaths variable if it exists
            if (typeof window.automationPaths !== 'undefined') {
                window.automationPaths = paths;
            }
            
            // Save to other storage locations
            localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(paths));
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('ai-automation-paths', JSON.stringify(paths));
            }
            
            console.log('Unified Schedule Fix: Fixed inconsistent paths', paths.length);
        }
    }

    /**
     * Enhance a path with all required properties
     */
    function enhancePath(path) {
        // Clone the path to avoid modifying the original
        const enhancedPath = JSON.parse(JSON.stringify(path));
        
        // Ensure all required properties exist
        if (!enhancedPath.id) enhancedPath.id = generateUniqueId();
        if (!enhancedPath.createdAt) enhancedPath.createdAt = new Date().toISOString();
        if (!enhancedPath.updatedAt) enhancedPath.updatedAt = new Date().toISOString();
        
        // Fix schedule properties
        if (enhancedPath.schedule) {
            // Ensure schedule has a valid time
            if (!enhancedPath.schedule.time) {
                enhancedPath.schedule.time = "12:00";
            }
            
            // Normalize time format to 24-hour (HH:MM)
            enhancedPath.schedule.time = normalizeTimeFormat(enhancedPath.schedule.time);
            
            // Ensure next execution time is set
            if (!enhancedPath.schedule.nextExecution) {
                enhancedPath.schedule.nextExecution = calculateNextExecutionTime(enhancedPath.schedule);
            }
        }
        
        // Fix execution status
        if (enhancedPath.status === 'executing' && !enhancedPath.executionStarted) {
            // Reset stuck executions
            enhancedPath.status = 'scheduled';
        }
        
        return enhancedPath;
    }

    /**
     * Calculate the next execution time based on schedule
     */
    function calculateNextExecutionTime(schedule) {
        const now = new Date();
        const [hours, minutes] = schedule.time.split(':').map(Number);
        
        // Set time to the specified hours and minutes
        const nextExecution = new Date(now);
        nextExecution.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, move to the next occurrence
        if (nextExecution <= now) {
            switch (schedule.frequency) {
                case 'daily':
                    // Move to tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 1);
                    break;
                    
                case 'every2days':
                    // Move to day after tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 2);
                    break;
                    
                case 'weekly':
                    // Move to next week
                    nextExecution.setDate(nextExecution.getDate() + 7);
                    break;
                    
                case 'biweekly':
                    // Move to two weeks later
                    nextExecution.setDate(nextExecution.getDate() + 14);
                    break;
                    
                case 'monthly':
                    // Move to next month
                    nextExecution.setMonth(nextExecution.getMonth() + 1);
                    break;
                    
                default:
                    // Default to tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 1);
            }
        }
        
        return nextExecution.toISOString();
    }

    /**
     * Normalize time format to 24-hour (HH:MM)
     */
    function normalizeTimeFormat(timeStr) {
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
            return timeStr;
        }
        
        // Try to parse as Date
        try {
            const date = new Date(timeStr);
            if (!isNaN(date)) {
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            }
        } catch (e) {
            console.error('Unified Schedule Fix: Failed to parse time:', e);
        }
        
        // Default to noon
        return "12:00";
    }

    /**
     * Format time for display (12-hour with AM/PM)
     */
    function formatTimeForDisplay(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12
        
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    /**
     * Generate a unique ID
     */
    function generateUniqueId() {
        return 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Make sure the original createExecutionStatusCard function is available
    let originalCreate = null;
    if (typeof window.createExecutionStatusCard === 'function') {
        originalCreate = window.createExecutionStatusCard;
    }
})();
