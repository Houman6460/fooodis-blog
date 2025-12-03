/**
 * Email Popup Display for Fooodis Blog System
 * Displays the configured email popup on the blog pages
 */

class EmailPopupDisplay {
    constructor() {
        this.config = null;
        this.popupShown = false;
        this.countdown = null;
        this.init();
    }
    
    async init() {
        await this.loadConfig();
        this.createPopup();
        this.setupTriggers();
    }
    
    async loadConfig() {
        // First try to load from API
        try {
            const response = await fetch('/api/subscribers/popup-config');
            if (response.ok) {
                const apiConfig = await response.json();
                
                // Map API config to display config format
                this.config = this.getDefaultConfig();
                if (apiConfig.enabled !== undefined) {
                    localStorage.setItem('popup-enabled', apiConfig.enabled ? 'true' : 'false');
                }
                if (apiConfig.title) this.config.customText.title = apiConfig.title;
                if (apiConfig.description) this.config.customText.description = apiConfig.description;
                if (apiConfig.button_text) this.config.customText.buttonText = apiConfig.button_text;
                if (apiConfig.placeholder_text) this.config.customText.placeholder = apiConfig.placeholder_text;
                if (apiConfig.success_message) this.config.customText.successMessage = apiConfig.success_message;
                if (apiConfig.trigger_type) localStorage.setItem('popup-trigger', apiConfig.trigger_type);
                if (apiConfig.trigger_delay) localStorage.setItem('popup-delay', apiConfig.trigger_delay.toString());
                if (apiConfig.trigger_scroll_percent) localStorage.setItem('scroll-percentage', apiConfig.trigger_scroll_percent.toString());
                if (apiConfig.background_color) this.config.colors.background = apiConfig.background_color;
                if (apiConfig.button_color) this.config.colors.buttonBackground = apiConfig.button_color;
                if (apiConfig.popup_image) {
                    this.config.image.url = apiConfig.popup_image;
                }
                if (apiConfig.popup_image_enabled !== undefined) {
                    // Ensure boolean conversion (API might return 0/1 or true/false)
                    this.config.image.enabled = Boolean(apiConfig.popup_image_enabled);
                }
                if (apiConfig.popup_layout) {
                    this.config.layout = apiConfig.popup_layout;
                }
                
                // Cache locally
                localStorage.setItem('fooodis-email-popup-config', JSON.stringify(this.config));
                console.log('EmailPopupDisplay: Config loaded from API', {
                    imageUrl: this.config.image.url,
                    imageEnabled: this.config.image.enabled,
                    layout: this.config.layout,
                    apiResponse: apiConfig
                });
                return;
            }
        } catch (error) {
            console.warn('EmailPopupDisplay: Could not load config from API, using localStorage', error);
        }
        
        // Fallback to localStorage
        const savedConfig = localStorage.getItem('fooodis-email-popup-config');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (error) {
                console.error('Error loading email popup configuration:', error);
                this.config = this.getDefaultConfig();
            }
        } else {
            this.config = this.getDefaultConfig();
        }
    }
    
    getDefaultConfig() {
        return {
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
                message: 'Offer ends in:'
            },
            colors: {
                background: '#252830',
                textBackground: 'rgba(0, 0, 0, 0.5)',
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
    }
    
    createPopup() {
        // Check if popup should be enabled
        const popupEnabled = localStorage.getItem('popup-enabled') === 'true';
        if (!popupEnabled) return;
        
        // Create popup HTML
        const popup = document.createElement('div');
        popup.className = 'email-overlay';
        popup.id = 'emailPopupOverlay';
        
        const layout = this.config.layout || 'standard';
        const hasImage = this.config.image && this.config.image.enabled && this.config.image.url;
        
        console.log('EmailPopupDisplay: Creating popup', {
            layout: layout,
            hasImage: hasImage,
            imageUrl: this.config.image?.url,
            imageEnabled: this.config.image?.enabled,
            imageConfig: this.config.image,
            fullConfig: this.config
        });
        
        // Build image HTML
        const imageHtml = hasImage ? `
            <div class="popup-image-container">
                <img src="${this.config.image.url}" alt="" class="popup-image">
            </div>
        ` : '';
        
        // Text background style
        const textBgStyle = this.config.colors.textBackground ? 
            `background-color:${this.config.colors.textBackground};padding:15px;border-radius:6px;` : '';
        
        let popupContent = `
            <div class="email-popup layout-${layout}">
                <div class="email-popup-header">
                    <h2 class="email-popup-title">${this.config.customText.title}</h2>
                    <button class="email-popup-close">&times;</button>
                </div>
                <div class="email-popup-content">
        `;
        
        // For image-left, image-top: image comes first
        // For image-right, image-bottom: image comes after text
        // For image-background: image is positioned absolute
        if (layout === 'image-left' || layout === 'image-top' || layout === 'image-background') {
            popupContent += imageHtml;
        }
        
        // Add text container
        popupContent += `
                <div class="popup-text-container" style="${textBgStyle}">
                    <p class="email-popup-description">${this.config.customText.description}</p>
        `;
        
        // Add countdown if enabled
        if (this.config.countdown && this.config.countdown.enabled) {
            popupContent += `
                <div class="countdown-container">
                    <p class="countdown-message">${this.config.countdown.message || 'Offer ends in:'}</p>
                    <div class="countdown-timer">
                        <div class="countdown-item">
                            <div class="countdown-value" id="countdown-days">00</div>
                            <div class="countdown-label">Days</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value" id="countdown-hours">00</div>
                            <div class="countdown-label">Hours</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value" id="countdown-minutes">00</div>
                            <div class="countdown-label">Mins</div>
                        </div>
                        <div class="countdown-item">
                            <div class="countdown-value" id="countdown-seconds">00</div>
                            <div class="countdown-label">Secs</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add email form
        popupContent += `
                    <form class="email-form">
                        <div class="email-input-group">
                            <input type="email" class="email-input" placeholder="${this.config.customText.placeholder}" required>
                        </div>
                        <button type="submit" class="email-submit-btn" style="background-color: ${this.config.colors.buttonBackground}; color: ${this.config.colors.buttonText};">
                            ${this.config.animation ? `<div class="anim-${this.config.animation}" style="display: none;"></div>` : ''}
                            ${this.config.customText.buttonText}
                        </button>
                    </form>
                </div>
        `;
        
        // For image-right and image-bottom: add image after text
        if (layout === 'image-right' || layout === 'image-bottom') {
            popupContent += imageHtml;
        }
        
        popupContent += `
            </div>
            <div class="email-popup-footer">
                <p>We respect your privacy. Unsubscribe at any time.</p>
            </div>
        </div>
        `;
        
        popup.innerHTML = popupContent;
        document.body.appendChild(popup);
        
        // Add event listeners
        const closeBtn = popup.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePopup();
            });
        }
        
        const form = popup.querySelector('.email-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
        
        // Also close when clicking overlay background (outside the popup)
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.closePopup();
            }
        });
    }
    
    setupTriggers() {
        const popupEnabled = localStorage.getItem('popup-enabled') === 'true';
        if (!popupEnabled) return;
        
        // Check if popup was already shown in this session
        if (sessionStorage.getItem('popup-shown') === 'true') return;
        
        // Get trigger settings
        const triggerType = localStorage.getItem('popup-trigger') || 'delay';
        
        switch (triggerType) {
            case 'delay':
                this.setupDelayTrigger();
                break;
            case 'exit':
                this.setupExitTrigger();
                break;
            case 'scroll':
                this.setupScrollTrigger();
                break;
            default:
                this.setupDelayTrigger();
        }
    }
    
    setupDelayTrigger() {
        // Default to 5 seconds if not set
        const delay = parseInt(localStorage.getItem('popup-delay')) || 5;
        setTimeout(() => {
            this.showPopup();
        }, delay * 1000);
    }
    
    setupExitTrigger() {
        document.addEventListener('mouseleave', (e) => {
            // Only trigger when mouse leaves the top of the page
            if (e.clientY < 0 && !this.popupShown) {
                this.showPopup();
            }
        });
    }
    
    setupScrollTrigger() {
        // Default to 50% if not set
        const scrollPercentage = parseInt(localStorage.getItem('scroll-percentage')) || 50;
        
        window.addEventListener('scroll', () => {
            if (this.popupShown) return;
            
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            if (scrollPercent > scrollPercentage) {
                this.showPopup();
            }
        });
    }
    
    showPopup() {
        if (this.popupShown) return;
        
        const popup = document.getElementById('emailPopupOverlay');
        if (!popup) return;
        
        popup.classList.add('active');
        this.popupShown = true;
        sessionStorage.setItem('popup-shown', 'true');
        
        // Start countdown if enabled
        if (this.config.countdown && this.config.countdown.enabled) {
            this.startCountdown();
        }
        
        // Dispatch event for other scripts to react
        document.dispatchEvent(new CustomEvent('emailPopupShown'));
    }
    
    closePopup() {
        const popup = document.getElementById('emailPopupOverlay');
        if (!popup) return;
        
        popup.classList.remove('active');
        
        // Stop countdown if running
        if (this.countdown) {
            clearInterval(this.countdown);
        }
    }
    
    async handleSubmit(e) {
        const form = e.target;
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('.email-submit-btn');
        const animElement = submitBtn.querySelector(`[class^="anim-"]`);
        
        if (!emailInput || !emailInput.value) return;
        
        const email = emailInput.value.trim();
        
        // Show loading animation
        if (animElement) {
            animElement.style.display = 'inline-block';
            // Hide button text while loading
            submitBtn.childNodes.forEach(node => {
                if (node.nodeType === 3) { // Text node
                    node.textContent = '';
                }
            });
        }
        
        // Disable button
        submitBtn.disabled = true;
        
        try {
            // Call the backend API to save subscriber
            const response = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    source: 'popup',
                    subscribed_from: window.location.href
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('Subscriber saved to database:', result);
                
                // Show success message
                const popup = document.getElementById('emailPopupOverlay');
                if (!popup) return;
                
                const emailPopup = popup.querySelector('.email-popup');
                if (emailPopup && this.config.customText) {
                    let successText = this.config.customText.successMessage;
                    if (result.existing) {
                        successText = 'You are already subscribed!';
                    } else if (result.reactivated) {
                        successText = 'Welcome back! Your subscription has been reactivated.';
                    }
                    
                    emailPopup.innerHTML = `
                        <div class="email-popup-success">
                            <i class="fas fa-check-circle success-icon"></i>
                            <h2 class="success-title">${successText}</h2>
                        </div>
                    `;
                    
                    // Close popup after delay
                    setTimeout(() => {
                        this.closePopup();
                    }, 3000);
                }
                
                // Also save to localStorage for offline/cache
                try {
                    const emails = JSON.parse(localStorage.getItem('subscriber-emails') || '[]');
                    const emailExists = emails.some(item => item.email === email);
                    
                    if (!emailExists) {
                        emails.push({
                            email: email,
                            date: new Date().toISOString(),
                            status: 'active'
                        });
                        localStorage.setItem('subscriber-emails', JSON.stringify(emails));
                    }
                    
                    // Broadcast to other tabs
                    if (window.BroadcastChannel) {
                        try {
                            const bc = new BroadcastChannel('fooodis-subscribers');
                            bc.postMessage({ action: 'new-subscriber', email: email });
                        } catch (e) {
                            console.warn('Broadcast error:', e);
                        }
                    }
                } catch (storageError) {
                    console.warn('localStorage save error:', storageError);
                }
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('subscriberAdded', {
                    detail: { email, result }
                }));
                
            } else {
                // Show error message
                console.error('Subscriber API error:', result.error);
                alert(result.error || 'Failed to subscribe. Please try again.');
                
                // Re-enable button
                submitBtn.disabled = false;
                if (animElement) {
                    animElement.style.display = 'none';
                }
                submitBtn.textContent = this.config.customText.buttonText;
            }
        } catch (error) {
            console.error('Error submitting subscription:', error);
            alert('Network error. Please check your connection and try again.');
            
            // Re-enable button
            submitBtn.disabled = false;
            if (animElement) {
                animElement.style.display = 'none';
            }
            submitBtn.textContent = this.config.customText.buttonText;
        }
    }
    
    startCountdown() {
        if (!this.config.countdown || !this.config.countdown.enabled) return;
        
        // Calculate end time based on provided duration
        const now = new Date();
        const endTime = new Date(now.getTime() + (
            (this.config.countdown.days * 24 * 60 * 60 * 1000) +
            (this.config.countdown.hours * 60 * 60 * 1000) +
            (this.config.countdown.minutes * 60 * 1000) +
            (this.config.countdown.seconds * 1000)
        ));
        
        // Update countdown immediately
        this.updateCountdown(endTime);
        
        // Set interval to update countdown
        this.countdown = setInterval(() => {
            this.updateCountdown(endTime);
        }, 1000);
    }
    
    updateCountdown(endTime) {
        const now = new Date();
        const distance = endTime - now;
        
        // Get DOM elements
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
        
        // If countdown finished
        if (distance < 0) {
            clearInterval(this.countdown);
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update HTML elements
        daysEl.textContent = this.padZero(days);
        hoursEl.textContent = this.padZero(hours);
        minutesEl.textContent = this.padZero(minutes);
        secondsEl.textContent = this.padZero(seconds);
    }
    
    padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a blog page (not dashboard)
    if (!document.querySelector('.dashboard-container')) {
        setTimeout(() => {
            new EmailPopupDisplay();
        }, 500);
    }
});
