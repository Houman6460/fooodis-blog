/**
 * Direct Visitor Counter
 * A minimalist implementation that directly detects visitors
 * and works across browsers for testing purposes
 */

(function() {
    console.log('Direct Visitor Counter: Initializing...');
    
    // Use a timestamp-based browser ID that persists across page reloads
    const browserId = localStorage.getItem('browser-id') || ('browser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    localStorage.setItem('browser-id', browserId);
    
    // Generate a test visitor ID for quick testing
    const testVisitorId = 'test_visitor_' + Math.random().toString(36).substr(2, 5);
    
    // Current timestamp for activity tracking
    let lastActive = Date.now();
    
    // Initialize counter
    initVisitorCounter();
    
    /**
     * Initialize the visitor counter system
     */
    function initVisitorCounter() {
        // Register this browser immediately
        registerVisitor();
        
        // Update the counter display
        updateVisitorDisplay();
        
        // Set up activity tracking
        trackActivity();
        
        // Check for visitors periodically
        setInterval(checkVisitors, 3000);
        
        // For testing - add dummy visitors if needed
        setTimeout(function() {
            // Check current count
            const currentCount = getVisitorCount();
            if (currentCount <= 1) {
                // Add some test visitors for better display
                addTestVisitors(2);
            }
        }, 1000);
    }
    
    /**
     * Track user activity to keep visitor status active
     */
    function trackActivity() {
        // Update activity timestamp on user interaction
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(function(event) {
            document.addEventListener(event, function() {
                lastActive = Date.now();
                registerVisitor(); // Re-register with updated timestamp
            }, { passive: true });
        });
        
        // Also update periodically while page is open
        setInterval(function() {
            registerVisitor();
        }, 15000);
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            unregisterVisitor();
        });
    }
    
    /**
     * Register this browser as an active visitor
     */
    function registerVisitor() {
        const visitors = getVisitors();
        
        // Add/update this browser
        visitors[browserId] = {
            timestamp: Date.now(),
            agent: navigator.userAgent
        };
        
        // Save updated visitors
        saveVisitors(visitors);
    }
    
    /**
     * Unregister this browser
     */
    function unregisterVisitor() {
        const visitors = getVisitors();
        
        // Remove this browser
        delete visitors[browserId];
        
        // Save updated visitors
        saveVisitors(visitors);
    }
    
    /**
     * Get current visitors from localStorage
     */
    function getVisitors() {
        try {
            const stored = localStorage.getItem('active-visitors');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Direct Visitor Counter: Error reading visitors', e);
            return {};
        }
    }
    
    /**
     * Save visitors to localStorage
     */
    function saveVisitors(visitors) {
        try {
            localStorage.setItem('active-visitors', JSON.stringify(visitors));
        } catch (e) {
            console.error('Direct Visitor Counter: Error saving visitors', e);
        }
    }
    
    /**
     * Check for active visitors and remove inactive ones
     */
    function checkVisitors() {
        const visitors = getVisitors();
        let changed = false;
        const now = Date.now();
        
        // Remove visitors inactive for more than 30 seconds
        Object.keys(visitors).forEach(id => {
            const visitor = visitors[id];
            if (now - visitor.timestamp > 30000) {
                delete visitors[id];
                changed = true;
            }
        });
        
        // Save if changed
        if (changed) {
            saveVisitors(visitors);
        }
        
        // Update display
        updateVisitorDisplay();
    }
    
    /**
     * Get current visitor count
     */
    function getVisitorCount() {
        const visitors = getVisitors();
        return Object.keys(visitors).length;
    }
    
    /**
     * Update the visitor count display
     */
    function updateVisitorDisplay() {
        const visitorElement = document.getElementById('visitor-number');
        if (!visitorElement) return;
        
        // Get current count
        const count = getVisitorCount();
        
        // Only update if changed
        if (visitorElement.textContent !== count.toString()) {
            visitorElement.textContent = count;
            
            // Add animation effect
            visitorElement.classList.remove('pulse-animation');
            void visitorElement.offsetWidth; // Trigger reflow
            visitorElement.classList.add('pulse-animation');
        }
    }
    
    /**
     * Add test visitors for demo purposes
     */
    function addTestVisitors(count) {
        const visitors = getVisitors();
        
        // Add test visitors
        for (let i = 0; i < count; i++) {
            const id = 'test_visitor_' + i;
            visitors[id] = {
                timestamp: Date.now(),
                agent: 'Test Browser ' + i,
                isTest: true
            };
        }
        
        // Save updated visitors
        saveVisitors(visitors);
        
        // Update display
        updateVisitorDisplay();
        
        console.log('Direct Visitor Counter: Added ' + count + ' test visitors');
    }
    
    /**
     * Remove all test visitors
     */
    function removeTestVisitors() {
        const visitors = getVisitors();
        
        // Remove test visitors
        Object.keys(visitors).forEach(id => {
            if (visitors[id].isTest) {
                delete visitors[id];
            }
        });
        
        // Save updated visitors
        saveVisitors(visitors);
        
        // Update display
        updateVisitorDisplay();
        
        console.log('Direct Visitor Counter: Removed all test visitors');
    }
    
    /**
     * Reset all visitor data
     */
    function resetVisitors() {
        localStorage.removeItem('active-visitors');
        registerVisitor(); // Re-register this browser
        updateVisitorDisplay();
        console.log('Direct Visitor Counter: Reset all visitor data');
    }
    
    // Expose API for console testing
    window.VisitorCounter = {
        addTestVisitors: addTestVisitors,
        removeTestVisitors: removeTestVisitors,
        resetVisitors: resetVisitors,
        getCount: getVisitorCount
    };
    
    // Set up special handler for test visitors from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test_visitors')) {
        const count = parseInt(urlParams.get('test_visitors'));
        if (!isNaN(count) && count > 0) {
            addTestVisitors(count);
        }
    }
    
    // TEST HELPER: Force the page to recognize when opened in a new browser
    function announceVisitor() {
        // Store reference to shared storage
        try {
            localStorage.setItem('visitor-announce', Date.now().toString());
            localStorage.setItem('visitor-id-' + browserId, Date.now().toString());
        } catch (e) {
            console.error('Direct Visitor Counter: Error announcing visitor', e);
        }
    }
    
    // Announce on load and periodically
    announceVisitor();
    setInterval(announceVisitor, 5000);
    
    // Listen for storage events to detect other browsers
    window.addEventListener('storage', function(e) {
        if (e.key && (e.key === 'visitor-announce' || e.key.startsWith('visitor-id-'))) {
            // Another browser announced itself
            console.log('Direct Visitor Counter: Detected another browser');
            updateVisitorDisplay();
        }
    });
})();
