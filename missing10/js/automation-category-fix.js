/**
 * Automation Category Fix
 * Ensures proper category synchronization with the automation system
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Automation Category Fix');
  
  // Wait for CategorySyncManager to be available
  function checkCategorySyncManager() {
    if (window.CategorySyncManager) {
      initAutomationCategoryFix();
    } else {
      console.warn('Waiting for CategorySyncManager...');
      setTimeout(checkCategorySyncManager, 500);
    }
  }
  
  // Initialize the fix
  checkCategorySyncManager();
  
  function initAutomationCategoryFix() {
    // Get references to automation category elements
    const automationCategorySelects = document.querySelectorAll('.automation-category-select');
    const automationCategoryTags = document.querySelectorAll('.automation-category-tags');
    
    // Update automation category elements
    function updateAutomationCategories() {
      const categories = window.CategorySyncManager.getCategories();
      updateCategorySelects(categories);
      updateCategoryTags(categories);
      console.log('Automation categories updated');
    }
    
    // Update category dropdowns
    function updateCategorySelects(categories) {
      automationCategorySelects.forEach(select => {
        // Store selected value if it exists
        const selectedValue = select.value;
        
        // Clear existing options (keep default option)
        Array.from(select.options).forEach((option, index) => {
          if (index !== 0) { // Keep first option
            select.removeChild(option);
          }
        });
        
        // Add category options
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id;
          option.textContent = category.name;
          select.appendChild(option);
        });
        
        // Restore selected value if it exists in the new options
        if (selectedValue) {
          select.value = selectedValue;
        }
      });
    }
    
    // Update category tags
    function updateCategoryTags(categories) {
      automationCategoryTags.forEach(tagContainer => {
        // Get selected categories from data attribute
        const selectedIds = (tagContainer.dataset.selectedCategories || '')
          .split(',')
          .filter(id => id.trim() !== '')
          .map(id => parseInt(id.trim()));
        
        // Clear existing tags
        tagContainer.innerHTML = '';
        
        // Add selected category tags
        selectedIds.forEach(id => {
          const category = categories.find(c => c.id === id);
          if (category) {
            const tag = document.createElement('span');
            tag.className = 'category-tag';
            tag.dataset.categoryId = category.id;
            tag.textContent = category.name;
            tag.style.backgroundColor = category.color;
            
            // Add remove button
            const removeBtn = document.createElement('i');
            removeBtn.className = 'fas fa-times';
            removeBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              removeCategory(tagContainer, category.id);
            });
            
            tag.appendChild(removeBtn);
            tagContainer.appendChild(tag);
          }
        });
      });
    }
    
    // Remove a category from tag container
    function removeCategory(container, categoryId) {
      const selectedIds = (container.dataset.selectedCategories || '')
        .split(',')
        .filter(id => id.trim() !== '')
        .map(id => parseInt(id.trim()));
      
      // Remove the category ID
      const updatedIds = selectedIds.filter(id => id !== categoryId);
      
      // Update data attribute
      container.dataset.selectedCategories = updatedIds.join(',');
      
      // Update UI
      updateCategoryTags(window.CategorySyncManager.getCategories());
      
      // Dispatch change event
      container.dispatchEvent(new CustomEvent('categoriesChanged', {
        detail: { selectedCategories: updatedIds }
      }));
    }
    
    // Add event listeners for category selects
    automationCategorySelects.forEach(select => {
      select.addEventListener('change', function() {
        const container = document.querySelector(this.dataset.tagsContainer);
        if (container && this.value) {
          // Add selected category to tags container
          const categoryId = parseInt(this.value);
          
          // Get current selected categories
          const selectedIds = (container.dataset.selectedCategories || '')
            .split(',')
            .filter(id => id.trim() !== '')
            .map(id => parseInt(id.trim()));
          
          // Add the new category if it doesn't exist
          if (!selectedIds.includes(categoryId)) {
            selectedIds.push(categoryId);
            container.dataset.selectedCategories = selectedIds.join(',');
            updateCategoryTags(window.CategorySyncManager.getCategories());
            
            // Dispatch change event
            container.dispatchEvent(new CustomEvent('categoriesChanged', {
              detail: { selectedCategories: selectedIds }
            }));
          }
          
          // Reset select to default option
          this.selectedIndex = 0;
        }
      });
    });
    
    // Subscribe to category changes
    window.CategorySyncManager.subscribe(updateAutomationCategories);
    
    // Initial update
    updateAutomationCategories();
    
    // Make the fix functions globally available
    window.AutomationCategoryFix = {
      refreshCategories: updateAutomationCategories,
      getSelectedCategories: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        
        return (container.dataset.selectedCategories || '')
          .split(',')
          .filter(id => id.trim() !== '')
          .map(id => parseInt(id.trim()));
      }
    };
  }
});
