/**
 * Scheduled Posts Manager
 * Central manager for scheduled posts with D1 backend integration
 * 
 * Integrates with:
 * - AI Content Automation (receives scheduled AI posts)
 * - Create New Blog Post (schedule when creating)
 * - Manage Blog Posts (view scheduled status)
 */

class ScheduledPostsManager {
    constructor() {
        this.posts = [];
        this.calendar = null;
        this.checkInterval = null;
        this.initialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.initialized) return;
        console.log('ScheduledPostsManager: Initializing...');
        
        // Load posts from API
        await this.loadPosts();
        
        // Setup UI
        this.setupUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start periodic check for due posts
        this.startPeriodicCheck();
        
        // Listen for events from other sections
        this.setupCrossModuleListeners();
        
        this.initialized = true;
        console.log('ScheduledPostsManager: Initialized');
    }
    
    /**
     * Load scheduled posts from D1 API and AI automation paths
     */
    async loadPosts() {
        this.posts = [];
        
        // Load scheduled posts from API
        try {
            const response = await fetch('/api/scheduled-posts');
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
                console.log(`ScheduledPostsManager: Loaded ${this.posts.length} scheduled posts`);
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error loading scheduled posts', error);
        }
        
        // Also load AI automation paths
        try {
            const response = await fetch('/api/automation/paths');
            if (response.ok) {
                const aiPaths = await response.json();
                console.log(`ScheduledPostsManager: Loaded ${aiPaths.length} AI automation paths`);
                
                aiPaths.forEach(path => {
                    if (path.status === 'active' && path.schedule_time) {
                        const [hours, minutes] = path.schedule_time.split(':').map(Number);
                        const nextRun = new Date();
                        nextRun.setHours(hours, minutes, 0, 0);
                        
                        if (nextRun <= new Date()) {
                            nextRun.setDate(nextRun.getDate() + 1);
                        }
                        
                        this.posts.push({
                            id: `ai-${path.id}`,
                            title: `AI: ${path.name}`,
                            status: 'pending',
                            source: 'ai_automation',
                            scheduled_datetime: nextRun.toISOString(),
                            scheduled_date: nextRun.toISOString(),
                            category: path.category || 'AI Generated',
                            excerpt: `Automated ${path.content_type || 'content'} - ${path.schedule_type || 'daily'} at ${path.schedule_time}`
                        });
                    }
                });
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error loading AI automation paths', error);
        }
        
        console.log(`ScheduledPostsManager: Total ${this.posts.length} posts`);
        
        // Render UI
        this.renderPosts();
        this.updateCalendar();
        
        // Sync to localStorage for offline/fallback
        try {
            localStorage.setItem('fooodis-scheduled-posts', JSON.stringify(this.posts));
        } catch (e) {
            console.warn('Could not save to localStorage');
        }
        
        return this.posts;
    }
    
    /**
     * Fallback load from localStorage (kept for backward compatibility)
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('fooodis-scheduled-posts');
            if (saved) {
                this.posts = JSON.parse(saved);
                console.log(`ScheduledPostsManager: Loaded ${this.posts.length} posts from localStorage`);
            }
        } catch (e) {
            this.posts = [];
        }
        
        return this.posts;
    }
    
    /**
     * Schedule a new post
     * @param {Object} postData - Post data including scheduled_datetime
     * @param {string} source - Source: 'manual', 'ai_automation', 'api'
     */
    async schedulePost(postData, source = 'manual') {
        console.log('ScheduledPostsManager: Scheduling post', postData.title);
        
        try {
            const response = await fetch('/api/scheduled-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...postData,
                    source
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Add to local array
                this.posts.push(result.post);
                
                // Update localStorage
                localStorage.setItem('fooodis-scheduled-posts', JSON.stringify(this.posts));
                
                // Update UI
                this.renderPosts();
                this.updateCalendar();
                
                // Dispatch event for other modules
                document.dispatchEvent(new CustomEvent('scheduledPostCreated', {
                    detail: { post: result.post, source }
                }));
                
                return result.post;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to schedule post');
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error scheduling post', error);
            this.showNotification(error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Update a scheduled post
     */
    async updatePost(postId, updates) {
        console.log('ScheduledPostsManager: Updating post', postId);
        
        try {
            const response = await fetch(`/api/scheduled-posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.posts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    this.posts[index] = result.post;
                }
                
                localStorage.setItem('fooodis-scheduled-posts', JSON.stringify(this.posts));
                
                this.renderPosts();
                this.updateCalendar();
                
                document.dispatchEvent(new CustomEvent('scheduledPostUpdated', {
                    detail: { post: result.post }
                }));
                
                return result.post;
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error updating post', error);
            throw error;
        }
    }
    
    /**
     * Cancel/delete a scheduled post
     */
    async cancelPost(postId) {
        console.log('ScheduledPostsManager: Cancelling post', postId);
        
        try {
            const response = await fetch(`/api/scheduled-posts/${postId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                this.posts = this.posts.filter(p => p.id !== postId);
                localStorage.setItem('fooodis-scheduled-posts', JSON.stringify(this.posts));
                
                this.renderPosts();
                this.updateCalendar();
                
                document.dispatchEvent(new CustomEvent('scheduledPostCancelled', {
                    detail: { postId }
                }));
                
                this.showNotification('Scheduled post cancelled', 'success');
                return true;
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error cancelling post', error);
            throw error;
        }
    }
    
    /**
     * Manually publish a scheduled post
     */
    async publishPost(postId) {
        console.log('ScheduledPostsManager: Publishing post', postId);
        
        try {
            const response = await fetch(`/api/scheduled-posts/${postId}/publish`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.posts.findIndex(p => p.id === postId);
                if (index !== -1) {
                    this.posts[index].status = 'published';
                    this.posts[index].published_post_id = result.blog_post_id;
                }
                
                localStorage.setItem('fooodis-scheduled-posts', JSON.stringify(this.posts));
                
                this.renderPosts();
                this.updateCalendar();
                
                // Dispatch events for other modules
                document.dispatchEvent(new CustomEvent('scheduledPostPublished', {
                    detail: { 
                        scheduledPostId: postId,
                        blogPostId: result.blog_post_id,
                        title: result.title
                    }
                }));
                
                // Also dispatch blogPostsUpdated for BlogDataManager
                document.dispatchEvent(new CustomEvent('blogPostsUpdated'));
                
                this.showNotification(`Post "${result.title}" published successfully!`, 'success');
                return result;
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error publishing post', error);
            this.showNotification('Failed to publish post: ' + error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Check for due posts and publish them
     */
    async checkDuePosts() {
        try {
            const response = await fetch('/api/scheduled-posts/check', {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.published > 0) {
                    console.log(`ScheduledPostsManager: Published ${result.published} posts`);
                    
                    // Reload posts
                    await this.loadPosts();
                    
                    // Notify
                    this.showNotification(`${result.published} scheduled post(s) published`, 'success');
                    
                    // Trigger blog refresh
                    document.dispatchEvent(new CustomEvent('blogPostsUpdated'));
                }
                
                return result;
            }
        } catch (error) {
            console.error('ScheduledPostsManager: Error checking due posts', error);
        }
    }
    
    /**
     * Start periodic check for due posts
     */
    startPeriodicCheck() {
        // Check every minute
        this.checkInterval = setInterval(() => {
            this.checkDuePosts();
        }, 60000);
        
        // Also check immediately
        this.checkDuePosts();
    }
    
    /**
     * Setup UI components
     */
    setupUI() {
        // Initialize calendar if container exists
        const calendarContainer = document.getElementById('calendarContainer');
        if (calendarContainer && typeof FullCalendar !== 'undefined') {
            this.initCalendar(calendarContainer);
        }
        
        // Render posts list
        this.renderPosts();
    }
    
    /**
     * Initialize FullCalendar
     */
    initCalendar(container) {
        if (this.calendar) {
            this.calendar.destroy();
        }
        
        this.calendar = new FullCalendar.Calendar(container, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            selectable: true,
            events: this.getCalendarEvents(),
            eventClick: (info) => {
                const post = this.posts.find(p => p.id === info.event.id);
                if (post) {
                    this.showPostDetails(post);
                }
            },
            dateClick: (info) => {
                // Open schedule form with selected date
                this.openScheduleForm(info.dateStr);
            }
        });
        
        this.calendar.render();
    }
    
    /**
     * Update calendar events
     */
    updateCalendar() {
        if (!this.calendar) return;
        
        this.calendar.removeAllEvents();
        this.getCalendarEvents().forEach(event => {
            this.calendar.addEvent(event);
        });
    }
    
    /**
     * Get calendar events from posts
     */
    getCalendarEvents() {
        return this.posts
            .filter(post => post.status === 'pending')
            .map(post => ({
                id: post.id,
                title: post.title,
                start: post.scheduled_date || new Date(post.scheduled_datetime).toISOString(),
                backgroundColor: this.getSourceColor(post.source),
                borderColor: this.getSourceColor(post.source),
                textColor: '#1e1e24',
                extendedProps: {
                    source: post.source,
                    category: post.category
                }
            }));
    }
    
    /**
     * Get color based on source
     */
    getSourceColor(source) {
        const colors = {
            'manual': '#cce62a',
            'ai_automation': '#478ac9',
            'api': '#9b59b6',
            'import': '#e67e22'
        };
        return colors[source] || '#cce62a';
    }
    
    /**
     * Render scheduled posts list
     */
    renderPosts() {
        const container = document.getElementById('scheduledPostsList');
        if (!container) return;
        
        // Get filter value
        const filterSelect = document.getElementById('filterScheduledPosts');
        const filterValue = filterSelect ? filterSelect.value : 'all';
        
        // Filter posts
        let filteredPosts = this.posts.filter(p => p.status === 'pending');
        
        if (filterValue === 'ai-generated') {
            filteredPosts = filteredPosts.filter(p => p.source === 'ai_automation');
        } else if (filterValue === 'scheduled') {
            filteredPosts = filteredPosts.filter(p => p.source === 'manual');
        } else if (filterValue === 'draft') {
            filteredPosts = filteredPosts.filter(p => !p.scheduled_datetime);
        }
        
        // Sort by scheduled date
        filteredPosts.sort((a, b) => {
            const dateA = a.scheduled_datetime || 0;
            const dateB = b.scheduled_datetime || 0;
            return dateA - dateB;
        });
        
        if (filteredPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No scheduled posts</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredPosts.map(post => this.createPostCard(post)).join('');
        
        // Add event listeners
        container.querySelectorAll('.scheduled-post-card').forEach(card => {
            const postId = card.dataset.postId;
            
            card.querySelector('.edit-btn')?.addEventListener('click', () => this.editPost(postId));
            card.querySelector('.publish-btn')?.addEventListener('click', () => this.publishPost(postId));
            card.querySelector('.cancel-btn')?.addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel this scheduled post?')) {
                    this.cancelPost(postId);
                }
            });
        });
    }
    
    /**
     * Create post card HTML
     */
    createPostCard(post) {
        const scheduledDate = post.scheduled_date 
            ? new Date(post.scheduled_date) 
            : new Date(post.scheduled_datetime);
        
        const isPast = scheduledDate < new Date();
        const sourceLabel = {
            'manual': 'Manual',
            'ai_automation': 'AI Generated',
            'api': 'API',
            'import': 'Imported'
        }[post.source] || post.source;
        
        return `
            <div class="scheduled-post-card ${isPast ? 'overdue' : ''}" data-post-id="${post.id}">
                <div class="post-card-header">
                    <span class="post-source ${post.source}">${sourceLabel}</span>
                    <span class="post-category">${post.category || 'Uncategorized'}</span>
                </div>
                <h4 class="post-title">${post.title}</h4>
                <div class="post-schedule">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${scheduledDate.toLocaleDateString()}</span>
                    <i class="fas fa-clock"></i>
                    <span>${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ${isPast ? '<span class="overdue-badge">Overdue</span>' : ''}
                </div>
                ${post.automation_path_name ? `
                    <div class="post-automation">
                        <i class="fas fa-robot"></i>
                        <span>${post.automation_path_name}</span>
                    </div>
                ` : ''}
                <div class="post-actions">
                    <button class="btn btn-sm edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-primary publish-btn" title="Publish Now">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-sm btn-danger cancel-btn" title="Cancel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Edit a scheduled post
     */
    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        // Navigate to Create Post section with data
        const navItem = document.querySelector('[data-section="create-post"]');
        if (navItem) navItem.click();
        
        // Fill form
        setTimeout(() => {
            document.getElementById('postTitle').value = post.title || '';
            document.getElementById('postContent').value = post.content || '';
            document.getElementById('postExcerpt').value = post.excerpt || '';
            document.getElementById('postCategory').value = post.category || '';
            
            // Enable scheduling
            const scheduleToggle = document.getElementById('scheduleToggle');
            if (scheduleToggle) {
                scheduleToggle.checked = true;
                const schedulerContent = document.querySelector('.scheduler-content');
                if (schedulerContent) schedulerContent.style.display = 'block';
            }
            
            // Set date/time
            const scheduledDate = new Date(post.scheduled_datetime || post.scheduled_date);
            const dateInput = document.getElementById('scheduledDate');
            const timeInput = document.getElementById('scheduledTime');
            
            if (dateInput) dateInput.value = scheduledDate.toISOString().split('T')[0];
            if (timeInput) {
                const hours = String(scheduledDate.getHours()).padStart(2, '0');
                const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
                timeInput.value = `${hours}:${minutes}`;
            }
            
            // Store editing ID
            const postForm = document.getElementById('postForm');
            if (postForm) postForm.dataset.scheduledPostId = postId;
        }, 100);
    }
    
    /**
     * Show post details modal
     */
    showPostDetails(post) {
        // Could open a modal with full details
        console.log('Show post details:', post);
    }
    
    /**
     * Open schedule form for a specific date
     */
    openScheduleForm(dateStr) {
        // Navigate to create post and set date
        const navItem = document.querySelector('[data-section="create-post"]');
        if (navItem) navItem.click();
        
        setTimeout(() => {
            const scheduleToggle = document.getElementById('scheduleToggle');
            if (scheduleToggle) {
                scheduleToggle.checked = true;
                const schedulerContent = document.querySelector('.scheduler-content');
                if (schedulerContent) schedulerContent.style.display = 'block';
            }
            
            const dateInput = document.getElementById('scheduledDate');
            if (dateInput) dateInput.value = dateStr;
        }, 100);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter change
        const filterSelect = document.getElementById('filterScheduledPosts');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.renderPosts());
        }
    }
    
    /**
     * Setup listeners for events from other modules
     */
    setupCrossModuleListeners() {
        // Listen for AI automation creating scheduled posts
        document.addEventListener('aiPostScheduled', async (e) => {
            console.log('ScheduledPostsManager: AI post scheduled', e.detail);
            await this.loadPosts();
        });
        
        // Listen for manual post scheduling from Create New Post
        document.addEventListener('postScheduled', async (e) => {
            console.log('ScheduledPostsManager: Post scheduled', e.detail);
            await this.loadPosts();
        });
        
        // Listen for blog posts updates to refresh if needed
        document.addEventListener('blogPostsUpdated', () => {
            // Remove published posts from our list
            this.posts = this.posts.filter(p => p.status !== 'published');
            this.renderPosts();
            this.updateCalendar();
        });
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.calendar) {
            this.calendar.destroy();
        }
    }
}

// Initialize and expose globally
window.scheduledPostsManager = new ScheduledPostsManager();
window.ScheduledPostsManager = ScheduledPostsManager;
