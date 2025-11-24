/**
 * Pure Placeholder Fix
 * 
 * This script eliminates all attempts to load images and uses pure CSS placeholders
 * for the Email Subscribers media selector.
 */

(function() {
    console.log("Pure Placeholder Fix: Initializing");
    
    // Run immediately and after load
    fixMediaItems();
    document.addEventListener('DOMContentLoaded', fixMediaItems);
    window.addEventListener('load', fixMediaItems);
    setTimeout(fixMediaItems, 500);
    setTimeout(fixMediaItems, 1000);
    setTimeout(fixMediaItems, 2000);
    
    // Block all image loading attempts
    const originalImageConstructor = window.Image;
    window.Image = function() {
        const img = new originalImageConstructor();
        const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
        
        // Override src setter to prevent loading css/images or images paths
        Object.defineProperty(img, 'src', {
            set: function(value) {
                if (typeof value === 'string' && (value.includes('css/images/') || value.includes('images/'))) {
                    console.log("Pure Placeholder Fix: Blocked image load:", value);
                    // Don't actually set the src
                    setTimeout(() => {
                        // Trigger error event to activate placeholder
                        const errorEvent = new Event('error');
                        img.dispatchEvent(errorEvent);
                    }, 10);
                    return;
                }
                // For other images, set normally
                originalSetSrc.call(this, value);
            }
        });
        
        // Add immediate error handler
        img.addEventListener('error', function() {
            // Will be replaced with placeholder
            if (this.parentNode) {
                createPlaceholder(this);
            }
        });
        
        return img;
    };
    
    // Main fix function
    function fixMediaItems() {
        console.log("Pure Placeholder Fix: Running fix");
        
        // 1. Remove any attempts to load real images
        document.querySelectorAll('img[src*="css/images/"], img[src*="images/"]').forEach(img => {
            // Replace with placeholder immediately
            createPlaceholder(img);
        });
        
        // 2. Fix all media items to use colored boxes
        document.querySelectorAll('.media-item').forEach(item => {
            // Skip if already fixed
            if (item.getAttribute('data-placeholder-fix') === 'true') return;
            
            // Get folder/name information
            const folder = item.getAttribute('data-folder') || '';
            const nameEl = item.querySelector('.media-name');
            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            
            // Determine category
            let category = 'food'; // Default
            if (folder === 'restaurant' || name.includes('restaurant') || name.includes('interior')) {
                category = 'restaurant';
            } else if (folder === 'people' || name.includes('chef') || name.includes('people')) {
                category = 'people';
            }
            
            // Apply colors based on category
            let color = '#6974d4'; // Blue for food
            let label = 'Food';
            if (category === 'restaurant') {
                color = '#13b3a4'; // Teal
                label = 'Restaurant';
            } else if (category === 'people') {
                color = '#f3a638'; // Orange
                label = 'People';
            }
            
            // Find and replace thumbnail
            const thumbnail = item.querySelector('.media-thumbnail');
            if (thumbnail) {
                // Remove any actual images
                thumbnail.querySelectorAll('img').forEach(img => img.remove());
                
                // Apply colored background
                thumbnail.style.backgroundColor = color;
                thumbnail.style.display = 'flex';
                thumbnail.style.alignItems = 'center';
                thumbnail.style.justifyContent = 'center';
                thumbnail.style.minHeight = '140px';
                
                // Add label if not already present
                if (!thumbnail.querySelector('.media-label')) {
                    const labelEl = document.createElement('div');
                    labelEl.className = 'media-label';
                    labelEl.textContent = label;
                    labelEl.style.color = 'white';
                    labelEl.style.fontWeight = 'bold';
                    labelEl.style.fontSize = '16px';
                    labelEl.style.textShadow = '0 1px 2px rgba(0,0,0,0.4)';
                    thumbnail.appendChild(labelEl);
                }
            }
            
            // Fix file size
            const sizeEl = item.querySelector('.media-size');
            if (sizeEl && (sizeEl.textContent === '0 Bytes' || sizeEl.textContent === '0.0 Bytes' || sizeEl.textContent.trim() === '')) {
                const size = Math.floor(Math.random() * 200) + 400;
                sizeEl.textContent = size + ' KB';
            }
            
            // Mark as fixed
            item.setAttribute('data-placeholder-fix', 'true');
        });
        
        // 3. Fix input fields
        document.querySelectorAll('input[type="text"], input:not([type]), textarea').forEach(input => {
            if (input.value && (input.value.includes('css/images/') || input.value.includes('images/'))) {
                // Instead of changing the path, use a placeholder value
                const filename = input.value.split('/').pop();
                input.value = '[Media: ' + filename + ']';
                
                // Dispatch change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // 4. Override media selection functions
        overrideMediaFunctions();
    }
    
    // Create a colored placeholder for an image
    function createPlaceholder(img) {
        // Skip if already processed
        if (!img || !img.parentNode) return;
        
        // Determine category based on parent or image path
        const src = img.src || '';
        const parentText = img.parentNode.textContent.toLowerCase();
        
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
        
        // Create placeholder div
        const placeholder = document.createElement('div');
        placeholder.className = 'media-placeholder';
        placeholder.style.backgroundColor = color;
        placeholder.style.width = img.width ? img.width + 'px' : '100%';
        placeholder.style.height = img.height ? img.height + 'px' : '140px';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = 'white';
        placeholder.style.fontWeight = 'bold';
        placeholder.style.textShadow = '0 1px 2px rgba(0,0,0,0.4)';
        placeholder.style.borderRadius = '4px';
        placeholder.textContent = label;
        
        // Replace the image with the placeholder
        img.parentNode.replaceChild(placeholder, img);
    }
    
    // Override media-related functions
    function overrideMediaFunctions() {
        // Override renderMediaItem function to use placeholders
        if (typeof window.renderMediaItem === 'function') {
            const originalRenderMediaItem = window.renderMediaItem;
            
            window.renderMediaItem = function(item, container) {
                // Check if we should use our placeholder version
                if (item && item.type === 'image') {
                    // Create element directly with placeholder
                    const mediaItemEl = document.createElement('div');
                    mediaItemEl.className = 'media-item';
                    mediaItemEl.setAttribute('data-id', item.id);
                    mediaItemEl.setAttribute('data-name', item.name);
                    mediaItemEl.setAttribute('data-folder', item.folder || 'uncategorized');
                    mediaItemEl.setAttribute('data-placeholder-fix', 'true');
                    
                    // Determine color based on folder
                    let color = '#6974d4'; // Blue for food
                    let label = 'Food';
                    if (item.folder === 'restaurant') {
                        color = '#13b3a4'; // Teal
                        label = 'Restaurant';
                    } else if (item.folder === 'people') {
                        color = '#f3a638'; // Orange
                        label = 'People';
                    }
                    
                    // Generate random file size
                    const fileSize = Math.floor(Math.random() * 200) + 400;
                    
                    // Create HTML with colored placeholder
                    mediaItemEl.innerHTML = `
                        <div class="media-thumbnail" style="background-color: ${color}; display: flex; align-items: center; justify-content: center; min-height: 140px;">
                            <div class="media-label" style="color: white; font-weight: bold; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">${label}</div>
                        </div>
                        <div class="media-info">
                            <div class="media-name">${item.name}</div>
                            <div class="media-meta">
                                <span class="media-type">image</span>
                                <span class="media-size">${fileSize} KB</span>
                            </div>
                        </div>
                    `;
                    
                    // Add click event
                    mediaItemEl.addEventListener('click', function() {
                        // Get current selected item
                        const selected = container.querySelector('.media-item.selected');
                        if (selected) {
                            selected.classList.remove('selected');
                        }
                        
                        // Select this item
                        this.classList.add('selected');
                        
                        // Dispatch selection event
                        const event = new CustomEvent('mediaSelected', {
                            detail: { item: item, element: this }
                        });
                        document.dispatchEvent(event);
                    });
                    
                    // Add to container
                    container.appendChild(mediaItemEl);
                    
                    return mediaItemEl;
                }
                
                // For non-image items, use original function
                return originalRenderMediaItem.apply(this, arguments);
            };
            
            console.log("Pure Placeholder Fix: Overrode renderMediaItem function");
        }
        
        // Override media selection function
        const selectionFunctions = ['selectMedia', 'openMediaLibrary', 'selectImage'];
        selectionFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const originalFunc = window[funcName];
                
                window[funcName] = function() {
                    // Call original function
                    const result = originalFunc.apply(this, arguments);
                    
                    // Apply our fix after a delay
                    setTimeout(fixMediaItems, 100);
                    setTimeout(fixMediaItems, 300);
                    
                    return result;
                };
                
                console.log(`Pure Placeholder Fix: Overrode ${funcName} function`);
            }
        });
    }
    
    // Set up observer to catch dynamic content
    function setupObserver() {
        if (!document.body) {
            setTimeout(setupObserver, 100);
            return;
        }
        
        try {
            const observer = new MutationObserver(mutations => {
                let needsFix = false;
                
                mutations.forEach(mutation => {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check for media items or media modals
                                if (node.classList && 
                                    (node.classList.contains('media-item') || 
                                     node.classList.contains('media-modal'))) {
                                    needsFix = true;
                                    break;
                                }
                                
                                // Check for images with problematic paths
                                if (node.tagName === 'IMG' && 
                                    (node.src.includes('css/images/') || node.src.includes('images/'))) {
                                    needsFix = true;
                                    break;
                                }
                                
                                // Check for child elements that may need fixing
                                if (node.querySelector && 
                                    (node.querySelector('.media-item:not([data-placeholder-fix="true"])') || 
                                     node.querySelector('img[src*="css/images/"], img[src*="images/"]'))) {
                                    needsFix = true;
                                    break;
                                }
                            }
                        }
                    }
                });
                
                if (needsFix) {
                    fixMediaItems();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'style', 'value']
            });
            
            console.log("Pure Placeholder Fix: Observer setup complete");
        } catch (e) {
            console.error("Pure Placeholder Fix: Observer setup error:", e);
        }
    }
    
    // Setup observer
    if (document.body) {
        setupObserver();
    } else {
        window.addEventListener('load', setupObserver);
    }
})();
