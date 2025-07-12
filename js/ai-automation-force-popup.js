/**
 * AI Automation Force Popup
 * Completely manual trigger system - no automatic initialization
 */

console.log('AI Automation Force Popup: Manual trigger system loaded');

// No automatic DOM ready listeners - completely manual
// Only expose the manual trigger function
window.forceShowAutomationPopup = function() {
    console.log('AI Automation Force Popup: Manual force trigger activated');

    // Use the main popup function if available
    if (typeof window.showAutomationPopup === 'function') {
        window.showAutomationPopup();
    } else {
        console.error('AI Automation Force Popup: Main popup function not available');
    }
};

console.log('AI Automation Force Popup: Manual trigger system ready');