
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
        // Try multiple storage locations
        let paths = [];

        // Check localStorage
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }

        // Check StorageManager
        if (!paths.length && typeof StorageManager !== 'undefined') {
            const storagePaths = StorageManager.get('ai-automation-paths');
            if (storagePaths && Array.isArray(storagePaths)) {
                paths = storagePaths;
            }
        }

        // Check alternative storage key
        if (!paths.length) {
            const altPaths = localStorage.getItem('fooodis-ai-automation-paths');
            if (altPaths) {
                paths = JSON.parse(altPaths);
            }
        }

        // Ensure each path has an ID
        paths = paths.map(path => ({
            ...path,
            id: path.id || generateAutomationId()
        }));

        window.aiAutomation.automationPaths = paths;
        
        // Save back to ensure consistency
        saveAutomationPathsToStorage();

        console.log(`AI Automation V2: Loaded ${paths.length} automation paths`);
        
        // Update UI
        displayAutomationPaths();

    } catch (error) {
        console.error('Error loading automation paths:', error);
        window.aiAutomation.automationPaths = [];
    }
}

/**
 * Save automation paths to storage
 */
function saveAutomationPathsToStorage() {
    try {
        const paths = window.aiAutomation.automationPaths.map(path => ({
            ...path,
            id: path.id || generateAutomationId()
        }));

        // Save to multiple locations for redundancy
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
        localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(paths));

        // Save via StorageManager if available
        if (typeof StorageManager !== 'undefined') {
            StorageManager.save('ai-automation-paths', paths);
        }

        // Save to sessionStorage as backup
        sessionStorage.setItem('aiAutomationPaths-backup', JSON.stringify(paths));

        console.log('AI Automation V2: Paths saved successfully');

    } catch (error) {
        console.error('Error saving automation paths:', error);
    }
}

/**
 * Generate unique automation ID
 */
function generateAutomationId() {
    return 'automation_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Setup automation event listeners
 */
function setupAutomationEventListeners() {
    // Add automation path button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-automation-path') || 
            e.target.closest('[data-automation="add"]') ||
            e.target.closest('.automation-path-btn') ||
            e.target.classList.contains('add-automation-btn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔄 Add automation path clicked');
            showAutomationModal();
        }
    });

    // Delete automation path
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-automation-path')) {
            e.preventDefault();
            const pathId = e.target.closest('.automation-path-item').dataset.pathId;
            deleteAutomationPath(pathId);
        }
    });

    // Execute automation path
    document.addEventListener('click', function(e) {
        if (e.target.closest('.execute-automation-path')) {
            e.preventDefault();
            const pathId = e.target.closest('.automation-path-item').dataset.pathId;
            executeAutomationPath(pathId);
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

    // Add styles
    if (!document.getElementById('ai-automation-v2-styles')) {
        const styles = document.createElement('style');
        styles.id = 'ai-automation-v2-styles';
        styles.textContent = `
            .automation-path-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                transition: all 0.2s;
            }
            .automation-path-item:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(232, 242, 76, 0.3);
            }
            .automation-path-title {
                color: #e8f24c;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .automation-path-description {
                color: #a0a0a0;
                font-size: 14px;
                margin-bottom: 10px;
            }
            .automation-path-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .automation-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }
            .automation-status.pending {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
            }
            .automation-status.running {
                background: rgba(23, 162, 184, 0.2);
                color: #17a2b8;
            }
            .automation-status.completed {
                background: rgba(40, 167, 69, 0.2);
                color: #28a745;
            }
            .automation-status.failed {
                background: rgba(220, 53, 69, 0.2);
                color: #dc3545;
            }
            .add-automation-btn {
                background: #e8f24c;
                color: #1e2127;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                margin: 10px 0;
                transition: all 0.2s;
            }
            .add-automation-btn:hover {
                background: #d4dc42;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(styles);
    }
}

/**
 * Ensure automation section has proper structure
 */
function ensureAutomationSectionStructure(section) {
    // Check if containers exist
    let pathsContainer = section.querySelector('#automation-paths-container') || 
                        section.querySelector('.automation-paths-list');

    if (!pathsContainer) {
        pathsContainer = document.createElement('div');
        pathsContainer.id = 'automation-paths-container';
        pathsContainer.className = 'automation-paths-list';
        section.appendChild(pathsContainer);
    }

    // Add a button if it doesn't exist
    if (!section.querySelector('.add-automation-btn') && 
        !section.querySelector('.add-automation-path')) {
        const addButton = document.createElement('button');
        addButton.className = 'add-automation-btn add-automation-path';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add Automation Path';
        section.insertBefore(addButton, pathsContainer);
    }
}

/**
 * Display automation paths
 */
function displayAutomationPaths() {
    const container = document.getElementById('automation-paths-container') || 
                     document.querySelector('.automation-paths-list');

    if (!container) {
        console.warn('Automation paths container not found');
        return;
    }

    const paths = window.aiAutomation.automationPaths;

    if (paths.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                <p>No automation paths configured.</p>
                <button class="btn btn-primary add-automation-path">
                    <i class="fas fa-plus"></i> Add Automation Path
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = paths.map(path => `
        <div class="automation-path-item" data-path-id="${path.id}">
            <div class="automation-path-title">${path.title || 'Untitled Automation'}</div>
            <div class="automation-path-description">${path.description || 'No description'}</div>
            <div class="automation-path-schedule">
                <small class="text-muted">
                    <i class="fas fa-clock"></i> 
                    ${path.schedule ? formatSchedule(path.schedule) : 'No schedule'}
                </small>
            </div>
            <div class="automation-path-actions mt-2">
                <span class="automation-status ${getAutomationStatus(path.id)}">${getAutomationStatus(path.id)}</span>
                <button class="btn btn-sm btn-outline-primary execute-automation-path">
                    <i class="fas fa-play"></i> Execute
                </button>
                <button class="btn btn-sm btn-outline-danger delete-automation-path">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Show automation modal
 */
function showAutomationModal() {
    console.log('📝 Showing automation modal...');
    
    // Remove existing modal
    const existingModal = document.getElementById('automationModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="automationModal" tabindex="-1" style="z-index: 99999;">
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-light">Add Automation Path</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="automationForm">
                            <div class="mb-3">
                                <label class="form-label text-light">Title</label>
                                <input type="text" class="form-control bg-dark text-light border-secondary" 
                                       id="automationTitle" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-light">Description</label>
                                <textarea class="form-control bg-dark text-light border-secondary" 
                                          id="automationDescription" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-light">AI Prompt</label>
                                <textarea class="form-control bg-dark text-light border-secondary" 
                                          id="automationPrompt" rows="4" 
                                          placeholder="Enter your AI prompt for content generation..." required></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <label class="form-label text-light">Schedule Date</label>
                                    <input type="date" class="form-control bg-dark text-light border-secondary" 
                                           id="automationDate" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label text-light">Schedule Time</label>
                                    <input type="time" class="form-control bg-dark text-light border-secondary" 
                                           id="automationTime" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveAutomationPath()">Save Automation</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('automationModal'));
    modal.show();
    
    console.log('✅ Automation modal displayed');
}

/**
 * Save automation path
 */
function saveAutomationPath() {
    console.log('💾 Saving automation path...');
    
    const form = document.getElementById('automationForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const automation = {
        id: generateAutomationId(),
        title: document.getElementById('automationTitle').value,
        description: document.getElementById('automationDescription').value,
        prompt: document.getElementById('automationPrompt').value,
        schedule: {
            date: document.getElementById('automationDate').value,
            time: document.getElementById('automationTime').value
        },
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Add to automation paths
    window.aiAutomation.automationPaths.push(automation);

    // Save to storage
    saveAutomationPathsToStorage();

    // Update display
    displayAutomationPaths();

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('automationModal'));
    if (modal) {
        modal.hide();
    }

    // Show success message
    showNotification('Automation path saved successfully!', 'success');
    
    console.log('✅ Automation path saved:', automation);
}

/**
 * Delete automation path
 */
function deleteAutomationPath(pathId) {
    if (!confirm('Are you sure you want to delete this automation path?')) {
        return;
    }

    // Remove from array
    window.aiAutomation.automationPaths = window.aiAutomation.automationPaths.filter(
        path => path.id !== pathId
    );

    // Save to storage
    saveAutomationPathsToStorage();

    // Update display
    displayAutomationPaths();

    showNotification('Automation path deleted successfully!', 'success');
}

/**
 * Execute automation path
 */
async function executeAutomationPath(pathId) {
    const path = window.aiAutomation.automationPaths.find(p => p.id === pathId);
    if (!path) {
        showNotification('Automation path not found!', 'error');
        return;
    }

    // Check if AI is configured
    if (!window.aiConfig || !window.aiConfig.apiKey) {
        showNotification('Please configure AI settings first!', 'error');
        return;
    }

    // Update status
    window.aiAutomation.executionStatus.set(pathId, 'running');
    displayAutomationPaths();

    try {
        showNotification('Executing automation...', 'info');

        // Generate content using AI
        const content = await generateAIContent(path.prompt);

        if (content) {
            // Create blog post
            const post = {
                title: content.title || `AI Generated Post - ${new Date().toLocaleDateString()}`,
                content: content.body || content.content || content,
                category: 'AI Generated',
                tags: content.tags || ['ai-generated'],
                author: 'AI Assistant',
                publishDate: new Date().toISOString(),
                status: 'published'
            };

            // Save post (implement your blog post saving logic here)
            if (typeof saveBlogPost === 'function') {
                await saveBlogPost(post);
            }

            // Update status
            window.aiAutomation.executionStatus.set(pathId, 'completed');
            showNotification('Automation executed successfully!', 'success');

        } else {
            throw new Error('Failed to generate content');
        }

    } catch (error) {
        console.error('Automation execution error:', error);
        window.aiAutomation.executionStatus.set(pathId, 'failed');
        showNotification(`Automation failed: ${error.message}`, 'error');
    }

    displayAutomationPaths();
}

/**
 * Generate AI content
 */
async function generateAIContent(prompt) {
    if (!window.aiConfig || !window.aiConfig.apiKey) {
        throw new Error('AI configuration not found');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${window.aiConfig.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: window.aiConfig.model || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a content creation assistant. Generate engaging blog content based on the user prompt. Return the response as a JSON object with title, content, and tags fields.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: window.aiConfig.maxTokens || 1000,
            temperature: window.aiConfig.temperature || 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        return JSON.parse(content);
    } catch {
        return { content: content };
    }
}

/**
 * Helper functions
 */
function formatSchedule(schedule) {
    if (!schedule.date || !schedule.time) return 'No schedule';
    return `${schedule.date} at ${schedule.time}`;
}

function getAutomationStatus(pathId) {
    return window.aiAutomation.executionStatus.get(pathId) || 'pending';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Start background scheduler
 */
function startBackgroundScheduler() {
    setInterval(() => {
        checkScheduledTasks();
    }, 60000); // Check every minute
}

/**
 * Check for scheduled tasks
 */
function checkScheduledTasks() {
    const now = new Date();
    
    window.aiAutomation.automationPaths.forEach(path => {
        if (path.schedule && getAutomationStatus(path.id) === 'pending') {
            const scheduleDateTime = new Date(`${path.schedule.date}T${path.schedule.time}`);
            
            if (now >= scheduleDateTime) {
                console.log(`Executing scheduled automation: ${path.title}`);
                executeAutomationPath(path.id);
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        if (document.getElementById('ai-automation-section') || 
            document.querySelector('[data-section="ai-automation"]') ||
            document.querySelector('.ai-automation-section') ||
            document.querySelector('#ai-content-automation')) {
            initializeAIAutomationV2();
        }
    }, 1000);
});

// Also try to initialize when the window loads
window.addEventListener('load', function() {
    if (!window.aiAutomation.isInitialized) {
        setTimeout(() => {
            if (document.getElementById('ai-automation-section') || 
                document.querySelector('[data-section="ai-automation"]') ||
                document.querySelector('.ai-automation-section') ||
                document.querySelector('#ai-content-automation')) {
                initializeAIAutomationV2();
            }
        }, 500);
    }
});

// Export functions for global access
window.initializeAIAutomationV2 = initializeAIAutomationV2;
window.loadAutomationPaths = loadAutomationPaths;
window.saveAutomationPathsToStorage = saveAutomationPathsToStorage;
window.saveAutomationPath = saveAutomationPath;
window.executeAutomationPath = executeAutomationPath;
window.generateAIContent = generateAIContent;
window.showAutomationModal = showAutomationModal;

console.log('✅ AI Automation V2: Script loaded and ready');
