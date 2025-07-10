/**
 * 🔐 CHATBOT REGISTRATION FORM SYSTEM
 * Complete bilingual registration form with proper language switching
 */
```
```javascript
(function() {
    'use strict';

    window.ChatbotRegistrationForm = {
        initialized: false,
        formData: {},
        currentLanguage: 'english',

        init: function() {
            if (this.initialized) return;

            console.log('🔐 Initializing Chatbot Registration Form...');
            this.setupEventListeners();
            this.injectStyles();
            this.initialized = true;
        },

        shouldShowRegistrationForm: function() {
            // Check if user is already registered or has skipped registration
            const currentUser = localStorage.getItem('chatbot-current-user');
            if (!currentUser) return true;

            try {
                const userData = JSON.parse(currentUser);
                // Only show form again if user skipped and it's been more than 24 hours
                if (userData.skipped) {
                    const skipTime = new Date(userData.timestamp);
                    const now = new Date();
                    const hoursPassed = (now - skipTime) / (1000 * 60 * 60);
                    return hoursPassed > 24; // Ask again after 24 hours if skipped
                }
                return false; // User has filled out form
            } catch (error) {
                return true; // If data is corrupted, show form
            }
        },

        // Show registration form when needed
        showRegistrationForm: function() {
            const chatbotWidget = document.querySelector('#fooodis-chatbot');
            const chatbotWindow = document.querySelector('#chatbot-window');

            if (!chatbotWidget || !chatbotWindow) {
                console.warn('Chatbot widget or window not found');
                return;
            }

            // Create form overlay positioned within chatbot window
            const formOverlay = this.createFormOverlay();
            chatbotWindow.appendChild(formOverlay);

            // Set initial language to English
            this.currentLanguage = 'english';
            this.updateFormLanguage();

            console.log('🔐 Registration form shown with bilingual support');
        },

        // Create complete form HTML structure with both languages
        createFormOverlay: function() {
            const overlay = document.createElement('div');
            overlay.className = 'registration-overlay';

            overlay.innerHTML = `
                <div class="registration-container">
                    <div class="language-tabs">
                        <button type="button" class="lang-tab active" data-lang="english">English</button>
                        <button type="button" class="lang-tab" data-lang="svenska">Svenska</button>
                    </div>

                    <div class="registration-header">
                        <h2 class="form-title">Let's Get Started!</h2>
                        <p class="form-subtitle">Please provide your information to continue</p>
                    </div>

                    <form class="registration-form" id="registrationForm">
                        <div class="form-group">
                            <label for="userName" class="field-label">Your Name</label>
                            <input type="text" id="userName" name="userName" placeholder="Enter your name" required>
                        </div>

                        <div class="form-group">
                            <label for="restaurantName" class="field-label">Restaurant Name</label>
                            <input type="text" id="restaurantName" name="restaurantName" placeholder="Enter restaurant name" required>
                        </div>

                        <div class="form-group">
                            <label for="userPhone" class="field-label">Phone Number</label>
                            <input type="tel" id="userPhone" name="userPhone" placeholder="+46 70 123 45 67" required>
                        </div>

                        <div class="form-group">
                            <label for="systemUsage" class="field-label">Current delivery system</label>
                            <select id="systemUsage" name="systemUsage" required>
                                <option value="">Please select</option>
                                <option value="current_user">Using Fooodis</option>
                                <option value="competitor_user">Using another system</option>
                                <option value="potential_user">Looking for solution</option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="skip-btn">Skip</button>
                            <button type="submit" class="submit-btn">Submit</button>
                        </div>
                    </form>
                </div>
            `;

            return overlay;
        },

        setupEventListeners: function() {
            // Use event delegation for all form interactions
            document.addEventListener('click', this.handleClick.bind(this));
            document.addEventListener('submit', this.handleSubmit.bind(this));
        },

        handleClick: function(e) {
            // Language tab switching
            if (e.target.classList.contains('lang-tab')) {
                e.preventDefault();
                const selectedLang = e.target.getAttribute('data-lang');
                console.log('🌐 Language tab clicked:', selectedLang);

                // Update active tab
                const formContainer = e.target.closest('.registration-container');
                if (formContainer) {
                    const allTabs = formContainer.querySelectorAll('.lang-tab');
                    allTabs.forEach(tab => tab.classList.remove('active'));
                    e.target.classList.add('active');

                    // Switch language
                    this.currentLanguage = selectedLang;
                    this.updateFormLanguage();
                }
            }

            // Skip button
            if (e.target.classList.contains('skip-btn')) {
                e.preventDefault();
                this.skipForm();
            }
        },

        handleSubmit: function(e) {
            if (e.target.id === 'registrationForm') {
                e.preventDefault();
                this.submitForm();
            }
        },

        // Complete translation data
        translations: {
            english: {
                title: "Let's Get Started!",
                subtitle: "Please provide your information to continue",
                nameLabel: "Your Name",
                namePlaceholder: "Enter your name",
                restaurantLabel: "Restaurant Name",
                restaurantPlaceholder: "Enter restaurant name",
                phoneLabel: "Phone Number",
                phonePlaceholder: "+46 70 123 45 67",
                systemLabel: "Current delivery system",
                selectOption: "Please select",
                optionFooodis: "Using Fooodis",
                optionOther: "Using another system",
                optionLooking: "Looking for solution",
                skipButton: "Skip",
                submitButton: "Submit"
            },
            svenska: {
                title: "Låt oss komma igång!",
                subtitle: "Vänligen ange din information för att fortsätta",
                nameLabel: "Ditt namn",
                namePlaceholder: "Ange ditt namn",
                restaurantLabel: "Restaurangnamn",
                restaurantPlaceholder: "Ange restaurangnamn",
                phoneLabel: "Telefonnummer",
                phonePlaceholder: "+46 70 123 45 67",
                systemLabel: "Nuvarande leveranssystem",
                selectOption: "Vänligen välj",
                optionFooodis: "Använder Fooodis",
                optionOther: "Använder annat system",
                optionLooking: "Söker lösning",
                skipButton: "Hoppa över",
                submitButton: "Skicka"
            }
        },

        // Update form language with proper element targeting
        updateFormLanguage: function() {
            const lang = this.currentLanguage;
            const translations = this.translations[lang];

            if (!translations) {
                console.error('❌ No translations found for language:', lang);
                return;
            }

            console.log('🌐 Updating form language to:', lang);

            // Find the registration container
            const container = document.querySelector('.registration-container');
            if (!container) return;

            // Update title and subtitle
            const title = container.querySelector('.form-title');
            const subtitle = container.querySelector('.form-subtitle');

            if (title) title.textContent = translations.title;
            if (subtitle) subtitle.textContent = translations.subtitle;

            // Update labels
            const nameLabel = container.querySelector('label[for="userName"]');
            const restaurantLabel = container.querySelector('label[for="restaurantName"]');
            const phoneLabel = container.querySelector('label[for="userPhone"]');
            const systemLabel = container.querySelector('label[for="systemUsage"]');

            if (nameLabel) nameLabel.textContent = translations.nameLabel;
            if (restaurantLabel) restaurantLabel.textContent = translations.restaurantLabel;
            if (phoneLabel) phoneLabel.textContent = translations.phoneLabel;
            if (systemLabel) systemLabel.textContent = translations.systemLabel;

            // Update input placeholders
            const nameInput = container.querySelector('#userName');
            const restaurantInput = container.querySelector('#restaurantName');
            const phoneInput = container.querySelector('#userPhone');

            if (nameInput) nameInput.placeholder = translations.namePlaceholder;
            if (restaurantInput) restaurantInput.placeholder = translations.restaurantPlaceholder;
            if (phoneInput) phoneInput.placeholder = translations.phonePlaceholder;

            // Update select dropdown options
            const systemSelect = container.querySelector('#systemUsage');
            if (systemSelect) {
                const options = systemSelect.querySelectorAll('option');
                if (options[0]) options[0].textContent = translations.selectOption;
                if (options[1]) options[1].textContent = translations.optionFooodis;
                if (options[2]) options[2].textContent = translations.optionOther;
                if (options[3]) options[3].textContent = translations.optionLooking;
            }

            // Update buttons
            const skipBtn = container.querySelector('.skip-btn');
            const submitBtn = container.querySelector('.submit-btn');

            if (skipBtn) skipBtn.textContent = translations.skipButton;
            if (submitBtn) submitBtn.textContent = translations.submitButton;

            console.log('✅ Form language updated successfully to:', lang);
        },

        // Submit form data with user identity tracking
        submitForm: function() {
            const formData = {
                name: document.getElementById('userName')?.value || '',
                restaurantName: document.getElementById('restaurantName')?.value || '',
                phone: document.getElementById('userPhone')?.value || '',
                systemUsage: document.getElementById('systemUsage')?.value || '',
                timestamp: new Date().toISOString(),
                language: this.currentLanguage,
                conversationId: window.FoodisChatbot?.conversationId || null
            };

            // Save registration data to User Leads
            this.saveRegistrationData(formData);
            this.saveToUserLeads(formData);

            // Update user identity in Recent Conversations
            this.updateUserIdentity(formData);

            // Mark user as registered and save name for future conversations
            localStorage.setItem('chatbot-current-user', JSON.stringify(formData));
            localStorage.setItem('fooodis-user-name', formData.name);
            localStorage.setItem('fooodis-restaurant-name', formData.restaurantName);

            // Update chatbot widget with user info
            if (window.FoodisChatbot) {
                window.FoodisChatbot.userName = formData.name;
                window.FoodisChatbot.restaurantName = formData.restaurantName;
                window.FoodisChatbot.userRegistered = true;
            }

            // Close form and continue chat
            this.closeForm();

            // Send personalized success message to chat
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                const welcomeMessage = `Thank you ${formData.name} from ${formData.restaurantName}! How can I help you today?`;
                window.FoodisChatbot.addMessage(welcomeMessage, 'assistant');
            }

            console.log('✅ Form submitted successfully for user:', formData.name);
        },

        // Save to User Leads system
        saveToUserLeads: function(formData) {
            try {
                const existingLeads = JSON.parse(localStorage.getItem('user-leads') || '[]');

                // Check if lead already exists (by phone or name+restaurant)
                const existingLead = existingLeads.find(lead => 
                    lead.phone === formData.phone || 
                    (lead.name === formData.name && lead.restaurantName === formData.restaurantName)
                );

                if (!existingLead) {
                    // Add new lead
                    const leadData = {
                        id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        ...formData,
                        source: 'chatbot_registration',
                        status: 'new'
                    };

                    existingLeads.push(leadData);
                    localStorage.setItem('user-leads', JSON.stringify(existingLeads));

                    console.log('💼 New lead saved:', leadData.name);
                } else {
                    // Update existing lead with conversation ID
                    existingLead.conversationId = formData.conversationId;
                    existingLead.lastContact = formData.timestamp;
                    localStorage.setItem('user-leads', JSON.stringify(existingLeads));

                    console.log('💼 Existing lead updated:', existingLead.name);
                }
            } catch (error) {
                console.error('Error saving to user leads:', error);
            }
        },

        // Update user identity in Recent Conversations
        updateUserIdentity: function(formData) {
            try {
                // Update chatbot conversations if exists
                const conversations = JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
                const currentConversationId = formData.conversationId;

                if (currentConversationId) {
                    const conversation = conversations.find(conv => conv.id === currentConversationId);
                    if (conversation) {
                        // Update Anonymous User to actual name
                        conversation.userName = formData.name;
                        conversation.restaurantName = formData.restaurantName;
                        conversation.userPhone = formData.phone;
                        conversation.userRegistered = true;
                        conversation.lastUpdated = formData.timestamp;

                        localStorage.setItem('chatbot-conversations', JSON.stringify(conversations));
                        console.log('💬 Conversation updated for:', formData.name);
                    }
                }

                // Also update any "Recent Conversations" or similar tracking systems
                const recentConversations = JSON.parse(localStorage.getItem('recent-conversations') || '[]');
                if (recentConversations.length > 0) {
                    // Update the most recent anonymous conversation
                    const latestAnonymous = recentConversations.find(conv => 
                        !conv.userName || conv.userName === 'Anonymous User'
                    );

                    if (latestAnonymous) {
                        latestAnonymous.userName = formData.name;
                        latestAnonymous.restaurantName = formData.restaurantName;
                        latestAnonymous.userPhone = formData.phone;
                        latestAnonymous.userRegistered = true;
                        latestAnonymous.lastUpdated = formData.timestamp;

                        localStorage.setItem('recent-conversations', JSON.stringify(recentConversations));
                        console.log('📋 Recent conversations updated for:', formData.name);
                    }
                }

                // Trigger UI updates if dashboard is open
                if (window.dispatchEvent) {
                    window.dispatchEvent(new CustomEvent('userIdentityUpdated', {
                        detail: {
                            name: formData.name,
                            restaurantName: formData.restaurantName,
                            conversationId: currentConversationId
                        }
                    }));
                }

            } catch (error) {
                console.error('Error updating user identity:', error);
            }
        },

        // Skip form
        skipForm: function() {
            // Mark user as registered (skipped) to avoid showing form again
            localStorage.setItem('chatbot-current-user', JSON.stringify({ 
                skipped: true, 
                timestamp: new Date().toISOString() 
            }));

            this.closeForm();

            // Send skip message to chat
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                const skipMessage = this.currentLanguage === 'svenska' ? 
                    'Inga problem! Fråga mig gärna om Fooodis.' : 
                    'No problem! Feel free to ask me anything about Fooodis.';
                window.FoodisChatbot.addMessage(skipMessage, 'assistant');
            }
        },

        saveRegistrationData: function(formData) {
            // Save to localStorage
            try {
                const existingRegistrations = JSON.parse(localStorage.getItem('chatbot-registrations') || '[]');
                existingRegistrations.push(formData);
                localStorage.setItem('chatbot-registrations', JSON.stringify(existingRegistrations));

                console.log('Registration data saved:', formData);

            } catch (error) {
                console.error('Error saving registration data:', error);
            }
        },

        // Close form
        closeForm: function() {
            const overlay = document.querySelector('.registration-overlay');
            if (overlay) {
                overlay.remove();
            }
        },

        injectStyles: function() {
            if (document.getElementById('registration-form-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'registration-form-styles';
            styles.textContent = `
                .registration-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                    border-radius: 12px;
                }

                .registration-container {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 340px;
                    width: 95%;
                    max-height: 500px;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    position: relative;
                }

                .language-tabs {
                    display: flex;
                    margin-bottom: 30px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 4px;
                }

                .lang-tab {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: 500;
                    color: #6c757d;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .lang-tab:hover {
                    background: rgba(232, 242, 76, 0.3);
                    transform: translateY(-1px);
                }

                .lang-tab.active {
                    background: #e8f24c;
                    color: #000;
                    position: relative;
                }

                .lang-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #e8f24c;
                    border-radius: 2px;
                }

                .registration-header {
                    text-align: left;
                    margin-bottom: 30px;
                }

                .form-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c2c2c;
                    margin: 0 0 8px 0;
                    transition: all 0.3s ease;
                }

                .form-subtitle {
                    font-size: 16px;
                    color: #6c757d;
                    margin: 0;
                    transition: all 0.3s ease;
                }

                .form-group {
                    margin-bottom: 12px;
                }

                .field-label {
                    display: block;
                    font-size: 14px;
                    color: #2c2c2c;
                    margin-bottom: 6px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .registration-form input,
                .registration-form select {
                    width: 100%;
                    padding: 12px 14px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #f8f9fa;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }

                .registration-form input:focus,
                .registration-form select:focus {
                    outline: none;
                    border-color: #e8f24c;
                    background: white;
                }

                .registration-form select {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 12px center;
                    background-repeat: no-repeat;
                    background-size: 16px;
                    padding-right: 40px;
                    appearance: none;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                }

                .skip-btn {
                    flex: 1;
                    padding: 16px;
                    border: 2px solid #e9ecef;
                    background: white;
                    color: #6c757d;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .skip-btn:hover {
                    border-color: #d0d0d0;
                    background: #f8f9fa;
                }

                .submit-btn {
                    flex: 2;
                    padding: 16px;
                    border: none;
                    background: #e8f24c;
                    color: #000;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .submit-btn:hover {
                    background: #d9e53f;
                    transform: translateY(-1px);
                }

                /* Animation for language switching */
                .form-title, .form-subtitle, .field-label {
                    transition: opacity 0.2s ease, transform 0.2s ease;
                }

                .registration-form input::placeholder,
                .registration-form select option {
                    transition: all 0.3s ease;
                }
            `;

            document.head.appendChild(styles);
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            window.ChatbotRegistrationForm.init();

            // Show the registration form if needed, after a delay
            if (window.ChatbotRegistrationForm.shouldShowRegistrationForm()) {
                setTimeout(() => {
                    window.ChatbotRegistrationForm.showRegistrationForm();
                }, 1500); // Delay showing form
            }
        }, 100);
    });

})();