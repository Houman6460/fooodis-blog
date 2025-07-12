/**
 * Generate & Publish Now Functionality
 * Handles immediate content generation and publishing for the Fooodis Blog System
 */

/**
 * Generate and publish content immediately
 * This function collects form data, validates it, and generates/publishes content without scheduling
 */
function generateAndPublishNow() {
    console.log('Generating and publishing content now...');
    
    // Get the generate now button
    const generateNowBtn = document.querySelector('.generate-now-btn');
    
    // Show loading state
    generateNowBtn.classList.add('loading');
    generateNowBtn.innerHTML = '<i class="fas fa-spinner"></i> Generating...';
    
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
    
    try {
        // Collect form data (similar to saveAutomationPath function)
        const pathData = collectFormData();
        
        // Validate form data
        if (!validateFormData(pathData, statusElement)) {
            // Reset button state if validation fails
            generateNowBtn.classList.remove('loading');
            generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
            return;
        }
        
        // Show status update
        showGenerationStatus(statusElement, 'info', 'Generating content with AI...');
        
        // Generate content
        // Access the generateAutomatedPost function from the global aiAutomation object
        window.aiAutomation.generateAutomatedPost(pathData)
            .then(result => {
                if (result.success) {
                    // Show success status
                    showGenerationStatus(statusElement, 'info', 'Content generated successfully. Publishing...');
                    
                    // Publish the post
                    return window.aiAutomation.publishAutomatedPost(result.post);
                } else {
                    throw new Error(result.error || 'Failed to generate content');
                }
            })
            .then(publishResult => {
                // Show final success status
                showGenerationStatus(statusElement, 'success', 'Content published successfully! <a href="' + publishResult.url + '" target="_blank">View Post</a>');
                
                // Reset button state
                generateNowBtn.classList.remove('loading');
                generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
                
                // Add to recent posts list if available
                if (typeof addToRecentPosts === 'function') {
                    addToRecentPosts(publishResult.post);
                }
            })
            .catch(error => {
                console.error('Error generating/publishing content:', error);
                
                // Show error status
                showGenerationStatus(statusElement, 'error', 'Error: ' + (error.message || 'Failed to generate or publish content'));
                
                // Reset button state
                generateNowBtn.classList.remove('loading');
                generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
            });
    } catch (error) {
        console.error('Error in generate and publish process:', error);
        
        // Show error status
        showGenerationStatus(statusElement, 'error', 'Error: ' + (error.message || 'An unexpected error occurred'));
        
        // Reset button state
        generateNowBtn.classList.remove('loading');
        generateNowBtn.innerHTML = '<i class="fas fa-bolt"></i> Generate & Publish Now';
    }
}

/**
 * Collect form data from the automation path form
 * @returns {Object} The collected form data
 */
function collectFormData() {
    // Get form values
    const pathName = document.getElementById('path-name').value.trim();
    const contentType = document.getElementById('content-type').value;
    const assistantType = document.getElementById('assistant-type').value;
    const assistantId = document.getElementById('assistant-id')?.value.trim() || '';
    const category = document.getElementById('category').value;
    const subcategory = document.getElementById('subcategory').value;
    const topics = document.getElementById('topics').value.trim();
    const promptTemplate = document.getElementById('prompt-template')?.value.trim() || '';
    
    // Get selected schedule option
    const selectedScheduleOption = document.querySelector('.schedule-option.selected');
    const scheduleType = selectedScheduleOption ? selectedScheduleOption.dataset.schedule : 'daily';
    
    // Get custom schedule values if applicable
    let schedule = { type: scheduleType };
    if (scheduleType === 'custom') {
        const interval = parseInt(document.getElementById('custom-interval').value) || 1;
        const unit = document.getElementById('custom-unit').value;
        schedule.interval = interval;
        schedule.unit = unit;
    }
    
    // Get language options
    const includeEnglish = true; // Always include English
    const includeSwedish = document.getElementById('lang-swedish')?.checked || false;
    
    // Get image option
    const includeImages = document.getElementById('include-images')?.checked || false;
    
    // Create path data object
    return {
        name: pathName,
        contentType: contentType,
        assistant: {
            type: assistantType,
            id: assistantId
        },
        category: category,
        subcategory: subcategory,
        topics: topics,
        schedule: schedule,
        promptTemplate: promptTemplate,
        languages: {
            english: includeEnglish,
            swedish: includeSwedish
        },
        includeImages: includeImages,
        active: true,
        lastRun: null,
        nextRun: null
    };
}

/**
 * Validate form data
 * @param {Object} pathData - The path data to validate
 * @param {HTMLElement} statusElement - The status element to show validation errors
 * @returns {boolean} Whether the form data is valid
 */
function validateFormData(pathData, statusElement) {
    // Check path name
    if (!pathData.name) {
        showGenerationStatus(statusElement, 'error', 'Please enter a name for this automation path');
        return false;
    }
    
    // Check topics
    if (!pathData.topics) {
        showGenerationStatus(statusElement, 'error', 'Please enter topics for content generation');
        return false;
    }
    
    // Check assistant ID if custom assistant is selected
    if (pathData.assistant.type === 'custom' && !pathData.assistant.id) {
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

// Make functions available globally
window.generateNow = {
    generateAndPublishNow,
    showGenerationStatus
};
