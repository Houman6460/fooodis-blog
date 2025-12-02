/**
 * Post Scheduler Dark Theme Functionality
 * This script handles the post scheduling functionality
 * with proper dark theme implementation
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const calendarContainer = document.getElementById('calendarContainer');
    const scheduledPostsList = document.getElementById('scheduledPostsList');
    const filterScheduledPosts = document.getElementById('filterScheduledPosts');
    
    // Date variables
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;
    let currentView = 'month'; // month, week, list
    
    // Scheduled posts data - loaded from API
    let scheduledPosts = [];
    
    // Load posts from API and localStorage
    async function loadScheduledPosts() {
        try {
            // Try API first
            const response = await fetch('/api/scheduled-posts');
            if (response.ok) {
                const data = await response.json();
                scheduledPosts = (data.posts || []).map(post => ({
                    id: post.id,
                    title: post.title,
                    date: new Date(post.scheduled_date || post.scheduled_datetime),
                    status: post.status === 'pending' ? 'scheduled' : post.status,
                    category: post.category || 'Uncategorized',
                    excerpt: post.excerpt || '',
                    source: post.source || 'manual'
                }));
            }
        } catch (error) {
            console.error('Error loading scheduled posts:', error);
        }
        
        // Also get AI automation scheduled posts from localStorage
        try {
            const aiPaths = JSON.parse(localStorage.getItem('ai-automation-paths') || '[]');
            aiPaths.forEach(path => {
                if (path.active && path.schedule) {
                    // Add future scheduled AI posts
                    const nextRun = getNextRunDate(path.schedule);
                    if (nextRun) {
                        scheduledPosts.push({
                            id: `ai-${path.id}`,
                            title: `AI: ${path.name}`,
                            date: nextRun,
                            status: 'ai-generated',
                            category: path.category || 'AI Generated',
                            excerpt: `Automated ${path.contentType} post`,
                            source: 'ai_automation'
                        });
                    }
                }
            });
        } catch (e) {
            console.log('No AI automation paths found');
        }
        
        renderCalendar();
        renderScheduledPosts();
    }
    
    // Get next run date from schedule
    function getNextRunDate(schedule) {
        if (!schedule || !schedule.time) return null;
        
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const now = new Date();
        let nextRun = new Date();
        nextRun.setHours(hours, minutes, 0, 0);
        
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        
        if (schedule.type === 'weekly' && schedule.day !== undefined) {
            while (nextRun.getDay() !== schedule.day) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
        }
        
        return nextRun;
    }
    
    // Initialize the calendar and scheduled posts list
    initCalendar();
    loadScheduledPosts();
    
    // Event listeners
    if (filterScheduledPosts) {
        filterScheduledPosts.addEventListener('change', renderScheduledPosts);
    }
    
    /**
     * Initialize the calendar
     */
    function initCalendar() {
        if (!calendarContainer) return;
        
        // Create calendar header
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        
        // Create month/year title
        const calendarTitle = document.createElement('div');
        calendarTitle.className = 'calendar-title';
        calendarTitle.textContent = getMonthYearString(currentMonth, currentYear);
        
        // Create navigation buttons
        const calendarNav = document.createElement('div');
        calendarNav.className = 'calendar-nav';
        
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.title = 'Previous month';
        prevButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
        
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.title = 'Next month';
        nextButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
        
        const todayButton = document.createElement('button');
        todayButton.className = 'today-btn';
        todayButton.textContent = 'Today';
        todayButton.addEventListener('click', () => {
            const today = new Date();
            currentMonth = today.getMonth();
            currentYear = today.getFullYear();
            renderCalendar();
        });
        
        calendarNav.appendChild(prevButton);
        calendarNav.appendChild(todayButton);
        calendarNav.appendChild(nextButton);
        
        // Create view options
        const viewOptions = document.createElement('div');
        viewOptions.className = 'calendar-view-options';
        
        const monthView = document.createElement('button');
        monthView.textContent = 'MONTH';
        monthView.className = 'active';
        monthView.dataset.view = 'month';
        monthView.addEventListener('click', () => {
            currentView = 'month';
            setActiveViewButton(monthView);
            renderCalendar();
        });
        
        const weekView = document.createElement('button');
        weekView.textContent = 'WEEK';
        weekView.dataset.view = 'week';
        weekView.addEventListener('click', () => {
            currentView = 'week';
            setActiveViewButton(weekView);
            renderWeekView();
        });
        
        const listView = document.createElement('button');
        listView.textContent = 'LIST';
        listView.dataset.view = 'list';
        listView.addEventListener('click', () => {
            currentView = 'list';
            setActiveViewButton(listView);
            renderListView();
        });
        
        viewOptions.appendChild(monthView);
        viewOptions.appendChild(weekView);
        viewOptions.appendChild(listView);
        
        calendarHeader.appendChild(calendarTitle);
        calendarHeader.appendChild(calendarNav);
        
        calendarContainer.appendChild(calendarHeader);
        calendarContainer.appendChild(viewOptions);
        
        // Create calendar grid container
        const calendarGridContainer = document.createElement('div');
        calendarGridContainer.id = 'calendarGrid';
        calendarContainer.appendChild(calendarGridContainer);
        
        renderCalendar();
    }
    
    /**
     * Render the calendar for the current month and year
     */
    function renderCalendar() {
        const calendarGridContainer = document.getElementById('calendarGrid');
        if (!calendarGridContainer) return;
        
        // Update calendar title
        const calendarTitle = document.querySelector('.calendar-title');
        if (calendarTitle) {
            calendarTitle.textContent = getMonthYearString(currentMonth, currentYear);
        }
        
        // Clear previous calendar
        calendarGridContainer.innerHTML = '';
        
        // Create table for calendar
        const table = document.createElement('table');
        table.className = 'calendar-grid';
        
        // Create header row with day names
        const headerRow = document.createElement('tr');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        dayNames.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        
        table.appendChild(headerRow);
        
        // Get the first day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)
        
        // Get the number of days in the month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Get the number of days in the previous month
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        
        // Calculate the number of rows needed
        const rows = Math.ceil((startingDay + daysInMonth) / 7);
        
        let date = 1;
        let prevMonthDate = daysInPrevMonth - startingDay + 1;
        let nextMonthDate = 1;
        
        // Create calendar rows
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            
            // Create cells for each day
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                // Fill in days from previous month
                if (i === 0 && j < startingDay) {
                    cell.textContent = prevMonthDate;
                    cell.className = 'other-month';
                    prevMonthDate++;
                }
                // Fill in days from current month
                else if (date <= daysInMonth) {
                    const dayNumber = document.createElement('div');
                    dayNumber.className = 'day-number';
                    dayNumber.textContent = date;
                    cell.appendChild(dayNumber);
                    
                    // Check if this day has any scheduled posts
                    const hasEvents = scheduledPosts.some(post => {
                        const postDate = new Date(post.date);
                        return postDate.getDate() === date && 
                               postDate.getMonth() === currentMonth && 
                               postDate.getFullYear() === currentYear;
                    });
                    
                    if (hasEvents) {
                        const eventIndicator = document.createElement('span');
                        eventIndicator.className = 'event-indicator';
                        cell.appendChild(eventIndicator);
                    }
                    
                    // Check if this is today
                    const today = new Date();
                    if (date === today.getDate() && 
                        currentMonth === today.getMonth() && 
                        currentYear === today.getFullYear()) {
                        cell.classList.add('today');
                    }
                    
                    // Check if this is the selected date
                    if (selectedDate && 
                        date === selectedDate.getDate() && 
                        currentMonth === selectedDate.getMonth() && 
                        currentYear === selectedDate.getFullYear()) {
                        cell.classList.add('selected');
                    }
                    
                    // Add click event to select date
                    cell.addEventListener('click', () => {
                        selectedDate = new Date(currentYear, currentMonth, date);
                        renderCalendar();
                        renderScheduledPosts();
                    });
                    
                    date++;
                }
                // Fill in days from next month
                else {
                    cell.textContent = nextMonthDate;
                    cell.className = 'other-month';
                    nextMonthDate++;
                }
                
                row.appendChild(cell);
            }
            
            table.appendChild(row);
            
            // Stop creating rows if we've filled all the days
            if (date > daysInMonth) {
                break;
            }
        }
        
        calendarGridContainer.appendChild(table);
    }
    
    /**
     * Render the scheduled posts list
     */
    function renderScheduledPosts() {
        if (!scheduledPostsList) return;
        
        // Clear previous list
        scheduledPostsList.innerHTML = '';
        
        // Filter posts based on selected filter
        let filteredPosts = [...scheduledPosts];
        
        if (filterScheduledPosts) {
            const filter = filterScheduledPosts.value;
            if (filter !== 'all') {
                filteredPosts = scheduledPosts.filter(post => post.status === filter);
            }
        }
        
        // Filter posts based on selected date
        if (selectedDate) {
            filteredPosts = filteredPosts.filter(post => {
                const postDate = new Date(post.date);
                return postDate.getDate() === selectedDate.getDate() && 
                       postDate.getMonth() === selectedDate.getMonth() && 
                       postDate.getFullYear() === selectedDate.getFullYear();
            });
        }
        
        // Sort posts by date
        filteredPosts.sort((a, b) => a.date - b.date);
        
        // Check if there are any posts
        if (filteredPosts.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-scheduled-posts';
            emptyState.innerHTML = `
                <i class="fas fa-calendar-times"></i>
                <p>No scheduled posts found</p>
            `;
            scheduledPostsList.appendChild(emptyState);
            return;
        }
        
        // Create post items
        filteredPosts.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'scheduled-post-item';
            
            const postHeader = document.createElement('div');
            postHeader.className = 'scheduled-post-header';
            
            const postTitle = document.createElement('h4');
            postTitle.className = 'scheduled-post-title';
            postTitle.textContent = post.title;
            
            const postStatus = document.createElement('span');
            postStatus.className = `scheduled-post-status status-${post.status}`;
            postStatus.textContent = capitalizeFirstLetter(post.status);
            
            postHeader.appendChild(postTitle);
            postHeader.appendChild(postStatus);
            
            const postMeta = document.createElement('div');
            postMeta.className = 'scheduled-post-meta';
            
            const postDate = document.createElement('div');
            postDate.className = 'scheduled-post-date';
            postDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(post.date)}`;
            
            const postCategory = document.createElement('div');
            postCategory.className = 'scheduled-post-category';
            postCategory.innerHTML = `<i class="fas fa-tag"></i> ${post.category}`;
            
            postMeta.appendChild(postDate);
            postMeta.appendChild(postCategory);
            
            const postExcerpt = document.createElement('p');
            postExcerpt.className = 'scheduled-post-excerpt';
            postExcerpt.textContent = post.excerpt;
            
            const postActions = document.createElement('div');
            postActions.className = 'scheduled-post-actions';
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editButton.addEventListener('click', () => {
                // Implement edit functionality
                console.log('Edit post', post.id);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteButton.addEventListener('click', () => {
                // Implement delete functionality
                console.log('Delete post', post.id);
                deleteScheduledPost(post.id);
            });
            
            postActions.appendChild(editButton);
            postActions.appendChild(deleteButton);
            
            postItem.appendChild(postHeader);
            postItem.appendChild(postMeta);
            postItem.appendChild(postExcerpt);
            postItem.appendChild(postActions);
            
            scheduledPostsList.appendChild(postItem);
        });
    }
    
    /**
     * Delete a scheduled post
     */
    function deleteScheduledPost(postId) {
        // Filter out the post with the given ID
        scheduledPosts = scheduledPosts.filter(post => post.id !== postId);
        
        // Re-render the calendar and posts list
        renderCalendar();
        renderScheduledPosts();
        
        // Show notification
        showNotification('Post deleted successfully', 'success');
    }
    
    /**
     * Render Week View
     */
    function renderWeekView() {
        const calendarGridContainer = document.getElementById('calendarGrid');
        if (!calendarGridContainer) return;
        
        calendarGridContainer.innerHTML = '';
        
        // Get start of current week (Sunday)
        const weekStart = new Date(currentYear, currentMonth, currentDate.getDate() - currentDate.getDay());
        
        // Update title
        const calendarTitle = document.querySelector('.calendar-title');
        if (calendarTitle) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            calendarTitle.textContent = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        
        const table = document.createElement('table');
        table.className = 'calendar-grid week-view';
        
        // Header row
        const headerRow = document.createElement('tr');
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach((day, i) => {
            const th = document.createElement('th');
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + i);
            th.innerHTML = `${day}<br><span class="date-num">${dayDate.getDate()}</span>`;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        
        // Single row for events
        const row = document.createElement('tr');
        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            cell.className = 'week-cell';
            const cellDate = new Date(weekStart);
            cellDate.setDate(cellDate.getDate() + i);
            
            // Find posts for this day
            const dayPosts = scheduledPosts.filter(post => {
                const postDate = new Date(post.date);
                return postDate.toDateString() === cellDate.toDateString();
            });
            
            dayPosts.forEach(post => {
                const eventDiv = document.createElement('div');
                eventDiv.className = `week-event status-${post.status}`;
                eventDiv.textContent = post.title;
                cell.appendChild(eventDiv);
            });
            
            if (cellDate.toDateString() === new Date().toDateString()) {
                cell.classList.add('today');
            }
            
            row.appendChild(cell);
        }
        table.appendChild(row);
        
        calendarGridContainer.appendChild(table);
    }
    
    /**
     * Render List View
     */
    function renderListView() {
        const calendarGridContainer = document.getElementById('calendarGrid');
        if (!calendarGridContainer) return;
        
        calendarGridContainer.innerHTML = '';
        
        // Update title
        const calendarTitle = document.querySelector('.calendar-title');
        if (calendarTitle) {
            calendarTitle.textContent = 'All Scheduled Posts';
        }
        
        const listContainer = document.createElement('div');
        listContainer.className = 'list-view-container';
        
        // Sort posts by date
        const sortedPosts = [...scheduledPosts].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (sortedPosts.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>No scheduled posts</p>
                </div>
            `;
        } else {
            sortedPosts.forEach(post => {
                const listItem = document.createElement('div');
                listItem.className = `list-item status-${post.status}`;
                listItem.innerHTML = `
                    <div class="list-date">${formatDate(post.date)}</div>
                    <div class="list-title">${post.title}</div>
                    <div class="list-status">${capitalizeFirstLetter(post.status)}</div>
                    <div class="list-category">${post.category}</div>
                `;
                listContainer.appendChild(listItem);
            });
        }
        
        calendarGridContainer.appendChild(listContainer);
    }
    
    /**
     * Set the active view button
     */
    function setActiveViewButton(activeButton) {
        const viewButtons = document.querySelectorAll('.calendar-view-options button');
        viewButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    /**
     * Get the month and year string
     */
    function getMonthYearString(month, year) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[month]} ${year}`;
    }
    
    /**
     * Format date to readable string
     */
    function formatDate(date) {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('en-US', options);
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
