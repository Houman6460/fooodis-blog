/**
 * Categories & Tags Dark Theme Functionality
 * This script handles the categories, subcategories, and tags functionality
 * with proper dark theme implementation
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categoriesList = document.getElementById('categoriesList');
    const subcategoriesList = document.getElementById('subcategoriesList');
    const tagsCloud = document.getElementById('tagsCloud');
    const subcategoryParent = document.getElementById('subcategoryParent');
    
    // Form Elements
    const newCategoryName = document.getElementById('newCategoryName');
    const newSubcategoryName = document.getElementById('newSubcategoryName');
    const newTagName = document.getElementById('newTagName');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addSubcategoryBtn = document.getElementById('addSubcategoryBtn');
    const addTagBtn = document.getElementById('addTagBtn');
    
    // Data Storage
    let categories = JSON.parse(localStorage.getItem('blogCategories')) || [];
    let subcategories = JSON.parse(localStorage.getItem('blogSubcategories')) || [];
    let tags = JSON.parse(localStorage.getItem('blogTags')) || [];
    
    // Initialize
    renderCategories();
    renderSubcategories();
    renderTags();
    populateCategoryDropdown();
    
    // Event Listeners
    addCategoryBtn.addEventListener('click', addCategory);
    addSubcategoryBtn.addEventListener('click', addSubcategory);
    addTagBtn.addEventListener('click', addTag);
    
    // Functions
    function renderCategories() {
        categoriesList.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesList.innerHTML = '<div class="empty-message">No categories yet</div>';
            return;
        }
        
        categories.forEach((category, index) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <span class="category-name">${category}</span>
                <div class="category-actions">
                    <button class="edit-btn" title="Edit" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = categoryItem.querySelector('.edit-btn');
            const deleteBtn = categoryItem.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => editCategory(index));
            deleteBtn.addEventListener('click', () => deleteCategory(index));
            
            categoriesList.appendChild(categoryItem);
        });
    }
    
    function renderSubcategories() {
        subcategoriesList.innerHTML = '';
        
        if (subcategories.length === 0) {
            subcategoriesList.innerHTML = '<div class="empty-message">No subcategories yet</div>';
            return;
        }
        
        subcategories.forEach((subcategory, index) => {
            const parentCategory = categories[subcategory.parentIndex] || 'undefined';
            
            const subcategoryItem = document.createElement('div');
            subcategoryItem.className = 'subcategory-item';
            subcategoryItem.innerHTML = `
                <div>
                    <span class="subcategory-name">${subcategory.name}</span>
                    <span class="subcategory-parent">(${parentCategory})</span>
                </div>
                <div class="subcategory-actions">
                    <button class="edit-btn" title="Edit" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = subcategoryItem.querySelector('.edit-btn');
            const deleteBtn = subcategoryItem.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => editSubcategory(index));
            deleteBtn.addEventListener('click', () => deleteSubcategory(index));
            
            subcategoriesList.appendChild(subcategoryItem);
        });
    }
    
    function renderTags() {
        tagsCloud.innerHTML = '';
        
        if (tags.length === 0) {
            tagsCloud.innerHTML = '<div class="empty-message">No tags yet</div>';
            return;
        }
        
        tags.forEach((tag, index) => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            tagItem.innerHTML = `
                <span class="tag-name">${tag}</span>
                <div class="tag-actions">
                    <button class="tag-delete-btn" title="Delete" data-index="${index}"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            // Add event listener
            const deleteBtn = tagItem.querySelector('.tag-delete-btn');
            deleteBtn.addEventListener('click', () => deleteTag(index));
            
            tagsCloud.appendChild(tagItem);
        });
    }
    
    function populateCategoryDropdown() {
        // Clear existing options except the first one
        while (subcategoryParent.options.length > 1) {
            subcategoryParent.remove(1);
        }
        
        // Add categories to dropdown
        categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = category;
            subcategoryParent.appendChild(option);
        });
    }
    
    function addCategory() {
        const categoryName = newCategoryName.value.trim();
        
        if (!categoryName) {
            showNotification('Please enter a category name', 'error');
            return;
        }
        
        if (categories.includes(categoryName)) {
            showNotification('Category already exists', 'error');
            return;
        }
        
        categories.push(categoryName);
        saveCategories();
        newCategoryName.value = '';
        renderCategories();
        populateCategoryDropdown();
        showNotification('Category added successfully', 'success');
    }
    
    function editCategory(index) {
        const category = categories[index];
        const newName = prompt('Edit category name:', category);
        
        if (newName === null) return; // User canceled
        
        if (!newName.trim()) {
            showNotification('Category name cannot be empty', 'error');
            return;
        }
        
        if (categories.includes(newName.trim()) && newName.trim() !== category) {
            showNotification('Category already exists', 'error');
            return;
        }
        
        categories[index] = newName.trim();
        saveCategories();
        renderCategories();
        populateCategoryDropdown();
        renderSubcategories(); // Update parent references
        showNotification('Category updated successfully', 'success');
    }
    
    function deleteCategory(index) {
        if (!confirm('Are you sure you want to delete this category? This will also affect subcategories.')) {
            return;
        }
        
        categories.splice(index, 1);
        
        // Update subcategories with this parent
        subcategories = subcategories.filter(subcategory => subcategory.parentIndex !== index);
        
        // Update parent indices for remaining subcategories
        subcategories.forEach(subcategory => {
            if (subcategory.parentIndex > index) {
                subcategory.parentIndex--;
            }
        });
        
        saveCategories();
        saveSubcategories();
        renderCategories();
        renderSubcategories();
        populateCategoryDropdown();
        showNotification('Category deleted successfully', 'success');
    }
    
    function addSubcategory() {
        const subcategoryName = newSubcategoryName.value.trim();
        const parentIndex = subcategoryParent.value;
        
        if (!subcategoryName) {
            showNotification('Please enter a subcategory name', 'error');
            return;
        }
        
        if (!parentIndex) {
            showNotification('Please select a parent category', 'error');
            return;
        }
        
        if (subcategories.some(s => s.name === subcategoryName && s.parentIndex === parseInt(parentIndex))) {
            showNotification('Subcategory already exists under this parent', 'error');
            return;
        }
        
        subcategories.push({
            name: subcategoryName,
            parentIndex: parseInt(parentIndex)
        });
        
        saveSubcategories();
        newSubcategoryName.value = '';
        subcategoryParent.selectedIndex = 0;
        renderSubcategories();
        showNotification('Subcategory added successfully', 'success');
    }
    
    function editSubcategory(index) {
        const subcategory = subcategories[index];
        const newName = prompt('Edit subcategory name:', subcategory.name);
        
        if (newName === null) return; // User canceled
        
        if (!newName.trim()) {
            showNotification('Subcategory name cannot be empty', 'error');
            return;
        }
        
        if (subcategories.some(s => s.name === newName.trim() && 
                               s.parentIndex === subcategory.parentIndex && 
                               subcategories.indexOf(s) !== index)) {
            showNotification('Subcategory already exists under this parent', 'error');
            return;
        }
        
        subcategories[index].name = newName.trim();
        saveSubcategories();
        renderSubcategories();
        showNotification('Subcategory updated successfully', 'success');
    }
    
    function deleteSubcategory(index) {
        if (!confirm('Are you sure you want to delete this subcategory?')) {
            return;
        }
        
        subcategories.splice(index, 1);
        saveSubcategories();
        renderSubcategories();
        showNotification('Subcategory deleted successfully', 'success');
    }
    
    function addTag() {
        const tagName = newTagName.value.trim();
        
        if (!tagName) {
            showNotification('Please enter a tag name', 'error');
            return;
        }
        
        if (tags.includes(tagName)) {
            showNotification('Tag already exists', 'error');
            return;
        }
        
        tags.push(tagName);
        saveTags();
        newTagName.value = '';
        renderTags();
        showNotification('Tag added successfully', 'success');
    }
    
    function deleteTag(index) {
        if (!confirm('Are you sure you want to delete this tag?')) {
            return;
        }
        
        tags.splice(index, 1);
        saveTags();
        renderTags();
        showNotification('Tag deleted successfully', 'success');
    }
    
    // Storage Functions
    function saveCategories() {
        localStorage.setItem('blogCategories', JSON.stringify(categories));
    }
    
    function saveSubcategories() {
        localStorage.setItem('blogSubcategories', JSON.stringify(subcategories));
    }
    
    function saveTags() {
        localStorage.setItem('blogTags', JSON.stringify(tags));
    }
    
    // Notification Function
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
