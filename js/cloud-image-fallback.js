/**
 * Cloud Image Fallback
 * Provides fallback images from the cloud media library (R2)
 * Never uses local hardcoded paths
 */

// Cache for cloud fallback images
let cachedCloudImages = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for per-post fallback images (so card and modal show same image)
const postImageCache = new Map();

/**
 * Fetch cloud images from media library (cached)
 */
async function fetchCloudImages() {
    if (cachedCloudImages && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        return cachedCloudImages;
    }
    
    try {
        const response = await fetch('/api/media?limit=50');
        if (!response.ok) return [];
        
        const data = await response.json();
        const media = data.media || [];
        
        // Filter to only cloud-hosted images with valid R2 URLs
        // Exclude avatars, logos, and profile pictures from being used as post fallbacks
        const excludedFolders = ['avatars', 'logos', 'profile', 'branding'];
        cachedCloudImages = media.filter(item => {
            const mimeType = item.mime_type || item.type || '';
            const url = item.r2_url || item.url || '';
            const folder = (item.folder || '').toLowerCase();
            const filename = (item.filename || item.original_filename || '').toLowerCase();
            
            // Exclude system images (avatars, logos, profile pictures)
            const isSystemImage = excludedFolders.includes(folder) ||
                                  filename.includes('logo') ||
                                  filename.includes('avatar') ||
                                  filename.includes('profile') ||
                                  filename.includes('icon');
            
            return mimeType.startsWith('image/') && 
                   url && 
                   !url.startsWith('data:') && 
                   !url.startsWith('images/') &&
                   !isSystemImage &&
                   (url.includes('r2.cloudflarestorage') || url.includes('/api/media/serve/'));
        });
        
        // Sort by ID for consistent ordering (important for deterministic selection)
        cachedCloudImages.sort((a, b) => {
            const idA = a.id || '';
            const idB = b.id || '';
            return idA.localeCompare(idB);
        });
        
        lastFetchTime = Date.now();
        console.log(`Cached ${cachedCloudImages.length} cloud images for fallbacks (sorted by ID)`);
        return cachedCloudImages;
    } catch (error) {
        console.error('Error fetching cloud images:', error);
        return [];
    }
}

/**
 * Get a fallback image URL - deterministic by postId so same post always gets same image
 * @param {string} postId - Optional post ID for deterministic selection
 * @returns {Promise<string|null>} - R2 URL or null if none available
 */
async function getCloudFallbackImage(postId = null) {
    const cloudImages = await fetchCloudImages();
    
    if (cloudImages.length === 0) {
        console.warn('No cloud images available in media library');
        return null;
    }
    
    // If we have a postId, use deterministic selection
    if (postId) {
        // Check cache first
        if (postImageCache.has(postId)) {
            return postImageCache.get(postId);
        }
        
        // Use hash of postId to pick consistent image
        let hash = 0;
        for (let i = 0; i < postId.length; i++) {
            hash = ((hash << 5) - hash) + postId.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        const index = Math.abs(hash) % cloudImages.length;
        const selectedImage = cloudImages[index];
        const url = selectedImage.r2_url || selectedImage.url;
        
        // Cache it
        postImageCache.set(postId, url);
        console.log(`Deterministic fallback for post ${postId}:`, url);
        return url;
    }
    
    // No postId - return random (for generic fallbacks)
    const randomImage = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    return randomImage.r2_url || randomImage.url;
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
