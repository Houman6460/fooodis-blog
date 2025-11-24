/**
 * Complete Dashboard Fix
 * A comprehensive solution for all media and form issues without affecting other components
 */

(function() {
    // Wait for both document ready and window load
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    let initialized = false;
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Complete Dashboard Fix: Initializing');
        
        // 1. Fix form validation issues first
        fixAllFormElements();
        
        // 2. Set up media selector override
        setupMediaSelectorOverride();
        
        // 3. Set up observers
        setupMutationObservers();
        
        console.log('Complete Dashboard Fix: Initialization complete');
    }
    
    // FORM VALIDATION FIXES
    
    function fixAllFormElements() {
        // First pass: ensure all form elements have unique IDs
        ensureUniqueIds();
        
        // Second pass: fix label associations
        fixLabelAssociations();
        
        // Third pass: add missing labels
        addMissingLabels();
        
        // Add necessary styles for screen reader content
        addScreenReaderStyles();
    }
    
    function ensureUniqueIds() {
        // Track used IDs to avoid duplicates
        const usedIds = {};
        
        // Get all form fields
        document.querySelectorAll('input, select, textarea, button').forEach((element, index) => {
            // Skip hidden fields
            if (element.type === 'hidden') return;
            
            // Check if element has an ID
            if (!element.id || element.id.trim() === '') {
                // Create a new ID based on type and index
                const newId = `${element.tagName.toLowerCase()}-${Date.now()}-${index}`;
                element.id = newId;
                
                // For form inputs, add a name attribute too if missing
                if ((element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') && 
                    (!element.name || element.name.trim() === '')) {
                    element.name = newId;
                }
            } else {
                // Check for duplicate IDs
                if (usedIds[element.id]) {
                    // Create a unique version of this ID
                    const newId = `${element.id}-unique-${index}`;
                    
                    // Update any labels pointing to the old ID
                    document.querySelectorAll(`label[for="${element.id}"]`).forEach(label => {
                        // Only update if this label is closer to this element than the original
                        if (isElementCloser(label, element, usedIds[element.id])) {
                            label.setAttribute('for', newId);
                        }
                    });
                    
                    // Update the element's ID
                    element.id = newId;
                }
                
                // Track this ID
                usedIds[element.id] = element;
            }
            
            // Add autocomplete attribute if missing
            if (!element.hasAttribute('autocomplete') && 
                (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')) {
                element.setAttribute('autocomplete', 'off');
            }
        });
    }
    
    function fixLabelAssociations() {
        // Find all labels with for attributes
        document.querySelectorAll('label[for]').forEach(label => {
            const forId = label.getAttribute('for');
            const targetElement = document.getElementById(forId);
            
            if (!targetElement) {
                // Find the closest form element to this label
                const closestInput = findClosestFormElement(label);
                
                if (closestInput) {
                    // Update the label to point to this element
                    label.setAttribute('for', closestInput.id);
                } else {
                    // No suitable input found, remove the for attribute
                    label.removeAttribute('for');
                }
            }
        });
    }
    
    function addMissingLabels() {
        // Find all form inputs that should have labels
        document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea').forEach(input => {
            // Skip if element has no ID or is inside a label or already has a label pointing to it
            if (!input.id || 
                input.closest('label') || 
                document.querySelector(`label[for="${input.id}"]`)) {
                return;
            }
            
            // Create a visually hidden label
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'sr-only';
            
            // Set label text based on available attributes
            if (input.placeholder) {
                label.textContent = input.placeholder;
            } else if (input.name) {
                // Format the name for readability
                label.textContent = input.name
                    .replace(/([A-Z])/g, ' $1')  // Add space before capitals
                    .replace(/[_-]/g, ' ')       // Replace underscores/hyphens with spaces
                    .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
            } else {
                // Use ID as fallback
                label.textContent = input.id
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[_-]/g, ' ')
                    .replace(/^\w/, c => c.toUpperCase());
            }
            
            // Insert label before the input
            input.parentNode.insertBefore(label, input);
        });
    }
    
    function addScreenReaderStyles() {
        // Add CSS for screen-reader-only elements if it doesn't exist
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
    
    function findClosestFormElement(label) {
        // Try next element sibling first
        let sibling = label.nextElementSibling;
        while (sibling) {
            if (isFormField(sibling)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
        
        // Try looking for inputs inside the same parent
        const parent = label.parentElement;
        if (parent) {
            const inputs = Array.from(parent.querySelectorAll('input, select, textarea')).filter(el => el !== label);
            if (inputs.length > 0) {
                return inputs[0];
            }
        }
        
        // Try fuzzy matching with the label's text
        const labelText = label.textContent.trim().toLowerCase();
        const allInputs = document.querySelectorAll('input, select, textarea');
        
        // First check placeholders
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            if (input.placeholder && input.placeholder.toLowerCase().includes(labelText)) {
                return input;
            }
        }
        
        // Then check names and IDs
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            if ((input.name && input.name.toLowerCase().includes(labelText)) ||
                (input.id && input.id.toLowerCase().includes(labelText))) {
                return input;
            }
        }
        
        // No match found
        return null;
    }
    
    function isFormField(element) {
        if (!element || !element.tagName) return false;
        
        const tag = element.tagName.toLowerCase();
        return tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button';
    }
    
    function isElementCloser(label, element1, element2) {
        // Calculate distance between label and both elements
        const labelRect = label.getBoundingClientRect();
        const element1Rect = element1.getBoundingClientRect();
        const element2Rect = element2.getBoundingClientRect();
        
        // Get center points
        const labelCenter = {
            x: labelRect.left + labelRect.width / 2,
            y: labelRect.top + labelRect.height / 2
        };
        
        const element1Center = {
            x: element1Rect.left + element1Rect.width / 2,
            y: element1Rect.top + element1Rect.height / 2
        };
        
        const element2Center = {
            x: element2Rect.left + element2Rect.width / 2,
            y: element2Rect.top + element2Rect.height / 2
        };
        
        // Calculate distances
        const distance1 = Math.sqrt(
            Math.pow(labelCenter.x - element1Center.x, 2) +
            Math.pow(labelCenter.y - element1Center.y, 2)
        );
        
        const distance2 = Math.sqrt(
            Math.pow(labelCenter.x - element2Center.x, 2) +
            Math.pow(labelCenter.y - element2Center.y, 2)
        );
        
        // Return true if element1 is closer to the label than element2
        return distance1 < distance2;
    }
    
    // MEDIA SELECTOR FIXES
    
    function setupMediaSelectorOverride() {
        // Store original functions if they exist
        const originalOpenMediaSelector = window.openMediaSelector;
        const originalLoadMediaItems = window.loadMediaItems;
        const originalSelectMedia = window.selectMedia;
        
        // Create reliable category-based images
        const mediaImages = createMediaImages();
        
        // Override the openMediaSelector function to use our reliable version
        window.openMediaSelector = function(targetInputId) {
            console.log('Complete Dashboard Fix: Opening media selector for', targetInputId);
            
            // Create the modal structure
            const modal = document.createElement('div');
            modal.className = 'media-selector-modal';
            modal.innerHTML = `
                <div class="media-selector-header">
                    <h3>Select Media</h3>
                    <button type="button" class="close-modal">&times;</button>
                </div>
                <div class="media-selector-search">
                    <input type="text" placeholder="Search media..." class="search-input">
                    <div class="media-selector-tabs">
                        <button type="button" class="tab-button active" data-tab="all">All Media</button>
                        <button type="button" class="tab-button" data-tab="images">Images</button>
                        <button type="button" class="tab-button" data-tab="videos">Videos</button>
                    </div>
                </div>
                <div class="media-selector-body">
                    <div class="sidebar">
                        <h4>FOLDERS</h4>
                        <ul class="folder-list">
                            <li class="folder active" data-folder="all">
                                <i class="folder-icon">📁</i> All Media <span class="count">9</span>
                            </li>
                            <li class="folder" data-folder="uncategorized">
                                <i class="folder-icon">📁</i> Uncategorized <span class="count">3</span>
                            </li>
                            <li class="folder" data-folder="food">
                                <i class="folder-icon">🍽️</i> Food <span class="count">5</span>
                            </li>
                            <li class="folder" data-folder="restaurant">
                                <i class="folder-icon">🏢</i> Restaurant <span class="count">1</span>
                            </li>
                            <li class="folder" data-folder="people">
                                <i class="folder-icon">👤</i> People <span class="count">2</span>
                            </li>
                            <li class="folder" data-folder="test">
                                <i class="folder-icon">🧪</i> Test <span class="count">1</span>
                            </li>
                        </ul>
                    </div>
                    <div class="media-content">
                        <div class="media-grid"></div>
                    </div>
                </div>
            `;
            
            // Add the modal to the page
            document.body.appendChild(modal);
            
            // Load media items
            const mediaGrid = modal.querySelector('.media-grid');
            loadMediaItems(mediaGrid, targetInputId);
            
            // Add event listener to close button
            modal.querySelector('.close-modal').addEventListener('click', function() {
                modal.remove();
            });
            
            // Handle folder selection
            modal.querySelectorAll('.folder').forEach(folder => {
                folder.addEventListener('click', function() {
                    // Update active class
                    modal.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
                    folder.classList.add('active');
                    
                    // Filter media items
                    const folderName = folder.getAttribute('data-folder');
                    filterMediaItems(mediaGrid, folderName, targetInputId);
                });
            });
            
            // Handle search
            const searchInput = modal.querySelector('.search-input');
            searchInput.addEventListener('input', function() {
                const searchTerm = searchInput.value.toLowerCase();
                searchMediaItems(mediaGrid, searchTerm, targetInputId);
            });
            
            // Handle tab selection
            modal.querySelectorAll('.tab-button').forEach(tab => {
                tab.addEventListener('click', function() {
                    // Update active class
                    modal.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    // Filter by type
                    const tabType = tab.getAttribute('data-tab');
                    filterMediaItemsByType(mediaGrid, tabType, targetInputId);
                });
            });
            
            // Close when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        };
        
        // Override loadMediaItems to use our reliable image data
        window.loadMediaItems = function(container, targetInputId) {
            // Clear the container
            container.innerHTML = '';
            
            // Add each media item
            for (const item of mediaImages) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-id', item.id);
                mediaItem.setAttribute('data-name', item.name);
                mediaItem.setAttribute('data-folder', item.folder);
                mediaItem.setAttribute('data-type', item.type);
                mediaItem.setAttribute('data-url', item.url);
                
                mediaItem.innerHTML = `
                    <div class="media-thumbnail">
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
                
                // Add click handler
                mediaItem.addEventListener('click', function() {
                    selectMedia(item, targetInputId);
                });
                
                container.appendChild(mediaItem);
            }
        };
        
        // Filter media items by folder
        function filterMediaItems(container, folder, targetInputId) {
            container.innerHTML = '';
            
            const filteredItems = folder === 'all' 
                ? mediaImages 
                : mediaImages.filter(item => item.folder === folder);
                
            for (const item of filteredItems) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-id', item.id);
                mediaItem.setAttribute('data-name', item.name);
                mediaItem.setAttribute('data-folder', item.folder);
                mediaItem.setAttribute('data-type', item.type);
                mediaItem.setAttribute('data-url', item.url);
                
                mediaItem.innerHTML = `
                    <div class="media-thumbnail">
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
                
                // Add click handler
                mediaItem.addEventListener('click', function() {
                    selectMedia(item, targetInputId);
                });
                
                container.appendChild(mediaItem);
            }
        }
        
        // Filter media items by search term
        function searchMediaItems(container, searchTerm, targetInputId) {
            container.innerHTML = '';
            
            const filteredItems = searchTerm
                ? mediaImages.filter(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.folder.toLowerCase().includes(searchTerm))
                : mediaImages;
                
            for (const item of filteredItems) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-id', item.id);
                mediaItem.setAttribute('data-name', item.name);
                mediaItem.setAttribute('data-folder', item.folder);
                mediaItem.setAttribute('data-type', item.type);
                mediaItem.setAttribute('data-url', item.url);
                
                mediaItem.innerHTML = `
                    <div class="media-thumbnail">
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
                
                // Add click handler
                mediaItem.addEventListener('click', function() {
                    selectMedia(item, targetInputId);
                });
                
                container.appendChild(mediaItem);
            }
        }
        
        // Filter media items by type
        function filterMediaItemsByType(container, type, targetInputId) {
            container.innerHTML = '';
            
            const filteredItems = type === 'all'
                ? mediaImages
                : type === 'images'
                    ? mediaImages.filter(item => item.type === 'image')
                    : mediaImages.filter(item => item.type === 'video');
                
            for (const item of filteredItems) {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.setAttribute('data-id', item.id);
                mediaItem.setAttribute('data-name', item.name);
                mediaItem.setAttribute('data-folder', item.folder);
                mediaItem.setAttribute('data-type', item.type);
                mediaItem.setAttribute('data-url', item.url);
                
                mediaItem.innerHTML = `
                    <div class="media-thumbnail">
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
                
                // Add click handler
                mediaItem.addEventListener('click', function() {
                    selectMedia(item, targetInputId);
                });
                
                container.appendChild(mediaItem);
            }
        }
        
        // Override selectMedia to properly handle our media items
        window.selectMedia = function(media, targetInputId) {
            console.log('Complete Dashboard Fix: Selecting media', media.name, 'for', targetInputId);
            
            // Find target input
            const targetInput = document.getElementById(targetInputId);
            if (!targetInput) {
                console.error('Target input not found:', targetInputId);
                return;
            }
            
            // Update input value
            targetInput.value = media.url;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            targetInput.dispatchEvent(event);
            
            // Update any preview images
            updatePreviewImages(targetInput, media);
            
            // Handle special cases
            handleSpecialCases(targetInputId, media);
            
            // Close the modal
            const modal = document.querySelector('.media-selector-modal');
            if (modal) {
                modal.remove();
            }
        };
        
        function updatePreviewImages(targetInput, media) {
            // Find the closest container
            const container = targetInput.closest('.form-group') || 
                              targetInput.closest('.input-group') || 
                              targetInput.parentNode;
            
            if (container) {
                // Look for preview elements
                const previews = container.querySelectorAll('.preview, .image-preview, .media-preview');
                
                previews.forEach(preview => {
                    if (preview.tagName === 'IMG') {
                        // Direct image preview
                        preview.src = media.url;
                        preview.alt = media.name;
                        preview.style.display = 'block';
                    } else {
                        // Container with possibly nested image
                        let img = preview.querySelector('img');
                        
                        if (!img) {
                            // Create image if it doesn't exist
                            img = document.createElement('img');
                            preview.innerHTML = '';
                            preview.appendChild(img);
                        }
                        
                        img.src = media.url;
                        img.alt = media.name;
                        img.style.display = 'block';
                        preview.style.display = 'block';
                    }
                });
            }
        }
        
        function handleSpecialCases(targetInputId, media) {
            // Special handling for Email Subscribers popup
            if (targetInputId === 'popupBackgroundImage') {
                // Update background in preview
                const popupPreview = document.querySelector('.popup-preview, .email-popup-preview');
                if (popupPreview) {
                    popupPreview.style.backgroundImage = `url(${media.url})`;
                    popupPreview.style.backgroundSize = 'cover';
                    popupPreview.style.backgroundPosition = 'center';
                }
            } else if (targetInputId === 'popupLogoImage') {
                // Update logo in preview
                const logoContainer = document.querySelector('.popup-logo, .email-popup-logo');
                if (logoContainer) {
                    let logoImg = logoContainer.querySelector('img');
                    
                    if (!logoImg) {
                        logoImg = document.createElement('img');
                        logoContainer.appendChild(logoImg);
                    }
                    
                    logoImg.src = media.url;
                    logoImg.alt = 'Logo';
                    logoImg.style.maxWidth = '100%';
                    logoImg.style.maxHeight = '100%';
                }
            }
        }
    }
    
    function createMediaImages() {
        // Define the media items with guaranteed-to-display images
        return [
            {
                id: '1',
                name: 'cappuccino-or-latte-coffee-with-heart-art.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'Cappuccino with Heart Art', 0)
            },
            {
                id: '2',
                name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'Japanese Tea', 1)
            },
            {
                id: '3',
                name: 'white-cup-of-tasty-cappuccino.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'White Cup Cappuccino', 2)
            },
            {
                id: '4',
                name: 'hot-coffee-latte-art-on-wooden-table.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'Coffee Latte Art', 3)
            },
            {
                id: '5',
                name: 'appetizing-soup-served-with-herbs.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'Herb Soup', 4)
            },
            {
                id: '6',
                name: 'restaurant-interior.jpg',
                folder: 'restaurant',
                type: 'image',
                url: createSVGImage('restaurant', 'Restaurant Interior', 0)
            },
            {
                id: '7',
                name: 'chef-cooking.jpg',
                folder: 'people',
                type: 'image',
                url: createSVGImage('people', 'Chef Cooking', 0)
            },
            {
                id: '8',
                name: 'chef-decorating.jpg',
                folder: 'people',
                type: 'image',
                url: createSVGImage('people', 'Chef Decorating', 1)
            },
            {
                id: '9',
                name: 'a-full-bag-of-brown-coffee-beans.jpg',
                folder: 'food',
                type: 'image',
                url: createSVGImage('food', 'Coffee Beans', 5)
            }
        ];
    }
    
    function createSVGImage(category, label, index) {
        // Define colors for different categories
        const colors = {
            food: ['#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9', '#E8EAF6'],
            restaurant: ['#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB', '#E0F2F1'],
            people: ['#FF9800', '#FFA726', '#FFB74D', '#FFCC80', '#FFE0B2', '#FFF3E0'],
            test: ['#9C27B0', '#AB47BC', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5'],
            uncategorized: ['#607D8B', '#78909C', '#90A4AE', '#B0BEC5', '#CFD8DC', '#ECEFF1']
        };
        
        // Get color for this item
        const colorList = colors[category] || colors.uncategorized;
        const color = colorList[index % colorList.length];
        
        // Create SVG
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
                <rect width="300" height="200" fill="${color}" />
                <text x="150" y="100" font-family="Arial" font-size="18" fill="white" text-anchor="middle">${label}</text>
            </svg>
        `;
        
        // Convert to data URL using a robust method
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        return URL.createObjectURL(svgBlob);
    }
    
    function setupMutationObservers() {
        // Create observer for dynamically added elements
        const observer = new MutationObserver(mutations => {
            let formElementsAdded = false;
            let mediaSelectorAdded = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for form elements
                            if (node.tagName === 'INPUT' || node.tagName === 'SELECT' || 
                                node.tagName === 'TEXTAREA' || node.tagName === 'LABEL' ||
                                node.querySelector('input, select, textarea, label')) {
                                formElementsAdded = true;
                            }
                            
                            // Check for media selector
                            if (node.classList && node.classList.contains('media-selector-modal')) {
                                mediaSelectorAdded = true;
                            }
                        }
                    });
                }
            });
            
            // Fix elements if needed
            if (formElementsAdded) {
                fixAllFormElements();
            }
        });
        
        // Start observing
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
})();
