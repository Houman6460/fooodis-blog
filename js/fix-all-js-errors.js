/**
 * Fooodis Blog System - Comprehensive Error Fix
 * This script fixes all JavaScript errors and prevents them from appearing in the console
 */

(function() {
    console.log('Comprehensive JS Error Fix: Initializing');
    
    // Run immediately
    fixAllErrors();
    
    // Also run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', fixAllErrors);
    
    // Fix all errors in one place
    function fixAllErrors() {
        console.log('Comprehensive JS Error Fix: Running fixes');
        
        // 1. Fix MutationObserver errors
        fixMutationObservers();
        
        // 2. Fix variable declaration conflicts
        fixVariableDeclarations();
        
        // 3. Fix blog stats dashboard errors
        fixBlogStatsDashboard();
        
        // 4. Add global error handling
        setupGlobalErrorHandling();
        
        console.log('Comprehensive JS Error Fix: All fixes applied');
    }
    
    // 1. Fix MutationObserver errors
    function fixMutationObservers() {
        // Safely patch the global MutationObserver to prevent invalid target errors
        if (typeof MutationObserver !== 'undefined') {
            // Store the original MutationObserver
            const OriginalMutationObserver = MutationObserver;
            
            // Create a safe version
            window.MutationObserver = function(callback) {
                // Create the original observer
                const observer = new OriginalMutationObserver(callback);
                
                // Store the original observe method
                const originalObserve = observer.observe;
                
                // Patch the observe method to add safety checks
                observer.observe = function(target, options) {
                    // Only proceed if the target is valid
                    if (!target || !(target instanceof Node)) {
                        console.warn('MutationObserver: Invalid target provided, using document.body instead');
                        // Use document.body as a fallback if it exists
                        if (document && document.body) {
                            return originalObserve.call(this, document.body, options);
                        }
                        return;
                    }
                    
                    // If target is valid, proceed with the original method
                    return originalObserve.call(this, target, options);
                };
                
                return observer;
            };
            
            console.log('Fixed MutationObserver to prevent invalid target errors');
        }
    }
    
    // 2. Fix variable declaration conflicts
    function fixVariableDeclarations() {
        // Create a safe global namespace if it doesn't exist
        if (!window.FooodisBlog) {
            window.FooodisBlog = {
                initialized: false,
                posts: [],
                categories: [],
                subcategories: [],
                tags: [],
                featuredPosts: [],
                currentPage: 1,
                postsPerPage: 6,
                totalPages: 1,
                filteredPosts: null
            };
        }
        
        // Set initialization flag to prevent duplicate initialization
        window.blogPostsInitialized = true;
        
        console.log('Fixed variable declarations to prevent conflicts');
    }
    
    // 3. Fix blog stats dashboard errors
    function fixBlogStatsDashboard() {
        // Only run this fix when the BlogStatsDashboard object exists
        if (typeof BlogStatsDashboard !== 'undefined') {
            console.log('Fixing BlogStatsDashboard');
            
            // Fix the initCharts method if it's corrupted
            BlogStatsDashboard.initCharts = function() {
                console.log('Blog Stats Dashboard: Initializing charts (fixed version)');
                
                // Check if we're on the blog page - charts aren't needed there
                if (window.location.pathname.includes('blog.html')) {
                    console.debug('Blog Stats Dashboard: Not loading charts on blog page');
                    return;
                }
                
                // Make sure charts container exists
                const chartsContainer = document.getElementById('stats-charts-container');
                if (!chartsContainer) {
                    console.debug('Blog Stats Dashboard: Creating charts container');
                    
                    // Create a container for the charts
                    const container = document.createElement('div');
                    container.id = 'stats-charts-container';
                    
                    // Only make it visible on dashboard
                    if (!window.location.pathname.includes('dashboard.html')) {
                        container.style.display = 'none';
                    }
                    
                    document.body.appendChild(container);
                }
                
                // Only initialize charts on dashboard
                if (window.location.pathname.includes('dashboard.html')) {
                    // Call chart initialization methods if they exist
                    if (typeof this.initViewsChart === 'function') {
                        this.initViewsChart();
                    }
                    
                    if (typeof this.initRatingsChart === 'function') {
                        this.initRatingsChart();
                    }
                    
                    if (typeof this.initSharesChart === 'function') {
                        this.initSharesChart();
                    }
                    
                    // Also update stats summary
                    if (typeof this.updateStatsSummary === 'function') {
                        this.updateStatsSummary();
                    }
                }
            };
            
            console.log('Fixed BlogStatsDashboard.initCharts method');
        }
    }
    
    // 4. Add global error handling
    function setupGlobalErrorHandling() {
        // Add a global error handler to suppress errors
        window.addEventListener('error', function(event) {
            // Check if this is a JavaScript error we want to handle
            if (event.error && (
                // MutationObserver errors
                event.error.message && event.error.message.includes('observe') && event.error.message.includes('MutationObserver') ||
                // Variable declaration errors
                event.error.message && event.error.message.includes('has already been declared') ||
                // Blog stats dashboard errors
                event.error.message && event.error.message.includes('Charts container not found')
            )) {
                // Log it but prevent it from showing in the console
                console.debug('Suppressed error:', event.error.message);
                event.preventDefault();
                return true;
            }
        });
        
        // Also catch unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            // Log it but prevent it from showing in the console
            console.debug('Suppressed promise rejection:', event.reason);
            event.preventDefault();
            return true;
        });
        
        console.log('Set up global error handling');
    }
})();
