/**
 * Mode Toggle Functionality
 * Controls whether to schedule posts or generate and publish immediately
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Mode Toggle: Initializing');
    initModeToggle();
});

/**
 * Initialize the mode toggle functionality
 */
function initModeToggle() {
    // Get the toggle switch
    const modeToggle = document.getElementById('mode-toggle');
    if (!modeToggle) {
        console.error('Mode Toggle: Toggle switch not found');
        return;
    }
    
    // Get the mode toggle container
    const modeToggleContainer = document.querySelector('.mode-toggle');
    if (modeToggleContainer) {
        // Set initial mode
        modeToggleContainer.setAttribute('data-mode', modeToggle.checked ? 'schedule' : 'generate');
    }
    
    // Get the schedule section
    const scheduleSection = document.querySelector('.schedule-section');
    
    // Get the generate now button
    const generateNowBtn = document.querySelector('.generate-now-btn');
    
    // Set initial visibility based on toggle state
    updateVisibility(modeToggle.checked, scheduleSection, generateNowBtn);
    
    // Add event listener for toggle change
    modeToggle.addEventListener('change', function() {
        console.log('Mode Toggle: Toggle changed to', this.checked ? 'schedule' : 'generate');
        
        // Update mode attribute
        if (modeToggleContainer) {
            modeToggleContainer.setAttribute('data-mode', this.checked ? 'schedule' : 'generate');
        }
        
        // Update visibility
        updateVisibility(this.checked, scheduleSection, generateNowBtn);
    });
}

/**
 * Update visibility of schedule section and generate now buttons
 * @param {boolean} isScheduleMode - Whether the toggle is in schedule mode
 * @param {HTMLElement} scheduleSection - The schedule section element
 * @param {HTMLElement} generateNowBtn - The generate now button element in form actions
 */
function updateVisibility(isScheduleMode, scheduleSection, generateNowBtn) {
    // Get the generate now panel
    const generateNowPanel = document.querySelector('.generate-now-panel');
    
    if (scheduleSection) {
        scheduleSection.style.display = isScheduleMode ? 'block' : 'none';
    }
    
    if (generateNowBtn) {
        generateNowBtn.style.display = isScheduleMode ? 'none' : 'flex';
    }
    
    if (generateNowPanel) {
        generateNowPanel.style.display = isScheduleMode ? 'none' : 'block';
    }
}

// Initialize on window load to ensure all elements are ready
window.addEventListener('load', function() {
    console.log('Mode Toggle: Window loaded');
    setTimeout(initModeToggle, 500);
});
