
/**
 * AI Automation Comprehensive Fix
 * Fixes all issues with automation paths:
 * 1. Schedule path persistence on refresh
 * 2. Automatic popup closing after save
 * 3. Correct time display format
 * 4. JavaScript initialization errors
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Automation Comprehensive Fix: Initializing...');
    
    // Apply fixes with delay to ensure other scripts load
    setTimeout(() => {
        initializeComprehensiveFix();
    }, 1000);
});

let isInitialized = false;

function initializeComprehensiveFix() {
    if (isInitialized) return;
    isInitialized = true;
    
    console.log('AI Automation Comprehensive Fix: Starting comprehensive fixes...');
    
    // Fix 1: Schedule path persistence
    fixSchedulePathPersistence();
    
    // Fix 2: Automatic popup closing
    fixAutomaticPopupClosing();
    
    // Fix 3: Time display format
    fixTimeDisplayFormat();
    
    // Fix 4: Initialize missing functions
    initializeMissingFunctions();
    
    // Fix 5: Restore saved paths on page load
    restoreSavedPaths();
    
    console.log('AI Automation Comprehensive Fix: All fixes applied successfully');
}

/**
 * Fix 1: Schedule path persistence
 */
function fixSchedulePathPersistence() {
    console.log('AI Automation Comprehensive Fix: Fixing schedule path persistence...');
    
    // Override saveAutomationPathsToStorage to ensure proper saving
    window.saveAutomationPathsToStorage = function() {
        try {
            const automationPaths = window.automationPaths || [];
            
            // Save to multiple storage locations for redundancy
            localStorage.setItem('aiAutomationPaths', JSON.stringify(automationPaths));
            localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(automationPaths));
            
            // Also save with StorageManager if available
            if (window.StorageManager && typeof window.StorageManager.set === 'function') {
                window.StorageManager.set('ai-automation-paths', JSON.stringify(automationPaths));
            }
            
            console.log('AI Automation Comprehensive Fix: Saved automation paths:', automationPaths.length);
            return true;
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error saving automation paths:', error);
            return false;
        }
    };
    
    // Override loadAutomationPathsFromStorage to load from multiple sources
    window.loadAutomationPathsFromStorage = function() {
        try {
            let automationPaths = [];
            
            // Try loading from different storage locations
            const sources = [
                localStorage.getItem('aiAutomationPaths'),
                localStorage.getItem('fooodis-ai-automation-paths'),
                window.StorageManager && typeof window.StorageManager.get === 'function' ? 
                    window.StorageManager.get('ai-automation-paths') : null
            ];
            
            // Use the first non-empty source
            for (const source of sources) {
                if (source) {
                    try {
                        const parsed = JSON.parse(source);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            automationPaths = parsed;
                            break;
                        }
                    } catch (parseError) {
                        console.warn('AI Automation Comprehensive Fix: Failed to parse automation paths from source');
                    }
                }
            }
            
            window.automationPaths = automationPaths;
            console.log('AI Automation Comprehensive Fix: Loaded automation paths:', automationPaths.length);
            return automationPaths;
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error loading automation paths:', error);
            window.automationPaths = [];
            return [];
        }
    };
}

/**
 * Fix 2: Automatic popup closing
 */
function fixAutomaticPopupClosing() {
    console.log('AI Automation Comprehensive Fix: Fixing automatic popup closing...');
    
    // Override the save button click handler
    document.addEventListener('click', function(event) {
        if (event.target.matches('.automation-path-form .save-btn')) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('AI Automation Comprehensive Fix: Save button clicked');
            
            // Get the form data
            const formData = getAutomationFormData();
            if (!formData) {
                console.error('AI Automation Comprehensive Fix: Failed to get form data');
                return;
            }
            
            // Save the automation path
            const success = saveAutomationPath(formData);
            if (success) {
                // Close the popup automatically
                const modal = document.querySelector('.automation-path-modal');
                if (modal) {
                    modal.style.display = 'none';
                    console.log('AI Automation Comprehensive Fix: Popup closed automatically');
                }
                
                // Refresh the automation paths display
                if (typeof window.renderAutomationPaths === 'function') {
                    window.renderAutomationPaths();
                }
                
                // Show success message
                showSuccessMessage('Automation path saved successfully!');
            }
        }
    });
    
    // Helper function to get form data
    function getAutomationFormData() {
        try {
            const modal = document.querySelector('.automation-path-modal');
            if (!modal) return null;
            
            const pathName = modal.querySelector('#path-name')?.value;
            const contentType = modal.querySelector('#content-type')?.value;
            const assistantType = modal.querySelector('#assistant-type')?.value;
            const category = modal.querySelector('#category')?.value;
            const topics = modal.querySelector('#topics')?.value;
            const scheduleType = modal.querySelector('.schedule-option.selected')?.dataset.schedule;
            const scheduleTime = modal.querySelector('#schedule-time')?.value;
            
            if (!pathName || !contentType || !scheduleType || !scheduleTime) {
                alert('Please fill in all required fields');
                return null;
            }
            
            return {
                id: Date.now().toString(),
                name: pathName,
                contentType: contentType,
                assistantType: assistantType,
                category: category,
                topics: topics,
                schedule: {
                    type: scheduleType,
                    time: scheduleTime
                },
                active: true,
                lastRun: null,
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error getting form data:', error);
            return null;
        }
    }
    
    // Helper function to save automation path
    function saveAutomationPath(pathData) {
        try {
            if (!window.automationPaths) {
                window.automationPaths = [];
            }
            
            // Add the new path
            window.automationPaths.push(pathData);
            
            // Save to storage
            const saved = window.saveAutomationPathsToStorage();
            if (saved) {
                console.log('AI Automation Comprehensive Fix: Automation path saved:', pathData.name);
                return true;
            }
            return false;
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error saving automation path:', error);
            return false;
        }
    }
    
    // Helper function to show success message
    function showSuccessMessage(message) {
        const toast = document.querySelector('#toastNotification');
        if (toast) {
            const messageEl = toast.querySelector('#toastMessage');
            if (messageEl) {
                messageEl.textContent = message;
            }
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
}

/**
 * Fix 3: Time display format
 */
function fixTimeDisplayFormat() {
    console.log('AI Automation Comprehensive Fix: Fixing time display format...');
    
    // Override the time display function
    window.formatScheduleTime = function(schedule) {
        if (!schedule || !schedule.time) return 'Not scheduled';
        
        try {
            // Ensure the time is in HH:MM format
            const time = schedule.time;
            const timePattern = /^(\d{1,2}):(\d{2})$/;
            const match = time.match(timePattern);
            
            if (match) {
                const hours = match[1].padStart(2, '0');
                const minutes = match[2];
                return `${hours}:${minutes}`;
            }
            
            return time; // Return as-is if it doesn't match expected pattern
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error formatting time:', error);
            return schedule.time || 'Invalid time';
        }
    };
    
    // Override the next run calculation function
    window.calculateNextRun = function(path) {
        if (!path || !path.active || !path.schedule) return 'Not scheduled';
        
        try {
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            const scheduleTime = path.schedule.time;
            if (!scheduleTime) return 'No time set';
            
            const [hours, minutes] = scheduleTime.split(':').map(Number);
            const nextRun = new Date(today);
            nextRun.setHours(hours, minutes, 0, 0);
            
            // If the time has passed today, schedule for tomorrow
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            
            // Format the display
            const isToday = nextRun.toDateString() === now.toDateString();
            const isTomorrow = nextRun.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
            
            let dateStr = 'Next run: ';
            if (isToday) {
                dateStr += 'Today';
            } else if (isTomorrow) {
                dateStr += 'Tomorrow';
            } else {
                dateStr += nextRun.toLocaleDateString();
            }
            
            // Always show full time format
            const timeStr = scheduleTime; // Use the original time format
            return `${dateStr}, ${timeStr}`;
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error calculating next run:', error);
            return 'Error calculating time';
        }
    };
}

/**
 * Fix 4: Initialize missing functions
 */
function initializeMissingFunctions() {
    console.log('AI Automation Comprehensive Fix: Initializing missing functions...');
    
    // Define syncWithAdvancedBannerSettings if missing
    if (typeof window.syncWithAdvancedBannerSettings === 'undefined') {
        window.syncWithAdvancedBannerSettings = function() {
            console.log('AI Automation Comprehensive Fix: syncWithAdvancedBannerSettings placeholder');
            return true;
        };
    }
    
    // Initialize automationPaths if not exists
    if (!window.automationPaths) {
        window.automationPaths = [];
    }
    
    // Initialize renderAutomationPaths if missing
    if (typeof window.renderAutomationPaths === 'undefined') {
        window.renderAutomationPaths = function() {
            console.log('AI Automation Comprehensive Fix: Rendering automation paths...');
            
            const container = document.querySelector('.automation-paths-container');
            if (!container) {
                console.error('AI Automation Comprehensive Fix: Automation paths container not found');
                return;
            }
            
            // Clear existing paths (except the add button)
            const existingPaths = container.querySelectorAll('.automation-path');
            existingPaths.forEach(path => path.remove());
            
            // Render each automation path
            const automationPaths = window.automationPaths || [];
            automationPaths.forEach(path => {
                const pathElement = createAutomationPathElement(path);
                container.insertBefore(pathElement, container.lastElementChild);
            });
        };
    }
    
    // Helper function to create automation path element
    function createAutomationPathElement(path) {
        const pathDiv = document.createElement('div');
        pathDiv.className = 'automation-path';
        pathDiv.dataset.pathId = path.id;
        
        const nextRun = window.calculateNextRun(path);
        
        pathDiv.innerHTML = `
            <div class="automation-path-header">
                <h3>${path.name}</h3>
                <div class="automation-path-status ${path.active ? 'active' : 'inactive'}">
                    ${path.active ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div class="automation-path-details">
                <p><strong>Content Type:</strong> ${path.contentType}</p>
                <p><strong>Category:</strong> ${path.category}</p>
                <p><strong>Schedule:</strong> ${path.schedule?.type || 'Not set'}</p>
                <p class="next-run"><strong>${nextRun}</strong></p>
            </div>
            <div class="automation-path-actions">
                <button class="btn btn-small edit-path" data-path-id="${path.id}">Edit</button>
                <button class="btn btn-small btn-danger delete-path" data-path-id="${path.id}">Delete</button>
            </div>
        `;
        
        return pathDiv;
    }
}

/**
 * Fix 5: Restore saved paths on page load
 */
function restoreSavedPaths() {
    console.log('AI Automation Comprehensive Fix: Restoring saved paths...');
    
    // Load paths from storage
    const automationPaths = window.loadAutomationPathsFromStorage();
    
    // Render the paths
    if (typeof window.renderAutomationPaths === 'function') {
        window.renderAutomationPaths();
    }
    
    console.log('AI Automation Comprehensive Fix: Restored', automationPaths.length, 'automation paths');
}

// Add event listeners for delete and edit buttons
document.addEventListener('click', function(event) {
    if (event.target.matches('.delete-path')) {
        const pathId = event.target.dataset.pathId;
        if (confirm('Are you sure you want to delete this automation path?')) {
            deleteAutomationPath(pathId);
        }
    }
    
    if (event.target.matches('.edit-path')) {
        const pathId = event.target.dataset.pathId;
        editAutomationPath(pathId);
    }
});

function deleteAutomationPath(pathId) {
    try {
        if (!window.automationPaths) return;
        
        const index = window.automationPaths.findIndex(path => path.id === pathId);
        if (index !== -1) {
            window.automationPaths.splice(index, 1);
            window.saveAutomationPathsToStorage();
            window.renderAutomationPaths();
            console.log('AI Automation Comprehensive Fix: Deleted automation path:', pathId);
        }
    } catch (error) {
        console.error('AI Automation Comprehensive Fix: Error deleting automation path:', error);
    }
}

function editAutomationPath(pathId) {
    try {
        if (!window.automationPaths) return;
        
        const path = window.automationPaths.find(p => p.id === pathId);
        if (path) {
            // Open the modal and populate with existing data
            const modal = document.querySelector('.automation-path-modal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Populate form fields
                const pathNameInput = modal.querySelector('#path-name');
                const contentTypeSelect = modal.querySelector('#content-type');
                const categorySelect = modal.querySelector('#category');
                const topicsInput = modal.querySelector('#topics');
                const scheduleTimeInput = modal.querySelector('#schedule-time');
                
                if (pathNameInput) pathNameInput.value = path.name || '';
                if (contentTypeSelect) contentTypeSelect.value = path.contentType || '';
                if (categorySelect) categorySelect.value = path.category || '';
                if (topicsInput) topicsInput.value = path.topics || '';
                if (scheduleTimeInput) scheduleTimeInput.value = path.schedule?.time || '';
                
                // Set schedule type
                const scheduleOptions = modal.querySelectorAll('.schedule-option');
                scheduleOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.schedule === path.schedule?.type) {
                        option.classList.add('selected');
                    }
                });
                
                console.log('AI Automation Comprehensive Fix: Opened edit modal for path:', path.name);
            }
        }
    } catch (error) {
        console.error('AI Automation Comprehensive Fix: Error editing automation path:', error);
    }
}

// Export functions for global access
window.aiAutomationComprehensiveFix = {
    initializeComprehensiveFix,
    fixSchedulePathPersistence,
    fixAutomaticPopupClosing,
    fixTimeDisplayFormat,
    initializeMissingFunctions,
    restoreSavedPaths
};

console.log('AI Automation Comprehensive Fix: Script loaded and ready');
