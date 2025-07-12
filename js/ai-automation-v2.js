
/**
 * AI Automation V2 - Enhanced Content Automation System
 * Handles AI-powered content generation and scheduling
 */

// Global automation state
window.aiAutomation = {
    automationPaths: [],
    isInitialized: false,
    executionStatus: new Map(),
    scheduledTasks: new Map()
};

/**
 * Initialize AI Automation V2
 */
function initializeAIAutomationV2() {
    console.log('AI Automation V2: Initializing...');

    // Load saved automation paths
    loadAutomationPaths();

    // Setup event listeners
    setupAutomationEventListeners();

    // Setup UI components
    setupAutomationUI();

    // Start background scheduler
    startBackgroundScheduler();

    window.aiAutomation.isInitialized = true;
    console.log('AI Automation V2: Initialized successfully');
}

/**
 * Load saved automation paths
 */
function loadAutomationPaths() {
    try {
        const saved = localStorage.getItem('aiAutomationPaths');
        if (saved) {
            window.aiAutomation.automationPaths = JSON.parse(saved);
            console.log('AI Automation V2: Loaded', window.aiAutomation.automationPaths.length, 'automation paths');
        }
    } catch (error) {
        console.error('AI Automation V2: Error loading automation paths:', error);
        window.aiAutomation.automationPaths = [];
    }
}

/**
 * Save automation paths to storage
 */
function saveAutomationPaths() {
    try {
        localStorage.setItem('aiAutomationPaths', JSON.stringify(window.aiAutomation.automationPaths));
        console.log('AI Automation V2: Saved automation paths');
        return true;
    } catch (error) {
        console.error('AI Automation V2: Error saving automation paths:', error);
        return false;
    }
}

/**
 * Setup automation event listeners
 */
function setupAutomationEventListeners() {
    console.log('AI Automation V2: Setting up event listeners...');

    // Add new automation path
    document.addEventListener('click', function(event) {
        if (event.target.matches('.add-automation-path')) {
            event.preventDefault();
            event.stopPropagation();
            showAutomationModal();
        }

        if (event.target.matches('.save-automation-path')) {
            event.preventDefault();
            event.stopPropagation();
            saveNewAutomationPath();
        }

        if (event.target.matches('.close-automation-modal')) {
            event.preventDefault();
            event.stopPropagation();
            hideAutomationModal();
        }

        if (event.target.matches('.delete-automation-path')) {
            event.preventDefault();
            event.stopPropagation();
            const pathId = event.target.dataset.pathId;
            deleteAutomationPath(pathId);
        }

        if (event.target.matches('.toggle-automation-path')) {
            event.preventDefault();
            event.stopPropagation();
            const pathId = event.target.dataset.pathId;
            toggleAutomationPath(pathId);
        }
    });

    // Schedule option selection
    document.addEventListener('click', function(event) {
        if (event.target.matches('.schedule-option')) {
            document.querySelectorAll('.schedule-option').forEach(option => {
                option.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }
    });
}

/**
 * Setup automation UI
 */
function setupAutomationUI() {
    // Create automation section if it doesn't exist
    let automationSection = document.getElementById('ai-automation-section');
    if (!automationSection) {
        // Try alternative selectors
        automationSection = document.querySelector('[data-section="ai-automation"]') ||
                          document.querySelector('.ai-automation-section') ||
                          document.querySelector('#ai-content-automation');
    }

    if (!automationSection) {
        console.warn('AI Automation section not found in DOM');
        return;
    }

    // Ensure the section has the proper structure
    ensureAutomationSectionStructure(automationSection);

    // Render existing automation paths
    renderAutomationPaths();
}

/**
 * Ensure automation section has proper structure
 */
function ensureAutomationSectionStructure(section) {
    // Check if automation paths container exists
    let pathsContainer = section.querySelector('.automation-paths-container');
    if (!pathsContainer) {
        pathsContainer = document.createElement('div');
        pathsContainer.className = 'automation-paths-container';
        section.appendChild(pathsContainer);
    }

    // Check if add button exists
    let addButton = pathsContainer.querySelector('.add-automation-path');
    if (!addButton) {
        const addButtonContainer = document.createElement('div');
        addButtonContainer.className = 'automation-path add-new';
        addButtonContainer.innerHTML = `
            <div class="add-automation-content">
                <i class="fas fa-plus"></i>
                <h3>Add New Automation Path</h3>
                <p>Create automated content generation schedule</p>
                <button class="btn btn-primary add-automation-path">Add Automation Path</button>
            </div>
        `;
        pathsContainer.appendChild(addButtonContainer);
    }

    // Ensure modal exists
    ensureAutomationModal();
}

/**
 * Ensure automation modal exists
 */
function ensureAutomationModal() {
    let modal = document.querySelector('.automation-path-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'automation-path-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="automation-modal-content">
                <div class="automation-modal-header">
                    <h2>Create Automation Path</h2>
                    <span class="close-automation-modal">&times;</span>
                </div>
                <div class="automation-modal-body">
                    <div class="form-group">
                        <label for="path-name">Path Name</label>
                        <input type="text" id="path-name" placeholder="Enter automation path name">
                    </div>
                    
                    <div class="form-group">
                        <label for="content-type">Content Type</label>
                        <select id="content-type">
                            <option value="blog-post">Blog Post</option>
                            <option value="social-media">Social Media</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="product-description">Product Description</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="assistant-type">Assistant Type</label>
                        <select id="assistant-type">
                            <option value="creative">Creative Writer</option>
                            <option value="technical">Technical Writer</option>
                            <option value="marketing">Marketing Specialist</option>
                            <option value="general">General Assistant</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category">
                            <option value="Recipes">Recipes</option>
                            <option value="Restaurants">Restaurants</option>
                            <option value="Health">Health</option>
                            <option value="Cooking Tips">Cooking Tips</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="topics">Topics (comma-separated)</label>
                        <textarea id="topics" placeholder="Enter topics separated by commas"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Schedule</label>
                        <div class="schedule-options">
                            <div class="schedule-option selected" data-schedule="daily">
                                <i class="fas fa-calendar-day"></i>
                                Daily
                            </div>
                            <div class="schedule-option" data-schedule="weekly">
                                <i class="fas fa-calendar-week"></i>
                                Weekly
                            </div>
                            <div class="schedule-option" data-schedule="monthly">
                                <i class="fas fa-calendar"></i>
                                Monthly
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="schedule-time">Time</label>
                        <input type="time" id="schedule-time" value="14:00">
                    </div>
                </div>
                <div class="automation-modal-footer">
                    <button class="btn btn-secondary close-automation-modal">Cancel</button>
                    <button class="btn btn-primary save-automation-path">Save Automation Path</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

/**
 * Show automation modal
 */
function showAutomationModal() {
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        const pathNameInput = modal.querySelector('#path-name');
        const topicsInput = modal.querySelector('#topics');
        const scheduleTimeInput = modal.querySelector('#schedule-time');
        
        if (pathNameInput) pathNameInput.value = '';
        if (topicsInput) topicsInput.value = '';
        if (scheduleTimeInput) scheduleTimeInput.value = '14:00';
        
        // Reset schedule selection
        modal.querySelectorAll('.schedule-option').forEach(option => {
            option.classList.remove('selected');
        });
        const dailyOption = modal.querySelector('.schedule-option[data-schedule="daily"]');
        if (dailyOption) {
            dailyOption.classList.add('selected');
        }
    }
}

/**
 * Hide automation modal
 */
function hideAutomationModal() {
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Save new automation path
 */
function saveNewAutomationPath() {
    const modal = document.querySelector('.automation-path-modal');
    if (!modal) return;

    const pathName = modal.querySelector('#path-name').value;
    const contentType = modal.querySelector('#content-type').value;
    const assistantType = modal.querySelector('#assistant-type').value;
    const category = modal.querySelector('#category').value;
    const topics = modal.querySelector('#topics').value;
    const scheduleType = modal.querySelector('.schedule-option.selected').dataset.schedule;
    const scheduleTime = modal.querySelector('#schedule-time').value;

    if (!pathName || !contentType || !scheduleType || !scheduleTime) {
        alert('Please fill in all required fields');
        return;
    }

    const newPath = {
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

    window.aiAutomation.automationPaths.push(newPath);
    saveAutomationPaths();
    renderAutomationPaths();
    hideAutomationModal();

    console.log('AI Automation V2: Created new automation path:', newPath.name);
}

/**
 * Render automation paths
 */
function renderAutomationPaths() {
    const container = document.querySelector('.automation-paths-container');
    if (!container) return;

    // Clear existing paths (except add button)
    const existingPaths = container.querySelectorAll('.automation-path:not(.add-new)');
    existingPaths.forEach(path => path.remove());

    // Render each automation path
    window.aiAutomation.automationPaths.forEach(path => {
        const pathElement = createAutomationPathElement(path);
        container.insertBefore(pathElement, container.lastElementChild);
    });
}

/**
 * Create automation path element
 */
function createAutomationPathElement(path) {
    const pathDiv = document.createElement('div');
    pathDiv.className = 'automation-path';
    pathDiv.dataset.pathId = path.id;

    const nextRun = calculateNextRun(path);
    
    pathDiv.innerHTML = `
        <div class="automation-path-header">
            <h3>${path.name}</h3>
            <div class="automation-path-controls">
                <button class="btn btn-small toggle-automation-path" 
                        data-path-id="${path.id}" 
                        title="${path.active ? 'Pause' : 'Resume'}">
                    <i class="fas fa-${path.active ? 'pause' : 'play'}"></i>
                </button>
                <button class="btn btn-small btn-danger delete-automation-path" 
                        data-path-id="${path.id}" 
                        title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="automation-path-details">
            <div class="path-info">
                <span class="info-label">Type:</span>
                <span class="info-value">${path.contentType}</span>
            </div>
            <div class="path-info">
                <span class="info-label">Category:</span>
                <span class="info-value">${path.category}</span>
            </div>
            <div class="path-info">
                <span class="info-label">Schedule:</span>
                <span class="info-value">${path.schedule.type} at ${path.schedule.time}</span>
            </div>
            <div class="path-info">
                <span class="info-label">Next Run:</span>
                <span class="info-value">${nextRun}</span>
            </div>
            <div class="path-status ${path.active ? 'active' : 'inactive'}">
                ${path.active ? 'Active' : 'Inactive'}
            </div>
        </div>
    `;

    return pathDiv;
}

/**
 * Calculate next run time
 */
function calculateNextRun(path) {
    if (!path.active) return 'Inactive';

    const now = new Date();
    const [hours, minutes] = path.schedule.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    // If time has passed today, move to next day
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toLocaleDateString() + ' ' + path.schedule.time;
}

/**
 * Delete automation path
 */
function deleteAutomationPath(pathId) {
    if (!confirm('Are you sure you want to delete this automation path?')) {
        return;
    }

    const index = window.aiAutomation.automationPaths.findIndex(path => path.id === pathId);
    if (index !== -1) {
        window.aiAutomation.automationPaths.splice(index, 1);
        saveAutomationPaths();
        renderAutomationPaths();
        console.log('AI Automation V2: Deleted automation path');
    }
}

/**
 * Toggle automation path active state
 */
function toggleAutomationPath(pathId) {
    const path = window.aiAutomation.automationPaths.find(p => p.id === pathId);
    if (path) {
        path.active = !path.active;
        saveAutomationPaths();
        renderAutomationPaths();
        console.log('AI Automation V2: Toggled automation path:', path.name, 'Active:', path.active);
    }
}

/**
 * Start background scheduler
 */
function startBackgroundScheduler() {
    console.log('AI Automation V2: Starting background scheduler...');
    
    // Check every minute for scheduled tasks
    setInterval(() => {
        checkScheduledTasks();
    }, 60000);
}

/**
 * Check for scheduled tasks
 */
function checkScheduledTasks() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');

    window.aiAutomation.automationPaths.forEach(path => {
        if (path.active && path.schedule.time === currentTime) {
            // Check if already ran today
            const lastRun = path.lastRun ? new Date(path.lastRun) : null;
            const today = new Date().toDateString();
            
            if (!lastRun || lastRun.toDateString() !== today) {
                executeAutomationPath(path);
            }
        }
    });
}

/**
 * Execute automation path
 */
function executeAutomationPath(path) {
    console.log('AI Automation V2: Executing automation path:', path.name);
    
    // Update last run time
    path.lastRun = new Date().toISOString();
    saveAutomationPaths();
    
    // Create execution status
    createExecutionStatus(path);
    
    // Simulate content generation (replace with actual AI integration)
    setTimeout(() => {
        completeExecution(path);
    }, 5000);
}

/**
 * Create execution status
 */
function createExecutionStatus(path) {
    window.aiAutomation.executionStatus.set(path.id, {
        pathId: path.id,
        pathName: path.name,
        startTime: new Date(),
        status: 'generating'
    });
    
    // Show status notification
    showExecutionNotification(path);
}

/**
 * Complete execution
 */
function completeExecution(path) {
    window.aiAutomation.executionStatus.delete(path.id);
    
    console.log('AI Automation V2: Completed execution for:', path.name);
    
    // Show completion notification
    showCompletionNotification(path);
}

/**
 * Show execution notification
 */
function showExecutionNotification(path) {
    console.log('AI Automation V2: Starting content generation for:', path.name);
    // Implement toast notification here
}

/**
 * Show completion notification
 */
function showCompletionNotification(path) {
    console.log('AI Automation V2: Content generation completed for:', path.name);
    // Implement toast notification here
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure other systems are loaded
    setTimeout(() => {
        if (document.querySelector('#ai-automation-section, [data-section="ai-automation"], .ai-automation-section, #ai-content-automation')) {
            initializeAIAutomationV2();
        }
    }, 1000);
});

// Make functions globally available
window.aiAutomationV2 = {
    initializeAIAutomationV2,
    loadAutomationPaths,
    saveAutomationPaths,
    renderAutomationPaths,
    executeAutomationPath
};

console.log('AI Automation V2: Module loaded');
