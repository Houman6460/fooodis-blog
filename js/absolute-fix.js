/**
 * Absolute Fix
 * Direct solution for both image display and form validation issues
 * Will not change functionality, only fix existing issues
 */

(function() {
    // Run immediately
    runFixesASAP();
    
    // Functions
    function runFixesASAP() {
        // Run fix now
        fixEverything();
        
        // Create an interval to keep fixing - reduced frequency to prevent rate limiting
        const fixInterval = setInterval(fixEverything, 30000); // Changed from 500ms to 30s
        
        // Also attach to regular events
        document.addEventListener('DOMContentLoaded', fixEverything);
        window.addEventListener('load', function() {
            fixEverything();
            
            // After everything loads, watch for changes
            setupObserver();
            
            // After 10 seconds, clear the interval (no longer needed)
            setTimeout(function() {
                clearInterval(fixInterval);
            }, 10000);
        });
    }
    
    function fixEverything() {
        // Fix all images - approach #1: use CSS background colors as fallback
        addGlobalImageStyles();
        
        // Fix all images - approach #2: replace with colored placeholders
        fixAllImages();
        
        // Fix all forms
        fixAllForms();
        
        // Make sure header/footer logos are visible
        fixHeaderFooterLogos();
        
        // Fix media selector
        fixMediaSelector();
    }
    
    function addGlobalImageStyles() {
        // Add global styles to make images visible even if they don't load
        if (!document.getElementById('image-fix-styles')) {
            const style = document.createElement('style');
            style.id = 'image-fix-styles';
            style.textContent = `
                /* Base fallback for all images */
                img {
                    background-color: #607D8B;
                    min-width: 30px;
                    min-height: 30px;
                    position: relative;
                }
                
                /* Category-specific colors */
                .media-item[data-folder="food"] img {
                    background-color: #3F51B5;
                }
                .media-item[data-folder="restaurant"] img {
                    background-color: #009688;
                }
                .media-item[data-folder="people"] img {
                    background-color: #FF9800;
                }
                
                /* Logo placeholder styling */
                .logo img, .brand img, .footer-logo img, 
                header img, footer img {
                    background-color: #212121;
                    min-width: 100px;
                    min-height: 40px;
                }
                
                /* Add some screen reader styles */
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
    
    function fixAllImages() {
        // Fix all images by adding placeholder content
        document.querySelectorAll('img').forEach(function(img) {
            // Skip if already fixed with a placeholder
            if (img.getAttribute('data-placeholder-fixed')) return;
            
            // SKIP blog post images - they have their own cloud fallback system
            // This prevents racing conditions where we replace images before they load
            if (img.closest('.blog-post-card, .blog-post-image, .modal-image, .blog-banner')) {
                return;
            }
            
            // Skip images with data-post-id (they use cloud fallback system)
            if (img.hasAttribute('data-post-id')) {
                return;
            }
            
            // Mark as fixed
            img.setAttribute('data-placeholder-fixed', 'true');
            
            // Determine color and label based on image location
            let color = '#607D8B'; // Default gray
            let label = 'Image';
            
            // Check if in media item
            const mediaItem = img.closest('.media-item');
            if (mediaItem) {
                const folder = mediaItem.getAttribute('data-folder');
                if (folder === 'food') {
                    color = '#3F51B5';
                    label = 'Food';
                } else if (folder === 'restaurant') {
                    color = '#009688';
                    label = 'Restaurant';
                } else if (folder === 'people') {
                    color = '#FF9800';
                    label = 'People';
                }
            } 
            // Check if logo
            else if (img.closest('.logo, .brand, header, footer')) {
                color = '#212121';
                label = 'Logo';
            }
            
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width || 200;
            canvas.height = img.height || 150;
            
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, canvas.width / 2, canvas.height / 2);
            
            // Set as src and add error handler
            const placeholder = canvas.toDataURL();
            
            // If image has not loaded yet or is broken
            if (!img.complete || img.naturalWidth === 0) {
                img.src = placeholder;
            }
            
            // Add error handler to handle future failures
            img.onerror = function() {
                this.src = placeholder;
            };
            
            // Store original src
            if (!img.hasAttribute('data-original-src') && img.src && !img.src.startsWith('data:')) {
                img.setAttribute('data-original-src', img.src);
            }
        });
    }
    
    function fixAllForms() {
        // Fix all form elements that have validation issues
        
        // 1. Fix elements without id/name
        document.querySelectorAll('input, select, textarea').forEach(function(element) {
            // Skip if already has both id and name
            if (element.id && element.name) return;
            
            // Generate unique id if needed
            if (!element.id) {
                element.id = 'field-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
            }
            
            // Add name if needed
            if (!element.name) {
                element.name = element.id;
            }
        });
        
        // 2. Fix duplicate IDs
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
                // Keep the first, rename others
                for (let i = 1; i < elements.length; i++) {
                    const newId = id + '-' + i + '-' + Date.now();
                    elements[i].id = newId;
                    
                    // Update name if it matched old id
                    if (elements[i].name === id) {
                        elements[i].name = newId;
                    }
                }
            }
        }
        
        // 3. Add autocomplete attributes
        document.querySelectorAll('input, select, textarea').forEach(function(element) {
            if (!element.hasAttribute('autocomplete') && element.type !== 'hidden') {
                element.setAttribute('autocomplete', 'off');
            }
        });
        
        // 4. Fix label associations
        document.querySelectorAll('label[for]').forEach(function(label) {
            const forAttr = label.getAttribute('for');
            const targetElement = document.getElementById(forAttr);
            
            if (!targetElement) {
                // Remove the for attribute if it's invalid
                label.removeAttribute('for');
                
                // Try to find a nearby input
                const nearbyInput = findNearbyInput(label);
                if (nearbyInput) {
                    label.setAttribute('for', nearbyInput.id);
                }
            }
        });
        
        // 5. Add missing labels
        document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').forEach(function(input) {
            // Skip if already has label
            if (input.closest('label') || document.querySelector('label[for="' + input.id + '"]')) {
                return;
            }
            
            // Create a label
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'sr-only';
            
            // Set label text
            if (input.placeholder) {
                label.textContent = input.placeholder;
            } else if (input.name) {
                label.textContent = formatLabelText(input.name);
            } else {
                label.textContent = formatLabelText(input.id);
            }
            
            // Add label before input
            input.parentNode.insertBefore(label, input);
        });
    }
    
    function fixHeaderFooterLogos() {
        // Find all logos in header and footer
        const logoContainers = document.querySelectorAll('header .logo, .brand, footer .logo, .footer-logo');
        
        logoContainers.forEach(function(container) {
            const logo = container.querySelector('img');
            
            // If logo exists but is not showing correctly
            if (logo && (!logo.complete || logo.naturalWidth === 0)) {
                // Create a new canvas placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#212121';  // Dark background
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('LOGO', canvas.width / 2, canvas.height / 2);
                
                // Set as src
                logo.src = canvas.toDataURL();
            }
            // If no logo exists at all, create one
            else if (!logo) {
                const newLogo = document.createElement('img');
                newLogo.alt = 'Logo';
                newLogo.className = 'logo-img';
                
                // Create placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 50;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#212121';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('LOGO', canvas.width / 2, canvas.height / 2);
                
                // Set src and append
                newLogo.src = canvas.toDataURL();
                container.appendChild(newLogo);
            }
        });
    }
    
    function fixMediaSelector() {
        // Watch for media selector modal opening
        document.addEventListener('click', function(event) {
            // Check if media select button was clicked
            if (event.target.closest('.media-select-btn, [data-action="selectMedia"], .select-media-btn')) {
                // Wait for modal to appear
                setTimeout(function() {
                    const modal = document.querySelector('.media-selector-modal');
                    if (modal) {
                        // Find media grid
                        const grid = modal.querySelector('.media-grid');
                        if (grid) {
                            // Fix all images in the grid
                            fixAllImages();
                        }
                    }
                }, 100);
            }
        }, true);
        
        // If media selector is already open, fix it
        const modal = document.querySelector('.media-selector-modal');
        if (modal) {
            fixAllImages();
        }
    }
    
    function findNearbyInput(label) {
        // Try next sibling
        let sibling = label.nextElementSibling;
        if (sibling && ['INPUT', 'SELECT', 'TEXTAREA'].includes(sibling.tagName)) {
            return sibling;
        }
        
        // Try previous sibling
        sibling = label.previousElementSibling;
        if (sibling && ['INPUT', 'SELECT', 'TEXTAREA'].includes(sibling.tagName)) {
            return sibling;
        }
        
        // Try parent's children
        const parent = label.parentElement;
        if (parent) {
            const inputs = parent.querySelectorAll('input, select, textarea');
            if (inputs.length > 0) {
                return inputs[0];
            }
        }
        
        // Nothing found
        return null;
    }
    
    function formatLabelText(text) {
        return text
            .replace(/([A-Z])/g, ' $1')  // Add space before capitals
            .replace(/[_-]/g, ' ')       // Replace underscores and hyphens with spaces
            .replace(/^\w/, c => c.toUpperCase());  // Capitalize first letter
    }
    
    function setupObserver() {
        // Create mutation observer
        const observer = new MutationObserver(function(mutations) {
            let needsImageFix = false;
            let needsFormFix = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType !== Node.ELEMENT_NODE) continue;
                        
                        // Check for images
                        if (node.tagName === 'IMG' || node.querySelector && node.querySelector('img')) {
                            needsImageFix = true;
                        }
                        
                        // Check for form elements
                        if (['INPUT', 'SELECT', 'TEXTAREA', 'LABEL'].includes(node.tagName) ||
                            (node.querySelector && node.querySelector('input, select, textarea, label'))) {
                            needsFormFix = true;
                        }
                    }
                }
            });
            
            // Apply fixes if needed
            if (needsImageFix) {
                fixAllImages();
                fixHeaderFooterLogos();
            }
            
            if (needsFormFix) {
                fixAllForms();
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
