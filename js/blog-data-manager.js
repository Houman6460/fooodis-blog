
/**
 * Blog Data Manager
 * Handles blog post data operations including proper deletion
 */

class BlogDataManager {
    constructor() {
        this.storageKey = 'fooodis-blog-posts';
        this.init();
    }
    
    init() {
        console.log('Blog Data Manager: Initializing');
        
        // Fetch from backend on init
        this.fetchFromBackend();
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('Blog Data Manager: Storage changed, refreshing blog');
                this.refreshBlogDisplay();
            }
        });
        
        // Also listen for custom events
        document.addEventListener('blogPostsUpdated', () => {
            console.log('Blog Data Manager: Blog posts updated event received');
            this.refreshBlogDisplay();
        });
        
        document.addEventListener('blogPostDeleted', (e) => {
            console.log('Blog Data Manager: Blog post deleted event received', e.detail);
            this.handlePostDeletion(e.detail.postId);
        });
    }
    
    async fetchFromBackend() {
        try {
            const response = await fetch('/api/blog/posts');
            if (response.ok) {
                const posts = await response.json();
                // Update local storage to keep sync behavior working
                localStorage.setItem(this.storageKey, JSON.stringify(posts));
                // Dispatch update
                document.dispatchEvent(new CustomEvent('blogPostsUpdated', { detail: { posts } }));
                console.log('Blog Data Manager: Synced with backend');
                return posts;
            }
        } catch (e) { console.error('Blog Data Manager: Error fetching from backend', e); }
        return this.getAllPosts(); // Fallback
    }
    
    getAllPosts() {
        try {
            const posts = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            console.log('Blog Data Manager: Retrieved', posts.length, 'posts from storage');
            return posts;
        } catch (error) {
            console.error('Blog Data Manager: Error retrieving posts', error);
            return [];
        }
    }
    
    savePosts(posts) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(posts));
            console.log('Blog Data Manager: Saved', posts.length, 'posts to storage');
            
            // Dispatch update event
            document.dispatchEvent(new CustomEvent('blogPostsUpdated', {
                detail: { posts: posts }
            }));
            
            return true;
        } catch (error) {
            console.error('Blog Data Manager: Error saving posts', error);
            return false;
        }
    }
    
    async deletePost(postId) {
        console.log('Blog Data Manager: Deleting post', postId);
        
        // Optimistic update (local)
        const posts = this.getAllPosts();
        const filteredPosts = posts.filter(post => post.id !== postId && post.id !== parseInt(postId));
        
        if (this.savePosts(filteredPosts)) {
            // Dispatch deletion event
            document.dispatchEvent(new CustomEvent('blogPostDeleted', {
                detail: { postId: postId }
            }));
            
            // Force refresh the blog display
            this.refreshBlogDisplay();
            
            // Backend delete
            try {
                await fetch(`/api/blog/posts/${postId}`, { method: 'DELETE' });
            } catch (e) { console.error('Blog Data Manager: Error deleting from backend', e); }
            
            return true;
        }
        
        return false;
    }
    
    clearAllPosts() {
        console.log('Blog Data Manager: Clearing all posts');
        
        if (this.savePosts([])) {
            // Dispatch clear event
            document.dispatchEvent(new CustomEvent('blogPostsCleared'));
            
            // Force refresh the blog display
            this.refreshBlogDisplay();
            
            return true;
        }
        
        return false;
    }
    
    handlePostDeletion(postId) {
        // Remove the post from DOM immediately
        const postElement = document.querySelector(`[data-id="${postId}"]`);
        if (postElement) {
            postElement.remove();
            console.log('Blog Data Manager: Removed post element from DOM', postId);
        }
        
        // Also remove from any blog grids
        const blogGrids = document.querySelectorAll('.blog-posts-grid, .blog-grid, .posts-container');
        blogGrids.forEach(grid => {
            const postCard = grid.querySelector(`[data-id="${postId}"]`);
            if (postCard) {
                postCard.remove();
                console.log('Blog Data Manager: Removed post card from grid', postId);
            }
        });
    }
    
    refreshBlogDisplay() {
        console.log('Blog Data Manager: Refreshing blog display');
        
        // Force clear any cached data
        this.clearCache();
        
        // If we're on the blog page, reload the posts
        if (window.location.pathname.includes('blog.html')) {
            if (typeof window.loadBlogPosts === 'function') {
                window.loadBlogPosts();
            } else if (typeof loadBlogPosts === 'function') {
                loadBlogPosts();
            }
            
            // Force refresh the blog posts grid
            this.forceRefreshBlogGrid();
        }
        
        // If we're on the dashboard, reload the manage posts section
        if (window.location.pathname.includes('dashboard.html')) {
            if (typeof window.loadManagePosts === 'function') {
                window.loadManagePosts();
            } else if (typeof loadManagePosts === 'function') {
                loadManagePosts();
            }
            
            // Force refresh the manage posts section
            this.forceRefreshManagePosts();
        }
        
        // Trigger a custom refresh event
        document.dispatchEvent(new CustomEvent('blogDisplayRefresh'));
        
        // Also dispatch to any open blog windows
        this.broadcastToAllWindows();
    }
    
    clearCache() {
        // Clear any cached blog posts
        if (window.cachedBlogPosts) {
            delete window.cachedBlogPosts;
        }
        
        // Clear any cached elements
        const cacheKeys = ['blogPostsCache', 'managedPostsCache', 'blogDisplayCache'];
        cacheKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    forceRefreshBlogGrid() {
        const blogGrid = document.getElementById('blogPostsGrid');
        if (blogGrid) {
            blogGrid.innerHTML = '';
            
            // Reload posts
            const posts = this.getAllPosts();
            console.log('Blog Data Manager: Force refreshing blog grid with', posts.length, 'posts');
            
            if (posts.length === 0) {
                blogGrid.innerHTML = '<div class="no-posts-message">No blog posts found.</div>';
                return;
            }
            
            // Re-render posts
            posts.forEach((post, index) => {
                const postCard = this.createBlogPostCard(post, index);
                blogGrid.appendChild(postCard);
            });
        }
    }
    
    forceRefreshManagePosts() {
        const manageGrid = document.getElementById('manage-posts-grid') || 
                          document.querySelector('.manage-posts-grid') ||
                          document.querySelector('.posts-management-section') ||
                          document.querySelector('#postsTableBody');
                          
        if (manageGrid) {
            manageGrid.innerHTML = '';
            
            // Reload posts
            const posts = this.getAllPosts();
            console.log('Blog Data Manager: Force refreshing manage posts with', posts.length, 'posts');
            
            if (posts.length === 0) {
                manageGrid.innerHTML = '<tr><td colspan="4">No blog posts found.</td></tr>';
                return;
            }
            
            // Re-render posts
            posts.forEach(post => {
                const postRow = this.createManagePostRow(post);
                manageGrid.appendChild(postRow);
            });
        }
    }
    
    createBlogPostCard(post, index) {
        const card = document.createElement('div');
        card.className = 'blog-post-card';
        card.setAttribute('data-id', post.id);
        
        card.innerHTML = `
            <div class="blog-post-image">
                <img src="${post.imageUrl || 'images/default-blog-image.jpg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-post-content">
                <div class="blog-post-meta">
                    <span class="blog-post-category">${post.category}</span>
                    <span class="blog-post-date">${this.formatDate(post.date)}</span>
                </div>
                <h3 class="blog-post-title">${post.title}</h3>
                <p class="blog-post-excerpt">${post.excerpt || ''}</p>
                <button class="read-more-btn" onclick="openBlogPost(${post.id})">Read More</button>
            </div>
        `;
        
        return card;
    }
    
    createManagePostRow(post) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', post.id);
        
        row.innerHTML = `
            <td>${post.title}</td>
            <td>${post.category}</td>
            <td>${post.featured ? 'Yes' : 'No'}</td>
            <td>
                <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
            </td>
        `;
        
        return row;
    }
    
    formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Unknown';
        }
    }
    
    broadcastToAllWindows() {
        // Broadcast to localStorage to trigger updates in other windows
        const event = {
            type: 'blogPostsUpdated',
            timestamp: Date.now(),
            posts: this.getAllPosts()
        };
        
        localStorage.setItem('blogUpdateBroadcast', JSON.stringify(event));
        
        // Clean up the broadcast message after a short delay
        setTimeout(() => {
            localStorage.removeItem('blogUpdateBroadcast');
        }, 1000);
    }
}

// Initialize the blog data manager
const blogDataManager = new BlogDataManager();

// Make it globally available
if (typeof window !== 'undefined') {
    window.BlogDataManager = BlogDataManager;
    window.blogDataManager = blogDataManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogDataManager;
}
