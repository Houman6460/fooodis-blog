/**
 * Automation Critical Fix
 * This file contains critical fixes for the automation system
 * It addresses three main issues:
 * 1. Time display issue - ensuring the correct time is shown
 * 2. Card persistence - ensuring cards persist on page refresh
 * 3. Publishing issue - ensuring posts are properly published
 */

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Critical Fix: Initializing...');
    
    // Apply the fixes after a short delay to ensure all other scripts have loaded
    setTimeout(applyAutomationFixes, 500);
});

/**
 * Apply all automation fixes
 */
function applyAutomationFixes() {
    console.log('Automation Critical Fix: Applying fixes...');
    
    // Fix 1: Override the calculateNextRun function to display the correct time
    fixTimeDisplay();
    
    // Fix 2: Ensure execution status cards persist on page refresh
    fixCardPersistence();
    
    // Fix 3: Fix the publishing functionality
    fixPublishing();
    
    console.log('Automation Critical Fix: All fixes applied');
}

/**
 * Fix the time display issue
 */
function fixTimeDisplay() {
    console.log('Automation Critical Fix: Fixing time display...');
    
    // Override the calculateNextRun function
    if (typeof window.calculateNextRun === 'function') {
        // Save the original function
        const originalCalculateNextRun = window.calculateNextRun;
        
        // Override with our fixed version
        window.calculateNextRun = function(path) {
            console.log('Automation Critical Fix: Using fixed calculateNextRun function');
            
            if (!path || !path.active || !path.schedule || !path.schedule.time) {
                return null;
            }
            
            // Get the current date
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Create a date for the next run time to determine if it's today or tomorrow
            const nextRunDate = new Date(now);
            const [hours, minutes] = path.schedule.time.split(':').map(Number);
            nextRunDate.setHours(hours, minutes, 0, 0);
            
            // If the time is already past for today, move to tomorrow
            if (nextRunDate < now) {
                nextRunDate.setDate(nextRunDate.getDate() + 1);
            }
            
            // Format the date part
            let dateStr;
            if (nextRunDate.toDateString() === today.toDateString()) {
                dateStr = 'Today';
            } else if (nextRunDate.toDateString() === tomorrow.toDateString()) {
                dateStr = 'Tomorrow';
            } else {
                dateStr = nextRunDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
            
            // Use the EXACT time string from the schedule
            return `${dateStr}, ${path.schedule.time}`;
        };
        
        console.log('Automation Critical Fix: Time display fix applied');
    } else {
        console.error('Automation Critical Fix: Could not find calculateNextRun function');
    }
}

/**
 * Fix the card persistence issue
 */
function fixCardPersistence() {
    console.log('Automation Critical Fix: Fixing card persistence...');
    
    // Create a function to restore execution status cards
    window.restoreExecutionStatusCardsFixed = function() {
        console.log('Automation Critical Fix: Restoring execution status cards...');
        
        // Get in-progress paths
        let inProgressIds = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgressIds = JSON.parse(savedInProgress);
                console.log('Automation Critical Fix: Found in-progress paths:', inProgressIds);
            }
        } catch (error) {
            console.error('Automation Critical Fix: Error getting in-progress paths:', error);
        }
        
        if (inProgressIds.length === 0) {
            console.log('Automation Critical Fix: No in-progress paths found');
            return;
        }
        
        // Get automation paths
        let automationPaths = [];
        try {
            const savedPaths = localStorage.getItem('aiAutomationPaths');
            if (savedPaths) {
                automationPaths = JSON.parse(savedPaths);
                console.log('Automation Critical Fix: Found automation paths:', automationPaths.length);
            }
        } catch (error) {
            console.error('Automation Critical Fix: Error getting automation paths:', error);
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Automation Critical Fix: Creating execution status cards container');
            
            // Find the automation section
            const automationSection = document.querySelector('#ai-automation-section');
            if (!automationSection) {
                console.error('Automation Critical Fix: Could not find automation section');
                return;
            }
            
            // Create the container
            container = document.createElement('div');
            container.className = 'execution-status-cards-container';
            
            // Add it to the automation section
            const automationContainer = automationSection.querySelector('.ai-automation-container');
            if (automationContainer) {
                automationContainer.insertBefore(container, automationContainer.firstChild);
            } else {
                // Fallback to adding after the header
                const header = automationSection.querySelector('.section-header');
                if (header) {
                    automationSection.insertBefore(container, header.nextSibling);
                } else {
                    automationSection.appendChild(container);
                }
            }
        }
        
        // Create status cards for in-progress paths
        inProgressIds.forEach(pathId => {
            // Find the path
            const path = automationPaths.find(p => p.id === pathId);
            if (!path) {
                console.warn(`Automation Critical Fix: Path with ID ${pathId} not found`);
                return;
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
            
            // Add to container
            container.appendChild(statusCard);
            console.log(`Automation Critical Fix: Created status card for path ${path.name}`);
            
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
        });
        
        console.log('Automation Critical Fix: Card persistence fix applied');
    };
    
    // Call the function to restore cards
    window.restoreExecutionStatusCardsFixed();
}

/**
 * Fix the publishing functionality
 */
function fixPublishing() {
    console.log('Automation Critical Fix: Fixing publishing functionality...');
    
    // Override the publishAutomatedPost function
    if (typeof window.publishAutomatedPost === 'function') {
        // Save the original function
        const originalPublishAutomatedPost = window.publishAutomatedPost;
        
        // Override with our fixed version
        window.publishAutomatedPost = function(post) {
            console.log('Automation Critical Fix: Using fixed publishAutomatedPost function');
            
            try {
                // Ensure post has required fields
                if (!post) {
                    throw new Error('Post is null or undefined');
                }
                
                if (!post.id) {
                    post.id = Date.now().toString();
                    console.log('Automation Critical Fix: Generated new ID for post:', post.id);
                }
                
                if (!post.title) {
                    throw new Error('Post has no title');
                }
                
                if (!post.content) {
                    throw new Error('Post has no content');
                }
                
                // Get existing posts
                let blogPosts = [];
                try {
                    const savedPosts = localStorage.getItem('fooodis-blog-posts');
                    if (savedPosts) {
                        blogPosts = JSON.parse(savedPosts);
                        console.log('Automation Critical Fix: Loaded existing posts, count:', blogPosts.length);
                    }
                } catch (error) {
                    console.error('Automation Critical Fix: Error loading existing posts:', error);
                }
                
                // Ensure blogPosts is an array
                if (!Array.isArray(blogPosts)) {
                    console.warn('Automation Critical Fix: blogPosts is not an array, initializing as empty array');
                    blogPosts = [];
                }
                
                // Prepare the post
                post.date = new Date().toISOString();
                post.language = post.language || 'english';
                post.status = 'published';
                post.category = post.category || 'Uncategorized';
                
                // Check if post already exists
                const existingIndex = blogPosts.findIndex(p => p.id === post.id);
                if (existingIndex !== -1) {
                    // Update existing post
                    console.log('Automation Critical Fix: Updating existing post with ID:', post.id);
                    blogPosts[existingIndex] = post;
                } else {
                    // Add new post
                    console.log('Automation Critical Fix: Adding new post with ID:', post.id);
                    blogPosts.unshift(post);
                }
                
                // Handle Swedish translation if present
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
                    
                    // Remove translations field
                    delete swedishPost.translations;
                    
                    // Check if Swedish post already exists
                    const existingSwedishIndex = blogPosts.findIndex(p => p.id === swedishPostId);
                    if (existingSwedishIndex !== -1) {
                        // Update existing Swedish post
                        console.log('Automation Critical Fix: Updating existing Swedish post with ID:', swedishPostId);
                        blogPosts[existingSwedishIndex] = swedishPost;
                    } else {
                        // Add new Swedish post
                        console.log('Automation Critical Fix: Adding new Swedish post with ID:', swedishPostId);
                        blogPosts.unshift(swedishPost);
                    }
                    
                    // Add reference to Swedish translation
                    post.hasTranslation = {
                        swedish: swedishPostId
                    };
                }
                
                // Save to localStorage
                try {
                    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
                    console.log('Automation Critical Fix: Saved posts to localStorage, count:', blogPosts.length);
                    
                    // Verify the save
                    const savedData = localStorage.getItem('fooodis-blog-posts');
                    if (savedData) {
                        const parsedData = JSON.parse(savedData);
                        console.log('Automation Critical Fix: Verified saved data, count:', parsedData.length);
                    }
                } catch (error) {
                    console.error('Automation Critical Fix: Error saving posts to localStorage:', error);
                    
                    // Try with fewer posts
                    if (blogPosts.length > 20) {
                        const trimmedPosts = blogPosts.slice(0, 20);
                        try {
                            localStorage.setItem('fooodis-blog-posts', JSON.stringify(trimmedPosts));
                            console.log('Automation Critical Fix: Saved trimmed posts to localStorage, count:', trimmedPosts.length);
                        } catch (trimError) {
                            console.error('Automation Critical Fix: Error saving trimmed posts:', trimError);
                        }
                    }
                }
                
                // Show notification
                if (typeof window.showPublishNotification === 'function') {
                    window.showPublishNotification(post);
                }
                
                console.log('Automation Critical Fix: Post published successfully:', post.title);
                
                // Return the result
                return {
                    success: true,
                    post: post,
                    url: 'blog.html?post=' + post.id
                };
            } catch (error) {
                console.error('Automation Critical Fix: Error publishing post:', error);
                
                // Show error notification
                if (typeof window.showPublishNotification === 'function') {
                    window.showPublishNotification(null, error);
                }
                
                // Return error
                return {
                    success: false,
                    error: error.message || 'Unknown error publishing post'
                };
            }
        };
        
        console.log('Automation Critical Fix: Publishing fix applied');
    } else {
        console.error('Automation Critical Fix: Could not find publishAutomatedPost function');
    }
}

// Export functions to the global scope
window.automationCriticalFix = {
    applyAutomationFixes,
    fixTimeDisplay,
    fixCardPersistence,
    fixPublishing
};

console.log('Automation Critical Fix: Script loaded');
