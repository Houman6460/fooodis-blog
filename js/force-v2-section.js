
// Force V2 Section Display - Ensures V2 automation sections are properly shown
(function() {
    'use strict';
    
    console.log('Force V2 Section: Initializing');
    
    function forceV2SectionDisplay() {
        // Force display of V2 automation sections
        const v2Sections = document.querySelectorAll('[id*="v2"], [class*="v2"], [data-version="2"]');
        
        v2Sections.forEach(section => {
            if (section) {
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.classList.remove('hidden');
                console.log('Force V2 Section: Showing section', section.id || section.className);
            }
        });
        
        // Force AI automation V2 sections specifically
        const aiAutomationV2 = document.getElementById('ai-automation-v2-section');
        if (aiAutomationV2) {
            aiAutomationV2.style.display = 'block';
            aiAutomationV2.style.visibility = 'visible';
            console.log('Force V2 Section: AI Automation V2 section forced visible');
        }
        
        // Force status cards V2
        const statusCardsV2 = document.querySelectorAll('.status-card-v2, .execution-status-v2');
        statusCardsV2.forEach(card => {
            card.style.display = 'block';
            card.style.visibility = 'visible';
        });
    }
    
    // Run immediately and on DOM changes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceV2SectionDisplay);
    } else {
        forceV2SectionDisplay();
    }
    
    // Monitor for dynamic changes
    const observer = new MutationObserver(() => {
        forceV2SectionDisplay();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Force V2 Section: Initialized successfully');
})();
