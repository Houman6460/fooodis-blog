/**
 * Live Visitor Tracker
 * Simulates real-time visitor tracking for the Fooodis blog dashboard
 */

(function() {
    console.log('Live Visitor Tracker: Initializing...');
    
    // Base number of visitors (between 3-12)
    let baseVisitors = Math.floor(Math.random() * 10) + 3;
    
    // Store the visitor history in localStorage
    let visitorHistory = [];
    try {
        const savedHistory = localStorage.getItem('fooodis-live-visitors-history');
        if (savedHistory) {
            visitorHistory = JSON.parse(savedHistory);
        }
    } catch (error) {
        console.error('Live Visitor Tracker: Error loading history', error);
    }
    
    // Initialize the live visitor element in the DOM
    initializeLiveVisitorElement();
    
    // Update visitor count every 5-15 seconds
    let updateInterval;
    
    function startTracking() {
        // Initial update
        updateVisitorCount();
        
        // Set up interval for updates
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        updateInterval = setInterval(() => {
            updateVisitorCount();
        }, Math.floor(Math.random() * 10000) + 5000); // Random interval between 5-15 seconds
    }
    
    /**
     * Update the current visitor count with realistic fluctuations
     */
    function updateVisitorCount() {
        // Get current time
        const now = new Date();
        
        // Determine time-based adjustment factor (more visitors during business hours)
        const hour = now.getHours();
        let timeFactor = 1;
        
        if (hour >= 9 && hour < 17) {
            // Business hours: 9 AM - 5 PM gets higher traffic
            timeFactor = 1.5;
        } else if (hour >= 17 && hour < 22) {
            // Evening: 5 PM - 10 PM gets medium traffic
            timeFactor = 1.2;
        } else {
            // Late night/early morning: gets lower traffic
            timeFactor = 0.7;
        }
        
        // Apply random fluctuation (±2 visitors)
        const fluctuation = Math.floor(Math.random() * 5) - 2;
        
        // Calculate new visitor count with time factor and fluctuation
        let newVisitorCount = Math.max(1, Math.round(baseVisitors * timeFactor) + fluctuation);
        
        // Occasional traffic spike (5% chance)
        if (Math.random() < 0.05) {
            newVisitorCount += Math.floor(Math.random() * 8) + 3; // Add 3-10 visitors
            console.log('Live Visitor Tracker: Traffic spike detected!');
        }
        
        // Ensure minimum of 1 visitor
        newVisitorCount = Math.max(1, newVisitorCount);
        
        // Update the display
        updateVisitorDisplay(newVisitorCount);
        
        // Record in history (keeping last 100 data points)
        visitorHistory.push({
            timestamp: now.toISOString(),
            count: newVisitorCount
        });
        
        // Keep history at 100 points max
        if (visitorHistory.length > 100) {
            visitorHistory = visitorHistory.slice(visitorHistory.length - 100);
        }
        
        // Save history to localStorage
        try {
            localStorage.setItem('fooodis-live-visitors-history', JSON.stringify(visitorHistory));
        } catch (error) {
            console.error('Live Visitor Tracker: Error saving history', error);
        }
        
        return newVisitorCount;
    }
    
    /**
     * Update the visitor display in the dashboard
     */
    function updateVisitorDisplay(visitorCount) {
        const liveVisitorElement = document.getElementById('live-visitor-count');
        if (liveVisitorElement) {
            // Update the visitor count
            liveVisitorElement.textContent = visitorCount;
            
            // Add a subtle animation
            liveVisitorElement.classList.remove('pulse-animation');
            void liveVisitorElement.offsetWidth; // Trigger reflow
            liveVisitorElement.classList.add('pulse-animation');
            
            console.log('Live Visitor Tracker: Updated visitor count to', visitorCount);
        }
    }
    
    /**
     * Initialize the live visitor element in the DOM
     */
    function initializeLiveVisitorElement() {
        // Only proceed if we're on the dashboard page
        if (!document.querySelector('.blog-stats-section')) {
            return;
        }
        
        console.log('Live Visitor Tracker: Initializing visitor element');
        
        // Check if the element already exists
        if (document.getElementById('live-visitors-card')) {
            startTracking();
            return;
        }
        
        // Find the stats cards container
        const statsCardsContainer = document.querySelector('.stats-summary, .stats-cards, .dashboard-stats');
        if (!statsCardsContainer) {
            console.error('Live Visitor Tracker: Stats container not found');
            return;
        }
        
        // Create the live visitors card
        const liveVisitorsCard = document.createElement('div');
        liveVisitorsCard.id = 'live-visitors-card';
        liveVisitorsCard.className = 'stats-card live-visitors';
        
        liveVisitorsCard.innerHTML = `
            <h3 class="card-title">
                <span class="pulse-dot"></span>
                Live Visitors
            </h3>
            <div class="card-value">
                <strong id="live-visitor-count" class="visitor-count">--</strong>
                <span class="visitor-label">online now</span>
            </div>
        `;
        
        // Add styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .stats-card.live-visitors {
                position: relative;
                overflow: hidden;
            }
            
            .pulse-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                background-color: #e8f24c;
                border-radius: 50%;
                margin-right: 8px;
                position: relative;
            }
            
            .pulse-dot:after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: #e8f24c;
                border-radius: 50%;
                animation: pulse 2s infinite;
                z-index: 0;
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                70% {
                    transform: scale(2);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
            
            .visitor-count {
                color: #e8f24c;
                font-size: 24px;
                font-weight: 700;
            }
            
            .visitor-label {
                color: #a0a0a0;
                font-size: 14px;
                margin-left: 5px;
            }
            
            .pulse-animation {
                animation: highlight-pulse 1s ease-out;
            }
            
            @keyframes highlight-pulse {
                0% {
                    color: #e8f24c;
                }
                50% {
                    color: #ffffff;
                }
                100% {
                    color: #e8f24c;
                }
            }
        `;
        
        // Add the style to the head
        document.head.appendChild(styleElement);
        
        // Add the card to the stats container
        statsCardsContainer.appendChild(liveVisitorsCard);
        
        // Start tracking after a short delay
        setTimeout(startTracking, 500);
    }
    
    // Initialize live visitor element when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLiveVisitorElement);
    } else {
        initializeLiveVisitorElement();
    }
    
    // Also initialize on window load
    window.addEventListener('load', function() {
        initializeLiveVisitorElement();
        // Try again after a delay to catch late DOM updates
        setTimeout(initializeLiveVisitorElement, 1000);
    });
    
    // Expose the visitor tracker API to the window object for potential integration
    window.LiveVisitorTracker = {
        getCurrentVisitorCount: function() {
            const liveVisitorElement = document.getElementById('live-visitor-count');
            return liveVisitorElement ? parseInt(liveVisitorElement.textContent) || 0 : 0;
        },
        getVisitorHistory: function() {
            return [...visitorHistory];
        }
    };
})();
