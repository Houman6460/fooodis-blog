
/**
 * Advertising Management System
 * Isolated component for managing advertising banners with enhanced features
 */

class AdvertisingManager {
    constructor() {
        this.config = {
            enabled: false,
            layout: 'horizontal',
            content: {
                title: '',
                subtitle: '',
                description: '',
                imageUrl: ''
            },
            design: {
                backgroundColor: '#1e2127',
                borderColor: '#e8f24c',
                borderRadius: 8,
                borderWidth: 1,
                titleColor: '#e8f24c',
                textColor: '#ffffff'
            },
            countdown: {
                enabled: false,
                endDate: '',
                style: 'boxes',
                color: '#e8f24c'
            },
            button: {
                enabled: true,
                text: 'Learn More',
                url: '#',
                backgroundColor: '#e8f24c',
                textColor: '#1e2127',
                radius: 25
            },
            animation: {
                enabled: true,
                type: 'fade',
                duration: 0.8
            }
        };
        
        this.storageKey = 'fooodis-advertising-config';
        this.previewContainer = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('Initializing Advertising Manager...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.loadConfig();
        this.bindEvents();
        this.initializeTabs();
        this.updateUI();
        this.updatePreview();
        
        this.isInitialized = true;
        console.log('Advertising Manager initialized successfully');
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                this.config = { ...this.config, ...parsedConfig };
                console.log('Configuration loaded:', this.config);
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    saveConfig() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
            console.log('Configuration saved');
            this.showNotification('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving configuration:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    bindEvents() {
        // Main toggle
        const mainToggle = document.getElementById('advBannerToggle');
        if (mainToggle) {
            mainToggle.checked = this.config.enabled;
            mainToggle.addEventListener('change', (e) => {
                this.config.enabled = e.target.checked;
                this.updateStatusDisplay();
                this.updatePreview();
                this.saveConfig();
            });
        }

        // Content inputs
        this.bindContentEvents();
        this.bindDesignEvents();
        this.bindLayoutEvents();
        this.bindCountdownEvents();
        this.bindButtonEvents();
        this.bindAnimationEvents();
        this.bindActionButtons();
        this.bindImageUpload();
    }

    bindContentEvents() {
        const inputs = {
            'advTitle': 'content.title',
            'advSubtitle': 'content.subtitle',
            'advDescription': 'content.description'
        };

        Object.entries(inputs).forEach(([id, path]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = this.getNestedValue(path);
                input.addEventListener('input', (e) => {
                    this.setNestedValue(path, e.target.value);
                    this.updatePreview();
                });
            }
        });
    }

    bindDesignEvents() {
        const colorInputs = {
            'advBgColor': 'design.backgroundColor',
            'advBorderColor': 'design.borderColor',
            'advTitleColor': 'design.titleColor',
            'advTextColor': 'design.textColor'
        };

        Object.entries(colorInputs).forEach(([id, path]) => {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Display');
            
            if (input && display) {
                input.value = this.getNestedValue(path);
                display.textContent = this.getNestedValue(path);
                
                input.addEventListener('input', (e) => {
                    this.setNestedValue(path, e.target.value);
                    display.textContent = e.target.value;
                    this.updatePreview();
                });
            }
        });

        const rangeInputs = {
            'advBorderRadius': 'design.borderRadius',
            'advBorderWidth': 'design.borderWidth'
        };

        Object.entries(rangeInputs).forEach(([id, path]) => {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Value');
            
            if (input && display) {
                input.value = this.getNestedValue(path);
                display.textContent = this.getNestedValue(path) + 'px';
                
                input.addEventListener('input', (e) => {
                    this.setNestedValue(path, parseInt(e.target.value));
                    display.textContent = e.target.value + 'px';
                    this.updatePreview();
                });
            }
        });
    }

    bindLayoutEvents() {
        const layoutOptions = document.querySelectorAll('.layout-option');
        layoutOptions.forEach(option => {
            if (option.dataset.layout === this.config.layout) {
                option.classList.add('active');
            }
            
            option.addEventListener('click', () => {
                layoutOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.config.layout = option.dataset.layout;
                this.updatePreview();
            });
        });
    }

    bindCountdownEvents() {
        const countdownEnabled = document.getElementById('advCountdownEnabled');
        if (countdownEnabled) {
            countdownEnabled.checked = this.config.countdown.enabled;
            countdownEnabled.addEventListener('change', (e) => {
                this.config.countdown.enabled = e.target.checked;
                this.updatePreview();
            });
        }

        const countdownDate = document.getElementById('advCountdownDate');
        if (countdownDate) {
            if (this.config.countdown.endDate) {
                countdownDate.value = this.config.countdown.endDate;
            }
            countdownDate.addEventListener('change', (e) => {
                this.config.countdown.endDate = e.target.value;
                this.updatePreview();
            });
        }

        const countdownStyle = document.getElementById('advCountdownStyle');
        if (countdownStyle) {
            countdownStyle.value = this.config.countdown.style;
            countdownStyle.addEventListener('change', (e) => {
                this.config.countdown.style = e.target.value;
                this.updatePreview();
            });
        }

        const countdownColor = document.getElementById('advCountdownColor');
        const countdownColorDisplay = document.getElementById('advCountdownColorDisplay');
        if (countdownColor && countdownColorDisplay) {
            countdownColor.value = this.config.countdown.color;
            countdownColorDisplay.textContent = this.config.countdown.color;
            
            countdownColor.addEventListener('input', (e) => {
                this.config.countdown.color = e.target.value;
                countdownColorDisplay.textContent = e.target.value;
                this.updatePreview();
            });
        }
    }

    bindButtonEvents() {
        const buttonEnabled = document.getElementById('advButtonEnabled');
        if (buttonEnabled) {
            buttonEnabled.checked = this.config.button.enabled;
            buttonEnabled.addEventListener('change', (e) => {
                this.config.button.enabled = e.target.checked;
                this.updatePreview();
            });
        }

        const buttonInputs = {
            'advButtonText': 'button.text',
            'advButtonUrl': 'button.url'
        };

        Object.entries(buttonInputs).forEach(([id, path]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = this.getNestedValue(path);
                input.addEventListener('input', (e) => {
                    this.setNestedValue(path, e.target.value);
                    this.updatePreview();
                });
            }
        });

        const buttonColors = {
            'advButtonBgColor': 'button.backgroundColor',
            'advButtonTextColor': 'button.textColor'
        };

        Object.entries(buttonColors).forEach(([id, path]) => {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Display');
            
            if (input && display) {
                input.value = this.getNestedValue(path);
                display.textContent = this.getNestedValue(path);
                
                input.addEventListener('input', (e) => {
                    this.setNestedValue(path, e.target.value);
                    display.textContent = e.target.value;
                    this.updatePreview();
                });
            }
        });

        const buttonRadius = document.getElementById('advButtonRadius');
        const buttonRadiusValue = document.getElementById('advButtonRadiusValue');
        if (buttonRadius && buttonRadiusValue) {
            buttonRadius.value = this.config.button.radius;
            buttonRadiusValue.textContent = this.config.button.radius + 'px';
            
            buttonRadius.addEventListener('input', (e) => {
                this.config.button.radius = parseInt(e.target.value);
                buttonRadiusValue.textContent = e.target.value + 'px';
                this.updatePreview();
            });
        }
    }

    bindAnimationEvents() {
        const animationEnabled = document.getElementById('advAnimationEnabled');
        if (animationEnabled) {
            animationEnabled.checked = this.config.animation.enabled;
            animationEnabled.addEventListener('change', (e) => {
                this.config.animation.enabled = e.target.checked;
                this.updatePreview();
            });
        }

        const animationType = document.getElementById('advAnimationType');
        if (animationType) {
            animationType.value = this.config.animation.type;
            animationType.addEventListener('change', (e) => {
                this.config.animation.type = e.target.value;
                this.updatePreview();
            });
        }

        const animationDuration = document.getElementById('advAnimationDuration');
        const animationDurationValue = document.getElementById('advAnimationDurationValue');
        if (animationDuration && animationDurationValue) {
            animationDuration.value = this.config.animation.duration;
            animationDurationValue.textContent = this.config.animation.duration + 's';
            
            animationDuration.addEventListener('input', (e) => {
                this.config.animation.duration = parseFloat(e.target.value);
                animationDurationValue.textContent = e.target.value + 's';
                this.updatePreview();
            });
        }
    }

    bindActionButtons() {
        const resetBtn = document.getElementById('advResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        const saveBtn = document.getElementById('advSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveConfig());
        }

        const publishBtn = document.getElementById('advPublishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishToLive());
        }

        const previewModalBtn = document.getElementById('advPreviewModal');
        if (previewModalBtn) {
            previewModalBtn.addEventListener('click', () => this.showPreviewModal());
        }
    }

    bindImageUpload() {
        const uploadArea = document.getElementById('advImageUpload');
        const imageInput = document.getElementById('advImageInput');
        const imagePreview = document.getElementById('advImagePreview');

        if (uploadArea && imageInput && imagePreview) {
            uploadArea.addEventListener('click', () => imageInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageUpload(files[0]);
                }
            });

            imageInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });

            // Show existing image
            if (this.config.content.imageUrl) {
                imagePreview.src = this.config.content.imageUrl;
                imagePreview.classList.add('show');
            }
        }
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.config.content.imageUrl = e.target.result;
            
            const imagePreview = document.getElementById('advImagePreview');
            if (imagePreview) {
                imagePreview.src = e.target.result;
                imagePreview.classList.add('show');
            }
            
            this.updatePreview();
            this.showNotification('Image uploaded successfully', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.adv-tab');
        const panels = document.querySelectorAll('.adv-tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab + '-panel';
                
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const panel = document.getElementById(targetPanel);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }

    updateUI() {
        this.updateStatusDisplay();
        
        // Update all form fields with current config values
        Object.keys(this.config).forEach(key => {
            if (typeof this.config[key] === 'object') {
                Object.keys(this.config[key]).forEach(subKey => {
                    const element = document.querySelector(`[data-config="${key}.${subKey}"]`);
                    if (element) {
                        element.value = this.config[key][subKey];
                    }
                });
            }
        });
    }

    updateStatusDisplay() {
        const statusIcon = document.getElementById('adv-status-icon');
        const statusText = document.getElementById('adv-status-text');
        const statusDesc = document.getElementById('adv-status-desc');

        if (statusIcon && statusText && statusDesc) {
            if (this.config.enabled) {
                statusIcon.className = 'fas fa-toggle-on';
                statusIcon.classList.remove('inactive');
                statusText.textContent = 'Banner Active';
                statusDesc.textContent = 'Your advertising banner is live on the website';
            } else {
                statusIcon.className = 'fas fa-toggle-off';
                statusIcon.classList.add('inactive');
                statusText.textContent = 'Banner Disabled';
                statusDesc.textContent = 'Click to enable advertising banner';
            }
        }
    }

    updatePreview() {
        const container = document.getElementById('advPreviewContainer');
        if (!container) return;

        container.innerHTML = this.generateBannerHTML();
        
        // Initialize countdown if enabled
        if (this.config.countdown.enabled && this.config.countdown.endDate) {
            this.initializeCountdown(container);
        }
    }

    generateBannerHTML() {
        if (!this.config.enabled) {
            return '<div class="preview-disabled">Banner is currently disabled</div>';
        }

        const styles = this.generateCSSStyles();
        
        return `
            <div class="advertising-banner-preview" style="${styles}">
                <div class="banner-content layout-${this.config.layout}">
                    <div class="banner-text">
                        <h3 class="banner-title">${this.config.content.title || 'Your Banner Title'}</h3>
                        <h4 class="banner-subtitle">${this.config.content.subtitle || 'Subtitle text here'}</h4>
                        ${this.config.countdown.enabled ? this.generateCountdownHTML() : ''}
                        <p class="banner-description">${this.config.content.description || 'Your banner description goes here.'}</p>
                        ${this.config.button.enabled ? this.generateButtonHTML() : ''}
                    </div>
                    ${this.config.content.imageUrl ? `
                        <div class="banner-image">
                            <img src="${this.config.content.imageUrl}" alt="Banner Image">
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    generateCSSStyles() {
        return `
            background-color: ${this.config.design.backgroundColor};
            border: ${this.config.design.borderWidth}px solid ${this.config.design.borderColor};
            border-radius: ${this.config.design.borderRadius}px;
            color: ${this.config.design.textColor};
            padding: 20px;
            margin: 10px 0;
            animation: ${this.config.animation.enabled ? this.config.animation.type : 'none'} ${this.config.animation.duration}s ease-in-out;
        `;
    }

    generateCountdownHTML() {
        return `
            <div class="banner-countdown countdown-${this.config.countdown.style}" style="color: ${this.config.countdown.color};">
                <div class="countdown-display">
                    <span class="countdown-time" id="countdown-days">00</span>
                    <span class="countdown-label">Days</span>
                    <span class="countdown-time" id="countdown-hours">00</span>
                    <span class="countdown-label">Hours</span>
                    <span class="countdown-time" id="countdown-minutes">00</span>
                    <span class="countdown-label">Minutes</span>
                    <span class="countdown-time" id="countdown-seconds">00</span>
                    <span class="countdown-label">Seconds</span>
                </div>
            </div>
        `;
    }

    generateButtonHTML() {
        return `
            <a href="${this.config.button.url}" class="banner-button" style="
                background-color: ${this.config.button.backgroundColor};
                color: ${this.config.button.textColor};
                border-radius: ${this.config.button.radius}px;
                padding: 12px 24px;
                text-decoration: none;
                display: inline-block;
                margin-top: 15px;
                font-weight: 600;
                transition: all 0.3s ease;
            ">${this.config.button.text}</a>
        `;
    }

    initializeCountdown(container) {
        if (!this.config.countdown.endDate) return;

        const endDate = new Date(this.config.countdown.endDate);
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) {
                container.querySelectorAll('.countdown-time').forEach(el => el.textContent = '00');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const daysEl = container.querySelector('#countdown-days');
            const hoursEl = container.querySelector('#countdown-hours');
            const minutesEl = container.querySelector('#countdown-minutes');
            const secondsEl = container.querySelector('#countdown-seconds');

            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    publishToLive() {
        // Save current config
        this.saveConfig();
        
        // Inject banner into live site
        this.injectBannerToLive();
        
        this.showNotification('Banner published successfully!', 'success');
    }

    injectBannerToLive() {
        // This would inject the banner into the actual blog page
        // Implementation depends on your blog structure
        console.log('Publishing banner to live site with config:', this.config);
        
        // Store the config for the blog page to read
        localStorage.setItem('live-advertising-banner', JSON.stringify(this.config));
        
        // Trigger any necessary updates on the blog page
        if (window.opener || window.parent !== window) {
            // If opened in popup or iframe, communicate with parent
            const message = {
                type: 'BANNER_UPDATED',
                config: this.config
            };
            
            try {
                window.postMessage(message, '*');
            } catch (error) {
                console.log('Could not post message to parent window');
            }
        }
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
            this.config = {
                enabled: false,
                layout: 'horizontal',
                content: {
                    title: '',
                    subtitle: '',
                    description: '',
                    imageUrl: ''
                },
                design: {
                    backgroundColor: '#1e2127',
                    borderColor: '#e8f24c',
                    borderRadius: 8,
                    borderWidth: 1,
                    titleColor: '#e8f24c',
                    textColor: '#ffffff'
                },
                countdown: {
                    enabled: false,
                    endDate: '',
                    style: 'boxes',
                    color: '#e8f24c'
                },
                button: {
                    enabled: true,
                    text: 'Learn More',
                    url: '#',
                    backgroundColor: '#e8f24c',
                    textColor: '#1e2127',
                    radius: 25
                },
                animation: {
                    enabled: true,
                    type: 'fade',
                    duration: 0.8
                }
            };
            
            this.updateUI();
            this.updatePreview();
            this.saveConfig();
            this.showNotification('Settings reset to defaults', 'info');
        }
    }

    showPreviewModal() {
        // Create and show a modal with full preview
        const modal = document.createElement('div');
        modal.className = 'advertising-preview-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Banner Preview</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${this.generateBannerHTML()}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .advertising-preview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-backdrop {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .modal-content {
                background: white;
                border-radius: 8px;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
            }
            .modal-header {
                padding: 20px;
                border-bottom: 1px solid #ddd;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            .modal-body {
                padding: 20px;
            }
        `;
        document.head.appendChild(style);
        
        // Bind close events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            animation: 'slideInRight 0.3s ease-out'
        });
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    getNestedValue(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }

    setNestedValue(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this.config);
        target[lastKey] = value;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the advertising section
    const advertisingSection = document.getElementById('advertising-section');
    if (advertisingSection) {
        window.advertisingManager = new AdvertisingManager();
    }
});

// Export for use in other scripts
window.AdvertisingManager = AdvertisingManager;
