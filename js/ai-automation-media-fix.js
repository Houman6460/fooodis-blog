
/**
 * AI Automation Media Fix
 * Fixes the connection between AI automation and media library
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Automation Media Fix: Initializing...');
    
    // Initialize media folder integration
    initializeMediaFolderIntegration();
    
    // Fix automation image selection
    fixAutomationImageSelection();
    
    // Override the automation post publishing to use proper images
    overrideAutomationPublishing();
});

function initializeMediaFolderIntegration() {
    console.log('AI Automation Media Fix: Setting up media folder integration');
    
    // Watch for automation form opens
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-automation-path') || 
            e.target.closest('[data-automation="add"]')) {
            
            setTimeout(() => {
                populateMediaFolders();
            }, 500);
        }
    });
    
    // Also check periodically
    setInterval(populateMediaFolders, 5000);
}

function populateMediaFolders() {
    const mediaFolderSelect = document.getElementById('media-folder');
    if (!mediaFolderSelect) {
        return;
    }
    
    console.log('AI Automation Media Fix: Populating media folders');
    
    // Get folders from media library
    const folders = getMediaLibraryFolders();
    
    // Clear existing options (except default)
    const defaultOption = mediaFolderSelect.querySelector('option[value=""]');
    mediaFolderSelect.innerHTML = '';
    
    if (defaultOption) {
        mediaFolderSelect.appendChild(defaultOption);
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Use Random Images';
        mediaFolderSelect.appendChild(option);
    }
    
    // Add folders
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.name;
        option.textContent = folder.name + ` (${folder.imageCount} images)`;
        option.dataset.path = folder.path;
        mediaFolderSelect.appendChild(option);
    });
    
    console.log('AI Automation Media Fix: Added', folders.length, 'folders to selector');
}

function getMediaLibraryFolders() {
    const folders = [];
    
    try {
        // Get media library data
        const mediaData = JSON.parse(localStorage.getItem('fooodis-media-library') || '{}');
        const folderStructure = mediaData.folders || {};
        
        // Process each folder
        Object.keys(folderStructure).forEach(folderName => {
            const folderData = folderStructure[folderName];
            const images = folderData.files ? folderData.files.filter(file => 
                file.type && file.type.startsWith('image/')
            ) : [];
            
            if (images.length > 0) {
                folders.push({
                    name: folderName,
                    path: folderName,
                    imageCount: images.length,
                    images: images
                });
            }
        });
        
        // Also check for uncategorized images
        const allFiles = mediaData.files || [];
        const uncategorizedImages = allFiles.filter(file => 
            file.type && file.type.startsWith('image/') && !file.folder
        );
        
        if (uncategorizedImages.length > 0) {
            folders.unshift({
                name: 'Uncategorized',
                path: 'uncategorized',
                imageCount: uncategorizedImages.length,
                images: uncategorizedImages
            });
        }
        
    } catch (error) {
        console.error('AI Automation Media Fix: Error getting folders:', error);
    }
    
    return folders;
}

function fixAutomationImageSelection() {
    console.log('AI Automation Media Fix: Fixing image selection logic');
    
    // Override the selectImageForPost function
    window.selectImageForAutomationPost = function(folderName) {
        console.log('AI Automation Media Fix: Selecting image from folder:', folderName);
        
        if (!folderName || folderName === '') {
            // Use random image from default collection
            return selectRandomDefaultImage();
        }
        
        // Get images from specified folder
        const folders = getMediaLibraryFolders();
        const targetFolder = folders.find(f => f.name === folderName);
        
        if (!targetFolder || !targetFolder.images || targetFolder.images.length === 0) {
            console.warn('AI Automation Media Fix: No images found in folder:', folderName);
            return selectRandomDefaultImage();
        }
        
        // Select random image from folder
        const randomIndex = Math.floor(Math.random() * targetFolder.images.length);
        const selectedImage = targetFolder.images[randomIndex];
        
        // Create proper image URL
        let imageUrl = selectedImage.url || selectedImage.src || selectedImage.path;
        
        // Ensure URL is properly formatted
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = 'images/' + imageUrl;
        }
        
        console.log('AI Automation Media Fix: Selected image:', imageUrl);
        
        // Mark image as used (optional)
        markImageAsUsed(selectedImage, folderName);
        
        return imageUrl;
    };
}

function selectRandomDefaultImage() {
    const defaultImages = [
        'images/chef-cooking.jpg',
        'images/restaurant-interior.jpg',
        'images/chef-decorating.jpg',
        'images/default-blog-image.jpg',
        'images/appetizing-soup-served-with-herbs.jpg',
        'images/hot-coffee-latte-art-on-wooden-table.jpg'
    ];
    
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
}

function markImageAsUsed(image, folderName) {
    try {
        // Get usage tracking data
        const usageData = JSON.parse(localStorage.getItem('fooodis-media-usage') || '{}');
        
        if (!usageData[folderName]) {
            usageData[folderName] = {};
        }
        
        const imageKey = image.name || image.url || image.path;
        if (!usageData[folderName][imageKey]) {
            usageData[folderName][imageKey] = 0;
        }
        
        usageData[folderName][imageKey]++;
        
        // Save usage data
        localStorage.setItem('fooodis-media-usage', JSON.stringify(usageData));
        
        console.log('AI Automation Media Fix: Marked image as used:', imageKey);
        
    } catch (error) {
        console.error('AI Automation Media Fix: Error tracking usage:', error);
    }
}

function overrideAutomationPublishing() {
    console.log('AI Automation Media Fix: Overriding automation publishing');
    
    // Store original publishing function
    if (window.publishAutomatedPost) {
        window.originalPublishAutomatedPost = window.publishAutomatedPost;
    }
    
    // Override with media-aware version
    window.publishAutomatedPost = function(post, automationPath) {
        console.log('AI Automation Media Fix: Publishing post with proper media handling');
        
        try {
            // Ensure post has proper image
            if (!post.imageUrl || post.imageUrl === '' || post.imageUrl === 'undefined') {
                console.log('AI Automation Media Fix: Post missing image, selecting one...');
                
                // Get the media folder from automation path
                const mediaFolder = automationPath && automationPath.mediaFolder ? 
                    automationPath.mediaFolder : '';
                
                // Select appropriate image
                post.imageUrl = window.selectImageForAutomationPost(mediaFolder);
                
                console.log('AI Automation Media Fix: Set post image to:', post.imageUrl);
            }
            
            // Ensure image URL is properly formatted
            if (post.imageUrl && !post.imageUrl.startsWith('http') && !post.imageUrl.startsWith('/')) {
                if (!post.imageUrl.startsWith('images/')) {
                    post.imageUrl = 'images/' + post.imageUrl;
                }
            }
            
            // Validate that the image exists
            validateAndFixImageUrl(post);
            
            // Call original publishing function
            if (window.originalPublishAutomatedPost) {
                return window.originalPublishAutomatedPost(post, automationPath);
            } else {
                // Fallback publishing logic
                return publishPostDirectly(post);
            }
            
        } catch (error) {
            console.error('AI Automation Media Fix: Error in publishing:', error);
            
            // Fallback to default image and try again
            post.imageUrl = 'images/default-blog-image.jpg';
            
            if (window.originalPublishAutomatedPost) {
                return window.originalPublishAutomatedPost(post, automationPath);
            } else {
                return publishPostDirectly(post);
            }
        }
    };
}

function validateAndFixImageUrl(post) {
    // List of known good images
    const fallbackImages = [
        'images/default-blog-image.jpg',
        'images/chef-cooking.jpg',
        'images/restaurant-interior.jpg',
        'images/appetizing-soup-served-with-herbs.jpg'
    ];
    
    // If no image or broken image, use fallback
    if (!post.imageUrl || 
        post.imageUrl === 'undefined' || 
        post.imageUrl === 'null' ||
        post.imageUrl.includes('undefined') ||
        post.imageUrl.includes('null')) {
        
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        post.imageUrl = fallbackImages[randomIndex];
        
        console.log('AI Automation Media Fix: Fixed broken image URL to:', post.imageUrl);
    }
}

async function publishPostDirectly(post) {
    console.log('AI Automation Media Fix: Publishing post directly via API');
    
    try {
        // Ensure post has required fields
        if (!post.date) {
            post.date = new Date().toISOString();
        }
        
        if (!post.status) {
            post.status = 'published';
        }
        
        // Prepare post data for API
        const postData = {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || '',
            category: post.category || 'Uncategorized',
            subcategory: post.subcategory || null,
            tags: post.tags || [],
            image_url: post.imageUrl || post.image_url || '',
            status: 'published',
            published_date: post.date
        };
        
        // Save to cloud database via API
        const response = await fetch('/api/blog/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            const result = await response.json();
            const createdPost = result.post;
            
            console.log('AI Automation Media Fix: Post published to database:', createdPost.id);
            
            // Trigger refresh events
            document.dispatchEvent(new CustomEvent('blogPostsUpdated', {
                detail: { posts: [createdPost] }
            }));
            
            return {
                success: true,
                post: createdPost,
                url: 'blog.html?post=' + createdPost.id
            };
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to save post to database');
        }
        
    } catch (error) {
        console.error('AI Automation Media Fix: Error in direct publishing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export functions for global use
window.AIAutomationMediaFix = {
    populateMediaFolders,
    getMediaLibraryFolders,
    selectImageForAutomationPost: window.selectImageForAutomationPost,
    validateAndFixImageUrl
};

console.log('AI Automation Media Fix: Loaded successfully');
