/**
 * Categories & Tags Manager
 * Central manager for categories, subcategories, and tags with D1 backend
 * 
 * Provides cross-module synchronization between:
 * - Categories & Tags section
 * - Create New Blog Post
 * - AI Content Automation
 * - Manage Blog Posts
 */

class CategoriesTagsManager {
    constructor() {
        this.categories = [];
        this.subcategories = [];
        this.tags = [];
        this.initialized = false;
        this.listeners = new Map();
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.initialized) return;
        console.log('CategoriesTagsManager: Initializing...');
        
        // Load data from API
        await this.loadAll();
        
        // Setup event listeners for cross-module communication
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('CategoriesTagsManager: Initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('categoriesTagsReady', {
            detail: { 
                categories: this.categories,
                subcategories: this.subcategories,
                tags: this.tags
            }
        }));
    }
    
    /**
     * Load all categories, subcategories, and tags from API
     */
    async loadAll() {
        await Promise.all([
            this.loadCategories(),
            this.loadTags()
        ]);
    }
    
    /**
     * Load categories with subcategories from D1 API
     */
    async loadCategories() {
        try {
            const response = await fetch('/api/categories?include_subcategories=true');
            if (response.ok) {
                const data = await response.json();
                this.categories = data;
                
                // Extract subcategories
                this.subcategories = [];
                data.forEach(cat => {
                    if (cat.subcategories) {
                        cat.subcategories.forEach(sub => {
                            this.subcategories.push({
                                ...sub,
                                parentCategory: cat.name,
                                parentCategoryId: cat.id
                            });
                        });
                    }
                });
                
                // Sync to localStorage for offline/fallback
                localStorage.setItem('fooodis-blog-categories', JSON.stringify(
                    this.categories.map(c => c.name)
                ));
                localStorage.setItem('fooodis-categories-full', JSON.stringify(this.categories));
                localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(
                    this.subcategories.map(s => ({ name: s.name, parent: s.parentCategory }))
                ));
                
                console.log(`CategoriesTagsManager: Loaded ${this.categories.length} categories`);
                return this.categories;
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error loading categories', error);
        }
        
        // Fallback to localStorage
        try {
            const saved = localStorage.getItem('fooodis-categories-full');
            if (saved) {
                this.categories = JSON.parse(saved);
            }
        } catch (e) {
            this.categories = [];
        }
        
        return this.categories;
    }
    
    /**
     * Load tags from D1 API
     */
    async loadTags() {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                this.tags = await response.json();
                
                // Sync to localStorage
                localStorage.setItem('fooodis-blog-tags', JSON.stringify(
                    this.tags.map(t => t.name)
                ));
                localStorage.setItem('fooodis-tags-full', JSON.stringify(this.tags));
                
                console.log(`CategoriesTagsManager: Loaded ${this.tags.length} tags`);
                return this.tags;
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error loading tags', error);
        }
        
        // Fallback to localStorage
        try {
            const saved = localStorage.getItem('fooodis-tags-full');
            if (saved) {
                this.tags = JSON.parse(saved);
            }
        } catch (e) {
            this.tags = [];
        }
        
        return this.tags;
    }
    
    // ========================================
    // CATEGORY OPERATIONS
    // ========================================
    
    /**
     * Create a new category
     */
    async createCategory(name, options = {}) {
        console.log('CategoriesTagsManager: Creating category', name);
        
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: options.description || '',
                    color: options.color || '#478ac9',
                    icon: options.icon || null
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Add to local array
                this.categories.push({
                    ...result.category,
                    subcategories: []
                });
                
                // Update localStorage
                this.syncToLocalStorage();
                
                // Dispatch event for other modules
                this.dispatchUpdate('categoryCreated', { category: result.category });
                
                return result.category;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create category');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error creating category', error);
            throw error;
        }
    }
    
    /**
     * Update a category
     */
    async updateCategory(categoryId, updates) {
        console.log('CategoriesTagsManager: Updating category', categoryId);
        
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.categories.findIndex(c => c.id === categoryId);
                if (index !== -1) {
                    const oldName = this.categories[index].name;
                    this.categories[index] = {
                        ...this.categories[index],
                        ...result.category
                    };
                    
                    // If name changed, update subcategories parent reference
                    if (oldName !== result.category.name) {
                        this.subcategories.forEach(sub => {
                            if (sub.parentCategory === oldName) {
                                sub.parentCategory = result.category.name;
                            }
                        });
                    }
                }
                
                this.syncToLocalStorage();
                this.dispatchUpdate('categoryUpdated', { 
                    category: result.category,
                    oldName: updates.oldName
                });
                
                return result.category;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update category');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error updating category', error);
            throw error;
        }
    }
    
    /**
     * Delete a category
     */
    async deleteCategory(categoryId) {
        console.log('CategoriesTagsManager: Deleting category', categoryId);
        
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local arrays
                this.categories = this.categories.filter(c => c.id !== categoryId);
                this.subcategories = this.subcategories.filter(s => s.parentCategoryId !== categoryId);
                
                this.syncToLocalStorage();
                this.dispatchUpdate('categoryDeleted', { 
                    categoryId, 
                    categoryName: category.name 
                });
                
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error deleting category', error);
            throw error;
        }
    }
    
    /**
     * Get category by name
     */
    getCategoryByName(name) {
        return this.categories.find(c => c.name === name);
    }
    
    /**
     * Get category by ID
     */
    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }
    
    // ========================================
    // SUBCATEGORY OPERATIONS
    // ========================================
    
    /**
     * Create a new subcategory
     */
    async createSubcategory(name, parentCategoryName, options = {}) {
        console.log('CategoriesTagsManager: Creating subcategory', name, 'under', parentCategoryName);
        
        // Find parent category
        const parentCategory = this.getCategoryByName(parentCategoryName);
        if (!parentCategory) {
            throw new Error(`Parent category "${parentCategoryName}" not found`);
        }
        
        try {
            const response = await fetch('/api/subcategories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    parent_category_id: parentCategory.id,
                    parent_category: parentCategoryName,
                    description: options.description || ''
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Add to local arrays
                const subcategory = {
                    ...result.subcategory,
                    parentCategory: parentCategoryName,
                    parentCategoryId: parentCategory.id
                };
                this.subcategories.push(subcategory);
                
                // Add to parent category's subcategories
                const catIndex = this.categories.findIndex(c => c.id === parentCategory.id);
                if (catIndex !== -1) {
                    if (!this.categories[catIndex].subcategories) {
                        this.categories[catIndex].subcategories = [];
                    }
                    this.categories[catIndex].subcategories.push(result.subcategory);
                }
                
                this.syncToLocalStorage();
                this.dispatchUpdate('subcategoryCreated', { 
                    subcategory,
                    parentCategory: parentCategoryName
                });
                
                return subcategory;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create subcategory');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error creating subcategory', error);
            throw error;
        }
    }
    
    /**
     * Delete a subcategory
     */
    async deleteSubcategory(subcategoryId) {
        console.log('CategoriesTagsManager: Deleting subcategory', subcategoryId);
        
        const subcategory = this.subcategories.find(s => s.id === subcategoryId);
        if (!subcategory) {
            throw new Error('Subcategory not found');
        }
        
        try {
            const response = await fetch(`/api/subcategories/${subcategoryId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local arrays
                this.subcategories = this.subcategories.filter(s => s.id !== subcategoryId);
                
                // Remove from parent category
                const catIndex = this.categories.findIndex(c => c.id === subcategory.parentCategoryId);
                if (catIndex !== -1 && this.categories[catIndex].subcategories) {
                    this.categories[catIndex].subcategories = 
                        this.categories[catIndex].subcategories.filter(s => s.id !== subcategoryId);
                }
                
                this.syncToLocalStorage();
                this.dispatchUpdate('subcategoryDeleted', { 
                    subcategoryId,
                    subcategoryName: subcategory.name,
                    parentCategory: subcategory.parentCategory
                });
                
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete subcategory');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error deleting subcategory', error);
            throw error;
        }
    }
    
    /**
     * Get subcategories by parent category name
     */
    getSubcategoriesByParent(parentCategoryName) {
        return this.subcategories.filter(s => s.parentCategory === parentCategoryName);
    }
    
    // ========================================
    // TAG OPERATIONS
    // ========================================
    
    /**
     * Create a new tag
     */
    async createTag(name, options = {}) {
        console.log('CategoriesTagsManager: Creating tag', name);
        
        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: options.description || '',
                    color: options.color || '#e8f24c'
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Check if it's an existing tag (API returns existing: true)
                if (!result.existing) {
                    this.tags.push(result.tag);
                }
                
                this.syncToLocalStorage();
                this.dispatchUpdate('tagCreated', { 
                    tag: result.tag,
                    existing: result.existing
                });
                
                return result.tag;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create tag');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error creating tag', error);
            throw error;
        }
    }
    
    /**
     * Update a tag
     */
    async updateTag(tagId, updates) {
        console.log('CategoriesTagsManager: Updating tag', tagId);
        
        try {
            const response = await fetch(`/api/tags/${tagId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.tags.findIndex(t => t.id === tagId);
                if (index !== -1) {
                    this.tags[index] = result.tag;
                }
                
                this.syncToLocalStorage();
                this.dispatchUpdate('tagUpdated', { tag: result.tag });
                
                return result.tag;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update tag');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error updating tag', error);
            throw error;
        }
    }
    
    /**
     * Delete a tag
     */
    async deleteTag(tagId) {
        console.log('CategoriesTagsManager: Deleting tag', tagId);
        
        const tag = this.tags.find(t => t.id === tagId);
        if (!tag) {
            throw new Error('Tag not found');
        }
        
        try {
            const response = await fetch(`/api/tags/${tagId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.tags = this.tags.filter(t => t.id !== tagId);
                
                this.syncToLocalStorage();
                this.dispatchUpdate('tagDeleted', { 
                    tagId,
                    tagName: tag.name
                });
                
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete tag');
            }
        } catch (error) {
            console.error('CategoriesTagsManager: Error deleting tag', error);
            throw error;
        }
    }
    
    /**
     * Get tag by name
     */
    getTagByName(name) {
        return this.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    }
    
    /**
     * Ensure tags exist (create if not)
     */
    async ensureTags(tagNames) {
        const results = [];
        for (const name of tagNames) {
            const existing = this.getTagByName(name);
            if (existing) {
                results.push(existing);
            } else {
                try {
                    const tag = await this.createTag(name);
                    results.push(tag);
                } catch (e) {
                    console.warn(`Could not create tag: ${name}`, e);
                }
            }
        }
        return results;
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Sync data to localStorage for fallback
     */
    syncToLocalStorage() {
        localStorage.setItem('fooodis-blog-categories', JSON.stringify(
            this.categories.map(c => c.name)
        ));
        localStorage.setItem('fooodis-categories-full', JSON.stringify(this.categories));
        localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(
            this.subcategories.map(s => ({ name: s.name, parent: s.parentCategory }))
        ));
        localStorage.setItem('fooodis-blog-tags', JSON.stringify(
            this.tags.map(t => t.name)
        ));
        localStorage.setItem('fooodis-tags-full', JSON.stringify(this.tags));
    }
    
    /**
     * Dispatch update event for cross-module communication
     */
    dispatchUpdate(eventType, detail) {
        // Specific event
        document.dispatchEvent(new CustomEvent(eventType, { detail }));
        
        // General update event
        document.dispatchEvent(new CustomEvent('categoriesTagsUpdated', {
            detail: {
                type: eventType,
                ...detail,
                categories: this.categories,
                subcategories: this.subcategories,
                tags: this.tags
            }
        }));
    }
    
    /**
     * Setup event listeners for external updates
     */
    setupEventListeners() {
        // Listen for blog post changes that might affect counts
        document.addEventListener('blogPostsUpdated', () => {
            // Could refresh counts here if needed
        });
        
        // Listen for AI automation category/tag creation
        document.addEventListener('aiCategoryRequested', async (e) => {
            const { name } = e.detail;
            if (name && !this.getCategoryByName(name)) {
                await this.createCategory(name);
            }
        });
        
        document.addEventListener('aiTagRequested', async (e) => {
            const { name } = e.detail;
            if (name && !this.getTagByName(name)) {
                await this.createTag(name);
            }
        });
    }
    
    /**
     * Get all category names (simple array)
     */
    getCategoryNames() {
        return this.categories.map(c => c.name);
    }
    
    /**
     * Get all tag names (simple array)
     */
    getTagNames() {
        return this.tags.map(t => t.name);
    }
    
    /**
     * Populate a category dropdown element
     */
    populateCategoryDropdown(selectElement, options = {}) {
        if (!selectElement) return;
        
        const placeholder = options.placeholder || 'Select a category';
        const includeSubcategories = options.includeSubcategories || false;
        
        selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            option.dataset.categoryId = category.id;
            selectElement.appendChild(option);
            
            if (includeSubcategories && category.subcategories) {
                category.subcategories.forEach(sub => {
                    const subOption = document.createElement('option');
                    subOption.value = sub.name;
                    subOption.textContent = `  └ ${sub.name}`;
                    subOption.dataset.subcategoryId = sub.id;
                    subOption.dataset.parentCategory = category.name;
                    selectElement.appendChild(subOption);
                });
            }
        });
    }
    
    /**
     * Populate a subcategory dropdown based on parent category
     */
    populateSubcategoryDropdown(selectElement, parentCategoryName, options = {}) {
        if (!selectElement) return;
        
        const placeholder = options.placeholder || 'Select a subcategory';
        selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        
        const subcategories = this.getSubcategoriesByParent(parentCategoryName);
        
        if (subcategories.length === 0) {
            selectElement.innerHTML = `<option value="" disabled selected>No subcategories available</option>`;
            selectElement.disabled = true;
            return;
        }
        
        selectElement.disabled = false;
        subcategories.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.name;
            option.textContent = sub.name;
            option.dataset.subcategoryId = sub.id;
            selectElement.appendChild(option);
        });
    }
    
    /**
     * Populate a tags input with autocomplete suggestions
     */
    getTagSuggestions(query) {
        if (!query) return this.tags.slice(0, 10);
        
        const lowerQuery = query.toLowerCase();
        return this.tags.filter(t => 
            t.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }
}

// Initialize and expose globally
window.categoriesTagsManager = new CategoriesTagsManager();
window.CategoriesTagsManager = CategoriesTagsManager;
