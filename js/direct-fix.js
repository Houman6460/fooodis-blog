/**
 * Direct Fix for Automation Issues
 * This script fixes three critical issues:
 * 1. Time display on automation cards
 * 2. Card persistence on page refresh
 * 3. Post publishing to blog
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct Fix: Applying fixes...');
    
    // Apply fixes with a slight delay to ensure they override any other scripts
    setTimeout(applyFixes, 500);
});

/**
 * Apply all fixes
 */
function applyFixes() {
    // Fix time display
    fixTimeDisplay();
    
    // Fix card persistence
    fixCardPersistence();
    
    // Fix post publishing
    fixPostPublishing();
    
    console.log('Direct Fix: All fixes applied');
}

/**
 * Fix time display on automation cards
 */
function fixTimeDisplay() {
    console.log('Direct Fix: Fixing time display...');
    
    // Override the calculateNextRun function
    window.calculateNextRun = function(path) {
        if (!path || !path.active) return null;
        if (!path.schedule || !path.schedule.time) return null;
        
        // Get current date and time
        const now = new Date();
        
        // Format the date part
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Create a date for the scheduled time
        let scheduleDate = new Date();
        const [hours, minutes] = path.schedule.time.split(':').map(Number);
        scheduleDate.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, use tomorrow
        if (scheduleDate < now) {
            scheduleDate.setDate(scheduleDate.getDate() + 1);
        }
        
        // Determine the date string
        let dateStr;
        if (scheduleDate.toDateString() === today.toDateString()) {
            dateStr = 'Today';
        } else if (scheduleDate.toDateString() === tomorrow.toDateString()) {
            dateStr = 'Tomorrow';
        } else {
            dateStr = scheduleDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        
        // Return the formatted date with the EXACT original time string
        return `${dateStr}, ${path.schedule.time}`;
    };
    
    // Fix time display on existing cards
    const pathCards = document.querySelectorAll('.automation-path');
    pathCards.forEach(card => {
        const nextRunElement = card.querySelector('.next-run');
        if (nextRunElement) {
            const text = nextRunElement.textContent;
            if (text && text.includes('Next run:')) {
                // Get the path index
                const index = card.dataset.index;
                if (index !== undefined && automationPaths[index]) {
                    const path = automationPaths[index];
                    if (path.schedule && path.schedule.time) {
                        // Calculate the next run time
                        const nextRun = calculateNextRun(path);
                        if (nextRun) {
                            nextRunElement.textContent = `Next run: ${nextRun}`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('Direct Fix: Time display fixed');
}

/**
 * Fix card persistence on page refresh
 */
function fixCardPersistence() {
    console.log('Direct Fix: Fixing card persistence...');
    
    // Add functions to track in-progress paths
    window.markPathInProgress = function(path) {
        if (!path || !path.id) return;
        
        // Get current in-progress paths
        let inProgress = [];
        try {
            const saved = localStorage.getItem('aiAutomationInProgress');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        // Add path ID if not already in list
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            console.log(`Path ${path.id} marked as in progress`);
        }
    };
    
    window.markPathCompleted = function(path) {
        if (!path || !path.id) return;
        
        // Get current in-progress paths
        let inProgress = [];
        try {
            const saved = localStorage.getItem('aiAutomationInProgress');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        // Remove path ID from list
        const index = inProgress.indexOf(path.id);
        if (index !== -1) {
            inProgress.splice(index, 1);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            console.log(`Path ${path.id} marked as completed`);
        }
    };
    
    // Override createExecutionStatusCard function
    const originalCreateCard = window.createExecutionStatusCard;
    window.createExecutionStatusCard = function(path) {
        // Call original function
        if (typeof originalCreateCard === 'function') {
            originalCreateCard(path);
        }
        
        // Mark path as in progress
        markPathInProgress(path);
    };
    
    // Override removeExecutionStatusCard function
    const originalRemoveCard = window.removeExecutionStatusCard;
    window.removeExecutionStatusCard = function(path) {
        // Call original function
        if (typeof originalRemoveCard === 'function') {
            originalRemoveCard(path);
        }
        
        // Mark path as completed
        markPathCompleted(path);
    };
    
    // Create function to restore cards on page load
    window.restoreExecutionStatusCards = function() {
        console.log('Direct Fix: Restoring execution status cards...');
        
        // Get in-progress paths
        let inProgress = [];
        try {
            const saved = localStorage.getItem('aiAutomationInProgress');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error getting in-progress paths:', error);
        }
        
        if (inProgress.length === 0) {
            console.log('No in-progress paths found');
            return;
        }
        
        console.log(`Found ${inProgress.length} in-progress paths:`, inProgress);
        
        // Get automation paths
        let paths = window.automationPaths || [];
        
        // Create status cards for in-progress paths
        inProgress.forEach(pathId => {
            const path = paths.find(p => p.id === pathId);
            if (path) {
                console.log(`Restoring status card for path: ${path.name}`);
                
                // Check if card already exists
                const existingCard = document.querySelector(`.execution-status-card[data-path-id="${pathId}"]`);
                if (!existingCard) {
                    // Create container if needed
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
                    statusCard.dataset.pathId = pathId;
                    
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
                    
                    // Add to container
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
                }
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
    
    // Call restoreExecutionStatusCards immediately
    setTimeout(restoreExecutionStatusCards, 1000);
    
    console.log('Direct Fix: Card persistence fixed');
}

/**
 * Fix post publishing
 */
function fixPostPublishing() {
    console.log('Direct Fix: Fixing post publishing...');
    
    // Override publishAutomatedPost function
    window.publishAutomatedPost = function(post) {
        console.log('Direct Fix: Publishing post:', post.title);
        
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
                
                // Verify the save
                const savedData = localStorage.getItem('fooodis-blog-posts');
                if (!savedData) {
                    throw new Error('Failed to verify saved data');
                }
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
            
            // Return success
            return {
                success: true,
                post: post,
                url: 'blog.html?post=' + post.id
            };
        } catch (error) {
            console.error('Error publishing post:', error);
            
            return {
                success: false,
                error: error.message || 'Unknown error publishing post'
            };
        }
    };
    
    console.log('Direct Fix: Post publishing fixed');
}

// Export functions
window.directFix = {
    applyFixes,
    fixTimeDisplay,
    fixCardPersistence,
    fixPostPublishing,
    restoreExecutionStatusCards
};

console.log('Direct Fix: Script loaded');
