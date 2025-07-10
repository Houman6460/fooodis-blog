/**
 * Post Stats Display
 * Adds view counts and ratings to blog post cards and modals
 */

// Global object to store original share icons
const shareIconsInfo = {
    icons: [],
    initialized: false
};

(function() {
    console.log('Post Stats: Script loading...');

    // First priority: preserve share icons
    preserveShareIcons();

    // Run on page load and DOM events to ensure consistent display
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Post Stats: DOMContentLoaded fired');
        initPostStats();
        restoreShareIcons();
    });

    window.addEventListener('load', function() {
        console.log('Post Stats: Window load fired');
        initPostStats();
        restoreShareIcons();

        // Apply multiple times to catch late-loading content
        setTimeout(function() {
            initPostStats();
            restoreShareIcons();
        }, 500);

        setTimeout(function() {
            initPostStats();
            restoreShareIcons();
        }, 1500);

        // Final attempt for very late loading content
        setTimeout(function() {
            initPostStats();
            restoreShareIcons();
        }, 3000);
    });

    // Also run immediately if possible
    if (document.readyState !== 'loading') {
        console.log('Post Stats: Document already loaded, initializing now');
        setTimeout(function() {
            initPostStats();
            restoreShareIcons();
        }, 10);
    }

    // Set up mutation observer to catch dynamically added content
    const observer = new MutationObserver(function(mutations) {
        let contentChanged = false;

        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                contentChanged = true;
            }
        });

        if (contentChanged) {
            setTimeout(function() {
                initPostStats();
                restoreShareIcons();
            }, 100);
        }
    });

    // Safety check to ensure document.body exists before observing
    if (document && document.body && document.body.nodeType === 1) {
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Post Stats Display: Observer initialized');
    } else {
        console.warn('Post Stats Display: Document body not available, will retry');
        // Try again after a short delay
        setTimeout(function() {
            if (document && document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
                console.log('Post Stats Display: Observer initialized (retry)');
            }
        }, 500);
    }
})();

/**
 * Store original share icons to preserve them
 */
function preserveShareIcons() {
    if (shareIconsInfo.initialized) {
        // Still check for new share icons even if already initialized
        const existingIds = shareIconsInfo.icons.map(icon => icon.id);
        const allShareButtons = document.querySelectorAll('.social-share, .share-button, .share-icon, [class*="share"], .blog-share, a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="mailto"]');

        allShareButtons.forEach((button, index) => {
            // If this button doesn't have a preservation ID yet, add it
            if (!button.hasAttribute('data-preserved-share-id')) {
                const newId = 'preserved-share-' + (shareIconsInfo.icons.length + index);
                const parent = button.parentNode;
                const nextSibling = button.nextSibling;

                if (parent) {
                    shareIconsInfo.icons.push({
                        element: button.cloneNode(true),
                        parent: parent,
                        nextSibling: nextSibling,
                        id: newId,
                        originalPosition: getElementPosition(button)
                    });

                    // Mark the original with a data attribute
                    button.setAttribute('data-preserved-share-id', newId);
                    // Make extra sure it's visible
                    button.style.display = '';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                    button.style.zIndex = '100';
                }
            }
        });

        return;
    }

    console.log('Post Stats: Preserving share icons');

    // Find all share icons and store their info - use a more comprehensive selector
    const shareButtons = document.querySelectorAll('.social-share, .share-button, .share-icon, [class*="share"], .blog-share, a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="mailto"]');

    shareButtons.forEach((button, index) => {
        // Save the button's parent, position, and HTML
        const parent = button.parentNode;
        const nextSibling = button.nextSibling;

        if (parent) {
            shareIconsInfo.icons.push({
                element: button.cloneNode(true),
                parent: parent,
                nextSibling: nextSibling,
                id: 'preserved-share-' + index,
                originalPosition: getElementPosition(button)
            });

            // Mark the original with a data attribute
            button.setAttribute('data-preserved-share-id', 'preserved-share-' + index);
            // Make extra sure it's visible
            button.style.display = '';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.zIndex = '100';
        }
    });

    shareIconsInfo.initialized = true;
    console.log(`Post Stats: Preserved ${shareIconsInfo.icons.length} share icons`);
}

/**
 * Get element's position relative to its parent
 */
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentNode ? element.parentNode.getBoundingClientRect() : null;

    return {
        top: parentRect ? rect.top - parentRect.top : rect.top,
        left: parentRect ? rect.left - parentRect.left : rect.left,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Restore share icons if they've disappeared
 */
function restoreShareIcons() {
    if (!shareIconsInfo.initialized || shareIconsInfo.icons.length === 0) return;

    console.log('Post Stats: Checking if share icons need to be restored');

    // Check each preserved icon
    shareIconsInfo.icons.forEach(iconInfo => {
        // Look for the original
        const original = document.querySelector(`[data-preserved-share-id="${iconInfo.id}"]`);

        // If original is missing or detached, restore it
        if (!original || !original.isConnected || original.style.display === 'none' || original.style.visibility === 'hidden' || original.style.opacity === '0') {
            console.log(`Post Stats: Restoring share icon ${iconInfo.id}`);

            // Create a fresh clone
            const newElement = iconInfo.element.cloneNode(true);
            newElement.setAttribute('data-preserved-share-id', iconInfo.id);

            // Apply visibility styles
            newElement.style.display = '';
            newElement.style.visibility = 'visible';
            newElement.style.opacity = '1';
            newElement.style.zIndex = '100';
            newElement.style.position = 'relative';

            // Insert back in the original position
            if (iconInfo.parent && iconInfo.parent.isConnected) {
                if (iconInfo.nextSibling && iconInfo.nextSibling.isConnected) {
                    iconInfo.parent.insertBefore(newElement, iconInfo.nextSibling);
                } else {
                    iconInfo.parent.appendChild(newElement);
                }

                // If we have position information, use it
                if (iconInfo.originalPosition) {
                    newElement.style.position = 'relative';
                    if (iconInfo.originalPosition.top) newElement.style.top = iconInfo.originalPosition.top + 'px';
                    if (iconInfo.originalPosition.left) newElement.style.left = iconInfo.originalPosition.left + 'px';
                }

                console.log(`Post Stats: Successfully restored share icon ${iconInfo.id}`);
            }
        } else {
            // Make sure existing icon is visible
            original.style.display = '';
            original.style.visibility = 'visible';
            original.style.opacity = '1';
            original.style.zIndex = '100';
            original.style.position = 'relative';
        }
    });
}

/**
 * Initialize post stats (view counts and ratings)
 */
function initPostStats() {
    console.log('Post Stats: Initializing...');

    // Clean up any previous stats displays
    cleanup();

    // Add required CSS
    addStatsStyles();

    // Ensure all share icons are preserved first
    preserveShareIcons();

    // Add stats to blog post cards
    addStatsToCards();

    // Set up modal stats when posts are opened
    setupModalStats();

    // Make sure share icons are still visible after stats are added
    setTimeout(() => {
        restoreShareIcons();
        // Double-check again after a delay
        setTimeout(restoreShareIcons, 500);
    }, 100);

    console.log('Post Stats: Initialization complete');
}

/**
 * Clean up any previous stats displays
 */
function cleanup() {
    // Remove existing stats elements
    document.querySelectorAll('.blog-post-stats').forEach(el => el.remove());

    // Remove any orphaned style elements
    const oldStyle = document.getElementById('blog-post-stats-css');
    if (oldStyle) oldStyle.remove();
}

/**
 * Add CSS styles for stats display
 */
function addStatsStyles() {
    // First add Material Design Icons if not already present
    if (!document.getElementById('material-icons-css')) {
        const materialIcons = document.createElement('link');
        materialIcons.id = 'material-icons-css';
        materialIcons.rel = 'stylesheet';
        materialIcons.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(materialIcons);
        console.log('Post Stats: Added Material Icons stylesheet');
    }

    // Add our custom styles
    const style = document.createElement('style');
    style.id = 'blog-post-stats-css';
    style.textContent = `
        /* Position blog post cards as relative for absolute positioning of stats */
        .blog-post {
            position: relative !important; 
            padding-bottom: 40px !important;
            /* Ensure content flows normally */
            overflow: visible !important;
        }

        /* Stats container at bottom of cards */
        .blog-post-stats {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 40px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            background: transparent !important; /* Make it transparent to show page background */
            border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
            padding: 0 15px !important;
            font-family: Arial, sans-serif !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
            z-index: 5 !important; /* Lower z-index to avoid covering other elements */
            pointer-events: none !important; /* Allow clicks to pass through to elements below */
        }

        /* Ensure share icons remain visible and clickable */
        .social-share, .share-button, .share-icon, [class*="share"],
        a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="mailto"] {
            position: relative !important;
            z-index: 10 !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            margin-right: 2px;
        }

        /* Fix for Read More button */
        .blog-post .btn,
        .blog-post .button,
        .blog-post button,
        .blog-post a.more,
        .blog-post a.read-more,
        .blog-post .u-btn {
            position: relative !important;
            z-index: 10 !important;
        }

        /* Views section */
        .blog-post-stats-views {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            pointer-events: auto !important; /* Re-enable clicks just for this element */
        }

        .material-icons.blog-post-stats-views-icon {
            color: #e8f24c !important;
            font-size: 18px !important;
        }

        .blog-post-stats-views-count {
            color: #e8f24c !important;
            font-weight: bold !important;
        }

        /* Ratings section */
        .blog-post-stats-ratings {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            pointer-events: auto !important; /* Re-enable clicks just for this element */
        }

        .blog-post-stats-stars {
            display: flex !important;
            gap: 2px !important;
        }

        .material-icons.blog-post-stats-star {
            color: rgba(232, 242, 76, 0.3) !important;
            font-size: 16px !important;
        }

        .material-icons.blog-post-stats-star.filled {
            color: #e8f24c !important;
        }

        .blog-post-stats-count {
            color: #e8f24c !important;
            font-weight: bold !important;
        }
    `;

    document.head.appendChild(style);
}

/**
 * Add stats to each blog post card
 */
function addStatsToCards() {
    console.log('Post Stats: Adding stats to cards');

    // Find all blog post cards using multiple selectors to ensure we get them
    const postCardSelectors = [
        '.blog-post',
        '.blog-grid-item',
        '.blog-card',
        '.blog-post-card',
        'article.post',
        '[data-post-id]'
    ];

    // Collect unique cards
    let postCards = [];
    postCardSelectors.forEach(selector => {
        const cards = document.querySelectorAll(selector);
        if (cards.length > 0) {
            console.log(`Post Stats: Found ${cards.length} cards with selector ${selector}`);
            postCards = [...postCards, ...Array.from(cards)];
        }
    });

    // Remove duplicates
    postCards = [...new Set(postCards)];
    console.log(`Post Stats: Found ${postCards.length} unique blog post cards`);

    // If no cards found yet, force a direct search by ID pattern
    if (postCards.length === 0) {
        console.log('Post Stats: No cards found with standard selectors, trying ID-based search');
        const allElements = document.querySelectorAll('*[id*="post"], *[id*="blog"], *[class*="post"], *[class*="blog"]');
        postCards = Array.from(allElements).filter(el => {
            // Check if it looks like a blog post
            return el.querySelector('h2, h3, .post-title, .blog-title') !== null;
        });
        console.log(`Post Stats: Found ${postCards.length} potential blog posts by ID pattern`);
    }

    // Get stats data from localStorage
    const viewCounts = loadFromStorage('fooodis-blog-post-views', {});
    const ratings = loadFromStorage('fooodis-blog-post-ratings', {});

    // Add stats to each card
    postCards.forEach((card, index) => {
        // Try to get post ID, or create one if missing
        let postId = card.getAttribute('data-post-id');
        if (!postId) {
            // Try to find an ID from other attributes
            postId = card.id || card.getAttribute('id') || card.getAttribute('data-id');

            // If still no ID, generate one based on index and some content
            if (!postId) {
                const title = card.querySelector('h2, h3, .title');
                postId = 'post-' + index + '-' + (title ? title.textContent.trim().substring(0, 20).replace(/\W+/g, '-') : 'untitled');
                // Store the generated ID
                card.setAttribute('data-post-id', postId);
            }
        }

        // Get stats for this post
        const viewCount = viewCounts[postId] || 0;
        const ratingData = ratings[postId] || { average: 0, count: 0 };

        // Remove any existing stats containers from this card
        const existingStats = card.querySelectorAll('.blog-post-stats');
        existingStats.forEach(el => el.remove());

        // Create stats container with inline styles for maximum reliability
        const statsContainer = document.createElement('div');
        statsContainer.className = 'blog-post-stats';
        statsContainer.setAttribute('data-post-id', postId);

        // Add views section with inline styles
        const viewsSection = document.createElement('div');
        viewsSection.className = 'blog-post-stats-views';
        viewsSection.innerHTML = `
            <i class="material-icons blog-post-stats-views-icon">visibility</i>
            <span class="blog-post-stats-views-count">${viewCount}</span>
        `;

        // Add ratings section with inline styles
        const ratingsSection = document.createElement('div');
        ratingsSection.className = 'blog-post-stats-ratings';

        // Create stars HTML
        let starsHtml = '<div class="blog-post-stats-stars">';

        for (let i = 1; i <= 5; i++) {
            const filled = i <= Math.round(ratingData.average);
            starsHtml += `<i class="material-icons blog-post-stats-star${filled ? ' filled' : ''}">star</i>`;
        }

        starsHtml += '</div>';

        // Add stars and count
        ratingsSection.innerHTML = starsHtml + `<span class="blog-post-stats-count">(${ratingData.count})</span>`;

        // Assemble stats container
        statsContainer.appendChild(viewsSection);
        statsContainer.appendChild(ratingsSection);

        // Apply minimal changes to card itself
        // Use relative positioning if not already set
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        // Add padding only if needed
        if (parseInt(getComputedStyle(card).paddingBottom) < 40) {
            card.style.paddingBottom = '40px';
        }

        // Append to the card
        card.appendChild(statsContainer);

        console.log(`Post Stats: Added stats to card ${postId}`);
    });
}

/**
 * Set up stats display and interaction in post modals
 */
function setupModalStats() {
    // Override the openBlogPostModal function if it exists
    if (typeof window.openBlogPostModal === 'function' && !window.postStatsModalOverride) {
        const originalOpenModal = window.openBlogPostModal;

        window.openBlogPostModal = function(postId) {
            // Call the original function
            originalOpenModal(postId);

            // Add stats to the modal
            setTimeout(function() {
                addStatsToModal(postId);

                // Track view
                incrementViewCount(postId);
            }, 100);
        };

        window.postStatsModalOverride = true;
        console.log('Post Stats: Successfully overrode openBlogPostModal function');
    }
}

/**
 * Add stats display to modal
 */
function addStatsToModal(postId) {
    if (!postId) return;

    // Get data for this post
    const viewCounts = loadFromStorage('fooodis-blog-post-views', {});

    const viewCount = viewCounts[postId] || 0;

    // Find or create stats container in modal
    let statsContainer = document.querySelector('.modal-post-stats');
    if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'modal-post-stats';

        // Find a good place to insert it
        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle && modalTitle.parentNode) {
            modalTitle.parentNode.insertBefore(statsContainer, modalTitle.nextSibling);
        }
    }

    // Create HTML for stats - only showing views, not ratings (to avoid duplication)
    let statsHtml = `
        <div class="modal-views">
            <i class="material-icons" style="color: #e8f24c; font-weight: bold; vertical-align: middle;">visibility</i>
            <span style="color: #e8f24c; font-weight: bold;">${viewCount}</span> views
        </div>
    `;

    // Update the container
    statsContainer.innerHTML = statsHtml;
}

/**
 * Increment view count for a post
 */
function incrementViewCount(postId) {
    if (!postId) return;

    // Get current view counts
    const viewCounts = loadFromStorage('fooodis-blog-post-views', {});

    // Increment the count
    viewCounts[postId] = (viewCounts[postId] || 0) + 1;

    // Save back to localStorage
    saveToStorage('fooodis-blog-post-views', viewCounts);

    // Update stats display
    updateStats();

    console.log(`Post Stats: Incremented view count for post ${postId} to ${viewCounts[postId]}`);
}

/**
 * Submit a rating for a post
 */
function submitRating(postId, rating) {
    if (!postId || rating < 1 || rating > 5) return;

    // Get current ratings
    const ratings = loadFromStorage('fooodis-blog-post-ratings', {});

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
    saveToStorage('fooodis-blog-post-ratings', ratings);

    console.log(`Post Stats: Submitted rating ${rating} for post ${postId}, new average: ${postRating.average}`);

    // Update the UI
    updateModalRatingUI(postId, rating);
    updateStats();
}

/**
 * Update modal rating UI after submitting a rating
 */
function updateModalRatingUI(postId, rating) {
    // Update the star display in the modal
    const stars = document.querySelectorAll('.modal-rating-star');
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.style.color = '#e8f24c';
        } else {
            star.style.color = 'rgba(232,242,76,0.3)';
        }
    });
    // Show thank you message
    const message = document.querySelector('.modal-rating-message');
    if (message) {
        message.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }
}

/**
 * Update all stats displays
 */
function updateStats() {
    // Short timeout to allow for DOM updates
    setTimeout(function() {
        // Full refresh of stats display
        addStatsToCards();

        // Update modal stats if a modal is open
        const modal = document.querySelector('.modal');
        if (modal && window.getComputedStyle(modal).display !== 'none') {
            const postId = modal.getAttribute('data-post-id');
            if (postId) {
                addStatsToModal(postId);
            }
        }
    }, 100);
}

/**
 * Helper: Highlight stars on hover
 */
function highlightStars(stars, rating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        star.style.color = starRating <= rating ? '#e8f24c' : 'rgba(232,242,76,0.3)';
        star.style.transform = starRating <= rating ? 'scale(1.2)' : 'scale(1)';
    });
}

/**
 * Helper: Reset star highlight after hover
 */
function resetStarHighlight(stars, userRating) {
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        star.style.color = starRating <= userRating ? '#e8f24c' : 'rgba(232,242,76,0.3)';
        star.style.transform = 'scale(1)';
    });
}

/**
 * Helper: Load data from localStorage
 */
function loadFromStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Post Stats: Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
}

/**
 * Helper: Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Post Stats: Error saving ${key} to localStorage`, error);
    }
}

// Prevent multiple initializations
let postStatsInitialized = false;
let initializationInProgress = false;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (postStatsInitialized || initializationInProgress) {
        console.log('Post Stats: Already initialized or in progress, skipping...');
        return;
    }

    console.log('Post Stats: Initializing...');
    initializationInProgress = true;
    initPostStats();
});

// Throttled re-initialization for dynamic loading
let reinitTimeout;
window.addEventListener('postsLoaded', function() {
    clearTimeout(reinitTimeout);
    reinitTimeout = setTimeout(() => {
        if (!initializationInProgress) {
            console.log('Post Stats: Posts loaded, re-initializing...');
            initializationInProgress = true;
            initPostStats();
        }
    }, 500);
});

function initializePostStats() {
    try {
        addStatsToCards();
        postStatsInitialized = true;
        console.log('Post Stats: Initialization complete');
    } catch (error) {
        console.error('Post Stats: Error during initialization:', error);
    } finally {
        initializationInProgress = false;
    }
}