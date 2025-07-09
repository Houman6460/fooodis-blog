/**
 * Email Popup Preview for Fooodis Blog System
 * Implements the enhanced features in the actual popup:
 * - Multiple layouts with/without images
 * - Countdown timer functionality
 * - Custom design and animations
 */

class EmailPopupPreview {
    constructor() {
        this.config = null;
        this.countdown = null;
        this.init();
    }
    
    init() {
        this.loadConfig();
        this.enhancePopup();
        this.bindEvents();
    }
    
    loadConfig() {
        // Load saved configuration from localStorage
        const savedConfig = localStorage.getItem('fooodis-email-popup-config');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
            } catch (error) {
                console.error('Error loading email popup configuration:', error);
                // Use default config
                this.config = this.getDefaultConfig();
            }
        } else {
            // Use default config
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
    
    enhancePopup() {
        // Look for the email popup on the page
        const emailOverlay = document.querySelector('.email-overlay');
        if (!emailOverlay) {
            console.log('Email popup not found on the page');
            return;
        }
        
        const emailPopup = emailOverlay.querySelector('.email-popup');
        if (!emailPopup) return;
        
        // Apply background color
        if (this.config.colors && this.config.colors.background) {
            emailPopup.style.backgroundColor = this.config.colors.background;
        }
        
        // Add layout class
        if (this.config.layout) {
            // Remove any existing layout classes
            emailPopup.classList.remove(
                'layout-standard', 
                'layout-image-left', 
                'layout-image-right', 
                'layout-image-top', 
                'layout-image-bottom', 
                'layout-image-background'
            );
            
            // Add the selected layout class
            emailPopup.classList.add(`layout-${this.config.layout}`);
        }
        
        // Update content with image if enabled
        const popupContent = emailPopup.querySelector('.email-popup-content');
        if (popupContent) {
            // Clear existing content
            popupContent.innerHTML = '';
            
            // Add image container if enabled
            if (this.config.image && this.config.image.enabled && this.config.image.url) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'popup-image-container';
                imageContainer.innerHTML = `<img src="${this.config.image.url}" alt="" class="popup-image">`;
                popupContent.appendChild(imageContainer);
            }
            
            // Add text container
            const textContainer = document.createElement('div');
            textContainer.className = 'popup-text-container';
            
            // Add text content
            if (this.config.customText) {
                textContainer.innerHTML = `
                    <h2 class="email-popup-title">${this.config.customText.title}</h2>
                    <p class="email-popup-description">${this.config.customText.description}</p>
                `;
            }
            
            // Add countdown if enabled
            if (this.config.countdown && this.config.countdown.enabled) {
                const countdownContainer = document.createElement('div');
                countdownContainer.className = 'countdown-container';
                countdownContainer.innerHTML = `
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
                `;
                textContainer.appendChild(countdownContainer);
                
                // Start countdown
                this.startCountdown();
            }
            
            // Add email form
            const emailForm = document.createElement('form');
            emailForm.className = 'email-form';
            emailForm.innerHTML = `
                <div class="email-input-group">
                    <input type="email" class="email-input" placeholder="${this.config.customText.placeholder}" required>
                </div>
                <button type="submit" class="email-submit-btn" style="background-color: ${this.config.colors.buttonBackground}; color: ${this.config.colors.buttonText};">
                    ${this.config.animation ? `<div class="anim-${this.config.animation}"></div>` : ''}
                    ${this.config.customText.buttonText}
                </button>
            `;
            textContainer.appendChild(emailForm);
            
            // Add text container to popup content
            popupContent.appendChild(textContainer);
            
            // Apply text background color
            if (this.config.colors && this.config.colors.textBackground) {
                textContainer.style.backgroundColor = this.config.colors.textBackground;
                // Add padding if background color is set
                textContainer.style.padding = '15px';
                textContainer.style.borderRadius = '6px';
            }
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
        
        // Update countdown
        this.updateCountdown(endTime);
        
        // Set interval to update countdown
        this.countdown = setInterval(() => {
            this.updateCountdown(endTime);
        }, 1000);
    }
    
    updateCountdown(endTime) {
        const now = new Date();
        const distance = endTime - now;
        
        // If countdown finished
        if (distance < 0) {
            clearInterval(this.countdown);
            this.safeUpdateElement('countdown-days', '00');
            this.safeUpdateElement('countdown-hours', '00');
            this.safeUpdateElement('countdown-minutes', '00');
            this.safeUpdateElement('countdown-seconds', '00');
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update HTML elements with null checks
        this.safeUpdateElement('countdown-days', this.padZero(days));
        this.safeUpdateElement('countdown-hours', this.padZero(hours));
        this.safeUpdateElement('countdown-minutes', this.padZero(minutes));
        this.safeUpdateElement('countdown-seconds', this.padZero(seconds));
    }
    
    // Helper method to safely update DOM elements
    safeUpdateElement(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Element with ID '${elementId}' not found in the DOM`);
        }
    }
    
    padZero(num) {
        return num < 10 ? `0${num}` : num;
    }
    
    bindEvents() {
        // Listen for when popup appears
        document.addEventListener('emailPopupShown', () => {
            // Re-enhance popup in case it was changed
            this.loadConfig();
            this.enhancePopup();
        });
        
        // Listen for form submission
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('email-form')) {
                e.preventDefault();
                
                // Show loading animation
                const submitBtn = e.target.querySelector('.email-submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('loading');
                    
                    // Simulate form submission
                    setTimeout(() => {
                        // Show success message
                        const emailPopup = document.querySelector('.email-popup');
                        if (emailPopup && this.config.customText) {
                            emailPopup.innerHTML = `
                                <div class="email-popup-success">
                                    <i class="fas fa-check-circle success-icon"></i>
                                    <h2 class="success-title">${this.config.customText.successMessage}</h2>
                                </div>
                            `;
                            
                            // Close popup after delay
                            setTimeout(() => {
                                document.querySelector('.email-overlay').classList.remove('active');
                            }, 3000);
                        }
                    }, 1500);
                }
            }
        });
    }
}

// Initialize preview when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the original popup is loaded
    setTimeout(() => {
        window.emailPopupPreview = new EmailPopupPreview();
        
        // Dispatch event to notify that popup preview is ready
        document.dispatchEvent(new CustomEvent('emailPopupPreviewReady'));
    }, 1000);
});
