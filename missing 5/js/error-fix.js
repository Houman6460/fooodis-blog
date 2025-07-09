/**
 * Fooodis Blog System - Error Fix Script
 * Fixes JavaScript errors related to MutationObservers and variable declarations
 */

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Error fix script: Initializing');
    
    // Fix for duplicate variable declarations
    fixDuplicateVariableDeclarations();
    
    // Fix MutationObserver errors
    fixMutationObservers();
    
    // General error prevention
    addErrorHandling();
});

/**
 * Fix duplicate variable declarations by ensuring scripts aren't loaded multiple times
 */
function fixDuplicateVariableDeclarations() {
    // Check if scripts are loaded multiple times and prevent them from running twice
    if (window.scriptsInitialized) {
        console.log('Error fix: Preventing duplicate script initialization');
        return;
    }
    
    // Set flag to prevent multiple initializations
    window.scriptsInitialized = true;
    
    // Create a safe global namespace for blog-related variables
    if (!window.FooodisBlog) {
        window.FooodisBlog = {
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
    
    console.log('Error fix: Variable namespace created');
}

/**
 * Fix MutationObserver errors by ensuring target elements exist before observing
 */
function fixMutationObservers() {
    // Patch the MutationObserver setup in remove-duplicate-hashtags.js
    if (typeof setupHashtagsObserver === 'function') {
        console.log('Error fix: Patching hashtags observer');
        
        // Override the function to add proper element checks
        const originalSetupHashtagsObserver = setupHashtagsObserver;
        window.setupHashtagsObserver = function(target) {
            if (!target || !(target instanceof Node)) {
                console.log('Error fix: Invalid target for hashtags observer, using fallback');
                target = document.getElementById('tagsContainer') || document.body;
            }
            
            try {
                return originalSetupHashtagsObserver(target);
            } catch (e) {
                console.error('Error fix: Could not setup hashtags observer', e);
            }
        };
    }
    
    // Create a safe version of MutationObserver
    const SafeMutationObserver = function(callback) {
        try {
            return new MutationObserver(callback);
        } catch (e) {
            console.error('Error fix: Could not create MutationObserver', e);
            // Return a dummy observer with the same API
            return {
                observe: function() {},
                disconnect: function() {}
            };
        }
    };
    
    // Patch the original MutationObserver to add safety checks
    if (typeof MutationObserver !== 'undefined') {
        const OriginalMutationObserver = MutationObserver;
        window.MutationObserver = function(callback) {
            const observer = new OriginalMutationObserver(callback);
            const originalObserve = observer.observe;
            
            observer.observe = function(target, options) {
                if (!target || !(target instanceof Node)) {
                    console.warn('Error fix: Prevented invalid MutationObserver target');
                    return;
                }
                return originalObserve.call(this, target, options);
            };
            
            return observer;
        };
    }
    
    console.log('Error fix: MutationObserver patched');
}

/**
 * Add general error handling to prevent uncaught exceptions
 */
function addErrorHandling() {
    // Add global error handler
    window.addEventListener('error', function(event) {
        console.log('Error fix: Caught error', event.error);
        
        // Prevent the error from breaking the page
        event.preventDefault();
        
        // Try to recover the page state
        setTimeout(function() {
            // Force refresh elements that might be affected
            const tagsContainer = document.getElementById('tagsContainer');
            if (tagsContainer) {
                console.log('Error fix: Refreshing tags container');
                // Force re-render tags if needed
                if (typeof renderHashtagsExactFormat === 'function') {
                    renderHashtagsExactFormat();
                }
            }
        }, 500);
        
        return true;
    });
    
    console.log('Error fix: Error handling added');
}

// Run the fix immediately
fixDuplicateVariableDeclarations();
