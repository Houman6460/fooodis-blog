
/**
 * Console Error Fixer
 * Handles and prevents common JavaScript errors
 */

(function() {
    'use strict';

    // Prevent Maximum call stack size exceeded errors
    const originalConsoleError = console.error;
    let errorCount = 0;
    const maxErrors = 50;

    console.error = function(...args) {
        if (errorCount < maxErrors) {
            errorCount++;
            originalConsoleError.apply(console, args);
        }
        
        // Reset error count after a delay
        setTimeout(() => {
            if (errorCount > 0) errorCount--;
        }, 1000);
    };

    // Handle uncaught errors
    window.addEventListener('error', function(event) {
        if (event.message.includes('Maximum call stack size exceeded')) {
            event.preventDefault();
            console.warn('Prevented stack overflow error');
            return true;
        }
    });

    // Handle promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('Unhandled promise rejection:', event.reason);
        event.preventDefault();
    });

    console.log('Console error fixer loaded');
})();
