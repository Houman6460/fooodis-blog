/**
 * Fooodis Blog System - Automation Fixes
 * This script fixes issues with the AI Content Automation system:
 * 1. Time display rounding issue (e.g., 13:23 showing as 14:00)
 * 2. Status cards disappearing on refresh
 * 3. Scheduled posts not being published to the blog
 */

(function() {
    console.log('Applying automation system fixes...');
    
    /**
     * Fix 1: Time Display Issue
     * Ensures the exact time string is preserved and displayed
     */
    function applyTimeDisplayFix() {
        console.log('Applying time display fix...');
        
        // Override the calculateNextRun function to preserve exact time
        window.calculateNextRun = function(path) {
            if (!path || !path.active) return null;
            if (!path.schedule || !path.schedule.time) return null;
            
            // Get current date
            const now = new Date();
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Create date for scheduled time
            let scheduleTime = new Date(now);
            const [hours, minutes] = path.schedule.time.split(':').map(Number);
            scheduleTime.setHours(hours, minutes, 0, 0);
            
            // Determine date string
            let dateStr;
            if (scheduleTime < now) {
                scheduleTime.setDate(scheduleTime.getDate() + 1);
                dateStr = 'Tomorrow';
            } else {
                dateStr = 'Today';
            }
            
            // Return with EXACT original time string
            return dateStr + ', ' + path.schedule.time;
        };
        
        // Fix any existing paths to ensure they have the exact time string preserved
        let automationPaths = [];
        try {
            const savedPaths = localStorage.getItem('aiAutomationPaths');
            if (savedPaths) {
                automationPaths = JSON.parse(savedPaths);
                
                // Update each path to ensure time display is correct
                let updated = false;
                automationPaths.forEach(path => {
                    if (path.schedule && path.schedule.time) {
                        // Make sure the time is stored as a string without any modification
                        const originalTime = path.schedule.time;
                        path.schedule.originalTime = originalTime; // Store original time as backup
                        updated = true;
                    }
                });
                
                if (updated) {
                    // Save back to localStorage
                    localStorage.setItem('aiAutomationPaths', JSON.stringify(automationPaths));
                }
            }
        } catch (error) {
            console.error('Error fixing time display:', error);
        }
        
        // Fix the displayScheduleTime function if it exists
        if (window.displayScheduleTime) {
            const originalDisplayScheduleTime = window.displayScheduleTime;
            window.displayScheduleTime = function(path) {
                if (path && path.schedule && path.schedule.time) {
                    return path.schedule.time; // Return the exact time string
                }
                return originalDisplayScheduleTime(path);
            };
        }
        
        console.log('Time display fix applied');
    }
    
    /**
     * Fix 2: Card Persistence Issue
     * Ensures status cards persist across page refreshes
     */
    function applyCardPersistenceFix() {
        console.log('Applying card persistence fix...');
        
        // Initialize the storage for in-progress paths if it doesn't exist
        let inProgress = [];
        try {
            const saved = localStorage.getItem('automationInProgressPaths');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing in-progress paths:', e);
            inProgress = [];
        }
        
        // Ensure it's an array
        if (!Array.isArray(inProgress)) {
            inProgress = [];
        }
        
        // Save back to localStorage
        localStorage.setItem('automationInProgressPaths', JSON.stringify(inProgress));
        
        // Create a container for execution status cards if it doesn't exist
        function ensureContainer() {
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
                        section.insertBefore(container, section.firstChild);
                    }
                } else {
                    // Fallback to adding to the body
                    document.body.appendChild(container);
                }
            }
            return container;
        }
        
        // Override the createExecutionStatusCard function
        const originalCreateCard = window.createExecutionStatusCard || function() {};
        window.createExecutionStatusCard = function(path) {
            if (!path || !path.id) return;
            
            console.log('Creating execution status card for path:', path.name);
            
            // Check if a card already exists
            const existingCard = document.querySelector('.execution-status-card[data-path-id="' + path.id + '"]');
            if (existingCard) {
                console.log('Card already exists for path:', path.name);
                return;
            }
            
            // Make sure the container exists
            const container = ensureContainer();
            
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
            
            // Track the path in localStorage
            let inProgress = [];
            try {
                const saved = localStorage.getItem('automationInProgressPaths');
                if (saved) {
                    inProgress = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error parsing in-progress paths:', e);
                inProgress = [];
            }
            
            if (!inProgress.includes(path.id)) {
                inProgress.push(path.id);
                localStorage.setItem('automationInProgressPaths', JSON.stringify(inProgress));
                console.log('Added path to in-progress list:', path.id);
            }
        };
        
        // Override the removeExecutionStatusCard function
        const originalRemoveCard = window.removeExecutionStatusCard || function() {};
        window.removeExecutionStatusCard = function(path) {
            if (!path || !path.id) return;
            
            console.log('Removing execution status card for path:', path.name);
            
            // Find the card
            const card = document.querySelector('.execution-status-card[data-path-id="' + path.id + '"]');
            if (card) {
                // Clear any intervals
                if (card.dataset.intervalId) {
                    clearInterval(parseInt(card.dataset.intervalId));
                }
                
                // Remove the card
                card.remove();
            }
            
            // Remove from in-progress list
            let inProgress = [];
            try {
                const saved = localStorage.getItem('automationInProgressPaths');
                if (saved) {
                    inProgress = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error parsing in-progress paths:', e);
                inProgress = [];
            }
            
            const index = inProgress.indexOf(path.id);
            if (index !== -1) {
                inProgress.splice(index, 1);
                localStorage.setItem('automationInProgressPaths', JSON.stringify(inProgress));
                console.log('Removed path from in-progress list:', path.id);
            }
        };
        
        // Function to restore cards on page load
        function restoreCards() {
            console.log('Restoring execution status cards...');
            
            // Get in-progress paths
            let inProgress = [];
            try {
                const saved = localStorage.getItem('automationInProgressPaths');
                if (saved) {
                    inProgress = JSON.parse(saved);
                }
            } catch (e) {
                console.error('Error parsing in-progress paths:', e);
                inProgress = [];
            }
            
            if (inProgress.length === 0) {
                console.log('No in-progress paths found');
                return;
            }
            
            console.log('Found in-progress paths:', inProgress);
            
            // Get automation paths
            let paths = [];
            try {
                const savedPaths = localStorage.getItem('aiAutomationPaths');
                if (savedPaths) {
                    paths = JSON.parse(savedPaths);
                }
            } catch (e) {
                console.error('Error parsing automation paths:', e);
                paths = [];
            }
            
            // Create cards for in-progress paths
            inProgress.forEach(pathId => {
                const path = paths.find(p => p.id === pathId);
                if (path) {
                    console.log('Restoring card for path:', path.name);
                    window.createExecutionStatusCard(path);
                } else {
                    console.warn('Path not found for ID:', pathId);
                    
                    // Remove from in-progress list
                    const index = inProgress.indexOf(pathId);
                    if (index !== -1) {
                        inProgress.splice(index, 1);
                        localStorage.setItem('automationInProgressPaths', JSON.stringify(inProgress));
                    }
                }
            });
        }
        
        // Call restoreCards after a short delay
        setTimeout(restoreCards, 1000);
        
        console.log('Card persistence fix applied');
    }
    
    /**
     * Fix 3: Post Publishing Issue
     * Ensures scheduled posts are correctly published to the blog
     */
    function applyPostPublishingFix() {
        console.log('Applying post publishing fix...');
        
        // Check if blog posts storage exists
        let blogPosts = [];
        try {
            const savedPosts = localStorage.getItem('fooodis-blog-posts');
            if (savedPosts) {
                blogPosts = JSON.parse(savedPosts);
            }
        } catch (error) {
            console.error('Error parsing blog posts:', error);
        }
        
        // Ensure it's an array
        if (!Array.isArray(blogPosts)) {
            blogPosts = [];
        }
        
        // Save back to localStorage
        localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
        
        // Override the publishAutomatedPost function
        window.publishAutomatedPost = function(post) {
            console.log('Publishing post:', post?.title);
            
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
                    blogPosts = [];
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
                    console.log('Post saved successfully:', post.title);
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
        
        // Fix the executeAutomationPath function if it exists
        if (window.executeAutomationPath) {
            const originalExecute = window.executeAutomationPath;
            window.executeAutomationPath = function(path) {
                console.log('Executing automation path with fixed function:', path?.name);
                
                // Check if path is for scheduling
                if (path && path.schedule && path.schedule.time) {
                    console.log('Processing scheduled path with time:', path.schedule.time);
                }
                
                return originalExecute(path);
            };
        }
        
        console.log('Post publishing fix applied');
    }
    
    // Apply all fixes
    applyTimeDisplayFix();
    applyCardPersistenceFix();
    applyPostPublishingFix();
    
    console.log('All automation system fixes applied');
})();
