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
        this.loadConfig();
        this.createPopup();
        this.setupTriggers();
    }

    loadConfig() {
        // Load saved configuration from localStorage
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

        let popupContent = `
            <div class="email-popup layout-${this.config.layout}">
                <div class="email-popup-header">
                    <h2 class="email-popup-title">${this.config.customText.title}</h2>
                    <button class="email-popup-close">&times;</button>
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

    handleSubmit(e) {
        const form = e.target;
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('.email-submit-btn');
        const animElement = submitBtn.querySelector(`[class^="anim-"]`);

        if (!emailInput || !emailInput.value) return;

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

        // Simulate API call
        setTimeout(() => {
            // Show success message
            const popup = document.getElementById('emailPopupOverlay');
            if (!popup) return;

            const emailPopup = popup.querySelector('.email-popup');
            if (emailPopup && this.config.customText) {
                emailPopup.innerHTML = `
                    <div class="email-popup-success">
                        <i class="fas fa-check-circle success-icon"></i>
                        <h2 class="success-title">${this.config.customText.successMessage}</h2>
                    </div>
                `;

                // Close popup after delay
                setTimeout(() => {
                    this.closePopup();
                }, 3000);
            }

            // Save email to localStorage in a format compatible with the SubscriberListManager
            try {
                // First check if email already exists
                const emails = JSON.parse(localStorage.getItem('subscriber-emails') || '[]');
                const emailExists = emails.some(item => item.email === emailInput.value);

                if (!emailExists) {
                    // Add new subscriber with proper format
                    emails.push({
                        email: emailInput.value,
                        date: new Date().toISOString(),
                        status: 'active'
                    });

                    // Save to localStorage
                    localStorage.setItem('subscriber-emails', JSON.stringify(emails));

                    // Log for debugging
                    console.log('New subscriber saved:', emailInput.value);
                    console.log('Total subscribers:', emails.length);

                    // Trigger an event that the dashboard can listen for if it's open in another tab
                    if (window.BroadcastChannel) {
                        try {
                            const bc = new BroadcastChannel('fooodis-subscribers');
                            bc.postMessage({
                                action: 'new-subscriber',
                                email: emailInput.value
                            });
                        } catch (e) {
                            console.error('Broadcast error:', e);
                        }
                    }
                }
            } catch (error) {
                console.error('Error saving subscriber:', error);
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
    // Check if we're on a blog page (not dashboard)
    if (!document.querySelector('.dashboard-container')) {
        setTimeout(() => {
            new EmailPopupDisplay();
        }, 500);
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