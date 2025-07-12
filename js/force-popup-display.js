
/**
 * Force Email Popup Display - Guarantees popup shows up
 * This script ensures the email popup displays no matter what
 */

console.log('🚀 Force Popup Display: Script loading...');

// Configuration
const POPUP_CONFIG = {
    title: 'Subscribe to Our Newsletter',
    description: 'Stay updated with our latest news and offers.',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing!',
    backgroundColor: '#252830',
    buttonBackground: '#e8f24c',
    buttonColor: '#1e2127'
};

// Global popup manager
window.ForcePopupManager = {
    popupShown: false,
    popupElement: null,
    
    // Force create and show popup
    createAndShowPopup() {
        console.log('🔨 Force Popup: Creating popup element...');
        
        // Remove any existing popup
        const existingPopup = document.getElementById('emailPopupOverlay');
        if (existingPopup) {
            existingPopup.remove();
            console.log('🗑️ Force Popup: Removed existing popup');
        }
        
        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'emailPopupOverlay';
        popup.className = 'email-overlay active force-popup';
        popup.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            z-index: 999999 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
        
        popup.innerHTML = `
            <div class="email-popup layout-standard" style="
                background-color: ${POPUP_CONFIG.backgroundColor};
                max-width: 500px;
                width: 90%;
                border-radius: 8px;
                padding: 30px;
                position: relative;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                animation: popupFadeIn 0.3s ease-out;
            ">
                <div class="email-popup-header">
                    <h2 class="email-popup-title" style="
                        color: white; 
                        margin: 0 0 15px 0;
                        font-size: 24px;
                        font-weight: bold;
                    ">${POPUP_CONFIG.title}</h2>
                    <button class="email-popup-close" style="
                        position: absolute;
                        top: 15px;
                        right: 20px;
                        background: none;
                        border: none;
                        font-size: 28px;
                        cursor: pointer;
                        color: white;
                        line-height: 1;
                        padding: 5px;
                    ">&times;</button>
                </div>
                <div class="email-popup-content">
                    <div class="popup-text-container">
                        <p class="email-popup-description" style="
                            color: #ccc; 
                            margin-bottom: 25px;
                            font-size: 16px;
                            line-height: 1.5;
                        ">${POPUP_CONFIG.description}</p>
                        <form class="email-form">
                            <div class="email-input-group">
                                <input type="email" class="email-input" placeholder="${POPUP_CONFIG.placeholder}" required style="
                                    padding: 15px;
                                    border-radius: 6px;
                                    border: 1px solid #555;
                                    width: 100%;
                                    margin-bottom: 15px;
                                    box-sizing: border-box;
                                    font-size: 16px;
                                    background-color: #333;
                                    color: white;
                                ">
                            </div>
                            <button type="submit" class="email-submit-btn" style="
                                background-color: ${POPUP_CONFIG.buttonBackground};
                                color: ${POPUP_CONFIG.buttonColor};
                                padding: 15px 25px;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                width: 100%;
                                font-weight: bold;
                                font-size: 16px;
                                transition: all 0.3s ease;
                            ">${POPUP_CONFIG.buttonText}</button>
                        </form>
                    </div>
                </div>
                <div class="email-popup-footer">
                    <p style="
                        color: #888; 
                        font-size: 12px; 
                        text-align: center; 
                        margin: 20px 0 0 0;
                    ">We respect your privacy. Unsubscribe at any time.</p>
                </div>
            </div>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popupFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            .email-submit-btn:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 5px 15px rgba(232, 242, 76, 0.3) !important;
            }
            
            .email-input:focus {
                outline: none !important;
                border-color: ${POPUP_CONFIG.buttonBackground} !important;
                box-shadow: 0 0 0 2px rgba(232, 242, 76, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
        
        // Add to DOM
        document.body.appendChild(popup);
        this.popupElement = popup;
        
        console.log('✅ Force Popup: Popup created and added to DOM');
        
        // Add event listeners
        this.addEventListeners(popup);
        
        // Mark as shown
        this.popupShown = true;
        sessionStorage.setItem('popup-shown', 'true');
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('emailPopupShown', {
            detail: { source: 'force-popup-display' }
        }));
        
        return popup;
    },
    
    addEventListeners(popup) {
        // Close button
        const closeBtn = popup.querySelector('.email-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('❌ Force Popup: Close button clicked');
                this.closePopup();
            });
        }
        
        // Form submission
        const form = popup.querySelector('.email-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📧 Force Popup: Form submitted');
                this.handleSubmit(e);
            });
        }
        
        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('🎯 Force Popup: Background clicked');
                this.closePopup();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popupShown) {
                console.log('⌨️ Force Popup: ESC key pressed');
                this.closePopup();
            }
        });
    },
    
    handleSubmit(e) {
        const form = e.target;
        const emailInput = form.querySelector('.email-input');
        const submitBtn = form.querySelector('.email-submit-btn');
        
        if (!emailInput || !emailInput.value) return;
        
        const email = emailInput.value.trim();
        console.log('📧 Force Popup: Processing email:', email);
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
        submitBtn.style.opacity = '0.7';
        
        // Save email
        try {
            const emails = JSON.parse(localStorage.getItem('subscriber-emails') || '[]');
            
            // Check if email already exists
            const emailExists = emails.some(item => item.email === email);
            
            if (!emailExists) {
                emails.push({
                    email: email,
                    date: new Date().toISOString(),
                    status: 'active',
                    source: 'force-popup'
                });
                
                localStorage.setItem('subscriber-emails', JSON.stringify(emails));
                console.log('💾 Force Popup: Email saved successfully');
            }
        } catch (error) {
            console.error('❌ Force Popup: Error saving email:', error);
        }
        
        // Show success
        setTimeout(() => {
            this.showSuccess();
        }, 1500);
    },
    
    showSuccess() {
        if (!this.popupElement) return;
        
        const popupContent = this.popupElement.querySelector('.email-popup');
        if (popupContent) {
            popupContent.innerHTML = `
                <div class="email-popup-success" style="
                    text-align: center; 
                    padding: 50px 30px;
                ">
                    <div style="
                        font-size: 64px; 
                        color: #4caf50; 
                        margin-bottom: 25px;
                        animation: successPulse 1s ease-out;
                    ">✓</div>
                    <h2 style="
                        color: white; 
                        margin-bottom: 20px;
                        font-size: 24px;
                    ">${POPUP_CONFIG.successMessage}</h2>
                    <p style="
                        color: #aaa;
                        font-size: 16px;
                    ">This popup will close automatically.</p>
                </div>
            `;
            
            // Add success animation
            const successStyle = document.createElement('style');
            successStyle.textContent = `
                @keyframes successPulse {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(successStyle);
            
            // Auto-close after success
            setTimeout(() => {
                this.closePopup();
            }, 3000);
        }
    },
    
    closePopup() {
        if (!this.popupElement) return;
        
        console.log('🔒 Force Popup: Closing popup');
        
        this.popupElement.style.opacity = '0';
        this.popupElement.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (this.popupElement && this.popupElement.parentNode) {
                this.popupElement.remove();
            }
            this.popupElement = null;
            this.popupShown = false;
        }, 300);
    },
    
    // Public method to show popup
    show() {
        if (this.popupShown) {
            console.log('⚠️ Force Popup: Already shown');
            return;
        }
        
        console.log('🎊 Force Popup: Showing popup...');
        return this.createAndShowPopup();
    }
};

// Auto-initialize
function initForcePopup() {
    console.log('🎯 Force Popup: Initializing...');
    
    // Check if we're on dashboard (skip popup on dashboard)
    const isDashboard = document.querySelector('.dashboard-container') || 
                       document.querySelector('#dashboard-container') ||
                       window.location.pathname.includes('dashboard');
    
    if (isDashboard) {
        console.log('🏢 Force Popup: On dashboard page, skipping popup');
        return;
    }
    
    // Force enable popup
    localStorage.setItem('popup-enabled', 'true');
    localStorage.setItem('popup-initialized', 'true');
    
    // Clear any "already shown" flags for testing
    sessionStorage.removeItem('popup-shown');
    
    console.log('⏰ Force Popup: Will show popup in 2 seconds...');
    
    // Show popup after delay
    setTimeout(() => {
        window.ForcePopupManager.show();
    }, 2000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForcePopup);
} else {
    initForcePopup();
}

// Global function for manual trigger
window.forceShowEmailPopup = function() {
    console.log('🎯 Force Popup: Manual trigger activated');
    sessionStorage.removeItem('popup-shown');
    window.ForcePopupManager.show();
};

console.log('✅ Force Popup Display: Script loaded and ready');
