/**
 * Scheduled Posts Dark Theme
 * This script handles the scheduled posts list functionality with dark theme integration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the scheduled posts list
    initScheduledPostsList();
    
    /**
     * Initialize the scheduled posts list
     */
    function initScheduledPostsList() {
        // Find the schedule post container in the dashboard
        const schedulePostSection = document.querySelector('.schedule-post-container, #schedule-post-container');
        
        if (!schedulePostSection) {
            // Create a new schedule post container
            createScheduledPostsUI();
        }
    }
    
    /**
     * Load real scheduled posts from AI automation and localStorage
     */
    function loadRealScheduledPosts() {
        const posts = [];
        
        // Load AI automation paths
        try {
            const aiPathsData = localStorage.getItem('fooodis-ai-automation-paths') || 
                localStorage.getItem('aiAutomationPaths') || '[]';
            const aiPaths = JSON.parse(aiPathsData);
            
            aiPaths.forEach(path => {
                const isActive = path.active === true || path.active === 'true' || path.status === 'active';
                
                if (isActive && path.schedule && path.schedule.time) {
                    const [hours, minutes] = path.schedule.time.split(':').map(Number);
                    const nextRun = new Date();
                    nextRun.setHours(hours, minutes, 0, 0);
                    
                    if (nextRun <= new Date()) {
                        nextRun.setDate(nextRun.getDate() + 1);
                    }
                    
                    posts.push({
                        id: `ai-${path.id || path.name}`,
                        title: `AI: ${path.name}`,
                        status: 'ai-generated',
                        date: nextRun.toLocaleDateString('en-US', { 
                            weekday: 'short', month: 'short', day: 'numeric', 
                            year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        }),
                        category: path.category || path.categories?.[0] || 'AI Generated',
                        excerpt: `Automated ${path.contentType || 'content'} - ${path.schedule.type || 'daily'} at ${path.schedule.time}`
                    });
                }
            });
        } catch (e) {
            console.error('Error loading AI automation paths:', e);
        }
        
        // Show message if no posts
        if (posts.length === 0) {
            posts.push({
                id: 'empty',
                title: 'No scheduled posts',
                status: 'info',
                date: '',
                category: '',
                excerpt: 'Create a new automation path or schedule a post manually'
            });
        }
        
        return posts;
    }
    
    /**
     * Create the scheduled posts UI
     */
    function createScheduledPostsUI() {
        // Find the target container (either in the schedule modal or in the dashboard)
        const targetContainer = document.querySelector('#schedulePostModal .modal-body') || 
                               document.querySelector('#scheduled-posts-section .scheduled-posts-panel');
        
        if (!targetContainer) return;
        
        // Create the schedule post container
        const schedulePostContainer = document.createElement('div');
        schedulePostContainer.className = 'schedule-post-container';
        schedulePostContainer.id = 'schedule-post-container';
        
        // Create the header
        const header = document.createElement('div');
        header.className = 'schedule-post-header';
        header.innerHTML = `
            <i class="fas fa-calendar-alt schedule-post-icon"></i>
            <h3 class="schedule-post-title">Schedule Post</h3>
            <div class="schedule-toggle">
                <span class="toggle-label">Enable scheduling</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="enableSchedulingToggle" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `;
        
        // Create the inputs section
        const inputsSection = document.createElement('div');
        inputsSection.className = 'schedule-inputs';
        inputsSection.innerHTML = `
            <div class="schedule-input-group">
                <label class="schedule-input-label" for="scheduleDateInput">Date</label>
                <input type="date" id="scheduleDateInput" class="schedule-input" value="${getCurrentDate()}">
            </div>
            <div class="schedule-input-group">
                <label class="schedule-input-label" for="scheduleTimeInput">Time</label>
                <input type="time" id="scheduleTimeInput" class="schedule-input" value="${getCurrentTime()}">
            </div>
        `;
        
        // Create the calendar
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        calendarContainer.innerHTML = `
            <div class="calendar-nav">
                <div class="calendar-nav-buttons">
                    <button class="calendar-nav-button prev-month-btn" title="Previous month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="calendar-today-button" title="Today">today</button>
                    <button class="calendar-nav-button next-month-btn" title="Next month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-month-title">May 2025</div>
                <div class="calendar-view-options">
                    <button class="calendar-view-option active" data-view="month">month</button>
                    <button class="calendar-view-option" data-view="week">week</button>
                    <button class="calendar-view-option" data-view="list">list</button>
                </div>
            </div>
            
            <table class="calendar-grid">
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="other-month">27</td>
                        <td class="other-month">28</td>
                        <td class="other-month">29</td>
                        <td class="other-month">30</td>
                        <td>1</td>
                        <td class="today">2</td>
                        <td>3</td>
                    </tr>
                    <tr>
                        <td class="has-event">4</td>
                        <td>5</td>
                        <td>6</td>
                        <td class="has-event">7</td>
                        <td>8</td>
                        <td class="has-event">9</td>
                        <td>10</td>
                    </tr>
                    <tr>
                        <td>11</td>
                        <td>12</td>
                        <td>13</td>
                        <td>14</td>
                        <td>15</td>
                        <td>16</td>
                        <td>17</td>
                    </tr>
                    <tr>
                        <td>18</td>
                        <td>19</td>
                        <td>20</td>
                        <td>21</td>
                        <td>22</td>
                        <td>23</td>
                        <td>24</td>
                    </tr>
                    <tr>
                        <td>25</td>
                        <td>26</td>
                        <td>27</td>
                        <td>28</td>
                        <td>29</td>
                        <td>30</td>
                        <td>31</td>
                    </tr>
                    <tr>
                        <td class="other-month">1</td>
                        <td class="other-month">2</td>
                        <td class="other-month">3</td>
                        <td class="other-month">4</td>
                        <td class="other-month">5</td>
                        <td class="other-month">6</td>
                        <td class="other-month">7</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        // Create the scheduled posts list
        const scheduledPostsList = document.createElement('div');
        scheduledPostsList.className = 'scheduled-posts-list';
        
        // Add the scheduled posts title
        const scheduledPostsTitle = document.createElement('h3');
        scheduledPostsTitle.className = 'scheduled-posts-title';
        scheduledPostsTitle.textContent = 'Scheduled Posts';
        
        // Load real scheduled posts from AI automation and API
        const realPosts = loadRealScheduledPosts();
        
        // Create the scheduled post items
        realPosts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'scheduled-post-item';
            postItem.innerHTML = `
                <div class="scheduled-post-item-header">
                    <h4 class="scheduled-post-item-title">${post.title}</h4>
                    <span class="scheduled-post-item-status status-${post.status}">${capitalizeFirstLetter(post.status)}</span>
                </div>
                <div class="scheduled-post-item-content">
                    <div class="scheduled-post-item-meta">
                        <div class="scheduled-post-item-date">
                            <i class="far fa-calendar-alt"></i> ${post.date}
                        </div>
                        <div class="scheduled-post-item-category">
                            <i class="fas fa-tag"></i> ${post.category}
                        </div>
                        <p class="scheduled-post-item-excerpt">${post.excerpt}</p>
                    </div>
                    <div class="scheduled-post-item-actions">
                        <button class="scheduled-post-item-action edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="scheduled-post-item-action delete" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            
            scheduledPostsList.appendChild(postItem);
        });
        
        // Append all elements to the container
        schedulePostContainer.appendChild(header);
        schedulePostContainer.appendChild(inputsSection);
        schedulePostContainer.appendChild(calendarContainer);
        schedulePostContainer.appendChild(scheduledPostsTitle);
        schedulePostContainer.appendChild(scheduledPostsList);
        
        // Append the container to the target
        targetContainer.appendChild(schedulePostContainer);
        
        // Add event listeners
        addEventListeners(schedulePostContainer);
    }
    
    /**
     * Add event listeners to the scheduled posts UI
     */
    function addEventListeners(container) {
        // Toggle switch
        const enableSchedulingToggle = container.querySelector('#enableSchedulingToggle');
        const inputsSection = container.querySelector('.schedule-inputs');
        const calendarContainer = container.querySelector('.calendar-container');
        
        if (enableSchedulingToggle) {
            enableSchedulingToggle.addEventListener('change', function() {
                if (this.checked) {
                    inputsSection.style.opacity = '1';
                    inputsSection.style.pointerEvents = 'auto';
                    calendarContainer.style.opacity = '1';
                    calendarContainer.style.pointerEvents = 'auto';
                } else {
                    inputsSection.style.opacity = '0.5';
                    inputsSection.style.pointerEvents = 'none';
                    calendarContainer.style.opacity = '0.5';
                    calendarContainer.style.pointerEvents = 'none';
                }
            });
        }
        
        // Calendar navigation
        const prevMonthBtn = container.querySelector('.prev-month-btn');
        const nextMonthBtn = container.querySelector('.next-month-btn');
        const todayBtn = container.querySelector('.calendar-today-button');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function() {
                showNotification('Previous month selected', 'info');
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function() {
                showNotification('Next month selected', 'info');
            });
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', function() {
                showNotification('Today selected', 'info');
            });
        }
        
        // Calendar view options
        const viewOptions = container.querySelectorAll('.calendar-view-option');
        viewOptions.forEach(option => {
            option.addEventListener('click', function() {
                viewOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.dataset.view;
                showNotification(`${view} view selected`, 'info');
            });
        });
        
        // Calendar day selection
        const calendarDays = container.querySelectorAll('.calendar-grid td');
        calendarDays.forEach(day => {
            day.addEventListener('click', function() {
                calendarDays.forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');
                
                const dayText = this.textContent.trim();
                showNotification(`Selected day: ${dayText}`, 'info');
            });
        });
        
        // Post actions
        const editButtons = container.querySelectorAll('.scheduled-post-item-action.edit');
        const deleteButtons = container.querySelectorAll('.scheduled-post-item-action.delete');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postItem = this.closest('.scheduled-post-item');
                const postTitle = postItem.querySelector('.scheduled-post-item-title').textContent;
                showNotification(`Editing post: ${postTitle}`, 'info');
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postItem = this.closest('.scheduled-post-item');
                const postTitle = postItem.querySelector('.scheduled-post-item-title').textContent;
                
                // Confirm delete
                if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
                    postItem.remove();
                    showNotification(`Post deleted: ${postTitle}`, 'success');
                }
            });
        });
    }
    
    /**
     * Get the current date in YYYY-MM-DD format
     */
    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Get the current time in HH:MM format
     */
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }
    
    /**
     * Capitalize the first letter of a string
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Show notification message
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
