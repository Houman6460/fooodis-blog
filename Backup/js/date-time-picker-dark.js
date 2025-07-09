/**
 * Date and Time Picker Dark Theme Enhancement
 * This script ensures proper styling for date and time pickers
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize date and time picker enhancements
    enhanceDateTimePickers();
    
    // Watch for dynamically added date/time inputs
    observeNewDateTimeInputs();
});

/**
 * Enhance all date and time pickers
 */
function enhanceDateTimePickers() {
    // Find all date and time inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const dateTimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    
    // Apply enhancements to each type
    dateInputs.forEach(enhanceDateInput);
    timeInputs.forEach(enhanceTimeInput);
    dateTimeInputs.forEach(enhanceDateTimeInput);
}

/**
 * Enhance date input
 * @param {HTMLElement} input - The date input element
 */
function enhanceDateInput(input) {
    // Add click event listener
    input.addEventListener('click', function(e) {
        // Wait for the browser's date picker to appear
        setTimeout(function() {
            // Apply dark styling to date picker elements
            styleDatePicker();
        }, 50);
    });
    
    // Add focus event listener
    input.addEventListener('focus', function(e) {
        // Wait for the browser's date picker to appear
        setTimeout(function() {
            // Apply dark styling to date picker elements
            styleDatePicker();
        }, 50);
    });
}

/**
 * Enhance time input
 * @param {HTMLElement} input - The time input element
 */
function enhanceTimeInput(input) {
    // Add click event listener
    input.addEventListener('click', function(e) {
        // Wait for the browser's time picker to appear
        setTimeout(function() {
            // Apply dark styling to time picker elements
            styleTimePicker();
        }, 50);
    });
    
    // Add focus event listener
    input.addEventListener('focus', function(e) {
        // Wait for the browser's time picker to appear
        setTimeout(function() {
            // Apply dark styling to time picker elements
            styleTimePicker();
        }, 50);
    });
}

/**
 * Enhance datetime-local input
 * @param {HTMLElement} input - The datetime-local input element
 */
function enhanceDateTimeInput(input) {
    // Add click event listener
    input.addEventListener('click', function(e) {
        // Wait for the browser's datetime picker to appear
        setTimeout(function() {
            // Apply dark styling to datetime picker elements
            styleDatePicker();
            styleTimePicker();
        }, 50);
    });
    
    // Add focus event listener
    input.addEventListener('focus', function(e) {
        // Wait for the browser's datetime picker to appear
        setTimeout(function() {
            // Apply dark styling to datetime picker elements
            styleDatePicker();
            styleTimePicker();
        }, 50);
    });
}

/**
 * Apply styling to date picker elements
 */
function styleDatePicker() {
    // Find date picker elements in the DOM
    // Note: These selectors are based on common date picker implementations
    // and may need to be adjusted based on the actual implementation
    
    // Date picker containers
    const datePickers = document.querySelectorAll(
        '.calendar-popup, .date-picker-popup, .ui-datepicker, ' +
        '.flatpickr-calendar, .datepicker, .picker, .picker__holder, ' +
        '.datetime-picker, .date-picker-calendar, .date-picker-specific'
    );
    
    // Apply styling to each date picker
    datePickers.forEach(function(picker) {
        // Apply white background
        picker.style.backgroundColor = 'white';
        picker.style.color = 'black';
        
        // Find and style the selected date
        const selectedDays = picker.querySelectorAll('.selected, .ui-datepicker-current-day, .flatpickr-day.selected');
        selectedDays.forEach(function(day) {
            day.style.backgroundColor = '#3478F6';
            day.style.color = 'white';
        });
        
        // Find and style today's date
        const todayDays = picker.querySelectorAll('.today, .ui-datepicker-today, .flatpickr-day.today');
        todayDays.forEach(function(day) {
            day.style.fontWeight = 'bold';
        });
        
        // Find and style the header
        const headers = picker.querySelectorAll(
            '.header, .ui-datepicker-header, .flatpickr-month, ' +
            '.datepicker-header, .picker__header, .date-picker-header'
        );
        headers.forEach(function(header) {
            header.style.backgroundColor = 'white';
            header.style.color = 'black';
        });
        
        // Find and style the month title
        const titles = picker.querySelectorAll(
            '.month-title, .ui-datepicker-title, .flatpickr-current-month, ' +
            '.datepicker-title, .picker__month, .date-picker-month'
        );
        titles.forEach(function(title) {
            title.style.color = 'black';
        });
        
        // Find and style the weekday headers
        const weekdays = picker.querySelectorAll(
            '.weekday, .ui-datepicker-calendar th, .flatpickr-weekday, ' +
            '.datepicker-weekday, .picker__weekday, .date-picker-weekday'
        );
        weekdays.forEach(function(weekday) {
            weekday.style.color = '#666';
        });
        
        // Find and style the days
        const days = picker.querySelectorAll(
            '.day, .ui-datepicker-calendar td, .flatpickr-day, ' +
            '.datepicker-day, .picker__day, .date-picker-day'
        );
        days.forEach(function(day) {
            day.style.color = 'black';
        });
        
        // Find and style the footer buttons
        const buttons = picker.querySelectorAll(
            '.btn, .ui-datepicker-button, .flatpickr-button, ' +
            '.datepicker-button, .picker__button, .date-picker-footer button'
        );
        buttons.forEach(function(button) {
            if (button.classList.contains('btn-primary') || 
                button.classList.contains('ui-datepicker-current') ||
                button.classList.contains('picker__button--today')) {
                button.style.color = '#3478F6';
            } else {
                button.style.color = '#3478F6';
            }
        });
    });
}

/**
 * Apply styling to time picker elements
 */
function styleTimePicker() {
    // Find time picker elements in the DOM
    // Note: These selectors are based on common time picker implementations
    // and may need to be adjusted based on the actual implementation
    
    // Time picker containers
    const timePickers = document.querySelectorAll(
        '.time-picker-popup, .ui-timepicker, .flatpickr-time, ' +
        '.timepicker, .picker__list, .datetime-picker-time, ' +
        '.time-picker-dropdown, .time-picker-specific'
    );
    
    // Apply styling to each time picker
    timePickers.forEach(function(picker) {
        // Apply white background
        picker.style.backgroundColor = 'white';
        picker.style.color = 'black';
        
        // Find and style the selected time
        const selectedTimes = picker.querySelectorAll(
            '.selected, .ui-timepicker-option.selected, .flatpickr-time-option.selected, ' +
            '.timepicker-option.selected, .picker__list-item--selected, .time-picker-time.selected'
        );
        selectedTimes.forEach(function(time) {
            time.style.backgroundColor = '#3478F6';
            time.style.color = 'white';
        });
        
        // Find and style the time options
        const timeOptions = picker.querySelectorAll(
            '.time-option, .ui-timepicker-option, .flatpickr-time-option, ' +
            '.timepicker-option, .picker__list-item, .time-picker-time'
        );
        timeOptions.forEach(function(option) {
            option.style.color = 'black';
        });
    });
}

/**
 * Observe for dynamically added date/time inputs
 */
function observeNewDateTimeInputs() {
    // Create a mutation observer to watch for new inputs
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check each added node
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element node
                        // Check if it's a date/time input
                        if (node.tagName === 'INPUT' && 
                            (node.type === 'date' || node.type === 'time' || node.type === 'datetime-local')) {
                            // Apply enhancements based on type
                            if (node.type === 'date') {
                                enhanceDateInput(node);
                            } else if (node.type === 'time') {
                                enhanceTimeInput(node);
                            } else if (node.type === 'datetime-local') {
                                enhanceDateTimeInput(node);
                            }
                        }
                        
                        // Check children for date/time inputs
                        const dateInputs = node.querySelectorAll('input[type="date"]');
                        const timeInputs = node.querySelectorAll('input[type="time"]');
                        const dateTimeInputs = node.querySelectorAll('input[type="datetime-local"]');
                        
                        dateInputs.forEach(enhanceDateInput);
                        timeInputs.forEach(enhanceTimeInput);
                        dateTimeInputs.forEach(enhanceDateTimeInput);
                    }
                }
            }
        });
    });
    
    // Start observing the document body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
}
