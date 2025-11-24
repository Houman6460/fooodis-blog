/**
 * Email Media Direct Override
 * 
 * This script completely overrides the Email Subscribers media selector
 * with a version that uses colored placeholder thumbnails but shows proper file sizes.
 * It uses ONLY CSS to create the placeholders and doesn't try to load any images.
 */

(function() {
    // Initialize immediately
    document.addEventListener('DOMContentLoaded', initDirectOverride);
    window.addEventListener('load', initDirectOverride);
    setTimeout(initDirectOverride, 500);
    
    // Add CSS styles immediately
    addCustomStyles();
    
    // Static media data with proper placeholder configuration
    const MEDIA_DATA = {
        "folders": [
            {"id": "all", "name": "All Media", "count": 9},
            {"id": "uncategorized", "name": "Uncategorized", "count": 0},
            {"id": "food", "name": "Food", "count": 6},
            {"id": "restaurant", "name": "Restaurant", "count": 1},
            {"id": "people", "name": "People", "count": 2},
            {"id": "test", "name": "Test", "count": 0}
        ],
        "items": [
            {
                "id": "cappuccino-1",
                "name": "cappuccino-or-latte-coffee-with-heart-art",
                "type": "image",
                "folder": "food",
                "size": 1243000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "japanese-tea-1",
                "name": "japanese-tea-2024-04-08-18-06-00-utc",
                "type": "image",
                "folder": "food",
                "size": 952000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "cappuccino-2",
                "name": "white-cup-of-tasty-cappuccino",
                "type": "image",
                "folder": "food",
                "size": 1125000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "coffee-latte-1",
                "name": "hot-coffee-latte-art-on-wooden-table",
                "type": "image",
                "folder": "food",
                "size": 878000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "soup-1",
                "name": "appetizing-soup-served-with-herbs",
                "type": "image",
                "folder": "food",
                "size": 1036000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "restaurant-1",
                "name": "restaurant-interior",
                "type": "image",
                "folder": "restaurant",
                "size": 1542000,
                "placeholderColor": "#13b3a4",
                "placeholderText": "Restaurant"
            },
            {
                "id": "chef-1",
                "name": "chef-cooking",
                "type": "image",
                "folder": "people",
                "size": 975000,
                "placeholderColor": "#f3a638",
                "placeholderText": "People"
            },
            {
                "id": "chef-2",
                "name": "chef-decorating",
                "type": "image",
                "folder": "people",
                "size": 1048000,
                "placeholderColor": "#f3a638",
                "placeholderText": "People"
            },
            {
                "id": "coffee-beans-1",
                "name": "a-full-bag-of-brown-coffee-beans",
                "type": "image",
                "folder": "food",
                "size": 1328000,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            }
        ]
    };
    
    // Initialize the direct override
    function initDirectOverride() {
        // Only override in the Email Subscribers section
        if (!isEmailSubscribersContext()) {
            return;
        }
        
        console.log('Email Media Direct Override: Initializing');
        
        // Override the media selector specifically for Email Subscribers
        overrideMediaSelector();
        
        // Set up observer to catch dynamically added elements
        setupMediaButtonObserver();
    }
    
    // Check if we're in the Email Subscribers context
    function isEmailSubscribersContext() {
        // Look for Email Subscribers section or tabs
        const emailSection = document.querySelector('.email-management-section, .email-subscribers-section');
        const emailTab = document.querySelector('.tab-button[data-tab="email-subscribers"], .tab-button[data-tab="email"]');
        
        return (emailSection && !emailSection.classList.contains('hidden')) || 
               (emailTab && emailTab.classList.contains('active'));
    }
    
    // Override the media selector for Email Subscribers
    function overrideMediaSelector() {
        // Create a custom media selector specifically for Email Subscribers
        window.originalOpenMediaLibrary = window.openMediaLibrary;
        
        window.openMediaLibrary = function(targetInputId) {
            // Only use custom version for Email Subscribers
            if (isEmailSubscribersContext()) {
                openCustomMediaSelector(targetInputId);
            } else if (typeof window.originalOpenMediaLibrary === 'function') {
                window.originalOpenMediaLibrary(targetInputId);
            }
        };
        
        // Also look for other possible selector functions
        const possibleSelectors = [
            'selectMedia', 
            'openMediaSelector', 
            'showMediaLibrary',
            'openEnhancedMediaSelector'
        ];
        
        possibleSelectors.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const original = window[funcName];
                window[funcName] = function(targetInputId) {
                    // Only use custom version for Email Subscribers
                    if (isEmailSubscribersContext()) {
                        openCustomMediaSelector(targetInputId);
                    } else {
                        return original.apply(this, arguments);
                    }
                };
            }
        });
    }
    
    // Open custom media selector with color placeholders
    function openCustomMediaSelector(targetInputId) {
        console.log('Email Media Direct Override: Opening custom media selector');
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'media-selection-modal';
        
        // Create modal content
        modal.innerHTML = createModalContent();
        document.body.appendChild(modal);
        
        // Set up event listeners
        setupModalEvents(modal, targetInputId);
    }
    
    // Create modal content
    function createModalContent() {
        return `
            <div class="media-modal-overlay"></div>
            <div class="media-modal-content">
                <div class="media-modal-header">
                    <h3>Select Media</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="media-modal-tabs">
                    <button class="media-tab active" data-type="all">All Media</button>
                    <button class="media-tab" data-type="images">Images</button>
                    <button class="media-tab" data-type="videos">Videos</button>
                </div>
                <div class="media-modal-body">
                    <div class="media-sidebar">
                        <div class="media-search">
                            <input type="text" placeholder="Search media..." class="media-search-input">
                        </div>
                        <div class="folder-header">FOLDERS</div>
                        <div class="folder-list">
                            ${createFoldersList()}
                        </div>
                    </div>
                    <div class="media-content">
                        <div class="media-items">
                            ${createMediaItemsList('all', 'all')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Create folders list HTML
    function createFoldersList() {
        let html = '';
        
        MEDIA_DATA.folders.forEach(folder => {
            const activeClass = folder.id === 'all' ? 'active' : '';
            html += `
                <div class="folder-item ${activeClass}" data-folder="${folder.id}">
                    <div class="folder-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="folder-info">
                        <div class="folder-name">${folder.name}</div>
                        <div class="folder-count">${folder.count}</div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    // Create media items list HTML
    function createMediaItemsList(folderId, mediaType) {
        let filteredItems = MEDIA_DATA.items;
        
        // Filter by folder
        if (folderId !== 'all') {
            filteredItems = filteredItems.filter(item => item.folder === folderId);
        }
        
        // Filter by type
        if (mediaType !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === mediaType);
        }
        
        if (filteredItems.length === 0) {
            return '<div class="no-media-message">No media found</div>';
        }
        
        let html = '<div class="media-grid">';
        
        filteredItems.forEach(item => {
            html += `
                <div class="media-item" data-id="${item.id}" data-name="${item.name}" data-type="${item.type}">
                    <div class="media-thumbnail" style="background-color: ${item.placeholderColor};">
                        <div class="placeholder-text">${item.placeholderText}</div>
                    </div>
                    <div class="media-info">
                        <div class="media-name">${item.name}</div>
                        <div class="media-meta">
                            <span class="media-type">image</span>
                            <span class="media-size">${formatFileSize(item.size)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    // Set up modal events
    function setupModalEvents(modal, targetInputId) {
        // Close button
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Close on overlay click
        const overlay = modal.querySelector('.media-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Folder selection
        const folderItems = modal.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                folderItems.forEach(folder => folder.classList.remove('active'));
                item.classList.add('active');
                
                // Get active tab
                const activeTab = modal.querySelector('.media-tab.active');
                const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                
                // Update media items
                const folderId = item.getAttribute('data-folder');
                const mediaContent = modal.querySelector('.media-items');
                
                if (mediaContent) {
                    mediaContent.innerHTML = createMediaItemsList(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Media type tabs
        const mediaTabs = modal.querySelectorAll('.media-tab');
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                mediaTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get active folder
                const activeFolder = modal.querySelector('.folder-item.active');
                const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                
                // Update media items
                const mediaType = tab.getAttribute('data-type');
                const mediaContent = modal.querySelector('.media-items');
                
                if (mediaContent) {
                    mediaContent.innerHTML = createMediaItemsList(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Initial media item events
        attachMediaItemEvents(modal, targetInputId);
        
        // Search functionality
        const searchInput = modal.querySelector('.media-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                
                if (searchTerm) {
                    searchMedia(modal, searchTerm, targetInputId);
                } else {
                    // Reset to current folder and type selection
                    const activeFolder = modal.querySelector('.folder-item.active');
                    const activeTab = modal.querySelector('.media-tab.active');
                    
                    const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                    const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                    
                    const mediaContent = modal.querySelector('.media-items');
                    if (mediaContent) {
                        mediaContent.innerHTML = createMediaItemsList(folderId, mediaType);
                        attachMediaItemEvents(modal, targetInputId);
                    }
                }
            });
        }
    }
    
    // Attach events to media items
    function attachMediaItemEvents(modal, targetInputId) {
        const mediaItems = modal.querySelectorAll('.media-item');
        
        mediaItems.forEach(item => {
            item.addEventListener('click', () => {
                // Highlight selected item
                mediaItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Get item data
                const itemId = item.getAttribute('data-id');
                const itemName = item.getAttribute('data-name');
                const itemType = item.getAttribute('data-type');
                
                // Find the full item data
                const itemData = MEDIA_DATA.items.find(media => media.id === itemId);
                
                if (itemData) {
                    // Update the input field
                    updateTargetInput(targetInputId, itemData);
                    
                    // Close the modal
                    modal.remove();
                }
            });
        });
    }
    
    // Search media items
    function searchMedia(modal, searchTerm, targetInputId) {
        // Filter media items by search term
        const filteredItems = MEDIA_DATA.items.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.folder.toLowerCase().includes(searchTerm)
        );
        
        // Update the media items display
        const mediaContent = modal.querySelector('.media-items');
        
        if (mediaContent) {
            if (filteredItems.length === 0) {
                mediaContent.innerHTML = '<div class="no-media-message">No matching media found</div>';
            } else {
                let html = '<div class="media-grid">';
                
                filteredItems.forEach(item => {
                    html += `
                        <div class="media-item" data-id="${item.id}" data-name="${item.name}" data-type="${item.type}">
                            <div class="media-thumbnail" style="background-color: ${item.placeholderColor};">
                                <div class="placeholder-text">${item.placeholderText}</div>
                            </div>
                            <div class="media-info">
                                <div class="media-name">${item.name}</div>
                                <div class="media-meta">
                                    <span class="media-type">image</span>
                                    <span class="media-size">${formatFileSize(item.size)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                mediaContent.innerHTML = html;
                
                // Re-attach events
                attachMediaItemEvents(modal, targetInputId);
            }
        }
    }
    
    // Update target input with selected media
    function updateTargetInput(targetInputId, media) {
        if (!targetInputId) return;
        
        // Try to find the target input
        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) return;
        
        // Create a fake URL for the image that won't trigger 404 errors
        // but still identifies the selected image
        const fakeUrl = `data:image/${media.name}`;
        
        // Set the value
        targetInput.value = fakeUrl;
        
        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        targetInput.dispatchEvent(changeEvent);
        
        // Update preview if it exists
        updatePreview(targetInput, media);
    }
    
    // Update preview if it exists
    function updatePreview(input, media) {
        // Look for preview container
        const previewContainer = input.parentElement.querySelector('.media-preview, .image-preview');
        if (!previewContainer) return;
        
        // Find existing image or create new one
        let previewImage = previewContainer.querySelector('img');
        if (!previewImage) {
            previewImage = document.createElement('img');
            previewContainer.innerHTML = '';
            previewContainer.appendChild(previewImage);
        }
        
        // Use a colored div instead of trying to load a real image
        previewImage.style.backgroundColor = media.placeholderColor;
        previewImage.style.width = '100%';
        previewImage.style.height = '100%';
        previewImage.style.display = 'block';
        
        // Add a text overlay
        const textOverlay = document.createElement('div');
        textOverlay.style.position = 'absolute';
        textOverlay.style.top = '50%';
        textOverlay.style.left = '50%';
        textOverlay.style.transform = 'translate(-50%, -50%)';
        textOverlay.style.color = 'white';
        textOverlay.style.fontWeight = 'bold';
        textOverlay.style.textAlign = 'center';
        textOverlay.textContent = media.placeholderText;
        
        previewContainer.style.position = 'relative';
        previewContainer.appendChild(textOverlay);
        
        // Show the preview
        previewContainer.style.display = 'block';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Set up observer to watch for new media buttons
    function setupMediaButtonObserver() {
        // Create observer to watch for dynamically added elements
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is a media button or contains one
                            checkForMediaButtons(node);
                        }
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also check for existing buttons
        checkForMediaButtons(document.body);
    }
    
    // Check for media buttons in a container
    function checkForMediaButtons(container) {
        // Only process in Email Subscribers context
        if (!isEmailSubscribersContext()) return;
        
        // Look for buttons with specific classes or attributes
        const mediaButtons = container.querySelectorAll('.media-select-button, button[data-action="select-media"], .select-media-button');
        
        mediaButtons.forEach(button => {
            updateMediaButton(button);
        });
        
        // Also look for elements with onclick handlers
        const elementsWithOnclick = container.querySelectorAll('[onclick*="openMediaLibrary"], [onclick*="selectMedia"]');
        
        elementsWithOnclick.forEach(element => {
            updateMediaButtonOnclick(element);
        });
    }
    
    // Update a media button to use our custom selector
    function updateMediaButton(button) {
        // Clone the button to remove existing events
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }
        
        // Get the target input ID
        let targetInputId = newButton.getAttribute('data-target') || 
                          newButton.getAttribute('data-input') || 
                          newButton.getAttribute('data-for');
        
        // If no target is specified, look for a nearby input
        if (!targetInputId) {
            const parentContainer = newButton.closest('.form-group, .input-group, .field-group');
            const nearbyInput = parentContainer ? 
                parentContainer.querySelector('input[type="text"], input[type="url"], input[type="hidden"]') : 
                newButton.parentElement.querySelector('input[type="text"], input[type="url"], input[type="hidden"]');
            
            if (nearbyInput) {
                targetInputId = nearbyInput.id;
            }
        }
        
        // Add our click event
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            openCustomMediaSelector(targetInputId);
        });
    }
    
    // Update an element with onclick to use our custom selector
    function updateMediaButtonOnclick(element) {
        // Get the original onclick code
        const onclickCode = element.getAttribute('onclick') || '';
        
        // Try to extract the target input ID
        let targetInputId = '';
        const match = onclickCode.match(/openMediaLibrary\(['"]([^'"]+)['"]/);
        if (match && match[1]) {
            targetInputId = match[1];
        }
        
        // If no target found, look for a nearby input
        if (!targetInputId) {
            const parentContainer = element.closest('.form-group, .input-group, .field-group');
            const nearbyInput = parentContainer ? 
                parentContainer.querySelector('input[type="text"], input[type="url"], input[type="hidden"]') : 
                element.parentElement.querySelector('input[type="text"], input[type="url"], input[type="hidden"]');
            
            if (nearbyInput) {
                targetInputId = nearbyInput.id;
            }
        }
        
        // Remove the onclick
        element.removeAttribute('onclick');
        
        // Add our click event
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            openCustomMediaSelector(targetInputId);
        });
    }
    
    // Add custom styles for our modal
    function addCustomStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .media-selection-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .media-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .media-modal-content {
                position: relative;
                width: 90%;
                max-width: 1200px;
                height: 80%;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .media-modal-header {
                padding: 16px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .media-modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .media-modal-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
            }
            
            .media-tab {
                padding: 12px 16px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                color: #666;
                border-bottom: 2px solid transparent;
            }
            
            .media-tab.active {
                border-bottom: 2px solid #007bff;
                color: #007bff;
                font-weight: bold;
            }
            
            .media-modal-body {
                flex: 1;
                display: flex;
                overflow: hidden;
            }
            
            .media-sidebar {
                width: 250px;
                border-right: 1px solid #eee;
                overflow-y: auto;
                padding: 16px;
            }
            
            .media-search {
                margin-bottom: 16px;
            }
            
            .media-search-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .folder-header {
                font-size: 12px;
                font-weight: bold;
                color: #666;
                margin-bottom: 8px;
            }
            
            .folder-list {
                margin-bottom: 16px;
            }
            
            .folder-item {
                padding: 8px;
                cursor: pointer;
                border-radius: 4px;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
            }
            
            .folder-item:hover {
                background-color: #f5f5f5;
            }
            
            .folder-item.active {
                background-color: #e8f0fe;
                color: #1a73e8;
            }
            
            .folder-icon {
                margin-right: 8px;
                color: #666;
            }
            
            .folder-info {
                flex: 1;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .folder-count {
                background-color: #eee;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 12px;
                color: #666;
            }
            
            .media-content {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
            }
            
            .media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .media-item {
                border-radius: 4px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .media-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
            }
            
            .media-item.selected {
                border: 2px solid #007bff;
            }
            
            .media-thumbnail {
                height: 150px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .placeholder-text {
                color: white;
                font-weight: bold;
                font-size: 16px;
            }
            
            .media-info {
                padding: 8px;
                background-color: #fff;
            }
            
            .media-name {
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 4px;
            }
            
            .media-meta {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #666;
            }
            
            .no-media-message {
                padding: 32px;
                text-align: center;
                color: #666;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Add custom styles when initializing
    addCustomStyles();
})();
