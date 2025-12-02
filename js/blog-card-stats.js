/**
 * Blog Card Stats
 * Directly adds view counts and ratings to blog post cards
 */

(function() {
    console.log('Blog Card Stats: Initializing...');
    
    // Run immediately and on DOM/window events to ensure it catches everything
    addStatsToBlogCards();
    
    document.addEventListener('DOMContentLoaded', addStatsToBlogCards);
    window.addEventListener('load', function() {
        addStatsToBlogCards();
        setTimeout(addStatsToBlogCards, 500);
        setTimeout(addStatsToBlogCards, 1500);
    });
    
    // Set up a mutation observer to detect new blog posts
    const observer = new MutationObserver(function(mutations) {
        let newContentAdded = false;
        
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                newContentAdded = true;
                break;
            }
        }
        
        if (newContentAdded) {
            setTimeout(addStatsToBlogCards, 100);
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
})();

/**
 * Add stats (views and ratings) to all blog post cards
 */
function addStatsToBlogCards() {
    console.log('Blog Card Stats: Adding stats to blog post cards');
    
    // Get view counts and ratings from localStorage
    let viewCounts = {};
    let ratings = {};
    
    try {
        viewCounts = JSON.parse(localStorage.getItem('fooodis-blog-post-views') || '{}');
        ratings = JSON.parse(localStorage.getItem('fooodis-blog-post-ratings') || '{}');
    } catch (error) {
        console.error('Blog Card Stats: Error loading stats', error);
    }
    
    // First, remove any existing stats to avoid duplicates
    document.querySelectorAll('.blog-card-stats').forEach(el => el.remove());
    
    // Add pure CSS for stats positioning
    addFixedPositionCSS();
    
    // Find all blog post cards - try multiple selectors
    const postCards = Array.from(document.querySelectorAll('.blog-post-card, .blog-post, .blog-grid-item'));
    
    console.log(`Blog Card Stats: Found ${postCards.length} blog post cards`);
    
    // Process each post card
    postCards.forEach(card => {
        const postId = card.getAttribute('data-post-id');
        if (!postId) return;
        
        // Get stats for this post
        const viewCount = viewCounts[postId] || 0;
        const postRating = ratings[postId] || { average: 0, count: 0 };
        
        // Create the stats container
        const statsDiv = document.createElement('div');
        statsDiv.className = 'blog-card-stats';
        statsDiv.setAttribute('data-post-id', postId);
        
        // Set the HTML content
        statsDiv.innerHTML = `
            <div class="stats-view-count">
                <span class="eye-icon" style="color: #FFD010; font-weight: bold; font-size: 16px;">👁️</span>
                <span style="color: #FFD010; font-weight: bold;">${viewCount}</span>
            </div>
            <div class="stats-rating">
                <div class="stats-stars">${getStarsHtml(postRating.average)}</div>
                <span style="color: #FFD010;">(${postRating.count})</span>
            </div>
        `;
        
        // Append to the post card
        card.appendChild(statsDiv);
        
        console.log(`Blog Card Stats: Added stats to post ${postId}`);
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
        /* Position the blog post cards as relative so we can position stats */
        .blog-post-card, .blog-post, .blog-grid-item {
            position: relative !important;
            padding-bottom: 50px !important;
            overflow: hidden !important;
        }
        
        /* Style the stats container */
        .blog-card-stats {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            background: rgba(30, 33, 39, 0.95) !important;
            padding: 10px 15px !important;
            border-top: 1px solid rgba(232, 242, 76, 0.3) !important;
            z-index: 10 !important;
            color: rgba(255, 255, 255, 0.9) !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
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
    
    // Add full stars - using exact Fooodis yellow color
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span style="color: #FFD010;">★</span>';
    }
    
    // Add empty stars
    for (let i = fullStars; i < 5; i++) {
        starsHtml += '<span style="color: rgba(255,208,16,0.3);">★</span>';
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
    
    // Add stars
    for (let i = 1; i <= 5; i++) {
        const isRated = postRating.userRating >= i;
        ratingHtml += `
            <span class="rating-star" data-rating="${i}" style="
                font-size: 24px;
                cursor: pointer;
                color: ${isRated ? '#FFD010' : 'rgba(255,208,16,0.3)'};
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
                <span style="color: #FFD010; font-weight: bold;">${postRating.average > 0 ? postRating.average.toFixed(1) : '-'}</span>
                <span>average</span>
            </div>
            <div class="rating-count">
                <span>${postRating.count}</span>
                <span>${postRating.count === 1 ? 'rating' : 'ratings'}</span>
            </div>
        </div>
        <div class="rating-message" style="
            color: #FFD010;
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
            star.style.color = '#FFD010';
            star.style.transform = 'scale(1.2)';
        } else {
            star.style.color = 'rgba(255,208,16,0.3)';
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
            star.style.color = '#FFD010';
        } else {
            star.style.color = 'rgba(255,208,16,0.3)';
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
            star.style.color = '#FFD010';
        } else {
            star.style.color = 'rgba(255,208,16,0.3)';
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