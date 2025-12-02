/**
 * Fooodis Email Management Dashboard
 * DISABLED - Dashboard.html now has the complete email section
 * and email-subscribers-manager.js handles all functionality
 * 
 * This file is kept for reference but no longer creates duplicate sections.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (!document.querySelector('.dashboard-container')) return;
    
    // DISABLED - Section already exists in dashboard.html
    // email-subscribers-manager.js now handles all email subscriber functionality
    console.log('Email Management Dashboard: Using built-in HTML section (no dynamic creation)');
    
    // Only add nav item listener if needed
    addEmailNavItemEventListener();
});

/**
 * Remove any existing email sections to prevent duplicates
 */
function removeExistingEmailSections() {
    // Remove existing email section if it exists
    const existingSection = document.getElementById('email-management-section');
    if (existingSection) {
        existingSection.parentNode.removeChild(existingSection);
    }
    
    // Remove any email containers that might have been injected into other sections
    const emailContainers = document.querySelectorAll('.email-management-container');
    emailContainers.forEach(container => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });
}

/**
 * Create and inject the Email Management section into the dashboard
 */
function createEmailManagementSection() {
    // Check if section already exists
    if (document.getElementById('email-management-section')) return;
    
    // Create a new section element with proper dashboard section structure
    const section = document.createElement('section');
    section.className = 'dashboard-section'; // Standard dashboard section class
    section.id = 'email-management-section'; // ID must end with -section to match dashboard pattern
    
    section.innerHTML = `
        <div class="section-header">
            <h2 class="section-title"><i class="fas fa-envelope"></i> Email Subscribers</h2>
            <p class="section-description">Manage email subscribers and popup configuration</p>
        </div>
        
        <div class="email-management-container">
            <div class="email-controls">
                <h3 class="email-management-title">Subscriber List</h3>
                <div class="email-subscriber-count">0 Active Subscribers</div>
            </div>
            
            <div class="email-list-container">
                <div class="email-list-header">
                    <span>Email Address</span>
                    <span>Signup Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>
                <div class="email-list">
                    <!-- Subscribers will be loaded here -->
                </div>
                <div class="email-pagination">
                    <span>Page 1 of 1</span>
                    <div class="pagination-controls">
                        <button class="pagination-btn prev-page" title="Previous Page">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="pagination-btn next-page" title="Next Page">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="export-import-container">
                <button class="export-btn">
                    <i class="fas fa-download"></i> Export Subscribers
                </button>
                <button class="import-btn">
                    <i class="fas fa-upload"></i> Import Subscribers
                </button>
                <input type="file" id="importFile" class="import-file" accept=".csv">
            </div>
            
            <div class="popup-customization">
                <h3 class="customization-title">Email Popup Configuration</h3>
                
                <form id="popupConfigForm">
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="popupEnabled">
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">Enable Email Popup</span>
                        </label>
                    </div>
                    
                    <div class="customization-options">
                        <div class="customization-option">
                            <label class="option-label" for="popupTitle">Popup Title</label>
                            <input type="text" id="popupTitle" class="option-input" placeholder="Subscribe to Our Newsletter">
                        </div>
                        
                        <div class="customization-option">
                            <label class="option-label" for="buttonText">Button Text</label>
                            <input type="text" id="buttonText" class="option-input" placeholder="Subscribe">
                        </div>
                        
                        <div class="customization-option">
                            <label class="option-label" for="placeholderText">Input Placeholder</label>
                            <input type="text" id="placeholderText" class="option-input" placeholder="Enter your email address">
                        </div>
                        
                        <div class="customization-option">
                            <label class="option-label" for="successMessage">Success Message</label>
                            <input type="text" id="successMessage" class="option-input" placeholder="Thank you for subscribing!">
                        </div>
                        
                        <div class="customization-option">
                            <label class="option-label" for="popupDelay">Popup Delay (seconds)</label>
                            <input type="number" id="popupDelay" class="option-input" min="0" max="60" placeholder="5">
                        </div>
                    </div>
                    
                    <div class="popup-trigger-settings">
                        <h4 class="trigger-title">Popup Trigger</h4>
                        <h3 class="customization-title">Popup Trigger Settings</h3>
                        <input type="hidden" id="triggerType" value="time">
                        
                        <div class="trigger-options">
                            <div class="trigger-option active" data-trigger="time">
                                <h4 class="trigger-option-title">Time Delay</h4>
                                <p class="trigger-option-description">Show popup after a specific time</p>
                            </div>
                            
                            <div class="trigger-option" data-trigger="scroll">
                                <h4 class="trigger-option-title">Scroll Position</h4>
                                <p class="trigger-option-description">Show popup when user scrolls to a position</p>
                            </div>
                            
                            <div class="trigger-option" data-trigger="exit">
                                <h4 class="trigger-option-title">Exit Intent</h4>
                                <p class="trigger-option-description">Show popup when user tries to leave</p>
                            </div>
                        </div>
                        
                        <div class="trigger-parameters">
                            <div class="trigger-parameter time-parameter" style="display: block;">
                                <label class="option-label" for="timeDelay">Time Delay (seconds)</label>
                                <input type="number" id="timeDelay" class="option-input" min="1" value="5">
                            </div>
                            
                            <div class="trigger-parameter scroll-parameter" style="display: none;">
                                <label class="option-label" for="scrollPercentage">Scroll Percentage</label>
                                <input type="number" id="scrollPercentage" class="option-input" min="10" max="100" value="50">
                            </div>
                            
                            <div class="trigger-parameter exit-parameter" style="display: none;">
                                <p style="color: #92929e; font-size: 14px;">Popup will show when the mouse cursor leaves the window (indicating the user may be leaving).</p>
                            </div>
                            
                            <div class="customization-option" style="margin-top: 20px;">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="showOnce" checked>
                                    <span class="toggle-slider"></span>
                                    <span class="toggle-label">Show popup only once</span>
                                </label>
                            </div>
                            
                            <div class="customization-option" style="margin-top: 15px;">
                                <label class="option-label" for="showEveryDays">If not showing once, show every X days:</label>
                                <input type="number" id="showEveryDays" class="option-input" min="1" value="7">
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="email-customization-save">Save Configuration</button>
                </form>
            </div>
        </div>
    `;
    
    // Add the section to the dashboard
    const dashboardMain = document.querySelector('.dashboard-main');
    if (dashboardMain) {
        dashboardMain.appendChild(section);
    }
}

/**
 * Add event listener to the Email Management nav item
 */
function addEmailNavItemEventListener() {
    // Get the email nav item from the sidebar
    const emailNavItem = document.querySelector('.nav-item[data-section="email-management"]');
    if (!emailNavItem) {
        console.warn('Email management nav item not found in sidebar');
        return;
    }
    
    // Remove the email section from all dashboard sections except its own container
    cleanupEmailSectionVisibility();
    
    // We don't need to add new click handlers as they're already handled by dashboard.js
    // The setupNavigation() function in dashboard.js handles all nav item clicks
    console.log('Email nav item found, navigation handled by dashboard.js');
}

/**
 * Clean up email section visibility to ensure it only appears in its designated section
 */
function cleanupEmailSectionVisibility() {
    // Find all the dashboard sections except the email management section
    const sections = document.querySelectorAll('.dashboard-section:not(#email-management-section)');
    
    // Remove any email-related elements from other sections
    sections.forEach(section => {
        const emailElements = section.querySelectorAll('.email-management-container, .email-controls, .email-list-container, .popup-customization');
        emailElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    });
}

/**
 * Initialize the email content (subscribers and popup configuration)
 */
function initializeEmailContent() {
    // Load subscribers from localStorage
    loadSubscribers();
    
    // Update the subscriber count
    updateSubscriberCount();
    
    // Add event listeners for subscriber actions
    setupSubscriberActions();
    
    // Add event listeners for popup configuration
    setupPopupConfiguration();
}

/**
 * Load subscribers from localStorage
 */
function loadSubscribers() {
    // This function is already defined in email-collection-popup.js
    // Just making sure it's called to initialize the data
}

/**
 * Update the subscriber count
 */
function updateSubscriberCount() {
    // Get the subscriber count element
    const countElement = document.querySelector('.email-subscriber-count');
    if (!countElement) return;
    
    // Get access to the subscribers array from the other script
    let activeCount = 0;
    if (window.emailPopupSystem && window.emailPopupSystem.getSubscribers) {
        const subscribers = window.emailPopupSystem.getSubscribers();
        activeCount = subscribers.filter(sub => sub.status === 'active').length;
    }
    
    // Update the count
    countElement.textContent = `${activeCount} Active Subscribers`;
}

/**
 * Setup event listeners for subscriber actions
 */
function setupSubscriberActions() {
    // These functions are handled in email-collection-popup.js
    // Just making sure they're properly initialized when the section is activated
}

/**
 * Setup event listeners for popup configuration
 */
function setupPopupConfiguration() {
    // These functions are handled in email-collection-popup.js
    // Just making sure they're properly initialized when the section is activated
}

// Initialize color pickers to update color preview
document.addEventListener('DOMContentLoaded', function() {
    const colorInputs = ['backgroundColor', 'textColor', 'accentColor'];
    
    colorInputs.forEach(id => {
        const input = document.getElementById(id);
        const preview = document.getElementById(id + 'Preview');
        
        if (input && preview) {
            input.addEventListener('input', function() {
                preview.style.backgroundColor = this.value;
            });
        }
    });
});
