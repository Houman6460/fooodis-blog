/**
 * BRUTE FORCE Popup Media Library Integration
 * Uses Mutation Observer to detect when popup is open and force-inject buttons
 */
(function() {
    // Track if we've injected our styles already
    let stylesInjected = false;
    
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Look for nodes being added to the document
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes contain file inputs
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // If this is a file input, add a button to it
                        if (node.tagName === 'INPUT' && node.type === 'file') {
                            addMediaButtonToFileInput(node);
                        }
                        
                        // Otherwise, look for file inputs inside this node
                        if (node.querySelectorAll) {
                            node.querySelectorAll('input[type="file"]').forEach(function(fileInput) {
                                addMediaButtonToFileInput(fileInput);
                            });
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the entire document for changes
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // Add a global click handler for our buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('media-library-button')) {
            event.preventDefault();
            const targetInput = event.target.getAttribute('data-target-input');
            openMediaLibrary(targetInput);
        }
    });
    
    // Also scan the document immediately and at intervals
    scanDocument();
    setInterval(scanDocument, 1000);
    
    /**
     * Scan the entire document for file inputs and add buttons
     */
    function scanDocument() {
        // Make sure our styles are injected
        if (!stylesInjected) {
            injectStyles();
            stylesInjected = true;
        }
        
        // Find all file inputs that don't have our button
        document.querySelectorAll('input[type="file"]:not([data-media-btn-added])').forEach(function(fileInput) {
            addMediaButtonToFileInput(fileInput);
        });
    }
    
    /**
     * Add a media library button to a file input
     * @param {HTMLElement} fileInput - The file input to add a button to
     */
    function addMediaButtonToFileInput(fileInput) {
        // Skip if already processed
        if (fileInput.getAttribute('data-media-btn-added')) return;
        
        // Mark as processed
        fileInput.setAttribute('data-media-btn-added', 'true');
        console.log('Adding media button to file input', fileInput);
        
        // Ensure it has an ID
        if (!fileInput.id) {
            fileInput.id = 'file-input-' + Math.random().toString(36).substring(2, 9);
        }
        
        // Create the media button
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'media-library-button';
        button.textContent = 'Choose from Media Library';
        button.setAttribute('data-target-input', fileInput.id);
        
        // Add directly after the file input's parent container
        const parent = fileInput.parentElement;
        if (parent) {
            parent.insertAdjacentElement('afterend', button);
            console.log('Added media button for', fileInput.id);
        } else {
            // Fallback: insert after the file input itself
            fileInput.insertAdjacentElement('afterend', button);
        }
    }
    
    /**
     * Inject CSS styles for our media buttons
     */
    function injectStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .media-library-button {
                background-color: #C2E05D !important;
                color: #333 !important;
                border: none !important;
                border-radius: 4px !important;
                padding: 8px 16px !important;
                margin-top: 10px !important;
                width: 100% !important;
                font-weight: bold !important;
                cursor: pointer !important;
                display: block !important;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    /**
     * Open the media library to select an image
     * @param {string} targetInputId - ID of the file input to update
     */
    function openMediaLibrary(targetInputId) {
        console.log('Opening media library for:', targetInputId);
        
        // Check if there's a global media library function we can use
        if (typeof window.openMediaLibrary === 'function') {
            window.openMediaLibrary(targetInputId, function(selectedMedia) {
                updateFileInput(targetInputId, selectedMedia);
            });
            return;
        }
        
        // Create a simple media selection modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // Create modal content
        const content = document.createElement('div');
        content.style.backgroundColor = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '4px';
        content.style.maxWidth = '800px';
        content.style.width = '90%';
        content.innerHTML = `
            <h3 style="margin-top:0">Select Media</h3>
            <p>Browse and select media from your library:</p>
            <div id="media-items" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:10px; margin:15px 0; max-height:400px; overflow-y:auto;">
                <div style="grid-column:1/-1; text-align:center;">Loading media items...</div>
            </div>
            <button id="close-media-modal" style="background:#333; color:#fff; border:none; padding:8px 16px; border-radius:4px; margin-top:10px; cursor:pointer;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close button handler
        document.getElementById('close-media-modal').addEventListener('click', function() {
            modal.remove();
        });
        
        // Load media items (from localStorage or any other source)
        let mediaItems = [];
        try {
            // Try to get media items from localStorage
            const storedItems = localStorage.getItem('mediaLibraryItems');
            if (storedItems) {
                mediaItems = JSON.parse(storedItems);
            }
        } catch (error) {
            console.error('Error loading media items:', error);
        }
        
        // Display media items
        const itemsContainer = document.getElementById('media-items');
        if (!mediaItems || mediaItems.length === 0) {
            itemsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center;">No media items found</div>';
            return;
        }
        
        // Render media items
        itemsContainer.innerHTML = '';
        mediaItems.forEach(function(item) {
            const mediaItem = document.createElement('div');
            mediaItem.style.border = '1px solid #ddd';
            mediaItem.style.borderRadius = '4px';
            mediaItem.style.overflow = 'hidden';
            mediaItem.style.cursor = 'pointer';
            
            // Create thumbnail and title
            mediaItem.innerHTML = `
                <div style="height:80px; background-image:url('${item.path || ''}'); background-size:cover; background-position:center;"></div>
                <div style="padding:5px; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name || 'Unnamed'}</div>
            `;
            
            // Select this item when clicked
            mediaItem.addEventListener('click', function() {
                updateFileInput(targetInputId, item);
                modal.remove();
            });
            
            itemsContainer.appendChild(mediaItem);
        });
    }
    
    /**
     * Update a file input with the selected media
     * @param {string} inputId - The ID of the file input to update
     * @param {Object} media - The selected media object
     */
    function updateFileInput(inputId, media) {
        const fileInput = document.getElementById(inputId);
        if (!fileInput) {
            console.error('File input not found:', inputId);
            return;
        }
        
        // Update data attributes with selected media information
        fileInput.dataset.mediaPath = media.path || '';
        fileInput.dataset.mediaName = media.name || '';
        fileInput.dataset.mediaType = media.type || 'image';
        
        // Update any filename display elements
        const fileNameDisplay = fileInput.parentElement.querySelector('.file-name, .selected-file, .filename');
        if (fileNameDisplay) {
            fileNameDisplay.textContent = media.name || 'Selected media';
        }
        
        // Update any preview elements
        const previewElement = fileInput.closest('form, div, section').querySelector('.preview, .image-preview');
        if (previewElement) {
            previewElement.style.backgroundImage = `url('${media.path}')`;
            previewElement.style.display = 'block';
        }
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
        
        console.log('Updated file input with media:', media);
    }
// End of the file
    
    /**
     * Open media library for file selection
     * @param {string} targetInputId - ID of the file input to update
     */
    function openMediaLibrary(targetInputId) {
        console.log('Opening media library for input:', targetInputId);
        
        // Check if a media library already exists in the system
        if (typeof window.openMediaLibrary === 'function') {
            // Use existing media library function
            window.openMediaLibrary(targetInputId, function(selectedMedia) {
                updateFileInput(targetInputId, selectedMedia);
            });
            return;
        }
        
        // Check if media modal already exists - some systems have a modal with this ID
        if (document.getElementById('media-modal')) {
            document.getElementById('media-modal').style.display = 'block';
            return;
        }
        
        // If no existing media library exists, create a simple one
        const modal = document.createElement('div');
        modal.id = 'simple-media-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        // Create modal content
        const content = document.createElement('div');
        content.style.backgroundColor = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '4px';
        content.style.maxWidth = '800px';
        content.style.width = '90%';
        content.innerHTML = `
            <h3 style="margin-top:0">Select Media</h3>
            <p>Browse and select media from your library:</p>
            <div id="media-items" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:10px; margin:15px 0; max-height:400px; overflow-y:auto;">
                <div style="grid-column:1/-1; text-align:center;">Loading media items...</div>
            </div>
            <button id="close-media-modal" style="background:#333; color:#fff; border:none; padding:8px 16px; border-radius:4px; margin-top:10px; cursor:pointer;">Close</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Close button handler
        document.getElementById('close-media-modal').addEventListener('click', function() {
            modal.remove();
        });
        
        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Try to load media items from local storage if they exist
        let mediaItems = [];
        try {
            const storedItems = localStorage.getItem('mediaLibraryItems');
            if (storedItems) {
                mediaItems = JSON.parse(storedItems);
            }
        } catch (error) {
            console.error('Error loading media items:', error);
        }
        
        // Display media items
        const itemsContainer = document.getElementById('media-items');
        if (!mediaItems || mediaItems.length === 0) {
            itemsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center;">No media items found. Please upload some media first.</div>';
            return;
        }
        
        // Render media items
        itemsContainer.innerHTML = '';
        mediaItems.forEach(function(item) {
            const mediaItem = document.createElement('div');
            mediaItem.style.border = '1px solid #ddd';
            mediaItem.style.borderRadius = '4px';
            mediaItem.style.overflow = 'hidden';
            mediaItem.style.cursor = 'pointer';
            mediaItem.style.transition = 'transform 0.2s';
            mediaItem.innerHTML = `
                <div style="height:80px; background-image:url('${item.path || ''}'); background-size:cover; background-position:center;"></div>
                <div style="padding:5px; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name || 'Unnamed'}</div>
            `;
            
            // Click handler to select this item
            mediaItem.addEventListener('click', function() {
                updateFileInput(targetInputId, item);
                modal.remove();
            });
            
            itemsContainer.appendChild(mediaItem);
        });
    }
    
    /**
     * Update a file input with selected media
     * @param {string} inputId - ID of the file input to update
     * @param {Object} media - Selected media object
     */
    function updateFileInput(inputId, media) {
        // Find the file input
        const fileInput = document.getElementById(inputId);
        if (!fileInput) {
            console.error('File input not found:', inputId);
            return;
        }
        
        console.log('Updating file input with selected media:', media);
        
        // Store the media path in data attributes
        fileInput.dataset.mediaPath = media.path || '';
        fileInput.dataset.mediaName = media.name || '';
        fileInput.dataset.mediaType = media.type || 'image';
        
        // Update any visible file name display
        const fileNameDisplay = fileInput.parentElement.querySelector('.file-name, .filename, .selected-file');
        if (fileNameDisplay) {
            fileNameDisplay.textContent = media.name || 'Selected file';
        }
        
        // If this is near a preview image, update it
        const previewContainer = fileInput.closest('.form-group, .input-group, .field-group');
        if (previewContainer) {
            const preview = previewContainer.querySelector('.preview, .image-preview, [class*="preview"]');
            if (preview) {
                preview.style.backgroundImage = `url('${media.path}')`;
                preview.style.display = 'block';
            }
        }
        
        // Trigger a change event so other scripts know the input was updated
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }
    
    /**
     * Add media buttons to all file inputs
     */
    function addMediaButtons() {
        // Find all file inputs that don't already have a media button
        document.querySelectorAll('input[type="file"]:not([data-media-button-added])').
        forEach(function(fileInput) {
            // Mark this input as processed
            fileInput.setAttribute('data-media-button-added', 'true');
            
            // Ensure the input has an ID
            if (!fileInput.id) {
                fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
            }
            
            // Create the media library button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'media-library-button';
            button.textContent = 'Choose from Media Library';
            button.dataset.targetInput = fileInput.id;
            
            // Style the button to match the popup builder
            button.style.backgroundColor = '#C2E05D';
            button.style.color = '#333';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.padding = '8px 16px';
            button.style.margin = '8px 0';
            button.style.width = '100%';
            button.style.fontWeight = 'bold';
            button.style.cursor = 'pointer';
            button.style.display = 'block';
            
            // Insert the button after the file input's parent element 
            // (This ensures it shows up below the Choose file button)
            fileInput.parentElement.insertAdjacentElement('afterend', button);
            console.log('Added media button for:', fileInput.id);
        });
        
        // Look for all file upload sections without buttons
        document.querySelectorAll('.form-group, .input-group, .field-group').forEach(function(group) {
            // Skip if already processed or doesn't have file input
            if (group.getAttribute('data-media-button-added') || !group.querySelector('input[type="file"]')) {
                return;
            }
            
            // Mark as processed
            group.setAttribute('data-media-button-added', 'true');
            
            // Find the file input
            const fileInput = group.querySelector('input[type="file"]');
            if (!fileInput) return;
            
            // Ensure the input has an ID
            if (!fileInput.id) {
                fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
            }
            
            // Create the media library button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'media-library-button';
            button.textContent = 'Choose from Media Library';
            button.dataset.targetInput = fileInput.id;
            
            // Style the button to match the popup builder
            button.style.backgroundColor = '#C2E05D';
            button.style.color = '#333';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.padding = '8px 16px';
            button.style.margin = '8px 0';
            button.style.width = '100%';
            button.style.fontWeight = 'bold';
            button.style.cursor = 'pointer';
            button.style.display = 'block';
            
            // Insert the button at the end of the group
            group.appendChild(button);
            console.log('Added media button to form group');
        });
    }
    
    /**
     * Add media library buttons to popup layout sections
     */
    function addMediaLibraryButtons() {
        // 1. Find and mark all existing image upload sections
        document.querySelectorAll('input[type="file"]').forEach(fileInput => {
            // Skip if already processed
            if (fileInput.getAttribute('data-media-library-processed')) return;
            fileInput.setAttribute('data-media-library-processed', 'true');
            
            // Create media library button - styled exactly like screenshot example
            const mediaButton = document.createElement('button');
            mediaButton.type = 'button';
            mediaButton.className = 'media-library-button';
            mediaButton.textContent = 'Choose from Media Library';
            mediaButton.style.backgroundColor = '#C2E05D';
            mediaButton.style.color = '#333';
            mediaButton.style.border = 'none';
            mediaButton.style.borderRadius = '4px';
            mediaButton.style.padding = '8px 16px';
            mediaButton.style.fontWeight = 'bold';
            mediaButton.style.cursor = 'pointer';
            mediaButton.style.display = 'block';
            mediaButton.style.marginTop = '10px';
            mediaButton.style.width = '100%';
            mediaButton.dataset.action = 'open-media-library';
            
            // Ensure the file input has an ID for targeting
            if (!fileInput.id) {
                fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
            }
            mediaButton.dataset.targetInput = fileInput.id;
            
            // Add the button after the file input's container
            const fileInputParent = fileInput.parentElement;
            if (fileInputParent) {
                fileInputParent.insertAdjacentElement('afterend', mediaButton);
            }
            
            console.log('Added media library button to file input:', fileInput.id);
        });
        
        // 2. Direct targeting of the specific layout shown in screenshots
        document.querySelectorAll('div, section, article').forEach(container => {
            // If this container has already been processed, skip
            if (container.getAttribute('data-popup-upload-processed')) return;
            
            // Check if this container has upload-related text
            if (!container.textContent) return;
            
            // Looking specifically for the Upload Image section in the popup
            const hasUploadText = container.textContent.includes('Upload Image') || 
                                 container.textContent.includes('Image Upload') ||
                                 (container.textContent.includes('PNG') && 
                                  container.textContent.includes('JPG'));
                                  
            // If not an upload section, skip
            if (!hasUploadText) return;
            
            // Check for an "Enable Image" toggle nearby
            const hasEnableImageToggle = container.textContent.includes('Enable Image');
            
            // Mark this container as processed
            container.setAttribute('data-popup-upload-processed', 'true');
            
            // If the container already has our media button, skip
            if (container.querySelector('.media-library-button, [data-action="open-media-library"]')) return;
            
            // Create a new media library button - styled EXACTLY like the screenshot
            const mediaLibraryButton = document.createElement('button');
            mediaLibraryButton.type = 'button';
            mediaLibraryButton.className = 'media-library-button';
            mediaLibraryButton.textContent = 'Choose from Media Library';
            mediaLibraryButton.style.backgroundColor = '#C2E05D';
            mediaLibraryButton.style.color = '#333';
            mediaLibraryButton.style.border = 'none';
            mediaLibraryButton.style.borderRadius = '4px';
            mediaLibraryButton.style.padding = '8px 16px';
            mediaLibraryButton.style.fontWeight = 'bold';
            mediaLibraryButton.style.cursor = 'pointer';
            mediaLibraryButton.style.display = 'block';
            mediaLibraryButton.style.marginTop = '10px';
            mediaLibraryButton.style.width = '100%';
            mediaLibraryButton.dataset.action = 'open-media-library';
            
            // Find any existing file input in this container
            const fileInput = container.querySelector('input[type="file"]');
            if (fileInput) {
                // If found, use its ID
                if (!fileInput.id) {
                    fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
                }
                mediaLibraryButton.dataset.targetInput = fileInput.id;
            }
            
            // IMPORTANT: Find the best place to insert the button
            // 1. After the file input container
            // 2. After the "Choose file" button
            // 3. At the end of the upload section
            
            let inserted = false;
            
            // Try to find the "Choose file" button or text
            const chooseFileText = Array.from(container.querySelectorAll('*')).find(el => 
                el.textContent && el.textContent.includes('Choose file'));
                
            if (chooseFileText) {
                const chooseFileContainer = chooseFileText.closest('div, label');
                if (chooseFileContainer) {
                    chooseFileContainer.insertAdjacentElement('afterend', mediaLibraryButton);
                    inserted = true;
                    console.log('Added media library button after Choose file button');
                }
            }
            
            // If no "Choose file" but found file input, insert after its container
            if (!inserted && fileInput) {
                const fileInputContainer = fileInput.closest('div, label');
                if (fileInputContainer) {
                    fileInputContainer.insertAdjacentElement('afterend', mediaLibraryButton);
                    inserted = true;
                    console.log('Added media library button after file input container');
                }
            }
            
            // Fallback: Insert at the end of the section
            if (!inserted) {
                container.appendChild(mediaLibraryButton);
                console.log('Added media library button at end of upload section');
            }
        });
        
        // 3. Special targeting for Layout & Image tab
        document.querySelectorAll('a, button, [role="tab"]').forEach(tab => {
            if (!tab.textContent || !tab.textContent.includes('Layout & Image')) return;
            
            // Found the Layout & Image tab, now look for its content panel
            let panel = null;
            
            // Try to find the panel by various methods
            if (tab.getAttribute('aria-controls')) {
                // Standard tab pattern
                panel = document.getElementById(tab.getAttribute('aria-controls'));
            } else if (tab.getAttribute('data-target')) {
                // Bootstrap tab pattern
                panel = document.querySelector(tab.getAttribute('data-target'));
            } else if (tab.getAttribute('href') && tab.getAttribute('href').startsWith('#')) {
                // Anchor tab pattern
                panel = document.querySelector(tab.getAttribute('href'));
            }
            
            // If still not found, try looking for a visible panel
            if (!panel) {
                const possiblePanels = document.querySelectorAll('.tab-pane, .tab-content > div');
                for (const possiblePanel of possiblePanels) {
                    if (possiblePanel.style.display !== 'none' && possiblePanel.offsetParent !== null) {
                        panel = possiblePanel;
                        break;
                    }
                }
            }
            
            if (panel) {
                // Look for upload section in the panel
                const uploadSection = Array.from(panel.querySelectorAll('div')).find(div => 
                    div.textContent && div.textContent.includes('Upload Image'));
                    
                if (uploadSection && !uploadSection.getAttribute('data-media-library-processed')) {
                    uploadSection.setAttribute('data-media-library-processed', 'true');
                    
                    // Create media library button
                    const mediaButton = document.createElement('button');
                    mediaButton.type = 'button';
                    mediaButton.className = 'media-library-button';
                    mediaButton.textContent = 'Choose from Media Library';
                    mediaButton.style.backgroundColor = '#C2E05D';
                    mediaButton.style.color = '#333';
                    mediaButton.style.border = 'none';
                    mediaButton.style.borderRadius = '4px';
                    mediaButton.style.padding = '8px 16px';
                    mediaButton.style.fontWeight = 'bold';
                    mediaButton.style.cursor = 'pointer';
                    mediaButton.style.display = 'block';
                    mediaButton.style.marginTop = '10px';
                    mediaButton.style.width = '100%';
                    mediaButton.dataset.action = 'open-media-library';
                    
                    // Find file input in upload section
                    const fileInput = uploadSection.querySelector('input[type="file"]');
                    if (fileInput) {
                        if (!fileInput.id) {
                            fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
                        }
                        mediaButton.dataset.targetInput = fileInput.id;
                    }
                    
                    // Insert after file input or at end of section
                    if (fileInput) {
                        fileInput.parentElement.insertAdjacentElement('afterend', mediaButton);
                    } else {
                        uploadSection.appendChild(mediaButton);
                    }
                    
                    console.log('Added media library button to Layout & Image tab panel');
                }
            }
        });
    }
    
    /**
     * Handle clicks on media library buttons
     * Uses event delegation for better performance
     */
    function handleMediaButtonClick(event) {
        // Check if a media library button was clicked
        if (event.target.classList.contains('media-library-button') || 
            event.target.dataset.action === 'open-media-library') {
            
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Media library button clicked');
            
            // Get the target input ID
            const targetInputId = event.target.dataset.targetInput;
            
            // Open the media selection modal
            openMediaSelectionModal(targetInputId);
        }
    }
    
    /**
     * Handle the specific upload sections shown in the screenshots
     * Replaces file upload with media library button while keeping Enable Image toggle
     */
    function addMediaButtonsToUploadSections() {
        // DIRECT TARGETING for the exact UI shown in screenshots
        // Strategy 1: Use the most specific targeting possible for the "Image Upload" section
        document.querySelectorAll('div').forEach(el => {
            // Skip if the element has no children
            if (!el.children || el.children.length === 0) return;
            
            // Look for a section that contains both "Image Upload" label and a file input
            const hasImageUploadText = el.textContent && (
                el.textContent.includes('Upload Image') || 
                el.textContent.includes('Image Upload') ||
                el.textContent.toLowerCase().includes('choose file') ||
                el.textContent.includes('(PNG, GIF, JPG supported)')
            );
            
            // If this element doesn't have upload text, skip it
            if (!hasImageUploadText) return;
            
            // Skip if already processed
            if (el.getAttribute('data-media-library-processed')) return;
            el.setAttribute('data-media-library-processed', 'true');
            
            console.log('Found Image Upload section that matches screenshot');
            
            // Look for file input in this element or its children
            const fileInput = el.querySelector('input[type="file"]');
            if (fileInput) {
                // Create a new button with the exact style from the screenshot
                const mediaButton = document.createElement('button');
                mediaButton.type = 'button';
                mediaButton.className = 'media-library-button';
                mediaButton.textContent = 'Choose from Media Library';
                mediaButton.style.backgroundColor = '#C2E05D';
                mediaButton.style.color = '#333';
                mediaButton.style.border = 'none';
                mediaButton.style.borderRadius = '4px';
                mediaButton.style.padding = '8px 16px';
                mediaButton.style.fontWeight = 'bold';
                mediaButton.style.cursor = 'pointer';
                mediaButton.style.display = 'block';
                mediaButton.style.marginTop = '10px';
                mediaButton.style.width = '100%';
                
                // Store the file input ID
                if (!fileInput.id) {
                    fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
                }
                mediaButton.setAttribute('data-target-input', fileInput.id);
                
                // Create a preview container
                const previewContainer = document.createElement('div');
                previewContainer.className = 'media-preview-container';
                previewContainer.style.marginTop = '10px';
                
                // Add a preview element
                const preview = document.createElement('div');
                preview.className = 'selected-media-preview';
                preview.style.display = 'none'; // Initially hidden
                preview.style.width = '100%';
                preview.style.height = '150px';
                preview.style.backgroundColor = '#2c303a'; // Match dark theme in screenshot
                preview.style.backgroundSize = 'contain';
                preview.style.backgroundPosition = 'center';
                preview.style.backgroundRepeat = 'no-repeat';
                preview.style.borderRadius = '4px';
                preview.style.marginBottom = '5px';
                previewContainer.appendChild(preview);
                
                // Add filename display
                const filenameDisplay = document.createElement('div');
                filenameDisplay.className = 'selected-media-filename';
                filenameDisplay.style.fontSize = '14px';
                filenameDisplay.style.color = '#fff';
                filenameDisplay.style.display = 'none';
                previewContainer.appendChild(filenameDisplay);
                
                // Save the file input for form submission but hide it
                // IMPORTANT: Don't remove it from DOM to preserve form functionality
                fileInput.style.display = 'none';
                
                // Insert our button after the file input's container
                // Using insertBefore + nextSibling to simulate insertAfter
                const fileInputParent = fileInput.parentElement;
                if (fileInputParent) {
                    // Insert right after the file input container
                    fileInputParent.parentNode.insertBefore(mediaButton, fileInputParent.nextSibling);
                    fileInputParent.parentNode.insertBefore(previewContainer, mediaButton.nextSibling);
                } else {
                    // Fallback - insert after file input directly
                    fileInput.parentNode.insertBefore(mediaButton, fileInput.nextSibling);
                    fileInput.parentNode.insertBefore(previewContainer, mediaButton.nextSibling);
                }
                
                console.log('Added media library button to replace file upload');
            } else {
                // No file input, but still add our button at the end of the section
                const mediaButton = document.createElement('button');
                mediaButton.type = 'button';
                mediaButton.className = 'media-library-button';
                mediaButton.textContent = 'Choose from Media Library';
                mediaButton.style.backgroundColor = '#C2E05D';
                mediaButton.style.color = '#333';
                mediaButton.style.border = 'none';
                mediaButton.style.borderRadius = '4px';
                mediaButton.style.padding = '8px 16px';
                mediaButton.style.width = '100%';
                mediaButton.style.fontWeight = 'bold';
                mediaButton.style.cursor = 'pointer';
                mediaButton.style.marginTop = '10px';
                
                // Find a good place to insert the button
                const lastChild = el.lastElementChild;
                if (lastChild) {
                    el.insertBefore(mediaButton, null); // Append to end
                } else {
                    el.appendChild(mediaButton);
                }
                
                console.log('Added media library button to Image Upload section');
            }
        });
        
        // STRATEGY 2: Target elements with "Upload Image" text or image-related messages
        document.querySelectorAll('h3, h4, p, div, label, span').forEach(el => {
            // Skip if not text related to image upload
            if (!el.textContent) return;
            const text = el.textContent.toLowerCase();
            
            if (!text.includes('upload image') && 
                !text.includes('image upload') && 
                !text.includes('png') && 
                !text.includes('jpg') && 
                !text.includes('upload') && 
                !text.includes('image upload')) {
                return;
            }
            
            // Find the parent element that would contain the file input
            let uploadContainer = el.closest('div');
            if (!uploadContainer) return;
            
            // Skip if already processed
            if (uploadContainer.getAttribute('data-media-library-processed')) return;
            uploadContainer.setAttribute('data-media-library-processed', 'true');
            
            // Find file input in this container
            const fileInput = uploadContainer.querySelector('input[type="file"]');
            if (!fileInput) return;
            
            // Create media library button
            const mediaButton = document.createElement('button');
            mediaButton.type = 'button';
            mediaButton.className = 'media-library-button';
            mediaButton.textContent = 'Choose from Media Library';
            mediaButton.style.backgroundColor = '#C2E05D';
            mediaButton.style.color = '#333';
            mediaButton.style.border = 'none';
            mediaButton.style.borderRadius = '4px';
            mediaButton.style.padding = '8px 16px';
            mediaButton.style.fontWeight = 'bold';
            mediaButton.style.cursor = 'pointer';
            mediaButton.style.display = 'block';
            mediaButton.style.marginTop = '10px';
            mediaButton.style.width = '100%';
            
            // Save reference to file input
            if (!fileInput.id) {
                fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
            }
            mediaButton.setAttribute('data-target-input', fileInput.id);
            
            // Keep file input but hide it
            fileInput.style.display = 'none';
            
            // Insert button after file input
            fileInput.parentNode.insertBefore(mediaButton, fileInput.nextSibling);
            
            console.log('Added media library button to text-matched upload section');
        });
        
        // STRATEGY 3: Look specifically for the combination of "Enable Image" toggle and file input
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            // Find checkboxes with labels containing "Enable Image"
            const label = checkbox.closest('label') || 
                        document.querySelector(`label[for="${checkbox.id}"]`);
                        
            if (!label || !label.textContent || !label.textContent.includes('Enable Image')) return;
            
            // Find the closest container that might have the file input
            const container = checkbox.closest('div');
            if (!container) return;
            
            // Skip if already processed
            if (container.getAttribute('data-media-library-processed')) return;
            container.setAttribute('data-media-library-processed', 'true');
            
            console.log('Found Enable Image toggle, looking for upload section');
            
            // Look for file input within the same container or following siblings
            const fileInput = findFileInputAfterElement(checkbox);
            if (!fileInput) return;
            
            // Create media library button
            const mediaButton = document.createElement('button');
            mediaButton.type = 'button';
            mediaButton.className = 'media-library-button';
            mediaButton.textContent = 'Choose from Media Library';
            mediaButton.style.backgroundColor = '#C2E05D';
            mediaButton.style.color = '#333';
            mediaButton.style.border = 'none';
            mediaButton.style.borderRadius = '4px';
            mediaButton.style.padding = '8px 16px';
            mediaButton.style.fontWeight = 'bold';
            mediaButton.style.cursor = 'pointer';
            mediaButton.style.display = 'block';
            mediaButton.style.marginTop = '10px';
            mediaButton.style.width = '100%';
            
            // Save reference to file input
            if (!fileInput.id) {
                fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
            }
            mediaButton.setAttribute('data-target-input', fileInput.id);
            
            // Insert button after file input
            fileInput.parentNode.insertBefore(mediaButton, fileInput.nextSibling);
            
            console.log('Added media library button after Enable Image toggle and file input');
        });
    }
    
    /**
     * Helper function to find a file input following an element
     * @param {HTMLElement} startElement - Element to start search from
     * @returns {HTMLElement|null} - File input or null if not found
     */
    function findFileInputAfterElement(startElement) {
        // First check if there's a file input in the same parent
        const parent = startElement.parentElement;
        if (parent) {
            // Check all siblings that come after the start element
            let sibling = startElement.nextElementSibling;
            while (sibling) {
                const fileInput = sibling.querySelector('input[type="file"]');
                if (fileInput) return fileInput;
                
                // If it has the text "Choose file" it might be related to file upload
                if (sibling.textContent && sibling.textContent.includes('Choose file')) {
                    const nestedInput = sibling.querySelector('input[type="file"]');
                    if (nestedInput) return nestedInput;
                }
                
                sibling = sibling.nextElementSibling;
            }
            
            // Check parent siblings
            let parentSibling = parent.nextElementSibling;
            while (parentSibling) {
                const fileInput = parentSibling.querySelector('input[type="file"]');
                if (fileInput) return fileInput;
                parentSibling = parentSibling.nextElementSibling;
            }
        }
        
        // Look in nearby elements in same container
        const container = startElement.closest('div');
        if (container) {
            const fileInputs = container.querySelectorAll('input[type="file"]');
            if (fileInputs.length > 0) return fileInputs[0];
        }
        
        return null;
    }
    
    /**
     * Set up a DOM mutation watcher to detect popups being created
     */
    function setupDomWatcher() {
        // Create a mutation observer to watch for popup elements being added to the DOM
        const observer = new MutationObserver(function(mutations) {
            let shouldInject = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Check for popup-related nodes being added
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            // Look for typical popup elements or file inputs
                            if (node.querySelector('input[type="file"]') || 
                                node.tagName === 'FORM' || 
                                node.classList.contains('popup') || 
                                node.classList.contains('modal') ||
                                node.id && (node.id.includes('popup') || node.id.includes('modal'))) {
                                shouldInject = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldInject) {
                // Wait a short period for popup to fully render
                setTimeout(injectMediaButtons, 100);
            }
        });
        
        // Start observing the entire document
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('DOM watcher set up to detect popups');
    }
    
    /**
     * Add CSS styles for the media library integration
     */
    function addMediaLibraryStyles() {
        // Don't add styles if they already exist
        if (document.getElementById('media-library-styles')) return;
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'media-library-styles';
        style.textContent = `
            /* Media library button styles */
            .media-library-button {
                background-color: #C2E05D;
                color: #333;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                margin-top: 10px;
                width: 100%;
                font-weight: bold;
                cursor: pointer;
                display: block;
                transition: background-color 0.2s ease;
            }
            
            .media-library-button:hover {
                background-color: #b2cc4d;
            }
            
            /* Media selection modal styles */
            .media-selection-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .media-selection-content {
                background-color: #1e2229;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .media-selection-header {
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .media-selection-title {
                margin: 0;
                color: #fff;
                font-size: 20px;
            }
            
            .media-selection-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 24px;
                cursor: pointer;
            }
            
            .media-selection-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }
            
            .media-selection-filters {
                margin-bottom: 20px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .media-selection-filters select,
            .media-selection-filters input {
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #333;
                background-color: #2c3038;
                color: #fff;
            }
            
            .media-selection-filters input {
                flex: 1;
                min-width: 200px;
            }
            
            .media-selection-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .media-item {
                border-radius: 4px;
                overflow: hidden;
                background-color: #2c3038;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .media-item:hover {
                transform: translateY(-4px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .media-item-thumbnail {
                height: 120px;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-color: #1e2229;
                position: relative;
            }
            
            .media-item-title {
                padding: 8px;
                font-size: 12px;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            /* Media preview styles */
            .media-preview-container {
                margin-top: 10px;
            }
            
            .selected-media-preview {
                width: 100%;
                height: 150px;
                background-color: #2c303a;
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 4px;
                margin-bottom: 5px;
            }
            
            .selected-media-filename {
                font-size: 14px;
                color: #fff;
            }
        `;
        
        // Add to document head
        document.head.appendChild(style);
        console.log('Added media library styles');
    }
    
    /**
     * Directly inject media buttons into popups with file inputs
     */
    function injectMediaButtons() {
        console.log('Checking for popups to inject media buttons');
        
        // Find all popups and modals currently in the DOM
        const popups = document.querySelectorAll('.popup, .modal, [id*="popup"], [id*="modal"], [class*="popup"], [class*="modal"], form');
        
        popups.forEach(popup => {
            // Look for file inputs in this popup
            const fileInputs = popup.querySelectorAll('input[type="file"]');
            if (fileInputs.length === 0) return;
            
            console.log('Found popup with file inputs:', popup);
            
            // Process each file input in the popup
            fileInputs.forEach(fileInput => {
                // Skip if already processed
                if (fileInput.getAttribute('data-media-enhanced')) return;
                
                // Ensure the input has an ID
                if (!fileInput.id) {
                    fileInput.id = 'file-input-' + Math.random().toString(36).substr(2, 9);
                }
                
                // Mark as processed
                fileInput.setAttribute('data-media-enhanced', 'true');
                
                // Get the input's parent element
                const parent = fileInput.parentElement;
                
                // Create media library button (styled to match popup UI)
                const mediaButton = document.createElement('button');
                mediaButton.type = 'button';
                mediaButton.className = 'media-library-btn';
                mediaButton.textContent = 'Media Library';
                mediaButton.setAttribute('data-target-input', fileInput.id);
                
                // Add the button right after the file input
                if (fileInput.nextSibling) {
                    parent.insertBefore(mediaButton, fileInput.nextSibling);
                } else {
                    parent.appendChild(mediaButton);
                }
                
                console.log('Added media library button for file input:', fileInput.id);
            });
            
            // Also find any upload sections without direct file inputs
            const uploadSections = Array.from(popup.querySelectorAll('*')).filter(el => {
                if (!el.textContent) return false;
                const text = el.textContent.toLowerCase();
                return (text.includes('upload') || text.includes('image')) && 
                       !el.querySelector('.media-library-section-btn');
            });
            
            uploadSections.forEach(section => {
                // Create a section-level media button
                const sectionButton = document.createElement('button');
                sectionButton.type = 'button';
                sectionButton.className = 'media-library-section-btn';
                sectionButton.textContent = 'Select from Media Library';
                sectionButton.style.width = '100%';
                sectionButton.style.padding = '10px';
                sectionButton.style.margin = '10px 0';
                
                // Find associated file input if any
                const relatedInput = section.querySelector('input[type="file"]') || 
                                   popup.querySelector('input[type="file"]');
                                   
                if (relatedInput) {
                    sectionButton.setAttribute('data-target-input', relatedInput.id);
                }
                
                // Add to section
                section.appendChild(sectionButton);
                
                console.log('Added section media button to:', section.tagName);
            });
        });
        
        // Special case: direct targeting for popup builder's specific layout 
        // This targets elements with class/ID containing "upload" or "image"
        document.querySelectorAll('[class*="upload"], [class*="image"], [id*="upload"], [id*="image"]').forEach(section => {
            // Skip if already has our button
            if (section.querySelector('.media-library-direct-btn')) return;
            
            // Check if this section might be related to file uploads
            const hasFileInput = section.querySelector('input[type="file"]');
            const hasImageText = section.textContent && (
                section.textContent.toLowerCase().includes('image') || 
                section.textContent.toLowerCase().includes('upload')
            );
            
            if (!hasFileInput && !hasImageText) return;
            
            // Create a highly visible button
            const directButton = document.createElement('button');
            directButton.type = 'button';
            directButton.className = 'media-library-direct-btn';
            directButton.textContent = 'Use Media Library';
            directButton.style.display = 'block';
            directButton.style.width = '100%';
            directButton.style.padding = '12px';
            directButton.style.margin = '10px 0';
            directButton.style.backgroundColor = '#C2E05D'; // Match your popup style
            directButton.style.color = '#333';
            directButton.style.border = 'none';
            directButton.style.borderRadius = '4px';
            directButton.style.fontWeight = 'bold';
            directButton.style.cursor = 'pointer';
            
            // Find any file input to associate with
            const fileInput = section.querySelector('input[type="file"]') || 
                            section.parentElement.querySelector('input[type="file"]');
                            
            if (fileInput && fileInput.id) {
                directButton.setAttribute('data-target-input', fileInput.id);
            }
            
            // Add to the section
            section.appendChild(directButton);
            
            console.log('Added direct media button to upload/image section');
        });
    }
    
    /**
     * Add media button styles to page
     */
    function addMediaButtonStyles() {
        // Check if styles already exist
        if (document.getElementById('popup-media-styles')) return;
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'popup-media-styles';
        style.textContent = `
            /* Media library buttons */
            .media-library-btn,
            .media-library-section-btn,
            .media-library-direct-btn,
            .global-media-library-btn {
                background-color: #C2E05D;
                color: #333;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                margin: 5px 0;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            .media-library-btn:hover,
            .media-library-section-btn:hover,
            .media-library-direct-btn:hover,
            .global-media-library-btn:hover {
                background-color: #b2d04d;
            }
            
            /* Media selection feedback */
            .media-selection-feedback {
                color: #4CAF50;
                font-weight: bold;
                margin-top: 5px;
            }
            
            /* Animation for selection feedback */
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
        console.log('Added media button styles');
    }
    
    /**
     * Add CSS styles for media select buttons
     */
    function addMediaSelectStyles() {
        if (document.getElementById('popup-media-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'popup-media-styles';
        style.textContent = `
            .media-input-wrapper {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 10px 0;
            }
            
            .media-library-select-btn {
                padding: 8px 12px;
                background-color: #0d6efd;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .media-library-select-btn:hover {
                background-color: #0b5ed7;
            }
            
            /* Styles for the media selection modal */
            .media-selection-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            
            .media-selection-modal.show {
                display: flex;
            }
            
            .media-selection-dialog {
                background-color: #222;
                width: 90%;
                max-width: 900px;
                height: 90vh;
                border-radius: 8px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .media-selection-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #444;
                background-color: #333;
            }
            
            .media-selection-title {
                margin: 0;
                font-size: 18px;
                color: white;
            }
            
            .media-selection-close {
                background: none;
                border: none;
                font-size: 24px;
                color: white;
                cursor: pointer;
            }
            
            .media-selection-content {
                flex: 1;
                overflow: auto;
                padding: 20px;
                background-color: #222;
            }
            
            .media-selection-footer {
                padding: 15px 20px;
                border-top: 1px solid #444;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                background-color: #333;
            }
            
            .media-selection-button {
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .media-selection-cancel {
                background-color: #444;
                color: white;
                border: none;
            }
            
            .media-selection-select {
                background-color: #0d6efd;
                color: white;
                border: none;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Set up event listeners for media selection
     */
    function setupMediaSelectionEvents() {
        // Listen for clicks on media library select buttons
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('media-library-select-btn') || 
                event.target.closest('.media-library-select-btn')) {
                
                const button = event.target.classList.contains('media-library-select-btn') ? 
                    event.target : event.target.closest('.media-library-select-btn');
                
                const targetInputId = button.getAttribute('data-target-input');
                openMediaSelectionModal(targetInputId);
            }
        });
    }
    
    /**
     * Open the media selection modal
     * @param {string} targetInputId - ID of the input to receive selected media
     */
    function openMediaSelectionModal(targetInputId) {
        // Create the modal if it doesn't exist
        let modal = document.getElementById('media-selection-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'media-selection-modal';
            modal.className = 'media-selection-modal';
            
            modal.innerHTML = `
                <div class="media-selection-dialog">
                    <div class="media-selection-header">
                        <h3 class="media-selection-title">Select Media</h3>
                        <button type="button" class="media-selection-close">&times;</button>
                    </div>
                    <div class="media-selection-content" id="media-selection-content">
                        <!-- Media library content will be loaded here -->
                    </div>
                    <div class="media-selection-footer">
                        <button type="button" class="media-selection-button media-selection-cancel">Cancel</button>
                        <button type="button" class="media-selection-button media-selection-select" disabled>Select</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            const closeButton = modal.querySelector('.media-selection-close');
            const cancelButton = modal.querySelector('.media-selection-cancel');
            const selectButton = modal.querySelector('.media-selection-select');
            
            closeButton.addEventListener('click', closeMediaSelectionModal);
            cancelButton.addEventListener('click', closeMediaSelectionModal);
            selectButton.addEventListener('click', function() {
                if (mediaSelectionCallback) {
                    mediaSelectionCallback();
                }
                closeMediaSelectionModal();
            });
            
            // Close on backdrop click
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    closeMediaSelectionModal();
                }
            });
            
            // Close on ESC key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && modal.classList.contains('show')) {
                    closeMediaSelectionModal();
                }
            });
        }
        
        // Set the current target input
        modal.setAttribute('data-target-input', targetInputId);
        
        // Load media library content
        loadMediaLibraryContent();
        
        // Show the modal
        modal.classList.add('show');
    }
    
    /**
     * Close the media selection modal
     */
    function closeMediaSelectionModal() {
        const modal = document.getElementById('media-selection-modal');
        if (modal) {
            modal.classList.remove('show');
            mediaSelectionCallback = null;
        }
    }
    
    /**
     * Load media library content into the selection modal
     */
    function loadMediaLibraryContent() {
        const contentContainer = document.getElementById('media-selection-content');
        if (!contentContainer) return;
        
        // Check if we have access to the media library functionality
        if (typeof window.mediaFolders === 'undefined' || 
            typeof window.renderFilteredMedia !== 'function') {
            
            contentContainer.innerHTML = `
                <div class="media-library-error">
                    <p>Media library functionality is not available. Please visit the Dashboard to manage media.</p>
                </div>
            `;
            return;
        }
        
        // Create a clone of the media library UI
        const mediaItems = getMediaLibraryItems();
        
        // Render the media items
        renderMediaSelectionItems(contentContainer, mediaItems);
    }
    
    /**
     * Get media library items from localStorage
     * @returns {Array} Array of media items
     */
    function getMediaLibraryItems() {
        try {
            // Get media library from localStorage
            const mediaLibraryJson = localStorage.getItem('mediaLibrary');
            if (!mediaLibraryJson) return [];
            
            const mediaLibrary = JSON.parse(mediaLibraryJson);
            return Array.isArray(mediaLibrary) ? mediaLibrary : [];
        } catch (error) {
            console.error('Error loading media library:', error);
            return [];
        }
    }
    
    /**
     * Render media items for selection
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Media items array
     */
    function renderMediaSelectionItems(container, items) {
        // Create filter controls
        const filterControls = document.createElement('div');
        filterControls.className = 'media-selection-filters';
        filterControls.innerHTML = `
            <div class="media-selection-filter-row">
                <select class="media-folder-filter">
                    <option value="all">All Folders</option>
                    ${window.mediaFolders.map(folder => 
                        `<option value="${folder.id}">${folder.name}</option>`
                    ).join('')}
                </select>
                <select class="media-type-filter">
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                </select>
            </div>
        `;
        
        // Create grid container for items
        const gridContainer = document.createElement('div');
        gridContainer.className = 'media-selection-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        gridContainer.style.gap = '15px';
        gridContainer.style.marginTop = '20px';
        
        // Render items
        if (items.length === 0) {
            gridContainer.innerHTML = '<div class="no-media">No media items found. Upload media from the Dashboard.</div>';
        } else {
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'media-selection-item';
                itemElement.dataset.id = item.id;
                itemElement.dataset.type = item.type || 'image';
                itemElement.dataset.url = item.url;
                
                // Style the item
                itemElement.style.border = '2px solid transparent';
                itemElement.style.borderRadius = '4px';
                itemElement.style.overflow = 'hidden';
                itemElement.style.cursor = 'pointer';
                itemElement.style.backgroundColor = '#333';
                itemElement.style.aspectRatio = '1';
                
                // Create thumbnail
                if (item.type === 'video') {
                    itemElement.innerHTML = `
                        <video src="${item.url}" muted loop style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; text-align: center;">
                            ${item.name || 'Video'}
                        </div>
                    `;
                } else {
                    itemElement.innerHTML = `
                        <img src="${item.url}" alt="${item.name || 'Image'}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; text-align: center;">
                            ${item.name || 'Image'}
                        </div>
                    `;
                }
                
                // Add selection functionality
                itemElement.addEventListener('click', function() {
                    // Remove selected class from all items
                    gridContainer.querySelectorAll('.media-selection-item').forEach(el => {
                        el.style.border = '2px solid transparent';
                    });
                    
                    // Add selected class to this item
                    this.style.border = '2px solid #0d6efd';
                    
                    // Enable the select button
                    const selectButton = document.querySelector('.media-selection-select');
                    if (selectButton) {
                        selectButton.disabled = false;
                    }
                    
                    // Set the callback function
                    mediaSelectionCallback = function() {
                        const targetInputId = document.getElementById('media-selection-modal')
                            .getAttribute('data-target-input');
                        const targetInput = document.getElementById(targetInputId);
                        
                        if (targetInput) {
                            // Create a File object from the media URL
                            const mediaItem = items.find(i => i.id === itemElement.dataset.id);
                            
                            if (mediaItem) {
                                // If this is an input[type=file], we need to handle it differently
                                if (targetInput.type === 'file') {
                                    // We can't set the value directly, but we can show a preview next to it
                                    const previewId = targetInputId + '-preview';
                                    let preview = document.getElementById(previewId);
                                    
                                    if (!preview) {
                                        preview = document.createElement('div');
                                        preview.id = previewId;
                                        preview.className = 'media-input-preview';
                                        preview.style.marginTop = '10px';
                                        preview.style.maxWidth = '100%';
                                        preview.style.borderRadius = '4px';
                                        preview.style.overflow = 'hidden';
                                        
                                        targetInput.parentNode.appendChild(preview);
                                    }
                                    
                                    if (mediaItem.type === 'video') {
                                        preview.innerHTML = `
                                            <video src="${mediaItem.url}" controls style="max-width: 100%; max-height: 200px;"></video>
                                            <div>Selected: ${mediaItem.name || 'Video'}</div>
                                        `;
                                    } else {
                                        preview.innerHTML = `
                                            <img src="${mediaItem.url}" alt="${mediaItem.name || 'Image'}" style="max-width: 100%; max-height: 200px;">
                                            <div>Selected: ${mediaItem.name || 'Image'}</div>
                                        `;
                                    }
                                    
                                    // Store the selection in a data attribute
                                    targetInput.setAttribute('data-media-selection', JSON.stringify(mediaItem));
                                    
                                    // Dispatch a custom event
                                    const event = new CustomEvent('mediaSelected', {
                                        bubbles: true,
                                        detail: mediaItem
                                    });
                                    targetInput.dispatchEvent(event);
                                } else {
                                    // For other input types, set the value to the URL
                                    targetInput.value = mediaItem.url;
                                    
                                    // Trigger change event
                                    const event = new Event('change', { bubbles: true });
                                    targetInput.dispatchEvent(event);
                                }
                            }
                        }
                    };
                });
                
                gridContainer.appendChild(itemElement);
            });
        }
        
        // Clear and append to container
        container.innerHTML = '';
        container.appendChild(filterControls);
        container.appendChild(gridContainer);
        
        // Set up filter functionality
        setupFilterEventListeners(filterControls, gridContainer, items);
    }
    
    /**
     * Set up event listeners for media filters
     * @param {HTMLElement} filterControls - Filter controls container
     * @param {HTMLElement} gridContainer - Grid container with media items
     * @param {Array} allItems - All media items
     */
    function setupFilterEventListeners(filterControls, gridContainer, allItems) {
        const folderFilter = filterControls.querySelector('.media-folder-filter');
        const typeFilter = filterControls.querySelector('.media-type-filter');
        
        if (!folderFilter || !typeFilter) return;
        
        const applyFilters = function() {
            const folderValue = folderFilter.value;
            const typeValue = typeFilter.value;
            
            const filteredItems = allItems.filter(item => {
                const folderMatch = folderValue === 'all' || item.folderId === folderValue;
                const typeMatch = typeValue === 'all' || item.type === typeValue;
                return folderMatch && typeMatch;
            });
            
            // Update grid
            const itemElements = gridContainer.querySelectorAll('.media-selection-item');
            itemElements.forEach(el => {
                const id = el.dataset.id;
                const found = filteredItems.some(item => item.id === id);
                el.style.display = found ? 'block' : 'none';
            });
            
            // Show "no results" message if needed
            let noResultsMsg = gridContainer.querySelector('.no-results-message');
            
            if (filteredItems.length === 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.style.gridColumn = '1 / -1';
                    noResultsMsg.style.padding = '20px';
                    noResultsMsg.style.textAlign = 'center';
                    noResultsMsg.style.color = '#ccc';
                    gridContainer.appendChild(noResultsMsg);
                }
                noResultsMsg.textContent = 'No media items match your filter criteria.';
                noResultsMsg.style.display = 'block';
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        };
        
        folderFilter.addEventListener('change', applyFilters);
        typeFilter.addEventListener('change', applyFilters);
    }
    
    /**
     * Setup event listeners for the media selection process
     */
    function setupMediaSelectionEvents() {
        // Delegate event listener for all our media library buttons
        document.addEventListener('click', function(event) {
            // Match any of our media library button classes
            if (event.target.matches(
                '.media-library-select-btn, .media-library-button, .media-library-btn-section, ' +
                '.media-library-main-button, .media-library-btn, .media-library-direct-btn, ' +
                '.media-library-section-btn, .layout-media-button, .global-media-library-btn'
            )) {
                console.log('Media library button clicked:', event.target.className);
                
                // Get the target input ID from the button
                const targetInput = event.target.getAttribute('data-target-input');
                
                // Check if this is a layout section button
                const isLayoutButton = event.target.classList.contains('layout-media-button');
                
                // Store the button reference for callbacks
                const clickedButton = event.target;
                
                // If we have a target input ID, open the media library for this input
                if (targetInput) {
                    const inputElement = document.getElementById(targetInput);
                    if (inputElement) {
                        console.log('Opening media library for input:', targetInput);
                        
                        // For layout buttons, we want to update preview areas
                        if (isLayoutButton) {
                            openMediaLibrary(targetInput, (selectedMedia) => {
                                // After selection, update any preview areas
                                updateLayoutImagePreview(clickedButton, selectedMedia);
                            });
                        } else {
                            openMediaLibrary(targetInput);
                        }
                    } else {
                        console.warn('Target input not found:', targetInput);
                        // If specific input not found, just open the media library generally
                        openMediaLibrary(null, isLayoutButton ? 
                            (selectedMedia) => {
                                updateLayoutImagePreview(clickedButton, selectedMedia);
                            } : null
                        );
                    }
                } else {
                    console.log('No target input specified, opening general media library');
                    // If it's a layout button, still handle the preview
                    openMediaLibrary(null, isLayoutButton ? 
                        (selectedMedia) => {
                            updateLayoutImagePreview(clickedButton, selectedMedia);
                        } : null
                    );
                }
                
                // Prevent default button action
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }
    
    /**
     * Update the image preview in layout sections after media selection
     * @param {HTMLElement} button - The button that was clicked
     * @param {Object} media - The selected media object
     */
    function updateLayoutImagePreview(button, media) {
        if (!button || !media) return;
        
        console.log('Updating layout image preview with:', media);
        
        // Find the section containing the button
        const section = button.closest('[data-media-layout-processed]');
        if (!section) return;
        
        // Find or create a preview element
        let preview = section.querySelector('.layout-image-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'layout-image-preview';
            preview.style.marginTop = '10px';
            preview.style.width = '100%';
            preview.style.height = '150px';
            preview.style.backgroundColor = '#f5f5f5';
            preview.style.backgroundSize = 'contain';
            preview.style.backgroundPosition = 'center';
            preview.style.backgroundRepeat = 'no-repeat';
            preview.style.border = '1px solid #ddd';
            preview.style.borderRadius = '4px';
            section.appendChild(preview);
        }
        
        // Show the preview and set the background image
        preview.style.display = 'block';
        preview.style.backgroundImage = `url(${media.url || media.src || media.path})`;
        
        // Add a label showing the selected image
        let label = section.querySelector('.layout-image-label');
        if (!label) {
            label = document.createElement('div');
            label.className = 'layout-image-label';
            label.style.marginTop = '5px';
            label.style.fontSize = '12px';
            label.style.color = '#333';
            section.appendChild(label);
        }
        
        // Update the label text
        label.textContent = `Selected: ${media.name || media.title || 'Image'}`;
        
        // Store the selection data on the section for reference
        section.setAttribute('data-selected-media', JSON.stringify({
            url: media.url || media.src || media.path,
            name: media.name || media.title || 'Image',
            type: media.type || 'image',
            id: media.id || ''
        }));
        
        // If there's a nearby form, add a hidden input with the selection
        const form = section.closest('form');
        if (form) {
            // Create or update a hidden input with the selection
            let hiddenInput = form.querySelector('input[name="selectedLayoutImage"]');
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'selectedLayoutImage';
                form.appendChild(hiddenInput);
            }
            hiddenInput.value = media.url || media.src || media.path;
        }
        
        console.log('Layout image preview updated successfully');
    }
    
    /**
     * Open the media library and handle selection
     * @param {string} targetInputId - ID of the input that will receive the selected media
     * @param {Function} callback - Optional callback function that receives the selected media
     */
    function openMediaLibrary(targetInputId, callback) {
        console.log('Opening media library for target:', targetInputId);
        
        // Store the callback for after media selection
        const selectionCallback = callback;
        
        // Check if we already have a media library component available
        if (typeof MediaLibrary !== 'undefined' && MediaLibrary.openSelector) {
            // Use the existing media library component
            MediaLibrary.openSelector(function(selectedMedia) {
                // Handle the input update
                if (targetInputId) {
                    handleMediaSelection(selectedMedia, targetInputId);
                }
                
                // If we have a callback, call it with the selected media
                if (selectionCallback && typeof selectionCallback === 'function') {
                    selectionCallback(selectedMedia);
                }
            });
            return;
        }
        
        // If the system's MediaGallery is available, use that
        if (typeof MediaGallery !== 'undefined' && MediaGallery.openGallery) {
            MediaGallery.openGallery(function(selectedMedia) {
                // Handle the input update
                if (targetInputId) {
                    handleMediaSelection(selectedMedia, targetInputId);
                }
                
                // If we have a callback, call it with the selected media
                if (selectionCallback && typeof selectionCallback === 'function') {
                    selectionCallback(selectedMedia);
                }
            });
            return;
        }
        
        // Create our own media selection modal as a fallback
        createMediaSelectionModal(targetInputId, selectionCallback);
    }
    
    /**
     * Handle media selection from library
     * @param {Object} media - Selected media object
     * @param {string} targetInputId - ID of the input to receive the selected media
     */
    function handleMediaSelection(media, targetInputId) {
        if (!media) return;
        
        console.log('Media selected:', media);
        
        // Find the target input
        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) {
            console.error('Target input not found:', targetInputId);
            return;
        }
        
        // If it's a file input, we need to simulate a file selection
        if (targetInput.type === 'file') {
            // For file inputs, we can't directly set the value due to security restrictions
            // So we'll create a custom event and store the selected media in a data attribute
            targetInput.setAttribute('data-selected-media', JSON.stringify(media));
            
            // Trigger a custom event that the form can listen for
            const event = new CustomEvent('mediaSelected', {
                detail: { media: media, inputId: targetInputId }
            });
            targetInput.dispatchEvent(event);
            
            // Also dispatch to the document for global listeners
            document.dispatchEvent(event);
            
            // Visual feedback that media was selected
            const mediaName = media.name || media.title || 'Selected media';
            addSelectionFeedback(targetInput, mediaName);
        } else {
            // For other input types, we can set the value directly
            targetInput.value = media.url || media.src || media.path || '';
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            targetInput.dispatchEvent(event);
        }
        
        console.log('Media selection applied to input:', targetInputId);
    }
    
    /**
     * Add visual feedback that media was selected
     * @param {HTMLElement} input - The input element
     * @param {string} mediaName - Name of the selected media
     */
    function addSelectionFeedback(input, mediaName) {
        // Find or create a feedback element next to the input
        let feedbackEl = input.parentNode.querySelector('.media-selection-feedback');
        
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.className = 'media-selection-feedback';
            feedbackEl.style.marginTop = '5px';
            feedbackEl.style.color = '#4CAF50';
            feedbackEl.style.fontWeight = 'bold';
            
            // Add after the input
            if (input.nextSibling) {
                input.parentNode.insertBefore(feedbackEl, input.nextSibling);
            } else {
                input.parentNode.appendChild(feedbackEl);
            }
        }
        
        // Update the feedback message
        feedbackEl.textContent = '✓ Selected: ' + mediaName;
        
        // Temporarily highlight the feedback
        feedbackEl.style.animation = 'none';
        setTimeout(() => {
            feedbackEl.style.animation = 'pulse 1s';
        }, 10);
    }
    
    /**
     * Create a basic media selection modal
     * @param {string} targetInputId - ID of the input to receive selected media
     * @param {Function} callback - Optional callback function that receives the selected media
     */
    function createMediaSelectionModal(targetInputId, callback) {
        // Check if modal already exists
        let modal = document.getElementById('popup-media-selection-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'popup-media-selection-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
            modal.style.zIndex = '10000';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            
            // Create modal content
            const content = document.createElement('div');
            content.className = 'popup-media-modal-content';
            content.style.backgroundColor = '#fff';
            content.style.width = '80%';
            content.style.maxWidth = '1000px';
            content.style.maxHeight = '80vh';
            content.style.overflowY = 'auto';
            content.style.borderRadius = '8px';
            content.style.padding = '20px';
            content.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            
            // Add header with title and close button
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginBottom = '20px';
            
            const title = document.createElement('h2');
            title.textContent = 'Media Library';
            title.style.margin = '0';
            
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = function() {
                modal.remove();
            };
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            content.appendChild(header);
            
            // Add filter options
            const filterContainer = document.createElement('div');
            filterContainer.className = 'media-filter-container';
            filterContainer.style.marginBottom = '15px';
            filterContainer.style.display = 'flex';
            filterContainer.style.gap = '10px';
            filterContainer.style.flexWrap = 'wrap';
            
            // Type filter
            const typeFilter = document.createElement('select');
            typeFilter.className = 'media-type-filter';
            typeFilter.style.padding = '8px';
            typeFilter.style.borderRadius = '4px';
            typeFilter.style.border = '1px solid #ddd';
            
            // Add filter options
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All Media';
            typeFilter.appendChild(allOption);
            
            const imageOption = document.createElement('option');
            imageOption.value = 'image';
            imageOption.textContent = 'Images Only';
            typeFilter.appendChild(imageOption);
            
            const videoOption = document.createElement('option');
            videoOption.value = 'video';
            videoOption.textContent = 'Videos Only';
            typeFilter.appendChild(videoOption);
            
            filterContainer.appendChild(typeFilter);
            
            // Search input
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search media...';
            searchInput.className = 'media-search-input';
            searchInput.style.padding = '8px';
            searchInput.style.borderRadius = '4px';
            searchInput.style.border = '1px solid #ddd';
            searchInput.style.flexGrow = '1';
            filterContainer.appendChild(searchInput);
            
            content.appendChild(filterContainer);
            
            // Add media content container
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'popup-media-container';
            mediaContainer.style.display = 'grid';
            mediaContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
            mediaContainer.style.gap = '15px';
            content.appendChild(mediaContainer);
            
            // Add loading indicator
            const loading = document.createElement('div');
            loading.textContent = 'Loading media items...';
            loading.style.textAlign = 'center';
            loading.style.padding = '20px';
            mediaContainer.appendChild(loading);
            
            // Add to page
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Setup filter functionality
            typeFilter.addEventListener('change', function() {
                loadMediaItems(mediaContainer, targetInputId, callback, { 
                    typeFilter: this.value,
                    searchTerm: searchInput.value
                });
            });
            
            searchInput.addEventListener('input', function() {
                loadMediaItems(mediaContainer, targetInputId, callback, {
                    typeFilter: typeFilter.value,
                    searchTerm: this.value
                });
            });
            
            // Load media items
            loadMediaItems(mediaContainer, targetInputId, callback);
        }
    }
    
    /**
     * Load media items for the selection modal
     * @param {HTMLElement} container - Container to load media items into
     * @param {string} targetInputId - ID of the input to receive selected media
     * @param {Function} callback - Optional callback function that receives the selected media
     * @param {Object} filters - Optional filters for media items
     */
    function loadMediaItems(container, targetInputId, callback, filters = {}) {
        // Clear container
        container.innerHTML = '';
        
        // Get media items from localStorage
        let mediaItems = getMediaItems();
        
        if (!mediaItems || mediaItems.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;">No media items found. Upload some media first.</div>';
            return;
        }
        
        // Apply type filter if specified
        if (filters.typeFilter && filters.typeFilter !== 'all') {
            mediaItems = mediaItems.filter(item => {
                // Handle image filter
                if (filters.typeFilter === 'image') {
                    return item.type && item.type.includes('image') || 
                           item.url && (/\.(jpg|jpeg|png|gif|webp|svg)$/i).test(item.url);
                }
                // Handle video filter
                else if (filters.typeFilter === 'video') {
                    return item.type && item.type.includes('video') || 
                           item.url && (/\.(mp4|webm|mov|avi|wmv)$/i).test(item.url);
                }
                return true;
            });
        }
        
        // Apply search filter if specified
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
            const searchTerm = filters.searchTerm.trim().toLowerCase();
            mediaItems = mediaItems.filter(item => {
                const name = (item.name || item.title || '').toLowerCase();
                const description = (item.description || item.caption || '').toLowerCase();
                return name.includes(searchTerm) || description.includes(searchTerm);
            });
        }
        
        // Show message if no items match filters
        if (mediaItems.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:20px;">No media items match your filters.</div>';
            return;
        }
        
        // Sort items - newest first if date available
        mediaItems.sort((a, b) => {
            if (a.date && b.date) return new Date(b.date) - new Date(a.date);
            return 0;
        });
        
        // Render media items
        mediaItems.forEach(item => {
            const mediaCard = document.createElement('div');
            mediaCard.className = 'media-item-card';
            mediaCard.style.border = '1px solid #ddd';
            mediaCard.style.borderRadius = '4px';
            mediaCard.style.overflow = 'hidden';
            mediaCard.style.cursor = 'pointer';
            mediaCard.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            // Add hover effects
            mediaCard.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
            });
            
            mediaCard.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
            
            // Create thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.style.height = '120px';
            thumbnail.style.backgroundColor = '#f5f5f5';
            thumbnail.style.backgroundSize = 'cover';
            thumbnail.style.backgroundPosition = 'center';
            thumbnail.style.backgroundRepeat = 'no-repeat';
            
            // Set thumbnail based on media type
            if (item.type && item.type.includes('image') || item.url && (/\.(jpg|jpeg|png|gif|webp|svg)$/i).test(item.url)) {
                thumbnail.style.backgroundImage = `url(${item.url || item.src || item.path})`;
            } else if (item.type && item.type.includes('video') || item.url && (/\.(mp4|webm|mov|avi|wmv)$/i).test(item.url)) {
                thumbnail.style.backgroundImage = item.thumbnail ? 
                    `url(${item.thumbnail})` : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23666\' d=\'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z\'/%3E%3C/svg%3E")';
                
                // Add video play icon
                const playIcon = document.createElement('div');
                playIcon.innerHTML = '▶';
                playIcon.style.position = 'absolute';
                playIcon.style.top = '50%';
                playIcon.style.left = '50%';
                playIcon.style.transform = 'translate(-50%, -50%)';
                playIcon.style.color = 'white';
                playIcon.style.fontSize = '24px';
                thumbnail.style.position = 'relative';
                thumbnail.appendChild(playIcon);
            } else {
                // Generic file icon
                thumbnail.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23666\' d=\'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z\'/%3E%3C/svg%3E")';
                thumbnail.style.backgroundSize = '48px';
            }
            
            // Create title
            const title = document.createElement('div');
            title.textContent = item.name || item.title || 'Untitled';
            title.style.padding = '8px';
            title.style.fontSize = '12px';
            title.style.whiteSpace = 'nowrap';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            
            // Add click handler
            mediaCard.onclick = function() {
                // Handle input field update if we have a target
                if (targetInputId) {
                    handleMediaSelection(item, targetInputId);
                }
                
                // Call the callback if available
                if (callback && typeof callback === 'function') {
                    callback(item);
                }
                
                // Close the modal
                document.getElementById('popup-media-selection-modal').remove();
            };
            
            mediaCard.appendChild(thumbnail);
            mediaCard.appendChild(title);
            container.appendChild(mediaCard);
        });
    }
    
    /**
     * Get media items from localStorage
     * @returns {Array} Array of media items
     */
    function getMediaItems() {
        // Try different storage keys that might contain media
        const mediaKeys = [
            'mediaItems',
            'mediaLibrary',
            'blogMedia',
            'galleryItems',
            'uploadedMedia'
        ];
        
        let items = [];
        
        // Check each possible storage key
        for (const key of mediaKeys) {
            const storedItems = localStorage.getItem(key);
            if (storedItems) {
                try {
                    const parsedItems = JSON.parse(storedItems);
                    if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                        items = parsedItems;
                        break;
                    }
                } catch (e) {
                    console.error('Error parsing media items from localStorage:', e);
                }
            }
        }
        
        return items;
    }
})();
