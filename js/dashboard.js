/**
 * Fooodis Blog Dashboard - JavaScript
 * Handles blog post creation, management, and dashboard functionality
 */

// Global variables
let blogPosts = [];
let categories = [];
let subcategories = [];
let tags = [];
let featuredPosts = [];
let blogSettings = {};
let currentEditingPostId = null;
let confirmationCallback = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
});

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.dashboard-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'dashboard-notification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and type
    notification.textContent = message;
    notification.className = 'dashboard-notification';
    notification.classList.add(`notification-${type}`);
    notification.classList.add('show');
    
    // Add appropriate icon based on type
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
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    notification.innerHTML = `${icon} ${message}`;
    
    // Auto-hide notification after 3 seconds
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the dashboard
function initializeDashboard() {
    // Load blog data (initially from localStorage; will be overwritten by BlogDataManager sync)
    loadBlogData();
    
    // Setup navigation
    setupNavigation();
    
    // Setup form handlers
    setupFormHandlers();
    
    // Setup modal handlers
    setupModalHandlers();
    
    // Render data
    renderPostsTable();
    renderCategoriesLists();
    renderTagsCloud();
    loadSettingsForm();
    
    // Setup rich text editor
    setupRichTextEditor();
    
    // Trigger backend sync if BlogDataManager is available
    if (window.blogDataManager && typeof window.blogDataManager.fetchFromBackend === 'function') {
        window.blogDataManager.fetchFromBackend();
    }
}

// Listen for backend blog post updates and refresh dashboard views
document.addEventListener('blogPostsUpdated', function(e) {
    try {
        const posts = (e.detail && Array.isArray(e.detail.posts))
            ? e.detail.posts
            : (window.blogDataManager ? window.blogDataManager.getAllPosts() : []);
        
        if (!Array.isArray(posts)) {
            return;
        }
        
        // Update global blog data
        blogPosts = posts;
        categories = extractCategories(blogPosts);
        subcategories = extractSubcategories(blogPosts);
        tags = extractTags(blogPosts);
        
        // Refresh UI sections that depend on blog data
        renderPostsTable();
        renderCategoriesLists();
        renderTagsCloud();
        populateCategoryDropdown();
    } catch (err) {
        console.error('Dashboard: Error syncing blog posts from backend', err);
    }
});

// Load blog data from localStorage
function loadBlogData() {
    // Try to load from localStorage
    const storedPosts = localStorage.getItem('fooodis-blog-posts');
    const storedCategories = localStorage.getItem('fooodis-blog-categories');
    const storedSubcategories = localStorage.getItem('fooodis-blog-subcategories');
    const storedTags = localStorage.getItem('fooodis-blog-tags');
    const storedFeaturedPosts = localStorage.getItem('fooodis-blog-featured');
    const storedSettings = localStorage.getItem('fooodis-blog-settings');
    
    // If data exists in localStorage, use it
    if (storedPosts) {
        blogPosts = JSON.parse(storedPosts);
    } else {
        // Otherwise use default sample data
        blogPosts = getSampleBlogPosts();
        localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    }
    
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        categories = extractCategories(blogPosts);
        localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
    }
    
    if (storedSubcategories) {
        subcategories = JSON.parse(storedSubcategories);
    } else {
        subcategories = extractSubcategories(blogPosts);
        localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    }
    
    if (storedTags) {
        tags = JSON.parse(storedTags);
    } else {
        tags = extractTags(blogPosts);
        localStorage.setItem('fooodis-blog-tags', JSON.stringify(tags));
    }
    
    if (storedFeaturedPosts) {
        featuredPosts = JSON.parse(storedFeaturedPosts);
    } else {
        // Set the first post as featured by default
        featuredPosts = blogPosts.filter(post => post.featured).map(post => post.id);
        localStorage.setItem('fooodis-blog-featured', JSON.stringify(featuredPosts));
    }
    
    if (storedSettings) {
        blogSettings = JSON.parse(storedSettings);
    } else {
        // Default settings
        blogSettings = {
            blogTitle: 'Fooodis Blog',
            blogDescription: 'Latest insights, tips, and updates for restaurant management',
            postsPerPage: 6,
            showFeaturedBanner: true,
            showSidebar: true
        };
        localStorage.setItem('fooodis-blog-settings', JSON.stringify(blogSettings));
    }
    
    // Populate category dropdown
    populateCategoryDropdown();
}

// Extract unique categories from blog posts
function extractCategories(posts) {
    const categoryMap = {};
    
    posts.forEach(post => {
        if (post.category) {
            if (!categoryMap[post.category]) {
                categoryMap[post.category] = 1;
            } else {
                categoryMap[post.category]++;
            }
        }
    });
    
    return Object.keys(categoryMap).map(category => ({
        name: category,
        count: categoryMap[category]
    }));
}

// Extract unique subcategories from blog posts
function extractSubcategories(posts) {
    const subcategoryMap = {};
    
    posts.forEach(post => {
        if (post.subcategory) {
            if (!subcategoryMap[post.subcategory]) {
                subcategoryMap[post.subcategory] = 1;
            } else {
                subcategoryMap[post.subcategory]++;
            }
        }
    });
    
    return Object.keys(subcategoryMap).map(subcategory => ({
        name: subcategory,
        count: subcategoryMap[subcategory]
    }));
}

// Extract unique tags from blog posts
function extractTags(posts) {
    const tagSet = new Set();
    
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => tagSet.add(tag));
        }
    });
    
    return Array.from(tagSet);
}

// Setup navigation between dashboard sections
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return;
            
            // Remove active class from all nav items and sections
            navItems.forEach(navItem => navItem.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Find and activate the corresponding section
            const sectionId = `${targetSection}-section`;
            const sectionElement = document.getElementById(sectionId);
            
            if (sectionElement) {
                sectionElement.classList.add('active');
                
                // Special handling for email section to ensure it's properly contained
                if (targetSection === 'email-management') {
                    ensureEmailSectionContainment();
                }
            } else {
                console.warn(`Section with ID ${sectionId} not found`);
            }
        });
    });
}

// Ensure email section is properly contained and not visible in other sections
function ensureEmailSectionContainment() {
    // First, remove any email containers that might have been injected into other sections
    const allSections = document.querySelectorAll('.dashboard-section:not(#email-management-section)');
    allSections.forEach(section => {
        const emailElements = section.querySelectorAll('.email-management-container, .email-controls, .email-list-container, .popup-customization');
        emailElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    });
}

// Setup form handlers
function setupFormHandlers() {
    // Post form submission
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePost(e);
        });
    }
    
    // Preview button
    const previewPostBtn = document.getElementById('previewPostBtn');
    if (previewPostBtn) {
        previewPostBtn.addEventListener('click', function() {
            previewPost();
        });
    }
    
    // Publish from preview button
    const publishFromPreviewBtn = document.getElementById('publishFromPreviewBtn');
    if (publishFromPreviewBtn) {
        publishFromPreviewBtn.addEventListener('click', function() {
            savePost();
            closePreviewModal();
        });
    }
    
    // Settings form submission
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings(e);
        });
    }
    
    // Category form submission
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            addNewCategory();
        });
    }
    
    // Subcategory form submission
    const addSubcategoryBtn = document.getElementById('addSubcategoryBtn');
    if (addSubcategoryBtn) {
        addSubcategoryBtn.addEventListener('click', function() {
            addNewSubcategory();
        });
    }
    
    // Tag form submission
    const addTagBtn = document.getElementById('addTagBtn');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', function() {
            addNewTag();
        });
    }
    
    // Category dropdown change
    const categoryDropdown = document.getElementById('postCategory');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', function() {
            updateSubcategoryDropdown(this.value);
        });
    }
    
    // Search posts
    const searchPosts = document.getElementById('searchPosts');
    if (searchPosts) {
        searchPosts.addEventListener('input', function() {
            filterPosts();
        });
    }
    
    // Filter posts by category
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) {
        filterCategory.addEventListener('change', function() {
            filterPosts();
        });
    }
    
    // Filter posts by featured status
    const filterFeatured = document.getElementById('filterFeatured');
    if (filterFeatured) {
        filterFeatured.addEventListener('change', function() {
            filterPosts();
        });
    }
}

// Setup modal handlers
function setupModalHandlers() {
    // Preview modal
    const previewModal = document.getElementById('previewModal');
    const closePreviewBtns = document.querySelectorAll('.close-preview, .close-preview-btn');
    
    if (previewModal && closePreviewBtns) {
        closePreviewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                closePreviewModal();
            });
        });
        
        // Close when clicking outside the modal content
        window.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                closePreviewModal();
            }
        });
    }
    
    // Confirmation modal
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmationBtns = document.querySelectorAll('.close-confirmation, #cancelConfirmationBtn');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    if (confirmationModal && closeConfirmationBtns && confirmActionBtn) {
        closeConfirmationBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                closeConfirmationModal();
            });
        });
        
        confirmActionBtn.addEventListener('click', function() {
            if (typeof confirmationCallback === 'function') {
                confirmationCallback();
            }
            closeConfirmationModal();
        });
        
        // Close when clicking outside the modal content
        window.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
    }
}

// Setup rich text editor
function setupRichTextEditor() {
    const editorButtons = document.querySelectorAll('.editor-toolbar button');
    const editor = document.getElementById('postContentEditor');
    const hiddenInput = document.getElementById('postContent');
    
    if (editorButtons && editor && hiddenInput) {
        // Execute commands on button click
        editorButtons.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.getAttribute('data-command');
                
                if (command === 'createLink') {
                    const url = prompt('Enter the link URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else {
                    document.execCommand(command, false, null);
                }
                
                // Update hidden input with content
                hiddenInput.value = editor.innerHTML;
                
                // Focus back on editor
                editor.focus();
            });
        });
        
        // Update hidden input when editor content changes
        editor.addEventListener('input', function() {
            hiddenInput.value = editor.innerHTML;
        });
        
        // Initialize with empty content
        hiddenInput.value = editor.innerHTML;
    }
}

// Save or update a blog post (dashboard editor)
async function savePost(event) {
    if (event) {
        event.preventDefault();
    }
    
    const titleInput = document.getElementById('postTitle');
    const excerptInput = document.getElementById('postExcerpt');
    const contentInput = document.getElementById('postContent');
    const editor = document.getElementById('postContentEditor');
    const categorySelect = document.getElementById('postCategory');
    const subcategorySelect = document.getElementById('postSubcategory');
    const tagsInput = document.getElementById('postTags');
    const featuredCheckbox = document.getElementById('postFeatured');
    
    const title = titleInput ? titleInput.value.trim() : '';
    const excerpt = excerptInput ? excerptInput.value.trim() : '';
    let content = contentInput ? contentInput.value.trim() : '';
    if (!content && editor) {
        content = editor.innerHTML.trim();
    }
    const category = categorySelect ? (categorySelect.value || null) : null;
    const subcategory = subcategorySelect ? (subcategorySelect.value || null) : null;
    const tagsString = tagsInput ? tagsInput.value.trim() : '';
    const featured = featuredCheckbox ? !!featuredCheckbox.checked : false;
    
    if (!title || !content) {
        alert('Please fill in all required fields');
        return;
    }
    
    const tagsArray = tagsString
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    
    const updateFeaturedArray = (postId, isFeatured) => {
        if (!postId) return;
        if (isFeatured) {
            if (!featuredPosts.includes(postId)) {
                featuredPosts.push(postId);
            }
        } else {
            const idx = featuredPosts.indexOf(postId);
            if (idx !== -1) {
                featuredPosts.splice(idx, 1);
            }
        }
    };
    
    try {
        if (currentEditingPostId) {
            const index = blogPosts.findIndex(p => p.id == currentEditingPostId);
            if (index === -1) {
                console.error('Dashboard: Post to edit not found', currentEditingPostId);
            } else {
                const existing = blogPosts[index];
                const updatedPost = {
                    ...existing,
                    title,
                    excerpt,
                    content,
                    category,
                    subcategory,
                    tags: tagsArray,
                    featured
                };
                
                if (window.blogDataManager) {
                    await window.blogDataManager.updatePost({
                        id: updatedPost.id,
                        title: updatedPost.title,
                        content: updatedPost.content,
                        excerpt: updatedPost.excerpt,
                        category: updatedPost.category,
                        subcategory: updatedPost.subcategory,
                        tags: updatedPost.tags,
                        status: 'published'
                    });
                } else {
                    blogPosts[index] = updatedPost;
                    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
                }
                
                updateFeaturedArray(updatedPost.id, featured);
                alert('Post updated successfully!');
            }
        } else {
            const newPostPayload = {
                title,
                content,
                excerpt,
                category,
                subcategory,
                tags: tagsArray,
                status: 'published'
            };
            
            if (window.blogDataManager) {
                const createdPost = await window.blogDataManager.createPost(newPostPayload);
                updateFeaturedArray(createdPost && createdPost.id, featured);
            } else {
                const localPost = {
                    id: Date.now().toString(),
                    ...newPostPayload,
                    date: new Date().toISOString(),
                    imageUrl: 'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg',
                    featured
                };
                blogPosts.push(localPost);
                updateFeaturedArray(localPost.id, featured);
                localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
            }
            
            alert('Post published successfully!');
            
            const postForm = document.getElementById('postForm');
            if (postForm) {
                postForm.reset();
            }
            if (editor) {
                editor.innerHTML = '';
            }
            if (contentInput) {
                contentInput.value = '';
            }
        }
    } catch (err) {
        console.error('Dashboard: Error saving post', err);
        alert('An error occurred while saving the post. Please try again.');
    } finally {
        currentEditingPostId = null;
        const publishBtn = document.getElementById('publishPostBtn');
        if (publishBtn) {
            publishBtn.textContent = 'Publish Post';
        }
        localStorage.setItem('fooodis-blog-featured', JSON.stringify(featuredPosts));
        if (typeof renderPostsTable === 'function') {
            renderPostsTable();
        }
    }
}

// Populate category dropdown
function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById('postCategory');
    const filterCategoryDropdown = document.getElementById('filterCategory');
    const subcategoryParentDropdown = document.getElementById('subcategoryParent');
    
    if (categoryDropdown) {
        // Clear existing options except the first one
        while (categoryDropdown.options.length > 1) {
            categoryDropdown.remove(1);
        }
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryDropdown.appendChild(option);
        });
    }
    
    if (filterCategoryDropdown) {
        // Clear existing options except the first one
        while (filterCategoryDropdown.options.length > 1) {
            filterCategoryDropdown.remove(1);
        }
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            filterCategoryDropdown.appendChild(option);
        });
    }
    
    if (subcategoryParentDropdown) {
        // Clear existing options except the first one
        while (subcategoryParentDropdown.options.length > 1) {
            subcategoryParentDropdown.remove(1);
        }
        
        // Add categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            subcategoryParentDropdown.appendChild(option);
        });
    }
}

// Update subcategory dropdown based on selected category
function updateSubcategoryDropdown(category) {
    const subcategoryDropdown = document.getElementById('postSubcategory');
    
    if (subcategoryDropdown) {
        // Clear existing options
        subcategoryDropdown.innerHTML = '<option value="" disabled selected>Select a subcategory</option>';
        
        // Filter subcategories by category
        const filteredSubcategories = subcategories.filter(subcategory => {
            // Find posts with this subcategory
            const posts = blogPosts.filter(post => post.subcategory === subcategory.name);
            // Check if any of those posts have the selected category
            return posts.some(post => post.category === category);
        });
        
        // Add filtered subcategories
        filteredSubcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory.name;
            option.textContent = subcategory.name;
            subcategoryDropdown.appendChild(option);
        });
    }
}

// Render posts table
function renderPostsTable() {
    const postsTableBody = document.getElementById('postsTableBody');
    
    if (postsTableBody) {
        postsTableBody.innerHTML = '';
        
        if (blogPosts.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="no-posts">No blog posts found.</td>';
            postsTableBody.appendChild(tr);
            return;
        }
        
        blogPosts.forEach(post => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${post.title}</td>
                <td>${post.category || 'Uncategorized'}${post.subcategory ? ` / ${post.subcategory}` : ''}</td>
                <td>${post.featured ? '<span class="post-featured-badge">Featured</span>' : 'No'}</td>
                <td>
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="feature-btn" data-id="${post.id}" title="${post.featured ? 'Unfeature' : 'Feature'}">
                            <i class="fas ${post.featured ? 'fa-star' : 'fa-star-o'}"></i>
                        </button>
                        <button class="delete-btn" data-id="${post.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            
            postsTableBody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                editPost(postId);
            });
        });
        
        document.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                toggleFeaturePost(postId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                confirmDeletePost(postId);
            });
        });
    }
}

// Render categories lists
function renderCategoriesLists() {
    const categoriesList = document.getElementById('categoriesList');
    const subcategoriesList = document.getElementById('subcategoriesList');
    
    if (categoriesList) {
        categoriesList.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesList.innerHTML = '<div class="no-categories">No categories found.</div>';
        } else {
            categories.forEach(category => {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                categoryItem.innerHTML = `
                    <span class="category-name">${category}</span>
                    <div class="category-actions">
                        <button class="edit-category-btn" data-category="${category}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="delete-category-btn" data-category="${category}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                categoriesList.appendChild(categoryItem);
            });
            
            // Add event listeners
            document.querySelectorAll('.edit-category-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    editCategory(category);
                });
            });
            
            document.querySelectorAll('.delete-category-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    deleteCategory(category);
                });
            });
        }
    }
    
    if (subcategoriesList) {
        subcategoriesList.innerHTML = '';
        
        if (subcategories.length === 0) {
            subcategoriesList.innerHTML = '<div class="no-subcategories">No subcategories found.</div>';
        } else {
            subcategories.forEach(subcategory => {
                const subcategoryItem = document.createElement('div');
                subcategoryItem.className = 'subcategory-item';
                subcategoryItem.innerHTML = `
                    <span class="subcategory-name">${subcategory.name} <span class="subcategory-parent">(${subcategory.parent})</span></span>
                    <div class="subcategory-actions">
                        <button class="edit-subcategory-btn" data-name="${subcategory.name}" data-parent="${subcategory.parent}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="delete-subcategory-btn" data-name="${subcategory.name}" data-parent="${subcategory.parent}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                subcategoriesList.appendChild(subcategoryItem);
            });
            
            // Add event listeners
            document.querySelectorAll('.edit-subcategory-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const name = this.getAttribute('data-name');
                    const parent = this.getAttribute('data-parent');
                    editSubcategory(name, parent);
                });
            });
            
            document.querySelectorAll('.delete-subcategory-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const name = this.getAttribute('data-name');
                    const parent = this.getAttribute('data-parent');
                    deleteSubcategory(name, parent);
                });
            });
        }
    }
}

// Render tags cloud
function renderTagsCloud() {
    const tagsCloud = document.getElementById('tagsCloud');
    
    if (tagsCloud) {
        tagsCloud.innerHTML = '';
        
        if (tags.length === 0) {
            tagsCloud.innerHTML = '<div class="no-tags">No tags found.</div>';
        } else {
            tags.forEach(tag => {
                const tagItem = document.createElement('div');
                tagItem.className = 'tag-item';
                tagItem.innerHTML = `
                    <span class="tag-name">${tag}</span>
                    <div class="tag-actions">
                        <button class="edit-tag-btn" data-tag="${tag}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="delete-tag-btn" data-tag="${tag}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                tagsCloud.appendChild(tagItem);
            });
            
            // Add event listeners
            document.querySelectorAll('.edit-tag-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tag = this.getAttribute('data-tag');
                    editTag(tag);
                });
            });
            
            document.querySelectorAll('.delete-tag-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tag = this.getAttribute('data-tag');
                    deleteTag(tag);
                });
            });
        }
    }
}

// Load settings form
function loadSettingsForm() {
    const settingsForm = document.getElementById('settingsForm');
    
    if (settingsForm) {
        // Fill form with current settings
        const blogTitleInput = document.getElementById('blogTitle');
        const blogDescriptionInput = document.getElementById('blogDescription');
        const postsPerPageInput = document.getElementById('postsPerPage');
        const enableCommentsInput = document.getElementById('enableComments');
        const darkModeInput = document.getElementById('darkMode');
        
        if (blogTitleInput) blogTitleInput.value = blogSettings.blogTitle || 'Fooodis Blog';
        if (blogDescriptionInput) blogDescriptionInput.value = blogSettings.blogDescription || '';
        if (postsPerPageInput) postsPerPageInput.value = blogSettings.postsPerPage || 6;
        if (enableCommentsInput) enableCommentsInput.checked = blogSettings.enableComments || false;
        if (darkModeInput) darkModeInput.checked = blogSettings.darkMode || true;
    }
}

// Edit post function
function editPost(postId) {
    // Find the post by ID
    const post = blogPosts.find(p => p.id == postId);
    if (!post) return;
    
    // Fill the form with post data
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('postContentEditor').innerHTML = post.content || '';
    document.getElementById('postContent').value = post.content || '';
    
    if (post.category) {
        document.getElementById('postCategory').value = post.category;
        // Update subcategory dropdown based on selected category
        updateSubcategoryDropdown(post.category);
    }
    
    if (post.subcategory) {
        document.getElementById('postSubcategory').value = post.subcategory;
    }
    
    document.getElementById('postTags').value = post.tags || '';
    document.getElementById('postFeatured').checked = post.featured || false;
    
    // Set current editing post ID
    currentEditingPostId = postId;
    
    // Change button text
    document.getElementById('publishPostBtn').textContent = 'Update Post';
    
    // Switch to create post section
    document.querySelector('[data-section="create-post"]').click();
}

// Toggle featured status of a post
async function toggleFeaturePost(postId) {
    // Use BlogDataManager for D1 sync
    if (window.blogDataManager && typeof window.blogDataManager.toggleFeatured === 'function') {
        try {
            const result = await window.blogDataManager.toggleFeatured(postId);
            if (result.success !== false) {
                // Update local blogPosts array
                const postIndex = blogPosts.findIndex(p => String(p.id) === String(postId));
                if (postIndex !== -1) {
                    blogPosts[postIndex].featured = result.featured;
                }
                
                // Update featured posts array
                if (result.featured) {
                    if (!featuredPosts.includes(postId)) {
                        featuredPosts.push(postId);
                    }
                } else {
                    const index = featuredPosts.indexOf(postId);
                    if (index !== -1) {
                        featuredPosts.splice(index, 1);
                    }
                }
                
                localStorage.setItem('fooodis-blog-featured', JSON.stringify(featuredPosts));
                renderPostsTable();
                return;
            }
        } catch (err) {
            console.error('Dashboard: Error toggling featured via BlogDataManager', err);
        }
    }
    
    // Fallback: local-only toggle
    const postIndex = blogPosts.findIndex(p => p.id == postId);
    if (postIndex === -1) return;
    
    // Toggle featured status
    blogPosts[postIndex].featured = !blogPosts[postIndex].featured;
    
    // Update featured posts array
    if (blogPosts[postIndex].featured) {
        featuredPosts.push(postId);
    } else {
        const index = featuredPosts.indexOf(postId);
        if (index !== -1) {
            featuredPosts.splice(index, 1);
        }
    }
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    localStorage.setItem('fooodis-blog-featured', JSON.stringify(featuredPosts));
    
    // Re-render posts table
    renderPostsTable();
}

// Confirm post deletion
function confirmDeletePost(postId) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        deletePost(postId);
    }
}

// Delete post
async function deletePost(postId) {
    // Prefer BlogDataManager so D1 and local storage stay in sync
    if (window.blogDataManager && typeof window.blogDataManager.deletePost === 'function') {
        try {
            const success = await window.blogDataManager.deletePost(postId);
            if (!success) {
                console.warn('Dashboard: BlogDataManager.deletePost reported failure, falling back to local deletion');
                deletePostLocally(postId);
            }
        } catch (err) {
            console.error('Dashboard: Error deleting post via BlogDataManager', err);
            deletePostLocally(postId);
        }
        return;
    }
    
    // Fallback: local-only deletion
    deletePostLocally(postId);
}

// Local deletion logic used as fallback when BlogDataManager is unavailable
function deletePostLocally(postId) {
    // Remove post from blogPosts array
    blogPosts = blogPosts.filter(p => p.id != postId);
    
    // Remove from featured posts if it's there
    const featuredIndex = featuredPosts.indexOf(postId);
    if (featuredIndex !== -1) {
        featuredPosts.splice(featuredIndex, 1);
    }
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    localStorage.setItem('fooodis-blog-featured', JSON.stringify(featuredPosts));
    
    // Re-render posts table
    renderPostsTable();
}

// Save settings
function saveSettings(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    // Get form elements directly
    const form = event ? event.target : document.getElementById('settingsForm');
    if (!form) {
        showNotification('Settings form not found', 'error');
        return;
    }
    
    const blogTitle = form.querySelector('#blogTitle')?.value || 'Fooodis Blog';
    const blogDescription = form.querySelector('#blogDescription')?.value || '';
    const postsPerPage = parseInt(form.querySelector('#postsPerPage')?.value) || 6;
    const enableComments = form.querySelector('#enableComments')?.checked || false;
    const darkMode = form.querySelector('#darkMode')?.checked || false;
    
    // Update blog settings
    blogSettings = {
        blogTitle,
        blogDescription,
        postsPerPage,
        enableComments,
        darkMode
    };
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-settings', JSON.stringify(blogSettings));
    
    // Show success message
    showNotification('Settings saved successfully!', 'success');
}

// Add new category
function addNewCategory() {
    const categoryInput = document.getElementById('newCategory');
    if (!categoryInput) {
        showNotification('Category input field not found', 'error');
        return;
    }
    
    const newCategory = categoryInput.value.trim();
    
    if (!newCategory) {
        showNotification('Please enter a category name', 'error');
        return;
    }
    
    // Check if category already exists
    if (categories.includes(newCategory)) {
        showNotification('This category already exists', 'error');
        return;
    }
    
    // Add to categories array
    categories.push(newCategory);
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
    
    // Clear input
    categoryInput.value = '';
    
    // Re-render categories
    renderCategoriesLists();
    populateCategoryDropdown();
    
    showNotification('Category added successfully', 'success');
}

// Edit category
function editCategory(category) {
    const newName = prompt('Enter new name for category:', category);
    
    if (!newName || newName.trim() === '') return;
    
    // Check if new name already exists
    if (newName !== category && categories.includes(newName)) {
        alert('A category with this name already exists');
        return;
    }
    
    // Update category name in categories array
    const index = categories.indexOf(category);
    if (index !== -1) {
        categories[index] = newName;
    }
    
    // Update category name in subcategories
    subcategories.forEach((subcategory, i) => {
        if (subcategory.parent === category) {
            subcategories[i].parent = newName;
        }
    });
    
    // Update category name in blog posts
    blogPosts.forEach((post, i) => {
        if (post.category === category) {
            blogPosts[i].category = newName;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
    localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render categories and posts
    renderCategoriesLists();
    renderPostsTable();
    populateCategoryDropdown();
}

// Delete category
function deleteCategory(category) {
    if (!confirm(`Are you sure you want to delete the category "${category}"? This will also delete all associated subcategories.`)) {
        return;
    }
    
    // Remove category from categories array
    const index = categories.indexOf(category);
    if (index !== -1) {
        categories.splice(index, 1);
    }
    
    // Remove associated subcategories
    subcategories = subcategories.filter(subcategory => subcategory.parent !== category);
    
    // Update blog posts (set category to null)
    blogPosts.forEach((post, i) => {
        if (post.category === category) {
            blogPosts[i].category = null;
            blogPosts[i].subcategory = null;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
    localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render categories and posts
    renderCategoriesLists();
    renderPostsTable();
    populateCategoryDropdown();
}

// Add new subcategory
function addNewSubcategory() {
    const subcategoryInput = document.getElementById('newSubcategory');
    const subcategoryParent = document.getElementById('subcategoryParent');
    
    if (!subcategoryInput || !subcategoryParent) {
        showNotification('Subcategory input fields not found', 'error');
        return;
    }
    
    const newSubcategory = subcategoryInput.value.trim();
    const parentCategory = subcategoryParent.value;
    
    if (!newSubcategory) {
        showNotification('Please enter a subcategory name', 'error');
        return;
    }
    
    if (!parentCategory) {
        showNotification('Please select a parent category', 'error');
        return;
    }
    
    // Check if subcategory already exists
    const existingSubcategory = subcategories.find(s => s.name === newSubcategory && s.parent === parentCategory);
    if (existingSubcategory) {
        showNotification('This subcategory already exists under the selected parent category', 'error');
        return;
    }
    
    // Add to subcategories array
    subcategories.push({
        name: newSubcategory,
        parent: parentCategory
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    
    // Clear input
    subcategoryInput.value = '';
    
    // Re-render subcategories
    renderCategoriesLists();
    populateCategoryDropdown();
    
    showNotification('Subcategory added successfully', 'success');
}

// Edit subcategory
function editSubcategory(name, parent) {
    const newName = prompt('Enter new name for subcategory:', name);
    
    if (!newName || newName.trim() === '') return;
    
    // Check if new name already exists
    const existingSubcategory = subcategories.find(s => s.name === newName && s.parent === parent && (s.name !== name || s.parent !== parent));
    if (existingSubcategory) {
        alert('A subcategory with this name already exists under the selected parent category');
        return;
    }
    
    // Update subcategory name in subcategories array
    const index = subcategories.findIndex(s => s.name === name && s.parent === parent);
    if (index !== -1) {
        subcategories[index].name = newName;
    }
    
    // Update subcategory name in blog posts
    blogPosts.forEach((post, i) => {
        if (post.category === parent && post.subcategory === name) {
            blogPosts[i].subcategory = newName;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render subcategories and posts
    renderCategoriesLists();
    renderPostsTable();
    populateCategoryDropdown();
}

// Delete subcategory
function deleteSubcategory(name, parent) {
    if (!confirm(`Are you sure you want to delete the subcategory "${name}"?`)) {
        return;
    }
    
    // Remove subcategory from subcategories array
    const index = subcategories.findIndex(s => s.name === name && s.parent === parent);
    if (index !== -1) {
        subcategories.splice(index, 1);
    }
    
    // Update blog posts (set subcategory to null)
    blogPosts.forEach((post, i) => {
        if (post.category === parent && post.subcategory === name) {
            blogPosts[i].subcategory = null;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-subcategories', JSON.stringify(subcategories));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render subcategories and posts
    renderCategoriesLists();
    renderPostsTable();
    populateCategoryDropdown();
}

// Add new tag
function addNewTag() {
    const tagInput = document.getElementById('newTag');
    
    if (!tagInput) {
        showNotification('Tag input field not found', 'error');
        return;
    }
    
    const newTag = tagInput.value.trim();
    
    if (!newTag) {
        showNotification('Please enter a tag name', 'error');
        return;
    }
    
    // Check if tag already exists
    if (tags.includes(newTag)) {
        showNotification('This tag already exists', 'error');
        return;
    }
    
    // Add to tags array
    tags.push(newTag);
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-tags', JSON.stringify(tags));
    
    // Clear input
    tagInput.value = '';
    
    // Re-render tags
    renderTagsCloud();
    
    showNotification('Tag added successfully', 'success');
}

// Edit tag
function editTag(tag) {
    const newName = prompt('Enter new name for tag:', tag);
    
    if (!newName || newName.trim() === '') return;
    
    // Check if new name already exists
    if (newName !== tag && tags.includes(newName)) {
        showNotification('A tag with this name already exists', 'error');
        return;
    }
    
    // Update tag name in tags array
    const index = tags.indexOf(tag);
    if (index !== -1) {
        tags[index] = newName;
    }
    
    // Update tag name in blog posts
    blogPosts.forEach((post, i) => {
        if (post.tags && typeof post.tags === 'string' && post.tags.includes(tag)) {
            const tagArray = post.tags.split(',').map(t => t.trim());
            const tagIndex = tagArray.indexOf(tag);
            if (tagIndex !== -1) {
                tagArray[tagIndex] = newName;
                blogPosts[i].tags = tagArray.join(', ');
            }
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-tags', JSON.stringify(tags));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render tags and posts
    renderTagsCloud();
    renderPostsTable();
    
    showNotification('Tag updated successfully', 'success');
}

// Delete tag
function deleteTag(tag) {
    if (!confirm(`Are you sure you want to delete the tag "${tag}"?`)) {
        return;
    }
    
    // Remove tag from tags array
    const index = tags.indexOf(tag);
    if (index !== -1) {
        tags.splice(index, 1);
    }
    
    // Update blog posts (remove tag)
    blogPosts.forEach((post, i) => {
        if (post.tags && typeof post.tags === 'string' && post.tags.includes(tag)) {
            const updatedTags = post.tags.split(',').map(t => t.trim()).filter(t => t !== tag);
            blogPosts[i].tags = updatedTags.join(', ');
        }
    });
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-tags', JSON.stringify(tags));
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
    
    // Re-render tags and posts
    renderTagsCloud();
    renderPostsTable();
    
    showNotification('Tag deleted successfully', 'success');
}

// Filter posts in the table
function filterPosts() {
    const searchTerm = document.getElementById('searchPosts').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const featuredFilter = document.getElementById('filterFeatured').value;
    
    let filteredPosts = [...blogPosts];
    
    // Filter by search term
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm)) ||
            (post.content && post.content.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
    }
    
    // Filter by featured status
    if (featuredFilter === 'featured') {
        filteredPosts = filteredPosts.filter(post => post.featured);
    } else if (featuredFilter === 'not-featured') {
        filteredPosts = filteredPosts.filter(post => !post.featured);
    }
    
    // Render filtered posts
    const postsTableBody = document.getElementById('postsTableBody');
    
    if (postsTableBody) {
        postsTableBody.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" class="no-posts">No matching posts found.</td>';
            postsTableBody.appendChild(tr);
            return;
        }
        
        filteredPosts.forEach(post => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${post.title}</td>
                <td>${post.category || 'Uncategorized'}${post.subcategory ? ` / ${post.subcategory}` : ''}</td>
                <td>${post.featured ? '<span class="post-featured-badge">Featured</span>' : 'No'}</td>
                <td>
                    <div class="post-actions">
                        <button class="edit-btn" data-id="${post.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="feature-btn" data-id="${post.id}" title="${post.featured ? 'Unfeature' : 'Feature'}">
                            <i class="fas ${post.featured ? 'fa-star' : 'fa-star-o'}"></i>
                        </button>
                        <button class="delete-btn" data-id="${post.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            
            postsTableBody.appendChild(tr);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                editPost(postId);
            });
        });
        
        document.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                toggleFeaturePost(postId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                confirmDeletePost(postId);
            });
        });
    }
}
