/**
 * Automation Direct Fix
 * This script directly fixes the critical issues with automation paths
 * by completely replacing the problematic functions
 */

// Wait for document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Direct Fix: Initializing...');
    
    // Apply fixes immediately
    applyDirectFixes();
    
    // Also apply fixes after a delay to ensure they override any other scripts
    setTimeout(applyDirectFixes, 1000);
});

/**
 * Apply all direct fixes
 */
function applyDirectFixes() {
    console.log('Automation Direct Fix: Applying direct fixes...');
    
    // Replace the calculateNextRun function
    replaceCalculateNextRun();
    
    // Replace the createExecutionStatusCard function
    replaceCreateExecutionStatusCard();
    
    // Replace the publishAutomatedPost function
    replacePublishAutomatedPost();
    
    // Restore execution status cards
    restoreStatusCards();
    
    // Override the renderAutomationPaths function to ensure it uses our fixed functions
    replaceRenderAutomationPaths();
    
    console.log('Automation Direct Fix: All direct fixes applied');
}

/**
 * Replace the calculateNextRun function
 */
function replaceCalculateNextRun() {
    console.log('Automation Direct Fix: Replacing calculateNextRun function...');
    
    // Define the new function
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
    
    console.log('Automation Direct Fix: calculateNextRun function replaced');
}

/**
 * Replace the createExecutionStatusCard function
 */
function replaceCreateExecutionStatusCard() {
    console.log('Automation Direct Fix: Replacing createExecutionStatusCard function...');
    
    // Define the new function
    window.createExecutionStatusCard = function(path) {
        console.log('Automation Direct Fix: Creating execution status card for path:', path.name);
        
        // Make sure path has an ID
        if (!path.id) {
            path.id = Date.now().toString();
        }
        
        // Check if a card already exists
        const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (existingCard) {
            console.log('Automation Direct Fix: Card already exists for path:', path.name);
            return;
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Automation Direct Fix: Creating execution status cards container');
            
            // Create the container
            container = document.createElement('div');
            container.className = 'execution-status-cards-container';
            
            // Find the automation section
            const automationSection = document.querySelector('#ai-automation-section');
            if (!automationSection) {
                console.error('Automation Direct Fix: Could not find automation section');
                return;
            }
            
            // Add the container to the section
            const automationContainer = automationSection.querySelector('.ai-automation-container');
            if (automationContainer) {
                automationContainer.insertBefore(container, automationContainer.firstChild);
            } else {
                const header = automationSection.querySelector('.section-header');
                if (header && header.nextSibling) {
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
        
        // Save the path ID to localStorage
        markPathInProgress(path);
        
        console.log('Automation Direct Fix: Execution status card created for path:', path.name);
    };
    
    console.log('Automation Direct Fix: createExecutionStatusCard function replaced');
}

/**
 * Mark a path as in progress
 */
function markPathInProgress(path) {
    if (!path || !path.id) return;
    
    // Get the current in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Automation Direct Fix: Error getting in-progress paths:', error);
    }
    
    // Add the path ID if not already in the list
    if (!inProgress.includes(path.id)) {
        inProgress.push(path.id);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log('Automation Direct Fix: Path marked as in progress:', path.name);
    }
}

/**
 * Mark a path as completed
 */
function markPathCompleted(path) {
    if (!path || !path.id) return;
    
    // Get the current in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Automation Direct Fix: Error getting in-progress paths:', error);
    }
    
    // Remove the path ID from the list
    const index = inProgress.indexOf(path.id);
    if (index !== -1) {
        inProgress.splice(index, 1);
        localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
        console.log('Automation Direct Fix: Path marked as completed:', path.name);
    }
}

/**
 * Replace the publishAutomatedPost function - NOW USES API
 */
function replacePublishAutomatedPost() {
    console.log('Automation Direct Fix: Replacing publishAutomatedPost function with API version...');
    
    // Define the new function that uses API
    window.publishAutomatedPost = async function(post) {
        console.log('Automation Direct Fix: Publishing post via API:', post.title);
        
        try {
            // Ensure post has required fields
            if (!post) {
                throw new Error('Post is null or undefined');
            }
            
            if (!post.title) {
                throw new Error('Post has no title');
            }
            
            if (!post.content) {
                throw new Error('Post has no content');
            }
            
            // Prepare the post for API
            post.date = new Date().toISOString();
            post.published_date = new Date().toISOString();
            post.language = post.language || 'english';
            post.status = 'published';
            post.category = post.category || 'Uncategorized';
            post.image_url = post.image_url || post.image || '';
            
            // Use BlogDataManager if available
            if (window.blogDataManager) {
                console.log('Automation Direct Fix: Using BlogDataManager to save post');
                const createdPost = await window.blogDataManager.createPost(post);
                console.log('Automation Direct Fix: Post saved via BlogDataManager, ID:', createdPost?.id);
                
                // Show a notification
                showPublishNotification(createdPost || post);
                
                return {
                    success: true,
                    post: createdPost || post,
                    url: 'blog.html?post=' + (createdPost?.id || post.id)
                };
            }
            
            // Direct API call fallback
            console.log('Automation Direct Fix: BlogDataManager not available, calling API directly');
            const response = await fetch('/api/blog/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            
            if (response.ok) {
                const result = await response.json();
                const savedPost = result.post || post;
                console.log('Automation Direct Fix: Post saved to API, ID:', savedPost.id);
                
                // Show a notification
                showPublishNotification(savedPost);
                
                return {
                    success: true,
                    post: savedPost,
                    url: 'blog.html?post=' + savedPost.id
                };
            } else {
                const errorText = await response.text();
                throw new Error('API error: ' + response.status + ' - ' + errorText);
            }
        } catch (error) {
            console.error('Automation Direct Fix: Error publishing post:', error);
            
            // Show an error notification
            showPublishNotification(null, error);
            
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    console.log('Automation Direct Fix: publishAutomatedPost function replaced');
}

/**
 * Show a notification for a published post
 */
function showPublishNotification(post, error) {
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
}

/**
 * Restore execution status cards
 */
function restoreStatusCards() {
    console.log('Automation Direct Fix: Restoring execution status cards...');
    
    // Get the in-progress paths
    let inProgress = [];
    try {
        const savedInProgress = localStorage.getItem('aiAutomationInProgress');
        if (savedInProgress) {
            inProgress = JSON.parse(savedInProgress);
        }
    } catch (error) {
        console.error('Automation Direct Fix: Error getting in-progress paths:', error);
    }
    
    if (inProgress.length === 0) {
        console.log('Automation Direct Fix: No in-progress paths found');
        return;
    }
    
    console.log('Automation Direct Fix: Found in-progress paths:', inProgress);
    
    // Get the automation paths
    let automationPaths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            automationPaths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Automation Direct Fix: Error getting automation paths:', error);
    }
    
    // Create status cards for in-progress paths
    inProgress.forEach(pathId => {
        const path = automationPaths.find(p => p.id === pathId);
        if (path) {
            window.createExecutionStatusCard(path);
        } else {
            console.warn('Automation Direct Fix: Path not found for ID:', pathId);
            
            // Remove from in-progress list
            const index = inProgress.indexOf(pathId);
            if (index !== -1) {
                inProgress.splice(index, 1);
                localStorage.setItem('aiAutomationInProgress', JSON.stringify(inProgress));
            }
        }
    });
}

/**
 * Replace the renderAutomationPaths function
 */
function replaceRenderAutomationPaths() {
    console.log('Automation Direct Fix: Replacing renderAutomationPaths function...');
    
    // Save the original function
    const originalRenderAutomationPaths = window.renderAutomationPaths;
    
    // Define the new function
    window.renderAutomationPaths = function() {
        // Call the original function
        if (typeof originalRenderAutomationPaths === 'function') {
            originalRenderAutomationPaths();
        }
        
        // Fix the time display on all path cards
        fixTimeDisplayOnCards();
    };
    
    console.log('Automation Direct Fix: renderAutomationPaths function replaced');
}

/**
 * Fix the time display on all path cards
 */
function fixTimeDisplayOnCards() {
    console.log('Automation Direct Fix: Fixing time display on cards...');
    
    // Get all automation paths
    let automationPaths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            automationPaths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Automation Direct Fix: Error getting automation paths:', error);
    }
    
    // Get all path cards
    const pathCards = document.querySelectorAll('.automation-path');
    
    // Fix the time display on each card
    pathCards.forEach(card => {
        const index = card.dataset.index;
        if (index !== undefined && automationPaths[index]) {
            const path = automationPaths[index];
            const nextRunElement = card.querySelector('.next-run');
            
            if (nextRunElement && path.schedule && path.schedule.time) {
                // Get the current date
                const now = new Date();
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                // Format the date part
                let dateStr = 'Today';
                
                // If the time has already passed today, use tomorrow
                const [hours, minutes] = path.schedule.time.split(':').map(Number);
                const scheduleTime = new Date(now);
                scheduleTime.setHours(hours, minutes, 0, 0);
                
                if (scheduleTime < now) {
                    dateStr = 'Tomorrow';
                }
                
                // Update the text
                nextRunElement.textContent = `Next run: ${dateStr}, ${path.schedule.time}`;
            }
        }
    });
}

// Export functions to global scope
window.automationDirectFix = {
    applyDirectFixes,
    replaceCalculateNextRun,
    replaceCreateExecutionStatusCard,
    replacePublishAutomatedPost,
    restoreStatusCards,
    replaceRenderAutomationPaths,
    fixTimeDisplayOnCards
};

console.log('Automation Direct Fix: Script loaded');
