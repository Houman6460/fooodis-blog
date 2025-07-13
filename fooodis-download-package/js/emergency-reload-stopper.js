
/**
 * Emergency Reload Stopper
 * This script immediately stops all reload attempts when the page load count is high
 */

(function() {
    'use strict';
    
    // Immediately check for reload loops
    const pageLoadCount = parseInt(sessionStorage.getItem('pageLoadCount') || '0');
    
    if (pageLoadCount > 2) {
        console.error('EMERGENCY RELOAD STOPPER: Activated due to high page load count:', pageLoadCount);
        
        // Immediately override all redirect methods
        window.location.replace = function() { 
            console.error('EMERGENCY: Blocked location.replace'); 
            return false; 
        };
        window.location.assign = function() { 
            console.error('EMERGENCY: Blocked location.assign'); 
            return false; 
        };
        window.location.reload = function() { 
            console.error('EMERGENCY: Blocked location.reload'); 
            return false; 
        };
        
        // Block location setter
        try {
            const originalLocation = window.location;
            Object.defineProperty(window, 'location', {
                get: function() { return originalLocation; },
                set: function() { 
                    console.error('EMERGENCY: Blocked location setter'); 
                    return false; 
                },
                configurable: false
            });
        } catch (e) {
            console.error('EMERGENCY: Could not override location:', e);
        }
        
        // Block history API
        window.history.pushState = function() { 
            console.error('EMERGENCY: Blocked pushState'); 
            return false; 
        };
        window.history.replaceState = function() { 
            console.error('EMERGENCY: Blocked replaceState'); 
            return false; 
        };
        
        // Block all timeouts that might contain redirects
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(fn, delay) {
            if (typeof fn === 'function' && fn.toString().includes('location')) {
                console.error('EMERGENCY: Blocked suspicious setTimeout');
                return 0;
            }
            return originalSetTimeout.apply(this, arguments);
        };
        
        // Show emergency notification
        document.addEventListener('DOMContentLoaded', function() {
            const emergency = document.createElement('div');
            emergency.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff0000;
                color: white;
                padding: 20px;
                text-align: center;
                z-index: 999999;
                font-family: Arial, sans-serif;
                font-size: 16px;
                font-weight: bold;
            `;
            emergency.innerHTML = `
                🚨 EMERGENCY RELOAD PROTECTION ACTIVATED 🚨<br>
                Infinite reload loop detected and stopped.<br>
                <button onclick="sessionStorage.clear(); location.reload();" style="margin-top: 10px; padding: 10px 20px; background: white; color: red; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">RESET & REFRESH</button>
            `;
            document.body.insertBefore(emergency, document.body.firstChild);
        });
    }
})();
