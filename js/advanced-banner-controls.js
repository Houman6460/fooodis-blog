/**
 * Advanced Banner Controls
 * Complete implementation of all banner control functions
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('ad-management-section')) {
        initAdvancedBannerControls();
    }
});

/**
 * Initialize Advanced Banner Controls
 */
function initAdvancedBannerControls() {
    console.log('Initializing Advanced Banner Controls');

    // Initialize all tabs
    initTabs();
    initFrameTab();
    initAnimationTab();
    initCountdownTab();
    initButtonTab();
    initContentTab();

    // Initialize preview
    initPreviewButton();
    initResetButton();
    initApplyButton();

    // Update preview initially
    setTimeout(updateBannerPreview, 500);

    console.log('Advanced Banner Controls initialized');
}

/**
 * Initialize tabs functionality
 */
function initTabs() {
    const tabs = document.querySelectorAll('.panel-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));

            // Show selected tab content
            const selectedContent = document.getElementById(tabId + '-tab');
            if (selectedContent) {
                selectedContent.classList.add('active');
            }

            // Update preview after tab change
            setTimeout(updateBannerPreview, 100);
        });
    });
}

/**
 * Initialize Frame Tab Controls
 */
function initFrameTab() {
    // Corner style control
    const cornerStyle = document.getElementById('corner-style');
    if (cornerStyle) {
        cornerStyle.addEventListener('change', function() {
            const customGroup = document.getElementById('custom-corners-group');
            const radiusGroup = document.getElementById('border-radius-group');

            if (this.value === 'custom') {
                customGroup?.classList.remove('hidden');
                radiusGroup?.classList.add('hidden');
            } else {
                customGroup?.classList.add('hidden');
                radiusGroup?.classList.remove('hidden');
            }
            updateBannerPreview();
        });
    }

    // Border radius slider
    const borderRadius = document.getElementById('banner-border-radius');
    if (borderRadius) {
        borderRadius.addEventListener('input', function() {
            const valueDisplay = document.getElementById('border-radius-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    // Border width slider
    const borderWidth = document.getElementById('border-width');
    if (borderWidth) {
        borderWidth.addEventListener('input', function() {
            const valueDisplay = document.getElementById('border-width-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    // Color inputs
    initColorInput('border-color');
    initColorInput('background-color');
}

/**
 * Initialize Animation Tab Controls
 */
function initAnimationTab() {
    const animationEnabled = document.getElementById('animation-enabled');
    if (animationEnabled) {
        animationEnabled.addEventListener('change', updateBannerPreview);
    }

    const animationType = document.getElementById('animation-type');
    if (animationType) {
        animationType.addEventListener('change', updateBannerPreview);
    }

    // Duration slider
    const duration = document.getElementById('animation-duration');
    if (duration) {
        duration.addEventListener('input', function() {
            const valueDisplay = document.getElementById('animation-duration-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 's';
            }
            updateBannerPreview();
        });
    }

    // Delay slider
    const delay = document.getElementById('animation-delay');
    if (delay) {
        delay.addEventListener('input', function() {
            const valueDisplay = document.getElementById('animation-delay-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 's';
            }
            updateBannerPreview();
        });
    }
}

/**
 * Initialize Countdown Tab Controls
 */
function initCountdownTab() {
    const countdownEnabled = document.getElementById('countdown-enabled');
    if (countdownEnabled) {
        countdownEnabled.addEventListener('change', updateBannerPreview);
    }

    const countdownStyle = document.getElementById('countdown-style');
    if (countdownStyle) {
        countdownStyle.addEventListener('change', updateBannerPreview);
    }

    const endDate = document.getElementById('countdown-end-date');
    if (endDate) {
        // Set default end date (3 days from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        endDate.value = defaultDate.toISOString().slice(0, 16);

        endDate.addEventListener('change', updateBannerPreview);
    }
}

/**
 * Initialize Button Tab Controls
 */
function initButtonTab() {
    const buttonEnabled = document.getElementById('button-enabled');
    if (buttonEnabled) {
        buttonEnabled.addEventListener('change', updateBannerPreview);
    }

    const buttonText = document.getElementById('button-text');
    if (buttonText) {
        buttonText.addEventListener('input', updateBannerPreview);
    }

    const buttonUrl = document.getElementById('button-url');
    if (buttonUrl) {
        buttonUrl.addEventListener('input', updateBannerPreview);
    }

    const buttonNewTab = document.getElementById('button-new-tab');
    if (buttonNewTab) {
        buttonNewTab.addEventListener('change', updateBannerPreview);
    }

    // Color inputs
    const buttonBg = document.getElementById('button-background');
    if (buttonBg) {
        buttonBg.addEventListener('input', updateBannerPreview);
    }

    const buttonTextColor = document.getElementById('button-text-color');
    if (buttonTextColor) {
        buttonTextColor.addEventListener('input', updateBannerPreview);
    }

    // Button size controls
    const buttonFontSize = document.getElementById('button-font-size');
    if (buttonFontSize) {
        buttonFontSize.addEventListener('input', function() {
            const valueDisplay = document.getElementById('button-font-size-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    const buttonPadding = document.getElementById('button-padding');
    if (buttonPadding) {
        buttonPadding.addEventListener('change', updateBannerPreview);
    }

    const buttonBorderRadius = document.getElementById('button-border-radius');
    if (buttonBorderRadius) {
        buttonBorderRadius.addEventListener('input', function() {
            const valueDisplay = document.getElementById('button-border-radius-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    const buttonMaxWidth = document.getElementById('button-max-width');
    if (buttonMaxWidth) {
        buttonMaxWidth.addEventListener('input', function() {
            const valueDisplay = document.getElementById('button-max-width-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    const buttonMinWidth = document.getElementById('button-min-width');
    if (buttonMinWidth) {
        buttonMinWidth.addEventListener('input', function() {
            const valueDisplay = document.getElementById('button-min-width-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value + 'px';
            }
            updateBannerPreview();
        });
    }

    const buttonWidthMode = document.getElementById('button-width-mode');
    if (buttonWidthMode) {
        buttonWidthMode.addEventListener('change', updateBannerPreview);
    }
}

/**
 * Initialize Content Tab Controls
 */
function initContentTab() {
    const titleInput = document.getElementById('adTitle');
    if (titleInput) {
        titleInput.addEventListener('input', updateBannerPreview);
    }

    const subtitleInput = document.getElementById('adSubtitle');
    if (subtitleInput) {
        subtitleInput.addEventListener('input', updateBannerPreview);
    }

    const textInput = document.getElementById('adText');
    if (textInput) {
        textInput.addEventListener('input', updateBannerPreview);
    }
}

/**
 * Initialize color input with preview
 */
function initColorInput(inputId) {
    const colorInput = document.getElementById(inputId);
    const preview = document.getElementById(inputId + '-preview');

    if (colorInput && preview) {
        // Set initial preview
        preview.style.backgroundColor = colorInput.value;

        // Update on change
        colorInput.addEventListener('input', function() {
            preview.style.backgroundColor = this.value;
            updateBannerPreview();
        });
    }
}

/**
 * Update banner preview
 */
function updateBannerPreview() {
    console.log('Updating banner preview');

    const previewContainer = document.getElementById('banner-preview-container');
    if (!previewContainer) {
        console.error('Preview container not found');
        return;
    }

    // Get current configuration
    const config = getCurrentConfig();

    // Generate CSS variables
    const cssVars = generateCssVariables(config);

    // Generate banner HTML
    const bannerHTML = generateBannerHTML(config, cssVars);

    // Apply styles to document root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Update preview container
    previewContainer.innerHTML = bannerHTML;

    // Initialize countdown if enabled
    if (config.countdown && config.countdown.enabled) {
        const countdownContainer = previewContainer.querySelector('.banner-countdown-container');
        if (countdownContainer && window.initCountdown) {
            window.initCountdown(countdownContainer);
        }
    }
}

/**
 * Get current configuration from form inputs
 */
function getCurrentConfig() {
    const config = {
        // Frame settings
        cornerStyle: getInputValue('corner-style', 'rounded'),
        borderRadius: getInputValue('banner-border-radius', 8),
        borderWidth: getInputValue('border-width', 1),
        borderStyle: getInputValue('border-style', 'solid'),
        borderColor: getInputValue('border-color', '#e8f24c'),
        backgroundColor: getInputValue('background-color', '#1e2127'),

        // Animation settings
        animation: {
            enabled: getCheckboxValue('animation-enabled', true),
            type: getInputValue('animation-type', 'fade'),
            duration: getInputValue('animation-duration', 0.5),
            delay: getInputValue('animation-delay', 0.2)
        },

        // Countdown settings
        countdown: {
            enabled: getCheckboxValue('countdown-enabled', false),
            endDate: getInputValue('countdown-end-date', ''),
            style: getInputValue('countdown-style', 'boxes')
        },

        // Button settings
        button: {
            enabled: getCheckboxValue('button-enabled', true),
            text: getInputValue('button-text', 'Learn More'),
            url: getInputValue('button-url', '#'),
            openInNewTab: getCheckboxValue('button-new-tab', true),
            backgroundColor: getInputValue('button-background', '#e8f24c'),
            textColor: getInputValue('button-text-color', '#1e2127'),
            fontSize: getInputValue('button-font-size', 16),
            padding: getInputValue('button-padding', '12px 24px'),
            borderRadius: getInputValue('button-border-radius', 4),
            maxWidth: getInputValue('button-max-width', 'none'),
        },

        // Content settings
        content: {
            title: getInputValue('adTitle', 'Special Offer'),
            subtitle: getInputValue('adSubtitle', 'Limited Time Only'),
            text: getInputValue('adText', 'Don\'t miss out on this amazing opportunity!'),
            imageUrl: getImageUrl()
        },

        // Layout
        layout: getSelectedLayout()
    };

    return config;
}

/**
 * Helper function to get input value
 */
function getInputValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.value : defaultValue;
}

/**
 * Helper function to get checkbox value
 */
function getCheckboxValue(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? element.checked : defaultValue;
}

/**
 * Get selected layout
 */
function getSelectedLayout() {
    const selectedLayout = document.querySelector('.layout-option input[type="radio"]:checked');
    return selectedLayout ? selectedLayout.value : 'layout-1';
}

/**
 * Get image URL from preview or input
 */
function getImageUrl() {
    const preview = document.getElementById('adImagePreview');
    if (preview && preview.src && !preview.src.includes('blank')) {
        return preview.src;
    }
    return '';
}

/**
 * Generate CSS variables from config
 */
function generateCssVariables(config) {
    const vars = {
        '--banner-border-radius': config.borderRadius + 'px',
        '--banner-border-width': config.borderWidth + 'px',
        '--banner-border-style': config.borderStyle,
        '--banner-border-color': config.borderColor,
        '--banner-background-color': config.backgroundColor,
        '--button-background-color': config.button.backgroundColor,
        '--button-text-color': config.button.textColor,
        '--button-display': config.button.enabled ? 'inline-block' : 'none',
        '--countdown-display': config.countdown.enabled ? 'flex' : 'none',
        '--button-font-size': config.button.fontSize + 'px',
        '--button-padding': config.button.padding,
        '--button-border-radius': config.button.borderRadius + 'px',
        '--button-max-width': config.button.maxWidth,
        '--button-min-width': getInputValue('button-min-width', 120) + 'px',
        '--button-width-mode': getInputValue('button-width-mode', 'auto')
    };

    return vars;
}

/**
 * Generate banner HTML
 */
function generateBannerHTML(config, cssVars) {
    const title = config.content.title || 'Banner Title';
    const subtitle = config.content.subtitle || 'Banner Subtitle';
    const text = config.content.text || 'Banner text content';
    const imageUrl = config.content.imageUrl;
    const buttonText = config.button.text || 'Learn More';

    let layoutHTML = '';

    switch (config.layout) {
        case 'layout-1':
            layoutHTML = `
                <div class="advanced-banner-layout layout-1">
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="advanced-banner-button">${buttonText}</a>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="image-placeholder">Image Preview</div>'}
                    </div>
                </div>
            `;
            break;
        case 'layout-2':
            layoutHTML = `
                <div class="advanced-banner-layout layout-2">
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="image-placeholder">Image Preview</div>'}
                    </div>
                    <div class="banner-text-content-bottom">
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="advanced-banner-button">${buttonText}</a>
                    </div>
                </div>
            `;
            break;
        case 'layout-3':
            layoutHTML = `
                <div class="advanced-banner-layout layout-3">
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="image-placeholder">Image Preview</div>'}
                    </div>
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="advanced-banner-button">${buttonText}</a>
                    </div>
                </div>
            `;
            break;
        default:
            layoutHTML = `
                <div class="advanced-banner-layout layout-1">
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="advanced-banner-button">${buttonText}</a>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : '<div class="image-placeholder">Image Preview</div>'}
                    </div>
                </div>
            `;
    }

    return `
        <div class="advanced-advertising-banner" style="${Object.entries(cssVars).map(([key, value]) => `${key}: ${value}`).join('; ')}">
            <div class="advanced-banner-inner">
                ${layoutHTML}
            </div>
        </div>
    `;
}

/**
 * Initialize preview button
 */
function initPreviewButton() {
    const previewBtn = document.getElementById('preview-banner');
    if (previewBtn) {
        previewBtn.addEventListener('click', showBannerPreviewModal);
    }
}

/**
 * Initialize reset button
 */
function initResetButton() {
    const resetBtn = document.getElementById('reset-banner');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all banner settings to default?')) {
                resetBannerToDefaults();
            }
        });
    }
}

/**
 * Initialize apply button
 */
function initApplyButton() {
    const applyBtn = document.getElementById('apply-banner-changes');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            saveBannerSettings();
        });
    }
}

/**
 * Show banner preview modal
 */
function showBannerPreviewModal() {
    const modal = document.getElementById('adPreviewModal');
    if (modal) {
        const config = getCurrentConfig();
        const cssVars = generateCssVariables(config);
        const bannerHTML = generateBannerHTML(config, cssVars);

        const modalContent = modal.querySelector('.ad-preview-content');
        if (modalContent) {
            modalContent.innerHTML = bannerHTML;
        }

        modal.style.display = 'flex';

        // Initialize countdown in modal
        if (config.countdown && config.countdown.enabled) {
            const countdownContainer = modal.querySelector('.banner-countdown-container');
            if (countdownContainer && window.initCountdown) {
                window.initCountdown(countdownContainer);
            }
        }
    }
}

/**
 * Reset banner to defaults
 */
function resetBannerToDefaults() {
    // Reset all form inputs to default values
    const inputs = {
        'corner-style': 'rounded',
        'banner-border-radius': 8,
        'border-width': 1,
        'border-style': 'solid',
        'border-color': '#e8f24c',
        'background-color': '#1e2127',
        'animation-enabled': true,
        'animation-type': 'fade',
        'animation-duration': 0.5,
        'animation-delay': 0.2,
        'countdown-enabled': false,
        'countdown-style': 'boxes',
        'button-enabled': true,
        'button-text': 'Learn More',
        'button-url': '#',
        'button-new-tab': true,
        'button-background': '#e8f24c',
        'button-text-color': '#1e2127',
        'adTitle': 'Special Offer',
        'adSubtitle': 'Limited Time Only',
        'adText': 'Don\'t miss out on this amazing opportunity!',
        'button-font-size': 16,
        'button-padding': '12px 24px',
        'button-border-radius': 4,
        'button-max-width': 'none'
    };

    Object.entries(inputs).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });

    // Reset layout selection
    const layout1 = document.getElementById('layout1');
    if (layout1) {
        layout1.checked = true;
    }

    // Update preview
    updateBannerPreview();

    // Show notification
    showNotification('Banner settings reset to defaults', 'success');
}

/**
 * Save banner settings
 */
function saveBannerSettings() {
    const config = getCurrentConfig();

    // Save to localStorage
    try {
        localStorage.setItem('advanced-banner-config', JSON.stringify(config));

        // Also sync with basic banner system
        if (window.adData) {
            window.adData.title = config.content.title;
            window.adData.subtitle = config.content.subtitle;
            window.adData.text = config.content.text;
            window.adData.imageUrl = config.content.imageUrl;
            window.adData.layout = config.layout;

            if (window.saveAdData) {
                window.saveAdData();
            }
        }

        showNotification('Banner settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving banner settings:', error);
        showNotification('Error saving banner settings', 'error');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `banner-notification ${type} show`;
    notification.innerHTML = `
        <div class="banner-notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Export functions for use in other scripts
window.updateBannerPreview = updateBannerPreview;
window.getCurrentConfig = getCurrentConfig;
window.showBannerPreviewModal = showBannerPreviewModal;
window.initAdvancedBannerControls = initAdvancedBannerControls;