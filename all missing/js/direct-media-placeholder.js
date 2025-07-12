/**
 * Direct Media Placeholder
 * 
 * A simple solution to replace all images with colored placeholders
 * and fix form validation issues.
 */

// Execute immediately before page loads
(function() {
    // Create colored boxes for different image types
    const placeholders = {
        food: createColorImage('#3F51B5', 'Food Image'),
        restaurant: createColorImage('#009688', 'Restaurant Image'),
        people: createColorImage('#FF9800', 'People Image'),
        default: createColorImage('#607D8B', 'Image')
    };

    // Use requestAnimationFrame to run as soon as possible
    requestAnimationFrame(function fixLoop() {
        // Fix images
        document.querySelectorAll('img').forEach(function(img) {
            if (!img.src || !img.src.startsWith('data:')) {
                // Determine image type
                let type = 'default';
                const mediaItem = img.closest('.media-item');
                if (mediaItem) {
                    const folder = mediaItem.getAttribute('data-folder');
                    if (folder && placeholders[folder]) {
                        type = folder;
                    }
                }
                
                // Replace with placeholder
                img.src = placeholders[type];
            }
        });
        
        // Continue fixing
        requestAnimationFrame(fixLoop);
    });
    
    // Fix media selector when it opens
    document.addEventListener('click', function(event) {
        // Check if this is a media selector button
        if (event.target.closest('.media-select-btn, [data-action="selectMedia"]')) {
            setTimeout(function() {
                const modal = document.querySelector('.media-selector-modal');
                if (modal) {
                    fixMediaModal(modal);
                }
            }, 100);
        }
    }, true);
    
    // Create colored image placeholder
    function createColorImage(color, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        
        return canvas.toDataURL();
    }
    
    // Fix a media modal
    function fixMediaModal(modal) {
        // Find all images in the modal
        modal.querySelectorAll('img').forEach(function(img) {
            // Determine type
            let type = 'default';
            const mediaItem = img.closest('.media-item');
            if (mediaItem) {
                const folder = mediaItem.getAttribute('data-folder');
                if (folder && placeholders[folder]) {
                    type = folder;
                }
            }
            
            // Replace with placeholder
            img.src = placeholders[type];
        });
    }
})();
