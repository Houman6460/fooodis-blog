/**
 * Direct fix for Fooodis Blog System automation issues
 * This script addresses three main issues:
 * 1. Time rounding - ensures exact time string is preserved
 * 2. Card persistence - ensures cards persist across page refreshes
 * 3. Post publishing - ensures posts are published correctly
 */

// Wait for page to fully load
window.addEventListener('load', function() {
    console.log('Applying direct fixes to automation system...');
    
    // Fix 1: Time display - Override calculateNextRun function
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
        return dateStr + ', ' + path.schedule.time;
    };
    
    // Fix time display on existing cards
    setTimeout(function() {
        const pathCards = document.querySelectorAll('.automation-path');
        pathCards.forEach(function(card, index) {
            const nextRunElement = card.querySelector('.next-run');
            if (nextRunElement && window.automationPaths && window.automationPaths[index]) {
                const path = window.automationPaths[index];
                if (path.schedule && path.schedule.time) {
                    const nextRun = window.calculateNextRun(path);
                    if (nextRun) {
                        nextRunElement.textContent = 'Next run: ' + nextRun;
                    }
                }
            }
        });
    }, 500);
    
    // Fix 2: Card persistence
    // Initialize storage for in-progress paths
    if (!localStorage.getItem('fixedInProgress')) {
        localStorage.setItem('fixedInProgress', JSON.stringify([]));
    }
    
    // Override the createExecutionStatusCard function
    window.createExecutionStatusCard = function(path) {
        console.log('Creating execution status card for path:', path?.name);
        
        if (!path || !path.id) return;
        
        // Check if a card already exists
        const existingCard = document.querySelector('.execution-status-card[data-path-id="' + path.id + '"]');
        if (existingCard) {
            console.log('Card already exists for path:', path.name);
            return;
        }
        
        // Make sure the container exists
        let container = document.querySelector('.execution-status-cards-container');
        if (!container) {
            console.log('Creating execution status cards container');
            container = document.createElement('div');
            container.className = 'execution-status-cards-container';
            container.style.margin = '20px 0';
            container.style.padding = '15px';
            container.style.border = '1px solid #ddd';
            container.style.borderRadius = '5px';
            container.style.backgroundColor = '#f9f9f9';
            
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
        
        // Create the card
        const card = document.createElement('div');
        card.className = 'execution-status-card';
        card.dataset.pathId = path.id;
        card.style.margin = '10px 0';
        card.style.padding = '15px';
        card.style.backgroundColor = 'white';
        card.style.borderRadius = '5px';
        card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="fas fa-sync-alt fa-spin" style="margin-right: 10px; color: #0066cc;"></i>
                <h3 style="margin: 0; font-size: 16px;">Generating Content</h3>
            </div>
            <div>
                <p>Generating post for "${path.name}"</p>
                <div style="height: 10px; background-color: #ddd; border-radius: 5px; overflow: hidden; margin-top: 10px;">
                    <div class="progress-fill" style="height: 100%; width: 0%; background-color: #0066cc; transition: width 0.3s;"></div>
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
            const saved = localStorage.getItem('fixedInProgress');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing in-progress paths:', e);
        }
        
        if (!inProgress.includes(path.id)) {
            inProgress.push(path.id);
            localStorage.setItem('fixedInProgress', JSON.stringify(inProgress));
            console.log('Added path to in-progress list:', path.id);
        }
    };
    
    // Override the removeExecutionStatusCard function
    window.removeExecutionStatusCard = function(path) {
        console.log('Removing execution status card for path:', path?.name);
        
        if (!path || !path.id) return;
        
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
            const saved = localStorage.getItem('fixedInProgress');
            if (saved) {
                inProgress = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error parsing in-progress paths:', e);
        }
        
        const index = inProgress.indexOf(path.id);
        if (index !== -1) {
            inProgress.splice(index, 1);
            localStorage.setItem('fixedInProgress', JSON.stringify(inProgress));
            console.log('Removed path from in-progress list:', path.id);
        }
    };
    
    // Restore cards on page load
    setTimeout(function() {
        console.log('Restoring execution status cards...');
        
        // Get in-progress paths
        let inProgress = [];
        try {
            const saved = localStorage.getItem('fixedInProgress');
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
        
        console.log('Found in-progress paths:', inProgress);
        
        // Get automation paths
        const paths = window.automationPaths || [];
        
        // Create cards for in-progress paths
        inProgress.forEach(function(pathId) {
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
                    localStorage.setItem('fixedInProgress', JSON.stringify(inProgress));
                }
            }
        });
    }, 1000);
    
    // Fix 3: Post publishing
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
                
                // Show success notification
                showNotification('Post "' + post.title + '" published successfully!');
            } catch (e) {
                console.error('Error saving post:', e);
                
                // Try with fewer posts if localStorage is full
                if (blogPosts.length > 10) {
                    const trimmed = blogPosts.slice(0, 10);
                    try {
                        localStorage.setItem('fooodis-blog-posts', JSON.stringify(trimmed));
                        console.log('Saved trimmed posts');
                        
                        // Show success notification
                        showNotification('Post "' + post.title + '" published successfully (with trimmed history)!');
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
            
            // Show error notification
            showNotification('Error publishing post: ' + error.message, 'error');
            
            // Return error
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.backgroundColor = type === 'error' ? '#F44336' : '#4CAF50';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '300px';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
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
    
    console.log('All fixes applied successfully');
    
    // Show notification
    showNotification('Automation fixes applied successfully!');
});
