
/**
 * AI Automation Manual Trigger System
 * Find and bind to the actual "Create New Automation" button
 */

console.log('AI Automation Manual Trigger: Loading button binding system...');

// Manual function to find and bind the actual button
window.bindAutomationButton = function() {
    console.log('AI Automation Manual Trigger: Searching for automation button...');
    
    // Look for the actual button in the AI Automation section
    const automationSection = document.querySelector('[data-section="ai-automation"]') || 
                             document.querySelector('#ai-automation-section') ||
                             document.querySelector('.ai-automation-section');
    
    if (automationSection) {
        console.log('AI Automation Manual Trigger: Found automation section');
        
        // Look for buttons within the automation section
        const buttons = automationSection.querySelectorAll('button, .btn, a[role="button"]');
        
        buttons.forEach(button => {
            const text = button.textContent?.trim() || '';
            const title = button.getAttribute('title') || '';
            const ariaLabel = button.getAttribute('aria-label') || '';
            
            console.log('AI Automation Manual Trigger: Found button:', text, title, ariaLabel);
            
            // Check if this looks like a "Create New Automation" button
            if (text.includes('Create') || text.includes('New') || text.includes('Add') || 
                text.includes('automation') || text.includes('Automation') ||
                title.includes('Create') || title.includes('automation') ||
                ariaLabel.includes('Create') || ariaLabel.includes('automation')) {
                
                console.log('AI Automation Manual Trigger: Found potential automation button:', text);
                
                // Remove any existing listeners and add our listener
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('AI Automation Manual Trigger: Automation button clicked!');
                    
                    // Call the main popup function
                    if (typeof window.showAutomationPopup === 'function') {
                        window.showAutomationPopup();
                    } else {
                        console.error('AI Automation Manual Trigger: Popup function not available');
                        alert('Popup system not ready. Please try again.');
                    }
                });
                
                console.log('AI Automation Manual Trigger: Successfully bound to button:', text);
            }
        });
    } else {
        console.log('AI Automation Manual Trigger: Automation section not found, trying global search...');
        
        // Fallback: search the entire document
        const allButtons = document.querySelectorAll('button, .btn, a[role="button"]');
        
        allButtons.forEach(button => {
            const text = button.textContent?.trim() || '';
            
            if (text === 'Create New Automation' || 
                text === 'Add New Automation' || 
                text === 'New Automation' ||
                text === 'Create Automation') {
                
                console.log('AI Automation Manual Trigger: Found global automation button:', text);
                
                // Remove any existing listeners and add our listener
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('AI Automation Manual Trigger: Global automation button clicked!');
                    
                    if (typeof window.showAutomationPopup === 'function') {
                        window.showAutomationPopup();
                    } else {
                        console.error('AI Automation Manual Trigger: Popup function not available');
                        alert('Popup system not ready. Please try again.');
                    }
                });
                
                console.log('AI Automation Manual Trigger: Successfully bound to global button:', text);
            }
        });
    }
};

// Auto-bind when page loads, but only once
setTimeout(function() {
    window.bindAutomationButton();
}, 2000);

console.log('AI Automation Manual Trigger: Button binding system loaded');
