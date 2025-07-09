/**
 * Advertising Banners
 * Handles the creation, editing, and toggling of advertising banners
 * for the blog page without interfering with the existing blog post banners.
 */

// Ad data structure
let adData = {
    enabled: false,
    layout: 'layout-1',
    title: '',
    subtitle: '',
    text: '',
    imageUrl: '',
    countdown: {
        enabled: true, // Enable countdown by default for preview
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        style: 'countdown-boxes'
    }
};

// Ensure countdown is always properly initialized
function ensureCountdownConfig() {
    if (!adData.countdown) {
        adData.countdown = {
            enabled: true,
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            style: 'countdown-boxes'
        };
    }
    if (!adData.countdown.endDate || isNaN(new Date(adData.countdown.endDate).getTime()) || new Date(adData.countdown.endDate).getTime() <= new Date().getTime()) {
        // Create a new valid future date
        adData.countdown.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        console.log('Updated countdown end date to:', adData.countdown.endDate);
    }
    if (!adData.countdown.style) {
        adData.countdown.style = 'countdown-boxes';
    }
    
    // Force countdown to be enabled
    adData.countdown.enabled = true;
}

// Storage key for ad data
const AD_STORAGE_KEY = 'fooodis-ad-banner';

// Initialize ad management
document.addEventListener('DOMContentLoaded', function() {
    initAdManagement();
});

// Initialize ad management functionality
function initAdManagement() {
    // Load saved ad data
    loadAdData();

    // Ensure countdown is properly configured
    ensureCountdownConfig();

    // Initialize UI elements
    initAdToggle();
    initLayoutSelection();
    initImageUpload();
    initFormHandlers();
    initAdvancedPanel();
    initPreviewButton();

    console.log('Ad management initialized successfully');

    // Initialize advanced banner controls if available
    if (typeof window.initAdvancedBannerControls === 'function') {
        window.initAdvancedBannerControls();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof window.initAdvancedBannerControls === 'function') {
                window.initAdvancedBannerControls();
            }
        }, 1000);
    }

    // Sync with advanced banner settings if available
    syncWithAdvancedBannerSettings();

    // Update UI based on loaded data
    updateUIFromData();

    // Check if we're on the blog page and inject banner
    if (document.querySelector('.blog-content-section') || document.querySelector('.blog-container')) {
        // We're on the blog page, inject the ad
        console.log('Blog page detected, injecting advertising banner...');
        injectAdIntoBlogPage();

        // Also set up a retry mechanism in case the page isn't fully loaded
        setTimeout(() => {
            if (document.getElementById('advertisingBannerContainer') && 
                document.getElementById('advertisingBannerContainer').innerHTML === '') {
                console.log('Retrying banner injection...');
                injectAdIntoBlogPage();
            }
        }, 1000);
    }

    // Add event listener for save button to sync with advanced settings
    const saveBtn = document.getElementById('saveAdBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // After saving, sync with advanced banner settings
            setTimeout(syncWithAdvancedBannerSettings, 100);
        });
    }
}

// Load ad data from storage
function loadAdData() {
    try {
        // Use StorageManager if available
        if (window.StorageManager) {
            const savedData = window.StorageManager.load('ad-banner', {
                defaultValue: null,
                onSuccess: function(data) {
                    console.log('Ad data loaded successfully via StorageManager');
                },
                onError: function(error) {
                    console.error('Error loading ad data via StorageManager:', error);
                }
            });

            if (savedData) {
                // Only update properties that exist in the saved data
                Object.keys(savedData).forEach(key => {
                    if (key in adData) {
                        adData[key] = savedData[key];
                    }
                });
                console.log('Loaded ad data successfully:', adData);
                return;
            }
        }

        // Fallback to direct localStorage
        // Try to load from our storage key first
        let savedData = localStorage.getItem(AD_STORAGE_KEY);

        // If not found, try the old key as fallback
        if (!savedData) {
            savedData = localStorage.getItem('advertisingData');
            // If found in old location, migrate it to new key
            if (savedData) {
                localStorage.setItem(AD_STORAGE_KEY, savedData);
                console.log('Migrated ad data to new storage key');
            }
        }

        if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Only update properties that exist in the saved data
            Object.keys(parsedData).forEach(key => {
                if (key in adData) {
                    adData[key] = parsedData[key];
                }
            });
            console.log('Loaded ad data successfully:', adData);
        } else {
            console.log('No ad data found, using default settings');
            // Save default settings
            saveAdData();
        }
    } catch (e) {
        console.error('Error loading ad data:', e);
        // Reset to defaults and save
        adData = {
            enabled: false,
            layout: 'layout-1',
            title: '',
            subtitle: '',
            text: '',
            imageUrl: ''
        };
        saveAdData();
    }
}

// Save ad data to storage
function saveAdData() {
    // Ensure countdown is properly configured before saving
    ensureCountdownConfig();
    
    // Create a copy of the data to avoid modifying the original during save attempts
    const dataToSave = { ...adData };

    // Use StorageManager if available
    if (window.StorageManager) {
        // Check if image needs compression
        if (dataToSave.imageUrl && dataToSave.imageUrl.length > 100000) {
            console.log('Large image detected, compressing before saving...');

            // Compress the image first
            compressImage(dataToSave.imageUrl, (compressedImage) => {
                dataToSave.imageUrl = compressedImage;

                // Save with compressed image
                window.StorageManager.save('ad-banner', dataToSave, {
                    compress: true,
                    onSuccess: function() {
                        console.log('Ad data saved successfully with compressed image');
                        showNotification('Banner settings saved successfully', 'success');
                    },
                    onError: function(error, status) {
                        console.error('Error saving ad data:', error, status);

                        if (status === 'reduced') {
                            showNotification('Banner saved with reduced quality due to size limitations', 'warning');
                        } else {
                            showNotification('Could not save banner settings completely', 'warning');
                        }
                    }
                });
            });

            return true;
        }

        // Save without compression for smaller images
        return window.StorageManager.save('ad-banner', dataToSave, {
            compress: false,
            onSuccess: function() {
                console.log('Ad data saved successfully via StorageManager');
                showNotification('Banner settings saved successfully', 'success');
            },
            onError: function(error, status) {
                console.error('Error saving ad data:', error, status);
                showNotification('Could not save banner settings completely', 'warning');
            }
        });
    }

    // Fallback to direct localStorage if StorageManager is not available
    // Function to actually save the data
    const saveToStorage = (data) => {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(AD_STORAGE_KEY, jsonData);
            // Also save to old key for backward compatibility
            localStorage.setItem('advertisingData', jsonData);
            console.log('Ad data saved successfully');
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    };

    // Try to save with full data first
    if (saveToStorage(dataToSave)) {
        showNotification('Banner settings saved successfully', 'success');
        return true;
    }

    // If saving failed and we have an image, try compressing it
    if (dataToSave.imageUrl && dataToSave.imageUrl.length > 100000) {
        console.log('Compressing image before saving...');

        // Use a synchronous approach for more reliable saving
        const compressAndSave = () => {
            return new Promise((resolve) => {
                compressImage(dataToSave.imageUrl, (compressedImage) => {
                    dataToSave.imageUrl = compressedImage;
                    const saved = saveToStorage(dataToSave);
                    resolve(saved);
                });
            });
        };

        // Execute compression and save
        compressAndSave().then((saved) => {
            if (!saved) {
                // If still can't save, try without image
                console.log('Still cannot save after compression, removing image...');
                dataToSave.imageUrl = '';
                if (saveToStorage(dataToSave)) {
                    showNotification('Image was too large to save. Banner saved without image.', 'warning');
                } else {
                    // Last resort - save minimal data
                    const minimalData = {
                        enabled: dataToSave.enabled,
                        layout: dataToSave.layout,
                        title: dataToSave.title
                    };
                    if (saveToStorage(minimalData)) {
                        showNotification('Storage limitations. Only basic banner settings were saved.', 'warning');
                    } else {
                        showNotification('Could not save banner settings.', 'error');
                    }
                }
            } else {
                showNotification('Banner settings saved successfully', 'success');
            }
        });

        return true;
    }

    // If no image or small image but still can't save, try without image
    dataToSave.imageUrl = '';
    if (saveToStorage(dataToSave)) {
        showNotification('Banner saved without image due to storage limitations.', 'warning');
        return true;
    }

    // Last resort - save minimal data
    const minimalData = {
        enabled: dataToSave.enabled,
        layout: dataToSave.layout,
        title: dataToSave.title
    };

    if (saveToStorage(minimalData)) {
        showNotification('Storage limitations. Only basic banner settings were saved.', 'warning');
        return true;
    }

    showNotification('Could not save banner settings.', 'error');
    return false;
}

// Compress image to reduce storage size
function compressImage(dataUrl, callback) {
    const img = new Image();
    img.onload = function() {
        // Create a canvas to draw the compressed image
        const canvas = document.createElement('canvas');

        // Calculate new dimensions (reduce size if needed)
        let width = img.width;
        let height = img.height;

        // If image is very large, scale it down
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = Math.round(height * (maxDimension / width));
                width = maxDimension;
            } else {
                width = Math.round(width * (maxDimension / height));
                height = maxDimension;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Get the compressed image (reduce quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);

        callback(compressedDataUrl);
    };

    img.src = dataUrl;
}

// Initialize ad toggle switch
function initAdToggle() {
    const toggleSwitch = document.getElementById('adToggle');
    if (!toggleSwitch) return;

    toggleSwitch.checked = adData.enabled;

    toggleSwitch.addEventListener('change', function() {
        adData.enabled = this.checked;
        saveAdData();

        // Show notification
        showNotification(
            this.checked ? 'Advertising banner enabled on blog page' : 'Advertising banner disabled on blog page', 
            'info'
        );
    });
}

// Initialize layout selection
function initLayoutSelection() {
    const layoutOptions = document.querySelectorAll('.layout-option input[type="radio"]');
    if (layoutOptions.length === 0) return;

    layoutOptions.forEach(option => {
        // Set the checked state based on saved data
        if (option.value === adData.layout) {
            option.checked = true;
            option.closest('.layout-option').classList.add('selected');
        }

        option.addEventListener('change', function() {
            // Remove selected class from all options
            document.querySelectorAll('.layout-option').forEach(el => {
                el.classList.remove('selected');
            });

            // Add selected class to the chosen option
            this.closest('.layout-option').classList.add('selected');

            // Update ad data
            adData.layout = this.value;
            saveAdData();

            // Update preview immediately
            updatePreviewContent();

            // Update advanced banner preview if it exists
            if (typeof window.updateBannerPreview === 'function') {
                window.updateBannerPreview();
            }
        });
    });
}

// Initialize image upload functionality
function initImageUpload() {
    const uploadArea = document.getElementById('adImageUpload');
    const imageInput = document.getElementById('adImageInput');
    const imagePreview = document.getElementById('adImagePreview');

    if (!uploadArea || !imageInput || !imagePreview) return;

    // Show existing image if available
    if (adData.imageUrl) {
        imagePreview.src = adData.imageUrl;
        imagePreview.style.display = 'block';
    }

    // Click on upload area to trigger file input
    uploadArea.addEventListener('click', function() {
        imageInput.click();
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    // Handle file selection
    imageInput.addEventListener('change', function() {
        if (this.files.length) {
            handleImageFile(this.files[0]);
        }
    });
}

// Handle the selected image file
function handleImageFile(file) {
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    const reader = new FileReader();
    const imagePreview = document.getElementById('adImagePreview');

    reader.onload = function(e) {
        // Update preview
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';

        // Update ad data
        adData.imageUrl = e.target.result;
        saveAdData();

        // Update live preview immediately
        updatePreviewContent();

        // Update advanced banner preview if it exists
        if (typeof window.updateBannerPreview === 'function') {
            window.updateBannerPreview();
        }

        // Show success notification
        showNotification('Image uploaded successfully', 'success');
    };

    reader.onerror = function() {
        showNotification('Error uploading image. Please try again.', 'error');
    };

function initFormHandlers() {
    // Title input handler
    const titleInput = document.getElementById('adTitle');
    if (titleInput) {
        titleInput.value = adData.title;
        titleInput.addEventListener('input', function() {
            adData.title = this.value.trim();
            updatePreviewContent();
        });
    }

    // Subtitle input handler
    const subtitleInput = document.getElementById('adSubtitle');
    if (subtitleInput) {
        subtitleInput.value = adData.subtitle;
        subtitleInput.addEventListener('input', function() {
            adData.subtitle = this.value.trim();
            updatePreviewContent();
        });
    }

    // Text input handler
    const textInput = document.getElementById('adText');
    if (textInput) {
        textInput.value = adData.text;
        textInput.addEventListener('input', function() {
            adData.text = this.value.trim();
            updatePreviewContent();
        });
    }

    // Add click handler for the content tab to ensure form fields are visible
    const contentTab = document.querySelector('.panel-tab[data-tab="content"]');
    if (contentTab) {
        contentTab.addEventListener('click', function() {
            // Make the content tab active
            document.querySelectorAll('.panel-tab').forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');

            // Show content tab, hide others
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById('content-tab').classList.add('active');
        });
    }
    // Save button handler
    const saveButton = document.getElementById('saveAdBtn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            // Update data from form fields before saving
            const titleInput = document.getElementById('adTitle');
            const subtitleInput = document.getElementById('adSubtitle');
            const textInput = document.getElementById('adText');

            if (titleInput) adData.title = titleInput.value;
            if (subtitleInput) adData.subtitle = subtitleInput.value;
            if (textInput) adData.text = textInput.value;

            // Get the selected layout
            const selectedLayout = document.querySelector('.layout-option input[type="radio"]:checked');
            if (selectedLayout) {
                adData.layout = selectedLayout.value;
            }

            // Get the toggle state
            const toggleSwitch = document.getElementById('adToggle');
            if (toggleSwitch) {
                adData.enabled = toggleSwitch.checked;
            }

            // Save the data
            saveAdData();

            // Sync with advanced banner settings
            if (typeof window.advancedBannerConfig === 'object') {
                window.advancedBannerConfig.content.title = adData.title;
                window.advancedBannerConfig.content.subtitle = adData.subtitle;
                window.advancedBannerConfig.content.text = adData.text;
                window.advancedBannerConfig.content.imageUrl = adData.imageUrl;
                window.advancedBannerConfig.layout = adData.layout;
                window.advancedBannerConfig.enabled = adData.enabled;

                // Save the advanced banner settings
                if (typeof window.saveAdvancedBannerConfig === 'function') {
                    window.saveAdvancedBannerConfig();
                }

                // Update preview if available
                if (typeof window.updateBannerPreview === 'function') {
                    window.updateBannerPreview();
                }
            }

            // Provide feedback
            showNotification('Advertising banner settings saved successfully', 'success');
        });
    }
}

// Function to inject ad into blog page
function injectAdIntoBlogPage() {
    console.log('Attempting to inject advertising banner...');

    // Try to get banner data from storage
    let bannerData = null;

    // Use StorageManager if available
    if (window.StorageManager) {
        bannerData = window.StorageManager.load('ad-banner', {
            defaultValue: null,
            onSuccess: function(data) {
                console.log('Banner data loaded successfully via StorageManager');
            },
            onError: function(error) {
                console.error('Error loading banner data via StorageManager:', error);
            }
        });

        if (bannerData) {
            console.log('Banner data loaded from StorageManager');
        }
    }

    // Fallback to direct localStorage if StorageManager failed or is not available
    if (!bannerData) {
        // Try the new storage key first
        const savedData = localStorage.getItem(AD_STORAGE_KEY);
        if (savedData) {
            try {
                bannerData = JSON.parse(savedData);
                console.log('Banner data loaded from new storage key');
            } catch (e) {
                console.error('Error parsing banner data from new key:', e);
            }
        }

        // If not found with new key, try the old key
        if (!bannerData) {
            const oldData = localStorage.getItem('advertisingData');
            if (oldData) {
                try {
                    bannerData = JSON.parse(oldData);
                    console.log('Banner data loaded from old storage key');
                    // Migrate to new key
                    localStorage.setItem(AD_STORAGE_KEY, oldData);
                } catch (e) {
                    console.error('Error parsing banner data from old key:', e);
                }
            }
        }
    }

    // If no data found in either location
    if (!bannerData) {
        console.log('No banner data found in storage');
        return;
    }

    // Check if banner is enabled
    if (!bannerData.enabled) {
        console.log('Advertising banner is disabled');
        // Clear any existing banner if disabled
        const existingContainer = document.getElementById('advertisingBannerContainer');
        if (existingContainer) {
            existingContainer.innerHTML = '';
        }
        return;
    }

    // Find or create the container
    let adContainer = document.getElementById('advertisingBannerContainer');
    if (!adContainer) {
        console.log('Creating advertising banner container...');

        // Try to find a good insertion point
        const blogContent = document.querySelector('.blog-content-section');
        const footer = document.querySelector('.fooodis-footer');

        if (blogContent && footer) {
            adContainer = document.createElement('div');
            adContainer.id = 'advertisingBannerContainer';
            adContainer.className = 'advertising-banner-container';

            // Insert between blog content and footer
            footer.parentNode.insertBefore(adContainer, footer);
            console.log('Created banner container between blog content and footer');
        } else if (footer) {
            adContainer = document.createElement('div');
            adContainer.id = 'advertisingBannerContainer';
            adContainer.className = 'advertising-banner-container';
            footer.parentNode.insertBefore(adContainer, footer);
            console.log('Created banner container before footer');
        } else {
            console.error('Could not find suitable location for banner container');
            return;
        }
    }

    // Safely get properties with fallbacks
    const title = bannerData.title || '';
    const subtitle = bannerData.subtitle || '';
    const text = bannerData.text || '';
    const imageUrl = bannerData.imageUrl || '';
    const layout = bannerData.layout || 'layout-1';
    const countdown = bannerData.countdown || null;

    // Generate countdown HTML if enabled
    let countdownHTML = '';
    if (countdown && countdown.enabled && countdown.endDate) {
        countdownHTML = `
            <div class="banner-countdown-container">
                <div class="countdown-timer ${countdown.style || 'countdown-boxes'}" id="bannerCountdown">
                    ${countdown.style === 'countdown-simple' ? `
                        <div class="countdown-simple">
                            <span class="countdown-text">Time left: </span>
                            <span id="countdown-days">0</span><span class="countdown-unit">d </span>
                            <span id="countdown-hours">0</span><span class="countdown-unit">h </span>
                            <span id="countdown-minutes">0</span><span class="countdown-unit">m </span>
                            <span id="countdown-seconds">0</span><span class="countdown-unit">s</span>
                        </div>
                    ` : countdown.style === 'countdown-minimal' ? `
                        <div class="countdown-minimal">
                            <div class="countdown-line">
                                <div class="countdown-progress" id="countdownProgress"></div>
                            </div>
                            <div class="countdown-text">
                                <span id="countdown-days">0</span> days, 
                                <span id="countdown-hours">0</span> hours, 
                                <span id="countdown-minutes">0</span> minutes, 
                                <span id="countdown-seconds">0</span> seconds <span class="countdown-remaining">remaining</span>
                            </div>
                        </div>
                    ` : `
                        <div class="countdown-boxes">
                            <div class="countdown-box">
                                <div class="countdown-value" id="countdown-days">0</div>
                                <div class="countdown-label">Days</div>
                            </div>
                            <div class="countdown-box">
                                <div class="countdown-value" id="countdown-hours">0</div>
                                <div class="countdown-label">Hours</div>
                            </div>
                            <div class="countdown-box">
                                <div class="countdown-value" id="countdown-minutes">0</div>
                                <div class="countdown-label">Minutes</div>
                            </div>
                            <div class="countdown-box">
                                <div class="countdown-value" id="countdown-seconds">0</div>
                                <div class="countdown-label">Seconds</div>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    // Create ad HTML based on selected layout
    let adHTML = '';

    switch (layout) {
        case 'layout-1':
            adHTML = `
                <div class="advertising-banner enabled">
                    <div class="advertising-banner-inner">
                        <div class="ad-layout-1">
                            <div class="ad-text">
                                <h2 class="ad-title">${title}</h2>
                                <h3 class="ad-subtitle">${subtitle}</h3>
                                <p class="ad-content">${text}</p>
                                ${countdownHTML}
                            </div>
                            <div class="ad-image">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'layout-2':
            adHTML = `
                <div class="advertising-banner enabled">
                    <div class="advertising-banner-inner">
                        <div class="ad-layout-2">
                            <div class="ad-text">
                                <h2 class="ad-title">${title}</h2>
                                <h3 class="ad-subtitle">${subtitle}</h3>
                                <p class="ad-content">${text}</p>
                                ${countdownHTML}
                            </div>
                            <div class="ad-image">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'layout-3':
            adHTML = `
                <div class="advertising-banner enabled">
                    <div class="advertising-banner-inner">
                        <div class="ad-layout-3">
                            <div class="ad-image">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">` : ''}
                            </div>
                            <div class="ad-text">
                                <h2 class="ad-title">${title}</h2>
                                <h3 class="ad-subtitle">${subtitle}</h3>
                                <p class="ad-content">${text}</p>
                                ${countdownHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }

    // Insert ad into the container
    adContainer.innerHTML = adHTML;
    console.log('Advertising banner injected successfully');

    // Initialize countdown if enabled - always ensure valid countdown
    if (countdown && countdown.enabled) {
        console.log('Countdown is enabled, initializing...');
        
        let endDate = countdown.endDate;
        
        // Always validate and potentially recreate the end date
        if (!endDate || isNaN(new Date(endDate).getTime()) || new Date(endDate).getTime() <= new Date().getTime()) {
            console.log('Creating new valid countdown end date');
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + 7); // 7 days from now
            newEndDate.setHours(23, 59, 59, 999); // End of that day
            endDate = newEndDate.toISOString();
            
            console.log('New countdown end date:', endDate);
            
            // Update the banner data
            bannerData.countdown.endDate = endDate;
            
            // Save updated data
            try {
                if (window.StorageManager) {
                    window.StorageManager.save('ad-banner', bannerData, {
                        onSuccess: function() {
                            console.log('Updated countdown date saved via StorageManager');
                        },
                        onError: function(error) {
                            console.error('Error saving updated countdown date via StorageManager:', error);
                        }
                    });
                } else {
                    localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(bannerData));
                    console.log('Updated countdown date saved to localStorage');
                }
            } catch (e) {
                console.error('Could not save updated countdown date:', e);
            }
        }
        
        // Initialize countdown with a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Starting countdown initialization...');
            initializeCountdown(endDate, countdown.style || 'countdown-boxes');
        }, 500);
    } else {
        console.log('Countdown not enabled or not configured');
    }
}

// Initialize countdown functionality
function initializeCountdown(endDate, style) {
    console.log('Initializing countdown with provided end date:', endDate);
    
    let countdownDate;
    
    // Always create a fresh countdown date to ensure it's valid
    if (!endDate || isNaN(new Date(endDate).getTime()) || new Date(endDate).getTime() <= new Date().getTime()) {
        console.log('Creating new valid countdown date');
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 7); // 7 days from now
        newEndDate.setHours(23, 59, 59, 999); // End of that day
        countdownDate = newEndDate.getTime();
        
        // Update stored data with new valid end date
        const newEndDateISO = new Date(countdownDate).toISOString();
        
        // Update adData if available
        if (typeof adData === 'object' && adData.countdown) {
            adData.countdown.endDate = newEndDateISO;
            console.log('Updated adData countdown end date');
        }
        
        // Update storage directly
        try {
            const savedData = localStorage.getItem(AD_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (!parsedData.countdown) {
                    parsedData.countdown = {};
                }
                parsedData.countdown.endDate = newEndDateISO;
                parsedData.countdown.enabled = true;
                localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(parsedData));
                console.log('Updated stored countdown end date:', newEndDateISO);
            }
        } catch (e) {
            console.error('Error updating stored countdown date:', e);
        }
    } else {
        countdownDate = new Date(endDate).getTime();
    }

    console.log('Final countdown date:', new Date(countdownDate));

    // Clear any existing countdown intervals
    const existingIntervals = window.countdownIntervals || [];
    existingIntervals.forEach(interval => clearInterval(interval));
    window.countdownIntervals = [];

    // Immediately update countdown to show current values
    function updateCountdownDisplay() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        // Calculate time units
        const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

        console.log('Countdown values:', { days, hours, minutes, seconds });

        // Find all countdown elements in the banner
        const bannerContainer = document.getElementById('advertisingBannerContainer');
        if (!bannerContainer) {
            console.log('Banner container not found');
            return;
        }

        // Update countdown values using multiple selection methods
        const countdownValues = bannerContainer.querySelectorAll('.countdown-value');
        const daysEl = bannerContainer.querySelector('#countdown-days');
        const hoursEl = bannerContainer.querySelector('#countdown-hours');
        const minutesEl = bannerContainer.querySelector('#countdown-minutes');
        const secondsEl = bannerContainer.querySelector('#countdown-seconds');

        // Update using class selector if available
        if (countdownValues.length >= 4) {
            countdownValues[0].textContent = days.toString().padStart(2, '0');
            countdownValues[1].textContent = hours.toString().padStart(2, '0');
            countdownValues[2].textContent = minutes.toString().padStart(2, '0');
            countdownValues[3].textContent = seconds.toString().padStart(2, '0');
            console.log('Updated countdown using class selector');
        }

        // Update using ID selectors as backup
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');

        // If countdown is finished, handle expiration
        if (distance < 0) {
            if (countdownValues.length >= 4) {
                countdownValues.forEach(val => val.textContent = '00');
            }
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            
            console.log('Countdown expired');
            return false; // Signal to stop the interval
        }
        
        return true; // Continue the interval
    }

    // Update immediately
    updateCountdownDisplay();

    // Set up interval for continuous updates
    const countdownInterval = setInterval(function() {
        const shouldContinue = updateCountdownDisplay();
        if (!shouldContinue) {
            clearInterval(countdownInterval);
            // Remove from tracking array
            const index = window.countdownIntervals.indexOf(countdownInterval);
            if (index > -1) {
                window.countdownIntervals.splice(index, 1);
            }
        }
    }, 1000);

    // Track the interval for cleanup
    if (!window.countdownIntervals) {
        window.countdownIntervals = [];
    }
    window.countdownIntervals.push(countdownInterval);

    console.log('Countdown initialized successfully');
}

/**
 * Sync with advanced banner settings
 */
function syncWithAdvancedBannerSettings() {
    console.log('Syncing with advanced banner settings...');

    // Check if the advanced banner settings panel exists
    const advancedPanel = document.querySelector('.advanced-banner-panel');
    if (!advancedPanel) {
        console.log('Advanced banner panel not found, skipping sync');
        return;
    }

    try {
        // Make sure the content tab is initialized and properly synced
        const contentTab = document.querySelector('.panel-tab[data-tab="content"]');
        const contentTabContent = document.getElementById('content-tab');
        if (contentTab && contentTabContent) {
            // Ensure the content fields are properly synced with current data
            const titleInput = document.getElementById('adTitle');
            if (titleInput) {
                // Update adData from input value since this is now the source of truth
                adData.title = titleInput.value.trim();
            }

            const subtitleInput = document.getElementById('adSubtitle');
            if (subtitleInput) {
                adData.subtitle = subtitleInput.value.trim();
            }

            const textInput = document.getElementById('adText');
            if (textInput) {
                adData.text = textInput.value.trim();
            }

            console.log('Content fields synced with current data');
        }

        // Sync style settings if they exist

        // Example: Sync corner style
        const cornerStyle = document.getElementById('corner-style');
        if (cornerStyle) {
            adData.cornerStyle = cornerStyle.value;
            console.log('Corner style synced:', cornerStyle.value);
        }

        // Example: Sync border radius
        const borderRadius = document.getElementById('banner-border-radius');
        if (borderRadius) {
            adData.borderRadius = borderRadius.value + 'px';
            console.log('Border radius synced:', borderRadius.value);
        }

        // Sync background color
        const backgroundColorInput = document.getElementById('banner-background');
        if (backgroundColorInput) {
            adData.backgroundColor = backgroundColorInput.value;
            console.log('Background color synced:', backgroundColorInput.value);
        }

        // Sync animation settings if enabled
        const animationEnabled = document.getElementById('animation-enabled');
        if (animationEnabled) {
            adData.animation = {
                enabled: animationEnabled.checked,
                type: document.getElementById('animation-type')?.value || 'fade',
                duration: document.getElementById('animation-duration')?.value || '0.5',
                delay: document.getElementById('animation-delay')?.value || '0.2'
            };
            console.log('Animation settings synced');
        }

        // Sync button settings if enabled
        const buttonEnabled = document.getElementById('button-enabled');
        if (buttonEnabled) {
            adData.button = {
                enabled: buttonEnabled.checked,
                text: document.getElementById('button-text')?.value || 'Learn More',
                url: document.getElementById('button-url')?.value || '#',
                newTab: document.getElementById('button-new-tab')?.checked || false,
                backgroundColor: document.getElementById('button-background')?.value || '#e8f24c',
                textColor: document.getElementById('button-text-color')?.value || '#1e2127'
            };
            console.log('Button settings synced');```text

        }

```javascript
        }

```text

        // Update preview after syncing all settings
```javascript
        updatePreviewContent();
        console.log('Advanced settings sync complete');
    } catch (e) {
        console.error('Error syncing with advanced banner settings:', e);
    }
}

// Initialize advanced banner settings panel
function initAdvancedPanel() {
    // Handle toggle button for advanced settings panel
    const toggleButton = document.getElementById('toggleAdvancedSettings');
    const advancedPanel = document.querySelector('.advanced-banner-panel');

    if (toggleButton && advancedPanel) {
        // Set initial state - panel closed by default
        let isPanelOpen = false;
        advancedPanel.style.display = 'none';

        toggleButton.addEventListener('click', function() {
            isPanelOpen = !isPanelOpen;
            advancedPanel.style.display = isPanelOpen ? 'block' : 'none';
            toggleButton.textContent = isPanelOpen ? 'Hide Advanced Banner Settings' : 'Configure Advanced Banner Settings';

            // Scroll to the advanced panel if opened
            if (isPanelOpen) {
                setTimeout(() => {
                    advancedPanel.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    }

    // Panel tabs
    const panelTabs = document.querySelectorAll('.panel-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (panelTabs.length && tabContents.length) {
        panelTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

                // Remove active class from all tabs
                panelTabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                this.classList.add('active');

                // Hide all tab contents
                tabContents.forEach(content => content.classList.remove('active'));

                // Show selected tab content
                const selectedContent = document.getElementById(tabId + '-tab');
                if (selectedContent) selectedContent.classList.add('active');
            });
        });
    }

    // Initialize range sliders
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = document.getElementById(input.id + '-value');
        if (valueDisplay) {
            // Set initial value
            valueDisplay.textContent = input.value + (input.id.includes('duration') || input.id.includes('delay') ? 's' : '');

            // Update on change
            input.addEventListener('input', function() {
                valueDisplay.textContent = this.value + (this.id.includes('duration') || this.id.includes('delay') ? 's' : '');
            });
        }
    });

    // Initialize color inputs
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(input => {
        const previewElement = document.getElementById(input.id + '-preview');
        if (previewElement) {
            // Set initial color
            previewElement.style.backgroundColor = input.value;

            // Update on change
            input.addEventListener('input', function() {
                previewElement.style.backgroundColor = this.value;
            });
        }
    });

    // Add new range input for button width
    const buttonWidthInput = document.getElementById('button-width');
    if (buttonWidthInput) {
        const buttonWidthValueDisplay = document.getElementById('button-width-value');
        if (buttonWidthValueDisplay) {
            // Set initial value
            buttonWidthValueDisplay.textContent = buttonWidthInput.value + 'px';

            // Update on change
            buttonWidthInput.addEventListener('input', function() {
                buttonWidthValueDisplay.textContent = this.value + 'px';
            });
        }
    }

    // Add new range input for button length
    const buttonLengthInput = document.getElementById('button-length');
    if (buttonLengthInput) {
        const buttonLengthValueDisplay = document.getElementById('button-length-value');
        if (buttonLengthValueDisplay) {
            // Set initial value
            buttonLengthValueDisplay.textContent = buttonLengthInput.value + 'px';

            // Update on change
            buttonLengthInput.addEventListener('input', function() {
                buttonLengthValueDisplay.textContent = this.value + 'px';
            });
        }
    }
}

// Update preview content based on current ad data
function updatePreviewContent() {
    const previewContainer = document.getElementById('banner-preview-container');
    if (!previewContainer) {
        console.log('Banner preview container not found');
        return;
    }

    const { title, subtitle, text, imageUrl, layout } = adData;

    // Always enable countdown for preview purposes with fixed values
    const countdown = {
        enabled: true,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        style: 'countdown-boxes'
    };

    // Generate countdown HTML with static values for preview - force inline styles for visibility
    let countdownHTML = `
        <div class="banner-countdown-container" style="display: flex !important; margin: 15px 0 !important; visibility: visible !important; opacity: 1 !important; flex-direction: row !important; justify-content: flex-start !important; align-items: center !important;">
            <div class="countdown-timer countdown-boxes" style="display: flex !important; visibility: visible !important; opacity: 1 !important;">
                <div class="countdown-boxes" style="display: flex !important; gap: 10px !important; visibility: visible !important; opacity: 1 !important;">
                    <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36 !important; border-radius: 5px !important; padding: 10px !important; min-width: 60px !important; text-align: center !important;">
                        <div class="countdown-value" style="font-size: 24px !important; font-weight: bold !important; color: #e8f24c !important;">3</div>
                        <div class="countdown-label" style="font-size: 12px !important; color: #ffffff !important; margin-top: 5px !important;">Days</div>
                    </div>
                    <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36 !important; border-radius: 5px !important; padding: 10px !important; min-width: 60px !important; text-align: center !important;">
                        <div class="countdown-value" style="font-size: 24px !important; font-weight: bold !important; color: #e8f24c !important;">12</div>
                        <div class="countdown-label" style="font-size: 12px !important; color: #ffffff !important; margin-top: 5px !important;">Hours</div>
                    </div>
                    <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36 !important; border-radius: 5px !important; padding: 10px !important; min-width: 60px !important; text-align: center !important;">
                        <div class="countdown-value" style="font-size: 24px !important; font-weight: bold !important; color: #e8f24c !important;">45</div>
                        <div class="countdown-label" style="font-size: 12px !important; color: #ffffff !important; margin-top: 5px !important;">Minutes</div>
                    </div>
                    <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36 !important; border-radius: 5px !important; padding: 10px !important; min-width: 60px !important; text-align: center !important;">
                        <div class="countdown-value" style="font-size: 24px !important; font-weight: bold !important; color: #e8f24c !important;">30</div>
                        <div class="countdown-label" style="font-size: 12px !important; color: #ffffff !important; margin-top: 5px !important;">Seconds</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Generate banner HTML based on selected layout
    let bannerHTML = '';

    switch (layout) {
        case 'layout-1': // Text left, image right
            bannerHTML = `
                <div class="advanced-advertising-banner">
                    <div class="advanced-banner-inner">
                        <div class="advanced-banner-layout layout-1">
                            <div class="banner-text-content">
                                <h3 class="banner-title">${title || 'Banner Title'}</h3>
                                <h4 class="banner-subtitle">${subtitle || 'Banner Subtitle'}</h4>
                                <p class="banner-text">${text || 'Banner text content goes here...'}</p>
                                ${countdownHTML}
                                <a href="#" class="banner-button" style="background: #e8f24c !important; color: #1e2127 !important; padding: 12px 25px !important; border-radius: 30px !important; text-decoration: none !important; font-weight: bold !important; display: inline-block !important; width: auto !important; max-width: 200px !important; min-width: 120px !important; text-align: center !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; box-sizing: border-box !important; margin: 10px 0 !important;">Learn More</a>
                            </div>
                            <div class="banner-image-content">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="placeholder-image">Image</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'layout-2': // Centered content
            bannerHTML = `
                <div class="advanced-advertising-banner">
                    <div class="advanced-banner-inner">
                        <div class="advanced-banner-layout layout-2">
                            <div class="banner-text-content">
                                <h3 class="banner-title">${title || 'Banner Title'}</h3>
                                <h4 class="banner-subtitle">${subtitle || 'Banner Subtitle'}</h4>
                                <p class="banner-text">${text || 'Banner text content goes here...'}</p>
                                ${countdownHTML}
                                <a href="#" class="banner-button" style="background: #e8f24c !important; color: #1e2127 !important; padding: 12px 25px !important; border-radius: 30px !important; text-decoration: none !important; font-weight: bold !important; display: inline-block !important; width: auto !important; max-width: 200px !important; min-width: 120px !important; text-align: center !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; box-sizing: border-box !important; margin: 10px 0 !important;">Learn More</a>
                            </div>
                            <div class="banner-image-content">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="placeholder-image">Image</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'layout-3': // Image left, text right
            bannerHTML = `
                <div class="advanced-advertising-banner">
                    <div class="advanced-banner-inner">
                        <div class="advanced-banner-layout layout-3">
                            <div class="banner-image-content">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="placeholder-image">Image</div>'}
                            </div>
                            <div class="banner-text-content">
                                <h3 class="banner-title">${title || 'Banner Title'}</h3>
                                <h4 class="banner-subtitle">${subtitle || 'Banner Subtitle'}</h4>
                                <p class="banner-text">${text || 'Banner text content goes here...'}</p>
                                ${countdownHTML}
                                <a href="#" class="banner-button" style="background: #e8f24c !important; color: #1e2127 !important; padding: 12px 25px !important; border-radius: 30px !important; text-decoration: none !important; font-weight: bold !important; display: inline-block !important; width: auto !important; max-width: 200px !important; min-width: 120px !important; text-align: center !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; box-sizing: border-box !important; margin: 10px 0 !important;">Learn More</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        default:
            // Default to layout-1
            bannerHTML = `
                <div class="advanced-advertising-banner">
                    <div class="advanced-banner-inner">
                        <div class="advanced-banner-layout layout-1">
                            <div class="banner-text-content">
                                <h3 class="banner-title">${title || 'Banner Title'}</h3>
                                <h4 class="banner-subtitle">${subtitle || 'Banner Subtitle'}</h4>
                                <p class="banner-text">${text || 'Banner text content goes here...'}</p>
                                ${countdownHTML}
                                <a href="#" class="banner-button" style="background: #e8f24c !important; color: #1e2127 !important; padding: 12px 25px !important; border-radius: 30px !important; text-decoration: none !important; font-weight: bold !important; display: inline-block !important; width: auto !important; max-width: 200px !important; min-width: 120px !important; text-align: center !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; box-sizing: border-box !important; margin: 10px 0 !important;">Learn More</a>
                            </div>
                            <div class="banner-image-content">
                                ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="placeholder-image">Image</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    // Insert banner HTML into preview container for live preview
    previewContainer.innerHTML = bannerHTML;
    console.log('Live preview content updated with layout:', layout);

    // Force countdown to be visible immediately
    setTimeout(() => {
        console.log('Forcing countdown visibility in preview...');

        // First, ensure countdown is in the banner HTML
        if (countdownHTML && previewContainer.innerHTML.indexOf('banner-countdown-container') === -1) {
            // Add countdown HTML directly to the banner text content
            const textContent = previewContainer.querySelector('.banner-text-content');
            const button = previewContainer.querySelector('.banner-button');

            if (textContent && button) {
                const countdownDiv = document.createElement('div');
                countdownDiv.innerHTML = countdownHTML;
                textContent.insertBefore(countdownDiv.firstElementChild, button);
            } else if (textContent) {
                const countdownDiv = document.createElement('div');
                countdownDiv.innerHTML = countdownHTML;
                textContent.appendChild(countdownDiv.firstElementChild);
            }
        }

        // Now find and configure the countdown container
        let countdownContainer = previewContainer.querySelector('.banner-countdown-container');
        if (countdownContainer) {
            // Force visibility with inline styles
            countdownContainer.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                margin: 15px 0 !important;
                flex-direction: row !important;
                justify-content: flex-start !important;
                align-items: center !important;
            `;

            // Also force countdown timer and boxes to be visible
            const timer = countdownContainer.querySelector('.countdown-timer');
            const boxes = countdownContainer.querySelector('.countdown-boxes');

            if (timer) {
                timer.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important;';
            }

            if (boxes) {
                boxes.style.cssText = 'display: flex !important; visibility: visible !important; opacity: 1 !important; gap: 10px !important;';

                // Force individual boxes to be visible
                const boxElements = boxes.querySelectorAll('.countdown-box');
                boxElements.forEach(box => {
                    box.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
                });
            }

            console.log('Countdown container forced to be visible');

            // Start live countdown updates for preview
            startPreviewCountdown(previewContainer);
        } else {
            console.log('Countdown container still not found in preview');
        }
    }, 100);

    // Setup preview button to show the modal with updated content
    const previewButton = document.getElementById('preview-banner');
    const adPreviewModal = document.getElementById('adPreviewModal');

    if (previewButton && adPreviewModal) {
        // Update the modal content immediately so it's ready when opened
        const modalContentContainer = adPreviewModal.querySelector('.ad-preview-content');
        if (modalContentContainer) {
            modalContentContainer.innerHTML = bannerHTML;
            console.log('Modal preview content prepared with layout:', layout);

            // Start countdown in modal too
            if (countdown && countdown.enabled && countdown.endDate) {
                startPreviewCountdown(modalContentContainer);
            }
        }

        // Ensure the preview button opens the modal
        previewButton.onclick = function() {
            // Refresh modal content before showing
            if (modalContentContainer) {
                modalContentContainer.innerHTML = bannerHTML;
                if (countdown && countdown.enabled && countdown.endDate) {
                    startPreviewCountdown(modalContentContainer);
                }
            }
            adPreviewModal.style.display = 'flex';
        };

        // Make sure the close button works
        const closeButton = adPreviewModal.querySelector('.preview-close');
        if (closeButton) {
            closeButton.onclick = function() {
                adPreviewModal.style.display = 'none';
            };
        }

        // Close when clicking outside the modal content
        window.onclick = function(event) {
            if (event.target === adPreviewModal) {
                adPreviewModal.style.display = 'none';
            }
        };
    }
}

// Fixed countdown functionality with proper initialization and forced visibility
function startPreviewCountdown(container) {
    if (!container) {
        console.log('No container provided for countdown');
        return;
    }

    console.log('Starting preview countdown for container:', container);

    // Clear any existing countdown interval for this container
    if (container.countdownInterval) {
        clearInterval(container.countdownInterval);
    }

    // Always use a 3-day countdown for preview
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 999);

    // Find or create countdown container with forced visibility
    let countdownContainer = container.querySelector('.banner-countdown-container');
    if (!countdownContainer) {
        countdownContainer = document.createElement('div');
        countdownContainer.className = 'banner-countdown-container';

        // Find the best insertion point
        const textContent = container.querySelector('.banner-text-content');
        const button = container.querySelector('.banner-button');

        if (textContent && button) {
            textContent.insertBefore(countdownContainer, button);
        } else if (textContent) {
            textContent.appendChild(countdownContainer);
        } else {
            container.appendChild(countdownContainer);
        }
    }

    // Force countdown to be visible with important styles
    countdownContainer.style.cssText = `
        display: flex !important;
        margin: 20px 0 !important;
        visibility: visible !important;
        opacity: 1 !important;
        flex-direction: row !important;
        justify-content: flex-start !important;
        align-items: center !important;
    `;

    // Create countdown HTML with forced inline styles
    countdownContainer.innerHTML = `
        <div class="countdown-timer countdown-boxes" style="display: flex !important; visibility: visible !important; opacity: 1 !important;">
            <div class="countdown-boxes" style="display: flex !important; gap: 10px !important; visibility: visible !important; opacity: 1 !important;">
                <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36; border-radius: 5px; padding: 10px; min-width: 60px; text-align: center;">
                    <div class="countdown-value" style="font-size: 24px; font-weight: bold; color: #e8f24c;">3</div>
                    <div class="countdown-label" style="font-size: 12px; color: #ffffff; margin-top: 5px;">Days</div>
                </div>
                <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36; border-radius: 5px; padding: 10px; min-width: 60px; text-align: center;">
                    <div class="countdown-value" style="font-size: 24px; font-weight: bold; color: #e8f24c;">12</div>
                    <div class="countdown-label" style="font-size: 12px; color: #ffffff; margin-top: 5px;">Hours</div>
                </div>
                <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36; border-radius: 5px; padding: 10px; min-width: 60px; text-align: center;">
                    <div class="countdown-value" style="font-size: 24px; font-weight: bold; color: #e8f24c;">45</div>
                    <div class="countdown-label" style="font-size: 12px; color: #ffffff; margin-top: 5px;">Minutes</div>
                </div>
                <div class="countdown-box" style="display: block !important; visibility: visible !important; opacity: 1 !important; background-color: #2a2e36; border-radius: 5px; padding: 10px; min-width: 60px; text-align: center;">
                    <div class="countdown-value" style="font-size: 24px; font-weight: bold; color: #e8f24c;">30</div>
                    <div class="countdown-label" style="font-size: 12px; color: #ffffff; margin-top: 5px;">Seconds</div>
                </div>
            </div>
        </div>
    `;

    // Start live updates with actual countdown
    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;

        if (distance > 0) {
            const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

            const values = countdownContainer.querySelectorAll('.countdown-value');
            if (values.length >= 4) {
                values[0].textContent = days;
                values[1].textContent = hours;
                values[2].textContent = minutes;
                values[3].textContent = seconds;
            }
        }
    };

    // Update every second
    container.countdownInterval = setInterval(updateCountdown, 1000);

    console.log('Countdown initialized with forced visibility and live updates');
}

/**
 * Update UI elements from loaded data
 */
function updateUIFromData() {
    // Update toggle
    const toggleSwitch = document.getElementById('adToggle');
    if (toggleSwitch) {
        toggleSwitch.checked = adData.enabled;
    }

    // Update form fields
    const titleInput = document.getElementById('adTitle');
    if (titleInput) {
        titleInput.value = adData.title || '';
    }

    const subtitleInput = document.getElementById('adSubtitle');
    if (subtitleInput) {
        subtitleInput.value = adData.subtitle || '';
    }

    const textInput = document.getElementById('adText');
    if (textInput) {
        textInput.value = adData.text || '';
    }

    // Update layout selection
    const layoutInputs = document.querySelectorAll('.layout-option input[type="radio"]');
    layoutInputs.forEach(input => {
        if (input.value === adData.layout) {
            input.checked = true;
            input.closest('.layout-option').classList.add('selected');
        } else {
            input.checked = false;
            input.closest('.layout-option').classList.remove('selected');
        }
    });

    // Update image preview
    const imagePreview = document.getElementById('adImagePreview');
    if (imagePreview && adData.imageUrl) {
        imagePreview.src = adData.imageUrl;
        imagePreview.style.display = 'block';
    }

    // Update preview
    updatePreviewContent();
}

// Export functions for use in other scripts
window.injectAdIntoBlogPage = injectAdIntoBlogPage;
window.adData = adData; // Make adData available to other scripts
window.saveAdData = saveAdData; // Export saveAdData for use in advanced settings
window.updatePreviewContent = updatePreviewContent; // Export for use in other modules
window.updateUIFromData = updateUIFromData; // Export for external use
}