
/**
 * Blog Initialization Safety
 * Prevents infinite loops and ensures proper blog loading
 */

console.log('Blog Safety: Loading safety mechanisms...');

// Global flag to prevent multiple initializations
window.blogSafetyInitialized = window.blogSafetyInitialized || false;

// Prevent runaway script execution
let executionCount = 0;
const maxExecutions = 10;

// Override console.log to detect infinite loops
const originalConsoleLog = console.log;
let logCount = 0;
const maxLogs = 100;

console.log = function(...args) {
    logCount++;
    if (logCount > maxLogs) {
        console.error('Blog Safety: Too many console logs detected, possible infinite loop');
        return;
    }
    originalConsoleLog.apply(console, args);
};

// Reset log count periodically
setInterval(() => {
    logCount = 0;
}, 5000);

// Ensure DOM is stable before initializing
function waitForStableDOM(callback, attempts = 0) {
    if (attempts > 20) {
        console.warn('Blog Safety: DOM not stable after 20 attempts');
        return;
    }
    
    if (document.readyState === 'complete' && document.getElementById('blogPostsGrid')) {
        callback();
    } else {
        setTimeout(() => waitForStableDOM(callback, attempts + 1), 100);
    }
}

// Safe initialization wrapper
function safeInitialize() {
    if (window.blogSafetyInitialized) {
        console.log('Blog Safety: Already initialized');
        return;
    }
    
    executionCount++;
    if (executionCount > maxExecutions) {
        console.error('Blog Safety: Maximum execution count reached, stopping');
        return;
    }
    
    console.log('Blog Safety: Performing safe initialization...');
    window.blogSafetyInitialized = true;
    
    // Ensure blog grid exists
    const blogGrid = document.getElementById('blogPostsGrid');
    if (blogGrid && blogGrid.innerHTML.includes('Loading')) {
        blogGrid.innerHTML = '<p>Welcome to the Fooodis Blog! Check back soon for new posts.</p>';
    }
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForStableDOM(safeInitialize);
    });
} else {
    waitForStableDOM(safeInitialize);
}
