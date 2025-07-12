
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
            const automationPaths = window.automationPaths || window.aiAutomation?.automationPaths || [];
            
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
            
            // Update global variables
            if (window.automationPaths !== undefined) {
                window.automationPaths = automationPaths;
            }
            if (window.aiAutomation) {
                window.aiAutomation.automationPaths = automationPaths;
            }
            
            console.log('AI Automation Comprehensive Fix: Loaded automation paths:', automationPaths.length);
            return automationPaths;
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error loading automation paths:', error);
            return [];
        }
    };
}

/**
 * Fix 2: Automatic popup closing and proper show/hide behavior
 */
function fixAutomaticPopupClosing() {
    console.log('AI Automation Comprehensive Fix: Fixing automatic popup closing...');
    
    // First, ensure the modal exists in the DOM
    ensureModalExists();
    
    // Ensure modal starts hidden
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Only add event listener to specific add automation buttons
    setTimeout(() => {
        const addButtons = document.querySelectorAll('.add-automation-path, #createNewAutomation, [data-action="create-automation"]');
        addButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('AI Automation Comprehensive Fix: Add automation button clicked');
                showAutomationModal();
            });
        });
    }, 2000);
    
    // Handle specific automation creation clicks only
    document.addEventListener('click', function(event) {
        // Handle only specific selectors for Add New Automation Path button
        if (event.target.matches('.add-automation-path') || 
            event.target.matches('#createNewAutomation') ||
            event.target.matches('[data-action="create-automation"]') ||
            event.target.closest('.add-automation-path') ||
            event.target.closest('#createNewAutomation') ||
            (event.target.textContent && event.target.textContent.trim() === 'Add New Automation Path')) {
            
            event.preventDefault();
            event.stopPropagation();
            
            console.log('AI Automation Comprehensive Fix: Add automation button clicked');
            showAutomationModal();
            return;
        }
        
        // Handle Save Automation Path button
        if (event.target.matches('.save-automation-path, .automation-path-form .save-btn')) {
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
                } else if (typeof window.aiAutomationV2?.renderAutomationPaths === 'function') {
                    window.aiAutomationV2.renderAutomationPaths();
                }
                
                // Show success message
                showSuccessMessage('Automation path saved successfully!');
            }
            return;
        }
        
        // Handle Close Modal button
        if (event.target.matches('.close-automation-modal')) {
            event.preventDefault();
            event.stopPropagation();
            
            const modal = document.querySelector('.automation-path-modal');
            if (modal) {
                modal.style.display = 'none';
                console.log('AI Automation Comprehensive Fix: Popup closed by close button');
            }
            return;
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
            // Update global automation paths
            if (!window.automationPaths) {
                window.automationPaths = [];
            }
            if (!window.aiAutomation) {
                window.aiAutomation = { automationPaths: [] };
            }
            
            // Add the new path
            window.automationPaths.push(pathData);
            window.aiAutomation.automationPaths.push(pathData);
            
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
    
    // Helper function to clear form data
    function clearFormData() {
        try {
            const modal = document.querySelector('.automation-path-modal');
            if (!modal) return;
            
            // Clear all form inputs
            const pathName = modal.querySelector('#path-name');
            const topics = modal.querySelector('#topics');
            const scheduleTime = modal.querySelector('#schedule-time');
            
            if (pathName) pathName.value = '';
            if (topics) topics.value = '';
            if (scheduleTime) scheduleTime.value = '14:00';
            
            // Reset selects to first option
            const selects = modal.querySelectorAll('select');
            selects.forEach(select => {
                if (select.options.length > 0) {
                    select.selectedIndex = 0;
                }
            });
            
            // Reset schedule selection
            const scheduleOptions = modal.querySelectorAll('.schedule-option');
            scheduleOptions.forEach(option => {
                option.classList.remove('selected');
            });
            const firstScheduleOption = modal.querySelector('.schedule-option[data-schedule="daily"]');
            if (firstScheduleOption) {
                firstScheduleOption.classList.add('selected');
            }
            
            console.log('AI Automation Comprehensive Fix: Form cleared');
        } catch (error) {
            console.error('AI Automation Comprehensive Fix: Error clearing form:', error);
        }
    }

    // Helper function to ensure modal exists
    function ensureModalExists() {
        let modal = document.querySelector('.automation-path-modal');
        if (!modal) {
            console.log('AI Automation Comprehensive Fix: Creating automation modal...');
            
            modal = document.createElement('div');
            modal.className = 'automation-path-modal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="automation-modal-content" style="background: #252830; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; border: 1px solid #32363f;">
                    <div class="automation-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #32363f; padding-bottom: 15px;">
                        <h2 style="color: #e0e0e0; margin: 0; font-size: 1.5rem;">Create Automation Path</h2>
                        <span class="close-automation-modal" style="color: #a0a0a0; font-size: 24px; cursor: pointer; padding: 5px;">&times;</span>
                    </div>
                    <div class="automation-modal-body">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="path-name" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Path Name</label>
                            <input type="text" id="path-name" placeholder="Enter automation path name" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="content-type" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Content Type</label>
                            <select id="content-type" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px;">
                                <option value="blog-post">Blog Post</option>
                                <option value="social-media">Social Media</option>
                                <option value="newsletter">Newsletter</option>
                                <option value="product-description">Product Description</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="assistant-type" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Assistant Type</label>
                            <select id="assistant-type" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px;">
                                <option value="creative">Creative Writer</option>
                                <option value="technical">Technical Writer</option>
                                <option value="marketing">Marketing Specialist</option>
                                <option value="general">General Assistant</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="category" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Category</label>
                            <select id="category" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px;">
                                <option value="Recipes">Recipes</option>
                                <option value="Restaurants">Restaurants</option>
                                <option value="Health">Health</option>
                                <option value="Cooking Tips">Cooking Tips</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="topics" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Topics (comma-separated)</label>
                            <textarea id="topics" placeholder="Enter topics separated by commas" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px; min-height: 80px; resize: vertical;"></textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Schedule</label>
                            <div class="schedule-options" style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <div class="schedule-option selected" data-schedule="daily" style="padding: 12px 20px; background: #e8f24c; color: #1e2127; border-radius: 6px; cursor: pointer; text-align: center; font-weight: 500; min-width: 80px;">
                                    <i class="fas fa-calendar-day" style="margin-right: 5px;"></i>
                                    Daily
                                </div>
                                <div class="schedule-option" data-schedule="weekly" style="padding: 12px 20px; background: #32363f; color: #e0e0e0; border-radius: 6px; cursor: pointer; text-align: center; font-weight: 500; min-width: 80px;">
                                    <i class="fas fa-calendar-week" style="margin-right: 5px;"></i>
                                    Weekly
                                </div>
                                <div class="schedule-option" data-schedule="monthly" style="padding: 12px 20px; background: #32363f; color: #e0e0e0; border-radius: 6px; cursor: pointer; text-align: center; font-weight: 500; min-width: 80px;">
                                    <i class="fas fa-calendar" style="margin-right: 5px;"></i>
                                    Monthly
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="schedule-time" style="display: block; color: #e0e0e0; margin-bottom: 8px; font-weight: 500;">Time</label>
                            <input type="time" id="schedule-time" value="14:00" style="width: 100%; padding: 12px; background: #2a2e36; border: 1px solid #32363f; border-radius: 6px; color: #e0e0e0; font-size: 14px;">
                        </div>
                    </div>
                    <div class="automation-modal-footer" style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 15px; border-top: 1px solid #32363f;">
                        <button class="btn btn-secondary close-automation-modal" style="padding: 12px 24px; background: #32363f; color: #e0e0e0; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Cancel</button>
                        <button class="btn btn-primary save-automation-path" style="padding: 12px 24px; background: #e8f24c; color: #1e2127; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">Save Automation Path</button>
                    </div>
                </div>
            `;
            
            // Add event listeners for schedule options
            modal.addEventListener('click', function(e) {
                if (e.target.matches('.schedule-option')) {
                    modal.querySelectorAll('.schedule-option').forEach(option => {
                        option.style.background = '#32363f';
                        option.style.color = '#e0e0e0';
                        option.classList.remove('selected');
                    });
                    e.target.style.background = '#e8f24c';
                    e.target.style.color = '#1e2127';
                    e.target.classList.add('selected');
                }
            });
            
            document.body.appendChild(modal);
            console.log('AI Automation Comprehensive Fix: Modal created and added to DOM');
        }
        return modal;
    }

    // Helper function to show automation modal
    function showAutomationModal() {
        console.log('AI Automation Comprehensive Fix: Showing automation modal...');
        
        // Ensure modal exists
        ensureModalExists();
        
        const modal = document.querySelector('.automation-path-modal');
        if (modal) {
            // Clear the form first
            clearFormData();
            
            // Show the modal with proper styling
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.zIndex = '10000';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            
            console.log('AI Automation Comprehensive Fix: Modal displayed successfully');
        } else {
            console.error('AI Automation Comprehensive Fix: Modal not found');
        }
    }

    // Helper function to show success message
    function showSuccessMessage(message) {
        console.log('AI Automation Comprehensive Fix: Success -', message);
        
        // Try to find existing toast notification
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
        } else {
            // Create a simple alert if no toast system exists
            alert(message);
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
    
    // Initialize aiAutomation if not exists
    if (!window.aiAutomation) {
        window.aiAutomation = { automationPaths: [] };
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
            const existingPaths = container.querySelectorAll('.automation-path:not(.add-new)');
            existingPaths.forEach(path => path.remove());
            
            // Render each automation path
            const automationPaths = window.automationPaths || window.aiAutomation?.automationPaths || [];
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
    } else if (typeof window.aiAutomationV2?.renderAutomationPaths === 'function') {
        window.aiAutomationV2.renderAutomationPaths();
    }
    
    console.log('AI Automation Comprehensive Fix: Restored', automationPaths.length, 'automation paths');
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
