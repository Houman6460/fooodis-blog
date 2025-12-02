/**
 * Blog Card Stats
 * Directly adds view counts and ratings to blog post cards
 */

(function() {
    console.log('Blog Card Stats: Initializing...');
    
    // Only run once when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addStatsToBlogCards, 500);
        });
    } else {
        setTimeout(addStatsToBlogCards, 500);
    }
    
    // Also run after window load for dynamically loaded posts
    window.addEventListener('load', function() {
        setTimeout(addStatsToBlogCards, 1000);
    });
})();

/**
 * Add stats (views and ratings) to all blog post cards
 */
async function addStatsToBlogCards() {
    console.log('Blog Card Stats: Adding stats to blog post cards');
    
    // Get view counts and ratings - prefer from blog posts data (loaded from API)
    let viewCounts = {};
    let ratings = {};
    
    // Try to get stats from blog posts data first (from backend)
    if (window.blogPosts && Array.isArray(window.blogPosts)) {
        window.blogPosts.forEach(post => {
            if (post.id) {
                viewCounts[post.id] = post.views || 0;
                ratings[post.id] = {
                    average: post.rating_avg || 0,
                    count: post.rating_count || 0
                };
            }
        });
    }
    
    // Merge with localStorage for any missing data
    try {
        const localViews = JSON.parse(localStorage.getItem('fooodis-blog-post-views') || '{}');
        const localRatings = JSON.parse(localStorage.getItem('fooodis-blog-post-ratings') || '{}');
        
        // Use localStorage values if backend doesn't have them
        Object.keys(localViews).forEach(id => {
            if (!viewCounts[id] || viewCounts[id] < localViews[id]) {
                viewCounts[id] = localViews[id];
            }
        });
        Object.keys(localRatings).forEach(id => {
            if (!ratings[id] || !ratings[id].count) {
                ratings[id] = localRatings[id];
            }
        });
    } catch (error) {
        console.error('Blog Card Stats: Error loading local stats', error);
    }
    
    // Add CSS once
    addFixedPositionCSS();
    
    // Clean up any orphan stats that are not inside cards
    document.querySelectorAll('.blog-card-stats').forEach(el => {
        const parent = el.parentElement;
        if (!parent || (!parent.classList.contains('blog-post-card') && 
            !parent.classList.contains('blog-post') && 
            !parent.classList.contains('blog-post-content') &&
            !parent.classList.contains('blog-grid-item'))) {
            el.remove();
        }
    });
    
    // Find all blog post cards - try multiple selectors
    const postCards = Array.from(document.querySelectorAll('.blog-post-card, .blog-post, .blog-grid-item'));
    
    console.log(`Blog Card Stats: Found ${postCards.length} blog post cards`);
    
    // Process each post card
    postCards.forEach(card => {
        // Skip if this card already has stats
        if (card.querySelector('.blog-card-stats')) {
            return;
        }
        
        // Check multiple possible ID attributes
        const postId = card.getAttribute('data-post-id') || card.getAttribute('data-id') || card.dataset.postId || card.dataset.id;
        if (!postId) {
            return; // Skip silently
        }
        
        // Get stats for this post
        const viewCount = viewCounts[postId] || 0;
        const postRating = ratings[postId] || { average: 0, count: 0 };
        
        // Create the stats container
        const statsDiv = document.createElement('div');
        statsDiv.className = 'blog-card-stats';
        statsDiv.setAttribute('data-post-id', postId);
        
        // Set the HTML content - use Font Awesome eye icon and Fooodis yellow (#e8f24c)
        statsDiv.innerHTML = `
            <div class="stats-view-count">
                <i class="fas fa-eye" style="color: #e8f24c; font-size: 14px;"></i>
                <span style="color: #e8f24c; font-weight: bold;">${viewCount}</span>
            </div>
            <div class="stats-rating">
                <div class="stats-stars">${getStarsHtml(postRating.average)}</div>
                <span style="color: #e8f24c;">(${postRating.count})</span>
            </div>
        `;
        
        // Find the best place to append - content area or card itself
        const contentArea = card.querySelector('.blog-post-content') || card.querySelector('.post-content') || card;
        
        // Make sure card has relative positioning
        card.style.position = 'relative';
        
        // Append to content area if found, otherwise to card
        contentArea.appendChild(statsDiv);
        
        console.log(`Blog Card Stats: Added stats to post ${postId} in`, contentArea.className || 'card');
    });
    
    // Initialize tracking for views and ratings
    initializeViewTracking();
    initializeRatingSystem();
}

/**
 * Add fixed position CSS to ensure stats are always at bottom of cards
 */
function addFixedPositionCSS() {
    // Remove any existing style element
    const existingStyle = document.getElementById('blog-card-stats-css');
    if (existingStyle) existingStyle.remove();
    
    // Create new style element
    const style = document.createElement('style');
    style.id = 'blog-card-stats-css';
    style.textContent = `
        /* Style the stats container - uses flex layout, not absolute */
        .blog-card-stats {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: rgba(30, 33, 39, 0.95) !important;
            padding: 10px 15px !important;
            margin-top: auto !important;
            border-top: 1px solid rgba(232, 242, 76, 0.3) !important;
            color: rgba(255, 255, 255, 0.9) !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
            width: 100% !important;
        }
        
        /* Ensure blog-post-content uses flex to push stats to bottom */
        .blog-post-content {
            display: flex !important;
            flex-direction: column !important;
            flex-grow: 1 !important;
        }
        
        /* View count styles */
        .stats-view-count {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        
        .eye-icon {
            color: #e8f24c !important;
        }
        
        /* Rating styles */
        .stats-rating {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        
        .stats-stars {
            display: inline-flex !important;
            gap: 2px !important;
        }
        
        /* Move Read More button above stats bar */
        .blog-post-card .read-more,
        .blog-post-card .blog-post-share,
        .blog-post .u-btn,
        .blog-post button,
        .blog-post .btn,
        .blog-post .read-more,
        .blog-post a.more,
        .blog-post .read-more-button {
            margin-bottom: 10px !important;
            position: relative !important;
            z-index: 6 !important;
        }
        
        /* Force hide any other stats that might be added */
        .post-view-count, .post-rating-container, .post-stats-container {
            display: none !important;
        }
    `;
    
    // Add the style to the head
    document.head.appendChild(style);
    console.log('Blog Card Stats: Added fixed position CSS');
}

/**
 * Generate HTML for star ratings
 */
function getStarsHtml(rating) {
    const fullStars = Math.floor(rating);
    let starsHtml = '';
    
    // Add full stars - using exact Fooodis yellow color #e8f24c
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span style="color: #e8f24c;">★</span>';
    }
    
    // Add empty stars
    for (let i = fullStars; i < 5; i++) {
        starsHtml += '<span style="color: rgba(232,242,76,0.3);">★</span>';
    }
    
    return starsHtml;
}

/**
 * Initialize view tracking
 */
function initializeViewTracking() {
    // Get view counts from localStorage
    let viewCounts = {};
    try {
        viewCounts = JSON.parse(localStorage.getItem('fooodis-blog-post-views') || '{}');
    } catch (error) {
        console.error('Blog Card Stats: Error loading view counts', error);
        viewCounts = {};
    }
    
    // Override the openBlogPostModal function if it exists to track views
    if (typeof window.openBlogPostModal === 'function' && !window.openBlogPostModalOverridden) {
        const originalOpenModal = window.openBlogPostModal;
        
        window.openBlogPostModal = function(postId) {
            // Call the original function
            originalOpenModal(postId);
            
            // Increment view count
            if (postId) {
                viewCounts[postId] = (viewCounts[postId] || 0) + 1;
                
                // Save to localStorage
                localStorage.setItem('fooodis-blog-post-views', JSON.stringify(viewCounts));
                
                // Sync to backend API for Blog Statistics
                fetch('/api/posts/' + postId + '/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }).catch(err => console.warn('Could not sync view to backend:', err));
                
                // Update stats display
                setTimeout(addStatsToBlogCards, 100);
                
                console.log(`Blog Card Stats: Tracked view for post ${postId}, now at ${viewCounts[postId]}`);
            }
        };
        
        window.openBlogPostModalOverridden = true;
        console.log('Blog Card Stats: Successfully overrode openBlogPostModal function for view tracking');
    }
}

/**
 * Initialize rating system
 */
function initializeRatingSystem() {
    // Override the openBlogPostModal function to add rating UI to the modal
    if (typeof window.openBlogPostModal === 'function' && !window.openBlogPostModalRatingOverridden) {
        const originalOpenModal = window.openBlogPostModal;
        
        window.openBlogPostModal = function(postId) {
            // Call the original function
            originalOpenModal(postId);
            
            // Add rating UI to the modal
            setTimeout(function() {
                addRatingToModal(postId);
            }, 100);
        };
        
        window.openBlogPostModalRatingOverridden = true;
        console.log('Blog Card Stats: Successfully overrode openBlogPostModal function for ratings');
    }
}

/**
 * Add rating UI to the modal
 */
function addRatingToModal(postId) {
    if (!postId) return;
    
    // Get rating data for this post
    let ratings = {};
    try {
        ratings = JSON.parse(localStorage.getItem('fooodis-blog-post-ratings') || '{}');
    } catch (error) {
        console.error('Blog Card Stats: Error loading ratings', error);
        ratings = {};
    }
    
    const postRating = ratings[postId] || { average: 0, count: 0, userRating: 0 };
    
    // Create or update the rating UI
    let ratingContainer = document.querySelector('.modal-rating-container');
    
    if (!ratingContainer) {
        // Create rating container
        ratingContainer = document.createElement('div');
        ratingContainer.className = 'modal-rating-container';
        ratingContainer.style.cssText = 'margin: 10px 0; display: flex; flex-direction: column;';
        
        // Find where to insert it - after the title
        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle && modalTitle.parentNode) {
            modalTitle.parentNode.insertBefore(ratingContainer, modalTitle.nextSibling);
        }
    }
    
    // Create the rating UI
    let ratingHtml = `
        <div class="modal-rating-stars" style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
            <div class="rating-label" style="color: rgba(255,255,255,0.8); font-size: 14px;">Rate this post:</div>
            <div class="interactive-stars" style="display: flex; gap: 3px;">
    `;
    
    // Add stars - use Fooodis yellow #e8f24c
    for (let i = 1; i <= 5; i++) {
        const isRated = postRating.userRating >= i;
        ratingHtml += `
            <span class="rating-star" data-rating="${i}" style="
                font-size: 24px;
                cursor: pointer;
                color: ${isRated ? '#e8f24c' : 'rgba(232,242,76,0.3)'};
                transition: transform 0.2s, color 0.2s;
            ">★</span>
        `;
    }
    
    // Add rating info
    ratingHtml += `
            </div>
        </div>
        <div class="rating-info" style="display: flex; gap: 10px; color: rgba(255,255,255,0.7); font-size: 14px;">
            <div class="average-rating">
                <span style="color: #e8f24c; font-weight: bold;">${postRating.average > 0 ? postRating.average.toFixed(1) : '-'}</span>
                <span>average</span>
            </div>
            <div class="rating-count">
                <span>${postRating.count}</span>
                <span>${postRating.count === 1 ? 'rating' : 'ratings'}</span>
            </div>
        </div>
        <div class="rating-message" style="
            color: #e8f24c;
            font-size: 14px;
            height: 20px;
            margin-top: 5px;
            opacity: 0;
            transition: opacity 0.3s;
        "></div>
    `;
    
    // Set the HTML
    ratingContainer.innerHTML = ratingHtml;
    
    // Add event listeners to stars
    const stars = ratingContainer.querySelectorAll('.rating-star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            submitRating(postId, rating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(stars, rating);
        });
        
        star.addEventListener('mouseleave', function() {
            resetStarHighlight(stars, postRating.userRating);
        });
    });
}

/**
 * Highlight stars on hover
 */
function highlightStars(stars, rating) {
    stars.forEach((star, index) => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.style.color = '#e8f24c';
            star.style.transform = 'scale(1.2)';
        } else {
            star.style.color = 'rgba(232,242,76,0.3)';
            star.style.transform = 'scale(1)';
        }
    });
}

/**
 * Reset star highlighting
 */
function resetStarHighlight(stars, userRating) {
    stars.forEach((star, index) => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= userRating) {
            star.style.color = '#e8f24c';
        } else {
            star.style.color = 'rgba(232,242,76,0.3)';
        }
        star.style.transform = 'scale(1)';
    });
}

/**
 * Submit a rating for a post
 */
function submitRating(postId, rating) {
    if (!postId || rating < 1 || rating > 5) return;
    
    // Get current ratings
    let ratings = {};
    try {
        ratings = JSON.parse(localStorage.getItem('fooodis-blog-post-ratings') || '{}');
    } catch (error) {
        console.error('Blog Card Stats: Error loading ratings', error);
        ratings = {};
    }
    
    // Get or create rating data for this post
    const postRating = ratings[postId] || { average: 0, count: 0, userRating: 0 };
    
    // Check if this is an update to an existing rating
    if (postRating.userRating > 0) {
        // Recalculate average by removing the previous rating
        const totalPoints = postRating.average * postRating.count - postRating.userRating;
        
        // Add the new rating
        const newTotalPoints = totalPoints + rating;
        
        // Update rating data
        postRating.average = newTotalPoints / postRating.count;
        postRating.userRating = rating;
    } else {
        // This is a new rating
        const newCount = postRating.count + 1;
        const newTotal = postRating.average * postRating.count + rating;
        
        // Update rating data
        postRating.average = newTotal / newCount;
        postRating.count = newCount;
        postRating.userRating = rating;
    }
    
    // Round average to one decimal place
    postRating.average = Math.round(postRating.average * 10) / 10;
    
    // Save the updated rating
    ratings[postId] = postRating;
    localStorage.setItem('fooodis-blog-post-ratings', JSON.stringify(ratings));
    
    // Sync to backend API for Blog Statistics
    fetch('/api/posts/' + postId + '/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: rating })
    }).catch(err => console.warn('Could not sync rating to backend:', err));
    
    console.log(`Blog Card Stats: Submitted rating ${rating} for post ${postId}, new average: ${postRating.average}`);
    
    // Update the UI
    const ratingMessage = document.querySelector('.rating-message');
    if (ratingMessage) {
        ratingMessage.textContent = 'Thanks for your rating!';
        ratingMessage.style.opacity = '1';
        
        // Hide the message after a few seconds
        setTimeout(() => {
            ratingMessage.style.opacity = '0';
        }, 3000);
    }
    
    // Update the star display in the modal
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.style.color = '#e8f24c';
        } else {
            star.style.color = 'rgba(232,242,76,0.3)';
        }
    });
    
    // Update the average and count display
    const averageElem = document.querySelector('.average-rating span:first-child');
    if (averageElem) {
        averageElem.textContent = postRating.average.toFixed(1);
    }
    
    const countElem = document.querySelector('.rating-count span:first-child');
    if (countElem) {
        countElem.textContent = postRating.count;
    }
    
    const countTextElem = document.querySelector('.rating-count span:last-child');
    if (countTextElem) {
        countTextElem.textContent = postRating.count === 1 ? 'rating' : 'ratings';
    }
    
    // Update the blog cards
    setTimeout(addStatsToBlogCards, 100);
}