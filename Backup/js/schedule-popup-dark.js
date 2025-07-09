/**
 * Schedule Post Popup Dark Theme
 * This script handles the schedule post popup functionality with dark theme integration
 */

document.addEventListener('DOMContentLoaded', function() {
    // Override the default schedule post popup with dark-themed version
    setupDarkSchedulePopup();
    
    /**
     * Set up the dark theme for the schedule post popup
     */
    function setupDarkSchedulePopup() {
        // Find the schedule post button in the create post section
        const postScheduleDate = document.getElementById('postScheduleDate');
        
        if (postScheduleDate) {
            // Override the default click behavior
            postScheduleDate.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Create and show the dark-themed popup
                showDarkSchedulePopup();
                
                return false;
            });
        }
        
        // Also find any schedule buttons in the dashboard
        const scheduleButtons = document.querySelectorAll('.schedule-btn, .schedule-post-btn');
        scheduleButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showDarkSchedulePopup();
            });
        });
    }
    
    /**
     * Show the dark-themed schedule popup
     */
    function showDarkSchedulePopup() {
        // Create the popup container
        const popup = document.createElement('div');
        popup.className = 'dark-schedule-popup';
        
        // Create the popup content
        popup.innerHTML = `
            <div class="dark-popup-overlay"></div>
            <div class="dark-popup-content">
                <div class="dark-popup-header">
                    <h3>Schedule Post</h3>
                    <button type="button" class="dark-popup-close">&times;</button>
                </div>
                <div class="dark-popup-body">
                    <div class="schedule-toggle-container">
                        <span>Enable scheduling</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="enableScheduling" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="schedule-inputs">
                        <div class="schedule-input-group">
                            <label for="scheduleDate">Date</label>
                            <input type="date" id="scheduleDate" value="${getCurrentDate()}">
                        </div>
                        
                        <div class="schedule-input-group">
                            <label for="scheduleTime">Time</label>
                            <input type="time" id="scheduleTime" value="${getCurrentTime()}">
                        </div>
                    </div>
                    
                    <div class="calendar-container" id="popupCalendar">
                        <div class="calendar-header">
                            <div class="calendar-title">May 2025</div>
                            <div class="calendar-nav">
                                <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
                                <button class="today-btn">today</button>
                                <button class="next-month"><i class="fas fa-chevron-right"></i></button>
                            </div>
                        </div>
                        
                        <div class="calendar-view-options">
                            <button class="active">month</button>
                            <button>week</button>
                            <button>list</button>
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
                                    <td class="other-month"><div class="day-number">28</div></td>
                                    <td class="other-month"><div class="day-number">29</div></td>
                                    <td class="other-month"><div class="day-number">30</div></td>
                                    <td><div class="day-number">1</div></td>
                                    <td class="today"><div class="day-number">2</div></td>
                                    <td><div class="day-number">3</div></td>
                                    <td><div class="day-number">4</div></td>
                                </tr>
                                <tr>
                                    <td><div class="day-number">5</div></td>
                                    <td><div class="day-number">6</div></td>
                                    <td><div class="day-number">7</div></td>
                                    <td><div class="day-number">8</div></td>
                                    <td><div class="day-number">9</div></td>
                                    <td><div class="day-number">10</div></td>
                                    <td><div class="day-number">11</div></td>
                                </tr>
                                <tr>
                                    <td><div class="day-number">12</div></td>
                                    <td><div class="day-number">13</div></td>
                                    <td><div class="day-number">14</div></td>
                                    <td><div class="day-number">15</div></td>
                                    <td><div class="day-number">16</div></td>
                                    <td><div class="day-number">17</div></td>
                                    <td><div class="day-number">18</div></td>
                                </tr>
                                <tr>
                                    <td><div class="day-number">19</div></td>
                                    <td><div class="day-number">20</div></td>
                                    <td><div class="day-number">21</div></td>
                                    <td><div class="day-number">22</div></td>
                                    <td><div class="day-number">23</div></td>
                                    <td><div class="day-number">24</div></td>
                                    <td><div class="day-number">25</div></td>
                                </tr>
                                <tr>
                                    <td><div class="day-number">26</div></td>
                                    <td><div class="day-number">27</div></td>
                                    <td><div class="day-number">28</div></td>
                                    <td><div class="day-number">29</div></td>
                                    <td><div class="day-number">30</div></td>
                                    <td><div class="day-number">31</div></td>
                                    <td class="other-month"><div class="day-number">1</div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="dark-popup-footer">
                    <button type="button" class="btn-secondary cancel-btn">Cancel</button>
                    <button type="button" class="btn-primary save-btn">Save</button>
                </div>
            </div>
        `;
        
        // Add the popup to the document
        document.body.appendChild(popup);
        
        // Add event listeners
        const closeBtn = popup.querySelector('.dark-popup-close');
        const cancelBtn = popup.querySelector('.cancel-btn');
        const saveBtn = popup.querySelector('.save-btn');
        const overlay = popup.querySelector('.dark-popup-overlay');
        
        // Close popup events
        closeBtn.addEventListener('click', () => closePopup(popup));
        cancelBtn.addEventListener('click', () => closePopup(popup));
        overlay.addEventListener('click', () => closePopup(popup));
        
        // Save button event
        saveBtn.addEventListener('click', () => {
            const enableScheduling = document.getElementById('enableScheduling').checked;
            const scheduleDate = document.getElementById('scheduleDate').value;
            const scheduleTime = document.getElementById('scheduleTime').value;
            
            if (enableScheduling) {
                // Format the date and time for the input field
                const formattedDateTime = `${scheduleDate}T${scheduleTime}`;
                
                // Update the schedule date input in the form
                const postScheduleDate = document.getElementById('postScheduleDate');
                if (postScheduleDate) {
                    postScheduleDate.value = formattedDateTime;
                }
                
                // Show notification
                showNotification('Post scheduled successfully', 'success');
            } else {
                // Clear the schedule date input in the form
                const postScheduleDate = document.getElementById('postScheduleDate');
                if (postScheduleDate) {
                    postScheduleDate.value = '';
                }
                
                // Show notification
                showNotification('Scheduling disabled', 'info');
            }
            
            closePopup(popup);
        });
        
        // Calendar day selection
        const calendarDays = popup.querySelectorAll('.calendar-grid td');
        calendarDays.forEach(day => {
            day.addEventListener('click', () => {
                // Remove selected class from all days
                calendarDays.forEach(d => d.classList.remove('selected'));
                
                // Add selected class to clicked day
                day.classList.add('selected');
                
                // Get the day number
                const dayNumber = day.querySelector('.day-number').textContent;
                
                // Update the date input
                const scheduleDate = document.getElementById('scheduleDate');
                if (scheduleDate) {
                    // Create a new date based on the current value
                    const currentDate = new Date(scheduleDate.value);
                    
                    // Update the day
                    currentDate.setDate(parseInt(dayNumber));
                    
                    // If it's from other month, adjust the month accordingly
                    if (day.classList.contains('other-month')) {
                        if (parseInt(dayNumber) > 15) {
                            // Previous month
                            currentDate.setMonth(currentDate.getMonth() - 1);
                        } else {
                            // Next month
                            currentDate.setMonth(currentDate.getMonth() + 1);
                        }
                    }
                    
                    // Format the date for the input
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    
                    scheduleDate.value = `${year}-${month}-${day}`;
                }
            });
        });
        
        // Calendar navigation
        const prevMonthBtn = popup.querySelector('.prev-month');
        const nextMonthBtn = popup.querySelector('.next-month');
        const todayBtn = popup.querySelector('.today-btn');
        
        prevMonthBtn.addEventListener('click', () => {
            // In a real implementation, this would update the calendar
            // For this demo, we'll just show a notification
            showNotification('Previous month selected', 'info');
        });
        
        nextMonthBtn.addEventListener('click', () => {
            // In a real implementation, this would update the calendar
            // For this demo, we'll just show a notification
            showNotification('Next month selected', 'info');
        });
        
        todayBtn.addEventListener('click', () => {
            // In a real implementation, this would update the calendar to today
            // For this demo, we'll just show a notification
            showNotification('Today selected', 'info');
        });
        
        // View options
        const viewOptions = popup.querySelectorAll('.calendar-view-options button');
        viewOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                viewOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
                
                // In a real implementation, this would change the calendar view
                // For this demo, we'll just show a notification
                showNotification(`${option.textContent} view selected`, 'info');
            });
        });
        
        // Enable/disable scheduling toggle
        const enableSchedulingToggle = document.getElementById('enableScheduling');
        const scheduleInputs = popup.querySelector('.schedule-inputs');
        const calendarContainer = popup.querySelector('.calendar-container');
        
        enableSchedulingToggle.addEventListener('change', () => {
            if (enableSchedulingToggle.checked) {
                scheduleInputs.style.opacity = '1';
                scheduleInputs.style.pointerEvents = 'auto';
                calendarContainer.style.opacity = '1';
                calendarContainer.style.pointerEvents = 'auto';
            } else {
                scheduleInputs.style.opacity = '0.5';
                scheduleInputs.style.pointerEvents = 'none';
                calendarContainer.style.opacity = '0.5';
                calendarContainer.style.pointerEvents = 'none';
            }
        });
    }
    
    /**
     * Close the popup
     */
    function closePopup(popup) {
        // Add closing animation
        popup.classList.add('closing');
        
        // Remove the popup after animation completes
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 300);
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
