/**
 * Simple Fix for Automation Issues
 * This script fixes three critical issues in the automation system:
 * 1. Time display
 * 2. Card persistence
 * 3. Post publishing
 */

// Wait for page to be fully loaded
window.addEventListener('load', function() {
    console.log('Simple Fix: Applying fixes...');
    
    // Apply fixes immediately
    applySimpleFixes();
    
    // Also apply after a short delay to ensure they override any other scripts
    setTimeout(applySimpleFixes, 1000);
});

/**
 * Apply all simple fixes
 */
function applySimpleFixes() {
    // Fix 1: Time display
    fixTimeDisplay();
    
    // Fix 2: Card persistence
    fixCardPersistence();
    
    // Fix 3: Post publishing
    fixPostPublishing();
    
    console.log('Simple Fix: All fixes applied');
}

/**
 * Fix 1: Time display issue
 */
function fixTimeDisplay() {
    // Override the calculateNextRun function with a simple implementation
    window.calculateNextRun = function(path) {
        if (!path || !path.active || !path.schedule || !path.schedule.time) {
            return null;
        }
        
        // Just use Today or Tomorrow with the exact time string
        const now = new Date();
        const [hours, minutes] = path.schedule.time.split(':').map(Number);
        
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
        
        // Use Tomorrow if the time has already passed today
        const dateStr = (scheduleTime > now) ? 'Today' : 'Tomorrow';
        
        // Return with the EXACT original time string
        return `${dateStr}, ${path.schedule.time}`;
    };
    
    console.log('Simple Fix: Time display fixed');
}

/**
 * Fix 2: Card persistence issue
 */
function fixCardPersistence() {
    // Initialize storage for in-progress paths if it doesn't exist
    if (!localStorage.getItem('inProgressPaths')) {
        localStorage.setItem('inProgressPaths', JSON.stringify([]));
    }
    
    // Override the createExecutionStatusCard function
    const originalCreateCard = window.createExecutionStatusCard;
    window.createExecutionStatusCard = function(path) {
        if (!path || !path.id) return;
        
        console.log('Simple Fix: Creating card for path:', path.name);
        
        // Call the original function if it exists
        if (typeof originalCreateCard === 'function') {
            originalCreateCard(path);
        } else {
            // Fallback implementation
            createCardFallback(path);
        }
        
        // Track the path in localStorage
        let inProgress = [];
        try {
            const saved = localStorage.getItem('inProgressPaths');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing in-progress paths:', e);
        }
        
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('inProgressPaths', JSON.stringify(inProgress));
        }
    };
    
    // Override the removeExecutionStatusCard function
    const originalRemoveCard = window.removeExecutionStatusCard;
    window.removeExecutionStatusCard = function(path) {
        if (!path || !path.id) return;
        
        console.log('Simple Fix: Removing card for path:', path.name);
        
        // Call the original function if it exists
        if (typeof originalRemoveCard === 'function') {
            originalRemoveCard(path);
        } else {
            // Fallback implementation
            const card = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
            if (card) card.remove();
        }
        
        // Remove the path from localStorage
        let inProgress = [];
        try {
            const saved = localStorage.getItem('inProgressPaths');
            if (saved) {
                inProgress = JSON.parse(saved);
                const index = inProgress.indexOf(path.id);
                if (index !== -1) {
                    inProgress.splice(index, 1);
                    localStorage.setItem('inProgressPaths', JSON.stringify(inProgress));
                }
            }
        } catch (e) {
            console.error('Error updating in-progress paths:', e);
        }
    };
    
    // Restore cards on page load
    restoreCards();
    
    console.log('Simple Fix: Card persistence fixed');
}

/**
 * Fallback implementation for creating a card
 */
function createCardFallback(path) {
    // Check if a card already exists
    const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
    if (existingCard) return;
    
    // Find or create the container
    let container = document.querySelector('.execution-status-cards-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'execution-status-cards-container';
        
        // Find the automation section
        const section = document.querySelector('#ai-automation-section');
        if (section) {
            // Try to insert after the header
            const header = section.querySelector('.section-header');
            if (header) {
                section.insertBefore(container, header.nextSibling);
            } else {
                section.appendChild(container);
            }
        } else {
            // Fallback to adding to the body
            document.body.appendChild(container);
        }
    }
    
    // Create the card
    const card = document.createElement('div');
    card.className = 'execution-status-card';
    card.dataset.pathId = path.id;
    
    card.innerHTML = `
        <div class="status-card-header">
            <i class="fas fa-sync-alt fa-spin"></i>
            <h3>Generating Content</h3>
        </div>
        <div class="status-card-content">
            <p>Generating post for "${path.name}"</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;
    
    // Add the card to the container
    container.appendChild(card);
    
    // Animate the progress bar
    const progressFill = card.querySelector('.progress-fill');
    if (progressFill) {
        let width = 0;
        const interval = setInterval(() => {
            width = (width + 1) % 100;
            progressFill.style.width = width + '%';
        }, 100);
        card.dataset.intervalId = interval;
    }
}

/**
 * Restore cards for in-progress paths
 */
function restoreCards() {
    console.log('Simple Fix: Restoring cards...');
    
    // Get in-progress paths
    let inProgress = [];
    try {
        const saved = localStorage.getItem('inProgressPaths');
        if (saved) {
            inProgress = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error parsing in-progress paths:', e);
    }
    
    if (inProgress.length === 0) {
        console.log('No in-progress paths found');
        return;
    }
    
    console.log(`Found ${inProgress.length} in-progress paths:`, inProgress);
    
    // Get automation paths
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (e) {
        console.error('Error parsing automation paths:', e);
    }
    
    // Create cards for in-progress paths
    inProgress.forEach(pathId => {
        const path = paths.find(p => p.id === pathId);
        if (path) {
            console.log(`Restoring card for path: ${path.name}`);
            createCardFallback(path);
        } else {
            console.warn(`Path not found for ID: ${pathId}`);
            // Remove from in-progress list
            const index = inProgress.indexOf(pathId);
            if (index !== -1) {
                inProgress.splice(index, 1);
                localStorage.setItem('inProgressPaths', JSON.stringify(inProgress));
            }
        }
    });
}

/**
 * Fix 3: Post publishing issue
 */
function fixPostPublishing() {
    // Override the publishAutomatedPost function
    window.publishAutomatedPost = function(post) {
        console.log('Simple Fix: Publishing post:', post?.title);
        
        try {
            // Validate post
            if (!post) {
                throw new Error('Post is null or undefined');
            }
            
            if (!post.title) {
                throw new Error('Post has no title');
            }
            
            if (!post.content) {
                throw new Error('Post has no content');
            }
            
            // Ensure post has an ID
            if (!post.id) {
                post.id = Date.now().toString();
            }
            
            // Get existing posts
            let blogPosts = [];
            try {
                const saved = localStorage.getItem('fooodis-blog-posts');
                if (saved) {
                    blogPosts = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error parsing blog posts:', e);
            }
            
            // Ensure it's an array
            if (!Array.isArray(blogPosts)) {
                blogPosts = [];
            }
            
            // Prepare the post
            post.date = new Date().toISOString();
            post.language = post.language || 'english';
            post.status = 'published';
            post.category = post.category || 'Uncategorized';
            
            // Add to the beginning of the array
            blogPosts.unshift(post);
            
            // Save to localStorage
            try {
                localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
                console.log('Post saved successfully');
            } catch (e) {
                console.error('Error saving post:', e);
                
                // Try with fewer posts if localStorage is full
                if (blogPosts.length > 10) {
                    const trimmed = blogPosts.slice(0, 10);
                    localStorage.setItem('fooodis-blog-posts', JSON.stringify(trimmed));
                }
            }
            
            // Return success
            return {
                success: true,
                post: post,
                url: 'blog.html?post=' + post.id
            };
        } catch (error) {
            console.error('Error publishing post:', error);
            
            // Return error
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    console.log('Simple Fix: Post publishing fixed');
}

// Export functions
window.simpleFix = {
    applySimpleFixes,
    fixTimeDisplay,
    fixCardPersistence,
    fixPostPublishing,
    restoreCards
};

console.log('Simple Fix: Script loaded');
