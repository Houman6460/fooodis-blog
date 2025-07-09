/**
 * Direct Media Selector Fix
 * 
 * This script completely replaces the media selector content
 * with a custom implementation that doesn't rely on any existing code.
 * 
 * FIXED VERSION - Resolved regex matching error
 */

(function() {
    // Need to track which input receives selected media
    let currentTargetInputId = null;
    
    /**
     * Initialize the media selector overrides
     */
    function initDirectOverride() {
        console.log("Direct Media Selector Fix: Initializing");
        
        // Find all media selector buttons
        document.querySelectorAll('[data-action="media"], .select-image-btn, .media-button, [onclick*="openMediaLibrary"], [onclick*="selectMedia"]').forEach(btn => {
            // Handle any existing onclick handlers
            let targetId = null;
            const originalOnclick = btn.getAttribute('onclick');
            
            if (originalOnclick) {
                // Remove onclick attribute to prevent it from executing
                btn.removeAttribute('onclick');
                
                // FIXED: Safely extract target input ID if possible
                try {
                    if (originalOnclick.includes('openMediaLibrary')) {
                        // Simple string parsing approach - safer than regex
                        const startPos = originalOnclick.indexOf('openMediaLibrary(');
                        if (startPos !== -1) {
                            // Find the first quote after the function name
                            const quotePos = originalOnclick.indexOf('"', startPos);
                            const singleQuotePos = originalOnclick.indexOf("'", startPos);
                            
                            // Determine which quote character was used
                            let useQuotePos = -1;
                            let quoteChar = '';
                            
                            if (quotePos !== -1 && (singleQuotePos === -1 || quotePos < singleQuotePos)) {
                                useQuotePos = quotePos;
                                quoteChar = '"'; 
                            } else if (singleQuotePos !== -1) {
                                useQuotePos = singleQuotePos;
                                quoteChar = "'";
                            }
                            
                            if (useQuotePos !== -1) {
                                // Find the closing quote
                                const endQuotePos = originalOnclick.indexOf(quoteChar, useQuotePos + 1);
                                if (endQuotePos !== -1) {
                                    // Extract the ID between the quotes
                                    targetId = originalOnclick.substring(useQuotePos + 1, endQuotePos);
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing onclick attribute:", e);
                }
            }
            
            // Also check for target in data attributes
            if (!targetId) {
                targetId = btn.getAttribute('data-target') || 
                           btn.getAttribute('data-input') || 
                           btn.closest('.form-group')?.querySelector('input')?.id;
            }
            
            // Add our custom click handler
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log("Direct Selector Fix: Button clicked, target:", targetId);
                currentTargetInputId = targetId;
                
                // Create our media selector
                createCustomMediaSelector();
            });
        });
    }
    
    /**
     * Create our custom media selector modal
     */
    function createCustomMediaSelector() {
        // Remove any existing modal
        const existingModal = document.getElementById('customMediaSelectorModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create the modal container
        const modal = document.createElement('div');
        modal.id = 'customMediaSelectorModal';
        modal.className = 'media-selector-modal';
        modal.innerHTML = `
            <div class="media-selector-content">
                <div class="media-selector-header">
                    <h3>Select Media</h3>
                    <button type="button" class="close-btn">&times;</button>
                </div>
                <div class="media-selector-tabs">
                    <button type="button" class="tab-btn active" data-tab="all">All Media</button>
                    <button type="button" class="tab-btn" data-tab="images">Images</button>
                    <button type="button" class="tab-btn" data-tab="videos">Videos</button>
                </div>
                <div class="media-selector-search">
                    <input type="text" placeholder="Search media..." class="search-input">
                </div>
                <div class="media-selector-body">
                    <div class="media-sidebar">
                        <h4>Folders</h4>
                        <ul class="folder-list">
                            <li data-folder="all" class="active">All Media <span class="folder-count">0</span></li>
                            <li data-folder="uncategorized">Uncategorized <span class="folder-count">0</span></li>
                            <li data-folder="food">Food <span class="folder-count">0</span></li>
                            <li data-folder="restaurant">Restaurant <span class="folder-count">0</span></li>
                            <li data-folder="people">People <span class="folder-count">0</span></li>
                        </ul>
                    </div>
                    <div class="media-content">
                        <div class="media-grid">
                            <!-- Media items will be loaded here -->
                            <div class="media-message">Loading media...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Add close button event
        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.remove();
        });
        
        // Handle folder clicks
        modal.querySelectorAll('.folder-list li').forEach(folder => {
            folder.addEventListener('click', function() {
                // Update active state
                modal.querySelectorAll('.folder-list li').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Filter media by folder
                const folderId = this.getAttribute('data-folder');
                filterMediaByFolder(folderId);
            });
        });
        
        // Load media items
        loadMediaItems();
        
        // Add styles if not already added
        if (!document.getElementById('customMediaSelectorStyles')) {
            const style = document.createElement('style');
            style.id = 'customMediaSelectorStyles';
            style.textContent = `
                .media-selector-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .media-selector-content {
                    background-color: #fff;
                    border-radius: 5px;
                    width: 90%;
                    max-width: 1000px;
                    height: 80%;
                    max-height: 700px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .media-selector-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .media-selector-header h3 {
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .media-selector-tabs {
                    display: flex;
                    border-bottom: 1px solid #eee;
                    padding: 0 15px;
                }
                
                .tab-btn {
                    padding: 10px 15px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-right: 10px;
                }
                
                .tab-btn.active {
                    border-color: #007bff;
                    color: #007bff;
                }
                
                .media-selector-search {
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .media-selector-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                
                .media-sidebar {
                    width: 250px;
                    border-right: 1px solid #eee;
                    padding: 15px;
                    overflow-y: auto;
                }
                
                .folder-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .folder-list li {
                    padding: 8px 10px;
                    cursor: pointer;
                    border-radius: 4px;
                    margin-bottom: 5px;
                    display: flex;
                    justify-content: space-between;
                }
                
                .folder-list li:hover {
                    background-color: #f5f5f5;
                }
                
                .folder-list li.active {
                    background-color: #007bff;
                    color: white;
                }
                
                .folder-count {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                    padding: 2px 6px;
                    font-size: 12px;
                }
                
                .media-content {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                }
                
                .media-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    grid-gap: 15px;
                }
                
                .media-item {
                    border: 1px solid #eee;
                    border-radius: 5px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.2s, border-color 0.2s;
                }
                
                .media-item:hover {
                    transform: translateY(-3px);
                    border-color: #007bff;
                }
                
                .media-item.selected {
                    border: 2px solid #007bff;
                }
                
                .media-thumbnail {
                    height: 100px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background-color: #f8f9fa;
                }
                
                .media-thumbnail img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: cover;
                }
                
                .media-info {
                    padding: 8px;
                    font-size: 12px;
                }
                
                .media-name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .media-message {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px 0;
                    color: #6c757d;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Load media items into the selector
     */
    function loadMediaItems() {
        const modal = document.getElementById('customMediaSelectorModal');
        if (!modal) return;
        
        const contentArea = modal.querySelector('.media-grid');
        contentArea.innerHTML = '<div class="media-message">Loading media...</div>';
        
        // Try to get media from various sources
        let mediaItems = [];
        
        // Try localStorage with different keys
        const storageSources = [
            'fooodis-blog-media',
            'media_library_items',
            'fooodis_media_items',
            'fooodis_unified_media'
        ];
        
        for (const source of storageSources) {
            try {
                const stored = localStorage.getItem(source);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        mediaItems = parsed;
                        break;
                    }
                }
            } catch (e) {
                console.error('Error loading media from storage:', e);
            }
        }
        
        // If no items found, use fallback placeholders
        if (mediaItems.length === 0) {
            mediaItems = getFallbackMediaItems();
        }
        
        // Update the UI with the items
        updateMediaUI(mediaItems);
    }
    
    /**
     * Update the UI with media items
     */
    function updateMediaUI(mediaItems) {
        const modal = document.getElementById('customMediaSelectorModal');
        if (!modal) return;
        
        const contentArea = modal.querySelector('.media-grid');
        const folderCounts = {
            all: mediaItems.length,
            uncategorized: 0,
            food: 0,
            restaurant: 0,
            people: 0
        };
        
        // Count items by folder
        mediaItems.forEach(item => {
            const folder = item.folder || 'uncategorized';
            if (folderCounts.hasOwnProperty(folder)) {
                folderCounts[folder]++;
            }
        });
        
        // Update folder counts
        for (const folder in folderCounts) {
            const folderEl = modal.querySelector(`.folder-list li[data-folder="${folder}"] .folder-count`);
            if (folderEl) {
                folderEl.textContent = folderCounts[folder];
            }
        }
        
        // Clear the content area
        contentArea.innerHTML = '';
        
        // Check if we have items
        if (mediaItems.length === 0) {
            contentArea.innerHTML = '<div class="media-message">No media items found.</div>';
            return;
        }
        
        // Add items to grid
        mediaItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id || Date.now());
            mediaItem.setAttribute('data-name', item.name || 'unknown');
            mediaItem.setAttribute('data-path', item.path || '');
            
            if (item.folder) {
                mediaItem.setAttribute('data-folder', item.folder);
            }
            
            // Create placeholder image data URI based on folder type
            let placeholderColor = '#3498db'; // Default blue
            if (item.folder === 'food') placeholderColor = '#e74c3c'; // Red
            if (item.folder === 'restaurant') placeholderColor = '#2ecc71'; // Green
            if (item.folder === 'people') placeholderColor = '#f39c12'; // Orange
            
            const placeholderSrc = createColorPlaceholder(placeholderColor);
            const thumbnailSrc = placeholderSrc;
            const fileName = item.name || (item.path ? item.path.split('/').pop() : 'Media item');
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail">
                    <img src="${thumbnailSrc}" alt="${fileName}" data-placeholder="true">
                </div>
                <div class="media-info">
                    <div class="media-name">${fileName}</div>
                </div>
            `;
            
            mediaItem.addEventListener('click', function() {
                // Remove selected class from all items
                contentArea.querySelectorAll('.media-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Add selected class to this item
                this.classList.add('selected');
                
                // Select this media
                selectMedia(item);
            });
            
            contentArea.appendChild(mediaItem);
        });
    }
    
    /**
     * Create a colored placeholder image
     */
    function createColorPlaceholder(color) {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        
        // Get the drawing context
        const ctx = canvas.getContext('2d');
        
        // Fill with background color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a simple icon or text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('IMAGE', canvas.width / 2, canvas.height / 2);
        
        // Convert to data URI
        return canvas.toDataURL('image/png');
    }
    
    /**
     * Filter media by folder
     */
    function filterMediaByFolder(folderId) {
        const modal = document.getElementById('customMediaSelectorModal');
        if (!modal) return;
        
        const mediaItems = modal.querySelectorAll('.media-item');
        
        if (folderId === 'all') {
            mediaItems.forEach(item => {
                item.style.display = '';
            });
        } else {
            mediaItems.forEach(item => {
                const itemFolder = item.getAttribute('data-folder') || 'uncategorized';
                if (itemFolder === folderId) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Get fallback media items 
     */
    function getFallbackMediaItems() {
        return [
            {
                id: 'img1',
                name: 'cappuccino-or-latte-coffee-with-heart-art.jpg',
                folder: 'food'
            },
            {
                id: 'img2',
                name: 'japanese-tea-2024-04-08-18-08-34-utc.jpg',
                folder: 'food'
            },
            {
                id: 'img3',
                name: 'white-cup-of-tasty-cappuccino.jpg',
                folder: 'food'
            },
            {
                id: 'img4',
                name: 'hot-coffee-latte-art-on-wooden-table.jpg',
                folder: 'food'
            },
            {
                id: 'img5',
                name: 'appetizing-soup-served-with-herbs.jpg',
                folder: 'food'
            },
            {
                id: 'img6',
                name: 'restaurant-interior.jpg',
                folder: 'restaurant'
            },
            {
                id: 'img7',
                name: 'chef-cooking.jpg',
                folder: 'people'
            },
            {
                id: 'img8',
                name: 'chef-decorating.jpg',
                folder: 'people'
            },
            {
                id: 'img9',
                name: 'a-full-bag-of-brown-coffee-beans.jpg',
                folder: 'food'
            }
        ];
    }
    
    /**
     * Select media and update input
     */
    function selectMedia(item) {
        console.log("Direct Selector Fix: Selected media", item);
        
        // Close the modal
        const modal = document.getElementById('customMediaSelectorModal');
        if (modal) {
            modal.remove();
        }
        
        // Update the target input
        if (currentTargetInputId) {
            const input = document.getElementById(currentTargetInputId);
            if (input) {
                // For our placeholder system, we'll use the name as the path
                // since we know actual images don't exist
                input.value = item.name || '';
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
                
                // Also update any preview elements
                updatePreview(currentTargetInputId, item);
            }
        }
    }
    
    /**
     * Update preview elements
     */
    function updatePreview(inputId, item) {
        // Find preview element by convention (either ID-based or near the input)
        const previewId = `${inputId}-preview`;
        let preview = document.getElementById(previewId);
        
        // If no direct ID match, look for nearby elements
        if (!preview) {
            const input = document.getElementById(inputId);
            if (input) {
                const container = input.closest('.form-group, .media-field, .input-group');
                if (container) {
                    preview = container.querySelector('.preview, .media-preview, .image-preview');
                }
            }
        }
        
        // Create a color placeholder for the preview
        let placeholderColor = '#3498db'; // Default blue
        if (item.folder === 'food') placeholderColor = '#e74c3c'; // Red
        if (item.folder === 'restaurant') placeholderColor = '#2ecc71'; // Green
        if (item.folder === 'people') placeholderColor = '#f39c12'; // Orange
        
        const placeholderSrc = createColorPlaceholder(placeholderColor);
        
        // Update the preview if found
        if (preview) {
            if (preview.tagName === 'IMG') {
                preview.src = placeholderSrc;
                preview.alt = item.name || '';
                preview.setAttribute('data-placeholder', 'true');
            } else {
                // If it's a container, look for or create an img
                let img = preview.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    preview.innerHTML = '';
                    preview.appendChild(img);
                }
                img.src = placeholderSrc;
                img.alt = item.name || '';
                img.setAttribute('data-placeholder', 'true');
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDirectOverride);
    } else {
        initDirectOverride();
    }
})();
