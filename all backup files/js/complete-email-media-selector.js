/**
 * Complete Email Media Selector
 * This script completely replaces the media selector in Email Subscribers section
 * with a version that uses pure CSS for colored thumbnails and doesn't attempt to load any images.
 */

(function() {
    // Initialize immediately - add DOMContentLoaded, load, and multiple timeouts for redundancy
    document.addEventListener('DOMContentLoaded', initializeEmailMediaSelector);
    window.addEventListener('load', initializeEmailMediaSelector);
    // Run multiple times to make sure we override anything else
    setTimeout(initializeEmailMediaSelector, 100);
    setTimeout(initializeEmailMediaSelector, 500);
    setTimeout(initializeEmailMediaSelector, 1000);
    setTimeout(initializeEmailMediaSelector, 2000);
    
    // Execute immediately as well
    initializeEmailMediaSelector();
    
    // Add styles immediately
    addEmailSelectorStyles();
    
    // Media data with predefined colors
    const EMAIL_MEDIA_DATA = {
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
                "size": 574500,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "japanese-tea-1",
                "name": "japanese-tea-2024-04-08-18-06-00-utc",
                "type": "image",
                "folder": "food",
                "size": 513500,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "cappuccino-2",
                "name": "white-cup-of-tasty-cappuccino",
                "type": "image",
                "folder": "food",
                "size": 460300,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "coffee-latte-1",
                "name": "hot-coffee-latte-art-on-wooden-table",
                "type": "image",
                "folder": "food",
                "size": 612100,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "soup-1",
                "name": "appetizing-soup-served-with-herbs",
                "type": "image",
                "folder": "food",
                "size": 547600,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            },
            {
                "id": "restaurant-1",
                "name": "restaurant-interior",
                "type": "image",
                "folder": "restaurant",
                "size": 573100, 
                "placeholderColor": "#13b3a4",
                "placeholderText": "Restaurant"
            },
            {
                "id": "chef-1",
                "name": "chef-cooking",
                "type": "image",
                "folder": "people",
                "size": 567700,
                "placeholderColor": "#f3a638",
                "placeholderText": "People"
            },
            {
                "id": "chef-2",
                "name": "chef-decorating",
                "type": "image",
                "folder": "people",
                "size": 543900,
                "placeholderColor": "#f3a638",
                "placeholderText": "People"
            },
            {
                "id": "coffee-beans-1",
                "name": "a-full-bag-of-brown-coffee-beans",
                "type": "image",
                "folder": "food",
                "size": 536200,
                "placeholderColor": "#6974d4",
                "placeholderText": "Food"
            }
        ]
    };

    // Check if we're in Email Subscribers section
    function isEmailSubscribersContext() {
        // Look for Email Subscribers section or tabs
        const emailSection = document.querySelector('.email-management-section, .email-subscribers-section');
        const emailTab = document.querySelector('.tab-button[data-tab="email-subscribers"], .tab-button[data-tab="email"]');
        
        return (emailSection && !emailSection.classList.contains('hidden')) || 
               (emailTab && emailTab.classList.contains('active'));
    }

    // Initialize the email media selector
    function initializeEmailMediaSelector() {
        // Only run in Email Subscribers section
        if (!isEmailSubscribersContext()) {
            return;
        }

        console.log('Complete Email Media Selector: Initializing');
        
        // Override the media selector functions
        overrideMediaSelectors();
        
        // Set up observer for dynamically added elements
        setupSelectorObserver();
    }

    // Override all media selector functions 
    function overrideMediaSelectors() {
        // Save original function if it exists
        if (typeof window.openMediaLibrary === 'function') {
            window.originalOpenMediaLibrary = window.openMediaLibrary;
        }
        
        // Override main media library function
        window.openMediaLibrary = function(targetInputId) {
            if (isEmailSubscribersContext()) {
                openEmailMediaSelector(targetInputId);
            } else if (typeof window.originalOpenMediaLibrary === 'function') {
                window.originalOpenMediaLibrary(targetInputId);
            }
        };
        
        // Other possible selector functions to override
        const selectorFunctions = [
            'selectMedia', 
            'openMediaSelector', 
            'showMediaLibrary'
        ];
        
        selectorFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const original = window[funcName];
                window[funcName] = function(targetInputId) {
                    if (isEmailSubscribersContext()) {
                        openEmailMediaSelector(targetInputId);
                    } else {
                        return original.apply(this, arguments);
                    }
                };
            }
        });
    }

    // Open the custom email media selector
    function openEmailMediaSelector(targetInputId) {
        console.log('Complete Email Media Selector: Opening for', targetInputId);
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'email-media-modal';
        modal.id = 'emailMediaModal';
        
        // Create modal HTML
        modal.innerHTML = `
            <div class="email-media-overlay"></div>
            <div class="email-media-content">
                <div class="email-media-header">
                    <h3>Select Media</h3>
                    <button class="email-media-close">&times;</button>
                </div>
                <div class="email-media-filters">
                    <div class="email-media-tabs">
                        <button class="email-media-tab active" data-type="all">All Media</button>
                        <button class="email-media-tab" data-type="image">Images</button>
                        <button class="email-media-tab" data-type="video">Videos</button>
                    </div>
                    <div class="email-media-search">
                        <input type="text" class="email-media-search-input" placeholder="Search media...">
                    </div>
                </div>
                <div class="email-media-body">
                    <div class="email-media-sidebar">
                        <div class="folder-header">FOLDERS</div>
                        <div class="folder-list">
                            ${createFoldersList()}
                        </div>
                    </div>
                    <div class="email-media-items-container">
                        ${createMediaItems('all', 'all')}
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Set up event handlers
        setupModalEvents(modal, targetInputId);
    }

    // Create folders list HTML
    function createFoldersList() {
        let html = '';
        
        EMAIL_MEDIA_DATA.folders.forEach(folder => {
            const activeClass = folder.id === 'all' ? 'active' : '';
            html += `
                <div class="email-folder-item ${activeClass}" data-folder="${folder.id}">
                    <div class="email-folder-icon">
                        <i class="fa fa-folder"></i>
                    </div>
                    <div class="email-folder-details">
                        <div class="email-folder-name">${folder.name}</div>
                        <div class="email-folder-count">${folder.count}</div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    // Create media items HTML
    function createMediaItems(folderId, mediaType) {
        let items = EMAIL_MEDIA_DATA.items;
        
        // Filter by folder
        if (folderId !== 'all') {
            items = items.filter(item => item.folder === folderId);
        }
        
        // Filter by type
        if (mediaType !== 'all') {
            items = items.filter(item => item.type === mediaType);
        }
        
        if (items.length === 0) {
            return '<div class="email-no-media">No media found</div>';
        }
        
        let html = '<div class="email-media-grid">';
        
        items.forEach(item => {
            html += `
                <div class="email-media-item" data-id="${item.id}">
                    <div class="email-media-thumbnail" style="background-color: ${item.placeholderColor};">
                        <div class="email-placeholder-text">${item.placeholderText}</div>
                    </div>
                    <div class="email-media-info">
                        <div class="email-media-name">${item.name}</div>
                        <div class="email-media-details">
                            <span class="email-media-type">image</span>
                            <span class="email-media-size">${formatFileSize(item.size)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Set up modal events
    function setupModalEvents(modal, targetInputId) {
        // Close button
        const closeButton = modal.querySelector('.email-media-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Close on overlay click
        const overlay = modal.querySelector('.email-media-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Tab selection
        const tabs = modal.querySelectorAll('.email-media-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get active folder
                const activeFolder = modal.querySelector('.email-folder-item.active');
                const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                
                // Update content
                const mediaType = tab.getAttribute('data-type');
                const container = modal.querySelector('.email-media-items-container');
                if (container) {
                    container.innerHTML = createMediaItems(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Folder selection
        const folders = modal.querySelectorAll('.email-folder-item');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                // Update active folder
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Get active tab
                const activeTab = modal.querySelector('.email-media-tab.active');
                const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                
                // Update content
                const folderId = folder.getAttribute('data-folder');
                const container = modal.querySelector('.email-media-items-container');
                if (container) {
                    container.innerHTML = createMediaItems(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Search functionality
        const searchInput = modal.querySelector('.email-media-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.trim().toLowerCase();
                
                if (searchTerm) {
                    searchEmailMedia(modal, searchTerm, targetInputId);
                } else {
                    // Reset to current folder/tab
                    const activeFolder = modal.querySelector('.email-folder-item.active');
                    const activeTab = modal.querySelector('.email-media-tab.active');
                    
                    const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                    const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                    
                    const container = modal.querySelector('.email-media-items-container');
                    if (container) {
                        container.innerHTML = createMediaItems(folderId, mediaType);
                        attachMediaItemEvents(modal, targetInputId);
                    }
                }
            });
        }
        
        // Attach events to media items
        attachMediaItemEvents(modal, targetInputId);
    }

    // Attach events to media items
    function attachMediaItemEvents(modal, targetInputId) {
        const items = modal.querySelectorAll('.email-media-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                // Update selected state
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Get item data
                const itemId = item.getAttribute('data-id');
                const itemData = EMAIL_MEDIA_DATA.items.find(media => media.id === itemId);
                
                if (itemData) {
                    // Update target input and close
                    updateTargetWithSelectedMedia(targetInputId, itemData);
                    modal.remove();
                }
            });
        });
    }

    // Search for media items
    function searchEmailMedia(modal, searchTerm, targetInputId) {
        // Filter items
        const filteredItems = EMAIL_MEDIA_DATA.items.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        
        // Update container
        const container = modal.querySelector('.email-media-items-container');
        if (container) {
            if (filteredItems.length === 0) {
                container.innerHTML = '<div class="email-no-media">No matching media found</div>';
            } else {
                let html = '<div class="email-media-grid">';
                
                filteredItems.forEach(item => {
                    html += `
                        <div class="email-media-item" data-id="${item.id}">
                            <div class="email-media-thumbnail" style="background-color: ${item.placeholderColor};">
                                <div class="email-placeholder-text">${item.placeholderText}</div>
                            </div>
                            <div class="email-media-info">
                                <div class="email-media-name">${item.name}</div>
                                <div class="email-media-details">
                                    <span class="email-media-type">image</span>
                                    <span class="email-media-size">${formatFileSize(item.size)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                container.innerHTML = html;
                
                // Re-attach events
                attachMediaItemEvents(modal, targetInputId);
            }
        }
    }

    // Update target input with selected media
    function updateTargetWithSelectedMedia(targetInputId, mediaItem) {
        if (!targetInputId) return;
        
        // Find target input
        const input = document.getElementById(targetInputId);
        if (!input) return;
        
        // Create a non-existent URL that won't trigger any requests
        // This is intentionally using 'data:' to prevent any network requests
        const placeholder = `data:image/placeholder;${mediaItem.name}`;
        
        // Update input
        input.value = placeholder;
        
        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        
        // Update preview if exists
        updateMediaPreview(input, mediaItem);
    }

    // Update media preview
    function updateMediaPreview(input, mediaItem) {
        // Find preview container
        const previewContainer = input.closest('.form-group, .input-group')?.querySelector('.image-preview, .media-preview');
        if (!previewContainer) return;
        
        // Clear existing content
        previewContainer.innerHTML = '';
        
        // Create placeholder element with styles
        const placeholder = document.createElement('div');
        placeholder.className = 'email-preview-placeholder';
        placeholder.style.backgroundColor = mediaItem.placeholderColor;
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.minHeight = '120px';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = 'white';
        placeholder.style.fontWeight = 'bold';
        
        // Add text
        placeholder.textContent = mediaItem.placeholderText;
        
        // Add to container
        previewContainer.appendChild(placeholder);
        
        // Make sure container is visible
        previewContainer.style.display = 'block';
    }

    // Set up observer for dynamically added buttons
    function setupSelectorObserver() {
        // Create observer
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Look for buttons in this element
                            scanForMediaButtons(node);
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
        
        // Scan existing elements
        scanForMediaButtons(document.body);
    }

    // Scan for media buttons in an element
    function scanForMediaButtons(element) {
        // Only in Email Subscribers context
        if (!isEmailSubscribersContext()) {
            return;
        }
        
        // Look for media buttons
        const buttons = element.querySelectorAll('button[data-action="select-media"], .media-select-button, .select-media-btn');
        buttons.forEach(button => {
            updateMediaButton(button);
        });
        
        // Look for elements with onclick handlers
        const clickableElements = element.querySelectorAll('[onclick*="openMediaLibrary"], [onclick*="selectMedia"]');
        clickableElements.forEach(el => {
            updateClickableElement(el);
        });
    }

    // Update a media button
    function updateMediaButton(button) {
        // Replace with a clone to remove existing events
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Get target input
        let targetInputId = newButton.getAttribute('data-target') || 
                            newButton.getAttribute('data-for') || 
                            newButton.getAttribute('data-input');
        
        // If no target, look for nearby input
        if (!targetInputId) {
            const container = newButton.closest('.form-group, .input-group');
            const nearbyInput = container?.querySelector('input[type="text"], input[type="hidden"]');
            if (nearbyInput && nearbyInput.id) {
                targetInputId = nearbyInput.id;
            }
        }
        
        // Add click handler
        newButton.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openEmailMediaSelector(targetInputId);
        });
    }

    // Update clickable element with onclick
    function updateClickableElement(element) {
        // Extract target from onclick if possible
        const onclickAttr = element.getAttribute('onclick') || '';
        let targetInputId = '';
        const match = onclickAttr.match(/openMediaLibrary\(['"]([^'"]+)['"]/);
        if (match && match[1]) {
            targetInputId = match[1];
        }
        
        // Remove onclick
        element.removeAttribute('onclick');
        
        // Add click handler
        element.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openEmailMediaSelector(targetInputId);
        });
    }

    // Add custom styles
    function addEmailSelectorStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .email-media-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .email-media-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .email-media-content {
                position: relative;
                width: 90%;
                max-width: 1200px;
                height: 80%;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .email-media-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .email-media-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .email-media-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .email-media-filters {
                display: flex;
                padding: 10px 15px;
                border-bottom: 1px solid #eee;
                justify-content: space-between;
                align-items: center;
            }
            
            .email-media-tabs {
                display: flex;
            }
            
            .email-media-tab {
                padding: 8px 15px;
                margin-right: 5px;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 4px;
            }
            
            .email-media-tab.active {
                background-color: #007bff;
                color: white;
            }
            
            .email-media-search {
                flex: 1;
                max-width: 300px;
                margin-left: 15px;
            }
            
            .email-media-search-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .email-media-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .email-media-sidebar {
                width: 250px;
                border-right: 1px solid #eee;
                overflow-y: auto;
                padding: 15px 0;
            }
            
            .folder-header {
                font-size: 12px;
                font-weight: bold;
                color: #666;
                padding: 0 15px 10px;
            }
            
            .email-folder-item {
                display: flex;
                align-items: center;
                padding: 8px 15px;
                cursor: pointer;
            }
            
            .email-folder-item:hover {
                background-color: #f5f5f5;
            }
            
            .email-folder-item.active {
                background-color: #e9f2ff;
            }
            
            .email-folder-icon {
                margin-right: 10px;
                width: 20px;
                text-align: center;
            }
            
            .email-folder-details {
                flex: 1;
                display: flex;
                justify-content: space-between;
            }
            
            .email-folder-count {
                color: #999;
                font-size: 12px;
            }
            
            .email-media-items-container {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
            }
            
            .email-media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .email-media-item {
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid #eee;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .email-media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
            }
            
            .email-media-item.selected {
                border: 2px solid #007bff;
            }
            
            .email-media-thumbnail {
                height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .email-placeholder-text {
                color: white;
                font-weight: bold;
                font-size: 18px;
            }
            
            .email-media-info {
                padding: 10px;
            }
            
            .email-media-name {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 5px;
            }
            
            .email-media-details {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #666;
            }
            
            .email-no-media {
                padding: 20px;
                text-align: center;
                color: #666;
            }
            
            .email-preview-placeholder {
                border-radius: 4px;
            }
        `;
        document.head.appendChild(styleElement);
    }
})();
