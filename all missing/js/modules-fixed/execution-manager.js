/**
 * Execution Manager Module
 * Handles execution of automated tasks for the Fooodis Blog System
 */

const executionManager = {
  executionHistory: [],
  runningTasks: {},
  
  /**
   * Initialize the execution manager
   */
  init: function() {
    // Load execution history from storage
    const storageKey = 'fooodis_execution_history';
    if (storageManager && storageManager.get) {
      this.executionHistory = storageManager.get(storageKey, []);
    } else {
      console.warn('Storage manager not available for execution manager');
    }
    
    console.log('Execution Manager initialized');
    return Promise.resolve();
  },
  
  /**
   * Execute a task with the given configuration
   * @param {string} taskId - Unique identifier for the task
   * @param {Object} config - Task configuration
   * @return {Promise} Promise resolving with execution result
   */
  executeTask: function(taskId, config) {
    const executionId = `exec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();
    
    console.log(`Executing task ${taskId} with ID ${executionId}`);
    
    // Create execution record
    const execution = {
      id: executionId,
      taskId: taskId,
      status: 'running',
      startTime: timestamp,
      endTime: null,
      config: config,
      result: null,
      error: null
    };
    
    // Add to running tasks and history
    this.runningTasks[executionId] = execution;
    this.executionHistory.unshift(execution);
    this._saveHistory();
    
    // Simulate task execution (actual implementation would execute the real task)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Example success response
        this._completeTask(executionId, {
          success: true,
          message: 'Task executed successfully',
          data: {
            processedAt: new Date().toISOString()
          }
        });
        
        resolve(this.runningTasks[executionId]);
      }, 2000);
    });
  },
  
  /**
   * Mark a task as completed
   * @private
   * @param {string} executionId - The execution ID
   * @param {Object} result - The result data
   */
  _completeTask: function(executionId, result) {
    if (!this.runningTasks[executionId]) return;
    
    const execution = this.runningTasks[executionId];
    execution.status = 'completed';
    execution.endTime = new Date().toISOString();
    execution.result = result;
    
    delete this.runningTasks[executionId];
    this._saveHistory();
  },
  
  /**
   * Mark a task as failed
   * @private
   * @param {string} executionId - The execution ID
   * @param {Error|string} error - The error that occurred
   */
  _failTask: function(executionId, error) {
    if (!this.runningTasks[executionId]) return;
    
    const execution = this.runningTasks[executionId];
    execution.status = 'failed';
    execution.endTime = new Date().toISOString();
    execution.error = error instanceof Error ? error.message : error;
    
    delete this.runningTasks[executionId];
    this._saveHistory();
  },
  
  /**
   * Save execution history to storage
   * @private
   */
  _saveHistory: function() {
    const storageKey = 'fooodis_execution_history';
    
    // Limit history size
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(0, 100);
    }
    
    // Save to storage if available
    if (storageManager && storageManager.save) {
      storageManager.save(storageKey, this.executionHistory);
    }
  },
  
  /**
   * Get execution history
   * @param {number} limit - Maximum number of items to return
   * @return {Array} Execution history records
   */
  getHistory: function(limit = 50) {
    return this.executionHistory.slice(0, limit);
  },
  
  /**
   * Clear execution history
   */
  clearHistory: function() {
    this.executionHistory = [];
    this._saveHistory();
  }
};

// Make executionManager globally available
window.executionManager = executionManager;
