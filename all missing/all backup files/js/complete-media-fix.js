/**
 * Complete Media Fix
 * This script provides a comprehensive fix for media selector, handling both
 * image display and folder filtering simultaneously
 */

(function() {
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initCompleteMediaFix);
    
    // Variables to track state
    let isInitialized = false;
    let lastKnownMediaItems = [];
    
    /**
     * Initialize the media fix
     */
    function initCompleteMediaFix() {
        if (isInitialized) return;
        isInitialized = true;
        
        console.log('Complete Media Fix: Initializing...');
        
        // Override the media selector functions
        overrideMediaSelectors();
        
        // Keep track of folder changes
        observeDynamicContent();
        
        // Periodically sync media data
        setInterval(refreshMediaData, 2000);
    }
    
    /**
     * Override the built-in media selector functions
     */
    function overrideMediaSelectors() {
        // Save original functions if they exist
        if (window.openMediaLibrary) {
            window._originalOpenMediaLibrary = window.openMediaLibrary;
        }
        
        // Set our enhanced version as the default
        window.openMediaLibrary = window.openEnhancedMediaSelector = function(targetInputId) {
            console.log('Complete Media Fix: Opening enhanced media selector for', targetInputId);
            openEnhancedMediaSelectorModal(targetInputId);
        };
        
        // Override any other media selector buttons
        document.querySelectorAll('.media-select-btn, .media-library-button').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target') || 
                                 this.getAttribute('data-target-input') || 
                                 'media-input';
                openEnhancedMediaSelectorModal(targetId);
            }, true);
        });
    }
    
    /**
     * Open the enhanced media selector modal
     */
    function openEnhancedMediaSelectorModal(targetInputId) {
        // Get the latest media data
        const mediaItems = getMediaData();
        
        // Extract real folders that have items
        const folders = extractActiveFolders(mediaItems);
        
        // Create the modal
        const modal = document.createElement('div');
        modal.className = 'enhanced-media-modal';
        modal.setAttribute('data-target', targetInputId);
        
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
                                <span class="count">${mediaItems.length}</span>
                            </div>
                            ${folders.map(folder => {
                                const count = mediaItems.filter(item => item.folder === folder).length;
                                return `
                                    <div class="folder" data-folder="${folder}">
                                        <i class="${getFolderIcon(folder)}"></i>
                                        <span>${capitalizeFirstLetter(folder)}</span>
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
        setupModalEvents(modal, targetInputId, mediaItems);
        
        // Load all media initially
        loadMediaContent(modal, 'all', mediaItems);
    }
    
    /**
     * Set up event handlers for the modal
     */
    function setupModalEvents(modal, targetInputId, mediaItems) {
        // Close button
        modal.querySelector('.close-button').addEventListener('click', () => {
            modal.remove();
        });
        
        // Folder clicks
        const folders = modal.querySelectorAll('.folder');
        folders.forEach(folder => {
            folder.addEventListener('click', () => {
                // Update active class
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Load media for this folder
                const folderName = folder.getAttribute('data-folder');
                loadMediaContent(modal, folderName, mediaItems);
            });
        });
    }
    
    /**
     * Load media content into the grid
     */
    function loadMediaContent(modal, folderFilter, mediaItems) {
        console.log(`Complete Media Fix: Loading media for folder: ${folderFilter}`);
        
        const mediaGrid = modal.querySelector('.media-grid');
        mediaGrid.innerHTML = '';
        
        // Filter by folder if needed
        let filteredItems = mediaItems;
        if (folderFilter && folderFilter !== 'all') {
            filteredItems = mediaItems.filter(item => item.folder === folderFilter);
        }
        
        // Create media items
        filteredItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            
            // Get the proper URL for this image
            const imageUrl = getProperImageUrl(item);
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail" style="background-color: ${getFolderColor(item.folder)}">
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none';">
                    <div class="folder-badge">${item.folder}</div>
                </div>
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                </div>
            `;
            
            // Handle image selection
            mediaItem.addEventListener('click', () => {
                selectMedia(item, modal.getAttribute('data-target'));
                modal.remove();
            });
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    /**
     * Extract active folders that actually contain items
     */
    function extractActiveFolders(mediaItems) {
        const folderCounts = {};
        
        // Count items in each folder
        mediaItems.forEach(item => {
            if (item.folder) {
                folderCounts[item.folder] = (folderCounts[item.folder] || 0) + 1;
            }
        });
        
        // Only include folders with items
        const folders = Object.keys(folderCounts)
            .filter(folder => folderCounts[folder] > 0 && folder !== 'uncategorized' && folder !== 'test');
        
        // Sort alphabetically
        folders.sort();
        
        return folders;
    }
    
    /**
     * Select a media item
     */
    function selectMedia(item, targetInputId) {
        console.log(`Complete Media Fix: Selecting ${item.name} for target ${targetInputId}`);
        
        // Find the target input
        const input = document.getElementById(targetInputId);
        if (!input) {
            console.error(`Complete Media Fix: Target input not found: ${targetInputId}`);
            return;
        }
        
        // Update the input value
        input.value = item.url;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        
        // Update preview if available
        updatePreviewImage(input, item.url);
    }
    
    /**
     * Update preview image for selected media
     */
    function updatePreviewImage(input, imageUrl) {
        // Look for preview container near the input
        const container = input.closest('.form-group, .input-group, .media-field');
        if (!container) return;
        
        // Find preview elements
        const previews = container.querySelectorAll('.image-preview, .preview-container');
        previews.forEach(preview => {
            if (preview.tagName === 'IMG') {
                preview.src = imageUrl;
                preview.style.display = 'block';
            } else {
                // Check if there's an image inside
                const img = preview.querySelector('img');
                if (img) {
                    img.src = imageUrl;
                } else {
                    // Create a new image
                    const newImg = document.createElement('img');
                    newImg.src = imageUrl;
                    newImg.className = 'preview-image';
                    preview.innerHTML = '';
                    preview.appendChild(newImg);
                }
                preview.style.display = 'block';
            }
        });
    }
    
    /**
     * Get media data from DOM and localStorage
     */
    function getMediaData() {
        // Try to get from localStorage first
        try {
            const savedData = localStorage.getItem('fooodis_media_items');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    console.log(`Complete Media Fix: Loaded ${parsedData.length} items from storage`);
                    return parsedData;
                }
            }
        } catch (e) {
            console.error('Complete Media Fix: Error loading from storage', e);
        }
        
        // If not in storage, scrape from DOM
        const scrapedItems = scrapeMediaFromDOM();
        if (scrapedItems.length > 0) {
            // Save for next time
            try {
                localStorage.setItem('fooodis_media_items', JSON.stringify(scrapedItems));
            } catch (e) {
                console.error('Complete Media Fix: Error saving to storage', e);
            }
            
            return scrapedItems;
        }
        
        // If all else fails, use fallback data
        return getFallbackMediaItems();
    }
    
    /**
     * Scrape media items from the DOM
     */
    function scrapeMediaFromDOM() {
        console.log('Complete Media Fix: Scraping media from DOM');
        
        const mediaItems = [];
        let nextId = 1;
        
        // Find all media items in various containers
        const mediaElements = document.querySelectorAll('.media-item, .media-library-item, .media-content');
        
        mediaElements.forEach(element => {
            const id = element.getAttribute('data-id') || String(nextId++);
            let name = element.getAttribute('data-name') || 
                     element.querySelector('.media-name')?.textContent || 
                     element.querySelector('.media-title')?.textContent || '';
                     
            // Cleanup name if needed
            name = name.trim();
            if (!name.includes('.')) {
                name += '.jpg'; // Add extension if missing
            }
            
            // Get folder
            let folder = element.getAttribute('data-folder') || 
                       element.closest('[data-folder]')?.getAttribute('data-folder') || 
                       'uncategorized';
                       
            // Normalize folder names
            folder = folder.toLowerCase();
            if (folder === 'test' || folder === '') {
                folder = 'uncategorized';
            }
            
            // Get URL from various possible sources
            let url = '';
            const img = element.querySelector('img');
            if (img && img.src) {
                url = img.src;
            } else {
                url = element.getAttribute('data-url') || 
                     element.getAttribute('data-src') || 
                     `/css/images/${name}`;
            }
            
            // Only add if we have a name
            if (name) {
                mediaItems.push({
                    id,
                    name,
                    folder,
                    url
                });
            }
        });
        
        console.log(`Complete Media Fix: Scraped ${mediaItems.length} media items`);
        return mediaItems;
    }
    
    /**
     * Get proper image URL ensuring it loads correctly
     */
    function getProperImageUrl(item) {
        if (!item.url) {
            return `/css/images/${item.name}`;
        }
        
        // Fix URL issues
        let url = item.url;
        
        // Add leading slash if missing
        if (!url.startsWith('/') && !url.startsWith('http') && !url.startsWith('data:')) {
            url = '/' + url;
        }
        
        // Fix css/images paths
        if (url.includes('css/images/') && !url.startsWith('/css/')) {
            url = url.replace('css/images/', '/css/images/');
        }
        
        return url;
    }
    
    /**
     * Observe dynamic content for changes
     */
    function observeDynamicContent() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Look for added media buttons
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const buttons = node.querySelectorAll('.media-select-btn, .media-library-button');
                            buttons.forEach(btn => {
                                // Clone and replace to remove old event listeners
                                const newBtn = btn.cloneNode(true);
                                btn.parentNode.replaceChild(newBtn, btn);
                                
                                // Add our event listener
                                newBtn.addEventListener('click', e => {
                                    e.preventDefault();
                                    const targetId = newBtn.getAttribute('data-target') || 
                                                   newBtn.getAttribute('data-target-input') || 
                                                   'media-input';
                                    openEnhancedMediaSelectorModal(targetId);
                                });
                            });
                        }
                    });
                }
            });
        });
        
        // Observe the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Refresh media data periodically
     */
    function refreshMediaData() {
        // Only run if we're in the right section
        const isMediaSection = document.querySelector('.media-section:not(.hidden), .media-library-section:not(.hidden)');
        if (!isMediaSection) return;
        
        // Scrape current media data
        const currentItems = scrapeMediaFromDOM();
        if (currentItems.length === 0) return;
        
        // Check if anything has changed
        if (hasMediaChanged(currentItems, lastKnownMediaItems)) {
            console.log('Complete Media Fix: Media data has changed, updating...');
            
            // Update our cache
            lastKnownMediaItems = currentItems;
            
            // Save to localStorage
            try {
                localStorage.setItem('fooodis_media_items', JSON.stringify(currentItems));
            } catch (e) {
                console.error('Complete Media Fix: Error saving updated media to storage', e);
            }
        }
    }
    
    /**
     * Check if media data has changed
     */
    function hasMediaChanged(newItems, oldItems) {
        if (newItems.length !== oldItems.length) return true;
        
        // Check for folder changes
        for (let i = 0; i < newItems.length; i++) {
            const newItem = newItems[i];
            const oldItem = oldItems.find(item => item.id === newItem.id || item.name === newItem.name);
            
            if (!oldItem || oldItem.folder !== newItem.folder) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get icon for a folder
     */
    function getFolderIcon(folderName) {
        const icons = {
            food: 'fas fa-utensils',
            restaurant: 'fas fa-store',
            people: 'fas fa-users',
            uncategorized: 'fas fa-folder',
        };
        
        return icons[folderName] || 'fas fa-folder';
    }
    
    /**
     * Get color for a folder
     */
    function getFolderColor(folderName) {
        const colors = {
            food: '#5b7adb',
            restaurant: '#20c997',
            people: '#fd7e14',
            uncategorized: '#6c757d',
        };
        
        return colors[folderName] || '#6c757d';
    }
    
    /**
     * Get fallback media items
     */
    function getFallbackMediaItems() {
        return [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', url: '/css/images/cappuccino-or-latte-coffee-with-heart-art.jpg' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', url: '/css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', url: '/css/images/white-cup-of-tasty-cappuccino.jpg' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', url: '/css/images/hot-coffee-latte-art-on-wooden-table.jpg' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', url: '/css/images/appetizing-soup-served-with-herbs.jpg' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', url: '/css/images/restaurant-interior.jpg' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', url: '/css/images/chef-cooking.jpg' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', url: '/css/images/chef-decorating.jpg' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', url: '/css/images/a-full-bag-of-brown-coffee-beans.jpg' }
        ];
    }
    
    /**
     * Helper: Capitalize first letter
     */
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Add needed styles
    const styles = document.createElement('style');
    styles.textContent = `
        .enhanced-media-modal {
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
        
        .enhanced-media-modal .modal-content {
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            background-color: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .enhanced-media-modal .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        
        .enhanced-media-modal .modal-header h3 {
            color: #fff;
            margin: 0;
        }
        
        .enhanced-media-modal .close-button {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
        }
        
        .enhanced-media-modal .modal-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        .enhanced-media-modal .sidebar {
            width: 250px;
            background-color: #252525;
            overflow-y: auto;
            border-right: 1px solid #333;
        }
        
        .enhanced-media-modal .filter-header {
            padding: 15px;
            color: #aaa;
            font-weight: bold;
            font-size: 12px;
        }
        
        .enhanced-media-modal .folder {
            padding: 10px 15px;
            display: flex;
            align-items: center;
            color: #fff;
            cursor: pointer;
        }
        
        .enhanced-media-modal .folder:hover {
            background-color: #333;
        }
        
        .enhanced-media-modal .folder.active {
            background-color: #3a3a3a;
        }
        
        .enhanced-media-modal .folder i {
            margin-right: 10px;
            width: 20px;
            text-align: center;
        }
        
        .enhanced-media-modal .folder .count {
            margin-left: auto;
            padding: 2px 8px;
            background-color: #444;
            border-radius: 10px;
            font-size: 12px;
        }
        
        .enhanced-media-modal .media-container {
            flex: 1;
            overflow-y: auto;
        }
        
        .enhanced-media-modal .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            grid-gap: 15px;
            padding: 15px;
        }
        
        .enhanced-media-modal .media-item {
            background-color: #252525;
            border-radius: 4px;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        .enhanced-media-modal .media-item:hover {
            transform: scale(1.05);
        }
        
        .enhanced-media-modal .media-thumbnail {
            height: 150px;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .enhanced-media-modal .media-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .enhanced-media-modal .folder-badge {
            position: absolute;
            bottom: 0;
            left: 0;
            background-color: rgba(0,0,0,0.7);
            padding: 5px 8px;
            font-size: 12px;
            color: #fff;
            text-transform: capitalize;
        }
        
        .enhanced-media-modal .media-info {
            padding: 10px;
        }
        
        .enhanced-media-modal .media-name {
            color: #fff;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(styles);
})();
