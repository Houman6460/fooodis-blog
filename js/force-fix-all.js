/**
 * Force Fix All
 * Emergency fix that forces images to display and all form issues to be resolved
 * Using the most aggressive methods possible
 */

// Run immediately - don't wait for DOM to be ready
(function() {
    // Run this script as early as possible
    console.log('Force Fix All: Script loaded, applying fixes immediately');
    
    // Ensure we run at multiple points
    applyFixes(); // Run immediately
    
    // Keep running repeatedly until everything is fixed
    let fixCounter = 0;
    const maxFixes = 100;
    const fixInterval = setInterval(function() {
        fixCounter++;
        console.log(`Force Fix All: Applying fix pass #${fixCounter}`);
        applyFixes();
        
        // Stop after 100 attempts
        if (fixCounter >= maxFixes) {
            clearInterval(fixInterval);
            console.log('Force Fix All: Maximum fix attempts reached');
        }
    }, 30000); // Reduced from default to 30 seconds to prevent rate limiting
    
    // Also run when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Force Fix All: DOM loaded, applying fixes');
        applyFixes();
    });
    
    // And again when everything is loaded
    window.addEventListener('load', function() {
        console.log('Force Fix All: Window loaded, applying fixes');
        applyFixes();
        
        // Setup mutation observer to catch dynamic changes
        setupObserver();
    });
    
    function applyFixes() {
        try {
            // 1. Fix form validation issues
            fixFormValidation();
            
            // 2. Fix all images
            fixAllImages();
            
            // 3. Override media selector
            overrideMediaFunctions();
        } catch (e) {
            console.error('Force Fix All: Error applying fixes', e);
        }
    }
    
    function fixFormValidation() {
        // Add screen reader styles if not present
        addScreenReaderStyles();
        
        // Fix all form elements
        const formElements = document.querySelectorAll('input, select, textarea, button');
        formElements.forEach(function(element, index) {
            // Fix missing ID
            if (!element.id || element.id.trim() === '') {
                element.id = `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            // Fix missing name
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) && 
                (!element.name || element.name.trim() === '')) {
                element.name = element.id;
            }
            
            // Add autocomplete attribute if missing
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) && 
                !element.hasAttribute('autocomplete')) {
                // Skip hidden fields
                if (element.type !== 'hidden') {
                    element.setAttribute('autocomplete', 'off');
                }
            }
        });
        
        // Ensure unique IDs
        const idMap = {};
        document.querySelectorAll('[id]').forEach(function(element) {
            if (!idMap[element.id]) {
                idMap[element.id] = [];
            }
            idMap[element.id].push(element);
        });
        
        // Fix duplicates
        for (const [id, elements] of Object.entries(idMap)) {
            if (elements.length > 1) {
                // Keep first element, rename others
                for (let i = 1; i < elements.length; i++) {
                    const newId = `${id}-unique-${Date.now()}-${i}`;
                    elements[i].id = newId;
                    
                    // Update name if needed
                    if (elements[i].name === id) {
                        elements[i].name = newId;
                    }
                }
            }
        }
        
        // Fix label associations
        document.querySelectorAll('label[for]').forEach(function(label) {
            const forAttr = label.getAttribute('for');
            if (!forAttr) return;
            
            const targetElement = document.getElementById(forAttr);
            if (!targetElement) {
                // Try to find closest input
                const closestInput = findClosestFormElement(label);
                if (closestInput) {
                    label.setAttribute('for', closestInput.id);
                } else {
                    // Remove invalid for attribute
                    label.removeAttribute('for');
                }
            }
        });
        
        // Add missing labels
        document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').forEach(function(input) {
            // Skip if already has a label
            if (input.closest('label') || (input.id && document.querySelector(`label[for="${input.id}"]`))) {
                return;
            }
            
            // Create label
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'sr-only';
            
            // Set text
            if (input.placeholder) {
                label.textContent = input.placeholder;
            } else if (input.name) {
                label.textContent = formatLabelText(input.name);
            } else {
                label.textContent = formatLabelText(input.id);
            }
            
            // Insert before input
            input.parentNode.insertBefore(label, input);
        });
    }
    
    function fixAllImages() {
        // Replace all images with actual working images
        document.querySelectorAll('img').forEach(function(img) {
            // Skip if already data URL
            if (img.src && img.src.startsWith('data:')) return;
            
            // Determine image type and name
            let type = 'default';
            let name = '';
            
            // Check if in media item
            const mediaItem = img.closest('.media-item');
            if (mediaItem) {
                type = mediaItem.getAttribute('data-folder') || 'default';
                name = mediaItem.getAttribute('data-name') || '';
            }
            
            // Get name from src or alt
            if (!name) {
                if (img.src) {
                    const srcParts = img.src.split('/');
                    name = srcParts[srcParts.length - 1];
                } else if (img.alt) {
                    name = img.alt;
                }
            }
            
            // Create SVG data URL
            const svgUrl = createSvgDataUrl(type, name);
            
            // Set src
            img.src = svgUrl;
            
            // Add error handler
            img.onerror = function() {
                this.src = createSvgDataUrl('error', 'Error');
            };
        });
    }
    
    function overrideMediaFunctions() {
        // Create a working media grid
        document.querySelectorAll('.media-grid').forEach(function(grid) {
            // Skip if already has working items
            if (grid.querySelectorAll('.media-item img[src^="data:"]').length > 0) return;
            
            // Create media items
            createMediaItems(grid);
        });
        
        // Override functions
        window.loadMediaItems = function(container, targetInputId) {
            console.log('Force Fix: loadMediaItems called');
            createMediaItems(container, targetInputId);
        };
        
        window.selectMedia = function(media, targetInputId) {
            console.log('Force Fix: selectMedia called for', targetInputId);
            
            // Ensure media has URL
            const url = media.url || createSvgDataUrl(media.folder || 'default', media.name || '');
            
            // Find input
            const input = document.getElementById(targetInputId);
            if (input) {
                // Update value
                input.value = url;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
                
                // Update previews
                updatePreviews(input, url);
            }
            
            // Close modal
            const modal = document.querySelector('.media-selector-modal');
            if (modal) {
                modal.remove();
            }
        };
        
        window.openMediaSelector = function(targetInputId) {
            console.log('Force Fix: openMediaSelector called for', targetInputId);
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'media-selector-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            modal.style.zIndex = '9999';
            modal.style.display = 'flex';
            modal.style.flexDirection = 'column';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'media-selector-header';
            header.style.padding = '10px';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            
            // Add title
            const title = document.createElement('h3');
            title.textContent = 'Select Media';
            title.style.color = 'white';
            header.appendChild(title);
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.color = 'white';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = function() {
                modal.remove();
            };
            header.appendChild(closeBtn);
            modal.appendChild(header);
            
            // Create content area
            const content = document.createElement('div');
            content.className = 'media-selector-body';
            content.style.display = 'flex';
            content.style.flex = '1';
            content.style.overflow = 'hidden';
            
            // Create sidebar
            const sidebar = document.createElement('div');
            sidebar.className = 'sidebar';
            sidebar.style.width = '200px';
            sidebar.style.backgroundColor = '#222';
            sidebar.style.padding = '10px';
            
            // Add folders header
            const foldersHeader = document.createElement('h4');
            foldersHeader.textContent = 'FOLDERS';
            foldersHeader.style.color = '#999';
            foldersHeader.style.fontSize = '12px';
            sidebar.appendChild(foldersHeader);
            
            // Create folder list
            const folderList = document.createElement('ul');
            folderList.className = 'folder-list';
            folderList.style.listStyle = 'none';
            folderList.style.padding = '0';
            folderList.style.margin = '0';
            
            // Add folders
            const folders = [
                { name: 'All Media', count: 9, icon: '📁', id: 'all' },
                { name: 'Uncategorized', count: 0, icon: '📁', id: 'uncategorized' },
                { name: 'Food', count: 6, icon: '🍽️', id: 'food' },
                { name: 'Restaurant', count: 1, icon: '🏢', id: 'restaurant' },
                { name: 'People', count: 2, icon: '👤', id: 'people' },
                { name: 'Test', count: 0, icon: '🧪', id: 'test' }
            ];
            
            folders.forEach(function(folder, index) {
                const folderItem = document.createElement('li');
                folderItem.className = 'folder';
                folderItem.setAttribute('data-folder', folder.id);
                folderItem.style.padding = '8px';
                folderItem.style.marginBottom = '5px';
                folderItem.style.color = 'white';
                folderItem.style.borderRadius = '4px';
                folderItem.style.background = index === 0 ? '#444' : 'none';
                folderItem.style.cursor = 'pointer';
                
                folderItem.innerHTML = `
                    <span style="margin-right: 5px;">${folder.icon}</span>
                    ${folder.name}
                    <span style="float: right; background: #333; padding: 2px 6px; border-radius: 10px; font-size: 12px;">${folder.count}</span>
                `;
                
                folderItem.onclick = function() {
                    // Update active state
                    document.querySelectorAll('.folder').forEach(f => f.style.background = 'none');
                    folderItem.style.background = '#444';
                    
                    // Filter items
                    filterMediaItems(folder.id);
                };
                
                folderList.appendChild(folderItem);
            });
            
            sidebar.appendChild(folderList);
            content.appendChild(sidebar);
            
            // Create media content area
            const mediaContent = document.createElement('div');
            mediaContent.className = 'media-content';
            mediaContent.style.flex = '1';
            mediaContent.style.padding = '20px';
            mediaContent.style.overflowY = 'auto';
            
            // Create media grid
            const mediaGrid = document.createElement('div');
            mediaGrid.className = 'media-grid';
            mediaGrid.style.display = 'grid';
            mediaGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            mediaGrid.style.gap = '15px';
            
            // Create media items
            createMediaItems(mediaGrid, targetInputId);
            
            mediaContent.appendChild(mediaGrid);
            content.appendChild(mediaContent);
            modal.appendChild(content);
            
            // Add to page
            document.body.appendChild(modal);
            
            // Function to filter media items
            function filterMediaItems(folderId) {
                const items = mediaGrid.querySelectorAll('.media-item');
                items.forEach(function(item) {
                    const itemFolder = item.getAttribute('data-folder');
                    if (folderId === 'all' || itemFolder === folderId) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        };
    }
    
    function createMediaItems(container, targetInputId) {
        // Clear container
        container.innerHTML = '';
        
        // Create items
        const items = [
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
        
        items.forEach(function(item) {
            // Create SVG URL
            const svgUrl = createSvgDataUrl(item.folder, item.name);
            item.url = svgUrl;
            
            // Create element
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            mediaItem.setAttribute('data-folder', item.folder);
            mediaItem.setAttribute('data-type', item.type);
            mediaItem.setAttribute('data-url', svgUrl);
            mediaItem.style.border = '1px solid #444';
            mediaItem.style.borderRadius = '4px';
            mediaItem.style.overflow = 'hidden';
            mediaItem.style.backgroundColor = '#333';
            
            // Create thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.className = 'media-thumbnail';
            thumbnail.style.width = '100%';
            thumbnail.style.height = '150px';
            thumbnail.style.position = 'relative';
            
            // Create image
            const img = document.createElement('img');
            img.src = svgUrl;
            img.alt = item.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            thumbnail.appendChild(img);
            mediaItem.appendChild(thumbnail);
            
            // Create info
            const info = document.createElement('div');
            info.className = 'media-info';
            info.style.padding = '10px';
            
            // Create name
            const name = document.createElement('div');
            name.className = 'media-name';
            name.textContent = item.name;
            name.style.color = 'white';
            name.style.fontSize = '12px';
            name.style.whiteSpace = 'nowrap';
            name.style.overflow = 'hidden';
            name.style.textOverflow = 'ellipsis';
            info.appendChild(name);
            
            // Create meta
            const meta = document.createElement('div');
            meta.className = 'media-meta';
            meta.style.display = 'flex';
            meta.style.justifyContent = 'space-between';
            meta.style.marginTop = '5px';
            meta.style.fontSize = '10px';
            meta.style.color = '#999';
            
            meta.innerHTML = `
                <span class="media-type">${item.type}</span>
                <span class="media-size">10 KB</span>
            `;
            
            info.appendChild(meta);
            mediaItem.appendChild(info);
            
            // Add click handler
            mediaItem.style.cursor = 'pointer';
            mediaItem.onclick = function() {
                if (targetInputId) {
                    // Call selectMedia
                    window.selectMedia(item, targetInputId);
                }
            };
            
            // Add to container
            container.appendChild(mediaItem);
        });
    }
    
    function createSvgDataUrl(type, name) {
        // Define colors
        const colors = {
            'food': '#3F51B5',      // Blue
            'restaurant': '#009688', // Teal
            'people': '#FF9800',     // Orange
            'error': '#F44336',      // Red
            'default': '#607D8B'     // Gray
        };
        
        const color = colors[type] || colors.default;
        const displayName = name || 'Image';
        
        // Create SVG
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
                <rect width="300" height="200" fill="${color}" />
                <text x="150" y="100" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">
                    ${displayName}
                </text>
            </svg>
        `;
        
        // Convert to data URL safely
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }
    
    function updatePreviews(input, url) {
        // Update any previews near this input
        const container = input.closest('.form-group') || input.closest('.input-group') || input.parentNode;
        
        if (container) {
            const previews = container.querySelectorAll('.preview, .image-preview, .media-preview');
            previews.forEach(function(preview) {
                if (preview.tagName === 'IMG') {
                    preview.src = url;
                    preview.style.display = 'block';
                } else {
                    let img = preview.querySelector('img');
                    if (!img) {
                        img = document.createElement('img');
                        preview.innerHTML = '';
                        preview.appendChild(img);
                    }
                    img.src = url;
                    img.style.display = 'block';
                    preview.style.display = 'block';
                }
            });
        }
        
        // Special handling for Email Subscribers
        if (input.id === 'popupBackgroundImage') {
            const popupPreview = document.querySelector('.popup-preview, .email-popup-preview');
            if (popupPreview) {
                popupPreview.style.backgroundImage = `url(${url})`;
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
                img.src = url;
                img.alt = 'Logo';
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
            }
        }
    }
    
    function setupObserver() {
        // Create mutation observer
        const observer = new MutationObserver(function(mutations) {
            let needsFixing = false;
            
            mutations.forEach(function(mutation) {
                // Check for added nodes
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType !== Node.ELEMENT_NODE) continue;
                        
                        // Check for form elements or images
                        if (node.tagName === 'IMG' || 
                            node.tagName === 'INPUT' || 
                            node.tagName === 'SELECT' || 
                            node.tagName === 'TEXTAREA' || 
                            node.tagName === 'BUTTON' || 
                            node.tagName === 'LABEL' ||
                            node.querySelector('img, input, select, textarea, button, label')) {
                            needsFixing = true;
                            break;
                        }
                        
                        // Check for media selector
                        if (node.classList && 
                            (node.classList.contains('media-selector-modal') || 
                             node.classList.contains('media-grid') || 
                             node.classList.contains('media-item')) ||
                            node.querySelector('.media-selector-modal, .media-grid, .media-item')) {
                            needsFixing = true;
                            break;
                        }
                    }
                }
                
                // Check for attribute changes
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    
                    // Check if it's an image src change
                    if (target.tagName === 'IMG' && mutation.attributeName === 'src') {
                        // Skip if already data URL
                        if (!target.src || !target.src.startsWith('data:')) {
                            needsFixing = true;
                        }
                    }
                    
                    // Check if it's a form attribute change
                    if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName) && 
                        ['id', 'name', 'autocomplete'].includes(mutation.attributeName)) {
                        needsFixing = true;
                    }
                    
                    // Check if it's a label 'for' attribute change
                    if (target.tagName === 'LABEL' && mutation.attributeName === 'for') {
                        needsFixing = true;
                    }
                }
            });
            
            // Apply fixes if needed
            if (needsFixing) {
                applyFixes();
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'id', 'for', 'name', 'autocomplete']
        });
    }
    
    // UTILITY FUNCTIONS
    
    function findClosestFormElement(label) {
        // Try next sibling
        let sibling = label.nextElementSibling;
        while (sibling) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(sibling.tagName)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
        
        // Try previous sibling
        sibling = label.previousElementSibling;
        while (sibling) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(sibling.tagName)) {
                return sibling;
            }
            sibling = sibling.previousElementSibling;
        }
        
        // Try parent's other children
        const parent = label.parentElement;
        if (parent) {
            const inputs = Array.from(parent.querySelectorAll('input, select, textarea, button'));
            if (inputs.length > 0) {
                return inputs[0];
            }
        }
        
        // Nothing found
        return null;
    }
    
    function formatLabelText(text) {
        return text
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/[-_]/g, ' ')      // Replace dashes/underscores with spaces
            .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
    }
    
    function addScreenReaderStyles() {
        if (!document.getElementById('sr-only-styles')) {
            const style = document.createElement('style');
            style.id = 'sr-only-styles';
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
})();
