
/**
 * AI Automation Manual Trigger System
 * Completely manual - no automatic initialization
 */

console.log('AI Automation Manual Trigger: Loading in passive mode...');

// Completely passive - no automatic DOM ready listeners
// Only manual trigger functions

window.manuallyTriggerAutomationPopup = function() {
    console.log('AI Automation Manual Trigger: Manual trigger called');
    
    // Try multiple trigger methods
    if (typeof window.triggerAutomationPopup === 'function') {
        window.triggerAutomationPopup();
    } else if (typeof window.manuallyShowAutomationPopup === 'function') {
        window.manuallyShowAutomationPopup();
    } else if (typeof forceShowPopup === 'function') {
        forceShowPopup();
    } else {
        console.error('AI Automation Manual Trigger: No popup function available');
        alert('Popup system not available. Please refresh the page.');
    }
};

// Expose additional manual setup function
window.setupAutomationTriggers = function() {
    console.log('AI Automation Manual Trigger: Manual setup called');
    
    // Look for specific "Create New Automation" buttons and add explicit handlers
    const automationButtons = document.querySelectorAll('button, a, .btn');
    
    automationButtons.forEach(button => {
        const text = button.textContent?.trim() || '';
        
        // Only bind to very specific buttons
        if (text === 'Create New Automation' || 
            text === 'Add New Automation Path' ||
            button.getAttribute('data-action') === 'create-automation' ||
            button.classList.contains('create-automation-btn')) {
            
            // Remove any existing listeners to prevent duplicates
            if (!button.hasAttribute('data-manual-trigger')) {
                button.setAttribute('data-manual-trigger', 'true');
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('AI Automation Manual Trigger: Manual button clicked:', text);
                    window.manuallyTriggerAutomationPopup();
                });
                
                console.log('AI Automation Manual Trigger: Added handler to button:', text);
            }
        }
    });
};

console.log('AI Automation Manual Trigger: Passive system loaded - awaiting manual calls');
