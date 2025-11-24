/**
 * Email Popup Media Library Integration
 * 
 * Integrates the existing media library with the Email Subscribers popup functionality
 * Replaces the default file upload with a media library selector
 */
(function() {
    // Global state
    let initialized = false;
    let buttonAdded = false;
    
    // Initialize when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initialize);
    
    // Also try after window load (for dynamically generated content)
    window.addEventListener('load', initialize);
    
    // Set a timeout to ensure initialization even if other events fail
    setTimeout(initialize, 2000);
    
    /**
     * Initialize the media library integration
     */
    function initialize() {
        // Remove any existing buttons first to avoid duplicates
        removeExistingButtons();
        
        // Reset buttonAdded flag
        buttonAdded = false;
        
        // Find the email popup image upload field
        const popupImageField = document.getElementById('popupImage');
        
        if (popupImageField && !buttonAdded) {
            // We found the field, initialize the integration
            addMediaLibraryButton(popupImageField);
            initialized = true;
            console.log('Email popup media library integration initialized');
        } else {
            // Try another approach - look for it in the email management section
            const emailSection = document.getElementById('email-management-section');
            if (emailSection) {
                // First search for any file inputs in customization options labeled for image upload
                const customOptions = emailSection.querySelectorAll('.customization-option');
                for (let option of customOptions) {
                    if (option.textContent.includes('Upload Image') && !buttonAdded) {
                        const fileInput = option.querySelector('input[type="file"]');
                        if (fileInput) {
                            addMediaLibraryButton(fileInput);
                            initialized = true;
                            break;
                        }
                    }
                }
                
                // If still not found, set up observer to detect when it might be added
                if (!buttonAdded) {
                    setupDOMObserver(emailSection);
                }
            }
        }
        
        // Set up a periodic check to catch any delayed rendering
        if (!buttonAdded) {
            setTimeout(checkForImageField, 1000);
        }
    }
    
    /**
     * Remove any existing media library buttons to avoid duplicates
     */
    function removeExistingButtons() {
        const existingButtons = document.querySelectorAll('.media-library-button');
        existingButtons.forEach(button => button.remove());
        console.log(`Removed ${existingButtons.length} existing media library buttons`);
    }
    
    /**
     * Set up a DOM observer to detect when elements are added to the page
     */
    function setupDOMObserver(targetNode) {
        const observer = new MutationObserver(function(mutations) {
            if (buttonAdded) return;
            
            mutations.forEach(function(mutation) {
                if (buttonAdded) return;
                
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (buttonAdded) break;
                        
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is the popup image field or contains it
                            const popupImageField = node.id === 'popupImage' ? 
                                node : node.querySelector('#popupImage');
                            
                            if (popupImageField && !buttonAdded) {
                                addMediaLibraryButton(popupImageField);
                                initialized = true;
                                console.log('Email popup media library integration initialized via observer');
                                return;
                            }
                            
                            // Look for any elements with 'Upload Image' text
                            if (node.textContent && node.textContent.includes('Upload Image') && !buttonAdded) {
                                const fileInput = node.querySelector('input[type="file"]');
                                if (fileInput) {
                                    addMediaLibraryButton(fileInput);
                                    initialized = true;
                                    return;
                                }
                            }
                        }
                    }
                }
            });
        });
        
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        
        console.log('DOM observer set up for email popup media integration');
    }
    
    /**
     * Periodically check for the image field in case other methods fail
     */
    function checkForImageField() {
        if (buttonAdded) return;
        
        // Find any file inputs in the email management section
        const emailSection = document.getElementById('email-management-section');
        if (!emailSection) {
            setTimeout(checkForImageField, 1000);
            return;
        }
        
        // Look for any 'Upload Image' text in the email section
        const elements = emailSection.querySelectorAll('*');
        for (let element of elements) {
            if (buttonAdded) break;
            
            if (element.textContent && element.textContent.includes('Upload Image')) {
                // Found an element with 'Upload Image' text, now look for a file input
                let container = element;
                // Go up to find a container
                while (container && !container.classList.contains('customization-option')) {
                    container = container.parentElement;
                }
                
                if (container) {
                    const fileInput = container.querySelector('input[type="file"]');
                    if (fileInput && !buttonAdded) {
                        addMediaLibraryButton(fileInput);
                        initialized = true;
                        return;
                    }
                }
            }
        }
        
        // If button still not added, try again after a delay
        if (!buttonAdded) {
            setTimeout(checkForImageField, 1000);
        }
    }
    
    /**
     * Add a media library button next to a file input
     * @param {HTMLElement} fileInput - The file input element
     */
    function addMediaLibraryButton(fileInput) {
        // Don't add if button is already added
        if (buttonAdded) return;
        
        // Check if a media library button already exists
        const existingButton = document.querySelector('.media-library-button');
        if (existingButton) {
            buttonAdded = true;
            return;
        }
        
        // Ensure the file input has an ID
        if (!fileInput.id) {
            fileInput.id = 'popup-image-' + Math.random().toString(36).substring(2, 9);
        }
        
        // Create the media library button
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'media-library-button';
        button.textContent = 'Choose from Media Library';
        button.setAttribute('data-target-input', fileInput.id);
        
        // Add the button after the file input
        const parent = fileInput.parentNode;
        if (parent) {
            parent.insertBefore(button, fileInput.nextSibling);
            
            // Style the button to match the site's yellow theme
            button.style.marginTop = '8px';
            button.style.marginBottom = '8px';
            button.style.backgroundColor = '#e8f24c'; // Yellow color
            button.style.color = '#1e2127'; // Dark text for contrast
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.padding = '10px 15px';
            button.style.cursor = 'pointer';
            button.style.display = 'block'; // Display as block to avoid multiple buttons side by side
            button.style.fontSize = '14px';
            button.style.fontWeight = 'bold';
            button.style.width = 'auto';
            
            // Add hover effect
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#d9e547'; // Slightly darker yellow on hover
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#e8f24c';
            });
            
            // Add click handler to open the media library
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openMediaLibrary(fileInput.id);
            });
            
            buttonAdded = true;
            console.log('Media library button added for', fileInput.id);
        }
    }
    
    /**
     * Open the media library and handle selection
     * @param {string} targetInputId - ID of the input to update
     */
    function openMediaLibrary(targetInputId) {
        // Access the actual media library data using the same approach as MediaGallery
        let mediaItems = {
            images: [],
            videos: [],
            folders: [],
            currentFolder: 'all'
        };
        
        // Use the same storage key prefix as MediaGallery
        const storageKeyPrefix = 'fooodis_media_';
        
        // Load images from localStorage using the same keys as MediaGallery
        try {
            // Load images
            const savedImages = localStorage.getItem(storageKeyPrefix + 'images');
            if (savedImages) {
                mediaItems.images = JSON.parse(savedImages);
            }
            
            // Load videos
            const savedVideos = localStorage.getItem(storageKeyPrefix + 'videos');
            if (savedVideos) {
                mediaItems.videos = JSON.parse(savedVideos);
            }
            
            // Load folders if available
            const savedFolders = localStorage.getItem(storageKeyPrefix + 'folders');
            if (savedFolders) {
                mediaItems.folders = JSON.parse(savedFolders);
            } else {
                // Default folders if none found
                mediaItems.folders = [
                    { id: 'all', name: 'All Media', icon: 'photo-video' },
                    { id: 'uncategorized', name: 'Uncategorized', icon: 'folder' },
                    { id: 'food', name: 'Food', icon: 'utensils' },
                    { id: 'restaurant', name: 'Restaurant', icon: 'store' },
                    { id: 'people', name: 'People', icon: 'users' }
                ];
            }
            
            // If MediaGallery is available as a global object, use it directly
            if (window.MediaGallery && window.MediaGallery.state) {
                console.log('Using MediaGallery global object for media items');
                mediaItems.images = window.MediaGallery.state.mediaItems.images || [];
                mediaItems.videos = window.MediaGallery.state.mediaItems.videos || [];
                
                // If MediaGallery has folders, use those
                if (window.MediaGallery.folders) {
                    mediaItems.folders = window.MediaGallery.folders;
                }
            }
            
            console.log('Loaded media items:', mediaItems);
        } catch (error) {
            console.error('Error loading media library data:', error);
        }
        
        // Count total items
        const totalItems = (mediaItems.images?.length || 0) + (mediaItems.videos?.length || 0);
        const modalTitle = totalItems > 0 ? 'Select Media' : 'No Media Found';
        
        // Create a custom modal for media selection that matches the existing media library
        const modal = document.createElement('div');
        modal.className = 'media-selection-modal';
        modal.innerHTML = `
            <div class="media-selection-content">
                <div class="media-selection-header">
                    <h3>Select Media</h3>
                    <button class="close-media-selection">&times;</button>
                </div>
                <div class="media-selection-container">
                    <!-- Left sidebar for folders -->
                    <div class="media-sidebar">
                        <div class="media-search">
                            <input type="text" placeholder="Search media..." class="media-search-input">
                        </div>
                        <div class="media-folders">
                            <div class="folder-header">Folders</div>
                            <div class="folder-list">
                                <div class="folder-item active">
                                    <i class="fas fa-photo-video"></i> All Media
                                    <span class="folder-count">${(mediaItems.images?.length || 0) + (mediaItems.videos?.length || 0)}</span>
                                </div>
                                    ${generateFolderItems(mediaItems.folders)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right content area -->
                    <div class="media-content">
                        <div class="media-toolbar">
                            <div class="media-filter-tabs">
                                <button class="media-tab active">All Media</button>
                                <button class="media-tab">Images</button>
                                <button class="media-tab">Videos</button>
                            </div>
                        </div>
                        
                        <!-- Media grid -->
                        <div class="media-grid" id="mediaSelectionGrid">
                            ${mediaItems && mediaItems.length > 0 ? '' : `
                                <div class="no-media-message">
                                    <i class="fas fa-image"></i>
                                    <p>No media items found. Please upload media in the Media Library section first.</p>
                                </div>
                            `}
                        </div>
                        
                        <!-- Pagination -->
                        <div class="media-pagination">
                            <button class="pagination-prev"><i class="fas fa-chevron-left"></i></button>
                            <span>Page 1 of 1</span>
                            <button class="pagination-next"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the modal to the page
        document.body.appendChild(modal);
        
        // Add styles for the modal to match the existing media library
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .media-selection-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            
            .media-selection-content {
                background-color: #1e2127;
                border-radius: 8px;
                width: 90%;
                max-width: 1200px;
                height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                color: #e5e7eb;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            }
            
            .media-selection-header {
                padding: 15px 20px;
                border-bottom: 1px solid #2d3748;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #1a1d23;
            }
            
            .media-selection-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #fff;
            }
            
            .close-media-selection {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #a0aec0;
            }

            .media-selection-container {
                display: flex;
                height: calc(90vh - 60px);
            }
            
            /* Left sidebar */
            .media-sidebar {
                width: 240px;
                background-color: #1a1d23;
                border-right: 1px solid #2d3748;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }
            
            .media-search {
                padding: 15px;
                border-bottom: 1px solid #2d3748;
            }
            
            .media-search-input {
                width: 100%;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #4a5568;
                background-color: #2d3748;
                color: #e5e7eb;
                font-size: 14px;
            }
            
            .media-folders {
                padding: 15px 0;
            }
            
            .folder-header {
                padding: 0 15px 10px;
                font-weight: 600;
                font-size: 14px;
                color: #a0aec0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .folder-item {
                padding: 8px 15px;
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 14px;
                color: #cbd5e0;
            }
            
            .folder-item i {
                margin-right: 8px;
                color: #e8f24c;
                width: 16px;
                text-align: center;
            }
            
            .folder-item.active {
                background-color: #2d3748;
                color: #e8f24c;
            }
            
            .folder-count {
                margin-left: auto;
                background-color: #2d3748;
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 12px;
                color: #a0aec0;
            }
            
            /* Main content area */
            .media-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                background-color: #1e2127;
                overflow: hidden;
            }
            
            .media-toolbar {
                padding: 15px 20px;
                border-bottom: 1px solid #2d3748;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .media-filter-tabs {
                display: flex;
                gap: 10px;
            }
            
            .media-tab {
                background-color: #2d3748;
                border: none;
                color: #a0aec0;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
            }
            
            .media-tab.active {
                background-color: #e8f24c;
                color: #1e2127;
                font-weight: 600;
            }
            
            /* Media grid */
            .media-grid {
                padding: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                overflow-y: auto;
                height: calc(90vh - 180px);
            }
            
            .media-item {
                border: 2px solid transparent;
                border-radius: 6px;
                overflow: hidden;
                background-color: #2d3748;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
            }
            
            .media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .media-item.selected {
                border-color: #e8f24c;
                box-shadow: 0 0 0 2px #e8f24c, 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .media-item img {
                width: 100%;
                height: 150px;
                object-fit: cover;
                display: block;
            }
            
            .video-indicator {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
            }
            
            .video-indicator i {
                font-size: 16px;
                color: #e8f24c;
            }
            
            .media-item-info {
                padding: 10px;
                font-size: 12px;
                color: #e5e7eb;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .media-item-actions {
                position: absolute;
                bottom: 5px;
                right: 5px;
                display: flex;
                gap: 5px;
            }
            
            .media-item-actions button {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                border: none;
                background-color: rgba(0, 0, 0, 0.7);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
            
            .no-media-message {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #a0aec0;
            }
            
            .no-media-message i {
                font-size: 36px;
                margin-bottom: 15px;
                display: block;
                color: #4a5568;
            }
            
            /* Pagination */
            .media-pagination {
                padding: 15px 20px;
                border-top: 1px solid #2d3748;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
                color: #a0aec0;
                font-size: 14px;
            }
            
            .pagination-prev, .pagination-next {
                background-color: #2d3748;
                border: none;
                color: #e5e7eb;
                width: 30px;
                height: 30px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
        `;
        
        document.head.appendChild(styleElement);
        
        // Handle close button
        const closeButton = modal.querySelector('.close-media-selection');
        closeButton.addEventListener('click', () => {
            modal.remove();
            styleElement.remove();
        });
        
        // Add ESC key press handler to close modal
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                styleElement.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        // Make folder items interactive
        const folderItems = modal.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all folders
                folderItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked folder
                item.classList.add('active');
                
                // Get folder ID
                const folderId = item.getAttribute('data-folder-id') || (item.textContent.trim().toLowerCase() === 'all media' ? 'all' : 'uncategorized');
                mediaItems.currentFolder = folderId;
                
                // Filter items based on folder
                filterMediaByFolder(folderId);
            });
        });
        
        // Function to filter media items by folder
        function filterMediaByFolder(folderId) {
            // Clear the grid
            mediaGrid.innerHTML = '';
            
            // Get items to display
            let itemsToDisplay = [];
            
            if (folderId === 'all') {
                // Show all items
                itemsToDisplay = [...mediaItems.images, ...mediaItems.videos];
            } else {
                // Filter by folder
                const imagesInFolder = mediaItems.images.filter(item => 
                    item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                );
                
                const videosInFolder = mediaItems.videos.filter(item => 
                    item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                );
                
                itemsToDisplay = [...imagesInFolder, ...videosInFolder];
            }
            
            // Show message if no items
            if (itemsToDisplay.length === 0) {
                mediaGrid.innerHTML = `
                    <div class="no-media-message">
                        <i class="fas fa-folder-open"></i>
                        <p>No media items in this folder.</p>
                    </div>
                `;
                return;
            }
            
            // Render filtered items
            itemsToDisplay.forEach(item => {
                if (!item.url) return;
                
                const fileSizeDisplay = item.size ? formatFileSize(item.size) : (item.type?.includes('video') ? '8.5 MB' : '3.2 MB');
                
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-media-id', item.id);
                
                // Determine if it's a video or image
                const isVideo = item.type && item.type.includes('video');
                
                mediaItem.innerHTML = `
                    ${isVideo ? `<div class="video-indicator"><i class="fas fa-play-circle"></i></div>` : ''}
                    <img src="${item.url}" alt="${item.name || 'Media'}">
                    <div class="media-item-info">${item.name || 'Media'}</div>
                    <div style="padding: 0 10px 10px; font-size: 12px; color: #a0aec0;">${fileSizeDisplay}</div>
                    <div class="media-item-actions">
                        <button title="Select"><i class="fas fa-check"></i></button>
                        <button title="View details"><i class="fas fa-info"></i></button>
                    </div>
                `;
                
                // Add selection handlers
                addMediaItemEventListeners(mediaItem, item, mediaGrid, targetInputId, modal, styleElement);
                
                mediaGrid.appendChild(mediaItem);
            });
        }
        
        // Make media tabs interactive
        const mediaTabs = modal.querySelectorAll('.media-tab');
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                mediaTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get tab type
                const tabType = tab.textContent.trim().toLowerCase();
                
                // Filter by type
                filterMediaByType(tabType, mediaItems.currentFolder);
            });
        });
        
        // Function to filter media by type and folder
        function filterMediaByType(type, folderId) {
            // Clear the grid
            mediaGrid.innerHTML = '';
            
            // Get items to display based on type and folder
            let itemsToDisplay = [];
            
            if (type === 'all media') {
                // Get items by folder
                if (folderId === 'all') {
                    itemsToDisplay = [...mediaItems.images, ...mediaItems.videos];
                } else {
                    const imagesInFolder = mediaItems.images.filter(item => 
                        item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                    );
                    
                    const videosInFolder = mediaItems.videos.filter(item => 
                        item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                    );
                    
                    itemsToDisplay = [...imagesInFolder, ...videosInFolder];
                }
            } else if (type === 'images') {
                // Filter images by folder
                if (folderId === 'all') {
                    itemsToDisplay = [...mediaItems.images];
                } else {
                    itemsToDisplay = mediaItems.images.filter(item => 
                        item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                    );
                }
            } else if (type === 'videos') {
                // Filter videos by folder
                if (folderId === 'all') {
                    itemsToDisplay = [...mediaItems.videos];
                } else {
                    itemsToDisplay = mediaItems.videos.filter(item => 
                        item.folder === folderId || (!item.folder && folderId === 'uncategorized')
                    );
                }
            }
            
            // Show message if no items
            if (itemsToDisplay.length === 0) {
                mediaGrid.innerHTML = `
                    <div class="no-media-message">
                        <i class="fas fa-${type === 'videos' ? 'video' : 'image'}"></i>
                        <p>No ${type} found in this folder.</p>
                    </div>
                `;
                return;
            }
            
            // Render filtered items
            itemsToDisplay.forEach(item => {
                if (!item.url) return;
                
                const fileSizeDisplay = item.size ? formatFileSize(item.size) : (item.type?.includes('video') ? '8.5 MB' : '3.2 MB');
                
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-media-id', item.id);
                
                // Determine if it's a video
                const isVideo = item.type && item.type.includes('video');
                
                mediaItem.innerHTML = `
                    ${isVideo ? `<div class="video-indicator"><i class="fas fa-play-circle"></i></div>` : ''}
                    <img src="${item.url}" alt="${item.name || 'Media'}">
                    <div class="media-item-info">${item.name || 'Media'}</div>
                    <div style="padding: 0 10px 10px; font-size: 12px; color: #a0aec0;">${fileSizeDisplay}</div>
                    <div class="media-item-actions">
                        <button title="Select"><i class="fas fa-check"></i></button>
                        <button title="View details"><i class="fas fa-info"></i></button>
                    </div>
                `;
                
                // Add selection handlers
                addMediaItemEventListeners(mediaItem, item, mediaGrid, targetInputId, modal, styleElement);
                
                mediaGrid.appendChild(mediaItem);
            });
        }
        
        // Function to generate folder HTML from folder data
        function generateFolderItems(folders) {
            if (!folders || !folders.length) return '';
            
            return folders.filter(folder => folder.id !== 'all').map(folder => `
                <div class="folder-item" data-folder-id="${folder.id}">
                    <i class="fas fa-${folder.icon || 'folder'}"></i> ${folder.name}
                    <span class="folder-count">${getFolderItemCount(folder.id)}</span>
                </div>
            `).join('');
        }
        
        // Function to count items in a folder
        function getFolderItemCount(folderId) {
            if (folderId === 'all') {
                return (mediaItems.images?.length || 0) + (mediaItems.videos?.length || 0);
            }
            
            const imagesInFolder = mediaItems.images.filter(item => 
                item.folder === folderId || (!item.folder && folderId === 'uncategorized')
            ).length;
            
            const videosInFolder = mediaItems.videos.filter(item => 
                item.folder === folderId || (!item.folder && folderId === 'uncategorized')
            ).length;
            
            return imagesInFolder + videosInFolder;
        }
        
        // Render media items if available
        const mediaGrid = modal.querySelector('#mediaSelectionGrid');
        
        if (mediaItems.images.length > 0 || mediaItems.videos.length > 0) {
            // Combine images and videos for initial view
            const allItems = [...mediaItems.images, ...mediaItems.videos];
            
            // Create media items
            allItems.forEach(item => {
                // Skip items without URLs
                if (!item.url) return;
                
                // Calculate file size display
                const fileSizeDisplay = item.size ? formatFileSize(item.size) : (item.type?.includes('video') ? '8.5 MB' : '3.2 MB');
                
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-media-id', item.id);
                mediaItem.innerHTML = `
                    <img src="${item.url}" alt="${item.name || 'Media'}">
                    <div class="media-item-info">${item.name || 'Media'}</div>
                    <div style="padding: 0 10px 10px; font-size: 12px; color: #a0aec0;">${fileSizeDisplay}</div>
                    <div class="media-item-actions">
                        <button title="Select"><i class="fas fa-check"></i></button>
                        <button title="View details"><i class="fas fa-info"></i></button>
                    </div>
                `;
                
        // Helper function to add event listeners to media items
        function addMediaItemEventListeners(mediaItem, itemData, mediaGrid, targetInputId, modal, styleElement) {
            // Find the select button and add click handler
            const selectButton = mediaItem.querySelector('.media-item-actions button[title="Select"]');
            if (selectButton) {
                selectButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent bubbling to mediaItem's click
                    
                    // Remove selected class from all items
                    mediaGrid.querySelectorAll('.media-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Add selected class to this item
                    mediaItem.classList.add('selected');
                    
                    // Update the file input
                    updateFileInput(targetInputId, itemData);
                    
                    // Close the modal after a short delay
                    setTimeout(() => {
                        modal.remove();
                        styleElement.remove();
                    }, 500);
                });
            }
            
            // Handle selection by clicking anywhere on the item
            mediaItem.addEventListener('click', () => {
                // Remove selected class from all items
                mediaGrid.querySelectorAll('.media-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to this item
                mediaItem.classList.add('selected');
            });
        }
        
        // Initially load all media items
        filterMediaByType('all media', 'all');
            });
        }
    }
    
    /**
     * Update a file input with the selected media
     * @param {string} inputId - ID of input to update
     * @param {Object} media - Selected media object
     */
    function updateFileInput(inputId, media) {
        const fileInput = document.getElementById(inputId);
        if (!fileInput) return;
        
        // Find the parent customization option element
        let optionElement = fileInput;
        while (optionElement && !optionElement.classList.contains('customization-option')) {
            optionElement = optionElement.parentElement;
        }
        
        // Find the preview container (if exists)
        let previewContainer = null;
        if (optionElement) {
            previewContainer = optionElement.querySelector('.image-upload-preview');
        }
        
        if (!previewContainer) {
            // Look for preview container as a sibling if not found inside parent
            previewContainer = fileInput.nextElementSibling;
            while (previewContainer && !previewContainer.classList.contains('image-upload-preview')) {
                previewContainer = previewContainer.nextElementSibling;
            }
        }
        
        // If preview container exists, update it
        if (previewContainer) {
            previewContainer.innerHTML = `<img src="${media.url}" alt="Preview">`;
            previewContainer.classList.add('has-image');
        }
        
        // Find and enable the image toggle checkbox if it exists
        if (optionElement) {
            const imageToggle = optionElement.querySelector('input[type="checkbox"]');
            if (imageToggle && !imageToggle.checked) {
                imageToggle.checked = true;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                imageToggle.dispatchEvent(event);
            }
            
            // Also look for a label that might contain 'Enable' text and check its associated checkbox
            const enableLabels = optionElement.querySelectorAll('label');
            for (let label of enableLabels) {
                if (label.textContent.includes('Enable') || label.textContent.includes('enable')) {
                    const checkbox = label.querySelector('input[type="checkbox"]') || 
                                     document.getElementById(label.getAttribute('for'));
                    if (checkbox && !checkbox.checked) {
                        checkbox.checked = true;
                        const event = new Event('change', { bubbles: true });
                        checkbox.dispatchEvent(event);
                    }
                }
            }
        }
        
        // Update the EmailPopupEnhancer configuration
        updatePopupConfig(media);
        
        // Show feedback notification
        showSelectionFeedback(media);
    }
    
    /**
     * Update the email popup configuration with the selected media
     * @param {Object} media - Selected media object
     */
    function updatePopupConfig(media) {
        if (!media || !media.url) {
            console.error('Invalid media object for updatePopupConfig:', media);
            return;
        }
        
        console.log('Updating popup config with media:', media);
        
        // Strategy 1: Try to access the EmailPopupEnhancer instance directly
        try {
            if (window.emailPopupEnhancer) {
                console.log('Found emailPopupEnhancer instance:', window.emailPopupEnhancer);
                
                // Make sure the config has an image object
                if (!window.emailPopupEnhancer.config.image) {
                    window.emailPopupEnhancer.config.image = {};
                }
                
                window.emailPopupEnhancer.config.image.url = media.url;
                window.emailPopupEnhancer.config.image.type = media.type || 'image/jpeg';
                window.emailPopupEnhancer.config.image.enabled = true;
                
                // Check if these methods exist before calling them
                if (typeof window.emailPopupEnhancer.saveConfig === 'function') {
                    window.emailPopupEnhancer.saveConfig();
                }
                
                if (typeof window.emailPopupEnhancer.updatePreview === 'function') {
                    window.emailPopupEnhancer.updatePreview();
                }
                
                console.log('Updated popup config via emailPopupEnhancer instance');
                return;
            }
        } catch (error) {
            console.log('EmailPopupEnhancer instance not available:', error);
        }
        
        // Strategy 2: Try to dispatch a custom event
        try {
            const customEvent = new CustomEvent('emailPopupImageSelected', {
                detail: {
                    url: media.url,
                    type: media.type || 'image/jpeg'
                }
            });
            document.dispatchEvent(customEvent);
            console.log('Dispatched emailPopupImageSelected event');
        } catch (error) {
            console.log('Custom event dispatch failed');
        }
        
        // Strategy 3: Try to find and update the config in localStorage
        try {
            const storedConfig = localStorage.getItem('emailPopupConfig');
            if (storedConfig) {
                const config = JSON.parse(storedConfig);
                config.image = config.image || {};
                config.image.url = media.url;
                config.image.type = media.type || 'image/jpeg';
                config.image.enabled = true;
                localStorage.setItem('emailPopupConfig', JSON.stringify(config));
                console.log('Updated popup config in localStorage');
            }
        } catch (error) {
            console.log('localStorage update failed');
        }
        
        // Strategy 4: Try to find a save button and click it
        setTimeout(() => {
            try {
                const saveButton = document.querySelector('.email-customization-save');
                if (saveButton) {
                    saveButton.click();
                    console.log('Clicked save button to update config');
                }
            } catch (error) {
                console.log('Save button click failed');
            }
        }, 500);
        
        console.log('Email popup image updated with', media.url);
    }
    
    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size string
     */
    function formatFileSize(bytes) {
        if (!bytes || isNaN(bytes)) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    
    /**
     * Show feedback that an image was selected
     * @param {Object} media - Selected media object
     */
    function showSelectionFeedback(media) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'media-selection-feedback';
        feedbackEl.textContent = `Selected: ${media.name || 'Image'}`;
        feedbackEl.style.position = 'fixed';
        feedbackEl.style.bottom = '20px';
        feedbackEl.style.right = '20px';
        feedbackEl.style.backgroundColor = '#e8f24c'; // Match the yellow theme
        feedbackEl.style.color = '#1e2127'; // Dark text
        feedbackEl.style.padding = '10px 15px';
        feedbackEl.style.borderRadius = '4px';
        feedbackEl.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        feedbackEl.style.zIndex = '9999';
        feedbackEl.style.fontWeight = 'bold';
        
        document.body.appendChild(feedbackEl);
        
        // Remove the feedback after 3 seconds
        setTimeout(() => {
            feedbackEl.style.opacity = '0';
            feedbackEl.style.transition = 'opacity 0.5s';
            setTimeout(() => feedbackEl.remove(), 500);
        }, 3000);
    }
})();
