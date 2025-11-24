
/**
 * AI Automation Final Fix
 * Addresses all reported issues with automation paths
 */

console.log('AI Automation Final Fix: Loading...');

// Global variables to prevent re-initialization
let automationFixInitialized = false;
let automationPaths = [];

// Initialize fix when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (automationFixInitialized) return;
    
    console.log('AI Automation Final Fix: Initializing...');
    
    // Wait for other scripts to load
    setTimeout(() => {
        initializeAutomationFix();
    }, 2000);
});

function initializeAutomationFix() {
    if (automationFixInitialized) return;
    automationFixInitialized = true;
    
    console.log('AI Automation Final Fix: Starting comprehensive fix...');
    
    // Fix 1: Ensure proper storage and loading
    setupStorageSystem();
    
    // Fix 2: Fix popup closing behavior
    setupPopupClosing();
    
    // Fix 3: Fix time display format
    setupTimeFormatFix();
    
    // Fix 4: Fix JavaScript errors
    setupErrorPrevention();
    
    // Fix 5: Load existing paths
    loadAndDisplayAutomationPaths();
    
    console.log('AI Automation Final Fix: All fixes applied');
}

/**
 * Fix 1: Setup robust storage system
 */
function setupStorageSystem() {
    console.log('AI Automation Final Fix: Setting up storage system...');
    
    // Override global storage functions
    window.saveAutomationPathsToStorage = function() {
        try {
            const paths = window.automationPaths || automationPaths || [];
            
            // Save to multiple locations for reliability
            localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
            localStorage.setItem('automation-paths-backup', JSON.stringify(paths));
            
            // Also save with timestamp
            const dataWithTimestamp = {
                paths: paths,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('automation-paths-timestamped', JSON.stringify(dataWithTimestamp));
            
            console.log('AI Automation Final Fix: Saved', paths.length, 'automation paths');
            return true;
        } catch (error) {
            console.error('AI Automation Final Fix: Error saving paths:', error);
            return false;
        }
    };
    
    window.loadAutomationPathsFromStorage = function() {
        try {
            let paths = [];
            
            // Try different storage keys
            const sources = [
                'aiAutomationPaths',
                'automation-paths-backup',
                'automation-paths-timestamped'
            ];
            
            for (const key of sources) {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        
                        // Handle timestamped data
                        if (parsed.paths && Array.isArray(parsed.paths)) {
                            paths = parsed.paths;
                        } else if (Array.isArray(parsed)) {
                            paths = parsed;
                        }
                        
                        if (paths.length > 0) {
                            console.log('AI Automation Final Fix: Loaded', paths.length, 'paths from', key);
                            break;
                        }
                    }
                } catch (e) {
                    console.warn('AI Automation Final Fix: Failed to parse data from', key);
                }
            }
            
            window.automationPaths = paths;
            automationPaths = paths;
            return paths;
        } catch (error) {
            console.error('AI Automation Final Fix: Error loading paths:', error);
            window.automationPaths = [];
            automationPaths = [];
            return [];
        }
    };
}

/**
 * Fix 2: Setup popup closing behavior
 */
function setupPopupClosing() {
    console.log('AI Automation Final Fix: Setting up popup closing...');
    
    // Override save button behavior
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check if it's a save button in the automation modal
        if (target.classList.contains('save-btn') || 
            target.textContent.includes('Save Automation Path')) {
            
            console.log('AI Automation Final Fix: Save button clicked');
            
            // Get the modal
            const modal = document.querySelector('.automation-path-modal');
            if (!modal) return;
            
            // Prevent default behavior
            event.preventDefault();
            event.stopPropagation();
            
            // Get form data
            const formData = extractFormData();
            if (!formData) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Save the automation path
            if (saveAutomationPath(formData)) {
                // Close the modal
                modal.style.display = 'none';
                
                // Clear the form
                clearFormData();
                
                // Refresh the display
                refreshAutomationDisplay();
                
                // Show success message
                showToast('Automation path saved successfully!');
                
                console.log('AI Automation Final Fix: Path saved and modal closed');
            }
        }
    });
}

/**
 * Fix 3: Setup time format fix
 */
function setupTimeFormatFix() {
    console.log('AI Automation Final Fix: Setting up time format fix...');
    
    // Override time formatting function
    window.formatScheduleTime = function(timeString) {
        if (!timeString) return '';
        
        // Ensure HH:MM format
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            if (parts.length >= 2) {
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        }
        
        // If it's just hours (like "14"), add ":00"
        if (/^\d{1,2}$/.test(timeString)) {
            return timeString.padStart(2, '0') + ':00';
        }
        
        return timeString;
    };
    
    // Fix time display in status cards
    function fixTimeDisplays() {
        const timeDisplays = document.querySelectorAll('.next-run, .schedule-time-display, .automation-path-details p');
        
        timeDisplays.forEach(element => {
            const text = element.textContent;
            if (text && text.includes(':')) {
                // Look for time patterns and fix them
                const timePattern = /(\d{1,2}):?(\d{0,2})/g;
                const fixedText = text.replace(timePattern, (match, hours, minutes) => {
                    if (minutes === '') {
                        return hours.padStart(2, '0') + ':00';
                    }
                    return hours.padStart(2, '0') + ':' + minutes.padStart(2, '0');
                });
                
                if (fixedText !== text) {
                    element.textContent = fixedText;
                }
            }
        });
    }
    
    // Run time display fix periodically
    setInterval(fixTimeDisplays, 3000);
    
    // Fix time input handling
    const timeInput = document.querySelector('#schedule-time');
    if (timeInput) {
        timeInput.addEventListener('change', function() {
            this.value = window.formatScheduleTime(this.value);
        });
    }
}

/**
 * Fix 4: Setup error prevention
 */
function setupErrorPrevention() {
    console.log('AI Automation Final Fix: Setting up error prevention...');
    
    // Define missing functions
    if (typeof window.syncWithAdvancedBannerSettings === 'undefined') {
        window.syncWithAdvancedBannerSettings = function() {
            console.log('AI Automation Final Fix: syncWithAdvancedBannerSettings called');
            return true;
        };
    }
    
    // Ensure automation paths array exists
    if (!window.automationPaths) {
        window.automationPaths = [];
    }
    
    // Define renderAutomationPaths if missing
    if (typeof window.renderAutomationPaths === 'undefined') {
        window.renderAutomationPaths = function() {
            refreshAutomationDisplay();
        };
    }
}

/**
 * Helper functions
 */
function extractFormData() {
    try {
        const modal = document.querySelector('.automation-path-modal');
        if (!modal) return null;
        
        const pathName = modal.querySelector('#path-name')?.value;
        const contentType = modal.querySelector('#content-type')?.value;
        const assistantType = modal.querySelector('#assistant-type')?.value;
        const category = modal.querySelector('#category')?.value;
        const topics = modal.querySelector('#topics')?.value;
        const scheduleTime = modal.querySelector('#schedule-time')?.value;
        
        // Get selected schedule type
        const selectedSchedule = modal.querySelector('.schedule-option.selected');
        const scheduleType = selectedSchedule?.dataset.schedule;
        
        if (!pathName || !contentType || !scheduleType || !scheduleTime) {
            console.warn('AI Automation Final Fix: Missing required fields');
            return null;
        }
        
        return {
            id: Date.now().toString(),
            name: pathName,
            contentType: contentType,
            assistantType: assistantType || 'default',
            category: category || 'Uncategorized',
            topics: topics || '',
            schedule: {
                type: scheduleType,
                time: window.formatScheduleTime(scheduleTime)
            },
            active: true,
            lastRun: null,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('AI Automation Final Fix: Error extracting form data:', error);
        return null;
    }
}

function saveAutomationPath(pathData) {
    try {
        // Ensure we have the paths array
        if (!window.automationPaths) {
            window.automationPaths = [];
        }
        
        // Add the new path
        window.automationPaths.push(pathData);
        automationPaths = window.automationPaths;
        
        // Save to storage
        const saved = window.saveAutomationPathsToStorage();
        
        if (saved) {
            console.log('AI Automation Final Fix: Path saved successfully:', pathData.name);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('AI Automation Final Fix: Error saving path:', error);
        return false;
    }
}

function clearFormData() {
    try {
        const modal = document.querySelector('.automation-path-modal');
        if (!modal) return;
        
        // Clear input fields
        const inputs = modal.querySelectorAll('input[type="text"], input[type="time"], textarea, select');
        inputs.forEach(input => {
            if (input.type === 'time') {
                input.value = '14:00';
            } else {
                input.value = '';
            }
        });
        
        // Reset schedule options
        const scheduleOptions = modal.querySelectorAll('.schedule-option');
        scheduleOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select the first option by default
        if (scheduleOptions[0]) {
            scheduleOptions[0].classList.add('selected');
        }
    } catch (error) {
        console.error('AI Automation Final Fix: Error clearing form:', error);
    }
}

function refreshAutomationDisplay() {
    try {
        const container = document.querySelector('.automation-paths-container');
        if (!container) return;
        
        // Clear existing paths (keep the add button)
        const existingPaths = container.querySelectorAll('.automation-path');
        existingPaths.forEach(path => path.remove());
        
        // Load and display paths
        const paths = window.automationPaths || automationPaths || [];
        
        paths.forEach(path => {
            const pathElement = createAutomationPathElement(path);
            container.insertBefore(pathElement, container.lastElementChild);
        });
        
        console.log('AI Automation Final Fix: Displayed', paths.length, 'automation paths');
    } catch (error) {
        console.error('AI Automation Final Fix: Error refreshing display:', error);
    }
}

function createAutomationPathElement(path) {
    const pathDiv = document.createElement('div');
    pathDiv.className = 'automation-path';
    pathDiv.dataset.pathId = path.id;
    
    const nextRun = calculateNextRun(path);
    const formattedTime = window.formatScheduleTime(path.schedule?.time);
    
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
            <p><strong>Schedule:</strong> ${path.schedule?.type || 'Not set'} at ${formattedTime}</p>
            <p class="next-run"><strong>${nextRun}</strong></p>
        </div>
        <div class="automation-path-actions">
            <button class="btn btn-small edit-path" data-path-id="${path.id}">Edit</button>
            <button class="btn btn-small btn-danger delete-path" data-path-id="${path.id}">Delete</button>
        </div>
    `;
    
    return pathDiv;
}

function calculateNextRun(path) {
    if (!path || !path.active || !path.schedule?.time) {
        return 'Not scheduled';
    }
    
    try {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const [hours, minutes] = path.schedule.time.split(':').map(Number);
        const nextRun = new Date(today);
        nextRun.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        
        const isToday = nextRun.toDateString() === now.toDateString();
        const dateStr = isToday ? 'Today' : 'Tomorrow';
        
        return `Next run: ${dateStr}, ${window.formatScheduleTime(path.schedule.time)}`;
    } catch (error) {
        console.error('AI Automation Final Fix: Error calculating next run:', error);
        return 'Schedule error';
    }
}

function loadAndDisplayAutomationPaths() {
    console.log('AI Automation Final Fix: Loading and displaying automation paths...');
    
    // Load from storage
    const paths = window.loadAutomationPathsFromStorage();
    
    // Display the paths
    refreshAutomationDisplay();
    
    console.log('AI Automation Final Fix: Loaded and displayed', paths.length, 'automation paths');
}

function showToast(message) {
    try {
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
    } catch (error) {
        console.error('AI Automation Final Fix: Error showing toast:', error);
    }
}

// Handle delete and edit button clicks
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
        const paths = window.automationPaths || automationPaths || [];
        const index = paths.findIndex(path => path.id === pathId);
        
        if (index !== -1) {
            paths.splice(index, 1);
            window.automationPaths = paths;
            automationPaths = paths;
            
            window.saveAutomationPathsToStorage();
            refreshAutomationDisplay();
            
            showToast('Automation path deleted successfully');
            console.log('AI Automation Final Fix: Deleted automation path:', pathId);
        }
    } catch (error) {
        console.error('AI Automation Final Fix: Error deleting path:', error);
    }
}

function editAutomationPath(pathId) {
    try {
        const paths = window.automationPaths || automationPaths || [];
        const path = paths.find(p => p.id === pathId);
        
        if (path) {
            const modal = document.querySelector('.automation-path-modal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Populate form with existing data
                const pathNameInput = modal.querySelector('#path-name');
                const contentTypeSelect = modal.querySelector('#content-type');
                const categorySelect = modal.querySelector('#category');
                const topicsInput = modal.querySelector('#topics');
                const scheduleTimeInput = modal.querySelector('#schedule-time');
                
                if (pathNameInput) pathNameInput.value = path.name || '';
                if (contentTypeSelect) contentTypeSelect.value = path.contentType || '';
                if (categorySelect) categorySelect.value = path.category || '';
                if (topicsInput) topicsInput.value = path.topics || '';
                if (scheduleTimeInput) scheduleTimeInput.value = window.formatScheduleTime(path.schedule?.time) || '';
                
                // Set schedule type
                const scheduleOptions = modal.querySelectorAll('.schedule-option');
                scheduleOptions.forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.schedule === path.schedule?.type) {
                        option.classList.add('selected');
                    }
                });
                
                console.log('AI Automation Final Fix: Opened edit modal for:', path.name);
            }
        }
    } catch (error) {
        console.error('AI Automation Final Fix: Error editing path:', error);
    }
}

// Export for global access
window.automationFinalFix = {
    initializeAutomationFix,
    setupStorageSystem,
    setupPopupClosing,
    setupTimeFormatFix,
    setupErrorPrevention,
    loadAndDisplayAutomationPaths,
    refreshAutomationDisplay
};

console.log('AI Automation Final Fix: Script loaded and ready');
