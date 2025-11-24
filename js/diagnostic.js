/**
 * Diagnostic Script
 * This script diagnoses issues with the automation system
 * and applies direct fixes to the DOM
 */

// Wait for page to be fully loaded
window.addEventListener('load', function() {
    console.log('%c DIAGNOSTIC SCRIPT LOADED', 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
    
    // Run diagnostics
    setTimeout(runDiagnostics, 1000);
});

/**
 * Run diagnostics on the automation system
 */
function runDiagnostics() {
    console.log('%c RUNNING DIAGNOSTICS', 'background: #222; color: #bada55; font-size: 14px; padding: 5px;');
    
    // Check if we can access the automation paths
    const paths = window.automationPaths || [];
    console.log(`Found ${paths.length} automation paths`);
    
    // Check for in-progress paths
    const inProgress = getInProgressPaths();
    console.log(`Found ${inProgress.length} in-progress paths`);
    
    // Check for blog posts
    const posts = getBlogPosts();
    console.log(`Found ${posts.length} blog posts`);
    
    // Apply direct DOM fixes
    applyDirectFixes();
}

/**
 * Get in-progress paths from localStorage
 */
function getInProgressPaths() {
    try {
        // Try different storage keys
        const keys = ['aiAutomationInProgress', 'inProgressPaths', 'automationInProgress'];
        
        for (const key of keys) {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log(`Found in-progress paths in localStorage key: ${key}`);
                    return parsed;
                }
            }
        }
        
        // If no existing storage found, create a new one
        localStorage.setItem('automationInProgress', JSON.stringify([]));
        return [];
    } catch (e) {
        console.error('Error getting in-progress paths:', e);
        return [];
    }
}

/**
 * Get blog posts from localStorage
 */
function getBlogPosts() {
    try {
        const saved = localStorage.getItem('fooodis-blog-posts');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
        return [];
    } catch (e) {
        console.error('Error getting blog posts:', e);
        return [];
    }
}

/**
 * Apply direct fixes to the DOM
 */
function applyDirectFixes() {
    console.log('%c APPLYING DIRECT FIXES', 'background: #222; color: #bada55; font-size: 14px; padding: 5px;');
    
    // Fix 1: Time display on automation path cards
    fixTimeDisplay();
    
    // Fix 2: Card persistence
    fixCardPersistence();
    
    // Fix 3: Post publishing
    fixPostPublishing();
    
    // Diagnostic controls removed as per user request
    // addDiagnosticControls();
}

/**
 * Fix 1: Time display on automation path cards
 */
function fixTimeDisplay() {
    console.log('Fixing time display on automation path cards...');
    
    // Direct DOM manipulation to fix time display
    const pathCards = document.querySelectorAll('.automation-path');
    pathCards.forEach((card, index) => {
        const nextRunElement = card.querySelector('.next-run');
        if (nextRunElement) {
            const text = nextRunElement.textContent;
            if (text && text.includes('Next run:')) {
                // Get the path
                const path = window.automationPaths?.[index];
                if (path?.schedule?.time) {
                    // Just use Today or Tomorrow with the exact time
                    const now = new Date();
                    const [hours, minutes] = path.schedule.time.split(':').map(Number);
                    
                    const scheduleTime = new Date();
                    scheduleTime.setHours(hours, minutes, 0, 0);
                    
                    // Use Tomorrow if the time has already passed today
                    const dateStr = (scheduleTime > now) ? 'Today' : 'Tomorrow';
                    
                    // Update the text directly
                    nextRunElement.textContent = `Next run: ${dateStr}, ${path.schedule.time}`;
                    nextRunElement.style.color = '#00cc00';
                    console.log(`Fixed time display for path: ${path.name}`);
                }
            }
        }
    });
    
    // Override the calculateNextRun function
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
}

/**
 * Fix 2: Card persistence
 */
function fixCardPersistence() {
    console.log('Fixing card persistence...');
    
    // Get in-progress paths
    const inProgress = getInProgressPaths();
    
    // Get automation paths
    const paths = window.automationPaths || [];
    
    // Create container if it doesn't exist
    let container = document.querySelector('.execution-status-cards-container');
    if (!container) {
        console.log('Creating execution status cards container');
        container = document.createElement('div');
        container.className = 'execution-status-cards-container';
        container.style.margin = '20px 0';
        container.style.padding = '10px';
        container.style.border = '1px solid #ddd';
        container.style.borderRadius = '5px';
        
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
            const main = document.querySelector('main') || document.body;
            main.insertBefore(container, main.firstChild);
        }
    }
    
    // Create cards for in-progress paths
    inProgress.forEach(pathId => {
        const path = paths.find(p => p.id === pathId);
        if (path) {
            // Check if card already exists
            const existingCard = document.querySelector(`.execution-status-card[data-path-id="${pathId}"]`);
            if (!existingCard) {
                console.log(`Creating card for path: ${path.name}`);
                
                // Create the card
                const card = document.createElement('div');
                card.className = 'execution-status-card';
                card.dataset.pathId = pathId;
                card.style.margin = '10px 0';
                card.style.padding = '15px';
                card.style.backgroundColor = '#f5f5f5';
                card.style.borderRadius = '5px';
                card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                
                card.innerHTML = `
                    <div class="status-card-header" style="display: flex; align-items: center; margin-bottom: 10px;">
                        <i class="fas fa-sync-alt fa-spin" style="margin-right: 10px; color: #0066cc;"></i>
                        <h3 style="margin: 0; font-size: 16px;">Generating Content</h3>
                    </div>
                    <div class="status-card-content">
                        <p style="margin: 0 0 10px 0;">Generating post for "${path.name}"</p>
                        <div class="progress-bar" style="height: 10px; background-color: #ddd; border-radius: 5px; overflow: hidden;">
                            <div class="progress-fill" style="height: 100%; width: 0%; background-color: #0066cc;"></div>
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
        }
    });
    
    // Override the createExecutionStatusCard function
    window.createExecutionStatusCard = function(path) {
        if (!path || !path.id) return;
        
        console.log('Creating execution status card for path:', path.name);
        
        // Check if a card already exists
        const existingCard = document.querySelector(`.execution-status-card[data-path-id="${path.id}"]`);
        if (existingCard) {
            console.log(`Card already exists for path: ${path.name}`);
            return;
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Creating execution status cards container');
            container = document.createElement('div');
            container.className = 'execution-status-cards-container';
            container.style.margin = '20px 0';
            container.style.padding = '10px';
            container.style.border = '1px solid #ddd';
            container.style.borderRadius = '5px';
            
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
                const main = document.querySelector('main') || document.body;
                main.insertBefore(container, main.firstChild);
            }
        }
        
        // Create the card
        const card = document.createElement('div');
        card.className = 'execution-status-card';
        card.dataset.pathId = path.id;
        card.style.margin = '10px 0';
        card.style.padding = '15px';
        card.style.backgroundColor = '#f5f5f5';
        card.style.borderRadius = '5px';
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        
        card.innerHTML = `
            <div class="status-card-header" style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="fas fa-sync-alt fa-spin" style="margin-right: 10px; color: #0066cc;"></i>
                <h3 style="margin: 0; font-size: 16px;">Generating Content</h3>
            </div>
            <div class="status-card-content">
                <p style="margin: 0 0 10px 0;">Generating post for "${path.name}"</p>
                <div class="progress-bar" style="height: 10px; background-color: #ddd; border-radius: 5px; overflow: hidden;">
                    <div class="progress-fill" style="height: 100%; width: 0%; background-color: #0066cc;"></div>
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
        
        // Add to in-progress paths
        let inProgress = getInProgressPaths();
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('automationInProgress', JSON.stringify(inProgress));
        }
    };
    
    // Override the removeExecutionStatusCard function
    window.removeExecutionStatusCard = function(path) {
        if (!path || !path.id) return;
        
        console.log('Removing execution status card for path:', path.name);
        
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
        
        // Remove from in-progress paths
        let inProgress = getInProgressPaths();
        const index = inProgress.indexOf(path.id);
        if (index !== -1) {
            inProgress.splice(index, 1);
            localStorage.setItem('automationInProgress', JSON.stringify(inProgress));
        }
    };
}

/**
 * Fix 3: Post publishing
 */
function fixPostPublishing() {
    console.log('Fixing post publishing...');
    
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
            let blogPosts = getBlogPosts();
            
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
                
                // Show success message
                showNotification(`Post "${post.title}" published successfully!`, 'success');
            } catch (e) {
                console.error('Error saving post:', e);
                
                // Try with fewer posts if localStorage is full
                if (blogPosts.length > 10) {
                    const trimmed = blogPosts.slice(0, 10);
                    try {
                        localStorage.setItem('fooodis-blog-posts', JSON.stringify(trimmed));
                        console.log('Saved trimmed posts');
                        
                        // Show success message
                        showNotification(`Post "${post.title}" published successfully (with trimmed history)!`, 'success');
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
            
            // Show error message
            showNotification(`Error publishing post: ${error.message}`, 'error');
            
            // Return error
            return {
                success: false,
                error: error.message
            };
        }
    };
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#F44336';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#2196F3';
        notification.style.color = 'white';
    }
    
    // Set message
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Add diagnostic controls to the page
 */
function addDiagnosticControls() {
    // Create controls container
    const controls = document.createElement('div');
    controls.style.position = 'fixed';
    controls.style.top = '10px';
    controls.style.right = '10px';
    controls.style.zIndex = '9999';
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '5px';
    
    // Add diagnostic button
    const diagButton = document.createElement('button');
    diagButton.textContent = 'Run Diagnostics';
    diagButton.style.padding = '5px 10px';
    diagButton.style.backgroundColor = '#2196F3';
    diagButton.style.color = 'white';
    diagButton.style.border = 'none';
    diagButton.style.borderRadius = '3px';
    diagButton.style.cursor = 'pointer';
    diagButton.onclick = runDiagnostics;
    controls.appendChild(diagButton);
    
    // Add fix time button
    const timeButton = document.createElement('button');
    timeButton.textContent = 'Fix Time Display';
    timeButton.style.padding = '5px 10px';
    timeButton.style.backgroundColor = '#4CAF50';
    timeButton.style.color = 'white';
    timeButton.style.border = 'none';
    timeButton.style.borderRadius = '3px';
    timeButton.style.cursor = 'pointer';
    timeButton.onclick = fixTimeDisplay;
    controls.appendChild(timeButton);
    
    // Add fix cards button
    const cardButton = document.createElement('button');
    cardButton.textContent = 'Fix Cards';
    cardButton.style.padding = '5px 10px';
    cardButton.style.backgroundColor = '#FF9800';
    cardButton.style.color = 'white';
    cardButton.style.border = 'none';
    cardButton.style.borderRadius = '3px';
    cardButton.style.cursor = 'pointer';
    cardButton.onclick = fixCardPersistence;
    controls.appendChild(cardButton);
    
    // Add to document
    document.body.appendChild(controls);
}

// Export functions
window.diagnosticFix = {
    runDiagnostics,
    fixTimeDisplay,
    fixCardPersistence,
    fixPostPublishing
};

console.log('%c DIAGNOSTIC SCRIPT READY', 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
