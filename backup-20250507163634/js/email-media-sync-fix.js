/**
 * Email Media Sync Fix
 * 
 * This script fixes the issue where the Email Subscribers media selector 
 * doesn't properly load pictures from the Media Library.
 * 
 * It ensures both systems use the same data source by:
 * 1. Synchronizing localStorage keys
 * 2. Providing direct access to media items
 * 3. Fixing folder structure references
 * 4. DISABLING the pure placeholder system that blocks real images
 */

(function() {
    // Initialize as soon as possible
    document.addEventListener('DOMContentLoaded', initMediaSync);
    window.addEventListener('load', initMediaSync);
    
    // Also use a timeout as fallback
    setTimeout(initMediaSync, 1000);
    
    // Periodic check to ensure continuous sync
    setInterval(syncMediaData, 2000);
    
    // Track initialization
    let initialized = false;
    
    // CRITICAL: Disable the pure placeholder system
    disablePlaceholderSystem();
    
    /**
     * Initialize the media synchronization
     */
    function initMediaSync() {
        if (initialized) return;
        initialized = true;
        
        console.log('Email Media Sync: Initializing');
        
        // Immediate sync of media data
        syncMediaData();
        
        // Set up button observers
        setupMediaButtonObserver();
        
        // Override the email media selector to use the main library data
        overrideEmailMediaSelector();
    }
    
    /**
     * Synchronize media data between all storage keys
     */
    function syncMediaData() {
        // Sources in order of priority
        const mediaSources = [
            'fooodis-blog-media',
            'fooodis_unified_media',
            'fooodis_media_items',
            'media_library_items'
        ];
        
        // Email media keys that need to be updated
        const emailMediaKeys = [
            'fooodis_media_images',
            'fooodis-media-images',
            'media_images',
            'fooodis_email_media'
        ];
        
        // Folder keys
        const folderSources = [
            'fooodis-media-folders',
            'fooodis_media_folders',
            'media_folders'
        ];
        
        // Get media data from main sources
        let mediaData = null;
        for (const source of mediaSources) {
            try {
                const data = localStorage.getItem(source);
                if (data && data.length > 10) {
                    mediaData = JSON.parse(data);
                    if (Array.isArray(mediaData) && mediaData.length > 0) {
                        console.log(`Email Media Sync: Found ${mediaData.length} items in ${source}`);
                        break;
                    }
                }
            } catch (e) {
                console.error(`Error reading from ${source}`, e);
            }
        }
        
        // If we found media data, update all email media keys
        if (mediaData) {
            const mediaString = JSON.stringify(mediaData);
            emailMediaKeys.forEach(key => {
                try {
                    localStorage.setItem(key, mediaString);
                } catch (e) {
                    console.error(`Error writing to ${key}`, e);
                }
            });
            
            // Create a global reference that can be accessed directly
            window.emailMediaItems = mediaData;
            
            // Set the global MediaGallery state if it exists
            if (window.MediaGallery && window.MediaGallery.state) {
                window.MediaGallery.state.mediaItems = {
                    images: mediaData,
                    videos: []
                };
            }
        }
        
        // Sync folder data
        let folderData = null;
        for (const source of folderSources) {
            try {
                const data = localStorage.getItem(source);
                if (data && data.length > 2) {
                    folderData = JSON.parse(data);
                    if (Array.isArray(folderData) && folderData.length > 0) {
                        console.log(`Email Media Sync: Found ${folderData.length} folders in ${source}`);
                        break;
                    }
                }
            } catch (e) {
                console.error(`Error reading folders from ${source}`, e);
            }
        }
        
        // If we found folder data, update all folder sources
        if (folderData) {
            const folderString = JSON.stringify(folderData);
            folderSources.forEach(key => {
                try {
                    localStorage.setItem(key, folderString);
                } catch (e) {
                    console.error(`Error writing folders to ${key}`, e);
                }
            });
            
            // Create a global reference
            window.mediaFolders = folderData;
        }
    }
    
    /**
     * Set up an observer to detect media select buttons added to the DOM
     */
    function setupMediaButtonObserver() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is a media select button
                            const buttons = node.querySelectorAll('.media-select-btn, .select-media-btn, [data-action="select-media"]');
                            buttons.forEach(updateMediaButton);
                            
                            // Also check if the node itself is a button
                            if (node.classList && 
                                (node.classList.contains('media-select-btn') || 
                                 node.classList.contains('select-media-btn') ||
                                 node.getAttribute('data-action') === 'select-media')) {
                                updateMediaButton(node);
                            }
                        }
                    }
                }
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    /**
     * Update a media select button to use our enhanced openMediaLibrary function
     */
    function updateMediaButton(button) {
        if (button && !button.dataset.enhancedEmailMedia) {
            button.dataset.enhancedEmailMedia = 'true';
            
            // Save original click handler
            const originalOnClick = button.onclick;
            
            // Set new click handler
            button.onclick = function(e) {
                // Only override in Email Subscribers section
                if (isEmailSubscribersSection()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Get target input ID
                    let targetInput = button.getAttribute('data-target') || 
                                    button.getAttribute('data-input') || 
                                    button.closest('[data-input]')?.getAttribute('data-input');
                    
                    // If no target specified, look for nearby input
                    if (!targetInput) {
                        const container = button.closest('.form-group, .input-group, .media-field');
                        if (container) {
                            const input = container.querySelector('input[type="text"], input[type="hidden"]');
                            if (input && input.id) {
                                targetInput = input.id;
                            }
                        }
                    }
                    
                    if (targetInput) {
                        console.log('Email Media Sync: Opening media selector for', targetInput);
                        
                        // Use proper media library function if available
                        if (typeof window.openMediaLibrary === 'function') {
                            window.openMediaLibrary(targetInput);
                        } else if (typeof window.openEnhancedMediaSelector === 'function') {
                            window.openEnhancedMediaSelector(targetInput);
                        } else {
                            // Fallback to original handler if we can't handle it
                            if (typeof originalOnClick === 'function') {
                                return originalOnClick.call(this, e);
                            }
                        }
                    } else {
                        console.error('Email Media Sync: No target input found for media selection');
                    }
                    
                    return false;
                } else if (typeof originalOnClick === 'function') {
                    // Use original handler outside Email Subscribers
                    return originalOnClick.call(this, e);
                }
            };
        }
    }
    
    /**
     * Override the email media selector to use the main library data
     */
    function overrideEmailMediaSelector() {
        // Only override in Email Subscribers section
        if (!isEmailSubscribersSection()) {
            return;
        }
        
        // Show indicator that we're active
        const indicator = document.createElement('div');
        indicator.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; z-index: 9999; opacity: 0.8;';
        indicator.textContent = 'Email Media Sync: Active';
        indicator.id = 'email-media-sync-indicator';
        document.body.appendChild(indicator);
        
        // Fade out after 3 seconds
        setTimeout(() => {
            indicator.style.transition = 'opacity 1s';
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 1000);
        }, 3000);
        
        // Override the email media selector functions
        if (typeof window.openMediaLibrary === 'function') {
            console.log('Email Media Sync: Enhancing existing openMediaLibrary function');
            const originalOpenMedia = window.openMediaLibrary;
            
            window.openMediaLibrary = function(targetInputId) {
                // Force a sync before opening
                syncMediaData();
                
                // Then use original function
                return originalOpenMedia(targetInputId);
            };
        }
    }
    
    /**
     * Check if we're in the Email Subscribers section
     */
    function isEmailSubscribersSection() {
        // Check for section indicators
        const emailSection = document.querySelector('[data-section="email-management"], #email-management-section, #email-subscribers-section');
        if (emailSection) return true;
        
        // Check for section heading
        const headings = document.querySelectorAll('h1, h2, h3, h4, .section-title');
        for (const heading of headings) {
            if (heading.textContent.includes('Email Subscriber')) {
                return true;
            }
        }
        
        // Check for active navigation item
        const navItems = document.querySelectorAll('.nav-item, .sidebar-item, .sidebar-link');
        for (const item of navItems) {
            if (item.textContent.includes('Email') && 
                item.textContent.includes('Subscriber') && 
                (item.classList.contains('active') || item.querySelector('.active'))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Disable the pure placeholder system that's blocking real images
     */
    function disablePlaceholderSystem() {
        console.log('Email Media Sync: Disabling placeholder system for real image loading');
        
        // 1. Restore original Image constructor if it was overridden
        if (window.originalImageConstructor) {
            window.Image = window.originalImageConstructor;
            console.log('Email Media Sync: Restored original Image constructor');
        }
        
        // 2. Remove data-placeholder-fixed attribute from all images
        function restoreRealImages() {
            // Find all images with placeholder attribute
            const placeholderImages = document.querySelectorAll('img[data-placeholder-fixed="true"]');
            placeholderImages.forEach(img => {
                // Get the original image path from alt text or data attributes
                const originalPath = img.getAttribute('data-original-src') || 
                                    img.getAttribute('alt') || 
                                    img.getAttribute('data-path');
                
                if (originalPath) {
                    // Determine if this is a real path or just a label
                    if (originalPath.includes('.jpg') || 
                        originalPath.includes('.png') || 
                        originalPath.includes('.gif') || 
                        originalPath.includes('.jpeg')) {
                        
                        // Try to restore real image
                        img.removeAttribute('data-placeholder-fixed');
                        
                        // Try different path patterns
                        const possiblePaths = [
                            `images/${originalPath}`,
                            `css/images/${originalPath}`,
                            originalPath
                        ];
                        
                        // Try to load the real image from potential paths
                        let loaded = false;
                        for (const path of possiblePaths) {
                            try {
                                const tempImg = new Image();
                                tempImg.onload = function() {
                                    img.src = path;
                                    loaded = true;
                                    console.log('Email Media Sync: Successfully loaded real image:', path);
                                };
                                tempImg.src = path;
                                
                                // Also try setting direct path
                                if (!loaded) {
                                    img.src = path;
                                }
                            } catch (e) {
                                console.error('Error loading image path:', path, e);
                            }
                        }
                    }
                }
            });
        }
        
        // 3. Override the createPlaceholder function if it exists
        if (window.createPlaceholder) {
            const originalCreatePlaceholder = window.createPlaceholder;
            window.createPlaceholder = function(img) {
                // In Email Subscribers context, try to load real image instead
                if (isEmailSubscribersSection()) {
                    const originalPath = img.getAttribute('data-original-src') || 
                                        img.getAttribute('alt') || 
                                        img.getAttribute('data-path');
                    
                    if (originalPath && (
                        originalPath.includes('.jpg') || 
                        originalPath.includes('.png') || 
                        originalPath.includes('.gif') || 
                        originalPath.includes('.jpeg'))) {
                        
                        // Try to load the real image
                        try {
                            img.src = `images/${originalPath}`;
                            return; // Skip placeholder creation
                        } catch (e) {
                            console.error('Error loading real image:', e);
                        }
                    }
                }
                
                // Fall back to original placeholder for non-Email contexts
                return originalCreatePlaceholder(img);
            };
        }
        
        // Run immediately and periodically
        restoreRealImages();
        setInterval(restoreRealImages, 1000);
    }
})();
