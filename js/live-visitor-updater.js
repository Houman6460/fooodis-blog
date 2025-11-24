/**
 * Live Visitor Updater
 * Dynamically updates the live visitor count display with realistic fluctuations
 */

(function() {
    console.log('Live Visitor Updater: Initializing...');
    
    // Base visitor count (starts between 5-12)
    let visitorCount = Math.floor(Math.random() * 8) + 5;
    
    // Start the visitor count update immediately
    updateVisitorCount();
    
    // Set up interval for dynamic updates
    setInterval(updateVisitorCount, Math.floor(Math.random() * 5000) + 3000); // Random interval between 3-8 seconds
    
    /**
     * Update the visitor count with realistic fluctuations
     */
    function updateVisitorCount() {
        // Get the visitor count element
        const visitorElement = document.getElementById('visitor-number');
        if (!visitorElement) return;
        
        // Get current time
        const now = new Date();
        const hour = now.getHours();
        
        // Determine time-based adjustment for realistic patterns
        let timeFactor = 1;
        if (hour >= 9 && hour < 17) {
            // Business hours: higher traffic
            timeFactor = 1.2;
        } else if (hour >= 17 && hour < 22) {
            // Evening: medium traffic
            timeFactor = 1.0;
        } else {
            // Night/early morning: lower traffic
            timeFactor = 0.7;
        }
        
        // Apply random fluctuation (-2 to +3 visitors)
        const fluctuation = Math.floor(Math.random() * 6) - 2;
        
        // Calculate new visitor count
        visitorCount = Math.max(1, Math.round(visitorCount * timeFactor) + fluctuation);
        
        // Cap at reasonable limits
        visitorCount = Math.min(25, Math.max(1, visitorCount));
        
        // Update the display
        visitorElement.textContent = visitorCount;
        
        // Add pulsing animation effect
        visitorElement.classList.remove('pulse-animation');
        void visitorElement.offsetWidth; // Trigger reflow
        visitorElement.classList.add('pulse-animation');
        
        console.log('Live Visitor Updater: Updated count to', visitorCount);
    }
    
    // Add the CSS for animations if not already present
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-animation {
            0% {
                opacity: 1;
            }
            50% {
                opacity: 0.6;
            }
            100% {
                opacity: 1;
            }
        }
        
        .pulse-animation {
            animation: pulse-animation 0.8s ease-out;
        }
        
        @keyframes pulse-dot {
            0% {
                box-shadow: 0 0 0 0 rgba(232, 242, 76, 0.7);
            }
            70% {
                box-shadow: 0 0 0 6px rgba(232, 242, 76, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(232, 242, 76, 0);
            }
        }
        
        .pulse-dot {
            animation: pulse-dot 2s infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Add the pulsing effect to the dot
    const pulseDot = document.querySelector('.pulse-dot');
    if (pulseDot) {
        pulseDot.classList.add('pulse-dot');
    }
})();
