
(function() {
    'use strict';
    
    console.log('Enhanced Reload Prevention: Initializing comprehensive reload loop prevention');
    
    // Track page loads with more sophisticated detection
    let pageLoadCount = parseInt(sessionStorage.getItem('pageLoadCount') || '0');
    let lastLoadTime = parseInt(sessionStorage.getItem('lastLoadTime') || '0');
    let redirectAttempts = parseInt(sessionStorage.getItem('redirectAttempts') || '0');
    const currentTime = Date.now();
    
    // Reset counters if more than 10 seconds have passed
    if (currentTime - lastLoadTime > 10000) {
        pageLoadCount = 0;
        redirectAttempts = 0;
    }
    
    pageLoadCount++;
    sessionStorage.setItem('pageLoadCount', pageLoadCount.toString());
    sessionStorage.setItem('lastLoadTime', currentTime.toString());
    
    console.log('Enhanced Reload Prevention: Page load count:', pageLoadCount, 'Redirect attempts:', redirectAttempts);
    
    // If more than 3 loads in 10 seconds, activate enhanced protection
    if (pageLoadCount > 3) {
        console.warn('Enhanced Reload Prevention: Rapid reload detected, activating protection mode');
        
        // Block all redirect attempts
        const originalReplace = window.location.replace;
        const originalAssign = window.location.assign;
        const originalReload = window.location.reload;
        
        // Override window.location methods
        window.location.replace = function(url) {
            redirectAttempts++;
            sessionStorage.setItem('redirectAttempts', redirectAttempts.toString());
            console.warn('Enhanced Reload Prevention: Blocked location.replace to:', url);
            return false;
        };
        
        window.location.assign = function(url) {
            redirectAttempts++;
            sessionStorage.setItem('redirectAttempts', redirectAttempts.toString());
            console.warn('Enhanced Reload Prevention: Blocked location.assign to:', url);
            return false;
        };
        
        window.location.reload = function() {
            redirectAttempts++;
            sessionStorage.setItem('redirectAttempts', redirectAttempts.toString());
            console.warn('Enhanced Reload Prevention: Blocked location.reload');
            return false;
        };
        
        // Block history API
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;
        
        window.history.pushState = function() {
            console.warn('Enhanced Reload Prevention: Blocked history.pushState');
            return false;
        };
        
        window.history.replaceState = function() {
            console.warn('Enhanced Reload Prevention: Blocked history.replaceState');
            return false;
        };
        
        // Override location setter
        let locationBlocked = false;
        const originalLocation = window.location;
        
        try {
            Object.defineProperty(window, 'location', {
                get: function() {
                    return originalLocation;
                },
                set: function(value) {
                    if (!locationBlocked) {
                        redirectAttempts++;
                        sessionStorage.setItem('redirectAttempts', redirectAttempts.toString());
                        console.warn('Enhanced Reload Prevention: Blocked location set to:', value);
                        locationBlocked = true;
                        
                        // Show user notification
                        showReloadBlockedNotification();
                    }
                    return false;
                },
                configurable: true
            });
        } catch (e) {
            console.warn('Enhanced Reload Prevention: Could not override location property:', e);
        }
        
        // Block meta refresh and form submissions
        document.addEventListener('DOMContentLoaded', function() {
            // Remove meta refresh tags
            const metaRefresh = document.querySelectorAll('meta[http-equiv="refresh"]');
            metaRefresh.forEach(meta => {
                console.warn('Enhanced Reload Prevention: Removed meta refresh tag');
                meta.remove();
            });
            
            // Block form submissions that might cause redirects
            document.addEventListener('submit', function(e) {
                const form = e.target;
                if (form.action && (form.action.includes('login') || form.action.includes('auth'))) {
                    console.warn('Enhanced Reload Prevention: Blocked potentially problematic form submission');
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true);
        });
        
        // Set a recovery timer
        setTimeout(function() {
            console.log('Enhanced Reload Prevention: Recovery timer activated, resetting protection');
            pageLoadCount = 0;
            redirectAttempts = 0;
            sessionStorage.setItem('pageLoadCount', '0');
            sessionStorage.setItem('redirectAttempts', '0');
            
            // Restore original methods
            window.location.replace = originalReplace;
            window.location.assign = originalAssign;
            window.location.reload = originalReload;
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            
            locationBlocked = false;
        }, 30000); // 30 seconds recovery
    }
    
    // Enhanced redirect blocking for auth scripts
    window.addEventListener('beforeunload', function(e) {
        if (pageLoadCount > 3) {
            console.warn('Enhanced Reload Prevention: Blocking beforeunload');
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
    
    // Block auth redirects specifically
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay) {
        if (typeof fn === 'function') {
            const fnString = fn.toString();
            if (fnString.includes('window.location') || fnString.includes('location.href') || 
                fnString.includes('dashboard.html') || fnString.includes('login.html')) {
                console.warn('Enhanced Reload Prevention: Blocked suspicious setTimeout redirect');
                return 0;
            }
        }
        return originalSetTimeout.apply(this, arguments);
    };
    
    function showReloadBlockedNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <strong>Reload Loop Detected</strong><br>
            Automatic redirects have been blocked to prevent infinite loops.<br>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: white; color: #ff4444; border: none; border-radius: 3px; cursor: pointer;">Manual Refresh</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }
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
