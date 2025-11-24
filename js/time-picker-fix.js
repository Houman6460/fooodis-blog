
/**
 * Time Picker Fix - Ensures proper time format display and saving
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Time Picker Fix: Initializing...');
    
    // Fix time input handling
    const scheduleTimeInput = document.querySelector('#schedule-time');
    if (scheduleTimeInput) {
        // Ensure the time input shows the correct format
        scheduleTimeInput.addEventListener('change', function() {
            const value = this.value;
            console.log('Time Picker Fix: Time changed to:', value);
            
            // Validate time format
            if (value && !/^\d{2}:\d{2}$/.test(value)) {
                console.warn('Time Picker Fix: Invalid time format, correcting...');
                // Try to correct the format
                const timeParts = value.split(':');
                if (timeParts.length >= 2) {
                    const hours = timeParts[0].padStart(2, '0');
                    const minutes = timeParts[1].padStart(2, '0');
                    this.value = `${hours}:${minutes}`;
                }
            }
        });
        
        // Also fix on input event
        scheduleTimeInput.addEventListener('input', function() {
            const value = this.value;
            // Ensure we maintain proper format during typing
            if (value.length === 5 && value.includes(':')) {
                const parts = value.split(':');
                if (parts.length === 2) {
                    const hours = parts[0].padStart(2, '0');
                    const minutes = parts[1].padStart(2, '0');
                    if (this.value !== `${hours}:${minutes}`) {
                        this.value = `${hours}:${minutes}`;
                    }
                }
            }
        });
    }
    
    // Override any existing time formatting functions
    window.formatTimeForDisplay = function(timeString) {
        if (!timeString) return '';
        
        // Ensure HH:MM format
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            const hours = timeParts[0].padStart(2, '0');
            const minutes = timeParts[1].padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        return timeString;
    };
    
    // Fix the schedule display to show full time
    function updateScheduleDisplays() {
        const scheduleDisplays = document.querySelectorAll('.next-run, .schedule-time-display');
        scheduleDisplays.forEach(display => {
            const text = display.textContent;
            if (text && text.includes(':')) {
                // Check if time is truncated (like "14" instead of "14:10")
                const timeMatch = text.match(/(\d{1,2}):?(\d{0,2})/);
                if (timeMatch && timeMatch[2] === '') {
                    // Time is truncated, try to restore full format
                    const fullText = text.replace(timeMatch[0], timeMatch[1] + ':00');
                    display.textContent = fullText;
                }
            }
        });
    }
    
    // Run update on schedule displays periodically
    setInterval(updateScheduleDisplays, 2000);
    
    console.log('Time Picker Fix: Initialized successfully');
});
