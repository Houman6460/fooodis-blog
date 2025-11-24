/**
 * Dashboard Fixes
 * This file contains fixes for the Fooodis Blog Dashboard
 */

// Global variables for media library
let mediaLibrary = [];
let currentMediaPage = 1;
let mediaPerPage = 12;
let totalMediaPages = 1;

// Initialize Media Library
function initializeMediaLibrary() {
    // Load media items from localStorage
    const mediaItems = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Create default media items if none exist
    if (mediaItems.length === 0) {
        const defaultMediaItems = [
            {
                id: 'media_' + Date.now() + '_1',
                name: 'restaurant-interior.jpg',
                type: 'image/jpeg',
                size: 1024000,
                url: 'images/New images/restaurant-interior-2022-11-11-02-07-29-utc.jpg',
                date: new Date().toISOString(),
                folder: 'restaurant'
            },
            {
                id: 'media_' + Date.now() + '_2',
                name: 'chef-cooking.jpg',
                type: 'image/jpeg',
                size: 1548000,
                url: 'images/New images/chef-cooking-food-kitchen-restaurant-hotel-2022-12-16-23-47-49-utc.jpg',
                date: new Date().toISOString(),
                folder: 'food'
            },
            {
                id: 'media_' + Date.now() + '_3',
                name: 'chef-decorating.jpg',
                type: 'image/jpeg',
                size: 1356000,
                url: 'images/New images/chef-decorating-delicious-appetizing-food-plate-2022-11-11-19-41-47-utc.jpg',
                date: new Date().toISOString(),
                folder: 'food'
            }
        ];
        
        localStorage.setItem('fooodis-blog-media', JSON.stringify(defaultMediaItems));
    } else {
        // Ensure all existing media items have a folder property
        const updatedMediaItems = mediaItems.map(item => {
            if (!item.hasOwnProperty('folder')) {
                item.folder = 'uncategorized';
            }
            return item;
        });
        
        // Save updated media items
        if (JSON.stringify(mediaItems) !== JSON.stringify(updatedMediaItems)) {
            localStorage.setItem('fooodis-blog-media', JSON.stringify(updatedMediaItems));
        }
    }
    
    // Set up media library upload functionality
    setupMediaUpload();
    
    // Render media library
    renderMediaLibrary();
    
    // Set up media pagination
    setupMediaPagination();
}

// Setup media upload functionality
function setupMediaUpload() {
    const mediaUploadBtn = document.getElementById('mediaUploadBtn');
    const mediaFileInput = document.getElementById('mediaFileInput');
    
    if (mediaUploadBtn && mediaFileInput) {
        // Show file input when upload button is clicked
        mediaUploadBtn.addEventListener('click', function() {
            mediaFileInput.click();
        });
        
        // Handle file selection
        mediaFileInput.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                uploadMedia(this.files);
            }
        });
        
        // Setup drag and drop for media upload
        const mediaDropZone = document.querySelector('.media-drop-zone');
        
        if (mediaDropZone) {
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                mediaDropZone.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                mediaDropZone.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                mediaDropZone.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                mediaDropZone.classList.add('highlight');
            }
            
            function unhighlight() {
                mediaDropZone.classList.remove('highlight');
            }
            
            // Handle dropped files
            mediaDropZone.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                uploadMedia(files);
            }
        }
    }
}

// Upload media files
function uploadMedia(files) {
    // Convert FileList to Array
    const filesArray = Array.from(files);
    
    // Get existing media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Process each file
    filesArray.forEach(file => {
        // Check if file is an image or video
        if (file.type.match('image.*') || file.type.match('video.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Determine folder based on current selection
                let targetFolder = 'uncategorized';
                
                // If a specific folder is selected (not 'all'), use that folder
                if (typeof currentFolder !== 'undefined' && currentFolder !== 'all') {
                    targetFolder = currentFolder;
                }
                
                // Create new media item
                const newMedia = {
                    id: 'media_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    type: file.type,
                    url: e.target.result,
                    date: new Date().toISOString(),
                    size: file.size,
                    folder: targetFolder
                };
                
                // Add to media library
                mediaLibrary.push(newMedia);
                
                // Save to localStorage
                localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
                
                // Re-render media library
                renderMediaLibrary();
                
                // Update folder counts if function exists
                if (typeof updateFolderCounts === 'function') {
                    updateFolderCounts();
                }
                
                // Show notification
                showNotification(`File "${file.name}" uploaded successfully`, 'success');
            };
            
            // Read file as data URL
            reader.readAsDataURL(file);
        } else {
            // Show error for non-supported files
            showNotification(`File "${file.name}" is not a supported media type`, 'error');
        }
    });
}

// Render media library
function renderMediaLibrary() {
    const mediaGrid = document.getElementById('mediaGrid');
    
    if (!mediaGrid) return;
    
    // Get media library from localStorage
    mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Filter media based on current folder and media type if the folder functionality is initialized
    let filteredMedia = mediaLibrary;
    
    if (typeof currentFolder !== 'undefined') {
        if (currentFolder === 'uncategorized') {
            filteredMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
        } else if (currentFolder !== 'all') {
            filteredMedia = mediaLibrary.filter(item => item.folder === currentFolder);
        }
        
        // Filter by media type if defined
        if (typeof currentMediaType !== 'undefined' && currentMediaType !== 'all') {
            filteredMedia = filteredMedia.filter(item => {
                if (currentMediaType === 'image') {
                    return item.type.startsWith('image/');
                } else if (currentMediaType === 'video') {
                    return item.type.startsWith('video/');
                }
                return true;
            });
        }
    }
    
    // Calculate total pages
    totalMediaPages = Math.ceil(filteredMedia.length / mediaPerPage);
    
    // Ensure current page is valid
    if (currentMediaPage > totalMediaPages) {
        currentMediaPage = totalMediaPages || 1;
    }
    
    // Calculate start and end indices for current page
    const startIndex = (currentMediaPage - 1) * mediaPerPage;
    const endIndex = startIndex + mediaPerPage;
    
    // Get media items for current page
    const currentPageItems = filteredMedia.slice(startIndex, endIndex);
    
    // Clear media grid
    mediaGrid.innerHTML = '';
    
    // Add media items to grid
    if (currentPageItems.length === 0) {
        mediaGrid.innerHTML = '<div class="no-media-message">No media items found in this folder. Upload some images to get started.</div>';
    } else {
        currentPageItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.id = item.id;
            
            // Determine folder name for badge
            let folderName = '';
            let folderBadge = '';
            
            if (typeof mediaFolders !== 'undefined' && item.folder && item.folder !== 'uncategorized' && (typeof currentFolder === 'undefined' || currentFolder === 'all')) {
                const folder = mediaFolders.find(f => f.id === item.folder);
                if (folder) {
                    folderName = folder.name;
                    folderBadge = `<div class="folder-badge"><i class="fas fa-folder"></i> ${folderName}</div>`;
                }
            }
            
            // Determine the preview content based on file type
            let previewContent = '';
            if (item.type.startsWith('video/')) {
                previewContent = `<video src="${item.url}" controls></video>`;
            } else {
                previewContent = `<img src="${item.url}" alt="${item.name}">`;
            }
            
            mediaItem.innerHTML = `
                <div class="media-preview">
                    ${previewContent}
                    ${folderBadge}
                    <div class="move-to-folder" title="Move to folder"><i class="fas fa-folder-open"></i></div>
                </div>
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                    <div class="media-size">${formatFileSize(item.size)}</div>
                </div>
                <div class="media-actions">
                    <button class="use-media-btn" title="Use this media"><i class="fas fa-check"></i></button>
                    <button class="delete-media-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            
            // Add to grid
            mediaGrid.appendChild(mediaItem);
            
            // Add move to folder functionality if the function exists
            const moveToFolderBtn = mediaItem.querySelector('.move-to-folder');
            if (moveToFolderBtn && typeof showFolderSelection === 'function') {
                moveToFolderBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showFolderSelection(e, item);
                });
            }
        });
    }
    
    // Update pagination
    updateMediaPagination();
    
    // Update pagination info with filtered count
    const paginationInfo = document.querySelector('.media-pagination span');
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentMediaPage} of ${totalMediaPages || 1} (${filteredMedia.length} items)`;
    }
    
    // Update folder counts if function exists
    if (typeof updateFolderCounts === 'function') {
        updateFolderCounts();
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Setup media pagination
function setupMediaPagination() {
    const prevBtn = document.getElementById('mediaPrevBtn');
    const nextBtn = document.getElementById('mediaNextBtn');
    const pageInfo = document.getElementById('mediaPageInfo');
    
    if (prevBtn && nextBtn && pageInfo) {
        // Previous page button
        prevBtn.addEventListener('click', function() {
            if (currentMediaPage > 1) {
                currentMediaPage--;
                renderMediaLibrary();
            }
        });
        
        // Next page button
        nextBtn.addEventListener('click', function() {
            if (currentMediaPage < totalMediaPages) {
                currentMediaPage++;
                renderMediaLibrary();
            }
        });
    }
}

// Update media pagination
function updateMediaPagination() {
    const prevBtn = document.getElementById('mediaPrevBtn');
    const nextBtn = document.getElementById('mediaNextBtn');
    const pageInfo = document.getElementById('mediaPageInfo');
    
    if (prevBtn && nextBtn && pageInfo) {
        // Update page info
        pageInfo.textContent = `Page ${currentMediaPage} of ${totalMediaPages}`;
        
        // Disable/enable buttons based on current page
        prevBtn.disabled = currentMediaPage === 1;
        nextBtn.disabled = currentMediaPage === totalMediaPages || totalMediaPages === 0;
    }
}

// Delete media item
function deleteMediaItem(id) {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Find media item index
    const mediaIndex = mediaLibrary.findIndex(item => item.id === id);
    
    if (mediaIndex !== -1) {
        // Get media item name for notification
        const mediaName = mediaLibrary[mediaIndex].name;
        
        // Remove media item
        mediaLibrary.splice(mediaIndex, 1);
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        // Re-render media library
        renderMediaLibrary();
        
        // Update folder counts if function exists
        if (typeof updateFolderCounts === 'function') {
            updateFolderCounts();
        }
        
        // Show notification
        showNotification(`Media "${mediaName}" deleted successfully`, 'success');
    }
}

// Use media item
function useMediaItem(id) {
    // Get media library
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Find item
    const item = mediaLibrary.find(item => item.id === id);
    
    if (item) {
        // Get active editor
        const activeEditor = document.querySelector('.note-editor.note-frame.panel.panel-default');
        
        if (activeEditor) {
            // Find the editor's content area
            const editorContent = activeEditor.querySelector('.note-editable');
            
            if (editorContent) {
                // Create image element
                const imgElement = document.createElement('img');
                imgElement.src = item.url;
                imgElement.alt = item.name;
                imgElement.style.maxWidth = '100%';
                
                // Insert image into editor
                editorContent.appendChild(imgElement);
                
                // Show notification
                showNotification('Media inserted into editor', 'success');
            }
        } else {
            // If no editor is active, try to set the featured image
            const featuredImagePreview = document.getElementById('featuredImagePreview');
            const featuredImageInput = document.getElementById('featuredImage');
            
            if (featuredImagePreview && featuredImageInput) {
                featuredImagePreview.src = item.url;
                featuredImagePreview.style.display = 'block';
                featuredImageInput.value = item.url;
                
                // Show notification
                showNotification('Featured image set successfully', 'success');
            } else {
                // Show error if no target found
                showNotification('No editor or featured image field found', 'error');
            }
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('dashboardNotification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'dashboardNotification';
        document.body.appendChild(notification);
    }
    
    // Set notification content and class
    notification.textContent = message;
    notification.className = 'dashboard-notification ' + type;
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize media library
    initializeMediaLibrary();
    
    // Set up event delegation for media actions
    document.addEventListener('click', function(event) {
        // Delete media button
        if (event.target.closest('.delete-media-btn')) {
            const mediaItem = event.target.closest('.media-item');
            if (mediaItem && mediaItem.dataset.id) {
                if (confirm('Are you sure you want to delete this media item?')) {
                    deleteMediaItem(mediaItem.dataset.id);
                }
            }
        }
        
        // Use media button
        if (event.target.closest('.use-media-btn')) {
            const mediaItem = event.target.closest('.media-item');
            if (mediaItem && mediaItem.dataset.id) {
                useMediaItem(mediaItem.dataset.id);
            }
        }
    });
});
