/**
 * Schedule Post Dark Theme Fix
 * This script fixes the white background in the schedule post modal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Apply dark theme to schedule post modal
    fixScheduleModalDarkTheme();
    
    // Fix the date input click to ensure dark theme
    setupDateInputDarkTheme();
});

/**
 * Fix the schedule modal dark theme
 */
function fixScheduleModalDarkTheme() {
    // Add a mutation observer to detect when the modal is added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes is the modal
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && (
                            node.classList.contains('white-popup') || 
                            node.classList.contains('mfp-content') ||
                            node.classList.contains('schedule-post-container')
                        )) {
                            // Apply dark theme to the modal
                            applyDarkThemeToModal(node);
                        } else {
                            // Check children
                            const modalElements = node.querySelectorAll('.white-popup, .mfp-content, .schedule-post-container, .mfp-wrap, .mfp-bg');
                            if (modalElements.length > 0) {
                                modalElements.forEach(function(element) {
                                    applyDarkThemeToModal(element);
                                });
                            }
                        }
                    }
                }
            }
        });
    });
    
    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also check for existing modals
    const existingModals = document.querySelectorAll('.white-popup, .mfp-content, .schedule-post-container, .mfp-wrap, .mfp-bg');
    existingModals.forEach(function(modal) {
        applyDarkThemeToModal(modal);
    });
}

/**
 * Apply dark theme to a modal element
 */
function applyDarkThemeToModal(element) {
    // Apply dark theme to the element
    element.style.backgroundColor = 'var(--dark-card)';
    element.style.color = 'var(--dark-text)';
    element.style.borderColor = 'var(--dark-border)';
    
    // Apply dark theme to all children
    const allChildren = element.querySelectorAll('*');
    allChildren.forEach(function(child) {
        // Skip elements that should have specific styling
        if (child.classList && (
            child.classList.contains('toggle-slider') ||
            child.classList.contains('btn-primary') ||
            child.classList.contains('btn-secondary') ||
            child.classList.contains('status-scheduled') ||
            child.classList.contains('status-draft') ||
            child.classList.contains('status-ai-generated')
        )) {
            return;
        }
        
        // Apply dark theme to the child
        child.style.backgroundColor = 'var(--dark-card)';
        child.style.color = 'var(--dark-text)';
        child.style.borderColor = 'var(--dark-border)';
        
        // Special handling for input elements
        if (child.tagName === 'INPUT' || child.tagName === 'SELECT' || child.tagName === 'TEXTAREA') {
            child.style.backgroundColor = 'var(--dark-input)';
            child.style.borderColor = 'var(--dark-border)';
            child.style.color = 'var(--dark-text)';
        }
        
        // Special handling for table cells
        if (child.tagName === 'TD' || child.tagName === 'TH') {
            child.style.backgroundColor = 'var(--dark-bg)';
            child.style.borderColor = 'var(--dark-border)';
            child.style.color = 'var(--dark-text)';
        }
        
        // Special handling for today's date
        if (child.classList && child.classList.contains('today')) {
            child.style.backgroundColor = 'rgba(232, 242, 76, 0.15)';
        }
        
        // Special handling for selected date
        if (child.classList && child.classList.contains('selected')) {
            child.style.backgroundColor = 'rgba(232, 242, 76, 0.3)';
        }
    });
    
    // Special handling for buttons
    const primaryButtons = element.querySelectorAll('.btn-primary');
    primaryButtons.forEach(function(button) {
        button.style.backgroundColor = 'var(--primary-color)';
        button.style.borderColor = 'var(--primary-color)';
        button.style.color = 'var(--secondary-color)';
    });
    
    const secondaryButtons = element.querySelectorAll('.btn-secondary');
    secondaryButtons.forEach(function(button) {
        button.style.backgroundColor = 'transparent';
        button.style.borderColor = 'var(--primary-color)';
        button.style.color = 'var(--primary-color)';
    });
    
    // Special handling for toggle switches
    const toggleSwitches = element.querySelectorAll('.toggle-switch input:checked + .toggle-slider');
    toggleSwitches.forEach(function(toggle) {
        toggle.style.backgroundColor = 'var(--primary-color)';
    });
    
    const toggleSliders = element.querySelectorAll('.toggle-slider:before');
    toggleSliders.forEach(function(slider) {
        slider.style.backgroundColor = 'var(--dark-text)';
    });
    
    const checkedSliders = element.querySelectorAll('input:checked + .toggle-slider:before');
    checkedSliders.forEach(function(slider) {
        slider.style.backgroundColor = 'var(--secondary-color)';
    });
    
    // Special handling for status indicators
    const scheduledStatus = element.querySelectorAll('.status-scheduled');
    scheduledStatus.forEach(function(status) {
        status.style.backgroundColor = 'rgba(232, 242, 76, 0.2)';
        status.style.color = 'var(--primary-color)';
    });
    
    const draftStatus = element.querySelectorAll('.status-draft');
    draftStatus.forEach(function(status) {
        status.style.backgroundColor = 'rgba(100, 100, 100, 0.2)';
        status.style.color = 'var(--dark-text-secondary)';
    });
    
    const aiGeneratedStatus = element.querySelectorAll('.status-ai-generated');
    aiGeneratedStatus.forEach(function(status) {
        status.style.backgroundColor = 'rgba(100, 200, 255, 0.2)';
        status.style.color = '#64c8ff';
    });
    
    // Fix the modal background overlay
    const modalOverlay = document.querySelector('.mfp-bg');
    if (modalOverlay) {
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    }
    
    // Fix the modal close button
    const closeButton = element.querySelector('.mfp-close');
    if (closeButton) {
        closeButton.style.color = 'var(--primary-color)';
    }
}

/**
 * Setup date input dark theme
 */
function setupDateInputDarkTheme() {
    // Find all date inputs
    const dateInputs = document.querySelectorAll('input[type="datetime-local"], input[type="date"]');
    
    dateInputs.forEach(function(input) {
        // Override the default click behavior
        input.addEventListener('click', function(e) {
            // Wait a short time for the modal to be created
            setTimeout(function() {
                // Find the modal and apply dark theme
                const modals = document.querySelectorAll('.white-popup, .mfp-content, .schedule-post-container, .mfp-wrap, .mfp-bg');
                modals.forEach(function(modal) {
                    applyDarkThemeToModal(modal);
                });
            }, 100);
        });
    });
}
