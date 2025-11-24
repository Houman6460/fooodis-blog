/**
 * Ultimate Media Fix
 * This script provides a definitive solution for all media selector issues
 */

(function() {
    // Initialize immediately 
    initUltimateMediaFix();
    
    // Also initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initUltimateMediaFix);
    window.addEventListener('load', initUltimateMediaFix);
    
    // Media data storage
    const mediaData = {
        // Known working image paths
        images: [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', url: '/css/images/cappuccino-or-latte-coffee-with-heart-art.jpg' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', url: '/css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', url: '/css/images/white-cup-of-tasty-cappuccino.jpg' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', url: '/css/images/hot-coffee-latte-art-on-wooden-table.jpg' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', url: '/css/images/appetizing-soup-served-with-herbs.jpg' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', url: '/css/images/restaurant-interior.jpg' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', url: '/css/images/chef-cooking.jpg' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', url: '/css/images/chef-decorating.jpg' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', url: '/css/images/a-full-bag-of-brown-coffee-beans.jpg' }
        ],
        
        // Valid folders to display
        validFolders: ['food', 'restaurant', 'people', 'uncategorized'],
        
        // Folder colors for display
        folderColors: {
            food: '#5b7adb',
            restaurant: '#20c997',
            people: '#fd7e14',
            uncategorized: '#6c757d'
        },
        
        // Folder icons for display
        folderIcons: {
            food: 'fas fa-utensils',
            restaurant: 'fas fa-store',
            people: 'fas fa-users',
            uncategorized: 'fas fa-folder'
        }
    };
    
    // Initialization tracking
    let isInitialized = false;
    
    /**
     * Initialize the ultimate media fix
     */
    function initUltimateMediaFix() {
        if (isInitialized) return;
        isInitialized = true;
        
        console.log('Ultimate Media Fix: Initializing');
        
        // Apply fixes
        overrideMediaFunctions();
        removeTestFolderCompletely();
        enhanceFormAccessibility();
        observeForChanges();
        
        // Set up intervals for continuous monitoring
        setInterval(removeTestFolderCompletely, 120000); // Reduced from 30s to 2 minutes
        setInterval(enhanceFormAccessibility, 180000); // Reduced from 60s to 3 minutes
        
        // Save media data to localStorage for consistency
        localStorage.setItem('fooodis_media_items', JSON.stringify(mediaData.images));
    }
    
    /**
     * Override all media selector functions
     */
    function overrideMediaFunctions() {
        // Replace openMediaLibrary
        if (typeof window.openMediaLibrary === 'function') {
            window._original_openMediaLibrary = window.openMediaLibrary;
        }
        
        // Set our superior version as the default
        window.openMediaLibrary = window.openEnhancedMediaSelector = function(targetInputId) {
            console.log('Ultimate Media Fix: Opening media selector for', targetInputId);
            openUltimateMediaSelector(targetInputId);
        };
        
        // Find and override buttons
        const mediaButtons = document.querySelectorAll('.media-library-button, .media-select-btn, .select-media-btn, [data-action="select-media"]');
        mediaButtons.forEach(overrideButton);
    }
    
    /**
     * Override a single media button
     */
    function overrideButton(button) {
        // Clone to remove existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add our listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetInput = this.getAttribute('data-target') || 
                             this.getAttribute('data-target-input') || 
                             this.getAttribute('data-input') || 
                             'media-input';
            
            openUltimateMediaSelector(targetInput);
        });
    }
    
    /**
     * Open the ultimate media selector
     */
    function openUltimateMediaSelector(targetInputId) {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'ultimate-media-modal';
        modal.setAttribute('data-target', targetInputId);
        
        // Create content with both images and proper folder structure
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Select Media</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="sidebar">
                        <div class="filter-header">FOLDERS</div>
                        <div class="folder-list">
                            <div class="folder active" data-folder="all">
                                <i class="fas fa-images"></i>
                                <span>All Media</span>
                                <span class="count">${mediaData.images.length}</span>
                            </div>
                            ${mediaData.validFolders.map(folder => {
                                const count = mediaData.images.filter(item => item.folder === folder).length;
                                if (count === 0) return '';
                                return `
                                    <div class="folder" data-folder="${folder}">
                                        <i class="${mediaData.folderIcons[folder] || 'fas fa-folder'}"></i>
                                        <span>${capitalize(folder)}</span>
                                        <span class="count">${count}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <div class="media-container">
                        <div class="media-grid"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Set up events
        setupModalEvents(modal, targetInputId);
        
        // Load all media initially
        loadMediaContent(modal, 'all', targetInputId);
    }
    
    /**
     * Set up events for the modal
     */
    function setupModalEvents(modal, targetInputId) {
        // Close button
        modal.querySelector('.close-button').addEventListener('click', () => {
            modal.remove();
        });
        
        // Folder selection
        const folders = modal.querySelectorAll('.folder');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                // Update active class
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Load media for this folder
                const folderType = folder.getAttribute('data-folder');
                loadMediaContent(modal, folderType, targetInputId);
            });
        });
    }
    
    /**
     * Load media content into the grid
     */
    function loadMediaContent(modal, folderFilter, targetInputId) {
        console.log(`Ultimate Media Fix: Loading media for folder ${folderFilter}`);
        
        const mediaGrid = modal.querySelector('.media-grid');
        mediaGrid.innerHTML = '';
        
        // Filter by folder if needed
        let itemsToShow = mediaData.images;
        if (folderFilter && folderFilter !== 'all') {
            itemsToShow = mediaData.images.filter(item => item.folder === folderFilter);
        }
        
        // Create media items
        itemsToShow.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            
            // Get folder color
            const folderColor = mediaData.folderColors[item.folder] || '#6c757d';
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail" style="background-color: ${folderColor}">
                    <img src="${item.url}" alt="${item.name}" onerror="this.style.display='none';">
                    <div class="folder-badge">${item.folder}</div>
                </div>
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                </div>
            `;
            
            // Handle selection
            mediaItem.addEventListener('click', () => {
                selectMedia(item, targetInputId);
                modal.remove();
            });
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    /**
     * Select a media item
     */
    function selectMedia(item, targetInputId) {
        console.log(`Ultimate Media Fix: Selecting ${item.name} for ${targetInputId}`);
        
        // Find the target input
        const input = document.getElementById(targetInputId);
        if (!input) {
            console.error(`Ultimate Media Fix: Target input not found: ${targetInputId}`);
            return;
        }
        
        // Update input value
        input.value = item.url;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        
        // Update preview
        updatePreview(input, item);
    }
    
    /**
     * Update preview after selection
     */
    function updatePreview(input, item) {
        // Find containers near the input
        const container = input.closest('.form-group, .input-group, .field-container');
        if (!container) return;
        
        // Look for preview elements
        const previews = container.querySelectorAll('.image-preview, .preview-container, .media-preview');
        previews.forEach(preview => {
            if (preview.tagName === 'IMG') {
                preview.src = item.url;
                preview.style.display = 'block';
            } else {
                // Check for existing image
                let img = preview.querySelector('img');
                if (img) {
                    img.src = item.url;
                } else {
                    // Create new image
                    img = document.createElement('img');
                    img.src = item.url;
                    img.alt = item.name;
                    preview.innerHTML = '';
                    preview.appendChild(img);
                }
                preview.style.display = 'block';
            }
        });
        
        // Special handling for email popups
        if (container.closest('.email-popup-section, .email-section, .popup-section')) {
            const emailPreviews = document.querySelectorAll('.popup-preview, .email-preview, .banner-preview');
            emailPreviews.forEach(preview => {
                const bgElements = preview.querySelectorAll('.popup-bg, .preview-bg, .banner-bg');
                bgElements.forEach(bg => {
                    bg.style.backgroundImage = `url(${item.url})`;
                });
            });
        }
    }
    
    /**
     * Remove Test folder from everywhere
     */
    function removeTestFolderCompletely() {
        // Look for all possible Test folder instances
        document.querySelectorAll('[data-folder="test"], [data-folder="Test"]').forEach(element => {
            element.remove();
        });
        
        // Look for folder elements with "Test" text
        document.querySelectorAll('.folder, .media-folder').forEach(folder => {
            const text = folder.textContent.toLowerCase();
            if (text.includes('test')) {
                folder.remove();
            }
        });
        
        // Look for any media items associated with Test folder
        document.querySelectorAll('.media-item, .media-library-item').forEach(item => {
            const folder = item.getAttribute('data-folder');
            if (folder && folder.toLowerCase() === 'test') {
                item.remove();
            }
        });
        
        // Replace Test in any folder lists
        document.querySelectorAll('.folder-list, .folders-list').forEach(list => {
            Array.from(list.children).forEach(child => {
                if (child.textContent.toLowerCase().includes('test')) {
                    child.remove();
                }
            });
        });
        
        // Handle specific test folder class
        document.querySelectorAll('.test-folder').forEach(element => {
            element.remove();
        });
    }
    
    /**
     * Enhance form accessibility
     */
    function enhanceFormAccessibility() {
        // Process all form fields
        document.querySelectorAll('input, select, textarea').forEach(field => {
            // Skip buttons and hidden inputs
            if (field.type === 'button' || field.type === 'submit' || field.type === 'hidden') return;
            
            // Ensure field has an ID
            if (!field.id) {
                field.id = generateUniqueId('field');
            }
            
            // Check for associated label
            const hasLabel = document.querySelector(`label[for="${field.id}"]`);
            if (!hasLabel && !field.closest('label')) {
                // Look for a label-like element nearby
                const container = field.closest('.form-group, .input-group, .field-container');
                if (container) {
                    const labelCandidates = container.querySelectorAll('.form-label, .input-label, .field-label');
                    if (labelCandidates.length > 0) {
                        const firstCandidate = labelCandidates[0];
                        
                        if (firstCandidate.tagName === 'LABEL') {
                            // It's a label but missing the 'for' attribute
                            firstCandidate.setAttribute('for', field.id);
                        } else {
                            // Convert to a proper label
                            const label = document.createElement('label');
                            label.setAttribute('for', field.id);
                            label.className = firstCandidate.className;
                            label.innerHTML = firstCandidate.innerHTML;
                            firstCandidate.parentNode.replaceChild(label, firstCandidate);
                        }
                    } else {
                        // Check for text content preceding the field
                        const previousElement = field.previousElementSibling;
                        if (previousElement && !previousElement.querySelector('input, select, textarea')) {
                            // Create a label with the text
                            const label = document.createElement('label');
                            label.setAttribute('for', field.id);
                            label.innerHTML = previousElement.innerHTML;
                            previousElement.parentNode.replaceChild(label, previousElement);
                        }
                    }
                }
            }
        });
        
        // Fix labels with invalid 'for' attributes
        document.querySelectorAll('label[for]').forEach(label => {
            const forAttr = label.getAttribute('for');
            if (forAttr && !document.getElementById(forAttr)) {
                // This label points to a non-existent element
                console.log(`Ultimate Media Fix: Found invalid label for="${forAttr}"`);
                
                // Look for a nearby field to associate with
                const container = label.closest('.form-group, .input-group, .field-container');
                if (container) {
                    const field = container.querySelector('input, select, textarea');
                    if (field) {
                        // Ensure the field has an ID
                        if (!field.id) {
                            field.id = forAttr; // Use the existing 'for' value
                        } else {
                            // Update the label to point to the existing field
                            label.setAttribute('for', field.id);
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Observe DOM for changes
     */
    function observeForChanges() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver(mutations => {
            let mediaChanged = false;
            let formChanged = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            // Check for media elements
                            if (node.querySelector('.media-item, .media-folder, .folder') || 
                                (node.classList && (node.classList.contains('media-item') || 
                                                  node.classList.contains('media-folder') || 
                                                  node.classList.contains('folder')))) {
                                mediaChanged = true;
                            }
                            
                            // Check for form elements
                            if (node.querySelector('input, select, textarea, label') ||
                                (node.tagName && (node.tagName === 'INPUT' || 
                                                node.tagName === 'SELECT' || 
                                                node.tagName === 'TEXTAREA' || 
                                                node.tagName === 'LABEL'))) {
                                formChanged = true;
                            }
                            
                            // Check for media buttons
                            if (node.querySelector('.media-library-button, .media-select-btn')) {
                                const buttons = node.querySelectorAll('.media-library-button, .media-select-btn');
                                buttons.forEach(overrideButton);
                            }
                        }
                    });
                }
            });
            
            if (mediaChanged) removeTestFolderCompletely();
            if (formChanged) enhanceFormAccessibility();
        });
        
        // Observe the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Generate a unique ID
     */
    function generateUniqueId(prefix = 'id') {
        return prefix + '_' + Math.random().toString(36).substring(2, 11);
    }
    
    /**
     * Capitalize first letter
     */
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
        .ultimate-media-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .ultimate-media-modal .modal-content {
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            background-color: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .ultimate-media-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .ultimate-media-modal .modal-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .ultimate-media-modal .close-button {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .ultimate-media-modal .modal-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        .ultimate-media-modal .sidebar {
            width: 250px;
            background-color: #252525;
            overflow-y: auto;
            border-right: 1px solid #333;
        }
        
        .ultimate-media-modal .filter-header {
            padding: 15px;
            color: #aaa;
            font-weight: bold;
            font-size: 12px;
        }
        
        .ultimate-media-modal .folder {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            color: #fff;
            cursor: pointer;
        }
        
        .ultimate-media-modal .folder:hover {
            background-color: #333;
        }
        
        .ultimate-media-modal .folder.active {
            background-color: #3a3a3a;
        }
        
        .ultimate-media-modal .folder i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .ultimate-media-modal .folder .count {
            margin-left: auto;
            padding: 2px 8px;
            background-color: #444;
            border-radius: 10px;
            font-size: 12px;
        }
        
        .ultimate-media-modal .media-container {
            flex: 1;
            overflow-y: auto;
        }
        
        .ultimate-media-modal .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 15px;
            padding: 15px;
        }
        
        .ultimate-media-modal .media-item {
            background-color: #252525;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .ultimate-media-modal .media-item:hover {
            transform: scale(1.05);
        }
        
        .ultimate-media-modal .media-thumbnail {
            height: 150px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .ultimate-media-modal .media-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .ultimate-media-modal .folder-badge {
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: rgba(0,0,0,0.7);
            padding: 5px 10px;
            font-size: 12px;
            color: #fff;
            text-transform: capitalize;
        }
        
        .ultimate-media-modal .media-info {
            padding: 10px;
        }
        
        .ultimate-media-modal .media-name {
            color: #fff;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(styles);
})();
