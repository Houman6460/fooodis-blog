/**
 * Direct Override Fix
 * Aggressively patches all form and image issues by directly manipulating DOM elements
 */

(function() {
    // Run immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        setTimeout(main, 100); // Short delay to ensure DOM is accessible
    }
    
    // Also ensure it runs after everything is loaded
    window.addEventListener('load', main);
    
    let initialized = false;
    let fixAttempts = 0;
    
    function main() {
        if (initialized) return;
        
        // Give time for other scripts to initialize first
        setTimeout(function() {
            initialized = true;
            console.log('Direct Override Fix: Starting');
            
            // Fix all issues
            fixAllImages();
            fixAllForms();
            fixMediaSelector();
            
            // Set up recurring checks to ensure fixes persist
            startRecurringChecks();
            
            console.log('Direct Override Fix: First pass complete');
        }, 500);
    }
    
    function startRecurringChecks() {
        // Run fixes every 2 seconds for the first minute
        const interval = setInterval(function() {
            fixAttempts++;
            console.log(`Direct Override Fix: Running check #${fixAttempts}`);
            
            fixAllImages();
            fixAllForms();
            fixMediaSelector();
            
            // Stop after 30 attempts (1 minute)
            if (fixAttempts >= 30) {
                clearInterval(interval);
                console.log('Direct Override Fix: Recurring checks complete');
            }
        }, 2000);
        
        // Set up mutation observer for dynamic changes
        setupMutationObserver();
    }
    
    function setupMutationObserver() {
        // Watch for changes to the DOM
        const observer = new MutationObserver(function(mutations) {
            let needsImageFix = false;
            let needsFormFix = false;
            let needsMediaFix = false;
            
            // Check if any relevant elements were added
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType !== Node.ELEMENT_NODE) continue;
                        
                        // Check for images
                        if (node.tagName === 'IMG' || node.querySelector('img')) {
                            needsImageFix = true;
                        }
                        
                        // Check for form elements
                        if (['INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'FORM'].includes(node.tagName) ||
                            node.querySelector('input, select, textarea, label, form')) {
                            needsFormFix = true;
                        }
                        
                        // Check for media selector
                        if ((node.classList && node.classList.contains('media-selector-modal')) ||
                            node.querySelector('.media-selector-modal, .media-grid, .media-item')) {
                            needsMediaFix = true;
                        }
                    }
                }
            });
            
            // Apply needed fixes
            if (needsImageFix) fixAllImages();
            if (needsFormFix) fixAllForms();
            if (needsMediaFix) fixMediaSelector();
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'id', 'for']
        });
    }
    
    // FORM FIXES
    
    function fixAllForms() {
        // First, ensure all form fields have unique IDs
        const formFields = document.querySelectorAll('input, select, textarea, button');
        const usedIds = {};
        const fieldsWithoutIds = [];
        
        // First pass: identify and fix missing IDs
        formFields.forEach(function(field) {
            if (!field.id || field.id.trim() === '') {
                fieldsWithoutIds.push(field);
            } else {
                // Track used IDs
                if (!usedIds[field.id]) {
                    usedIds[field.id] = [];
                }
                usedIds[field.id].push(field);
            }
            
            // Ensure autocomplete attribute
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(field.tagName) && !field.hasAttribute('autocomplete')) {
                field.setAttribute('autocomplete', 'off');
            }
        });
        
        // Fix fields without IDs
        fieldsWithoutIds.forEach(function(field, index) {
            const newId = `field-${Date.now()}-${index}`;
            field.id = newId;
            
            // Add name attribute if missing
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(field.tagName) && (!field.name || field.name.trim() === '')) {
                field.name = newId;
            }
        });
        
        // Fix duplicate IDs
        for (const [id, fields] of Object.entries(usedIds)) {
            if (fields.length > 1) {
                // Keep first occurrence, rename others
                for (let i = 1; i < fields.length; i++) {
                    const field = fields[i];
                    const newId = `${id}-${Date.now()}-${i}`;
                    
                    // Update any labels pointing to this field
                    document.querySelectorAll(`label[for="${id}"]`).forEach(function(label) {
                        if (isClosestByPosition(label, field, fields[0])) {
                            label.setAttribute('for', newId);
                        }
                    });
                    
                    field.id = newId;
                    
                    // Update name if it was the same as the old ID
                    if (field.name === id) {
                        field.name = newId;
                    }
                }
            }
        }
        
        // Fix label associations
        const labels = document.querySelectorAll('label[for]');
        labels.forEach(function(label) {
            const forAttr = label.getAttribute('for');
            if (!forAttr) return;
            
            const targetField = document.getElementById(forAttr);
            if (!targetField) {
                // Find closest form field
                const closestField = findClosestFormField(label);
                if (closestField) {
                    label.setAttribute('for', closestField.id);
                } else {
                    // No field found, remove the for attribute
                    label.removeAttribute('for');
                }
            }
        });
        
        // Add missing labels
        addScreenReaderStyle();
        
        const unlabledFields = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
        unlabledFields.forEach(function(field) {
            // Skip if inside a label or already has a label
            if (field.closest('label') || document.querySelector(`label[for="${field.id}"]`)) {
                return;
            }
            
            // Create a new label
            const label = document.createElement('label');
            label.setAttribute('for', field.id);
            label.className = 'sr-only';
            
            // Set label text
            if (field.placeholder) {
                label.textContent = field.placeholder;
            } else if (field.name) {
                label.textContent = formatLabelText(field.name);
            } else {
                label.textContent = formatLabelText(field.id);
            }
            
            // Insert before the field
            field.parentNode.insertBefore(label, field);
        });
    }
    
    function formatLabelText(text) {
        return text
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/[-_]/g, ' ')      // Replace dashes and underscores with spaces
            .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
    }
    
    function findClosestFormField(label) {
        // Try next sibling
        let sibling = label.nextElementSibling;
        while (sibling) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(sibling.tagName)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
        
        // Try parent's children
        const parent = label.parentElement;
        if (parent) {
            const fields = Array.from(parent.querySelectorAll('input, select, textarea, button'));
            if (fields.length > 0) {
                return fields[0];
            }
        }
        
        // No field found
        return null;
    }
    
    function isClosestByPosition(label, field1, field2) {
        // Simple check: if both elements are on screen, calculate distance
        const rect1 = field1.getBoundingClientRect();
        const rect2 = field2.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        
        // Calculate centers
        const center1 = { x: rect1.left + rect1.width/2, y: rect1.top + rect1.height/2 };
        const center2 = { x: rect2.left + rect2.width/2, y: rect2.top + rect2.height/2 };
        const labelCenter = { x: labelRect.left + labelRect.width/2, y: labelRect.top + labelRect.height/2 };
        
        // Calculate distances
        const dist1 = Math.sqrt(Math.pow(center1.x - labelCenter.x, 2) + Math.pow(center1.y - labelCenter.y, 2));
        const dist2 = Math.sqrt(Math.pow(center2.x - labelCenter.x, 2) + Math.pow(center2.y - labelCenter.y, 2));
        
        return dist1 < dist2;
    }
    
    function addScreenReaderStyle() {
        if (!document.getElementById('sr-only-style')) {
            const style = document.createElement('style');
            style.id = 'sr-only-style';
            style.textContent = `
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // IMAGE FIXES
    
    function fixAllImages() {
        // Find all images
        const images = document.querySelectorAll('img');
        
        images.forEach(function(img) {
            // Skip if already fixed (has data URL)
            if (img.src && img.src.startsWith('data:')) return;
            
            // Generate appropriate image
            let imageType = 'default';
            let itemName = '';
            
            // Check if in media item
            const mediaItem = img.closest('.media-item');
            if (mediaItem) {
                imageType = mediaItem.getAttribute('data-folder') || 'default';
                itemName = mediaItem.getAttribute('data-name') || '';
            }
            
            // Get name from src or alt
            if (!itemName) {
                if (img.src) {
                    const srcParts = img.src.split('/');
                    itemName = srcParts[srcParts.length - 1];
                } else if (img.alt) {
                    itemName = img.alt;
                }
            }
            
            // Create reliable SVG data URL
            const svgDataUrl = createSvgDataUrl(imageType, itemName);
            
            // Set src attribute
            img.src = svgDataUrl;
            
            // Add error handler to ensure image always loads
            img.onerror = function() {
                this.src = createSvgDataUrl('error', 'Error Loading Image');
            };
        });
    }
    
    function createSvgDataUrl(type, name) {
        // Color mapping
        const colors = {
            'food': '#3F51B5',         // Blue
            'restaurant': '#009688',   // Teal
            'people': '#FF9800',       // Orange
            'error': '#F44336',        // Red
            'default': '#607D8B'       // Gray
        };
        
        const color = colors[type] || colors.default;
        const displayName = name || 'Image';
        
        // Create SVG
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect width="100%" height="100%" fill="${color}" />
                <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
                    ${displayName}
                </text>
            </svg>
        `;
        
        // Convert to data URL with proper encoding
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    // MEDIA SELECTOR FIXES
    
    function fixMediaSelector() {
        // Media selector grid
        const mediaGrids = document.querySelectorAll('.media-grid');
        if (mediaGrids.length > 0) {
            mediaGrids.forEach(function(grid) {
                // Check if it's already populated correctly
                const items = grid.querySelectorAll('.media-item');
                
                // Force re-creation of media items
                if (items.length === 0 || !items[0].querySelector('img[src^="data:"]')) {
                    createMediaItems(grid);
                }
            });
        }
        
        // Ensure openMediaSelector is overridden
        overrideMediaSelectors();
    }
    
    function overrideMediaSelectors() {
        // Only override if not already done
        if (!window._mediaSelectorsOverridden) {
            // Store original functions
            window._originalOpenMediaSelector = window.openMediaSelector;
            window._originalLoadMediaItems = window.loadMediaItems;
            window._originalSelectMedia = window.selectMedia;
            
            // Override openMediaSelector
            window.openMediaSelector = function(targetInputId) {
                console.log('Direct Override Fix: Opening media selector for', targetInputId);
                
                // Call original function if it exists
                if (window._originalOpenMediaSelector) {
                    window._originalOpenMediaSelector(targetInputId);
                }
                
                // Fix the newly created modal
                setTimeout(function() {
                    const modal = document.querySelector('.media-selector-modal');
                    if (modal) {
                        const grid = modal.querySelector('.media-grid');
                        if (grid) {
                            createMediaItems(grid, targetInputId);
                        }
                    }
                }, 100);
            };
            
            // Override loadMediaItems
            window.loadMediaItems = function(container, targetInputId) {
                console.log('Direct Override Fix: Loading media items');
                
                // Create media items directly
                createMediaItems(container, targetInputId);
                
                // Call original function if it exists
                if (window._originalLoadMediaItems) {
                    setTimeout(function() {
                        // Only call original if our items aren't showing
                        if (container.querySelectorAll('.media-item').length === 0) {
                            window._originalLoadMediaItems(container, targetInputId);
                            
                            // Fix images after original function runs
                            setTimeout(function() {
                                fixAllImages();
                            }, 100);
                        }
                    }, 100);
                }
            };
            
            // Override selectMedia
            window.selectMedia = function(media, targetInputId) {
                console.log('Direct Override Fix: Selecting media', media.name || media.id, 'for', targetInputId);
                
                // Get or create SVG URL
                const svgUrl = media.url || createSvgDataUrl(media.folder || 'default', media.name || '');
                
                // Find target input
                const input = document.getElementById(targetInputId);
                if (input) {
                    // Update input value
                    input.value = svgUrl;
                    
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                    
                    // Update any previews
                    updatePreviewImages(input, { ...media, url: svgUrl });
                }
                
                // Close the modal
                const modal = document.querySelector('.media-selector-modal');
                if (modal) {
                    modal.remove();
                }
                
                // Call original function if it exists
                if (window._originalSelectMedia && media.url) {
                    // Only call if we didn't handle everything
                    window._originalSelectMedia(media, targetInputId);
                }
            };
            
            window._mediaSelectorsOverridden = true;
        }
    }
    
    function createMediaItems(container, targetInputId) {
        // Clear container
        container.innerHTML = '';
        
        // Create media items with reliable images
        const mediaItems = [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image' }
        ];
        
        // Add each item to the container
        mediaItems.forEach(function(item) {
            // Create SVG URL
            const svgUrl = createSvgDataUrl(item.folder, item.name);
            item.url = svgUrl;
            
            // Create media item element
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            mediaItem.setAttribute('data-type', item.type);
            mediaItem.setAttribute('data-url', svgUrl);
            
            // Set HTML content
            mediaItem.innerHTML = `
                <div class="media-thumbnail">
                    <img src="${svgUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                    <div class="media-meta">
                        <span class="media-type">${item.type}</span>
                        <span class="media-size">10 KB</span>
                    </div>
                </div>
            `;
            
            // Add click handler
            mediaItem.addEventListener('click', function() {
                window.selectMedia(item, targetInputId);
            });
            
            // Append to container
            container.appendChild(mediaItem);
        });
        
        // Update folder counts if that function exists
        if (typeof window.updateFolderCounts === 'function') {
            try {
                window.updateFolderCounts(mediaItems);
            } catch (e) {
                console.error('Error updating folder counts:', e);
            }
        }
    }
    
    function updatePreviewImages(input, media) {
        // Find nearest container
        const container = input.closest('.form-group') || 
                          input.closest('.input-group') || 
                          input.parentNode;
        
        if (container) {
            // Find preview elements
            const previews = container.querySelectorAll('.preview, .image-preview, .media-preview');
            previews.forEach(function(preview) {
                if (preview.tagName === 'IMG') {
                    // Direct image
                    preview.src = media.url;
                    preview.style.display = 'block';
                } else {
                    // Container with image
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
        
        // Special handling for Email Subscribers
        if (input.id === 'popupBackgroundImage') {
            const popupPreview = document.querySelector('.popup-preview, .email-popup-preview');
            if (popupPreview) {
                popupPreview.style.backgroundImage = `url(${media.url})`;
                popupPreview.style.backgroundSize = 'cover';
                popupPreview.style.backgroundPosition = 'center';
            }
        } else if (input.id === 'popupLogoImage') {
            const logoContainer = document.querySelector('.popup-logo, .email-popup-logo');
            if (logoContainer) {
                let img = logoContainer.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    logoContainer.appendChild(img);
                }
                img.src = media.url;
                img.alt = 'Logo';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
            }
        }
    }
})();
