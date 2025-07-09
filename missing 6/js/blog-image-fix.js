
/**
 * Blog Image Fix
 * Fixes broken image links and ensures proper image display
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog Image Fix: Starting comprehensive image repair');
    
    // Fix images immediately and after a delay
    fixBlogImages();
    setTimeout(fixBlogImages, 1000);
    setTimeout(fixBlogImages, 3000);
});

function fixBlogImages() {
    console.log('Blog Image Fix: Fixing all blog images');
    
    // Get all images on the page
    const allImages = document.querySelectorAll('img');
    let fixedCount = 0;
    
    allImages.forEach(img => {
        const originalSrc = img.src;
        let newSrc = originalSrc;
        
        // Fix common broken paths
        if (originalSrc.includes('css/images/')) {
            newSrc = originalSrc.replace('css/images/', 'images/');
            console.log('Blog Image Fix: Fixed css/images path:', originalSrc, '->', newSrc);
        }
        
        if (originalSrc.includes('/css/images/')) {
            newSrc = originalSrc.replace('/css/images/', '/images/');
            console.log('Blog Image Fix: Fixed /css/images path:', originalSrc, '->', newSrc);
        }
        
        // Fix relative paths that might be broken
        if (originalSrc.startsWith('./css/images/')) {
            newSrc = originalSrc.replace('./css/images/', './images/');
            console.log('Blog Image Fix: Fixed ./css/images path:', originalSrc, '->', newSrc);
        }
        
        // If the image src changed, update it
        if (newSrc !== originalSrc) {
            img.src = newSrc;
            fixedCount++;
        }
        
        // Add error handler for broken images
        img.onerror = function() {
            console.log('Blog Image Fix: Image failed to load:', this.src);
            
            // Try to find a working alternative
            const alternatives = [
                'images/default-blog-image.jpg',
                'images/placeholder.jpg',
                'images/chef-cooking.jpg',
                'images/restaurant-interior.jpg'
            ];
            
            const currentAlt = this.dataset.altIndex || 0;
            if (currentAlt < alternatives.length) {
                this.dataset.altIndex = parseInt(currentAlt) + 1;
                this.src = alternatives[currentAlt];
                console.log('Blog Image Fix: Trying alternative:', alternatives[currentAlt]);
            } else {
                // Create a placeholder
                this.style.background = '#f0f0f0';
                this.style.display = 'inline-block';
                this.style.width = '300px';
                this.style.height = '200px';
                this.alt = 'Image not available';
                console.log('Blog Image Fix: Created placeholder for broken image');
            }
        };
    });
    
    console.log(`Blog Image Fix: Fixed ${fixedCount} image paths`);
    
    // Also fix background images
    fixBackgroundImages();
}

function fixBackgroundImages() {
    const elementsWithBg = document.querySelectorAll('[style*="background"]');
    
    elementsWithBg.forEach(el => {
        const style = el.style.cssText;
        if (style.includes('css/images/')) {
            const newStyle = style.replace(/css\/images\//g, 'images/');
            el.style.cssText = newStyle;
            console.log('Blog Image Fix: Fixed background image path');
        }
    });
}

// Export for use by other scripts
if (typeof window !== 'undefined') {
    window.fixBlogImages = fixBlogImages;
}
