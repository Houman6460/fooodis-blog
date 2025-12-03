/**
 * Email Popup Bridge for Fooodis Blog System
 * Ensures popup configuration is properly saved for the display system
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix the popup trigger issue by properly saving the toggle state
    const fixPopupTrigger = function() {
        const popupEnabledCheckbox = document.getElementById('popupEnabled');
        if (popupEnabledCheckbox) {
            // When the checkbox is clicked, save the state for the display script
            popupEnabledCheckbox.addEventListener('change', function() {
                localStorage.setItem('popup-enabled', this.checked ? 'true' : 'false');
            });
            
            // Also save checkbox state when save button is clicked
            const saveButton = document.querySelector('.email-customization-save');
            if (saveButton) {
                saveButton.addEventListener('click', function() {
                    localStorage.setItem('popup-enabled', popupEnabledCheckbox.checked ? 'true' : 'false');
                    
                    // Also save trigger type
                    const activeOption = document.querySelector('.trigger-option.active');
                    if (activeOption) {
                        localStorage.setItem('popup-trigger', activeOption.dataset.trigger || 'delay');
                    }
                    
                    // Save delay value
                    const delayInput = document.getElementById('popupDelay');
                    if (delayInput) {
                        localStorage.setItem('popup-delay', delayInput.value || '5');
                    }
                    
                    // Save scroll percentage
                    const scrollInput = document.getElementById('scrollPercentage');
                    if (scrollInput) {
                        localStorage.setItem('scroll-percentage', scrollInput.value || '50');
                    }
                    
                    // Initialize popup on blog when saved
                    localStorage.setItem('popup-initialized', 'true');
                    
                    // Show success notification for debugging
                    showNotification('Popup configuration saved and ready to display on the blog!');
                });
            }
            
            // Set initial state
            localStorage.setItem('popup-enabled', popupEnabledCheckbox.checked ? 'true' : 'false');
        }
        
        // Add click handlers to trigger options
        document.querySelectorAll('.trigger-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.trigger-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show parameters for selected trigger
                const trigger = this.dataset.trigger;
                document.querySelectorAll('.trigger-parameters-container').forEach(container => {
                    container.style.display = 'none';
                });
                
                const paramContainer = document.getElementById(trigger + 'Parameters');
                if (paramContainer) {
                    paramContainer.style.display = 'block';
                }
            });
        });
    };
    
    // Helper function to show notifications
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'email-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.innerHTML = `
                .email-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--primary-color, #e8f24c);
                    color: var(--secondary-color, #1e2127);
                    border-radius: 6px;
                    padding: 15px 20px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 9999;
                    transition: all 0.3s ease;
                    transform: translateY(20px);
                    opacity: 0;
                }
                
                .email-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-content i {
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Initialize when the form is visible
    const checkForForm = setInterval(function() {
        const form = document.getElementById('popupConfigForm');
        if (form) {
            clearInterval(checkForForm);
            fixPopupTrigger();
        }
    }, 500);
    
    // Force popup to show on the blog for testing (remove in production)
    // This helps ensure the popup works immediately after configuration
    window.forceTriggerPopup = function() {
        localStorage.setItem('popup-enabled', 'true');
        localStorage.setItem('popup-initialized', 'true');
        sessionStorage.removeItem('popup-shown');
        showNotification('Popup has been enabled for testing - check the blog page!');
    };
    
    // Add test button to the popup configuration section
    setTimeout(function() {
        const popupCustomization = document.querySelector('.popup-customization');
        if (popupCustomization) {
            const testButton = document.createElement('button');
            testButton.type = 'button';
            testButton.className = 'email-test-button';
            testButton.textContent = 'Test Popup on Blog';
            testButton.style.marginTop = '15px';
            testButton.style.backgroundColor = '#4caf50';
            testButton.style.marginLeft = '10px';
            
            testButton.addEventListener('click', function() {
                window.forceTriggerPopup();
            });
            
            const saveButton = document.querySelector('.email-customization-save');
            if (saveButton && saveButton.parentNode) {
                saveButton.parentNode.appendChild(testButton);
            }
        }
        
        // Logo Settings Handlers
        setupLogoSettings();
    }, 1000);
    
    // Logo settings functionality
    function setupLogoSettings() {
        const logoEnabled = document.getElementById('popupLogoEnabled');
        const logoSizeSlider = document.getElementById('popupLogoSize');
        const logoSizeValue = document.getElementById('logoSizeValue');
        const logoPreviewImg = document.querySelector('.logo-preview-img');
        const positionBtns = document.querySelectorAll('.position-btn');
        
        // Load saved logo settings
        const savedLogoSettings = JSON.parse(localStorage.getItem('fooodis-popup-logo') || '{}');
        
        // Apply saved settings
        if (logoEnabled) {
            logoEnabled.checked = savedLogoSettings.enabled !== false;
        }
        if (logoSizeSlider && savedLogoSettings.size) {
            logoSizeSlider.value = savedLogoSettings.size;
            if (logoSizeValue) logoSizeValue.textContent = savedLogoSettings.size;
            if (logoPreviewImg) logoPreviewImg.style.maxWidth = savedLogoSettings.size + 'px';
        }
        if (positionBtns.length && savedLogoSettings.position) {
            positionBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.position === savedLogoSettings.position) {
                    btn.classList.add('active');
                }
            });
        }
        
        // Logo toggle handler
        if (logoEnabled) {
            logoEnabled.addEventListener('change', function() {
                saveLogoSettings();
            });
        }
        
        // Logo size slider handler
        if (logoSizeSlider) {
            logoSizeSlider.addEventListener('input', function() {
                const size = this.value;
                if (logoSizeValue) logoSizeValue.textContent = size;
                if (logoPreviewImg) logoPreviewImg.style.maxWidth = size + 'px';
                saveLogoSettings();
            });
        }
        
        // Position button handlers
        positionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                positionBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                saveLogoSettings();
            });
        });
        
        function saveLogoSettings() {
            const settings = {
                enabled: logoEnabled ? logoEnabled.checked : true,
                size: logoSizeSlider ? parseInt(logoSizeSlider.value) : 100,
                position: document.querySelector('.position-btn.active')?.dataset.position || 'center'
            };
            localStorage.setItem('fooodis-popup-logo', JSON.stringify(settings));
            
            // Also save to API
            saveLogoSettingsToAPI(settings);
        }
        
        async function saveLogoSettingsToAPI(settings) {
            try {
                await fetch('/api/subscribers/popup-config', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        logo_enabled: settings.enabled,
                        logo_size: settings.size,
                        logo_position: settings.position
                    })
                });
                console.log('Logo settings saved to API:', settings);
            } catch (error) {
                console.error('Error saving logo settings:', error);
            }
        }
    }
});
