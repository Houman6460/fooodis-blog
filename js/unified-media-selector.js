/**
 * Unified Media Selector
 * 
 * This script fixes the discrepancy between Media Library and Email Subscribers media selection
 * by ensuring they both use the same data source and display the same images.
 */

(function() {
    // Initialize on DOM ready and window load to ensure it runs
    document.addEventListener('DOMContentLoaded', initUnifiedMediaSelector);
    window.addEventListener('load', initUnifiedMediaSelector);
    
    // Also set a timeout as a fallback
    setTimeout(initUnifiedMediaSelector, 1500);
    
    // Set up a more frequent check interval for critical updates
    setInterval(() => {
        if (initialized) {
            // Check and sync folder changes more frequently
            detectFolderChanges();
        }
    }, 1000); // Check every 1 second for immediate folder updates
    
    // Store initialization state
    let initialized = false;
    
    // Track folder operations to detect changes
    const folderOperations = {};
    
    /**
     * Initialize the unified media selector
     */
    function initUnifiedMediaSelector() {
        if (initialized) return;
        initialized = true;
        
        console.log('Unified Media Selector: Initializing');
        
        // 1. First, ensure we have a unified data source
        unifyMediaData();
        
        // 2. Override the email subscribers media selector to use the unified data
        overrideEmailMediaSelector();
        
        // 3. Set up observers to catch dynamically added elements
        observeMediaButtons();
        
        // 4. Add listeners for folder changes
        detectAndListenForFolderOperations();
        
        // 5. Periodically check and update media data
        setInterval(syncMediaData, 30000); // Increased from 3 seconds to 30 seconds for rate limiting
    }
    
    /**
     * Unify media data between different parts of the application
     */
    function unifyMediaData() {
        console.log('Unified Media Selector: Syncing media data sources');
        
        // Get all possible sources of media data
        let mediaItems = [];
        
        // Try sources in order of likely completeness
        const mainLibrarySources = [
            { key: 'fooodis_main_media_library', label: 'Main Media Library' },
            { key: 'media_library_items', label: 'Media Library Items' },
            { key: 'fooodis_media_library', label: 'Fooodis Media Library' }
        ];
        
        // First try to get from sources that would have the complete media library
        let foundComplete = false;
        for (const source of mainLibrarySources) {
            try {
                const data = localStorage.getItem(source.key);
                if (data && data.length > 10) { // Simple check for non-empty data
                    const parsedData = JSON.parse(data);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        console.log(`Unified Media Selector: Found ${parsedData.length} items in ${source.label}`);
                        mediaItems = parsedData;
                        foundComplete = true;
                        break;
                    }
                }
            } catch (e) {
                console.error(`Unified Media Selector: Error reading from ${source.label}`, e);
            }
        }
        
        // If we didn't find a complete source, try the email subscribers source
        if (!foundComplete) {
            try {
                const emailData = localStorage.getItem('fooodis_media_items');
                if (emailData) {
                    const parsedData = JSON.parse(emailData);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        console.log(`Unified Media Selector: Found ${parsedData.length} items in Email Subscribers data`);
                        mediaItems = parsedData;
                        foundComplete = true;
                    }
                }
            } catch (e) {
                console.error('Unified Media Selector: Error reading Email Subscribers data', e);
            }
        }
        
        // Check the actual DOM for media items if we still don't have data
        if (!foundComplete || mediaItems.length === 0) {
            console.log('Unified Media Selector: Scraping DOM for media items');
            mediaItems = scrapeMediaItemsFromDOM();
        }
        
        // Now ensure this data is available to all components
        try {
            // Store in all known storage keys to ensure availability
            const mediaItemsString = JSON.stringify(mediaItems);
            localStorage.setItem('fooodis_unified_media', mediaItemsString);
            localStorage.setItem('fooodis_media_items', mediaItemsString);
            localStorage.setItem('fooodis_main_media_library', mediaItemsString);
            localStorage.setItem('media_library_items', mediaItemsString);
            
            console.log(`Unified Media Selector: Saved ${mediaItems.length} items to all storage locations`);
        } catch (e) {
            console.error('Unified Media Selector: Error saving unified media data', e);
        }
        
        return mediaItems;
    }
    
    /**
     * Scrape media items from the DOM
     */
    function scrapeMediaItemsFromDOM() {
        console.log('Unified Media Selector: Scraping media items from DOM');
        
        const mediaItems = [];
        let nextId = 1;
        
        // Look for media items in the main media library
        const mediaElements = document.querySelectorAll('.media-item, .media-library-item, .media-grid-item');
        
        mediaElements.forEach(element => {
            const id = element.getAttribute('data-id') || String(nextId++);
            const name = element.getAttribute('data-name') || element.querySelector('.media-name')?.textContent || 'media-' + id + '.jpg';
            const folder = element.getAttribute('data-folder') || element.closest('[data-folder]')?.getAttribute('data-folder') || 'uncategorized';
            const type = element.getAttribute('data-type') || 'image';
            
            // Try to get the URL from multiple possible sources
            let url = '';
            const img = element.querySelector('img');
            if (img && img.src) {
                url = img.src;
                
                // Check if this is a real image or a placeholder
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    // This is a valid image that has loaded
                    console.log(`Found loaded image: ${url}`);
                } else if (img.complete && img.naturalWidth === 0) {
                    // This image failed to load, might be a placeholder - try to find the actual URL
                    url = findActualImageUrl(name, folder);
                }
            } else {
                url = element.getAttribute('data-url') || element.getAttribute('data-src') || '';
                if (!url) {
                    // Try to find the actual URL based on the name and folder
                    url = findActualImageUrl(name, folder);
                }
            }
            
            // Fix relative URLs
            if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/')) {
                url = '/' + url;
            }
            
            // Handle common CSS paths
            if (url && url.includes('css/images/') && !url.startsWith('/css/')) {
                url = url.replace('css/images/', '/css/images/');
            }
            
            // Try to create a proper URL path if we only have a filename
            if (url && !url.includes('/')) {
                // This might just be a filename, try to construct a complete path
                url = '/css/images/' + url;
            }
            
            // Add to collection if we have enough data
            if (name) {
                mediaItems.push({
                    id,
                    name,
                    folder,
                    type,
                    url: url || `/css/images/${name}` // Ensure we always have a URL
                });
            }
        });
        
        console.log(`Unified Media Selector: Scraped ${mediaItems.length} items from DOM`);
        
        // If we have very few items, try a direct scan of images
        if (mediaItems.length < 5) {
            const scannedItems = forceScanForImages();
            if (scannedItems.length > mediaItems.length) {
                console.log(`Unified Media Selector: Using ${scannedItems.length} scanned images instead of ${mediaItems.length} DOM items`);
                return scannedItems;
            }
        }
        
        // If we still have no items, use the default media items to ensure something is available
        if (mediaItems.length === 0) {
            return getDefaultMediaItems();
        }
        
        return mediaItems;
    }
    
    /**
     * Try to find the actual image URL for a media item
     */
    function findActualImageUrl(name, folder) {
        // List of common paths to try
        const pathsToTry = [
            `/css/images/${name}`,
            `/images/${name}`,
            `/css/images/${folder}/${name}`,
            `/images/${folder}/${name}`,
            `/css/images/${name.toLowerCase()}`,
            `/images/${name.toLowerCase()}`
        ];
        
        // Check if any of these paths exist by creating an image and seeing if it loads
        for (const path of pathsToTry) {
            const tempImg = new Image();
            tempImg.src = path;
            if (tempImg.complete && tempImg.naturalWidth > 0) {
                console.log(`Found working image URL: ${path}`);
                return path;
            }
        }
        
        // If we can't find a working URL, construct one based on the name
        return `/css/images/${name}`;
    }
    
    /**
     * Force scan for images in the CSS/images directory
     */
    function forceScanForImages() {
        console.log('Unified Media Selector: Force scanning for images');
        
        const scannedItems = [];
        let nextId = 1;
        
        // List of known image filenames from the Media Library
        const knownImages = [
            'cappuccino-or-latte-coffee-with-heart-art.jpg',
            'japanese-tea-2024-04-08-18-06-00-utc.jpg',
            'white-cup-of-tasty-cappuccino.jpg',
            'hot-coffee-latte-art-on-wooden-table.jpg',
            'appetizing-soup-served-with-herbs.jpg',
            'restaurant-interior.jpg',
            'chef-cooking.jpg',
            'chef-decorating.jpg',
            'a-full-bag-of-brown-coffee-beans.jpg'
        ];
        
        // Map of known filenames to folders
        const folderMap = {
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
        
        // Create items for all known images
        knownImages.forEach(filename => {
            const id = String(nextId++);
            const name = filename;
            const folder = folderMap[filename] || 'uncategorized';
            
            scannedItems.push({
                id,
                name,
                folder,
                type: 'image',
                url: `/css/images/${filename}`
            });
        });
        
        console.log(`Unified Media Selector: Scanned and found ${scannedItems.length} known images`);
        
        return scannedItems;
    }
    
    /**
     * Get default media items as a last resort
     */
    function getDefaultMediaItems() {
        console.log('Unified Media Selector: Using default media items');
        
        return [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image', url: 'css/images/cappuccino-or-latte-coffee-with-heart-art.jpg' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image', url: 'css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image', url: 'css/images/white-cup-of-tasty-cappuccino.jpg' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image', url: 'css/images/hot-coffee-latte-art-on-wooden-table.jpg' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image', url: 'css/images/appetizing-soup-served-with-herbs.jpg' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image', url: 'css/images/restaurant-interior.jpg' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image', url: 'css/images/chef-cooking.jpg' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image', url: 'css/images/chef-decorating.jpg' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image', url: 'css/images/a-full-bag-of-brown-coffee-beans.jpg' }
        ];
    }
    
    /**
     * Override the email media selector to use the unified data
     */
    function overrideEmailMediaSelector() {
        console.log('Unified Media Selector: Overriding email media selector');
        
        // Save original functions if they exist
        if (typeof window.openMediaLibrary === 'function') {
            window._originalOpenMediaLibrary = window.openMediaLibrary;
        }
        
        if (typeof window.openEnhancedMediaSelector === 'function') {
            window._originalOpenEnhancedMediaSelector = window.openEnhancedMediaSelector;
        }
        
        // Create a new unified openMediaLibrary function
        window.openMediaLibrary = function(targetInputId) {
            console.log('Unified Media Selector: Opening media selector for', targetInputId);
            
            // Ensure we have the latest unified data
            unifyMediaData();
            
            // If we're in the email section, force refresh the data
            if (document.querySelector('.email-management-section:not(.hidden)')) {
                console.log('Unified Media Selector: Email section detected, forcing media refresh');
                syncMediaData();
            }
            
            // Call original function if it exists
            if (typeof window._originalOpenMediaLibrary === 'function') {
                window._originalOpenMediaLibrary(targetInputId);
            } else if (typeof window.originalOpenMediaLibrary === 'function') {
                window.originalOpenMediaLibrary(targetInputId);
            } else {
                // Fallback to basic media selector
                openBasicMediaSelector(targetInputId);
            }
        };
        
        // Do the same for the enhanced selector
        window.openEnhancedMediaSelector = function(targetInputId) {
            console.log('Unified Media Selector: Opening enhanced media selector for', targetInputId);
            
            // Ensure we have the latest unified data
            unifyMediaData();
            
            // If we're in the email section, force refresh the data
            if (document.querySelector('.email-management-section:not(.hidden)')) {
                console.log('Unified Media Selector: Email section detected, forcing media refresh');
                syncMediaData();
            }
            
            // Call original function if it exists
            if (typeof window._originalOpenEnhancedMediaSelector === 'function') {
                window._originalOpenEnhancedMediaSelector(targetInputId);
            } else if (typeof window.originalOpenEnhancedMediaSelector === 'function') {
                window.originalOpenEnhancedMediaSelector(targetInputId);
            } else {
                // Fallback to email subscribers version
                window.openMediaLibrary(targetInputId);
        let mediaItems = [];
        
        try {
            // First try to get from unified storage
            const data = localStorage.getItem('fooodis_unified_media');
            if (data) {
                mediaItems = JSON.parse(data);
            }
        } catch (e) {
            console.error('Unified Media Selector: Error loading from unified storage', e);
        }
        
        // If we have no items, try to get from DOM
        if (mediaItems.length === 0) {
            mediaItems = unifyMediaData();
        }
        modal.innerHTML = `
            <div class="media-selector-content">
                <div class="media-selector-header">
                    <h2>Select Media</h2>
                    <button class="media-selector-close">&times;</button>
                </div>
                <div class="media-selector-body">
                    <div class="media-grid"></div>
                    <div class="folder-filter">
                        <select id="folder-filter-select">
                            <option value="">All Folders</option>
                            ${Object.keys(getFolderMap()).map(folder => `<option value="${folder}">${folder}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.media-selector-close').addEventListener('click', function() {
            modal.remove();
        });
        
        // Populate with media items
        const grid = modal.querySelector('.media-grid');
        
        mediaItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            mediaItem.setAttribute('data-type', item.type);
            
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.name;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'media-name';
            nameDiv.textContent = item.name;
            
            mediaItem.appendChild(img);
            mediaItem.appendChild(nameDiv);
            
            // Click handler
            mediaItem.addEventListener('click', function() {
                // Update the target input
                const input = document.getElementById(targetInputId);
                if (input) {
                    input.value = item.url;
                    
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                    
                    // Update any preview elements
                    updatePreviewElements(targetInputId, item);
                }
                
                // Close modal
                modal.remove();
            });
            
            grid.appendChild(mediaItem);
        });
        
        // Add basic styling if it doesn't exist
        if (!document.getElementById('unified-media-selector-styles')) {
            const style = document.createElement('style');
            style.id = 'unified-media-selector-styles';
            style.textContent = `
                .unified-media-selector-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .media-selector-content {
                    background: #1e1e1e;
                    border-radius: 8px;
                    width: 80%;
                    max-width: 1000px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .media-selector-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border-bottom: 1px solid #333;
                }
                
                .media-selector-header h2 {
                    color: #fff;
                    margin: 0;
                }
                
                .media-selector-close {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .media-selector-body {
                    padding: 15px;
                    overflow-y: auto;
                    flex: 1;
                }
                
                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    grid-gap: 15px;
                }
                
                .media-item {
                    background: #333;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .media-item:hover {
                    transform: scale(1.05);
                }
                
                .media-item img {
                    width: 100%;
                    height: 150px;
                    object-fit: cover;
                    display: block;
                }
                
                .media-name {
                    padding: 8px;
                    color: #fff;
                    font-size: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Update preview elements after selection
     */
    function updatePreviewElements(inputId, media) {
        // Find any preview elements
        const input = document.getElementById(inputId);
        if (!input) return;
        
        // Look for preview containers near the input
        const container = input.closest('.form-group, .input-group, .media-input-container');
        if (!container) return;
        
        // Look for preview elements
        const previewElements = container.querySelectorAll('.media-preview, .image-preview, .preview-image');
        
        previewElements.forEach(preview => {
            // If it's an image element
            if (preview.tagName === 'IMG') {
                preview.src = media.url;
                preview.style.display = 'block';
            } 
            // If it's a container
            else {
                const img = preview.querySelector('img');
                if (img) {
                    img.src = media.url;
                    img.style.display = 'block';
                } else {
                    // Create new image
                    const newImg = document.createElement('img');
                    newImg.src = media.url;
                    newImg.alt = media.name;
                    newImg.className = 'preview-img';
                    preview.innerHTML = '';
                    preview.appendChild(newImg);
                }
                
                preview.style.display = 'block';
            }
        });
        
        // For Email Subscribers specific handling
        if (container.closest('.email-popup-section, .email-banner-section, .email-management-section')) {
            // Update any additional preview areas
            const previewAreas = document.querySelectorAll('.email-preview, .popup-preview, .banner-preview');
            
            previewAreas.forEach(area => {
                const bgElements = area.querySelectorAll('.preview-bg, .popup-bg, .banner-bg');
                bgElements.forEach(bg => {
                    bg.style.backgroundImage = `url(${media.url})`;
                });
            });
        }
    }
    
    /**
     * Observe for dynamically added media buttons
     */
    function observeMediaButtons() {
        // Check if the browser supports MutationObserver
        if (!window.MutationObserver) return;
        
        // Create an observer to watch for added nodes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check added nodes
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(node) {
                        // Check if it's an element
                        if (node.nodeType === 1) {
                            // Check if it's a media button or contains media buttons
                            if (node.matches('.media-library-button, .email-media-select-button, .media-select-btn')) {
                                updateMediaButton(node);
                            } else {
                                // Check child elements
                                const buttons = node.querySelectorAll('.media-library-button, .email-media-select-button, .media-select-btn');
                                buttons.forEach(updateMediaButton);
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also update any existing buttons
        const existingButtons = document.querySelectorAll('.media-library-button, .email-media-select-button, .media-select-btn');
        existingButtons.forEach(updateMediaButton);
    }
    
    /**
     * Update a media button to use the unified selector
     */
    function updateMediaButton(button) {
        // Skip if already processed
        if (button.hasAttribute('data-unified')) return;
        
        // Mark as processed
        button.setAttribute('data-unified', 'true');
        
        // Remove existing click listeners and add our own
        button.replaceWith(button.cloneNode(true));
        
        // Get the newly cloned button
        const newButton = document.querySelector(`[data-unified="true"]:not([data-unified-processed])`);
        if (!newButton) return;
        
        // Mark as processed to avoid reprocessing
        newButton.setAttribute('data-unified-processed', 'true');
        
        // Add click listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetInput = this.getAttribute('data-target-input') || 
                             this.getAttribute('data-target') || 
                             'media-input';
            
            window.openMediaLibrary(targetInput);
        });
    }
    
    /**
     * Sync media data periodically and detect folder changes
     */
    function syncMediaData() {
        // Only run if we're on a page with media selectors
        const hasMediaComponents = document.querySelector(
            '.media-library-button, .email-media-select-button, .media-select-btn, ' + 
            '.media-library, .media-grid, .media-items-container'
        );
        
        if (!hasMediaComponents) return;
        
        // Check if we're in the Media Library section
        const inMediaLibrary = document.querySelector('.media-library-section:not(.hidden), .media-management:not(.hidden)');
        
        // Check if we're in the Email section
        const inEmailSection = document.querySelector('.email-management-section:not(.hidden)');
        
        // Get current media data from storage
        let currentMediaItems = [];
        try {
            const storedData = localStorage.getItem('fooodis_unified_media');
            if (storedData) {
                currentMediaItems = JSON.parse(storedData);
            }
        } catch (e) {
            console.error('Unified Media Selector: Error loading current media data', e);
        }
        
        if (inMediaLibrary) {
            // We're in the Media Library section, so scrape the DOM for fresh data
            const scrapedItems = scrapeMediaItemsFromDOM();
            if (scrapedItems.length > 0) {
                // Check for folder changes by comparing with existing data
                const updatedItems = syncFolderChanges(currentMediaItems, scrapedItems);
                
                try {
                    const mediaItemsString = JSON.stringify(updatedItems);
                    localStorage.setItem('fooodis_unified_media', mediaItemsString);
                    localStorage.setItem('fooodis_media_items', mediaItemsString);
                    localStorage.setItem('fooodis_main_media_library', mediaItemsString);
                    localStorage.setItem('media_library_items', mediaItemsString);
                    
                    console.log(`Unified Media Selector: Synced ${updatedItems.length} items with updated folder information`);
                } catch (e) {
                    console.error('Unified Media Selector: Error saving updated media data', e);
                }
            }
        } else if (inEmailSection) {
            // We're in the Email section, make sure we're using the unified data
            unifyMediaData();
            
            // Force refresh the Email media selector if it's open
            if (document.querySelector('.media-selector-modal, .media-selection-modal, .email-media-selector-modal')) {
                console.log('Unified Media Selector: Refreshing open Email media selector');
                refreshOpenMediaSelector();
            }
        }
    }
    
    /**
     * Sync folder changes between current and newly scraped data
     * @param {Array} currentItems - Current media items from storage
     * @param {Array} newItems - Newly scraped media items
     * @returns {Array} Updated media items with correct folder information
     */
    function syncFolderChanges(currentItems, newItems) {
        console.log('Unified Media Selector: Checking for folder changes');
        
        // If we don't have current items, just use the new items
        if (!currentItems || currentItems.length === 0) {
            return newItems;
        }
        
        // Create a map of current items by id for quick lookup
        const currentItemsMap = {};
        currentItems.forEach(item => {
            if (item.id) {
                currentItemsMap[item.id] = item;
            }
        });
        
        // Create a map of current items by name as fallback
        const currentItemsByName = {};
        currentItems.forEach(item => {
            if (item.name) {
                currentItemsByName[item.name] = item;
            }
        });
        
        // Go through new items and update folder information
        const updatedItems = newItems.map(newItem => {
            // Try to find matching item by id
            const matchById = currentItemsMap[newItem.id];
            
            if (matchById) {
                // Check if folder has changed
                if (matchById.folder !== newItem.folder) {
                    console.log(`Unified Media Selector: Folder change detected for ${newItem.name} (${matchById.folder} → ${newItem.folder})`);
                }
                
                // Keep new folder assignment
                return {
                    ...matchById,
                    folder: newItem.folder
                };
            }
            
            // Try to find by name as fallback
            const matchByName = currentItemsByName[newItem.name];
            
            if (matchByName) {
                // Check if folder has changed
                if (matchByName.folder !== newItem.folder) {
                    console.log(`Unified Media Selector: Folder change detected for ${newItem.name} (${matchByName.folder} → ${newItem.folder})`);
                }
                
                // Keep new folder assignment but preserve other metadata
                return {
                    ...matchByName,
                    folder: newItem.folder
                };
            }
            
            // No match found, this is a new item
            return newItem;
        });
        
        return updatedItems;
    }
    
    /**
     * Refresh an open media selector with latest data
     */
    /**
     * Detect folder changes and update data accordingly
     */
    function detectFolderChanges() {
        // Only check when we're in the Media Library section to avoid unnecessary processing
        const inMediaLibrary = document.querySelector('.media-library-section:not(.hidden), .media-management:not(.hidden)');
        if (!inMediaLibrary) return;
        
        // Look for folder change indicators in the DOM
        const folderOperationIndicators = document.querySelectorAll('[data-folder-operation]');
        folderOperationIndicators.forEach(indicator => {
            const operation = indicator.getAttribute('data-folder-operation');
            const mediaId = indicator.getAttribute('data-media-id');
            const mediaName = indicator.getAttribute('data-media-name');
            const targetFolder = indicator.getAttribute('data-target-folder');
            
            if (operation && (mediaId || mediaName) && targetFolder) {
                const operationKey = `${operation}_${mediaId || mediaName}_${targetFolder}`;
                
                // Only process this operation if we haven't seen it before
                if (!folderOperations[operationKey]) {
                    console.log(`Unified Media Selector: Detected folder operation: ${operation} for ${mediaName || mediaId} to ${targetFolder}`);
                    
                    // Mark as processed
                    folderOperations[operationKey] = true;
                    
                    // Force a full media data refresh
                    unifyMediaData();
                    
                    // Force refresh any open Email media selectors
                    refreshOpenMediaSelector();
                }
            }
        });
        
        // Also look for direct folder changes in the DOM structure
        const mediaItems = document.querySelectorAll('.media-item, .media-library-item, .media-grid-item');
        
        // Get current data from storage
        let currentMediaItems = [];
        try {
            const storedData = localStorage.getItem('fooodis_unified_media');
            if (storedData) {
                currentMediaItems = JSON.parse(storedData);
            }
        } catch (e) {
            return; // Can't compare if we can't load current data
        }
        
        // Create a map of current items by id and by name
        const currentItemsById = {};
        const currentItemsByName = {};
        currentMediaItems.forEach(item => {
            if (item.id) currentItemsById[item.id] = item;
            if (item.name) currentItemsByName[item.name] = item;
        });
        
        // Check each media item in the DOM for folder changes
        let folderChangesDetected = false;
        mediaItems.forEach(element => {
            const id = element.getAttribute('data-id');
            const name = element.getAttribute('data-name');
            const folder = element.getAttribute('data-folder');
            
            if ((id || name) && folder) {
                // Look up this item in our current data
                const currentItem = id ? currentItemsById[id] : currentItemsByName[name];
                
                if (currentItem && currentItem.folder !== folder) {
                    console.log(`Unified Media Selector: Detected folder change in DOM for ${name || id}: ${currentItem.folder} → ${folder}`);
                    folderChangesDetected = true;
                    
                    // Update this item in our maps
                    if (id) currentItemsById[id].folder = folder;
                    if (name) currentItemsByName[name].folder = folder;
                }
            }
        });
        
        if (folderChangesDetected) {
            // Update storage with the modified data
            try {
                // Rebuild the array from our updated maps
                const updatedItems = Object.values(currentItemsById); 
                const mediaItemsString = JSON.stringify(updatedItems);
                
                localStorage.setItem('fooodis_unified_media', mediaItemsString);
                localStorage.setItem('fooodis_media_items', mediaItemsString);
                localStorage.setItem('fooodis_main_media_library', mediaItemsString);
                localStorage.setItem('media_library_items', mediaItemsString);
                
                // Refresh any open selectors
                refreshOpenMediaSelector();
            } catch (e) {
                console.error('Unified Media Selector: Error saving updated media data', e);
            }
        }
    }
    
    /**
     * Set up listeners for folder change operations
     */
    function detectAndListenForFolderOperations() {
        // Look for folder change UI elements
        const folderDropdowns = document.querySelectorAll('.folder-dropdown, .media-folder-dropdown, .move-to-folder-dropdown');
        
        folderDropdowns.forEach(dropdown => {
            // Remove existing listeners to avoid duplicates
            const newDropdown = dropdown.cloneNode(true);
            dropdown.parentNode.replaceChild(newDropdown, dropdown);
            
            // Add change listener
            newDropdown.addEventListener('change', function(e) {
                const selectedFolder = e.target.value;
                const mediaItem = e.target.closest('.media-item, .media-library-item, .media-grid-item');
                
                if (mediaItem && selectedFolder) {
                    const mediaId = mediaItem.getAttribute('data-id');
                    const mediaName = mediaItem.getAttribute('data-name');
                    
                    console.log(`Unified Media Selector: Folder dropdown changed for ${mediaName || mediaId} to ${selectedFolder}`);
                    
                    // Create a temporary indicator that our detection function can find
                    const indicator = document.createElement('div');
                    indicator.style.display = 'none';
                    indicator.setAttribute('data-folder-operation', 'move');
                    indicator.setAttribute('data-media-id', mediaId || '');
                    indicator.setAttribute('data-media-name', mediaName || '');
                    indicator.setAttribute('data-target-folder', selectedFolder);
                    indicator.className = 'folder-operation-indicator';
                    document.body.appendChild(indicator);
                    
                    // Remove the indicator after a short time
                    setTimeout(() => indicator.remove(), 5000);
                    
                    // Force immediate sync
                    detectFolderChanges();
                }
            });
        });
        
        // Look for move to folder buttons
        const moveButtons = document.querySelectorAll('.move-to-folder-btn, .change-folder-btn, .folder-move-btn');
        
        moveButtons.forEach(button => {
            // Remove existing listeners to avoid duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add click listener
            newButton.addEventListener('click', function(e) {
                console.log('Unified Media Selector: Move to folder button clicked');
                
                // Set a timeout to detect the change after the modal opens and user selects a folder
                setTimeout(detectFolderChanges, 500);
                setTimeout(detectFolderChanges, 2000);
                setTimeout(detectFolderChanges, 5000);
            });
        });
        
        // Set up a MutationObserver to detect folder changes in the DOM
        const observer = new MutationObserver(mutations => {
            let shouldCheckFolders = false;
            
            mutations.forEach(mutation => {
                // Check for data-folder attribute changes
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-folder') {
                    shouldCheckFolders = true;
                }
                
                // Check for added nodes that might indicate folder changes
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1 && (
                            node.classList.contains('folder-changed-indicator') ||
                            node.classList.contains('media-updated') ||
                            node.hasAttribute('data-folder-updated')
                        )) {
                            shouldCheckFolders = true;
                        }
                    });
                }
            });
            
            if (shouldCheckFolders) {
                detectFolderChanges();
            }
        });
        
        // Start observing the entire document for folder change indicators
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-folder'],
            childList: true,
            subtree: true
        });
        
        console.log('Unified Media Selector: Set up folder change detection');
    }
    
    function refreshOpenMediaSelector() {
        // Find any open media selector modals
        const openModals = document.querySelectorAll('.media-selector-modal, .media-selection-modal, .email-media-selector-modal');
        
        if (openModals.length === 0) return;
        
        // Get latest media data
        let mediaItems = [];
        try {
            const data = localStorage.getItem('fooodis_unified_media');
            if (data) {
                mediaItems = JSON.parse(data);
            }
        } catch (e) {
            console.error('Unified Media Selector: Error loading media data for refresh', e);
            return;
        }
        
        if (mediaItems.length === 0) return;
        
        // Extract all unique folders from media items
        const uniqueFolders = extractUniqueFolders(mediaItems);
        
        // For each open modal, refresh the media grid
        openModals.forEach(modal => {
            // Find the media grid container
            const mediaGrid = modal.querySelector('.media-grid, .media-items-container');
            if (!mediaGrid) return;
            
            // Rebuild the folder list first
            rebuildFolderList(modal, uniqueFolders, mediaItems);
            
            // Store current active folder and tab
            const activeFolder = modal.querySelector('.folder.active, .media-folder.active');
            const folderType = activeFolder ? (activeFolder.getAttribute('data-folder') || 'all') : 'all';
            
            const activeTab = modal.querySelector('.tab.active, .media-tab.active');
            const tabType = activeTab ? (activeTab.getAttribute('data-tab') || activeTab.getAttribute('data-type') || 'all') : 'all';
            
            // Clear grid
            mediaGrid.innerHTML = '<div class="loading-media">Refreshing media...</div>';
            
            // Short timeout to show loading indicator
            setTimeout(() => {
                // Clear grid
                mediaGrid.innerHTML = '';
                
                // Filter items by folder and tab
                let filteredItems = mediaItems;
                
                // Filter by folder
                if (folderType && folderType !== 'all') {
                    filteredItems = filteredItems.filter(item => item.folder === folderType);
                }
                
                // Filter by type
                if (tabType && tabType !== 'all') {
                    filteredItems = filteredItems.filter(item => item.type === tabType);
                }
                
                // Populate grid with filtered items
                filteredItems.forEach(item => {
                    const mediaItem = document.createElement('div');
                    mediaItem.className = 'media-item';
                    mediaItem.setAttribute('data-id', item.id);
                    mediaItem.setAttribute('data-name', item.name);
                    mediaItem.setAttribute('data-folder', item.folder || 'uncategorized');
                    mediaItem.setAttribute('data-type', item.type || 'image');
                    
                    const thumbnailDiv = document.createElement('div');
                    thumbnailDiv.className = 'media-thumbnail';
                    
                    const img = document.createElement('img');
                    
                    // Ensure image URL is properly formatted
                    let imageUrl = item.url;
                    
                    // Fix common URL issues
                    if (imageUrl && imageUrl.trim() !== '') {
                        // Add proper domain prefix if missing
                        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/') && !imageUrl.startsWith('data:')) {
                            imageUrl = '/' + imageUrl;
                        }
                        
                        // Make sure CSS image paths are correct
                        if (imageUrl.includes('css/images/') && !imageUrl.startsWith('/css/')) {
                            imageUrl = imageUrl.replace('css/images/', '/css/images/');
                        }
                    } else {
                        // Use a generic placeholder if URL is empty
                        imageUrl = '/css/images/placeholder.jpg';
                    }
                    
                    img.src = imageUrl;
                    img.alt = item.name;
                    
                    // Add error handling to show actual content on error
                    img.onerror = function() {
                        // Try alternate URL formats if the image fails to load
                        if (this.src !== '/css/images/' + item.name) {
                            this.src = '/css/images/' + item.name;
                        } else if (this.src !== '/images/' + item.name) {
                            this.src = '/images/' + item.name;
                        } else {
                            // Create a colored background with text as last resort
                            this.style.display = 'none';
                            
                            // Determine background color based on folder
                            let bgColor = '#5b7adb'; // Default blue for Food
                            if (item.folder === 'restaurant') {
                                bgColor = '#20c997'; // Teal for Restaurant
                            } else if (item.folder === 'people') {
                                bgColor = '#fd7e14'; // Orange for People
                            }
                            
                            // Create colored background with folder name
                            thumbnailDiv.style.backgroundColor = bgColor;
                            thumbnailDiv.style.display = 'flex';
                            thumbnailDiv.style.alignItems = 'center';
                            thumbnailDiv.style.justifyContent = 'center';
                            
                            const textEl = document.createElement('span');
                            textEl.textContent = item.folder ? item.folder.charAt(0).toUpperCase() + item.folder.slice(1) : 'Media';
                            textEl.style.color = '#fff';
                            textEl.style.fontWeight = 'bold';
                            thumbnailDiv.appendChild(textEl);
                        }
                    };
                    
                    thumbnailDiv.appendChild(img);
                    
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'media-info';
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.className = 'media-name';
                    nameDiv.textContent = item.name;
                    infoDiv.appendChild(nameDiv);
                    
                    mediaItem.appendChild(thumbnailDiv);
                    mediaItem.appendChild(infoDiv);
                    
                    // Add click handler
                    mediaItem.addEventListener('click', function() {
                        // Find the target input ID
                        const targetInput = modal.getAttribute('data-target-input') || 'media-input';
                        
                        // Select media and close modal
                        if (typeof window.selectMedia === 'function') {
                            window.selectMedia(item, targetInput);
                        } else {
                            // Basic selection
                            const input = document.getElementById(targetInput);
                            if (input) {
                                input.value = item.url;
                                
                                // Trigger change event
                                const event = new Event('change', { bubbles: true });
                                input.dispatchEvent(event);
                                
                                // Update any preview elements
                                updatePreviewElements(targetInput, item);
                            }
                        }
                        
                        // Close modal
                        modal.remove();
                    });
                    
                    mediaGrid.appendChild(mediaItem);
                });
                
                console.log(`Unified Media Selector: Refreshed media selector with ${filteredItems.length} items`);
            }, 300);
        });
    }
    
    /**
     * Extract unique folders from media items
     * @param {Array} mediaItems - Media items array
     * @returns {Array} Array of unique folder objects
     */
    function extractUniqueFolders(mediaItems) {
        console.log('Unified Media Selector: Extracting unique folders from media items');
        
        // Always include 'All Media' as the first option
        const folders = [
            { id: 'all', name: 'All Media', icon: 'fas fa-images' }
        ];
        
        // Extract unique folder values from media items
        const uniqueFolderNames = new Set();
        
        mediaItems.forEach(item => {
            if (item.folder && item.folder !== 'all') {
                uniqueFolderNames.add(item.folder);
            }
        });
        
        // Add 'Uncategorized' if it's not already included
        if (!uniqueFolderNames.has('uncategorized')) {
            uniqueFolderNames.add('uncategorized');
        }
        
        // Convert unique folder names to folder objects
        uniqueFolderNames.forEach(folderName => {
            // Map folder names to appropriate icons
            let icon = 'fas fa-folder';
            
            // Use specific icons for known folder types
            switch(folderName.toLowerCase()) {
                case 'food':
                    icon = 'fas fa-utensils';
                    break;
                case 'restaurant':
                    icon = 'fas fa-store';
                    break;
                case 'people':
                    icon = 'fas fa-users';
                    break;
                case 'uncategorized':
                    icon = 'fas fa-folder-open';
                    break;
                case 'test':
                    icon = 'fas fa-vial';
                    break;
            }
            
            folders.push({
                id: folderName,
                name: folderName.charAt(0).toUpperCase() + folderName.slice(1), // Capitalize first letter
                icon: icon
            });
        });
        
        console.log(`Unified Media Selector: Found ${folders.length - 1} unique folders (plus All Media)`);
        return folders;
    }
    
    console.log(`Unified Media Selector: Rebuilt folder list with ${folders.length} folders`);
}

/**
 * Update folder counts in sidebar
 * @param {HTMLElement} modal - The modal element
 * @param {Array} mediaItems - Media items array
 */
function updateFolderCounts(modal, mediaItems) {
    // Update folder counts if available
    const folderCountElements = modal.querySelectorAll('.folder-count');
    folderCountElements.forEach(countElement => {
        const folder = countElement.closest('.folder');
        if (folder) {
            const folderType = folder.getAttribute('data-folder');
            if (folderType) {
                // Count items in this folder
                let count = 0;
                if (folderType === 'all') {
                    count = mediaItems.length;
                } else {
                    count = mediaItems.filter(item => item.folder === folderType).length;
        // Clear the existing folder list
        folderListContainer.innerHTML = '';
        
        // Build the new folder list
        folders.forEach(folder => {
            // Count items in this folder
            let count = 0;
            if (folder.id === 'all') {
                count = mediaItems.length;
            } else {
                count = mediaItems.filter(item => item.folder === folder.id).length;
            }
            
            // Create folder element
            const folderElement = document.createElement('div');
            folderElement.className = 'folder' + (folder.id === activeFolderId ? ' active' : '');
            folderElement.setAttribute('data-folder', folder.id);
            
            folderElement.innerHTML = `
                <i class="${folder.icon}"></i>
                <span>${folder.name}</span>
                <span class="folder-count">${count}</span>
            `;
            
            // Add click event
            folderElement.addEventListener('click', function() {
                // Update active state
                const allFolders = folderListContainer.querySelectorAll('.folder');
                allFolders.forEach(f => f.classList.remove('active'));
                folderElement.classList.add('active');
                
                // Filter media items
                const mediaGrid = modal.querySelector('.media-grid, .media-items-container');
                if (mediaGrid) {
                    // Get current tab
                    const activeTab = modal.querySelector('.tab.active, .media-tab.active');
                    const tabType = activeTab ? (activeTab.getAttribute('data-tab') || activeTab.getAttribute('data-type') || 'all') : 'all';
                    
                    // Filter items
                    let filteredItems = mediaItems;
                    
                    // Filter by folder
                    if (folder.id !== 'all') {
                        filteredItems = filteredItems.filter(item => item.folder === folder.id);
                    }
                    
                    // Filter by type
                    if (tabType !== 'all') {
                        filteredItems = filteredItems.filter(item => item.type === tabType);
                    }
                    
                    // Clear grid
                    mediaGrid.innerHTML = '';
                    
                    // Add filtered items
                    filteredItems.forEach(item => {
                        const mediaItem = document.createElement('div');
                        mediaItem.className = 'media-item';
                        mediaItem.setAttribute('data-id', item.id);
                        mediaItem.setAttribute('data-name', item.name);
                        mediaItem.setAttribute('data-folder', item.folder || 'uncategorized');
                        mediaItem.setAttribute('data-type', item.type || 'image');
                        
                        const thumbnailDiv = document.createElement('div');
                        thumbnailDiv.className = 'media-thumbnail';
                        
                        const img = document.createElement('img');
                        
                        // Ensure image URL is properly formatted
                        let imageUrl = item.url;
                        
                        // Fix common URL issues
                        if (imageUrl && imageUrl.trim() !== '') {
                            // Add proper domain prefix if missing
                            if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/') && !imageUrl.startsWith('data:')) {
                                imageUrl = '/' + imageUrl;
                            }
                            
                            // Make sure CSS image paths are correct
                            if (imageUrl.includes('css/images/') && !imageUrl.startsWith('/css/')) {
                                imageUrl = imageUrl.replace('css/images/', '/css/images/');
                            }
                        } else {
                            // Use a generic placeholder if URL is empty
                            imageUrl = '/css/images/placeholder.jpg';
                        }
                        
                        img.src = imageUrl;
                        img.alt = item.name;
                        
                        // Add error handling to show actual content on error
                        img.onerror = function() {
                            // Try alternate URL formats if the image fails to load
                            if (this.src !== '/css/images/' + item.name) {
                                this.src = '/css/images/' + item.name;
                            } else if (this.src !== '/images/' + item.name) {
                                this.src = '/images/' + item.name;
                            } else {
                                // Create a colored background with text as last resort
                                this.style.display = 'none';
                                
                                // Determine background color based on folder
                                let bgColor = '#5b7adb'; // Default blue for Food
                                if (item.folder === 'restaurant') {
                                    bgColor = '#20c997'; // Teal for Restaurant
                                } else if (item.folder === 'people') {
                                    bgColor = '#fd7e14'; // Orange for People
                                }
                                
                                // Create colored background with folder name
                                thumbnailDiv.style.backgroundColor = bgColor;
                                thumbnailDiv.style.display = 'flex';
                                thumbnailDiv.style.alignItems = 'center';
                                thumbnailDiv.style.justifyContent = 'center';
                                
                                const textEl = document.createElement('span');
                                textEl.textContent = item.folder ? item.folder.charAt(0).toUpperCase() + item.folder.slice(1) : 'Media';
                                textEl.style.color = '#fff';
                                textEl.style.fontWeight = 'bold';
                                thumbnailDiv.appendChild(textEl);
                            }
                        };
                        
                        thumbnailDiv.appendChild(img);
                        
                        const infoDiv = document.createElement('div');
                        infoDiv.className = 'media-info';
                        
                        const nameDiv = document.createElement('div');
                        nameDiv.className = 'media-name';
                        nameDiv.textContent = item.name;
                        infoDiv.appendChild(nameDiv);
                        
                        mediaItem.appendChild(thumbnailDiv);
                        mediaItem.appendChild(infoDiv);
                        
                        // Add click handler
                        mediaItem.addEventListener('click', function() {
                            // Find the target input ID
                            const targetInput = modal.getAttribute('data-target-input') || 'media-input';
                            
                            // Select media and close modal
                            if (typeof window.selectMedia === 'function') {
                                window.selectMedia(item, targetInput);
                            } else {
                                // Basic selection
                                const input = document.getElementById(targetInput);
                                if (input) {
                                    input.value = item.url;
                                    
                                    // Trigger change event
                                    const event = new Event('change', { bubbles: true });
                                    input.dispatchEvent(event);
                                    
                                    // Update any preview elements
                                    updatePreviewElements(targetInput, item);
                                }
                            }
                            
                            // Close modal
                            modal.remove();
                        });
                        
                        mediaGrid.appendChild(mediaItem);
                    });
                }
            });
            
            folderListContainer.appendChild(folderElement);
        });
        
        console.log(`Unified Media Selector: Rebuilt folder list with ${folders.length} folders`);
    }
    
    /**
     * Update folder counts in sidebar
     * @param {HTMLElement} modal - The modal element
     * @param {Array} mediaItems - Media items array
     */
    function updateFolderCounts(modal, mediaItems) {
        // Update folder counts if available
        const folderCountElements = modal.querySelectorAll('.folder-count');
        folderCountElements.forEach(countElement => {
            const folder = countElement.closest('.folder');
            if (folder) {
                const folderType = folder.getAttribute('data-folder');
                if (folderType) {
                    // Count items in this folder
                    let count = 0;
                    if (folderType === 'all') {
                        count = mediaItems.length;
                    } else {
                        count = mediaItems.filter(item => item.folder === folderType).length;
                    }
                    countElement.textContent = count;
                }
            }
        });
    }
})();
