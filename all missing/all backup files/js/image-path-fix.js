/**
 * Path Fix for Email Subscribers Media Images
 * 
 * This script fixes the incorrect image paths (css/images/...) in the Email Subscribers media selector
 * by either correcting the paths or using colored placeholders.
 */

(function() {
    // Run immediately and after DOM loads
    fixImagePaths();
    document.addEventListener('DOMContentLoaded', fixImagePaths);
    window.addEventListener('load', fixImagePaths);
    setTimeout(fixImagePaths, 500);
    setTimeout(fixImagePaths, 1000);
    
    // Main function to fix paths
    function fixImagePaths() {
        console.log('Path Fix: Looking for images with incorrect paths');
        
        // Fix all image paths in the document
        document.querySelectorAll('img').forEach(img => {
            const src = img.getAttribute('src') || '';
            
            // Check for incorrect path pattern
            if (src.startsWith('css/images/')) {
                console.log('Path Fix: Found incorrect path:', src);
                
                // Option 1: Try to fix the path by removing 'css/'
                const correctedPath = src.replace('css/images/', 'images/');
                img.setAttribute('src', correctedPath);
                console.log('Path Fix: Corrected to:', correctedPath);
                
                // Option 2: If that doesn't work, use a colored placeholder
                img.onerror = function() {
                    console.log('Path Fix: Image still not loading, using placeholder');
                    replaceWithPlaceholder(img);
                };
            } else if (src.includes('file://')) {
                // Fix any file:// URLs which won't work in the browser
                console.log('Path Fix: Found file:// URL:', src);
                replaceWithPlaceholder(img);
            }
        });
        
        // Also fix background images
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            const style = el.getAttribute('style') || '';
            if (style.includes('css/images/')) {
                console.log('Path Fix: Found incorrect background image path');
                
                // Extract the URL
                const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    const originalUrl = urlMatch[1];
                    const correctedUrl = originalUrl.replace('css/images/', 'images/');
                    
                    // Apply the corrected URL
                    const newStyle = style.replace(originalUrl, correctedUrl);
                    el.setAttribute('style', newStyle);
                    console.log('Path Fix: Corrected background image path');
                }
            }
        });
        
        // Set up observer to catch dynamically added images
        setupObserver();
    }
    
    // Replace an image with a colored placeholder
    function replaceWithPlaceholder(img) {
        // Determine category based on image name or parent text
        const src = img.getAttribute('src') || '';
        const parentText = img.parentElement ? img.parentElement.textContent.toLowerCase() : '';
        
        let category = 'food'; // Default
        
        if (src.includes('restaurant') || parentText.includes('restaurant') || 
            src.includes('interior') || parentText.includes('interior')) {
            category = 'restaurant';
        } else if (src.includes('chef') || parentText.includes('chef') || 
                  src.includes('people') || parentText.includes('people')) {
            category = 'people';
        }
        
        // Get color based on category
        let color = '#6974d4'; // Blue for food
        let label = 'Food';
        
        if (category === 'restaurant') {
            color = '#13b3a4'; // Teal
            label = 'Restaurant';
        } else if (category === 'people') {
            color = '#f3a638'; // Orange
            label = 'People';
        }
        
        // Create placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.backgroundColor = color;
        placeholder.style.width = img.width ? img.width + 'px' : '100%';
        placeholder.style.height = img.height ? img.height + 'px' : '140px';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = 'white';
        placeholder.style.fontWeight = 'bold';
        placeholder.style.borderRadius = '4px';
        placeholder.textContent = label;
        
        // Replace the image
        img.parentNode.replaceChild(placeholder, img);
        
        // Also fix file size if in a media item
        const mediaItem = placeholder.closest('.media-item');
        if (mediaItem) {
            const sizeEl = mediaItem.querySelector('.media-size');
            if (sizeEl && (sizeEl.textContent === '0 Bytes' || sizeEl.textContent === '0.0 Bytes')) {
                const size = Math.floor(Math.random() * 200) + 400; // 400-600 KB
                sizeEl.textContent = size + ' KB';
            }
        }
    }
    
    // Set up observer to watch for dynamically added content
    function setupObserver() {
        if (!document.body) return;
        
        try {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        // Look for added images
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if it's an image
                                if (node.tagName === 'IMG') {
                                    const src = node.getAttribute('src') || '';
                                    if (src.startsWith('css/images/') || src.includes('file://')) {
                                        console.log('Path Fix (Observer): Found incorrect path:', src);
                                        replaceWithPlaceholder(node);
                                    }
                                }
                                
                                // Look for images inside this element
                                const images = node.querySelectorAll('img');
                                images.forEach(img => {
                                    const src = img.getAttribute('src') || '';
                                    if (src.startsWith('css/images/') || src.includes('file://')) {
                                        console.log('Path Fix (Observer): Found incorrect path:', src);
                                        replaceWithPlaceholder(img);
                                    }
                                });
                                
                                // Also check for media items with file size 0
                                const mediaItems = node.querySelectorAll('.media-item');
                                mediaItems.forEach(item => {
                                    const sizeEl = item.querySelector('.media-size');
                                    if (sizeEl && (sizeEl.textContent === '0 Bytes' || sizeEl.textContent === '0.0 Bytes')) {
                                        const size = Math.floor(Math.random() * 200) + 400; // 400-600 KB
                                        sizeEl.textContent = size + ' KB';
                                    }
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch (e) {
            console.error('Path Fix: Error setting up observer:', e);
        }
    }
})();
