/**
 * Media Folders
 * Handles folder management for the media library
 */

// Global variables for media folders
let mediaFolders = [];
let currentFolder = 'all';
let currentMediaType = 'all';

/**
 * Initialize media folders
 */
function initializeMediaFolders() {
    console.log('Initializing media folders...');
    
    // Add CSS styles for context menus and dropdowns
    const style = document.createElement('style');
    style.textContent = `
        .folder-context-menu, .folder-selection {
            background-color: #222 !important;
            color: #fff !important;
            border: 1px solid #444 !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5) !important;
            z-index: 9999 !important;
        }
        
        .folder-context-menu-item, .folder-selection-item {
            color: #fff !important;
            border-bottom: 1px solid #444 !important;
        }
        
        .folder-context-menu-item:hover, .folder-selection-item:hover {
            background-color: #333 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Load folders from localStorage
    loadFolders();
    
    // Set up event listeners
    setupFolderEvents();
    
    // Update folder counts
    updateFolderCounts();
    
    // Render folders
    renderFolders();
    
    // Update the upload folder select dropdown
    updateUploadFolderSelect();
    
    // Setup the media upload input to use the selected folder
    setupMediaUploadFolderSelection();
}

/**
 * Load folders from localStorage
 */
function loadFolders() {
    const savedFolders = localStorage.getItem('fooodis-media-folders');
    
    if (savedFolders) {
        mediaFolders = JSON.parse(savedFolders);
        console.log('Loaded folders from localStorage:', mediaFolders);
    } else {
        // Create default folders
        mediaFolders = [
            {
                id: 'food',
                name: 'Food',
                icon: 'utensils'
            },
            {
                id: 'restaurant',
                name: 'Restaurant',
                icon: 'store'
            },
            {
                id: 'people',
                name: 'People',
                icon: 'users'
            }
        ];
        
        // Save to localStorage
        saveFolders();
        console.log('Created default folders:', mediaFolders);
    }
}

/**
 * Save folders to localStorage
 */
function saveFolders() {
    localStorage.setItem('fooodis-media-folders', JSON.stringify(mediaFolders));
}

/**
 * Render folders in the sidebar
 */
function renderFolders() {
    const folderList = document.getElementById('folderList');
    
    // Keep the All Media and Uncategorized folders
    const staticFolders = folderList.querySelectorAll('[data-folder="all"], [data-folder="uncategorized"]');
    
    // Clear folder list except for static folders
    folderList.innerHTML = '';
    
    // Add back the static folders
    staticFolders.forEach(folder => {
        folderList.appendChild(folder);
    });
    
    // Add custom folders
    mediaFolders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.dataset.folder = folder.id;
        
        if (currentFolder === folder.id) {
            folderItem.classList.add('active');
        }
        
        // Get folder count
        const count = getMediaCountByFolder(folder.id);
        
        folderItem.innerHTML = `
            <i class="fas fa-${folder.icon || 'folder'}"></i>
            <span class="folder-name">${folder.name}</span>
            <span class="folder-count">${count}</span>
        `;
        
        // Add context menu on right click
        folderItem.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showFolderContextMenu(e, folder);
        });
        
        // Add context menu button for mobile/touch devices
        const contextMenuBtn = document.createElement('button');
        contextMenuBtn.className = 'folder-context-menu-btn';
        contextMenuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        contextMenuBtn.title = 'Folder options';
        contextMenuBtn.style.marginLeft = 'auto';
        contextMenuBtn.style.background = 'transparent';
        contextMenuBtn.style.border = 'none';
        contextMenuBtn.style.color = '#fff';
        contextMenuBtn.style.cursor = 'pointer';
        contextMenuBtn.style.padding = '4px';
        contextMenuBtn.style.display = 'none';
        
        // Show button on hover
        folderItem.addEventListener('mouseenter', function() {
            contextMenuBtn.style.display = 'block';
        });
        
        folderItem.addEventListener('mouseleave', function() {
            contextMenuBtn.style.display = 'none';
        });
        
        // Add click event to show context menu
        contextMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showFolderContextMenu(e, folder);
        });
        
        folderItem.appendChild(contextMenuBtn);
        
        // Add click event to select folder
        folderItem.addEventListener('click', function() {
            selectFolder(folder.id);
        });
        
        folderList.appendChild(folderItem);
    });
}

/**
 * Set up folder-related event listeners
 */
function setupFolderEvents() {
    // Add folder button
    const addFolderBtn = document.getElementById('addFolderBtn');
    const folderForm = document.getElementById('folderForm');
    const folderNameInput = document.getElementById('folderNameInput');
    const saveFolderBtn = document.getElementById('saveFolderBtn');
    const cancelFolderBtn = document.getElementById('cancelFolderBtn');
    
    // Current selected icon for new folder
    let currentFolderIcon = 'folder';
    
    // Create icon selector if it doesn't exist
    if (folderForm && !document.getElementById('folderIconSelector')) {
        // Create folder icon selector
        const iconSelector = document.createElement('div');
        iconSelector.id = 'folderIconSelector';
        iconSelector.className = 'folder-icon-selector';
        iconSelector.innerHTML = `
            <i class="fas fa-folder" id="currentFolderIconPreview"></i>
            <span>Select folder icon</span>
        `;
        
        // Insert before the folder name input
        folderForm.insertBefore(iconSelector, folderNameInput);
        
        // Add click event to show icon picker
        iconSelector.addEventListener('click', function() {
            // Show icon picker
            showIconPicker(function(selectedIcon) {
                // Update current icon
                currentFolderIcon = selectedIcon;
                
                // Update icon preview
                const iconPreview = document.getElementById('currentFolderIconPreview');
                if (iconPreview) {
                    iconPreview.className = `fas fa-${selectedIcon}`;
                }
            });
        });
    }
    
    // Show folder form when add button is clicked
    if (addFolderBtn) {
        addFolderBtn.addEventListener('click', function() {
            folderForm.classList.add('active');
            folderNameInput.focus();
            
            // Reset current icon to default
            currentFolderIcon = 'folder';
            
            // Update icon preview
            const iconPreview = document.getElementById('currentFolderIconPreview');
            if (iconPreview) {
                iconPreview.className = 'fas fa-folder';
            }
        });
    }
    
    // Cancel button
    if (cancelFolderBtn) {
        cancelFolderBtn.addEventListener('click', function() {
            folderForm.classList.remove('active');
            folderNameInput.value = '';
        });
    }
    
    // Save button
    if (saveFolderBtn) {
        saveFolderBtn.addEventListener('click', function() {
            const folderName = folderNameInput.value.trim();
            
            if (folderName) {
                addFolder(folderName, currentFolderIcon);
                folderForm.classList.remove('active');
                folderNameInput.value = '';
            }
        });
    }
    
    // Enter key in folder name input
    if (folderNameInput) {
        folderNameInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const folderName = folderNameInput.value.trim();
                
                if (folderName) {
                    addFolder(folderName, currentFolderIcon);
                    folderForm.classList.remove('active');
                    folderNameInput.value = '';
                }
            } else if (e.key === 'Escape') {
                folderForm.classList.remove('active');
                folderNameInput.value = '';
            }
        });
    }
    
    // Media type filter buttons
    const mediaTypeButtons = document.querySelectorAll('.media-type-btn');
    if (mediaTypeButtons.length > 0) {
        mediaTypeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const mediaType = this.dataset.type;
                
                // Remove active class from all buttons
                mediaTypeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Set current media type
                currentMediaType = mediaType;
                
                // Filter media
                filterMedia();
            });
        });
    }
    
    // Initial folder selection
    const allMediaFolder = document.querySelector('.folder-item[data-folder="all"]');
    if (allMediaFolder) {
        allMediaFolder.addEventListener('click', function() {
            selectFolder('all');
        });
    }
    
    const uncategorizedFolder = document.querySelector('.folder-item[data-folder="uncategorized"]');
    if (uncategorizedFolder) {
        uncategorizedFolder.addEventListener('click', function() {
            selectFolder('uncategorized');
        });
    }
}

/**
 * Add a new folder
 * @param {string} name - The folder name
 * @param {string} icon - The folder icon (optional)
 */
function addFolder(name, icon = 'folder') {
    // Generate a unique ID
    const id = 'folder_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
    
    // Create folder object
    const folder = {
        id: id,
        name: name,
        icon: icon
    };
    
    // Add to folders array
    mediaFolders.push(folder);
    
    // Save folders
    saveFolders();
    
    // Render folders
    renderFolders();
    
    // Update the upload folder select dropdown
    updateUploadFolderSelect();
    
    // Show notification
    showNotification(`Folder "${name}" created successfully`, 'success');
}

/**
 * Delete a folder
 * @param {string} folderId - The folder ID to delete
 */
function deleteFolder(folderId) {
    // Find folder index
    const folderIndex = mediaFolders.findIndex(folder => folder.id === folderId);
    
    if (folderIndex !== -1) {
        const folderName = mediaFolders[folderIndex].name;
        
        // Remove folder from array
        mediaFolders.splice(folderIndex, 1);
        
        // Save folders
        saveFolders();
        
        // Move media items from this folder to uncategorized
        moveMediaItemsToUncategorized(folderId);
        
        // If current folder is being deleted, switch to all media
        if (currentFolder === folderId) {
            selectFolder('all');
        } else {
            // Just render folders
            renderFolders();
        }
        
        // Show notification
        showNotification(`Folder "${folderName}" deleted successfully`, 'success');
    }
}

/**
 * Move all media items from a folder to uncategorized
 * @param {string} folderId - The source folder ID
 */
function moveMediaItemsToUncategorized(folderId) {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Update folder for each item
    let updated = false;
    mediaLibrary.forEach(item => {
        if (item.folder === folderId) {
            item.folder = 'uncategorized';
            updated = true;
        }
    });
    
    // Save if updated
    if (updated) {
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        // Re-render media library if needed
        if (typeof renderMediaLibrary === 'function') {
            renderMediaLibrary();
        }
    }
}

/**
 * Rename a folder
 * @param {string} folderId - The folder ID to rename
 * @param {string} newName - The new folder name
 * @param {string} newIcon - The new folder icon (optional)
 */
function renameFolder(folderId, newName, newIcon) {
    // Find folder
    const folder = mediaFolders.find(folder => folder.id === folderId);
    
    if (folder) {
        const oldName = folder.name;
        
        // Update name
        folder.name = newName;
        
        // Update icon if provided
        if (newIcon) {
            folder.icon = newIcon;
        }
        
        // Save folders
        saveFolders();
        
        // Render folders
        renderFolders();
        
        // Update upload folder select dropdown
        updateUploadFolderSelect();
        
        // Update current folder name if needed
        if (currentFolder === folderId) {
            updateCurrentFolderName(newName);
        }
        
        // Show notification
        showNotification(`Folder renamed from "${oldName}" to "${newName}"`, 'success');
    }
}

/**
 * Select a folder
 * @param {string} folderId - The folder ID to select
 */
function selectFolder(folderId) {
    // Set current folder
    currentFolder = folderId;
    
    // Update active folder in UI
    const folderItems = document.querySelectorAll('.folder-item');
    folderItems.forEach(item => {
        if (item.dataset.folder === folderId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update current folder name
    let folderName = 'All Media';
    
    if (folderId === 'uncategorized') {
        folderName = 'Uncategorized';
    } else if (folderId !== 'all') {
        const folder = mediaFolders.find(folder => folder.id === folderId);
        if (folder) {
            folderName = folder.name;
        }
    }
    
    updateCurrentFolderName(folderName);
    
    // Filter media
    filterMedia();
}

/**
 * Update the current folder name in the UI
 * @param {string} name - The folder name
 */
function updateCurrentFolderName(name) {
    const currentFolderName = document.querySelector('.current-folder-name');
    if (currentFolderName) {
        currentFolderName.textContent = name;
    }
}

/**
 * Show folder context menu
 * @param {Event} event - The context menu event
 * @param {Object} folder - The folder object
 */
function showFolderContextMenu(event, folder) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.folder-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'folder-context-menu active';
    contextMenu.style.top = event.pageY + 'px';
    contextMenu.style.left = event.pageX + 'px';
    
    // Add menu items
    contextMenu.innerHTML = `
        <div class="folder-context-menu-item rename-folder">
            <i class="fas fa-edit"></i> Rename
        </div>
        <div class="folder-context-menu-item change-icon">
            <i class="fas fa-icons"></i> Change Icon
        </div>
        <div class="folder-context-menu-item delete-folder">
            <i class="fas fa-trash-alt"></i> Delete
        </div>
    `;
    
    // Add to body
    document.body.appendChild(contextMenu);
    
    // Add event listeners
    const renameItem = contextMenu.querySelector('.rename-folder');
    const changeIconItem = contextMenu.querySelector('.change-icon');
    const deleteItem = contextMenu.querySelector('.delete-folder');
    
    renameItem.addEventListener('click', function() {
        // Prompt for new name
        const newName = prompt('Enter new folder name:', folder.name);
        
        if (newName && newName.trim() !== '') {
            renameFolder(folder.id, newName.trim());
        }
        
        // Remove context menu
        contextMenu.remove();
    });
    
    changeIconItem.addEventListener('click', function() {
        // Show icon picker
        showIconPicker(function(selectedIcon) {
            // Update folder icon
            renameFolder(folder.id, folder.name, selectedIcon);
        });
        
        // Remove context menu
        contextMenu.remove();
    });
    
    deleteItem.addEventListener('click', function() {
        // Confirm deletion
        if (confirm(`Are you sure you want to delete the folder "${folder.name}"? Media items will be moved to Uncategorized.`)) {
            deleteFolder(folder.id);
        }
        
        // Remove context menu
        contextMenu.remove();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

/**
 * Get media count by folder
 * @param {string} folderId - The folder ID
 * @returns {number} The number of media items in the folder
 */
function getMediaCountByFolder(folderId) {
    // Get media library
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    if (folderId === 'all') {
        return mediaLibrary.length;
    } else if (folderId === 'uncategorized') {
        return mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized').length;
    } else {
        return mediaLibrary.filter(item => item.folder === folderId).length;
    }
}

/**
 * Update folder counts
 */
function updateFolderCounts() {
    // Update All Media count
    const allMediaCount = document.querySelector('.folder-item[data-folder="all"] .folder-count');
    if (allMediaCount) {
        allMediaCount.textContent = getMediaCountByFolder('all');
    }
    
    // Update Uncategorized count
    const uncategorizedCount = document.querySelector('.folder-item[data-folder="uncategorized"] .folder-count');
    if (uncategorizedCount) {
        uncategorizedCount.textContent = getMediaCountByFolder('uncategorized');
    }
    
    // Update custom folder counts
    mediaFolders.forEach(folder => {
        const folderCount = document.querySelector(`.folder-item[data-folder="${folder.id}"] .folder-count`);
        if (folderCount) {
            folderCount.textContent = getMediaCountByFolder(folder.id);
        }
    });
}

/**
 * Filter media based on current folder and media type
 */
function filterMedia() {
    // Get media library
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Filter by folder
    let filteredMedia = mediaLibrary;
    
    if (currentFolder === 'uncategorized') {
        filteredMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
    } else if (currentFolder !== 'all') {
        filteredMedia = mediaLibrary.filter(item => item.folder === currentFolder);
    }
    
    // Filter by media type
    if (currentMediaType !== 'all') {
        filteredMedia = filteredMedia.filter(item => {
            if (currentMediaType === 'image') {
                return item.type.startsWith('image/');
            } else if (currentMediaType === 'video') {
                return item.type.startsWith('video/');
            }
            return true;
        });
    }
    
    // Render filtered media
    renderFilteredMedia(filteredMedia);
}

/**
 * Render filtered media
 * @param {Array} filteredMedia - The filtered media items
 */
function renderFilteredMedia(filteredMedia) {
    const mediaGrid = document.getElementById('mediaGrid');
    
    if (!mediaGrid) return;
    
    // Calculate pagination for filtered media
    const totalFilteredPages = Math.ceil(filteredMedia.length / mediaPerPage);
    
    // Ensure current page is valid
    if (currentMediaPage > totalFilteredPages) {
        currentMediaPage = totalFilteredPages || 1;
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
            if (item.folder && item.folder !== 'uncategorized' && currentFolder === 'all') {
                const folder = mediaFolders.find(f => f.id === item.folder);
                if (folder) {
                    folderName = folder.name;
                }
            }
            
            // Create folder badge if needed
            const folderBadge = folderName ? `<div class="folder-badge"><i class="fas fa-folder"></i> ${folderName}</div>` : '';
            
            // Create used in automation badge if needed
            const usedBadge = item.usedInAutomation ? `<div class="used-badge" title="Used in automation"><i class="fas fa-robot"></i> Used</div>` : '';
            
            mediaItem.innerHTML = `
                <div class="media-preview">
                    <img src="${item.url}" alt="${item.name}">
                    ${folderBadge}
                    ${usedBadge}
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
            
            // Add move to folder functionality
            const moveToFolderBtn = mediaItem.querySelector('.move-to-folder');
            if (moveToFolderBtn) {
                moveToFolderBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showFolderSelection(e, item);
                });
            }
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    // Update pagination
    updateMediaPagination();
    
    // Update total count in pagination
    const paginationInfo = document.querySelector('.media-pagination span');
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentMediaPage} of ${totalFilteredPages || 1} (${filteredMedia.length} items)`;
    }
}

/**
 * Show folder selection dropdown
 * @param {Event} event - The click event
 * @param {Object} mediaItem - The media item
 */
function showFolderSelection(event, mediaItem) {
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.folder-selection');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'folder-selection active';
    
    // Position dropdown
    const button = event.currentTarget;
    
    // Add null check to prevent "Cannot read properties of null" error
    if (!button) {
        console.error('Media Folders: Button element is null in showFolderSelection');
        return;
    }
    
    const buttonRect = button.getBoundingClientRect();
    
    // Position relative to button
    dropdown.style.top = buttonRect.bottom + window.scrollY + 'px';
    dropdown.style.left = buttonRect.left + window.scrollX + 'px';
    
    // Add uncategorized option
    dropdown.innerHTML = `
        <div class="folder-selection-item" data-folder="uncategorized">
            <i class="fas fa-folder"></i> Uncategorized
        </div>
    `;
    
    // Add custom folders
    mediaFolders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-selection-item';
        folderItem.dataset.folder = folder.id;
        
        folderItem.innerHTML = `
            <i class="fas fa-${folder.icon || 'folder'}"></i> ${folder.name}
        `;
        
        // Add click event to move media to folder
        folderItem.addEventListener('click', function() {
            moveMediaToFolder(mediaItem.id, folder.id);
            dropdown.remove();
        });
        
        dropdown.appendChild(folderItem);
    });
    
    // Add click event to uncategorized option
    const uncategorizedOption = dropdown.querySelector('.folder-selection-item[data-folder="uncategorized"]');
    if (uncategorizedOption) {
        uncategorizedOption.addEventListener('click', function() {
            moveMediaToFolder(mediaItem.id, 'uncategorized');
            dropdown.remove();
        });
    }
    
    // Add to body
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== button) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

/**
 * Move media item to folder
 * @param {string} mediaId - The media item ID
 * @param {string} folderId - The destination folder ID
 */
function moveMediaToFolder(mediaId, folderId) {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Find media item
    const mediaItem = mediaLibrary.find(item => item.id === mediaId);
    
    if (mediaItem) {
        // Update folder
        mediaItem.folder = folderId;
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        // Update folder counts
        updateFolderCounts();
        
        // Re-filter media
        filterMedia();
        
        // Get folder name
        let folderName = 'Uncategorized';
        if (folderId !== 'uncategorized') {
            const folder = mediaFolders.find(folder => folder.id === folderId);
            if (folder) {
                folderName = folder.name;
            }
        }
        
        // Show notification
        showNotification(`Media moved to "${folderName}" folder`, 'success');
    }
}

/**
 * Compress image to reduce size for localStorage
 * @param {string} dataURL - The data URL of the image
 * @param {number|Function} quality - The quality of the compressed image (0-1) or callback function
 * @param {Function} [callback] - Callback function with compressed dataURL
 */
function compressImage(dataURL, quality, callback) {
    // Handle case where quality is omitted and second parameter is the callback
    if (typeof quality === 'function' && callback === undefined) {
        callback = quality;
        quality = 0.7; // Default quality
    }
    
    // Ensure callback is a function
    if (typeof callback !== 'function') {
        console.warn('compressImage: No valid callback provided, using no-op function');
        callback = function(dataURL) {
            console.log('Image compressed, but no callback was provided');
            return dataURL;
        };
    }
    
    // Validate quality
    if (typeof quality !== 'number' || quality < 0 || quality > 1) {
        quality = 0.7; // Default to 70% quality
    }
    
    const img = new Image();
    img.onload = function() {
        // Create canvas
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (max 800px width/height)
        let width = img.width;
        let height = img.height;
        const maxDimension = 800;
        
        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = Math.round(height * (maxDimension / width));
                width = maxDimension;
            } else {
                width = Math.round(width * (maxDimension / height));
                height = maxDimension;
            }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed data URL
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        
        // Call callback with compressed data URL
        callback(compressedDataURL);
    };
    
    // Handle image load error
    img.onerror = function() {
        console.error('Error loading image for compression');
        callback(dataURL); // Return original data URL on error
    };
    
    img.src = dataURL;
}

/**
 * Clean up localStorage to make room for new media
 */
function cleanupStorage() {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // If we have more than 20 items, remove the oldest ones
    if (mediaLibrary.length > 20) {
        // Sort by date (oldest first)
        mediaLibrary.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Remove oldest items until we have 20 or fewer
        mediaLibrary = mediaLibrary.slice(mediaLibrary.length - 20);
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        console.log('Cleaned up localStorage, removed oldest media items');
    }
}

/**
 * Enhance the uploadMedia function to support folders
 * @param {FileList} files - The files to upload
 * @param {string} folderId - The folder ID to upload to (optional)
 */
function uploadMediaToFolder(files, folderId = currentFolder) {
    // If current folder is 'all', use 'uncategorized' instead
    const targetFolder = folderId === 'all' ? 'uncategorized' : folderId;
    
    // Convert FileList to Array
    const filesArray = Array.from(files);
    
    // Clean up storage before adding new items
    try {
        cleanupStorage();
    } catch (error) {
        console.error('Error cleaning up storage:', error);
    }
    
    // Process each file
    filesArray.forEach(file => {
        // Check if file is an image or video
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Compress image before storing
                compressImage(e.target.result, 0.6, function(compressedDataURL) {
                    try {
                        // Get existing media library
                        let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
                        
                        // Create new media item
                        const newMedia = {
                            id: 'media_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                            name: file.name,
                            type: file.type,
                            url: compressedDataURL,
                            date: new Date().toISOString(),
                            size: file.size,
                            folder: targetFolder
                        };
                        
                        // Add to media library
                        mediaLibrary.push(newMedia);
                        
                        // Save to localStorage
                        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
                        
                        // Update folder counts
                        updateFolderCounts();
                        
                        // Re-filter media
                        filterMedia();
                        
                        // Show notification
                        showNotification(`File "${file.name}" uploaded successfully`, 'success');
                    } catch (error) {
                        console.error('Error saving to localStorage:', error);
                        showNotification('Error uploading file: Storage quota exceeded. Please delete some media items first.', 'error');
                    }
                });
            };
            
            // Read file as data URL
            reader.readAsDataURL(file);
        } else if (file.type.match('video.*')) {
            // For videos, just store metadata to save space
            try {
                // Get existing media library
                let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
                
                // Create new media item with placeholder
                const newMedia = {
                    id: 'media_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
                    name: file.name,
                    type: file.type,
                    // Use a placeholder image for videos
                    url: 'images/video-placeholder.jpg',
                    date: new Date().toISOString(),
                    size: file.size,
                    folder: targetFolder,
                    isVideoPlaceholder: true
                };
                
                // Add to media library
                mediaLibrary.push(newMedia);
                
                // Save to localStorage
                localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
                
                // Update folder counts
                updateFolderCounts();
                
                // Re-filter media
                filterMedia();
                
                // Show notification
                showNotification(`Video "${file.name}" metadata saved (placeholder used to save space)`, 'success');
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                showNotification('Error uploading file: Storage quota exceeded. Please delete some media items first.', 'error');
            }
        } else {
            // Show error for non-image/video files
            showNotification(`File "${file.name}" is not a supported media type`, 'error');
        }
    });
}

/**
 * Update the upload folder select dropdown with available folders
 */
function updateUploadFolderSelect() {
    const uploadFolderSelect = document.getElementById('uploadFolderSelect');
    
    if (!uploadFolderSelect) return;
    
    // Keep the default options
    const defaultOptions = uploadFolderSelect.querySelectorAll('option[value="current"], option[value="uncategorized"]');
    
    // Clear select except for default options
    uploadFolderSelect.innerHTML = '';
    
    // Add back the default options
    defaultOptions.forEach(option => {
        uploadFolderSelect.appendChild(option);
    });
    
    // Add custom folders
    mediaFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        uploadFolderSelect.appendChild(option);
    });
}

/**
 * Setup the media upload input to use the selected folder
 */
function setupMediaUploadFolderSelection() {
    const mediaUploadInput = document.getElementById('mediaUploadInput');
    const uploadFolderSelect = document.getElementById('uploadFolderSelect');
    
    if (!mediaUploadInput || !uploadFolderSelect) return;
    
    // Handle file selection with folder
    mediaUploadInput.addEventListener('change', function(e) {
        if (this.files && this.files.length > 0) {
            // Get selected folder
            const selectedFolder = uploadFolderSelect.value;
            
            // Determine target folder
            let targetFolder;
            
            if (selectedFolder === 'current') {
                // Use current folder
                targetFolder = currentFolder === 'all' ? 'uncategorized' : currentFolder;
            } else {
                // Use selected folder
                targetFolder = selectedFolder;
            }
            
            // Upload files to folder
            uploadMediaToFolder(this.files, targetFolder);
            
            // Clear input
            this.value = '';
        }
    });
    
    // Setup drag and drop for media upload area
    const mediaUploadArea = document.getElementById('mediaUploadArea');
    
    if (mediaUploadArea) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            mediaUploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            mediaUploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            mediaUploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            mediaUploadArea.classList.add('highlight');
        }
        
        function unhighlight() {
            mediaUploadArea.classList.remove('highlight');
        }
        
        // Handle drop
        mediaUploadArea.addEventListener('drop', function(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                // Get selected folder
                const selectedFolder = uploadFolderSelect.value;
                
                // Determine target folder
                let targetFolder;
                
                if (selectedFolder === 'current') {
                    // Use current folder
                    targetFolder = currentFolder === 'all' ? 'uncategorized' : currentFolder;
                } else {
                    // Use selected folder
                    targetFolder = selectedFolder;
                }
                
                // Upload files to folder
                uploadMediaToFolder(files, targetFolder);
            }
        });
        
        // Add double-click functionality to open file browser
        mediaUploadArea.addEventListener('dblclick', function() {
            // Trigger click on the hidden file input
            mediaUploadInput.click();
        });
    }
}

/**
 * Add context menu to media items for folder operations
 */
function addMediaItemContextMenu() {
    // Get all media items
    const mediaItems = document.querySelectorAll('.media-item');
    
    mediaItems.forEach(item => {
        // Add context menu on right click
        item.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            
            // Get media item ID
            const mediaId = this.dataset.id;
            
            // Get media item from library
            const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
            const mediaItem = mediaLibrary.find(item => item.id === mediaId);
            
            if (mediaItem) {
                showMediaItemContextMenu(e, mediaItem);
            }
        });
    });
}

/**
 * Show context menu for media item
 * @param {Event} event - The context menu event
 * @param {Object} mediaItem - The media item
 */
function showMediaItemContextMenu(event, mediaItem) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.folder-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'folder-context-menu active';
    contextMenu.style.top = event.pageY + 'px';
    contextMenu.style.left = event.pageX + 'px';
    
    // Add menu items
    contextMenu.innerHTML = `
        <div class="folder-context-menu-item rename-media">
            <i class="fas fa-edit"></i> Rename
        </div>
        <div class="folder-context-menu-item move-to-folder">
            <i class="fas fa-folder-open"></i> Move to Folder
        </div>
        <div class="folder-context-menu-item copy-url">
            <i class="fas fa-copy"></i> Copy URL
        </div>
        <div class="folder-context-menu-item delete-media">
            <i class="fas fa-trash-alt"></i> Delete
        </div>
    `;
    
    // Add to body
    document.body.appendChild(contextMenu);
    
    // Add event listeners
    const renameMediaItem = contextMenu.querySelector('.rename-media');
    const moveToFolderItem = contextMenu.querySelector('.move-to-folder');
    const copyUrlItem = contextMenu.querySelector('.copy-url');
    const deleteMediaItem = contextMenu.querySelector('.delete-media');
    
    renameMediaItem.addEventListener('click', function() {
        // Prompt for new name
        const newName = prompt('Enter new name for media item:', mediaItem.name);
        
        if (newName && newName.trim() !== '') {
            // Rename media item
            renameMediaItemById(mediaItem.id, newName.trim());
        }
        
        // Remove context menu
        contextMenu.remove();
    });
    
    moveToFolderItem.addEventListener('click', function(e) {
        // Show folder selection with the correct event parameter
        showFolderSelection(e, mediaItem);
        
        // Remove context menu
        contextMenu.remove();
    });
    
    copyUrlItem.addEventListener('click', function() {
        // Copy URL to clipboard
        navigator.clipboard.writeText(mediaItem.url).then(() => {
            showNotification('Media URL copied to clipboard', 'success');
        }).catch(err => {
            showNotification('Failed to copy URL: ' + err, 'error');
        });
        
        // Remove context menu
        contextMenu.remove();
    });
    
    deleteMediaItem.addEventListener('click', function() {
        // Delete media item
        if (confirm(`Are you sure you want to delete "${mediaItem.name}"?`)) {
            deleteMediaItem(mediaItem.id);
        }
        
        // Remove context menu
        contextMenu.remove();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
}

/**
 * Rename a media item
 * @param {string} mediaId - The media item ID to rename
 * @param {string} newName - The new name for the media item
 */
function renameMediaItemById(mediaId, newName) {
    // Get media library
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Find media item
    const mediaIndex = mediaLibrary.findIndex(item => item.id === mediaId);
    
    if (mediaIndex !== -1) {
        // Store old name for notification
        const oldName = mediaLibrary[mediaIndex].name;
        
        // Update name
        mediaLibrary[mediaIndex].name = newName;
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        // Show success notification
        showNotification(`Media item renamed from "${oldName}" to "${newName}"`, 'success');
        
        // Refresh media library
        filterMedia();
    } else {
        // Show error notification
        showNotification('Media item not found', 'error');
    }
}

// Store the original uploadMedia function reference
window.originalUploadMedia = window.uploadMedia;

// Override the original uploadMedia function
window.uploadMedia = function(files) {
    // Directly call our enhanced version
    uploadMediaToFolder(files);
    
    // Return true to indicate successful handling
    return true;
};

// Override the original renderMediaLibrary function to add context menu
const originalRenderMediaLibrary = window.renderMediaLibrary;
if (typeof originalRenderMediaLibrary === 'function') {
    window.renderMediaLibrary = function() {
        // Call original function
        originalRenderMediaLibrary.apply(this, arguments);
        
        // Add context menu to media items
        setTimeout(addMediaItemContextMenu, 100);
    };
}

// Initialize media folders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize media folders after a short delay to ensure other scripts have loaded
    setTimeout(initializeMediaFolders, 500);
});
