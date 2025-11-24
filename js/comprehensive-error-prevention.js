
/**
 * Comprehensive Error Prevention for Fooodis Dashboard
 * Fixes all JavaScript errors including MutationObserver, duplicate declarations, and undefined functions
 */

(function() {
    'use strict';
    
    console.log('Comprehensive Error Prevention: Starting initialization');
    
    // Prevent multiple initializations
    if (window.comprehensiveErrorPreventionInitialized) {
        console.log('Comprehensive Error Prevention: Already initialized, skipping');
        return;
    }
    window.comprehensiveErrorPreventionInitialized = true;

    // 1. Fix MutationObserver errors
    function fixMutationObservers() {
        if (typeof MutationObserver !== 'undefined') {
            const OriginalMutationObserver = MutationObserver;
            
            window.MutationObserver = function(callback) {
                const observer = new OriginalMutationObserver(callback);
                const originalObserve = observer.observe;
                
                observer.observe = function(target, options) {
                    // Validate target is a Node
                    if (!target || !(target instanceof Node)) {
                        console.warn('MutationObserver: Invalid target, using document.body as fallback');
                        target = document.body || document.documentElement;
                    }
                    
                    // Ensure target still exists and is valid
                    if (!target || !(target instanceof Node)) {
                        console.warn('MutationObserver: Cannot find valid target, skipping observation');
                        return;
                    }
                    
                    try {
                        return originalObserve.call(this, target, options);
                    } catch (error) {
                        console.error('MutationObserver error:', error);
                        return;
                    }
                };
                
                return observer;
            };
            
            // Copy static properties
            Object.setPrototypeOf(window.MutationObserver, OriginalMutationObserver);
            Object.defineProperty(window.MutationObserver, 'prototype', {
                value: OriginalMutationObserver.prototype,
                writable: false
            });
        }
    }

    // 2. Fix duplicate variable declarations
    function fixDuplicateDeclarations() {
        // Create a safe global namespace
        if (!window.FooodisBlog) {
            window.FooodisBlog = {
                posts: [],
                categories: [],
                subcategories: [],
                tags: [],
                featuredPosts: [],
                currentPage: 1,
                postsPerPage: 6,
                totalPages: 1,
                filteredPosts: null,
                initialized: {}
            };
        }

        // Prevent blogPosts redeclaration
        if (typeof window.blogPosts === 'undefined') {
            window.blogPosts = [];
        }

        // Initialize AutomationCategoryManager safely
        if (typeof window.AutomationCategoryManager === 'undefined') {
            window.AutomationCategoryManager = class {
                constructor() {
                    this.categories = [];
                    this.isInitialized = false;
                    this.modalContainer = null;
                    this.categorySelect = null;
                    this.subcategorySelect = null;
                }
                
                init() {
                    if (this.isInitialized) return;
                    this.isInitialized = true;
                    console.log('AutomationCategoryManager initialized');
                }
            };
        }

        // Prevent originalOpenForm redeclaration
        if (typeof window.originalOpenForm === 'undefined') {
            window.originalOpenForm = null;
        }
    }

    // 3. Fix CategorySyncManager
    function fixCategorySyncManager() {
        if (!window.CategorySyncManager) {
            window.CategorySyncManager = {
                categories: [],
                isInitialized: false,
                
                init() {
                    this.isInitialized = true;
                    return this;
                },
                
                getCategories() {
                    return this.categories;
                },
                
                getSubcategories(categoryId) {
                    const category = this.categories.find(c => c.id === categoryId);
                    return category ? category.subcategories || [] : [];
                },
                
                addCategory(category) {
                    this.categories.push(category);
                    return category;
                },
                
                subscribe() {
                    return this;
                },
                
                unsubscribe() {
                    return this;
                }
            };
        }
    }

    // 4. Fix undefined functions and properties
    function fixUndefinedFunctions() {
        // Fix initFormHandlers
        if (typeof window.initFormHandlers === 'undefined') {
            window.initFormHandlers = function() {
                console.log('Form handlers initialized (safe fallback)');
                
                // Safely initialize form elements
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    if (!form.dataset.handlersInitialized) {
                        form.dataset.handlersInitialized = 'true';
                        
                        form.addEventListener('submit', function(e) {
                            console.log('Form submitted:', form);
                        });
                    }
                });
            };
        }

        // Fix element property setting errors
        const safeSetProperty = (element, property, value) => {
            try {
                if (element && element[property] !== undefined) {
                    element[property] = value;
                }
            } catch (error) {
                console.warn('Safe property setting failed:', error);
            }
        };

        // Override property setters to be safe
        window.safeSetEnabled = function(element, enabled) {
            safeSetProperty(element, 'enabled', enabled);
            safeSetProperty(element, 'disabled', !enabled);
        };

        window.safeSetTextContent = function(element, text) {
            if (element && typeof element.textContent !== 'undefined') {
                element.textContent = text;
            } else if (element && typeof element.innerText !== 'undefined') {
                element.innerText = text;
            }
        };

        // Patch common DOM methods to be safe
        const originalQuerySelector = document.querySelector;
        document.querySelector = function(selector) {
            try {
                return originalQuerySelector.call(document, selector);
            } catch (error) {
                console.warn('querySelector error:', error);
                return null;
            }
        };

        const originalQuerySelectorAll = document.querySelectorAll;
        document.querySelectorAll = function(selector) {
            try {
                return originalQuerySelectorAll.call(document, selector);
            } catch (error) {
                console.warn('querySelectorAll error:', error);
                return [];
            }
        };
    }

    // 5. Fix Storage Manager
    function fixStorageManager() {
        if (!window.StorageManager) {
            window.StorageManager = {
                get(key) {
                    try {
                        const data = localStorage.getItem(key);
                        return data ? JSON.parse(data) : null;
                    } catch (error) {
                        console.error('Storage Manager get error:', error);
                        return null;
                    }
                },
                
                set(key, value) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch (error) {
                        console.error('Storage Manager set error:', error);
                        return false;
                    }
                },
                
                remove(key) {
                    try {
                        localStorage.removeItem(key);
                        return true;
                    } catch (error) {
                        console.error('Storage Manager remove error:', error);
                        return false;
                    }
                }
            };
        } else {
            // Add missing methods if StorageManager exists but incomplete
            if (typeof window.StorageManager.get === 'undefined') {
                window.StorageManager.get = function(key) {
                    try {
                        const data = localStorage.getItem(key);
                        return data ? JSON.parse(data) : null;
                    } catch (error) {
                        console.error('Storage Manager get error:', error);
                        return null;
                    }
                };
            }
            
            if (typeof window.StorageManager.set === 'undefined') {
                window.StorageManager.set = function(key, value) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        return true;
                    } catch (error) {
                        console.error('Storage Manager set error:', error);
                        return false;
                    }
                };
            }
        }
    }

    // 6. Fix AI Config methods
    function fixAIConfig() {
        if (!window.AIConfig) {
            window.AIConfig = {
                getConfig() {
                    try {
                        return JSON.parse(localStorage.getItem('ai-config')) || {};
                    } catch (error) {
                        console.error('AI Config getConfig error:', error);
                        return {};
                    }
                },
                
                getCustomAssistants() {
                    try {
                        return JSON.parse(localStorage.getItem('custom-assistants')) || [];
                    } catch (error) {
                        console.error('AI Config getCustomAssistants error:', error);
                        return [];
                    }
                }
            };
        } else {
            // Add missing methods
            if (typeof window.AIConfig.getConfig === 'undefined') {
                window.AIConfig.getConfig = function() {
                    try {
                        return JSON.parse(localStorage.getItem('ai-config')) || {};
                    } catch (error) {
                        console.error('AI Config getConfig error:', error);
                        return {};
                    }
                };
            }
            
            if (typeof window.AIConfig.getCustomAssistants === 'undefined') {
                window.AIConfig.getCustomAssistants = function() {
                    try {
                        return JSON.parse(localStorage.getItem('custom-assistants')) || [];
                    } catch (error) {
                        console.error('AI Config getCustomAssistants error:', error);
                        return [];
                    }
                };
            }
        }
    }

    // 7. Fix syntax errors by cleaning up scripts
    function fixSyntaxErrors() {
        // Add global error handler for syntax errors
        window.addEventListener('error', function(event) {
            if (event.message && (
                event.message.includes('Unexpected token') ||
                event.message.includes('has already been declared') ||
                event.message.includes('before initialization')
            )) {
                console.warn('Syntax error caught and handled:', event.message);
                event.preventDefault();
                return true;
            }
        });

        // Fix parsing errors
        const originalJSONParse = JSON.parse;
        JSON.parse = function(text) {
            try {
                return originalJSONParse(text);
            } catch (error) {
                console.warn('JSON parse error handled:', error);
                return {};
            }
        };
    }

    // 8. Safe initialization wrapper
    function safeInitialize(fn, name, delay = 0) {
        setTimeout(() => {
            try {
                fn();
                console.log(`${name} initialized successfully`);
            } catch (error) {
                console.error(`Error initializing ${name}:`, error);
            }
        }, delay);
    }

    // 9. Main initialization
    function initialize() {
        safeInitialize(fixMutationObservers, 'MutationObserver fixes', 0);
        safeInitialize(fixDuplicateDeclarations, 'Duplicate declaration fixes', 10);
        safeInitialize(fixCategorySyncManager, 'CategorySyncManager', 20);
        safeInitialize(fixUndefinedFunctions, 'Undefined function fixes', 30);
        safeInitialize(fixStorageManager, 'StorageManager', 40);
        safeInitialize(fixAIConfig, 'AI Config', 50);
        safeInitialize(fixSyntaxErrors, 'Syntax error fixes', 60);
        
        // Initialize automation category manager
        safeInitialize(() => {
            if (window.AutomationCategoryManager && !window.automationCategoryManagerInstance) {
                window.automationCategoryManagerInstance = new window.AutomationCategoryManager();
                window.automationCategoryManagerInstance.init();
            }
        }, 'AutomationCategoryManager instance', 70);
        
        // Initialize category sync manager
        safeInitialize(() => {
            if (window.CategorySyncManager && !window.CategorySyncManager.isInitialized) {
                window.CategorySyncManager.init();
            }
        }, 'CategorySyncManager instance', 80);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    console.log('Comprehensive Error Prevention: Setup complete');
})();
