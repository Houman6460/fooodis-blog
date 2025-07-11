
/**
 * Category Sync Manager - Complete Implementation
 * Handles category synchronization and subcategory management
 */

// Prevent duplicate declarations
if (typeof window.CategorySyncManager === 'undefined') {
    window.CategorySyncManager = {
        initialized: false,
        categories: [],
        subcategories: {},
        
        init: function() {
            if (this.initialized) return;
            
            console.log('CategorySyncManager: Initializing...');
            this.loadCategories();
            this.loadSubcategories();
            this.initialized = true;
            console.log('CategorySyncManager: Initialized successfully');
        },
        
        loadCategories: function() {
            try {
                const storedCategories = localStorage.getItem('fooodis-blog-categories');
                if (storedCategories) {
                    this.categories = JSON.parse(storedCategories);
                } else {
                    // Default categories
                    this.categories = [
                        { id: 'recipes', name: 'Recipes', slug: 'recipes' },
                        { id: 'cooking-tips', name: 'Cooking Tips', slug: 'cooking-tips' },
                        { id: 'restaurant-reviews', name: 'Restaurant Reviews', slug: 'restaurant-reviews' },
                        { id: 'food-news', name: 'Food News', slug: 'food-news' },
                        { id: 'nutrition', name: 'Nutrition', slug: 'nutrition' },
                        { id: 'chef-interviews', name: 'Chef Interviews', slug: 'chef-interviews' }
                    ];
                    this.saveCategories();
                }
            } catch (error) {
                console.error('CategorySyncManager: Error loading categories:', error);
                this.categories = [];
            }
        },
        
        loadSubcategories: function() {
            try {
                const storedSubcategories = localStorage.getItem('fooodis-blog-subcategories');
                if (storedSubcategories) {
                    this.subcategories = JSON.parse(storedSubcategories);
                } else {
                    // Default subcategories
                    this.subcategories = {
                        'recipes': [
                            { id: 'appetizers', name: 'Appetizers', slug: 'appetizers' },
                            { id: 'main-courses', name: 'Main Courses', slug: 'main-courses' },
                            { id: 'desserts', name: 'Desserts', slug: 'desserts' },
                            { id: 'beverages', name: 'Beverages', slug: 'beverages' }
                        ],
                        'cooking-tips': [
                            { id: 'techniques', name: 'Techniques', slug: 'techniques' },
                            { id: 'kitchen-tools', name: 'Kitchen Tools', slug: 'kitchen-tools' },
                            { id: 'ingredient-tips', name: 'Ingredient Tips', slug: 'ingredient-tips' }
                        ],
                        'restaurant-reviews': [
                            { id: 'fine-dining', name: 'Fine Dining', slug: 'fine-dining' },
                            { id: 'casual-dining', name: 'Casual Dining', slug: 'casual-dining' },
                            { id: 'fast-food', name: 'Fast Food', slug: 'fast-food' }
                        ],
                        'nutrition': [
                            { id: 'healthy-eating', name: 'Healthy Eating', slug: 'healthy-eating' },
                            { id: 'diet-plans', name: 'Diet Plans', slug: 'diet-plans' },
                            { id: 'supplements', name: 'Supplements', slug: 'supplements' }
                        ]
                    };
                    this.saveSubcategories();
                }
            } catch (error) {
                console.error('CategorySyncManager: Error loading subcategories:', error);
                this.subcategories = {};
            }
        },
        
        getSubcategories: function(categoryId) {
            if (!categoryId) {
                console.warn('CategorySyncManager: getSubcategories called without categoryId');
                return [];
            }
            
            const subcats = this.subcategories[categoryId] || [];
            console.log(`CategorySyncManager: getSubcategories(${categoryId})`, subcats);
            return subcats;
        },
        
        getCategories: function() {
            return this.categories;
        },
        
        addCategory: function(category) {
            if (!category.id || !category.name) {
                console.error('CategorySyncManager: Invalid category format');
                return false;
            }
            
            const exists = this.categories.find(cat => cat.id === category.id);
            if (exists) {
                console.warn('CategorySyncManager: Category already exists:', category.id);
                return false;
            }
            
            this.categories.push(category);
            this.saveCategories();
            return true;
        },
        
        addSubcategory: function(categoryId, subcategory) {
            if (!categoryId || !subcategory.id || !subcategory.name) {
                console.error('CategorySyncManager: Invalid subcategory format');
                return false;
            }
            
            if (!this.subcategories[categoryId]) {
                this.subcategories[categoryId] = [];
            }
            
            const exists = this.subcategories[categoryId].find(sub => sub.id === subcategory.id);
            if (exists) {
                console.warn('CategorySyncManager: Subcategory already exists:', subcategory.id);
                return false;
            }
            
            this.subcategories[categoryId].push(subcategory);
            this.saveSubcategories();
            return true;
        },
        
        saveCategories: function() {
            try {
                localStorage.setItem('fooodis-blog-categories', JSON.stringify(this.categories));
            } catch (error) {
                console.error('CategorySyncManager: Error saving categories:', error);
            }
        },
        
        saveSubcategories: function() {
            try {
                localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(this.subcategories));
            } catch (error) {
                console.error('CategorySyncManager: Error saving subcategories:', error);
            }
        },
        
        syncWithAutomation: function() {
            // Sync categories with automation system
            if (typeof window.updateAutomationCategories === 'function') {
                window.updateAutomationCategories(this.categories, this.subcategories);
            }
        }
    };
    
    // Auto-initialize
    document.addEventListener('DOMContentLoaded', function() {
        window.CategorySyncManager.init();
    });
    
    // Also initialize if DOM is already loaded
    if (document.readyState === 'loading') {
        // Wait for DOMContentLoaded
    } else {
        // DOM is already ready
        window.CategorySyncManager.init();
    }
}
