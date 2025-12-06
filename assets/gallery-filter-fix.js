/**
 * Gallery Filter Height Fix
 * Ensures gallery section height adjusts when filtering items
 */
(function() {
    'use strict';
    
    function fixGalleryHeight() {
        // Find gallery sections
        const galleries = document.querySelectorAll('.u-gallery, .u-gallery-inner');
        const sections = document.querySelectorAll('.u-section-5, [class*="u-section"]');
        
        // Remove fixed heights
        galleries.forEach(gallery => {
            gallery.style.height = 'auto';
            gallery.style.minHeight = '0';
        });
        
        sections.forEach(section => {
            if (section.querySelector('.u-gallery')) {
                section.style.height = 'auto';
                section.style.minHeight = '0';
            }
        });
    }
    
    function observeFilterChanges() {
        // Watch for filter clicks
        const filterItems = document.querySelectorAll('.u-gallery-filter .u-filter-item');
        
        filterItems.forEach(item => {
            item.addEventListener('click', function() {
                // Wait for filtering animation to complete
                setTimeout(fixGalleryHeight, 100);
                setTimeout(fixGalleryHeight, 300);
                setTimeout(fixGalleryHeight, 500);
            });
        });
        
        // Also observe DOM changes in gallery
        const galleryInner = document.querySelector('.u-gallery-inner');
        if (galleryInner) {
            const observer = new MutationObserver(function(mutations) {
                fixGalleryHeight();
            });
            
            observer.observe(galleryInner, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['style', 'class']
            });
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fixGalleryHeight();
            observeFilterChanges();
        });
    } else {
        fixGalleryHeight();
        observeFilterChanges();
    }
    
    // Also fix on window load and resize
    window.addEventListener('load', fixGalleryHeight);
    window.addEventListener('resize', fixGalleryHeight);
})();
