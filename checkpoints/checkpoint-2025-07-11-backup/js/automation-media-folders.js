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
 * Get an unused image from a specific folder
 * @param {string} folderId - The folder ID to get an image from
 * @returns {Promise<Object>} - The image object or null if no unused images are available
 */
async function getUnusedImageFromFolder(folderId) {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Filter by folder if specified
    let folderMedia = mediaLibrary;
    
    if (folderId) {
        if (folderId === 'uncategorized') {
            folderMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
        } else {
            folderMedia = mediaLibrary.filter(item => item.folder === folderId);
        }
    }
    
    // Filter to only include images (not videos)
    folderMedia = folderMedia.filter(item => item.type.startsWith('image/'));
    
    // Filter to only include unused images
    const unusedMedia = folderMedia.filter(item => !item.usedInAutomation);
    
    // If no unused images, return null
    if (unusedMedia.length === 0) {
        return null;
    }
    
    // Get a random unused image
    const randomIndex = Math.floor(Math.random() * unusedMedia.length);
    return unusedMedia[randomIndex];
}

/**
 * Mark an image as used in automation
 * @param {string} imageId - The ID of the image to mark as used
 */
function markImageAsUsed(imageId) {
    // Get media library
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    // Find the image
    const imageIndex = mediaLibrary.findIndex(item => item.id === imageId);
    
    if (imageIndex !== -1) {
        // Mark as used
        mediaLibrary[imageIndex].usedInAutomation = true;
        mediaLibrary[imageIndex].usedDate = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        console.log(`Image ${imageId} marked as used in automation`);
    }
}

/**
 * Enhanced version of generateImage that uses folder images when specified
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @param {string} folderId - The folder ID to get an image from (optional)
 * @returns {Promise<string>} - The image URL
 */
async function generateImageFromFolder(title, contentType, folderId) {
    // If no folder ID is specified or include images is not checked, use the original function
    if (!folderId) {
        // Use the original function (placeholder implementation)
        const placeholders = {
            recipe: [
                'images/placeholder-recipe-1.jpg',
                'images/placeholder-recipe-2.jpg',
                'images/placeholder-recipe-3.jpg'
            ],
            review: [
                'images/placeholder-restaurant-1.jpg',
                'images/placeholder-restaurant-2.jpg',
                'images/placeholder-restaurant-3.jpg'
            ],
            general: [
                'images/placeholder-food-1.jpg',
                'images/placeholder-food-2.jpg',
                'images/placeholder-food-3.jpg'
            ]
        };
        
        // Select a placeholder based on content type
        let images;
        switch (contentType) {
            case 'recipe':
                images = placeholders.recipe;
                break;
            case 'review':
                images = placeholders.review;
                break;
            default:
                images = placeholders.general;
        }
        
        // Return a random placeholder
        return Promise.resolve(images[Math.floor(Math.random() * images.length)]);
    }
    
    // Try to get an unused image from the folder
    const unusedImage = await getUnusedImageFromFolder(folderId);
    
    // If no unused image is available, use a placeholder
    if (!unusedImage) {
        console.log(`No unused images available in folder ${folderId}, using placeholder`);
        
        // Use a placeholder based on content type
        const placeholders = {
            recipe: 'images/placeholder-recipe-1.jpg',
            review: 'images/placeholder-restaurant-1.jpg',
            general: 'images/placeholder-food-1.jpg'
        };
        
        let placeholder;
        switch (contentType) {
            case 'recipe':
                placeholder = placeholders.recipe;
                break;
            case 'review':
                placeholder = placeholders.review;
                break;
            default:
                placeholder = placeholders.general;
        }
        
        return Promise.resolve(placeholder);
    }
    
    // Mark the image as used
    markImageAsUsed(unusedImage.id);
    
    // Return the image URL
    return Promise.resolve(unusedImage.url);
}

// Override the original generateImage function if it exists
if (typeof window.generateImage === 'function') {
    window.originalGenerateImage = window.generateImage;
    window.generateImage = generateImageFromFolder;
}

// Make functions available globally
window.automationMediaFolders = {
    getUnusedImageFromFolder,
    markImageAsUsed,
    generateImageFromFolder
};
