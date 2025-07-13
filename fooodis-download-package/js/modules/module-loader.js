/**
 * Module Loader
 * Handles dynamic loading of JavaScript modules for the Fooodis Blog System
 */

const ModuleLoader = {
  loadedModules: {},
  
  /**
   * Convert hyphenated names to camelCase (e.g., api-service → apiService)
   * @param {string} name - The module name with hyphens
   * @return {string} The camelCase version of the name
   */
  convertToCamelCase: function(name) {
    return name.replace(/-([a-z])/g, function(match, letter) {
      return letter.toUpperCase();
    });
  },
  
  /**
   * Load a module from the specified path
   * @param {string} moduleName - Name of the module to load
   * @param {string} modulePath - Path to the module file
   * @return {Promise} Promise that resolves when the module is loaded
   */
  loadModule: function(moduleName, modulePath) {
    return new Promise((resolve, reject) => {
      try {
        // Convert hyphenated names to camelCase for namespace
        const namespace = this.convertToCamelCase(moduleName);
        
        // Create script element
        const script = document.createElement('script');
        script.src = modulePath || `./js/modules/${moduleName}.js`;
        script.async = true;
        
        // Set up load and error handlers
        script.onload = () => {
          console.log(`Module ${moduleName} loaded successfully`);
          // Check if the module namespace is defined
          if (window[namespace]) {
            this.loadedModules[moduleName] = window[namespace];
            resolve(window[namespace]);
          } else {
            console.error(`Module loaded but namespace ${namespace} not defined`);
            reject(new Error(`Module namespace ${namespace} not found`));
          }
        };
        
        script.onerror = () => {
          console.error(`Failed to load module: ${moduleName}`);
          reject(new Error(`Failed to load module: ${moduleName}`));
        };
        
        // Add script to document
        document.head.appendChild(script);
      } catch (error) {
        console.error(`Error loading module ${moduleName}:`, error);
        reject(error);
      }
    });
  },
  
  /**
   * Get a loaded module instance
   * @param {string} moduleName - Name of the module to get
   * @return {Object} The module instance or null if not loaded
   */
  getModule: function(moduleName) {
    return this.loadedModules[moduleName] || null;
  },
  
  /**
   * Initialize core modules required by the application
   * @return {Promise} Promise that resolves when all core modules are loaded
   */
  initCoreModules: function() {
    const coreModules = [
      'storage-manager', 
      'api-service', 
      'execution-manager',
      'scheduler-manager'
    ];
    
    const modulePromises = coreModules.map(module => this.loadModule(module));
    
    return Promise.all(modulePromises)
      .then(modules => {
        console.log('All core modules loaded successfully');
        return modules;
      })
      .catch(error => {
        console.error('Failed to load core modules:', error);
        throw error;
      });
  }
};

// Make ModuleLoader globally available
window.ModuleLoader = ModuleLoader;
