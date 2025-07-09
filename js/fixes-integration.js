
// Fixes Integration - Comprehensive fix loading and management system
(function() {
    'use strict';
    
    console.log('Fixes Integration: Starting comprehensive fix system');
    
    class FixesIntegration {
        constructor() {
            this.loadedFixes = new Set();
            this.criticalFixes = [
                'force-v2-section',
                'icon-stabilizer', 
                'immediate-init',
                'status-card-rebuild',
                'storage-initialization-fix'
            ];
            this.systemHealth = {
                lastCheck: null,
                status: 'initializing',
                issues: []
            };
            this.init();
        }
        
        init() {
            console.log('Fixes Integration: Initializing fix management system');
            
            // Initialize core systems first
            this.initializeCoreObjects();
            
            // Load critical fixes
            this.loadCriticalFixes();
            
            // Set up monitoring
            this.setupMonitoring();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            console.log('Fixes Integration: System initialized');
        }
        
        initializeCoreObjects() {
            // Ensure all critical objects exist
            if (!window.FoodisChatbot) {
                window.FoodisChatbot = {
                    initialized: true,
                    conversations: [],
                    config: {},
                    api: {}
                };
            }
            
            if (!window.FoodisAutomation) {
                window.FoodisAutomation = {
                    initialized: true,
                    paths: [],
                    status: {},
                    scheduler: {}
                };
            }
            
            // Fix for Color Format Fix loops
            if (!window.EmailPopupEnhancer) {
                window.EmailPopupEnhancer = {
                    hexToRgb: function(hex) {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return result ? {
                            r: parseInt(result[1], 16),
                            g: parseInt(result[2], 16),
                            b: parseInt(result[3], 16)
                        } : null;
                    }
                };
                console.log('Fixes Integration: EmailPopupEnhancer initialized');
            }
        }
        
        loadCriticalFixes() {
            console.log('Fixes Integration: Loading critical fixes');
            
            this.criticalFixes.forEach(fixName => {
                this.loadFix(fixName);
            });
        }
        
        loadFix(fixName) {
            if (this.loadedFixes.has(fixName)) {
                return;
            }
            
            console.log(`Fixes Integration: Loading fix - ${fixName}`);
            
            try {
                // Check if script already exists
                const existingScript = document.querySelector(`script[src*="${fixName}"]`);
                if (existingScript) {
                    this.loadedFixes.add(fixName);
                    return;
                }
                
                // Load the fix
                const script = document.createElement('script');
                script.src = `js/${fixName}.js`;
                script.async = true;
                
                script.onload = () => {
                    this.loadedFixes.add(fixName);
                    console.log(`Fixes Integration: Successfully loaded ${fixName}`);
                };
                
                script.onerror = () => {
                    console.warn(`Fixes Integration: Failed to load ${fixName}`);
                    this.handleMissingFix(fixName);
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                console.error(`Fixes Integration: Error loading ${fixName}:`, error);
                this.handleMissingFix(fixName);
            }
        }
        
        handleMissingFix(fixName) {
            console.log(`Fixes Integration: Implementing fallback for ${fixName}`);
            
            // Implement basic fallbacks for critical fixes
            switch (fixName) {
                case 'immediate-init':
                    this.implementImmediateInitFallback();
                    break;
                case 'force-v2-section':
                    this.implementForceV2Fallback();
                    break;
                case 'icon-stabilizer':
                    this.implementIconStabilizerFallback();
                    break;
                case 'status-card-rebuild':
                    this.implementStatusCardFallback();
                    break;
                case 'storage-initialization-fix':
                    this.implementStorageFixFallback();
                    break;
            }
            
            this.loadedFixes.add(fixName + '-fallback');
        }
        
        implementImmediateInitFallback() {
            console.log('Fixes Integration: Implementing immediate init fallback');
            this.initializeCoreObjects();
        }
        
        implementForceV2Fallback() {
            console.log('Fixes Integration: Implementing V2 section fallback');
            const v2Sections = document.querySelectorAll('[id*="v2"], [class*="v2"]');
            v2Sections.forEach(section => {
                section.style.display = 'block';
                section.style.visibility = 'visible';
            });
        }
        
        implementIconStabilizerFallback() {
            console.log('Fixes Integration: Implementing icon stabilizer fallback');
            const icons = document.querySelectorAll('i[class*="fa-"], .icon');
            icons.forEach(icon => {
                icon.style.visibility = 'visible';
                icon.style.display = 'inline-block';
            });
        }
        
        implementStatusCardFallback() {
            console.log('Fixes Integration: Implementing status card fallback');
            // Basic status card rebuild functionality
            window.rebuildStatusCards = function() {
                console.log('Status cards rebuild triggered (fallback)');
            };
        }
        
        implementStorageFixFallback() {
            console.log('Fixes Integration: Implementing storage fix fallback');
            // Ensure basic storage keys exist
            const defaults = {
                'aiConfig': '{}',
                'aiAutomationPaths': '[]'
            };
            
            Object.keys(defaults).forEach(key => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, defaults[key]);
                }
            });
        }
        
        setupErrorHandling() {
            window.addEventListener('error', (error) => {
                this.handleGlobalError(error);
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                this.handleGlobalError(event.reason);
            });
        }
        
        handleGlobalError(error) {
            const errorMsg = error.toString();
            console.log(`Fixes Integration: Handling error - ${errorMsg}`);
            
            // Try to recover from common errors
            if (errorMsg.includes('not defined')) {
                this.attemptRecovery(error);
            }
        }
        
        attemptRecovery(error) {
            const errorMsg = error.toString();
            
            if (errorMsg.includes('FoodisChatbot is not defined')) {
                console.log('Fixes Integration: Attempting FoodisChatbot recovery');
                this.initializeCoreObjects();
            } else if (errorMsg.includes('AutomationCategoryManager')) {
                console.log('Fixes Integration: Attempting AutomationCategoryManager recovery');
                this.loadFix('automation-category-manager');
            }
        }
        
        setupMonitoring() {
            // Monitor system health every 30 seconds
            setInterval(() => {
                this.checkSystemHealth();
            }, 30000);
            
            // Initial health check
            setTimeout(() => {
                this.checkSystemHealth();
            }, 5000);
        }
        
        checkSystemHealth() {
            const healthStatus = {
                timestamp: new Date().toISOString(),
                criticalObjects: this.checkCriticalObjects(),
                loadedFixes: Array.from(this.loadedFixes),
                domReady: document.readyState === 'complete',
                errors: []
            };
            
            this.systemHealth = {
                lastCheck: healthStatus.timestamp,
                status: healthStatus.criticalObjects.every(obj => obj.exists) ? 'healthy' : 'degraded',
                details: healthStatus
            };
            
            console.log('Fixes Integration: System health check completed', this.systemHealth.status);
        }
        
        checkCriticalObjects() {
            const criticalPaths = [
                'window.FoodisChatbot',
                'window.FoodisAutomation', 
                'window.FoodisConfig',
                'window.EmailPopupEnhancer'
            ];
            
            return criticalPaths.map(path => ({
                path,
                exists: this.checkObjectPath(path)
            }));
        }
        
        checkObjectPath(path) {
            try {
                const parts = path.split('.');
                let obj = window;
                for (let i = 1; i < parts.length; i++) {
                    obj = obj[parts[i]];
                    if (obj === undefined) return false;
                }
                return true;
            } catch (e) {
                return false;
            }
        }
        
        // Public methods
        getSystemHealth() {
            return this.systemHealth;
        }
        
        reloadFix(fixName) {
            this.loadedFixes.delete(fixName);
            this.loadFix(fixName);
        }
        
        getLoadedFixes() {
            return Array.from(this.loadedFixes);
        }
    }
    
    // Initialize the fixes integration system
    window.fixesIntegration = new FixesIntegration();
    
    // Global diagnostic function
    window.diagnoseFixes = function() {
        return window.fixesIntegration.getSystemHealth();
    };
    
    console.log('Fixes Integration: Comprehensive fix system is now active');
})();
