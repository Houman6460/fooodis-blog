/**
 * Automation Media Fix
 * Fixes issues with media folder selection for automation paths
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fix
    initAutomationMediaFix();
});

/**
 * Initialize the automation media fix
 */
function initAutomationMediaFix() {
    console.log('Initializing automation media folder fix...');

    // Override the post generation function to properly use selected folders
    overridePostGeneration();
    
    // Add listeners to ensure folder selection is saved properly
    enhanceFolderSelection();
}

/**
 * Override the post generation function to use the correct folder
 */
function overridePostGeneration() {
    // Store original function if it exists
    if (typeof window.generatePostFromPath === 'function') {
        window.originalGeneratePostFromPath = window.generatePostFromPath;
        
        // Override with fixed version
        window.generatePostFromPath = async function(path) {
            console.log('Using fixed generatePostFromPath with proper folder handling');
            
            // Ensure path exists
            if (!path) {
                console.error('No path provided to generatePostFromPath');
                return null;
            }
            
            try {
                // Get the folder ID from the path configuration
                const folderId = path.mediaFolder || '';
                console.log(`Using media folder: ${folderId || 'default'} for path: ${path.name}`);
                
                // Check if we should use random images
                const useRandomImages = path.useRandomImages === true;
                console.log(`Using random images: ${useRandomImages}`);
                
                // Get content type from path
                const contentType = path.contentType || 'general';
                
                // Generate the post title
                const title = await window.generateTitle(contentType);
                if (!title) {
                    console.error('Failed to generate title');
                    return null;
                }
                
                // Generate the post content
                const content = await window.generateContent(title, contentType);
                if (!content) {
                    console.error('Failed to generate content');
                    return null;
                }
                
                // Generate image - pass the correct folder ID if not using random images
                const imageUrl = await window.generateImageFromFolder(
                    title, 
                    contentType, 
                    useRandomImages ? null : folderId
                );
                
                if (!imageUrl) {
                    console.error('Failed to generate image');
                    return null;
                }
                
                // Create the post object
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
                    mediaFolderId: folderId, // Store folder ID for reference
                    generatedBy: path.id,
                    generatedAt: new Date().toISOString()
                };
                
                // Save the post
                savePost(post);
                
                // Update generation count
                updatePathGenerationCount(path);
                
                return post;
            } catch (error) {
                console.error('Error generating post from path:', error);
                return null;
            }
        };
        
        console.log('Successfully overrode generatePostFromPath function');
    } else {
        console.warn('generatePostFromPath function not found, could not override');
    }
}

/**
 * Enhance the folder selection functionality
 */
function enhanceFolderSelection() {
    // Monitor the media folder select element
    const mediaFolderSelect = document.getElementById('media-folder');
    const useRandomImagesCheckbox = document.getElementById('use-random-images');
    
    if (mediaFolderSelect) {
        // Add event listener to save selection
        mediaFolderSelect.addEventListener('change', function() {
            // When media folder is selected, update currently editing path
            const editingPathId = document.querySelector('.automation-path-form').dataset.pathId;
            if (editingPathId) {
                console.log(`Updating media folder selection for path ${editingPathId}`);
                updatePathMediaFolder(editingPathId, mediaFolderSelect.value);
            }
        });
        
        console.log('Added event listener to media folder select');
    }
    
    if (useRandomImagesCheckbox) {
        // Add event listener to save checkbox state
        useRandomImagesCheckbox.addEventListener('change', function() {
            // When checkbox state changes, update currently editing path
            const editingPathId = document.querySelector('.automation-path-form').dataset.pathId;
            if (editingPathId) {
                console.log(`Updating random images setting for path ${editingPathId}`);
                updatePathRandomImagesSetting(editingPathId, useRandomImagesCheckbox.checked);
            }
        });
        
        console.log('Added event listener to use random images checkbox');
    }
    
    // Add hook to the automation path form open event
    monitorPathFormOpen();
}

/**
 * Update the media folder for a path
 */
function updatePathMediaFolder(pathId, folderId) {
    // Get paths from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading automation paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === pathId);
    if (pathIndex !== -1) {
        // Update the media folder
        paths[pathIndex].mediaFolder = folderId;
        console.log(`Updated path ${pathId} media folder to ${folderId}`);
        
        // Save back to localStorage
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    }
}

/**
 * Update the random images setting for a path
 */
function updatePathRandomImagesSetting(pathId, useRandomImages) {
    // Get paths from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading automation paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === pathId);
    if (pathIndex !== -1) {
        // Update the random images setting
        paths[pathIndex].useRandomImages = useRandomImages;
        console.log(`Updated path ${pathId} use random images to ${useRandomImages}`);
        
        // Save back to localStorage
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    }
}

/**
 * Monitor automation path form open events to set correct selections
 */
function monitorPathFormOpen() {
    // Monitor when path form is opened
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' && 
                mutation.target.style.display !== 'none') {
                
                console.log('Path form opened, loading selections');
                
                // Form is visible, load the correct selections based on path ID
                const pathId = mutation.target.dataset.pathId;
                if (pathId) {
                    loadPathSelections(pathId);
                }
            }
        });
    });
    
    // Start observing
    const pathForm = document.querySelector('.automation-path-form');
    if (pathForm) {
        observer.observe(pathForm, { attributes: true });
        console.log('Started monitoring automation path form');
    }
}

/**
 * Load selections for a specific path
 */
function loadPathSelections(pathId) {
    // Get path from localStorage
    let path = null;
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            const paths = JSON.parse(savedPaths);
            path = paths.find(p => p.id === pathId);
        }
    } catch (error) {
        console.error('Error loading path:', error);
        return;
    }
    
    if (!path) {
        console.warn(`Path ${pathId} not found`);
        return;
    }
    
    // Set media folder selection
    const mediaFolderSelect = document.getElementById('media-folder');
    if (mediaFolderSelect && path.mediaFolder) {
        mediaFolderSelect.value = path.mediaFolder;
        console.log(`Set media folder select to ${path.mediaFolder}`);
    }
    
    // Set use random images checkbox
    const useRandomImagesCheckbox = document.getElementById('use-random-images');
    if (useRandomImagesCheckbox && path.useRandomImages !== undefined) {
        useRandomImagesCheckbox.checked = path.useRandomImages;
        console.log(`Set use random images checkbox to ${path.useRandomImages}`);
        
        // Update the UI state based on checkbox
        toggleMediaFolderSelection(path.useRandomImages);
    }
}

/**
 * Toggle media folder selection based on checkbox state
 */
function toggleMediaFolderSelection(useRandomImages) {
    const mediaFolderSelect = document.getElementById('media-folder');
    if (mediaFolderSelect) {
        mediaFolderSelect.disabled = useRandomImages;
        console.log(`Media folder select ${useRandomImages ? 'disabled' : 'enabled'}`);
    }
}

/**
 * Update generation count for a path
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
        console.error('Error loading automation paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === path.id);
    if (pathIndex !== -1) {
        // Update generation count
        if (!paths[pathIndex].generationCount) {
            paths[pathIndex].generationCount = 0;
        }
        paths[pathIndex].generationCount++;
        paths[pathIndex].lastGenerated = new Date().toISOString();
        
        console.log(`Updated path ${path.id} generation count to ${paths[pathIndex].generationCount}`);
        
        // Save back to localStorage
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    }
}

/**
 * Helper function to save post
 */
function savePost(post) {
    if (!post) return;
    
    // Get posts from localStorage
    let posts = [];
    try {
        const savedPosts = localStorage.getItem('fooodis-blog-posts');
        if (savedPosts) {
            posts = JSON.parse(savedPosts);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
    
    // Add new post
    posts.unshift(post);
    
    // Save to localStorage
    localStorage.setItem('fooodis-blog-posts', JSON.stringify(posts));
    console.log(`Saved post ${post.id} to localStorage`);
    
    // Show notification if function exists
    if (typeof window.showPublishNotification === 'function') {
        window.showPublishNotification(post);
    }
}
