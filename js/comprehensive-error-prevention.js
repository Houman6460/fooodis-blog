// Comprehensive Error Prevention - Advanced error handling and system stability
(function() {
    'use strict';

    console.log('Comprehensive Error Prevention: Initializing advanced error handling');

    // Global error tracking
    window.errorTracker = {
        errors: [],
        maxErrors: 100,
        patterns: new Map()
    };

    // Initialize core objects first
    function initializeCoreObjects() {
        // Chatbot core
        if (!window.FoodisChatbot) {
            window.FoodisChatbot = {
                initialized: true,
                conversations: [],
                config: {},
                api: {
                    generateResponse: function() { return 'System initializing...'; }
                },
                utils: {}
            };
            console.log('Error Prevention: FoodisChatbot initialized');
        }

        // Automation core
        if (!window.FoodisAutomation) {
            window.FoodisAutomation = {
                initialized: true,
                paths: [],
                status: {},
                scheduler: {},
                executor: {}
            };
            console.log('Error Prevention: FoodisAutomation initialized');
        }

        // Config core
        if (!window.FoodisConfig) {
            window.FoodisConfig = {
                initialized: true,
                ai: {},
                automation: {},
                email: {},
                dashboard: {}
            };
            console.log('Error Prevention: FoodisConfig initialized');
        }

        // EmailPopupEnhancer stub to prevent Color Format Fix loops
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
            console.log('Error Prevention: EmailPopupEnhancer stub initialized');
        }
    }

    // Enhanced error handler
    function handleError(error, context = 'Unknown') {
        const errorInfo = {
            message: error.message || error.toString(),
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        // Track error patterns
        const pattern = errorInfo.message.substring(0, 50);
        const count = window.errorTracker.patterns.get(pattern) || 0;
        window.errorTracker.patterns.set(pattern, count + 1);

        // Store error
        window.errorTracker.errors.push(errorInfo);
        if (window.errorTracker.errors.length > window.errorTracker.maxErrors) {
            window.errorTracker.errors.shift();
        }

        console.error(`[${context}] Error:`, errorInfo);

        // Attempt recovery for known issues
        attemptRecovery(errorInfo);

        return true; // Prevent default error handling
    }

    function attemptRecovery(errorInfo) {
        const message = errorInfo.message.toLowerCase();

        if (message.includes('foodischatbot is not defined')) {
            console.log('Error Prevention: Attempting FoodisChatbot recovery');
            initializeCoreObjects();
        } else if (message.includes('automationcategorymanager')) {
            console.log('Error Prevention: Attempting AutomationCategoryManager recovery');
            loadMissingScript('automation-category-manager.js');
        } else if (message.includes('emailpopupenhancer')) {
            console.log('Error Prevention: EmailPopupEnhancer already stubbed');
        } else if (message.includes('cannot read properties')) {
            console.log('Error Prevention: Attempting null reference recovery');
            initializeCoreObjects();
        }
    }

    function loadMissingScript(scriptName) {
        if (document.querySelector(`script[src*="${scriptName}"]`)) {
            return; // Already loaded
        }

        const script = document.createElement('script');
        script.src = `js/${scriptName}`;
        script.onerror = () => console.warn(`Failed to load ${scriptName}`);
        script.onload = () => console.log(`Successfully loaded ${scriptName}`);
        document.head.appendChild(script);
    }

    // Set up global error handlers
    window.addEventListener('error', function(e) {
        handleError(e.error || new Error(e.message), 'Global Error');
    });

    window.addEventListener('unhandledrejection', function(e) {
        handleError(e.reason, 'Unhandled Promise Rejection');
        e.preventDefault();
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = function(...args) {
        handleError(new Error(args.join(' ')), 'Console Error');
        originalConsoleError.apply(console, args);
    };

    // Function call safety wrapper
    window.safeCall = function(fn, context = 'SafeCall', ...args) {
        try {
            if (typeof fn === 'function') {
                return fn.apply(this, args);
            } else {
                throw new Error('Not a function');
            }
        } catch (error) {
            handleError(error, context);
            return null;
        }
    };

    // Object property safety wrapper
    window.safeGet = function(obj, path, defaultValue = null) {
        try {
            const keys = path.split('.');
            let current = obj;
            for (const key of keys) {
                if (current == null || typeof current !== 'object') {
                    return defaultValue;
                }
                current = current[key];
            }
            return current !== undefined ? current : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    };

    // Initialize immediately
    initializeCoreObjects();

    // Set up periodic health checks
    setInterval(function() {
        // Check critical objects
        if (!window.FoodisChatbot) initializeCoreObjects();
        if (!window.FoodisAutomation) initializeCoreObjects();
        if (!window.FoodisConfig) initializeCoreObjects();
    }, 10000);

    console.log('Comprehensive Error Prevention: Advanced error handling system active');

    // Export diagnostic function
    window.getErrorReport = function() {
        return {
            totalErrors: window.errorTracker.errors.length,
            recentErrors: window.errorTracker.errors.slice(-10),
            patterns: Array.from(window.errorTracker.patterns.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        };
    };
})();