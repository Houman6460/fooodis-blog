/**
 * Scheduler Manager Module
 * Handles scheduling and timing operations for the Fooodis Blog System
 */

const schedulerManager = {
  schedules: [],
  activeTimers: {},
  
  /**
   * Initialize the scheduler manager
   */
  init: function() {
    // Load schedules from storage
    const storageKey = 'fooodis_schedules';
    if (storageManager && storageManager.get) {
      this.schedules = storageManager.get(storageKey, []);
      this._initializeTimers();
    } else {
      console.warn('Storage manager not available for scheduler manager');
    }
    
    console.log('Scheduler Manager initialized');
    return Promise.resolve();
  },
  
  /**
   * Add a new schedule
   * @param {Object} schedule - The schedule configuration
   * @return {string} The schedule ID
   */
  addSchedule: function(schedule) {
    const scheduleId = `schedule_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newSchedule = {
      id: scheduleId,
      name: schedule.name || 'Unnamed Schedule',
      description: schedule.description || '',
      time: schedule.time,
      action: schedule.action,
      parameters: schedule.parameters || {},
      enabled: schedule.enabled !== false,
      createdAt: new Date().toISOString(),
      lastRun: null
    };
    
    this.schedules.push(newSchedule);
    this._saveSchedules();
    
    if (newSchedule.enabled) {
      this._createTimer(newSchedule);
    }
    
    return scheduleId;
  },
  
  /**
   * Update an existing schedule
   * @param {string} scheduleId - The schedule ID
   * @param {Object} updates - The properties to update
   * @return {boolean} Whether the update was successful
   */
  updateSchedule: function(scheduleId, updates) {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return false;
    
    const schedule = this.schedules[index];
    const wasEnabled = schedule.enabled;
    
    // Update properties
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        schedule[key] = updates[key];
      }
    });
    
    this._saveSchedules();
    
    // Handle timer updates if enabled status changed
    if (schedule.enabled !== wasEnabled) {
      if (schedule.enabled) {
        this._createTimer(schedule);
      } else {
        this._removeTimer(scheduleId);
      }
    } else if (schedule.enabled && updates.time) {
      // Recreate timer if schedule time was updated
      this._removeTimer(scheduleId);
      this._createTimer(schedule);
    }
    
    return true;
  },
  
  /**
   * Remove a schedule
   * @param {string} scheduleId - The schedule ID
   * @return {boolean} Whether the removal was successful
   */
  removeSchedule: function(scheduleId) {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return false;
    
    this.schedules.splice(index, 1);
    this._saveSchedules();
    
    this._removeTimer(scheduleId);
    
    return true;
  },
  
  /**
   * Get all schedules
   * @return {Array} Array of schedule objects
   */
  getSchedules: function() {
    return [...this.schedules];
  },
  
  /**
   * Get a specific schedule by ID
   * @param {string} scheduleId - The schedule ID
   * @return {Object|null} The schedule object or null if not found
   */
  getSchedule: function(scheduleId) {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    return schedule ? {...schedule} : null;
  },
  
  /**
   * Enable or disable a schedule
   * @param {string} scheduleId - The schedule ID
   * @param {boolean} enabled - Whether the schedule should be enabled
   * @return {boolean} Whether the update was successful
   */
  setEnabled: function(scheduleId, enabled) {
    return this.updateSchedule(scheduleId, { enabled });
  },
  
  /**
   * Save schedules to storage
   * @private
   */
  _saveSchedules: function() {
    const storageKey = 'fooodis_schedules';
    
    // Save to storage if available
    if (storageManager && storageManager.save) {
      storageManager.save(storageKey, this.schedules);
    }
  },
  
  /**
   * Initialize timers for all enabled schedules
   * @private
   */
  _initializeTimers: function() {
    // Clear any existing timers
    Object.keys(this.activeTimers).forEach(id => {
      clearTimeout(this.activeTimers[id]);
    });
    this.activeTimers = {};
    
    // Create new timers for enabled schedules
    this.schedules.forEach(schedule => {
      if (schedule.enabled) {
        this._createTimer(schedule);
      }
    });
  },
  
  /**
   * Create a timer for a schedule
   * @private
   * @param {Object} schedule - The schedule object
   */
  _createTimer: function(schedule) {
    // Calculate time until next execution
    const nextTime = this._calculateNextRunTime(schedule.time);
    if (nextTime === null) return;
    
    // Create the timer
    const timer = setTimeout(() => {
      this._executeSchedule(schedule.id);
    }, nextTime - Date.now());
    
    this.activeTimers[schedule.id] = timer;
    
    console.log(`Timer created for schedule ${schedule.id}, will run in ${Math.round((nextTime - Date.now()) / 1000)} seconds`);
  },
  
  /**
   * Remove a timer
   * @private
   * @param {string} scheduleId - The schedule ID
   */
  _removeTimer: function(scheduleId) {
    if (this.activeTimers[scheduleId]) {
      clearTimeout(this.activeTimers[scheduleId]);
      delete this.activeTimers[scheduleId];
    }
  },
  
  /**
   * Calculate the next run time for a schedule
   * @private
   * @param {Object} timeConfig - The time configuration
   * @return {number|null} Timestamp of next run or null if invalid
   */
  _calculateNextRunTime: function(timeConfig) {
    // Simple implementation for demonstration
    // In a real implementation, this would handle various scheduling formats
    try {
      if (timeConfig.type === 'daily') {
        const [hours, minutes] = timeConfig.time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );
        
        // If scheduled time is in the past, schedule for tomorrow
        if (scheduledTime < now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        return scheduledTime.getTime();
      } else if (timeConfig.type === 'interval') {
        // Run after specified interval
        return Date.now() + (timeConfig.minutes * 60 * 1000);
      }
    } catch (error) {
      console.error('Invalid time configuration:', error);
    }
    
    return null;
  },
  
  /**
   * Execute a scheduled task
   * @private
   * @param {string} scheduleId - The schedule ID
   */
  _executeSchedule: function(scheduleId) {
    const schedule = this.getSchedule(scheduleId);
    if (!schedule) return;
    
    console.log(`Executing scheduled task: ${schedule.name}`);
    
    // Update last run time
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      this.schedules[index].lastRun = new Date().toISOString();
      this._saveSchedules();
    }
    
    // Execute the action
    if (executionManager && executionManager.executeTask) {
      executionManager.executeTask(scheduleId, {
        type: 'scheduled',
        action: schedule.action,
        parameters: schedule.parameters
      }).catch(error => {
        console.error(`Error executing scheduled task ${scheduleId}:`, error);
      });
    } else {
      console.error('Execution manager not available for scheduled task execution');
    }
    
    // Create the next timer for recurring schedules
    if (schedule.enabled) {
      this._createTimer(schedule);
    }
  }
};

// Make schedulerManager globally available
window.schedulerManager = schedulerManager;
