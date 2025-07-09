
/**
 * Core Intercept - Essential browser function interceptor
 * Prevents infinite reload loops and manages core browser interactions
 */

(function() {
    'use strict';
    
    console.log('Core Intercept: Initializing...');
    
    // Prevent multiple initializations
    if (window.coreInterceptInitialized) {
        console.log('Core Intercept: Already initialized');
        return;
    }
    
    window.coreInterceptInitialized = true;
    
    // Track reload attempts
    let reloadAttempts = parseInt(sessionStorage.getItem('reloadAttempts') || '0');
    
    // Reset if more than 30 seconds have passed
    const lastReload = parseInt(sessionStorage.getItem('lastReloadTime') || '0');
    const now = Date.now();
    
    if (now - lastReload > 30000) {
        reloadAttempts = 0;
    }
    
    sessionStorage.setItem('lastReloadTime', now.toString());
    
    // Intercept location changes if too many reloads
    if (reloadAttempts > 3) {
        console.warn('Core Intercept: Preventing reload loop');
        
        const originalReload = window.location.reload;
        window.location.reload = function() {
            console.warn('Core Intercept: Reload blocked to prevent loop');
            return false;
        };
        
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            console.warn('Core Intercept: Replace blocked, URL:', url);
            return false;
        };
    } else {
        sessionStorage.setItem('reloadAttempts', (reloadAttempts + 1).toString());
    }
    
    // Safe console override to prevent errors
    if (!window.console) {
        window.console = {
            log: function() {},
            error: function() {},
            warn: function() {},
            info: function() {}
        };
    }
    
    console.log('Core Intercept: Initialization complete');
})();
