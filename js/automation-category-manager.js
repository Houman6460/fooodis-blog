/**
 * Automation Category Manager
 * 
 * This module provides functionality to add and remove categories and subcategories
 * directly from the Automation Path modal, improving user workflow efficiency.
 */

class AutomationCategoryManager {
    constructor() {
        this.categories = [];
        this.initialized = false;
        this.modalContainer = document.querySelector('.automation-path-modal');
        this.categorySelect = document.querySelector('#category');
        this.subcategorySelect = document.querySelector('#subcategory');
    }

    /**
     * Initialize the category manager and attach event listeners
     */
    init() {
        if (this.initialized) return;

        this.loadCategories();
        this.setupUI();
        this.attachEventListeners();

        // Update the sidebar categories with the current categories
        this.updateSidebarCategories();

        this.initialized = true;
        console.log('AutomationCategoryManager initialized');
    }

    /**
     * Set up the UI elements for category management
     */
    setupUI() {
        // Create category management UI elements only if they don't exist
        if (this.modalContainer.querySelector('.category-management-controls')) return;

        // Create category management controls
        const categoryFormGroup = this.categorySelect.closest('.form-group');
        const subcategoryFormGroup = this.subcategorySelect.closest('.form-group');

        // Add category management controls
        const categoryControls = document.createElement('div');
        categoryControls.className = 'category-management-controls';
        categoryControls.innerHTML = `
            <button type="button" class="btn-icon add-category-btn" title="Add New Category">
                <i class="fas fa-plus"></i>
            </button>
            <button type="button" class="btn-icon remove-category-btn" title="Remove Selected Category">
                <i class="fas fa-minus"></i>
            </button>
        `;
        categoryFormGroup.appendChild(categoryControls);

        // Add subcategory management controls
        const subcategoryControls = document.createElement('div');
        subcategoryControls.className = 'category-management-controls';
        subcategoryControls.innerHTML = `
            <button type="button" class="btn-icon add-subcategory-btn" title="Add New Subcategory">
                <i class="fas fa-plus"></i>
            </button>
            <button type="button" class="btn-icon remove-subcategory-btn" title="Remove Selected Subcategory">
                <i class="fas fa-minus"></i>
            </button>
        `;
        subcategoryFormGroup.appendChild(subcategoryControls);

        // Add CSS styles
        this.addStyles();
    }

    /**
     * Add the necessary styles for the category management UI
     */
    addStyles() {
        // Check if styles are already added
        if (document.getElementById('automation-category-manager-styles')) return;

        const styleElement = document.createElement('style');
        styleElement.id = 'automation-category-manager-styles';
        styleElement.textContent = `
            .category-management-controls {
                display: flex;
                margin-top: 5px;
                gap: 5px;
            }

            .btn-icon {
                background-color: #1a1a1a;
                color: #ffffff;
                border: 1px solid #333333;
                border-radius: 4px;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 12px;
            }

            .btn-icon:hover {
                background-color: #333333;
                border-color: #444444;
            }

            .btn-icon.add-category-btn:hover,
            .btn-icon.add-subcategory-btn:hover {
                background-color: #dcd536;
                border-color: #c9c22f;
                color: #121212;
            }

            .btn-icon.remove-category-btn:hover,
            .btn-icon.remove-subcategory-btn:hover {
                background-color: #333333;
                border-color: #444444;
                color: #ffffff;
            }

            .category-input-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #1e1e24;
                border-radius: 8px;
                padding: 24px;
                z-index: 1000;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
                width: 320px;
                border: 1px solid #333333;
            }

            .category-input-dialog h3 {
                margin-top: 0;
                margin-bottom: 16px;
                color: #ffffff;
                font-size: 18px;
                font-weight: 500;
            }

            .category-input-dialog input {
                width: calc(100% - 10px);
                padding: 12px;
                margin-bottom: 20px;
                margin-right: 10px;
                background-color: #1a1a1a;
                border: 1px solid #333333;
                border-radius: 4px;
                color: #ffffff;
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .category-input-dialog input:focus {
                border-color: #dcd536;
                outline: none;
                box-shadow: 0 0 0 2px rgba(220, 213, 54, 0.2);
            }

            .category-input-dialog .dialog-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .category-input-dialog button {
                padding: 10px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .category-input-dialog .cancel-btn {
                background-color: #272727;
                color: #ffffff;
                border: 1px solid #333333;
            }

            .category-input-dialog .save-btn {
                background-color: #dcd536;
                color: #121212;
                border: 1px solid #c9c22f;
            }

            .category-input-dialog .cancel-btn:hover {
                background-color: #333333;
                border-color: #444444;
            }

            .category-input-dialog .save-btn:hover {
                background-color: #c9c22f;
                border-color: #b8b124;
            }

            .dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 999;
                backdrop-filter: blur(2px);
            }

            .notification {
                position: fixed;
                bottom: 24px;
                right: 24px;
                padding: 16px 20px;
                background-color: #dcd536;
                color: #121212;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                z-index: 1000;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
                font-size: 14px;
                max-width: 320px;
                border: 1px solid #c9c22f;
            }

            .notification.error {
                background-color: #333333;
                color: #ffffff;
                border-color: #444444;
            }

            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;

        document.head.appendChild(styleElement);
    }

    /**
     * Attach event listeners to the buttons
     */
    attachEventListeners() {
        // Add event listeners once the UI is set up
        const addCategoryBtn = this.modalContainer.querySelector('.add-category-btn');
        const removeCategoryBtn = this.modalContainer.querySelector('.remove-category-btn');
        const addSubcategoryBtn = this.modalContainer.querySelector('.add-subcategory-btn');
        const removeSubcategoryBtn = this.modalContainer.querySelector('.remove-subcategory-btn');

        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showAddCategoryDialog());
        }

        if (removeCategoryBtn) {
            removeCategoryBtn.addEventListener('click', () => this.removeCategory());
        }

        if (addSubcategoryBtn) {
            addSubcategoryBtn.addEventListener('click', () => this.showAddSubcategoryDialog());
        }

        if (removeSubcategoryBtn) {
            removeSubcategoryBtn.addEventListener('click', () => this.removeSubcategory());
        }

        // Listen for category changes to update subcategory dropdown
        this.categorySelect.addEventListener('change', () => this.updateSubcategories());
    }

    /**
     * Load categories from localStorage
     */
    loadCategories() {
        try {
            const storedCategories = localStorage.getItem('categories');
            if (storedCategories) {
                this.categories = JSON.parse(storedCategories);
            } else {
                // Initialize with default categories if none exist
                this.categories = [
                    { name: 'Recipes', subcategories: ['Breakfast', 'Lunch', 'Dinner', 'Desserts'] },
                    { name: 'Restaurant Reviews', subcategories: ['Fine Dining', 'Casual', 'Cafes', 'Food Trucks'] },
                    { name: 'Cooking Tips', subcategories: ['Knife Skills', 'Meal Prep', 'Kitchen Hacks'] },
                    { name: 'Food Travel', subcategories: ['Local Cuisines', 'Food Tours', 'Street Food'] }
                ];
                this.saveCategories();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [];
        }
    }

    /**
     * Save categories to localStorage
     */
    saveCategories() {
        try {
            localStorage.setItem('categories', JSON.stringify(this.categories));
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    }

    /**
     * Populate the category dropdown with the loaded categories
     */
    populateCategories() {
        // Clear existing options except the first placeholder option
        while (this.categorySelect.options.length > 1) {
            this.categorySelect.remove(1);
        }

        // Add each category as an option
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            this.categorySelect.appendChild(option);
        });
    }

    /**
     * Update the subcategory dropdown based on the selected category
     */
    updateSubcategories() {
        // Clear existing options except the first placeholder option
        while (this.subcategorySelect.options.length > 1) {
            this.subcategorySelect.remove(1);
        }

        // Add subcategories for the selected category
        const selectedCategory = this.categorySelect.value;
        if (selectedCategory) {
            const category = this.categories.find(cat => cat.name === selectedCategory);
            if (category && category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory;
                    option.textContent = subcategory;
                    this.subcategorySelect.appendChild(option);
                });
            }

            // Update placeholder text
            this.subcategorySelect.options[0].textContent = category && category.subcategories.length === 0 ? 
                'No subcategories available' : 'Select a subcategory';
        }
    }

    /**
     * Show a dialog to add a new category
     */
    showAddCategoryDialog() {
        this.showInputDialog('Add New Category', 'Enter category name', '', (categoryName) => {
            if (categoryName.trim() === '') {
                this.showNotification('Category name cannot be empty', true);
                return;
            }

            if (this.categories.some(cat => cat.name === categoryName)) {
                this.showNotification('Category already exists', true);
                return;
            }

            this.addCategory(categoryName);
        });
    }

    /**
     * Add a new category
     * @param {string} categoryName - The name of the category to add
     */
    addCategory(categoryName) {
        this.categories.push({
            name: categoryName,
            subcategories: []
        });

        this.saveCategories();
        this.populateCategories();

        // Select the newly added category
        this.categorySelect.value = categoryName;
        this.updateSubcategories();

        // Update sidebar categories panel
        this.updateSidebarCategories();

        this.showNotification(`Category "${categoryName}" added successfully`);
    }

    /**
     * Remove the currently selected category
     */
    removeCategory() {
        const selectedCategory = this.categorySelect.value;
        if (!selectedCategory) {
            this.showNotification('Please select a category to remove', true);
            return;
        }

        // Find the index of the category to remove
        const categoryIndex = this.categories.findIndex(cat => cat.name === selectedCategory);
        if (categoryIndex !== -1) {
            this.categories.splice(categoryIndex, 1);
            this.saveCategories();
            this.populateCategories();
            this.updateSubcategories();

            // Update sidebar to reflect the removal
            this.updateSidebarCategories();

            this.showNotification(`Category "${selectedCategory}" removed successfully`);
        }
    }

    /**
     * Show a dialog to add a new subcategory
     */
    showAddSubcategoryDialog() {
        const selectedCategory = this.categorySelect.value;
        if (!selectedCategory) {
            this.showNotification('Please select a category first', true);
            return;
        }

        this.showInputDialog('Add New Subcategory', 'Enter subcategory name', '', (subcategoryName) => {
            if (subcategoryName.trim() === '') {
                this.showNotification('Subcategory name cannot be empty', true);
                return;
            }

            const category = this.categories.find(cat => cat.name === selectedCategory);
            if (category.subcategories.includes(subcategoryName)) {
                this.showNotification('Subcategory already exists', true);
                return;
            }

            this.addSubcategory(selectedCategory, subcategoryName);
        });
    }

    /**
     * Update the sidebar categories panel to reflect current categories
     */
    updateSidebarCategories() {
        // Update the sidebar categories list
        const sidebarCategoriesList = document.querySelector('.categories-container .category-list');
        const sidebarSubcategoriesList = document.querySelector('.subcategories-container .subcategory-list');

        if (sidebarCategoriesList) {
            // Clear existing categories except static templates
            const staticItems = Array.from(sidebarCategoriesList.querySelectorAll('.static-item'));
            sidebarCategoriesList.innerHTML = '';

            // Add static items back if any were found
            staticItems.forEach(item => sidebarCategoriesList.appendChild(item));

            // Add all categories from our list
            this.categories.forEach(category => {
                // Check if category already exists
                if (!sidebarCategoriesList.querySelector(`[data-category="${category.name}"]`)) {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item';
                    categoryItem.dataset.category = category.name;
                    categoryItem.innerHTML = `
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">4</div>
                    `;
                    sidebarCategoriesList.appendChild(categoryItem);
                }
            });
        }

        // Also update the blog sidebar if present
        const blogSidebar = document.querySelector('.blog-sidebar .categories-list');
        if (blogSidebar) {
            // Similar approach to update the blog sidebar category list
            this.updateBlogSidebar();
        }
    }

    /**
     * Update the blog sidebar with categories and subcategories
     */
    updateBlogSidebar() {
        const categoriesList = document.querySelector('.blog-sidebar .categories-list');
        const subcategoriesList = document.querySelector('.blog-sidebar .subcategories-list');

        if (categoriesList) {
            this.categories.forEach(category => {
                if (!categoriesList.querySelector(`[data-category="${category.name}"]`)) {
                    const categoryLink = document.createElement('a');
                    categoryLink.href = `#${category.name.toLowerCase().replace(/ /g, '-')}`;
                    categoryLink.className = 'category-link';
                    categoryLink.dataset.category = category.name;
                    categoryLink.innerHTML = `
                        ${category.name}
                        <span class="category-count">4</span>
                    `;
                    categoriesList.appendChild(categoryLink);
                }
            });
        }

        if (subcategoriesList) {
            // Add all subcategories across all categories
            this.categories.forEach(category => {
                category.subcategories.forEach(subcategory => {
                    if (!subcategoriesList.querySelector(`[data-subcategory="${subcategory}"]`)) {
                        const subcategoryLink = document.createElement('a');
                        subcategoryLink.href = `#${subcategory.toLowerCase().replace(/ /g, '-')}`;
                        subcategoryLink.className = 'subcategory-link';
                        subcategoryLink.dataset.subcategory = subcategory;
                        subcategoryLink.innerHTML = `
                            ${subcategory}
                            <span class="subcategory-count">4</span>
                        `;
                        subcategoriesList.appendChild(subcategoryLink);
                    }
                });
            });
        }
    }

    /**
     * Add a new subcategory to the selected category
     * @param {string} categoryName - The name of the parent category
     * @param {string} subcategoryName - The name of the subcategory to add
     */
    addSubcategory(categoryName, subcategoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        if (category) {
            category.subcategories.push(subcategoryName);
            this.saveCategories();
            this.updateSubcategories();

            // Select the newly added subcategory
            this.subcategorySelect.value = subcategoryName;

            // Update sidebar categories and subcategories panel
            this.updateSidebarCategories();

            this.showNotification(`Subcategory "${subcategoryName}" added successfully`);
        }
    }

    /**
     * Remove the currently selected subcategory
     */
    removeSubcategory() {
        const selectedCategory = this.categorySelect.value;
        const selectedSubcategory = this.subcategorySelect.value;

        if (!selectedCategory) {
            this.showNotification('Please select a category first', true);
            return;
        }

        if (!selectedSubcategory) {
            this.showNotification('Please select a subcategory to remove', true);
            return;
        }

        const category = this.categories.find(cat => cat.name === selectedCategory);
        if (category) {
            const subcategoryIndex = category.subcategories.indexOf(selectedSubcategory);
            if (subcategoryIndex !== -1) {
                category.subcategories.splice(subcategoryIndex, 1);
                this.saveCategories();
                this.updateSubcategories();

                // Update sidebar to reflect the removal
                this.updateSidebarCategories();

                this.showNotification(`Subcategory "${selectedSubcategory}" removed successfully`);
            }
        }
    }

    /**
     * Show an input dialog for adding categories or subcategories
     * @param {string} title - The dialog title
     * @param {string} placeholder - The input placeholder text
     * @param {string} defaultValue - The default input value
     * @param {Function} callback - The callback function to call when the user confirms
     */
    showInputDialog(title, placeholder, defaultValue, callback) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        document.body.appendChild(overlay);

        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'category-input-dialog';
        dialog.innerHTML = `
            <h3>${title}</h3>
            <input type="text" placeholder="${placeholder}" value="${defaultValue}" aria-label="${placeholder}">
            <div class="dialog-buttons">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="button" class="save-btn">Save</button>
            </div>
        `;
        document.body.appendChild(dialog);

        // Get the input element and focus it
        const input = dialog.querySelector('input');
        input.focus();

        // Handle enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = input.value.trim();
                closeDialog();
                callback(value);
            }
        });

        // Handle dialog buttons
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const saveBtn = dialog.querySelector('.save-btn');

        cancelBtn.addEventListener('click', closeDialog);
        saveBtn.addEventListener('click', () => {
            const value = input.value.trim();
            closeDialog();
            callback(value);
        });

        // Close dialog function
        function closeDialog() {
            document.body.removeChild(dialog);
            document.body.removeChild(overlay);
        }
    }

    /**
     * Show a notification message
     * @param {string} message - The notification message
     * @param {boolean} isError - Whether this is an error notification
     */
    showNotification(message, isError = false) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            document.body.removeChild(notification);
        });

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show the notification (delayed to ensure CSS transition works)
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Create global instance
    window.AutomationCategoryManager = new AutomationCategoryManager();
}

// Initialize the AutomationCategoryManager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing AutomationCategoryManager...');
    const categoryManager = new AutomationCategoryManager();

    // Store the original function for opening the automation path form
    if (window.aiAutomation && typeof window.aiAutomation.openAutomationPathForm === 'function') {
        const originalOpenForm = window.aiAutomation.openAutomationPathForm;

        window.aiAutomation.openAutomationPathForm = function(existingPath = null) {
            // Call the original function first
            originalOpenForm.call(window.aiAutomation, existingPath);

            // Initialize our category manager with a slight delay to ensure the form is visible
            console.log('Automation path form opened, initializing category manager...');
            setTimeout(() => {
                categoryManager.init();
                categoryManager.populateCategories();
                categoryManager.updateSubcategories();
            }, 300);
        };
    }

    // Also attach to all open form buttons as a backup
    const openPathBtns = document.querySelectorAll('.add-path-btn, .edit-path-btn');
    openPathBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Path button clicked, initializing category manager...');
            setTimeout(() => {
                categoryManager.init();
                categoryManager.populateCategories();
                categoryManager.updateSubcategories();
            }, 300);
        });
    });

    // Initialize immediately as well for testing
    setTimeout(() => {
        try {
            categoryManager.init();
            categoryManager.populateCategories();
            categoryManager.updateSubcategories();
            console.log('Category manager initialized directly');
        } catch (e) {
            console.error('Error initializing category manager:', e);
        }
    }, 1000);

    // Make the manager available globally
    window.automationCategoryManager = categoryManager;
});

// Direct init function for external calls
function initAutomationCategoryManager() {
    console.log('Direct initialization of category manager requested');
    if (window.automationCategoryManager) {
        window.automationCategoryManager.init();
        window.automationCategoryManager.populateCategories();
        window.automationCategoryManager.updateSubcategories();
        return true;
    }
    return false;
}