/**
 * Emergency Selector Fix
 * 
 * Minimal version to get the page working again
 */

(function() {
    // Safe init pattern
    function safeInit() {
        try {
            console.log("Emergency Selector Fix: Initializing");
            
            // Find all media selector buttons and attach simple handlers
            document.querySelectorAll('[data-action="media"], .select-image-btn, .media-button, [onclick*="openMediaLibrary"], [onclick*="selectMedia"]').forEach(btn => {
                try {
                    // Get original onclick
                    let originalOnclick = btn.getAttribute('onclick');
                    
                    // Extract target ID if possible
                    let targetId = null;
                    if (originalOnclick) {
                        // Remove onclick to prevent errors
                        btn.removeAttribute('onclick');
                        
                        // Try to extract ID via basic string operations
                        if (originalOnclick.includes('openMediaLibrary')) {
                            // Simplified extraction
                            const parts = originalOnclick.split('openMediaLibrary(');
                            if (parts.length > 1) {
                                const quoteParts = parts[1].split(/['"]([^'"]+)['"]/);
                                if (quoteParts.length > 1) {
                                    targetId = quoteParts[1];
                                }
                            }
                        }
                    }
                    
                    // Add a simple click handler
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log("Emergency Fix: Media button clicked, target:", targetId);
                        alert("Media selector clicked. This is a placeholder. Media selection is temporarily disabled while we fix issues.");
                    });
                } catch (err) {
                    console.error("Error handling media button:", err);
                }
            });
            
            console.log("Emergency Selector Fix: Complete");
        } catch (e) {
            console.error("Error in emergency selector fix:", e);
        }
    }
    
    // Initialize when DOM is ready or after a timeout
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        setTimeout(safeInit, 100);
    }
    
    // Also add a backup initialization
    setTimeout(safeInit, 1000);
})();
