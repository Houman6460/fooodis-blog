/**
 * Blog Image Diversifier
 * Ensures each post displays a different image on the blog page
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog Image Diversifier loaded');
    setTimeout(diversifyBlogImages, 500); // Wait for blog.js to render posts
});

/**
 * Main function to diversify images on blog posts
 */
function diversifyBlogImages() {
    console.log('Diversifying blog post images...');

    // Get all blog post cards
    const postCards = document.querySelectorAll('.blog-post-card');

    if (postCards.length === 0) {
        console.log('No blog post cards found, trying again in 1 second');
        setTimeout(diversifyBlogImages, 1000);
        return;
    }

    console.log(`Found ${postCards.length} blog post cards`);

    // Track image URLs to avoid duplicates
    const usedImageUrls = new Set();

    // Get all blog posts from localStorage
    const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
    console.log(`Found ${blogPosts.length} blog posts in storage`);

    // Get all media from localStorage
    const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    console.log(`Found ${mediaLibrary.length} media items in storage`);

    // Filter to only include images
    const availableImages = mediaLibrary.filter(item => item.type && item.type.startsWith('image/'));
    console.log(`Found ${availableImages.length} available images in media library`);

    // Placeholder images as fallback
    const placeholderImages = [
        'images/placeholder-food-1.jpg',
        'images/placeholder-food-2.jpg',
        'images/placeholder-food-3.jpg',
        'images/placeholder-recipe-1.jpg',
        'images/placeholder-recipe-2.jpg',
        'images/placeholder-recipe-3.jpg',
        'images/placeholder-restaurant-1.jpg',
        'images/placeholder-restaurant-2.jpg',
        'images/placeholder-restaurant-3.jpg'
    ];

    // Alternative sample images if needed
    const sampleImages = [
        'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg',
        'images/New images/restaurant-interior-design-empty-cafe-glasses-2025-02-13-14-58-26-utc.jpg',
        'images/New images/modern-fine-dining-setting-with-candles-high-table-2025-02-18-00-02-11-utc.jpg',
        'images/New images/restaurant-staff-meeting-briefing-before-service-2025-03-01-22-20-44-utc.jpg',
        'images/New images/chef-decorating-gourmet-dish-with-tweezers-2025-03-02-03-57-30-utc.jpg',
        'images/New images/chef-preparing-vegetable-dish-commercial-kitchen-2025-03-04-01-38-29-utc.jpg',
        'images/New images/chef-woman-cooking-salad-restaurant-kitchen-healthy-2025-03-04-01-38-09-utc.jpg',
        'images/New images/restaurant-chef-garnishing-preparing-appetizer-serving-dinner-2025-03-04-01-38-28-utc.jpg'
    ];

    // Combined image pool with media library and fallbacks
    let imagePool = [];

    // First add all available images from media library
    if (availableImages.length > 0) {
        imagePool = [...availableImages.map(img => img.url)];
    }

    // Add sample and placeholder images
    imagePool = [...imagePool, ...sampleImages, ...placeholderImages];

    // Make sure we have unique images
    imagePool = [...new Set(imagePool)];
    console.log(`Created image pool with ${imagePool.length} unique images`);

    // Process each post card
    postCards.forEach((card, index) => {
        // Get the post ID
        const postId = card.dataset.id;
        // Get the image element
        const imgElement = card.querySelector('.blog-post-image img');

        if (!imgElement) {
            console.warn(`No image element found for post ${postId}`);
            return;
        }

        // Current image URL
        const currentImgSrc = imgElement.src;

        // Check if this image URL was already used
        if (usedImageUrls.has(currentImgSrc)) {
            console.log(`Image ${currentImgSrc} already used, replacing for post ${postId}`);

            // Find unused image
            let newImgSrc = findUnusedImage(imagePool, usedImageUrls, index);

            if (newImgSrc) {
                // Update the image src
                imgElement.src = newImgSrc;
                // Add to used images
                usedImageUrls.add(newImgSrc);
                console.log(`Updated image for post ${postId} to ${newImgSrc}`);

                // Update in localStorage to make it persistent
                updatePostImageInStorage(postId, newImgSrc);
            }
        } else {
            // Image not used yet, add to used images
            usedImageUrls.add(currentImgSrc);
            console.log(`Image ${currentImgSrc} is unique, keeping for post ${postId}`);
        }
    });
}

/**
 * Check if an image URL is valid
 */
function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;

    // Check if it's a data URL
    if (url.startsWith('data:image/')) return true;

    // Check if it's a relative or absolute path
    if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true;

    // Check if it's a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) return true;

    // Check if it's a relative path without prefix
    if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp')) {
        return true;
    }

    return false;
}

/**
 * Find an unused image from the pool
 */
function findUnusedImage(imagePool, usedImages, index) {
    // Try to find an unused image
    for (let i = 0; i < imagePool.length; i++) {
        const candidateIndex = (index + i) % imagePool.length;
        const candidateImage = imagePool[candidateIndex];

        if (!usedImages.has(candidateImage) && isValidImageUrl(candidateImage)) {
            return candidateImage;
        }
    }

    // If all images are used, return a placeholder based on index
    const placeholders = [
        'images/default-blog-image.jpg',
        'images/chef-cooking.jpg',
        'images/restaurant-interior.jpg',
        'images/hot-coffee-latte-art-on-wooden-table.jpg'
    ];

    return placeholders[index % placeholders.length];
}

/**
 * Update post image in localStorage
 */
function updatePostImageInStorage(postId, newImageUrl) {
    try {
        const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        const postIndex = blogPosts.findIndex(post => post.id === postId);

        if (postIndex !== -1) {
            blogPosts[postIndex].image = newImageUrl;
            blogPosts[postIndex].imageUrl = newImageUrl;
            localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
            console.log(`Updated post ${postId} image in storage: ${newImageUrl}`);
        }
    } catch (error) {
        console.error('Error updating post image in storage:', error);
    }
}