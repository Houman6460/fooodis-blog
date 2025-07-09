/**
 * Modal Title Fix
 * Prevents duplicate titles in blog post modals
 */

// Execute immediately when loaded
(function() {
    console.log('Modal Title Fix: Initializing...');
    
    // Apply the fix after DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        applyModalTitleFix();
    });
    
    // Also apply on window load
    window.addEventListener('load', function() {
        applyModalTitleFix();
        // Apply again after a delay to catch any late initializations
        setTimeout(applyModalTitleFix, 1000);
    });
})();

/**
 * Apply the modal title fix
 */
function applyModalTitleFix() {
    console.log('Modal Title Fix: Applying fix to prevent duplicate titles');
    
    // Check if the openBlogPostModal function exists
    if (typeof window.openBlogPostModal === 'function') {
        console.log('Modal Title Fix: Found openBlogPostModal function');
        
        // Store the original function
        const originalOpenModal = window.openBlogPostModal;
        
        // Override with our fixed version
        window.openBlogPostModal = function(postId) {
            console.log('Modal Title Fix: Modified openBlogPostModal called for post', postId);
            
            // Call the original function
            originalOpenModal(postId);
            
            // Fix the content after a short delay to ensure the DOM is updated
            setTimeout(function() {
                // Find the blog posts data
                const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
                const post = blogPosts.find(post => post.id === postId);
                
                if (!post) {
                    console.error('Modal Title Fix: Post not found');
                    return;
                }
                
                // Find the modal content element
                const modalContentText = document.querySelector('.modal-content-text');
                if (!modalContentText) {
                    console.error('Modal Title Fix: Modal content element not found');
                    return;
                }
                
                // Check if the content starts with an h1 that duplicates the title
                // This is the case when content starts with "# Title"
                let content = modalContentText.innerHTML;
                
                // Safely extract the title from the post data
                const postTitle = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
                
                // Look for an h1 at the beginning that matches the title
                // We'll match both <h1>Title</h1> and <h1 id="...">Title</h1> patterns
                const titleRegex = new RegExp(`^\\s*<h1(?:\\s+[^>]*)?>\\s*${postTitle}\\s*</h1>\\s*`, 'i');
                
                if (titleRegex.test(content)) {
                    console.log('Modal Title Fix: Found duplicate h1 title, removing it');
                    // Remove the h1 title from the content
                    content = content.replace(titleRegex, '');
                    modalContentText.innerHTML = content;
                }
                
                // Also look for duplicated heading with the same title text format 
                // For example: "Essential Equipment Maintenance Tips for Restaurant Owners"
                const modalTitle = document.querySelector('.modal-title');
                if (modalTitle && post.title === modalTitle.textContent) {
                    // Check for exact duplicate headings beyond the first h1
                    const duplicateHeadingRegex = new RegExp(`<h[1-6](?:\\s+[^>]*)?>\\s*${postTitle}\\s*</h[1-6]>\\s*`, 'i');
                    
                    if (duplicateHeadingRegex.test(content)) {
                        console.log('Modal Title Fix: Found duplicate heading, removing it');
                        // Remove the duplicate heading
                        content = content.replace(duplicateHeadingRegex, '');
                        modalContentText.innerHTML = content;
                    }
                }
                
                console.log('Modal Title Fix: Duplicate title fix applied');
            }, 100);
        };
        
        console.log('Modal Title Fix: Successfully overrode openBlogPostModal function');
    } else {
        console.log('Modal Title Fix: openBlogPostModal function not found yet, will try again later');
    }
    
    // Also set up a MutationObserver to catch dynamic content changes
    setupModalObserver();
}

/**
 * Set up a mutation observer to apply the fix when the modal content changes
 */
function setupModalObserver() {
    // Check if there's already an observer
    if (window._modalTitleObserver) {
        return;
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if a modal was added or updated
                const modalContent = document.querySelector('.modal-content-text');
                const modalTitle = document.querySelector('.modal-title');
                
                if (modalContent && modalTitle) {
                    // Find potential duplicate title in the content
                    let content = modalContent.innerHTML;
                    const title = modalTitle.textContent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
                    
                    // Look for h1 with the title
                    const titleRegex = new RegExp(`^\\s*<h1(?:\\s+[^>]*)?>\\s*${title}\\s*</h1>\\s*`, 'i');
                    
                    if (titleRegex.test(content)) {
                        console.log('Modal Title Fix: Observer found and removed duplicate h1 title');
                        content = content.replace(titleRegex, '');
                        modalContent.innerHTML = content;
                    }
                    
                    // Also check for exact duplicate headings
                    const duplicateHeadingRegex = new RegExp(`<h[1-6](?:\\s+[^>]*)?>\\s*${title}\\s*</h[1-6]>\\s*`, 'i');
                    
                    if (duplicateHeadingRegex.test(content)) {
                        console.log('Modal Title Fix: Observer found and removed duplicate heading');
                        content = content.replace(duplicateHeadingRegex, '');
                        modalContent.innerHTML = content;
                    }
                }
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Store the observer reference
    window._modalTitleObserver = observer;
    
    console.log('Modal Title Fix: Mutation observer set up');
}
