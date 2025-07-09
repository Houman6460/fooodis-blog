
(function() {
    'use strict';
    
    console.log('Reload Prevention: Initializing reload loop prevention');
    
    // Track page loads to detect rapid reloading
    let pageLoadCount = parseInt(sessionStorage.getItem('pageLoadCount') || '0');
    let lastLoadTime = parseInt(sessionStorage.getItem('lastLoadTime') || '0');
    const currentTime = Date.now();
    
    // Reset counter if more than 5 seconds have passed
    if (currentTime - lastLoadTime > 5000) {
        pageLoadCount = 0;
    }
    
    pageLoadCount++;
    sessionStorage.setItem('pageLoadCount', pageLoadCount.toString());
    sessionStorage.setItem('lastLoadTime', currentTime.toString());
    
    console.log('Reload Prevention: Page load count:', pageLoadCount);
    
    // If more than 5 loads in 5 seconds, prevent further redirects
    if (pageLoadCount > 5) {
        console.warn('Reload Prevention: Rapid reload detected, blocking redirects');
        
        // Override location changes temporarily
        const originalLocation = window.location;
        let redirectBlocked = false;
        
        Object.defineProperty(window, 'location', {
            get: function() {
                return originalLocation;
            },
            set: function(value) {
                if (!redirectBlocked) {
                    console.warn('Reload Prevention: Blocking redirect to:', value);
                    redirectBlocked = true;
                    
                    // Show user-friendly message
                    const message = document.createElement('div');
                    message.style.cssText = `
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #f44336;
                        color: white;
                        padding: 15px 20px;
                        border-radius: 5px;
                        z-index: 10000;
                        font-family: Arial, sans-serif;
                    `;
                    message.textContent = 'Reload loop detected. Refreshing page manually may help.';
                    document.body.appendChild(message);
                    
                    // Remove message after 5 seconds
                    setTimeout(() => {
                        if (message.parentNode) {
                            message.parentNode.removeChild(message);
                        }
                        // Reset session storage
                        sessionStorage.removeItem('pageLoadCount');
                        sessionStorage.removeItem('lastLoadTime');
                    }, 5000);
                }
            }
        });
        
        // Also block window.location.href assignments
        const originalHref = Object.getOwnPropertyDescriptor(Location.prototype, 'href') || 
                           Object.getOwnPropertyDescriptor(window.location, 'href');
        
        if (originalHref && originalHref.set) {
            Object.defineProperty(window.location, 'href', {
                get: originalHref.get,
                set: function(value) {
                    if (!redirectBlocked) {
                        console.warn('Reload Prevention: Blocking href redirect to:', value);
                        redirectBlocked = true;
                    }
                }
            });
        }
    }
    
    // Reduce frequency of automatic checks more gradually
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay) {
        // Increase delay for very frequent intervals, but less aggressively
        if (delay < 500) {
            const newDelay = Math.max(delay * 1.5, 500);
            console.log('Reload Prevention: Increasing interval delay from', delay, 'to', newDelay);
            delay = newDelay;
        }
        return originalSetInterval.call(this, callback, delay);
    };
    
    console.log('Reload Prevention: System initialized');
})();
