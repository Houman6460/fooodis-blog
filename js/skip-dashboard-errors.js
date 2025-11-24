/**
 * Skip Dashboard Errors
 * This script prevents the blog stats dashboard errors from showing in the console
 * on the blog page where they are not relevant
 */

(function() {
    console.log('Skip Dashboard Errors: Initializing');
    
    // Check if we're on the blog page (not dashboard)
    if (window.location.pathname.includes('blog.html')) {
        // Patch the BlogStatsDashboard object
        if (typeof window.BlogStatsDashboard !== 'undefined') {
            console.log('Skip Dashboard Errors: Patching dashboard on blog page');
            
            // Override the initCharts method to prevent errors
            window.BlogStatsDashboard.initCharts = function() {
                console.log('Blog Stats Dashboard: Charts disabled on blog page');
                return; // Do nothing on blog page
            };
        }
        
        // Create a global error interceptor for specific errors
        window.addEventListener('error', function(event) {
            // Check if this is a dashboard-related error
            if (event.message && (
                event.message.includes('Charts container not found') ||
                event.message.includes('blog-stats-dashboard')
            )) {
                // Suppress the error
                event.preventDefault();
                console.debug('Suppressed dashboard error on blog page');
                return true;
            }
        }, true);
    }
})();
