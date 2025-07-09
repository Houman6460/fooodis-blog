/**
 * Media Library Pagination Fix
 * Fixes the navigation between media library pages
 */

// Global variables for media pagination
(function() {
    // Make sure we define these variables in window scope if they don't exist
    if (typeof window.currentMediaPage === 'undefined') {
        window.currentMediaPage = 1;
    }
    
    if (typeof window.mediaPerPage === 'undefined') {
        window.mediaPerPage = 12;
    }
    
    if (typeof window.totalMediaPages === 'undefined') {
        const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
        window.totalMediaPages = Math.ceil(mediaLibrary.length / window.mediaPerPage) || 1;
    }

    // Make sure renderMediaLibrary is defined
    if (typeof window.renderMediaLibrary !== 'function') {
        window.renderMediaLibrary = function() {
            console.log('Media Pagination Fix: Placeholder renderMediaLibrary called');
            // This will be overridden when the real function loads
        };
    }

    console.log('Media Pagination Fix: Initializing...');
    
    // Apply the fix after DOM is loaded
    document.addEventListener('DOMContentLoaded', applyMediaPaginationFix);
    
    // Also apply on window load
    window.addEventListener('load', function() {
        applyMediaPaginationFix();
        // Apply again after a delay to catch any late initializations
        setTimeout(applyMediaPaginationFix, 1000);
        setTimeout(applyMediaPaginationFix, 2000);
        setTimeout(applyMediaPaginationFix, 3000); // Try multiple times
    });
})();

/**
 * Apply media pagination fix
 */
function applyMediaPaginationFix() {
    console.log('Media Pagination Fix: Applying fix to media library pagination');
    
    // Get the pagination buttons
    const prevPageBtn = document.querySelector('.media-pagination button:first-child');
    const nextPageBtn = document.querySelector('.media-pagination button:last-child');
    const paginationInfo = document.querySelector('.media-pagination span');
    
    if (!prevPageBtn || !nextPageBtn || !paginationInfo) {
        console.log('Media Pagination Fix: Pagination elements not found, will try again later');
        return;
    }

    console.log('Media Pagination Fix: Found pagination elements');
    
    // Add IDs to the elements for easier access
    prevPageBtn.id = 'mediaPrevBtn';
    nextPageBtn.id = 'mediaNextBtn';
    paginationInfo.id = 'mediaPageInfo';
    
    // Direct click event handling - overriding previous handlers
    prevPageBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Media Pagination Fix: Previous page button clicked');
        if (window.currentMediaPage > 1) {
            window.currentMediaPage--;
            console.log('Media Pagination Fix: Going to previous page:', window.currentMediaPage);
            window.renderMediaLibrary();
        }
    };
    
    nextPageBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Media Pagination Fix: Next page button clicked');
        if (window.currentMediaPage < window.totalMediaPages) {
            window.currentMediaPage++;
            console.log('Media Pagination Fix: Going to next page:', window.currentMediaPage);
            window.renderMediaLibrary();
        }
    };
    
    console.log('Media Pagination Fix: Added direct click handlers to pagination buttons');

    // Override updateMediaPagination to ensure it works correctly
    window.updateMediaPagination = function() {
        console.log('Media Pagination Fix: updateMediaPagination called');
        
        const prevBtn = document.getElementById('mediaPrevBtn');
        const nextBtn = document.getElementById('mediaNextBtn');
        const pageInfo = document.getElementById('mediaPageInfo');
        
        if (prevBtn && nextBtn && pageInfo) {
            // Get media library from localStorage for accurate counts
            const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
            window.totalMediaPages = Math.ceil(mediaLibrary.length / window.mediaPerPage) || 1;
            
            // Update page info with more detailed text
            pageInfo.textContent = `Page ${window.currentMediaPage} of ${window.totalMediaPages} (${mediaLibrary.length} items)`;
            
            // Visually disable/enable buttons based on current page
            prevBtn.classList.toggle('disabled', window.currentMediaPage <= 1);
            nextBtn.classList.toggle('disabled', window.currentMediaPage >= window.totalMediaPages);
            
            // Log state for debugging
            console.log(`Media Pagination Fix: Page ${window.currentMediaPage} of ${window.totalMediaPages}`);
        }
    };
    
    console.log('Media Pagination Fix: Override updateMediaPagination function');
    
    // Make sure setupMediaPagination is called if it exists
    if (typeof window.setupMediaPagination === 'function') {
        console.log('Media Pagination Fix: Calling setupMediaPagination');
        window.setupMediaPagination();
    }
    
    // Apply pagination update
    window.updateMediaPagination();
    
    // Add CSS to properly show disabled state
    const style = document.createElement('style');
    style.textContent = `
        .media-pagination button.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .media-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 15px;
        }
        
        .media-pagination button {
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Media Pagination Fix: Applied CSS styles for pagination');
    console.log('Media Pagination Fix: Pagination fix applied successfully');
}

// Backup navigation functions
window.goToNextMediaPage = function() {
    const nextBtn = document.getElementById('mediaNextBtn');
    if (nextBtn) {
        nextBtn.click();
    } else {
        if (window.currentMediaPage < window.totalMediaPages) {
            window.currentMediaPage++;
            window.renderMediaLibrary();
        }
    }
};

window.goToPreviousMediaPage = function() {
    const prevBtn = document.getElementById('mediaPrevBtn');
    if (prevBtn) {
        prevBtn.click();
    } else {
        if (window.currentMediaPage > 1) {
            window.currentMediaPage--;
            window.renderMediaLibrary();
        }
    }
};

// Make sure we're compatible with media-folders.js
window.filterMedia = window.filterMedia || function() {
    console.log('Media Pagination Fix: filterMedia called (fallback)');
    window.renderMediaLibrary();
};

// Force an update of the media library to apply pagination
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (typeof window.renderMediaLibrary === 'function') {
            console.log('Media Pagination Fix: Forcing media library update');
            window.renderMediaLibrary();
        }
    }, 1500);
});

