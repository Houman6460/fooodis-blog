/**
 * Category UI Sync
 * Handles UI synchronization of categories across different parts of the application
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ensure CategorySyncManager is available
  if (!window.CategorySyncManager) {
    console.error('CategorySyncManager is required for CategoryUISync');
    return;
  }

  // Initialize the CategoryUISync class
  class CategoryUISync {
    constructor() {
      this.manager = window.CategorySyncManager;
      this.selectors = {
        dropdowns: '.category-dropdown',
        checkboxes: '.category-checkbox-group',
        tags: '.category-tags',
        pills: '.category-pills',
        colorPickers: '.category-color-picker'
      };
      
      this.init();
      console.log('CategoryUISync initialized');
    }

    // Initialize with CategorySyncManager
    init() {
      this.refreshAllCategoryElements();
      this.attachEventListeners();
      
      // Subscribe to category changes
      this.manager.subscribe(this.refreshAllCategoryElements.bind(this));
    }

    // Refresh all category UI elements
    refreshAllCategoryElements() {
      this.updateDropdowns();
      this.updateCheckboxes();
      this.updateTags();
      this.updatePills();
      this.updateColorPickers();
      
      // Dispatch custom event for other components
      document.dispatchEvent(new CustomEvent('categoriesUpdated', {
        detail: { categories: this.manager.getCategories() }
      }));
    }

    // Update category dropdowns
    updateDropdowns() {
      const dropdowns = document.querySelectorAll(this.selectors.dropdowns);
      if (!dropdowns.length) return;
      
      const categories = this.manager.getCategories();
      const fragment = document.createDocumentFragment();
      
      dropdowns.forEach(dropdown => {
        // Clear existing options except the default one
        while (dropdown.childElementCount > 1) {
          dropdown.removeChild(dropdown.lastChild);
        }
        
        // Add category options
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          option.style.color = category.color;
          fragment.appendChild(option);
        });
        
        dropdown.appendChild(fragment.cloneNode(true));
      });
    }

    // Update category checkboxes
    updateCheckboxes() {
      const checkboxGroups = document.querySelectorAll(this.selectors.checkboxes);
      if (!checkboxGroups.length) return;
      
      const categories = this.manager.getCategories();
      
      checkboxGroups.forEach(group => {
        // Clear existing checkboxes
        group.innerHTML = '';
        
        // Add category checkboxes
        categories.forEach(category => {
          const label = document.createElement('label');
          label.className = 'category-checkbox-label';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = category.id;
          checkbox.className = 'category-checkbox';
          checkbox.dataset.categoryId = category.id;
          
          const span = document.createElement('span');
          span.className = 'category-checkbox-text';
          span.textContent = category.name;
          span.style.color = category.color;
          
          label.appendChild(checkbox);
          label.appendChild(span);
          group.appendChild(label);
        });
      });
    }

    // Update category tags
    updateTags() {
      const tagContainers = document.querySelectorAll(this.selectors.tags);
      if (!tagContainers.length) return;
      
      const categories = this.manager.getCategories();
      
      tagContainers.forEach(container => {
        // Clear existing tags
        container.innerHTML = '';
        
        // Add category tags
        categories.forEach(category => {
          const tag = document.createElement('span');
          tag.className = 'category-tag';
          tag.textContent = category.name;
          tag.style.backgroundColor = category.color;
          tag.dataset.categoryId = category.id;
          
          container.appendChild(tag);
        });
      });
    }

    // Update category pills
    updatePills() {
      const pillContainers = document.querySelectorAll(this.selectors.pills);
      if (!pillContainers.length) return;
      
      const categories = this.manager.getCategories();
      
      pillContainers.forEach(container => {
        // Clear existing pills
        container.innerHTML = '';
        
        // Add category pills
        categories.forEach(category => {
          const pill = document.createElement('span');
          pill.className = 'category-pill';
          pill.textContent = category.name;
          pill.style.backgroundColor = category.color;
          pill.dataset.categoryId = category.id;
          
          container.appendChild(pill);
        });
      });
    }

    // Update category color pickers
    updateColorPickers() {
      const colorPickers = document.querySelectorAll(this.selectors.colorPickers);
      if (!colorPickers.length) return;
      
      const categories = this.manager.getCategories();
      
      colorPickers.forEach(picker => {
        // Clear existing color options
        picker.innerHTML = '';
        
        // Add color options based on categories
        categories.forEach(category => {
          const colorOption = document.createElement('div');
          colorOption.className = 'color-option';
          colorOption.style.backgroundColor = category.color;
          colorOption.dataset.color = category.color;
          colorOption.dataset.categoryId = category.id;
          
          picker.appendChild(colorOption);
        });
      });
    }

    // Attach event listeners for category UI interactions
    attachEventListeners() {
      document.addEventListener('click', (event) => {
        // Handle category tag clicks
        if (event.target.matches('.category-tag, .category-pill')) {
          const categoryId = parseInt(event.target.dataset.categoryId);
          if (!isNaN(categoryId)) {
            this.handleCategorySelection(categoryId);
          }
        }
        
        // Handle color option clicks
        if (event.target.matches('.color-option')) {
          const color = event.target.dataset.color;
          const categoryId = parseInt(event.target.dataset.categoryId);
          if (color && !isNaN(categoryId)) {
            this.handleColorSelection(categoryId, color);
          }
        }
      });
      
      // Handle dropdown changes
      document.addEventListener('change', (event) => {
        if (event.target.matches(this.selectors.dropdowns)) {
          const categoryId = parseInt(event.target.value);
          if (!isNaN(categoryId)) {
            this.handleCategorySelection(categoryId);
          }
        }
        
        // Handle checkbox changes
        if (event.target.matches('.category-checkbox')) {
          const categoryId = parseInt(event.target.dataset.categoryId);
          const isChecked = event.target.checked;
          if (!isNaN(categoryId)) {
            this.handleCategoryToggle(categoryId, isChecked);
          }
        }
      });
    }

    // Handle category selection
    handleCategorySelection(categoryId) {
      // Dispatch custom event for category selection
      document.dispatchEvent(new CustomEvent('categorySelected', {
        detail: { 
          categoryId: categoryId,
          category: this.manager.getCategories().find(c => c.id === categoryId)
        }
      }));
    }

    // Handle category toggle (checkbox)
    handleCategoryToggle(categoryId, isChecked) {
      // Dispatch custom event for category toggle
      document.dispatchEvent(new CustomEvent('categoryToggled', {
        detail: { 
          categoryId: categoryId,
          isChecked: isChecked,
          category: this.manager.getCategories().find(c => c.id === categoryId)
        }
      }));
    }

    // Handle color selection
    handleColorSelection(categoryId, color) {
      // Update category color
      this.manager.updateCategory(categoryId, { color: color });
      
      // Dispatch custom event for color selection
      document.dispatchEvent(new CustomEvent('categoryColorChanged', {
        detail: { 
          categoryId: categoryId,
          color: color,
          category: this.manager.getCategories().find(c => c.id === categoryId)
        }
      }));
    }
  }

  // Initialize the UI synchronization
  window.categoryUISync = new CategoryUISync();
});
