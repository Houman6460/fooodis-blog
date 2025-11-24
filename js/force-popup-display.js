/**
 * Force Popup Display for Fooodis Blog System
 * Ensures the email popup is displayed on the blog page regardless of configuration
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Force Popup Display activated');
    
    // Set popup as enabled in localStorage
    localStorage.setItem('popup-enabled', 'true');
    
    // Reset popup shown flag to ensure it shows again
    sessionStorage.removeItem('popup-shown');
    
    // Wait for the page to fully load before showing popup
    setTimeout(function() {
        console.log('Attempting to show popup...');
        
        // Look for existing popup instance
        const popup = document.getElementById('emailPopupOverlay');
        
        if (popup) {
            // Popup element exists, activate it
            popup.classList.add('active');
            console.log('Existing popup activated');
            
            // Dispatch event to notify scripts
            document.dispatchEvent(new CustomEvent('emailPopupShown'));
        } else {
            console.log('Popup element not found, creating one');
            
            // Force create a simple popup if none exists
            const simplePopup = document.createElement('div');
            simplePopup.className = 'email-overlay active';
            simplePopup.id = 'emailPopupOverlay';
            
            simplePopup.innerHTML = `
                <div class="email-popup layout-standard">
                    <div class="email-popup-header">
                        <h2 class="email-popup-title">Subscribe to Our Newsletter</h2>
                        <button class="email-popup-close">&times;</button>
                    </div>
                    <div class="email-popup-content">
                        <div class="popup-text-container">
                            <p class="email-popup-description">Stay updated with our latest news and offers.</p>
                            <form class="email-form">
                                <div class="email-input-group">
                                    <input type="email" class="email-input" placeholder="Enter your email address" required>
                                </div>
                                <button type="submit" class="email-submit-btn" style="background-color: #e8f24c; color: #1e2127;">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="email-popup-footer">
                        <p>We respect your privacy. Unsubscribe at any time.</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(simplePopup);
            
            // Add event listeners
            const closeBtn = simplePopup.querySelector('.email-popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    simplePopup.classList.remove('active');
                });
            }
            
            // Handle clicks outside popup
            simplePopup.addEventListener('click', function(e) {
                if (e.target === simplePopup) {
                    simplePopup.classList.remove('active');
                }
            });
            
            // Handle form submission
            const form = simplePopup.querySelector('.email-form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const emailInput = form.querySelector('.email-input');
                    if (!emailInput || !emailInput.value) return;
                    
                    // Show success message
                    const emailPopup = simplePopup.querySelector('.email-popup');
                    if (emailPopup) {
                        emailPopup.innerHTML = `
                            <div class="email-popup-success">
                                <i class="fas fa-check-circle success-icon"></i>
                                <h2 class="success-title">Thank you for subscribing!</h2>
                            </div>
                        `;
                        
                        // Close popup after delay
                        setTimeout(function() {
                            simplePopup.classList.remove('active');
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
                            console.log('New subscriber saved:', emailInput.value);
                        }
                    } catch (error) {
                        console.error('Error saving subscriber:', error);
                    }
                });
            }
            
            console.log('Simple popup created and activated');
        }
    }, 1500);
});
