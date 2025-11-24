/**
 * Media Placeholder Fix
 * A standalone script that ensures placeholder images are shown when actual images fail to load
 * This doesn't modify any existing functionality
 */

(function() {
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    let initialized = false;
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Media Placeholder Fix: Initializing');
        
        // Add the styles for placeholders
        addPlaceholderStyles();
        
        // Set up observer for media selector
        observeMediaSelector();
    }
    
    function addPlaceholderStyles() {
        // Only add styles if they don't already exist
        if (document.getElementById('media-placeholder-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'media-placeholder-styles';
        style.textContent = `
            /* Generic placeholder backgrounds */
            .media-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #333;
                color: #fff;
                font-size: 14px;
                height: 100%;
                width: 100%;
                text-align: center;
                padding: 10px;
                border-radius: 4px;
                box-sizing: border-box;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            /* Add overlay to any media-item with broken image */
            .media-item.has-placeholder {
                position: relative;
            }
            
            /* Make sure the thumbnails have proper height for placeholder */
            .media-thumbnail {
                min-height: 120px;
                position: relative;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    function observeMediaSelector() {
        // Set up observer for dynamically added media items
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        // Check if a media selector modal was added
                        if (node.classList && node.classList.contains('media-selector-modal')) {
                            handleMediaSelectorModal(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function handleMediaSelectorModal(modal) {
        console.log('Media Placeholder Fix: Media selector modal detected');
        
        // Find all media items and add placeholder handling
        setTimeout(() => {
            const mediaItems = modal.querySelectorAll('.media-item');
            mediaItems.forEach(handleMediaItem);
            
            // Also watch for new items added to the grid
            const mediaGrid = modal.querySelector('.media-grid');
            if (mediaGrid) {
                const gridObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            mutation.addedNodes.forEach(node => {
                                if (node.classList && node.classList.contains('media-item')) {
                                    handleMediaItem(node);
                                }
                            });
                        }
                    });
                });
                
                gridObserver.observe(mediaGrid, {
                    childList: true
                });
            }
        }, 100);
    }
    
    function handleMediaItem(mediaItem) {
        const img = mediaItem.querySelector('img');
        if (!img) return;
        
        // Get media item data
        const name = mediaItem.getAttribute('data-name') || 'Image';
        const folder = mediaItem.getAttribute('data-folder') || 'image';
        
        // Check if image is already broken
        if (img.complete && (img.naturalWidth === 0 || !img.src)) {
            addPlaceholder(mediaItem, img, name, folder);
        }
        
        // Add error listener to handle image loading failures
        img.addEventListener('error', function() {
            addPlaceholder(mediaItem, img, name, folder);
        });
    }
    
    function addPlaceholder(mediaItem, img, name, folder) {
        // Don't add placeholder if it already exists
        if (mediaItem.classList.contains('has-placeholder')) return;
        
        // Mark the item as having a placeholder
        mediaItem.classList.add('has-placeholder');
        
        // Hide the broken image
        img.style.display = 'none';
        
        // Find the thumbnail container
        const thumbnail = mediaItem.querySelector('.media-thumbnail');
        if (!thumbnail) return;
        
        // Create placeholder element
        const placeholder = document.createElement('div');
        placeholder.className = 'media-placeholder';
        
        // Add icon based on folder type
        let icon = '📷';
        if (folder === 'food') icon = '🍽️';
        if (folder === 'restaurant') icon = '🏢';
        if (folder === 'people') icon = '👤';
        
        placeholder.textContent = `${icon} ${name.substring(0, 15)}`;
        
        // Add placeholder to thumbnail
        thumbnail.appendChild(placeholder);
    }
})();
