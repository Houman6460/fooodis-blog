/**
 * Force Email Popup Display - Guarantees popup shows up
 * This script ensures the email popup displays no matter what
 */

console.log('🚀 Force Popup Display: Script loading...');

// Configuration for the popup
const FORCE_POPUP_CONFIG = {
    enabled: true,
    delay: 3000, // 3 seconds
    trigger: 'delay',
    title: 'Subscribe to Our Newsletter',
    description: 'Stay updated with our latest news and offers.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email address',
    successMessage: 'Thank you for subscribing!'
};

class ForcePopupDisplay {
    constructor() {
        this.popupShown = false;
        this.init();
    }

    init() {
        console.log('🔧 Force Popup Display: Initializing...');

        // Force enable popup in localStorage
        localStorage.setItem('popup-enabled', 'true');
        localStorage.setItem('popup-trigger', 'delay');
        localStorage.setItem('popup-delay', '3');

        // Clear any existing popup-shown flag
        sessionStorage.removeItem('popup-shown');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createAndShowPopup());
        } else {
            setTimeout(() => this.createAndShowPopup(), 1000);
        }
    }

    createAndShowPopup() {
        console.log('🎯 Force Popup Display: Creating popup...');

        // Remove any existing popup
        const existingPopup = document.getElementById('emailPopupOverlay');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'email-overlay active';
        overlay.id = 'emailPopupOverlay';

        overlay.innerHTML = `
            <div class="email-popup layout-standard">
                <div class="email-popup-header">
                    <h2 class="email-popup-title">${FORCE_POPUP_CONFIG.title}</h2>
                    <button class="email-popup-close">&times;</button>
                </div>
                <div class="email-popup-content">
                    <div class="popup-text-container">
                        <p class="email-popup-description">${FORCE_POPUP_CONFIG.description}</p>
                        <form class="email-form">
                            <div class="email-input-group">
                                <input type="email" class="email-input" placeholder="${FORCE_POPUP_CONFIG.placeholder}" required>
                            </div>
                            <button type="submit" class="email-submit-btn">
                                ${FORCE_POPUP_CONFIG.buttonText}
                            </button>
                        </form>
                    </div>
                </div>
                <div class="email-popup-footer">
                    <p>We respect your privacy. Unsubscribe at any time.</p>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(overlay);

        // Add event listeners
        this.attachEventListeners(overlay);

        // Mark as shown
        this.popupShown = true;
        sessionStorage.setItem('popup-shown', 'true');

        console.log('✅ Force Popup Display: Popup created and shown!');

        // Dispatch event
        document.dispatchEvent(new CustomEvent('emailPopupShown'));
    }

    attachEventListeners(overlay) {
        // Close button
        const closeBtn = overlay.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePopup());
        }

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closePopup();
            }
        });

        // Form submission
        const form = overlay.querySelector('.email-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    closePopup() {
        const overlay = document.getElementById('emailPopupOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('.email-submit-btn');

        if (!emailInput || !emailInput.value) return;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        // Simulate API call
        setTimeout(() => {
            // Save email to localStorage
            this.saveEmail(emailInput.value);

            // Show success message
            this.showSuccess();

            // Close popup after delay
            setTimeout(() => {
                this.closePopup();
            }, 2000);
        }, 1000);
    }

    saveEmail(email) {
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
                console.log('💾 Force Popup Display: Email saved:', email);
            }
        } catch (error) {
            console.error('❌ Force Popup Display: Error saving email:', error);
        }
    }

    showSuccess() {
        const overlay = document.getElementById('emailPopupOverlay');
        if (!overlay) return;

        const popup = overlay.querySelector('.email-popup');
        if (popup) {
            popup.innerHTML = `
                <div class="email-popup-success">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h2 class="success-title">${FORCE_POPUP_CONFIG.successMessage}</h2>
                </div>
            `;
        }
    }
}

// Initialize immediately
console.log('🎬 Force Popup Display: Starting initialization...');

// Check if we're on the blog page (not dashboard)
const isDashboard = document.querySelector('.dashboard-container') || 
                   document.querySelector('#dashboard-container') ||
                   window.location.pathname.includes('dashboard');

if (!isDashboard) {
    // Initialize after a short delay
    setTimeout(() => {
        new ForcePopupDisplay();
    }, 2000);

    console.log('✅ Force Popup Display: Scheduled for blog page');
} else {
    console.log('🚫 Force Popup Display: Skipped for dashboard page');
}

// Global function for manual testing
window.forceShowEmailPopup = function() {
    console.log('🧪 Force Popup Display: Manual trigger activated');
    sessionStorage.removeItem('popup-shown');
    new ForcePopupDisplay();
};

console.log('✅ Force Popup Display: Script loaded and ready');