/**
 * Forced Folder Sync for Media Library
 * 
 * This script ensures complete synchronization of folder structure and filtering
 * between the Media Library and Email Subscribers section.
 */

(function() {
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initForcedFolderSync);
    window.addEventListener('load', initForcedFolderSync);
    
    // Also set a timeout as a fallback
    setTimeout(initForcedFolderSync, 1500);
    
    // Track initialization
    let initialized = false;
    
    // Media data cache
    let cachedMediaItems = [];
    let cachedFolders = [];
    
    /**
     * Initialize forced folder sync
     */
    function initForcedFolderSync() {
        if (initialized) return;
        initialized = true;
        
        console.log('Forced Folder Sync: Initializing');
        
        // Set up hooks to intercept media selector opening
        interceptMediaSelectors();
        
        // Set up observer for dynamic content
        observeDynamicContent();
        
        // Set interval to check for media library changes
        setInterval(checkAndSyncMediaLibrary, 2000);
    }
    
    /**
     * Intercept media selectors to ensure consistent folder structure
     */
    function interceptMediaSelectors() {
        // Save original functions
        if (window.openMediaLibrary) {
            window._original_openMediaLibrary = window.openMediaLibrary;
        }
        
        if (window.openEnhancedMediaSelector) {
            window._original_openEnhancedMediaSelector = window.openEnhancedMediaSelector;
        }
        
        // Override with our enhanced versions
        window.openMediaLibrary = function(targetInput) {
            console.log('Forced Folder Sync: Intercepted openMediaLibrary call');
            openSyncedMediaSelector(targetInput);
        };
        
        window.openEnhancedMediaSelector = function(targetInput) {
            console.log('Forced Folder Sync: Intercepted openEnhancedMediaSelector call');
            openSyncedMediaSelector(targetInput);
        };
        
        // Also check for any other media selectors
        const selectors = ['media-selector', 'image-selector', 'media-library', 'media-browser'];
        selectors.forEach(selector => {
            if (window[selector]) {
                console.log(`Forced Folder Sync: Found and hooking ${selector}`);
                window[`_original_${selector}`] = window[selector];
                window[selector] = function() {
                    console.log(`Forced Folder Sync: Intercepted ${selector} call`);
                    openSyncedMediaSelector(...arguments);
                };
            }
        });
    }
    
    /**
     * Open a synchronized media selector
     */
    function openSyncedMediaSelector(targetInput) {
        console.log('Forced Folder Sync: Opening synced media selector for', targetInput);
        
        // Force update media data from library first
        const mediaData = getLatestMediaData();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'synced-media-modal';
        modal.setAttribute('data-target', targetInput);
        
        // Generate folder structure based on latest data
        const folders = extractFoldersFromMedia(mediaData);
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Select Media</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-sidebar">
                        <div class="folder-header">FOLDERS</div>
                        <div class="folder-list">
                            ${generateFolderHtml(folders, mediaData)}
                        </div>
                    </div>
                    <div class="modal-content-area">
                        <div class="media-tabs">
                            <button class="tab active" data-tab="all">All Media</button>
                            <button class="tab" data-tab="images">Images</button>
                            <button class="tab" data-tab="videos">Videos</button>
                        </div>
                        <div class="media-grid"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Set up event handlers
        setupModalEvents(modal, targetInput);
        
        // Load media content initially
        loadMediaContent(modal, 'all', 'all');
    }
    
    /**
     * Set up modal event handlers
     */
    function setupModalEvents(modal, targetInput) {
        // Close button
        const closeBtn = modal.querySelector('.close-modal');
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
                
                // Get current active tab
                const activeTab = modal.querySelector('.tab.active');
                const tabType = activeTab ? activeTab.getAttribute('data-tab') : 'all';
                
                // Filter content
                const folderType = folder.getAttribute('data-folder');
                loadMediaContent(modal, folderType, tabType);
            });
        });
        
        // Tab selection
        const tabs = modal.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Get current active folder
                const activeFolder = modal.querySelector('.folder.active');
                const folderType = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                
                // Filter content
                const tabType = tab.getAttribute('data-tab');
                loadMediaContent(modal, folderType, tabType);
            });
        });
    }
    
    /**
     * Load media content filtered by folder and type
     */
    function loadMediaContent(modal, folderType, tabType) {
        console.log(`Forced Folder Sync: Loading content - folder: ${folderType}, tab: ${tabType}`);
        
        // Get media grid
        const mediaGrid = modal.querySelector('.media-grid');
        if (!mediaGrid) return;
        
        // Clear grid
        mediaGrid.innerHTML = '';
        
        // Get latest media data
        const mediaData = getLatestMediaData();
        
        // Filter media items
        let filteredItems = mediaData;
        
        // Filter by folder
        if (folderType && folderType !== 'all') {
            filteredItems = filteredItems.filter(item => item.folder === folderType);
        }
        
        // Filter by type
        if (tabType && tabType !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === tabType);
        }
        
        // Create media items
        filteredItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            mediaItem.setAttribute('data-type', item.type);
            
            // Fix URL for proper display
            let imageUrl = fixImageUrl(item);
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail" style="background-color: ${getFolderColor(item.folder)};">
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none'; this.parentNode.classList.add('fallback');">
                    <span class="folder-label">${item.folder}</span>
                </div>
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                </div>
            `;
            
            // Add click handler
            mediaItem.addEventListener('click', () => {
                selectMedia(item, modal.getAttribute('data-target'));
                modal.remove();
            });
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    /**
     * Fix image URL to ensure proper display
     */
    function fixImageUrl(item) {
        if (!item.url) return '/css/images/placeholder.jpg';
        
        // Ensure URL has proper prefix
        let url = item.url;
        if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
            url = '/' + url;
        }
        
        // Fix css/images paths
        if (url.includes('css/images/') && !url.startsWith('/css/')) {
            url = url.replace('css/images/', '/css/images/');
        }
        
        return url;
    }
    
    /**
     * Select media and update input
     */
    function selectMedia(item, targetInputId) {
        console.log(`Forced Folder Sync: Selecting media item ${item.name} for ${targetInputId}`);
        
        // Find target input
        const input = document.getElementById(targetInputId);
        if (!input) {
            console.error(`Forced Folder Sync: Could not find input with ID ${targetInputId}`);
            return;
        }
        
        // Update input value
        input.value = item.url;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        
        // Update preview if exists
        updatePreview(item, targetInputId);
        
        // Store selection in localStorage
        try {
            const selections = JSON.parse(localStorage.getItem('media_selections') || '{}');
            selections[targetInputId] = {
                id: item.id,
                url: item.url,
                name: item.name,
                folder: item.folder,
                type: item.type
            };
            localStorage.setItem('media_selections', JSON.stringify(selections));
        } catch (e) {
            console.error('Forced Folder Sync: Error saving selection', e);
        }
    }
    
    /**
     * Update preview elements
     */
    function updatePreview(item, targetInputId) {
        // Find input element
        const input = document.getElementById(targetInputId);
        if (!input) return;
        
        // Look for preview containers
        const container = input.closest('.form-group, .input-group, .field-container');
        if (!container) return;
        
        // Look for preview elements
        const previewElements = container.querySelectorAll('.image-preview, .media-preview, .preview-container');
        previewElements.forEach(preview => {
            // If it's an image
            if (preview.tagName === 'IMG') {
                preview.src = item.url;
                preview.style.display = 'block';
            } else {
                // Look for existing image
                let img = preview.querySelector('img');
                if (img) {
                    img.src = item.url;
                    img.style.display = 'block';
                } else {
                    // Create new image
                    img = document.createElement('img');
                    img.src = item.url;
                    img.alt = item.name;
                    img.className = 'preview-image';
                    preview.innerHTML = '';
                    preview.appendChild(img);
                }
                preview.style.display = 'block';
            }
        });
        
        // Special case for email popups
        if (container.closest('.email-popup-section, .email-banner-section, .email-management-section')) {
            const popupPreviews = document.querySelectorAll('.popup-preview, .email-preview, .banner-preview');
            popupPreviews.forEach(preview => {
                const bgElements = preview.querySelectorAll('.popup-bg, .preview-bg, .banner-bg');
                bgElements.forEach(bg => {
                    bg.style.backgroundImage = `url(${item.url})`;
                });
            });
        }
    }
    
    /**
     * Get the latest media data
     */
    function getLatestMediaData() {
        // First try to get from localStorage
        try {
            const mediaDataStr = localStorage.getItem('fooodis_unified_media');
            if (mediaDataStr) {
                const mediaData = JSON.parse(mediaDataStr);
                if (Array.isArray(mediaData) && mediaData.length > 0) {
                    console.log(`Forced Folder Sync: Loaded ${mediaData.length} items from storage`);
                    cachedMediaItems = mediaData;
                    return mediaData;
                }
            }
        } catch (e) {
            console.error('Forced Folder Sync: Error loading from storage', e);
        }
        
        // If not in storage or error, try to scrape from DOM
        const scrapedItems = scrapeMediaFromDOM();
        if (scrapedItems.length > 0) {
            // Save to storage for next time
            try {
                localStorage.setItem('fooodis_unified_media', JSON.stringify(scrapedItems));
            } catch (e) {
                console.error('Forced Folder Sync: Error saving to storage', e);
            }
            
            cachedMediaItems = scrapedItems;
            return scrapedItems;
        }
        
        // If all else fails, return fallback items
        return getFallbackItems();
    }
    
    /**
     * Scrape media items from DOM
     */
    function scrapeMediaFromDOM() {
        const mediaItems = [];
        let nextId = 1;
        
        // Find all media items in the DOM
        const mediaElements = document.querySelectorAll('.media-item, .media-library-item, .media-grid-item');
        
        mediaElements.forEach(element => {
            const id = element.getAttribute('data-id') || String(nextId++);
            const name = element.getAttribute('data-name') || element.querySelector('.media-name')?.textContent || '';
            const folder = element.getAttribute('data-folder') || element.closest('[data-folder]')?.getAttribute('data-folder') || 'uncategorized';
            const type = element.getAttribute('data-type') || 'image';
            
            // Get URL
            let url = '';
            const img = element.querySelector('img');
            if (img && img.src) {
                url = img.src;
            } else {
                url = element.getAttribute('data-url') || element.getAttribute('data-src') || '';
            }
            
            // Only add if we have a name
            if (name) {
                mediaItems.push({
                    id,
                    name,
                    folder,
                    type,
                    url: url || `/css/images/${name}`
                });
            }
        });
        
        // If we didn't find any, try the forced scan
        if (mediaItems.length === 0) {
            return getFallbackItems();
        }
        
        return mediaItems;
    }
    
    /**
     * Extract folders from media items
     */
    function extractFoldersFromMedia(mediaItems) {
        // Always include 'All Media'
        const folders = [
            { id: 'all', name: 'All Media', icon: 'fas fa-images' }
        ];
        
        // Extract unique folders
        const folderSet = new Set();
        mediaItems.forEach(item => {
            if (item.folder && item.folder !== 'all') {
                folderSet.add(item.folder);
            }
        });
        
        // Add folders with appropriate icons
        folderSet.forEach(folderName => {
            folders.push({
                id: folderName,
                name: capitalizeFirstLetter(folderName),
                icon: getFolderIcon(folderName)
            });
        });
        
        return folders;
    }
    
    /**
     * Generate HTML for folders
     */
    function generateFolderHtml(folders, mediaItems) {
        let html = '';
        
        folders.forEach(folder => {
            // Count items in this folder
            let count = 0;
            if (folder.id === 'all') {
                count = mediaItems.length;
            } else {
                count = mediaItems.filter(item => item.folder === folder.id).length;
            }
            
            html += `
                <div class="folder ${folder.id === 'all' ? 'active' : ''}" data-folder="${folder.id}">
                    <i class="${folder.icon}"></i>
                    <span>${folder.name}</span>
                    <span class="folder-count">${count}</span>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Get icon for folder
     */
    function getFolderIcon(folderName) {
        const folderIcons = {
            food: 'fas fa-utensils',
            restaurant: 'fas fa-store',
            people: 'fas fa-users',
            uncategorized: 'fas fa-folder-open',
            test: 'fas fa-vial'
        };
        
        return folderIcons[folderName.toLowerCase()] || 'fas fa-folder';
    }
    
    /**
     * Get color for folder
     */
    function getFolderColor(folderName) {
        const folderColors = {
            food: '#5b7adb',      // Blue
            restaurant: '#20c997', // Teal
            people: '#fd7e14',    // Orange
            uncategorized: '#6c757d', // Gray
            test: '#dc3545'       // Red
        };
        
        return folderColors[folderName?.toLowerCase()] || '#6c757d';
    }
    
    /**
     * Get fallback media items
     */
    function getFallbackItems() {
        return [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image', url: '/css/images/cappuccino-or-latte-coffee-with-heart-art.jpg' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image', url: '/css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image', url: '/css/images/white-cup-of-tasty-cappuccino.jpg' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image', url: '/css/images/hot-coffee-latte-art-on-wooden-table.jpg' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image', url: '/css/images/appetizing-soup-served-with-herbs.jpg' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image', url: '/css/images/restaurant-interior.jpg' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image', url: '/css/images/chef-cooking.jpg' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image', url: '/css/images/chef-decorating.jpg' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image', url: '/css/images/a-full-bag-of-brown-coffee-beans.jpg' }
        ];
    }
    
    /**
     * Check and sync media library
     */
    function checkAndSyncMediaLibrary() {
        // Skip if not in the right section
        const isMediaSection = document.querySelector('.media-library-section:not(.hidden), .media-management:not(.hidden)');
        const isEmailSection = document.querySelector('.email-management-section:not(.hidden)');
        
        if (!isMediaSection && !isEmailSection) return;
        
        // Check if we need to update
        const currentItems = scrapeMediaFromDOM();
        if (currentItems.length === 0) return;
        
        // Compare with cached items
        if (hasMediaChanged(currentItems, cachedMediaItems)) {
            console.log('Forced Folder Sync: Media library has changed, updating cache');
            cachedMediaItems = currentItems;
            
            // Update localStorage
            try {
                localStorage.setItem('fooodis_unified_media', JSON.stringify(currentItems));
            } catch (e) {
                console.error('Forced Folder Sync: Error saving updated media to storage', e);
            }
            
            // Update any open modal
            refreshOpenModals();
        }
    }
    
    /**
     * Check if media has changed
     */
    function hasMediaChanged(newItems, oldItems) {
        if (newItems.length !== oldItems.length) return true;
        
        // Check for folder changes
        for (let i = 0; i < newItems.length; i++) {
            const newItem = newItems[i];
            
            // Try to find matching item
            const matchingItem = oldItems.find(item => 
                item.id === newItem.id || item.name === newItem.name
            );
            
            if (!matchingItem) return true;
            
            // Check if folder has changed
            if (matchingItem.folder !== newItem.folder) return true;
        }
        
        return false;
    }
    
    /**
     * Refresh open modals
     */
    function refreshOpenModals() {
        const openModals = document.querySelectorAll('.synced-media-modal');
        openModals.forEach(modal => {
            const targetInput = modal.getAttribute('data-target');
            const activeFolder = modal.querySelector('.folder.active');
            const folderType = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
            
            const activeTab = modal.querySelector('.tab.active');
            const tabType = activeTab ? activeTab.getAttribute('data-tab') : 'all';
            
            // Rebuild folder list
            const folderList = modal.querySelector('.folder-list');
            if (folderList) {
                const folders = extractFoldersFromMedia(cachedMediaItems);
                folderList.innerHTML = generateFolderHtml(folders, cachedMediaItems);
                setupModalEvents(modal, targetInput);
            }
            
            // Reload content
            loadMediaContent(modal, folderType, tabType);
        });
    }
    
    /**
     * Observe dynamic content
     */
    function observeDynamicContent() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check for added media buttons
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const mediaButtons = node.querySelectorAll('.media-library-button, .email-media-select-button, .media-select-btn');
                            mediaButtons.forEach(button => {
                                // Remove existing listeners and add our own
                                const newButton = button.cloneNode(true);
                                button.parentNode.replaceChild(newButton, button);
                                
                                // Add our listener
                                newButton.addEventListener('click', e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    const targetInput = newButton.getAttribute('data-target-input') || 
                                                       newButton.getAttribute('data-target') || 
                                                       'media-input';
                                    
                                    openSyncedMediaSelector(targetInput);
                                });
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Helper: Capitalize first letter
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .synced-media-modal {
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
        
        .synced-media-modal .modal-content {
            background-color: #1e1e1e;
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .synced-media-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .synced-media-modal .modal-header h2 {
            color: #fff;
            margin: 0;
            font-size: 18px;
        }
        
        .synced-media-modal .close-modal {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .synced-media-modal .modal-body {
            display: flex;
            height: calc(100% - 60px);
            overflow: hidden;
        }
        
        .synced-media-modal .modal-sidebar {
            width: 250px;
            background-color: #252525;
            border-right: 1px solid #333;
            overflow-y: auto;
        }
        
        .synced-media-modal .folder-header {
            padding: 15px;
            color: #aaa;
            font-size: 12px;
            font-weight: bold;
        }
        
        .synced-media-modal .folder {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            color: #fff;
            cursor: pointer;
        }
        
        .synced-media-modal .folder:hover {
            background-color: #333;
        }
        
        .synced-media-modal .folder.active {
            background-color: #3a3a3a;
        }
        
        .synced-media-modal .folder i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .synced-media-modal .folder-count {
            margin-left: auto;
            background-color: #444;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
        }
        
        .synced-media-modal .modal-content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .synced-media-modal .media-tabs {
            display: flex;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .synced-media-modal .tab {
            background: none;
            border: none;
            color: #aaa;
            padding: 8px 15px;
            cursor: pointer;
            margin-right: 10px;
            border-radius: 4px;
        }
        
        .synced-media-modal .tab:hover {
            background-color: #333;
            color: #fff;
        }
        
        .synced-media-modal .tab.active {
            background-color: #3a3a3a;
            color: #fff;
        }
        
        .synced-media-modal .media-grid {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 15px;
        }
        
        .synced-media-modal .media-item {
            background-color: #252525;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .synced-media-modal .media-item:hover {
            transform: scale(1.05);
        }
        
        .synced-media-modal .media-thumbnail {
            height: 150px;
            position: relative;
            overflow: hidden;
        }
        
        .synced-media-modal .media-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .synced-media-modal .media-thumbnail.fallback {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .synced-media-modal .folder-label {
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 5px 10px;
            font-size: 12px;
            text-transform: capitalize;
        }
        
        .synced-media-modal .media-info {
            padding: 10px;
        }
        
        .synced-media-modal .media-name {
            color: #fff;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);
})();
