
/**
 * Enhanced Force Email Popup Display - Complete Overhaul
 * Guaranteed popup display with advanced timing and fallback mechanisms
 */

console.log('🚀 Enhanced Force Popup Display: Script loading...');

// Enhanced configuration
const ENHANCED_POPUP_CONFIG = {
    enabled: true,
    delay: 1500,
    maxAttempts: 10,
    retryInterval: 1000,
    title: 'Join Our Newsletter',
    description: 'Get the latest restaurant tips and industry insights delivered to your inbox.',
    buttonText: 'Subscribe Now',
    placeholder: 'Enter your email address',
    successMessage: 'Welcome to our community!'
};

class EnhancedPopupDisplay {
    constructor() {
        this.popupShown = false;
        this.attempts = 0;
        this.initialized = false;
        this.domReady = false;
        this.retryTimer = null;
        
        console.log('🔧 Enhanced Popup Display: Initializing...');
        this.init();
    }

    init() {
        // Check if we're on dashboard (skip if so)
        if (this.isDashboard()) {
            console.log('🚫 Enhanced Popup Display: Skipped for dashboard page');
            return;
        }

        // Force enable popup settings
        this.forceEnablePopup();
        
        // Wait for DOM and try multiple initialization strategies
        this.waitForDOM(() => {
            this.domReady = true;
            this.startPopupSequence();
        });
    }

    isDashboard() {
        return document.querySelector('.dashboard-container') || 
               document.querySelector('#dashboard-container') ||
               window.location.pathname.includes('dashboard') ||
               window.location.pathname.includes('admin');
    }

    forceEnablePopup() {
        // Clear any blocking flags
        const keysToRemove = [
            'popup-shown', 'popup-blocked', 'popup-disabled',
            'email-popup-shown', 'newsletter-subscribed'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        // Force enable
        localStorage.setItem('popup-enabled', 'true');
        localStorage.setItem('popup-trigger', 'immediate');
        localStorage.setItem('popup-force-show', 'true');
        
        console.log('✅ Enhanced Popup Display: Forced popup settings enabled');
    }

    waitForDOM(callback) {
        if (document.readyState === 'complete') {
            callback();
        } else if (document.readyState === 'interactive') {
            setTimeout(callback, 100);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
            window.addEventListener('load', callback);
        }
    }

    startPopupSequence() {
        console.log('🎯 Enhanced Popup Display: Starting popup sequence...');
        
        // Remove any existing popups first
        this.removeExistingPopups();
        
        // Start the retry sequence
        this.attemptShowPopup();
        
        // Set up retry timer
        this.retryTimer = setInterval(() => {
            if (!this.popupShown && this.attempts < ENHANCED_POPUP_CONFIG.maxAttempts) {
                this.attemptShowPopup();
            } else if (this.attempts >= ENHANCED_POPUP_CONFIG.maxAttempts) {
                console.warn('⚠️ Enhanced Popup Display: Max attempts reached, stopping retries');
                clearInterval(this.retryTimer);
            }
        }, ENHANCED_POPUP_CONFIG.retryInterval);
    }

    removeExistingPopups() {
        const selectors = [
            '.email-overlay', '#emailPopupOverlay', '.popup-overlay',
            '[class*="popup"]', '[class*="modal"]', '.force-popup'
        ];
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Don't remove chatbot elements
                    if (!el.closest('#chatbot-widget') && 
                        !el.id.includes('chatbot') && 
                        !el.className.includes('chatbot')) {
                        el.remove();
                    }
                });
            } catch (e) {
                console.warn('Enhanced Popup Display: Error removing elements:', e);
            }
        });
    }

    attemptShowPopup() {
        if (this.popupShown) return;
        
        this.attempts++;
        console.log(`🎯 Enhanced Popup Display: Attempt ${this.attempts}/${ENHANCED_POPUP_CONFIG.maxAttempts}`);

        // Check if body exists and is ready
        if (!document.body) {
            console.log('⏳ Enhanced Popup Display: Waiting for document body...');
            return;
        }

        try {
            this.createAndShowPopup();
        } catch (error) {
            console.error('❌ Enhanced Popup Display: Error in attempt', this.attempts, error);
        }
    }

    createAndShowPopup() {
        console.log('🎨 Enhanced Popup Display: Creating popup...');

        // Create popup with enhanced styling
        const overlay = document.createElement('div');
        overlay.className = 'enhanced-email-overlay active force-show visible';
        overlay.id = 'enhancedEmailPopupOverlay';
        
        // Apply critical inline styles to ensure visibility
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.8) !important;
            z-index: 999999 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            opacity: 1 !important;
            visibility: visible !important;
            backdrop-filter: blur(5px) !important;
        `;

        const popup = document.createElement('div');
        popup.className = 'enhanced-email-popup';
        popup.style.cssText = `
            background: #252830 !important;
            color: #e0e0e0 !important;
            width: 90% !important;
            max-width: 450px !important;
            border-radius: 12px !important;
            padding: 30px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
            position: relative !important;
            transform: scale(1) !important;
            opacity: 1 !important;
            border: 2px solid #e8f24c !important;
            animation: popupSlideIn 0.5s ease-out !important;
        `;

        popup.innerHTML = `
            <div class="popup-header" style="
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 20px !important;
                border-bottom: 2px solid #e8f24c !important;
                padding-bottom: 15px !important;
            ">
                <h2 style="
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    margin: 0 !important;
                    color: #e8f24c !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                ">${ENHANCED_POPUP_CONFIG.title}</h2>
                <button class="enhanced-popup-close" style="
                    background: none !important;
                    border: none !important;
                    font-size: 28px !important;
                    color: #e0e0e0 !important;
                    cursor: pointer !important;
                    padding: 5px !important;
                    width: 35px !important;
                    height: 35px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    transition: background 0.2s ease !important;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'" 
                   onmouseout="this.style.background='none'">&times;</button>
            </div>
            <div class="popup-content">
                <p style="
                    font-size: 16px !important;
                    line-height: 1.6 !important;
                    margin: 0 0 25px 0 !important;
                    color: #e0e0e0 !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                ">${ENHANCED_POPUP_CONFIG.description}</p>
                <form class="enhanced-email-form" style="
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 15px !important;
                ">
                    <input type="email" class="enhanced-email-input" 
                           placeholder="${ENHANCED_POPUP_CONFIG.placeholder}" 
                           required style="
                        width: 100% !important;
                        padding: 15px !important;
                        border: 2px solid #32363f !important;
                        border-radius: 8px !important;
                        background: #1a1d23 !important;
                        color: #e0e0e0 !important;
                        font-size: 16px !important;
                        box-sizing: border-box !important;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                        transition: border-color 0.3s ease !important;
                    " onfocus="this.style.borderColor='#e8f24c'" 
                       onblur="this.style.borderColor='#32363f'">
                    <button type="submit" class="enhanced-submit-btn" style="
                        padding: 15px 25px !important;
                        background: linear-gradient(135deg, #e8f24c, #d4dd43) !important;
                        color: #1a1d23 !important;
                        border: none !important;
                        border-radius: 8px !important;
                        font-size: 16px !important;
                        font-weight: 700 !important;
                        cursor: pointer !important;
                        transition: all 0.3s ease !important;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.5px !important;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(232, 242, 76, 0.3)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        ${ENHANCED_POPUP_CONFIG.buttonText}
                    </button>
                </form>
            </div>
            <div class="popup-footer" style="
                text-align: center !important;
                font-size: 12px !important;
                color: #a0a0a0 !important;
                margin-top: 20px !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            ">
                <p>🔒 We respect your privacy. Unsubscribe anytime.</p>
            </div>
        `;

        // Add animation keyframes
        if (!document.querySelector('#popup-animations')) {
            const style = document.createElement('style');
            style.id = 'popup-animations';
            style.textContent = `
                @keyframes popupSlideIn {
                    from {
                        transform: scale(0.7) translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Add event listeners
        this.attachEnhancedEventListeners(overlay);

        // Mark as shown and stop retries
        this.popupShown = true;
        sessionStorage.setItem('popup-shown', 'true');
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
        }

        console.log('✅ Enhanced Popup Display: Popup created and displayed successfully!');

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('enhancedPopupShown', {
            detail: { 
                source: 'enhanced-popup-display',
                attempt: this.attempts,
                timestamp: Date.now()
            }
        }));

        // Auto-focus email input
        setTimeout(() => {
            const emailInput = overlay.querySelector('.enhanced-email-input');
            if (emailInput) {
                emailInput.focus();
            }
        }, 200);
    }

    attachEnhancedEventListeners(overlay) {
        // Close button
        const closeBtn = overlay.querySelector('.enhanced-popup-close');
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
        const form = overlay.querySelector('.enhanced-email-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleEnhancedSubmit(e));
        }

        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closePopup();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    closePopup() {
        const overlay = document.getElementById('enhancedEmailPopupOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.9)';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        console.log('🔒 Enhanced Popup Display: Popup closed');
    }

    handleEnhancedSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const emailInput = form.querySelector('.enhanced-email-input');
        const submitBtn = form.querySelector('.enhanced-submit-btn');

        if (!emailInput || !emailInput.value || !this.isValidEmail(emailInput.value)) {
            this.showValidationError(emailInput);
            return;
        }

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        submitBtn.style.opacity = '0.7';

        // Simulate API call
        setTimeout(() => {
            // Save email
            this.saveEnhancedEmail(emailInput.value);

            // Show success
            this.showEnhancedSuccess();

            // Close after delay
            setTimeout(() => {
                this.closePopup();
            }, 2500);
        }, 1200);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showValidationError(input) {
        input.style.borderColor = '#ff4757';
        input.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.2)';
        
        setTimeout(() => {
            input.style.borderColor = '#32363f';
            input.style.boxShadow = 'none';
        }, 2000);
    }

    saveEnhancedEmail(email) {
        try {
            const emails = JSON.parse(localStorage.getItem('enhanced-subscriber-emails') || '[]');
            const emailExists = emails.some(item => item.email === email);

            if (!emailExists) {
                emails.push({
                    email: email,
                    date: new Date().toISOString(),
                    status: 'active',
                    source: 'enhanced-popup',
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                });

                localStorage.setItem('enhanced-subscriber-emails', JSON.stringify(emails));
                console.log('💾 Enhanced Popup Display: Email saved successfully:', email);
            }
        } catch (error) {
            console.error('❌ Enhanced Popup Display: Error saving email:', error);
        }
    }

    showEnhancedSuccess() {
        const overlay = document.getElementById('enhancedEmailPopupOverlay');
        if (!overlay) return;

        const popup = overlay.querySelector('.enhanced-email-popup');
        if (popup) {
            popup.innerHTML = `
                <div class="enhanced-success-content" style="
                    text-align: center !important;
                    padding: 20px !important;
                ">
                    <div class="success-animation" style="
                        font-size: 60px !important;
                        color: #4CAF50 !important;
                        margin-bottom: 20px !important;
                        animation: successPulse 0.6s ease-out !important;
                    ">✓</div>
                    <h2 style="
                        font-size: 22px !important;
                        font-weight: 700 !important;
                        margin: 0 0 10px 0 !important;
                        color: #e8f24c !important;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                    ">${ENHANCED_POPUP_CONFIG.successMessage}</h2>
                    <p style="
                        font-size: 14px !important;
                        color: #a0a0a0 !important;
                        margin: 0 !important;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                    ">Check your email for confirmation</p>
                </div>
            `;

            // Add success animation
            if (!document.querySelector('#success-animations')) {
                const style = document.createElement('style');
                style.id = 'success-animations';
                style.textContent = `
                    @keyframes successPulse {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
}

// Enhanced initialization with multiple strategies
let enhancedPopupInstance = null;

function initializeEnhancedPopup() {
    if (enhancedPopupInstance) return;
    
    console.log('🎯 Enhanced Popup Display: Creating enhanced instance...');
    enhancedPopupInstance = new EnhancedPopupDisplay();
}

// Immediate initialization
initializeEnhancedPopup();

// Multiple fallback initializations
setTimeout(initializeEnhancedPopup, 500);
setTimeout(initializeEnhancedPopup, 1500);
setTimeout(initializeEnhancedPopup, 3000);

// DOM ready initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedPopup);
} else {
    setTimeout(initializeEnhancedPopup, 100);
}

// Window load initialization
window.addEventListener('load', initializeEnhancedPopup);

// Manual trigger functions
window.forceShowEnhancedPopup = function() {
    console.log('🧪 Enhanced Popup Display: Manual trigger activated');
    sessionStorage.removeItem('popup-shown');
    localStorage.removeItem('popup-shown');
    if (enhancedPopupInstance) {
        enhancedPopupInstance.popupShown = false;
        enhancedPopupInstance.attempts = 0;
    }
    enhancedPopupInstance = null;
    initializeEnhancedPopup();
};

window.debugEnhancedPopup = function() {
    console.log('🔍 Enhanced Popup Debug Status:', {
        popupShown: enhancedPopupInstance?.popupShown,
        attempts: enhancedPopupInstance?.attempts,
        domReady: enhancedPopupInstance?.domReady,
        sessionStorage: sessionStorage.getItem('popup-shown'),
        localStorage: localStorage.getItem('popup-shown'),
        existingPopups: document.querySelectorAll('.enhanced-email-overlay, #enhancedEmailPopupOverlay').length,
        bodyExists: !!document.body,
        readyState: document.readyState
    });
};

console.log('✅ Enhanced Force Popup Display: Script loaded and ready');
console.log('💡 Use window.forceShowEnhancedPopup() to manually trigger popup');
console.log('🔍 Use window.debugEnhancedPopup() to check popup status');
