/**
 * Remove Duplicate Hashtags
 * A direct fix to ensure only one set of hashtags appears in blog posts
 */

// Execute immediately when loaded
(function() {
    console.log('Remove Duplicate Hashtags: Initializing...');
    
    // Apply the fix when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        removeDuplicateHashtags();
    });
    
    // Also apply on window load
    window.addEventListener('load', function() {
        removeDuplicateHashtags();
        // Apply again after a delay to catch any late initializations
        setTimeout(removeDuplicateHashtags, 1000);
        setTimeout(removeDuplicateHashtags, 2000);
    });
    
    // Set up a mutation observer to watch for changes to the content
    setupHashtagsObserver();
})();

/**
 * Remove duplicate hashtags from blog post content
 */
function removeDuplicateHashtags() {
    console.log('Remove Duplicate Hashtags: Checking for and removing duplicate hashtags');
    
    // First, try to find an open modal if there is one
    const modalContentText = document.querySelector('.modal-content-text');
    if (modalContentText) {
        cleanHashtagsInElement(modalContentText);
    }
    
    // Also look for any post content in the page
    const postContents = document.querySelectorAll('.post-content');
    postContents.forEach(content => {
        cleanHashtagsInElement(content);
    });
    
    // Enhance any existing posts in localStorage to fix duplicates
    fixStoredPosts();
}

/**
 * Clean hashtags in a given element
 */
function cleanHashtagsInElement(element) {
    if (!element) return;
    
    let content = element.innerHTML;
    let modified = false;
    
    // Check for the plain text hashtags section (markdown rendered)
    // This will match <h2>Hashtags</h2> followed by text with hashtags
    const hashtagHeadingRegex = /<h2[^>]*>\s*Hashtags\s*<\/h2>/g;
    const matches = content.match(hashtagHeadingRegex);
    
    if (matches && matches.length > 0) {
        console.log(`Remove Duplicate Hashtags: Found ${matches.length} hashtag headings`);
        
        // If we have a styled hashtags section, remove all plain text hashtag sections
        if (content.includes('<div class="post-hashtags">')) {
            console.log('Remove Duplicate Hashtags: Styled hashtags exist, removing plain text hashtags');
            
            // Remove the heading and any text that follows until another heading or div
            const cleanedContent = content.replace(/<h2[^>]*>\s*Hashtags\s*<\/h2>[\s\S]*?(?=<h2|<div|$)/g, '');
            
            // If content was changed, update the element
            if (cleanedContent !== content) {
                element.innerHTML = cleanedContent;
                modified = true;
                console.log('Remove Duplicate Hashtags: Removed plain text hashtags');
            }
        }
        // If we have multiple hashtag headings, keep only the last one (which should be styled)
        else if (matches.length > 1) {
            console.log('Remove Duplicate Hashtags: Multiple hashtag sections found, keeping only the last one');
            
            // Find all hashtag sections and remove all but the last one
            const sections = content.split(/<h2[^>]*>\s*Hashtags\s*<\/h2>/);
            if (sections.length > 2) {
                let newContent = sections[0];
                for (let i = 1; i < sections.length - 1; i++) {
                    // Skip adding back the hashtag headings for all but the last section
                    const nextSection = sections[i].replace(/^[\s\S]*?(?=<h2|<div|$)/g, '');
                    newContent += nextSection;
                }
                newContent += '<h2>Hashtags</h2>' + sections[sections.length - 1];
                
                element.innerHTML = newContent;
                modified = true;
                console.log('Remove Duplicate Hashtags: Kept only the last hashtag section');
            }
        }
    }
    
    return modified;
}

/**
 * Set up a mutation observer to watch for changes to hashtag content
 */
function setupHashtagsObserver() {
    console.log('Remove Duplicate Hashtags: Setting up mutation observer');
    
    // Create a new mutation observer
    const observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        
        // Check if any of the mutations involve hashtag elements
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if any added nodes contain hashtags
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('hashtag')) {
                            shouldCheck = true;
                        } else if (node.querySelector && node.querySelector('.hashtag')) {
                            shouldCheck = true;
                        }
                    }
                });
            }
        });
        
        if (shouldCheck) {
            console.log('Remove Duplicate Hashtags: Content change detected, checking for duplicates');
            setTimeout(removeDuplicateHashtags, 100);
        }
    });
    
    try {
        // Safely check if document.body exists before observing
        if (document && document.body && document.body.nodeType === 1) {
            // Start observing the document body
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Store the observer reference
            window._hashtagsObserver = observer;
            
            console.log('Remove Duplicate Hashtags: Mutation observer set up');
        } else {
            console.warn('Remove Duplicate Hashtags: Document body not available yet');
            // Try again in a moment when document.body is available
            setTimeout(setupHashtagsObserver, 300);
        }
    } catch (e) {
        console.error('Remove Duplicate Hashtags: Error setting up observer', e);
    }
}

/**
 * Fix stored posts in localStorage to remove duplicate hashtags
 */
function fixStoredPosts() {
    try {
        // Get existing posts
        const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        let modified = false;
        
        // Fix each post
        blogPosts.forEach(post => {
            if (post.content) {
                // Count occurrences of hashtag headings
                const hashtagCount = (post.content.match(/## Hashtags/g) || []).length;
                
                if (hashtagCount > 1) {
                    console.log(`Remove Duplicate Hashtags: Post ${post.id} has ${hashtagCount} hashtag sections`);
                    
                    // Keep only the content up to the first hashtags section
                    const parts = post.content.split('## Hashtags');
                    if (parts.length > 1) {
                        post.content = parts[0];
                        modified = true;
                        console.log(`Remove Duplicate Hashtags: Fixed post ${post.id}`);
                    }
                }
            }
        });
        
        // Save back to localStorage if modified
        if (modified) {
            localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
            console.log('Remove Duplicate Hashtags: Fixed duplicate hashtags in stored posts');
        }
    } catch (error) {
        console.error('Remove Duplicate Hashtags: Error fixing stored posts', error);
    }
}
