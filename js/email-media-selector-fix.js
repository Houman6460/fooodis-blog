/**
 * Email Media Selector Fix
 * Fixes issues with media selection in Email Subscribers
 */

(function() {
    console.log('Email Media Selector Fix: Initializing');
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initEmailMediaSelectorFix);
    
    // Also try after a delay
    setTimeout(initEmailMediaSelectorFix, 1000);
    
    /**
     * Initialize the email media selector fix
     */
    function initEmailMediaSelectorFix() {
        console.log('Email Media Selector Fix: Running initialization');
        
        // Fix the media selection buttons
        fixMediaSelectionButtons();
        
        // Apply additional integration fixes
        enhanceEmailMediaIntegration();
        
        // Set up event delegation for dynamically added elements
        setupEventDelegation();
    }
    
    /**
     * Fix media selection buttons in Email Subscribers
     */
    function fixMediaSelectionButtons() {
        // Find all media selection buttons
        const mediaButtons = document.querySelectorAll('.media-library-button, .email-media-select');
        
        if (mediaButtons.length > 0) {
            console.log(`Email Media Selector Fix: Found ${mediaButtons.length} media buttons`);
            
            // Fix each button
            mediaButtons.forEach(button => {
                // Skip if already fixed
                if (button.dataset.fixed) return;
                
                // Ensure the button has the correct click handler
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetInput = this.getAttribute('data-target-input');
                    console.log('Email Media Selector Fix: Opening media selector for', targetInput);
                    
                    openEnhancedMediaSelector(targetInput);
                });
                
                // Mark as fixed
                button.dataset.fixed = 'true';
                console.log('Email Media Selector Fix: Fixed button for', button.getAttribute('data-target-input'));
            });
        } else {
            console.log('Email Media Selector Fix: No media buttons found, will retry later');
            setTimeout(fixMediaSelectionButtons, 1000);
        }
    }
    
    /**
     * Open enhanced media selector
     * @param {string} targetInputId - ID of the target input
     */
    function openEnhancedMediaSelector(targetInputId) {
        console.log('Email Media Selector Fix: Opening media selector for', targetInputId);
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'email-media-selector-modal';
        modal.innerHTML = `
            <div class="email-media-selector-content">
                <div class="email-media-selector-header">
                    <h3>Select Image</h3>
                    <button class="email-media-selector-close">&times;</button>
                </div>
                <div class="email-media-selector-body">
                    <div class="email-media-selector-filters">
                        <input type="text" placeholder="Search media..." class="email-media-search">
                        <select class="email-media-type-filter">
                            <option value="all">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                        </select>
                    </div>
                    <div class="email-media-selector-grid"></div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add close handler
        const closeButton = modal.querySelector('.email-media-selector-close');
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
        
        // Store target input ID
        modal.dataset.targetInput = targetInputId;
        
        // Load media items
        loadMediaItems(modal.querySelector('.email-media-selector-grid'), targetInputId);
        
        // Setup search and filters
        setupMediaFilters(modal);
    }
    
    /**
     * Load media items into selector
     * @param {HTMLElement} container - Container element
     * @param {string} targetInputId - Target input ID
     */
    function loadMediaItems(container, targetInputId) {
        // Get media items from storage (or use dummy data if not available)
        let mediaItems = [];
        
        try {
            // Try to get from localStorage
            const storedMedia = localStorage.getItem('mediaLibrary');
            if (storedMedia) {
                mediaItems = JSON.parse(storedMedia);
            }
        } catch (error) {
            console.error('Error loading media items:', error);
        }
        
        // If no items found, use dummy data
        if (!mediaItems || !mediaItems.length) {
            mediaItems = [
                { id: 'placeholder1', name: 'Sample Image 1', type: 'image', url: 'images/placeholders/image1.jpg' },
                { id: 'placeholder2', name: 'Sample Image 2', type: 'image', url: 'images/placeholders/image2.jpg' },
                { id: 'placeholder3', name: 'Sample Image 3', type: 'image', url: 'images/placeholders/image3.jpg' },
                { id: 'placeholder4', name: 'Sample Video', type: 'video', url: 'images/placeholders/video1.mp4' }
            ];
        }
        
        // Render items
        container.innerHTML = '';
        
        mediaItems.forEach(item => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'email-media-item';
            mediaElement.dataset.id = item.id;
            mediaElement.dataset.type = item.type;
            mediaElement.dataset.name = item.name;
            mediaElement.dataset.url = item.url;
            
            // Create thumbnail
            if (item.type === 'image') {
                mediaElement.innerHTML = `
                    <div class="email-media-thumbnail">
                        <img src="${item.url}" alt="${item.name}">
                    </div>
                    <div class="email-media-info">
                        <div class="email-media-name">${item.name}</div>
                        <div class="email-media-type">${item.type}</div>
                    </div>
                `;
            } else {
                mediaElement.innerHTML = `
                    <div class="email-media-thumbnail video">
                        <i class="fas fa-play-circle"></i>
                        <img src="${item.thumbnail || 'images/placeholders/video-thumb.jpg'}" alt="${item.name}">
                    </div>
                    <div class="email-media-info">
                        <div class="email-media-name">${item.name}</div>
                        <div class="email-media-type">${item.type}</div>
                    </div>
                `;
            }
            
            // Add selection handler
            mediaElement.addEventListener('click', () => {
                selectMedia(item, targetInputId);
                document.querySelector('.email-media-selector-modal').remove();
            });
            
            container.appendChild(mediaElement);
        });
    }
    
    /**
     * Set up media filters
     * @param {HTMLElement} modal - Modal element
     */
    function setupMediaFilters(modal) {
        const searchInput = modal.querySelector('.email-media-search');
        const typeFilter = modal.querySelector('.email-media-type-filter');
        const grid = modal.querySelector('.email-media-selector-grid');
        
        // Search filter
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const typeValue = typeFilter.value;
            
            grid.querySelectorAll('.email-media-item').forEach(item => {
                const name = item.dataset.name.toLowerCase();
                const type = item.dataset.type;
                
                const matchesSearch = name.includes(searchTerm);
                const matchesType = typeValue === 'all' || type === typeValue;
                
                item.style.display = matchesSearch && matchesType ? 'block' : 'none';
            });
        });
        
        // Type filter
        typeFilter.addEventListener('change', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const typeValue = typeFilter.value;
            
            grid.querySelectorAll('.email-media-item').forEach(item => {
                const name = item.dataset.name.toLowerCase();
                const type = item.dataset.type;
                
                const matchesSearch = name.includes(searchTerm);
                const matchesType = typeValue === 'all' || type === typeValue;
                
                item.style.display = matchesSearch && matchesType ? 'block' : 'none';
            });
        });
    }
    
    /**
     * Select a media item
     * @param {Object} media - Media item
     * @param {string} targetInputId - Target input ID
     */
    function selectMedia(media, targetInputId) {
        console.log('Email Media Selector Fix: Selected media', media.name, 'for', targetInputId);
        
        // Find target input
        const targetInput = document.getElementById(targetInputId);
        if (!targetInput) {
            console.error('Target input not found:', targetInputId);
            return;
        }
        
        // Update input value if it's a file input
        if (targetInput.type === 'file') {
            // Can't set file input value directly, so create a data element
            const dataElement = document.createElement('input');
            dataElement.type = 'hidden';
            dataElement.name = targetInput.name + '_media_id';
            dataElement.value = media.id;
            dataElement.dataset.url = media.url;
            
            // Add it after the file input
            targetInput.parentNode.insertBefore(dataElement, targetInput.nextSibling);
            
            // Add visual feedback
            addSelectionFeedback(targetInput, media.name);
        } else {
            // For other inputs, just set the value
            targetInput.value = media.url;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            targetInput.dispatchEvent(event);
        }
        
        // Update any preview elements
        updatePreviewElements(targetInput, media);
    }
    
    /**
     * Add selection feedback to input
     * @param {HTMLElement} input - Input element
     * @param {string} mediaName - Media name
     */
    function addSelectionFeedback(input, mediaName) {
        // Create or update feedback element
        let feedback = input.parentNode.querySelector('.email-media-selection-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'email-media-selection-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        
        feedback.innerHTML = `
            <div class="email-media-selected">
                <i class="fas fa-check-circle"></i>
                Selected: ${mediaName}
            </div>
        `;
        
        // Animate the feedback
        feedback.style.animation = 'none';
        setTimeout(() => {
            feedback.style.animation = 'fadeInUp 0.3s forwards';
        }, 10);
    }
    
    /**
     * Update preview elements
     * @param {HTMLElement} input - Input element
     * @param {Object} media - Media object
     */
    function updatePreviewElements(input, media) {
        // Look for preview elements
        const container = input.closest('.popup-customization-section') || 
                          input.closest('.email-popup-preview') ||
                          input.closest('.email-popup-form');
        
        if (!container) return;
        
        // Update any image previews
        const previews = container.querySelectorAll('.image-preview, .media-preview, .popup-preview-image');
        
        previews.forEach(preview => {
            if (preview.tagName === 'IMG') {
                preview.src = media.url;
                preview.alt = media.name;
                preview.style.display = 'block';
            } else {
                // If it's a container, find or create an image inside
                let img = preview.querySelector('img');
                
                if (!img) {
                    img = document.createElement('img');
                    preview.innerHTML = '';
                    preview.appendChild(img);
                }
                
                img.src = media.url;
                img.alt = media.name;
                preview.style.display = 'block';
            }
        });
        
        // Update any popup previews
        updateEmailPopupPreview(container, media);
    }
    
    /**
     * Update email popup preview
     * @param {HTMLElement} container - Container element
     * @param {Object} media - Media object
     */
    function updateEmailPopupPreview(container, media) {
        // Check if there's a popup preview in this container
        const preview = container.querySelector('.email-popup-preview') || 
                       document.querySelector('.email-popup-preview');
        
        if (!preview) return;
        
        // Find the image element in the preview
        const previewImage = preview.querySelector('.popup-image') || 
                            preview.querySelector('.email-popup-image');
        
        if (previewImage) {
            previewImage.style.backgroundImage = `url(${media.url})`;
            previewImage.style.display = 'block';
        }
    }
    
    /**
     * Enhance email media integration
     */
    function enhanceEmailMediaIntegration() {
        // Add enhanced media selection buttons to email customization panel
        addEnhancedMediaButtons();
        
        // Ensure CSS is injected
        injectEmailMediaSelectorStyles();
    }
    
    /**
     * Add enhanced media buttons
     */
    function addEnhancedMediaButtons() {
        // Find all file inputs that might need media buttons
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // Skip if already enhanced
            if (input.dataset.mediaEnhanced) return;
            
            // Get or create an ID for the input
            if (!input.id) {
                input.id = 'file-input-' + Math.random().toString(36).substring(2, 9);
            }
            
            // Create media button
            const mediaButton = document.createElement('button');
            mediaButton.type = 'button';
            mediaButton.className = 'email-media-select-button';
            mediaButton.dataset.targetInput = input.id;
            mediaButton.innerHTML = '<i class="fas fa-images"></i> Media Library';
            
            // Add button next to input
            input.parentNode.insertBefore(mediaButton, input.nextSibling);
            
            // Mark input as enhanced
            input.dataset.mediaEnhanced = 'true';
        });
    }
    
    /**
     * Inject email media selector styles
     */
    function injectEmailMediaSelectorStyles() {
        // Skip if already injected
        if (document.getElementById('email-media-selector-styles')) return;
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'email-media-selector-styles';
        
        style.textContent = `
            /* Email Media Selector Modal */
            .email-media-selector-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .email-media-selector-content {
                background-color: #fff;
                border-radius: 8px;
                max-width: 800px;
                width: 90%;
                max-height: 90%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .email-media-selector-header {
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eee;
            }
            
            .email-media-selector-header h3 {
                margin: 0;
                font-size: 18px;
                color: #333;
            }
            
            .email-media-selector-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #777;
                transition: color 0.2s;
            }
            
            .email-media-selector-close:hover {
                color: #333;
            }
            
            .email-media-selector-body {
                padding: 15px;
                overflow-y: auto;
                flex-grow: 1;
            }
            
            .email-media-selector-filters {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .email-media-search {
                flex-grow: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .email-media-type-filter {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: #fff;
                font-size: 14px;
            }
            
            .email-media-selector-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .email-media-item {
                cursor: pointer;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s, box-shadow 0.2s;
                background-color: #fff;
            }
            
            .email-media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            .email-media-thumbnail {
                height: 100px;
                background-color: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
            }
            
            .email-media-thumbnail img {
                max-width: 100%;
                max-height: 100%;
                object-fit: cover;
                width: 100%;
                height: 100%;
            }
            
            .email-media-thumbnail.video::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.2);
            }
            
            .email-media-thumbnail .fa-play-circle {
                position: absolute;
                font-size: 30px;
                color: #fff;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }
            
            .email-media-info {
                padding: 8px;
            }
            
            .email-media-name {
                font-size: 13px;
                font-weight: 500;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .email-media-type {
                font-size: 11px;
                color: #777;
                text-transform: capitalize;
            }
            
            /* Selection feedback */
            .email-media-selection-feedback {
                margin-top: 5px;
                color: #28a745;
                font-size: 14px;
                animation: fadeInUp 0.3s forwards;
            }
            
            .email-media-selected {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .email-media-selected i {
                color: #28a745;
            }
            
            /* Media select button */
            .email-media-select-button {
                background-color: #0275d8;
                color: #fff;
                border: none;
                border-radius: 4px;
                padding: 6px 12px;
                margin-left: 10px;
                cursor: pointer;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                transition: background-color 0.2s;
            }
            
            .email-media-select-button:hover {
                background-color: #0269c2;
            }
            
            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        // Add to head
        document.head.appendChild(style);
    }
    
    /**
     * Set up event delegation
     */
    function setupEventDelegation() {
        // Use event delegation for dynamically added buttons
        document.addEventListener('click', function(event) {
            // Check if the clicked element is a media button
            if (event.target.matches('.email-media-select-button') || 
                event.target.closest('.email-media-select-button')) {
                
                event.preventDefault();
                event.stopPropagation();
                
                const button = event.target.matches('.email-media-select-button') ? 
                              event.target : 
                              event.target.closest('.email-media-select-button');
                
                const targetInput = button.dataset.targetInput;
                
                openEnhancedMediaSelector(targetInput);
            }
        });
    }
})();
