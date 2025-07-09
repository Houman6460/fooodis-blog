
// Fixes Integration - Coordinates all system fixes and ensures proper loading order
class FixesIntegration {
    constructor() {
        this.loadedFixes = new Set();
        this.pendingFixes = new Map();
        this.dependencies = new Map();
        this.initialize();
    }

    initialize() {
        console.log('Fixes Integration: Initializing system...');
        this.setupDependencies();
        this.loadCriticalFixes();
        this.setupGlobalErrorHandling();
        this.monitorSystemHealth();
    }

    setupDependencies() {
        // Define fix dependencies
        this.dependencies.set('chatbot-management', ['auth-manager']);
        this.dependencies.set('automation-category-manager', ['ai-automation']);
        this.dependencies.set('enhanced-banner-fixed', []);
        this.dependencies.set('automation-card-fix', ['ai-automation']);
        this.dependencies.set('email-subscribers-media-thumbnail-fix', []);
    }

    loadCriticalFixes() {
        const criticalFixes = [
            'comprehensive-error-prevention',
            'enhanced-banner-fixed', 
            'automation-card-fix',
            'email-subscribers-media-thumbnail-fix'
        ];

        criticalFixes.forEach(fix => {
            this.loadFix(fix);
        });
    }

    loadFix(fixName) {
        if (this.loadedFixes.has(fixName)) {
            console.log('Fixes Integration: Fix already loaded:', fixName);
            return Promise.resolve();
        }

        const dependencies = this.dependencies.get(fixName) || [];
        const pendingDeps = dependencies.filter(dep => !this.loadedFixes.has(dep));

        if (pendingDeps.length > 0) {
            console.log('Fixes Integration: Waiting for dependencies:', pendingDeps);
            this.pendingFixes.set(fixName, dependencies);
            return Promise.reject(new Error(`Dependencies not met: ${pendingDeps.join(', ')}`));
        }

        return this.executeFix(fixName);
    }

    executeFix(fixName) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Fixes Integration: Executing fix:', fixName);
                
                // Mark as loaded immediately to prevent cycles
                this.loadedFixes.add(fixName);
                
                // Execute fix-specific logic
                switch (fixName) {
                    case 'comprehensive-error-prevention':
                        this.enableErrorPrevention();
                        break;
                    case 'enhanced-banner-fixed':
                        this.ensureEnhancedBanner();
                        break;
                    case 'automation-card-fix':
                        this.ensureAutomationCardFix();
                        break;
                    case 'email-subscribers-media-thumbnail-fix':
                        this.ensureEmailThumbnailFix();
                        break;
                    default:
                        console.log('Fixes Integration: Generic fix execution for:', fixName);
                }

                // Check for pending fixes that can now be loaded
                this.checkPendingFixes();
                
                resolve();
                console.log('Fixes Integration: Fix executed successfully:', fixName);
                
            } catch (error) {
                console.error('Fixes Integration: Error executing fix:', fixName, error);
                this.loadedFixes.delete(fixName); // Remove on failure
                reject(error);
            }
        });
    }

    enableErrorPrevention() {
        // Global error prevention
        if (typeof window.comprehensiveErrorPrevention !== 'undefined') {
            console.log('Fixes Integration: Error prevention already active');
            return;
        }

        window.addEventListener('error', (event) => {
            console.warn('Fixes Integration: Caught global error:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.warn('Fixes Integration: Caught unhandled rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    ensureEnhancedBanner() {
        if (typeof window.enhancedBannerFixed === 'undefined') {
            console.warn('Fixes Integration: Enhanced banner not found, will retry');
            setTimeout(() => this.ensureEnhancedBanner(), 1000);
        }
    }

    ensureAutomationCardFix() {
        if (typeof window.automationCardFix === 'undefined') {
            console.warn('Fixes Integration: Automation card fix not found, will retry');
            setTimeout(() => this.ensureAutomationCardFix(), 1000);
        }
    }

    ensureEmailThumbnailFix() {
        // Check if email thumbnail fix is properly initialized
        const emailModals = document.querySelectorAll('.modal');
        if (emailModals.length > 0) {
            console.log('Fixes Integration: Email thumbnail fix monitoring', emailModals.length, 'modals');
        }
    }

    checkPendingFixes() {
        const readyFixes = [];
        
        this.pendingFixes.forEach((dependencies, fixName) => {
            const pendingDeps = dependencies.filter(dep => !this.loadedFixes.has(dep));
            if (pendingDeps.length === 0) {
                readyFixes.push(fixName);
            }
        });

        readyFixes.forEach(fixName => {
            this.pendingFixes.delete(fixName);
            this.loadFix(fixName);
        });
    }

    setupGlobalErrorHandling() {
        // Override console.error to track errors
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            this.logError('Console Error', args.join(' '));
        };
    }

    handleGlobalError(error) {
        this.logError('Global Error', error.toString());
        
        // Try to recover from common errors
        if (error.toString().includes('not defined')) {
            this.attemptRecovery(error);
        }
    }

    attemptRecovery(error) {
        const errorMsg = error.toString();
        
        if (errorMsg.includes('FoodisChatbot is not defined')) {
            console.log('Fixes Integration: Attempting to recover from FoodisChatbot error');
            this.loadFix('chatbot-management');
        } else if (errorMsg.includes('AutomationCategoryManager')) {
            console.log('Fixes Integration: Attempting to recover from AutomationCategoryManager error');
            this.loadFix('automation-category-manager');
        }
    }

    logError(type, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${type}: ${message}`);
    }

    monitorSystemHealth() {
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000); // Check every 30 seconds
    }

    checkSystemHealth() {
        const criticalSystems = [
            'window.aiAutomation',
            'window.authManager', 
            'window.enhancedBannerFixed',
            'window.automationCardFix'
        ];

        const healthStatus = criticalSystems.map(system => {
            const exists = this.checkObjectPath(system);
            return { system, exists };
        });

        const failedSystems = healthStatus.filter(s => !s.exists);
        
        if (failedSystems.length > 0) {
            console.warn('Fixes Integration: System health check failed:', 
                failedSystems.map(s => s.system));
        } else {
            console.log('Fixes Integration: System health check passed');
        }
    }

    checkObjectPath(path) {
        try {
            return path.split('.').reduce((obj, prop) => obj && obj[prop], window) !== undefined;
        } catch {
            return false;
        }
    }

    getStatus() {
        return {
            loadedFixes: Array.from(this.loadedFixes),
            pendingFixes: Array.from(this.pendingFixes.keys()),
            totalFixes: this.loadedFixes.size + this.pendingFixes.size
        };
    }
}

// Initialize fixes integration system
window.fixesIntegration = new FixesIntegration();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FixesIntegration;
}
