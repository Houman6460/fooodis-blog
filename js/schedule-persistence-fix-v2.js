/**
 * Fooodis Blog System - Schedule Persistence Fix V2
 * This script fixes issues with scheduled posts, JSON parsing errors, and time display inconsistencies
 */

(function() {
    // Run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Schedule Persistence Fix V2: Initializing...');
        
        // Fix will run after a short delay to ensure all other scripts have loaded
        setTimeout(initSchedulePersistenceFix, 1000);
    });
    
    /**
     * Initialize all schedule persistence fixes
     */
    function initSchedulePersistenceFix() {
        fixScheduledPostsStorage();
        fixTimeDisplayFormat();
        enhanceScheduleTracking();
        setupPeriodicCheck();
        
        // Listen for new automation paths being created
        document.addEventListener('automationPathCreated', function(e) {
            console.log('Schedule Persistence Fix V2: New automation path detected', e.detail);
            enhanceAutomationPath(e.detail);
        });
    }
    
    /**
     * Fix the storage of scheduled posts to ensure persistence
     */
    function fixScheduledPostsStorage() {
        console.log('Schedule Persistence Fix V2: Fixing scheduled posts storage...');
        
        // Get automation paths from all possible storage locations
        let directPaths = [];
        let prefixedPaths = [];
        let managerPaths = [];
        
        try {
            // Parse direct paths (with error handling)
            const directPathsStr = localStorage.getItem('aiAutomationPaths');
            if (directPathsStr) {
                try {
                    directPaths = JSON.parse(directPathsStr);
                } catch (e) {
                    console.error('Schedule Persistence Fix V2: Error parsing aiAutomationPaths', e);
                }
            }
            
            // Parse prefixed paths (with error handling)
            const prefixedPathsStr = localStorage.getItem('fooodis-ai-automation-paths');
            if (prefixedPathsStr) {
                try {
                    prefixedPaths = JSON.parse(prefixedPathsStr);
                } catch (e) {
                    console.error('Schedule Persistence Fix V2: Error parsing fooodis-ai-automation-paths', e);
                }
            }
            
            // Get paths from StorageManager if available
            if (window.StorageManager && typeof window.StorageManager.get === 'function') {
                const managerResult = window.StorageManager.get('ai-automation-paths');
                
                // Handle the case where StorageManager returns an object instead of a string
                if (managerResult) {
                    if (Array.isArray(managerResult)) {
                        // It's already an array, use it directly
                        managerPaths = managerResult;
                    } else if (typeof managerResult === 'string') {
                        // It's a string, try to parse it
                        try {
                            managerPaths = JSON.parse(managerResult);
                        } catch (e) {
                            console.error('Schedule Persistence Fix V2: Error parsing StorageManager result', e);
                        }
                    } else {
                        console.warn('Schedule Persistence Fix V2: StorageManager returned unexpected type:', typeof managerResult);
                    }
                }
            }
        } catch (error) {
            console.error('Schedule Persistence Fix V2: Error retrieving automation paths', error);
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
                uniquePaths.push(path);
            }
        });
        
        // Update the automationPaths array ONLY if the current array is empty
        // Don't overwrite API-loaded paths with localStorage data
        if (window.automationPaths && window.automationPaths.length === 0 && uniquePaths.length > 0) {
            window.automationPaths = uniquePaths;
            console.log('Schedule Persistence Fix V2: Updated empty global automationPaths array with', uniquePaths.length, 'paths');
        } else if (window.automationPaths && window.automationPaths.length > 0) {
            console.log('Schedule Persistence Fix V2: Keeping existing', window.automationPaths.length, 'API-loaded paths, not overwriting');
        }
        
        // Save the consolidated paths to all storage locations
        try {
            localStorage.setItem('aiAutomationPaths', JSON.stringify(uniquePaths));
            localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(uniquePaths));
            
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('ai-automation-paths', uniquePaths);
            }
            
            console.log('Schedule Persistence Fix V2: Saved consolidated paths to storage');
        } catch (error) {
            console.error('Schedule Persistence Fix V2: Error saving paths', error);
        }
    }
    
    /**
     * Fix the time display format to ensure consistency
     */
    function fixTimeDisplayFormat() {
        console.log('Schedule Persistence Fix V2: Fixing time display format...');
        
        // Find all time displays on the page (using valid selector syntax)
        const timeElements = document.querySelectorAll('.next-run, .detail-value');
        
        // Update the format of each time display
        timeElements.forEach(element => {
            const timeText = element.textContent;
            if (timeText.includes(':')) {
                // Parse the time and reformat it
                const normalizedTime = normalizeTimeFormat(timeText);
                element.textContent = normalizedTime;
            }
        });
    }
    
    /**
     * Normalize the time format for consistent display
     * @param {string} timeText - The time text to normalize
     * @returns {string} - The normalized time text
     */
    function normalizeTimeFormat(timeText) {
        // Extract the time portion from the text
        const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return timeText;
        
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        
        // Format the time consistently
        return timeText.replace(/\d{1,2}:\d{2}/, `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    /**
     * Enhance schedule tracking to prevent disappearing cards
     */
    function enhanceScheduleTracking() {
        console.log('Schedule Persistence Fix V2: Enhancing schedule tracking...');
        
        // Patch the global automation scheduling functions if they exist
        if (window.initScheduler) {
            const originalInitScheduler = window.initScheduler;
            window.initScheduler = function() {
                console.log('Schedule Persistence Fix V2: Running enhanced scheduler initialization');
                
                // Run the original function
                const result = originalInitScheduler.apply(this, arguments);
                
                // Apply our enhancements
                fixScheduledPostsStorage();
                
                return result;
            };
        }
        
        // Patch the schedule automation path function
        if (window.scheduleAutomationPath) {
            const originalScheduleFunction = window.scheduleAutomationPath;
            window.scheduleAutomationPath = function(path) {
                console.log('Schedule Persistence Fix V2: Enhanced scheduling for path', path);
                
                // Ensure the path has an ID
                if (!path.id) {
                    path.id = generateUniqueId();
                }
                
                // Call the original function
                const result = originalScheduleFunction.apply(this, arguments);
                
                // Save the updated paths to ensure persistence
                setTimeout(function() {
                    fixScheduledPostsStorage();
                }, 500);
                
                return result;
            };
        }
    }
    
    /**
     * Set up a periodic check to ensure persistence is maintained
     */
    function setupPeriodicCheck() {
        console.log('Schedule Persistence Fix V2: Setting up periodic check');
        
        // Check every 5 minutes
        setInterval(function() {
            fixScheduledPostsStorage();
            fixTimeDisplayFormat();
        }, 5 * 60 * 1000);
    }
    
    /**
     * Enhance an automation path with additional tracking and persistence
     * @param {Object} path - The path to enhance
     */
    function enhanceAutomationPath(path) {
        console.log('Schedule Persistence Fix V2: Enhancing automation path', path);
        
        // Ensure the path has an ID
        if (!path.id) {
            path.id = generateUniqueId();
        }
        
        // Ensure the path has a valid schedule
        if (!path.schedule) {
            path.schedule = {
                type: 'daily',
                time: '14:00'
            };
        }
        
        // Save the updated paths to ensure persistence
        setTimeout(function() {
            fixScheduledPostsStorage();
        }, 500);
    }
    
    /**
     * Generate a unique ID for a path
     * @returns {string} - A unique ID
     */
    function generateUniqueId() {
        return 'path_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
    }
})();
