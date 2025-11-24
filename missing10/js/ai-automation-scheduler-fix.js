/**
 * AI Automation Scheduler Fix
 * This script fixes the AI automation scheduling issues by properly handling path IDs
 * and ensuring that generated posts are properly processed without affecting other functionalities.
 */

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Automation Scheduler Fix: Initializing...');
    
    // Apply fixes after a delay to ensure all other scripts are loaded
    setTimeout(applySchedulerFixes, 1000);
    
    // Also apply fixes after a longer delay to catch any late initializations
    setTimeout(applySchedulerFixes, 3000);
});

/**
 * Apply all scheduler fixes
 */
function applySchedulerFixes() {
    console.log('AI Automation Scheduler Fix: Applying fixes...');
    
    // Only apply if we haven't already applied
    if (window.schedulerFixesApplied) {
        console.log('AI Automation Scheduler Fix: Fixes already applied, skipping');
        return;
    }
    
    // Fix the path ID generation and handling
    fixPathIdHandling();
    
    // Fix the executeAutomationPath function
    fixExecuteAutomationPath();
    
    // Fix calculation of next run time
    fixCalculateNextRun();
    
    // Fix execution status cards
    fixExecutionStatusCards();
    
    // Fix schedule function
    fixScheduleFunction();
    
    // Mark as applied
    window.schedulerFixesApplied = true;
    
    console.log('AI Automation Scheduler Fix: All fixes applied');
}

/**
 * Fix path ID generation and handling
 */
function fixPathIdHandling() {
    console.log('AI Automation Scheduler Fix: Fixing path ID handling...');
    
    // Ensure all paths have proper IDs
    const fixPathIds = function() {
        try {
            // Get current paths
            let paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
            let modified = false;
            
            // Ensure each path has an ID
            paths.forEach(path => {
                if (!path.id) {
                    path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    modified = true;
                }
            });
            
            // Save if modified
            if (modified) {
                localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
                console.log('AI Automation Scheduler Fix: Updated paths with proper IDs');
            }
        } catch (error) {
            console.error('AI Automation Scheduler Fix: Error fixing path IDs', error);
        }
    };
    
    // Run now and after delay
    fixPathIds();
    setTimeout(fixPathIds, 2000);
}

/**
 * Fix the executeAutomationPath function
 */
function fixExecuteAutomationPath() {
    console.log('AI Automation Scheduler Fix: Fixing executeAutomationPath function...');
    
    // Save the original function if it exists
    if (typeof window.executeAutomationPath === 'function') {
        const originalExecute = window.executeAutomationPath;
        
        // Replace with fixed version
        window.executeAutomationPath = function(path, index) {
            console.log('AI Automation Scheduler Fix: Executing fixed automation path', path?.name);
            
            // Ensure path has an ID
            if (!path.id) {
                path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log('AI Automation Scheduler Fix: Added missing ID to path', path.id);
            }
            
            try {
                // Update last run time
                path.lastRun = new Date().toISOString();
                
                // Save to storage to persist the updated lastRun time
                if (typeof window.saveAutomationPathsToStorage === 'function') {
                    window.saveAutomationPathsToStorage();
                } else {
                    // Backup implementation if the original function is missing
                    try {
                        const paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                        const pathIndex = paths.findIndex(p => p.id === path.id);
                        if (pathIndex !== -1) {
                            paths[pathIndex] = path;
                            localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
                        }
                    } catch (storageError) {
                        console.error('AI Automation Scheduler Fix: Error saving paths', storageError);
                    }
                }
                
                // Mark path as in progress
                if (typeof window.markPathInProgress === 'function') {
                    window.markPathInProgress(path);
                } else {
                    // Backup implementation
                    try {
                        const inProgress = JSON.parse(localStorage.getItem('aiAutomationInProgress') || '[]');
                        if (!inProgress.includes(path.id)) {
                            inProgress.push(path.id);
                            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
                        }
                    } catch (progressError) {
                        console.error('AI Automation Scheduler Fix: Error marking path in progress', progressError);
                    }
                }
                
                // Create status card
                if (typeof window.createExecutionStatusCard === 'function') {
                    window.createExecutionStatusCard(path);
                }
                
                // Call the original function
                return originalExecute(path, index);
            } catch (error) {
                console.error('AI Automation Scheduler Fix: Error in executeAutomationPath', error);
                
                // Mark path as completed even if there was an error
                if (typeof window.markPathCompleted === 'function') {
                    window.markPathCompleted(path);
                }
                
                // Remove status card
                if (typeof window.removeExecutionStatusCard === 'function') {
                    window.removeExecutionStatusCard(path);
                }
                
                // Schedule next run despite the error
                if (typeof window.scheduleAutomationPath === 'function') {
                    setTimeout(() => {
                        window.scheduleAutomationPath(path, index);
                    }, 1000);
                }
                
                throw error; // Re-throw to maintain error handling chain
            }
        };
    }
}

/**
 * Fix calculation of next run time
 */
function fixCalculateNextRun() {
    console.log('AI Automation Scheduler Fix: Fixing calculateNextRun function...');
    
    // Only replace if the original function exists
    if (typeof window.calculateNextRun === 'function') {
        const originalCalculateNextRun = window.calculateNextRun;
        
        // Replace with fixed version
        window.calculateNextRun = function(path) {
            if (!path || !path.active) {
                return null;
            }
            
            try {
                // Calculate the next run time
                const now = new Date();
                const schedule = path.schedule;
                let nextRun = new Date();
                
                // Handle time calculation
                if (schedule && schedule.time) {
                    // Parse the time string exactly as entered without rounding
                    const timeComponents = schedule.time.split(':');
                    const hours = parseInt(timeComponents[0], 10);
                    const minutes = parseInt(timeComponents[1], 10);
                    
                    // Set the exact time
                    nextRun.setHours(hours, minutes, 0, 0);
                } else {
                    // Default to midnight if no time specified
                    nextRun.setHours(0, 0, 0, 0);
                }
                
                // Adjust based on schedule type
                if (schedule.type === 'daily') {
                    // If today's time has passed, schedule for tomorrow
                    if (nextRun < now) {
                        nextRun.setDate(nextRun.getDate() + 1);
                    }
                } else if (schedule.type === 'weekly') {
                    // Get the day of week (0 = Sunday, 6 = Saturday)
                    const targetDay = schedule.day;
                    const currentDay = nextRun.getDay();
                    
                    // Calculate days to add
                    let daysToAdd = targetDay - currentDay;
                    if (daysToAdd < 0 || (daysToAdd === 0 && nextRun < now)) {
                        daysToAdd += 7;
                    }
                    
                    nextRun.setDate(nextRun.getDate() + daysToAdd);
                } else if (schedule.type === 'monthly') {
                    // Get the target day of month
                    const targetDay = schedule.day;
                    const currentDay = nextRun.getDate();
                    const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
                    
                    // Adjust the day, accounting for months with fewer days
                    const actualTargetDay = Math.min(targetDay, lastDayOfMonth);
                    
                    if (currentDay < actualTargetDay || (currentDay === actualTargetDay && nextRun >= now)) {
                        // Still time this month
                        nextRun.setDate(actualTargetDay);
                    } else {
                        // Move to next month
                        nextRun.setMonth(nextRun.getMonth() + 1);
                        const nextMonthLastDay = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
                        nextRun.setDate(Math.min(targetDay, nextMonthLastDay));
                    }
                }
                
                return nextRun;
            } catch (error) {
                console.error('AI Automation Scheduler Fix: Error calculating next run', error);
                // Fallback to original function
                return originalCalculateNextRun(path);
            }
        };
    }
}

/**
 * Fix execution status cards
 */
function fixExecutionStatusCards() {
    console.log('AI Automation Scheduler Fix: Fixing execution status cards...');
    
    // Fix the createExecutionStatusCard function if it exists
    if (typeof window.createExecutionStatusCard === 'function') {
        const originalCreateStatusCard = window.createExecutionStatusCard;
        
        window.createExecutionStatusCard = function(path) {
            try {
                // Ensure the path has an ID
                if (!path.id) {
                    path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }
                
                // Check if the status container exists
                let statusContainer = document.getElementById('execution-status-container');
                if (!statusContainer) {
                    // Create the container if it doesn't exist
                    statusContainer = document.createElement('div');
                    statusContainer.id = 'execution-status-container';
                    statusContainer.className = 'execution-status-container';
                    document.body.appendChild(statusContainer);
                }
                
                // Check if a card for this path already exists
                const existingCard = document.getElementById(`execution-status-${path.id}`);
                if (existingCard) {
                    console.log('AI Automation Scheduler Fix: Status card already exists for path', path.name);
                    return;
                }
                
                // Call the original function
                return originalCreateStatusCard(path);
            } catch (error) {
                console.error('AI Automation Scheduler Fix: Error creating execution status card', error);
                // If there's an error, try a basic implementation
                try {
                    // Create a basic status card
                    const statusContainer = document.getElementById('execution-status-container') || document.createElement('div');
                    if (!statusContainer.id) {
                        statusContainer.id = 'execution-status-container';
                        statusContainer.className = 'execution-status-container';
                        document.body.appendChild(statusContainer);
                    }
                    
                    const card = document.createElement('div');
                    card.id = `execution-status-${path.id}`;
                    card.className = 'execution-status-card';
                    card.innerHTML = `
                        <div class="execution-status-header">
                            <h3>Generating: ${path.name}</h3>
                        </div>
                        <div class="execution-status-body">
                            <p>Content type: ${path.contentType}</p>
                            <p>Topics: ${path.topics}</p>
                            <div class="execution-status-progress">
                                <div class="execution-status-bar"></div>
                            </div>
                        </div>
                    `;
                    
                    statusContainer.appendChild(card);
                } catch (fallbackError) {
                    console.error('AI Automation Scheduler Fix: Error creating basic status card', fallbackError);
                }
            }
        };
    }
    
    // Fix the removeExecutionStatusCard function if it exists
    if (typeof window.removeExecutionStatusCard === 'function') {
        const originalRemoveStatusCard = window.removeExecutionStatusCard;
        
        window.removeExecutionStatusCard = function(path) {
            try {
                if (!path || !path.id) {
                    console.error('AI Automation Scheduler Fix: Cannot remove status card - missing path or path ID');
                    return;
                }
                
                // Call the original function
                return originalRemoveStatusCard(path);
            } catch (error) {
                console.error('AI Automation Scheduler Fix: Error removing execution status card', error);
                // If there's an error, try a basic implementation
                try {
                    const card = document.getElementById(`execution-status-${path.id}`);
                    if (card) {
                        card.remove();
                    }
                } catch (fallbackError) {
                    console.error('AI Automation Scheduler Fix: Error in basic card removal', fallbackError);
                }
            }
        };
    }
}

/**
 * Fix the schedule function
 */
function fixScheduleFunction() {
    console.log('AI Automation Scheduler Fix: Fixing scheduleAutomationPath function...');
    
    // Only replace if the original function exists
    if (typeof window.scheduleAutomationPath === 'function') {
        const originalScheduleFunction = window.scheduleAutomationPath;
        
        // Replace with fixed version
        window.scheduleAutomationPath = function(path, index) {
            console.log('AI Automation Scheduler Fix: Scheduling path with fixed function', path?.name);
            
            try {
                // Ensure the path has an ID
                if (!path.id) {
                    path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    // Save updated path with ID
                    if (typeof window.saveAutomationPathsToStorage === 'function') {
                        window.saveAutomationPathsToStorage();
                    }
                }
                
                // Call the original function
                return originalScheduleFunction(path, index);
            } catch (error) {
                console.error('AI Automation Scheduler Fix: Error in scheduleAutomationPath', error);
                
                // Basic implementation if the original function fails
                try {
                    // This is a minimal implementation to ensure basic scheduling still works
                    if (!path || !path.active) {
                        console.log('Path is not active, not scheduling');
                        return;
                    }
                    
                    // Clear any existing scheduled task
                    if (window.scheduledTasks && window.scheduledTasks[path.id]) {
                        clearTimeout(window.scheduledTasks[path.id]);
                        delete window.scheduledTasks[path.id];
                    }
                    
                    // Initialize scheduledTasks if it doesn't exist
                    if (!window.scheduledTasks) {
                        window.scheduledTasks = {};
                    }
                    
                    // Calculate the next run time
                    const nextRun = typeof window.calculateNextRun === 'function' 
                        ? window.calculateNextRun(path)
                        : new Date(Date.now() + 86400000); // Default to 24 hours
                    
                    if (!nextRun) {
                        console.log('No next run time calculated, not scheduling');
                        return;
                    }
                    
                    // Calculate milliseconds until next run
                    const now = new Date();
                    const millisToNextRun = nextRun.getTime() - now.getTime();
                    
                    // Schedule the task
                    window.scheduledTasks[path.id] = setTimeout(() => {
                        if (typeof window.executeAutomationPath === 'function') {
                            window.executeAutomationPath(path, index);
                        }
                    }, millisToNextRun);
                    
                    console.log(`Scheduled path "${path.name}" to run at ${nextRun} (in ${Math.round(millisToNextRun / 60000)} minutes)`);
                } catch (fallbackError) {
                    console.error('AI Automation Scheduler Fix: Error in basic scheduling fallback', fallbackError);
                }
            }
        };
    }
}

// Make fix functions available globally
window.aiAutomationSchedulerFix = {
    applySchedulerFixes,
    fixPathIdHandling,
    fixExecuteAutomationPath,
    fixCalculateNextRun,
    fixExecutionStatusCards,
    fixScheduleFunction
};
