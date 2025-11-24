/**
 * Better Visitor Counter for Fooodis Blog Dashboard
 * This implementation uses a shared timestamp to detect multiple browsers
 * and includes test functionality for easy verification
 */

(function() {
    console.log('Better Visitor Counter: Initializing...');
    
    // Constants
    const COUNTER_KEY = 'fooodis-visitor-counter';
    const BROWSER_ID_KEY = 'fooodis-browser-id';
    const HEARTBEAT_INTERVAL = 5000; // 5 seconds
    const CLEANUP_INTERVAL = 10000; // 10 seconds
    const INACTIVE_THRESHOLD = 30000; // 30 seconds
    
    // Generate a unique browser ID if not already present
    let browserId = localStorage.getItem(BROWSER_ID_KEY);
    if (!browserId) {
        browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(BROWSER_ID_KEY, browserId);
    }
    
    // Initialize visitor counter
    initVisitorCounter();
    
    /**
     * Initialize the visitor counter
     */
    function initVisitorCounter() {
        // Register this browser immediately
        registerBrowser();
        
        // Add event listeners for activity tracking
        addActivityListeners();
        
        // Set up heartbeat to keep this browser registered
        setInterval(registerBrowser, HEARTBEAT_INTERVAL);
        
        // Set up cleanup for inactive browsers
        setInterval(cleanupInactiveBrowsers, CLEANUP_INTERVAL);
        
        // Set up storage listener to detect changes from other browsers
        window.addEventListener('storage', handleStorageChange);
        
        // Process URL parameters for testing
        processUrlParameters();
        
        // Update display immediately
        updateVisitorDisplay();
    }
    
    /**
     * Add event listeners for user activity
     */
    function addActivityListeners() {
        const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        // Track user activity
        events.forEach(event => {
            document.addEventListener(event, registerBrowser, { passive: true });
        });
        
        // Try to unregister on page unload
        window.addEventListener('beforeunload', unregisterBrowser);
    }
    
    /**
     * Register this browser as an active visitor
     */
    function registerBrowser() {
        try {
            const visitors = getVisitorData();
            
            // Update or add this browser
            visitors.browsers[browserId] = {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                referrer: document.referrer
            };
            
            // Save updated data
            saveVisitorData(visitors);
            
            // Update display
            updateVisitorDisplay();
            
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error registering browser', error);
            return false;
        }
    }
    
    /**
     * Unregister this browser (called on page unload)
     */
    function unregisterBrowser() {
        try {
            const visitors = getVisitorData();
            
            // Remove this browser
            delete visitors.browsers[browserId];
            
            // Save updated data
            saveVisitorData(visitors);
            
            return true;
        } catch (error) {
            // Errors here are expected as beforeunload may not complete
            return false;
        }
    }
    
    /**
     * Get visitor data from localStorage
     */
    function getVisitorData() {
        try {
            const storedData = localStorage.getItem(COUNTER_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (error) {
            console.error('Better Visitor Counter: Error getting visitor data', error);
        }
        
        // Default data structure
        return {
            browsers: {},
            testVisitors: {},
            lastUpdated: Date.now()
        };
    }
    
    /**
     * Save visitor data to localStorage
     */
    function saveVisitorData(data) {
        try {
            data.lastUpdated = Date.now();
            localStorage.setItem(COUNTER_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error saving visitor data', error);
            return false;
        }
    }
    
    /**
     * Handle storage change event from other browsers
     */
    function handleStorageChange(event) {
        if (event.key === COUNTER_KEY) {
            // Another browser has updated the visitor data
            updateVisitorDisplay();
        }
    }
    
    /**
     * Clean up inactive browsers
     */
    function cleanupInactiveBrowsers() {
        try {
            const visitors = getVisitorData();
            const now = Date.now();
            let changed = false;
            
            // Remove inactive browsers
            Object.keys(visitors.browsers).forEach(id => {
                const browser = visitors.browsers[id];
                if (now - browser.timestamp > INACTIVE_THRESHOLD) {
                    delete visitors.browsers[id];
                    changed = true;
                }
            });
            
            // Save if changed
            if (changed) {
                saveVisitorData(visitors);
                updateVisitorDisplay();
            }
            
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error cleaning up inactive browsers', error);
            return false;
        }
    }
    
    /**
     * Process URL parameters for testing
     */
    function processUrlParameters() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check for test visitors parameter
            if (urlParams.has('test_visitors')) {
                const count = parseInt(urlParams.get('test_visitors'));
                if (!isNaN(count) && count >= 0) {
                    if (count === 0) {
                        // Reset test visitors
                        resetTestVisitors();
                    } else {
                        // Add test visitors
                        addTestVisitors(count);
                    }
                }
            }
            
            // Check for reset parameter
            if (urlParams.has('reset_visitors')) {
                resetAllVisitors();
            }
            
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error processing URL parameters', error);
            return false;
        }
    }
    
    /**
     * Add test visitors for demonstration
     */
    function addTestVisitors(count) {
        try {
            const visitors = getVisitorData();
            
            // Clear existing test visitors
            visitors.testVisitors = {};
            
            // Add new test visitors
            for (let i = 0; i < count; i++) {
                const id = 'test_' + i;
                visitors.testVisitors[id] = {
                    timestamp: Date.now(),
                    userAgent: 'Test Browser ' + i,
                    isTest: true
                };
            }
            
            // Save updated data
            saveVisitorData(visitors);
            
            // Update display
            updateVisitorDisplay();
            
            console.log('Better Visitor Counter: Added ' + count + ' test visitors');
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error adding test visitors', error);
            return false;
        }
    }
    
    /**
     * Reset test visitors
     */
    function resetTestVisitors() {
        try {
            const visitors = getVisitorData();
            
            // Clear test visitors
            visitors.testVisitors = {};
            
            // Save updated data
            saveVisitorData(visitors);
            
            // Update display
            updateVisitorDisplay();
            
            console.log('Better Visitor Counter: Reset test visitors');
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error resetting test visitors', error);
            return false;
        }
    }
    
    /**
     * Reset all visitor data
     */
    function resetAllVisitors() {
        try {
            // Clear all visitor data
            localStorage.removeItem(COUNTER_KEY);
            
            // Register this browser
            registerBrowser();
            
            console.log('Better Visitor Counter: Reset all visitors');
            return true;
        } catch (error) {
            console.error('Better Visitor Counter: Error resetting all visitors', error);
            return false;
        }
    }
    
    /**
     * Get the total visitor count
     */
    function getVisitorCount() {
        try {
            const visitors = getVisitorData();
            
            // Count real browsers
            const browserCount = Object.keys(visitors.browsers).length;
            
            // Count test visitors
            const testCount = Object.keys(visitors.testVisitors).length;
            
            // Return total
            return browserCount + testCount;
        } catch (error) {
            console.error('Better Visitor Counter: Error getting visitor count', error);
            return 1; // Default to 1 (this browser)
        }
    }
    
    /**
     * Update the visitor display
     */
    function updateVisitorDisplay() {
        const visitorElement = document.getElementById('visitor-number');
        if (!visitorElement) return false;
        
        // Get current count
        const count = getVisitorCount();
        
        // Update if changed
        if (visitorElement.textContent !== count.toString()) {
            visitorElement.textContent = count;
            
            // Add pulse animation
            visitorElement.classList.remove('pulse-animation');
            void visitorElement.offsetWidth; // Trigger reflow
            visitorElement.classList.add('pulse-animation');
            
            console.log('Better Visitor Counter: Updated display to ' + count + ' visitors');
        }
        
        return true;
    }
    
    // Expose API for console testing
    window.VisitorCounter = {
        addTestVisitors: addTestVisitors,
        resetTestVisitors: resetTestVisitors,
        resetAllVisitors: resetAllVisitors,
        getVisitorCount: getVisitorCount,
        updateDisplay: updateVisitorDisplay,
        registerBrowser: registerBrowser
    };
    
    // Special testing functionality for quick verification
    console.log('Visitor count: ' + getVisitorCount());
    console.log('To add test visitors, append ?test_visitors=N to the URL');
    console.log('To reset all visitors, append ?reset_visitors=1 to the URL');
    console.log('You can also use the console: VisitorCounter.addTestVisitors(3)');
    
    // Announce presence with a marker
    document.body.classList.add('visitor-counter-active');
})();
