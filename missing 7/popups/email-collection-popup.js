/**
 * Fooodis Email Collection Popup System
 * 
 * This script provides functionality for:
 * 1. Displaying customizable email collection popups
 * 2. Storing collected emails in localStorage
 * 3. Managing email subscribers through the dashboard
 */

// Initialize the email collection system and expose it to window object to prevent duplication
window.emailPopupSystem = window.emailPopupSystem || (function() {
    // Storage keys
    const STORAGE_KEYS = {
        EMAILS: 'fooodis-email-subscribers',
        POPUP_CONFIG: 'fooodis-email-popup-config',
        POPUP_DISPLAYED: 'fooodis-email-popup-displayed'
    };

    // Default popup configuration
    const DEFAULT_CONFIG = {
        enabled: true,
        title: 'Subscribe to Our Newsletter',
        description: 'Stay updated with the latest food trends, recipes, and blog posts. We promise not to spam!',
        buttonText: 'Subscribe',
        placeholderText: 'Enter your email address',
        successMessage: 'Thank you for subscribing! You\'ll receive our latest updates soon.',
        footerText: 'We respect your privacy and will never share your information.',
        backgroundColor: '#1e1e2d',
        textColor: '#ffffff',
        accentColor: '#3699ff',
        triggerType: 'time', // time, exit, scroll
        triggerValue: 5, // seconds, scroll percentage
        showOnce: true,
        showEveryDays: 7
    };

    // State
    let config = DEFAULT_CONFIG;
    let subscribers = [];
    let popupShown = false;
    let currentPage = 1;
    let pageSize = 10;

    // DOM Elements - will be initialized when document is loaded
    let popupOverlay;
    let popupEmailInput;
    let popupResponseElement;
    
    /**
     * Initialize the email collection system
     */
    function init() {
        loadConfig();
        loadSubscribers();
        
        // Create the popup HTML if it doesn't exist
        if (!document.querySelector('.email-overlay')) {
            createPopupHTML();
        }
        
        // Initialize popup DOM references
        popupOverlay = document.querySelector('.email-overlay');
        popupEmailInput = document.querySelector('.email-input');
        popupResponseElement = document.querySelector('.email-popup-response');
        
        // Set up event listeners for the popup
        setupPopupEvents();
        
        // Initialize trigger
        initializeTrigger();
        
        // Initialize dashboard management if on dashboard page
        if (document.getElementById('email-management-section')) {
            initializeDashboard();
        }
        
        console.log('Email Collection System initialized');
    }
    
    /**
     * Create popup HTML and append to document
     */
    function createPopupHTML() {
        const popupHTML = `
            <div class="email-overlay">
                <div class="email-popup">
                    <div class="email-popup-header">
                        <h2 class="email-popup-title">${config.title}</h2>
                        <button class="email-popup-close" aria-label="Close popup">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="email-popup-content">
                        <p class="email-popup-description">${config.description}</p>
                        <form class="email-form" id="emailCollectionForm">
                            <div class="email-input-group">
                                <input type="email" class="email-input" placeholder="${config.placeholderText}" required>
                            </div>
                            <button type="submit" class="email-submit-btn">
                                <i class="fas fa-paper-plane"></i> ${config.buttonText}
                            </button>
                        </form>
                        <div class="email-popup-response"></div>
                    </div>
                    <div class="email-popup-footer">
                        ${config.footerText}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
    }
    
    /**
     * Set up event listeners for the popup
     */
    function setupPopupEvents() {
        // Close button
        const closeButton = document.querySelector('.email-popup-close');
        if (closeButton) {
            closeButton.addEventListener('click', hidePopup);
        }
        
        // Click outside to close
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                hidePopup();
            }
        });
        
        // Form submission
        const emailForm = document.getElementById('emailCollectionForm');
        if (emailForm) {
            emailForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitEmail();
            });
        }
        
        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && popupShown) {
                hidePopup();
            }
        });
    }
    
    /**
     * Initialize the trigger mechanism based on config
     */
    function initializeTrigger() {
        if (!config.enabled) return;
        
        // Check if popup has been shown before
        const lastDisplayed = localStorage.getItem(STORAGE_KEYS.POPUP_DISPLAYED);
        
        if (config.showOnce && lastDisplayed === 'true') {
            return;
        }
        
        if (lastDisplayed) {
            const lastDate = new Date(parseInt(lastDisplayed));
            const currentDate = new Date();
            const daysDifference = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (daysDifference < config.showEveryDays) {
                return;
            }
        }
        
        switch (config.triggerType) {
            case 'time':
                setTimeout(() => {
                    showPopup();
                }, config.triggerValue * 1000);
                break;
                
            case 'exit':
                document.addEventListener('mouseleave', function(e) {
                    if (e.clientY < 0 && !popupShown) {
                        showPopup();
                    }
                });
                break;
                
            case 'scroll':
                window.addEventListener('scroll', function() {
                    const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
                    if (scrollPercentage >= config.triggerValue && !popupShown) {
                        showPopup();
                    }
                });
                break;
        }
    }
    
    /**
     * Show the popup
     */
    function showPopup() {
        if (popupShown) return;
        
        popupOverlay.classList.add('active');
        popupShown = true;
        
        // Store display timestamp
        localStorage.setItem(STORAGE_KEYS.POPUP_DISPLAYED, Date.now().toString());
        
        // Focus the email input
        setTimeout(() => {
            popupEmailInput.focus();
        }, 300);
    }
    
    /**
     * Hide the popup
     */
    function hidePopup() {
        popupOverlay.classList.remove('active');
        popupShown = false;
        
        // Reset response message
        if (popupResponseElement) {
            popupResponseElement.textContent = '';
            popupResponseElement.classList.remove('success', 'error');
            popupResponseElement.style.display = 'none';
        }
    }
    
    /**
     * Process email submission
     */
    function submitEmail() {
        const email = popupEmailInput.value.trim();
        
        if (!email) {
            showResponse('Please enter your email address', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showResponse('Please enter a valid email address', 'error');
            return;
        }
        
        // Check if email already exists
        if (subscribers.some(sub => sub.email === email)) {
            showResponse('This email is already subscribed', 'error');
            return;
        }
        
        // Add the new subscriber
        const newSubscriber = {
            id: generateId(),
            email: email,
            date: new Date().toISOString(),
            status: 'active'
        };
        
        subscribers.push(newSubscriber);
        saveSubscribers();
        
        // Clear the input and show success message
        popupEmailInput.value = '';
        showResponse(config.successMessage, 'success');
        
        // Hide popup after delay
        setTimeout(hidePopup, 3000);
    }
    
    /**
     * Show response message in the popup
     * @param {string} message - The message to display
     * @param {string} type - Message type (success/error)
     */
    function showResponse(message, type) {
        if (!popupResponseElement) return;
        
        popupResponseElement.textContent = message;
        popupResponseElement.className = 'email-popup-response';
        popupResponseElement.classList.add(type);
        popupResponseElement.style.display = 'block';
    }
    
    /**
     * Initialize the dashboard UI
     */
    function initializeDashboard() {
        renderSubscriberList();
        setupDashboardEvents();
        updateSubscriberCount();
    }
    
    /**
     * Render the subscriber list in the dashboard
     */
    function renderSubscriberList() {
        const listContainer = document.querySelector('.email-list');
        if (!listContainer) return;
        
        // Calculate pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedList = subscribers.slice(startIndex, endIndex);
        
        // Clear current list
        listContainer.innerHTML = '';
        
        // Add subscribers to the list
        if (paginatedList.length === 0) {
            listContainer.innerHTML = `<div class="empty-list">No subscribers found</div>`;
            return;
        }
        
        paginatedList.forEach(subscriber => {
            const listItem = document.createElement('div');
            listItem.className = 'email-list-item';
            listItem.dataset.id = subscriber.id;
            
            const date = new Date(subscriber.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            listItem.innerHTML = `
                <span class="email-address">${subscriber.email}</span>
                <span class="signup-date">${formattedDate}</span>
                <span class="email-status ${subscriber.status}">${subscriber.status}</span>
                <div class="email-actions">
                    <button class="email-action-btn toggle-status" title="${subscriber.status === 'active' ? 'Deactivate' : 'Activate'}">
                        <i class="fas ${subscriber.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    </button>
                    <button class="email-action-btn delete" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            listContainer.appendChild(listItem);
        });
        
        // Update pagination info
        updatePaginationInfo();
    }
    
    /**
     * Set up event listeners for the dashboard UI
     */
    function setupDashboardEvents() {
        // Toggle subscriber status
        document.addEventListener('click', function(e) {
            if (e.target.closest('.toggle-status')) {
                const listItem = e.target.closest('.email-list-item');
                const id = listItem.dataset.id;
                toggleSubscriberStatus(id);
            }
        });
        
        // Delete subscriber
        document.addEventListener('click', function(e) {
            if (e.target.closest('.delete')) {
                const listItem = e.target.closest('.email-list-item');
                const id = listItem.dataset.id;
                deleteSubscriber(id);
            }
        });
        
        // Pagination
        const prevBtn = document.querySelector('.prev-page');
        const nextBtn = document.querySelector('.next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderSubscriberList();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(subscribers.length / pageSize);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderSubscriberList();
                }
            });
        }
        
        // Popup configuration form
        const configForm = document.getElementById('popupConfigForm');
        if (configForm) {
            configForm.addEventListener('submit', function(e) {
                e.preventDefault();
                savePopupConfig();
            });
        }
        
        // Trigger option selection
        const triggerOptions = document.querySelectorAll('.trigger-option');
        triggerOptions.forEach(option => {
            option.addEventListener('click', function() {
                triggerOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const triggerType = this.dataset.trigger;
                
                // Add null check before setting value
                const triggerTypeInput = document.getElementById('triggerType');
                if (triggerTypeInput) {
                    triggerTypeInput.value = triggerType;
                }
                
                // Add null checks for trigger parameters
                const triggerParams = document.querySelectorAll('.trigger-parameter');
                if (triggerParams && triggerParams.length > 0) {
                    triggerParams.forEach(param => {
                        param.style.display = 'none';
                    });
                    
                    const specificParam = document.querySelector(`.${triggerType}-parameter`);
                    if (specificParam) {
                        specificParam.style.display = 'block';
                    }
                }
            });
        });
        
        // Export subscribers
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportSubscribers);
        }
        
        // Import subscribers
        const importBtn = document.querySelector('.import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', function() {
                document.getElementById('importFile').click();
            });
        }
        
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', importSubscribers);
        }
        
        // Toggle popup enabled
        const popupEnabledToggle = document.getElementById('popupEnabled');
        if (popupEnabledToggle) {
            popupEnabledToggle.checked = config.enabled;
            popupEnabledToggle.addEventListener('change', function() {
                config.enabled = this.checked;
                saveConfig();
            });
        }
    }
    
    /**
     * Update subscriber count display
     */
    function updateSubscriberCount() {
        const countElement = document.querySelector('.email-subscriber-count');
        if (countElement) {
            const activeCount = subscribers.filter(sub => sub.status === 'active').length;
            countElement.textContent = `${activeCount} Active Subscribers`;
        }
    }
    
    /**
     * Update pagination information
     */
    function updatePaginationInfo() {
        const paginationInfo = document.querySelector('.email-pagination span');
        if (!paginationInfo) return;
        
        const totalPages = Math.ceil(subscribers.length / pageSize);
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        // Update button states
        const prevBtn = document.querySelector('.prev-page');
        const nextBtn = document.querySelector('.next-page');
        
        if (prevBtn) {
            if (currentPage <= 1) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
        }
        
        if (nextBtn) {
            if (currentPage >= totalPages) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }
    
    /**
     * Toggle subscriber status (active/unsubscribed)
     * @param {string} id - Subscriber ID
     */
    function toggleSubscriberStatus(id) {
        const subscriber = subscribers.find(sub => sub.id === id);
        if (!subscriber) return;
        
        subscriber.status = subscriber.status === 'active' ? 'unsubscribed' : 'active';
        saveSubscribers();
        renderSubscriberList();
        updateSubscriberCount();
    }
    
    /**
     * Delete a subscriber
     * @param {string} id - Subscriber ID
     */
    function deleteSubscriber(id) {
        if (!confirm('Are you sure you want to delete this subscriber?')) return;
        
        const index = subscribers.findIndex(sub => sub.id === id);
        if (index !== -1) {
            subscribers.splice(index, 1);
            saveSubscribers();
            renderSubscriberList();
            updateSubscriberCount();
        }
    }
    
    /**
     * Save popup configuration from form
     */
    function savePopupConfig() {
        try {
            // Basic settings
            const popupTitle = document.getElementById('popupTitle');
            if (popupTitle) config.title = popupTitle.value;

            const popupDescription = document.getElementById('popupDescription');
            if (popupDescription) config.description = popupDescription.value;

            const buttonText = document.getElementById('buttonText');
            if (buttonText) config.buttonText = buttonText.value;

            const placeholderText = document.getElementById('placeholderText');
            if (placeholderText) config.placeholderText = placeholderText.value;

            const successMessage = document.getElementById('successMessage');
            if (successMessage) config.successMessage = successMessage.value;

            const footerText = document.getElementById('footerText');
            if (footerText) config.footerText = footerText.value;
            
            // Colors
            const backgroundColor = document.getElementById('backgroundColor');
            if (backgroundColor) config.backgroundColor = backgroundColor.value;

            const textColor = document.getElementById('textColor');
            if (textColor) config.textColor = textColor.value;

            const accentColor = document.getElementById('accentColor');
            if (accentColor) config.accentColor = accentColor.value;
            
            // Trigger settings
            const triggerType = document.getElementById('triggerType');
            if (triggerType) {
                config.triggerType = triggerType.value;
                
                switch (config.triggerType) {
                    case 'time':
                        const timeDelay = document.getElementById('timeDelay');
                        config.triggerValue = timeDelay && !isNaN(parseInt(timeDelay.value)) ? 
                            parseInt(timeDelay.value) : 5;
                        break;
                    case 'scroll':
                        const scrollPercentage = document.getElementById('scrollPercentage');
                        config.triggerValue = scrollPercentage && !isNaN(parseInt(scrollPercentage.value)) ? 
                            parseInt(scrollPercentage.value) : 50;
                        break;
                    case 'exit':
                        config.triggerValue = 0; // Not applicable for exit intent
                        break;
                    default:
                        config.triggerValue = 5; // Default to 5 seconds
                }
            }
            
            // Display frequency
            const showOnce = document.getElementById('showOnce');
            if (showOnce) config.showOnce = showOnce.checked;

            const showEveryDays = document.getElementById('showEveryDays');
            if (showEveryDays) {
                config.showEveryDays = !isNaN(parseInt(showEveryDays.value)) ? 
                    parseInt(showEveryDays.value) : 7;
            }
            
            // Save config and show feedback
            saveConfig();
            
            console.log('Email popup configuration saved successfully');
            alert('Popup configuration saved successfully!');
        } catch (error) {
            console.error('Error saving popup configuration:', error);
        }
    }
    
    /**
     * Export subscribers to CSV file
     */
    function exportSubscribers() {
        if (subscribers.length === 0) {
            alert('No subscribers to export');
            return;
        }
        
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Email,Date,Status\n';
        
        subscribers.forEach(sub => {
            csvContent += `${sub.email},${sub.date},${sub.status}\n`;
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `fooodis-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        
        // Trigger download and remove link
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Import subscribers from CSV file
     */
    function importSubscribers(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const content = event.target.result;
            const lines = content.split('\n');
            
            // Skip header line
            const newSubscribers = [];
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const [email, date, status] = line.split(',');
                
                if (email && isValidEmail(email)) {
                    // Check if email already exists
                    if (!subscribers.some(sub => sub.email === email)) {
                        newSubscribers.push({
                            id: generateId(),
                            email: email,
                            date: date || new Date().toISOString(),
                            status: status || 'active'
                        });
                    }
                }
            }
            
            // Add new subscribers
            if (newSubscribers.length > 0) {
                subscribers = [...subscribers, ...newSubscribers];
                saveSubscribers();
                renderSubscriberList();
                updateSubscriberCount();
                
                alert(`Imported ${newSubscribers.length} new subscribers successfully.`);
            } else {
                alert('No new subscribers were imported.');
            }
            
            // Reset file input
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Load subscribers from storage
     */
    function loadSubscribers() {
        const storedSubscribers = localStorage.getItem(STORAGE_KEYS.EMAILS);
        subscribers = storedSubscribers ? JSON.parse(storedSubscribers) : [];
    }
    
    /**
     * Save subscribers to storage
     */
    function saveSubscribers() {
        localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(subscribers));
    }
    
    /**
     * Load popup configuration from storage
     */
    function loadConfig() {
        const storedConfig = localStorage.getItem(STORAGE_KEYS.POPUP_CONFIG);
        config = storedConfig ? { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) } : DEFAULT_CONFIG;
    }
    
    /**
     * Save popup configuration to storage
     */
    function saveConfig() {
        localStorage.setItem(STORAGE_KEYS.POPUP_CONFIG, JSON.stringify(config));
    }
    
    /**
     * Generate a random ID
     * @returns {string} Random ID
     */
    function generateId() {
        return 'sub_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    /**
     * Public API
     */
    return {
        init: init,
        showPopup: showPopup,
        hidePopup: hidePopup,
        getSubscribers: () => subscribers,
        getConfig: () => config
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize email collection system using the global window object
    if (window.emailPopupSystem) {
        window.emailPopupSystem.init();
    } else {
        console.error('Email popup system not initialized properly');
    }
});
