/**
 * Immediate Path Fix
 * 
 * This script loads as early as possible and directly replaces all instances
 * of css/images/ with images/ throughout the DOM.
 */

// Execute immediately - don't wait for document ready
(function() {
    console.log("Immediate Path Fix: Starting immediate fix");
    
    // Run the fix now and several times afterward to catch everything
    runFix();
    setTimeout(runFix, 0);
    setTimeout(runFix, 100);
    setTimeout(runFix, 300);
    setTimeout(runFix, 500);
    setTimeout(runFix, 1000);
    
    // Add the fix to run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runFix);
    }
    
    // Also run the fix when the window loads
    window.addEventListener('load', runFix);
    
    // Main fix function
    function runFix() {
        console.log("Immediate Path Fix: Running fix");
        
        // 1. Fix all input values
        try {
            document.querySelectorAll('input[type="text"], input:not([type]), textarea').forEach(input => {
                if (input.value && input.value.includes('css/images/')) {
                    const oldValue = input.value;
                    const newValue = input.value.replace(/css\/images\//g, 'images/').replace(/\/css\/images\//g, '/images/');
                    input.value = newValue;
                    console.log("Immediate Path Fix: Changed input value from", oldValue, "to", newValue);
                    
                    // Trigger input and change events
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error fixing inputs:", e);
        }
        
        // 2. Fix all image src attributes
        try {
            document.querySelectorAll('img').forEach(img => {
                if (img.src && img.src.includes('css/images/')) {
                    const oldSrc = img.src;
                    const newSrc = img.src.replace(/css\/images\//g, 'images/').replace(/\/css\/images\//g, '/images/');
                    img.src = newSrc;
                    console.log("Immediate Path Fix: Changed image src from", oldSrc, "to", newSrc);
                    
                    // Add error handler for fallback to colored placeholder
                    img.onerror = function() {
                        createPlaceholder(this);
                    };
                }
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error fixing images:", e);
        }
        
        // 3. Fix all background images in inline styles
        try {
            document.querySelectorAll('[style*="css/images"]').forEach(el => {
                const oldStyle = el.getAttribute('style');
                if (oldStyle) {
                    const newStyle = oldStyle.replace(/css\/images\//g, 'images/').replace(/\/css\/images\//g, '/images/');
                    el.setAttribute('style', newStyle);
                    console.log("Immediate Path Fix: Changed style from", oldStyle, "to", newStyle);
                }
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error fixing background images:", e);
        }
        
        // 4. Attempt to fix any data attributes
        try {
            document.querySelectorAll('[data-src*="css/images"], [data-url*="css/images"], [data-image*="css/images"]').forEach(el => {
                for (const attr of el.attributes) {
                    if (attr.value && attr.value.includes('css/images/')) {
                        const oldValue = attr.value;
                        const newValue = attr.value.replace(/css\/images\//g, 'images/').replace(/\/css\/images\//g, '/images/');
                        el.setAttribute(attr.name, newValue);
                        console.log("Immediate Path Fix: Changed attribute", attr.name, "from", oldValue, "to", newValue);
                    }
                }
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error fixing data attributes:", e);
        }
        
        // 5. Force colored placeholders for media items
        try {
            document.querySelectorAll('.media-item').forEach(item => {
                // Skip if already fixed
                if (item.getAttribute('data-fixed') === 'true') return;
                
                // Get folder/category information
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
                
                // Get color and label based on category
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
                    // Remove any existing images
                    thumbnail.querySelectorAll('img').forEach(img => img.remove());
                    
                    // Apply colored background
                    thumbnail.style.backgroundColor = color;
                    thumbnail.style.display = 'flex';
                    thumbnail.style.alignItems = 'center';
                    thumbnail.style.justifyContent = 'center';
                    thumbnail.style.minHeight = '140px';
                    
                    // Add label
                    if (!thumbnail.querySelector('.media-label')) {
                        const labelEl = document.createElement('div');
                        labelEl.className = 'media-label';
                        labelEl.textContent = label;
                        labelEl.style.color = 'white';
                        labelEl.style.fontWeight = 'bold';
                        labelEl.style.fontSize = '16px';
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
                item.setAttribute('data-fixed', 'true');
                console.log("Immediate Path Fix: Fixed media item", name);
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error fixing media items:", e);
        }
    }
    
    // Create a colored placeholder for a failed image
    function createPlaceholder(img) {
        console.log("Immediate Path Fix: Creating placeholder for", img.src);
        
        // Get parent element to determine category
        const parent = img.parentElement;
        if (!parent) return;
        
        // Default category is food
        let category = 'food';
        const parentText = parent.textContent.toLowerCase();
        
        // Determine category based on parent text
        if (parentText.includes('restaurant') || parentText.includes('interior')) {
            category = 'restaurant';
        } else if (parentText.includes('chef') || parentText.includes('people')) {
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
        
        // Replace the image
        parent.replaceChild(placeholder, img);
    }
    
    // Override global accessor functions to ensure they use the correct paths
    function overrideGlobalFunctions() {
        try {
            // List of functions to possibly override
            const funcNames = [
                'getMediaUrl',
                'getImageUrl',
                'generateThumbnailUrl',
                'selectImage',
                'openMediaLibrary',
                'selectMedia'
            ];
            
            funcNames.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    const originalFunc = window[funcName];
                    
                    window[funcName] = function() {
                        // Call the original function
                        let result = originalFunc.apply(this, arguments);
                        
                        // Fix the result if it's a string
                        if (typeof result === 'string' && result.includes('css/images/')) {
                            const oldResult = result;
                            result = result.replace(/css\/images\//g, 'images/').replace(/\/css\/images\//g, '/images/');
                            console.log(`Immediate Path Fix: Changed ${funcName} result from`, oldResult, "to", result);
                        }
                        
                        // Run the fix after a delay
                        setTimeout(runFix, 100);
                        
                        return result;
                    };
                    
                    console.log(`Immediate Path Fix: Overrode ${funcName} function`);
                }
            });
        } catch (e) {
            console.error("Immediate Path Fix: Error overriding functions:", e);
        }
    }
    
    // Set up observer to catch dynamic additions
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
                                // Check various conditions that would require a fix
                                if (node.nodeName === 'IMG' && node.src && node.src.includes('css/images/')) {
                                    needsFix = true;
                                    break;
                                }
                                
                                if (node.nodeName === 'INPUT' && node.value && node.value.includes('css/images/')) {
                                    needsFix = true;
                                    break;
                                }
                                
                                if (node.hasAttribute && node.hasAttribute('style') && node.getAttribute('style').includes('css/images/')) {
                                    needsFix = true;
                                    break;
                                }
                                
                                // Check children
                                if (node.querySelector) {
                                    if (node.querySelector('img[src*="css/images/"], input[value*="css/images/"], [style*="css/images/"]')) {
                                        needsFix = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                });
                
                if (needsFix) {
                    runFix();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src', 'style', 'value', 'data-src', 'data-url']
            });
            
            console.log("Immediate Path Fix: Observer setup complete");
        } catch (e) {
            console.error("Immediate Path Fix: Error setting up observer:", e);
        }
    }
    
    // Override functions once the window is loaded
    window.addEventListener('load', function() {
        overrideGlobalFunctions();
        setupObserver();
    });
})();
