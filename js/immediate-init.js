
// Immediate Initialization - Critical startup code that runs first
(function() {
    'use strict';
    
    console.log('Immediate Init: Starting critical initialization');
    
    // Initialize core objects immediately
    window.FoodisChatbot = window.FoodisChatbot || {};
    window.FoodisAutomation = window.FoodisAutomation || {};
    window.FoodisConfig = window.FoodisConfig || {};
    
    // Core initialization functions
    function initializeCoreObjects() {
        // Initialize chatbot core
        if (!window.FoodisChatbot.initialized) {
            window.FoodisChatbot = {
                initialized: true,
                conversations: [],
                config: {},
                api: {},
                utils: {}
            };
        }
        
        // Initialize automation core
        if (!window.FoodisAutomation.initialized) {
            window.FoodisAutomation = {
                initialized: true,
                paths: [],
                status: {},
                scheduler: {},
                executor: {}
            };
        }
        
        // Initialize config core
        if (!window.FoodisConfig.initialized) {
            window.FoodisConfig = {
                initialized: true,
                ai: {},
                automation: {},
                email: {},
                dashboard: {}
            };
        }
        
        console.log('Immediate Init: Core objects initialized');
    }
    
    function preventErrors() {
        // Prevent common undefined errors
        window.addEventListener('error', function(e) {
            if (e.message.includes('is not defined')) {
                console.warn('Immediate Init: Caught undefined error:', e.message);
                e.preventDefault();
            }
        });
        
        // Ensure jQuery is available or provide minimal polyfill
        if (typeof $ === 'undefined') {
            window.$ = function(selector) {
                return {
                    ready: function(fn) { 
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', fn);
                        } else {
                            fn();
                        }
                    },
                    on: function(event, handler) {
                        document.addEventListener(event, handler);
                        return this;
                    }
                };
            };
        }
    }
    
    function initializeStorage() {
        // Ensure storage objects exist
        if (typeof(Storage) !== "undefined") {
            try {
                // Test localStorage access
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                console.log('Immediate Init: localStorage available');
            } catch (e) {
                console.warn('Immediate Init: localStorage not available:', e);
            }
        }
    }
    
    // Run initialization immediately
    initializeCoreObjects();
    preventErrors();
    initializeStorage();
    
    console.log('Immediate Init: Critical initialization completed');
})();
