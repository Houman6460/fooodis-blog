/**
 * Direct Media Selector Override
 * 
 * This script completely replaces the media selector content
 * with a custom implementation that doesn't rely on any existing code.
 */

(function() {
    // Run fix on page load and after delays
    document.addEventListener('DOMContentLoaded', initDirectOverride);
    window.addEventListener('load', initDirectOverride);
    setTimeout(initDirectOverride, 500);
    setTimeout(initDirectOverride, 1000);
    setTimeout(initDirectOverride, 2000);
    
    // Store the target input ID when media selector is opened
    let currentTargetInputId = null;
    
    // Main initialization function
    function initDirectOverride() {
        console.log("Direct Selector Override: Initializing");
        
        // Override the openMediaLibrary function
        if (typeof window.openMediaLibrary === 'function') {
            window.original_openMediaLibrary = window.openMediaLibrary;
            
            window.openMediaLibrary = function(targetInputId) {
                console.log("Direct Selector Override: Intercepted openMediaLibrary call for", targetInputId);
                
                // Store the target input ID
                currentTargetInputId = targetInputId;
                
                // Create our own media selector modal
                createCustomMediaSelector();
                
                return false; // Prevent original function from running
            };
        }
        
        // Set up click handler for all media buttons
        document.querySelectorAll('[data-action="media"], .select-image-btn, .media-button, [onclick*="openMediaLibrary"], [onclick*="selectMedia"]').forEach(btn => {
            // Remove any existing onclick handlers
            const originalOnclick = btn.getAttribute('onclick');
            if (originalOnclick) {
                btn.removeAttribute('onclick');
                
                // Get target input ID from onclick attribute if possible
                let targetId = null;
                const inputIdMatch = originalOnclick.match(/openMediaLibrary\\(['"]([^'"]+)['"]/);
                if (inputIdMatch && inputIdMatch[1]) {
                    targetId = inputIdMatch[1];
                }
                
                // Add our custom click handler
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log("Direct Selector Override: Button clicked, target:", targetId);
                    currentTargetInputId = targetId;
                    
                    // Create our custom media selector
                    createCustomMediaSelector();
                    
                    return false;
                });
            }
        });
    }
    
    // Create our custom media selector modal
    function createCustomMediaSelector() {
        // Remove any existing media selector modal
        const existingModal = document.querySelector('.custom-media-selector-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'custom-media-selector-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'custom-media-selector-content';
        modalContent.style.backgroundColor = '#222';
        modalContent.style.borderRadius = '4px';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '1000px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.color = '#fff';
        modalContent.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'custom-media-selector-header';
        header.style.padding = '15px 20px';
        header.style.borderBottom = '1px solid #333';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        
        const title = document.createElement('h3');
        title.textContent = 'Select Media';
        title.style.margin = '0';
        title.style.fontSize = '18px';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#fff';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            modal.remove();
        };
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Add tabs
        const tabs = document.createElement('div');
        tabs.className = 'custom-media-selector-tabs';
        tabs.style.display = 'flex';
        tabs.style.borderBottom = '1px solid #333';
        tabs.style.backgroundColor = '#1a1a1a';
        
        const allTab = document.createElement('div');
        allTab.className = 'custom-media-selector-tab active';
        allTab.textContent = 'All Media';
        allTab.style.padding = '10px 20px';
        allTab.style.cursor = 'pointer';
        allTab.style.backgroundColor = '#2d2d2d';
        
        const imagesTab = document.createElement('div');
        imagesTab.className = 'custom-media-selector-tab';
        imagesTab.textContent = 'Images';
        imagesTab.style.padding = '10px 20px';
        imagesTab.style.cursor = 'pointer';
        
        const videosTab = document.createElement('div');
        videosTab.className = 'custom-media-selector-tab';
        videosTab.textContent = 'Videos';
        videosTab.style.padding = '10px 20px';
        videosTab.style.cursor = 'pointer';
        
        tabs.appendChild(allTab);
        tabs.appendChild(imagesTab);
        tabs.appendChild(videosTab);
        
        // Add main content area
        const contentArea = document.createElement('div');
        contentArea.className = 'custom-media-selector-main';
        contentArea.style.display = 'flex';
        
        // Add sidebar for folders
        const sidebar = document.createElement('div');
        sidebar.className = 'custom-media-selector-sidebar';
        sidebar.style.width = '180px';
        sidebar.style.borderRight = '1px solid #333';
        sidebar.style.padding = '15px';
        sidebar.style.backgroundColor = '#1a1a1a';
        
        const folderLabel = document.createElement('div');
        folderLabel.className = 'folders-label';
        folderLabel.textContent = 'FOLDERS';
        folderLabel.style.fontSize = '12px';
        folderLabel.style.fontWeight = 'bold';
        folderLabel.style.color = '#aaa';
        folderLabel.style.marginBottom = '10px';
        
        sidebar.appendChild(folderLabel);
        
        // Create folder items
        const folders = [
            { name: 'All Media', count: 9, active: true },
            { name: 'Uncategorized', count: 0 },
            { name: 'Food', count: 6 },
            { name: 'Restaurant', count: 1 },
            { name: 'People', count: 2 },
            { name: 'Test', count: 0 }
        ];
        
        folders.forEach(folder => {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item' + (folder.active ? ' active' : '');
            folderItem.style.display = 'flex';
            folderItem.style.justifyContent = 'space-between';
            folderItem.style.alignItems = 'center';
            folderItem.style.padding = '8px';
            folderItem.style.marginBottom = '5px';
            folderItem.style.borderRadius = '4px';
            folderItem.style.cursor = 'pointer';
            
            if (folder.active) {
                folderItem.style.backgroundColor = '#333';
            }
            
            folderItem.innerHTML = '<span>' + folder.name + '</span><span style="background-color: #444; padding: 2px 8px; border-radius: 10px; font-size: 12px;">' + folder.count + '</span>';
            
            sidebar.appendChild(folderItem);
        });
        
        // Add media items grid
        const mediaGrid = document.createElement('div');
        mediaGrid.className = 'custom-media-selector-grid';
        mediaGrid.style.flex = '1';
        mediaGrid.style.padding = '20px';
        mediaGrid.style.display = 'grid';
        mediaGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        mediaGrid.style.gap = '15px';
        
        // Create media items
        const mediaItems = [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', size: '559 KB' },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', size: '587 KB' },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', size: '499 KB' },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', size: '454 KB' },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', size: '566 KB' },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', size: '471 KB' },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', size: '523 KB' },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', size: '483 KB' },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', size: '474 KB' }
        ];
        
        mediaItems.forEach(item => {
            // Determine color and icon based on folder
            let bgColor = '#6974d4'; // Blue for food
            let icon = '🍽️';
            
            if (item.folder === 'restaurant') {
                bgColor = '#13b3a4'; // Teal
                icon = '🏢';
            } else if (item.folder === 'people') {
                bgColor = '#f3a638'; // Orange
                icon = '👨‍🍳';
            }
            
            const mediaItem = document.createElement('div');
            mediaItem.className = 'custom-media-item';
            mediaItem.style.borderRadius = '4px';
            mediaItem.style.overflow = 'hidden';
            mediaItem.style.backgroundColor = '#2a2a2a';
            mediaItem.style.cursor = 'pointer';
            mediaItem.setAttribute('data-id', item.id);
            mediaItem.setAttribute('data-name', item.name);
            
            const imageDiv = document.createElement('div');
            imageDiv.style.backgroundColor = bgColor;
            imageDiv.style.height = '140px';
            imageDiv.style.display = 'flex';
            imageDiv.style.alignItems = 'center';
            imageDiv.style.justifyContent = 'center';
            imageDiv.style.fontSize = '24px';
            imageDiv.style.color = 'white';
            imageDiv.textContent = icon;
            
            const nameDiv = document.createElement('div');
            nameDiv.style.marginBottom = '5px';
            nameDiv.style.whiteSpace = 'nowrap';
            nameDiv.style.overflow = 'hidden';
            nameDiv.style.textOverflow = 'ellipsis';
            nameDiv.textContent = item.name;
            
            const metaDiv = document.createElement('div');
            metaDiv.style.display = 'flex';
            metaDiv.style.justifyContent = 'space-between';
            metaDiv.style.fontSize = '12px';
            metaDiv.style.color = '#aaa';
            
            const typeSpan = document.createElement('span');
            typeSpan.textContent = 'image';
            
            const sizeSpan = document.createElement('span');
            sizeSpan.textContent = item.size;
            
            metaDiv.appendChild(typeSpan);
            metaDiv.appendChild(sizeSpan);
            
            const infoDiv = document.createElement('div');
            infoDiv.style.padding = '10px';
            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(metaDiv);
            
            mediaItem.appendChild(imageDiv);
            mediaItem.appendChild(infoDiv);
            
            // Add click handler to select media
            mediaItem.addEventListener('click', function() {
                // Remove selection from any previously selected item
                const prevSelected = mediaGrid.querySelector('.custom-media-item.selected');
                if (prevSelected) {
                    prevSelected.style.border = 'none';
                    prevSelected.classList.remove('selected');
                }
                
                // Mark this item as selected
                this.style.border = '2px solid #0095ff';
                this.classList.add('selected');
                
                // Enable the select button
                selectButton.disabled = false;
                selectButton.style.opacity = '1';
            });
            
            // Double click to select and close
            mediaItem.addEventListener('dblclick', function() {
                selectMedia(item);
                modal.remove();
            });
            
            mediaGrid.appendChild(mediaItem);
        });
        
        // Add footer with actions
        const footer = document.createElement('div');
        footer.className = 'custom-media-selector-footer';
        footer.style.padding = '15px 20px';
        footer.style.borderTop = '1px solid #333';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'flex-end';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.backgroundColor = 'transparent';
        cancelButton.style.border = '1px solid #555';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.padding = '8px 15px';
        cancelButton.style.marginRight = '10px';
        cancelButton.style.color = '#fff';
        cancelButton.style.cursor = 'pointer';
        cancelButton.onclick = function() {
            modal.remove();
        };
        
        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.style.backgroundColor = '#0095ff';
        selectButton.style.border = 'none';
        selectButton.style.borderRadius = '4px';
        selectButton.style.padding = '8px 15px';
        selectButton.style.color = '#fff';
        selectButton.style.cursor = 'pointer';
        selectButton.style.opacity = '0.5';
        selectButton.disabled = true;
        selectButton.onclick = function() {
            const selectedItem = mediaGrid.querySelector('.custom-media-item.selected');
            if (selectedItem) {
                const itemId = selectedItem.getAttribute('data-id');
                const item = mediaItems.find(m => m.id === itemId);
                if (item) {
                    selectMedia(item);
                    modal.remove();
                }
            }
        };
        
        footer.appendChild(cancelButton);
        footer.appendChild(selectButton);
        
        // Assemble all parts
        contentArea.appendChild(sidebar);
        contentArea.appendChild(mediaGrid);
        
        modalContent.appendChild(header);
        modalContent.appendChild(tabs);
        modalContent.appendChild(contentArea);
        modalContent.appendChild(footer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    // Function to select media and update the target input
    function selectMedia(item) {
        console.log("Direct Selector Override: Selected media item", item);
        
        if (currentTargetInputId) {
            const targetInput = document.getElementById(currentTargetInputId);
            if (targetInput) {
                targetInput.value = '[Media: ' + item.name + ']';
                
                // Trigger change event
                const changeEvent = new Event('change', { bubbles: true });
                targetInput.dispatchEvent(changeEvent);
                
                console.log("Direct Selector Override: Updated input", currentTargetInputId);
            } else {
                console.error("Direct Selector Override: Target input not found", currentTargetInputId);
            }
        } else {
            console.error("Direct Selector Override: No target input ID");
        }
    }
})();
