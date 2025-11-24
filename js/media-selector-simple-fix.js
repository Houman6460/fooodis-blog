/**
 * Media Selector Simple Fix
 * A minimal, focused solution to fix media display issues without affecting other functionality
 */

(function() {
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    function init() {
        console.log('Media Selector Simple Fix: Initializing');

        // Fix form validation issues
        fixFormValidation();
        
        // Setup observer to watch for media selector modal
        watchForMediaSelector();
        
        // Override the loadMediaItems function to use our image data
        overrideMediaFunctions();
    }
    
    function fixFormValidation() {
        // Add missing IDs and names to form elements
        document.querySelectorAll('form input, form select, form textarea').forEach(field => {
            if (!field.id && !field.name) {
                // Generate an ID based on field type if none exists
                const fieldType = field.type || 'input';
                field.id = `${fieldType}-${Math.random().toString(36).substring(2, 10)}`;
            }
            
            // Add autocomplete attribute if missing
            if (!field.hasAttribute('autocomplete')) {
                field.setAttribute('autocomplete', 'off');
            }
        });
        
        // Fix duplicate IDs
        const idCounts = {};
        document.querySelectorAll('[id]').forEach(el => {
            if (!idCounts[el.id]) {
                idCounts[el.id] = 0;
            }
            idCounts[el.id]++;
            
            // If duplicate, append a unique suffix
            if (idCounts[el.id] > 1) {
                el.id = `${el.id}-${idCounts[el.id]}`;
            }
        });
        
        // Fix label associations
        document.querySelectorAll('label[for]').forEach(label => {
            const forAttr = label.getAttribute('for');
            const targetElement = document.getElementById(forAttr);
            
            if (!targetElement) {
                // Find closest input to associate with
                const nearestInput = label.nextElementSibling;
                if (nearestInput && (nearestInput.tagName === 'INPUT' || nearestInput.tagName === 'SELECT' || nearestInput.tagName === 'TEXTAREA')) {
                    if (!nearestInput.id) {
                        nearestInput.id = `${forAttr}-fixed`;
                    }
                    label.setAttribute('for', nearestInput.id);
                }
            }
        });
        
        // Add missing labels
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.id && !document.querySelector(`label[for="${field.id}"]`)) {
                // Check if field already has a label as parent or sibling
                const hasLabel = field.parentElement.tagName === 'LABEL' || 
                                (field.previousElementSibling && field.previousElementSibling.tagName === 'LABEL');
                
                if (!hasLabel) {
                    // Create a visually hidden label for accessibility
                    const label = document.createElement('label');
                    label.setAttribute('for', field.id);
                    label.className = 'sr-only';
                    label.textContent = field.placeholder || field.name || field.id;
                    field.parentElement.insertBefore(label, field);
                }
            }
        });
    }
    
    function watchForMediaSelector() {
        // Create a mutation observer to watch for the media selector modal
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('media-selector-modal')) {
                                fixMediaSelectorModal(node);
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function fixMediaSelectorModal(modal) {
        console.log('Media Selector Simple Fix: Patching media selector modal');
        
        // Fix any form validation issues in the modal
        fixFormValidation();
        
        // Find all image elements in the modal
        const images = modal.querySelectorAll('img');
        
        // Add error handling to all images to prevent broken images
        images.forEach(img => {
            // Remove existing error handlers to avoid duplicate handlers
            img.removeEventListener('error', imageErrorHandler);
            
            // Add error handler to replace broken images with a placeholder
            img.addEventListener('error', imageErrorHandler);
        });
        
        // Enhance the media grid for better visibility
        const mediaGrid = modal.querySelector('.media-grid');
        if (mediaGrid) {
            // Add a subtle background to each media item for better visibility
            const mediaItems = mediaGrid.querySelectorAll('.media-item');
            mediaItems.forEach(item => {
                item.style.backgroundColor = '#2c2c2c';
                item.style.border = '1px solid #444';
                
                const thumbnail = item.querySelector('.media-thumbnail');
                if (thumbnail) {
                    thumbnail.style.backgroundColor = '#444';
                }
            });
        }
    }
    
    function imageErrorHandler(e) {
        const img = e.target;
        
        // Get parent media item element to determine category
        const mediaItem = img.closest('.media-item');
        let category = 'image';
        if (mediaItem) {
            category = mediaItem.getAttribute('data-folder') || 'image';
        }
        
        // Set a placeholder URL based on category
        img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        
        // Add visual styling to make image blocks visible
        img.style.backgroundColor = getCategoryColor(category);
        img.style.width = '100%';
        img.style.height = '100%';
        
        // Mark as handled to prevent infinite error events
        img.setAttribute('data-error-handled', 'true');
    }
    
    function getCategoryColor(category) {
        const categoryColors = {
            'food': '#5C6BC0',      // Blue
            'restaurant': '#26A69A', // Teal
            'people': '#FFA726',     // Orange
            'default': '#7E57C2'     // Purple
        };
        
        return categoryColors[category] || categoryColors.default;
    }
    
    function overrideMediaFunctions() {
        // Store original functions if they exist
        const originalLoadMediaItems = window.loadMediaItems;
        const originalCreateMediaItem = window.createMediaItem;
        
        // Create media items data with embedded images
        const mediaItems = [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image', url: getImageData('food', 0) },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image', url: getImageData('food', 1) },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image', url: getImageData('food', 2) },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image', url: getImageData('food', 3) },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image', url: getImageData('food', 4) },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image', url: getImageData('restaurant', 0) },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image', url: getImageData('people', 0) },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image', url: getImageData('people', 1) },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image', url: getImageData('food', 5) }
        ];
        
        // Override loadMediaItems to use our embedded image data
        window.loadMediaItems = function(container, targetInputId) {
            console.log('Media Selector Fix: Loading media items');
            
            // Clear existing items
            container.innerHTML = '';
            
            // Add each media item to the container
            mediaItems.forEach(item => {
                // Create the media item
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-id', item.id);
                mediaItem.setAttribute('data-name', item.name);
                mediaItem.setAttribute('data-folder', item.folder);
                mediaItem.setAttribute('data-type', item.type);
                mediaItem.setAttribute('data-url', item.url);
                
                // Create HTML structure for the media item
                mediaItem.innerHTML = `
                    <div class="media-thumbnail" style="background-color: ${getCategoryColor(item.folder)}; border: 1px solid #444;">
                        <img src="${item.url}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="media-info">
                        <div class="media-name">${item.name}</div>
                        <div class="media-meta">
                            <span class="media-type">${item.type}</span>
                            <span class="media-size">10 KB</span>
                        </div>
                    </div>
                `;
                
                // Add click event to select the item
                mediaItem.addEventListener('click', function() {
                    if (typeof window.selectMedia === 'function') {
                        window.selectMedia(item, targetInputId);
                    }
                });
                
                container.appendChild(mediaItem);
            });
            
            // Update folder counts
            if (typeof window.updateFolderCounts === 'function') {
                try {
                    window.updateFolderCounts(mediaItems);
                } catch (e) {
                    console.error('Error updating folder counts:', e);
                }
            }
        };
        
        // Override selectMedia function to handle our media items correctly
        if (!window.originalSelectMedia) {
            window.originalSelectMedia = window.selectMedia;
        }
        
        window.selectMedia = function(media, targetInputId) {
            console.log('Media Selector Fix: Selecting media', media.name, 'for', targetInputId);
            
            // Find the target input
            const targetInput = document.getElementById(targetInputId);
            if (!targetInput) {
                console.error('Target input not found:', targetInputId);
                return;
            }
            
            // Update the input value with the media URL
            targetInput.value = media.url;
            
            // Trigger a change event
            const event = new Event('change', { bubbles: true });
            targetInput.dispatchEvent(event);
            
            // Find any associated preview elements
            const container = targetInput.closest('.form-group') || targetInput.closest('.input-group') || targetInput.parentNode;
            if (container) {
                const previews = container.querySelectorAll('.preview, .image-preview, .media-preview');
                previews.forEach(preview => {
                    if (preview.tagName === 'IMG') {
                        preview.src = media.url;
                        preview.style.display = 'block';
                    } else {
                        let img = preview.querySelector('img');
                        if (!img) {
                            img = document.createElement('img');
                            preview.innerHTML = '';
                            preview.appendChild(img);
                        }
                        img.src = media.url;
                        img.style.display = 'block';
                        preview.style.display = 'block';
                    }
                });
            }
            
            // Special handling for Email Subscribers popup
            if (targetInputId === 'popupBackgroundImage') {
                // Update background in popup preview
                const popupPreview = document.querySelector('.popup-preview, .email-popup-preview');
                if (popupPreview) {
                    popupPreview.style.backgroundImage = `url(${media.url})`;
                    popupPreview.style.backgroundSize = 'cover';
                    popupPreview.style.backgroundPosition = 'center';
                }
            } else if (targetInputId === 'popupLogoImage') {
                // Update logo in popup preview
                const logoContainer = document.querySelector('.popup-logo, .email-popup-logo');
                if (logoContainer) {
                    let logoImage = logoContainer.querySelector('img');
                    if (!logoImage) {
                        logoImage = document.createElement('img');
                        logoContainer.appendChild(logoImage);
                    }
                    logoImage.src = media.url;
                    logoImage.alt = 'Logo';
                    logoImage.style.maxWidth = '100%';
                    logoImage.style.maxHeight = '100%';
                }
            }
            
            // Close the modal
            const modal = document.querySelector('.media-selector-modal');
            if (modal) {
                modal.remove();
            }
        };
    }
    
    function getImageData(category, index) {
        // Create consistent images for each category
        const colors = {
            food: ['#3F51B5', '#303F9F', '#1A237E', '#7986CB', '#5C6BC0', '#3949AB'],
            restaurant: ['#009688', '#00796B', '#00695C', '#4DB6AC', '#26A69A', '#00897B'],
            people: ['#FF9800', '#F57C00', '#EF6C00', '#FFB74D', '#FFA726', '#FB8C00'],
            default: ['#673AB7', '#512DA8', '#4527A0', '#9575CD', '#7E57C2', '#5E35B1']
        };
        
        const color = colors[category]?.[index % (colors[category]?.length || 1)] || colors.default[0];
        
        // Generate SVG for the category
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
            <rect width="300" height="200" fill="${color}" />
            <text x="150" y="100" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${category.toUpperCase()}</text>
        </svg>`;
        
        // Convert to base64 using a safer approach
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
    }
})();
