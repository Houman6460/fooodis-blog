
/**
 * Fooodis Chatbot User Registration Form System
 * Implements the bilingual registration form as specified in documentation
 */

(function() {
    'use strict';

    // Registration form state management
    const RegistrationForm = {
        isFormOpen: false,
        currentLanguage: 'en',
        formData: {},
        
        // Language configurations
        languages: {
            en: {
                welcomeTitle: 'Welcome to Fooodis',
                welcomeSubtitle: 'Please provide your information to get started',
                fullName: 'Full Name',
                fullNamePlaceholder: 'Enter your full name',
                email: 'Email Address',
                emailPlaceholder: 'Enter your email address',
                phone: 'Phone Number (Optional)',
                phonePlaceholder: 'Enter your phone number',
                company: 'Company Name (Optional)',
                companyPlaceholder: 'Enter your company name',
                systemUsage: 'How can we help you?',
                systemUsagePlaceholder: 'Choose from the options',
                submitButton: 'Start Conversation',
                skipButton: 'Skip Registration',
                validation: {
                    nameRequired: 'Full name is required (minimum 2 characters)',
                    emailRequired: 'Valid email address is required',
                    emailInvalid: 'Please enter a valid email address'
                },
                usageOptions: {
                    'new-user': 'New User - First-time visitor',
                    'existing-customer': 'Existing Customer - Current customer support',
                    'business-inquiry': 'Business Inquiry - Company interested in solutions',
                    'technical-support': 'Technical Support - Need technical assistance'
                }
            },
            sv: {
                welcomeTitle: 'Välkommen till Fooodis',
                welcomeSubtitle: 'Vänligen ange dina uppgifter för att komma igång',
                fullName: 'Fullständigt namn',
                fullNamePlaceholder: 'Ange ditt fullständiga namn',
                email: 'E-postadress',
                emailPlaceholder: 'Ange din e-postadress',
                phone: 'Telefonnummer (Valfritt)',
                phonePlaceholder: 'Ange ditt telefonnummer',
                company: 'Företagsnamn (Valfritt)',
                companyPlaceholder: 'Ange ditt företagsnamn',
                systemUsage: 'Hur kan vi hjälpa dig?',
                systemUsagePlaceholder: 'Välj från alternativen',
                submitButton: 'Starta konversation',
                skipButton: 'Hoppa över registrering',
                validation: {
                    nameRequired: 'Fullständigt namn krävs (minst 2 tecken)',
                    emailRequired: 'Giltig e-postadress krävs',
                    emailInvalid: 'Vänligen ange en giltig e-postadress'
                },
                usageOptions: {
                    'new-user': 'Ny användare - Första gången besökare',
                    'existing-customer': 'Befintlig kund - Nuvarande kundsupport',
                    'business-inquiry': 'Företagsförfrågan - Företag intresserat av lösningar',
                    'technical-support': 'Teknisk support - Behöver teknisk hjälp'
                }
            }
        },

        // Initialize the registration system
        init() {
            this.createRegistrationModal();
            this.attachEventListeners();
            this.detectLanguageFromChatbot();
            console.log('📝 Chatbot Registration Form initialized');
        },

        // Detect language from existing chatbot
        detectLanguageFromChatbot() {
            if (window.FoodisChatbot && window.FoodisChatbot.config) {
                this.currentLanguage = window.FoodisChatbot.config.language || 'en';
            }
        },

        // Create the registration modal HTML
        createRegistrationModal() {
            const modalHTML = `
                <div id="fooodis-registration-modal" class="fooodis-registration-modal" style="display: none;">
                    <div class="fooodis-registration-overlay"></div>
                    <div class="fooodis-registration-container">
                        <div class="fooodis-registration-header">
                            <div class="fooodis-registration-logo">
                                <img src="images/Artboard17copy9.svg" alt="Fooodis" style="height: 40px;">
                            </div>
                            <div class="fooodis-registration-language-tabs">
                                <button class="fooodis-lang-tab active" data-lang="en">English</button>
                                <button class="fooodis-lang-tab" data-lang="sv">Svenska</button>
                            </div>
                        </div>
                        
                        <div class="fooodis-registration-content">
                            <h2 id="fooodis-reg-title">Welcome to Fooodis</h2>
                            <p id="fooodis-reg-subtitle">Please provide your information to get started</p>
                            
                            <form id="fooodis-registration-form">
                                <div class="fooodis-form-group">
                                    <label for="fooodis-fullname" id="fooodis-label-fullname">Full Name</label>
                                    <input type="text" id="fooodis-fullname" name="fullName" required>
                                    <span class="fooodis-error" id="fooodis-error-fullname"></span>
                                </div>
                                
                                <div class="fooodis-form-group">
                                    <label for="fooodis-email" id="fooodis-label-email">Email Address</label>
                                    <input type="email" id="fooodis-email" name="email" required>
                                    <span class="fooodis-error" id="fooodis-error-email"></span>
                                </div>
                                
                                <div class="fooodis-form-group">
                                    <label for="fooodis-phone" id="fooodis-label-phone">Phone Number (Optional)</label>
                                    <input type="tel" id="fooodis-phone" name="phone">
                                </div>
                                
                                <div class="fooodis-form-group">
                                    <label for="fooodis-company" id="fooodis-label-company">Company Name (Optional)</label>
                                    <input type="text" id="fooodis-company" name="company">
                                </div>
                                
                                <div class="fooodis-form-group">
                                    <label for="fooodis-usage" id="fooodis-label-usage">How can we help you?</label>
                                    <select id="fooodis-usage" name="systemUsage" required>
                                        <option value="">Choose from the options</option>
                                        <option value="new-user">New User - First-time visitor</option>
                                        <option value="existing-customer">Existing Customer - Current customer support</option>
                                        <option value="business-inquiry">Business Inquiry - Company interested in solutions</option>
                                        <option value="technical-support">Technical Support - Need technical assistance</option>
                                    </select>
                                </div>
                                
                                <div class="fooodis-form-actions">
                                    <button type="submit" id="fooodis-submit-btn" class="fooodis-btn-primary">Start Conversation</button>
                                    <button type="button" id="fooodis-skip-btn" class="fooodis-btn-secondary">Skip Registration</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            // Insert modal into the page
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.addRegistrationStyles();
        },

        // Add CSS styles for the registration form
        addRegistrationStyles() {
            const styles = `
                <style id="fooodis-registration-styles">
                .fooodis-registration-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .fooodis-registration-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                }

                .fooodis-registration-container {
                    position: relative;
                    max-width: 500px;
                    margin: 50px auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    animation: fooodisSlideIn 0.4s ease-out;
                }

                @keyframes fooodisSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .fooodis-registration-header {
                    background: linear-gradient(135deg, #e8f24c, #d4e63a);
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .fooodis-registration-language-tabs {
                    display: flex;
                    gap: 5px;
                }

                .fooodis-lang-tab {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.3);
                    color: #333;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    font-weight: 500;
                }

                .fooodis-lang-tab.active {
                    background: white;
                    color: #333;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .fooodis-registration-content {
                    padding: 30px;
                }

                .fooodis-registration-content h2 {
                    margin: 0 0 8px 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                }

                .fooodis-registration-content p {
                    margin: 0 0 24px 0;
                    color: #666;
                    font-size: 16px;
                }

                .fooodis-form-group {
                    margin-bottom: 20px;
                }

                .fooodis-form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #333;
                    font-size: 14px;
                }

                .fooodis-form-group input,
                .fooodis-form-group select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e1e5e9;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.2s ease;
                    box-sizing: border-box;
                }

                .fooodis-form-group input:focus,
                .fooodis-form-group select:focus {
                    outline: none;
                    border-color: #e8f24c;
                    box-shadow: 0 0 0 3px rgba(232, 242, 76, 0.1);
                }

                .fooodis-error {
                    display: block;
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 4px;
                    min-height: 16px;
                }

                .fooodis-form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 32px;
                }

                .fooodis-btn-primary,
                .fooodis-btn-secondary {
                    flex: 1;
                    padding: 14px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .fooodis-btn-primary {
                    background: #e8f24c;
                    color: #333;
                }

                .fooodis-btn-primary:hover {
                    background: #d4e63a;
                    transform: translateY(-1px);
                }

                .fooodis-btn-secondary {
                    background: #f8f9fa;
                    color: #666;
                    border: 2px solid #e1e5e9;
                }

                .fooodis-btn-secondary:hover {
                    background: #e9ecef;
                    border-color: #d0d7de;
                }

                @media (max-width: 600px) {
                    .fooodis-registration-container {
                        margin: 20px;
                        max-width: none;
                    }
                    
                    .fooodis-registration-content {
                        padding: 20px;
                    }
                    
                    .fooodis-form-actions {
                        flex-direction: column;
                    }
                }
                </style>
            `;

            document.head.insertAdjacentHTML('beforeend', styles);
        },

        // Attach event listeners
        attachEventListeners() {
            // Language tab switching
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('fooodis-lang-tab')) {
                    this.switchLanguage(e.target.dataset.lang);
                }
            });

            // Form submission
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'fooodis-registration-form') {
                    e.preventDefault();
                    this.handleFormSubmission();
                }
            });

            // Skip registration
            document.addEventListener('click', (e) => {
                if (e.target.id === 'fooodis-skip-btn') {
                    this.skipRegistration();
                }
            });

            // Close on overlay click
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('fooodis-registration-overlay')) {
                    this.skipRegistration();
                }
            });
        },

        // Switch language
        switchLanguage(lang) {
            this.currentLanguage = lang;
            
            // Update active tab
            document.querySelectorAll('.fooodis-lang-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.lang === lang);
            });

            // Update text content
            this.updateLanguageContent();
        },

        // Update content based on selected language
        updateLanguageContent() {
            const lang = this.languages[this.currentLanguage];
            
            // Update static text
            document.getElementById('fooodis-reg-title').textContent = lang.welcomeTitle;
            document.getElementById('fooodis-reg-subtitle').textContent = lang.welcomeSubtitle;
            
            // Update labels
            document.getElementById('fooodis-label-fullname').textContent = lang.fullName;
            document.getElementById('fooodis-label-email').textContent = lang.email;
            document.getElementById('fooodis-label-phone').textContent = lang.phone;
            document.getElementById('fooodis-label-company').textContent = lang.company;
            document.getElementById('fooodis-label-usage').textContent = lang.systemUsage;
            
            // Update placeholders
            document.getElementById('fooodis-fullname').placeholder = lang.fullNamePlaceholder;
            document.getElementById('fooodis-email').placeholder = lang.emailPlaceholder;
            document.getElementById('fooodis-phone').placeholder = lang.phonePlaceholder;
            document.getElementById('fooodis-company').placeholder = lang.companyPlaceholder;
            
            // Update select options
            const select = document.getElementById('fooodis-usage');
            select.innerHTML = `<option value="">${lang.systemUsagePlaceholder}</option>`;
            Object.entries(lang.usageOptions).forEach(([value, text]) => {
                select.innerHTML += `<option value="${value}">${text}</option>`;
            });
            
            // Update buttons
            document.getElementById('fooodis-submit-btn').textContent = lang.submitButton;
            document.getElementById('fooodis-skip-btn').textContent = lang.skipButton;
        },

        // Show registration form
        showRegistrationForm() {
            if (this.isFormOpen) return;
            
            this.isFormOpen = true;
            this.updateLanguageContent();
            
            const modal = document.getElementById('fooodis-registration-modal');
            if (modal) {
                modal.style.display = 'block';
                
                // Focus first input after animation
                setTimeout(() => {
                    document.getElementById('fooodis-fullname').focus();
                }, 400);
            }
        },

        // Hide registration form
        hideRegistrationForm() {
            this.isFormOpen = false;
            const modal = document.getElementById('fooodis-registration-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        },

        // Validate form
        validateForm() {
            const lang = this.languages[this.currentLanguage].validation;
            let isValid = true;
            
            // Clear previous errors
            document.querySelectorAll('.fooodis-error').forEach(error => {
                error.textContent = '';
            });
            
            // Validate name
            const name = document.getElementById('fooodis-fullname').value.trim();
            if (!name || name.length < 2) {
                document.getElementById('fooodis-error-fullname').textContent = lang.nameRequired;
                isValid = false;
            }
            
            // Validate email
            const email = document.getElementById('fooodis-email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) {
                document.getElementById('fooodis-error-email').textContent = lang.emailRequired;
                isValid = false;
            } else if (!emailRegex.test(email)) {
                document.getElementById('fooodis-error-email').textContent = lang.emailInvalid;
                isValid = false;
            }
            
            return isValid;
        },

        // Handle form submission
        handleFormSubmission() {
            if (!this.validateForm()) return;
            
            // Collect form data
            const formData = {
                fullName: document.getElementById('fooodis-fullname').value.trim(),
                email: document.getElementById('fooodis-email').value.trim(),
                phone: document.getElementById('fooodis-phone').value.trim(),
                company: document.getElementById('fooodis-company').value.trim(),
                systemUsage: document.getElementById('fooodis-usage').value,
                language: this.currentLanguage,
                timestamp: new Date().toISOString(),
                leadScore: this.calculateLeadScore(document.getElementById('fooodis-usage').value)
            };

            // Store registration data
            this.saveRegistrationData(formData);
            
            // Update chatbot with user information
            this.updateChatbotWithUserInfo(formData);
            
            // Hide form and start conversation
            this.hideRegistrationForm();
            
            // Send personalized welcome message
            this.sendWelcomeMessage(formData);
        },

        // Calculate lead score based on system usage
        calculateLeadScore(usage) {
            const scores = {
                'business-inquiry': 100,     // Highest priority
                'existing-customer': 90,     // High priority  
                'technical-support': 70,     // Medium priority
                'new-user': 60              // Standard priority
            };
            
            return scores[usage] || 50;
        },

        // Save registration data to storage
        saveRegistrationData(formData) {
            try {
                // Save to localStorage
                let registrations = JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]');
                registrations.push(formData);
                localStorage.setItem('fooodis-chatbot-registrations', JSON.stringify(registrations));
                
                // Save to session for immediate access
                sessionStorage.setItem('fooodis-current-user', JSON.stringify(formData));
                
                console.log('✅ Registration data saved:', formData);
            } catch (error) {
                console.error('❌ Failed to save registration data:', error);
            }
        },

        // Update chatbot with user information
        updateChatbotWithUserInfo(formData) {
            if (window.FoodisChatbot) {
                // Set user context
                window.FoodisChatbot.userContext = formData;
                
                // Update language if needed
                if (window.FoodisChatbot.config) {
                    window.FoodisChatbot.config.language = formData.language;
                }
            }
        },

        // Send personalized welcome message
        sendWelcomeMessage(formData) {
            if (!window.FoodisChatbot || !window.FoodisChatbot.addMessage) return;
            
            const welcomeMessages = {
                en: `Hi ${formData.fullName}! I'm Marcus Chen and I'll be helping you today. What can I help you with?`,
                sv: `Hej ${formData.fullName}! Jag är Marcus Chen och jag kommer att hjälpa dig idag. Vad kan jag hjälpa dig med?`
            };
            
            const message = welcomeMessages[formData.language] || welcomeMessages.en;
            
            setTimeout(() => {
                window.FoodisChatbot.addMessage(message, 'assistant');
            }, 500);
        },

        // Skip registration
        skipRegistration() {
            this.hideRegistrationForm();
            
            // Send basic welcome message
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                const messages = {
                    en: "Hello! I'm your Fooodis assistant. How can I help you today?",
                    sv: "Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?"
                };
                
                const message = messages[this.currentLanguage] || messages.en;
                
                setTimeout(() => {
                    window.FoodisChatbot.addMessage(message, 'assistant');
                }, 500);
            }
        },

        // Check if user should see registration form
        shouldShowRegistration() {
            // Check if user has already registered in this session
            const currentUser = sessionStorage.getItem('fooodis-current-user');
            if (currentUser) return false;
            
            // Check if user has previous conversations
            const conversations = JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]');
            if (conversations.length > 0) return false;
            
            // New user should see registration
            return true;
        },

        // Auto-show registration form when appropriate
        autoShowRegistration() {
            if (this.shouldShowRegistration()) {
                // Show form after welcome message with delay
                setTimeout(() => {
                    this.showRegistrationForm();
                }, 2500);
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            RegistrationForm.init();
        });
    } else {
        RegistrationForm.init();
    }

    // Integration with existing chatbot
    function integrateChatbotRegistration() {
        if (window.FoodisChatbot && typeof window.FoodisChatbot.init === 'function') {
            const originalInit = window.FoodisChatbot.init;
            
            window.FoodisChatbot.init = function(config) {
                const result = originalInit.call(this, config);
                
                // Auto-show registration after chatbot initialization
                setTimeout(() => {
                    RegistrationForm.autoShowRegistration();
                }, 1000);
                
                return result;
            };
        }
    }

    // Expose registration form globally
    window.FoodisRegistrationForm = RegistrationForm;

    // Try to integrate immediately or wait for chatbot
    if (window.FoodisChatbot) {
        integrateChatbotRegistration();
    } else {
        // Wait for chatbot to load
        const checkForChatbot = setInterval(() => {
            if (window.FoodisChatbot) {
                clearInterval(checkForChatbot);
                integrateChatbotRegistration();
            }
        }, 500);
        
        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkForChatbot), 10000);
    }

})();
