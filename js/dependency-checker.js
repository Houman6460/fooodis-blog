/**
 * Dependency Checker for Fooodis Blog System
 * Handles waiting for dependencies to be available before executing code
 */

window.DependencyChecker = {
    /**
     * Wait for a dependency to be available
     * @param {string} dependencyPath - Path to dependency (e.g., 'window.functionName' or 'window.objectName.method')
     * @param {Function} callback - Function to call when dependency is available
     * @param {number} maxAttempts - Maximum number of attempts before giving up
     * @param {number} interval - Time between attempts in milliseconds
     */
    waitFor: function(dependencyPath, callback, maxAttempts = 30, interval = 200) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            
            // Check if dependency exists by traversing the path
            const dependencyExists = this.checkDependencyExists(dependencyPath);
            
            if (dependencyExists) {
                console.log(`Dependency found: ${dependencyPath}`);
                clearInterval(checkInterval);
                callback();
            } else if (attempts >= maxAttempts) {
                console.error(`Failed to load dependency: ${dependencyPath} after ${maxAttempts} attempts`);
                clearInterval(checkInterval);
            } else {
                console.log(`Waiting for dependency: ${dependencyPath} (attempt ${attempts}/${maxAttempts})`);
            }
        }, interval);
    },
    
    /**
     * Check if a dependency exists by traversing the path
     * @param {string} path - Path to dependency
     * @returns {boolean} True if dependency exists
     */
    checkDependencyExists: function(path) {
        const parts = path.split('.');
        let current = window;
        
        for (const part of parts) {
            if (current === undefined || current === null || !current.hasOwnProperty(part)) {
                return false;
            }
            current = current[part];
        }
        
        return typeof current !== 'undefined';
    }
};

console.log('Dependency Checker loaded successfully');
