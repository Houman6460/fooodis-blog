/**
 * Direct Image Loader
 * 
 * This script ensures that images are loaded directly from the same source 
 * in both Media Library and Email Subscribers sections.
 */

(function() {
    // Run immediately & on DOM ready
    initDirectImageLoader();
    document.addEventListener('DOMContentLoaded', initDirectImageLoader);
    
    // Known working image paths (verified from the Media Library)
    const KNOWN_IMAGES = {
        'cappuccino-or-latte-coffee-with-heart-art.jpg': '/css/images/cappuccino-or-latte-coffee-with-heart-art.jpg',
        'japanese-tea-2024-04-08-18-06-00-utc.jpg': '/css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg',
        'white-cup-of-tasty-cappuccino.jpg': '/css/images/white-cup-of-tasty-cappuccino.jpg',
        'hot-coffee-latte-art-on-wooden-table.jpg': '/css/images/hot-coffee-latte-art-on-wooden-table.jpg',
        'appetizing-soup-served-with-herbs.jpg': '/css/images/appetizing-soup-served-with-herbs.jpg',
        'restaurant-interior.jpg': '/css/images/restaurant-interior.jpg', 
        'chef-cooking.jpg': '/css/images/chef-cooking.jpg',
        'chef-decorating.jpg': '/css/images/chef-decorating.jpg',
        'a-full-bag-of-brown-coffee-beans.jpg': '/css/images/a-full-bag-of-brown-coffee-beans.jpg'
    };
    
    // Media folder mapping
    const FOLDER_MAPPING = {
        'cappuccino-or-latte-coffee-with-heart-art.jpg': 'food',
        'japanese-tea-2024-04-08-18-06-00-utc.jpg': 'food',
        'white-cup-of-tasty-cappuccino.jpg': 'food',
        'hot-coffee-latte-art-on-wooden-table.jpg': 'food',
        'appetizing-soup-served-with-herbs.jpg': 'food',
        'restaurant-interior.jpg': 'restaurant', 
        'chef-cooking.jpg': 'people',
        'chef-decorating.jpg': 'people',
        'a-full-bag-of-brown-coffee-beans.jpg': 'food'
    };
    
    /**
     * Initialize the direct image loader
     */
    function initDirectImageLoader() {
        console.log('Direct Image Loader: Initializing');
        
        // Override the media selector function
        overrideMediaSelector();
        
        // Attach to all media select buttons
        setupMediaButtons();
        
        // Remove Test folder from all media selectors
        removeTestFolder();
        
        // Observe DOM for dynamically added elements
        observeDOMChanges();
        
        // Set up interval to periodically remove the Test folder
        setInterval(removeTestFolder, 2000);
    }
    
    /**
     * Remove the Test folder from all media selectors
     */
    function removeTestFolder() {
        // Remove from any open media selectors
        document.querySelectorAll('.folder[data-folder="test"], .media-folder[data-folder="test"]').forEach(folder => {
            folder.remove();
        });
        
        // Also remove from any folder lists
        document.querySelectorAll('.folder-list .folder, .folders-list .folder').forEach(folder => {
            if (folder.textContent.toLowerCase().includes('test')) {
                folder.remove();
            }
        });
        
        // Check for any elements with Test in their text content that might be folders
        document.querySelectorAll('[data-folder]').forEach(element => {
            if (element.getAttribute('data-folder').toLowerCase() === 'test') {
                element.remove();
            }
        });
    }
    
    /**
     * Override the standard media selector function
     */
    function overrideMediaSelector() {
        // Save original if it exists
        if (window.openMediaLibrary && !window._original_openMediaLibrary) {
            window._original_openMediaLibrary = window.openMediaLibrary;
        }
        
        // Replace with our direct version
        window.openMediaLibrary = function(targetInputId) {
            console.log('Direct Image Loader: Opening media selector for', targetInputId);
            openDirectMediaSelector(targetInputId);
        };
    }
    
    /**
     * Set up all media buttons to use our direct loader
     */
    function setupMediaButtons() {
        document.querySelectorAll('.media-library-button, .media-select-btn').forEach(button => {
            // Remove existing listeners and create a clean clone
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Add our listener
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetInput = this.getAttribute('data-target') || 
                                   this.getAttribute('data-target-input') || 
                                   'media-input';
                
                openDirectMediaSelector(targetInput);
            });
        });
    }
    
    /**
     * Open our direct media selector
     */
    function openDirectMediaSelector(targetInputId) {
        // Create the modal
        const modal = document.createElement('div');
        modal.className = 'direct-media-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Select Media</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="folders-sidebar">
                        <div class="folders-header">FOLDERS</div>
                        <div class="folder-list">
                            <div class="folder active" data-folder="all">
                                <i class="fas fa-images"></i>
                                <span>All Media</span>
                                <span class="count">${Object.keys(KNOWN_IMAGES).length}</span>
                            </div>
                            <div class="folder" data-folder="food">
                                <i class="fas fa-utensils"></i>
                                <span>Food</span>
                                <span class="count">${Object.values(FOLDER_MAPPING).filter(f => f === 'food').length}</span>
                            </div>
                            <div class="folder" data-folder="restaurant">
                                <i class="fas fa-store"></i>
                                <span>Restaurant</span>
                                <span class="count">${Object.values(FOLDER_MAPPING).filter(f => f === 'restaurant').length}</span>
                            </div>
                            <div class="folder" data-folder="people">
                                <i class="fas fa-users"></i>
                                <span>People</span>
                                <span class="count">${Object.values(FOLDER_MAPPING).filter(f => f === 'people').length}</span>
                            </div>
                        </div>
                    </div>
                    <div class="media-content">
                        <div class="media-grid"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Set up events
        setupModalEvents(modal, targetInputId);
        
        // Load media initially (all folders)
        loadMediaItems(modal, 'all', targetInputId);
    }
    
    /**
     * Set up events for the modal
     */
    function setupModalEvents(modal, targetInputId) {
        // Close button
        const closeBtn = modal.querySelector('.close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
        
        // Folder selection
        const folders = modal.querySelectorAll('.folder');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                // Update active folder
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Load filtered content
                const folderName = folder.getAttribute('data-folder');
                loadMediaItems(modal, folderName, targetInputId);
            });
        });
    }
    
    /**
     * Load media items into the grid
     */
    function loadMediaItems(modal, folderFilter, targetInputId) {
        const mediaGrid = modal.querySelector('.media-grid');
        mediaGrid.innerHTML = '';
        
        // Get images based on folder filter
        let filteredImages = Object.entries(KNOWN_IMAGES);
        if (folderFilter && folderFilter !== 'all') {
            filteredImages = filteredImages.filter(([filename]) => 
                FOLDER_MAPPING[filename] === folderFilter
            );
        }
        
        // Create media items
        filteredImages.forEach(([filename, imagePath]) => {
            const folder = FOLDER_MAPPING[filename] || 'uncategorized';
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-filename', filename);
            mediaItem.setAttribute('data-folder', folder);
            
            // Get color for folder
            const folderColor = getFolderColor(folder);
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail" style="background-color: ${folderColor}">
                    <img src="${imagePath}" alt="${filename}" onload="this.parentNode.classList.add('loaded')">
                    <div class="folder-badge">${folder}</div>
                </div>
                <div class="media-info">
                    <div class="media-name">${filename}</div>
                </div>
            `;
            
            // Add selection handler
            mediaItem.addEventListener('click', () => {
                // Select this media
                selectMedia(imagePath, filename, folder, targetInputId);
                // Close modal
                modal.remove();
            });
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    /**
     * Select a media item
     */
    function selectMedia(imageUrl, filename, folder, targetInputId) {
        console.log(`Direct Image Loader: Selecting ${filename} (${folder}) for ${targetInputId}`);
        
        // Find the target input
        const input = document.getElementById(targetInputId);
        if (!input) {
            console.error(`Direct Image Loader: Could not find target input ${targetInputId}`);
            return;
        }
        
        // Update the value
        input.value = imageUrl;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        
        // Update preview if available
        updatePreview(input, imageUrl, filename);
    }
    
    /**
     * Update preview after selection
     */
    function updatePreview(input, imageUrl, filename) {
        // Find preview container
        const container = input.closest('.form-group, .field-container, .input-group');
        if (!container) return;
        
        // Look for preview elements
        const previews = container.querySelectorAll('.image-preview, .preview-container, .media-preview');
        previews.forEach(preview => {
            if (preview.tagName === 'IMG') {
                preview.src = imageUrl;
                preview.style.display = 'block';
            } else {
                // Find or create image
                let img = preview.querySelector('img');
                if (img) {
                    img.src = imageUrl;
                } else {
                    // Create new image
                    img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = filename;
                    preview.innerHTML = '';
                    preview.appendChild(img);
                }
                preview.style.display = 'block';
            }
        });
        
        // Special case for email popup
        if (container.closest('.email-popup-section, .email-section')) {
            const popupPreviews = document.querySelectorAll('.popup-preview, .email-preview');
            popupPreviews.forEach(preview => {
                const bgElements = preview.querySelectorAll('.popup-bg, .preview-bg');
                bgElements.forEach(bg => {
                    bg.style.backgroundImage = `url(${imageUrl})`;
                });
            });
        }
    }
    
    /**
     * Get color for a folder
     */
    function getFolderColor(folder) {
        const colors = {
            food: '#5b7adb',
            restaurant: '#20c997',
            people: '#fd7e14',
            uncategorized: '#6c757d',
        };
        
        return colors[folder] || '#6c757d';
    }
    
    /**
     * Observe DOM for dynamically added elements
     */
    function observeDOMChanges() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver(mutations => {
            let shouldRefresh = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check for added media buttons
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const buttons = node.querySelectorAll('.media-library-button, .media-select-btn');
                            if (buttons.length > 0) {
                                shouldRefresh = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldRefresh) {
                setupMediaButtons();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Add necessary styles
    const styles = document.createElement('style');
    styles.textContent = `
        .direct-media-modal {
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
        
        .direct-media-modal .modal-content {
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            background-color: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .direct-media-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .direct-media-modal .modal-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .direct-media-modal .close-button {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .direct-media-modal .modal-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        .direct-media-modal .folders-sidebar {
            width: 250px;
            background-color: #252525;
            overflow-y: auto;
            border-right: 1px solid #333;
        }
        
        .direct-media-modal .folders-header {
            padding: 15px;
            color: #aaa;
            font-weight: bold;
            font-size: 12px;
        }
        
        .direct-media-modal .folder {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            color: #fff;
            cursor: pointer;
        }
        
        .direct-media-modal .folder:hover {
            background-color: #333;
        }
        
        .direct-media-modal .folder.active {
            background-color: #3a3a3a;
        }
        
        .direct-media-modal .folder i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .direct-media-modal .folder .count {
            margin-left: auto;
            padding: 2px 8px;
            background-color: #444;
            border-radius: 10px;
            font-size: 12px;
        }
        
        .direct-media-modal .media-content {
            flex: 1;
            overflow-y: auto;
        }
        
        .direct-media-modal .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 15px;
            padding: 15px;
        }
        
        .direct-media-modal .media-item {
            background-color: #252525;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .direct-media-modal .media-item:hover {
            transform: scale(1.05);
        }
        
        .direct-media-modal .media-thumbnail {
            height: 150px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .direct-media-modal .media-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .direct-media-modal .media-thumbnail.loaded img {
            opacity: 1;
        }
        
        .direct-media-modal .folder-badge {
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: rgba(0,0,0,0.7);
            padding: 5px 10px;
            font-size: 12px;
            color: #fff;
            text-transform: capitalize;
        }
        
        .direct-media-modal .media-info {
            padding: 10px;
        }
        
        .direct-media-modal .media-name {
            color: #fff;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(styles);
})();
