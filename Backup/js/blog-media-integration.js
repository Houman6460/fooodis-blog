/**
 * Blog Media Integration
 * Integrates the Media Gallery with the blog system for image and video management
 */

(function() {
    // Track when the DOM is ready
    let domReady = false;
    document.addEventListener('DOMContentLoaded', function() {
        domReady = true;
        initBlogMediaIntegration();
    });

    // Initialize immediately if DOM is already loaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        domReady = true;
        initBlogMediaIntegration();
    }

    // Main initialization function
    function initBlogMediaIntegration() {
        console.log('BlogMediaIntegration: Initializing...');
        
        // Create blog editor modal if it doesn't exist
        createBlogEditorModal();
        
        // Add media gallery buttons to the blog editor
        addMediaGalleryButtons();
        
        // Setup event listeners
        setupMediaEventListeners();
        
        // Register events for blog post saving
        registerSaveEvents();
        
        console.log('BlogMediaIntegration: Initialized successfully');
    }
    
    // Create blog editor modal
    function createBlogEditorModal() {
        // Check if the modal already exists
        if (document.getElementById('blog-editor-modal')) {
            return;
        }
        
        // Create the modal HTML
        const modal = document.createElement('div');
        modal.id = 'blog-editor-modal';
        modal.className = 'modal blog-editor-modal';
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Edit Blog Post</h3>
                        <button type="button" class="close-button" data-action="close-editor">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="blog-editor-form">
                            <input type="hidden" id="edit-post-id">
                            
                            <div class="form-group">
                                <label for="edit-post-title">Title</label>
                                <input type="text" id="edit-post-title" class="form-control" required>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="edit-post-category">Category</label>
                                    <input type="text" id="edit-post-category" class="form-control" required>
                                </div>
                                <div class="form-group col-md-6">
                                    <label for="edit-post-subcategory">Subcategory</label>
                                    <input type="text" id="edit-post-subcategory" class="form-control">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-post-image">Featured Image</label>
                                <div class="media-input-group">
                                    <input type="text" id="edit-post-image" class="form-control" readonly>
                                    <button type="button" class="media-gallery-btn" data-target="edit-post-image">
                                        Select Image
                                    </button>
                                </div>
                                <div id="edit-post-image-preview" class="media-preview"></div>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-post-content">Content</label>
                                <div class="editor-toolbar">
                                    <button type="button" class="toolbar-btn" data-action="format-bold">
                                        <i class="fas fa-bold"></i>
                                    </button>
                                    <button type="button" class="toolbar-btn" data-action="format-italic">
                                        <i class="fas fa-italic"></i>
                                    </button>
                                    <button type="button" class="toolbar-btn" data-action="format-heading">
                                        <i class="fas fa-heading"></i>
                                    </button>
                                    <button type="button" class="toolbar-btn" data-action="format-list">
                                        <i class="fas fa-list-ul"></i>
                                    </button>
                                    <button type="button" class="toolbar-btn" data-action="format-link">
                                        <i class="fas fa-link"></i>
                                    </button>
                                    <button type="button" class="media-gallery-btn toolbar-btn" data-target="content-image-insertion">
                                        <i class="fas fa-image"></i>
                                    </button>
                                    <button type="button" class="media-gallery-btn toolbar-btn" data-target="content-video-insertion">
                                        <i class="fas fa-video"></i>
                                    </button>
                                    <input type="hidden" id="content-image-insertion">
                                    <input type="hidden" id="content-video-insertion">
                                </div>
                                <textarea id="edit-post-content" class="form-control editor-textarea" rows="10" required></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-post-tags">Tags</label>
                                <input type="text" id="edit-post-tags" class="form-control" placeholder="Separate tags with commas">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-action="close-editor">Cancel</button>
                        <button type="button" class="btn btn-primary" data-action="save-post">Save Post</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles for the editor
        addEditorStyles();
    }
    
    // Add editor styles
    function addEditorStyles() {
        const styleId = 'blog-editor-styles';
        if (document.getElementById(styleId)) {
            return; // Styles already added
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .blog-editor-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9000;
                align-items: center;
                justify-content: center;
            }
            
            .blog-editor-modal.show {
                display: flex;
            }
            
            .blog-editor-modal .modal-dialog {
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                background: white;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .blog-editor-modal .modal-content {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            
            .blog-editor-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .blog-editor-modal .modal-title {
                margin: 0;
                font-size: 1.25rem;
            }
            
            .blog-editor-modal .close-button {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #888;
            }
            
            .blog-editor-modal .close-button:hover {
                color: #333;
            }
            
            .blog-editor-modal .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .blog-editor-modal .modal-footer {
                padding: 15px 20px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .blog-editor-modal .form-group {
                margin-bottom: 15px;
            }
            
            .blog-editor-modal .form-control {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .blog-editor-modal .form-row {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .blog-editor-modal .form-row .form-group {
                flex: 1;
                margin-bottom: 0;
            }
            
            .blog-editor-modal label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .blog-editor-modal .btn {
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                border: none;
            }
            
            .blog-editor-modal .btn-primary {
                background-color: #0d6efd;
                color: white;
            }
            
            .blog-editor-modal .btn-secondary {
                background-color: #f8f9fa;
                border: 1px solid #ddd;
            }
            
            .blog-editor-modal .editor-toolbar {
                display: flex;
                gap: 5px;
                padding: 8px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-bottom: none;
                border-radius: 4px 4px 0 0;
            }
            
            .blog-editor-modal .toolbar-btn {
                padding: 6px 10px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .blog-editor-modal .toolbar-btn:hover {
                background-color: #e9ecef;
            }
            
            .blog-editor-modal .editor-textarea {
                min-height: 200px;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
                padding: 12px;
                font-family: monospace;
            }
            
            .blog-editor-modal .media-input-group {
                display: flex;
                gap: 10px;
            }
            
            .blog-editor-modal .media-input-group .form-control {
                flex: 1;
            }
            
            .blog-editor-modal .media-preview {
                margin-top: 10px;
                max-height: 200px;
                overflow: hidden;
                border: 1px solid #ddd;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .blog-editor-modal .media-preview img,
            .blog-editor-modal .media-preview video {
                max-width: 100%;
                max-height: 200px;
            }
            
            .blog-editor-modal .media-preview:empty {
                display: none;
            }
            
            .inserted-media {
                max-width: 100%;
                margin: 10px 0;
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Add media gallery buttons to the page
    function addMediaGalleryButtons() {
        // We already added the buttons in the editor modal
        
        // Add a global edit button to each post card
        setTimeout(() => {
            const blogPostCards = document.querySelectorAll('.blog-post-card');
            blogPostCards.forEach(card => {
                // Don't add duplicate buttons
                if (card.querySelector('.blog-post-edit')) {
                    return;
                }
                
                const postId = card.dataset.id;
                const actionsDiv = card.querySelector('.blog-post-actions');
                
                if (actionsDiv) {
                    const editButton = document.createElement('button');
                    editButton.className = 'blog-post-edit';
                    editButton.innerHTML = '<i class="fas fa-edit"></i>';
                    editButton.setAttribute('data-id', postId);
                    editButton.setAttribute('aria-label', 'Edit post');
                    
                    actionsDiv.appendChild(editButton);
                }
            });
        }, 500);
    }
    
    // Setup media-related event listeners
    function setupMediaEventListeners() {
        // Listen for editor modal events
        document.addEventListener('click', function(event) {
            // Close editor
            if (event.target.matches('[data-action="close-editor"]') || 
                (event.target.closest('[data-action="close-editor"]'))) {
                closeEditorModal();
            }
            
            // Save post
            if (event.target.matches('[data-action="save-post"]') || 
                (event.target.closest('[data-action="save-post"]'))) {
                savePost();
            }
            
            // Edit post button
            if (event.target.matches('.blog-post-edit') || 
                (event.target.closest('.blog-post-edit'))) {
                event.preventDefault();
                const button = event.target.matches('.blog-post-edit') ? 
                    event.target : event.target.closest('.blog-post-edit');
                const postId = button.getAttribute('data-id');
                openEditorModal(postId);
            }
            
            // Toolbar buttons
            if (event.target.matches('.toolbar-btn:not(.media-gallery-btn)') || 
                (event.target.closest('.toolbar-btn:not(.media-gallery-btn)'))) {
                event.preventDefault();
                const button = event.target.matches('.toolbar-btn') ? 
                    event.target : event.target.closest('.toolbar-btn');
                const action = button.getAttribute('data-action');
                handleFormatAction(action);
            }
        });
        
        // Listen for media selection events
        document.addEventListener('mediaSelected', function(event) {
            const media = event.detail.media;
            const targetId = event.detail.targetId;
            
            // Handle image preview
            if (targetId === 'edit-post-image') {
                const preview = document.getElementById('edit-post-image-preview');
                preview.innerHTML = '';
                
                if (media.type === 'image') {
                    const img = document.createElement('img');
                    img.src = media.dataUrl;
                    img.alt = media.name;
                    preview.appendChild(img);
                }
            }
            
            // Handle content insertion
            if (targetId === 'content-image-insertion' || targetId === 'content-video-insertion') {
                insertMediaIntoContent(media);
            }
        });
        
        // Preview image when URL changes
        document.getElementById('edit-post-image')?.addEventListener('change', function() {
            const preview = document.getElementById('edit-post-image-preview');
            preview.innerHTML = '';
            
            if (this.value) {
                const img = document.createElement('img');
                img.src = this.value;
                img.alt = 'Preview';
                img.onerror = function() {
                    preview.innerHTML = '<div class="invalid-image">Invalid image URL</div>';
                };
                preview.appendChild(img);
            }
        });
    }
    
    // Register events for blog post saving
    function registerSaveEvents() {
        // Handled in setupMediaEventListeners
    }
    
    // Open the editor modal
    function openEditorModal(postId) {
        const modal = document.getElementById('blog-editor-modal');
        if (!modal) return;
        
        // Find the post
        const post = window.blogPosts.find(p => p.id === postId);
        if (!post) {
            console.error('Post not found:', postId);
            return;
        }
        
        // Fill the form
        document.getElementById('edit-post-id').value = post.id;
        document.getElementById('edit-post-title').value = post.title || '';
        document.getElementById('edit-post-category').value = post.category || '';
        document.getElementById('edit-post-subcategory').value = post.subcategory || '';
        document.getElementById('edit-post-image').value = post.imageUrl || '';
        document.getElementById('edit-post-content').value = post.content || '';
        document.getElementById('edit-post-tags').value = post.tags ? post.tags.join(', ') : '';
        
        // Update image preview
        const preview = document.getElementById('edit-post-image-preview');
        preview.innerHTML = '';
        
        if (post.imageUrl) {
            const img = document.createElement('img');
            img.src = post.imageUrl;
            img.alt = post.title;
            img.onerror = function() {
                preview.innerHTML = '<div class="invalid-image">Invalid image URL</div>';
            };
            preview.appendChild(img);
        }
        
        // Show the modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Close the editor modal
    function closeEditorModal() {
        const modal = document.getElementById('blog-editor-modal');
        if (!modal) return;
        
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Insert media into content
    function insertMediaIntoContent(media) {
        const textarea = document.getElementById('edit-post-content');
        if (!textarea) return;
        
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        const textAfter = textarea.value.substring(cursorPos);
        
        let mediaTag = '';
        
        if (media.type === 'image') {
            mediaTag = `\n![${media.name}](${media.dataUrl})\n`;
        } else if (media.type === 'video') {
            mediaTag = `\n<video src="${media.dataUrl}" controls width="100%"></video>\n`;
        }
        
        textarea.value = textBefore + mediaTag + textAfter;
        
        // Focus back on textarea
        textarea.focus();
        
        // Set cursor position after the inserted media
        const newCursorPos = cursorPos + mediaTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    // Handle formatting actions
    function handleFormatAction(action) {
        const textarea = document.getElementById('edit-post-content');
        if (!textarea) return;
        
        const selStart = textarea.selectionStart;
        const selEnd = textarea.selectionEnd;
        const selectedText = textarea.value.substring(selStart, selEnd);
        
        let formattedText = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'format-bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = 2;
                break;
                
            case 'format-italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = 1;
                break;
                
            case 'format-heading':
                formattedText = `\n## ${selectedText}\n`;
                cursorOffset = 4;
                break;
                
            case 'format-list':
                formattedText = `\n- ${selectedText.split('\n').join('\n- ')}\n`;
                cursorOffset = 3;
                break;
                
            case 'format-link':
                formattedText = `[${selectedText}](url)`;
                cursorOffset = 1;
                break;
                
            default:
                return;
        }
        
        // Replace the selected text with the formatted text
        const textBefore = textarea.value.substring(0, selStart);
        const textAfter = textarea.value.substring(selEnd);
        
        textarea.value = textBefore + formattedText + textAfter;
        
        // Focus back on textarea
        textarea.focus();
        
        // Set selection or cursor position
        if (selectedText) {
            // If there was selected text, place cursor at the end of the formatted text
            const newCursorPos = selStart + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        } else {
            // If there was no selection, place cursor appropriately based on the format
            const newCursorPos = selStart + cursorOffset;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
    }
    
    // Save the post
    function savePost() {
        const postId = document.getElementById('edit-post-id').value;
        const title = document.getElementById('edit-post-title').value;
        const category = document.getElementById('edit-post-category').value;
        const subcategory = document.getElementById('edit-post-subcategory').value;
        const imageUrl = document.getElementById('edit-post-image').value;
        const content = document.getElementById('edit-post-content').value;
        const tagsString = document.getElementById('edit-post-tags').value;
        
        // Validate
        if (!title || !category || !content) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Process tags
        const tags = tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        
        // Find the post to update
        const postIndex = window.blogPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            console.error('Post not found:', postId);
            return;
        }
        
        // Create updated post object
        const updatedPost = {
            ...window.blogPosts[postIndex],
            title,
            category,
            subcategory,
            imageUrl,
            content,
            tags,
            excerpt: content.substring(0, 120) + '...',
            lastModified: new Date().toISOString()
        };
        
        // Update the post
        window.blogPosts[postIndex] = updatedPost;
        
        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(window.blogPosts));
        
        // Close the modal
        closeEditorModal();
        
        // Refresh the page to show changes
        window.location.reload();
    }
})();
