
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
    
    init() {
        console.log('🎯 Email Popup Display: Initializing...');
        this.loadConfig();
        this.createPopup();
        this.setupTriggers();
        
        // Force show popup for testing
        setTimeout(() => {
            this.forceShowPopup();
        }, 2000);
    }
    
    loadConfig() {
        // Load saved configuration from localStorage
        const savedConfig = localStorage.getItem('fooodis-email-popup-config');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
                console.log('📋 Email Popup Display: Config loaded', this.config);
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
        console.log('🏗️ Email Popup Display: Creating popup...');
        
        // Remove existing popup if any
        const existingPopup = document.getElementById('emailPopupOverlay');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup HTML
        const popup = document.createElement('div');
        popup.className = 'email-overlay';
        popup.id = 'emailPopupOverlay';
        
        let popupContent = `
            <div class="email-popup layout-${this.config.layout}" style="background-color: ${this.config.colors.background};">
                <div class="email-popup-header">
                    <h2 class="email-popup-title" style="color: white;">${this.config.customText.title}</h2>
                    <button class="email-popup-close" style="color: white;">&times;</button>
                </div>
                <div class="email-popup-content">
        `;
        
        // Add image if enabled
        if (this.config.image && this.config.image.enabled && this.config.image.url) {
            popupContent += `
                <div class="popup-image-container">
                    <img src="${this.config.image.url}" alt="" class="popup-image">
                </div>
            `;
        }
        
        // Add text container
        popupContent += `
                <div class="popup-text-container" style="${this.config.colors.textBackground ? 'background-color:' + this.config.colors.textBackground + ';padding:15px;border-radius:6px;' : ''}">
                    <p class="email-popup-description" style="color: white;">${this.config.customText.description}</p>
        `;
        
        // Add countdown if enabled
        if (this.config.countdown && this.config.countdown.enabled) {
            popupContent += `
                <div class="countdown-container">
                    <p class="countdown-message" style="color: white;">${this.config.countdown.message || 'Offer ends in:'}</p>
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
                            <input type="email" class="email-input" placeholder="${this.config.customText.placeholder}" required style="padding: 10px; border-radius: 4px; border: 1px solid #ccc; width: 100%; margin-bottom: 10px;">
                        </div>
                        <button type="submit" class="email-submit-btn" style="background-color: ${this.config.colors.buttonBackground}; color: ${this.config.colors.buttonText}; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                            ${this.config.animation ? `<div class="anim-${this.config.animation}" style="display: none;"></div>` : ''}
                            ${this.config.customText.buttonText}
                        </button>
                    </form>
                </div>
            </div>
            <div class="email-popup-footer">
                <p style="color: #aaa; font-size: 12px;">We respect your privacy. Unsubscribe at any time.</p>
            </div>
        </div>
        `;
        
        popup.innerHTML = popupContent;
        
        // Add styles
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Style the popup content
        const popupDiv = popup.querySelector('.email-popup');
        if (popupDiv) {
            popupDiv.style.cssText = `
                max-width: 500px;
                width: 90%;
                border-radius: 8px;
                padding: 20px;
                position: relative;
            `;
        }
        
        // Style the close button
        const closeBtn = popup.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            `;
        }
        
        document.body.appendChild(popup);
        console.log('✅ Email Popup Display: Popup created and added to DOM');
        
        // Add event listeners
        this.addEventListeners(popup);
    }
    
    addEventListeners(popup) {
        const closeBtn = popup.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('❌ Email Popup Display: Close button clicked');
                this.closePopup();
            });
        }
        
        const form = popup.querySelector('.email-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📧 Email Popup Display: Form submitted');
                this.handleSubmit(e);
            });
        }
        
        // Also close when clicking overlay background (outside the popup)
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('🎯 Email Popup Display: Overlay clicked');
                this.closePopup();
            }
        });
    }
    
    setupTriggers() {
        console.log('⚡ Email Popup Display: Setting up triggers...');
        
        // Always show popup for testing - remove popup-shown flag
        sessionStorage.removeItem('popup-shown');
        localStorage.setItem('popup-enabled', 'true');
        
        // Get trigger settings
        const triggerType = localStorage.getItem('popup-trigger') || 'delay';
        console.log('🎯 Email Popup Display: Trigger type:', triggerType);
        
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
        // Default to 3 seconds for immediate testing
        const delay = parseInt(localStorage.getItem('popup-delay')) || 3;
        console.log('⏰ Email Popup Display: Setting up delay trigger for', delay, 'seconds');
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
    
    forceShowPopup() {
        console.log('🚀 Email Popup Display: Force showing popup...');
        this.showPopup();
    }
    
    showPopup() {
        if (this.popupShown) {
            console.log('⚠️ Email Popup Display: Popup already shown');
            return;
        }
        
        console.log('🎊 Email Popup Display: Showing popup...');
        
        const popup = document.getElementById('emailPopupOverlay');
        if (!popup) {
            console.error('❌ Email Popup Display: Popup element not found');
            return;
        }
        
        popup.style.opacity = '1';
        popup.style.display = 'flex';
        this.popupShown = true;
        sessionStorage.setItem('popup-shown', 'true');
        
        // Start countdown if enabled
        if (this.config.countdown && this.config.countdown.enabled) {
            this.startCountdown();
        }
        
        // Dispatch event for other scripts to react
        document.dispatchEvent(new CustomEvent('emailPopupShown'));
        console.log('✅ Email Popup Display: Popup is now visible');
    }
    
    closePopup() {
        console.log('🔒 Email Popup Display: Closing popup...');
        
        const popup = document.getElementById('emailPopupOverlay');
        if (!popup) return;
        
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
        
        // Stop countdown if running
        if (this.countdown) {
            clearInterval(this.countdown);
        }
    }
    
    handleSubmit(e) {
        const form = e.target;
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('.email-submit-btn');
        
        if (!emailInput || !emailInput.value) return;
        
        console.log('📧 Email Popup Display: Processing email submission:', emailInput.value);
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        
        // Simulate API call
        setTimeout(() => {
            // Show success message
            const popup = document.getElementById('emailPopupOverlay');
            if (!popup) return;
            
            const emailPopup = popup.querySelector('.email-popup');
            if (emailPopup && this.config.customText) {
                emailPopup.innerHTML = `
                    <div class="email-popup-success" style="text-align: center; padding: 40px;">
                        <i class="fas fa-check-circle success-icon" style="font-size: 48px; color: #4caf50; margin-bottom: 20px;"></i>
                        <h2 class="success-title" style="color: white; margin-bottom: 20px;">${this.config.customText.successMessage}</h2>
                        <p style="color: #aaa;">You can close this popup now.</p>
                    </div>
                `;
                
                // Close popup after delay
                setTimeout(() => {
                    this.closePopup();
                }, 3000);
            }
            
            // Save email to localStorage
            try {
                const emails = JSON.parse(localStorage.getItem('subscriber-emails') || '[]');
                const emailExists = emails.some(item => item.email === emailInput.value);
                
                if (!emailExists) {
                    emails.push({
                        email: emailInput.value,
                        date: new Date().toISOString(),
                        status: 'active'
                    });
                    
                    localStorage.setItem('subscriber-emails', JSON.stringify(emails));
                    console.log('💾 Email Popup Display: Email saved:', emailInput.value);
                }
            } catch (error) {
                console.error('❌ Email Popup Display: Error saving subscriber:', error);
            }
        }, 1500);
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
    console.log('🎯 Email Popup Display: DOM ready, checking page type...');
    
    // Check if we're on a blog page (not dashboard)
    const isDashboard = document.querySelector('.dashboard-container') || 
                       document.querySelector('#dashboard-container') ||
                       window.location.pathname.includes('dashboard');
                       
    if (!isDashboard) {
        console.log('📱 Email Popup Display: On blog page, initializing popup...');
        setTimeout(() => {
            new EmailPopupDisplay();
        }, 1000);
    } else {
        console.log('🏢 Email Popup Display: On dashboard page, skipping popup initialization');
    }
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    const isDashboard = document.querySelector('.dashboard-container') || 
                       document.querySelector('#dashboard-container') ||
                       window.location.pathname.includes('dashboard');
                       
    if (!isDashboard && !window.emailPopupDisplayInitialized) {
        console.log('🔄 Email Popup Display: Window load fallback initialization...');
        window.emailPopupDisplayInitialized = true;
        new EmailPopupDisplay();
    }
});

// Force popup function for testing
window.forceEmailPopup = function() {
    console.log('🚀 Email Popup Display: Force popup triggered manually');
    localStorage.setItem('popup-enabled', 'true');
    sessionStorage.removeItem('popup-shown');
    new EmailPopupDisplay();
};

console.log('✅ Email Popup Display: Script loaded and ready');
