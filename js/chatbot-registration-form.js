/**
 * 🔐 CHATBOT REGISTRATION FORM SYSTEM
 * Complete bilingual registration form with proper language switching
 */
(function() {
    'use strict';

    window.ChatbotRegistrationForm = {
        initialized: false,
        formData: {},
        currentLanguage: 'english',
        formElement: null,

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

            // Auto-show form if needed
            setTimeout(() => {
                if (this.shouldShowRegistrationForm()) {
                    this.showRegistrationForm();
                }
            }, 2000);
        },

        shouldShowRegistrationForm: function() {
            const currentUser = localStorage.getItem('chatbot-current-user');
            if (!currentUser) return true;

            try {
                const userData = JSON.parse(currentUser);
                if (userData.skipped) {
                    const skipTime = new Date(userData.timestamp);
                    const now = new Date();
                    const hoursPassed = (now - skipTime) / (1000 * 60 * 60);
                    return hoursPassed > 24;
                }
                return false;
            } catch (error) {
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
                    this.submitForm();
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

        submitForm: async function() {
            const formData = {
                name: document.getElementById('userName')?.value || '',
                email: document.getElementById('userEmail')?.value || '',
                restaurantName: document.getElementById('restaurantName')?.value || '',
                phone: document.getElementById('userPhone')?.value || '',
                systemUsage: document.getElementById('systemUsage')?.value || '',
                timestamp: new Date().toISOString(),
                language: this.currentLanguage,
                conversationId: window.FoodisChatbot?.conversationId || null,
                sessionId: window.FoodisChatbot?.sessionId || localStorage.getItem('chatbot-session-id'),
                deviceId: localStorage.getItem('chatbot-device-id') || 'device_' + Date.now()
            };

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                const errorMessage = this.currentLanguage === 'svenska' ? 
                    'Vänligen ange en giltig e-postadress' : 
                    'Please enter a valid email address';
                alert(errorMessage);
                return;
            }

            try {
                // Save data locally first
                this.saveRegistrationData(formData);
                this.saveToUserLeads(formData);
                this.updateUserIdentity(formData);

                // Send to server API to ensure persistence
                await this.sendToServerAPI(formData);

                // Update user status
                localStorage.setItem('chatbot-current-user', JSON.stringify(formData));
                localStorage.setItem('fooodis-user-name', formData.name);
                localStorage.setItem('fooodis-user-email', formData.email);
                localStorage.setItem('fooodis-restaurant-name', formData.restaurantName);

                // Update chatbot if available
                if (window.FoodisChatbot) {
                    window.FoodisChatbot.userName = formData.name;
                    window.FoodisChatbot.userEmail = formData.email;
                    window.FoodisChatbot.restaurantName = formData.restaurantName;
                    window.FoodisChatbot.userRegistered = true;
                    window.FoodisChatbot.userLanguage = formData.language;

                    // Set Swedish language context
                    if (formData.language === 'svenska') {
                        window.FoodisChatbot.currentLanguage = 'sv';
                        window.FoodisChatbot.config = window.FoodisChatbot.config || {};
                        window.FoodisChatbot.config.language = 'sv-SE';
                        window.FoodisChatbot.config.preferredAgent = 'swedish-speaking';
                        localStorage.setItem('fooodis-language', 'swedish');
                        console.log('🇸🇪 Swedish language context set for user:', formData.name);
                    }
                }

                this.closeForm();

                // Send success message in appropriate language
                if (window.FoodisChatbot?.addMessage) {
                    const message = formData.language === 'svenska' 
                        ? `Tack ${formData.name} från ${formData.restaurantName}! Hur kan jag hjälpa dig idag?`
                        : `Thank you ${formData.name} from ${formData.restaurantName}! How can I help you today?`;
                    window.FoodisChatbot.addMessage(message, 'assistant');
                }

                console.log('✅ Form submitted successfully:', formData.name);

                // Trigger UI updates with comprehensive identity data
                setTimeout(() => {
                    const identityUpdateData = {
                        name: formData.name,
                        userName: formData.name, // Ensure both fields have the same value
                        email: formData.email,
                        userEmail: formData.email,
                        restaurantName: formData.restaurantName,
                        phone: formData.phone,
                        userPhone: formData.phone,
                        userType: formData.systemUsage,
                        systemUsage: formData.systemUsage,
                        conversationId: formData.conversationId,
                        sessionId: formData.sessionId || window.FoodisChatbot?.sessionId || localStorage.getItem('chatbot-session-id'),
                        deviceId: formData.deviceId || localStorage.getItem('chatbot-device-id'),
                        language: formData.language,
                        languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                        languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        displayFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        identityLinked: true,
                        userRegistered: true,
                        previousName: 'Anonymous User',
                        timestamp: formData.timestamp
                    };

                    console.log('🚀 Registration: Sending identity update with name data:', {
                        name: identityUpdateData.name,
                        userName: identityUpdateData.userName,
                        formDataName: formData.name
                    });

                    console.log('🔄 Triggering comprehensive identity update with data:', identityUpdateData);

                    // First update local conversations data
                    this.updateUserIdentity(formData);

                    // Trigger multiple update events for redundancy
                    window.dispatchEvent(new CustomEvent('userIdentityUpdated', {
                        detail: identityUpdateData
                    }));

                    window.dispatchEvent(new CustomEvent('conversationDataUpdated', {
                        detail: { action: 'identity_update', data: identityUpdateData }
                    }));

                    // Force multiple dashboard refreshes to ensure update
                    if (window.chatbotManager) {
                        console.log('🔄 Immediate conversation update');
                        window.chatbotManager.updateConversationIdentity(identityUpdateData);
                    }
                    
                    setTimeout(() => {
                        if (window.chatbotManager && window.chatbotManager.renderConversations) {
                            console.log('🔄 First dashboard refresh');
                            window.chatbotManager.renderConversations();
                        }
                    }, 50);
                    
                    setTimeout(() => {
                        if (window.chatbotManager && window.chatbotManager.renderConversations) {
                            console.log('🔄 Second dashboard refresh (ensuring update)');
                            window.chatbotManager.renderConversations();
                        }
                    }, 500);
                }, 100);

            } catch (error) {
                console.error('❌ Error submitting form:', error);
                const errorMessage = this.currentLanguage === 'svenska' ? 
                    'Ett fel uppstod. Vänligen försök igen.' : 
                    'An error occurred. Please try again.';
                alert(errorMessage);
            }
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
                        userType: formData.systemUsage,
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

                // Update conversation identity on server
                if (formData.conversationId) {
                    const conversationResponse = await fetch(`/api/chatbot/conversations/${formData.conversationId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userName: formData.name,
                            userEmail: formData.email,
                            userPhone: formData.phone,
                            restaurantName: formData.restaurantName,
                            userType: formData.systemUsage,
                            language: formData.language,
                            languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                            languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                            userRegistered: true,
                            identityLinked: true,
                            lastUpdated: formData.timestamp
                        })
                    });

                    if (!conversationResponse.ok) {
                        console.warn('⚠️ Conversation update failed:', conversationResponse.status);
                    } else {
                        const conversationResult = await conversationResponse.json();
                        console.log('✅ Conversation identity updated on server:', conversationResult);
                    }
                }

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
                    identityLinked: true
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

        updateUserIdentity: function(formData) {
            try {
                console.log('🔄 Updating user identity with data:', formData);
                
                // Update chatbot conversations - find by ID or anonymous session
                const conversations = JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
                const originalConversationsLength = conversations.length;
                let targetConversation = null;
                let foundConversations = [];

                // First, try to find by conversationId
                if (formData.conversationId) {
                    targetConversation = conversations.find(conv => 
                        conv.id === formData.conversationId || conv.conversationId === formData.conversationId
                    );
                    if (targetConversation) {
                        foundConversations.push('by conversationId');
                    }
                }

                // If not found, look for anonymous conversations from same session/device
                if (!targetConversation) {
                    const sessionId = window.FoodisChatbot?.sessionId || localStorage.getItem('chatbot-session-id');
                    const deviceId = localStorage.getItem('chatbot-device-id') || 'unknown';

                    // Search for recent anonymous conversations
                    const recentAnonymous = conversations.filter(conv => {
                        const isAnonymous = conv.userName === 'Anonymous User' || !conv.userName || conv.userName === '';
                        const matchesSession = conv.sessionId === sessionId || conv.deviceId === deviceId;
                        const isRecent = !conv.createdAt || 
                            (new Date() - new Date(conv.createdAt)) < (24 * 60 * 60 * 1000); // Within 24 hours
                        
                        return isAnonymous && matchesSession && isRecent;
                    });

                    // Use the most recent one
                    if (recentAnonymous.length > 0) {
                        targetConversation = recentAnonymous.sort((a, b) => 
                            new Date(b.createdAt || b.lastMessageAt || 0) - new Date(a.createdAt || a.lastMessageAt || 0)
                        )[0];
                        foundConversations.push('by session/device (recent anonymous)');
                    }
                }

                // Update the conversation with user identity
                if (targetConversation) {
                    const oldName = targetConversation.userName || 'Anonymous User';
                    
                    // Store the original conversation ID for reference
                    const originalId = targetConversation.id || targetConversation.conversationId;
                    
                    Object.assign(targetConversation, {
                        userName: formData.name,
                        userEmail: formData.email,
                        restaurantName: formData.restaurantName,
                        userPhone: formData.phone,
                        userType: formData.systemUsage,
                        systemUsage: formData.systemUsage,
                        userRegistered: true,
                        language: formData.language || 'english',
                        languageCode: formData.language === 'svenska' ? 'sv-SE' : 'en-US',
                        languageFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        displayFlag: formData.language === 'svenska' ? '🇸🇪' : '🇺🇸',
                        lastUpdated: formData.timestamp,
                        identityLinked: true,
                        previousName: oldName,
                        // Ensure conversation ID is preserved
                        conversationId: originalId,
                        id: originalId
                    });

                    // Set language context for Swedish conversations
                    if (formData.language === 'svenska') {
                        targetConversation.languageCode = 'sv-SE';
                        targetConversation.preferredAgent = 'swedish-speaking';
                        targetConversation.autoTranslate = true;
                    }

                    // Save updated conversations
                    localStorage.setItem('chatbot-conversations', JSON.stringify(conversations));
                    
                    // Also save to server-compatible format
                    localStorage.setItem('fooodis-chatbot-conversations', JSON.stringify(conversations));
                    
                    console.log(`✅ Updated conversation identity: ${oldName} → ${formData.name} (${formData.restaurantName})`);
                    console.log('🔍 Found conversation by:', foundConversations.join(', '));
                    console.log('📊 Updated conversation data:', {
                        id: targetConversation.id,
                        userName: targetConversation.userName,
                        languageFlag: targetConversation.languageFlag,
                        identityLinked: targetConversation.identityLinked
                    });
                } else {
                    console.warn('⚠️ No target conversation found for identity update');
                    console.log('🔍 Search details:', {
                        conversationId: formData.conversationId,
                        sessionId: window.FoodisChatbot?.sessionId || localStorage.getItem('chatbot-session-id'),
                        deviceId: localStorage.getItem('chatbot-device-id'),
                        totalConversations: conversations.length,
                        anonymousConversations: conversations.filter(c => 
                            c.userName === 'Anonymous User' || !c.userName || c.userName === ''
                        ).length
                    });
                }

                // Also update current chatbot instance if available
                if (window.FoodisChatbot) {
                    window.FoodisChatbot.userName = formData.name;
                    window.FoodisChatbot.userEmail = formData.email;
                    window.FoodisChatbot.restaurantName = formData.restaurantName;
                    window.FoodisChatbot.userRegistered = true;
                    window.FoodisChatbot.userLanguage = formData.language;
                    window.FoodisChatbot.languageFlag = formData.language === 'svenska' ? '🇸🇪' : '🇺🇸';
                    window.FoodisChatbot.displayFlag = formData.language === 'svenska' ? '🇸🇪' : '🇺🇸';

                    // Set language for Swedish users
                    if (formData.language === 'svenska') {
                        window.FoodisChatbot.currentLanguage = 'sv';
                        window.FoodisChatbot.config = window.FoodisChatbot.config || {};
                        window.FoodisChatbot.config.language = 'sv-SE';
                    }
                    
                    console.log('✅ Updated chatbot instance with user identity');
                }

            } catch (error) {
                console.error('❌ Error updating user identity:', error);
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
            `;
            document.head.appendChild(styles);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => window.ChatbotRegistrationForm.init(), 100);
        });
    } else {
        setTimeout(() => window.ChatbotRegistrationForm.init(), 100);
    }

    // Also provide manual trigger function
    window.showChatbotRegistrationForm = function() {
        if (window.ChatbotRegistrationForm) {
            window.ChatbotRegistrationForm.showRegistrationForm();
        }
    };

})();