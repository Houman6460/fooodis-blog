
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
    
    async createPost(postData) {
        console.log('Blog Data Manager: Creating post', postData.title);
        console.log('Blog Data Manager: Post data:', JSON.stringify(postData).substring(0, 500));
        try {
            const response = await fetch('/api/blog/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            
            console.log('Blog Data Manager: API response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Blog Data Manager: API returned post ID:', result.post?.id);
                const newPost = result.post;
                
                // Update local storage
                const posts = this.getAllPosts();
                posts.unshift(newPost);
                this.savePosts(posts);
                
                return newPost;
            } else {
                console.error('Failed to create post on backend');
                throw new Error('Backend creation failed');
            }
        } catch (e) {
            console.error('Blog Data Manager: Error creating post', e);
            // Fallback: save locally with temporary ID
            const newPost = { ...postData, id: postData.id || Date.now().toString() };
            const posts = this.getAllPosts();
            posts.unshift(newPost);
            this.savePosts(posts);
            return newPost;
        }
    }
    
    async updatePost(postData) {
        console.log('Blog Data Manager: Updating post', postData.id);
        try {
            const response = await fetch(`/api/blog/posts/${postData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            
            if (response.ok) {
                // Update local storage
                const posts = this.getAllPosts();
                const index = posts.findIndex(p => p.id === postData.id);
                if (index !== -1) {
                    posts[index] = postData;
                    this.savePosts(posts);
                }
                return postData;
            } else {
                 console.error('Failed to update post on backend');
                 throw new Error('Backend update failed');
            }
        } catch (e) {
            console.error('Blog Data Manager: Error updating post', e);
            // Fallback: save locally
            const posts = this.getAllPosts();
            const index = posts.findIndex(p => p.id === postData.id);
            if (index !== -1) {
                posts[index] = postData;
                this.savePosts(posts);
            }
            return postData;
        }
    }
    
    async deletePost(postId) {
        console.log('Blog Data Manager: Deleting post', postId);
        
        // Normalize ID so we handle string/number mismatches consistently
        const normalizedId = String(postId);
        
        // Optimistic update (local)
        const posts = this.getAllPosts();
        const filteredPosts = posts.filter(post => String(post.id) !== normalizedId);
        
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
    
    /**
     * Fetch posts with filters for Manage Blog Posts section
     * @param {Object} options - Filter options
     * @param {string} options.search - Search term
     * @param {string} options.category - Category filter
     * @param {string} options.status - Status filter (published, draft, scheduled)
     * @param {boolean} options.featured - Featured filter
     * @param {string} options.sort - Sort field
     * @param {string} options.order - Sort order (asc, desc)
     * @param {number} options.limit - Results limit
     * @param {number} options.offset - Pagination offset
     */
    async fetchPostsFiltered(options = {}) {
        console.log('Blog Data Manager: Fetching posts with filters', options);
        
        try {
            const params = new URLSearchParams();
            
            if (options.search) params.append('search', options.search);
            if (options.category) params.append('category', options.category);
            if (options.status) params.append('status', options.status);
            if (options.featured !== undefined) params.append('featured', options.featured);
            if (options.sort) params.append('sort', options.sort);
            if (options.order) params.append('order', options.order);
            if (options.limit) params.append('limit', options.limit);
            if (options.offset) params.append('offset', options.offset);
            
            const url = `/api/blog/posts${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                // New API returns { posts, pagination }
                const posts = data.posts || data;
                
                // Update local storage
                if (!options.search && !options.category && !options.status && options.featured === undefined) {
                    // Only update localStorage if fetching all posts
                    localStorage.setItem(this.storageKey, JSON.stringify(posts));
                }
                
                return {
                    posts,
                    pagination: data.pagination || { total: posts.length }
                };
            }
        } catch (e) {
            console.error('Blog Data Manager: Error fetching filtered posts', e);
        }
        
        // Fallback to local filtering
        let posts = this.getAllPosts();
        
        if (options.search) {
            const term = options.search.toLowerCase();
            posts = posts.filter(p => 
                p.title?.toLowerCase().includes(term) || 
                p.content?.toLowerCase().includes(term) ||
                p.excerpt?.toLowerCase().includes(term)
            );
        }
        if (options.category) {
            posts = posts.filter(p => p.category === options.category);
        }
        if (options.status) {
            posts = posts.filter(p => p.status === options.status);
        }
        if (options.featured !== undefined) {
            posts = posts.filter(p => !!p.featured === options.featured);
        }
        
        return { posts, pagination: { total: posts.length } };
    }
    
    /**
     * Toggle featured status for a post
     */
    async toggleFeatured(postId) {
        console.log('Blog Data Manager: Toggling featured for post', postId);
        
        try {
            const response = await fetch(`/api/blog/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toggle: 'featured' })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local storage
                const posts = this.getAllPosts();
                const index = posts.findIndex(p => String(p.id) === String(postId));
                if (index !== -1) {
                    posts[index].featured = result.featured;
                    this.savePosts(posts);
                }
                
                return result;
            }
        } catch (e) {
            console.error('Blog Data Manager: Error toggling featured', e);
        }
        
        // Fallback: toggle locally
        const posts = this.getAllPosts();
        const index = posts.findIndex(p => String(p.id) === String(postId));
        if (index !== -1) {
            posts[index].featured = !posts[index].featured;
            this.savePosts(posts);
            return { success: true, featured: posts[index].featured };
        }
        
        return { success: false };
    }
    
    /**
     * Bulk delete multiple posts
     */
    async bulkDelete(postIds) {
        console.log('Blog Data Manager: Bulk deleting posts', postIds);
        
        if (!postIds || postIds.length === 0) {
            return { success: false, error: 'No post IDs provided' };
        }
        
        try {
            const response = await fetch(`/api/blog/posts?ids=${postIds.join(',')}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local storage
                const posts = this.getAllPosts();
                const filteredPosts = posts.filter(p => !postIds.includes(String(p.id)));
                this.savePosts(filteredPosts);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('blogPostsUpdated', {
                    detail: { posts: filteredPosts }
                }));
                
                return result;
            }
        } catch (e) {
            console.error('Blog Data Manager: Error bulk deleting', e);
        }
        
        // Fallback: delete locally
        const posts = this.getAllPosts();
        const filteredPosts = posts.filter(p => !postIds.includes(String(p.id)));
        this.savePosts(filteredPosts);
        
        return { success: true, deleted: posts.length - filteredPosts.length };
    }
    
    /**
     * Increment view count for a post
     */
    async incrementViews(postId) {
        try {
            await fetch(`/api/blog/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ increment: 'views' })
            });
        } catch (e) {
            console.error('Blog Data Manager: Error incrementing views', e);
        }
    }
    
    /**
     * Increment like count for a post
     */
    async incrementLikes(postId) {
        try {
            const response = await fetch(`/api/blog/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ increment: 'likes' })
            });
            
            if (response.ok) {
                // Update local
                const posts = this.getAllPosts();
                const index = posts.findIndex(p => String(p.id) === String(postId));
                if (index !== -1) {
                    posts[index].likes = (posts[index].likes || 0) + 1;
                    this.savePosts(posts);
                }
                return true;
            }
        } catch (e) {
            console.error('Blog Data Manager: Error incrementing likes', e);
        }
        return false;
    }
    
    /**
     * Get categories from backend
     */
    async getCategories() {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error('Blog Data Manager: Error fetching categories', e);
        }
        
        // Fallback: extract from posts
        const posts = this.getAllPosts();
        const categoryMap = {};
        posts.forEach(p => {
            if (p.category) {
                categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
            }
        });
        return Object.keys(categoryMap).map(name => ({ name, post_count: categoryMap[name] }));
    }
    
    /**
     * Get tags from backend
     */
    async getTags() {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error('Blog Data Manager: Error fetching tags', e);
        }
        
        // Fallback: extract from posts
        const posts = this.getAllPosts();
        const tagSet = new Set();
        posts.forEach(p => {
            if (p.tags && Array.isArray(p.tags)) {
                p.tags.forEach(t => tagSet.add(t));
            }
        });
        return Array.from(tagSet).map(name => ({ name }));
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
        // Prefer the dashboard's own renderer when available to avoid duplicate logic
        if (typeof window !== 'undefined' && typeof window.renderPostsTable === 'function') {
            console.log('Blog Data Manager: Delegating manage posts refresh to dashboard.renderPostsTable');
            window.renderPostsTable();
            return;
        }

        // Fallback: legacy direct rendering if dashboard renderer is not available
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
