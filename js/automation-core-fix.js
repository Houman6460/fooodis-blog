/**
 * Automation Core Fix
 * This script directly fixes critical issues in the automation system
 */

// Wait for page to be fully loaded
window.addEventListener('load', function() {
    console.log('Automation Core Fix: Applying fixes...');
    
    // Fix time display
    fixTimeDisplay();
    
    // Fix card persistence
    fixCardPersistence();
    
    // Fix post publishing
    fixPostPublishing();
    
    console.log('Automation Core Fix: All fixes applied');
});

/**
 * Fix time display issue
 */
function fixTimeDisplay() {
    console.log('Automation Core Fix: Fixing time display...');
    
    // Replace the calculateNextRun function
    window.calculateNextRun = function(path) {
        if (!path || !path.active) return null;
        if (!path.schedule || !path.schedule.time) return null;
        
        // Get the current date
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format the date part
        let dateStr = 'Today';
        
        // If the time has already passed today, use tomorrow
        if (path.schedule && path.schedule.time) {
            const [hours, minutes] = path.schedule.time.split(':').map(Number);
            const scheduleTime = new Date(now);
            scheduleTime.setHours(hours, minutes, 0, 0);
            
            if (scheduleTime < now) {
                dateStr = 'Tomorrow';
            }
        }
        
        // Use the exact time string from the schedule
        return `${dateStr}, ${path.schedule.time}`;
    };
    
    // Fix time display on existing cards
    setTimeout(function() {
        const pathCards = document.querySelectorAll('.automation-path');
        pathCards.forEach(card => {
            const nextRunElement = card.querySelector('.next-run');
            if (nextRunElement) {
                const index = card.dataset.index;
                if (index !== undefined && window.automationPaths && window.automationPaths[index]) {
                    const path = window.automationPaths[index];
                    if (path.schedule && path.schedule.time) {
                        const nextRun = window.calculateNextRun(path);
                        if (nextRun) {
                            nextRunElement.textContent = `Next run: ${nextRun}`;
                        }
                    }
                }
            }
        });
    }, 500);
    
    console.log('Automation Core Fix: Time display fixed');
}

/**
 * Fix card persistence issue
 */
function fixCardPersistence() {
    console.log('Automation Core Fix: Fixing card persistence...');
    
    // Add storage for in-progress paths
    if (!localStorage.getItem('aiAutomationInProgress')) {
        localStorage.setItem('aiAutomationInProgress', JSON.stringify([]));
    }
    
    // Override createExecutionStatusCard function
    const originalCreateCard = window.createExecutionStatusCard;
    window.createExecutionStatusCard = function(path) {
        console.log('Automation Core Fix: Creating execution status card for path:', path?.name);
        
        // Make sure path has an ID
        if (!path || !path.id) {
            console.error('Cannot create execution status card: Invalid path or missing ID');
            return;
        }
        
        // Check if a card already exists for this path
        const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (existingCard) {
            console.log(`Status card already exists for path ${path.name} (${path.id})`);
            return; // Don't create duplicate cards
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Creating execution status cards container');
            const automationSection = document.querySelector('#ai-automation-section');
            if (automationSection) {
                container = document.createElement('div');
                container.className = 'execution-status-cards-container';
                // Insert at the beginning of the automation section content
                const sectionContent = automationSection.querySelector('.ai-automation-container');
                if (sectionContent) {
                    sectionContent.insertBefore(container, sectionContent.firstChild);
                } else {
                    const header = automationSection.querySelector('.section-header');
                    if (header) {
                        automationSection.insertBefore(container, header.nextSibling);
                    } else {
                        automationSection.appendChild(container);
                    }
                }
            } else {
                console.error('Could not find AI Automation section');
                return;
            }
        }
        
        // Create the status card
        const statusCard = document.createElement('div');
        statusCard.className = 'execution-status-card';
        statusCard.dataset.pathId = path.id;
        
        statusCard.innerHTML = `
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
        container.appendChild(statusCard);
        
        // Animate the progress bar
        const progressFill = statusCard.querySelector('.progress-fill');
        if (progressFill) {
            let width = 0;
            const interval = setInterval(() => {
                width = (width + 1) % 100;
                progressFill.style.width = width + '%';
            }, 100);
            statusCard.dataset.intervalId = interval;
        }
        
        // Mark the path as in progress
        let inProgress = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgress = JSON.parse(savedInProgress);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            console.log(`Added path ${path.id} to in-progress list`);
        }
    };
    
    // Override removeExecutionStatusCard function
    const originalRemoveCard = window.removeExecutionStatusCard;
    window.removeExecutionStatusCard = function(path) {
        console.log('Automation Core Fix: Removing execution status card for path:', path?.name);
        
        if (!path || !path.id) {
            console.error('Cannot remove execution status card: Invalid path or missing ID');
            return;
        }
        
        // Find the card
        const card = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (card) {
            // Clear any intervals
            if (card.dataset.intervalId) {
                clearInterval(parseInt(card.dataset.intervalId));
            }
            
            // Remove the card
            card.remove();
        }
        
        // Remove the path from in-progress list
        let inProgress = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgress = JSON.parse(savedInProgress);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        const index = inProgress.indexOf(path.id);
        if (index !== -1) {
            inProgress.splice(index, 1);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            console.log(`Removed path ${path.id} from in-progress list`);
        }
    };
    
    // Add function to restore execution status cards
    window.restoreExecutionStatusCards = function() {
        console.log('Automation Core Fix: Restoring execution status cards...');
        
        // Get the in-progress paths
        let inProgress = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgress = JSON.parse(savedInProgress);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        if (inProgress.length === 0) {
            console.log('No in-progress paths found');
            return;
        }
        
        console.log(`Found ${inProgress.length} in-progress paths:`, inProgress);
        
        // Get the automation paths
        const automationPaths = window.automationPaths || [];
        
        // Create status cards for in-progress paths
        inProgress.forEach(pathId => {
            const path = automationPaths.find(p => p.id === pathId);
            if (path) {
                console.log(`Restoring status card for path: ${path.name}`);
                window.createExecutionStatusCard(path);
            } else {
                console.warn(`Path not found for ID: ${pathId}`);
                
                // Remove from in-progress list
                const index = inProgress.indexOf(pathId);
                if (index !== -1) {
                    inProgress.splice(index, 1);
                    localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
                }
            }
        });
    };
    
    // Call restoreExecutionStatusCards after a short delay
    setTimeout(window.restoreExecutionStatusCards, 1000);
    
    console.log('Automation Core Fix: Card persistence fixed');
}

/**
 * Fix post publishing issue
 */
function fixPostPublishing() {
    console.log('Automation Core Fix: Fixing post publishing...');
    
    // Override publishAutomatedPost function
    window.publishAutomatedPost = function(post) {
        console.log('Automation Core Fix: Publishing post:', post?.title);
        
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
                console.log('Generated new ID for post:', post.id);
            }
            
            // Get existing posts from localStorage
            let blogPosts = [];
            try {
                const savedPosts = localStorage.getItem('fooodis-blog-posts');
                if (savedPosts) {
                    blogPosts = JSON.parse(savedPosts);
                    console.log('Successfully loaded existing posts, count:', blogPosts.length);
                }
            } catch (error) {
                console.error('Error parsing saved posts:', error);
                blogPosts = [];
            }
            
            // Ensure blogPosts is an array
            if (!Array.isArray(blogPosts)) {
                console.warn('blogPosts is not an array, initializing as empty array');
                blogPosts = [];
            }
            
            // Prepare the post for publishing
            post.date = new Date().toISOString();
            post.language = post.language || 'english';
            post.status = 'published';
            post.category = post.category || 'Uncategorized';
            post.tags = post.tags || [];
            
            // Check if post already exists (by ID)
            const existingIndex = blogPosts.findIndex(p => p.id === post.id);
            if (existingIndex !== -1) {
                // Update existing post
                console.log('Updating existing post with ID:', post.id);
                blogPosts[existingIndex] = post;
            } else {
                // Add new post to the beginning of the array for newest first
                console.log('Adding new post with ID:', post.id);
                blogPosts.unshift(post);
            }
            
            // Handle translations if present
            if (post.translations && post.translations.swedish) {
                const swedishPostId = post.id + '-sv';
                const swedishPost = {
                    ...post,
                    id: swedishPostId,
                    title: post.translations.swedish.title,
                    content: post.translations.swedish.content,
                    language: 'swedish',
                    translationOf: post.id,
                    date: new Date().toISOString(),
                    status: 'published'
                };
                
                // Remove the translations field from the Swedish post
                delete swedishPost.translations;
                
                // Check if Swedish post already exists
                const existingSwedishIndex = blogPosts.findIndex(p => p.id === swedishPostId);
                if (existingSwedishIndex !== -1) {
                    // Update existing Swedish post
                    console.log('Updating existing Swedish post with ID:', swedishPostId);
                    blogPosts[existingSwedishIndex] = swedishPost;
                } else {
                    // Add the Swedish post to the beginning of the array
                    console.log('Adding new Swedish post with ID:', swedishPostId);
                    blogPosts.unshift(swedishPost);
                }
                
                // Add reference to Swedish translation in the English post
                post.hasTranslation = {
                    swedish: swedishPostId
                };
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
                console.log('Saved posts to localStorage, count:', blogPosts.length);
            } catch (saveError) {
                console.error('Error saving posts to localStorage:', saveError);
                
                // Try to save with fewer posts if localStorage is full
                if (blogPosts.length > 20) {
                    try {
                        const trimmedPosts = blogPosts.slice(0, 20);
                        localStorage.setItem('fooodis-blog-posts', JSON.stringify(trimmedPosts));
                        console.log('Saved trimmed posts to localStorage, count:', trimmedPosts.length);
                    } catch (trimError) {
                        console.error('Error saving trimmed posts:', trimError);
                        throw new Error('Could not save post to localStorage');
                    }
                } else {
                    throw new Error('Could not save post to localStorage');
                }
            }
            
            // Show notification
            if (typeof window.showPublishNotification === 'function') {
                window.showPublishNotification(post);
            }
            
            // Return success
            return {
                success: true,
                post: post,
                url: 'blog.html?post=' + post.id
            };
        } catch (error) {
            console.error('Error publishing post:', error);
            
            // Show error notification
            if (typeof window.showPublishNotification === 'function') {
                window.showPublishNotification(null, error);
            }
            
            // Return error object
            return {
                success: false,
                error: error.message || 'Unknown error publishing post'
            };
        }
    };
    
    console.log('Automation Core Fix: Post publishing fixed');
}

// Export functions
window.automationCoreFix = {
    fixTimeDisplay,
    fixCardPersistence,
    fixPostPublishing
};

console.log('Automation Core Fix: Script loaded');
