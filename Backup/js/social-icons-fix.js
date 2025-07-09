/**
 * Social Icons Fix
 * Ensures all blog post cards have social media icons, especially the first 4 cards
 * This script runs after all other scripts to guarantee icons remain visible
 */

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial delay to let other scripts run first
    setTimeout(initSocialIconsFix, 300);
});

function initSocialIconsFix() {
    // Function to ensure social icons exist on all cards
    function fixSocialIcons() {
        const cards = document.querySelectorAll('.blog-post-card');
        
        cards.forEach((card, index) => {
            const isFirstFourCards = index < 4;
            const postId = card.dataset.id;
            
            // Always force rebuild social icons for first 4 cards
            if (isFirstFourCards) {
                rebuildSocialIcons(card, postId);
            } 
            // For other cards, only fix if missing
            else if (!card.querySelector('.social-icons')) {
                rebuildSocialIcons(card, postId);
            }
        });
    }
    
    // Function to rebuild the social icons structure
    function rebuildSocialIcons(card, postId) {
        const content = card.querySelector('.blog-post-content');
        if (!content) return;
        
        // Find or create share container
        let shareContainer = content.querySelector('.share-container');
        
        // If it exists but has issues, remove and recreate it
        if (shareContainer) {
            // Save the read more link if it exists
            const readMoreLink = shareContainer.querySelector('.read-more');
            content.removeChild(shareContainer);
            
            // Create new share container
            shareContainer = document.createElement('div');
            shareContainer.className = 'share-container';
            
            // Add back the read more link if it existed
            if (readMoreLink) {
                shareContainer.appendChild(readMoreLink);
            } else {
                const newReadMore = document.createElement('a');
                newReadMore.className = 'read-more';
                newReadMore.href = '#';
                newReadMore.dataset.id = postId;
                newReadMore.textContent = 'READ MORE';
                shareContainer.appendChild(newReadMore);
            }
        } 
        // If share container doesn't exist, create it
        else {
            shareContainer = document.createElement('div');
            shareContainer.className = 'share-container';
            
            // Look for a read more link that might be directly in the content
            let readMoreLink = content.querySelector('.read-more');
            
            if (readMoreLink) {
                // Move it to the share container
                content.removeChild(readMoreLink);
                shareContainer.appendChild(readMoreLink);
            } else {
                // Create a new read more link
                readMoreLink = document.createElement('a');
                readMoreLink.className = 'read-more';
                readMoreLink.href = '#';
                readMoreLink.dataset.id = postId;
                readMoreLink.textContent = 'READ MORE';
                shareContainer.appendChild(readMoreLink);
            }
        }
        
        // Create social icons
        const socialIcons = document.createElement('div');
        socialIcons.className = 'social-icons';
        socialIcons.innerHTML = `
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href + '?post=' + postId)}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this post!')}&url=${encodeURIComponent(window.location.href + '?post=' + postId)}" target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href + '?post=' + postId)}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
                <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="mailto:?subject=${encodeURIComponent('Check out this blog post')}&body=${encodeURIComponent('I thought you might be interested in this post: ' + window.location.href + '?post=' + postId)}">
                <i class="fas fa-envelope"></i>
            </a>
        `;
        
        // Add social icons to the share container
        shareContainer.appendChild(socialIcons);
        
        // Add the share container to the content
        content.appendChild(shareContainer);
        
        // Ensure click events are attached
        attachClickEvents(card);
    }
    
    // Function to ensure click events are attached
    function attachClickEvents(card) {
        // Remove any existing click events
        const clone = card.cloneNode(true);
        card.parentNode.replaceChild(clone, card);
        
        // Add click event to the card
        clone.addEventListener('click', function(e) {
            // Don't open modal if clicking on read-more or social icons
            if (!e.target.closest('.read-more') && !e.target.closest('.social-icons')) {
                const postId = this.dataset.id;
                if (typeof openBlogPostModal === 'function') {
                    openBlogPostModal(postId);
                }
            }
        });
        
        // Add click events to read more link
        const readMoreLink = clone.querySelector('.read-more');
        if (readMoreLink) {
            readMoreLink.addEventListener('click', function(e) {
                e.preventDefault();
                const postId = this.dataset.id;
                if (typeof openBlogPostModal === 'function') {
                    openBlogPostModal(postId);
                }
            });
        }
    }
    
    // First run immediately
    fixSocialIcons();
    
    // Setup an interval to periodically check for cards missing social icons
    // This ensures icons remain visible even if other scripts modify the DOM
    const iconCheckInterval = setInterval(fixSocialIcons, 1000);
    
    // After 10 seconds, reduce the frequency to avoid performance issues
    setTimeout(function() {
        clearInterval(iconCheckInterval);
        setInterval(fixSocialIcons, 3000);
    }, 10000);
    
    // Also run the fix when the page is scrolled, as new posts might be loaded
    window.addEventListener('scroll', function() {
        fixSocialIcons();
    });
}
