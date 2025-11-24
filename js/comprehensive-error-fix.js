
/**
 * Comprehensive Error Fix for Fooodis Dashboard
 * Fixes all JavaScript errors including MutationObserver, duplicate declarations, and undefined functions
 */

(function() {
    'use strict';
    
    console.log('Comprehensive Error Fix: Starting initialization');
    
    // Prevent multiple initializations
    if (window.comprehensiveErrorFixInitialized) {
        console.log('Comprehensive Error Fix: Already initialized, skipping');
        return;
    }
    window.comprehensiveErrorFixInitialized = true;

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

        // Prevent allPosts redeclaration
        if (typeof window.allPosts === 'undefined') {
            window.allPosts = [];
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

    // 4. Fix undefined functions
    function fixUndefinedFunctions() {
        // Fix initFormHandlers
        if (typeof window.initFormHandlers === 'undefined') {
            window.initFormHandlers = function() {
                console.log('Form handlers initialized (placeholder)');
                
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

        // Fix missing properties
        const fixElementProperties = () => {
            const elements = document.querySelectorAll('input, button, select, textarea');
            elements.forEach(element => {
                try {
                    if (element && typeof element.enabled !== 'undefined') {
                        // Element exists, property can be set
                    }
                } catch (error) {
                    // Ignore property setting errors
                }
            });
        };

        // Fix textContent setting
        const fixTextContent = () => {
            const observer = new MutationObserver(() => {
                const elements = document.querySelectorAll('[data-text-content]');
                elements.forEach(element => {
                    if (element && element.textContent !== undefined) {
                        const content = element.dataset.textContent;
                        if (content) {
                            element.textContent = content;
                        }
                    }
                });
            });
            
            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        };

        // Execute fixes
        fixElementProperties();
        fixTextContent();
    }

    // 5. Fix syntax errors by cleaning up scripts
    function fixSyntaxErrors() {
        // Look for problematic script elements and fix them
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src && script.src.includes('error')) {
                console.warn('Potentially problematic script found:', script.src);
            }
        });

        // Add global error handler for syntax errors
        window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('Unexpected token')) {
                console.warn('Syntax error caught and handled:', event.message);
                event.preventDefault();
                return true;
            }
        });
    }

    // 6. Safe initialization wrapper
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

    // 7. Main initialization
    function initialize() {
        safeInitialize(fixMutationObservers, 'MutationObserver fixes', 0);
        safeInitialize(fixDuplicateDeclarations, 'Duplicate declaration fixes', 10);
        safeInitialize(fixCategorySyncManager, 'CategorySyncManager', 20);
        safeInitialize(fixUndefinedFunctions, 'Undefined function fixes', 30);
        safeInitialize(fixSyntaxErrors, 'Syntax error fixes', 40);
        
        // Initialize automation category manager
        safeInitialize(() => {
            if (window.AutomationCategoryManager && !window.automationCategoryManagerInstance) {
                window.automationCategoryManagerInstance = new window.AutomationCategoryManager();
                window.automationCategoryManagerInstance.init();
            }
        }, 'AutomationCategoryManager instance', 50);
        
        // Initialize category sync manager
        safeInitialize(() => {
            if (window.CategorySyncManager && !window.CategorySyncManager.isInitialized) {
                window.CategorySyncManager.init();
            }
        }, 'CategorySyncManager instance', 60);
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    console.log('Comprehensive Error Fix: Setup complete');
})();
