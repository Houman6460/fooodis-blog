/**
 * Email Subscribers Media Thumbnail Fix
 * 
 * This script fixes the issue where media thumbnails don't display properly
 * in the Email Subscribers "Select Media" modal, showing colored placeholders
 * instead of actual thumbnails.
 */

(function() {
    // Run the fix when the DOM is loaded and also on window load
    document.addEventListener('DOMContentLoaded', initThumbnailFix);
    window.addEventListener('load', initThumbnailFix);
    
    // Also set a timeout to ensure initialization even if events fail
    setTimeout(initThumbnailFix, 2000);
    
    /**
     * Initialize the media thumbnail fix
     */
    function initThumbnailFix() {
        console.log('Initializing Email Subscribers Media Thumbnail Fix');
        
        // Monitor for media modal openings
        monitorMediaModalOpening();
        
        // Monitor for dynamic content changes in existing modals
        monitorExistingModals();
    }
    
    /**
     * Monitor for media modal opening
     */
    function monitorMediaModalOpening() {
        // Override the original openMediaLibrary function if it exists
        if (typeof window.originalOpenMediaLibrary === 'function' || typeof window.openMediaLibrary === 'function') {
            const originalOpen = window.originalOpenMediaLibrary || window.openMediaLibrary;
            
            window.openMediaLibrary = function(targetInputId) {
                // Call the original function
                originalOpen(targetInputId);
                
                // Apply our fix after a short delay to let the modal render
                setTimeout(() => {
                    fixMediaThumbnails();
                }, 300);
                
                // Keep checking for a while in case of slow loading
                let checkCount = 0;
                const intervalId = setInterval(() => {
                    fixMediaThumbnails();
                    checkCount++;
                    if (checkCount > 10) clearInterval(intervalId);
                }, 500);
            };
        }
    }
    
    /**
     * Monitor existing modals for dynamic content changes
     */
    function monitorExistingModals() {
        // Set up a mutation observer to watch for changes in the document
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is a media modal or contains one
                            if (node.classList && node.classList.contains('media-selection-modal')) {
                                fixMediaThumbnails(node);
                            } else if (node.querySelector && node.querySelector('.media-selection-modal')) {
                                fixMediaThumbnails(node.querySelector('.media-selection-modal'));
                            }
                            
                            // Also check for media items being added
                            if (node.classList && node.classList.contains('media-item')) {
                                fixSingleMediaThumbnail(node);
                            } else if (node.querySelector && node.querySelector('.media-item')) {
                                const items = node.querySelectorAll('.media-item');
                                items.forEach(fixSingleMediaThumbnail);
                            }
                        }
                    }
                }
            }
        });
        
        // Start observing
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        // Also periodically check for modals
        setInterval(fixAllMediaThumbnails, 3000);
    }
    
    /**
     * Fix all media thumbnails in all modals
     */
    function fixAllMediaThumbnails() {
        const modals = document.querySelectorAll('.media-selection-modal');
        modals.forEach(fixMediaThumbnails);
    }
    
    /**
     * Fix media thumbnails in a specific modal
     */
    function fixMediaThumbnails(modal = null) {
        // If no modal is provided, find all modals
        const modals = modal ? [modal] : document.querySelectorAll('.media-selection-modal');
        
        modals.forEach(modalElement => {
            const mediaItems = modalElement.querySelectorAll('.media-item');
            mediaItems.forEach(fixSingleMediaThumbnail);
        });
    }
    
    /**
     * Fix a single media thumbnail
     */
    function fixSingleMediaThumbnail(item) {
        if (!item) return;
        
        // Get the image element
        const img = item.querySelector('img');
        if (!img) return;
        
        // Get the media name element which contains the filename
        const nameElement = item.querySelector('.media-name');
        if (!nameElement) return;
        
        const filename = nameElement.textContent.trim();
        
        // Check if the image source is working
        if (!img.src || img.src === 'about:blank' || img.naturalWidth === 0) {
            // Try to find the image in the main media library
            findAndApplyCorrectThumbnail(img, filename);
        }
        
        // Also fix placeholder styling that might be overriding the actual image
        fixPlaceholderStyling(item);
    }
    
    /**
     * Find and apply the correct thumbnail URL
     */
    function findAndApplyCorrectThumbnail(img, filename) {
        console.log('Finding correct thumbnail for:', filename);
        
        // First, try to get the image from the main media library using localStorage
        let mediaData = null;
        
        try {
            // Try ALL possible storage keys where media data might be stored
            const storageKeys = [
                'fooodis-blog-media',     // Primary key used in dashboard-fixes.js
                'fooodis_media_items',    // Used in unified-media-selector.js
                'fooodis_unified_media',  // Used in unified-media-selector.js
                'media_library_items',    // Used in unified-media-selector.js
                'fooodis_main_media_library', // Used in unified-media-selector.js
                'mediaLibraryItems',
                'fooodis-media-library',
                'media-library-data',
                'storedMediaItems'
            ];
            
            for (const key of storageKeys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed && (parsed.images || parsed.length > 0)) {
                            console.log(`Found media data in ${key}:`, parsed.length || (parsed.images && parsed.images.length) || 'unknown length');
                            mediaData = parsed;
                            break;
                        }
                    } catch (parseError) {
                        console.warn(`Error parsing ${key}:`, parseError);
                    }
                }
            }
        } catch (e) {
            console.error('Error accessing media data:', e);
        }
        
        // Also try to get data from global variables
        if (!mediaData) {
            if (window.mediaItems) {
                mediaData = window.mediaItems;
                console.log('Found media data in window.mediaItems');
            } else if (window.MediaGallery && window.MediaGallery.state && window.MediaGallery.state.mediaItems) {
                mediaData = window.MediaGallery.state.mediaItems;
                console.log('Found media data in MediaGallery state');
            } else if (window.emailMediaItems) {
                mediaData = window.emailMediaItems;
                console.log('Found media data in window.emailMediaItems');
            }
        }
        
        // If we found media data, look for a matching file
        if (mediaData) {
            let mediaArray = [];
            
            // Handle different media data structures
            if (Array.isArray(mediaData)) {
                mediaArray = mediaData;
            } else if (mediaData.images && Array.isArray(mediaData.images)) {
                mediaArray = mediaData.images;
            }
            
            // Extract just the filename without path if it contains slashes
            const cleanFilename = filename.includes('/') ? filename.split('/').pop() : filename;
            console.log('Looking for file match with:', cleanFilename);
            
            // Look for an image with a matching filename - try multiple matching strategies
            const matchingMedia = mediaArray.find(media => {
                const mediaName = media.name || media.filename || '';
                const mediaClean = mediaName.includes('/') ? mediaName.split('/').pop() : mediaName;
                
                // Try various matching strategies
                return mediaClean === cleanFilename || 
                       mediaClean.includes(cleanFilename) || 
                       cleanFilename.includes(mediaClean) ||
                       // Try without file extension
                       mediaClean.replace(/\.[^/.]+$/, '') === cleanFilename.replace(/\.[^/.]+$/, '') ||
                       // Try matching URL parts
                       (media.url && media.url.includes(cleanFilename));
            });
            
            // If we found a match, set the image source
            if (matchingMedia) {
                console.log('Found matching media:', matchingMedia);
                const imageUrl = matchingMedia.url || matchingMedia.thumbnailUrl || matchingMedia.path;
                
                if (imageUrl) {
                    // Remove any placeholder attributes
                    img.removeAttribute('data-placeholder-fixed');
                    
                    // Set the actual image source
                    img.src = imageUrl;
                    
                    // Make sure the image dimensions are set properly
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    
                    // Remove any background color that might be hiding the image
                    img.style.backgroundColor = 'transparent';
                    
                    // Override hover event handlers that might interfere
                    const parent = img.parentElement;
                    if (parent) {
                        parent.onmouseover = null;
                        parent.onmouseout = null;
                    }
                    
                    return true; // Successfully applied thumbnail
                }
            } else {
                console.log('No exact media match found, trying to construct URL');
            }
        }
        
        // If we couldn't find a match in media data, try to construct a URL based on filename
        return constructThumbnailUrl(img, filename);
    }
    
    /**
     * Construct a thumbnail URL based on filename
     */
    function constructThumbnailUrl(img, filename) {
        if (!filename) return false;
        
        console.log('Constructing thumbnail URL for:', filename);
        
        // Remove data-placeholder-fixed attribute to ensure the image can be displayed
        img.removeAttribute('data-placeholder-fixed');
        
        // Extract just the filename without path if it contains slashes
        const cleanFilename = filename.includes('/') ? filename.split('/').pop() : filename;
        
        // Check if the filename has an extension
        const hasExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(cleanFilename);
        const fileBase = hasExtension ? cleanFilename.replace(/\.[^/.]+$/, '') : cleanFilename;
        
        // Try multiple directory patterns for the image
        const directories = [
            'images/',
            'css/images/',
            '/images/',
            '/css/images/',
            './images/',
            '../images/'
        ];
        
        // Extensions to try
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        // Create array of URLs to try (combine directories + filename + extensions)
        let urlsToTry = [];
        
        // First try with the original filename as-is
        directories.forEach(dir => {
            // Try with the original filename first (highest priority)
            urlsToTry.push(`${dir}${cleanFilename}`);
            
            // If it has an extension already, also try other extensions as fallbacks
            if (hasExtension) {
                extensions.forEach(ext => {
                    // Skip if it's the same extension the file already has
                    if (!cleanFilename.toLowerCase().endsWith(`.${ext}`)) {
                        urlsToTry.push(`${dir}${fileBase}.${ext}`);
                    }
                });
            } else {
                // No extension in the original filename, try adding each extension
                extensions.forEach(ext => {
                    urlsToTry.push(`${dir}${fileBase}.${ext}`);
                });
            }
        });
        
        // Add direct URL attempt if the filename looks like a full URL
        if (cleanFilename.includes('http')) {
            urlsToTry.unshift(cleanFilename); // Add at the beginning with highest priority
        }
        
        // Try to match with known image patterns in the application
        if (cleanFilename.includes('food') || cleanFilename.includes('restaurant')) {
            // Add specific path patterns for food and restaurant images (higher priority)
            urlsToTry.unshift(`images/food/${cleanFilename}`);
            urlsToTry.unshift(`images/categories/food/${cleanFilename}`);
        }
        
        console.log(`Trying ${urlsToTry.length} possible paths for image:`, cleanFilename);
        
        // Track success
        let imageLoaded = false;
        
        // Try each URL sequentially with a small delay
        function tryNextUrl(index) {
            if (index >= urlsToTry.length || imageLoaded) {
                // We've tried all URLs or already found a working one
                if (!imageLoaded) {
                    console.warn('Failed to load image after trying all paths:', cleanFilename);
                }
                return;
            }
            
            const url = urlsToTry[index];
            
            // Test if the image exists
            checkImageExists(url, function(exists) {
                if (exists && !imageLoaded) {
                    // Image loaded successfully, update the src
                    console.log('Image found at:', url);
                    imageLoaded = true;
                    
                    // Apply the image
                    img.src = url;
                    
                    // Ensure the placeholder system doesn't override it
                    img.removeAttribute('data-placeholder-fixed');
                    img.setAttribute('data-original-loaded', 'true');
                    
                    // Make sure the image dimensions are set properly
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    
                    // Remove any background color or styling that might be hiding the image
                    img.style.backgroundColor = 'transparent';
                    
                    // Fix any parent elements that might be interfering
                    const parent = img.parentElement;
                    if (parent) {
                        parent.style.backgroundColor = 'transparent';
                        
                        // Remove event handlers that might interfere
                        parent.onmouseover = null;
                        parent.onmouseout = null;
                        
                        // If parent has a before/after pseudo element, try to disable it
                        try {
                            const parentStyle = document.createElement('style');
                            let selector = '';
                            
                            // Safely add ID selector if available
                            if (parent.id) {
                                selector += `#${parent.id}::before, #${parent.id}::after`;
                            }
                            
                            // Safely add class selectors if available
                            if (parent.className && typeof parent.className === 'string') {
                                const classes = parent.className.split(' ').filter(c => c.trim());
                                if (classes.length > 0) {
                                    if (selector) selector += ', ';
                                    selector += classes.map(c => `.${c}::before, .${c}::after`).join(', ');
                                }
                            }
                            
                            // Only create style if we have selectors
                            if (selector) {
                                parentStyle.innerHTML = `
                                    ${selector} {
                                        display: none !important;
                                        opacity: 0 !important;
                                    }
                                `;
                                document.head.appendChild(parentStyle);
                            }
                        } catch(e) {
                            console.error('Error creating style for parent element:', e);
                        }
                    }
                    
                    return true;
                } else {
                    // Try the next URL
                    setTimeout(() => tryNextUrl(index + 1), 10);
                }
            });
        }
        
        // Start trying URLs
        tryNextUrl(0);
        
        return imageLoaded;
    }
    
    /**
     * Check if an image exists
     */
    function checkImageExists(url, callback) {
        const img = new Image();
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = url;
    }
    
    /**
     * Fix placeholder styling that might be overriding the actual image
     */
    function fixPlaceholderStyling(item) {
        // Sometimes colored backgrounds are applied to .media-thumbnail
        const thumbnail = item.querySelector('.media-thumbnail');
        if (thumbnail) {
            // Remove any background color that might be hiding the image
            thumbnail.style.backgroundColor = 'transparent';
            
            // Make sure the actual thumbnail container is not hiding the image
            thumbnail.style.position = 'relative';
            thumbnail.style.overflow = 'visible';
        }
        
        // Find any placeholder elements that might be overlaying the image
        const placeholders = item.querySelectorAll('.placeholder, .media-placeholder, .thumbnail-placeholder');
        placeholders.forEach(placeholder => {
            // Hide any placeholders that might be blocking the image
            placeholder.style.display = 'none';
        });
        
        // If there's a "Food", "Restaurant", etc. label hiding the thumbnail, remove it
        const categoryLabels = Array.from(item.querySelectorAll('*')).filter(el => 
            (el.textContent === 'Food' || 
             el.textContent === 'Restaurant' || 
             el.textContent === 'People' || 
             el.textContent === 'Test') && 
            el.children.length === 0
        );
        
        categoryLabels.forEach(label => {
            if (label.parentNode && label.parentNode.classList.contains('media-thumbnail')) {
                label.style.display = 'none';
            }
        });
        
        // Make sure any images in the item are visible and properly sized
        const images = item.querySelectorAll('img');
        images.forEach(img => {
            img.style.display = 'block';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.position = 'relative';
            img.style.zIndex = '5'; // Put it above any potential placeholders
        });
    }
    
})();
