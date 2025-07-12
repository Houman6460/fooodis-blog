
/**
 * Force Email Popup Display - Guaranteed popup with debugging
 * This script ensures the email popup displays no matter what
 */

console.log('🚀 Force Popup Display: Script loading...');

// Configuration for the popup
const FORCE_POPUP_CONFIG = {
    enabled: true,
    delay: 2000, // 2 seconds
    trigger: 'immediate',
    title: 'Subscribe to Our Newsletter',
    description: 'Stay updated with our latest news and offers.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email address',
    successMessage: 'Thank you for subscribing!'
};

class ForcePopupDisplay {
    constructor() {
        this.popupShown = false;
        this.attempts = 0;
        this.maxAttempts = 5;
        this.init();
    }

    init() {
        console.log('🔧 Force Popup Display: Initializing...');

        // Force enable popup in localStorage
        localStorage.setItem('popup-enabled', 'true');
        localStorage.setItem('popup-trigger', 'immediate');
        localStorage.setItem('popup-delay', '2');

        // Clear any existing popup-shown flag
        sessionStorage.removeItem('popup-shown');
        localStorage.removeItem('popup-shown');

        // Remove any existing popups
        this.removeExistingPopups();

        // Multiple initialization strategies
        this.tryShowPopup();
        
        // Fallback timers
        setTimeout(() => this.tryShowPopup(), 1000);
        setTimeout(() => this.tryShowPopup(), 3000);
        setTimeout(() => this.tryShowPopup(), 5000);

        // DOM ready fallback
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.tryShowPopup());
        }

        // Window load fallback
        window.addEventListener('load', () => this.tryShowPopup());
    }

    removeExistingPopups() {
        const existingPopups = document.querySelectorAll('.email-overlay, #emailPopupOverlay, [class*="popup"], [class*="modal"]');
        existingPopups.forEach(popup => {
            if (popup.id !== 'chatbot-widget' && !popup.closest('#chatbot-widget')) {
                popup.remove();
            }
        });
    }

    tryShowPopup() {
        if (this.popupShown || this.attempts >= this.maxAttempts) {
            return;
        }

        this.attempts++;
        console.log(`🎯 Force Popup Display: Attempt ${this.attempts}/${this.maxAttempts}`);

        // Check if we're on dashboard (skip if so)
        const isDashboard = document.querySelector('.dashboard-container') || 
                           document.querySelector('#dashboard-container') ||
                           window.location.pathname.includes('dashboard') ||
                           window.location.pathname.includes('admin');

        if (isDashboard) {
            console.log('🚫 Force Popup Display: Skipped for dashboard page');
            return;
        }

        this.createAndShowPopup();
    }

    createAndShowPopup() {
        console.log('🎯 Force Popup Display: Creating popup...');

        // Remove any existing popup
        this.removeExistingPopups();

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'email-overlay active force-show';
        overlay.id = 'emailPopupOverlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.7) !important;
            z-index: 999999 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            opacity: 1 !important;
        `;

        overlay.innerHTML = `
            <div class="email-popup" style="
                background-color: #252830 !important;
                color: #e0e0e0 !important;
                width: 95% !important;
                max-width: 420px !important;
                border-radius: 8px !important;
                padding: 25px !important;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
                position: relative !important;
                transform: translateY(0) !important;
                opacity: 1 !important;
                border: 1px solid rgba(232, 242, 76, 0.3) !important;
            ">
                <div class="email-popup-header" style="
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 15px !important;
                    border-bottom: 1px solid #32363f !important;
                    padding-bottom: 10px !important;
                ">
                    <h2 class="email-popup-title" style="
                        font-size: 22px !important;
                        font-weight: 700 !important;
                        margin: 0 !important;
                        color: #e8f24c !important;
                        letter-spacing: 0.3px !important;
                    ">${FORCE_POPUP_CONFIG.title}</h2>
                    <button class="email-popup-close" style="
                        background: none !important;
                        border: none !important;
                        font-size: 24px !important;
                        color: #e0e0e0 !important;
                        cursor: pointer !important;
                        padding: 0 !important;
                        width: 30px !important;
                        height: 30px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border-radius: 50% !important;
                    ">&times;</button>
                </div>
                <div class="email-popup-content">
                    <div class="popup-text-container">
                        <p class="email-popup-description" style="
                            font-size: 16px !important;
                            line-height: 1.6 !important;
                            margin: 0 0 20px 0 !important;
                            color: #e0e0e0 !important;
                        ">${FORCE_POPUP_CONFIG.description}</p>
                        <form class="email-form" style="
                            display: flex !important;
                            flex-direction: column !important;
                            gap: 15px !important;
                        ">
                            <div class="email-input-group">
                                <input type="email" class="email-input" placeholder="${FORCE_POPUP_CONFIG.placeholder}" required style="
                                    width: 100% !important;
                                    padding: 12px 15px !important;
                                    border: 2px solid #32363f !important;
                                    border-radius: 6px !important;
                                    background-color: #1a1d23 !important;
                                    color: #e0e0e0 !important;
                                    font-size: 16px !important;
                                    box-sizing: border-box !important;
                                ">
                            </div>
                            <button type="submit" class="email-submit-btn" style="
                                padding: 12px 24px !important;
                                background-color: #e8f24c !important;
                                color: #1a1d23 !important;
                                border: none !important;
                                border-radius: 6px !important;
                                font-size: 16px !important;
                                font-weight: 600 !important;
                                cursor: pointer !important;
                            ">
                                ${FORCE_POPUP_CONFIG.buttonText}
                            </button>
                        </form>
                    </div>
                </div>
                <div class="email-popup-footer" style="
                    text-align: center !important;
                    font-size: 12px !important;
                    color: #a0a0a0 !important;
                    margin-top: 15px !important;
                ">
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
        document.dispatchEvent(new CustomEvent('emailPopupShown', {
            detail: { source: 'force-popup-display' }
        }));

        // Focus on email input
        setTimeout(() => {
            const emailInput = overlay.querySelector('.email-input');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    }

    attachEventListeners(overlay) {
        // Close button
        const closeBtn = overlay.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closePopup();
            });
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

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePopup();
            }
        });
    }

    closePopup() {
        const overlay = document.getElementById('emailPopupOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        console.log('🔒 Force Popup Display: Popup closed');
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
                    status: 'active',
                    source: 'force-popup'
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
                <div class="email-popup-success" style="
                    text-align: center !important;
                    padding: 20px !important;
                ">
                    <div class="success-icon" style="
                        font-size: 48px !important;
                        color: #4CAF50 !important;
                        margin-bottom: 15px !important;
                    ">✓</div>
                    <h2 class="success-title" style="
                        font-size: 20px !important;
                        font-weight: 600 !important;
                        margin: 0 !important;
                        color: #e8f24c !important;
                    ">${FORCE_POPUP_CONFIG.successMessage}</h2>
                </div>
            `;
        }
    }
}

// Initialize immediately and persistently
console.log('🎬 Force Popup Display: Starting initialization...');

let forcePopupInstance = null;

// Initialize with multiple strategies
function initializeForcePopup() {
    if (forcePopupInstance) return;
    
    console.log('🎯 Force Popup Display: Creating instance...');
    forcePopupInstance = new ForcePopupDisplay();
}

// Immediate initialization
initializeForcePopup();

// Delayed initialization
setTimeout(initializeForcePopup, 500);
setTimeout(initializeForcePopup, 2000);
setTimeout(initializeForcePopup, 5000);

// DOM ready initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForcePopup);
} else {
    setTimeout(initializeForcePopup, 100);
}

// Window load initialization
window.addEventListener('load', initializeForcePopup);

// Global function for manual testing
window.forceShowEmailPopup = function() {
    console.log('🧪 Force Popup Display: Manual trigger activated');
    sessionStorage.removeItem('popup-shown');
    localStorage.removeItem('popup-shown');
    forcePopupInstance = null;
    initializeForcePopup();
};

// Debug function
window.debugPopupStatus = function() {
    console.log('🔍 Popup Debug Status:', {
        popupShown: forcePopupInstance?.popupShown,
        attempts: forcePopupInstance?.attempts,
        sessionStorage: sessionStorage.getItem('popup-shown'),
        localStorage: localStorage.getItem('popup-shown'),
        existingPopups: document.querySelectorAll('.email-overlay, #emailPopupOverlay').length
    });
};

console.log('✅ Force Popup Display: Script loaded and ready');
console.log('💡 Use window.forceShowEmailPopup() to manually trigger popup');
console.log('🔍 Use window.debugPopupStatus() to check popup status');
