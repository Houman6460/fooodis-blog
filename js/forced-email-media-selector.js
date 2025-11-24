/**
 * Forced Email Media Selector
 * This script completely overrides ALL media selector functionality in the Email Subscribers section
 * using an aggressive approach to ensure it takes precedence.
 */

// Execute immediately to claim control of the media selector
(function() {
    // Media data with color-coded placeholders
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
                "id": "item1",
                "name": "cappuccino-or-latte-coffee-with-heart-art",
                "type": "image",
                "folder": "food",
                "size": 574500,
                "color": "#6974d4",
                "text": "Food"
            },
            {
                "id": "item2",
                "name": "japanese-tea-2024-04-08-18-06-00-utc",
                "type": "image",
                "folder": "food",
                "size": 513500,
                "color": "#6974d4",
                "text": "Food"
            },
            {
                "id": "item3",
                "name": "white-cup-of-tasty-cappuccino",
                "type": "image",
                "folder": "food",
                "size": 460300,
                "color": "#6974d4",
                "text": "Food"
            },
            {
                "id": "item4",
                "name": "hot-coffee-latte-art-on-wooden-table",
                "type": "image",
                "folder": "food",
                "size": 612100,
                "color": "#6974d4",
                "text": "Food"
            },
            {
                "id": "item5",
                "name": "appetizing-soup-served-with-herbs",
                "type": "image",
                "folder": "food",
                "size": 547600,
                "color": "#6974d4",
                "text": "Food"
            },
            {
                "id": "item6",
                "name": "restaurant-interior",
                "type": "image",
                "folder": "restaurant",
                "size": 573100,
                "color": "#13b3a4",
                "text": "Restaurant"
            },
            {
                "id": "item7",
                "name": "chef-cooking",
                "type": "image",
                "folder": "people",
                "size": 567700,
                "color": "#f3a638",
                "text": "People"
            },
            {
                "id": "item8",
                "name": "chef-decorating",
                "type": "image",
                "folder": "people",
                "size": 543900,
                "color": "#f3a638",
                "text": "People"
            },
            {
                "id": "item9",
                "name": "a-full-bag-of-brown-coffee-beans",
                "type": "image",
                "folder": "food",
                "size": 536200,
                "color": "#6974d4",
                "text": "Food"
            }
        ]
    };

    // Add the required CSS immediately
    addRequiredStyles();
    
    // Initialize right away and at multiple time points
    init();
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1000);
    
    // Create an observer that will watch for changes to the page
    createMutationObserver();
    
    // Primary initialization function
    function init() {
        console.log("Forced Email Media Selector: Initializing...");
        
        // Override ALL possible media selector functions
        overrideAllMediaFunctions();
        
        // Look for and modify existing media buttons
        processExistingMediaButtons();
    }
    
    // Check if we're in the Email Subscribers section
    function inEmailSection() {
        // Multiple selector patterns to ensure we catch it
        const selectors = [
            '.email-subscribers-section',
            '.email-management-section',
            '.tab-button[data-tab="email-subscribers"].active',
            '.tab-button[data-tab="email"].active',
            '#email-subscribers-tab.active',
            '#email-tab.active'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && !element.classList.contains('hidden')) {
                return true;
            }
        }
        
        // Also check for specific content that indicates we're in the email section
        const emailHeadings = document.querySelectorAll('h1, h2, h3, h4, h5');
        for (const heading of emailHeadings) {
            if (heading.textContent.toLowerCase().includes('email subscribers') ||
                heading.textContent.toLowerCase().includes('newsletter')) {
                return true;
            }
        }
        
        return false;
    }
    
    // Override all possible media selector functions
    function overrideAllMediaFunctions() {
        // Store original functions if they exist
        if (typeof window.openMediaLibrary === 'function') {
            window._originalOpenMediaLibrary = window.openMediaLibrary;
        }
        
        // List of all possible function names that might open media selectors
        const functionNames = [
            'openMediaLibrary',
            'selectMedia',
            'openMediaSelector',
            'showMediaLibrary',
            'chooseMedia',
            'selectImage',
            'browseMedia',
            'openMediaDialog',
            'showMediaSelector',
            'launchMediaPicker'
        ];
        
        // Override each function
        functionNames.forEach(funcName => {
            window[funcName] = function(targetInput) {
                if (inEmailSection()) {
                    console.log(`Forced Email Media Selector: Intercepted ${funcName}()`);
                    openForcedMediaSelector(targetInput);
                    return false; // Prevent original function from running
                } else if (typeof window[`_original${funcName}`] === 'function') {
                    return window[`_original${funcName}`].apply(this, arguments);
                }
            };
        });
        
        // Also override document-level click handlers by adding our event listener
        // with the capture phase to intercept clicks before they reach their targets
        document.addEventListener('click', function(e) {
            if (!inEmailSection()) return;
            
            // Look for media selector buttons
            const target = e.target;
            const button = target.closest('button, .button, [role="button"], a');
            
            if (button && (
                button.classList.contains('media-select-button') ||
                button.hasAttribute('data-action') && button.getAttribute('data-action').includes('media') ||
                button.textContent.toLowerCase().includes('media') ||
                button.textContent.toLowerCase().includes('image') ||
                button.innerHTML.includes('fa-image') ||
                button.querySelector('i.fa-image')
            )) {
                e.preventDefault();
                e.stopPropagation();
                
                // Find the target input
                let targetInput = findTargetInputForButton(button);
                openForcedMediaSelector(targetInput);
            }
        }, true); // Use capture phase
    }
    
    // Find the target input for a media button
    function findTargetInputForButton(button) {
        // Check for explicit target in data attributes
        let targetId = button.getAttribute('data-target') || 
                      button.getAttribute('data-for') || 
                      button.getAttribute('data-input');
                      
        if (targetId) return targetId;
        
        // Look for nearby inputs
        const container = button.closest('.form-group, .input-group, .field-group');
        if (container) {
            const input = container.querySelector('input[type="text"], input[type="url"], input[type="hidden"]');
            if (input && input.id) return input.id;
        }
        
        // Fall back to first input in parent
        const parent = button.parentElement;
        if (parent) {
            const input = parent.querySelector('input');
            if (input && input.id) return input.id;
        }
        
        return 'media-input-' + Math.floor(Math.random() * 10000);
    }
    
    // Open our forced media selector
    function openForcedMediaSelector(targetInputId) {
        console.log("Forced Email Media Selector: Opening selector for", targetInputId);
        
        // Remove any existing selectors first
        const existingSelectors = document.querySelectorAll('.forced-media-modal');
        existingSelectors.forEach(selector => selector.remove());
        
        // Create the modal
        const modal = document.createElement('div');
        modal.className = 'forced-media-modal';
        
        // Set the HTML
        modal.innerHTML = `
            <div class="forced-media-overlay"></div>
            <div class="forced-media-container">
                <div class="forced-media-header">
                    <h3>Select Media</h3>
                    <button class="forced-media-close">&times;</button>
                </div>
                <div class="forced-media-tabs">
                    <button class="forced-media-tab active" data-type="all">All Media</button>
                    <button class="forced-media-tab" data-type="images">Images</button>
                    <button class="forced-media-tab" data-type="videos">Videos</button>
                </div>
                <div class="forced-media-content">
                    <div class="forced-media-sidebar">
                        <div class="forced-media-search">
                            <input type="text" placeholder="Search media..." class="forced-media-search-input">
                        </div>
                        <div class="forced-media-folders-header">FOLDERS</div>
                        <div class="forced-media-folders-list">
                            ${createFoldersHTML()}
                        </div>
                    </div>
                    <div class="forced-media-items">
                        ${createMediaItemsHTML('all', 'all')}
                    </div>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(modal);
        
        // Set up event handlers
        setupModalEvents(modal, targetInputId);
    }
    
    // Create folders HTML
    function createFoldersHTML() {
        let html = '';
        
        MEDIA_DATA.folders.forEach(folder => {
            const activeClass = folder.id === 'all' ? 'active' : '';
            html += `
                <div class="forced-folder-item ${activeClass}" data-folder="${folder.id}">
                    <div class="forced-folder-icon">
                        <i class="fa fa-folder"></i>
                    </div>
                    <div class="forced-folder-info">
                        <div class="forced-folder-name">${folder.name}</div>
                        <div class="forced-folder-count">${folder.count}</div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    // Create media items HTML
    function createMediaItemsHTML(folderId, mediaType) {
        let items = MEDIA_DATA.items;
        
        // Filter by folder
        if (folderId !== 'all') {
            items = items.filter(item => item.folder === folderId);
        }
        
        // Filter by type
        if (mediaType !== 'all' && mediaType !== 'images') {
            items = items.filter(item => item.type === mediaType);
        }
        
        if (items.length === 0) {
            return '<div class="forced-no-media">No media found</div>';
        }
        
        let html = '<div class="forced-media-grid">';
        
        items.forEach(item => {
            html += `
                <div class="forced-media-item" data-id="${item.id}">
                    <div class="forced-media-thumbnail" style="background-color: ${item.color};">
                        <div class="forced-placeholder-text">${item.text}</div>
                    </div>
                    <div class="forced-media-info">
                        <div class="forced-media-name">${item.name}</div>
                        <div class="forced-media-meta">
                            <span class="forced-media-type">image</span>
                            <span class="forced-media-size">${formatSize(item.size)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    // Format file size
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Set up modal event handlers
    function setupModalEvents(modal, targetInputId) {
        // Close button
        const closeBtn = modal.querySelector('.forced-media-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Close on overlay click
        const overlay = modal.querySelector('.forced-media-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Tab selection
        const tabs = modal.querySelectorAll('.forced-media-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get the active folder
                const activeFolder = modal.querySelector('.forced-folder-item.active');
                const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                
                // Update content
                const mediaType = tab.getAttribute('data-type');
                const container = modal.querySelector('.forced-media-items');
                
                if (container) {
                    container.innerHTML = createMediaItemsHTML(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Folder selection
        const folders = modal.querySelectorAll('.forced-folder-item');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                // Update active state
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Get the active tab
                const activeTab = modal.querySelector('.forced-media-tab.active');
                const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                
                // Update content
                const folderId = folder.getAttribute('data-folder');
                const container = modal.querySelector('.forced-media-items');
                
                if (container) {
                    container.innerHTML = createMediaItemsHTML(folderId, mediaType);
                    attachMediaItemEvents(modal, targetInputId);
                }
            });
        });
        
        // Search functionality
        const searchInput = modal.querySelector('.forced-media-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const query = searchInput.value.trim().toLowerCase();
                
                if (query) {
                    searchMedia(modal, query, targetInputId);
                } else {
                    // Reset to current folder/tab
                    const activeFolder = modal.querySelector('.forced-folder-item.active');
                    const activeTab = modal.querySelector('.forced-media-tab.active');
                    
                    const folderId = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                    const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
                    
                    const container = modal.querySelector('.forced-media-items');
                    if (container) {
                        container.innerHTML = createMediaItemsHTML(folderId, mediaType);
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
        const items = modal.querySelectorAll('.forced-media-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                // Update selected state
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Get the item data
                const itemId = item.getAttribute('data-id');
                const itemData = MEDIA_DATA.items.find(i => i.id === itemId);
                
                if (itemData) {
                    // Update the target input and close modal
                    updateTargetInput(targetInputId, itemData);
                    modal.remove();
                }
            });
        });
    }
    
    // Search media items
    function searchMedia(modal, query, targetInputId) {
        const filteredItems = MEDIA_DATA.items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.folder.toLowerCase().includes(query)
        );
        
        const container = modal.querySelector('.forced-media-items');
        if (container) {
            if (filteredItems.length === 0) {
                container.innerHTML = '<div class="forced-no-media">No matching media found</div>';
            } else {
                let html = '<div class="forced-media-grid">';
                
                filteredItems.forEach(item => {
                    html += `
                        <div class="forced-media-item" data-id="${item.id}">
                            <div class="forced-media-thumbnail" style="background-color: ${item.color};">
                                <div class="forced-placeholder-text">${item.text}</div>
                            </div>
                            <div class="forced-media-info">
                                <div class="forced-media-name">${item.name}</div>
                                <div class="forced-media-meta">
                                    <span class="forced-media-type">image</span>
                                    <span class="forced-media-size">${formatSize(item.size)}</span>
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
    function updateTargetInput(targetInputId, itemData) {
        if (!targetInputId) return;
        
        const input = document.getElementById(targetInputId);
        if (!input) return;
        
        // Create a special placeholder URL that won't trigger any image loading
        const placeholderUrl = `data:image/placeholder;${itemData.name}`;
        
        // Set the value
        input.value = placeholderUrl;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        
        // Update preview if it exists
        updatePreview(input, itemData);
        
        console.log(`Selected media: ${itemData.name} (${formatSize(itemData.size)})`);
    }
    
    // Update the preview area if it exists
    function updatePreview(input, itemData) {
        // Look for preview container near the input
        const container = input.closest('.form-group, .input-group');
        if (!container) return;
        
        // Find preview element
        const preview = container.querySelector('.image-preview, .media-preview, .preview');
        if (!preview) return;
        
        // Clear existing content
        preview.innerHTML = '';
        
        // Create colored placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'forced-preview-placeholder';
        placeholder.style.backgroundColor = itemData.color;
        placeholder.style.color = 'white';
        placeholder.style.fontWeight = 'bold';
        placeholder.style.textAlign = 'center';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.minHeight = '100px';
        placeholder.textContent = itemData.text;
        
        // Add to preview
        preview.appendChild(placeholder);
        
        // Ensure preview is visible
        preview.style.display = 'block';
    }
    
    // Process existing media buttons
    function processExistingMediaButtons() {
        if (!inEmailSection()) return;
        
        // Find all potential media buttons
        const buttons = document.querySelectorAll(
            'button.media-select-button, ' + 
            'button[data-action*="media"], ' + 
            '.button[data-action*="media"], ' + 
            'a[data-action*="media"], ' +
            '[onclick*="openMediaLibrary"], ' +
            '[onclick*="selectMedia"]'
        );
        
        buttons.forEach(button => {
            // Replace with a clone to remove existing events
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            // Remove onclick attribute
            newButton.removeAttribute('onclick');
            
            // Add our own click handler
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetInputId = findTargetInputForButton(newButton);
                openForcedMediaSelector(targetInputId);
            });
        });
    }
    
    // Create mutation observer to watch for new buttons
    function createMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Process this new element for buttons
                            if (inEmailSection()) {
                                processButtons(node);
                            }
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
    }
    
    // Process all buttons in an element
    function processButtons(element) {
        // Look for buttons inside this element
        const buttons = element.querySelectorAll(
            'button.media-select-button, ' + 
            'button[data-action*="media"], ' + 
            '.button[data-action*="media"], ' + 
            'a[data-action*="media"], ' +
            '[onclick*="openMediaLibrary"], ' +
            '[onclick*="selectMedia"]'
        );
        
        buttons.forEach(button => {
            // Remove onclick attribute
            button.removeAttribute('onclick');
            
            // Add our click handler
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetInputId = findTargetInputForButton(button);
                openForcedMediaSelector(targetInputId);
            });
        });
    }
    
    // Add required CSS
    function addRequiredStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .forced-media-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100000; /* Extremely high z-index */
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .forced-media-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .forced-media-container {
                position: relative;
                width: 90%;
                max-width: 1000px;
                height: 80%;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .forced-media-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #eee;
            }
            
            .forced-media-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .forced-media-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            
            .forced-media-tabs {
                display: flex;
                padding: 0 15px;
                border-bottom: 1px solid #eee;
            }
            
            .forced-media-tab {
                padding: 12px 16px;
                background: none;
                border: none;
                cursor: pointer;
                opacity: 0.7;
                border-bottom: 2px solid transparent;
            }
            
            .forced-media-tab:hover {
                opacity: 0.9;
            }
            
            .forced-media-tab.active {
                opacity: 1;
                border-bottom-color: #007bff;
                font-weight: bold;
            }
            
            .forced-media-content {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .forced-media-sidebar {
                width: 250px;
                border-right: 1px solid #eee;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }
            
            .forced-media-search {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .forced-media-search-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .forced-media-folders-header {
                padding: 10px 15px;
                font-size: 12px;
                font-weight: bold;
                color: #666;
            }
            
            .forced-folder-item {
                display: flex;
                align-items: center;
                padding: 8px 15px;
                cursor: pointer;
            }
            
            .forced-folder-item:hover {
                background-color: #f5f5f5;
            }
            
            .forced-folder-item.active {
                background-color: #e8f0fe;
            }
            
            .forced-folder-icon {
                margin-right: 10px;
                color: #666;
            }
            
            .forced-folder-info {
                display: flex;
                justify-content: space-between;
                flex: 1;
            }
            
            .forced-folder-count {
                color: #999;
                font-size: 12px;
            }
            
            .forced-media-items {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .forced-media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 15px;
            }
            
            .forced-media-item {
                border-radius: 4px;
                border: 1px solid #eee;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .forced-media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .forced-media-item.selected {
                border: 2px solid #007bff;
                transform: translateY(-3px);
            }
            
            .forced-media-thumbnail {
                height: 140px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .forced-placeholder-text {
                color: white;
                font-weight: bold;
                font-size: 16px;
            }
            
            .forced-media-info {
                padding: 10px;
            }
            
            .forced-media-name {
                font-size: 13px;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .forced-media-meta {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #666;
            }
            
            .forced-no-media {
                padding: 30px;
                text-align: center;
                color: #666;
            }
            
            .forced-preview-placeholder {
                border-radius: 4px;
            }
        `;
        
        document.head.appendChild(style);
    }
})();
