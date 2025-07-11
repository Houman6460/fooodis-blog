/**
 * Direct Image Fix
 * This is a direct fix for the image selection issue in automation paths
 * It forces the system to use a different image each time by directly modifying 
 * how images are selected and managed in the system
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct Image Fix - Loaded');
    initDirectImageFix();
});

/**
 * Get all images that are currently used in posts
 * @returns {Array} Array of image URLs currently used in posts
 */
function getImagesInUse() {
    const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
    return posts.map(post => post.image);
}

/**
 * Get all media from a specific folder
 * @param {string} folderId - Folder ID
 * @returns {Array} Media items in the folder
 */
function getMediaInFolder(folderId) {
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    if (folderId === 'uncategorized') {
        return mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
    } else {
        return mediaLibrary.filter(item => item.folder === folderId);
    }
}

/**
 * Get an image that hasn't been used in posts
 * @param {string} folderId - Folder ID
 * @returns {Object} Image object
 */
function getUnusedImage(folderId) {
    // Get images in use
    const imagesInUse = getImagesInUse();
    console.log(`Images currently in use: ${imagesInUse.length}`);
    
    // Get media in folder
    const folderMedia = getMediaInFolder(folderId);
    console.log(`Media in folder ${folderId}: ${folderMedia.length}`);
    
    // Filter to images only
    const images = folderMedia.filter(item => item.type && item.type.startsWith('image/'));
    console.log(`Images in folder ${folderId}: ${images.length}`);
    
    // Find images that aren't in use
    const availableImages = images.filter(item => !imagesInUse.includes(item.url));
    console.log(`Available images not in use: ${availableImages.length}`);
    
    if (availableImages.length > 0) {
        // Get a random image from available images
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        return availableImages[randomIndex];
    } else if (images.length > 0) {
        // All images are in use, reset and use a random one (least recently used)
        console.log('All images in folder are in use, using least recently used image');
        
        // Get a random image from the folder
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }
    
    return null;
}

/**
 * Initialize the direct image fix
 */
function initDirectImageFix() {
    // Override the core generatePostFromPath function
    if (window.generatePostFromPath) {
        console.log('Overriding generatePostFromPath with direct image fix');
        window.originalGeneratePostFromPath = window.generatePostFromPath;
        
        window.generatePostFromPath = async function(path) {
            console.log('Direct image fix: Generating post for path:', path.name);
            
            try {
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
                
                // Get an image that hasn't been used
                let imageUrl;
                
                if (path.useRandomImages) {
                    console.log('Using random image selection');
                    
                    // Use placeholder image logic for random selection
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
                    
                    // Select placeholder category
                    let imageArray;
                    switch (path.contentType) {
                        case 'recipe':
                            imageArray = placeholders.recipe;
                            break;
                        case 'review':
                            imageArray = placeholders.review;
                            break;
                        default:
                            imageArray = placeholders.general;
                    }
                    
                    // Make sure we don't select the same image as the most recent post
                    const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
                    const lastImage = posts.length > 0 ? posts[0].image : null;
                    
                    // Filter out the last used image if possible
                    const availableImages = lastImage ? 
                        imageArray.filter(img => img !== lastImage) : 
                        imageArray;
                    
                    // If we've somehow used all images, just use the full array
                    const imagesToUse = availableImages.length > 0 ? availableImages : imageArray;
                    
                    // Get a random image
                    imageUrl = imagesToUse[Math.floor(Math.random() * imagesToUse.length)];
                    console.log('Selected random image:', imageUrl);
                    
                } else if (path.mediaFolder) {
                    console.log('Using specific folder for image selection:', path.mediaFolder);
                    
                    // Get an unused image
                    const selectedImage = getUnusedImage(path.mediaFolder);
                    
                    if (selectedImage) {
                        imageUrl = selectedImage.url;
                        console.log('Selected image from folder:', imageUrl);
                    } else {
                        console.log('No suitable image found in folder, using placeholder');
                        // Use placeholder based on content type
                        const placeholders = {
                            recipe: 'images/placeholder-recipe-1.jpg',
                            review: 'images/placeholder-restaurant-1.jpg',
                            general: 'images/placeholder-food-1.jpg'
                        };
                        
                        switch (path.contentType) {
                            case 'recipe':
                                imageUrl = placeholders.recipe;
                                break;
                            case 'review':
                                imageUrl = placeholders.review;
                                break;
                            default:
                                imageUrl = placeholders.general;
                        }
                    }
                } else {
                    console.log('No folder specified, using default image selection');
                    
                    // Default to a placeholder based on content type
                    const placeholders = {
                        recipe: 'images/placeholder-recipe-1.jpg',
                        review: 'images/placeholder-restaurant-1.jpg',
                        general: 'images/placeholder-food-1.jpg'
                    };
                    
                    switch (path.contentType) {
                        case 'recipe':
                            imageUrl = placeholders.recipe;
                            break;
                        case 'review':
                            imageUrl = placeholders.review;
                            break;
                        default:
                            imageUrl = placeholders.general;
                    }
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
                    mediaFolder: path.mediaFolder,
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
    }
    
    // Also fix the generateImage function which might be used directly
    if (window.generateImage) {
        console.log('Overriding generateImage with direct image fix');
        window.originalGenerateImage = window.generateImage;
        
        window.generateImage = async function(title, contentType, folderId) {
            console.log('Direct image fix: Generating image for:', title);
            
            // If a folder is specified, get an unused image from it
            if (folderId) {
                console.log('Looking for unused image in folder:', folderId);
                const selectedImage = getUnusedImage(folderId);
                
                if (selectedImage) {
                    console.log('Selected image:', selectedImage.url);
                    return selectedImage.url;
                }
            }
            
            // If no folder specified or no image found, use placeholder
            console.log('No unused image found, using original generateImage function');
            return window.originalGenerateImage(title, contentType);
        };
    }
    
    // Fix the automation path form to ensure folder selection works properly
    fixAutomationPathForm();
}

/**
 * Fix automation path form to ensure folder selection works properly
 */
function fixAutomationPathForm() {
    // Wait for the save button to be clicked
    const saveBtn = document.querySelector('#save-automation-path');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log('Save button clicked, ensuring media folder is saved');
            
            // Get form values
            const folderSelect = document.getElementById('media-folder');
            const useRandomImagesCheckbox = document.getElementById('use-random-images');
            
            if (folderSelect && useRandomImagesCheckbox) {
                // Get the current path being edited
                const pathForm = document.querySelector('.automation-path-form');
                const pathId = pathForm.dataset.pathId;
                
                // If path ID exists, this is an edit operation
                if (pathId) {
                    console.log(`Saving media folder settings for path ${pathId}`);
                    
                    // Get paths from localStorage
                    const paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                    
                    // Find the path
                    const pathIndex = paths.findIndex(p => p.id === pathId);
                    if (pathIndex !== -1) {
                        // Update media folder settings
                        paths[pathIndex].mediaFolder = folderSelect.value;
                        paths[pathIndex].useRandomImages = useRandomImagesCheckbox.checked;
                        
                        console.log(`Updated path ${pathId} media folder to ${folderSelect.value}`);
                        console.log(`Updated path ${pathId} use random images to ${useRandomImagesCheckbox.checked}`);
                        
                        // Save back to localStorage
                        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
                    }
                }
            }
        });
    }
    
    // Fix the random images checkbox to toggle folder select
    const useRandomImagesCheckbox = document.getElementById('use-random-images');
    const folderSelect = document.getElementById('media-folder');
    
    if (useRandomImagesCheckbox && folderSelect) {
        useRandomImagesCheckbox.addEventListener('change', function() {
            folderSelect.disabled = this.checked;
        });
    }
}

/**
 * Update generation count for a path
 * @param {Object} path - The path object
 */
function updatePathGenerationCount(path) {
    if (!path || !path.id) return;
    
    // Get paths from localStorage
    const paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === path.id);
    if (pathIndex !== -1) {
        // Update generation count
        if (!paths[pathIndex].generationCount) {
            paths[pathIndex].generationCount = 0;
        }
        paths[pathIndex].generationCount++;
        paths[pathIndex].lastGenerated = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    }
}

// Make functions available globally
window.directImageFix = {
    getUnusedImage,
    getMediaInFolder,
    getImagesInUse
};
