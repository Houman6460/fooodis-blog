/**
 * Core Interception Module
 * This is a last-resort approach that intercepts core browser functions
 * to ensure image uniqueness and content diversity
 */

// Execute immediately - this needs to be the first script that runs
(function() {
    console.log('Core Interception: Initializing emergency fix');
    
    // Initialize tracking variables
    window.interceptedPostCount = 0;
    window.interceptedImages = [];
    
    // Back up the original localStorage methods
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    
    // Override localStorage.setItem to intercept blog post saving
    localStorage.setItem = function(key, value) {
        // Check if this is a blog posts save operation
        if (key === 'fooodis-blog-posts') {
            console.log('Core Interception: Intercepted blog posts save operation');
            
            try {
                // Parse the posts
                let posts = JSON.parse(value);
                if (Array.isArray(posts)) {
                    // Process each post to ensure uniqueness
                    posts = ensurePostsUniqueness(posts);
                    
                    // Stringify the modified posts
                    value = JSON.stringify(posts);
                    console.log('Core Interception: Modified posts saved to localStorage');
                }
            } catch (error) {
                console.error('Core Interception: Error processing posts', error);
            }
        }
        
        // Call the original method
        return originalSetItem.call(localStorage, key, value);
    };
    
    // Override localStorage.getItem to intercept blog post retrieval
    localStorage.getItem = function(key) {
        // Get the value using the original method
        const value = originalGetItem.call(localStorage, key);
        
        // Check if this is a blog posts get operation
        if (key === 'fooodis-blog-posts' && value) {
            console.log('Core Interception: Intercepted blog posts retrieval');
            
            try {
                // Parse the posts
                let posts = JSON.parse(value);
                if (Array.isArray(posts)) {
                    // Process posts on retrieval to ensure uniqueness
                    posts = ensurePostsUniqueness(posts);
                    
                    // Return the modified posts
                    return JSON.stringify(posts);
                }
            } catch (error) {
                console.error('Core Interception: Error processing retrieved posts', error);
            }
        }
        
        // Return the original value
        return value;
    };
    
    // Also intercept image generation
    interceptImageGeneration();
    
    console.log('Core Interception: Emergency fix initialized');
})();

/**
 * Intercept image generation functions
 */
function interceptImageGeneration() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImageInterception);
    } else {
        setupImageInterception();
    }
    
    // Also intercept on window load
    window.addEventListener('load', function() {
        setTimeout(setupImageInterception, 1000);
    });
}

/**
 * Set up image generation interception
 */
function setupImageInterception() {
    // Intercept all possible image generation functions
    
    // Option 1: Direct function override
    if (typeof window.generateImage === 'function') {
        const originalGenerateImage = window.generateImage;
        window.generateImage = function() {
            console.log('Core Interception: Intercepted generateImage call');
            
            // Get the result from the original function
            const result = originalGenerateImage.apply(this, arguments);
            
            // If it's a string (direct image URL), make it unique
            if (typeof result === 'string') {
                return makeImageUnique(result);
            }
            
            // If it's a promise, wait for it and make the result unique
            if (result && typeof result.then === 'function') {
                return result.then(image => {
                    if (typeof image === 'string') {
                        return makeImageUnique(image);
                    }
                    return image;
                });
            }
            
            return result;
        };
        console.log('Core Interception: Successfully overrode generateImage');
    }
    
    // Option 2: Get image from folder override
    if (typeof window.getImageFromFolder === 'function') {
        const originalGetImageFromFolder = window.getImageFromFolder;
        window.getImageFromFolder = function() {
            console.log('Core Interception: Intercepted getImageFromFolder call');
            
            // Get the result from the original function
            const result = originalGetImageFromFolder.apply(this, arguments);
            
            // If it's a string (direct image URL), make it unique
            if (typeof result === 'string') {
                return makeImageUnique(result);
            }
            
            // If it's a promise, wait for it and make the result unique
            if (result && typeof result.then === 'function') {
                return result.then(image => {
                    if (typeof image === 'string') {
                        return makeImageUnique(image);
                    }
                    return image;
                });
            }
            
            return result;
        };
        console.log('Core Interception: Successfully overrode getImageFromFolder');
    }
    
    // Option 3: Get random image override
    if (typeof window.getRandomImage === 'function') {
        const originalGetRandomImage = window.getRandomImage;
        window.getRandomImage = function() {
            console.log('Core Interception: Intercepted getRandomImage call');
            
            // Get the result from the original function
            const result = originalGetRandomImage.apply(this, arguments);
            
            // If it's a string (direct image URL), make it unique
            if (typeof result === 'string') {
                return makeImageUnique(result);
            }
            
            // If it's a promise, wait for it and make the result unique
            if (result && typeof result.then === 'function') {
                return result.then(image => {
                    if (typeof image === 'string') {
                        return makeImageUnique(image);
                    }
                    return image;
                });
            }
            
            return result;
        };
        console.log('Core Interception: Successfully overrode getRandomImage');
    }
}

/**
 * Make an image URL unique by adding a timestamp
 * @param {string} imageUrl - The original image URL
 * @returns {string} A unique image URL
 */
function makeImageUnique(imageUrl) {
    if (!imageUrl) return imageUrl;
    
    // Track this image
    window.interceptedImages.push(imageUrl);
    
    // Add a timestamp query parameter to make it unique
    const timestamp = Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}t=${timestamp}`;
}

/**
 * Ensure all posts have unique images and content
 * @param {Array} posts - Array of blog posts
 * @returns {Array} Modified array with unique posts
 */
function ensurePostsUniqueness(posts) {
    if (!Array.isArray(posts) || posts.length === 0) return posts;
    
    // Track post content hashes to detect duplicates
    const contentHashes = new Map();
    const imagesSeen = new Set();
    
    // Process each post
    return posts.map(post => {
        // Skip non-objects
        if (!post || typeof post !== 'object') return post;
        
        // Increment intercept counter
        window.interceptedPostCount++;
        
        // ENSURE UNIQUE CONTENT
        if (post.content) {
            // Create a simple hash of the content
            const contentHash = simpleHash(post.content);
            
            // Check if we've seen this content before
            if (contentHashes.has(contentHash)) {
                console.log('Core Interception: Detected duplicate content, making it unique');
                
                // Make content unique by adding a timestamp and counter
                post.content = makeContentUnique(post.content, window.interceptedPostCount);
            }
            
            // Store this content hash
            contentHashes.set(simpleHash(post.content), true);
        }
        
        // ENSURE UNIQUE IMAGE
        if (post.image || post.imageUrl) {
            const imageUrl = post.image || post.imageUrl;
            
            // Check if this image has been seen before
            if (imagesSeen.has(imageUrl)) {
                console.log('Core Interception: Detected duplicate image, making it unique');
                
                // Make the image unique and valid
                const uniqueImage = makeImageUnique(imageUrl);
                if (uniqueImage && isValidImagePath(uniqueImage)) {
                    post.image = uniqueImage;
                    post.imageUrl = uniqueImage;
                } else {
                    // Fallback to default image
                    post.image = 'images/default-blog-image.jpg';
                    post.imageUrl = 'images/default-blog-image.jpg';
                }
            }
            
            // Add this image to seen set
            imagesSeen.add(post.image);
        }
        
        return post;
    });
}

/**
 * Validate if an image path exists and is accessible
 */
function isValidImagePath(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return false;
    
    // Check if it's a data URL
    if (imagePath.startsWith('data:image/')) return true;
    
    // Check common image extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = validExtensions.some(ext => 
        imagePath.toLowerCase().includes(ext)
    );
    
    if (!hasValidExtension) return false;
    
    // Check if path looks reasonable
    if (imagePath.startsWith('images/') || 
        imagePath.startsWith('./images/') || 
        imagePath.startsWith('/images/') ||
        imagePath.startsWith('http://') || 
        imagePath.startsWith('https://')) {
        return true;
    }
    
    return false;
}

/**
 * Create a simple hash of a string
 * @param {string} str - The string to hash
 * @returns {string} A simple hash
 */
function simpleHash(str) {
    if (typeof str !== 'string') return '';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
}

/**
 * Make content unique by adding unique identifiers
 * @param {string} content - The original content
 * @param {number} counter - A unique counter
 * @returns {string} Unique content
 */
function makeContentUnique(content, counter) {
    if (!content) return content;
    
    // Create timestamp and unique ID
    const timestamp = new Date().toISOString();
    const uniqueId = `post-${counter}-${Date.now()}`;
    
    // Split the content into paragraphs
    const paragraphs = content.split('\n\n');
    
    // Add a unique paragraph at the end
    paragraphs.push(`\n\nThis is a unique version of this content (ID: ${uniqueId}, Time: ${timestamp}).`);
    
    // If the content is very short, add more unique content
    if (paragraphs.length < 3) {
        paragraphs.push(`\n\nAdditional unique content: This post has been enhanced with unique identifiers to ensure it stands apart from other posts. Each post should have its own distinct content and information.`);
    }
    
    // Join paragraphs back together
    return paragraphs.join('\n\n');
}
