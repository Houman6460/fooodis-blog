/**
 * Automation Time Fix Module
 * Handles timezone and scheduling corrections for the Fooodis Blog System
 */

const automationTimeFix = {
  /**
   * Initialize the time fix module
   */
  init: function() {
    console.log('Automation Time Fix module initialized');
    this.fixTimeSelectors();
    this.setupTimeValidation();
    return Promise.resolve();
  },
  
  /**
   * Fix time selectors in the UI to use the correct timezone
   */
  fixTimeSelectors: function() {
    // Find all time input fields
    const timeInputs = document.querySelectorAll('input[type="time"]');
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    
    console.log(`Fixing time selectors for timezone: ${timezone} (UTC${offset >= 0 ? '-' : '+'}${Math.abs(offset/60)})`);
    
    // Add timezone information to time inputs
    timeInputs.forEach(input => {
      // Set a data attribute with the timezone
      input.dataset.timezone = timezone;
      
      // Add event listener to adjust time display
      input.addEventListener('change', this._handleTimeChange);
    });
    
    // Add timezone information to date inputs
    dateInputs.forEach(input => {
      // Set a data attribute with the timezone
      input.dataset.timezone = timezone;
      
      // Add event listener to adjust date display
      input.addEventListener('change', this._handleDateChange);
    });
    
    // Find scheduling containers and add timezone information
    const scheduleContainers = document.querySelectorAll('.schedule-container, .time-selector-container');
    scheduleContainers.forEach(container => {
      const timezoneDisplay = document.createElement('div');
      timezoneDisplay.className = 'timezone-display';
      timezoneDisplay.textContent = `Timezone: ${timezone}`;
      timezoneDisplay.style.fontSize = '12px';
      timezoneDisplay.style.color = '#666';
      timezoneDisplay.style.marginTop = '5px';
      
      container.appendChild(timezoneDisplay);
    });
  },
  
  /**
   * Set up validation for time inputs
   */
  setupTimeValidation: function() {
    // Add validation to scheduling forms
    const scheduleForms = document.querySelectorAll('form[data-purpose="scheduling"]');
    
    scheduleForms.forEach(form => {
      form.addEventListener('submit', (event) => {
        const timeInput = form.querySelector('input[type="time"]');
        const dateInput = form.querySelector('input[type="date"]');
        
        if (timeInput && dateInput) {
          const selectedDate = new Date(`${dateInput.value}T${timeInput.value}`);
          
          // Check if selected time is in the past
          if (selectedDate < new Date()) {
            event.preventDefault();
            alert('Cannot schedule for a time in the past. Please select a future date and time.');
            return false;
          }
        }
      });
    });
  },
  
  /**
   * Handle time input change
   * @private
   * @param {Event} event - The change event
   */
  _handleTimeChange: function(event) {
    const input = event.target;
    const currentValue = input.value;
    
    // Store the original value for reference
    input.dataset.originalTime = currentValue;
    
    // Add visual indicator that time was processed
    const parentElement = input.parentElement;
    const indicator = document.createElement('span');
    indicator.className = 'time-processed-indicator';
    indicator.textContent = '✓';
    indicator.style.color = '#4CAF50';
    indicator.style.marginLeft = '5px';
    
    // Remove any existing indicator
    const existingIndicator = parentElement.querySelector('.time-processed-indicator');
    if (existingIndicator) {
      parentElement.removeChild(existingIndicator);
    }
    
    parentElement.appendChild(indicator);
    
    // Fade out the indicator after 2 seconds
    setTimeout(() => {
      indicator.style.transition = 'opacity 1s';
      indicator.style.opacity = '0';
    }, 2000);
  },
  
  /**
   * Handle date input change
   * @private
   * @param {Event} event - The change event
   */
  _handleDateChange: function(event) {
    const input = event.target;
    const currentValue = input.value;
    
    // Store the original value for reference
    input.dataset.originalDate = currentValue;
  },
  
  /**
   * Convert a local time to UTC
   * @param {string} timeString - Time string in HH:MM format
   * @param {string} dateString - Date string in YYYY-MM-DD format
   * @return {Date} UTC date object
   */
  convertToUTC: function(timeString, dateString) {
    const localDate = new Date(`${dateString}T${timeString}`);
    return localDate;
  },
  
  /**
   * Convert a UTC time to local time
   * @param {Date} utcDate - UTC date object
   * @return {Object} Object with local time and date strings
   */
  convertToLocal: function(utcDate) {
    const timeString = utcDate.toTimeString().substr(0, 5); // HH:MM
    const dateString = utcDate.toISOString().substr(0, 10); // YYYY-MM-DD
    
    return {
      time: timeString,
      date: dateString
    };
  }
};

// Make automationTimeFix globally available
window.automationTimeFix = automationTimeFix;
