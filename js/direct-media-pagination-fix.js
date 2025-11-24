/**
 * Direct Media Pagination Fix
 * A direct hotfix for media library pagination that bypasses all existing systems
 */

// Execute immediately when loaded
(function() {
    console.log('Direct Media Pagination: Initializing direct fix...');
    
    // Try applying immediately 
    directMediaPaginationFix();
    
    // Also try after document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        directMediaPaginationFix();
        // Try multiple times after DOM is loaded
        setTimeout(directMediaPaginationFix, 500);
        setTimeout(directMediaPaginationFix, 1000);
    });
    
    // Also try on window load
    window.addEventListener('load', function() {
        directMediaPaginationFix();
        // Try multiple times after window is loaded
        setTimeout(directMediaPaginationFix, 1000);
        setTimeout(directMediaPaginationFix, 2000);
        setTimeout(directMediaPaginationFix, 3000);
    });
    
    // Set up a mutation observer to watch for changes to the DOM
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // Check if any of the added nodes might be our pagination buttons
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && (
                        node.classList && node.classList.contains('media-pagination') || 
                        node.querySelector && node.querySelector('.media-pagination')
                    )) {
                        console.log('Direct Media Pagination: Detected media pagination added to DOM');
                        directMediaPaginationFix();
                        return;
                    }
                }
            }
        }
    });
    
    // Start observing
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();

/**
 * Direct fix for media pagination
 * This is a completely independent implementation that doesn't rely on any other code
 */
function directMediaPaginationFix() {
    console.log('Direct Media Pagination: Applying direct fix...');
    
    // Get the media section
    const mediaSection = document.getElementById('media-library-section');
    if (!mediaSection) {
        console.log('Direct Media Pagination: Media section not found yet');
        return;
    }
    
    // Get the pagination section
    const paginationContainer = mediaSection.querySelector('.media-pagination');
    if (!paginationContainer) {
        console.log('Direct Media Pagination: Pagination container not found yet');
        return;
    }
    
    // Define the buttons if they haven't been already
    const prevButton = paginationContainer.querySelector('button:first-child');
    const nextButton = paginationContainer.querySelector('button:last-child');
    const pageInfo = paginationContainer.querySelector('span');
    
    if (!prevButton || !nextButton || !pageInfo) {
        console.log('Direct Media Pagination: Pagination elements not found yet');
        return;
    }
    
    console.log('Direct Media Pagination: Found pagination elements');
    
    // Initialize our own pagination variables if needed
    if (typeof window._directPaginationVars === 'undefined') {
        window._directPaginationVars = {
            currentPage: 1,
            itemsPerPage: 12,
            totalItems: 0,
            totalPages: 1,
            initialized: false
        };
        
        // Get the media items from localStorage
        try {
            const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
            window._directPaginationVars.totalItems = mediaLibrary.length;
            window._directPaginationVars.totalPages = Math.ceil(mediaLibrary.length / window._directPaginationVars.itemsPerPage) || 1;
            window._directPaginationVars.initialized = true;
        } catch (e) {
            console.error('Direct Media Pagination: Error initializing pagination vars', e);
        }
    }
    
    // Update global variables if they exist
    if (typeof window.currentMediaPage !== 'undefined') {
        window._directPaginationVars.currentPage = window.currentMediaPage;
    } else if (window._directPaginationVars.initialized) {
        window.currentMediaPage = window._directPaginationVars.currentPage;
    }
    
    if (typeof window.mediaPerPage !== 'undefined') {
        window._directPaginationVars.itemsPerPage = window.mediaPerPage;
    } else if (window._directPaginationVars.initialized) {
        window.mediaPerPage = window._directPaginationVars.itemsPerPage;
    }
    
    if (typeof window.totalMediaPages !== 'undefined') {
        window._directPaginationVars.totalPages = window.totalMediaPages;
    } else if (window._directPaginationVars.initialized) {
        window.totalMediaPages = window._directPaginationVars.totalPages;
    }
    
    // Clear any existing event listeners by cloning and replacing the buttons
    const newPrevButton = prevButton.cloneNode(true);
    const newNextButton = nextButton.cloneNode(true);
    
    prevButton.parentNode.replaceChild(newPrevButton, prevButton);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    
    // Update the page info text - MOVED: Now after button declarations
    updatePaginationInfo();
    
    // Add our direct event handlers
    newPrevButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Direct Media Pagination: Previous button clicked');
        
        if (window._directPaginationVars.currentPage > 1) {
            window._directPaginationVars.currentPage--;
            
            // Update global variable if it exists
            if (typeof window.currentMediaPage !== 'undefined') {
                window.currentMediaPage = window._directPaginationVars.currentPage;
            }
            
            // Call the render function if it exists
            if (typeof window.renderMediaLibrary === 'function') {
                console.log('Direct Media Pagination: Calling renderMediaLibrary()');
                window.renderMediaLibrary();
            } else if (typeof window.filterMedia === 'function') {
                console.log('Direct Media Pagination: Calling filterMedia()');
                window.filterMedia();
            } else {
                console.log('Direct Media Pagination: No render function found, implementing direct rendering');
                directRenderMediaPage();
            }
            
            // Update the UI
            updatePaginationInfo();
        }
    });
    
    newNextButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Direct Media Pagination: Next button clicked');
        
        if (window._directPaginationVars.currentPage < window._directPaginationVars.totalPages) {
            window._directPaginationVars.currentPage++;
            
            // Update global variable if it exists
            if (typeof window.currentMediaPage !== 'undefined') {
                window.currentMediaPage = window._directPaginationVars.currentPage;
            }
            
            // Call the render function if it exists
            if (typeof window.renderMediaLibrary === 'function') {
                console.log('Direct Media Pagination: Calling renderMediaLibrary()');
                window.renderMediaLibrary();
            } else if (typeof window.filterMedia === 'function') {
                console.log('Direct Media Pagination: Calling filterMedia()');
                window.filterMedia();
            } else {
                console.log('Direct Media Pagination: No render function found, implementing direct rendering');
                directRenderMediaPage();
            }
            
            // Update the UI
            updatePaginationInfo();
        }
    });
    
    console.log('Direct Media Pagination: Added direct event handlers to pagination buttons');
    
    // Update the UI to reflect current state
    updatePaginationInfo();
    
    // Add styles for the disabled state
    addPaginationStyles();
    
    console.log('Direct Media Pagination: Direct fix applied successfully');
    
    /**
     * Update pagination info and button states
     */
    function updatePaginationInfo() {
        // Update the page info text
        if (pageInfo) {
            pageInfo.textContent = `Page ${window._directPaginationVars.currentPage} of ${window._directPaginationVars.totalPages} (${window._directPaginationVars.totalItems} items)`;
        }
        
        // Update button states
        newPrevButton.classList.toggle('disabled', window._directPaginationVars.currentPage <= 1);
        newNextButton.classList.toggle('disabled', window._directPaginationVars.currentPage >= window._directPaginationVars.totalPages);
        
        // Also update button attributes for accessibility
        newPrevButton.setAttribute('aria-disabled', window._directPaginationVars.currentPage <= 1);
        newNextButton.setAttribute('aria-disabled', window._directPaginationVars.currentPage >= window._directPaginationVars.totalPages);
    }
    
    /**
     * Add styles for pagination
     */
    function addPaginationStyles() {
        // Check if styles are already added
        if (document.getElementById('direct-media-pagination-styles')) {
            return;
        }
        
        // Create a style element
        const style = document.createElement('style');
        style.id = 'direct-media-pagination-styles';
        style.textContent = `
            .media-pagination button.disabled {
                opacity: 0.5;
                cursor: not-allowed;
                pointer-events: none;
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
                transition: opacity 0.2s ease;
            }
            
            .media-pagination button:not(.disabled):hover {
                opacity: 0.8;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Direct render of media page if no render function is available
     * This is a fallback in case the main render function is not available
     */
    function directRenderMediaPage() {
        try {
            // Get the media items from localStorage
            const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
            
            // Update total items and pages
            window._directPaginationVars.totalItems = mediaLibrary.length;
            window._directPaginationVars.totalPages = Math.ceil(mediaLibrary.length / window._directPaginationVars.itemsPerPage) || 1;
            
            // Calculate start and end indices
            const startIndex = (window._directPaginationVars.currentPage - 1) * window._directPaginationVars.itemsPerPage;
            const endIndex = Math.min(startIndex + window._directPaginationVars.itemsPerPage, mediaLibrary.length);
            
            // Get the media grid element
            const mediaGrid = document.getElementById('mediaGrid');
            if (!mediaGrid) {
                console.error('Direct Media Pagination: Media grid not found');
                return;
            }
            
            // Clear the grid
            mediaGrid.innerHTML = '';
            
            // Get the current page items
            const currentPageItems = mediaLibrary.slice(startIndex, endIndex);
            
            // If no items, show a message
            if (currentPageItems.length === 0) {
                mediaGrid.innerHTML = '<div class="no-media-message">No media items found. Upload some images to get started.</div>';
                return;
            }
            
            // Add the items to the grid
            currentPageItems.forEach(item => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.dataset.id = item.id;
                
                // Create HTML for the media item
                mediaItem.innerHTML = `
                    <div class="media-preview">
                        <img src="${item.url}" alt="${item.name}">
                    </div>
                    <div class="media-info">
                        <div class="media-name">${item.name}</div>
                        <div class="media-size">${formatFileSize(item.size)}</div>
                    </div>
                    <div class="media-actions">
                        <button class="use-media-btn" title="Use this media"><i class="fas fa-check"></i></button>
                        <button class="delete-media-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                
                mediaGrid.appendChild(mediaItem);
            });
            
            // Format file size helper function
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
            
            console.log('Direct Media Pagination: Directly rendered media page', window._directPaginationVars.currentPage);
        } catch (e) {
            console.error('Direct Media Pagination: Error rendering media page', e);
        }
    }
}
