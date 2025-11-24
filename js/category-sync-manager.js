/**
 * Category Sync Manager
 * Manages synchronization between categories across the application
 */
class CategorySyncManager {
  constructor() {
    this.categories = [];
    this.subscribers = [];
    this.isInitialized = false;
    console.log('CategorySyncManager initialized');
  }

  // Initialize the category manager
  init() {
    this.loadCategories();
    this.attachEventListeners();
    this.isInitialized = true;
    return this;
  }

  // Load categories from storage
  loadCategories() {
    try {
      const storedCategories = localStorage.getItem('foodis_categories');
      this.categories = storedCategories ? JSON.parse(storedCategories) : [
        { id: 1, name: 'Recipes', color: '#FF9800' },
        { id: 2, name: 'Restaurants', color: '#4CAF50' },
        { id: 3, name: 'Health', color: '#2196F3' },
        { id: 4, name: 'Cooking Tips', color: '#9C27B0' }
      ];
      this.notifySubscribers();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories = [];
    }
  }

  // Save categories to storage
  saveCategories() {
    try {
      localStorage.setItem('foodis_categories', JSON.stringify(this.categories));
      this.notifySubscribers();
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  // Get all categories
  getCategories() {
    return [...this.categories];
  }

  // Add a new category
  addCategory(category) {
    const newId = this.categories.length > 0 
      ? Math.max(...this.categories.map(c => c.id)) + 1 
      : 1;
    
    const newCategory = {
      id: newId,
      name: category.name || 'New Category',
      color: category.color || '#607D8B'
    };
    
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  // Update an existing category
  updateCategory(id, updates) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.categories[index] = {
      ...this.categories[index],
      ...updates
    };
    
    this.saveCategories();
    return true;
  }

  // Delete a category
  deleteCategory(id) {
    const initialLength = this.categories.length;
    this.categories = this.categories.filter(c => c.id !== id);
    
    if (this.categories.length !== initialLength) {
      this.saveCategories();
      return true;
    }
    return false;
  }

  // Subscribe to category changes
  subscribe(callback) {
    if (typeof callback === 'function' && !this.subscribers.includes(callback)) {
      this.subscribers.push(callback);
    }
    return this;
  }

  // Unsubscribe from category changes
  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
    return this;
  }

  // Notify all subscribers of changes
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.getCategories());
      } catch (error) {
        console.error('Error in category subscriber callback:', error);
      }
    });
  }

  // Attach event listeners
  attachEventListeners() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'foodis_categories') {
        this.loadCategories();
      }
    });
  }
}

// Create and initialize a singleton instance
const categorySyncManager = new CategorySyncManager().init();

// Make it globally available
window.CategorySyncManager = categorySyncManager;
