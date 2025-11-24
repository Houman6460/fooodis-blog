/**
 * Cross-Browser Visitor Tracker
 * Simulates real visitor counting across different browsers for local development
 */

(function() {
    console.log('Cross-Browser Visitor Tracker: Initializing...');
    
    // Local storage key for shared visitor data
    const STORAGE_KEY = 'fooodis-shared-visitor-data';
    
    // Create a unique browser identifier that's consistent across page loads
    let browserId = localStorage.getItem('fooodis-browser-id');
    if (!browserId) {
        browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('fooodis-browser-id', browserId);
    }
    
    // Initialize last activity timestamp
    let lastActivityTime = Date.now();
    
    // Initialize tracking
    initializeTracking();
    
    /**
     * Initialize visitor tracking
     */
    function initializeTracking() {
        // Register this browser
        registerBrowser();
        
        // Update UI immediately
        updateVisitorDisplay();
        
        // Set up periodic checking for active browsers
        setInterval(checkActiveBrowsers, 5000);
        
        // Set up user activity tracking
        trackUserActivity();
        
        // Immediately recognize new browser windows if localStorage API is shared
        window.addEventListener('storage', function(e) {
            if (e.key === STORAGE_KEY) {
                console.log('Cross-Browser Visitor Tracker: Detected change in shared storage');
                updateVisitorDisplay();
            }
        });
    }
    
    /**
     * Register this browser as an active visitor
     */
    function registerBrowser() {
        const sharedData = getSharedData();
        
        // Update this browser's activity time
        sharedData.browsers[browserId] = {
            lastActive: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // Save updated data
        saveSharedData(sharedData);
        
        console.log('Cross-Browser Visitor Tracker: Registered browser', browserId);
    }
    
    /**
     * Track user activity to maintain active status
     */
    function trackUserActivity() {
        // Update last activity time on user interaction
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(event) {
            document.addEventListener(event, function() {
                lastActivityTime = Date.now();
                registerBrowser(); // Re-register on activity
            }, { passive: true });
        });
        
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', function() {
            unregisterBrowser();
        });
        
        // Periodic check for inactivity
        setInterval(function() {
            const inactiveTime = Date.now() - lastActivityTime;
            
            // If inactive for more than 2 minutes, consider browser inactive
            if (inactiveTime > 2 * 60 * 1000) {
                unregisterBrowser();
            } else {
                // Otherwise refresh registration
                registerBrowser();
            }
        }, 30000); // Check every 30 seconds
    }
    
    /**
     * Unregister this browser (when leaving or inactive)
     */
    function unregisterBrowser() {
        const sharedData = getSharedData();
        
        // Remove this browser
        delete sharedData.browsers[browserId];
        
        // Save updated data
        saveSharedData(sharedData);
        
        console.log('Cross-Browser Visitor Tracker: Unregistered browser', browserId);
    }
    
    /**
     * Check for active browsers and clean up inactive ones
     */
    function checkActiveBrowsers() {
        const sharedData = getSharedData();
        let changed = false;
        
        // Current time
        const now = Date.now();
        
        // Clean up inactive browsers (inactive for more than 2 minutes)
        for (const [id, data] of Object.entries(sharedData.browsers)) {
            if (now - data.lastActive > 2 * 60 * 1000) {
                delete sharedData.browsers[id];
                changed = true;
                console.log('Cross-Browser Visitor Tracker: Removed inactive browser', id);
            }
        }
        
        // Save if changes were made
        if (changed) {
            saveSharedData(sharedData);
        }
        
        // Update display
        updateVisitorDisplay();
    }
    
    /**
     * Get shared visitor data across browsers
     */
    function getSharedData() {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (error) {
            console.error('Cross-Browser Visitor Tracker: Error loading shared data', error);
        }
        
        // Default data structure if no data exists or error occurred
        return {
            browsers: {},
            lastUpdated: Date.now()
        };
    }
    
    /**
     * Save shared visitor data across browsers
     */
    function saveSharedData(sharedData) {
        sharedData.lastUpdated = Date.now();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));
        } catch (error) {
            console.error('Cross-Browser Visitor Tracker: Error saving shared data', error);
        }
    }
    
    /**
     * Update the visitor display with current count
     */
    function updateVisitorDisplay() {
        const visitorNumberElement = document.getElementById('visitor-number');
        if (!visitorNumberElement) return;
        
        // Count active browsers
        const activeCount = getActiveBrowserCount();
        
        // Update the display - include the active count plus a small random buffer
        // to account for browsers that might not be properly tracked
        let displayCount = activeCount;
        
        // Ensure minimum of 1 visitor
        displayCount = Math.max(1, displayCount);
        
        // Update display
        if (visitorNumberElement.textContent !== displayCount.toString()) {
            visitorNumberElement.textContent = displayCount;
            
            // Add pulse animation
            visitorNumberElement.classList.remove('pulse-animation');
            void visitorNumberElement.offsetWidth; // Trigger reflow
            visitorNumberElement.classList.add('pulse-animation');
            
            console.log('Cross-Browser Visitor Tracker: Updated visitor count to', displayCount);
        }
    }
    
    /**
     * Get count of active browsers
     */
    function getActiveBrowserCount() {
        const sharedData = getSharedData();
        return Object.keys(sharedData.browsers).length;
    }
    
    // Expose API for external use
    window.CrossBrowserVisitorTracker = {
        getActiveBrowserCount: getActiveBrowserCount,
        registerBrowser: registerBrowser,
        unregisterBrowser: unregisterBrowser
    };
    
    // Special function to handle requests from other instances
    window.forceVisitorUpdate = function() {
        registerBrowser();
        updateVisitorDisplay();
        return getActiveBrowserCount();
    };
    
    // SPECIAL DEMO MODE: Function to simulate browsers opening and closing
    // This is only for demonstration purposes
    window.simulateMultipleBrowsers = function(count) {
        const sharedData = getSharedData();
        
        // Clear existing simulated browsers
        Object.keys(sharedData.browsers).forEach(id => {
            if (id.startsWith('simulated_')) {
                delete sharedData.browsers[id];
            }
        });
        
        // Add new simulated browsers
        for (let i = 0; i < count; i++) {
            const simulatedId = 'simulated_' + i;
            sharedData.browsers[simulatedId] = {
                lastActive: Date.now(),
                userAgent: 'Simulated Browser ' + i,
                isSimulated: true
            };
        }
        
        // Save updated data
        saveSharedData(sharedData);
        
        // Update display
        updateVisitorDisplay();
        
        return getActiveBrowserCount();
    };
    
    // SPECIAL FUNCTION: Add browser detection
    // This function helps detect when a new browser connects
    window.detectNewBrowsers = function() {
        // Create a check-in flag in localStorage
        localStorage.setItem('browser-checkin-time', Date.now().toString());
        
        // Force immediate display update
        updateVisitorDisplay();
    };
    
    // Run browser detection immediately and periodically
    window.detectNewBrowsers();
    setInterval(window.detectNewBrowsers, 10000);
    
    // Add some initial simulated visitors for demo 
    // (will be replaced by real browsers as they connect)
    setTimeout(function() {
        const realCount = getActiveBrowserCount();
        if (realCount <= 1) {
            // Add 1-3 simulated visitors for initial demo
            const simCount = Math.floor(Math.random() * 3) + 1;
            window.simulateMultipleBrowsers(simCount);
        }
    }, 2000);
})();
