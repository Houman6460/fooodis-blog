
/**
 * Dashboard Post Management
 * Handles post management operations in the dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard Post Management: Initializing');
    
    // Initialize post management when the page loads
    if (window.location.pathname.includes('dashboard.html')) {
        setTimeout(initializePostManagement, 1000);
    }
});

function initializePostManagement() {
    console.log('Dashboard Post Management: Setting up post management');
    
    // Override the delete post function if it exists
    if (typeof window.deletePost === 'function') {
        const originalDeletePost = window.deletePost;
        window.deletePost = function(postId) {
            console.log('Dashboard Post Management: Enhanced delete post called for', postId);
            
            // Call the original function first
            const result = originalDeletePost(postId);
            
            // Then use our blog data manager for comprehensive deletion
            if (window.blogDataManager) {
                window.blogDataManager.deletePost(postId);
            }
            
            // Force refresh the manage posts section
            setTimeout(() => {
                refreshManagePostsSection();
            }, 500);
            
            return result;
        };
    } else {
        // Create the delete post function if it doesn't exist
        window.deletePost = function(postId) {
            console.log('Dashboard Post Management: Creating new delete post function for', postId);
            
            // Immediate UI update - remove from DOM right away
            const postElement = document.querySelector(`[data-id="${postId}"]`);
            if (postElement) {
                postElement.remove();
                console.log('Dashboard Post Management: Immediately removed post element from DOM');
            }
            
            // Delete from storage
            let success = false;
            if (window.blogDataManager) {
                success = window.blogDataManager.deletePost(postId);
            } else {
                // Fallback deletion
                success = deletePostDirectly(postId);
            }
            
            if (success) {
                // Show success message
                showNotification('Post deleted successfully', 'success');
                
                // Force refresh all views
                forceRefreshAllViews(postId);
                
                // Broadcast deletion to all windows/tabs
                broadcastDeletion(postId);
            } else {
                // Show error message
                showNotification('Error deleting post', 'error');
            }
            
            return success;
        };
    }
    
    // Add clear all posts function
    window.clearAllPosts = function() {
        console.log('Dashboard Post Management: Clearing all posts');
        
        if (confirm('Are you sure you want to delete all blog posts? This action cannot be undone.')) {
            if (window.blogDataManager) {
                const success = window.blogDataManager.clearAllPosts();
                
                if (success) {
                    showNotification('All posts cleared successfully', 'success');
                    setTimeout(() => {
                        refreshManagePostsSection();
                    }, 500);
                } else {
                    showNotification('Error clearing posts', 'error');
                }
            }
        }
    };
    
    // Listen for post deletion events
    document.addEventListener('blogPostDeleted', function(e) {
        console.log('Dashboard Post Management: Post deleted event received', e.detail);
        refreshManagePostsSection();
    });
    
    // Listen for posts cleared events
    document.addEventListener('blogPostsCleared', function() {
        console.log('Dashboard Post Management: Posts cleared event received');
        refreshManagePostsSection();
    });
}

function refreshManagePostsSection() {
    console.log('Dashboard Post Management: Refreshing manage posts section');
    
    // Find the manage posts container
    const managePostsContainer = document.getElementById('manage-posts-grid') || 
                                 document.querySelector('.manage-posts-grid') ||
                                 document.querySelector('.posts-management-section');
    
    if (managePostsContainer) {
        // Clear the container
        managePostsContainer.innerHTML = '';
        
        // Reload posts
        if (window.blogDataManager) {
            const posts = window.blogDataManager.getAllPosts();
            console.log('Dashboard Post Management: Found', posts.length, 'posts to display');
            
            if (posts.length === 0) {
                managePostsContainer.innerHTML = '<p class="no-posts-message">No blog posts found. Create your first post to get started!</p>';
            } else {
                // Re-render the posts
                posts.forEach(post => {
                    const postElement = createPostManagementCard(post);
                    managePostsContainer.appendChild(postElement);
                });
            }
        }
    } else {
        console.log('Dashboard Post Management: Manage posts container not found');
    }
    
    // Also trigger any existing refresh functions
    if (typeof window.loadManagePosts === 'function') {
        window.loadManagePosts();
    }
    
    if (typeof loadManagePosts === 'function') {
        loadManagePosts();
    }
}

function createPostManagementCard(post) {
    const card = document.createElement('div');
    card.className = 'post-management-card';
    card.setAttribute('data-id', post.id);
    
    card.innerHTML = `
        <div class="post-card-header">
            <h3 class="post-title">${post.title || 'Untitled Post'}</h3>
            <div class="post-actions">
                <button class="edit-post-btn" onclick="editPost(${post.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-post-btn" onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        <div class="post-meta">
            <span class="post-date">${post.date || 'No date'}</span>
            <span class="post-category">${post.category || 'Uncategorized'}</span>
        </div>
        <div class="post-excerpt">
            ${post.excerpt || 'No excerpt available'}
        </div>
    `;
    
    return card;
}

function showNotification(message, type = 'info') {
    console.log('Dashboard Post Management: Showing notification:', message, type);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.refreshManagePostsSection = refreshManagePostsSection;
    window.createPostManagementCard = createPostManagementCard;
    window.showNotification = showNotification;
}
function deletePostDirectly(postId) {
    console.log('Dashboard Post Management: Direct post deletion for', postId);
    
    try {
        // Get existing posts
        let blogPosts = [];
        const saved = localStorage.getItem('fooodis-blog-posts');
        if (saved) {
            blogPosts = JSON.parse(saved);
        }
        
        // Filter out the deleted post
        const filteredPosts = blogPosts.filter(post => 
            post.id !== postId && 
            post.id !== parseInt(postId) && 
            post.id.toString() !== postId.toString()
        );
        
        console.log('Dashboard Post Management: Posts before deletion:', blogPosts.length);
        console.log('Dashboard Post Management: Posts after deletion:', filteredPosts.length);
        
        // Save back to localStorage
        localStorage.setItem('fooodis-blog-posts', JSON.stringify(filteredPosts));
        
        return true;
    } catch (error) {
        console.error('Dashboard Post Management: Error in direct deletion:', error);
        return false;
    }
}

function forceRefreshAllViews(deletedPostId) {
    console.log('Dashboard Post Management: Force refreshing all views after deletion');
    
    // Remove from all possible containers
    const selectors = [
        `[data-id="${deletedPostId}"]`,
        `[data-post-id="${deletedPostId}"]`,
        `#post-${deletedPostId}`,
        `.post-${deletedPostId}`
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.remove();
            console.log('Dashboard Post Management: Removed element with selector:', selector);
        });
    });
    
    // Refresh manage posts section
    setTimeout(() => {
        refreshManagePostsSection();
    }, 100);
    
    // If we have access to blog functions, refresh those too
    if (typeof window.loadBlogPosts === 'function') {
        setTimeout(() => {
            window.loadBlogPosts();
        }, 200);
    }
    
    // Clear any cached data
    const cacheKeys = [
        'blogPostsCache',
        'managedPostsCache',
        'blogDisplayCache',
        'cachedBlogPosts'
    ];
    
    cacheKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
        if (window[key]) {
            delete window[key];
        }
    });
}

function broadcastDeletion(deletedPostId) {
    console.log('Dashboard Post Management: Broadcasting deletion to all windows');
    
    // Use localStorage event to notify other windows/tabs
    const event = {
        type: 'postDeleted',
        postId: deletedPostId,
        timestamp: Date.now()
    };
    
    localStorage.setItem('postDeletionBroadcast', JSON.stringify(event));
    
    // Clean up after broadcasting
    setTimeout(() => {
        localStorage.removeItem('postDeletionBroadcast');
    }, 1000);
    
    // Also dispatch custom events
    document.dispatchEvent(new CustomEvent('blogPostDeleted', {
        detail: { postId: deletedPostId }
    }));
    
    window.dispatchEvent(new CustomEvent('storage', {
        detail: { 
            key: 'fooodis-blog-posts',
            action: 'delete',
            postId: deletedPostId
        }
    }));
}

// Listen for deletion broadcasts from other windows
window.addEventListener('storage', function(e) {
    if (e.key === 'postDeletionBroadcast') {
        try {
            const event = JSON.parse(e.newValue);
            if (event && event.type === 'postDeleted') {
                console.log('Dashboard Post Management: Received deletion broadcast for post:', event.postId);
                
                // Remove from current view
                const postElement = document.querySelector(`[data-id="${event.postId}"]`);
                if (postElement) {
                    postElement.remove();
                }
                
                // Refresh if we're on the blog page
                if (window.location.pathname.includes('blog.html')) {
                    if (typeof window.loadBlogPosts === 'function') {
                        window.loadBlogPosts();
                    }
                }
            }
        } catch (error) {
            console.error('Dashboard Post Management: Error processing deletion broadcast:', error);
        }
    }
});
