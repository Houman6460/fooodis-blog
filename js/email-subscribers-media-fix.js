/**
 * Email Subscribers Media Fix
 * 
 * This script fixes the issue where the Select Media popup for the Email Subscribers feature
 * doesn't properly load folders and media items from the Media Library.
 */

(function() {
    // Global state to track initialization
    let initialized = false;
    let mediaData = null;
    
    // Initialize the fix when DOM is loaded
    document.addEventListener('DOMContentLoaded', initEmailMediaFix);
    window.addEventListener('load', initEmailMediaFix);
    
    // Also set a timeout to ensure initialization even if events fail
    setTimeout(initEmailMediaFix, 1500);
    
    // Set up periodic checks to ensure we have media data
    setInterval(checkMediaData, 3000);
    
    /**
     * Initialize the fix for Email Subscribers media selection
     */
    function initEmailMediaFix() {
        console.log('Initializing Email Subscribers Media Fix');
        
        // Override the openMediaLibrary function to use the same data as the Media Library
        overrideMediaSelector();
        
        // Set up an observer to catch any dynamically added media select buttons
        setupMediaButtonObserver();
    }
    
    /**
     * Override the openMediaLibrary function to use the actual media library data
     */
    function overrideMediaSelector() {
        // Save a reference to the original function if it exists
        if (typeof window.openMediaLibrary === 'function') {
            window.originalOpenMediaLibrary = window.openMediaLibrary;
        }
        
        // Create an enhanced version of the openMediaLibrary function
        window.openMediaLibrary = function(targetInputId) {
            console.log('Enhanced openMediaLibrary running for target:', targetInputId);
            
            // Create and show the modal
            const modal = document.createElement('div');
            modal.className = 'media-selection-modal';
            modal.innerHTML = createModalContent();
            document.body.appendChild(modal);
            
            // Set up event listeners for the modal
            setupModalEvents(modal, targetInputId);
            
            // Load folders and media from the actual Media Library
            loadMediaContent(modal);
        };
    }
    
    /**
     * Create modal content with proper structure
     */
    function createModalContent() {
        return `
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
                            <div class="folder-header">FOLDERS</div>
                            <div class="folder-list">
                                <!-- Folders will be loaded here -->
                                <div class="folder-loading">Loading folders...</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right content area -->
                    <div class="media-content">
                        <div class="media-toolbar">
                            <div class="media-filter-tabs">
                                <button class="media-tab active" data-type="all">All Media</button>
                                <button class="media-tab" data-type="images">Images</button>
                                <button class="media-tab" data-type="videos">Videos</button>
                            </div>
                        </div>
                        <div class="media-items-container">
                            <!-- Media items will be loaded here -->
                            <div class="media-loading">Loading media...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for the modal
     */
    function setupModalEvents(modal, targetInputId) {
        // Close button
        const closeButton = modal.querySelector('.close-media-selection');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                modal.remove();
            });
        }
        
        // Close on click outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Tab switching
        const mediaTabs = modal.querySelectorAll('.media-tab');
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Update active tab
                mediaTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Filter media based on selected tab
                const mediaType = this.dataset.type || 'all';
                filterMediaByType(modal, mediaType);
            });
        });
        
        // Search functionality
        const searchInput = modal.querySelector('.media-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                searchMedia(modal, searchTerm);
            });
        }
    }
    
    /**
     * Check for media data availability and pre-load it if possible
     */
    function checkMediaData() {
        if (mediaData !== null) return;
        
        console.log('Email Subscribers Media Fix: Checking for media data...');
        
        // Initialize media data structure
        mediaData = { 
            images: [], 
            videos: [],
            folders: []
        };
        
        // Try multiple sources to get media data
        let imagesSources = [
            // MediaGallery global state
            () => window.MediaGallery?.state?.mediaItems?.images,
            // mediaItems global variable
            () => window.mediaItems?.images,
            // LocalStorage with different keys
            () => {
                const saved = localStorage.getItem('fooodis_media_images');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('fooodis-media-images');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('media_images');
                return saved ? JSON.parse(saved) : null;
            }
        ];
        
        let videosSource = [
            // MediaGallery global state
            () => window.MediaGallery?.state?.mediaItems?.videos,
            // mediaItems global variable
            () => window.mediaItems?.videos,
            // LocalStorage with different keys
            () => {
                const saved = localStorage.getItem('fooodis_media_videos');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('fooodis-media-videos');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('media_videos');
                return saved ? JSON.parse(saved) : null;
            }
        ];
        
        // Try all sources for images
        for (let source of imagesSources) {
            try {
                const images = source();
                if (images && Array.isArray(images) && images.length > 0) {
                    console.log(`Email Subscribers Media Fix: Found ${images.length} images`);
                    mediaData.images = images;
                    break;
                }
            } catch (e) {
                // Continue to next source
            }
        }
        
        // Try all sources for videos
        for (let source of videosSource) {
            try {
                const videos = source();
                if (videos && Array.isArray(videos) && videos.length > 0) {
                    console.log(`Email Subscribers Media Fix: Found ${videos.length} videos`);
                    mediaData.videos = videos;
                    break;
                }
            } catch (e) {
                // Continue to next source
            }
        }
        
        // Get folders data
        let folderSources = [
            // Global mediaFolders variable
            () => window.mediaFolders,
            // LocalStorage with different keys
            () => {
                const saved = localStorage.getItem('fooodis-media-folders');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('fooodis_media_folders');
                return saved ? JSON.parse(saved) : null;
            },
            () => {
                const saved = localStorage.getItem('media_folders');
                return saved ? JSON.parse(saved) : null;
            }
        ];
        
        // Try all sources for folders
        for (let source of folderSources) {
            try {
                const folders = source();
                if (folders && Array.isArray(folders) && folders.length > 0) {
                    console.log(`Email Subscribers Media Fix: Found ${folders.length} folders`);
                    mediaData.folders = folders;
                    break;
                }
            } catch (e) {
                // Continue to next source
            }
        }
        
        // If still no folders, create defaults
        if (mediaData.folders.length === 0) {
            mediaData.folders = [
                { id: 'food', name: 'Food', icon: 'utensils' },
                { id: 'restaurant', name: 'Restaurant', icon: 'store' },
                { id: 'people', name: 'People', icon: 'users' }
            ];
            console.log('Email Subscribers Media Fix: Using default folders');
        }
        
        // Log the result
        console.log('Email Subscribers Media Fix: Media data loaded', {
            images: mediaData.images.length,
            videos: mediaData.videos.length,
            folders: mediaData.folders.length
        });
    }
    
    /**
     * Load media content from the Media Library
     */
    function loadMediaContent(modal) {
        console.log('Email Subscribers Media Fix: Loading media content...');
        
        const folderList = modal.querySelector('.folder-list');
        const mediaContainer = modal.querySelector('.media-items-container');
        
        // Clear loading messages
        if (folderList) folderList.innerHTML = '';
        if (mediaContainer) mediaContainer.innerHTML = '';
        
        // Check if we already have media data loaded
        if (!mediaData) {
            checkMediaData();
        }
        
        // Create local copies for this rendering
        let mediaItems = { 
            images: mediaData?.images || [], 
            videos: mediaData?.videos || [] 
        };
        
        // If we still don't have any images, try one more approach - direct DOM scraping
        if (mediaItems.images.length === 0) {
            console.log('Email Subscribers Media Fix: Attempting to find media via DOM...');
            try {
                // Look for media items in the Media Library section
                const mediaLibrarySection = document.getElementById('media-library-section');
                if (mediaLibrarySection) {
                    const mediaElements = mediaLibrarySection.querySelectorAll('.media-item');
                    const scrapedImages = [];
                    
                    mediaElements.forEach((element, index) => {
                        const img = element.querySelector('img');
                        if (img && img.src) {
                            scrapedImages.push({
                                id: `scraped-image-${index}`,
                                name: img.alt || `Image ${index + 1}`,
                                url: img.src,
                                type: 'image',
                                folder: element.dataset.folder || 'uncategorized',
                                date: new Date().toISOString(),
                                size: 0
                            });
                        }
                    });
                    
                    if (scrapedImages.length > 0) {
                        console.log(`Email Subscribers Media Fix: Found ${scrapedImages.length} images via DOM scraping`);
                        mediaItems.images = scrapedImages;
                    }
                }
            } catch (error) {
                console.error('Error while DOM scraping for images:', error);
            }
        }
        
        // Use pre-loaded folder data
        let folders = mediaData?.folders || [];
        
        // Add All Media and Uncategorized folders if they don't exist
        const allFolder = { id: 'all', name: 'All Media', icon: 'photo-video' };
        const uncategorizedFolder = { id: 'uncategorized', name: 'Uncategorized', icon: 'folder' };
        
        // Check if we need to add these special folders
        const hasAllFolder = folders.some(f => f.id === 'all');
        const hasUncategorizedFolder = folders.some(f => f.id === 'uncategorized');
        
        // Create a new array with the special folders at the beginning
        let allFolders = [];
        
        // Always add All Media folder first
        if (!hasAllFolder) {
            allFolders.push(allFolder);
        }
        
        // Always add Uncategorized folder second
        if (!hasUncategorizedFolder) {
            allFolders.push(uncategorizedFolder);
        }
        
        // Add all other folders, excluding any duplicates of all or uncategorized
        allFolders = [
            ...allFolders,
            ...folders.filter(f => f.id !== 'all' && f.id !== 'uncategorized')
        ];
        
        // Use a sensible fallback if we still have no folders
        if (allFolders.length === 0) {
            console.warn('Email Subscribers Media Fix: No folders available, using defaults');
            allFolders = [
                allFolder,
                uncategorizedFolder,
                { id: 'food', name: 'Food', icon: 'utensils' },
                { id: 'restaurant', name: 'Restaurant', icon: 'store' },
                { id: 'people', name: 'People', icon: 'users' }
            ];
        }
        
        // Log the folders we're using
        console.log('Email Subscribers Media Fix: Using folders', allFolders);
        
        // Render folders
        renderFolders(modal, allFolders, mediaItems);
        
        // Render all media initially
        renderMedia(modal, mediaItems, 'all');
        
        // Add click handlers to folders
        setupFolderClickHandlers(modal, allFolders, mediaItems);
        
        // Add click handlers to media items
        setupMediaItemClickHandlers(modal, mediaItems);
    }
    
    /**
     * Render folders in the sidebar
     */
    function renderFolders(modal, folders, mediaItems) {
        const folderList = modal.querySelector('.folder-list');
        if (!folderList) return;
        
        let folderHtml = '';
        
        // Loop through all folders
        folders.forEach(folder => {
            // Calculate media count for this folder
            const count = countMediaInFolder(folder.id, mediaItems);
            
            folderHtml += `
                <div class="folder-item ${folder.id === 'all' ? 'active' : ''}" data-folder-id="${folder.id}">
                    <i class="fas fa-${folder.icon || 'folder'}"></i> ${folder.name}
                    <span class="folder-count">${count}</span>
                </div>
            `;
        });
        
        folderList.innerHTML = folderHtml;
    }
    
    /**
     * Count media items in a specific folder
     */
    function countMediaInFolder(folderId, mediaItems) {
        if (folderId === 'all') {
            return (mediaItems.images?.length || 0) + (mediaItems.videos?.length || 0);
        }
        
        let count = 0;
        
        // Count images in folder
        if (mediaItems.images && mediaItems.images.length > 0) {
            mediaItems.images.forEach(image => {
                if (folderId === 'uncategorized' && (!image.folder || image.folder === 'uncategorized')) {
                    count++;
                } else if (image.folder === folderId) {
                    count++;
                }
            });
        }
        
        // Count videos in folder
        if (mediaItems.videos && mediaItems.videos.length > 0) {
            mediaItems.videos.forEach(video => {
                if (folderId === 'uncategorized' && (!video.folder || video.folder === 'uncategorized')) {
                    count++;
                } else if (video.folder === folderId) {
                    count++;
                }
            });
        }
        
        return count;
    }
    
    /**
     * Render media items in the content area
     */
    function renderMedia(modal, mediaItems, folderId = 'all', mediaType = 'all') {
        const mediaContainer = modal.querySelector('.media-items-container');
        if (!mediaContainer) return;
        
        // Filter media by folder and type
        let filteredMedia = [];
        
        // Add images if needed
        if (mediaType === 'all' || mediaType === 'images') {
            if (mediaItems.images && mediaItems.images.length > 0) {
                if (folderId === 'all') {
                    filteredMedia = [...filteredMedia, ...mediaItems.images];
                } else if (folderId === 'uncategorized') {
                    filteredMedia = [
                        ...filteredMedia, 
                        ...mediaItems.images.filter(image => !image.folder || image.folder === 'uncategorized')
                    ];
                } else {
                    filteredMedia = [
                        ...filteredMedia,
                        ...mediaItems.images.filter(image => image.folder === folderId)
                    ];
                }
            }
        }
        
        // Add videos if needed
        if (mediaType === 'all' || mediaType === 'videos') {
            if (mediaItems.videos && mediaItems.videos.length > 0) {
                if (folderId === 'all') {
                    filteredMedia = [...filteredMedia, ...mediaItems.videos];
                } else if (folderId === 'uncategorized') {
                    filteredMedia = [
                        ...filteredMedia,
                        ...mediaItems.videos.filter(video => !video.folder || video.folder === 'uncategorized')
                    ];
                } else {
                    filteredMedia = [
                        ...filteredMedia,
                        ...mediaItems.videos.filter(video => video.folder === folderId)
                    ];
                }
            }
        }
        
        // Sort by date (newest first)
        filteredMedia.sort((a, b) => {
            return new Date(b.date || 0) - new Date(a.date || 0);
        });
        
        // Generate HTML
        let mediaHtml = '';
        
        if (filteredMedia.length === 0) {
            mediaHtml = '<div class="no-media-message">No media found in this folder</div>';
        } else {
            mediaHtml = '<div class="media-grid">';
            
            filteredMedia.forEach(item => {
                const isImage = item.type === 'image' || (item.url && (item.url.endsWith('.jpg') || item.url.endsWith('.jpeg') || item.url.endsWith('.png') || item.url.endsWith('.gif')));
                const mediaClass = isImage ? 'media-image' : 'media-video';
                const iconClass = isImage ? 'image' : 'video';
                
                mediaHtml += `
                    <div class="media-item ${mediaClass}" data-media-id="${item.id}" data-media-type="${isImage ? 'image' : 'video'}">
                        <div class="media-thumbnail">
                            ${isImage ? 
                                `<img src="${item.url || item.thumbnailUrl || ''}" alt="${item.name || 'Media item'}" />` : 
                                `<div class="video-thumbnail"><i class="fas fa-play-circle"></i></div>`
                            }
                        </div>
                        <div class="media-info">
                            <div class="media-name">${item.name || 'Untitled'}</div>
                            <div class="media-meta">
                                <span class="media-type"><i class="fas fa-${iconClass}"></i> ${isImage ? 'Image' : 'Video'}</span>
                                <span class="media-size">${formatFileSize(item.size || 0)}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            mediaHtml += '</div>';
        }
        
        mediaContainer.innerHTML = mediaHtml;
    }
    
    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Set up click handlers for folders
     */
    function setupFolderClickHandlers(modal, folders, mediaItems) {
        const folderItems = modal.querySelectorAll('.folder-item');
        
        folderItems.forEach(folder => {
            folder.addEventListener('click', function() {
                // Update active folder
                folderItems.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Get folder ID
                const folderId = this.dataset.folderId;
                
                // Get current media type
                const activeTab = modal.querySelector('.media-tab.active');
                const mediaType = activeTab ? activeTab.dataset.type : 'all';
                
                // Render media for this folder
                renderMedia(modal, mediaItems, folderId, mediaType);
            });
        });
    }
    
    /**
     * Set up click handlers for media items
     */
    function setupMediaItemClickHandlers(modal, mediaItems) {
        modal.addEventListener('click', function(e) {
            const mediaItem = e.target.closest('.media-item');
            if (!mediaItem) return;
            
            // Get media ID and type
            const mediaId = mediaItem.dataset.mediaId;
            const mediaType = mediaItem.dataset.mediaType;
            
            // Find the media item in our data
            let selectedMedia = null;
            
            if (mediaType === 'image') {
                selectedMedia = mediaItems.images.find(item => item.id === mediaId);
            } else if (mediaType === 'video') {
                selectedMedia = mediaItems.videos.find(item => item.id === mediaId);
            }
            
            if (!selectedMedia) {
                console.error('Media item not found:', mediaId);
                return;
            }
            
            // Get the target input ID
            const targetInputId = modal.getAttribute('data-target-input');
            
            // Update the input with selected media
            updateInput(targetInputId, selectedMedia);
            
            // Show selection feedback
            showSelectionFeedback(selectedMedia);
            
            // Close the modal
            modal.remove();
        });
    }
    
    /**
     * Update an input with selected media
     */
    function updateInput(inputId, media) {
        if (!inputId || !media) return;
        
        // Find the input element
        const input = document.getElementById(inputId);
        if (!input) {
            console.error('Target input not found:', inputId);
            return;
        }
        
        // If it's a file input, we need special handling
        if (input.type === 'file') {
            // Create a custom event to inform other scripts
            const event = new CustomEvent('mediaSelected', {
                detail: {
                    inputId: inputId,
                    media: media
                }
            });
            
            // Dispatch the event
            document.dispatchEvent(event);
            
            // Also update any preview elements
            updatePreviewElements(inputId, media);
        } else {
            // For regular inputs, just set the value to the URL
            input.value = media.url || '';
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
    
    /**
     * Update preview elements for the selected media
     */
    function updatePreviewElements(inputId, media) {
        // Find the parent form or container
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const container = input.closest('form') || input.closest('.form-group') || input.parentElement;
        if (!container) return;
        
        // Look for preview elements
        const previewElements = container.querySelectorAll('.image-preview, .media-preview, .preview-image');
        
        previewElements.forEach(preview => {
            // If it's an img element
            if (preview.tagName === 'IMG') {
                preview.src = media.url || '';
                preview.alt = media.name || 'Selected media';
                
                // Make sure it's visible
                preview.style.display = 'block';
            } 
            // If it's a div with background-image
            else {
                preview.style.backgroundImage = `url(${media.url || ''})`;
                
                // Make sure it's visible
                preview.style.display = 'block';
            }
        });
        
        // Also update any file name displays
        const fileNameElements = container.querySelectorAll('.file-name, .selected-file-name, .file-display');
        
        fileNameElements.forEach(element => {
            element.textContent = media.name || 'Selected media';
            element.style.display = 'block';
        });
    }
    
    /**
     * Show feedback that an image was selected
     */
    function showSelectionFeedback(media) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'media-selection-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Media selected: ${media.name || 'Untitled'}</span>
            </div>
        `;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show and then hide after a delay
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Filter media by type
     */
    function filterMediaByType(modal, mediaType) {
        // Get the current folder
        const activeFolder = modal.querySelector('.folder-item.active');
        const folderId = activeFolder ? activeFolder.dataset.folderId : 'all';
        
        // Get the media items
        let mediaItems = { images: [], videos: [] };
        
        // Try to get data from the Media Library global object first
        if (window.MediaGallery && window.MediaGallery.state) {
            mediaItems.images = window.MediaGallery.state.mediaItems?.images || [];
            mediaItems.videos = window.MediaGallery.state.mediaItems?.videos || [];
        } else {
            try {
                const savedImages = localStorage.getItem('fooodis_media_images');
                if (savedImages) {
                    mediaItems.images = JSON.parse(savedImages);
                }
                
                const savedVideos = localStorage.getItem('fooodis_media_videos');
                if (savedVideos) {
                    mediaItems.videos = JSON.parse(savedVideos);
                }
            } catch (error) {
                console.error('Error loading media from localStorage:', error);
            }
        }
        
        // Render media for the current folder and selected type
        renderMedia(modal, mediaItems, folderId, mediaType);
    }
    
    /**
     * Search media by name
     */
    function searchMedia(modal, searchTerm) {
        if (!searchTerm) {
            // If search is cleared, go back to normal view
            const activeTab = modal.querySelector('.media-tab.active');
            const mediaType = activeTab ? activeTab.dataset.type : 'all';
            
            const activeFolder = modal.querySelector('.folder-item.active');
            const folderId = activeFolder ? activeFolder.dataset.folderId : 'all';
            
            // Get the media items
            let mediaItems = { images: [], videos: [] };
            
            // Try to get data from the Media Library global object first
            if (window.MediaGallery && window.MediaGallery.state) {
                mediaItems.images = window.MediaGallery.state.mediaItems?.images || [];
                mediaItems.videos = window.MediaGallery.state.mediaItems?.videos || [];
            } else {
                try {
                    const savedImages = localStorage.getItem('fooodis_media_images');
                    if (savedImages) {
                        mediaItems.images = JSON.parse(savedImages);
                    }
                    
                    const savedVideos = localStorage.getItem('fooodis_media_videos');
                    if (savedVideos) {
                        mediaItems.videos = JSON.parse(savedVideos);
                    }
                } catch (error) {
                    console.error('Error loading media from localStorage:', error);
                }
            }
            
            // Render media for the current folder and selected type
            renderMedia(modal, mediaItems, folderId, mediaType);
            return;
        }
        
        // Get all media items
        let mediaItems = { images: [], videos: [] };
        
        // Try to get data from the Media Library global object first
        if (window.MediaGallery && window.MediaGallery.state) {
            mediaItems.images = window.MediaGallery.state.mediaItems?.images || [];
            mediaItems.videos = window.MediaGallery.state.mediaItems?.videos || [];
        } else {
            try {
                const savedImages = localStorage.getItem('fooodis_media_images');
                if (savedImages) {
                    mediaItems.images = JSON.parse(savedImages);
                }
                
                const savedVideos = localStorage.getItem('fooodis_media_videos');
                if (savedVideos) {
                    mediaItems.videos = JSON.parse(savedVideos);
                }
            } catch (error) {
                console.error('Error loading media from localStorage:', error);
            }
        }
        
        // Filter by search term
        const filteredImages = mediaItems.images.filter(image => 
            (image.name && image.name.toLowerCase().includes(searchTerm)) || 
            (image.folder && image.folder.toLowerCase().includes(searchTerm))
        );
        
        const filteredVideos = mediaItems.videos.filter(video => 
            (video.name && video.name.toLowerCase().includes(searchTerm)) || 
            (video.folder && video.folder.toLowerCase().includes(searchTerm))
        );
        
        // Create a new media object with filtered items
        const filteredMedia = {
            images: filteredImages,
            videos: filteredVideos
        };
        
        // Get the current media type
        const activeTab = modal.querySelector('.media-tab.active');
        const mediaType = activeTab ? activeTab.dataset.type : 'all';
        
        // Render the filtered media
        renderMedia(modal, filteredMedia, 'all', mediaType);
    }
    
    /**
     * Set up an observer to detect media select buttons added to the DOM
     */
    function setupMediaButtonObserver() {
        // Create a mutation observer to watch for added media buttons
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            // Check for media select buttons
                            const mediaButtons = node.querySelectorAll 
                                ? node.querySelectorAll('.media-library-button, .select-media-btn, [data-action="select-media"]')
                                : [];
                                
                            if (mediaButtons.length > 0) {
                                // Found media buttons, update them
                                console.log(`Found ${mediaButtons.length} dynamically added media buttons`);
                                mediaButtons.forEach(updateMediaButton);
                            }
                        }
                    }
                }
            });
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Update a media select button to use our enhanced openMediaLibrary function
     */
    function updateMediaButton(button) {
        // First, remove any existing click listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Add our enhanced click handler
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the input ID from data attribute or parent relation
            let targetInputId = newButton.dataset.targetInput;
            
            // If not specified directly, try to find related input
            if (!targetInputId) {
                const parentContainer = newButton.closest('.form-group') || newButton.closest('.customization-option');
                if (parentContainer) {
                    const input = parentContainer.querySelector('input[type="file"], input[type="text"], input[type="hidden"]');
                    if (input) {
                        targetInputId = input.id;
                    }
                }
            }
            
            // Use our enhanced openMediaLibrary function
            if (targetInputId) {
                window.openMediaLibrary(targetInputId);
            } else {
                console.error('No target input found for media selector');
            }
        });
    }
    
})();
