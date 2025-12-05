// Footer inclusion script - with immediate execution and debugging
(function() {
    console.log('Footer loader script executing');
    // Load the unified footer loader script immediately, don't wait for DOMContentLoaded
    if (!window.footerScriptLoaded) {
        window.footerScriptLoaded = true;
        
        // Detect if we're in a subdirectory
        const isInSubdir = window.location.pathname.includes('/sv/');
        const basePath = isInSubdir ? '../' : '';
        console.log('Footer path detection:', isInSubdir ? 'Swedish version' : 'English version');
        
        // Create script tag with error handling
        const script = document.createElement('script');
        script.src = basePath + 'assets/unified-footer-loader.js';
        
        // Add error handling
        script.onerror = function() {
            console.error('Failed to load unified footer script');
        };
        
        script.onload = function() {
            console.log('Unified footer script loaded successfully');
        };
        
        // Don't use async to ensure sequential execution
        document.head.appendChild(script);
        console.log('Footer loader script added to document');
    }
    
    // Also add DOMContentLoaded handler as fallback
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded event fired');
        if (!window.footerLoaded) {
            console.log('Footer not loaded by DOMContentLoaded, retrying...');
            // If window.footerLoaded isn't true by now, the script might have failed
            const isInSubdir = window.location.pathname.includes('/sv/');
            const basePath = isInSubdir ? '../' : '';
            
            // Try direct script execution
            const scriptElement = document.createElement('script');
            scriptElement.src = basePath + 'assets/unified-footer-loader.js?nocache=' + new Date().getTime();
            document.head.appendChild(scriptElement);
        }
    });
})();
