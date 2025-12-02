/**
 * Automation Media Folders
 * Handles media folder selection and tracking for automation paths
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize media folder selection for automation paths
    initMediaFolderSelection();
});

/**
 * Initialize media folder selection for automation paths
 */
function initMediaFolderSelection() {
    // Get the media folder select element
    const mediaFolderSelect = document.getElementById('media-folder');
    
    if (!mediaFolderSelect) return;
    
    // Load folders and populate the select
    loadMediaFoldersForSelect();
    
    // Add event listener to the automation path form to update the select when opened
    const automationPathForm = document.querySelector('.automation-path-form');
    if (automationPathForm) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style' && 
                    automationPathForm.style.display !== 'none') {
                    // Form is visible, refresh the folder list
                    loadMediaFoldersForSelect();
                }
            });
        });
        
        observer.observe(automationPathForm, { attributes: true });
    }
}

/**
 * Load media folders and populate the select element
 */
function loadMediaFoldersForSelect() {
    // Get the media folder select element
    const mediaFolderSelect = document.getElementById('media-folder');
    
    if (!mediaFolderSelect) return;
    
    // Keep the default option
    const defaultOption = mediaFolderSelect.querySelector('option[value=""]');
    mediaFolderSelect.innerHTML = '';
    
    if (defaultOption) {
        mediaFolderSelect.appendChild(defaultOption);
    }
    
    // Load folders from localStorage
    let mediaFolders = [];
    const savedFolders = localStorage.getItem('fooodis-media-folders');
    
    if (savedFolders) {
        try {
            mediaFolders = JSON.parse(savedFolders);
        } catch (error) {
            console.error('Error loading media folders:', error);
        }
    }
    
    // Add "Uncategorized" folder
    const uncategorizedOption = document.createElement('option');
    uncategorizedOption.value = 'uncategorized';
    uncategorizedOption.textContent = 'Uncategorized';
    mediaFolderSelect.appendChild(uncategorizedOption);
    
    // Add folders to select
    mediaFolders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        mediaFolderSelect.appendChild(option);
    });
}

/**
 * Get used image IDs from cloud API
 * @param {string} pathId - Optional path ID to filter by
 * @returns {Promise<string[]>} - Array of used image IDs
 */
async function getUsedImageIds(pathId = null) {
    try {
        const url = pathId 
            ? `/api/media/used-images?path_id=${encodeURIComponent(pathId)}`
            : '/api/media/used-images';
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.usedImageIds || [];
        }
    } catch (error) {
        console.warn('Failed to fetch used images from API:', error);
    }
    return [];
}

/**
 * Get an unused image from a specific folder
 * @param {string} folderId - The folder ID to get an image from
 * @param {string} pathId - The automation path ID (for tracking unique usage per path)
 * @param {boolean} useRandom - If true, use any image from any folder
 * @returns {Promise<Object>} - The image object or null if no unused images are available
 */
async function getUnusedImageFromFolder(folderId, pathId = null, useRandom = false) {
    let mediaLibrary = [];
    
    // Try to fetch from API first (R2/D1)
    try {
        // If useRandom is true, get ALL images; otherwise filter by folder
        const apiUrl = useRandom
            ? '/api/media?limit=500'
            : (folderId && folderId !== 'uncategorized' 
                ? `/api/media?folder=${encodeURIComponent(folderId)}&limit=100`
                : '/api/media?limit=100');
        
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            mediaLibrary = data.media || [];
            console.log(`Loaded ${mediaLibrary.length} media items from API`);
        }
    } catch (error) {
        console.warn('Failed to fetch media from API:', error);
    }
    
    if (mediaLibrary.length === 0) {
        console.warn('No media items found in library');
        return null;
    }
    
    // Filter by folder if specified and not using random
    let folderMedia = mediaLibrary;
    
    if (!useRandom && folderId) {
        if (folderId === 'uncategorized') {
            folderMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
        } else {
            folderMedia = mediaLibrary.filter(item => item.folder === folderId);
        }
    }
    
    // Filter to only include images (not videos) with cloud URLs
    folderMedia = folderMedia.filter(item => {
        const mimeType = item.mime_type || item.type || '';
        const url = item.r2_url || item.url || '';
        // Only use images that are stored in cloud (R2), not base64 or localhost
        const isCloudImage = url && !url.startsWith('data:') && !url.includes('localhost');
        return mimeType.startsWith('image/') && isCloudImage;
    });
    
    // Get used image IDs from cloud API
    const usedImageIds = await getUsedImageIds(pathId);
    
    // Filter to only include unused images
    const unusedMedia = folderMedia.filter(item => !usedImageIds.includes(item.id));
    
    // If no unused images, return null
    if (unusedMedia.length === 0) {
        console.warn(`No unused images available${folderId ? ` in folder ${folderId}` : ''}`);
        return null;
    }
    
    // Get a random unused image
    const randomIndex = Math.floor(Math.random() * unusedMedia.length);
    const selectedImage = unusedMedia[randomIndex];
    
    // Return with proper cloud URL
    return {
        ...selectedImage,
        url: selectedImage.r2_url || selectedImage.url
    };
}

/**
 * Mark an image as used in automation (saves to cloud D1 database)
 * @param {string} imageId - The ID of the image to mark as used
 * @param {string} pathId - The automation path ID
 * @param {string} postId - The post ID that uses this image
 */
async function markImageAsUsed(imageId, pathId = null, postId = null) {
    try {
        const response = await fetch('/api/media/used-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mediaId: imageId,
                pathId: pathId,
                postId: postId
            })
        });
        
        if (response.ok) {
            console.log(`Image ${imageId} marked as used in cloud database`);
            return true;
        } else {
            console.error('Failed to mark image as used in cloud');
            return false;
        }
    } catch (error) {
        console.error('Error marking image as used:', error);
        return false;
    }
}

/**
 * Report a failed post to the cloud API
 * @param {string} pathId - The automation path ID
 * @param {string} pathName - The automation path name
 * @param {string} reason - The reason for failure
 * @param {string} details - Additional details
 */
async function reportFailedPost(pathId, pathName, reason, details = null) {
    try {
        const response = await fetch('/api/automation/failed-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pathId: pathId,
                pathName: pathName,
                scheduledDate: new Date().toISOString(),
                reason: reason,
                details: details
            })
        });
        
        if (response.ok) {
            console.log('Failed post reported to cloud');
            
            // Dispatch event for dashboard to show alert
            window.dispatchEvent(new CustomEvent('automationPostFailed', {
                detail: { pathId, pathName, reason, details }
            }));
            
            return true;
        }
    } catch (error) {
        console.error('Error reporting failed post:', error);
    }
    return false;
}

/**
 * Enhanced version of generateImage that uses folder images when specified
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @param {string} folderId - The folder ID to get an image from (optional)
 * @param {Object} options - Additional options
 * @param {string} options.pathId - The automation path ID
 * @param {string} options.pathName - The automation path name
 * @param {boolean} options.useRandomImages - Whether to use random images from any folder
 * @param {boolean} options.stopOnNoImage - Whether to stop publishing if no image is available
 * @returns {Promise<Object>} - { url: string, success: boolean, error?: string }
 */
async function generateImageFromFolder(title, contentType, folderId, options = {}) {
    const { pathId, pathName, useRandomImages = false, stopOnNoImage = true } = options;
    
    // Try to get an unused image from the folder (or any folder if useRandomImages)
    const unusedImage = await getUnusedImageFromFolder(folderId, pathId, useRandomImages);
    
    // If no unused image is available
    if (!unusedImage) {
        const reason = useRandomImages 
            ? 'No unused images available in media library'
            : `No unused images available in folder: ${folderId || 'default'}`;
        
        console.warn(reason);
        
        // Report the failure
        await reportFailedPost(pathId, pathName || 'Unknown Path', reason, 
            `Post title: ${title}\nContent type: ${contentType}`);
        
        // If stopOnNoImage is true, return failure
        if (stopOnNoImage) {
            return {
                url: null,
                success: false,
                error: reason
            };
        }
        
        // Legacy placeholder code removed - local paths don't work across devices
        // Return failure instead of broken placeholder
        return { url: null, success: false, error: reason };
        
        /* OLD PLACEHOLDER CODE (disabled):
        const placeholders = {
            recipe: '/images/placeholder-recipe-1.jpg',
            review: '/images/placeholder-restaurant-1.jpg',
            general: '/images/placeholder-food-1.jpg'
        };
        
        const placeholder = placeholders[contentType] || placeholders.general;
        
        return {
            url: placeholder,
            success: true,
            isPlaceholder: true
        }; */
        };
    }
    
    // Mark the image as used in cloud database
    await markImageAsUsed(unusedImage.id, pathId, null);
    
    // Return the image URL (ensure it's a cloud URL)
    return {
        url: unusedImage.url,
        success: true,
        imageId: unusedImage.id
    };
}

// Override the original generateImage function if it exists
if (typeof window.generateImage === 'function') {
    window.originalGenerateImage = window.generateImage;
    window.generateImage = generateImageFromFolder;
}

// Make functions available globally
window.automationMediaFolders = {
    getUnusedImageFromFolder,
    getUsedImageIds,
    markImageAsUsed,
    reportFailedPost,
    generateImageFromFolder
};
