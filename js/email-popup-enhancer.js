/**
 * Email Popup Enhancer for Fooodis Blog System
 * Adds advanced features to the email popup including:
 * - Image uploads (PNG with transparency, GIF animations)
 * - Multiple layout options
 * - Countdown timer functionality
 * - Custom design controls
 * - Loading animations
 * - Preset templates
 */

// Main EmailPopupEnhancer class
class EmailPopupEnhancer {
    constructor() {
        this.config = {
            layout: 'standard',
            image: {
                url: '',
                type: '',
                enabled: false
            },
            countdown: {
                enabled: false,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                endTime: null
            },
            colors: {
                background: '#252830',
                textBackground: '#80000000', // Semi-transparent black in hex format
                buttonBackground: '#e8f24c',
                buttonText: '#1e2127'
            },
            animation: 'spinner',
            template: 'newsletter',
            customText: {
                title: 'Subscribe to Our Newsletter',
                description: 'Stay updated with our latest news and offers.',
                buttonText: 'Subscribe',
                placeholder: 'Enter your email address',
                successMessage: 'Thank you for subscribing!'
            }
        };
        
        this.templates = {
            newsletter: {
                title: 'Subscribe to Our Newsletter',
                description: 'Stay updated with our latest news and offers.',
                buttonText: 'Subscribe',
                placeholder: 'Enter your email address',
                successMessage: 'Thank you for subscribing!'
            },
            offer: {
                title: 'Special Offer Inside!',
                description: 'Subscribe to unlock your special discount code.',
                buttonText: 'Get My Offer',
                placeholder: 'Your email address',
                successMessage: 'Your discount code has been sent!'
            },
            newProduct: {
                title: 'New Product Alert!',
                description: 'Be the first to know when we launch.',
                buttonText: 'Notify Me',
                placeholder: 'Your email here',
                successMessage: 'You\'ll be notified when we launch!'
            },
            event: {
                title: 'Join Our Upcoming Event',
                description: 'Don\'t miss out on this exclusive opportunity.',
                buttonText: 'Reserve My Spot',
                placeholder: 'Email for registration',
                successMessage: 'Your spot has been reserved!'
            },
            download: {
                title: 'Download Our Free Guide',
                description: 'Get instant access to our exclusive resources.',
                buttonText: 'Get My Download',
                placeholder: 'Where to send it?',
                successMessage: 'Check your email for the download link!'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadConfig();
        this.createEnhancedUI();
        this.bindEvents();
    }
    
    loadConfig() {
        // Load saved configuration from localStorage if available
        const savedConfig = localStorage.getItem('fooodis-email-popup-config');
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsedConfig };
            } catch (error) {
                console.error('Error loading email popup configuration:', error);
            }
        }
    }
    
    saveConfig() {
        try {
            localStorage.setItem('fooodis-email-popup-config', JSON.stringify(this.config));
        } catch (error) {
            console.error('Error saving email popup configuration:', error);
        }
    }
    
    createEnhancedUI() {
        // Load required CSS
        this.loadCSS('/css/email-popup-enhanced.css');
        
        // Find the customization section
        const popupCustomization = document.querySelector('.popup-customization');
        if (!popupCustomization) return;
        
        // Create tabs for better organization
        const tabsHTML = `
            <div class="customization-tabs">
                <div class="customization-tab active" data-tab="basic">Basic Settings</div>
                <div class="customization-tab" data-tab="layout">Layout & Image</div>
                <div class="customization-tab" data-tab="countdown">Countdown</div>
                <div class="customization-tab" data-tab="design">Design</div>
                <div class="customization-tab" data-tab="templates">Templates</div>
            </div>
        `;
        
        // Create the enhanced UI structure
        const enhancedUIHTML = `
            ${tabsHTML}
            <div class="tab-content active" id="basic-tab">
                <!-- Basic settings are already in the original UI -->
            </div>
            
            <div class="tab-content" id="layout-tab">
                <h4 class="email-config-section-title">Layout Selection</h4>
                <div class="popup-layout">
                    <div class="layout-option ${this.config.layout === 'standard' ? 'active' : ''}" data-layout="standard">
                        <div class="layout-preview">T</div>
                        <div class="layout-name">Standard</div>
                    </div>
                    <div class="layout-option ${this.config.layout === 'image-left' ? 'active' : ''}" data-layout="image-left">
                        <div class="layout-preview">I|T</div>
                        <div class="layout-name">Image Left</div>
                    </div>
                    <div class="layout-option ${this.config.layout === 'image-right' ? 'active' : ''}" data-layout="image-right">
                        <div class="layout-preview">T|I</div>
                        <div class="layout-name">Image Right</div>
                    </div>
                    <div class="layout-option ${this.config.layout === 'image-top' ? 'active' : ''}" data-layout="image-top">
                        <div class="layout-preview">I—T</div>
                        <div class="layout-name">Image Top</div>
                    </div>
                    <div class="layout-option ${this.config.layout === 'image-bottom' ? 'active' : ''}" data-layout="image-bottom">
                        <div class="layout-preview">T—I</div>
                        <div class="layout-name">Image Bottom</div>
                    </div>
                    <div class="layout-option ${this.config.layout === 'image-background' ? 'active' : ''}" data-layout="image-background">
                        <div class="layout-preview">I+T</div>
                        <div class="layout-name">Image Background</div>
                    </div>
                </div>
                
                <h4 class="email-config-section-title">Image Upload</h4>
                <div class="customization-option">
                    <div class="toggle-container">
                        <label class="simple-toggle" for="imageEnabled">
                            <input type="checkbox" id="imageEnabled" ${this.config.image.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <label for="imageEnabled" class="toggle-text">Enable Image</label>
                    </div>
                </div>
                
                <div class="customization-option">
                    <label class="option-label">Select Image from Media Library</label>
                    <button type="button" class="btn btn-primary choose-media-btn" id="chooseFromMediaBtn">
                        <i class="fas fa-images"></i> Choose from Media Library
                    </button>
                    <p class="input-help">Select an image from your uploaded media to display in the popup</p>
                    <div class="image-upload-preview ${this.config.image.url ? 'has-image' : ''}" id="imageUploadPreview">
                        ${this.config.image.url ? `
                            <button type="button" class="image-remove-btn" id="removeImageBtn" title="Remove image">
                                <i class="fas fa-times"></i>
                            </button>
                            <img src="${this.config.image.url}" alt="Preview">
                            <div class="image-info">
                                <span class="image-name">${this.config.image.name || 'Selected image'}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="countdown-tab">
                <h4 class="email-config-section-title">Countdown Timer</h4>
                <div class="customization-option">
                    <div class="toggle-container">
                        <label class="simple-toggle" for="countdownEnabled">
                            <input type="checkbox" id="countdownEnabled" ${this.config.countdown.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <label for="countdownEnabled" class="toggle-text">Enable Countdown Timer</label>
                    </div>
                </div>
                
                <div class="countdown-preview">
                    <div class="countdown-container">
                        <div class="countdown-item">
                            <div class="countdown-value">00</div>
                            <div class="countdown-label">Days</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">00</div>
                            <div class="countdown-label">Hours</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">00</div>
                            <div class="countdown-label">Mins</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value">00</div>
                            <div class="countdown-label">Secs</div>
                        </div>
                    </div>
                </div>
                
                <div class="countdown-settings">
                    <div class="countdown-input-group">
                        <label for="countdownDays">Days</label>
                        <input type="number" id="countdownDays" class="countdown-input" min="0" max="99" value="${this.config.countdown.days}">
                    </div>
                    <div class="countdown-input-group">
                        <label for="countdownHours">Hours</label>
                        <input type="number" id="countdownHours" class="countdown-input" min="0" max="23" value="${this.config.countdown.hours}">
                    </div>
                    <div class="countdown-input-group">
                        <label for="countdownMinutes">Minutes</label>
                        <input type="number" id="countdownMinutes" class="countdown-input" min="0" max="59" value="${this.config.countdown.minutes}">
                    </div>
                    <div class="countdown-input-group">
                        <label for="countdownSeconds">Seconds</label>
                        <input type="number" id="countdownSeconds" class="countdown-input" min="0" max="59" value="${this.config.countdown.seconds}">
                    </div>
                </div>
                
                <div class="customization-option">
                    <label class="option-label" for="countdownMessage">Countdown Message</label>
                    <input type="text" id="countdownMessage" class="option-input" placeholder="Offer ends in:" value="${this.config.countdown.message || 'Offer ends in:'}">
                </div>
            </div>
            
            <div class="tab-content" id="design-tab">
                <h4 class="email-config-section-title">Color Settings</h4>
                <div class="color-controls">
                    <div class="color-control-group">
                        <label for="backgroundColor">Background Color</label>
                        <input type="color" id="backgroundColor" value="${this.config.colors.background}">
                        <div class="color-preview" style="background-color: ${this.config.colors.background}"></div>
                    </div>
                    <div class="color-control-group">
                        <label for="textBackgroundColor">Text Background Color</label>
                        <input type="color" id="textBackgroundColor" value="${this.config.colors.textBackground}">
                        <input type="range" id="textBackgroundOpacity" min="0" max="100" value="50">
                        <div class="color-preview" style="background-color: ${this.config.colors.textBackground}"></div>
                    </div>
                    <div class="color-control-group">
                        <label for="buttonBackgroundColor">Button Background</label>
                        <input type="color" id="buttonBackgroundColor" value="${this.config.colors.buttonBackground}">
                        <div class="color-preview" style="background-color: ${this.config.colors.buttonBackground}"></div>
                    </div>
                    <div class="color-control-group">
                        <label for="buttonTextColor">Button Text Color</label>
                        <input type="color" id="buttonTextColor" value="${this.config.colors.buttonText}">
                        <div class="color-preview" style="background-color: ${this.config.colors.buttonText}"></div>
                    </div>
                </div>
                
                <h4 class="email-config-section-title">Loading Animation</h4>
                <div class="loading-animation-options">
                    <div class="loading-animation-option ${this.config.animation === 'spinner' ? 'active' : ''}" data-animation="spinner">
                        <div class="animation-preview">
                            <div class="anim-spinner"></div>
                        </div>
                        <p>Spinner</p>
                    </div>
                    <div class="loading-animation-option ${this.config.animation === 'pulse' ? 'active' : ''}" data-animation="pulse">
                        <div class="animation-preview">
                            <div class="anim-pulse"></div>
                        </div>
                        <p>Pulse</p>
                    </div>
                    <div class="loading-animation-option ${this.config.animation === 'fade' ? 'active' : ''}" data-animation="fade">
                        <div class="animation-preview">
                            <div class="anim-fade"></div>
                        </div>
                        <p>Fade</p>
                    </div>
                    <div class="loading-animation-option ${this.config.animation === 'bounce' ? 'active' : ''}" data-animation="bounce">
                        <div class="animation-preview">
                            <div class="anim-bounce"></div>
                        </div>
                        <p>Bounce</p>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="templates-tab">
                <h4 class="email-config-section-title">Preset Templates</h4>
                <p>Select a template to quickly configure your popup with a preset design and content:</p>
                
                <div class="template-selection">
                    <div class="template-option ${this.config.template === 'newsletter' ? 'active' : ''}" data-template="newsletter">
                        <div class="template-title">Newsletter</div>
                        <div class="template-description">Standard newsletter signup form for regular updates</div>
                    </div>
                    <div class="template-option ${this.config.template === 'offer' ? 'active' : ''}" data-template="offer">
                        <div class="template-title">Special Offer</div>
                        <div class="template-description">Promote a limited-time discount or special offer</div>
                    </div>
                    <div class="template-option ${this.config.template === 'newProduct' ? 'active' : ''}" data-template="newProduct">
                        <div class="template-title">Product Launch</div>
                        <div class="template-description">Build anticipation for a new product or feature</div>
                    </div>
                    <div class="template-option ${this.config.template === 'event' ? 'active' : ''}" data-template="event">
                        <div class="template-title">Event Invitation</div>
                        <div class="template-description">Collect emails for an upcoming event</div>
                    </div>
                    <div class="template-option ${this.config.template === 'download' ? 'active' : ''}" data-template="download">
                        <div class="template-title">Free Download</div>
                        <div class="template-description">Offer a free resource in exchange for email</div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the enhanced UI before the save button
        const saveButton = popupCustomization.querySelector('.email-customization-save');
        const enhancedUIContainer = document.createElement('div');
        enhancedUIContainer.className = 'enhanced-popup-ui';
        enhancedUIContainer.innerHTML = enhancedUIHTML;
        
        if (saveButton) {
            saveButton.parentNode.insertBefore(enhancedUIContainer, saveButton);
        } else {
            popupCustomization.appendChild(enhancedUIContainer);
        }
        
        // Move existing customization options to the basic tab (move, don't clone)
        const basicSettings = document.querySelectorAll('.popup-customization > form > .customization-options');
        const basicTab = document.getElementById('basic-tab');
        
        if (basicSettings.length && basicTab) {
            basicSettings.forEach(settings => {
                // Move the element, not clone it (to avoid duplicates)
                basicTab.appendChild(settings);
            });
        }
        
        // Also move the trigger settings to basic tab
        const triggerSettings = document.querySelector('.popup-customization > form > .popup-trigger-settings');
        if (triggerSettings && basicTab) {
            basicTab.appendChild(triggerSettings);
        }
    }
    
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.customization-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.customization-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                // Show selected tab content
                const tabId = `${tab.dataset.tab}-tab`;
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Layout selection
        document.querySelectorAll('.layout-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.layout-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.config.layout = option.dataset.layout;
                this.saveConfig();
                this.updatePreview();
            });
        });
        
        // Bind remove image button (use event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#removeImageBtn') || e.target.closest('.image-remove-btn')) {
                e.preventDefault();
                this.removeImage();
            }
        });
        
        // Choose from media library button
        const chooseMediaBtn = document.getElementById('chooseFromMediaBtn');
        if (chooseMediaBtn) {
            chooseMediaBtn.addEventListener('click', () => {
                this.openMediaSelector();
            });
        }
        
        // Image toggle
        const imageToggle = document.getElementById('imageEnabled');
        if (imageToggle) {
            imageToggle.addEventListener('change', (e) => {
                this.config.image.enabled = e.target.checked;
                this.saveConfig();
                this.updatePreview();
            });
        }
        
        // Countdown toggle and settings
        const countdownToggle = document.getElementById('countdownEnabled');
        if (countdownToggle) {
            countdownToggle.addEventListener('change', (e) => {
                this.config.countdown.enabled = e.target.checked;
                this.saveConfig();
                this.updatePreview();
            });
        }
        
        // Countdown value inputs
        ['Days', 'Hours', 'Minutes', 'Seconds'].forEach(unit => {
            const input = document.getElementById(`countdown${unit}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    const value = parseInt(e.target.value) || 0;
                    this.config.countdown[unit.toLowerCase()] = value;
                    this.saveConfig();
                    this.updateCountdownPreview();
                });
            }
        });
        
        // Countdown message
        const countdownMessage = document.getElementById('countdownMessage');
        if (countdownMessage) {
            countdownMessage.addEventListener('input', (e) => {
                this.config.countdown.message = e.target.value;
                this.saveConfig();
            });
        }
        
        // Color inputs
        document.querySelectorAll('#backgroundColor, #textBackgroundColor, #buttonBackgroundColor, #buttonTextColor').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.id;
                let color = e.target.value;
                
                switch(id) {
                    case 'backgroundColor':
                        this.config.colors.background = color;
                        break;
                    case 'textBackgroundColor':
                        // Handle opacity separately
                        const opacity = document.getElementById('textBackgroundOpacity').value / 100;
                        // Convert hex to rgba
                        const hexToRgb = (hex) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                                r: parseInt(result[1], 16),
                                g: parseInt(result[2], 16),
                                b: parseInt(result[3], 16)
                            } : null;
                        };
                        
                        const rgb = hexToRgb(color);
                        if (rgb) {
                            color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                            this.config.colors.textBackground = color;
                        }
                        break;
                    case 'buttonBackgroundColor':
                        this.config.colors.buttonBackground = color;
                        break;
                    case 'buttonTextColor':
                        this.config.colors.buttonText = color;
                        break;
                }
                
                // Update color preview
                const preview = e.target.parentNode.querySelector('.color-preview');
                if (preview) {
                    preview.style.backgroundColor = color;
                }
                
                this.saveConfig();
                this.updatePreview();
            });
        });
        
        // Handle opacity slider for text background
        const opacitySlider = document.getElementById('textBackgroundOpacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                const opacity = e.target.value / 100;
                const colorInput = document.getElementById('textBackgroundColor');
                const hexColor = colorInput.value;
                
                // Convert hex to rgba
                const hexToRgb = (hex) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                };
                
                const rgb = hexToRgb(hexColor);
                if (rgb) {
                    const color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                    this.config.colors.textBackground = color;
                    
                    // Update color preview
                    const preview = colorInput.parentNode.querySelector('.color-preview');
                    if (preview) {
                        preview.style.backgroundColor = color;
                    }
                    
                    this.saveConfig();
                    this.updatePreview();
                }
            });
        }
        
        // Animation selection
        document.querySelectorAll('.loading-animation-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.loading-animation-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.config.animation = option.dataset.animation;
                this.saveConfig();
            });
        });
        
        // Template selection
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.template-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                
                const templateName = option.dataset.template;
                this.config.template = templateName;
                
                // Apply template text to the form fields
                if (this.templates[templateName]) {
                    const template = this.templates[templateName];
                    
                    // Update config
                    this.config.customText = { ...template };
                    
                    // Update form fields
                    document.getElementById('popupTitle').value = template.title;
                    document.getElementById('buttonText').value = template.buttonText;
                    document.getElementById('placeholderText').value = template.placeholder;
                    document.getElementById('successMessage').value = template.successMessage;
                }
                
                this.saveConfig();
            });
        });
        
        // Save button
        const saveButton = document.querySelector('.email-customization-save');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                // Get values from the basic form fields
                this.config.customText.title = document.getElementById('popupTitle').value;
                this.config.customText.buttonText = document.getElementById('buttonText').value;
                this.config.customText.placeholder = document.getElementById('placeholderText').value;
                this.config.customText.successMessage = document.getElementById('successMessage').value;
                
                this.saveConfig();
                this.updatePreview();
                
                // Show success notification
                this.showNotification('Email popup configuration saved successfully!');
            });
        }
    }
    
    updateCountdownPreview() {
        const days = document.querySelector('.countdown-item:nth-child(1) .countdown-value');
        const hours = document.querySelector('.countdown-item:nth-child(2) .countdown-value');
        const minutes = document.querySelector('.countdown-item:nth-child(3) .countdown-value');
        const seconds = document.querySelector('.countdown-item:nth-child(4) .countdown-value');
        
        if (days && hours && minutes && seconds) {
            days.textContent = this.padZero(this.config.countdown.days);
            hours.textContent = this.padZero(this.config.countdown.hours);
            minutes.textContent = this.padZero(this.config.countdown.minutes);
            seconds.textContent = this.padZero(this.config.countdown.seconds);
        }
    }
    
    padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    updateImagePreview() {
        const preview = document.getElementById('imageUploadPreview');
        if (!preview) return;
        
        if (this.config.image.url) {
            preview.innerHTML = `
                <button type="button" class="image-remove-btn" id="removeImageBtn" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${this.config.image.url}" alt="Preview">
                <div class="image-info">
                    <span class="image-name">${this.config.image.name || 'Uploaded image'}</span>
                </div>
            `;
            preview.classList.add('has-image');
        } else {
            preview.innerHTML = '';
            preview.classList.remove('has-image');
        }
    }
    
    removeImage() {
        // Clear image config
        this.config.image.url = '';
        this.config.image.type = '';
        this.config.image.name = '';
        
        // Update preview
        this.updateImagePreview();
        
        // Save and notify
        this.saveConfig();
        this.showNotification('Image removed successfully.');
    }
    
    async openMediaSelector() {
        // Fetch media from API
        let mediaItems = [];
        try {
            const response = await fetch('/api/media?limit=100');
            if (response.ok) {
                const data = await response.json();
                mediaItems = data.media || data.items || data || [];
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        }
        
        // Also fetch folders
        let folders = [];
        try {
            const foldersResponse = await fetch('/api/media/folders');
            if (foldersResponse.ok) {
                const foldersData = await foldersResponse.json();
                folders = foldersData.folders || foldersData || [];
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'email-media-selector-modal';
        modal.innerHTML = `
            <div class="email-media-selector-content">
                <div class="email-media-selector-header">
                    <h3>Select Media</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="email-media-selector-body">
                    <div class="media-sidebar">
                        <input type="text" class="media-search" placeholder="Search media...">
                        <div class="media-tabs">
                            <button class="media-tab active" data-filter="all">All Media</button>
                            <button class="media-tab" data-filter="images">Images</button>
                        </div>
                        <div class="folder-header">FOLDERS</div>
                        <div class="folder-list">
                            <div class="folder-item active" data-folder="all">
                                <i class="fas fa-images"></i> All Media
                                <span class="count">${mediaItems.length}</span>
                            </div>
                            ${folders.map(f => `
                                <div class="folder-item" data-folder="${f.id || f.name}">
                                    <i class="fas fa-folder"></i> ${f.name}
                                    <span class="count">${f.count || 0}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="media-grid-container">
                        <div class="media-grid">
                            ${mediaItems.length === 0 ? `
                                <div class="no-media">
                                    <i class="fas fa-images"></i>
                                    <p>No media found. Upload images in the Media Library section first.</p>
                                </div>
                            ` : mediaItems.map(item => `
                                <div class="media-item" data-url="${item.r2_url || item.url}" data-name="${item.original_name || item.name || 'Image'}" data-folder="${item.folder || 'uncategorized'}">
                                    <img src="${item.r2_url || item.url}" alt="${item.original_name || item.name || ''}" loading="lazy">
                                    <div class="media-item-name">${item.original_name || item.name || 'Image'}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        this.addMediaSelectorStyles();
        
        // Add to document
        document.body.appendChild(modal);
        
        // Handle close
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Handle folder filter
        modal.querySelectorAll('.folder-item').forEach(folder => {
            folder.addEventListener('click', () => {
                modal.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
                folder.classList.add('active');
                const folderId = folder.dataset.folder;
                modal.querySelectorAll('.media-item').forEach(item => {
                    if (folderId === 'all' || item.dataset.folder === folderId) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
        
        // Handle search
        modal.querySelector('.media-search').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            modal.querySelectorAll('.media-item').forEach(item => {
                const name = item.dataset.name.toLowerCase();
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });
        
        // Handle selection
        modal.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const name = item.dataset.name;
                
                this.config.image.url = url;
                this.config.image.name = name;
                this.config.image.type = 'image/jpeg';
                
                this.updateImagePreview();
                this.saveConfig();
                this.showNotification('Image selected: ' + name);
                
                modal.remove();
            });
        });
    }
    
    addMediaSelectorStyles() {
        if (document.getElementById('email-media-selector-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'email-media-selector-styles';
        style.textContent = `
            .email-media-selector-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .email-media-selector-content {
                background: #1e2127;
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .email-media-selector-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #32363f;
            }
            .email-media-selector-header h3 {
                margin: 0;
                color: #fff;
            }
            .email-media-selector-header .close-btn {
                background: none;
                border: none;
                color: #fff;
                font-size: 24px;
                cursor: pointer;
            }
            .email-media-selector-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            .media-sidebar {
                width: 200px;
                background: #171a1f;
                padding: 15px;
                overflow-y: auto;
            }
            .media-search {
                width: 100%;
                padding: 8px 12px;
                background: #252830;
                border: 1px solid #32363f;
                border-radius: 6px;
                color: #fff;
                margin-bottom: 15px;
            }
            .media-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 15px;
            }
            .media-tab {
                flex: 1;
                padding: 8px;
                background: #252830;
                border: none;
                border-radius: 6px;
                color: #a0a0a0;
                cursor: pointer;
                font-size: 12px;
            }
            .media-tab.active {
                background: #e8f24c;
                color: #1e2127;
            }
            .folder-header {
                font-size: 11px;
                color: #a0a0a0;
                margin-bottom: 10px;
                font-weight: 600;
            }
            .folder-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                border-radius: 6px;
                cursor: pointer;
                color: #e0e0e0;
                font-size: 13px;
                margin-bottom: 4px;
            }
            .folder-item:hover {
                background: rgba(232,242,76,0.1);
            }
            .folder-item.active {
                background: rgba(232,242,76,0.2);
                color: #e8f24c;
            }
            .folder-item .count {
                margin-left: auto;
                background: #32363f;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
            }
            .media-grid-container {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            .media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 15px;
            }
            .media-item {
                background: #252830;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .media-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .media-item img {
                width: 100%;
                height: 100px;
                object-fit: cover;
            }
            .media-item-name {
                padding: 8px;
                font-size: 11px;
                color: #a0a0a0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .no-media {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #a0a0a0;
            }
            .no-media i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    updatePreview() {
        // This would update a live preview if implemented
        // For now, we'll just show a notification
        this.showNotification('Preview updated! Changes will apply to the popup.');
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'email-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.innerHTML = `
                .email-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--primary-color, #e8f24c);
                    color: var(--secondary-color, #1e2127);
                    border-radius: 6px;
                    padding: 15px 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    transition: all 0.3s ease;
                    transform: translateY(20px);
                    opacity: 0;
                }
                
                .email-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    loadCSS(path) {
        // Check if already loaded
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
            if (links[i].href.includes(path)) {
                return;
            }
        }
        
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = path;
        document.head.appendChild(link);
    }
}

// Initialize enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the original UI is loaded
    setTimeout(() => {
        window.emailPopupEnhancer = new EmailPopupEnhancer();
    }, 500);
});
