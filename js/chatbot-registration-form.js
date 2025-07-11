/**
 * 🔐 CHATBOT REGISTRATION FORM SYSTEM
 * Complete bilingual registration form with direct DOM replacement
 */
(function() {
    'use strict';

    window.ChatbotRegistrationForm = {
        initialized: false,
        formData: {},
        currentLanguage: 'english',
        formElement: null,
        domReplacementActive: false,

        // Translation data
        translations: {
            english: {
                title: "Let's Get Started!",
                subtitle: "Please provide your information to continue",
                nameLabel: "Your Name",
                namePlaceholder: "Enter your name",
                emailLabel: "Email Address",
                emailPlaceholder: "Enter your email",
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
                emailLabel: "E-postadress",
                emailPlaceholder: "Ange din e-post",
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

        init: function() {
            if (this.initialized) return;

            console.log('🔐 Initializing Chatbot Registration Form...');
            this.injectStyles();
            this.setupEventListeners();
            this.initialized = true;

            console.log('🔐 Registration form initialized, checking if should show...');

            // Check immediately and show if needed
            if (this.shouldShowRegistrationForm()) {
                console.log('🔐 Form should show, displaying now...');
                this.showRegistrationForm();
            } else {
                console.log('🔐 Form should not show, user already registered');
            }
        },

        shouldShowRegistrationForm: function() {
            console.log('🔍 Checking if registration form should show...');

            // Check all possible storage locations for user data
            const storageKeys = [
                'chatbot-current-user',
                'chatbot-user-data', 
                'chatbot-users',
                'fooodis-user-name',
                'fooodis-restaurant-name'
            ];

            let hasAnyUserData = false;

            storageKeys.forEach(key => {
                const value = localStorage.getItem(key);
                console.log(`Storage check ${key}:`, value);
                if (value && value !== 'null' && value !== '[]') {
                    hasAnyUserData = true;
                }
            });

            // Force show form if no user data at all
            if (!hasAnyUserData) {
                console.log('✅ No user data found anywhere, SHOULD SHOW FORM');
                return true;
            }

            try {
                // Check if user has complete registration data
                const currentUser = localStorage.getItem('chatbot-current-user');
                const userName = localStorage.getItem('fooodis-user-name');
                const restaurantName = localStorage.getItem('fooodis-restaurant-name');

                // If we have name and restaurant, consider registered
                if (userName && restaurantName) {
                    console.log('❌ User already has name and restaurant, not showing form');
                    return false;
                }

                if (currentUser) {
                    const user = JSON.parse(currentUser);

                    // If user skipped, check if enough time passed
                    if (user.skipped) {
                        const skipTime = new Date(user.timestamp);
                        const now = new Date();
                        const hoursPassed = (now - skipTime) / (1000 * 60 * 60);
                        const shouldShow = hoursPassed > 24;
                        console.log(`⏰ User skipped ${hoursPassed.toFixed(1)} hours ago, should show:`, shouldShow);
                        return shouldShow;
                    }

                    // If user has complete data, don't show form
                    if (user.name && user.restaurantName) {
                        console.log('❌ User already registered with complete data, not showing form');
                        return false;
                    }
                }

                console.log('✅ Incomplete or no user data, SHOULD SHOW FORM');
                return true;

            } catch (error) {
                console.error('Error checking user data:', error);
                console.log('✅ Error occurred, defaulting to SHOW FORM');
                return true;
            }
        },

        showRegistrationForm: function() {
            console.log('🔐 Showing registration form...');

            // Find or create chatbot container
            let chatbotContainer = document.querySelector('#fooodis-chatbot, #chatbot-window, .chatbot-container');

            if (!chatbotContainer) {
                // Create a temporary container if chatbot doesn't exist
                chatbotContainer = document.createElement('div');
                chatbotContainer.id = 'temp-chatbot-container';
                chatbotContainer.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10000;
                    width: 400px;
                    height: 500px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                `;
                document.body.appendChild(chatbotContainer);
            }

            // Remove existing form if any
            const existingForm = document.querySelector('.registration-overlay');
            if (existingForm) {
                existingForm.remove();
            }

            // Create and show new form
            this.formElement = this.createFormOverlay();
            chatbotContainer.appendChild(this.formElement);

            // Set initial language and update form
            this.currentLanguage = 'english';
            this.updateFormLanguage();

            console.log('✅ Registration form displayed successfully');
        },

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
                            <label for="userEmail" class="field-label">Email Address</label>
                            <input type="email" id="userEmail" name="userEmail" placeholder="Enter your email" required>
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
            document.addEventListener('click', (e) => {
                // Language tab switching
                if (e.target.classList.contains('lang-tab')) {
                    e.preventDefault();
                    this.handleLanguageSwitch(e.target);
                }

                // Skip button
                if (e.target.classList.contains('skip-btn')) {
                    e.preventDefault();
                    this.skipForm();
                }
            });

            document.addEventListener('submit', (e) => {
                if (e.target.id === 'registrationForm') {
                    e.preventDefault();
                    this.handleFormSubmit(e);
                }
            });
        },

        handleLanguageSwitch: function(tabElement) {
            const selectedLang = tabElement.getAttribute('data-lang');
            console.log('🌐 Switching to language:', selectedLang);

            // Update active tab
            const container = tabElement.closest('.registration-container');
            if (container) {
                const allTabs = container.querySelectorAll('.lang-tab');
                allTabs.forEach(tab => tab.classList.remove('active'));
                tabElement.classList.add('active');

                // Update current language and form
                this.currentLanguage = selectedLang;
                this.updateFormLanguage();
            }
        },

        updateFormLanguage: function() {
            const translations = this.translations[this.currentLanguage];
            if (!translations) {
                console.error('❌ No translations found for:', this.currentLanguage);
                return;
            }

            console.log('🌐 Updating form language to:', this.currentLanguage);

            const container = document.querySelector('.registration-container');
            if (!container) return;

            // Update header
            const title = container.querySelector('.form-title');
            const subtitle = container.querySelector('.form-subtitle');
            if (title) title.textContent = translations.title;
            if (subtitle) subtitle.textContent = translations.subtitle;

            // Update labels
            const labels = {
                'label[for="userName"]': translations.nameLabel,
                'label[for="userEmail"]': translations.emailLabel,
                'label[for="restaurantName"]': translations.restaurantLabel,
                'label[for="userPhone"]': translations.phoneLabel,
                'label[for="systemUsage"]': translations.systemLabel
            };

            Object.entries(labels).forEach(([selector, text]) => {
                const element = container.querySelector(selector);
                if (element) element.textContent = text;
            });

            // Update placeholders
            const placeholders = {
                '#userName': translations.namePlaceholder,
                '#userEmail': translations.emailPlaceholder,
                '#restaurantName': translations.restaurantPlaceholder,
                '#userPhone': translations.phonePlaceholder
            };

            Object.entries(placeholders).forEach(([selector, placeholder]) => {
                const element = container.querySelector(selector);
                if (element) element.placeholder = placeholder;
            });

            // Update select options
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

            console.log('✅ Form language updated successfully');
        },

        submitForm: function(formData) {
            try {
                console.log('📝 Submitting registration form:', formData);

                // Validate form data
                if (!formData.name || !formData.restaurantName) {
                    console.error('❌ Missing required form data');
                    const errorMessage = this.currentLanguage === 'svenska' ? 
                        'Namn och restaurangnamn krävs.' : 
                        'Name and restaurant name are required.';
                    this.showError(errorMessage);
                    return false;
                }

                // Save user data
                const identityData = {
                    name: formData.name,
                    restaurantName: formData.restaurantName,
                    email: formData.email || '',
                    language: formData.language || 'english'
                };

                // Multiple save mechanisms for redundancy
                localStorage.setItem('fooodis-user-name', identityData.name);
                localStorage.setItem('fooodis-restaurant-name', identityData.restaurantName);
                localStorage.setItem('fooodis-language', identityData.language);
                localStorage.setItem('fooodis-user-email', identityData.email);

                // Save complete user data
                localStorage.setItem('chatbot-current-user', JSON.stringify(identityData));
                localStorage.setItem('chatbot-user-data', JSON.stringify(identityData));

                // Update chatbot widget state
                if (window.FoodisChatbot) {
                    window.FoodisChatbot.userRegistered = true;
                    window.FoodisChatbot.userInfo = identityData;
                    window.FoodisChatbot.userName = identityData.name;
                    window.FoodisChatbot.restaurantName = identityData.restaurantName;
                    console.log('✅ Updated chatbot widget state');
                }

                // Update global identity
                window.currentUserIdentity = identityData;
                console.log('✅ ALL IDENTITY UPDATE MECHANISMS TRIGGERED:', identityData);

                // Close form and send success message
                this.closeForm();

                // Trigger registration completion event for force refresh
                window.dispatchEvent(new CustomEvent('registrationFormCompleted', {
                    detail: identityData,
                    bubbles: true
                }));

                if (window.FoodisChatbot?.addMessage) {
                    const message = formData.language === 'svenska' 
                        ? `Tack ${formData.name} från ${formData.restaurantName}! Hur kan jag hjälpa dig idag?`
                        : `Thank you ${formData.name} from ${formData.restaurantName}! How can I help you today?`;
                    window.FoodisChatbot.addMessage(message, 'assistant');
                }

                // Send to server API (non-blocking)
                this.sendToServerAPI(formData).catch(error => {
                    console.warn('Server API warning:', error);
                });

                console.log('✅ Form submitted successfully:', formData.name);
                return true;

            } catch (error) {
                console.error('❌ Error submitting form:', error);
                const errorMessage = this.currentLanguage === 'svenska' ? 
                    'Ett fel uppstod. Vänligen försök igen.' : 
                    'An error occurred. Please try again.';
                this.showError(errorMessage);
                return false;
            }
        },

        startDOMReplacementSystem: function(formData, languageFlag) {
            console.log('🔥 DOM REPLACEMENT: Starting aggressive text replacement...');

            this.domReplacementActive = true;

            // Store replacement data globally
            window.userReplacementData = {
                oldText: 'Anonymous User',
                newName: formData.name,
                flag: languageFlag,
                restaurantName: formData.restaurantName,
                userCategory: this.getUserCategoryFromSystemUsage(formData.systemUsage),
                active: true
            };

            // Start immediate replacement cycle
            this.performDOMReplacement();

            // Set up continuous monitoring
            const replacementInterval = setInterval(() => {
                if (!this.domReplacementActive) {
                    clearInterval(replacementInterval);
                    return;
                }
                this.performDOMReplacement();
            }, 500);

            // Also watch for DOM mutations
            this.setupMutationObserver();

            // Stop after 60 seconds
            setTimeout(() => {
                this.domReplacementActive = false;
                if (window.userReplacementData) {
                    window.userReplacementData.active = false;
                }
                console.log('🔥 DOM REPLACEMENT: System stopped after timeout');
            }, 60000);
        },

        performDOMReplacement: function() {
            if (!window.userReplacementData || !window.userReplacementData.active) return;

            const { oldText, newName, flag, restaurantName, userCategory } = window.userReplacementData;

            // Find all text nodes containing "Anonymous User"
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        return node.nodeValue && node.nodeValue.includes(oldText) 
                            ? NodeFilter.FILTER_ACCEPT 
                            : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            const textNodesToReplace = [];
            let node;
            while (node = walker.nextNode()) {
                textNodesToReplace.push(node);
            }

            // Replace text in found nodes
            textNodesToReplace.forEach(textNode => {
                const parentElement = textNode.parentElement;
                if (parentElement && !parentElement.classList.contains('user-replaced')) {

                    console.log('🎯 REPLACING:', textNode.nodeValue);

                    // Create new content with flag and name
                    const newContent = document.createElement('span');
                    newContent.classList.add('user-replaced', 'user-identified');
                    newContent.innerHTML = `
                        <i class="fas fa-user"></i> 
                        ${flag} 
                        ${newName}
                        <span class="user-category-badge ${userCategory.toLowerCase().replace(/\s+/g, '-')}">${userCategory}</span>
                    `;

                    // Replace the text node with new content
                    textNode.parentNode.replaceChild(newContent, textNode);

                    // Style the parent element
                    parentElement.classList.add('user-identified', 'recently-updated');
                    parentElement.style.borderLeft = '3px solid #e8f24c';
                    parentElement.style.backgroundColor = 'rgba(232, 242, 76, 0.1)';
                    parentElement.setAttribute('data-user-registered', 'true');
                    parentElement.setAttribute('data-user-name', newName);
                }
            });

            // Also check for elements with specific classes/ids
            const conversationSelectors = [
                '.conversation-user',
                '.user-name', 
                '.chat-user',
                '.conversation-card',
                '.conversation-item',
                '[data-conversation-id]'
            ];

            conversationSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.textContent.includes(oldText) && !element.classList.contains('user-replaced')) {
                        console.log('🎯 REPLACING ELEMENT:', selector);

                        element.innerHTML = element.innerHTML.replace(
                            new RegExp(oldText, 'gi'),
                            `<span class="user-replaced user-identified">
                                <i class="fas fa-user"></i> 
                                ${flag} 
                                ${newName}
                                <span class="user-category-badge ${userCategory.toLowerCase().replace(/\s+/g, '-')}">${userCategory}</span>
                            </span>`
                        );

                        element.classList.add('user-replaced', 'user-identified');
                    }
                });
            });
        },

        setupMutationObserver: function() {
            const observer = new MutationObserver((mutations) => {
                if (!this.domReplacementActive) return;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if new element contains "Anonymous User"
                                if (node.textContent && node.textContent.includes('Anonymous User')) {
                                    console.log('🔍 MUTATION: New anonymous content detected, replacing...');
                                    setTimeout(() => this.performDOMReplacement(), 100);
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });

            // Store observer reference to clean up later
            window.userReplacementObserver = observer;

            // Stop observer after 60 seconds
            setTimeout(() => {
                observer.disconnect();
                console.log('🔍 MUTATION: Observer stopped');
            }, 60000);
        },

        sendToServerAPI: async function(formData) {
            try {
                console.log('📤 Sending registration data to server API...');

                // Send user lead data to server
                const userResponse = await fetch('/api/chatbot/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        restaurantName: formData.restaurantName,
                        userType: formData.userType, // Use the determined userType
                        systemUsage: formData.systemUsage,
                        language: formData.language,
                        languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                        languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        conversationId: formData.conversationId,
                        sessionId: formData.sessionId,
                        deviceId: formData.deviceId,
                        registeredAt: formData.timestamp,
                        source: 'registration_form'
                    })
                });

                if (!userResponse.ok) {
                    throw new Error(`User API error: ${userResponse.status}`);
                }

                const userResult = await userResponse.json();
                console.log('✅ User data sent to server:', userResult);

            } catch (error) {
                console.error('❌ Server API error:', error);
                // Don't throw error - allow local storage to work as fallback
            }
        },

        skipForm: function() {
            localStorage.setItem('chatbot-current-user', JSON.stringify({
                skipped: true,
                timestamp: new Date().toISOString()
            }));

            this.closeForm();

            if (window.FoodisChatbot?.addMessage) {
                const message = this.currentLanguage === 'svenska' ?
                    'Inga problem! Fråga mig gärna om Fooodis.' :
                    'No problem! Feel free to ask me anything about Fooodis.';
                window.FoodisChatbot.addMessage(message, 'assistant');
            }

            console.log('ℹ️ Form skipped by user');
        },

        closeForm: function() {
            if (this.formElement) {
                this.formElement.remove();
                this.formElement = null;
            }

            // Remove temporary container if it exists
            const tempContainer = document.getElementById('temp-chatbot-container');
            if (tempContainer) {
                tempContainer.remove();
            }
        },

        saveRegistrationData: function(formData) {
            try {
                const registrations = JSON.parse(localStorage.getItem('chatbot-registrations') || '[]');
                registrations.push(formData);
                localStorage.setItem('chatbot-registrations', JSON.stringify(registrations));
            } catch (error) {
                console.error('Error saving registration data:', error);
            }
        },

        saveToUserLeads: function(formData) {
            try {
                const leads = JSON.parse(localStorage.getItem('user-leads') || '[]');
                const existingLead = leads.find(lead =>
                    lead.phone === formData.phone ||
                    (lead.name === formData.name && lead.restaurantName === formData.restaurantName)
                );

                const leadData = {
                    id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    ...formData,
                    registeredAt: formData.timestamp,
                    source: 'chatbot_registration',
                    status: 'new',
                    language: formData.language,
                    languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                    languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                    preferredAgent: formData.language === 'svenska' ? 'swedish-speaking' : 'english-speaking',
                    identityLinked: true,
                    userType: formData.userType // Ensure userType is included in lead data
                };

                if (!existingLead) {
                    leads.push(leadData);
                    console.log('✅ New lead saved:', formData.name, `(Language: ${formData.language})`);
                } else {
                    // Update existing lead with new information
                    Object.assign(existingLead, {
                        email: formData.email,
                        conversationId: formData.conversationId,
                        lastContact: formData.timestamp,
                        language: formData.language,
                        languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                        languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        preferredAgent: formData.language === 'svenska' ? 'swedish-speaking' : 'english-speaking',
                        identityLinked: true,
                        status: 'updated'
                    });
                    console.log('✅ Existing lead updated:', formData.name, `(Language: ${formData.language})`);
                }

                localStorage.setItem('user-leads', JSON.stringify(leads));
            } catch (error) {
                console.error('Error saving to user leads:', error);
            }
        },

        getUserCategoryFromSystemUsage: function(systemUsage) {
            switch (systemUsage) {
                case 'current_user':
                    return 'Current User';
                case 'competitor_user':
                    return 'Competitor User';
                case 'potential_user':
                    return 'Potential User';
                default:
                    return 'Registered User';
            }
        },

        getCurrentConversationId: function() {
            // Try to get current conversation ID from various sources
            return window.currentConversationId || 
                   localStorage.getItem('current-conversation-id') ||
                   sessionStorage.getItem('conversation-id') ||
                   null;
        },

        getSessionId: function() {
            let sessionId = sessionStorage.getItem('chatbot-session-id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('chatbot-session-id', sessionId);
            }
            return sessionId;
        },

        getDeviceId: function() {
            let deviceId = localStorage.getItem('chatbot-device-id');
            if (!deviceId) {
                deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('chatbot-device-id', deviceId);
            }
            return deviceId;
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
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    border-radius: 12px;
                }

                .registration-container {
                    background: white;
                    border-radius: 16px;
                    padding: 32px;
                    width: 350px;
                    max-height: 500px;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
                    position: relative;
                    animation: formSlideIn 0.3s ease-out;
                }

                @keyframes formSlideIn {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .language-tabs {
                    display: flex;
                    margin-bottom: 24px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 4px;
                }

                .lang-tab {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #6c757d;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .lang-tab:hover {
                    background: rgba(232, 242, 76, 0.2);
                }

                .lang-tab.active {
                    background: #e8f24c;
                    color: #000;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .registration-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .form-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 8px 0;
                }

                .form-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin: 0;
                }

                .form-group {
                    margin-bottom: 14px;
                }

                .field-label {
                    display: block;
                    font-size: 13px;
                    color: #333;
                    margin-bottom: 6px;
                    font-weight: 600;
                }

                .registration-form input,
                .registration-form select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    background: #f8f9fa;
                    color: #333 !important;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .registration-form input:focus,
                .registration-form select:focus {
                    outline: none;
                    border-color: #e8f24c;
                    background: white;
                    color: #333 !important;
                    box-shadow: 0 0 0 3px rgba(232, 242, 76, 0.1);
                }

                .registration-form select {
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 12px center;
                    background-repeat: no-repeat;
                    background-size: 16px;
                    padding-right: 40px;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                .skip-btn {
                    flex: 1;
                    padding: 14px;
                    border: 2px solid #e9ecef;
                    background: white;
                    color: #666;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .skip-btn:hover {
                    border-color: #d0d7de;
                    background: #f6f8fa;
                }

                .submit-btn {
                    flex: 2;
                    padding: 14px;
                    border: none;
                    background: #e8f24c;
                    color: #000;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    ```text
                    transition: all 0.2s ease;
                }

                .submit-btn:hover {
                    background: #dce63a;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .submit-btn:active {
                    transform: translateY(0);
                }

                /* User Replaced Content Styling */
                .user-replaced {
                    font-weight: 600 !important;
                    color: #000 !important;
                    background: linear-gradient(135deg, rgba(232, 242, 76, 0.2), rgba(232, 242, 76, 0.1)) !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                    border-left: 3px solid #e8f24c !important;
                    display: inline-block !important;
                }

                .user-identified {
                    background: linear-gradient(135deg, rgba(232, 242, 76, 0.1), rgba(232, 242, 76, 0.05)) !important;
                    border-left: 3px solid #e8f24c !important;
                    transition: all 0.3s ease !important;
                }

                .user-category-badge {
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                    margin-left: 5px;
                }

                .user-category-badge.current-user {
                    background-color: rgba(76, 175, 80, 0.2);
                    color: #4caf50;
                }

                .user-category-badge.competitor-user {
                    background-color: rgba(255, 152, 0, 0.2);
                    color: #ff9800;
                }

                .user-category-badge.potential-user {
                    background-color: rgba(33, 150, 243, 0.2);
                    color: #2196f3;
                }

                .user-category-badge.registered-user {
                    background-color: rgba(156, 39, 176, 0.2);
                    color: #9c27b0;
                }
            `;
            document.head.appendChild(styles);
        },

        forceConversationRefresh: function() {
            console.log('🔄 Force Conversation Refresh triggered');

            // Option 1: Use custom event
            const refreshEvent = new CustomEvent('refreshConversations', {
                detail: {
                    message: 'Forcing conversation list to refresh'
                },
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(refreshEvent);
            window.dispatchEvent(refreshEvent);

            // Option 2: Direct call to a known function (if available)
            if (typeof window.refreshConversationList === 'function') {
                window.refreshConversationList();
            }

            // Option 3: Brute-force method (reload page - use sparingly)
            // window.location.reload();

            // Option 4: Call chatbotManager.forceConversationUIUpdate
            if (window.chatbotManager && window.chatbotManager.forceConversationUIUpdate) {
                window.chatbotManager.forceConversationUIUpdate();
            }
        },

        handleFormSubmit: function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('📝 Form submit event triggered');

            // Get form element
            const form = event.target.closest('form') || event.target;

            // Collect form data
            const formData = this.collectFormData(form);

            if (formData) {
                console.log('📋 Collected form data:', formData);
                const success = this.submitForm(formData);

                if (success) {
                    console.log('✅ Form submission successful');
                } else {
                    console.error('❌ Form submission failed');
                }
            } else {
                console.error('❌ Failed to collect form data');
                const errorMessage = this.currentLanguage === 'svenska' ? 
                    'Vänligen fyll i alla obligatoriska fält.' : 
                    'Please fill in all required fields.';
                this.showError(errorMessage);
            }
        },

        collectFormData: function(formElement) {
            const form = formElement || document.querySelector('#registrationForm');
            if (!form) {
                console.error('❌ Registration form not found');
                return null;
            }

            const nameInput = form.querySelector('#userName') || form.querySelector('input[name="userName"]');
            const restaurantInput = form.querySelector('#restaurantName') || form.querySelector('input[name="restaurantName"]');
            const emailInput = form.querySelector('#userEmail') || form.querySelector('input[name="userEmail"]');
            const languageSelect = form.querySelector('#userLanguage') || form.querySelector('select[name="userLanguage"]');

            if (!nameInput || !restaurantInput) {
                console.error('❌ Required form fields not found');
                console.log('Available inputs:', form.querySelectorAll('input, select'));
                return null;
            }

            const formData = {
                name: nameInput.value.trim(),
                restaurantName: restaurantInput.value.trim(),
                email: emailInput ? emailInput.value.trim() : '',
                language: languageSelect ? languageSelect.value : 'english'
            };

            // Validate required fields
            if (!formData.name || !formData.restaurantName) {
                console.error('❌ Missing required field values:', formData);
                return null;
            }

            return formData;
        },

        submitForm: function(formData) {
            try {
                console.log('📝 Submitting registration form:', formData);

                // Validate form data
                if (!formData.name || !formData.restaurantName) {
                    console.error('❌ Missing required form data');
                    const errorMessage = this.currentLanguage === 'svenska' ? 
                        'Namn och restaurangnamn krävs.' : 
                        'Name and restaurant name are required.';
                    this.showError(errorMessage);
                    return false;
                }

                // Save user data
                const identityData = {
                    name: formData.name,
                    restaurantName: formData.restaurantName,
                    email: formData.email || '',
                    language: formData.language || 'english'
                };

                // Multiple save mechanisms for redundancy
                localStorage.setItem('fooodis-user-name', identityData.name);
                localStorage.setItem('fooodis-restaurant-name', identityData.restaurantName);
                localStorage.setItem('fooodis-language', identityData.language);
                localStorage.setItem('fooodis-user-email', identityData.email);

                // Save complete user data
                localStorage.setItem('chatbot-current-user', JSON.stringify(identityData));
                localStorage.setItem('chatbot-user-data', JSON.stringify(identityData));

                // Update chatbot widget state
                if (window.FoodisChatbot) {
                    window.FoodisChatbot.userRegistered = true;
                    window.FoodisChatbot.userInfo = identityData;
                    window.FoodisChatbot.userName = identityData.name;
                    window.FoodisChatbot.restaurantName = identityData.restaurantName;
                    console.log('✅ Updated chatbot widget state');
                }

                // Update global identity
                window.currentUserIdentity = identityData;
                console.log('✅ ALL IDENTITY UPDATE MECHANISMS TRIGGERED:', identityData);

                // Close form and send success message
                this.closeForm();

                // Trigger registration completion event for force refresh
                window.dispatchEvent(new CustomEvent('registrationFormCompleted', {
                    detail: identityData,
                    bubbles: true
                }));

                if (window.FoodisChatbot?.addMessage) {
                    const message = formData.language === 'svenska' 
                        ? `Tack ${formData.name} från ${formData.restaurantName}! Hur kan jag hjälpa dig idag?`
                        : `Thank you ${formData.name} from ${formData.restaurantName}! How can I help you today?`;
                    window.FoodisChatbot.addMessage(message, 'assistant');
                }

                // Send to server API (non-blocking)
                this.sendToServerAPI(formData).catch(error => {
                    console.warn('Server API warning:', error);
                });

                console.log('✅ Form submitted successfully:', formData.name);
                return true;

            } catch (error) {
                console.error('❌ Error submitting form:', error);
                const errorMessage = this.currentLanguage === 'svenska' ? 
                    'Ett fel uppstod. Vänligen försök igen.' : 
                    'An error occurred. Please try again.';
                this.showError(errorMessage);
                return false;
            }
        },

        showError: function(message) {
            console.error('📋 Form Error:', message);

            // Try to find an error display element
            const errorElement = document.querySelector('#registrationFormError') || 
                                document.querySelector('.registration-form-error') ||
                                document.querySelector('.error-message');

            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            } else {
                // Fallback to alert
                alert(message);
            }
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 ChatbotRegistrationForm: DOM ready, initializing...');

        // Ensure ChatbotRegistrationData is initialized first
        if (window.ChatbotRegistrationData && typeof window.ChatbotRegistrationData.init === 'function') {
            window.ChatbotRegistrationData.init();
        }

        window.ChatbotRegistrationForm.init();
    });

    // Also initialize if called after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.ChatbotRegistrationData && typeof window.ChatbotRegistrationData.init === 'function') {
                window.ChatbotRegistrationData.init();
            }
            window.ChatbotRegistrationForm.init();
        });
    } else {
        // DOM is already ready
        if (window.ChatbotRegistrationData && typeof window.ChatbotRegistrationData.init === 'function') {
            window.ChatbotRegistrationData.init();
        }
        window.ChatbotRegistrationForm.init();
    }

    // Also provide manual trigger function
    window.showChatbotRegistrationForm = function() {
        if (window.ChatbotRegistrationForm) {
            window.ChatbotRegistrationForm.showRegistrationForm();
        }
    };

})();