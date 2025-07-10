/**
 * 🔐 CHATBOT REGISTRATION FORM SYSTEM
 * Safe registration form integration for the chatbot
 */

(function() {
    'use strict';

    window.ChatbotRegistrationForm = {
        initialized: false,
        formData: {},
        currentStep: 1,
        totalSteps: 3,

        init: function() {
            if (this.initialized) return;

            console.log('🔐 Initializing Chatbot Registration Form...');
            this.setupEventListeners();
            this.injectStyles();
            this.initialized = true;
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

            // Initialize language switching after DOM is ready
            setTimeout(() => {
                // Set initial language state
                this.switchLanguage('swedish');
                console.log('🔐 Registration form shown and language switching initialized');
            }, 100);
        },

        // Create form HTML structure
        createFormOverlay: function() {
            const overlay = document.createElement('div');
            overlay.className = 'registration-overlay';

            overlay.innerHTML = `
                <div class="registration-container">
                    <div class="language-tabs">
                        <button type="button" class="lang-tab" data-lang="english">English</button>
                        <button type="button" class="lang-tab active" data-lang="swedish">Svenska</button>
                    </div>

                    <div class="registration-header">
                        <h2 class="form-title" data-en="Let's Get Started!" data-sv="Låt oss komma igång!">Låt oss komma igång!</h2>
                        <p class="form-subtitle" data-en="Please provide your information to continue" data-sv="Vänligen ange din information för att fortsätta">Vänligen ange din information för att fortsätta</p>
                    </div>

                    <form class="registration-form" id="registrationForm">
                        <div class="form-group">
                            <label for="userName" class="field-label" data-en="Your Name" data-sv="Ditt namn">Ditt namn</label>
                            <input type="text" id="userName" name="userName" placeholder="Ange ditt namn" required>
                        </div>

                        <div class="form-group">
                            <label for="userPhone" class="field-label" data-en="Your Phone" data-sv="Din telefon">Din telefon</label>
                            <input type="tel" id="userPhone" name="userPhone" placeholder="+46 70 123 45 67" required>
                        </div>

                        <div class="form-group">
                            <label for="systemUsage" class="field-label" data-en="Are you currently using a delivery system for your restaurant?" data-sv="Använder du för närvarande ett leveranssystem för din restaurang?">Använder du för närvarande ett leveranssystem för din restaurang?</label>
                            <select id="systemUsage" name="systemUsage" required>
                                <option value="" data-en="Please select an option" data-sv="Vänligen välj ett alternativ">Vänligen välj ett alternativ</option>
                                <option value="current_user" data-en="Yes, I'm currently using Fooodis" data-sv="Ja, jag använder för närvarande Fooodis">Ja, jag använder för närvarande Fooodis</option>
                                <option value="competitor_user" data-en="Yes, I'm using another system" data-sv="Ja, jag använder ett annat leveranssystem">Ja, jag använder ett annat leveranssystem</option>
                                <option value="potential_user" data-en="No, I'm looking for a solution" data-sv="Nej, jag söker efter en lösning">Nej, jag söker efter en lösning</option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="skip-btn" data-en="Skip for now" data-sv="Hoppa över för tillfället">Hoppa över för tillfället</button>
                            <button type="submit" class="submit-btn" data-en="Submit" data-sv="Skicka">Skicka</button>
                        </div>
                    </form>
                </div>
            `;

            return overlay;
        },

        // Show specific step
        showStep: function(stepNumber) {
            //No steps anymore
        },

        setupEventListeners: function() {
             this.setupLanguageSwitching();
             this.setupFormSubmission();

            // Use event delegation for dynamically created elements
            document.addEventListener('click', (e) => {
                if (e.target.id === 'next-step') {
                    this.nextStep();
                } else if (e.target.id === 'prev-step') {
                    this.prevStep();
                } else if (e.target.id === 'submit-registration') {
                    this.submitRegistration();
                } else if (e.target.id === 'cancel-registration') {
                    this.cancelRegistration();
                }
            });
        },

        nextStep: function() {
           //No steps anymore
        },

        prevStep: function() {
            //No steps anymore
        },

        validateCurrentStep: function() {
            return true; //No steps anymore
        },

        saveCurrentStepData: function() {
             //No steps anymore
        },

        submitRegistration: function() {
            //No steps anymore
        },

        processRegistration: function() {
             //No steps anymore
        },

        sendToServer: function(userData) {
             //No steps anymore
        },

        showSuccess: function() {
             //No steps anymore
        },

        showError: function(message) {
             //No steps anymore
        },

        cancelRegistration: function() {
            if (confirm('Are you sure you want to cancel registration?')) {
                this.closeForm();
            }
        },

        // Set up language switching functionality
        setupLanguageSwitching: function() {
            // Use event delegation to handle dynamically created language tabs
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('lang-tab')) {
                    // Remove active class from all tabs within the same form
                    const formContainer = e.target.closest('.registration-container');
                    if (formContainer) {
                        const allTabs = formContainer.querySelectorAll('.lang-tab');
                        allTabs.forEach(tab => tab.classList.remove('active'));
                        
                        // Add active class to clicked tab
                        e.target.classList.add('active');

                        // Get selected language
                        const selectedLang = e.target.getAttribute('data-lang');
                        this.switchLanguage(selectedLang);
                    }
                }
            });
        },

        // Switch form language
        switchLanguage: function(language) {
            console.log('🌐 Switching language to:', language);
            
            // Find elements within the registration form only
            const registrationContainer = document.querySelector('.registration-container');
            if (!registrationContainer) {
                console.warn('Registration container not found');
                return;
            }

            const elements = registrationContainer.querySelectorAll('[data-en][data-sv]');

            elements.forEach(element => {
                if (language === 'english') {
                    const englishText = element.getAttribute('data-en');
                    if (englishText) {
                        element.textContent = englishText;
                    }
                } else if (language === 'swedish') {
                    const swedishText = element.getAttribute('data-sv');
                    if (swedishText) {
                        element.textContent = swedishText;
                    }
                }
            });

            // Update select options within the form
            const selectOptions = registrationContainer.querySelectorAll('#systemUsage option[data-en][data-sv]');
            selectOptions.forEach(option => {
                if (language === 'english') {
                    const englishText = option.getAttribute('data-en');
                    if (englishText) {
                        option.textContent = englishText;
                    }
                } else if (language === 'swedish') {
                    const swedishText = option.getAttribute('data-sv');
                    if (swedishText) {
                        option.textContent = swedishText;
                    }
                }
            });

            // Update placeholders
            const nameInput = registrationContainer.querySelector('#userName');
            const phoneInput = registrationContainer.querySelector('#userPhone');

            if (language === 'english') {
                if (nameInput) {
                    nameInput.placeholder = 'Enter your name';
                    nameInput.previousElementSibling.textContent = 'Your Name';
                }
                if (phoneInput) {
                    phoneInput.placeholder = '+46 70 123 45 67';
                    phoneInput.previousElementSibling.textContent = 'Your Phone';
                }
            } else if (language === 'swedish') {
                if (nameInput) {
                    nameInput.placeholder = 'Ange ditt namn';
                    nameInput.previousElementSibling.textContent = 'Ditt namn';
                }
                if (phoneInput) {
                    phoneInput.placeholder = '+46 70 123 45 67';
                    phoneInput.previousElementSibling.textContent = 'Din telefon';
                }
            }

            console.log('✅ Language switched successfully to:', language);
        },

        // Set up form submission
        setupFormSubmission: function() {
            // Use event delegation to handle dynamically created forms
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'registrationForm') {
                    e.preventDefault();
                    this.submitForm();
                }
            });

            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('skip-btn')) {
                    this.skipForm();
                }
            });
        },

        // Submit form data
        submitForm: function() {
            const formData = {
                name: document.getElementById('userName')?.value || '',
                phone: document.getElementById('userPhone')?.value || '',
                systemUsage: document.getElementById('systemUsage')?.value || '',
                timestamp: new Date().toISOString()
            };

            // Save registration data
            this.saveRegistrationData(formData);

            // Mark user as registered
            localStorage.setItem('chatbot-current-user', JSON.stringify(formData));

            // Close form and continue chat
            this.closeForm();

            // Send success message to chat
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                window.FoodisChatbot.addMessage('Thank you for providing your information! How can I help you today?', 'assistant');
            }
        },

        // Skip form
        skipForm: function() {
            // Mark user as registered (skipped) to avoid showing form again
            localStorage.setItem('chatbot-current-user', JSON.stringify({ skipped: true, timestamp: new Date().toISOString() }));

            this.closeForm();

            // Send skip message to chat
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                window.FoodisChatbot.addMessage('No problem! Feel free to ask me anything about Fooodis.', 'assistant');
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
                }

                .form-subtitle {
                    font-size: 16px;
                    color: #6c757d;
                    margin: 0;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .field-label {
                    display: block;
                    font-size: 16px;
                    color: #2c2c2c;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .registration-form input,
                .registration-form select {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 16px;
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
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 30px;
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
                }`;

            document.head.appendChild(styles);
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            window.ChatbotRegistrationForm.init();
        }, 100);
    });

})();