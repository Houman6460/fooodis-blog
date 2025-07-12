
/**
 * AI Automation Manual Trigger System
 * Only shows popup when explicitly requested
 */

console.log('AI Automation Manual Trigger: Loading...');

// Wait for page to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupManualTriggers();
    }, 2000);
});

function setupManualTriggers() {
    console.log('AI Automation Manual Trigger: Setting up manual triggers...');
    
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
                    
                    // Trigger the popup manually
                    if (typeof window.triggerAutomationPopup === 'function') {
                        window.triggerAutomationPopup();
                    } else if (typeof forceShowPopup === 'function') {
                        forceShowPopup();
                    } else {
                        console.error('AI Automation Manual Trigger: No popup function available');
                    }
                });
                
                console.log('AI Automation Manual Trigger: Added handler to button:', text);
            }
        }
    });
}

// Expose manual setup function
window.setupAutomationTriggers = setupManualTriggers;

console.log('AI Automation Manual Trigger: Script loaded');
