
/**
 * Force Email Popup Display - Guarantees popup shows up
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Force Popup Display: Activated');
    
    // Set popup as enabled in localStorage
    localStorage.setItem('popup-enabled', 'true');
    localStorage.setItem('popup-initialized', 'true');
    
    // Reset popup shown flag to ensure it shows again
    sessionStorage.removeItem('popup-shown');
    
    // Wait for the page to fully load before showing popup
    setTimeout(function() {
        console.log('⏰ Force Popup Display: Attempting to show popup...');
        
        // Check if we're on a dashboard page
        const isDashboard = document.querySelector('.dashboard-container') || 
                           document.querySelector('#dashboard-container') ||
                           window.location.pathname.includes('dashboard');
        
        if (isDashboard) {
            console.log('🏢 Force Popup Display: On dashboard page, skipping popup');
            return;
        }
        
        // Look for existing popup instance
        let popup = document.getElementById('emailPopupOverlay');
        
        if (popup) {
            // Popup element exists, activate it
            popup.style.opacity = '1';
            popup.style.display = 'flex';
            console.log('✅ Force Popup Display: Existing popup activated');
        } else {
            console.log('🔨 Force Popup Display: Creating new popup');
            
            // Force create a popup if none exists
            const forcePopup = document.createElement('div');
            forcePopup.className = 'email-overlay active';
            forcePopup.id = 'emailPopupOverlay';
            forcePopup.style.cssText = `
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
                opacity: 1;
            `;
            
            forcePopup.innerHTML = `
                <div class="email-popup layout-standard" style="
                    background-color: #252830;
                    max-width: 500px;
                    width: 90%;
                    border-radius: 8px;
                    padding: 20px;
                    position: relative;
                ">
                    <div class="email-popup-header">
                        <h2 class="email-popup-title" style="color: white; margin: 0 0 15px 0;">Subscribe to Our Newsletter</h2>
                        <button class="email-popup-close" style="
                            position: absolute;
                            top: 10px;
                            right: 15px;
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: white;
                        ">&times;</button>
                    </div>
                    <div class="email-popup-content">
                        <div class="popup-text-container">
                            <p class="email-popup-description" style="color: white; margin-bottom: 20px;">Stay updated with our latest news and offers.</p>
                            <form class="email-form">
                                <div class="email-input-group">
                                    <input type="email" class="email-input" placeholder="Enter your email address" required style="
                                        padding: 10px;
                                        border-radius: 4px;
                                        border: 1px solid #ccc;
                                        width: 100%;
                                        margin-bottom: 10px;
                                        box-sizing: border-box;
                                    ">
                                </div>
                                <button type="submit" class="email-submit-btn" style="
                                    background-color: #e8f24c;
                                    color: #1e2127;
                                    padding: 10px 20px;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    width: 100%;
                                    font-weight: bold;
                                ">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div class="email-popup-footer">
                        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 15px 0 0 0;">We respect your privacy. Unsubscribe at any time.</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(forcePopup);
            
            // Add event listeners
            const closeBtn = forcePopup.querySelector('.email-popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    forcePopup.style.opacity = '0';
                    setTimeout(() => {
                        forcePopup.style.display = 'none';
                    }, 300);
                });
            }
            
            const form = forcePopup.querySelector('.email-form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const emailInput = forcePopup.querySelector('.email-input');
                    const submitBtn = forcePopup.querySelector('.email-submit-btn');
                    
                    if (emailInput && emailInput.value) {
                        submitBtn.textContent = 'Subscribing...';
                        submitBtn.disabled = true;
                        
                        // Save email
                        try {
                            const emails = JSON.parse(localStorage.getItem('subscriber-emails') || '[]');
                            emails.push({
                                email: emailInput.value,
                                date: new Date().toISOString(),
                                status: 'active'
                            });
                            localStorage.setItem('subscriber-emails', JSON.stringify(emails));
                        } catch (error) {
                            console.error('Error saving email:', error);
                        }
                        
                        // Show success
                        setTimeout(() => {
                            const popupContent = forcePopup.querySelector('.email-popup');
                            popupContent.innerHTML = `
                                <div style="text-align: center; padding: 40px; color: white;">
                                    <div style="font-size: 48px; color: #4caf50; margin-bottom: 20px;">✓</div>
                                    <h2 style="margin-bottom: 20px;">Thank you for subscribing!</h2>
                                    <p style="color: #aaa;">You can close this popup now.</p>
                                </div>
                            `;
                            
                            setTimeout(() => {
                                forcePopup.style.opacity = '0';
                                setTimeout(() => {
                                    forcePopup.style.display = 'none';
                                }, 300);
                            }, 2000);
                        }, 1000);
                    }
                });
            }
            
            // Close on overlay click
            forcePopup.addEventListener('click', function(e) {
                if (e.target === forcePopup) {
                    forcePopup.style.opacity = '0';
                    setTimeout(() => {
                        forcePopup.style.display = 'none';
                    }, 300);
                }
            });
            
            console.log('✅ Force Popup Display: New popup created and shown');
        }
        
        // Dispatch event to notify other scripts
        document.dispatchEvent(new CustomEvent('emailPopupShown'));
        
    }, 1500); // Wait 1.5 seconds for page to load
});

// Global function to force popup
window.forceShowEmailPopup = function() {
    console.log('🎯 Force Popup Display: Manual trigger activated');
    localStorage.setItem('popup-enabled', 'true');
    sessionStorage.removeItem('popup-shown');
    location.reload(); // Reload to trigger popup
};

console.log('✅ Force Popup Display: Script loaded and ready');
