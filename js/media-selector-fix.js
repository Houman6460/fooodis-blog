/**
 * Media Selector Fix
 * Direct fix for media folder selection in automation
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Media Selector Fix loaded');
    initMediaSelectorFix();
});

/**
 * Initialize the media selector fix
 */
function initMediaSelectorFix() {
    // Replace the core generatePostFromPath function with our fixed version
    fixGeneratePostFromPath();
    
    // Ensure media folder selection works correctly
    enhanceMediaFolderUI();
    
    // Track all posts that are being generated
    trackPostGeneration();
}

/**
 * Directly override the post generation function to enforce correct folder usage
 */
function fixGeneratePostFromPath() {
    // Keep a reference to the original function
    if (window.generatePostFromPath) {
        window.originalGeneratePostFromPath = window.generatePostFromPath;
    }
    
    // Create a new implementation that enforces correct media folder usage
    window.generatePostFromPath = async function(path) {
        console.log('Fixed generatePostFromPath running with media folder enforcement');
        
        if (!path) {
            console.error('No path provided');
            return { success: false, error: 'No path provided' };
        }
        
        try {
            console.log('Generating post for path:', path.name);
            
            // Log media folder information
            console.log('Media folder setting:', path.mediaFolder || 'None');
            console.log('Use random images setting:', path.useRandomImages || false);
            
            // Generate title
            const title = await window.generateTitle(path.contentType);
            if (!title) {
                return { success: false, error: 'Failed to generate title' };
            }
            
            // Generate content
            const content = await window.generateContent(title, path.contentType);
            if (!content) {
                return { success: false, error: 'Failed to generate content' };
            }
            
            // Get the image from the correct folder
            let imageUrl;
            try {
                if (path.useRandomImages) {
                    console.log('Using random image as specified in path settings');
                    // Use random image logic
                    imageUrl = await window.originalGenerateImage(title, path.contentType);
                } else if (path.mediaFolder) {
                    console.log('Using image from selected folder:', path.mediaFolder);
                    // Use our direct folder selection logic
                    imageUrl = await getImageFromSpecificFolder(path.mediaFolder, title, path.contentType);
                } else {
                    console.log('No folder specified, falling back to default image selection');
                    // Fallback to original image generation
                    imageUrl = await window.originalGenerateImage(title, path.contentType);
                }
            } catch (error) {
                console.error('Error generating image:', error);
                // Fallback to a default image if there was an error
                imageUrl = 'images/placeholder-food-1.jpg';
            }
            
            if (!imageUrl) {
                console.warn('Failed to generate image, using placeholder');
                imageUrl = 'images/placeholder-food-1.jpg';
            }
            
            // Create post object
            const post = {
                id: 'post-' + Date.now(),
                title: title,
                content: content,
                image: imageUrl,
                author: 'AI Assistant',
                date: new Date().toISOString(),
                status: 'draft',
                category: path.category || 'Uncategorized',
                tags: path.tags || [],
                mediaFolder: path.mediaFolder, // Store the folder used
                useRandomImages: path.useRandomImages,
                generatedBy: path.id,
                generatedAt: new Date().toISOString()
            };
            
            // Update path generation count
            updatePathGenerationCount(path);
            
            return { success: true, post: post };
        } catch (error) {
            console.error('Error generating post:', error);
            return { success: false, error: error.message || 'Unknown error' };
        }
    };
    
    console.log('Successfully overrode generatePostFromPath function with fixed version');
}

/**
 * Get an image from a specific folder
 * This is a direct implementation to ensure we get images from the right folder
 * @param {string} folderId - The folder ID
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @returns {Promise<string>} - The image URL
 */
async function getImageFromSpecificFolder(folderId, title, contentType) {
    console.log(`Getting image from folder: ${folderId} for post: ${title}`);
    
    // Get all media from localStorage
    let allMedia = [];
    try {
        const savedMedia = localStorage.getItem('fooodis-blog-media');
        if (savedMedia) {
            allMedia = JSON.parse(savedMedia);
        }
    } catch (error) {
        console.error('Error loading media library:', error);
        return getPlaceholderImage(contentType);
    }
    
    // Filter media by folder
    let folderMedia = [];
    if (folderId === 'uncategorized') {
        folderMedia = allMedia.filter(item => !item.folder || item.folder === 'uncategorized');
    } else {
        folderMedia = allMedia.filter(item => item.folder === folderId);
    }
    
    console.log(`Found ${folderMedia.length} items in folder ${folderId}`);
    
    // Filter to only include images
    const images = folderMedia.filter(item => 
        item.type && item.type.startsWith('image/'));
    
    console.log(`Found ${images.length} images in folder ${folderId}`);
    
    // Filter to only include unused images
    const unusedImages = images.filter(item => !item.usedInAutomation);
    
    console.log(`Found ${unusedImages.length} unused images in folder ${folderId}`);
    
    // If no unused images, try to reset all images in folder to unused
    if (unusedImages.length === 0) {
        if (images.length > 0) {
            console.log('No unused images found, resetting usage for all images in folder');
            
            // Reset all images in this folder to unused
            images.forEach(image => {
                image.usedInAutomation = false;
                image.usedDate = null;
            });
            
            // Save back to localStorage
            localStorage.setItem('fooodis-blog-media', JSON.stringify(allMedia));
            
            // Now all images should be unused
            const resetImages = images;
            
            // Get a random image from the reset images
            const randomIndex = Math.floor(Math.random() * resetImages.length);
            const selectedImage = resetImages[randomIndex];
            
            // Mark as used
            markImageAsUsed(selectedImage.id);
            
            console.log(`Selected image ${selectedImage.id} after resetting usage`);
            
            return selectedImage.url;
        } else {
            console.log('No images found in folder, using placeholder');
            return getPlaceholderImage(contentType);
        }
    }
    
    // Get a random unused image
    const randomIndex = Math.floor(Math.random() * unusedImages.length);
    const selectedImage = unusedImages[randomIndex];
    
    // Mark as used
    markImageAsUsed(selectedImage.id);
    
    console.log(`Selected unused image ${selectedImage.id} from folder ${folderId}`);
    
    return selectedImage.url;
}

/**
 * Mark an image as used in automation
 * @param {string} imageId - The ID of the image to mark as used
 */
function markImageAsUsed(imageId) {
    // Get media library
    let mediaLibrary = [];
    try {
        const savedMedia = localStorage.getItem('fooodis-blog-media');
        if (savedMedia) {
            mediaLibrary = JSON.parse(savedMedia);
        }
    } catch (error) {
        console.error('Error loading media library:', error);
        return;
    }
    
    // Find the image
    const imageIndex = mediaLibrary.findIndex(item => item.id === imageId);
    
    if (imageIndex !== -1) {
        // Mark as used
        mediaLibrary[imageIndex].usedInAutomation = true;
        mediaLibrary[imageIndex].usedDate = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
        
        console.log(`Image ${imageId} marked as used in automation`);
    } else {
        console.warn(`Image ${imageId} not found in media library`);
    }
}

/**
 * Get a placeholder image based on content type
 * @param {string} contentType - The content type
 * @returns {string} - The placeholder image URL
 */
function getPlaceholderImage(contentType) {
    const placeholders = {
        recipe: 'images/placeholder-recipe-1.jpg',
        review: 'images/placeholder-restaurant-1.jpg',
        general: 'images/placeholder-food-1.jpg'
    };
    
    switch (contentType) {
        case 'recipe':
            return placeholders.recipe;
        case 'review':
            return placeholders.review;
        default:
            return placeholders.general;
    }
}

/**
 * Enhance the media folder selection UI
 */
function enhanceMediaFolderUI() {
    // Add an observer to detect when the form is opened
    const pathForm = document.querySelector('.automation-path-form');
    if (!pathForm) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' && 
                pathForm.style.display !== 'none') {
                // Form is visible, enhance the UI
                console.log('Path form opened, enhancing media folder UI');
                
                // Get the folder select
                const folderSelect = document.getElementById('media-folder');
                if (!folderSelect) return;
                
                // Get the use random images checkbox
                const useRandomImagesCheckbox = document.getElementById('use-random-images');
                if (!useRandomImagesCheckbox) return;
                
                // Update folder select based on checkbox state
                folderSelect.disabled = useRandomImagesCheckbox.checked;
                
                // Get current path ID
                const pathId = pathForm.dataset.pathId;
                
                // If editing an existing path, load its settings
                if (pathId) {
                    loadPathMediaSettings(pathId);
                }
                
                // Add event listener to checkbox if not already added
                if (!useRandomImagesCheckbox.dataset.listenerAdded) {
                    useRandomImagesCheckbox.addEventListener('change', function() {
                        folderSelect.disabled = this.checked;
                        updatePathMediaSettings(pathId);
                    });
                    useRandomImagesCheckbox.dataset.listenerAdded = 'true';
                }
                
                // Add event listener to folder select if not already added
                if (!folderSelect.dataset.listenerAdded) {
                    folderSelect.addEventListener('change', function() {
                        updatePathMediaSettings(pathId);
                    });
                    folderSelect.dataset.listenerAdded = 'true';
                }
            }
        });
    });
    
    observer.observe(pathForm, { attributes: true });
}

/**
 * Load media settings for a path
 * @param {string} pathId - The path ID
 */
function loadPathMediaSettings(pathId) {
    if (!pathId) return;
    
    // Get path from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading paths:', error);
        return;
    }
    
    // Find the path
    const path = paths.find(p => p.id === pathId);
    if (!path) {
        console.warn(`Path ${pathId} not found`);
        return;
    }
    
    // Set UI elements
    const folderSelect = document.getElementById('media-folder');
    const useRandomImagesCheckbox = document.getElementById('use-random-images');
    
    if (folderSelect && path.mediaFolder) {
        folderSelect.value = path.mediaFolder;
    }
    
    if (useRandomImagesCheckbox && path.useRandomImages !== undefined) {
        useRandomImagesCheckbox.checked = path.useRandomImages;
        
        // Update folder select state
        if (folderSelect) {
            folderSelect.disabled = path.useRandomImages;
        }
    }
    
    console.log(`Loaded media settings for path ${pathId}:`, {
        folder: path.mediaFolder,
        useRandom: path.useRandomImages
    });
}

/**
 * Update media settings for a path
 * @param {string} pathId - The path ID
 */
function updatePathMediaSettings(pathId) {
    if (!pathId) return;
    
    // Get UI values
    const folderSelect = document.getElementById('media-folder');
    const useRandomImagesCheckbox = document.getElementById('use-random-images');
    
    // Get path from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === pathId);
    if (pathIndex === -1) {
        console.warn(`Path ${pathId} not found`);
        return;
    }
    
    // Update path settings
    if (folderSelect) {
        paths[pathIndex].mediaFolder = folderSelect.value;
    }
    
    if (useRandomImagesCheckbox) {
        paths[pathIndex].useRandomImages = useRandomImagesCheckbox.checked;
    }
    
    // Save back to localStorage
    localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    
    console.log(`Updated media settings for path ${pathId}:`, {
        folder: paths[pathIndex].mediaFolder,
        useRandom: paths[pathIndex].useRandomImages
    });
}

/**
 * Update path generation count
 * @param {Object} path - The path object
 */
function updatePathGenerationCount(path) {
    if (!path || !path.id) return;
    
    // Get paths from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === path.id);
    if (pathIndex === -1) {
        console.warn(`Path ${path.id} not found`);
        return;
    }
    
    // Update generation count
    if (!paths[pathIndex].generationCount) {
        paths[pathIndex].generationCount = 0;
    }
    paths[pathIndex].generationCount++;
    paths[pathIndex].lastGenerated = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    
    console.log(`Updated generation count for path ${path.id} to ${paths[pathIndex].generationCount}`);
}

/**
 * Track post generation to ensure correct folder usage
 */
function trackPostGeneration() {
    // Create a hook to monitor all posts that are published
    const originalShowPublishNotification = window.showPublishNotification;
    if (originalShowPublishNotification) {
        window.showPublishNotification = function(post, error) {
            // Call original function
            originalShowPublishNotification(post, error);
            
            // Check if post has correct media folder info
            if (post && !error) {
                console.log('Post published:', post);
                console.log('Media folder used:', post.mediaFolder || 'None');
                
                // Log for debugging
                if (post.mediaFolder) {
                    console.log(`SUCCESS: Post used media from folder ${post.mediaFolder}`);
                } else if (post.useRandomImages) {
                    console.log('SUCCESS: Post used random images as configured');
                }
            }
        };
    }
}

// Make sure the original generateImage function is still available
if (window.generateImage && !window.originalGenerateImage) {
    window.originalGenerateImage = window.generateImage;
}

// Make the fixed functions available globally
window.mediaSelectorFix = {
    getImageFromSpecificFolder,
    markImageAsUsed,
    loadPathMediaSettings,
    updatePathMediaSettings
};
