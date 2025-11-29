/**
 * AI Automation System
 * Handles scheduled AI post generation for the Fooodis Blog System
 */

// Global variables
// Use window object to prevent redeclaration
window.automationPaths = window.automationPaths || [];
window.editingPathIndex = window.editingPathIndex || -1;
window.scheduledTasks = window.scheduledTasks || {};

// Initialize the AI Automation system when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Automation system initializing...');
    
    // Load automation paths from localStorage
    loadAutomationPaths();
    
    // Render the automation paths
    renderAutomationPaths();
    
    // Restore execution status cards for paths that are in progress
    setTimeout(function() {
        console.log('Restoring execution status cards...');
        restoreExecutionStatusCards();
    }, 500); // Short delay to ensure DOM is fully ready
    
    // Check for scheduled automation paths
    initScheduler();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('AI Automation system initialized');
});

/**
 * Initialize the AI automation system
 */
function initAIAutomation() {
    // Load saved automation paths
    loadAutomationPaths();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize scheduler
    initScheduler();
    
    // Restore execution status cards for in-progress paths
    restoreExecutionStatusCards();
}

/**
 * Restore execution status cards for paths that are in progress
 */
function restoreExecutionStatusCards() {
    // Clear any existing status cards first
    const existingCards = document.querySelectorAll('.execution-status-card');
    existingCards.forEach(card => card.remove());
    
    // Get the in-progress paths
    const inProgressIds = getInProgressPaths();
    if (inProgressIds.length === 0) {
        console.log('No in-progress paths to restore');
        return;
    }
    
    console.log('Restoring execution status cards for paths:', inProgressIds);
    
    // Make sure the container exists
    const container = document.querySelector('.execution-status-cards-container');
    if (!container) {
        console.error('Execution status cards container not found, creating one');
        const automationSection = document.querySelector('#ai-automation-section');
        if (automationSection) {
            const newContainer = document.createElement('div');
            newContainer.className = 'execution-status-cards-container';
            // Insert at the beginning of the automation section
            automationSection.insertBefore(newContainer, automationSection.firstChild);
        } else {
            console.error('AI Automation section not found, cannot create status cards container');
            return;
        }
    }
    
    // Find the paths that are in progress
    inProgressIds.forEach(pathId => {
        const path = automationPaths.find(p => p.id === pathId);
        if (path) {
            // Create a status card for this path
            createExecutionStatusCard(path);
            console.log(`Restored execution status card for path: ${path.name}`);
        } else {
            // Path no longer exists, remove it from in-progress list
            console.warn(`Path with ID ${pathId} not found, removing from in-progress list`);
            const inProgress = getInProgressPaths();
            const index = inProgress.indexOf(pathId);
            if (index !== -1) {
                inProgress.splice(index, 1);
                localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            }
        }
    });
}

/**
 * Load saved automation paths from storage
 */
async function loadAutomationPaths() {
    try {
        console.log('Loading automation paths from API...');
        
        // Clear any stale localStorage data first
        try {
            localStorage.removeItem('aiAutomationPaths');
            sessionStorage.removeItem('aiAutomationPaths');
        } catch (e) { /* ignore */ }
        
        const response = await fetch('/api/automation/paths');
        
        if (response.ok) {
            const apiPaths = await response.json();
            
            // Map API paths to UI structure
            automationPaths = apiPaths.map(apiPath => ({
                id: apiPath.id,
                name: apiPath.name,
                contentType: apiPath.content_type,
                assistant: {
                    type: apiPath.assistant_id ? 'custom' : 'default',
                    id: apiPath.assistant_id || ''
                },
                category: apiPath.category || 'Uncategorized',
                subcategory: apiPath.subcategory || '',
                topics: (apiPath.topics || []).join(', '),
                promptTemplate: apiPath.prompt_template || '',
                schedule: {
                    type: apiPath.schedule_type,
                    time: apiPath.schedule_time,
                    // Map API schedule types to UI logic if needed
                    interval: '1', // Default
                    unit: 'days' // Default
                },
                languages: {
                    english: (apiPath.languages || []).includes('en'),
                    swedish: (apiPath.languages || []).includes('sv')
                },
                includeImages: apiPath.include_images,
                mediaFolder: apiPath.media_folder,
                active: apiPath.status === 'active',
                lastRun: apiPath.last_run
            }));
            
            console.log(`Loaded ${automationPaths.length} paths from API`);
            renderAutomationPaths();
        } else {
            console.error('Failed to load from API, status:', response.status);
            // Fallback to empty if API fails
            automationPaths = [];
            renderAutomationPaths();
        }
    } catch (error) {
        console.error('Error in loadAutomationPaths:', error);
        automationPaths = [];
        renderAutomationPaths();
    }
}

/**
 * Process loaded automation paths
 * @param {Array} paths - The loaded paths to process
 */
function processLoadedPaths(paths) {
    // Filter out any invalid paths
    automationPaths = paths.filter(path => {
        return path && typeof path === 'object' && path.name;
    });
    
    // Ensure all paths have the required properties
    automationPaths = automationPaths.map(path => {
        // Make sure schedule has all required properties
        if (!path.schedule) path.schedule = {};
        if (!path.schedule.type) path.schedule.type = 'daily';
        if (!path.schedule.interval) path.schedule.interval = '1';
        if (!path.schedule.unit) path.schedule.unit = 'days';
        if (!path.schedule.time) path.schedule.time = '14:00';
        
        // Make sure languages are set
        if (!path.languages) path.languages = { english: true, swedish: true };
        
        return path;
    });
    
    // Render the automation paths
    renderAutomationPaths();
    
    console.log('Loaded automation paths:', automationPaths);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add new automation path
    const addPathButton = document.querySelector('.add-automation-path');
    if (addPathButton) {
        addPathButton.addEventListener('click', openAutomationPathForm);
    }
    
    // Close modal
    const closeButtons = document.querySelectorAll('.automation-path-modal .close-btn, .automation-path-modal .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeAutomationPathForm);
    });
    
    // Save automation path
    const saveButton = document.querySelector('.automation-path-form .save-btn');
    if (saveButton) {
        saveButton.addEventListener('click', saveAutomationPath);
    }
    
    // Generate and publish now
    const generateNowButton = document.querySelector('.automation-path-form .generate-now-btn');
    if (generateNowButton) {
        generateNowButton.addEventListener('click', generateAndPublishNow);
    }
    
    // Schedule option selection
    document.addEventListener('click', function(event) {
        if (event.target.closest('.schedule-option')) {
            selectScheduleOption(event.target.closest('.schedule-option'));
        }
    });
    
    // Assistant type selection
    const assistantTypeSelect = document.getElementById('assistant-type');
    if (assistantTypeSelect) {
        assistantTypeSelect.addEventListener('change', function() {
            const assistantIdGroup = document.querySelector('.assistant-id-group');
            if (assistantIdGroup) {
                if (this.value === 'custom') {
                    assistantIdGroup.classList.add('visible');
                } else {
                    assistantIdGroup.classList.remove('visible');
                }
            }
        });
    }
    
    // Category +/- buttons
    setupCategoryButtons();
    
    // Path actions (edit, delete, toggle)
    document.addEventListener('click', function(event) {
        // Edit path
        if (event.target.closest('.edit-btn')) {
            const pathElement = event.target.closest('.automation-path');
            const pathIndex = pathElement ? parseInt(pathElement.dataset.index) : -1;
            if (pathIndex >= 0) {
                editAutomationPath(pathIndex);
            }
        }
        
        // Delete path
        if (event.target.closest('.delete-btn')) {
            const pathElement = event.target.closest('.automation-path');
            const pathIndex = pathElement ? parseInt(pathElement.dataset.index) : -1;
            if (pathIndex >= 0) {
                deleteAutomationPath(pathIndex);
            }
        }
        
        // Toggle path status
        if (event.target.closest('.status-toggle input')) {
            const pathElement = event.target.closest('.automation-path');
            const pathIndex = pathElement ? parseInt(pathElement.dataset.index) : -1;
            if (pathIndex >= 0) {
                toggleAutomationPath(pathIndex);
            }
        }
    });
}

/**
 * Render automation paths
 */
function renderAutomationPaths() {
    const container = document.querySelector('.automation-paths-container');
    if (!container) return;
    
    // Save existing status cards before clearing
    const statusCards = Array.from(container.querySelectorAll('.execution-status-card'));
    
    // Clear the container
    container.innerHTML = '';
    
    // Add each path
    if (automationPaths.length > 0) {
        automationPaths.forEach((path, index) => {
            const pathElement = createAutomationPathElement(path, index);
            container.appendChild(pathElement);
            
            // Add event listeners
            const toggleSwitch = pathElement.querySelector('input[type="checkbox"]');
            if (toggleSwitch) {
                toggleSwitch.addEventListener('change', () => {
                    toggleAutomationPath(index);
                });
            }
            
            const editButton = pathElement.querySelector('.edit-btn');
            if (editButton) {
                editButton.addEventListener('click', () => {
                    editAutomationPath(index);
                });
            }
            
            const deleteButton = pathElement.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    deleteAutomationPath(index);
                });
            }
        });
    } else {
        // Show empty state
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <h3>No Automation Paths</h3>
                <p>Create your first automation path to start generating content automatically.</p>
            </div>
        `;
    }
    
    // Restore status cards
    statusCards.forEach(card => {
        container.appendChild(card);
    });
}

/**
 * Create an automation path element
 * @param {Object} path - The automation path object
 * @param {number} index - The index of the path in the array
 * @returns {HTMLElement} - The automation path element
 */
function createAutomationPathElement(path, index) {
    const pathElement = document.createElement('div');
    pathElement.className = 'automation-path';
    pathElement.dataset.index = index;
    
    // Calculate next run time
    const nextRun = calculateNextRun(path);
    
    // Initialize generation count if not exists
    if (path.generationCount === undefined) {
        path.generationCount = 0;
    }
    
    // Create exact match to reference image - with boxes in a grid layout
    pathElement.innerHTML = `
        <div class="automation-path-header">
            <i class="fas fa-robot"></i>
            <h3>${path.name}</h3>
            <div class="path-actions">
                <label class="switch">
                    <input type="checkbox" ${path.active ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                ${path.active ? '<span class="toggle-active">Active</span>' : ''}
                <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="automation-path-grid">
            <div class="grid-box">
                <h4>Schedule</h4>
                <p>${getScheduleText(path.schedule)}</p>
                ${nextRun ? `<p class="next-run">Next run: ${nextRun}</p>` : ''}
            </div>
            <div class="grid-box">
                <h4>Content Type</h4>
                <p>${path.contentType}</p>
            </div>
            <div class="grid-box">
                <h4>Assistant</h4>
                <p>${getAssistantTypeText(path.assistant)}</p>
            </div>
            <div class="grid-box">
                <h4>Categories</h4>
                <div class="tags-container">
                    <span class="tag">${path.category}</span>
                    ${path.subcategory ? `<span class="tag">${path.subcategory}</span>` : ''}
                </div>
            </div>
            <div class="grid-box">
                <h4>Topics</h4>
                <p>${path.topics || ''}</p>
            </div>
            <div class="grid-box">
                <h4>Languages</h4>
                <div class="tags-container">
                    <span class="tag">English</span>
                    ${path.languages && path.languages.swedish ? `<span class="tag">Swedish</span>` : ''}
                </div>
            </div>
            <div class="grid-box generation-box">
                <h4>Generation Stats</h4>
                <div class="generation-stats">
                    <p><i class="fas fa-sync-alt"></i> <span class="generation-count">${path.generationCount || 0}</span> posts generated</p>
                </div>
            </div>
        </div>
    `;
    
    return pathElement;
}

/**
 * Get schedule text description
 * @param {Object} schedule - The schedule object
 * @returns {string} - The schedule text description
 */
function getScheduleText(schedule) {
    // Format time if available
    const timeStr = schedule.time ? ` at ${formatTime(schedule.time)}` : '';
    
    switch (schedule.type) {
        case 'daily':
            return `Every day${timeStr}`;
        case 'every2days':
            return `Every 2 days${timeStr}`;
        case 'weekly':
            return `Every week${timeStr}`;
        case 'biweekly':
            return `Every 2 weeks${timeStr}`;
        case 'monthly':
            return `Every month${timeStr}`;
        case 'custom':
            return `Every ${schedule.interval} ${schedule.unit}${timeStr}`;
        default:
            return 'Unknown schedule';
    }
}

/**
 * Format time from 24-hour to 12-hour format
 * @param {string} time - Time in 24-hour format (HH:MM)
 * @returns {string} - Time in 12-hour format
 */
function formatTime(time) {
    if (!time) return '';
    
    try {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        
        return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return time; // Return original time if there's an error
    }
}

/**
 * Get assistant type text description
 * @param {Object} assistant - The assistant object
 * @returns {string} - The assistant text description
 */
function getAssistantTypeText(assistant) {
    if (!assistant) return 'Default';
    
    switch (assistant.type) {
        case 'default':
            return 'Default (GPT Model)';
        case 'recipe-creator':
            return 'Recipe Creator';
        case 'restaurant-reviewer':
            return 'Restaurant Reviewer';
        case 'food-blogger':
            return 'Food Blogger';
        case 'nutrition-expert':
            return 'Nutrition Expert';
        case 'custom':
            return `Custom (${assistant.id || 'No ID'})`;
        default:
            return assistant.type || 'Default';
    }
}

/**
 * Calculate next run time
 * @param {Object} path - The automation path object
 * @returns {string} - The next run time as a string
 */
function calculateNextRun(path) {
    if (!path || !path.active) return null;
    if (!path.schedule || !path.schedule.time) return null;
    
    // Get the current date and time
    const now = new Date();
    
    // Format the date part
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Create a new date for the next run
    let nextRun = new Date();
    
    // Set the time from the schedule for calculation purposes only
    if (path.schedule.time) {
        const [hours, minutes] = path.schedule.time.split(':').map(Number);
        nextRun.setHours(hours, minutes, 0, 0);
    }
    
    // If the time is already past for today, move to tomorrow
    if (nextRun < now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Determine the date string
    let dateStr;
    if (nextRun.toDateString() === today.toDateString()) {
        dateStr = 'Today';
    } else if (nextRun.toDateString() === tomorrow.toDateString()) {
        dateStr = 'Tomorrow';
    } else {
        dateStr = nextRun.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // CRITICAL: Use the EXACT time string from the schedule without any modification
    // This is the key fix - we return the original time string exactly as entered
    return `${dateStr}, ${path.schedule.time}`;
}

/**
 * Open the automation path form
 */
function openAutomationPathForm() {
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        // Load categories from backend API
        loadCategoriesFromAPI();
        
        // Load custom assistants from backend API
        loadAssistantsFromAPI();
        
        // Load media folders from backend API
        loadMediaFoldersFromAPI();
        
        // Load prompt templates from backend API
        loadPromptTemplatesFromAPI();
        
        // Show the modal
        modal.classList.add('active');
    }
}

/**
 * Load categories from the categories section (legacy - localStorage)
 */
function loadCategories() {
    // Get the category and subcategory select elements
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    if (!categorySelect || !subcategorySelect) return;
    
    try {
        // Get categories from localStorage
        const savedCategories = localStorage.getItem('blogCategories');
        if (savedCategories) {
            const categories = JSON.parse(savedCategories);
            
            // Clear existing options except the first one
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            
            // Add categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
                
                // Add subcategories
                if (category.subcategories && category.subcategories.length > 0) {
                    category.subcategories.forEach(subcategory => {
                        const subOption = document.createElement('option');
                        subOption.value = subcategory;
                        subOption.textContent = subcategory;
                        subOption.dataset.parentCategory = category.name;
                        subcategorySelect.appendChild(subOption);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Load categories from backend API (D1)
 */
async function loadCategoriesFromAPI() {
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    if (!categorySelect) return;
    
    try {
        const response = await fetch('/api/categories?include_subcategories=true');
        if (response.ok) {
            const categories = await response.json();
            
            // Clear existing options except the first one
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            if (subcategorySelect) {
                while (subcategorySelect.options.length > 1) {
                    subcategorySelect.remove(1);
                }
            }
            
            // Store for subcategory filtering
            window.automationCategories = categories;
            
            // Add categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                option.dataset.categoryId = category.id;
                categorySelect.appendChild(option);
            });
            
            // Set up category change handler for subcategory filtering
            categorySelect.addEventListener('change', function() {
                updateSubcategoryOptions(this.value);
            });
            
            console.log(`Loaded ${categories.length} categories from API`);
        } else {
            console.warn('Failed to load categories from API, falling back to localStorage');
            loadCategories();
        }
    } catch (error) {
        console.error('Error loading categories from API:', error);
        loadCategories();
    }
}

/**
 * Update subcategory options based on selected category
 */
function updateSubcategoryOptions(categoryName) {
    const subcategorySelect = document.getElementById('subcategory');
    if (!subcategorySelect || !window.automationCategories) return;
    
    // Clear existing options
    subcategorySelect.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';
    
    // Find the selected category
    const category = window.automationCategories.find(c => c.name === categoryName);
    
    if (category && category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.name;
            option.textContent = sub.name;
            option.dataset.subcategoryId = sub.id;
            subcategorySelect.appendChild(option);
        });
        subcategorySelect.disabled = false;
    } else {
        subcategorySelect.innerHTML = '<option value="" disabled selected>No subcategories available</option>';
        subcategorySelect.disabled = true;
    }
}

/**
 * Load AI assistants from backend API
 */
async function loadAssistantsFromAPI() {
    const assistantTypeSelect = document.getElementById('assistant-type');
    const assistantIdGroup = document.querySelector('.assistant-id-group');
    const assistantIdInput = document.getElementById('assistant-id');
    
    if (!assistantTypeSelect) return;
    
    try {
        const response = await fetch('/api/automation/assistants?active_only=true');
        if (response.ok) {
            const assistants = await response.json();
            
            // Remove existing custom assistant options
            const options = Array.from(assistantTypeSelect.options);
            for (let i = options.length - 1; i >= 0; i--) {
                if (options[i].value.startsWith('custom-') || options[i].parentElement?.tagName === 'OPTGROUP') {
                    options[i].remove();
                }
            }
            
            // Remove existing optgroup
            const existingOptgroup = assistantTypeSelect.querySelector('optgroup');
            if (existingOptgroup) existingOptgroup.remove();
            
            // Group assistants by type
            const defaultAssistants = assistants.filter(a => a.type !== 'custom');
            const customAssistants = assistants.filter(a => a.type === 'custom' || a.openai_assistant_id);
            
            // Update default options with backend assistants
            defaultAssistants.forEach(assistant => {
                // Check if option already exists
                let existingOption = Array.from(assistantTypeSelect.options).find(
                    opt => opt.value === assistant.type
                );
                if (existingOption) {
                    existingOption.dataset.assistantId = assistant.openai_assistant_id;
                    existingOption.dataset.instructions = assistant.instructions || '';
                }
            });
            
            // Add custom assistants
            if (customAssistants.length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = 'Custom Assistants';
                
                customAssistants.forEach(assistant => {
                    const option = document.createElement('option');
                    option.value = `custom-${assistant.id}`;
                    option.textContent = assistant.name;
                    option.dataset.assistantId = assistant.openai_assistant_id;
                    option.dataset.dbId = assistant.id;
                    optgroup.appendChild(option);
                });
                
                assistantTypeSelect.appendChild(optgroup);
            }
            
            // Set up change handler
            assistantTypeSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                if (this.value === 'custom' || this.value.startsWith('custom-')) {
                    if (assistantIdGroup) assistantIdGroup.classList.add('visible');
                    if (assistantIdInput && selectedOption.dataset.assistantId) {
                        assistantIdInput.value = selectedOption.dataset.assistantId;
                    }
                } else {
                    if (assistantIdGroup) assistantIdGroup.classList.remove('visible');
                }
            });
            
            console.log(`Loaded ${assistants.length} assistants from API`);
        } else {
            console.warn('Failed to load assistants from API, falling back to localStorage');
            loadCustomAssistants();
        }
    } catch (error) {
        console.error('Error loading assistants from API:', error);
        loadCustomAssistants();
    }
}

/**
 * Load media folders from backend API
 */
async function loadMediaFoldersFromAPI() {
    const mediaFolderSelect = document.getElementById('media-folder');
    if (!mediaFolderSelect) return;
    
    try {
        const response = await fetch('/api/media/folders');
        if (response.ok) {
            const folders = await response.json();
            
            // Clear existing options except the first one (Use Random Images)
            while (mediaFolderSelect.options.length > 1) {
                mediaFolderSelect.remove(1);
            }
            
            // Add folders
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.name;
                option.textContent = `${folder.name} (${folder.file_count} files)`;
                mediaFolderSelect.appendChild(option);
            });
            
            console.log(`Loaded ${folders.length} media folders from API`);
        }
    } catch (error) {
        console.error('Error loading media folders from API:', error);
    }
}

/**
 * Load prompt templates from backend API
 */
async function loadPromptTemplatesFromAPI() {
    try {
        const response = await fetch('/api/automation/prompts');
        if (response.ok) {
            const prompts = await response.json();
            
            // Store prompts for use in the form
            window.automationPrompts = prompts;
            
            // Populate prompt template dropdown if it exists
            const promptSelect = document.getElementById('prompt-template-select');
            if (promptSelect) {
                // Clear existing options
                promptSelect.innerHTML = '<option value="">Custom Prompt</option>';
                
                prompts.forEach(prompt => {
                    const option = document.createElement('option');
                    option.value = prompt.id;
                    option.textContent = prompt.name;
                    option.dataset.template = prompt.prompt_template;
                    option.dataset.variables = JSON.stringify(prompt.variables);
                    promptSelect.appendChild(option);
                });
            }
            
            console.log(`Loaded ${prompts.length} prompt templates from API`);
        }
    } catch (error) {
        console.error('Error loading prompt templates from API:', error);
    }
}

/**
 * Setup category +/- buttons for quick add/remove
 */
function setupCategoryButtons() {
    // Category add button
    document.addEventListener('click', async function(event) {
        // Add category button
        if (event.target.closest('.add-category-btn') || 
            (event.target.closest('button') && event.target.closest('.form-group')?.querySelector('#category'))) {
            const btn = event.target.closest('button');
            if (btn && btn.textContent.includes('+')) {
                event.preventDefault();
                await quickAddCategory();
            } else if (btn && btn.textContent.includes('-') || btn?.textContent.includes('−')) {
                event.preventDefault();
                await quickRemoveCategory();
            }
        }
        
        // Add subcategory button
        if (event.target.closest('.add-subcategory-btn') || 
            (event.target.closest('button') && event.target.closest('.form-group')?.querySelector('#subcategory'))) {
            const btn = event.target.closest('button');
            if (btn && btn.textContent.includes('+')) {
                event.preventDefault();
                await quickAddSubcategory();
            } else if (btn && btn.textContent.includes('-') || btn?.textContent.includes('−')) {
                event.preventDefault();
                await quickRemoveSubcategory();
            }
        }
    });
}

/**
 * Quick add a new category from the automation form
 */
async function quickAddCategory() {
    const categoryName = prompt('Enter new category name:');
    if (!categoryName || !categoryName.trim()) return;
    
    const name = categoryName.trim();
    
    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Category created:', result);
            
            // Add to dropdown
            const categorySelect = document.getElementById('category');
            if (categorySelect) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.dataset.categoryId = result.category?.id;
                categorySelect.appendChild(option);
                categorySelect.value = name;
            }
            
            // Refresh categories
            await loadCategoriesFromAPI();
            
            alert(`Category "${name}" created successfully!`);
        } else {
            const error = await response.json();
            alert('Failed to create category: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating category:', error);
        alert('Error creating category: ' + error.message);
    }
}

/**
 * Quick remove the selected category
 */
async function quickRemoveCategory() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect || !categorySelect.value) {
        alert('Please select a category to remove');
        return;
    }
    
    const categoryName = categorySelect.value;
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const categoryId = selectedOption.dataset.categoryId;
    
    if (!confirm(`Are you sure you want to remove the category "${categoryName}"?`)) {
        return;
    }
    
    try {
        // Try to delete by ID first, then by name
        let response;
        if (categoryId) {
            response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
        } else {
            // Find category by name first
            const categories = await fetch('/api/categories').then(r => r.json());
            const category = categories.find(c => c.name === categoryName);
            if (category) {
                response = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
            }
        }
        
        if (response && response.ok) {
            console.log('Category deleted');
            
            // Remove from dropdown
            selectedOption.remove();
            categorySelect.value = '';
            
            // Refresh categories
            await loadCategoriesFromAPI();
            
            alert(`Category "${categoryName}" removed successfully!`);
        } else {
            const error = await response?.json();
            alert('Failed to remove category: ' + (error?.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error removing category:', error);
        alert('Error removing category: ' + error.message);
    }
}

/**
 * Quick add a new subcategory from the automation form
 */
async function quickAddSubcategory() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect || !categorySelect.value) {
        alert('Please select a category first');
        return;
    }
    
    const parentCategory = categorySelect.value;
    const subcategoryName = prompt(`Enter new subcategory name for "${parentCategory}":`);
    if (!subcategoryName || !subcategoryName.trim()) return;
    
    const name = subcategoryName.trim();
    
    try {
        const response = await fetch('/api/subcategories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, parent_category: parentCategory })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Subcategory created:', result);
            
            // Add to dropdown
            const subcategorySelect = document.getElementById('subcategory');
            if (subcategorySelect) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.dataset.subcategoryId = result.subcategory?.id;
                subcategorySelect.appendChild(option);
                subcategorySelect.value = name;
                subcategorySelect.disabled = false;
            }
            
            // Refresh categories
            await loadCategoriesFromAPI();
            
            alert(`Subcategory "${name}" created successfully!`);
        } else {
            const error = await response.json();
            alert('Failed to create subcategory: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating subcategory:', error);
        alert('Error creating subcategory: ' + error.message);
    }
}

/**
 * Quick remove the selected subcategory
 */
async function quickRemoveSubcategory() {
    const subcategorySelect = document.getElementById('subcategory');
    if (!subcategorySelect || !subcategorySelect.value) {
        alert('Please select a subcategory to remove');
        return;
    }
    
    const subcategoryName = subcategorySelect.value;
    const selectedOption = subcategorySelect.options[subcategorySelect.selectedIndex];
    const subcategoryId = selectedOption.dataset.subcategoryId;
    
    if (!confirm(`Are you sure you want to remove the subcategory "${subcategoryName}"?`)) {
        return;
    }
    
    try {
        // Find and delete subcategory
        const subcategories = await fetch('/api/subcategories').then(r => r.json());
        const subcategory = subcategories.find(s => s.name === subcategoryName);
        
        if (subcategory) {
            const response = await fetch(`/api/subcategories/${subcategoryId || subcategory.id}`, { 
                method: 'DELETE' 
            });
            
            if (response.ok) {
                console.log('Subcategory deleted');
                
                // Remove from dropdown
                selectedOption.remove();
                subcategorySelect.value = '';
                
                // Refresh categories
                await loadCategoriesFromAPI();
                
                alert(`Subcategory "${subcategoryName}" removed successfully!`);
            } else {
                const error = await response.json();
                alert('Failed to remove subcategory: ' + (error.error || 'Unknown error'));
            }
        }
    } catch (error) {
        console.error('Error removing subcategory:', error);
        alert('Error removing subcategory: ' + error.message);
    }
}

/**
 * Load custom assistants from AI Configuration
 */
function loadCustomAssistants() {
    // Get the assistant type select element
    const assistantTypeSelect = document.getElementById('assistant-type');
    const assistantIdGroup = document.querySelector('.assistant-id-group');
    const assistantIdInput = document.getElementById('assistant-id');
    
    if (!assistantTypeSelect) return;
    
    try {
        // Get custom assistants from AI Configuration
        let customAssistants = [];
        
        // Ensure we have a valid aiConfig object with customAssistants
        if (!window.aiConfig) {
            window.aiConfig = {
                customAssistants: [],
                getCustomAssistants: function() { return []; }
            };
        }
        
        // Ensure customAssistants exists in the aiConfig object
        if (!window.aiConfig.customAssistants) {
            window.aiConfig.customAssistants = [];
            
            // Try to save this to localStorage to persist it
            try {
                const config = JSON.parse(localStorage.getItem('aiConfig') || '{}');
                config.customAssistants = [];
                localStorage.setItem('aiConfig', JSON.stringify(config));
            } catch (e) {
                // Silent catch - we've already set the property in memory
            }
        }
        
        // Now safely get custom assistants
        if (typeof window.aiConfig.getCustomAssistants === 'function') {
            try {
                customAssistants = window.aiConfig.getCustomAssistants();
            } catch (e) {
                // If there's still an error, use the property directly
                customAssistants = window.aiConfig.customAssistants || [];
            }
        } else {
            // If the function doesn't exist, use the property directly
            customAssistants = window.aiConfig.customAssistants || [];
        }
        
        // If no custom assistants were found or there was an error, try localStorage
        if (!customAssistants || customAssistants.length === 0) {
            // Try to get custom assistants directly from localStorage
            const savedConfig = localStorage.getItem('aiConfig');
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    if (config && Array.isArray(config.customAssistants)) {
                        customAssistants = config.customAssistants;
                        
                        // Update window.aiConfig if it exists
                        if (window.aiConfig) {
                            window.aiConfig.customAssistants = customAssistants;
                        }
                    }
                } catch (e) {
                    console.warn('Error parsing saved AI configuration:', e);
                }
            }
        }
        
        // Clear existing custom assistant options
        const options = Array.from(assistantTypeSelect.options);
        for (let i = options.length - 1; i >= 0; i--) {
            if (options[i].value.startsWith('custom-')) {
                assistantTypeSelect.remove(i);
            }
        }
        
        // Add custom assistants
        if (customAssistants && customAssistants.length > 0) {
            // Create an optgroup for custom assistants
            let optgroup = document.querySelector('optgroup[label="Custom Assistants"]');
            if (!optgroup) {
                optgroup = document.createElement('optgroup');
                optgroup.label = 'Custom Assistants';
                assistantTypeSelect.appendChild(optgroup);
            } else {
                // Clear existing options in the optgroup
                while (optgroup.firstChild) {
                    optgroup.removeChild(optgroup.firstChild);
                }
            }
            
            // Add each custom assistant
            customAssistants.forEach(assistant => {
                const option = document.createElement('option');
                option.value = `custom-${assistant.id}`;
                option.textContent = assistant.name || 'Custom Assistant';
                option.dataset.assistantId = assistant.id;
                optgroup.appendChild(option);
            });
        }
        
        // Set up change event to handle custom assistant selection
        assistantTypeSelect.addEventListener('change', function() {
            if (this.value.startsWith('custom-') && assistantIdGroup) {
                // Extract assistant ID from the option
                const selectedOption = this.options[this.selectedIndex];
                const assistantId = selectedOption.dataset.assistantId;
                
                // Set the assistant ID input value
                if (assistantIdInput && assistantId) {
                    assistantIdInput.value = assistantId;
                }
                
                // Show the assistant ID group
                assistantIdGroup.classList.add('visible');
            } else if (this.value === 'custom' && assistantIdGroup) {
                // Clear the assistant ID input value
                if (assistantIdInput) {
                    assistantIdInput.value = '';
                }
                
                // Show the assistant ID group
                assistantIdGroup.classList.add('visible');
            } else if (assistantIdGroup) {
                // Hide the assistant ID group
                assistantIdGroup.classList.remove('visible');
            }
        });
    } catch (error) {
        console.error('Error loading custom assistants:', error);
    }
}

/**
 * Close the automation path form
 */
function closeAutomationPathForm() {
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset the form
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Reset editing index
        editingPathIndex = -1;
    }
}

/**
 * Select a schedule option
 * @param {HTMLElement} option - The selected option element
 */
function selectScheduleOption(option) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.schedule-option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to the clicked option
    option.classList.add('selected');
    
    // Show/hide custom schedule form
    const customSchedule = document.querySelector('.custom-schedule');
    if (customSchedule) {
        if (option.dataset.schedule === 'custom') {
            customSchedule.classList.add('visible');
        } else {
            customSchedule.classList.remove('visible');
        }
    }
}

/**
 * Save the automation path
 */
async function saveAutomationPath() {
    // Get form values
    const nameInput = document.getElementById('path-name');
    const contentTypeSelect = document.getElementById('content-type');
    const assistantTypeSelect = document.getElementById('assistant-type');
    const assistantIdInput = document.getElementById('assistant-id');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const topicsInput = document.getElementById('topics');
    const promptTemplateInput = document.getElementById('prompt-template');
    const selectedScheduleOption = document.querySelector('.schedule-option.selected');
    const customIntervalInput = document.getElementById('custom-interval');
    const customUnitSelect = document.getElementById('custom-unit');
    const scheduleTimeInput = document.getElementById('schedule-time');
    const includeImagesCheckbox = document.getElementById('include-images');
    const langSwedishCheckbox = document.getElementById('lang-swedish');
    
    // Validate required fields
    if (!nameInput || !nameInput.value.trim()) {
        alert('Please enter a name for the automation path');
        return;
    }
    
    if (!selectedScheduleOption) {
        alert('Please select a schedule option');
        return;
    }
    
    // Get media folder selection
    const mediaFolderSelect = document.getElementById('media-folder');
    
    // Get mode toggle
    const modeToggle = document.getElementById('mode-toggle');
    const mode = (modeToggle && !modeToggle.checked) ? 'generate_now' : 'schedule';
    
    const scheduleType = selectedScheduleOption.dataset.schedule;
    
    // Prepare data for API
    const pathData = {
        name: nameInput.value.trim(),
        content_type: contentTypeSelect ? contentTypeSelect.value : 'general',
        assistant_id: (assistantTypeSelect && assistantTypeSelect.value === 'custom') ? (assistantIdInput ? assistantIdInput.value.trim() : '') : '',
        category: categorySelect ? categorySelect.value : 'Uncategorized',
        subcategory: subcategorySelect ? subcategorySelect.value : '',
        topics: topicsInput ? topicsInput.value.trim().split(',').map(t => t.trim()).filter(t => t) : [],
        prompt_template: promptTemplateInput ? promptTemplateInput.value.trim() : '',
        schedule_type: scheduleType,
        schedule_time: scheduleTimeInput ? scheduleTimeInput.value : '14:00',
        include_images: includeImagesCheckbox ? includeImagesCheckbox.checked : true,
        media_folder: mediaFolderSelect ? mediaFolderSelect.value : '',
        languages: [
            'en', // English is always enabled
            ...(langSwedishCheckbox && langSwedishCheckbox.checked ? ['sv'] : [])
        ],
        mode: mode,
        status: 'active'
    };

    try {
        let response;
        
        // Show saving indicator if desired...
        
        if (editingPathIndex >= 0 && editingPathIndex < automationPaths.length) {
            // Update existing path
            const id = automationPaths[editingPathIndex].id;
            response = await fetch(`/api/automation/paths/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pathData)
            });
        } else {
            // Create new path
            response = await fetch('/api/automation/paths', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pathData)
            });
        }

        if (response.ok) {
            console.log('Automation path saved successfully via API');
            // Reload paths to get fresh data
            await loadAutomationPaths();
            
            // Close the form
            closeAutomationPathForm();
            
            // Reinitialize scheduler
            initScheduler();
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to save path:', errorData);
            alert('Failed to save automation path: ' + (errorData.error || response.statusText));
        }
    } catch (error) {
        console.error('Error saving path:', error);
        alert('Error saving path: ' + error.message);
    }
}

/**
 * Save automation paths to storage
 * NOTE: This function is deprecated - all saves now go through the API
 * Keeping it as a no-op for backward compatibility
 */
function saveAutomationPathsToStorage() {
    console.log('saveAutomationPathsToStorage: Deprecated - paths are saved via API');
    // Clear localStorage to prevent stale data
    try {
        localStorage.removeItem('aiAutomationPaths');
        sessionStorage.removeItem('aiAutomationPaths');
    } catch (e) {
        // Ignore errors
    }
    return true;
}

/**
 * Edit an automation path
 * @param {number} index - The index of the path to edit
 */
function editAutomationPath(index) {
    if (index < 0 || index >= automationPaths.length) return;
    
    // Set editing index
    editingPathIndex = index;
    
    // Get the path
    const path = automationPaths[index];
    
    // Fill the form
    const nameInput = document.getElementById('path-name');
    const contentTypeSelect = document.getElementById('content-type');
    const assistantTypeSelect = document.getElementById('assistant-type');
    const assistantIdInput = document.getElementById('assistant-id');
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    const topicsInput = document.getElementById('topics');
    const promptTemplateInput = document.getElementById('prompt-template');
    const scheduleOptions = document.querySelectorAll('.schedule-option');
    const customIntervalInput = document.getElementById('custom-interval');
    const customUnitSelect = document.getElementById('custom-unit');
    const scheduleTimeInput = document.getElementById('schedule-time');
    const includeImagesCheckbox = document.getElementById('include-images');
    const langSwedishCheckbox = document.getElementById('lang-swedish');
    const mediaFolderSelect = document.getElementById('media-folder');
    
    if (nameInput) nameInput.value = path.name;
    if (contentTypeSelect) contentTypeSelect.value = path.contentType;
    
    // Set assistant settings
    if (assistantTypeSelect && path.assistant) {
        assistantTypeSelect.value = path.assistant.type || 'default';
        
        // Show/hide assistant ID field
        const assistantIdGroup = document.querySelector('.assistant-id-group');
        if (assistantIdGroup) {
            if (path.assistant.type === 'custom') {
                assistantIdGroup.classList.add('visible');
                if (assistantIdInput) assistantIdInput.value = path.assistant.id || '';
            } else {
                assistantIdGroup.classList.remove('visible');
            }
        }
    }
    
    if (categorySelect) categorySelect.value = path.category;
    if (subcategorySelect) subcategorySelect.value = path.subcategory || '';
    if (topicsInput) topicsInput.value = path.topics;
    if (promptTemplateInput) promptTemplateInput.value = path.promptTemplate;
    if (langSwedishCheckbox && path.languages) langSwedishCheckbox.checked = path.languages.swedish;
    
    // Select the schedule option
    scheduleOptions.forEach(option => {
        if (option.dataset.schedule === path.schedule.type) {
            selectScheduleOption(option);
        }
    });
    
    // Set custom schedule values
    if (customIntervalInput) customIntervalInput.value = path.schedule.interval;
    if (customUnitSelect) customUnitSelect.value = path.schedule.unit;
    
    // Set schedule time
    if (scheduleTimeInput && path.schedule.time) {
        scheduleTimeInput.value = path.schedule.time;
    }
    
    // Set include images checkbox
    if (includeImagesCheckbox) includeImagesCheckbox.checked = path.includeImages;
    
    // Set media folder
    if (mediaFolderSelect && path.mediaFolder) {
        mediaFolderSelect.value = path.mediaFolder;
    }
    
    // Show the form
    openAutomationPathForm();
}

/**
 * Delete an automation path
 * @param {number} index - The index of the path to delete
 */
async function deleteAutomationPath(index) {
    if (confirm('Are you sure you want to delete this automation path?')) {
        const path = automationPaths[index];
        if (path && path.id) {
            try {
                const response = await fetch(`/api/automation/paths/${path.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log('Path deleted successfully via API');
                    await loadAutomationPaths();
                    // Reinitialize scheduler
                    initScheduler();
                } else {
                    console.error('Failed to delete path via API');
                    alert('Failed to delete path');
                }
            } catch (error) {
                console.error('Error deleting path:', error);
                alert('Error deleting path');
            }
        } else {
            // Fallback for paths without ID (legacy?)
            automationPaths.splice(index, 1);
            // We can't sync to API easily if no ID, so just update UI
            renderAutomationPaths();
            initScheduler();
        }
    }
}

/**
 * Toggle an automation path's active status
 * @param {number} index - The index of the path to toggle
 */
async function toggleAutomationPath(index) {
    if (index < 0 || index >= automationPaths.length) return;
    
    const path = automationPaths[index];
    if (!path.id) return;

    const newStatus = path.active ? 'paused' : 'active';
    
    // Map UI path to API structure for update
    const apiData = {
        name: path.name,
        content_type: path.contentType,
        assistant_id: path.assistant ? path.assistant.id : '',
        category: path.category,
        subcategory: path.subcategory,
        topics: path.topics ? path.topics.split(',').map(t => t.trim()).filter(t => t) : [],
        mode: 'schedule',
        schedule_type: path.schedule.type,
        schedule_time: path.schedule.time,
        prompt_template: path.promptTemplate,
        include_images: path.includeImages,
        media_folder: path.mediaFolder,
        languages: [
            'en',
            ...(path.languages && path.languages.swedish ? ['sv'] : [])
        ],
        status: newStatus,
        last_run: path.lastRun
    };

    try {
        const response = await fetch(`/api/automation/paths/${path.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiData)
        });
        
        if (response.ok) {
            console.log('Path toggled successfully via API');
            await loadAutomationPaths();
            initScheduler();
        } else {
            console.error('Failed to toggle path via API');
        }
    } catch (error) {
        console.error('Error toggling path:', error);
    }
}

/**
 * Initialize the scheduler
 */
function initScheduler() {
    console.log('Initializing scheduler...');
    
    // Clear all scheduled tasks
    for (const taskId in scheduledTasks) {
        clearTimeout(scheduledTasks[taskId]);
    }
    scheduledTasks = {};
    
    // Ensure all paths have unique IDs
    automationPaths.forEach((path, index) => {
        if (!path.id) {
            path.id = 'path_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 9);
            // Save the updated path with ID to storage
            saveAutomationPathsToStorage();
        }
    });
    
    // Schedule all active paths
    automationPaths.forEach((path, index) => {
        if (path.active) {
            scheduleAutomationPath(path, index);
        }
    });
    
    // Add persistent status cards for any paths that might be in progress
    // This ensures status cards are restored after page refresh
    const inProgressPaths = getInProgressPaths();
    console.log('In-progress paths:', inProgressPaths);
    
    if (inProgressPaths && inProgressPaths.length > 0) {
        inProgressPaths.forEach(pathId => {
            const pathIndex = automationPaths.findIndex(p => p.id === pathId);
            if (pathIndex !== -1) {
                console.log('Restoring status card for path:', automationPaths[pathIndex].name);
                createExecutionStatusCard(automationPaths[pathIndex]);
            } else {
                console.warn('Path not found for ID:', pathId);
                // Remove this ID from in-progress paths since we can't find it
                removeFromInProgressPaths(pathId);
            }
        });
    }
}

/**
 * Get paths that are currently in progress
 * @returns {Array} - Array of path IDs that are in progress
 */
function getInProgressPaths() {
    const inProgress = localStorage.getItem('aiAutomationInProgress');
    if (inProgress) {
        try {
            return JSON.parse(inProgress);
        } catch (error) {
            console.error('Error parsing in-progress paths:', error);
            return [];
        }
    }
    return [];
}

/**
 * Mark a path as in progress
 * @param {Object} path - The automation path
 */
function markPathInProgress(path) {
    const inProgress = getInProgressPaths();
    if (!inProgress.includes(path.id)) {
        inProgress.push(path.id);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
    }
}

/**
 * Mark a path as no longer in progress
 * @param {Object} path - The automation path
 */
function markPathCompleted(path) {
    if (!path || !path.id) {
        console.error('Cannot mark path as completed: Invalid path or missing ID');
        return;
    }
    
    const inProgress = getInProgressPaths();
    const index = inProgress.indexOf(path.id);
    if (index !== -1) {
        inProgress.splice(index, 1);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log(`Marked path "${path.name}" (ID: ${path.id}) as completed`);
    }
}

/**
 * Remove a path ID from the in-progress list
 * @param {string} pathId - The path ID to remove
 */
function removeFromInProgressPaths(pathId) {
    if (!pathId) {
        console.error('Cannot remove from in-progress paths: Missing path ID');
        return;
    }
    
    const inProgress = getInProgressPaths();
    const index = inProgress.indexOf(pathId);
    if (index !== -1) {
        inProgress.splice(index, 1);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log(`Removed path ID ${pathId} from in-progress paths`);
    }
}

/**
 * Schedule an automation path
 * @param {Object} path - The automation path to schedule
 * @param {number} index - The index of the path in the array
 */
function scheduleAutomationPath(path, index) {
    // Generate a unique ID for the path if it doesn't have one
    if (!path.id) {
        path.id = 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        // Save the updated path with ID to storage
        saveAutomationPathsToStorage();
    }
    
    // Clear any existing scheduled task for this path
    if (scheduledTasks[path.id]) {
        clearTimeout(scheduledTasks[path.id]);
        delete scheduledTasks[path.id];
    }
    
    // If the path is not active, don't schedule it
    if (!path.active) {
        console.log(`Path "${path.name}" is not active, not scheduling`);
        return;
    }
    
    // Calculate the next run time
    const now = new Date();
    const schedule = path.schedule;
    let nextRun = new Date();
    
    // Set the time from schedule - CRITICAL FIX: Preserve exact time as entered
    if (schedule && schedule.time) {
        // Parse the time string exactly as entered without rounding
        const timeComponents = schedule.time.split(':');
        const hours = parseInt(timeComponents[0], 10);
        const minutes = parseInt(timeComponents[1], 10);
        
        // Ensure we're using the exact minutes value from the input
        nextRun.setHours(hours, minutes, 0, 0);
        
        // Log the exact time being set
        console.log(`Setting exact schedule time: ${hours}:${minutes} (from ${schedule.time})`);
        
        // If the time is in the past, move to the next occurrence
        if (nextRun < now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
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
    
    // Calculate milliseconds until next run
    const millisToNextRun = nextRun.getTime() - now.getTime();
    
    // Schedule the task
    scheduledTasks[path.id] = setTimeout(() => {
        executeAutomationPath(path, index);
    }, millisToNextRun);
    
    console.log(`Scheduled path "${path.name}" to run at ${schedule.time} (in ${Math.round(millisToNextRun / 60000)} minutes)`);
}

/**
 * Execute an automation path
 * @param {Object} path - The automation path to execute
 * @param {number} index - The index of the path in the array
 */
function executeAutomationPath(path, index) {
    console.log(`Executing automation path "${path.name}"`);
    
    // Make sure path has an ID
    if (!path.id) {
        path.id = Date.now().toString();
    }
    
    // Update the last run time
    path.lastRun = new Date().toISOString();
    
    // Create a status card for this execution
    createExecutionStatusCard(path);
    
    // Mark path as in progress
    markPathInProgress(path);
    
    // Save to localStorage
    saveAutomationPathsToStorage();
    
    // Generate the post
    generateAutomatedPost(path)
        .then(async result => {
            if (!result || !result.success) {
                throw new Error(result?.error || 'Unknown error generating post');
            }
            
            console.log(`Generated post for "${path.name}": ${result.post.title}`);
            
            // Publish the generated post
            try {
                // Make sure the post has the required fields
                const postToPublish = result.post;
                if (!postToPublish.id) {
                    postToPublish.id = Date.now().toString();
                }
                if (!postToPublish.title) {
                    throw new Error('Generated post has no title');
                }
                if (!postToPublish.content) {
                    throw new Error('Generated post has no content');
                }
                
                // Publish the post via backend/D1
                const publishResult = await publishAutomatedPost(postToPublish);
                console.log('Post published successfully:', publishResult);
                
                // Show a notification
                showPublishNotification(postToPublish);
            } catch (publishError) {
                console.error('Error publishing post:', publishError);
                showPublishNotification(null, publishError);
            }
            
            // Increment generation count
            path.generationCount = (path.generationCount || 0) + 1;
            
            // Save to localStorage
            saveAutomationPathsToStorage();
            
            // Update the UI
            renderAutomationPaths();
            
            // Remove the status card
            removeExecutionStatusCard(path);
            
            // Mark path as completed
            markPathCompleted(path);
            
            // Schedule the next run
            scheduleAutomationPath(path, index);
        })
        .catch(error => {
            console.error(`Error executing automation path "${path.name}":`, error);
            
            // Show error notification
            showPublishNotification(null, error);
            
            // Remove the status card
            removeExecutionStatusCard(path);
            
            // Mark path as completed even on error
            markPathCompleted(path);
            
            // Reschedule the path
            scheduleAutomationPath(automationPaths[index], index);
        });
}

/**
 * Mark a path as in progress
 * @param {Object} path - The automation path
 */
function markPathInProgress(path) {
    if (!path || !path.id) {
        console.error('Cannot mark path as in progress: Invalid path or missing ID');
        return;
    }
    
    console.log(`Marking path as in progress: ${path.name} (${path.id})`);
    
    // Get the current in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Error getting in-progress paths:', error);
    }
    
    // Add the path ID if not already in the list
    if (!inProgress.includes(path.id)) {
        inProgress.push(path.id);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log(`Added path ${path.id} to in-progress list`);
    }
}

/**
 * Mark a path as completed
 * @param {Object} path - The automation path
 */
function markPathCompleted(path) {
    if (!path || !path.id) {
        console.error('Cannot mark path as completed: Invalid path or missing ID');
        return;
    }
    
    console.log(`Marking path as completed: ${path.name} (${path.id})`);
    
    // Get the current in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Error getting in-progress paths:', error);
    }
    
    // Remove the path ID from the list
    const index = inProgress.indexOf(path.id);
    if (index !== -1) {
        inProgress.splice(index, 1);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log(`Removed path ${path.id} from in-progress list`);
    }
}

/**
 * Restore execution status cards for paths that are in progress
 */
function restoreExecutionStatusCards() {
    console.log('Restoring execution status cards...');
    
    // Get the in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Error getting in-progress paths:', error);
    }
    
    if (inProgress.length === 0) {
        console.log('No in-progress paths found');
        return;
    }
    
    console.log(`Found ${inProgress.length} in-progress paths:`, inProgress);
    
    // Get the automation paths
    let automationPaths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            automationPaths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error getting automation paths:', error);
    }
    
    // Create status cards for in-progress paths
    inProgress.forEach(pathId => {
        const path = automationPaths.find(p => p.id === pathId);
        if (path) {
            console.log(`Restoring status card for path: ${path.name}`);
            createExecutionStatusCard(path);
        } else {
            console.warn(`Path not found for ID: ${pathId}`);
            
            // Remove from in-progress list
            const index = inProgress.indexOf(pathId);
            if (index !== -1) {
                inProgress.splice(index, 1);
                localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            }
        }
    });
}

/**
 * Create a status card for execution in progress
 * @param {Object} path - The automation path being executed
 */
function createExecutionStatusCard(path) {
    // Make sure path has an ID
    if (!path || !path.id) {
        console.error('Cannot create execution status card: Invalid path or missing ID');
        return;
    }
    
    // Check if a status card already exists for this path
    const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
    if (existingCard) {
        console.log(`Status card already exists for path ${path.name} (${path.id})`);
        return; // Don't create duplicate cards
    }
    
    // Make sure the container exists
    let container = document.querySelector('.execution-status-cards-container');
    if (!container) {
        console.log('Creating execution status cards container');
        const automationSection = document.querySelector('#ai-automation-section');
        if (automationSection) {
            container = document.createElement('div');
            container.className = 'execution-status-cards-container';
            // Insert at the beginning of the automation section content
            const sectionContent = automationSection.querySelector('.ai-automation-container');
            if (sectionContent) {
                sectionContent.insertBefore(container, sectionContent.firstChild);
            } else {
                automationSection.insertBefore(container, automationSection.querySelector('.section-header').nextSibling);
            }
        } else {
            console.error('Could not find AI Automation section');
            return;
        }
    }
    
    // Mark the path as in progress
    markPathInProgress(path);
    
    // Create the status card
    const statusCard = document.createElement('div');
    statusCard.className = 'execution-status-card';
    statusCard.dataset.pathId = path.id;
    
    statusCard.innerHTML = `
        <div class="status-card-header">
            <i class="fas fa-sync-alt fa-spin"></i>
            <h3>Generating Content</h3>
        </div>
        <div class="status-card-content">
            <p>Generating post for "${path.name}"</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;
    
    // Add to the container
    container.appendChild(statusCard);
    console.log(`Created execution status card for path ${path.name} (${path.id})`);
    
    // Animate the progress bar
    const progressFill = statusCard.querySelector('.progress-fill');
    if (progressFill) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 0.5;
                progressFill.style.width = width + '%';
            }
        }, 500);
        
        // Store the interval ID on the element to clear it later
        statusCard.dataset.intervalId = interval;
    }
}

/**
 * Remove the execution status card
 * @param {Object} path - The automation path
 */
function removeExecutionStatusCard(path) {
    const statusCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
    if (statusCard) {
        // Clear any intervals
        if (statusCard.dataset.intervalId) {
            clearInterval(parseInt(statusCard.dataset.intervalId));
        }
        
        // Remove the card with a fade-out animation
        statusCard.style.opacity = '0';
        setTimeout(() => {
            statusCard.remove();
        }, 500);
    }
}

/**
 * Generate an automated post
 * @param {Object} path - The automation path
 * @returns {Promise<Object>} - The result object
 */
async function generateAutomatedPost(path) {
    try {
        // Get AI configuration
        const aiConfig = window.aiConfig ? window.aiConfig.getConfig() : null;
        
        if (!aiConfig || !aiConfig.apiKey) {
            return {
                success: false,
                error: 'AI configuration not found or API key not set'
            };
        }
        
        // Build the prompt
        let prompt = path.promptTemplate || '';
        if (!prompt) {
            // Default prompt based on content type
            switch (path.contentType) {
                case 'recipe':
                    prompt = 'Create a detailed recipe post with ingredients, instructions, and tips.';
                    break;
                case 'review':
                    prompt = 'Create a restaurant review post with details about ambiance, service, and food quality.';
                    break;
                default:
                    prompt = 'Create an engaging blog post with useful information and tips.';
            }
        }
        
        // Add topics if available
        if (path.topics) {
            prompt += ` Focus on the following topics: ${path.topics}`;
        }
        
        // Generate a title based on the content type and topics
        const title = generateTitle(path.contentType, path.topics);
        
        // Generate the English content first
        const englishPost = await generateLanguagePost(path, prompt, title, 'english');
        
        if (!englishPost.success) {
            return englishPost; // Return the error
        }
        
        // Create the post object with English content
        const post = englishPost.post;
        
        // If Swedish is enabled, generate Swedish content too
        if (path.languages && path.languages.swedish) {
            const swedishPost = await generateLanguagePost(path, prompt, title, 'swedish');
            
            if (swedishPost.success) {
                // Add Swedish content to the post
                post.translations = {
                    swedish: {
                        title: swedishPost.post.title,
                        content: swedishPost.post.content
                    }
                };
            } else {
                console.error('Error generating Swedish content:', swedishPost.error);
                // Continue with just English content
            }
        }
        
        // Generate an image if needed
        if (path.includeImages) {
            try {
                // Use the enhanced generateImageFromFolder function if available
                let imageUrl;
                if (typeof generateImageFromFolder === 'function') {
                    imageUrl = await generateImageFromFolder(title, path.contentType, path.mediaFolder);
                } else {
                    imageUrl = await generateImage(title, path.contentType);
                }
                
                post.image = imageUrl;
                console.log('Generated image:', imageUrl);
            } catch (error) {
                console.error('Error generating image:', error);
                // Continue without an image
            }
        }
        
        // Increment the generation counter
        if (path.generationCount === undefined) {
            path.generationCount = 0;
        }
        path.generationCount++;
        
        return {
            success: true,
            post: post
        };
    } catch (error) {
        console.error('Error generating automated post:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
/**
 * Generate content in a specific language
 * @param {Object} path - The automation path
 * @param {string} basePrompt - The base prompt
 * @param {string} title - The post title
 * @param {string} language - The target language ('english' or 'swedish')
 * @returns {Promise<Object>} - The result object with post data
 */
async function generateLanguagePost(path, basePrompt, title, language) {
    // Process the prompt with variable substitution
    let processedPrompt = processPromptVariables(basePrompt, path);
    let postTitle = title;
    
    // Adjust the prompt for the target language
    if (language === 'swedish') {
        processedPrompt = `Please translate the following content to Swedish, maintaining the same structure and information: ${processedPrompt}`;
        postTitle = `[SV] ${title}`; // Add language prefix to title
    }
    
    // Generate the content
    return new Promise((resolve, reject) => {
        // Get AI configuration
        const aiConfig = window.aiConfig ? window.aiConfig.getConfig() : null;
        
        // Prepare content generation options
        const contentOptions = {
            title: postTitle,
            category: path.category,
            subcategory: path.subcategory,
            tags: path.topics.split(',').map(t => t.trim()).join(', '),
            prompt: processedPrompt,
            language: language // Pass language to the AI config
        };
        
        // Add assistant information if available
        if (path.assistant && path.assistant.type !== 'default') {
            if (path.assistant.type === 'custom' && path.assistant.id) {
                contentOptions.assistantId = path.assistant.id;
            } else if (path.assistant.type.startsWith('custom-')) {
                // Extract the assistant ID from the custom assistant value
                contentOptions.assistantId = path.assistant.type.replace('custom-', '');
            } else {
                contentOptions.assistantType = path.assistant.type;
            }
        }
        
        // Call the content generation function
        window.aiConfig.generateContent(contentOptions, function(result) {
            if (result.success) {
                // Create the post object
                const post = {
                    title: postTitle,
                    content: result.content,
                    category: path.category,
                    subcategory: path.subcategory,
                    tags: path.topics.split(',').map(t => t.trim()),
                    status: 'scheduled',
                    author: 'AI Assistant',
                    date: new Date().toISOString(),
                    featured: false,
                    aiGenerated: true,
                    language: language
                };
                
                resolve({
                    success: true,
                    post: post
                });
            } else {
                resolve({
                    success: false,
                    error: result.error
                });
            }
        });
    });
}

/**
 * Process prompt variables with actual values
 * @param {string} prompt - The prompt template
 * @param {Object} path - The automation path
 * @returns {string} - The processed prompt
 */
function processPromptVariables(prompt, path) {
    if (!prompt) return prompt;
    
    // Get the first topic if available
    const topicsList = path.topics ? path.topics.split(',').map(t => t.trim()) : [];
    const mainTopic = topicsList.length > 0 ? topicsList[0] : '';
    
    // Replace variables with actual values
    let processedPrompt = prompt;
    processedPrompt = processedPrompt.replace(/\{topic\}/g, mainTopic);
    processedPrompt = processedPrompt.replace(/\{category\}/g, path.category || 'Uncategorized');
    processedPrompt = processedPrompt.replace(/\{subcategory\}/g, path.subcategory || '');
    
    // Replace all topics as a comma-separated list
    processedPrompt = processedPrompt.replace(/\{topics\}/g, path.topics || '');
    
    return processedPrompt;
}

/**
 * Generate a title based on content type and topics
 * @param {string} contentType - The content type
 * @param {string} topics - The topics
 * @returns {string} - The generated title
 */
function generateTitle(contentType, topics) {
    const topicsList = topics ? topics.split(',').map(t => t.trim()) : [];
    const randomTopic = topicsList.length > 0 ? topicsList[Math.floor(Math.random() * topicsList.length)] : '';
    
    // Title templates
    const recipeTitles = [
        `Delicious ${randomTopic} Recipe`,
        `Easy ${randomTopic} for Weeknight Dinners`,
        `Homemade ${randomTopic} That Will Impress`,
        `The Perfect ${randomTopic} Recipe`,
        `${randomTopic} Recipe: A Taste of Home`
    ];
    
    const reviewTitles = [
        `${randomTopic} Restaurant Review: A Hidden Gem`,
        `Our Experience at ${randomTopic}`,
        `${randomTopic}: Worth the Hype?`,
        `Dining at ${randomTopic}: What to Expect`,
        `${randomTopic} Review: Food, Ambiance, and Service`
    ];
    
    const generalTitles = [
        `Everything You Need to Know About ${randomTopic}`,
        `${randomTopic}: Tips and Tricks`,
        `The Ultimate Guide to ${randomTopic}`,
        `${randomTopic} 101: A Beginner's Guide`,
        `Why ${randomTopic} Should Be on Your Radar`
    ];
    
    // Select a title based on content type
    let titles;
    switch (contentType) {
        case 'recipe':
            titles = recipeTitles;
            break;
        case 'review':
            titles = reviewTitles;
            break;
        default:
            titles = generalTitles;
    }
    
    // Return a random title
    return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Generate an image for the post
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @returns {Promise<string>} - The image URL
 */
async function generateImage(title, contentType) {
    // In a real implementation, this would call an image generation API
    // For now, we'll return a placeholder image
    const placeholders = {
        recipe: [
            'images/placeholder-recipe-1.jpg',
            'images/placeholder-recipe-2.jpg',
            'images/placeholder-recipe-3.jpg'
        ],
        review: [
            'images/placeholder-restaurant-1.jpg',
            'images/placeholder-restaurant-2.jpg',
            'images/placeholder-restaurant-3.jpg'
        ],
        general: [
            'images/placeholder-food-1.jpg',
            'images/placeholder-food-2.jpg',
            'images/placeholder-food-3.jpg'
        ]
    };
    
    // Select a placeholder based on content type
    let images;
    switch (contentType) {
        case 'recipe':
            images = placeholders.recipe;
            break;
        case 'review':
            images = placeholders.review;
            break;
        default:
            images = placeholders.general;
    }
    
    // Return a random placeholder
    return Promise.resolve(images[Math.floor(Math.random() * images.length)]);
}

/**
 * Publish an automated post (or schedule it)
 * @param {Object} post - The post to publish
 * @param {Object} options - Options including automationPath for context
 * @returns {Promise<Object>} - The result of the publish/schedule operation
 */
async function publishAutomatedPost(post, options = {}) {
    try {
        console.log('Publishing/scheduling automated post:', post.title);
        
        // Validate post
        if (!post) throw new Error('Post is null or undefined');
        if (!post.title) throw new Error('Post has no title');
        if (!post.content) throw new Error('Post has no content');
        
        const automationPath = options.automationPath || options.path;
        
        // Check if this should be scheduled instead of published immediately
        if (options.scheduleFor || (automationPath && automationPath.mode === 'schedule')) {
            return await scheduleAutomatedPost(post, automationPath, options);
        }
        
        // Use BlogDataManager if available
        if (window.blogDataManager) {
            // Prepare the post for publishing
            post.date = new Date().toISOString();
            post.language = 'english'; // Mark the primary language
            post.status = 'published';
            post.category = post.category || 'Uncategorized';
            post.tags = post.tags || [];
            
            // Create the post via API/Manager
            const createdPost = await window.blogDataManager.createPost(post);
            console.log('Post published via BlogDataManager:', createdPost.id);
            
            // If the post has Swedish translation, create a separate post for it
            if (post.translations && post.translations.swedish) {
                const swedishPost = {
                    ...post,
                    title: post.translations.swedish.title,
                    content: post.translations.swedish.content,
                    language: 'swedish',
                    translationOf: createdPost.id, // Reference to the original post ID
                    date: new Date().toISOString(),
                    status: 'published'
                };
                
                // Remove the translations field
                delete swedishPost.translations;
                delete swedishPost.id; // Let backend generate ID or use manager logic
                
                await window.blogDataManager.createPost(swedishPost);
                console.log('Swedish translation published via BlogDataManager');
            }
            
            // Dispatch event for other modules
            document.dispatchEvent(new CustomEvent('aiPostPublished', {
                detail: { 
                    post: createdPost,
                    source: 'ai_automation',
                    automationPathId: automationPath?.id,
                    automationPathName: automationPath?.name
                }
            }));
            
            return { success: true, post: createdPost };
        } else {
            // Fallback to old localStorage method if manager not found
            console.warn('BlogDataManager not found, falling back to localStorage');
            throw new Error('BlogDataManager not initialized');
        }
    } catch (error) {
        console.error('Error publishing automated post:', error);
        return {
            success: false,
            error: error.message || 'Unknown error publishing post'
        };
    }
}

/**
 * Schedule an AI-generated post for later publishing
 * @param {Object} post - The post to schedule
 * @param {Object} automationPath - The automation path that generated this
 * @param {Object} options - Additional options
 */
async function scheduleAutomatedPost(post, automationPath, options = {}) {
    try {
        console.log('Scheduling automated post:', post.title);
        
        // Calculate scheduled datetime
        let scheduledDatetime;
        if (options.scheduleFor) {
            scheduledDatetime = new Date(options.scheduleFor).getTime();
        } else if (automationPath && automationPath.schedule) {
            // Calculate next scheduled time based on path schedule
            scheduledDatetime = calculateNextScheduledTime(automationPath.schedule);
        } else {
            // Default to 1 hour from now
            scheduledDatetime = Date.now() + (60 * 60 * 1000);
        }
        
        // Prepare scheduled post data
        const scheduledPostData = {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            image_url: post.image || post.imageUrl || '',
            category: post.category || 'Uncategorized',
            subcategory: post.subcategory || '',
            tags: post.tags || [],
            author: post.author || 'AI Assistant',
            scheduled_datetime: scheduledDatetime,
            source: 'ai_automation',
            automation_path_id: automationPath?.id,
            automation_path_name: automationPath?.name,
            is_featured: post.featured || false
        };
        
        // Use ScheduledPostsManager if available
        if (window.scheduledPostsManager) {
            const result = await window.scheduledPostsManager.schedulePost(scheduledPostData, 'ai_automation');
            console.log('Post scheduled via ScheduledPostsManager:', result.id);
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('aiPostScheduled', {
                detail: { 
                    scheduledPost: result,
                    source: 'ai_automation',
                    automationPathId: automationPath?.id
                }
            }));
            
            return { success: true, scheduled: true, post: result };
        } else {
            // Fallback to API directly
            const response = await fetch('/api/scheduled-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduledPostData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Post scheduled via API:', result.post.id);
                
                document.dispatchEvent(new CustomEvent('aiPostScheduled', {
                    detail: { scheduledPost: result.post, source: 'ai_automation' }
                }));
                
                return { success: true, scheduled: true, post: result.post };
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to schedule post');
            }
        }
    } catch (error) {
        console.error('Error scheduling automated post:', error);
        return {
            success: false,
            error: error.message || 'Unknown error scheduling post'
        };
    }
}

/**
 * Calculate next scheduled time based on schedule config
 */
function calculateNextScheduledTime(schedule) {
    const now = new Date();
    const [hours, minutes] = (schedule.time || '14:00').split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, move to next occurrence
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.getTime();
}

/**
 * Generate and publish content immediately
 */
/**
 * Show a notification for post publishing
 * @param {Object} post - The published post (null if error)
 * @param {Error} error - Error object if there was an error
 */
function showPublishNotification(post, error) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.publish-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'publish-notification';
        document.body.appendChild(notification);
    }
    
    if (error) {
        // Error notification
        notification.className = 'publish-notification error';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="notification-content">
                <h4>Publishing Failed</h4>
                <p>${error.message || 'An error occurred while publishing the post'}</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
    } else if (post) {
        // Success notification
        notification.className = 'publish-notification success';
        let message = `Post "${post.title}" has been published`;
        if (post.translations && post.translations.swedish) {
            message += ' with Swedish translation';
        }
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="notification-content">
                <h4>Post Published</h4>
                <p>${message}</p>
                <a href="blog.html?post=${post.id}" class="view-post-link" target="_blank">View Post</a>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
    }
    
    // Add event listener to close button
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 8000);
}

function generateAndPublishNow() {
    // Use the implementation from generate-now.js
    if (typeof window.generateNow !== 'undefined' && typeof window.generateNow.generateAndPublishNow === 'function') {
        window.generateNow.generateAndPublishNow();
    } else {
        console.error('Generate & Publish Now functionality not available');
        alert('Generate & Publish Now functionality not available. Please refresh the page and try again.');
    }
}

// Make functions available globally
window.aiAutomation = {
    openAutomationPathForm,
    saveAutomationPath,
    closeAutomationPathForm,
    deleteAutomationPath,
    generateAndPublishNow,
    generateAutomatedPost,
    publishAutomatedPost
};
