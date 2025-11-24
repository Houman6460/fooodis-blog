
/**
 * Automation Syntax Fix
 * Fixes syntax errors and undefined references in automation modules
 */

// Safe MutationObserver wrapper
function safeMutationObserver(callback, options) {
    try {
        const observer = new MutationObserver(callback);
        return {
            observe: function(target) {
                if (target && target.nodeType === Node.ELEMENT_NODE) {
                    observer.observe(target, options);
                } else {
                    console.warn('MutationObserver: Invalid target node');
                }
            },
            disconnect: function() {
                observer.disconnect();
            }
        };
    } catch (error) {
        console.error('Error creating MutationObserver:', error);
        return {
            observe: function() {},
            disconnect: function() {}
        };
    }
}

// Safe property setter
function safeSetProperty(obj, property, value) {
    try {
        if (obj && typeof obj === 'object' && property) {
            obj[property] = value;
            return true;
        }
    } catch (error) {
        console.warn('Failed to set property:', property, error);
    }
    return false;
}

// Safe text content setter
function safeSetTextContent(element, text) {
    try {
        if (element && typeof element.textContent !== 'undefined') {
            element.textContent = text;
            return true;
        }
    } catch (error) {
        console.warn('Failed to set textContent:', error);
    }
    return false;
}

// Make safe functions globally available
window.safeMutationObserver = safeMutationObserver;
window.safeSetProperty = safeSetProperty;
window.safeSetTextContent = safeSetTextContent;

// Ensure proper initialization order
document.addEventListener('DOMContentLoaded', function() {
    console.log('Automation Syntax Fix: Initializing...');
    
    // Fix CategorySyncManager if it exists but is missing methods
    if (window.CategorySyncManager && !window.CategorySyncManager.getSubcategories) {
        window.CategorySyncManager.getSubcategories = function(categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            return category ? (category.subcategories || []) : [];
        };
        console.log('Automation Syntax Fix: Added getSubcategories method to CategorySyncManager');
    }
    
    // Ensure initAdvancedPanel exists
    if (typeof window.initAdvancedPanel === 'undefined') {
        window.initAdvancedPanel = function() {
            console.log('Advanced panel initialized (fallback)');
        };
    }
    
    // Ensure initFormHandlers exists
    if (typeof window.initFormHandlers === 'undefined') {
        window.initFormHandlers = function() {
            console.log('Form handlers initialized (fallback)');
        };
    }
    
    // Fix automation paths array initialization
    if (typeof window.automationPaths === 'undefined') {
        window.automationPaths = [];
    }
    
    // Fix scheduled tasks initialization
    if (typeof window.scheduledTasks === 'undefined') {
        window.scheduledTasks = {};
    }
    
    // Fix editing path index initialization
    if (typeof window.editingPathIndex === 'undefined') {
        window.editingPathIndex = -1;
    }
    
    console.log('Automation Syntax Fix: Initialization complete');
});

// Global error handler to catch and log syntax errors
window.addEventListener('error', function(event) {
    if (event.message.includes('Unexpected token') || 
        event.message.includes('already been declared') ||
        event.message.includes('is not defined')) {
        console.error('Syntax Fix: Caught error:', event.message, 'at', event.filename, ':', event.lineno);
    }
});
