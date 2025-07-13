/**
 * Media Gallery
 * Provides a tabbed interface to manage and select different types of media (images, videos)
 * for use in blog posts.
 */

(function() {
    // Main gallery object
    const MediaGallery = {
        // Configuration
        config: {
            galleryContainerId: 'media-gallery-modal',
            uploadFormId: 'media-upload-form',
            acceptedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            acceptedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            thumbnailSize: 150,
            storageKeyPrefix: 'fooodis_media_'
        },
        
        // State management
        state: {
            mediaItems: {
                images: [],
                videos: []
            },
            activeTab: 'images',
            isInitialized: false,
            selectedMedia: null
        },
        
        // Initialize the gallery
        init: function() {
            console.log('MediaGallery: Initializing...');
            
            // Don't initialize more than once
            if (this.state.isInitialized) {
                return;
            }
            
            // Create gallery UI if it doesn't exist
            this.createGalleryUI();
            
            // Load saved media from localStorage
            this.loadSavedMedia();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Mark as initialized
            this.state.isInitialized = true;
            
            console.log('MediaGallery: Initialized successfully');
        },
        
        // Create the gallery UI
        createGalleryUI: function() {
            if (document.getElementById(this.config.galleryContainerId)) {
                return; // Already exists
            }
            
            const modal = document.createElement('div');
            modal.id = this.config.galleryContainerId;
            modal.className = 'media-gallery-modal';
            
            modal.innerHTML = `
                <div class="media-gallery-dialog">
                    <div class="media-gallery-header">
                        <h3>Media Gallery</h3>
                        <button type="button" class="close-button" data-action="close-gallery">&times;</button>
                    </div>
                    
                    <div class="media-gallery-tabs">
                        <button type="button" class="tab-button active" data-tab="images">Images</button>
                        <button type="button" class="tab-button" data-tab="videos">Videos</button>
                    </div>
                    
                    <div class="media-gallery-upload">
                        <form id="${this.config.uploadFormId}">
                            <div class="upload-inputs">
                                <input type="file" id="media-file-input" name="media" accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.ogg,.mov" />
                                <button type="submit" class="upload-button">Upload</button>
                            </div>
                            <div class="upload-progress-container" style="display: none;">
                                <div class="upload-progress-bar"></div>
                                <div class="upload-progress-text">0%</div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="media-gallery-content">
                        <div class="tab-content active" id="tab-images">
                            <div class="media-items-container" id="images-container"></div>
                            <div class="no-media-message" id="no-images-message">No images uploaded yet. Upload your first image above.</div>
                        </div>
                        
                        <div class="tab-content" id="tab-videos">
                            <div class="media-items-container" id="videos-container"></div>
                            <div class="no-media-message" id="no-videos-message">No videos uploaded yet. Upload your first video above.</div>
                        </div>
                    </div>
                    
                    <div class="media-gallery-footer">
                        <div class="selected-media-info"></div>
                        <div class="media-gallery-actions">
                            <button type="button" class="cancel-button" data-action="close-gallery">Cancel</button>
                            <button type="button" class="insert-button" data-action="insert-media" disabled>Insert Selected Media</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add gallery styles
            this.addGalleryStyles();
        },
        
        // Add styles for the gallery
        addGalleryStyles: function() {
            const styleId = 'media-gallery-styles';
            if (document.getElementById(styleId)) {
                return; // Styles already added
            }
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .media-gallery-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    z-index: 10000;
                    align-items: center;
                    justify-content: center;
                }
                
                .media-gallery-modal.open {
                    display: flex;
                }
                
                .media-gallery-dialog {
                    background-color: #fff;
                    width: 90%;
                    max-width: 900px;
                    max-height: 90vh;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .media-gallery-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .media-gallery-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #888;
                }
                
                .close-button:hover {
                    color: #333;
                }
                
                .media-gallery-tabs {
                    display: flex;
                    border-bottom: 1px solid #eee;
                    padding: 0 20px;
                }
                
                .tab-button {
                    padding: 10px 20px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    font-size: 1rem;
                    border-bottom: 3px solid transparent;
                    margin-right: 5px;
                }
                
                .tab-button.active {
                    border-bottom-color: #0d6efd;
                    color: #0d6efd;
                    font-weight: bold;
                }
                
                .media-gallery-upload {
                    padding: 15px 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .upload-inputs {
                    display: flex;
                    gap: 10px;
                }
                
                .upload-button {
                    padding: 8px 15px;
                    background-color: #0d6efd;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .upload-progress-container {
                    margin-top: 10px;
                    height: 20px;
                    background-color: #f0f0f0;
                    border-radius: 4px;
                    position: relative;
                }
                
                .upload-progress-bar {
                    height: 100%;
                    background-color: #0d6efd;
                    border-radius: 4px;
                    width: 0%;
                }
                
                .upload-progress-text {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    text-align: center;
                    line-height: 20px;
                    color: white;
                    font-size: 0.8rem;
                }
                
                .media-gallery-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .tab-content {
                    display: none;
                }
                
                .tab-content.active {
                    display: block;
                }
                
                .media-items-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                
                .media-item {
                    border: 2px solid transparent;
                    border-radius: 4px;
                    overflow: hidden;
                    cursor: pointer;
                    position: relative;
                    aspect-ratio: 1;
                    background-color: #f8f9fa;
                }
                
                .media-item:hover {
                    border-color: #ccc;
                }
                
                .media-item.selected {
                    border-color: #0d6efd;
                }
                
                .media-item img, .media-item video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .media-item .media-info {
                    display: none;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 5px;
                    font-size: 0.75rem;
                    text-align: center;
                }
                
                .media-item:hover .media-info {
                    display: block;
                }
                
                .no-media-message {
                    text-align: center;
                    padding: 30px;
                    color: #888;
                }
                
                .media-gallery-footer {
                    border-top: 1px solid #eee;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .selected-media-info {
                    color: #666;
                    font-size: 0.9rem;
                }
                
                .media-gallery-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .cancel-button {
                    padding: 8px 15px;
                    background-color: #f8f9fa;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .insert-button {
                    padding: 8px 15px;
                    background-color: #0d6efd;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .insert-button:disabled {
                    background-color: #a9c8fa;
                    cursor: not-allowed;
                }
            `;
            
            document.head.appendChild(style);
        },
        
        // Load saved media from localStorage
        loadSavedMedia: function() {
            // Load images
            const savedImages = localStorage.getItem(this.config.storageKeyPrefix + 'images');
            if (savedImages) {
                try {
                    this.state.mediaItems.images = JSON.parse(savedImages);
                } catch (e) {
                    console.error('MediaGallery: Error parsing saved images', e);
                    this.state.mediaItems.images = [];
                }
            }
            
            // Load videos
            const savedVideos = localStorage.getItem(this.config.storageKeyPrefix + 'videos');
            if (savedVideos) {
                try {
                    this.state.mediaItems.videos = JSON.parse(savedVideos);
                } catch (e) {
                    console.error('MediaGallery: Error parsing saved videos', e);
                    this.state.mediaItems.videos = [];
                }
            }
            
            // Render media items
            this.renderMediaItems('images');
            this.renderMediaItems('videos');
        },
        
        // Setup event listeners
        setupEventListeners: function() {
            // Get the gallery modal
            const modal = document.getElementById(this.config.galleryContainerId);
            
            // Tab switching
            const tabButtons = modal.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const tab = e.target.getAttribute('data-tab');
                    this.switchTab(tab);
                });
            });
            
            // Close gallery
            const closeButtons = modal.querySelectorAll('[data-action="close-gallery"]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.closeGallery();
                });
            });
            
            // Insert media
            const insertButton = modal.querySelector('[data-action="insert-media"]');
            insertButton.addEventListener('click', () => {
                this.insertSelectedMedia();
            });
            
            // Media upload
            const uploadForm = document.getElementById(this.config.uploadFormId);
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMediaUpload();
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('open')) {
                    this.closeGallery();
                }
            });
            
            // Close when clicking outside the dialog
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeGallery();
                }
            });
        },
        
        // Open the gallery
        openGallery: function(callback) {
            // Store callback for later use
            this.onMediaSelected = callback || function() {};
            
            const modal = document.getElementById(this.config.galleryContainerId);
            modal.classList.add('open');
            
            // Reset selection
            this.state.selectedMedia = null;
            this.updateInsertButton();
            
            // Switch to first tab
            this.switchTab('images');
        },
        
        // Close the gallery
        closeGallery: function() {
            const modal = document.getElementById(this.config.galleryContainerId);
            modal.classList.remove('open');
        },
        
        // Switch between tabs
        switchTab: function(tab) {
            const modal = document.getElementById(this.config.galleryContainerId);
            
            // Update active tab
            this.state.activeTab = tab;
            
            // Update tab buttons
            const tabButtons = modal.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === tab) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Update tab content
            const tabContents = modal.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                if (content.id === 'tab-' + tab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // Update file input accept attribute based on the active tab
            const fileInput = document.getElementById('media-file-input');
            if (tab === 'images') {
                fileInput.accept = '.jpg,.jpeg,.png,.gif,.webp,.svg';
            } else if (tab === 'videos') {
                fileInput.accept = '.mp4,.webm,.ogg,.mov';
            }
        },
        
        // Handle media upload
        handleMediaUpload: function() {
            const fileInput = document.getElementById('media-file-input');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file to upload.');
                return;
            }
            
            // Check file size
            if (file.size > this.config.maxFileSize) {
                alert(`File is too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB.`);
                return;
            }
            
            // Determine if this is an image or video
            const isImage = this.config.acceptedImageTypes.includes(file.type);
            const isVideo = this.config.acceptedVideoTypes.includes(file.type);
            
            if (!isImage && !isVideo) {
                alert('Unsupported file type. Please upload an image or video file.');
                return;
            }
            
            // Show progress container
            const progressContainer = document.querySelector('.upload-progress-container');
            const progressBar = document.querySelector('.upload-progress-bar');
            const progressText = document.querySelector('.upload-progress-text');
            
            progressContainer.style.display = 'block';
            
            // Read file as DataURL
            const reader = new FileReader();
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = progress + '%';
                    progressText.textContent = progress + '%';
                }
            };
            
            reader.onerror = () => {
                progressContainer.style.display = 'none';
                alert('Error reading file. Please try again.');
            };
            
            reader.onload = (e) => {
                // Create the media item object
                const mediaItem = {
                    id: 'media_' + Date.now(),
                    type: isImage ? 'image' : 'video',
                    name: file.name,
                    size: file.size,
                    dataUrl: e.target.result,
                    date: new Date().toISOString()
                };
                
                // Add to appropriate array
                const mediaType = isImage ? 'images' : 'videos';
                this.state.mediaItems[mediaType].unshift(mediaItem);
                
                // Save to localStorage
                this.saveMediaItems(mediaType);
                
                // Render the updated list
                this.renderMediaItems(mediaType);
                
                // Hide progress and reset form
                progressContainer.style.display = 'none';
                fileInput.value = '';
                
                // Switch to the appropriate tab if needed
                if (this.state.activeTab !== mediaType) {
                    this.switchTab(mediaType);
                }
            };
            
            reader.readAsDataURL(file);
        },
        
        // Save media items to localStorage
        saveMediaItems: function(type) {
            try {
                localStorage.setItem(
                    this.config.storageKeyPrefix + type,
                    JSON.stringify(this.state.mediaItems[type])
                );
                console.log(`MediaGallery: Saved ${type} to localStorage`);
            } catch (e) {
                console.error(`MediaGallery: Error saving ${type} to localStorage`, e);
                
                // If localStorage is full, try to delete some old items
                if (e.name === 'QuotaExceededError') {
                    this.cleanupOldMedia(type);
                }
            }
        },
        
        // Clean up old media if localStorage is full
        cleanupOldMedia: function(type) {
            console.log(`MediaGallery: Cleaning up old ${type}...`);
            
            // Keep only the 20 most recent items
            if (this.state.mediaItems[type].length > 20) {
                this.state.mediaItems[type] = this.state.mediaItems[type].slice(0, 20);
                
                // Try to save again
                try {
                    localStorage.setItem(
                        this.config.storageKeyPrefix + type,
                        JSON.stringify(this.state.mediaItems[type])
                    );
                    console.log(`MediaGallery: Successfully cleaned up and saved ${type}`);
                } catch (e) {
                    console.error(`MediaGallery: Error saving ${type} even after cleanup`, e);
                }
            }
        },
        
        // Render media items in the gallery
        renderMediaItems: function(type) {
            const container = document.getElementById(type + '-container');
            const noMediaMessage = document.getElementById('no-' + type + '-message');
            
            if (!container || !noMediaMessage) {
                console.error(`MediaGallery: Container or message elements not found for ${type}`);
                return;
            }
            
            // Clear the container
            container.innerHTML = '';
            
            // Show/hide the no media message
            if (this.state.mediaItems[type].length === 0) {
                noMediaMessage.style.display = 'block';
                container.style.display = 'none';
                return;
            } else {
                noMediaMessage.style.display = 'none';
                container.style.display = 'grid';
            }
            
            // Render each item
            this.state.mediaItems[type].forEach(item => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.dataset.id = item.id;
                mediaItem.dataset.type = item.type;
                
                if (this.state.selectedMedia && this.state.selectedMedia.id === item.id) {
                    mediaItem.classList.add('selected');
                }
                
                if (item.type === 'image') {
                    mediaItem.innerHTML = `
                        <img src="${item.dataUrl}" alt="${item.name}" />
                        <div class="media-info">${item.name}</div>
                    `;
                } else if (item.type === 'video') {
                    mediaItem.innerHTML = `
                        <video src="${item.dataUrl}" muted loop></video>
                        <div class="media-info">${item.name}</div>
                    `;
                    
                    // Add play/pause on hover for videos
                    const video = mediaItem.querySelector('video');
                    mediaItem.addEventListener('mouseenter', () => {
                        video.play().catch(() => {}); // Ignore autoplay restrictions
                    });
                    mediaItem.addEventListener('mouseleave', () => {
                        video.pause();
                    });
                }
                
                // Add click event for selection
                mediaItem.addEventListener('click', () => {
                    this.selectMediaItem(item);
                });
                
                container.appendChild(mediaItem);
            });
        },
        
        // Select a media item
        selectMediaItem: function(item) {
            // Update state
            this.state.selectedMedia = item;
            
            // Update UI
            const mediaItems = document.querySelectorAll('.media-item');
            mediaItems.forEach(mediaItem => {
                if (mediaItem.dataset.id === item.id) {
                    mediaItem.classList.add('selected');
                } else {
                    mediaItem.classList.remove('selected');
                }
            });
            
            // Update selected media info
            const infoElement = document.querySelector('.selected-media-info');
            if (infoElement) {
                const fileSize = this.formatFileSize(item.size);
                infoElement.textContent = `Selected: ${item.name} (${fileSize})`;
            }
            
            // Update insert button
            this.updateInsertButton();
        },
        
        // Update the insert button state
        updateInsertButton: function() {
            const insertButton = document.querySelector('[data-action="insert-media"]');
            if (insertButton) {
                insertButton.disabled = !this.state.selectedMedia;
            }
        },
        
        // Insert the selected media into the editor
        insertSelectedMedia: function() {
            if (!this.state.selectedMedia) {
                return;
            }
            
            // Call the callback with the selected media
            if (typeof this.onMediaSelected === 'function') {
                this.onMediaSelected(this.state.selectedMedia);
            }
            
            // Close the gallery
            this.closeGallery();
        },
        
        // Helper to format file size
        formatFileSize: function(bytes) {
            if (bytes < 1024) {
                return bytes + ' B';
            } else if (bytes < 1024 * 1024) {
                return (bytes / 1024).toFixed(1) + ' KB';
            } else {
                return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
            }
        },
        
        // Delete a media item
        deleteMediaItem: function(id) {
            // Find the item
            let itemType = null;
            let itemIndex = -1;
            
            for (const type of ['images', 'videos']) {
                const index = this.state.mediaItems[type].findIndex(item => item.id === id);
                if (index !== -1) {
                    itemType = type;
                    itemIndex = index;
                    break;
                }
            }
            
            if (!itemType || itemIndex === -1) {
                console.error('MediaGallery: Media item not found', id);
                return;
            }
            
            // Remove from array
            this.state.mediaItems[itemType].splice(itemIndex, 1);
            
            // Save to localStorage
            this.saveMediaItems(itemType);
            
            // Render the updated list
            this.renderMediaItems(itemType);
            
            // Reset selection if this was the selected item
            if (this.state.selectedMedia && this.state.selectedMedia.id === id) {
                this.state.selectedMedia = null;
                this.updateInsertButton();
                
                const infoElement = document.querySelector('.selected-media-info');
                if (infoElement) {
                    infoElement.textContent = '';
                }
            }
        }
    };

    // Expose to window for global access
    window.MediaGallery = MediaGallery;
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        MediaGallery.init();
    });
    
    // Add click handler to edit buttons to open the gallery
    document.addEventListener('click', function(event) {
        // Check if this is a media gallery button
        if (event.target.matches('.media-gallery-btn') || event.target.closest('.media-gallery-btn')) {
            event.preventDefault();
            const button = event.target.matches('.media-gallery-btn') ? event.target : event.target.closest('.media-gallery-btn');
            
            // Open the gallery
            MediaGallery.openGallery(function(selectedMedia) {
                // Get the target input or element
                const targetId = button.getAttribute('data-target');
                const target = document.getElementById(targetId);
                
                if (!target) {
                    console.error('MediaGallery: Target element not found', targetId);
                    return;
                }
                
                // Different handling based on media type and target element
                if (selectedMedia.type === 'image') {
                    if (target.tagName === 'INPUT') {
                        target.value = selectedMedia.dataUrl;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        target.dispatchEvent(event);
                    } else if (target.tagName === 'IMG') {
                        target.src = selectedMedia.dataUrl;
                    } else {
                        // For div containers, replace with image
                        target.innerHTML = `<img src="${selectedMedia.dataUrl}" alt="${selectedMedia.name}" class="inserted-media">`;
                    }
                } else if (selectedMedia.type === 'video') {
                    if (target.tagName === 'INPUT') {
                        target.value = selectedMedia.dataUrl;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        target.dispatchEvent(event);
                    } else {
                        // For div containers or other elements, replace with video
                        target.innerHTML = `
                            <video src="${selectedMedia.dataUrl}" controls class="inserted-media">
                                Your browser does not support the video tag.
                            </video>
                        `;
                    }
                }
                
                // Fire a custom event for integration with other components
                const mediaSelectedEvent = new CustomEvent('mediaSelected', {
                    bubbles: true,
                    detail: {
                        media: selectedMedia,
                        targetId: targetId
                    }
                });
                button.dispatchEvent(mediaSelectedEvent);
            });
        }
    });
})();
