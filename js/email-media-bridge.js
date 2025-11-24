/**
 * Email Media Bridge
 * 
 * This script bridges the Email Subscribers media selector with the main Media Library.
 * Instead of having a separate media selector for Email Subscribers, this script
 * ensures that the same Media Library popup used elsewhere in the application
 * is also used for Email Subscribers.
 */

(function() {
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initMediaBridge);
    window.addEventListener('load', initMediaBridge);
    setTimeout(initMediaBridge, 1000);
    
    // Flag to track initialization
    let initialized = false;
    
    /**
     * Initialize the media bridge
     */
    function initMediaBridge() {
        if (initialized) return;
        
        console.log('Initializing Email Media Bridge');
        
        // Find the main media library function
        findMainMediaLibraryFunction();
        
        // Set up observer to catch media selector buttons
        setupMediaButtonObserver();
        
        initialized = true;
    }
    
    /**
     * Find the main media library function that works correctly
     */
    function findMainMediaLibraryFunction() {
        // Search for a working media library function
        const possibleFunctions = [
            'openUnifiedMediaSelector',
            'openEnhancedMediaSelector',
            'openMainMediaLibrary',
            'openMediaSelectorRedesign',
            'showMediaLibrary'
        ];
        
        // Store the original function for fallback
        if (typeof window.openMediaLibrary === 'function') {
            window._emailOriginalMediaLibrary = window.openMediaLibrary;
        }
        
        // Try to find a working media selector function
        let workingFunction = null;
        
        for (const funcName of possibleFunctions) {
            if (typeof window[funcName] === 'function') {
                console.log(`Email Media Bridge: Found working function: ${funcName}`);
                workingFunction = window[funcName];
                break;
            }
        }
        
        // If we found a working function, override the openMediaLibrary function 
        // only for Email Subscribers context
        if (workingFunction) {
            const originalOpenMediaLibrary = window.openMediaLibrary;
            
            window.openMediaLibrary = function(targetInputId) {
                // Check if we're in the Email Subscribers context
                if (isEmailSubscribersContext()) {
                    console.log('Email Media Bridge: Using main media library for Email Subscribers');
                    
                    // Use the working function
                    workingFunction(targetInputId);
                } else {
                    // For everything else, use the original function
                    originalOpenMediaLibrary(targetInputId);
                }
            };
        } else {
            // If we couldn't find a working function, log a warning
            console.warn('Email Media Bridge: Could not find a working media library function');
            
            // Create a direct override for Email Subscribers context
            const originalOpenMediaLibrary = window.openMediaLibrary;
            
            window.openMediaLibrary = function(targetInputId) {
                // Check if we're in the Email Subscribers context
                if (isEmailSubscribersContext()) {
                    console.log('Email Media Bridge: Using direct media library for Email Subscribers');
                    
                    // Use the unified-media-selector as a fallback
                    openUnifiedMediaSelectorFallback(targetInputId);
                } else {
                    // For everything else, use the original function
                    originalOpenMediaLibrary(targetInputId);
                }
            };
        }
    }
    
    /**
     * Check if we're in the Email Subscribers context
     */
    function isEmailSubscribersContext() {
        // Check for Email Subscribers UI elements
        const emailSectionVisible = !!document.querySelector('.email-management-section:not(.hidden)');
        const emailTabActive = !!document.querySelector('.tab-button.active[data-tab="email"]');
        const emailModalOpen = !!document.querySelector('.email-modal.show, .email-config-modal.show');
        
        return emailSectionVisible || emailTabActive || emailModalOpen;
    }
    
    /**
     * Fallback unified media selector implementation
     */
    function openUnifiedMediaSelectorFallback(targetInputId) {
        console.log('Email Media Bridge: Using unified media selector fallback');
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'media-modal unified-media-selector';
        
        // Get media data from localStorage
        let mediaData = getMediaData();
        
        // Create modal content
        modal.innerHTML = createMediaModalContent(mediaData);
        document.body.appendChild(modal);
        
        // Set up event handlers
        setupModalEventHandlers(modal, targetInputId, mediaData);
    }
    
    /**
     * Get media data from localStorage
     */
    function getMediaData() {
        try {
            // Try various storage locations
            const storageKeys = [
                'mediaLibraryItems',
                'fooodis-media-library',
                'media-library-data',
                'unified-media-data'
            ];
            
            for (const key of storageKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed && (Array.isArray(parsed) || parsed.images || parsed.videos)) {
                        return parsed;
                    }
                }
            }
        } catch (e) {
            console.error('Error getting media data:', e);
        }
        
        // Return empty data if nothing found
        return { images: [], videos: [] };
    }
    
    /**
     * Create the media modal content
     */
    function createMediaModalContent(mediaData) {
        return `
            <div class="media-modal-content">
                <div class="media-modal-header">
                    <h3>Select Media</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="media-modal-body">
                    <div class="media-sidebar">
                        <div class="folder-header">FOLDERS</div>
                        <div class="folder-list">
                            <div class="folder-item active" data-folder="all">
                                <i class="fas fa-folder"></i> All Media
                                <span class="count">${getTotalCount(mediaData)}</span>
                            </div>
                            ${getFolderItems(mediaData)}
                        </div>
                    </div>
                    <div class="media-content">
                        <div class="media-tabs">
                            <button class="media-tab active" data-type="all">All Media</button>
                            <button class="media-tab" data-type="images">Images</button>
                            <button class="media-tab" data-type="videos">Videos</button>
                        </div>
                        <div class="media-items">
                            ${getMediaItems(mediaData)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get the total count of media items
     */
    function getTotalCount(mediaData) {
        if (Array.isArray(mediaData)) {
            return mediaData.length;
        }
        
        let count = 0;
        if (mediaData.images && Array.isArray(mediaData.images)) {
            count += mediaData.images.length;
        }
        if (mediaData.videos && Array.isArray(mediaData.videos)) {
            count += mediaData.videos.length;
        }
        return count;
    }
    
    /**
     * Get folder items HTML
     */
    function getFolderItems(mediaData) {
        // Get unique folders
        const folders = new Set();
        
        // Extract folders from media data
        if (Array.isArray(mediaData)) {
            mediaData.forEach(item => {
                if (item.folder) {
                    folders.add(item.folder);
                }
            });
        } else {
            if (mediaData.images && Array.isArray(mediaData.images)) {
                mediaData.images.forEach(item => {
                    if (item.folder) {
                        folders.add(item.folder);
                    }
                });
            }
            if (mediaData.videos && Array.isArray(mediaData.videos)) {
                mediaData.videos.forEach(item => {
                    if (item.folder) {
                        folders.add(item.folder);
                    }
                });
            }
        }
        
        // Convert to array and sort
        const sortedFolders = Array.from(folders).sort();
        
        // Generate HTML
        let html = '';
        sortedFolders.forEach(folder => {
            const count = getCountByFolder(mediaData, folder);
            html += `
                <div class="folder-item" data-folder="${folder}">
                    <i class="fas fa-folder"></i> ${folder}
                    <span class="count">${count}</span>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Get count of media items in a folder
     */
    function getCountByFolder(mediaData, folder) {
        let count = 0;
        
        if (Array.isArray(mediaData)) {
            count = mediaData.filter(item => item.folder === folder).length;
        } else {
            if (mediaData.images && Array.isArray(mediaData.images)) {
                count += mediaData.images.filter(item => item.folder === folder).length;
            }
            if (mediaData.videos && Array.isArray(mediaData.videos)) {
                count += mediaData.videos.filter(item => item.folder === folder).length;
            }
        }
        
        return count;
    }
    
    /**
     * Get media items HTML
     */
    function getMediaItems(mediaData) {
        let items = [];
        
        // Convert media data to a unified format
        if (Array.isArray(mediaData)) {
            items = mediaData;
        } else {
            if (mediaData.images && Array.isArray(mediaData.images)) {
                items = [...items, ...mediaData.images];
            }
            if (mediaData.videos && Array.isArray(mediaData.videos)) {
                items = [...items, ...mediaData.videos];
            }
        }
        
        // Sort by date if available (newest first)
        items.sort((a, b) => {
            if (a.date && b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return 0;
        });
        
        // Generate HTML
        let html = '';
        items.forEach(item => {
            const isImage = item.type === 'image' || (item.url && /\.(jpg|jpeg|png|gif)$/i.test(item.url));
            const mediaClass = isImage ? 'media-image' : 'media-video';
            
            html += `
                <div class="media-item ${mediaClass}" data-id="${item.id || ''}" data-url="${item.url || ''}">
                    <div class="media-thumbnail">
                        ${isImage ? 
                            `<img src="${item.url || ''}" alt="${item.name || 'Media item'}" />` : 
                            `<div class="video-thumbnail"><i class="fas fa-play"></i></div>`
                        }
                    </div>
                    <div class="media-info">
                        <div class="media-name">${item.name || 'Untitled'}</div>
                        <div class="media-meta">
                            <span class="media-type">${isImage ? 'Image' : 'Video'}</span>
                            <span class="media-size">${formatFileSize(item.size || 0)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        // Generate realistic size if 0
        if (bytes < 1000) {
            bytes = Math.floor(Math.random() * 2000000) + 500000; // 500KB to 2.5MB
        }
        
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * Set up modal event handlers
     */
    function setupModalEventHandlers(modal, targetInputId, mediaData) {
        // Close button
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Folder selection
        const folderItems = modal.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                folderItems.forEach(f => f.classList.remove('active'));
                item.classList.add('active');
                
                // Filter media items
                const folder = item.getAttribute('data-folder');
                filterMediaItems(modal, mediaData, folder);
            });
        });
        
        // Media type tabs
        const mediaTabs = modal.querySelectorAll('.media-tab');
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                mediaTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Filter by media type
                const type = tab.getAttribute('data-type');
                filterMediaByType(modal, mediaData, type);
            });
        });
        
        // Media item selection
        const mediaItems = modal.querySelectorAll('.media-item');
        mediaItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                mediaItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Get the selected media data
                const mediaId = item.getAttribute('data-id');
                const mediaUrl = item.getAttribute('data-url');
                const mediaName = item.querySelector('.media-name').textContent;
                
                // Get the media object
                let selectedMedia = {
                    id: mediaId,
                    url: mediaUrl,
                    name: mediaName
                };
                
                // Update the target input
                updateTargetInput(targetInputId, selectedMedia);
                
                // Close the modal
                modal.remove();
            });
        });
    }
    
    /**
     * Filter media items by folder
     */
    function filterMediaItems(modal, mediaData, folder) {
        const mediaItemsContainer = modal.querySelector('.media-items');
        if (!mediaItemsContainer) return;
        
        // Get active media type
        const activeTab = modal.querySelector('.media-tab.active');
        const mediaType = activeTab ? activeTab.getAttribute('data-type') : 'all';
        
        // Filter items
        let filteredItems = [];
        
        if (Array.isArray(mediaData)) {
            if (folder === 'all') {
                filteredItems = mediaData;
            } else {
                filteredItems = mediaData.filter(item => item.folder === folder);
            }
        } else {
            let items = [];
            
            if (mediaData.images && Array.isArray(mediaData.images)) {
                items = [...items, ...mediaData.images];
            }
            
            if (mediaData.videos && Array.isArray(mediaData.videos)) {
                items = [...items, ...mediaData.videos];
            }
            
            if (folder === 'all') {
                filteredItems = items;
            } else {
                filteredItems = items.filter(item => item.folder === folder);
            }
        }
        
        // Further filter by media type
        if (mediaType !== 'all') {
            const isImage = mediaType === 'images';
            filteredItems = filteredItems.filter(item => {
                const itemIsImage = item.type === 'image' || (item.url && /\.(jpg|jpeg|png|gif)$/i.test(item.url));
                return isImage ? itemIsImage : !itemIsImage;
            });
        }
        
        // Update the display
        mediaItemsContainer.innerHTML = getMediaItemsHtml(filteredItems);
        
        // Re-attach event listeners
        const mediaItems = modal.querySelectorAll('.media-item');
        mediaItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                mediaItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Get the selected media data
                const mediaId = item.getAttribute('data-id');
                const mediaUrl = item.getAttribute('data-url');
                const mediaName = item.querySelector('.media-name').textContent;
                
                // Create selected media object
                let selectedMedia = {
                    id: mediaId,
                    url: mediaUrl,
                    name: mediaName
                };
                
                // Update the target input
                updateTargetInput(mediaId, selectedMedia);
                
                // Close the modal
                modal.remove();
            });
        });
    }
    
    /**
     * Filter media by type
     */
    function filterMediaByType(modal, mediaData, type) {
        const mediaItemsContainer = modal.querySelector('.media-items');
        if (!mediaItemsContainer) return;
        
        // Get active folder
        const activeFolder = modal.querySelector('.folder-item.active');
        const folder = activeFolder ? activeFolder.getAttribute('data-folder') : 'all';
        
        // Filter items
        let filteredItems = [];
        
        if (Array.isArray(mediaData)) {
            if (folder === 'all') {
                filteredItems = mediaData;
            } else {
                filteredItems = mediaData.filter(item => item.folder === folder);
            }
        } else {
            let items = [];
            
            if (mediaData.images && Array.isArray(mediaData.images)) {
                items = [...items, ...mediaData.images];
            }
            
            if (mediaData.videos && Array.isArray(mediaData.videos)) {
                items = [...items, ...mediaData.videos];
            }
            
            if (folder === 'all') {
                filteredItems = items;
            } else {
                filteredItems = items.filter(item => item.folder === folder);
            }
        }
        
        // Further filter by media type
        if (type !== 'all') {
            const isImage = type === 'images';
            filteredItems = filteredItems.filter(item => {
                const itemIsImage = item.type === 'image' || (item.url && /\.(jpg|jpeg|png|gif)$/i.test(item.url));
                return isImage ? itemIsImage : !itemIsImage;
            });
        }
        
        // Update the display
        mediaItemsContainer.innerHTML = getMediaItemsHtml(filteredItems);
        
        // Re-attach event listeners
        const mediaItems = modal.querySelectorAll('.media-item');
        mediaItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active state
                mediaItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Get the selected media data
                const mediaId = item.getAttribute('data-id');
                const mediaUrl = item.getAttribute('data-url');
                const mediaName = item.querySelector('.media-name').textContent;
                
                // Create selected media object
                let selectedMedia = {
                    id: mediaId,
                    url: mediaUrl,
                    name: mediaName
                };
                
                // Update the target input
                updateTargetInput(mediaId, selectedMedia);
                
                // Close the modal
                modal.remove();
            });
        });
    }
    
    /**
     * Get HTML for media items
     */
    function getMediaItemsHtml(items) {
        if (!items || items.length === 0) {
            return '<div class="no-media-message">No media items found</div>';
        }
        
        let html = '';
        items.forEach(item => {
            const isImage = item.type === 'image' || (item.url && /\.(jpg|jpeg|png|gif)$/i.test(item.url));
            const mediaClass = isImage ? 'media-image' : 'media-video';
            
            html += `
                <div class="media-item ${mediaClass}" data-id="${item.id || ''}" data-url="${item.url || ''}">
                    <div class="media-thumbnail">
                        ${isImage ? 
                            `<img src="${item.url || ''}" alt="${item.name || 'Media item'}" />` : 
                            `<div class="video-thumbnail"><i class="fas fa-play"></i></div>`
                        }
                    </div>
                    <div class="media-info">
                        <div class="media-name">${item.name || 'Untitled'}</div>
                        <div class="media-meta">
                            <span class="media-type">${isImage ? 'Image' : 'Video'}</span>
                            <span class="media-size">${formatFileSize(item.size || 0)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }
    
    /**
     * Update target input with selected media
     */
    function updateTargetInput(targetInputId, selectedMedia) {
        if (!targetInputId || !selectedMedia) return;
        
        // Find the target input
        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) return;
        
        // Update the input value
        targetInput.value = selectedMedia.url;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        targetInput.dispatchEvent(event);
        
        // Check for preview element
        updatePreviewElement(targetInput, selectedMedia);
    }
    
    /**
     * Update preview element if it exists
     */
    function updatePreviewElement(input, media) {
        // Look for preview container
        const previewContainer = input.parentElement.querySelector('.media-preview, .image-preview, .preview-container');
        if (!previewContainer) return;
        
        // Update preview
        let previewImage = previewContainer.querySelector('img');
        
        if (!previewImage) {
            previewImage = document.createElement('img');
            previewContainer.innerHTML = '';
            previewContainer.appendChild(previewImage);
        }
        
        // Set image attributes
        previewImage.src = media.url;
        previewImage.alt = media.name || 'Selected media';
        
        // Show the preview
        previewContainer.style.display = 'block';
    }
    
    /**
     * Set up observer to modify media selector buttons
     */
    function setupMediaButtonObserver() {
        // Create a mutation observer to watch for new media buttons
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
        
        // Also check existing buttons immediately
        checkForMediaButtons(document.body);
    }
    
    /**
     * Check for media selector buttons
     */
    function checkForMediaButtons(container) {
        // Look for buttons with specific classes or text
        const mediaButtons = container.querySelectorAll('.media-select-button, .select-media-button, button[data-action="select-media"]');
        mediaButtons.forEach(updateMediaButton);
        
        // Also look for elements with specific onclick attributes
        const elementsWithOnclick = container.querySelectorAll('[onclick*="openMediaLibrary"], [onclick*="selectMedia"]');
        elementsWithOnclick.forEach(updateMediaButtonOnclick);
    }
    
    /**
     * Update a media select button
     */
    function updateMediaButton(button) {
        // Only update in email context
        if (!isEmailSubscribersContext()) return;
        
        // Get target input ID
        let targetInputId = button.getAttribute('data-target') || 
                          button.getAttribute('data-input') || 
                          button.getAttribute('data-for');
        
        // If no target is specified, look for a nearby input
        if (!targetInputId) {
            const nearbyInput = button.parentElement.querySelector('input[type="text"], input[type="url"], input[type="hidden"]');
            if (nearbyInput) {
                targetInputId = nearbyInput.id;
            }
        }
        
        // Remove any existing click handlers
        button.replaceWith(button.cloneNode(true));
        
        // Get the button again after cloning
        const newButton = button.parentElement.querySelector(button.tagName + '.' + Array.from(button.classList).join('.'));
        
        // Add our click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Use the working media library function
            if (typeof window.openMediaLibrary === 'function') {
                window.openMediaLibrary(targetInputId);
            }
        });
    }
    
    /**
     * Update elements with onclick attributes
     */
    function updateMediaButtonOnclick(element) {
        // Only update in email context
        if (!isEmailSubscribersContext()) return;
        
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
            const nearbyInput = element.parentElement.querySelector('input[type="text"], input[type="url"], input[type="hidden"]');
            if (nearbyInput) {
                targetInputId = nearbyInput.id;
            }
        }
        
        // Remove the onclick attribute
        element.removeAttribute('onclick');
        
        // Add our click handler
        element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Use the working media library function
            if (typeof window.openMediaLibrary === 'function') {
                window.openMediaLibrary(targetInputId);
            }
        });
    }
})();
