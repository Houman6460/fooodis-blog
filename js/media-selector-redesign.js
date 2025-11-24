/**
 * Media Selector Redesign
 * Implements dark-themed media selector matching the sample image
 */

(function() {
    // Track initialization
    let initialized = false;
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Media Selector Redesign: Initializing');
        
        // Override any existing media selectors
        overrideExistingMediaSelectors();
        
        // Add event listeners for all media selection buttons
        setupEventListeners();
        
        // Add styles
        injectStyles();
        
        // Restore previously selected media in Email Subscribers section
        restorePreviousSelections();
        
        // Monitor for dynamically added media selector buttons
        observeDynamicElements();
    }
    
    /**
     * Override existing media selectors
     */
    function overrideExistingMediaSelectors() {
        // Find and override any existing openMediaLibrary functions
        if (window.openMediaLibrary) {
            console.log('Media Selector Redesign: Overriding existing openMediaLibrary function');
            window.originalOpenMediaLibrary = window.openMediaLibrary;
            window.openMediaLibrary = openMediaSelector;
        }
        
        // Find and override any existing media-related functions
        if (window.openEnhancedMediaSelector) {
            console.log('Media Selector Redesign: Overriding existing openEnhancedMediaSelector function');
            window.originalOpenEnhancedMediaSelector = window.openEnhancedMediaSelector;
            window.openEnhancedMediaSelector = openMediaSelector;
        }
    }
    
    /**
     * Set up event listeners for media buttons
     */
    function setupEventListeners() {
        // Use event delegation for all media buttons
        document.addEventListener('click', function(event) {
            const mediaButton = event.target.closest('.media-library-button, .email-media-select-button, .media-select-btn');
            if (!mediaButton) return;
            
            event.preventDefault();
            event.stopPropagation();
            
            const targetInput = mediaButton.getAttribute('data-target-input') || 
                              mediaButton.getAttribute('data-target') || 
                              'media-input';
            
            openMediaSelector(targetInput);
        });
        
        // Remove any existing media selection modals
        removeExistingMediaSelectors();
    }
    
    /**
     * Remove existing media selectors to avoid conflicts
     */
    function removeExistingMediaSelectors() {
        const existingModals = document.querySelectorAll('.email-media-selector-modal, .media-selection-modal, .media-library-modal');
        existingModals.forEach(modal => modal.remove());
    }
    
    /**
     * Open the redesigned media selector
     * @param {string} targetInputId - ID of the target input
     */
    function openMediaSelector(targetInputId) {
        console.log('Media Selector Redesign: Opening media selector for', targetInputId);
        
        // Remove any existing media selector modals
        removeExistingMediaSelectors();
        
        // Create the media selector modal
        const modal = document.createElement('div');
        modal.className = 'media-selector-modal';
        modal.innerHTML = `
            <div class="media-selector-content">
                <div class="media-selector-header">
                    <h2>Select Media</h2>
                    <button class="media-selector-close">&times;</button>
                </div>
                <div class="media-selector-body">
                    <div class="media-selector-sidebar">
                        <div class="search-container">
                            <input type="text" class="media-search" placeholder="Search media...">
                        </div>
                        <div class="folders-header">FOLDERS</div>
                        <div class="folders-list">
                            <div class="folder active" data-folder="all">
                                <i class="fas fa-images"></i>
                                <span>All Media</span>
                                <span class="folder-count">9</span>
                            </div>
                            <div class="folder" data-folder="uncategorized">
                                <i class="fas fa-folder"></i>
                                <span>Uncategorized</span>
                                <span class="folder-count">3</span>
                            </div>
                            <div class="folder" data-folder="food">
                                <i class="fas fa-utensils"></i>
                                <span>Food</span>
                                <span class="folder-count">0</span>
                            </div>
                            <div class="folder" data-folder="restaurant">
                                <i class="fas fa-store"></i>
                                <span>Restaurant</span>
                                <span class="folder-count">0</span>
                            </div>
                            <div class="folder" data-folder="people">
                                <i class="fas fa-users"></i>
                                <span>People</span>
                                <span class="folder-count">0</span>
                            </div>
                            <div class="folder" data-folder="test">
                                <i class="fas fa-vial"></i>
                                <span>Test</span>
                                <span class="folder-count">0</span>
                            </div>
                        </div>
                    </div>
                    <div class="media-selector-content-area">
                        <div class="media-selector-tabs">
                            <button class="tab active" data-tab="all">All Media</button>
                            <button class="tab" data-tab="images">Images</button>
                            <button class="tab" data-tab="videos">Videos</button>
                        </div>
                        <div class="media-grid"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(modal);
        
        // Set up event listeners
        setupModalEventListeners(modal, targetInputId);
        
        // Load media items
        loadMediaItems(modal.querySelector('.media-grid'), targetInputId);
    }
    
    /**
     * Set up event listeners for the modal
     * @param {HTMLElement} modal - The modal element
     * @param {string} targetInputId - ID of the target input
     */
    function setupModalEventListeners(modal, targetInputId) {
        // Close button
        const closeButton = modal.querySelector('.media-selector-close');
        closeButton.addEventListener('click', function() {
            modal.remove();
        });
        
        // Folder selection
        const folders = modal.querySelectorAll('.folder');
        folders.forEach(folder => {
            folder.addEventListener('click', function() {
                // Update active folder
                folders.forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                
                // Filter media items
                const folderType = folder.getAttribute('data-folder');
                filterMediaItems(modal, folderType, 'all');
            });
        });
        
        // Tab selection
        const tabs = modal.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Filter media items
                const tabType = tab.getAttribute('data-tab');
                const activeFolder = modal.querySelector('.folder.active');
                const folderType = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
                filterMediaItems(modal, folderType, tabType);
            });
        });
        
        // Search functionality
        const searchInput = modal.querySelector('.media-search');
        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();
            filterMediaBySearch(modal, searchTerm);
        });
    }
    
    /**
     * Filter media items by folder and tab
     * @param {HTMLElement} modal - The modal element
     * @param {string} folder - Folder name
     * @param {string} tab - Tab name
     */
    function filterMediaItems(modal, folder, tab) {
        const mediaItems = modal.querySelectorAll('.media-item');
        
        mediaItems.forEach(item => {
            const itemFolder = item.getAttribute('data-folder') || 'uncategorized';
            const itemType = item.getAttribute('data-type') || 'image';
            
            const folderMatch = folder === 'all' || itemFolder === folder;
            const tabMatch = tab === 'all' || itemType === tab;
            
            item.style.display = folderMatch && tabMatch ? 'block' : 'none';
        });
    }
    
    /**
     * Filter media items by search term
     * @param {HTMLElement} modal - The modal element
     * @param {string} searchTerm - Search term
     */
    function filterMediaBySearch(modal, searchTerm) {
        const mediaItems = modal.querySelectorAll('.media-item');
        
        mediaItems.forEach(item => {
            const itemName = item.getAttribute('data-name').toLowerCase();
            item.style.display = itemName.includes(searchTerm) ? 'block' : 'none';
        });
    }
    
    /**
     * Load media items into the grid
     * @param {HTMLElement} container - Container for media items
     * @param {string} targetInputId - ID of the target input
     */
    function loadMediaItems(container, targetInputId) {
        // Clear container
        container.innerHTML = '';
        
        // Try to load media items from localStorage first
        let mediaItems = [];
        try {
            const storedMedia = localStorage.getItem('fooodis_media_items');
            if (storedMedia) {
                mediaItems = JSON.parse(storedMedia);
                console.log('Media Selector: Loaded media items from localStorage', mediaItems.length);
            }
        } catch (e) {
            console.error('Media Selector: Error loading media from localStorage', e);
        }
        
        // If no stored media or empty array, use our demo items
        if (!mediaItems || mediaItems.length === 0) {
            console.log('Media Selector: Using demo media items');
            
            // Create demo items with embedded data URI placeholders as backup
            const genericPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+TWVkaWEgSW1hZ2U8L3RleHQ+PC9zdmc+';
            const coffeeIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+Q29mZmVlPC90ZXh0Pjwvc3ZnPg==';
            const teaIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+VGVhPC90ZXh0Pjwvc3ZnPg==';
            const foodIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+Rm9vZDwvdGV4dD48L3N2Zz4=';
            const restaurantIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+UmVzdGF1cmFudDwvdGV4dD48L3N2Zz4=';
            const peopleIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+UGVvcGxlPC90ZXh0Pjwvc3ZnPg==';
            
            mediaItems = [
                { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image', url: 'css/images/cappuccino-or-latte-coffee-with-heart-art.jpg', dataUrl: coffeeIcon },
                { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image', url: 'css/images/japanese-tea-2024-04-08-18-06-00-utc.jpg', dataUrl: teaIcon },
                { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image', url: 'css/images/white-cup-of-tasty-cappuccino.jpg', dataUrl: coffeeIcon },
                { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image', url: 'css/images/hot-coffee-latte-art-on-wooden-table.jpg', dataUrl: coffeeIcon },
                { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image', url: 'css/images/appetizing-soup-served-with-herbs.jpg', dataUrl: foodIcon },
                { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image', url: 'css/images/restaurant-interior.jpg', dataUrl: restaurantIcon },
                { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image', url: 'css/images/chef-cooking.jpg', dataUrl: peopleIcon },
                { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image', url: 'css/images/chef-decorating.jpg', dataUrl: peopleIcon },
                { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image', url: 'css/images/a-full-bag-of-brown-coffee-beans.jpg', dataUrl: coffeeIcon }
            ];
            
            // Save these items to localStorage for future use
            try {
                localStorage.setItem('fooodis_media_items', JSON.stringify(mediaItems));
            } catch (e) {
                console.error('Media Selector: Error saving media to localStorage', e);
            }
        }
        
        // Create media items
        mediaItems.forEach(item => {
            // Ensure the URL is valid and has the correct path
            if (!item.url || item.url.trim() === '') {
                item.url = 'css/images/placeholder.jpg';
            } else if (!item.url.startsWith('http') && !item.url.startsWith('data:') && !item.url.startsWith('css/')) {
                // Add prefix if needed
                item.url = 'css/images/' + item.url.split('/').pop();
            }
            
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder || 'uncategorized');
            mediaItem.setAttribute('data-type', item.type || 'image');
            mediaItem.setAttribute('data-url', item.url);
            
            // Create safe image URL with data URI fallback to ensure something always shows
            const safeImageUrl = item.url || 'css/images/placeholder.jpg';
            
            // Create a simple fallback that doesn't rely on template literals
            const shortName = item.name.substring(0, 15);
            const fallbackImageUrl = item.dataUrl || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+SW1hZ2U8L3RleHQ+PC9zdmc+`;
            
            // Create an element structure that takes advantage of our CSS fallbacks
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'media-thumbnail';
            thumbnailDiv.setAttribute('data-name', item.name.substring(0, 15)); // For ::after content
            thumbnailDiv.setAttribute('data-folder', item.folder || 'uncategorized');
            
            // Create img element - the CSS will handle fallback styling
            const img = document.createElement('img');
            img.src = safeImageUrl;
            img.alt = item.name;
            img.onerror = function() {
                // If image fails to load, remove the src to trigger CSS fallback
                this.onerror = null;
                this.src = '';
            };
            
            thumbnailDiv.appendChild(img);
            
            // Create info div
            const infoDiv = document.createElement('div');
            infoDiv.className = 'media-info';
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'media-name';
            nameDiv.textContent = item.name;
            infoDiv.appendChild(nameDiv);
            
            const metaDiv = document.createElement('div');
            metaDiv.className = 'media-meta';
            
            const typeSpan = document.createElement('span');
            typeSpan.className = 'media-type';
            typeSpan.textContent = item.type || 'image';
            metaDiv.appendChild(typeSpan);
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'media-size';
            sizeSpan.textContent = '0 Bytes';
            metaDiv.appendChild(sizeSpan);
            
            infoDiv.appendChild(metaDiv);
            
            // Clear and append to media item
            mediaItem.innerHTML = '';
            mediaItem.appendChild(thumbnailDiv);
            mediaItem.appendChild(infoDiv);
            
            // Add click handler
            mediaItem.addEventListener('click', function() {
                selectMedia(item, targetInputId);
                document.querySelector('.media-selector-modal').remove();
            });
            
            container.appendChild(mediaItem);
        });
        
        // Update folder counts
        updateFolderCounts(mediaItems);
    }
    
    /**
     * Update folder counts in the sidebar
     * @param {Array} mediaItems - Media items array
     */
    function updateFolderCounts(mediaItems) {
        const modal = document.querySelector('.media-selector-modal');
        if (!modal) return;
        
        // Get all folders
        const folders = modal.querySelectorAll('.folder');
        
        // Count media items per folder
        const counts = {
            all: mediaItems.length,
            uncategorized: 0,
            food: 0,
            restaurant: 0,
            people: 0,
            test: 0
        };
        
        // Count items in each folder
        mediaItems.forEach(item => {
            const folder = item.folder || 'uncategorized';
            if (counts.hasOwnProperty(folder)) {
                counts[folder]++;
            } else {
                counts[folder] = 1; // New folder type
            }
        });
        
        // Update folder counts in UI
        folders.forEach(folder => {
            const folderType = folder.getAttribute('data-folder');
            const countSpan = folder.querySelector('.folder-count');
            if (countSpan && counts.hasOwnProperty(folderType)) {
                countSpan.textContent = counts[folderType];
            }
        });
    }
    
    /**
     * Select a media item
     * @param {Object} media - Media item
     * @param {string} targetInputId - Target input ID
     */
    function selectMedia(media, targetInputId) {
        console.log('Media Selector Redesign: Selected media', media.name, 'for', targetInputId);
        
        // Find target input
        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) {
            console.error('Target input not found:', targetInputId);
            return;
        }
        
        // Check if we're in the Email Subscribers section
        const isEmailSection = targetInput.closest('#email-management-section') !== null || 
                               targetInput.id === 'popupBackgroundImage' || 
                               targetInput.id === 'popupLogoImage';
        
        // Update input value
        if (targetInput.type === 'file') {
            // Create a hidden input with the media ID
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = targetInput.name + '_media_id';
            hiddenInput.value = media.id;
            hiddenInput.dataset.url = media.url;
            
            // Add after the target input
            targetInput.parentNode.insertBefore(hiddenInput, targetInput.nextSibling);
            
            // Add selection feedback
            const feedback = document.createElement('div');
            feedback.className = 'media-selection-feedback';
            feedback.innerHTML = `Selected: ${media.name}`;
            
            // Add after the hidden input
            targetInput.parentNode.insertBefore(feedback, hiddenInput.nextSibling);
            
            // Hide the file input
            targetInput.style.display = 'none';
        } else {
            // For other input types, set the value to the URL
            targetInput.value = media.url;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            targetInput.dispatchEvent(event);
        }
        
        // Update preview images if any
        updatePreviewImages(targetInput, media);
        
        // Special handling for Email Subscribers section
        if (isEmailSection) {
            // If we're in the email section, update the popup preview if it exists
            updateEmailPopupPreview(targetInput, media);
            
            // Store the selected media in localStorage for persistence
            storeEmailMediaSelection(targetInput.id, media);
        }
    }
    
    /**
     * Update preview images
     * @param {HTMLElement} input - Input element
     * @param {Object} media - Media object
     */
    function updatePreviewImages(input, media) {
        // Find nearby preview containers
        const container = input.closest('.form-group') || 
                          input.closest('.input-group') || 
                          input.closest('.media-container') || 
                          input.parentNode;
        
        if (!container) return;
        
        // Look for preview elements
        const previews = container.querySelectorAll('.preview, .image-preview, .media-preview');
        
        previews.forEach(preview => {
            if (preview.tagName === 'IMG') {
                preview.src = media.url;
                preview.alt = media.name;
                preview.style.display = 'block';
            } else {
                // If it's a container, look for or create an image inside
                let previewImg = preview.querySelector('img');
                
                if (!previewImg) {
                    previewImg = document.createElement('img');
                    preview.innerHTML = '';
                    preview.appendChild(previewImg);
                }
                
                previewImg.src = media.url;
                previewImg.alt = media.name;
                previewImg.style.display = 'block';
                preview.style.display = 'block';
            }
        });
    }
    
    /**
     * Update the Email popup preview with selected media
     * @param {HTMLElement} input - Input element
     * @param {Object} media - Media object
     */
    function updateEmailPopupPreview(input, media) {
        // Safety check - ensure we have valid media URLs
        // Use the dataUrl fallback if provided, otherwise create a generic one
        const safeUrl = media.dataUrl || 
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgZmlsbD0iI2FhYSI+SW1hZ2U8L3RleHQ+PC9zdmc+';;
        
        // Function to safely set background image with error handling
        const setBackgroundSafely = (element, url) => {
            try {
                // First set a solid background color as fallback
                element.style.backgroundColor = '#333';
                
                // Try to set the image
                element.style.backgroundImage = `url(${url})`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                
                // Create a test image to verify URL loads properly
                const testImg = new Image();
                testImg.onerror = () => {
                    // If URL fails, create a simple gradient background as fallback
                    element.style.backgroundImage = 'linear-gradient(135deg, #333 25%, #444 25%, #444 50%, #333 50%, #333 75%, #444 75%, #444 100%)';
                    element.style.backgroundSize = '40px 40px';
                    
                    // Add a label for better context
                    if (!element.querySelector('.background-placeholder-label')) {
                        const label = document.createElement('div');
                        label.className = 'background-placeholder-label';
                        label.textContent = 'Background Image';
                        label.style.position = 'absolute';
                        label.style.top = '50%';
                        label.style.left = '50%';
                        label.style.transform = 'translate(-50%, -50%)';
                        label.style.color = '#eee';
                        label.style.fontSize = '14px';
                        label.style.fontWeight = 'bold';
                        label.style.padding = '10px 15px';
                        label.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        label.style.borderRadius = '4px';
                        element.style.position = 'relative';
                        element.appendChild(label);
                    }
                };
                testImg.src = url;
            } catch (e) {
                console.error('Error setting background image:', e);
                element.style.backgroundColor = '#333';
                element.style.backgroundImage = 'none';
            }
        };
        
        // Check which input we're updating
        if (input.id === 'popupBackgroundImage') {
            // Update background image in the preview
            const previewContainer = document.querySelector('.popup-preview');
            if (previewContainer) {
                setBackgroundSafely(previewContainer, media.url);
            }
            
            // Also update any preview in the editor
            const popupPreview = document.querySelector('.email-popup-preview');
            if (popupPreview) {
                setBackgroundSafely(popupPreview, media.url);
            }
        } else if (input.id === 'popupLogoImage') {
            // Update logo image in the preview
            const logoPreview = document.querySelector('.popup-logo img, .email-popup-logo img');
            if (logoPreview) {
                logoPreview.src = media.url;
                logoPreview.onerror = function() {
                    this.onerror = null;
                    this.src = safeUrl;
                };
                logoPreview.style.display = 'block';
            }
            
            // If there's no img element yet, create one
            const logoContainer = document.querySelector('.popup-logo, .email-popup-logo');
            if (logoContainer && !logoContainer.querySelector('img')) {
                const img = document.createElement('img');
                img.src = media.url;
                img.onerror = function() {
                    this.onerror = null;
                    this.src = safeUrl;
                };
                img.alt = 'Logo';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                logoContainer.appendChild(img);
            }
        }
        
        // If there's a live email popup preview function, call it
        if (typeof updateEmailPopupLivePreview === 'function') {
            try {
                updateEmailPopupLivePreview();
            } catch (e) {
                console.error('Error updating email popup live preview:', e);
            }
        }
    }
    
    /**
     * Store the email media selection in localStorage for persistence
     * @param {string} inputId - Input ID
     * @param {Object} media - Media object
     */
    function storeEmailMediaSelection(inputId, media) {
        try {
            // Get existing email media selections
            let emailMediaSelections = {};
            const stored = localStorage.getItem('fooodis_email_media_selections');
            if (stored) {
                emailMediaSelections = JSON.parse(stored);
            }
            
            // Update with the new selection
            emailMediaSelections[inputId] = {
                id: media.id,
                name: media.name,
                url: media.url,
                type: media.type,
                folder: media.folder,
                timestamp: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('fooodis_email_media_selections', JSON.stringify(emailMediaSelections));
            
            console.log('Media Selector: Saved email media selection for', inputId);
        } catch (e) {
            console.error('Error storing email media selection:', e);
        }
    }
    
    /**
     * Restore previously selected media in Email Subscribers section
     */
    function restorePreviousSelections() {
        try {
            // Get saved selections from localStorage
            const stored = localStorage.getItem('fooodis_email_media_selections');
            if (!stored) return;
            
            const selections = JSON.parse(stored);
            console.log('Media Selector: Restoring previous selections', selections);
            
            // Process each selection
            Object.keys(selections).forEach(inputId => {
                const media = selections[inputId];
                const input = document.getElementById(inputId);
                
                if (input) {
                    // Set the input value
                    input.value = media.url;
                    
                    // Update preview images
                    updateEmailPopupPreview(input, media);
                    updatePreviewImages(input, media);
                }
            });
        } catch (e) {
            console.error('Error restoring previous selections:', e);
        }
    }
    
    /**
     * Observe for dynamically added media selector buttons
     */
    function observeDynamicElements() {
        // Create a MutationObserver to watch for dynamically added media selector buttons
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if the added node is an element and has media selector buttons
                        if (node.nodeType === 1) {
                            const buttons = node.querySelectorAll('.media-library-button, .email-media-select-button, .media-select-btn');
                            
                            if (buttons.length > 0) {
                                console.log('Media Selector: Detected dynamically added media buttons', buttons.length);
                                
                                // Add event listeners to these buttons
                                buttons.forEach(button => {
                                    button.addEventListener('click', function(event) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        
                                        const targetInput = button.getAttribute('data-target-input') || 
                                                        button.getAttribute('data-target') || 
                                                        'media-input';
                                        
                                        openMediaSelector(targetInput);
                                    });
                                });
                            }
                            
                            // If this is the email management section, check for popup customization form
                            if (node.id === 'email-management-section' || node.querySelector('#popupConfigForm')) {
                                console.log('Media Selector: Detected email management section');
                                
                                // Restore previously selected media
                                setTimeout(restorePreviousSelections, 500);
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Inject the CSS styles for the media selector
     */
    function injectStyles() {
        if (document.getElementById('media-selector-redesign-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'media-selector-redesign-styles';
        styles.textContent = `
            /* Media Selector Modal */
            .media-selector-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }
            
            .media-selector-content {
                display: flex;
                flex-direction: column;
                width: 90%;
                max-width: 1200px;
                height: 90%;
                max-height: 800px;
                background-color: #1a1a1a;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            }
            
            .media-selector-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                background-color: #1e1e1e;
            }
            
            .media-selector-header h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 500;
                color: #fff;
            }
            
            .media-selector-close {
                background: none;
                border: none;
                color: #999;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin: 0;
                height: 24px;
                width: 24px;
                line-height: 24px;
                transition: color 0.2s;
            }
            
            .media-selector-close:hover {
                color: #fff;
            }
            
            .media-selector-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            /* Sidebar */
            .media-selector-sidebar {
                width: 250px;
                background-color: #1e1e1e;
                border-right: 1px solid #333;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .search-container {
                padding: 15px;
                border-bottom: 1px solid #333;
            }
            
            .media-search {
                width: 100%;
                padding: 8px 12px;
                background-color: #2a2a2a;
                border: 1px solid #444;
                border-radius: 4px;
                color: #fff;
                font-size: 14px;
            }
            
            .media-search::placeholder {
                color: #888;
            }
            
            .folders-header {
                padding: 12px 15px;
                font-size: 12px;
                font-weight: 600;
                color: #888;
                letter-spacing: 1px;
            }
            
            .folders-list {
                flex: 1;
                overflow-y: auto;
            }
            
            .folder {
                padding: 10px 15px;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .folder:hover {
                background-color: #2a2a2a;
            }
            
            .folder.active {
                background-color: #333;
            }
            
            .folder i {
                width: 20px;
                text-align: center;
                margin-right: 10px;
                color: #999;
            }
            
            .folder span {
                flex: 1;
                font-size: 14px;
                color: #ddd;
            }
            
            .folder-count {
                background-color: #444;
                border-radius: 10px;
                padding: 0 6px;
                font-size: 12px;
                color: #ccc;
                min-width: 20px;
                text-align: center;
                flex: 0 0 auto;
            }
            
            /* Content Area */
            .media-selector-content-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .media-selector-tabs {
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                display: flex;
                gap: 10px;
            }
            
            .tab {
                background: none;
                border: none;
                padding: 6px 15px;
                border-radius: 4px;
                color: #bbb;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tab:hover {
                background-color: #2a2a2a;
                color: #fff;
            }
            
            .tab.active {
                background-color: #0066cc;
                color: #fff;
            }
            
            .media-grid {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 15px;
            }
            
            /* Media Items */
            .media-item {
                background-color: #2a2a2a;
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
            }
            
            .media-thumbnail {
                height: 130px;
                overflow: hidden;
                background-color: #222;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .media-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .media-info {
                padding: 10px;
            }
            
            .media-name {
                font-size: 13px;
                color: #ddd;
                margin-bottom: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .media-meta {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #888;
            }
            
            /* Selection Feedback */
            .media-selection-feedback {
                margin-top: 10px;
                padding: 8px 12px;
                background-color: #1e1e1e;
                border-radius: 4px;
                color: #0066cc;
                font-size: 13px;
                animation: fadeIn 0.3s;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            /* Scrollbar Styles */
            .folders-list::-webkit-scrollbar,
            .media-grid::-webkit-scrollbar {
                width: 8px;
            }
            
            .folders-list::-webkit-scrollbar-track,
            .media-grid::-webkit-scrollbar-track {
                background: #1a1a1a;
            }
            
            .folders-list::-webkit-scrollbar-thumb,
            .media-grid::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 4px;
            }
            
            .folders-list::-webkit-scrollbar-thumb:hover,
            .media-grid::-webkit-scrollbar-thumb:hover {
                background: #555;
            }
        `;
        
        document.head.appendChild(styles);
    }
})();
