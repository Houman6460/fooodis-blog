
/**
 * AI Automation System for Fooodis Blog
 * Handles automated post generation and scheduling
 */

// Global variables
window.aiAutomationPaths = [];
window.aiAutomationInProgress = [];

/**
 * Initialize AI Automation System
 */
function initializeAIAutomation() {
    console.log('AI Automation: Initializing...');
    
    // Load saved automation paths
    loadAutomationPaths();
    
    // Setup event listeners
    setupAutomationEventListeners();
    
    console.log('AI Automation: Initialized successfully');
}

/**
 * Load automation paths from storage
 */
function loadAutomationPaths() {
    try {
        // Try multiple storage locations for better persistence
        let paths = [];
        
        // Try localStorage first
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
        
        // Try StorageManager if available
        if (paths.length === 0 && window.StorageManager) {
            const storagePaths = StorageManager.get('ai-automation-paths');
            if (storagePaths && Array.isArray(storagePaths)) {
                paths = storagePaths;
            }
        }
        
        // Try alternative key
        if (paths.length === 0) {
            const altPaths = localStorage.getItem('fooodis-ai-automation-paths');
            if (altPaths) {
                paths = JSON.parse(altPaths);
            }
        }
        
        window.aiAutomationPaths = paths || [];
        console.log('AI Automation: Loaded', window.aiAutomationPaths.length, 'automation paths');
        
        // Update UI if container exists
        updateAutomationPathsDisplay();
        
    } catch (error) {
        console.error('AI Automation: Error loading automation paths:', error);
        window.aiAutomationPaths = [];
    }
}

/**
 * Save automation paths to storage
 */
function saveAutomationPathsToStorage() {
    try {
        // Add IDs to paths that don't have one
        window.aiAutomationPaths.forEach(path => {
            if (!path.id) {
                path.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            }
        });
        
        const pathsString = JSON.stringify(window.aiAutomationPaths);
        
        // Save to multiple locations for redundancy
        localStorage.setItem('aiAutomationPaths', pathsString);
        localStorage.setItem('fooodis-ai-automation-paths', pathsString);
        
        // Save to StorageManager if available
        if (window.StorageManager) {
            StorageManager.set('ai-automation-paths', window.aiAutomationPaths);
        }
        
        // Save to sessionStorage as backup
        sessionStorage.setItem('aiAutomationPaths', pathsString);
        
        console.log('AI Automation: Saved', window.aiAutomationPaths.length, 'automation paths');
        
        // Verify save was successful
        const verification = localStorage.getItem('aiAutomationPaths');
        if (verification) {
            console.log('AI Automation: Save verified successfully');
        } else {
            console.warn('AI Automation: Save verification failed');
        }
        
    } catch (error) {
        console.error('AI Automation: Error saving automation paths:', error);
    }
}

/**
 * Setup event listeners for automation
 */
function setupAutomationEventListeners() {
    // Add automation path button
    const addPathBtn = document.getElementById('addAutomationPath');
    if (addPathBtn) {
        addPathBtn.addEventListener('click', addAutomationPath);
    }
    
    // Execute automation button
    const executeBtn = document.getElementById('executeAutomation');
    if (executeBtn) {
        executeBtn.addEventListener('click', executeAutomation);
    }
}

/**
 * Add new automation path
 */
function addAutomationPath() {
    const pathInput = document.getElementById('automationPath');
    const timeInput = document.getElementById('automationTime');
    
    if (!pathInput || !timeInput) {
        console.error('AI Automation: Required input fields not found');
        return;
    }
    
    const path = pathInput.value.trim();
    const time = timeInput.value;
    
    if (!path || !time) {
        alert('Please enter both automation path and time');
        return;
    }
    
    const newPath = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        path: path,
        time: time,
        created: new Date().toISOString(),
        status: 'scheduled'
    };
    
    window.aiAutomationPaths.push(newPath);
    saveAutomationPathsToStorage();
    updateAutomationPathsDisplay();
    
    // Clear inputs
    pathInput.value = '';
    timeInput.value = '';
    
    console.log('AI Automation: Added new path:', newPath);
}

/**
 * Update automation paths display
 */
function updateAutomationPathsDisplay() {
    const container = document.getElementById('automationPathsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    window.aiAutomationPaths.forEach(path => {
        const pathElement = document.createElement('div');
        pathElement.className = 'automation-path-item';
        pathElement.innerHTML = `
            <div class="path-info">
                <strong>${path.path}</strong>
                <span class="path-time">${path.time}</span>
                <span class="path-status status-${path.status}">${path.status}</span>
            </div>
            <div class="path-actions">
                <button class="btn btn-sm btn-danger" onclick="removeAutomationPath('${path.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(pathElement);
    });
}

/**
 * Remove automation path
 */
function removeAutomationPath(pathId) {
    window.aiAutomationPaths = window.aiAutomationPaths.filter(path => path.id !== pathId);
    saveAutomationPathsToStorage();
    updateAutomationPathsDisplay();
    console.log('AI Automation: Removed path with ID:', pathId);
}

/**
 * Execute automation
 */
function executeAutomation() {
    if (window.aiAutomationPaths.length === 0) {
        alert('No automation paths configured');
        return;
    }
    
    console.log('AI Automation: Starting execution...');
    
    // Implementation for automation execution
    window.aiAutomationPaths.forEach(path => {
        if (path.status === 'scheduled') {
            path.status = 'running';
            console.log('AI Automation: Executing path:', path.path);
            
            // Add to in-progress tracking
            window.aiAutomationInProgress.push(path.id);
        }
    });
    
    saveAutomationPathsToStorage();
    updateAutomationPathsDisplay();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAIAutomation);

// Export functions for global access
window.initializeAIAutomation = initializeAIAutomation;
window.loadAutomationPaths = loadAutomationPaths;
window.saveAutomationPathsToStorage = saveAutomationPathsToStorage;
window.addAutomationPath = addAutomationPath;
window.removeAutomationPath = removeAutomationPath;
window.executeAutomation = executeAutomation;
