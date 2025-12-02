/**
 * Cloud Image Fallback
 * Provides fallback images from the cloud media library (R2)
 * Never uses local hardcoded paths
 */

// Cache for cloud fallback image
let cachedCloudFallbackUrl = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get a fallback image URL from the cloud media library
 * @returns {Promise<string|null>} - R2 URL or null if none available
 */
async function getCloudFallbackImage() {
    // Check cache first
    if (cachedCloudFallbackUrl && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        return cachedCloudFallbackUrl;
    }
    
    try {
        const response = await fetch('/api/media?limit=20');
        if (!response.ok) return null;
        
        const data = await response.json();
        const media = data.media || [];
        
        // Filter to only cloud-hosted images with valid R2 URLs
        const cloudImages = media.filter(item => {
            const mimeType = item.mime_type || item.type || '';
            const url = item.r2_url || item.url || '';
            // Must be an image and have a proper cloud URL (not base64, not local path)
            return mimeType.startsWith('image/') && 
                   url && 
                   !url.startsWith('data:') && 
                   !url.startsWith('images/') &&
                   (url.includes('r2.cloudflarestorage') || url.includes('/api/media/serve/'));
        });
        
        if (cloudImages.length > 0) {
            // Get a random image
            const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
            cachedCloudFallbackUrl = randomImage.r2_url || randomImage.url;
            lastFetchTime = Date.now();
            console.log('Cloud fallback image cached:', cachedCloudFallbackUrl);
            return cachedCloudFallbackUrl;
        }
        
        console.warn('No cloud images available in media library');
        return null;
    } catch (error) {
        console.error('Error fetching cloud fallback image:', error);
        return null;
    }
}

/**
 * Validate an image URL - only accept cloud URLs
 * @param {string} imageUrl - The URL to validate
 * @returns {Promise<string|null>} - Valid cloud URL or null
 */
async function validateCloudImageUrl(imageUrl) {
    // Reject if no URL
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null' || imageUrl.trim() === '') {
        return await getCloudFallbackImage();
    }
    
    // Reject base64 images
    if (imageUrl.startsWith('data:image')) {
        console.warn('Rejecting base64 image, using cloud fallback');
        return await getCloudFallbackImage();
    }
    
    // Reject local paths (these don't work on other devices)
    if (imageUrl.startsWith('images/') || imageUrl.startsWith('/images/')) {
        console.warn('Rejecting local image path, using cloud fallback:', imageUrl);
        return await getCloudFallbackImage();
    }
    
    // Accept cloud URLs
    if (imageUrl.includes('r2.cloudflarestorage') || 
        imageUrl.includes('/api/media/serve/') ||
        imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // Unknown format, try to use as-is but log warning
    console.warn('Unknown image URL format:', imageUrl);
    return imageUrl;
}

// Make functions globally available
window.getCloudFallbackImage = getCloudFallbackImage;
window.validateCloudImageUrl = validateCloudImageUrl;

console.log('Cloud Image Fallback module loaded');
