/**
 * Post Scheduler for Fooodis Blog System
 * Handles scheduling, calendar integration, and automated publishing
 */

// Initialize the post scheduler
document.addEventListener('DOMContentLoaded', function() {
    initializeScheduler();
});

// Global variables
let scheduledPosts = [];
let currentDate = new Date();
let selectedDate = new Date();
let calendarEl = null;
let calendar = null;

// Initialize the post scheduler
function initializeScheduler() {
    console.log('Initializing post scheduler...');
    
    // Make sure we initialize after StorageManager is available
    if (document.readyState === 'complete') {
        // Document already loaded, initialize now
        initializeSchedulerCore();
    } else {
        // Wait for document to be fully loaded
        window.addEventListener('load', function() {
            // Small delay to ensure StorageManager is initialized
            setTimeout(initializeSchedulerCore, 100);
        });
    }
}

// Core initialization function
function initializeSchedulerCore() {
    // Load scheduled posts
    loadScheduledPosts();
    
    // Create scheduler UI
    createSchedulerUI();
    
    // Initialize calendar
    initializeCalendar();
    
    // Setup event listeners
    setupSchedulerEventListeners();
    
    console.log('Post scheduler initialized successfully');
}

// Load scheduled posts from storage
function loadScheduledPosts() {
    console.log('Loading scheduled posts...');
    
    try {
        // First try direct localStorage for maximum compatibility
        let postsLoaded = false;
        let savedPosts = localStorage.getItem('fooodis-blog-scheduled-posts');
        
        if (savedPosts) {
            try {
                const parsedPosts = JSON.parse(savedPosts);
                if (Array.isArray(parsedPosts)) {
                    scheduledPosts = parsedPosts;
                    postsLoaded = true;
                    console.log('Scheduled posts loaded directly from localStorage:', scheduledPosts.length);
                }
            } catch (parseError) {
                console.error('Error parsing scheduled posts from localStorage:', parseError);
            }
        }
        
        // If direct localStorage didn't work, try StorageManager
        if (!postsLoaded && window.StorageManager && typeof window.StorageManager.load === 'function') {
            const managerPosts = window.StorageManager.load('blog-scheduled-posts', {
                defaultValue: [],
                onSuccess: function(data) {
                    console.log('Scheduled posts loaded successfully via StorageManager');
                },
                onError: function(error) {
                    console.error('Error loading scheduled posts via StorageManager:', error);
                }
            });
            
            if (managerPosts && Array.isArray(managerPosts) && managerPosts.length > 0) {
                scheduledPosts = managerPosts;
                postsLoaded = true;
                console.log('Scheduled posts loaded via StorageManager:', scheduledPosts.length);
                
                // Also save to direct localStorage for redundancy
                try {
                    localStorage.setItem('fooodis-blog-scheduled-posts', JSON.stringify(scheduledPosts));
                    console.log('Scheduled posts also saved to direct localStorage for redundancy');
                } catch (saveError) {
                    console.warn('Could not save posts to direct localStorage:', saveError);
                }
            }
        }
        
        // Convert date strings back to Date objects if we loaded posts
        if (postsLoaded && scheduledPosts.length > 0) {
            scheduledPosts.forEach(post => {
                if (post.scheduledDate && typeof post.scheduledDate === 'string') {
                    post.scheduledDate = new Date(post.scheduledDate);
                }
            });
        } else if (!postsLoaded) {
            console.warn('No scheduled posts found in any storage');
            scheduledPosts = [];
        }
        
        // Log the final result
        console.log('Final scheduled posts after loading:', scheduledPosts);
    } catch (error) {
        console.error('Unexpected error loading scheduled posts:', error);
        scheduledPosts = [];
    }
}

// Save scheduled posts to storage
function saveScheduledPosts() {
    console.log('Saving scheduled posts:', scheduledPosts.length);
    
    let savedSuccessfully = false;
    
    // Always try to save to direct localStorage first for maximum compatibility
    try {
        localStorage.setItem('fooodis-blog-scheduled-posts', JSON.stringify(scheduledPosts));
        console.log('Scheduled posts saved directly to localStorage');
        savedSuccessfully = true;
    } catch (error) {
        console.error('Error saving scheduled posts to localStorage:', error);
    }
    
    // Also try to save using StorageManager if available
    if (window.StorageManager && typeof window.StorageManager.save === 'function') {
        try {
            const saved = window.StorageManager.save('blog-scheduled-posts', scheduledPosts, {
                compress: scheduledPosts.length > 10,  // Compress if we have many posts
                onSuccess: function() {
                    console.log('Scheduled posts also saved successfully via StorageManager');
                },
                onError: function(error, status) {
                    console.error('Error saving scheduled posts via StorageManager:', error, status);
                }
            });
            
            if (saved) {
                savedSuccessfully = true;
            }
        } catch (storageError) {
            console.error('Unexpected error using StorageManager:', storageError);
        }
    }
    
    // If we're in a dashboard context, update any UI elements
    if (savedSuccessfully) {
        // Show success message if we have a status element
        const statusElement = document.getElementById('schedulerStatus');
        if (statusElement) {
            statusElement.textContent = 'Posts saved successfully!';
            statusElement.className = 'success-message';
            
            // Clear the message after a few seconds
            setTimeout(function() {
                statusElement.textContent = '';
                statusElement.className = '';
            }, 3000);
        }
    }
    
    return savedSuccessfully;
}

// Create scheduler UI
function createSchedulerUI() {
    const postForm = document.getElementById('postForm');
    if (!postForm) return;
    
    // Check if scheduler section already exists
    if (document.getElementById('post-scheduler-section')) return;
    
    // Create scheduler section
    const schedulerSection = document.createElement('div');
    schedulerSection.id = 'post-scheduler-section';
    schedulerSection.className = 'form-group';
    
    schedulerSection.innerHTML = `
        <div class="scheduler-header">
            <h3><i class="fas fa-calendar-alt"></i> Schedule Post</h3>
            <div class="scheduler-toggle">
                <label class="switch">
                    <input type="checkbox" id="scheduleToggle">
                    <span class="slider round"></span>
                </label>
                <span>Enable scheduling</span>
            </div>
        </div>
        
        <div class="scheduler-content" style="display: none;">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="scheduledDate">Date</label>
                        <input type="date" id="scheduledDate" class="form-control" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="scheduledTime">Time</label>
                        <input type="time" id="scheduledTime" class="form-control">
                    </div>
                </div>
            </div>
            
            <div class="calendar-container">
                <div id="scheduler-calendar"></div>
            </div>
            
            <div class="scheduled-posts-list">
                <h4>Scheduled Posts</h4>
                <div id="scheduledPostsList"></div>
            </div>
        </div>
    `;
    
    // Just append to the form instead of trying to insert at a specific position
    postForm.appendChild(schedulerSection);
    
    // Add CSS for scheduler
    const style = document.createElement('style');
    style.textContent = `
        #post-scheduler-section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            background-color: #f9f9f9;
        }
        
        .scheduler-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .scheduler-header h3 {
            margin: 0;
            font-size: 18px;
            display: flex;
            align-items: center;
        }
        
        .scheduler-header h3 i {
            margin-right: 10px;
            color: #007bff;
        }
        
        .scheduler-toggle {
            display: flex;
            align-items: center;
        }
        
        .scheduler-toggle span {
            margin-left: 10px;
        }
        
        /* Switch styles */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: #cce62a;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .slider.round {
            border-radius: 24px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
        
        .calendar-container {
            margin: 20px 0;
            height: 400px;
        }
        
        #scheduler-calendar {
            height: 100%;
        }
        
        .scheduled-posts-list {
            margin-top: 20px;
        }
        
        .scheduled-posts-list h4 {
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .scheduled-post-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
            background-color: #fff;
        }
        
        .scheduled-post-info {
            flex: 1;
        }
        
        .scheduled-post-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .scheduled-post-date {
            font-size: 12px;
            color: #666;
        }
        
        .scheduled-post-actions button {
            margin-left: 5px;
        }
        
        /* Dark mode styles */
        body.dark-mode #post-scheduler-section {
            background-color: #252530;
            border-color: #333340;
            color: #e0e0e0;
        }
        
        body.dark-mode .scheduler-header h3 i {
            color: #cce62a;
        }
        
        body.dark-mode .scheduled-post-item {
            background-color: #1e1e24;
            border-color: #333340;
            color: #e0e0e0;
        }
        
        body.dark-mode .scheduled-post-date {
            color: #a0a0a0;
        }
        
        body.dark-mode input[type="date"],
        body.dark-mode input[type="time"] {
            background-color: #1e1e24;
            border-color: #333340;
            color: #e0e0e0;
        }
        
        body.dark-mode .fc-theme-standard .fc-scrollgrid,
        body.dark-mode .fc-theme-standard td,
        body.dark-mode .fc-theme-standard th {
            border-color: #333340;
        }
        
        body.dark-mode .fc-theme-standard .fc-list-day-cushion {
            background-color: #252530;
        }
        
        body.dark-mode .fc .fc-daygrid-day.fc-day-today {
            background-color: rgba(204, 230, 42, 0.1);
        }
        
        body.dark-mode .fc-event {
            background-color: #cce62a;
            border-color: #cce62a;
            color: #1e1e24;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize calendar
function initializeCalendar() {
    // Check if FullCalendar script is loaded
    if (typeof FullCalendar === 'undefined') {
        // Load FullCalendar script and CSS
        loadFullCalendarDependencies();
        return;
    }
    
    calendarEl = document.getElementById('scheduler-calendar');
    if (!calendarEl) return;
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        events: getCalendarEvents(),
        select: function(info) {
            // Set the selected date in the date input
            const dateInput = document.getElementById('scheduledDate');
            if (dateInput) {
                dateInput.value = info.startStr;
                selectedDate = info.start;
            }
            calendar.unselect();
        },
        eventClick: function(info) {
            // Find the post
            const postId = info.event.id;
            const post = scheduledPosts.find(p => p.id === postId);
            
            if (post) {
                // Fill the form with post data
                fillPostForm(post);
                
                // Enable scheduling
                const scheduleToggle = document.getElementById('scheduleToggle');
                if (scheduleToggle) {
                    scheduleToggle.checked = true;
                    toggleSchedulerContent(true);
                }
                
                // Set scheduled date and time
                const dateInput = document.getElementById('scheduledDate');
                const timeInput = document.getElementById('scheduledTime');
                
                if (dateInput && timeInput) {
                    const date = new Date(post.scheduledDate);
                    dateInput.value = date.toISOString().split('T')[0];
                    
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    timeInput.value = `${hours}:${minutes}`;
                }
            }
        }
    });
    
    calendar.render();
}

// Load FullCalendar dependencies
function loadFullCalendarDependencies() {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css';
    document.head.appendChild(link);
    
    // Load JavaScript
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js';
    script.onload = function() {
        initializeCalendar();
    };
    document.head.appendChild(script);
}

// Get calendar events from scheduled posts
function getCalendarEvents() {
    return scheduledPosts.map(post => {
        return {
            id: post.id,
            title: post.title,
            start: post.scheduledDate,
            allDay: false,
            backgroundColor: '#cce62a',
            borderColor: '#cce62a',
            textColor: '#1e1e24'
        };
    });
}

// Setup event listeners for scheduler
function setupSchedulerEventListeners() {
    // Toggle scheduler content
    const scheduleToggle = document.getElementById('scheduleToggle');
    if (scheduleToggle) {
        scheduleToggle.addEventListener('change', function() {
            toggleSchedulerContent(this.checked);
        });
    }
    
    // Save post with scheduling
    const postForm = document.getElementById('postForm');
    if (postForm) {
        const originalSubmitHandler = postForm.onsubmit;
        
        postForm.onsubmit = function(event) {
            event.preventDefault();
            
            // Check if scheduling is enabled
            const scheduleToggle = document.getElementById('scheduleToggle');
            if (scheduleToggle && scheduleToggle.checked) {
                // Get scheduled date and time
                const dateInput = document.getElementById('scheduledDate');
                const timeInput = document.getElementById('scheduledTime');
                
                if (dateInput && timeInput && dateInput.value && timeInput.value) {
                    // Create scheduled date
                    const scheduledDate = new Date(`${dateInput.value}T${timeInput.value}`);
                    // Prevent scheduling in the past
                    const now = new Date();
                    if (scheduledDate <= now) {
                        showNotification('Cannot schedule a post in the past. Please choose a future time.', 'error');
                        return false;
                    }
                    // Add scheduling info to the post
                    const postData = getPostDataFromForm();
                    postData.scheduled = true;
                    postData.scheduledDate = scheduledDate;
                    // Save to scheduled posts
                    saveScheduledPost(postData);
                    // Show success message
                    showNotification('Post scheduled successfully for ' + scheduledDate.toLocaleString(), 'success');
                    // Reset form
                    postForm.reset();
                    // Update calendar
                    updateCalendar();
                    // Render scheduled posts list
                    renderScheduledPosts();
                    return false;
                } else {
                    showNotification('Please select a date and time for scheduling', 'error');
                    return false;
                }
            } else if (originalSubmitHandler) {
                // Call original submit handler
                return originalSubmitHandler.call(this, event);
            }
        };
    }
    
    // Check for posts that need to be published
    checkScheduledPosts();
    
    // Set interval to check scheduled posts every minute
    setInterval(checkScheduledPosts, 60000);
}

// Check for posts that need to be published
function checkScheduledPosts() {
    const now = new Date();
    let changed = false;
    const postsToPublish = scheduledPosts.filter(post => {
        const scheduledDate = new Date(post.scheduledDate);
        return scheduledDate <= now && post.status !== 'published';
    });
    if (postsToPublish.length > 0) {
        postsToPublish.forEach(post => {
            publishScheduledPost(post);
            changed = true;
        });
    }
    // Save scheduledPosts after publishing
    if (changed) {
        saveScheduledPosts();
        showNotification('Automation ran: ' + postsToPublish.length + ' post(s) published.', 'info');
    }
}

// Toggle scheduler content visibility
function toggleSchedulerContent(show) {
    const schedulerContent = document.querySelector('.scheduler-content');
    if (schedulerContent) {
        schedulerContent.style.display = show ? 'block' : 'none';
        
        // Refresh calendar if shown
        if (show && calendar) {
            setTimeout(() => {
                calendar.updateSize();
            }, 100);
        }
    }
}

// Get post data from form
function getPostDataFromForm() {
    const postForm = document.getElementById('postForm');
    if (!postForm) return null;
    
    const postId = postForm.dataset.postId || generateId();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const category = document.getElementById('postCategory').value;
    const subcategory = document.getElementById('postSubcategory').value;
    const tags = document.getElementById('postTags').value;
    const featuredImage = document.getElementById('featuredImage').value;
    
    return {
        id: postId,
        title: title,
        content: content,
        excerpt: excerpt,
        category: category,
        subcategory: subcategory,
        tags: tags.split(',').map(tag => tag.trim()),
        imageUrl: featuredImage,
        date: new Date().toISOString(),
        author: 'Admin',
        status: 'draft'
    };
}

// Save scheduled post
function saveScheduledPost(postData) {
    try {
        // Assign unique ID if missing
        if (!postData.id) {
            postData.id = generateId();
        }
        // Set status
        postData.status = 'scheduled';
        // Always store scheduledDate as ISO string
        if (postData.scheduledDate instanceof Date) {
            postData.scheduledDate = postData.scheduledDate.toISOString();
        }
        // Prevent scheduling in the past
        const scheduledDate = new Date(postData.scheduledDate);
        const now = new Date();
        if (scheduledDate <= now) {
            throw new Error('Cannot schedule a post in the past.');
        }
        // Add or update post in scheduledPosts
        const existingIndex = scheduledPosts.findIndex(p => p.id === postData.id);
        if (existingIndex !== -1) {
            scheduledPosts[existingIndex] = postData;
        } else {
            scheduledPosts.push(postData);
        }
        
        // Save to storage immediately
        saveScheduledPosts();
        
        // Update UI
        updateCalendar();
        
        // Render scheduled posts list
        renderScheduledPosts();
    } catch (err) {
        // Show error notification if scheduling fails
        showNotification(err.message || 'Failed to schedule post.', 'error');
    }
}

// Update calendar with scheduled posts
function updateCalendar() {
    if (!calendar) return;
    
    // Remove all events
    calendar.removeAllEvents();
    
    // Add events from scheduled posts
    const events = getCalendarEvents();
    events.forEach(event => {
        calendar.addEvent(event);
    });
}

// Render scheduled posts list
function renderScheduledPosts() {
    const scheduledPostsList = document.getElementById('scheduledPostsList');
    if (!scheduledPostsList) return;
    
    scheduledPostsList.innerHTML = '';
    
    if (scheduledPosts.length === 0) {
        scheduledPostsList.innerHTML = '<p>No scheduled posts</p>';
        return;
    }
    
    // Sort posts by scheduled date
    const sortedPosts = [...scheduledPosts].sort((a, b) => {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });
    
    sortedPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'scheduled-post-item';
        postItem.dataset.id = post.id;
        
        const date = new Date(post.scheduledDate);
        
        postItem.innerHTML = `
            <div class="scheduled-post-info">
                <div class="scheduled-post-title">${post.title}</div>
                <div class="scheduled-post-date">
                    <i class="far fa-calendar-alt"></i> ${date.toLocaleDateString()} 
                    <i class="far fa-clock"></i> ${date.toLocaleTimeString()}
                </div>
            </div>
            <div class="scheduled-post-actions">
                <button class="btn btn-sm btn-primary edit-scheduled-post" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-scheduled-post" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        scheduledPostsList.appendChild(postItem);
        
        // Add event listeners
        const editBtn = postItem.querySelector('.edit-scheduled-post');
        const deleteBtn = postItem.querySelector('.delete-scheduled-post');
        
        editBtn.addEventListener('click', function() {
            editScheduledPost(post.id);
        });
        
        deleteBtn.addEventListener('click', function() {
            deleteScheduledPost(post.id);
        });
    });
}

// Edit scheduled post
function editScheduledPost(postId) {
    const post = scheduledPosts.find(p => p.id === postId);
    if (!post) return;
    
    // Fill the form with post data
    fillPostForm(post);
    
    // Enable scheduling
    const scheduleToggle = document.getElementById('scheduleToggle');
    if (scheduleToggle) {
        scheduleToggle.checked = true;
        toggleSchedulerContent(true);
    }
    
    // Set scheduled date and time
    const dateInput = document.getElementById('scheduledDate');
    const timeInput = document.getElementById('scheduledTime');
    
    if (dateInput && timeInput) {
        const date = new Date(post.scheduledDate);
        dateInput.value = date.toISOString().split('T')[0];
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Scroll to form
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete scheduled post
function deleteScheduledPost(postId) {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
        // Remove post from scheduled posts
        scheduledPosts = scheduledPosts.filter(post => post.id !== postId);
        
        // Save to localStorage
        saveScheduledPosts();
        
        // Update calendar
        updateCalendar();
        
        // Render scheduled posts list
        renderScheduledPosts();
        
        // Show success message
        showNotification('Scheduled post deleted successfully', 'success');
    }
}

// Fill post form with post data
function fillPostForm(post) {
    const postForm = document.getElementById('postForm');
    if (!postForm) return;
    
    // Set post ID
    postForm.dataset.postId = post.id;
    
    // Fill form fields
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('postCategory').value = post.category || '';
    document.getElementById('postSubcategory').value = post.subcategory || '';
    document.getElementById('postTags').value = Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '';
    
    // Set featured image if it exists
    const featuredImageInput = document.getElementById('featuredImage');
    const featuredImagePreview = document.getElementById('featuredImagePreview');
    const removeFeaturedImageBtn = document.getElementById('removeFeaturedImageBtn');
    
    if (featuredImageInput && featuredImagePreview && removeFeaturedImageBtn) {
        featuredImageInput.value = post.imageUrl || '';
        
        if (post.imageUrl) {
            featuredImagePreview.src = post.imageUrl;
            featuredImagePreview.style.display = 'block';
            removeFeaturedImageBtn.style.display = 'inline-block';
        } else {
            featuredImagePreview.src = 'images/New images/image-placeholder.jpg';
            removeFeaturedImageBtn.style.display = 'none';
        }
    }
}

// Publish scheduled post
function publishScheduledPost(post) {
    // Get existing posts
    let blogPosts = [];
    const storedPosts = localStorage.getItem('fooodis-blog-posts');
    if (storedPosts) {
        blogPosts = JSON.parse(storedPosts);
    }
    // Update post status
    post.status = 'published';
    post.date = new Date().toISOString();
    // Check if post already exists in blog posts
    const existingIndex = blogPosts.findIndex(p => p.id === post.id);
    if (existingIndex !== -1) {
        // Update existing post
        blogPosts[existingIndex] = post;
    } else {
        // Add new post
        blogPosts.push(post);
    }
    // Save to localStorage
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    // Remove from scheduled posts and persist
    scheduledPosts = scheduledPosts.filter(p => p.id !== post.id);
    saveScheduledPosts();
    // Update calendar
    updateCalendar();
    // Render scheduled posts list
    renderScheduledPosts();
    // Show notification
    showNotification(`Automation: Post "${post.title}" has been published.`, 'success');
    // Debug log
    if (typeof console !== 'undefined') {
        console.log('Automation: Published scheduled post:', post);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add CSS for notifications
        const style = document.createElement('style');
        style.textContent = `
            #notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
            
            .notification {
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                animation: slide-in 0.3s ease-out forwards;
            }
            
            .notification.info {
                background-color: #e3f2fd;
                border-left: 4px solid #2196f3;
                color: #0d47a1;
            }
            
            .notification.success {
                background-color: #e8f5e9;
                border-left: 4px solid #4caf50;
                color: #1b5e20;
            }
            
            .notification.warning {
                background-color: #fff8e1;
                border-left: 4px solid #ffc107;
                color: #ff6f00;
            }
            
            .notification.error {
                background-color: #ffebee;
                border-left: 4px solid #f44336;
                color: #b71c1c;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 16px;
                opacity: 0.7;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fade-out {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification.fade-out {
                animation: fade-out 0.3s ease-out forwards;
            }
            
            body.dark-mode .notification.info {
                background-color: #0d47a1;
                color: #e3f2fd;
            }
            
            body.dark-mode .notification.success {
                background-color: #1b5e20;
                color: #e8f5e9;
            }
            
            body.dark-mode .notification.warning {
                background-color: #ff6f00;
                color: #fff8e1;
            }
            
            body.dark-mode .notification.error {
                background-color: #b71c1c;
                color: #ffebee;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add close button event listener
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        closeNotification(notification);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

// Close notification
function closeNotification(notification) {
    notification.classList.add('fade-out');
    
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Update calendar with scheduled posts
function updateCalendar() {
    if (window.calendar) {
        // Remove all existing events
        window.calendar.removeAllEvents();
        
        // Add events from scheduled posts
        const events = getCalendarEvents();
        events.forEach(event => {
            window.calendar.addEvent(event);
        });
        
        console.log('Calendar updated with scheduled posts:', events.length);
    } else {
        console.warn('Calendar not initialized, cannot update');
    }
}

// Render scheduled posts in the list
function renderScheduledPosts() {
    const scheduledPostsList = document.getElementById('scheduledPostsList');
    if (!scheduledPostsList) return;
    
    // Clear existing posts
    scheduledPostsList.innerHTML = '';
    
    if (scheduledPosts.length === 0) {
        scheduledPostsList.innerHTML = '<div class="no-posts">No scheduled posts</div>';
        return;
    }
    
    // Sort posts by scheduled date
    const sortedPosts = [...scheduledPosts].sort((a, b) => {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });
    
    // Create post items
    sortedPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'scheduled-post-item';
        postItem.dataset.id = post.id;
        
        const formattedDate = new Date(post.scheduledDate).toLocaleString();
        
        postItem.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-date">${formattedDate}</div>
            <div class="post-actions">
                <button class="edit-post-btn">Edit</button>
                <button class="delete-post-btn">Delete</button>
            </div>
        `;
        
        scheduledPostsList.appendChild(postItem);
    });
    
    // Add event listeners for post actions
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.closest('.scheduled-post-item').dataset.id;
            const post = scheduledPosts.find(p => p.id === postId);
            if (post) {
                // TODO: Implement edit functionality
                console.log('Edit post:', post);
            }
        });
    });
    
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.closest('.scheduled-post-item').dataset.id;
            const postIndex = scheduledPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                scheduledPosts.splice(postIndex, 1);
                saveScheduledPosts();
                updateCalendar();
                renderScheduledPosts();
                showNotification('Post removed from schedule', 'success');
            }
        });
    });
}

// Export functions
window.postScheduler = {
    initializeScheduler,
    loadScheduledPosts,
    saveScheduledPosts,
    updateCalendar,
    renderScheduledPosts,
    checkScheduledPosts
};

// End of post-scheduler.js
