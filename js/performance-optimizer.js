
/**
 * Performance Optimizer
 * Reduces unnecessary operations and improves app responsiveness
 */

class PerformanceOptimizer {
    constructor() {
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.requestCache = new Map();
        
        this.initialize();
    }
    
    initialize() {
        // Optimize frequent DOM operations
        this.optimizeDOMOperations();
        
        // Reduce console logging in production
        this.optimizeLogging();
        
        // Cache frequently accessed elements
        this.cacheElements();
        
        console.log('🚀 Performance Optimizer initialized');
    }
    
    // Debounce function calls
    debounce(func, delay, key) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }
    
    // Throttle function calls
    throttle(func, delay, key) {
        if (this.throttleTimers.has(key)) {
            return false;
        }
        
        func();
        
        const timer = setTimeout(() => {
            this.throttleTimers.delete(key);
        }, delay);
        
        this.throttleTimers.set(key, timer);
        return true;
    }
    
    // Cache API requests
    cacheRequest(url, data, ttl = 60000) {
        const key = url + JSON.stringify(data);
        const cached = this.requestCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < ttl) {
            return cached.data;
        }
        
        return null;
    }
    
    setCachedRequest(url, data, response) {
        const key = url + JSON.stringify(data);
        this.requestCache.set(key, {
            data: response,
            timestamp: Date.now()
        });
    }
    
    optimizeDOMOperations() {
        // Batch DOM updates
        let domUpdateQueue = [];
        let rafScheduled = false;
        
        window.batchDOMUpdate = (operation) => {
            domUpdateQueue.push(operation);
            
            if (!rafScheduled) {
                rafScheduled = true;
                requestAnimationFrame(() => {
                    domUpdateQueue.forEach(op => op());
                    domUpdateQueue = [];
                    rafScheduled = false;
                });
            }
        };
    }
    
    optimizeLogging() {
        // Reduce console spam
        const originalLog = console.log;
        let logCount = 0;
        const MAX_LOGS_PER_SECOND = 10;
        
        console.log = function(...args) {
            logCount++;
            
            if (logCount <= MAX_LOGS_PER_SECOND) {
                originalLog.apply(console, args);
            }
            
            // Reset counter every second
            setTimeout(() => {
                if (logCount > 0) logCount--;
            }, 1000);
        };
    }
    
    cacheElements() {
        // Cache frequently accessed DOM elements
        this.cachedElements = {
            dashboard: document.getElementById('dashboard'),
            conversationsList: document.getElementById('conversationsList'),
            statusCards: document.querySelectorAll('.status-card')
        };
        
        // Provide global access
        window.getCachedElement = (key) => this.cachedElements[key];
    }
}

// Initialize performance optimizer
window.PerformanceOptimizer = new PerformanceOptimizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
