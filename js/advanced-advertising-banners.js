/**
 * Advanced Advertising Banners
 * Enhanced implementation with shape control, animation modes, countdown timers,
 * button styling, and improved UI/UX.
 */

// Advanced banner configuration with default values
let advancedBannerConfig = {
    // Banner frame settings
    enabled: false,
    layout: 'layout-1',
    borderRadius: 8, // px
    cornerStyle: 'rounded', // rounded, sharp, custom
    customCorners: {
        topLeft: 8,
        topRight: 8,
        bottomLeft: 8,
        bottomRight: 8
    },
    borderWidth: 1, // px
    borderStyle: 'solid', // solid, dashed, dotted
    borderColor: '#e8f24c',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#1e2127',

    // Animation settings
    animation: {
        enabled: true,
        type: 'fade', // fade, slide, pulse, none
        duration: 0.5, // seconds
        delay: 0.2, // seconds
        repeat: false,
        infinite: false
    },

    // Countdown settings
    countdown: {
        enabled: false,
        endDate: '', // Will be set to 3 days from now by default
        style: 'boxes', // boxes, simple, minimal
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
        backgroundColor: '#2a2e36',
        textColor: '#ffffff',
        accentColor: '#e8f24c',
        borderRadius: 5,
        animation: true
    },

    // Button settings
    button: {
        enabled: true,
        text: 'Learn More',
        url: '#',
        openInNewTab: true,
        backgroundColor: '#e8f24c',
        textColor: '#1e2127',
        borderRadius: 30,
        borderWidth: 0,
        borderColor: 'transparent',
        padding: '12px 25px',
        hoverEffect: 'scale', // scale, darken, glow, none
        animation: 'pulse', // pulse, bounce, shake, none
        fontSize: 16,
        fontWeight: 'bold'
    },

    // Content settings
    content: {
        title: '',
        subtitle: '',
        text: '',
        imageUrl: '',
        titleColor: '#e8f24c',
        subtitleColor: '#ffffff',
        textColor: '#cccccc',
        alignment: 'left', // left, center, right
        titleFontSize: 28,
        subtitleFontSize: 18,
        textFontSize: 16
    }
};

// Storage key for advanced banner data
const ADVANCED_BANNER_STORAGE_KEY = 'fooodis-advanced-banner';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initAdvancedBannerSystem();
});

/**
 * Initialize Advanced Banner System
 */
function initAdvancedBannerSystem() {
    // Load saved configuration
    loadAdvancedBannerConfig();

    // Sync with basic banner system first
    syncWithBasicBannerSystem();

    // Initialize tabs
    initTabs();

    // Initialize each settings tab
    initFrameTab();
    initAnimationTab();
    initCountdownTab();
    initButtonTab();
    initContentTab();

    // Initialize preview
    updateBannerPreview();

    // Initialize banner reset functionality
    initResetButton();

    // Initialize preview in modal
    initPreviewModal();

    // Initialize apply button
    initApplyButton();

    // Now update the main banner content fields with our values
    updateMainBannerFields();

    console.log('Advanced Banner System initialized');
}

/**
 * Update main banner fields with advanced banner settings
 */
function updateMainBannerFields() {
    const titleInput = document.getElementById('adTitle');
    const subtitleInput = document.getElementById('adSubtitle');
    const textInput = document.getElementById('adText');
    const layoutInputs = document.querySelectorAll('.layout-option input[type="radio"]');
    const toggleSwitch = document.getElementById('adToggle');

    // Update content fields
    if (titleInput && advancedBannerConfig.content.title) {
        titleInput.value = advancedBannerConfig.content.title;
    }

    if (subtitleInput && advancedBannerConfig.content.subtitle) {
        subtitleInput.value = advancedBannerConfig.content.subtitle;
    }

    if (textInput && advancedBannerConfig.content.text) {
        textInput.value = advancedBannerConfig.content.text;
    }

    // Update layout selection
    if (layoutInputs.length > 0) {
        layoutInputs.forEach(input => {
            if (input.value === advancedBannerConfig.layout) {
                input.checked = true;
            }
        });
    }

    // Update toggle state
    if (toggleSwitch) {
        toggleSwitch.checked = advancedBannerConfig.enabled;
    }

    // Update the basic banner data
    if (typeof window.adData === 'object' || typeof adData === 'object') {
        const basicData = window.adData || adData;
        basicData.title = advancedBannerConfig.content.title;
        basicData.subtitle = advancedBannerConfig.content.subtitle;
        basicData.text = advancedBannerConfig.content.text;
        basicData.imageUrl = advancedBannerConfig.content.imageUrl;
        basicData.layout = advancedBannerConfig.layout;
        basicData.enabled = advancedBannerConfig.enabled;
        addAdvancedBannerControls();
    }
}

/**
 * Load advanced banner configuration from storage
 */
function loadAdvancedBannerConfig() {
    try {
        // Try to load from StorageManager first
        if (window.StorageManager) {
            const savedConfig = window.StorageManager.load('advanced-banner', {
                defaultValue: null,
                onSuccess: function(data) {
                    console.log('Advanced banner config loaded successfully via StorageManager');
                },
                onError: function(error) {
                    console.error('Error loading advanced banner config via StorageManager:', error);
                }
            });

            if (savedConfig) {
                // Update configuration with saved values
                mergeConfigs(advancedBannerConfig, savedConfig);
                console.log('Advanced banner config loaded from StorageManager');
                return;
            }
        }

        // Fallback to localStorage
        const savedData = localStorage.getItem(ADVANCED_BANNER_STORAGE_KEY);
        if (savedData) {
            const parsedConfig = JSON.parse(savedData);
            // Update configuration with saved values
            mergeConfigs(advancedBannerConfig, parsedConfig);
            console.log('Advanced banner config loaded from localStorage');
        } else {
            console.log('No saved advanced banner config found, using defaults');

            // Set default countdown end date (3 days from now)
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 3);
            advancedBannerConfig.countdown.endDate = endDate.toISOString();

            // Save default configuration
            saveAdvancedBannerConfig();
        }
    } catch (error) {
        console.error('Error loading advanced banner config:', error);
    }
}

/**
 * Save advanced banner configuration to storage
 */
function saveAdvancedBannerConfig() {
    try {
        // Create a copy of the config to avoid modifying the original
        const configToSave = JSON.parse(JSON.stringify(advancedBannerConfig));

        // Try to save using StorageManager first
        if (window.StorageManager) {
            window.StorageManager.save('advanced-banner', configToSave, {
                compress: false,
                onSuccess: function() {
                    console.log('Advanced banner config saved successfully via StorageManager');
                    showNotification('Banner settings saved successfully', 'success');
                },
                onError: function(error) {
                    console.error('Error saving advanced banner config via StorageManager:', error);
                    showNotification('Error saving banner settings', 'error');
                }
            });
        }

        // Also save to localStorage as fallback
        localStorage.setItem(ADVANCED_BANNER_STORAGE_KEY, JSON.stringify(configToSave));
        console.log('Advanced banner config saved to localStorage');

        // Sync changes to basic banner system
        syncChangesToBasicBanner();

        // Update preview if available
        if (document.getElementById('banner-preview-container')) {
            updateBannerPreview();
        }

        return true;
    } catch (error) {
        console.error('Error saving advanced banner config:', error);
        showNotification('Error saving banner settings', 'error');
        return false;
    }
}

/**
 * Merge source config into target config, preserving nested objects
 */
function mergeConfigs(target, source) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // If the property is an object, recursively merge
                if (!target[key]) target[key] = {};
                mergeConfigs(target[key], source[key]);
            } else {
                // Otherwise just copy the value
                target[key] = source[key];
            }
        }
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Check if we can use the dashboard notification system
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }

    // Fallback to simple alert
    alert(message);
}

/**
 * Inject the advanced banner into the blog page
 */
function injectAdvancedBanner() {
    console.log('Injecting advanced banner...');

    // Export functions for use in other scripts
    window.updateBannerPreview = updateBannerPreview;
    window.getCurrentConfig = getCurrentConfig;
    window.showBannerPreviewModal = showBannerPreviewModal;
    window.initCountdown = initCountdown;
    window.generateCssVariables = generateCssVariables;
    window.generateBannerHTML = generateBannerHTML;

    // Find or create the banner container
    let bannerContainer = document.getElementById('advertisingBannerContainer');
    if (!bannerContainer) {
        // Create container if it doesn't exist
        bannerContainer = document.createElement('div');
        bannerContainer.id = 'advertisingBannerContainer';

        // Find the blog content section to insert before
        const blogContent = document.querySelector('.blog-content-section');
        if (blogContent) {
            blogContent.parentNode.insertBefore(bannerContainer, blogContent);
        } else {
            console.error('Could not find blog content section to insert banner');
            return;
        }
    }

    // Generate CSS variables for styling
    const cssVars = generateCssVariables();

    // Generate banner HTML based on layout
    const bannerHTML = generateBannerHTML(cssVars);

    // Insert banner into container
    bannerContainer.innerHTML = bannerHTML;
    bannerContainer.className = 'advanced-banner-container';

    // Initialize countdown if enabled
    if (advancedBannerConfig.countdown.enabled) {
        initCountdown();
    }

    // Initialize button event listener
    initButtonAction();

    console.log('Advanced banner injected successfully');
}

/**
 * Generate CSS variables for banner styling
 */
function generateCssVariables(configParam) {
    // Use the provided config or fall back to advancedBannerConfig
    const config = configParam || advancedBannerConfig;
    const vars = {};

    // Banner frame variables
    if (config.cornerStyle === 'custom') {
        vars['--banner-border-radius'] = 
            `${config.customCorners.topLeft}px ${config.customCorners.topRight}px ` +
            `${config.customCorners.bottomRight}px ${config.customCorners.bottomLeft}px`;
    } else {
        vars['--banner-border-radius'] = `${config.borderRadius}px`;
    }

    vars['--banner-border-width'] = `${config.borderWidth}px`;
    vars['--banner-border-style'] = config.borderStyle;
    vars['--banner-border-color'] = config.borderColor;
    vars['--banner-box-shadow'] = config.boxShadow;
    vars['--banner-background-color'] = config.backgroundColor;

    // Animation variables
    vars['--banner-animation-duration'] = `${config.animation.duration}s`;
    vars['--banner-animation-delay'] = `${config.animation.delay}s`;

    // Countdown variables
    vars['--countdown-background-color'] = config.countdown.backgroundColor;
    vars['--countdown-text-color'] = config.countdown.textColor;
    vars['--countdown-accent-color'] = config.countdown.accentColor;
    vars['--countdown-border-radius'] = `${config.countdown.borderRadius}px`;
    vars['--countdown-display'] = config.countdown.enabled ? 'flex' : 'none';

    // Button variables
    vars['--button-background-color'] = config.button.backgroundColor;
    vars['--button-text-color'] = config.button.textColor;
    vars['--button-border-radius'] = `${config.button.borderRadius}px`;
    vars['--button-border-width'] = `${config.button.borderWidth}px`;
    vars['--button-border-color'] = config.button.borderColor;
    vars['--button-padding'] = config.button.padding;
    vars['--button-font-size'] = `${config.button.fontSize}px`;
    vars['--button-font-weight'] = config.button.fontWeight;
    vars['--button-display'] = config.button.enabled ? 'inline-block' : 'none';

    // Content variables
    vars['--title-color'] = config.content.titleColor;
    vars['--subtitle-color'] = config.content.subtitleColor;
    vars['--text-color'] = config.content.textColor;
    vars['--title-font-size'] = `${config.content.titleFontSize}px`;
    vars['--subtitle-font-size'] = `${config.content.subtitleFontSize}px`;
    vars['--text-font-size'] = `${config.content.textFontSize}px`;
    vars['--content-alignment'] = config.content.alignment;

    return vars;
}

/**
 * Generate banner HTML based on current configuration
 */
function generateBannerHTML(configParam, cssVarsParam) {
    // Use the provided config or fall back to advancedBannerConfig
    const config = configParam || advancedBannerConfig;
    // Use the provided cssVars or generate from config
    const cssVars = cssVarsParam || generateCssVariables(config);

    // Convert CSS variables to inline style
    const styleString = Object.entries(cssVars)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

    // Get content values with fallbacks
    const title = config.content.title || 'Special Offer';
    const subtitle = config.content.subtitle || 'Limited Time Promotion';
    const text = config.content.text || 'Take advantage of this exclusive offer before time runs out!';
    const imageUrl = config.content.imageUrl || '';

    // Always ensure button has text
    if (!config.button.text) {
        config.button.text = 'Learn More';
    }

    // Make sure countdown shows in preview
    if (document.getElementById('banner-preview-container')) {
        // Force countdown to be enabled for preview purposes
        config.countdown.enabled = true;

        // If no end date is set, add a default one (24 hours from now)
        if (!config.countdown.endDate) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);
            config.countdown.endDate = endDate.toISOString();
        }
    }

    // Determine animation classes
    let animationClass = '';
    if (config.animation.enabled) {
        animationClass = `banner-animation-${config.animation.type}`;
        if (config.animation.infinite) {
            animationClass += ' animation-infinite';
        }
    }

    // Determine button classes
    let buttonClasses = 'advanced-banner-button';
    if (config.button.hoverEffect !== 'none') {
        buttonClasses += ` button-hover-${config.button.hoverEffect}`;
    }
    if (config.button.animation !== 'none') {
        buttonClasses += ` button-animation-${config.button.animation}`;
    }

    // Generate HTML based on layout
    let layoutHTML = '';

    switch (config.layout) {
        case 'layout-1': // Text left, image right
            layoutHTML = `
                <div class="advanced-banner-layout layout-1">
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="${buttonClasses}" ${config.button.openInNewTab ? 'target="_blank" rel="noopener"' : ''}>${config.button.text}</a>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : ''}
                    </div>
                </div>
            `;
            break;

        case 'layout-2': // Centered content
            layoutHTML = `
                <div class="advanced-banner-layout layout-2">
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : ''}
                    </div>
                    <div class="banner-text-content-bottom">
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="${buttonClasses}" ${config.button.openInNewTab ? 'target="_blank" rel="noopener"' : ''}>${config.button.text}</a>
                    </div>
                </div>
            `;
            break;

        case 'layout-3': // Image left, text right
            layoutHTML = `
                <div class="advanced-banner-layout layout-3">
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : ''}
                    </div>
                    <div class="banner-text-content">
                        <h3 class="banner-title">${title}</h3>
                        <h4 class="banner-subtitle">${subtitle}</h4>
                        <div class="banner-countdown-container"></div>
                        <p class="banner-text">${text}</p>
                        <a href="${config.button.url}" class="${buttonClasses}" ${config.button.openInNewTab ? 'target="_blank" rel="noopener"' : ''}>${config.button.text}</a>
                    </div>
                </div>
            `;
            break;

        case 'layout-4': // Full width background image
            layoutHTML = `
                <div class="advanced-banner-layout layout-4" ${imageUrl ? `style="background-image: url('${imageUrl}')"` : ''}>
                    <div class="banner-overlay"></div>
                    <div class="banner-content-wrapper">
                        <div class="banner-text-content">
                            <h3 class="banner-title">${title}</h3>
                            <h4 class="banner-subtitle">${subtitle}</h4>
                            <div class="banner-countdown-container"></div>
                            <p class="banner-text">${text}</p>
                            <a href="${config.button.url}" class="${buttonClasses}" ${config.button.openInNewTab ? 'target="_blank" rel="noopener"' : ''}>${config.button.text}</a>
                        </div>
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
                        <a href="${config.button.url}" class="${buttonClasses}" ${config.button.openInNewTab ? 'target="_blank" rel="noopener"' : ''}>${config.button.text}</a>
                    </div>
                    <div class="banner-image-content">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner-image">` : ''}
                    </div>
                </div>
            `;
    }

    // Assemble complete banner HTML
    return `
        <div class="advanced-advertising-banner ${animationClass}" style="${styleString}">
            <div class="advanced-banner-inner">
                ${layoutHTML}
            </div>
            <button class="banner-close-button" aria-label="Close banner">&times;</button>
        </div>
    `;
}

/**
 * Initialize countdown timer
 * @param {HTMLElement} container - Optional container element to search within
 */
function initCountdown(container) {
    // Search within provided container or document
    const searchContext = container || document;
    const countdownContainer = searchContext.querySelector('.banner-countdown-container');
    if (!countdownContainer) return;

    // Generate a unique ID for this countdown instance
    const countdownId = 'countdown-' + Math.random().toString(36).substr(2, 9);
    countdownContainer.dataset.countdownId = countdownId;

    // Clean up any existing interval for this container
    if (countdownContainer.dataset.intervalId) {
        clearInterval(parseInt(countdownContainer.dataset.intervalId));
    }

    const config = advancedBannerConfig.countdown;

    // Ensure we have a valid end date
    let endDate;
    try {
        endDate = new Date(config.endDate);
        // Check if the date is valid (not Invalid Date)
        if (isNaN(endDate.getTime())) {
            // If invalid, set a default date (3 days from now)
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 3);
            endDate = defaultDate;

            // Update the config with the valid date
            config.endDate = endDate.toISOString();
        }
    } catch (error) {
        // If there's any error parsing the date, set a default
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        endDate = defaultDate;

        // Update the config with the valid date
        config.endDate = endDate.toISOString();
    }

    // Use unique IDs for this countdown instance
    const dayId = `days-${countdownId}`;
    const hourId = `hours-${countdownId}`;
    const minuteId = `minutes-${countdownId}`;
    const secondId = `seconds-${countdownId}`;

    // Create countdown HTML based on style
    let countdownHTML = '';

    switch (config.style) {
        case 'boxes':
            countdownHTML = `
                <div class="countdown-timer countdown-boxes">
                    ${config.showDays ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${dayId}">0</div>
                            <div class="countdown-label">Days</div>
                        </div>
                    ` : ''}
                    ${config.showHours ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${hourId}">0</div>
                            <div class="countdown-label">Hours</div>
                        </div>
                    ` : ''}
                    ${config.showMinutes ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${minuteId}">0</div>
                            <div class="countdown-label">Minutes</div>
                        </div>
                    ` : ''}
                    ${config.showSeconds ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${secondId}">0</div>
                            <div class="countdown-label">Seconds</div>
                        </div>
                    ` : ''}
                </div>
            `;
            break;

        case 'simple':
            countdownHTML = `
                <div class="countdown-timer countdown-simple">
                    <span class="countdown-text">Offer ends in: </span>
                    ${config.showDays ? `<span id="${dayId}">0</span><span class="countdown-unit">d</span>` : ''}
                    ${config.showHours ? `<span id="${hourId}">0</span><span class="countdown-unit">h</span>` : ''}
                    ${config.showMinutes ? `<span id="${minuteId}">0</span><span class="countdown-unit">m</span>` : ''}
                    ${config.showSeconds ? `<span id="${secondId}">0</span><span class="countdown-unit">s</span>` : ''}
                </div>
            `;
            break;

        case 'minimal':
            countdownHTML = `
                <div class="countdown-timer countdown-minimal">
                    <div class="countdown-minimal-text">
                        <span class="countdown-text">Sale ends in: </span>
                        ${config.showDays ? `<span id="${dayId}">0</span><span class="countdown-unit">d</span>` : ''}
                        ${config.showHours ? `<span id="${hourId}">0</span><span class="countdown-unit">h</span>` : ''}
                        ${config.showMinutes ? `<span id="${minuteId}">0</span><span class="countdown-unit">m</span>` : ''}
                        ${config.showSeconds ? `<span id="${secondId}">0</span><span class="countdown-unit">s</span>` : ''}
                    </div>
                    <div class="countdown-progress-container">
                        <div class="countdown-progress" style="width: 0%"></div>
                    </div>
                </div>
            `;
            break;

        default: // Fallback to boxes style
            countdownHTML = `
                <div class="countdown-timer countdown-boxes">
                    ${config.showDays ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${dayId}">0</div>
                            <div class="countdown-label">Days</div>
                        </div>
                    ` : ''}
                    ${config.showHours ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${hourId}">0</div>
                            <div class="countdown-label">Hours</div>
                        </div>
                    ` : ''}
                    ${config.showMinutes ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${minuteId}">0</div>
                            <div class="countdown-label">Minutes</div>
                        </div>
                    ` : ''}
                    ${config.showSeconds ? `
                        <div class="countdown-box">
                            <div class="countdown-value" id="${secondId}">0</div>
                            <div class="countdown-label">Seconds</div>
                        </div>
                    ` : ''}
                </div>
            `;
    }

    // Insert countdown HTML
    countdownContainer.innerHTML = countdownHTML;

    // Initialize countdown progress bar if minimal style
    if (config.style === 'minimal') {
        const now = new Date();
        const totalTime = endDate.getTime() - now.getTime();
        const progressBar = countdownContainer.querySelector('.countdown-progress');
        if (progressBar) {
            // Store total time as data attribute for progress calculation
            progressBar.dataset.totalTime = totalTime;
        }
    }

    // Create a special update function for this specific countdown instance
    function updateThisCountdown() {
        const now = new Date();
        let diff = endDate - now;

        // If countdown is finished
        if (diff <= 0) {
            // Set all values to 0
            if (config.showDays) {
                const daysEl = document.getElementById(dayId);
                if (daysEl) daysEl.textContent = '0';
            }
            if (config.showHours) {
                const hoursEl = document.getElementById(hourId);
                if (hoursEl) hoursEl.textContent = '0';
            }
            if (config.showMinutes) {
                const minutesEl = document.getElementById(minuteId);
                if (minutesEl) minutesEl.textContent = '0';
            }
            if (config.showSeconds) {
                const secondsEl = document.getElementById(secondId);
                if (secondsEl) secondsEl.textContent = '0';
            }

            // Update progress bar if minimal style
            if (config.style === 'minimal') {
                const progressBar = countdownContainer.querySelector('.countdown-progress');
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
            }

            return;
        }

        // Calculate time values
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);

        const seconds = Math.floor(diff / 1000);

        // Update elements with their specific IDs
        if (config.showDays) {
            const daysEl = document.getElementById(dayId);
            if (daysEl) daysEl.textContent = days;
        }
        if (config.showHours) {
            const hoursEl = document.getElementById(hourId);
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        }
        if (config.showMinutes) {
            const minutesEl = document.getElementById(minuteId);
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        }
        if (config.showSeconds) {
            const secondsEl = document.getElementById(secondId);
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        }

        // Update progress bar if minimal style
        if (config.style === 'minimal') {
            const progressBar = countdownContainer.querySelector('.countdown-progress');
            if (progressBar) {
                const totalTime = parseInt(progressBar.dataset.totalTime, 10);
                const remainingTime = diff;
                const progress = Math.min(100, Math.max(0, 100 - (remainingTime / totalTime * 100)));
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    // Update countdown immediately
    updateThisCountdown();

    // Set new interval with its own dedicated update function
    const intervalId = setInterval(updateThisCountdown, 1000);

    // Store the interval ID with the container to clean it up later
    countdownContainer.dataset.intervalId = intervalId;
}

// updateCountdown function has been integrated into each countdown instance
// to avoid conflicts between multiple timers

/**
 * Initialize button action
 */
function initButtonAction() {
    const button = document.querySelector('.advanced-banner-button');
    if (!button) return;

    // Add click event listener
    button.addEventListener('click', function(e) {
        // If URL is just '#', prevent default action
        if (button.getAttribute('href') === '#') {
            e.preventDefault();
            console.log('Banner button clicked (no URL specified)');
        } else {
            console.log('Banner button clicked, navigating to:', button.getAttribute('href'));
        }
    });
}

// More functions will be added in the next part for UI controls and customization panel

/**
 * Initialize content tab controls - using the main Banner Content fields
 */
function initContentTab() {
    const titleInput = document.getElementById('adTitle');
    const subtitleInput = document.getElementById('adSubtitle');
    const textInput = document.getElementById('adText');

    if (!titleInput || !subtitleInput || !textInput) {
        console.error('Main banner content inputs not found');
        return;
    }

    // Only set the values if they are empty (to avoid overwriting user input)
    if (!titleInput.value) {
        titleInput.value = advancedBannerConfig.content.title;
    } else {
        // If fields already have values, update our config
        advancedBannerConfig.content.title = titleInput.value;
    }

    if (!subtitleInput.value) {
        subtitleInput.value = advancedBannerConfig.content.subtitle;
    } else {
        advancedBannerConfig.content.subtitle = subtitleInput.value;
    }

    if (!textInput.value) {
        textInput.value = advancedBannerConfig.content.text;
    } else {
        advancedBannerConfig.content.text = textInput.value;
    }

    // Add event listeners
    titleInput.addEventListener('input', function() {
        advancedBannerConfig.content.title = this.value;
        updateBannerPreview();
    });

    subtitleInput.addEventListener('input', function() {
        advancedBannerConfig.content.subtitle = this.value;
        updateBannerPreview();
    });

    textInput.addEventListener('input', function() {
        advancedBannerConfig.content.text = this.value;
        updateBannerPreview();
    });

    // Also track image changes
    const imageInput = document.getElementById('adImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            // The actual image processing is handled in the advertising-banners.js file
            // We just need to make sure our preview updates when it changes
            setTimeout(updateBannerPreview, 500); // Give time for the image to process
        });
    }
}

/**
 * Sync with basic banner system - pulls data from basic banner
 */
function syncWithBasicBannerSystem() {
    // Check if basic banner data is available
    if (typeof window.adData === 'object' || typeof adData === 'object') {
        const basicData = window.adData || adData;

        // Import content from basic banner data
        advancedBannerConfig.content.title = basicData.title || advancedBannerConfig.content.title;
        advancedBannerConfig.content.subtitle = basicData.subtitle || advancedBannerConfig.content.subtitle;
        advancedBannerConfig.content.text = basicData.text || advancedBannerConfig.content.text;
        advancedBannerConfig.content.imageUrl = basicData.imageUrl || advancedBannerConfig.content.imageUrl;

        // Sync layout
        advancedBannerConfig.layout = basicData.layout || advancedBannerConfig.layout;

        // Sync enabled state
        advancedBannerConfig.enabled = basicData.enabled;

        console.log('Synchronized advanced banner settings with basic banner data');

        // Update preview
        updateBannerPreview();
    } else {
        console.log('Basic banner data not available, skipping sync');
    }
}

/**
 * Sync changes to basic banner - pushes data from advanced banner to basic banner
 */
function syncChangesToBasicBanner() {
    // Check if basic banner data is available
    if (typeof window.adData === 'object' || typeof adData === 'object') {
        const basicData = window.adData || adData;

        // Update basic banner with content from advanced settings
        basicData.title = advancedBannerConfig.content.title;
        basicData.subtitle = advancedBannerConfig.content.subtitle;
        basicData.text = advancedBannerConfig.content.text;
        basicData.imageUrl = advancedBannerConfig.content.imageUrl;

        // Sync layout
        basicData.layout = advancedBannerConfig.layout;

        // Sync enabled state
        basicData.enabled = advancedBannerConfig.enabled;

        // Save the updated basic banner data
        if (typeof window.saveAdData === 'function') {
            window.saveAdData();
        } else if (typeof saveAdData === 'function') {
            saveAdData();
        }

        // Update UI elements if we're on the dashboard
        if (typeof window.updateUIFromData === 'function') {
            window.updateUIFromData();
        } else if (typeof updateUIFromData === 'function') {
            updateUIFromData();
        }

        console.log('Applied advanced banner settings to basic banner system');
    } else {
        console.log('Basic banner data not available, skipping sync');
    }
}

/**
 * Update banner preview with the latest settings
 */
function updateBannerPreview() {
    const previewContainer = document.getElementById('banner-preview-container');
    if (!previewContainer) {
        console.error('Banner preview container not found');
        return;
    }

    // First ensure we have the latest content from the main form
    updateContentFromMainForm();

    // Ensure button has text and URL
    if (!advancedBannerConfig.button.text) {
        advancedBannerConfig.button.text = 'Learn More';
    }
    if (!advancedBannerConfig.button.url) {
        advancedBannerConfig.button.url = '#';
    }

    // Force countdown to be enabled for preview purposes
    const originalCountdownEnabled = advancedBannerConfig.countdown.enabled;
    advancedBannerConfig.countdown.enabled = true;

    // Generate CSS custom properties
    const styleVariables = generateCssVariables();

    // Generate banner HTML
    const bannerHTML = generateBannerHTML();

    // Insert content and apply styles
    previewContainer.innerHTML = bannerHTML;
    document.documentElement.style.cssText += styleVariables;

    // Initialize countdown
    initCountdownInstances();

    // Directly fix the buttons if needed
    fixButtonsInPreview(previewContainer);

    // Restore original countdown enabled state
    advancedBannerConfig.countdown.enabled = originalCountdownEnabled;
}

/**
 * Fix buttons in preview to ensure they always display with proper text
 */
function fixButtonsInPreview(container) {
    const buttons = container.querySelectorAll('a.advanced-banner-button');

    buttons.forEach(button => {
        // Add default text if empty
        if (!button.textContent.trim()) {
            button.textContent = 'Learn More';
        }

        // Add href if missing
        if (!button.getAttribute('href')) {
            button.setAttribute('href', '#');
        }

        // Make sure button is visible
        button.style.display = 'inline-block';
    });
}

/**
 * Update advanced banner config with content from main form fields
 */
function updateContentFromMainForm() {
    const titleInput = document.getElementById('adTitle');
    const subtitleInput = document.getElementById('adSubtitle');
    const textInput = document.getElementById('adText');
    const imagePreview = document.getElementById('adImagePreview');

    // Update content from main form fields
    if (titleInput) {
        advancedBannerConfig.content.title = titleInput.value;
    }

    if (subtitleInput) {
        advancedBannerConfig.content.subtitle = subtitleInput.value;
    }

    if (textInput) {
        advancedBannerConfig.content.text = textInput.value;
    }

    // Update image URL if available
    if (imagePreview && imagePreview.src && !imagePreview.src.endsWith('blank.gif') && imagePreview.style.display !== 'none') {
        advancedBannerConfig.content.imageUrl = imagePreview.src;
    }

    // Get layout from radio buttons
    const selectedLayout = document.querySelector('.layout-option input[type="radio"]:checked');
    if (selectedLayout) {
        advancedBannerConfig.layout = selectedLayout.value;
    }

    // Get enabled state from toggle
    const toggleSwitch = document.getElementById('adToggle');
    if (toggleSwitch) {
        advancedBannerConfig.enabled = toggleSwitch.checked;
    }
}

/**
 * Initialize all countdown instances in the preview
 */
function initCountdownInstances() {
    const countdownContainers = document.querySelectorAll('.banner-countdown-container');

    // For preview, directly insert countdown HTML if no real countdown is present
    if (document.getElementById('banner-preview-container')) {
        countdownContainers.forEach(container => {
            if (container.innerHTML.trim() === '') {
                // Create a valid countdown date for preview
                const previewEndDate = new Date();
                previewEndDate.setDate(previewEndDate.getDate() + 3); // 3 days from now

                // Set this valid date in the config
                advancedBannerConfig.countdown.endDate = previewEndDate.toISOString();

                // Calculate the actual values for the preview
                const diff = previewEndDate - new Date();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                // Add direct countdown HTML for preview with the calculated values
                container.innerHTML = `
                    <div class="countdown-timer countdown-standard">
                        <div class="countdown-item">
                            <span class="countdown-value">${days}</span>
                            <span class="countdown-label">Days</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-value">${hours}</span>
                            <span class="countdown-label">Hours</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-value">${minutes}</span>
                            <span class="countdown-label">Min</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-value">${seconds}</span>
                            <span class="countdown-label">Sec</span>
                        </div>
                    </div>
                `;
            }
        });
    } else {
        // Normal initialization for real countdowns
        countdownContainers.forEach(container => {
            initCountdown(container);
        });
    }
}

// Add proper countdown functionality for published banners
function initCountdown(container) {
    // Get the countdown configuration from the container's data attributes or global config
    let endDate = container.dataset.endDate;
    
    // If no end date in container, try to get from saved banner config
    if (!endDate) {
        try {
            const savedConfig = localStorage.getItem('fooodis-banner-config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                endDate = config.countdown?.endDate;
            }
        } catch (e) {
            console.warn('Could not load banner config for countdown');
        }
    }
    
    // If still no end date, create a default one
    if (!endDate) {
        const defaultEndDate = new Date();
        defaultEndDate.setDate(defaultEndDate.getDate() + 7); // 7 days from now
        endDate = defaultEndDate.toISOString();
    }
    
    // Create countdown HTML structure
    container.innerHTML = `
        <div class="countdown-timer countdown-standard">
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Min</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">0</span>
                <span class="countdown-label">Sec</span>
            </div>
        </div>
    `;
    
    // Function to update countdown
    function updateCountdown() {
        const now = new Date().getTime();
        const targetTime = new Date(endDate).getTime();
        const difference = targetTime - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            // Update the countdown display
            const countdownValues = container.querySelectorAll('.countdown-value');
            if (countdownValues.length >= 4) {
                countdownValues[0].textContent = days;
                countdownValues[1].textContent = hours;
                countdownValues[2].textContent = minutes;
                countdownValues[3].textContent = seconds;
            }
        } else {
            // Countdown expired
            const countdownValues = container.querySelectorAll('.countdown-value');
            countdownValues.forEach(value => {
                value.textContent = '0';
            });
        }
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    // Store interval ID for cleanup if needed
    container.dataset.intervalId = intervalId;
}

// Export functions for use in other scripts
window.updateBannerPreview = updateBannerPreview;
window.initCountdown = initCountdown;
window.generateCssVariables = generateCssVariables;
window.generateBannerHTML = generateBannerHTML;
window.advancedBannerConfig = advancedBannerConfig;
window.saveAdvancedBannerConfig = saveAdvancedBannerConfig;
window.syncWithBasicBannerSystem = syncWithBasicBannerSystem;
window.syncChangesToBasicBanner = syncChangesToBasicBanner;

// Add event listener for the Apply Changes button in advanced settings
document.addEventListener('DOMContentLoaded', function() {
    const applyChangesBtn = document.getElementById('apply-banner-changes');
    if (applyChangesBtn) {
        applyChangesBtn.addEventListener('click', function() {
            // Save advanced banner config
            saveAdvancedBannerConfig();
            // Sync with basic banner
            syncChangesToBasicBanner();
            // Update UI
            if (typeof window.updateUIFromData === 'function') {
                window.updateUIFromData();
            }
            showNotification('Banner settings applied to all sections', 'success');
        });
    }

    // Initialize preview functionality when page loads
    initializeBannerPreview();
});

/**
 * Initialize and fix banner preview - ensure countdown and button text work
 */
function initializeBannerPreview() {
    // Set some defaults for button if needed
    if (!advancedBannerConfig.button.text) {
        advancedBannerConfig.button.text = 'Learn More';
    }
    if (!advancedBannerConfig.button.url) {
        advancedBannerConfig.button.url = '#';
    }

    // Set defaults for countdown if needed
    if (!advancedBannerConfig.countdown.endDate) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);
        advancedBannerConfig.countdown.endDate = endDate.toISOString();
    }

    // Force countdown enabled for preview
    advancedBannerConfig.countdown.enabled = true;

    // Setup preview update on all tab changes
    const tabs = document.querySelectorAll('.panel-tab');
    if (tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                setTimeout(updateBannerPreview, 100);
            });
        });
    }

    // Initial preview update
    setTimeout(updateBannerPreview, 500);
}

function generateCssVariables() {
    const config = getCurrentConfig();

    // Get button control values
    const buttonFontSize = document.getElementById('button-font-size')?.value || '14';
    const buttonPadding = document.getElementById('button-padding')?.value || '12px 25px';
    const buttonBorderRadius = document.getElementById('button-border-radius')?.value || '30';
    const buttonMaxWidth = document.getElementById('button-max-width')?.value || '200';
    const buttonBgColor = document.getElementById('button-background')?.value || '#e8f24c';
    const buttonTextColor = document.getElementById('button-text-color')?.value || '#1e2127';

    return `
        :root {
            --banner-bg-color: ${config.style.backgroundColor};
            --banner-text-color: ${config.style.textColor};
            --banner-border-radius: ${config.style.borderRadius}px;
            --button-bg-color: ${buttonBgColor};
            --button-text-color: ${buttonTextColor};
            --button-font-size: ${buttonFontSize}px;
            --button-padding: ${buttonPadding};
            --button-border-radius: ${buttonBorderRadius}px;
            --button-max-width: ${buttonMaxWidth}px;
        }
    `;
}