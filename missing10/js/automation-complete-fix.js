/**
 * Automation Complete Fix
 * This script fixes all issues with automation paths:
 * 1. Time display issue
 * 2. Card persistence on refresh
 * 3. Post publishing to blog
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Complete Fix: Initializing...');
    
    // Apply fixes immediately and then again after a delay
    applyFixes();
    setTimeout(applyFixes, 1000);
});

/**
 * Apply all fixes
 */
function applyFixes() {
    console.log('Automation Complete Fix: Applying fixes...');
    
    // Fix the time display
    fixTimeDisplay();
    
    // Fix card persistence
    fixCardPersistence();
    
    // Fix post publishing
    fixPostPublishing();
    
    console.log('Automation Complete Fix: All fixes applied');
}

/**
 * Fix the time display issue
 */
function fixTimeDisplay() {
    console.log('Automation Complete Fix: Fixing time display...');
    
    // Override the calculateNextRun function
    window.calculateNextRun = function(path) {
        if (!path || !path.active) return null;
        
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
    const pathCards = document.querySelectorAll('.automation-path');
    pathCards.forEach(card => {
        const nextRunElement = card.querySelector('.next-run');
        if (nextRunElement) {
            const text = nextRunElement.textContent;
            if (text && text.includes('Next run:')) {
                const parts = text.split(',');
                if (parts.length >= 2) {
                    const dateStr = parts[0].replace('Next run:', '').trim();
                    const timeStr = parts[1].trim();
                    
                    // Update with exact time
                    nextRunElement.textContent = `Next run: ${dateStr}, ${timeStr}`;
                }
            }
        }
    });
    
    console.log('Automation Complete Fix: Time display fixed');
}

/**
 * Fix card persistence on refresh
 */
function fixCardPersistence() {
    console.log('Automation Complete Fix: Fixing card persistence...');
    
    // Get in-progress paths from localStorage
    let inProgressPaths = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgressPaths = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Automation Complete Fix: Error getting in-progress paths:', error);
    }
    
    if (inProgressPaths.length === 0) {
        console.log('Automation Complete Fix: No in-progress paths found');
        return;
    }
    
    console.log('Automation Complete Fix: Found in-progress paths:', inProgressPaths);
    
    // Get automation paths
    let automationPaths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            automationPaths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Automation Complete Fix: Error getting automation paths:', error);
    }
    
    // Make sure the container exists
    let container = document.querySelector('.execution-status-cards-container');
    if (!container) {
        console.log('Automation Complete Fix: Creating execution status cards container');
        
        // Find the automation section
        const automationSection = document.querySelector('#ai-automation-section');
        if (!automationSection) {
            console.error('Automation Complete Fix: Could not find automation section');
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
    inProgressPaths.forEach(pathId => {
        // Find the path
        const path = automationPaths.find(p => p.id === pathId);
        if (!path) {
            console.warn(`Automation Complete Fix: Path with ID ${pathId} not found`);
            return;
        }
        
        // Check if a card already exists
        const existingCard = document.querySelector(`.execution-status-card[data-path-id="${pathId}"]`);
        if (existingCard) {
            console.log(`Automation Complete Fix: Card already exists for path ${path.name}`);
            return;
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
        console.log(`Automation Complete Fix: Created status card for path ${path.name}`);
        
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
    
    // Override createExecutionStatusCard function
    window.createExecutionStatusCard = function(path) {
        console.log('Automation Complete Fix: Creating execution status card for path:', path.name);
        
        // Make sure path has an ID
        if (!path.id) {
            path.id = Date.now().toString();
        }
        
        // Check if a card already exists
        const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (existingCard) {
            console.log('Automation Complete Fix: Card already exists for path:', path.name);
            return;
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Automation Complete Fix: Creating execution status cards container');
            
            // Find the automation section
            const automationSection = document.querySelector('#ai-automation-section');
            if (!automationSection) {
                console.error('Automation Complete Fix: Could not find automation section');
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
        
        // Add to container
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
        
        // Save the path ID to localStorage
        let inProgress = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgress = JSON.parse(savedInProgress);
            }
        } catch (error) {
            console.error('Automation Complete Fix: Error getting in-progress paths:', error);
        }
        
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        }
        
        console.log('Automation Complete Fix: Execution status card created for path:', path.name);
    };
    
    // Override removeExecutionStatusCard function
    window.removeExecutionStatusCard = function(path) {
        console.log('Automation Complete Fix: Removing execution status card for path:', path.name);
        
        // Find the card
        const card = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (!card) {
            console.log('Automation Complete Fix: No card found for path:', path.name);
            return;
        }
        
        // Clear any intervals
        if (card.dataset.intervalId) {
            clearInterval(parseInt(card.dataset.intervalId));
        }
        
        // Remove the card
        card.remove();
        
        // Remove the path ID from localStorage
        let inProgress = [];
        try {
            const savedInProgress = localStorage.getItem('aiAutomationInProgress');
            if (savedInProgress) {
                inProgress = JSON.parse(savedInProgress);
            }
        } catch (error) {
            console.error('Automation Complete Fix: Error getting in-progress paths:', error);
        }
        
        const index = inProgress.indexOf(path.id);
        if (index !== -1) {
            inProgress.splice(index, 1);
            localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        }
        
        console.log('Automation Complete Fix: Execution status card removed for path:', path.name);
    };
    
    console.log('Automation Complete Fix: Card persistence fixed');
}

/**
 * Fix post publishing
 */
function fixPostPublishing() {
    console.log('Automation Complete Fix: Fixing post publishing...');
    
    // Override publishAutomatedPost function
    window.publishAutomatedPost = function(post) {
        console.log('Automation Complete Fix: Publishing post:', post.title);
        
        try {
            // Ensure post has required fields
            if (!post) {
                throw new Error('Post is null or undefined');
            }
            
            if (!post.id) {
                post.id = Date.now().toString();
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
                }
            } catch (error) {
                console.error('Automation Complete Fix: Error loading existing posts:', error);
            }
            
            // Ensure blogPosts is an array
            if (!Array.isArray(blogPosts)) {
                blogPosts = [];
            }
            
            // Prepare the post
            post.date = new Date().toISOString();
            post.language = post.language || 'english';
            post.status = 'published';
            post.category = post.category || 'Uncategorized';
            
            // Add the post to the beginning of the array
            blogPosts.unshift(post);
            
            // Save to localStorage
            localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
            
            // Show a notification
            showPublishNotification(post);
            
            console.log('Automation Complete Fix: Post published successfully:', post.title);
            
            return {
                success: true,
                post: post,
                url: 'blog.html?post=' + post.id
            };
        } catch (error) {
            console.error('Automation Complete Fix: Error publishing post:', error);
            
            // Show an error notification
            showPublishNotification(null, error);
            
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // Override showPublishNotification function
    window.showPublishNotification = function(post, error) {
        console.log('Automation Complete Fix: Showing publish notification');
        
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.publish-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'publish-notification';
            document.body.appendChild(notification);
        }
        
        if (error) {
            // Error notification
            notification.className = 'publish-notification error';
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="notification-content">
                    <h4>Publishing Failed</h4>
                    <p>${error.message || 'An error occurred while publishing the post'}</p>
                </div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
        } else if (post) {
            // Success notification
            notification.className = 'publish-notification success';
            let message = `Post "${post.title}" has been published`;
            
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="notification-content">
                    <h4>Post Published</h4>
                    <p>${message}</p>
                    <a href="blog.html?post=${post.id}" class="view-post-link" target="_blank">View Post</a>
                </div>
                <button class="notification-close"><i class="fas fa-times"></i></button>
            `;
        }
        
        // Add event listener to close button
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }
        
        // Show the notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    };
    
    console.log('Automation Complete Fix: Post publishing fixed');
}

// Export functions to global scope
window.automationCompleteFix = {
    applyFixes,
    fixTimeDisplay,
    fixCardPersistence,
    fixPostPublishing
};

console.log('Automation Complete Fix: Script loaded');
