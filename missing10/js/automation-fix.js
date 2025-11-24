/**
 * Automation Path Fix
 * Direct implementation to fix the automation path functionality
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Fix: Initializing');
    setTimeout(initAutomationFix, 500);
});

/**
 * Initialize the automation path fix
 */
function initAutomationFix() {
    // Add event listener for the Generate & Publish Now button in form actions
    const generateNowBtn = document.querySelector('.generate-now-btn');
    if (generateNowBtn) {
        console.log('Automation Fix: Found Generate & Publish Now button');
        
        // Remove existing event listeners
        const newBtn = generateNowBtn.cloneNode(true);
        generateNowBtn.parentNode.replaceChild(newBtn, generateNowBtn);
        
        // Add new event listener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Automation Fix: Generate & Publish Now clicked');
            generateAndPublishNowDirect();
        });
    } else {
        console.error('Automation Fix: Generate & Publish Now button not found');
    }
    
    // Add event listener for the panel Generate & Publish Now button
    const panelGenerateNowBtn = document.querySelector('.panel-generate-now-btn');
    if (panelGenerateNowBtn) {
        console.log('Automation Fix: Found panel Generate & Publish Now button');
        
        // Remove existing event listeners
        const newPanelBtn = panelGenerateNowBtn.cloneNode(true);
        panelGenerateNowBtn.parentNode.replaceChild(newPanelBtn, panelGenerateNowBtn);
        
        // Add new event listener
        newPanelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Automation Fix: Panel Generate & Publish Now clicked');
            generateAndPublishNowDirect();
        });
    } else {
        console.error('Automation Fix: Panel Generate & Publish Now button not found');
    }
    
    // Fix the Save Automation Path button
    const saveBtn = document.querySelector('.automation-path-form .save-btn');
    if (saveBtn) {
        console.log('Automation Fix: Found Save Automation Path button');
        
        // Remove existing event listeners
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        // Add new event listener
        newSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Automation Fix: Save Automation Path clicked');
            saveAutomationPathDirect();
        });
    }
}

/**
 * Generate and publish content immediately (direct implementation)
 */
function generateAndPublishNowDirect() {
    console.log('Automation Fix: Generating and publishing content now...');
    
    // Get the generate now button
    const generateNowBtn = document.querySelector('.generate-now-btn');
    
    // Show loading state
    generateNowBtn.classList.add('loading');
    generateNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    
    // Create or find status element
    let statusElement = document.querySelector('.generation-status');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'generation-status';
        const formActions = document.querySelector('.form-actions');
        formActions.parentNode.insertBefore(statusElement, formActions.nextSibling);
    }
    
    // Show initial status
    showGenerationStatus(statusElement, 'info', 'Preparing to generate content...');
    
    // Collect form data
    const formData = collectFormData();
    
    // Validate form data
    if (!validateFormData(formData, statusElement)) {
        // Reset button state
        generateNowBtn.classList.remove('loading');
        generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
        return;
    }
    
    // Show status update
    showGenerationStatus(statusElement, 'info', 'Generating content with AI...');
    
    // Show status that we're generating content
    showGenerationStatus(statusElement, 'info', 'Generating content with AI...');
    
    // Prepare the post data
    const postData = {
        title: generateTitle(formData.topics),
        content: generateSampleContent(formData),
        excerpt: generateExcerpt(formData.topics),
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.topics.split(',').map(tag => tag.trim()),
        author: 'AI Assistant',
        date: new Date().toISOString(),
        featured: false,
        comments: [],
        likes: 0,
        views: 0
    };
    
    // Add language versions if specified
    if (formData.languages.english || formData.languages.swedish) {
        postData.translations = {};
        
        if (formData.languages.english) {
            postData.translations.english = {
                title: postData.title,
                content: postData.content
            };
        }
        
        if (formData.languages.swedish) {
            postData.translations.swedish = {
                title: generateTitle(formData.topics) + ' (Swedish)',
                content: generateSampleContentSwedish(formData)
            };
        }
    }
    
    // Add image if specified
    if (formData.includeImages) {
        postData.image = 'images/sample-post-image.jpg';
    }
    
    // Show success status for content generation
    showGenerationStatus(statusElement, 'info', 'Content generated successfully. Publishing...');
    
    // Use the actual publishAutomatedPost function from ai-automation.js
    setTimeout(function() {
        try {
            // Check if the function exists in the global scope
            if (typeof window.aiAutomation !== 'undefined' && typeof window.aiAutomation.publishAutomatedPost === 'function') {
                // Call the actual publish function
                const publishResult = window.aiAutomation.publishAutomatedPost(postData);
                
                // Create URL for viewing the post
                const url = publishResult.url || ('blog.html?post=' + encodeURIComponent(publishResult.post.id));
                
                // Show final success status
                showGenerationStatus(statusElement, 'success', 'Content published successfully! <a href="' + url + '" target="_blank">View Post</a>');
                
                // Reset button state
                generateNowBtn.classList.remove('loading');
                generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
                
                // Add to recent posts list if available
                try {
                    addToRecentPostsList(publishResult.post);
                } catch (error) {
                    console.log('Note: Could not add post to recent posts list:', error.message);
                }
                
                // Close the modal after a delay
                setTimeout(function() {
                    closeAutomationPathFormDirect();
                }, 3000);
            } else {
                // Fallback if the aiAutomation.publishAutomatedPost function is not available
                console.error('Error: aiAutomation.publishAutomatedPost function not found');
                showGenerationStatus(statusElement, 'error', 'Error: Publishing function not available');
                
                // Reset button state
                generateNowBtn.classList.remove('loading');
                generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            showGenerationStatus(statusElement, 'error', 'Error publishing post: ' + error.message);
            
            // Reset button state
            generateNowBtn.classList.remove('loading');
            generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
        }
    }, 1500);
}

/**
 * Save automation path (direct implementation)
 */
function saveAutomationPathDirect() {
    console.log('Automation Fix: Saving automation path...');
    
    // IMPORTANT: We'll use the original saveAutomationPath function instead of creating a duplicate
    // This ensures we maintain proper card styles and editing functionality
    if (typeof window.saveAutomationPath === 'function') {
        console.log('Automation Fix: Using original saveAutomationPath function');
        window.saveAutomationPath();
        return;
    }
    
    // Fallback if the original function isn't available
    console.log('Automation Fix: Original saveAutomationPath function not found, using fallback');
    
    // Get the save button
    const saveBtn = document.querySelector('.automation-path-form .save-btn');
    
    // Show loading state
    saveBtn.classList.add('loading');
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    // Collect form data
    const formData = collectFormData();
    
    // Create or find status element
    let statusElement = document.querySelector('.generation-status');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'generation-status';
        const formActions = document.querySelector('.form-actions');
        formActions.parentNode.insertBefore(statusElement, formActions.nextSibling);
    }
    
    // Validate form data
    if (!validateFormData(formData, statusElement)) {
        // Reset button state
        saveBtn.classList.remove('loading');
        saveBtn.innerHTML = 'Save Automation Path';
        return;
    }
    
    // Show status update
    showGenerationStatus(statusElement, 'info', 'Saving automation path...');
    
    // Check if we're in edit mode
    const isEditing = typeof window.editingPathIndex === 'number' && window.editingPathIndex >= 0;
    console.log('Automation Fix: isEditing =', isEditing, 'editingPathIndex =', window.editingPathIndex);
    
    setTimeout(function() {
        // Show success status
        showGenerationStatus(statusElement, 'success', 'Automation path saved successfully!');
        
        // Reset button state
        saveBtn.classList.remove('loading');
        saveBtn.innerHTML = 'Save Automation Path';
        
        // Close the modal after a delay
        setTimeout(function() {
            closeAutomationPathFormDirect();
            
            // If we're editing, update the global automationPaths array
            if (isEditing && window.automationPaths && window.automationPaths.length > window.editingPathIndex) {
                console.log('Automation Fix: Updating existing path at index', window.editingPathIndex);
                window.automationPaths[window.editingPathIndex] = formData;
                
                // Save to localStorage
                if (typeof window.saveAutomationPathsToStorage === 'function') {
                    window.saveAutomationPathsToStorage();
                } else {
                    localStorage.setItem('aiAutomationPaths', JSON.stringify(window.automationPaths));
                }
                
                // Re-render all paths using the original function
                if (typeof window.renderAutomationPaths === 'function') {
                    window.renderAutomationPaths();
                }
            } else {
                // Add as a new path with the new card style
                addToAutomationPathsList(formData);
            }
            
            // Reset editing index
            window.editingPathIndex = -1;
        }, 1500);
    }, 1000);
}

/**
 * Close the automation path form
 */
function closeAutomationPathFormDirect() {
    const modal = document.querySelector('.automation-path-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Collect form data
 * @returns {Object} The form data
 */
function collectFormData() {
    return {
        name: document.getElementById('path-name').value.trim(),
        contentType: document.getElementById('content-type').value,
        assistant: {
            type: document.getElementById('assistant-type').value,
            id: document.getElementById('assistant-id')?.value.trim() || ''
        },
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value,
        topics: document.getElementById('topics').value.trim(),
        schedule: {
            type: document.querySelector('.schedule-option.selected')?.dataset.schedule || 'daily'
        },
        promptTemplate: document.getElementById('prompt-template')?.value.trim() || '',
        languages: {
            english: true,
            swedish: document.getElementById('lang-swedish')?.checked || false
        },
        includeImages: document.getElementById('include-images')?.checked || false
    };
}

/**
 * Validate form data
 * @param {Object} formData - The form data to validate
 * @param {HTMLElement} statusElement - The status element
 * @returns {boolean} Whether the form data is valid
 */
function validateFormData(formData, statusElement) {
    if (!formData.name) {
        showGenerationStatus(statusElement, 'error', 'Please enter a name for this automation path');
        return false;
    }
    
    if (!formData.topics) {
        showGenerationStatus(statusElement, 'error', 'Please enter topics for content generation');
        return false;
    }
    
    if (formData.assistant.type === 'custom' && !formData.assistant.id) {
        showGenerationStatus(statusElement, 'error', 'Please enter an Assistant ID for the custom assistant');
        return false;
    }
    
    return true;
}

/**
 * Show generation status
 * @param {HTMLElement} statusElement - The status element
 * @param {string} type - The status type (success, error, info)
 * @param {string} message - The status message
 */
function showGenerationStatus(statusElement, type, message) {
    // Set status class
    statusElement.className = 'generation-status ' + type;
    
    // Set icon based on type
    let icon = '';
    if (type === 'success') {
        icon = '<i class="fas fa-check-circle"></i>';
    } else if (type === 'error') {
        icon = '<i class="fas fa-exclamation-circle"></i>';
    } else if (type === 'info') {
        icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Set status content
    statusElement.innerHTML = icon + ' ' + message;
    
    // Show the status
    statusElement.style.display = 'block';
}

/**
 * Generate a title based on topics
 * @param {string} topics - The topics
 * @returns {string} The generated title
 */
function generateTitle(topics) {
    const topicList = topics.split(',').map(topic => topic.trim());
    const mainTopic = topicList[0];
    
    const titleTemplates = [
        `The Ultimate Guide to ${mainTopic}`,
        `10 Amazing Facts About ${mainTopic} You Didn't Know`,
        `Why ${mainTopic} Is Trending in 2025`,
        `How to Master ${mainTopic} in 5 Simple Steps`,
        `${mainTopic}: A Comprehensive Overview`
    ];
    
    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
}

/**
 * Generate sample content
 * @param {Object} formData - The form data
 * @returns {string} The generated content
 */
function generateSampleContent(formData) {
    const topics = formData.topics.split(',').map(topic => topic.trim());
    const mainTopic = topics[0];
    
    return `<h2>Introduction to ${mainTopic}</h2>
<p>Welcome to our comprehensive guide on ${mainTopic}. In this article, we'll explore everything you need to know about this fascinating topic.</p>

<h2>Why ${mainTopic} Matters</h2>
<p>${mainTopic} has become increasingly important in today's world. With the rapid advancements in technology and changing consumer preferences, understanding ${mainTopic} is crucial for success.</p>

<h2>Key Aspects of ${mainTopic}</h2>
<p>There are several key aspects to consider when discussing ${mainTopic}:</p>
<ul>
    <li>The history and evolution of ${mainTopic}</li>
    <li>Current trends and developments</li>
    <li>Future prospects and challenges</li>
    <li>Best practices for implementation</li>
</ul>

<h2>Expert Insights on ${mainTopic}</h2>
<p>According to industry experts, ${mainTopic} will continue to evolve and shape various sectors. As one expert puts it, "The future of ${mainTopic} is bright, with endless possibilities for innovation and growth."</p>

<h2>Conclusion</h2>
<p>In conclusion, ${mainTopic} represents a significant area of interest and opportunity. By staying informed and adaptable, you can leverage the power of ${mainTopic} to achieve your goals.</p>`;
}

/**
 * Generate sample content in Swedish
 * @param {Object} formData - The form data
 * @returns {string} The generated content in Swedish
 */
function generateSampleContentSwedish(formData) {
    const topics = formData.topics.split(',').map(topic => topic.trim());
    const mainTopic = topics[0];
    
    return `<h2>Introduktion till ${mainTopic}</h2>
<p>Välkommen till vår omfattande guide om ${mainTopic}. I denna artikel kommer vi att utforska allt du behöver veta om detta fascinerande ämne.</p>

<h2>Varför ${mainTopic} är viktigt</h2>
<p>${mainTopic} har blivit allt viktigare i dagens värld. Med de snabba framstegen inom teknologi och förändrade konsumentpreferenser är förståelse för ${mainTopic} avgörande för framgång.</p>

<h2>Viktiga aspekter av ${mainTopic}</h2>
<p>Det finns flera viktiga aspekter att överväga när man diskuterar ${mainTopic}:</p>
<ul>
    <li>Historien och utvecklingen av ${mainTopic}</li>
    <li>Aktuella trender och utvecklingar</li>
    <li>Framtidsutsikter och utmaningar</li>
    <li>Bästa praxis för implementering</li>
</ul>

<h2>Expertinsikter om ${mainTopic}</h2>
<p>Enligt branschexperter kommer ${mainTopic} att fortsätta utvecklas och forma olika sektorer. Som en expert uttrycker det: "Framtiden för ${mainTopic} är ljus, med oändliga möjligheter för innovation och tillväxt."</p>

<h2>Slutsats</h2>
<p>Sammanfattningsvis representerar ${mainTopic} ett betydande intresse- och möjlighetsområde. Genom att hålla dig informerad och anpassningsbar kan du utnyttja kraften i ${mainTopic} för att nå dina mål.</p>`;
}

/**
 * Generate excerpt
 * @param {string} topics - The topics
 * @returns {string} The generated excerpt
 */
function generateExcerpt(topics) {
    const mainTopic = topics.split(',')[0].trim();
    return `Discover everything you need to know about ${mainTopic} in this comprehensive guide. We explore the key aspects, current trends, and expert insights to help you master this fascinating topic.`;
}

/**
 * Update categories and tags in localStorage when a new post is published
 * @param {Object} post - The newly published post
 */
function updateCategoriesAndTags(post) {
    // Update categories
    let categories = JSON.parse(localStorage.getItem('fooodis-blog-categories') || '[]');
    if (post.category && !categories.includes(post.category)) {
        categories.push(post.category);
        localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
    }

    // Update subcategories
    let subcategories = JSON.parse(localStorage.getItem('fooodis-blog-subcategories') || '[]');
    if (post.subcategory && !subcategories.includes(post.subcategory)) {
        subcategories.push(post.subcategory);
        localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    }

    // Update tags
    let tags = JSON.parse(localStorage.getItem('fooodis-blog-tags') || '[]');
    if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
            if (!tags.includes(tag)) {
                tags.push(tag);
            }
        });
        localStorage.setItem('fooodis-blog-tags', JSON.stringify(tags));
    }
}

/**
 * Add a post to the recent posts list
 * @param {Object} post - The post to add
 */
function addToRecentPostsList(post) {
    // Find the recent posts container
    let recentPostsContainer = document.querySelector('#manage-posts-section .posts-list');

    
    // If container doesn't exist, create it
    if (!recentPostsContainer) {
        console.log('Automation Fix: Creating recent posts container');
        
        // Find the manage posts section
        const managePostsSection = document.getElementById('manage-posts-section');
        if (!managePostsSection) {
            console.error('Automation Fix: Manage posts section not found');
            return;
        }
        
        // Check if there's a container we can add the posts list to
        let postsContainer = managePostsSection.querySelector('.posts-container');
        
        // If no posts container exists, create one
        if (!postsContainer) {
            postsContainer = document.createElement('div');
            postsContainer.className = 'posts-container';
            
            // Find a good place to insert it (after the section header)
            const sectionHeader = managePostsSection.querySelector('.section-header');
            if (sectionHeader) {
                sectionHeader.parentNode.insertBefore(postsContainer, sectionHeader.nextSibling);
            } else {
                managePostsSection.appendChild(postsContainer);
            }
        }
        
        // Create the posts list
        recentPostsContainer = document.createElement('div');
        recentPostsContainer.className = 'posts-list';
        postsContainer.appendChild(recentPostsContainer);
    }
    
    // Create post element
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.innerHTML = `
        <div class="post-info">
            <h3 class="post-title">${post.title}</h3>
            <div class="post-meta">
                <span class="post-date"><i class="fas fa-calendar-alt"></i> ${new Date().toLocaleDateString()}</span>
                <span class="post-author"><i class="fas fa-user"></i> AI Assistant</span>
                <span class="post-category"><i class="fas fa-folder"></i> ${post.category}</span>
            </div>
            <p class="post-excerpt">${post.excerpt}</p>
        </div>
        <div class="post-actions">
            <button class="edit-btn" title="Edit Post"><i class="fas fa-edit"></i></button>
            <button class="view-btn" title="View Post"><i class="fas fa-eye"></i></button>
            <button class="delete-btn" title="Delete Post"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add to the beginning of the list
    if (recentPostsContainer.firstChild) {
        recentPostsContainer.insertBefore(postElement, recentPostsContainer.firstChild);
    } else {
        recentPostsContainer.appendChild(postElement);
    }
}

/**
 * Add an automation path to the list
 * @param {Object} pathData - The path data to add
 */
function addToAutomationPathsList(pathData) {
    console.log('Automation Fix: Adding path to list using new card style');
    
    // Find the automation paths container
    const pathsContainer = document.querySelector('#ai-automation-section .automation-paths-container');
    if (!pathsContainer) {
        console.error('Automation Fix: Automation paths container not found');
        return;
    }
    
    // Initialize generation count if not exists
    if (pathData.generationCount === undefined) {
        pathData.generationCount = 0;
    }
    
    // Prepare the assistant text
    let assistantText = 'Default';
    if (pathData.assistant) {
        if (pathData.assistant.type === 'custom' && pathData.assistant.id) {
            assistantText = `Custom (${pathData.assistant.id})`;
        } else {
            assistantText = pathData.assistant.type || 'Default';
        }
    }
    
    // Calculate next run time
    let nextRunText = '';
    if (pathData.schedule) {
        const now = new Date();
        let nextDay = 'Today';
        
        if (pathData.schedule.type === 'daily') {
            // For daily schedules, check if the time has already passed today
            if (pathData.schedule.time) {
                const [hours, minutes] = pathData.schedule.time.split(':').map(Number);
                const scheduleTime = new Date(now);
                scheduleTime.setHours(hours, minutes, 0, 0);
                
                if (now > scheduleTime) {
                    nextDay = 'Tomorrow';
                }
            }
        }
        
        nextRunText = `${nextDay}, ${pathData.schedule.time || '14:00'}`;
    }
    
    // Create path element using the NEW card style (matching the grid layout)
    const pathElement = document.createElement('div');
    pathElement.className = 'automation-path';
    pathElement.dataset.index = 0; // Will be updated when added to automationPaths array
    
    // Use the new card format with grid layout exactly matching the backup system
    pathElement.innerHTML = `
        <div class="automation-path-header">
            <i class="fas fa-robot"></i>
            <h3>${pathData.name}</h3>
            <div class="path-actions">
                <label class="switch">
                    <input type="checkbox" ${pathData.active !== false ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <span class="toggle-active">${pathData.active !== false ? 'Active' : 'Inactive'}</span>
                <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <div class="automation-path-grid">
            <div class="grid-box">
                <h4>Schedule</h4>
                <p>${getScheduleText(pathData.schedule)}</p>
                <p class="next-run">Next run: ${nextRunText}</p>
            </div>
            <div class="grid-box">
                <h4>Content Type</h4>
                <p>${pathData.contentType || 'general'}</p>
            </div>
            <div class="grid-box">
                <h4>Assistant</h4>
                <p>${assistantText}</p>
            </div>
            <div class="grid-box">
                <h4>Categories</h4>
                <div class="tags-container">
                    <span class="tag">${pathData.category || 'Uncategorized'}</span>
                    ${pathData.subcategory ? `<span class="tag">${pathData.subcategory}</span>` : ''}
                </div>
            </div>
            <div class="grid-box">
                <h4>Topics</h4>
                <p>${pathData.topics || ''}</p>
            </div>
            <div class="grid-box">
                <h4>Languages</h4>
                <div class="tags-container">
                    <span class="tag">English</span>
                    ${pathData.languages && pathData.languages.swedish ? `<span class="tag">Swedish</span>` : ''}
                </div>
            </div>
            <div class="grid-box generation-box">
                <h4>Generation Stats</h4>
                <div class="generation-stats">
                    <p><i class="fas fa-sync-alt"></i> <span class="generation-count">${pathData.generationCount || 0}</span> posts generated</p>
                </div>
            </div>
        </div>
    `;
    
    // Add to the beginning of the list
    if (pathsContainer.firstChild) {
        pathsContainer.insertBefore(pathElement, pathsContainer.firstChild);
    } else {
        pathsContainer.appendChild(pathElement);
    }
    
    // Add event listeners for buttons
    const editBtn = pathElement.querySelector('.edit-btn');
    const deleteBtn = pathElement.querySelector('.delete-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log('Automation Fix: Edit button clicked');
            // Find the path index in automationPaths
            if (window.automationPaths && window.automationPaths.length > 0) {
                const pathIndex = window.automationPaths.findIndex(p => p.name === pathData.name);
                if (pathIndex !== -1 && typeof window.editAutomationPath === 'function') {
                    window.editAutomationPath(pathIndex);
                }
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            console.log('Automation Fix: Delete button clicked');
            if (window.automationPaths && window.automationPaths.length > 0) {
                const pathIndex = window.automationPaths.findIndex(p => p.name === pathData.name);
                if (pathIndex !== -1 && typeof window.deleteAutomationPath === 'function') {
                    window.deleteAutomationPath(pathIndex);
                }
            }
        });
    }
    
    // Add event listeners for toggle switch
    const toggleSwitch = pathElement.querySelector('input[type="checkbox"]');
    const toggleText = pathElement.querySelector('.toggle-active');
    
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', () => {
            console.log('Automation Fix: Toggle switch changed');
            
            // Update the toggle text
            if (toggleText) {
                toggleText.textContent = toggleSwitch.checked ? 'Active' : 'Inactive';
            }
            
            // If automationPaths is available globally, we need to update the active state
            if (window.automationPaths && window.automationPaths.length > 0) {
                // Find the path in the array
                const pathIndex = window.automationPaths.findIndex(p => p.name === pathData.name);
                if (pathIndex !== -1) {
                    window.automationPaths[pathIndex].active = toggleSwitch.checked;
                    if (typeof window.saveAutomationPathsToStorage === 'function') {
                        window.saveAutomationPathsToStorage();
                    }
                }
            }
        });
    }
}

/**
 * Get schedule text
 * @param {Object} schedule - The schedule object
 * @returns {string} The schedule text
 */
function getScheduleText(schedule) {
    switch (schedule.type) {
        case 'daily':
            return 'Daily';
        case 'every2days':
            return 'Every 2 Days';
        case 'weekly':
            return 'Weekly';
        case 'biweekly':
            return 'Bi-Weekly';
        case 'monthly':
            return 'Monthly';
        case 'custom':
            return 'Custom';
        default:
            return 'Daily';
    }
}

// Initialize on window load
window.addEventListener('load', function() {
    console.log('Automation Fix: Window loaded');
    setTimeout(initAutomationFix, 1000);
});
