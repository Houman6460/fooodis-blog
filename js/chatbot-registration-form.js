
/**
 * 🔐 CHATBOT REGISTRATION FORM SYSTEM
 * Single-page bilingual registration form for the chatbot
 */

(function() {
    'use strict';

    window.ChatbotRegistrationForm = {
        initialized: false,
        formData: {},
        currentLanguage: 'en', // Start with English
        
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
            
            // Set initial language from browser or saved preference
            this.detectInitialLanguage();
            this.updateLanguageDisplay();
        },

        detectInitialLanguage: function() {
            // Check saved language preference
            const savedLang = localStorage.getItem('fooodis-language');
            if (savedLang === 'sv' || savedLang === 'swedish') {
                this.currentLanguage = 'sv';
            } else if (savedLang === 'en' || savedLang === 'english') {
                this.currentLanguage = 'en';
            } else {
                // Detect from browser language
                const browserLang = navigator.language || navigator.userLanguage;
                this.currentLanguage = browserLang.startsWith('sv') ? 'sv' : 'en';
            }
        },

        createFormOverlay: function() {
            const overlay = document.createElement('div');
            overlay.id = 'registration-form-overlay';
            overlay.className = 'registration-overlay';
            
            overlay.innerHTML = `
                <div class="registration-container">
                    <!-- Language Tabs -->
                    <div class="language-tabs">
                        <button type="button" class="language-tab" data-lang="en">
                            English
                        </button>
                        <button type="button" class="language-tab" data-lang="sv">
                            Svenska
                        </button>
                    </div>
                    
                    <!-- Form Content -->
                    <div class="form-content">
                        <!-- English Content -->
                        <div class="language-content" data-lang="en">
                            <h2>Let's Get Started!</h2>
                            <p>Please provide your information to continue</p>
                            
                            <div class="form-group">
                                <label>Your Name</label>
                                <input type="text" id="name-en" placeholder="Your full name" required>
                            </div>
                            
                            <div class="form-group">
                                <input type="email" id="email-en" placeholder="info@logloland.se" required>
                            </div>
                            
                            <div class="form-group">
                                <input type="tel" id="phone-en" placeholder="0978980709" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Are you currently using a delivery system for your restaurant?</label>
                                <div class="select-wrapper">
                                    <select id="delivery-system-en" required>
                                        <option value="">Please select an option</option>
                                        <option value="fooodis">Yes, I'm currently using Fooodis</option>
                                        <option value="other">Yes, I'm using another system</option>
                                        <option value="none">No, I'm looking for a solution</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Swedish Content -->
                        <div class="language-content" data-lang="sv" style="display: none;">
                            <h2>Låt oss komma igång!</h2>
                            <p>Vänligen ange din information för att fortsätta</p>
                            
                            <div class="form-group">
                                <label>Ditt Namn</label>
                                <input type="text" id="name-sv" placeholder="Ditt fullständiga namn" required>
                            </div>
                            
                            <div class="form-group">
                                <input type="email" id="email-sv" placeholder="info@logloland.se" required>
                            </div>
                            
                            <div class="form-group">
                                <input type="tel" id="phone-sv" placeholder="7-987870" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Använder du för närvarande ett leveranssystem för din restaurang?</label>
                                <div class="select-wrapper">
                                    <select id="delivery-system-sv" required>
                                        <option value="">Vänligen välj ett alternativ</option>
                                        <option value="fooodis">Ja, jag använder för närvarande Fooodis</option>
                                        <option value="other">Ja, jag använder ett annat leveranssystem</option>
                                        <option value="none">Nej, jag söker efter en lösning</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="form-actions">
                            <button type="button" class="btn-submit" id="submit-registration">
                                <span data-lang="en">Get Started</span>
                                <span data-lang="sv">Kom igång</span>
                            </button>
                            <button type="button" class="btn-cancel" id="cancel-registration">
                                <span data-lang="en">Cancel</span>
                                <span data-lang="sv">Avbryt</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            return overlay;
        },

        setupEventListeners: function() {
            // Use event delegation for dynamically created elements
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('language-tab')) {
                    this.switchLanguage(e.target.dataset.lang);
                } else if (e.target.id === 'submit-registration') {
                    this.submitRegistration();
                } else if (e.target.id === 'cancel-registration') {
                    this.cancelRegistration();
                }
            });
        },

        switchLanguage: function(lang) {
            this.currentLanguage = lang;
            this.updateLanguageDisplay();
            
            // Save language preference
            localStorage.setItem('fooodis-language', lang);
            
            // Sync form data between languages
            this.syncFormData();
        },

        updateLanguageDisplay: function() {
            const overlay = document.getElementById('registration-form-overlay');
            if (!overlay) return;

            // Update active tab
            overlay.querySelectorAll('.language-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.lang === this.currentLanguage);
            });

            // Show/hide language content
            overlay.querySelectorAll('.language-content').forEach(content => {
                content.style.display = content.dataset.lang === this.currentLanguage ? 'block' : 'none';
            });

            // Update button text
            overlay.querySelectorAll('[data-lang]').forEach(element => {
                if (element.dataset.lang !== this.currentLanguage) {
                    element.style.display = 'none';
                } else {
                    element.style.display = 'inline';
                }
            });
        },

        syncFormData: function() {
            // Sync data between English and Swedish forms
            const languages = ['en', 'sv'];
            const fields = ['name', 'email', 'phone', 'delivery-system'];

            fields.forEach(field => {
                const enField = document.getElementById(`${field}-en`);
                const svField = document.getElementById(`${field}-sv`);

                if (enField && svField) {
                    if (this.currentLanguage === 'en' && enField.value) {
                        svField.value = enField.value;
                    } else if (this.currentLanguage === 'sv' && svField.value) {
                        enField.value = svField.value;
                    }
                }
            });
        },

        validateForm: function() {
            const currentFields = document.querySelectorAll(`[id$="-${this.currentLanguage}"]`);
            let isValid = true;

            currentFields.forEach(field => {
                if (field.hasAttribute('required') && !field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                const errorMessage = this.currentLanguage === 'sv' 
                    ? 'Vänligen fyll i alla obligatoriska fält'
                    : 'Please fill in all required fields';
                this.showError(errorMessage);
            }

            return isValid;
        },

        submitRegistration: function() {
            if (!this.validateForm()) {
                return;
            }

            // Collect form data
            const lang = this.currentLanguage;
            const formData = {
                name: document.getElementById(`name-${lang}`).value,
                email: document.getElementById(`email-${lang}`).value,
                phone: document.getElementById(`phone-${lang}`).value,
                deliverySystem: document.getElementById(`delivery-system-${lang}`).value,
                language: lang,
                registrationDate: new Date().toISOString()
            };

            // Show loading state
            const submitBtn = document.getElementById('submit-registration');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = this.currentLanguage === 'sv' 
                    ? 'Registrerar...' 
                    : 'Registering...';
            }

            // Process registration
            this.processRegistration(formData);
        },

        processRegistration: function(formData) {
            // Create user object
            const userData = {
                id: 'user_' + Date.now(),
                ...formData,
                status: 'active'
            };

            // Save to localStorage
            try {
                const existingUsers = JSON.parse(localStorage.getItem('chatbot-users') || '[]');
                existingUsers.push(userData);
                localStorage.setItem('chatbot-users', JSON.stringify(existingUsers));
                
                // Also save current user
                localStorage.setItem('chatbot-current-user', JSON.stringify(userData));
                
                // Send to server if available
                this.sendToServer(userData);
                
                // Show success and close form
                this.showSuccess();
                
            } catch (error) {
                console.error('Registration error:', error);
                const errorMessage = this.currentLanguage === 'sv'
                    ? 'Registrering misslyckades. Vänligen försök igen.'
                    : 'Registration failed. Please try again.';
                this.showError(errorMessage);
            }
        },

        sendToServer: function(userData) {
            // Try to send to server (optional)
            fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'user_registration',
                    data: userData
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Registration sent to server:', data);
            })
            .catch(error => {
                console.warn('Server registration failed (this is okay):', error);
            });
        },

        showSuccess: function() {
            const overlay = document.getElementById('registration-form-overlay');
            if (overlay) {
                const successMessage = this.currentLanguage === 'sv'
                    ? {
                        title: 'Välkommen till Fooodis!',
                        message: 'Din registrering är klar. Du kan nu njuta av alla våra funktioner.',
                        button: 'Börja chatta'
                    }
                    : {
                        title: 'Welcome to Fooodis!',
                        message: 'Your registration is complete. You can now enjoy all our features.',
                        button: 'Start Chatting'
                    };

                overlay.innerHTML = `
                    <div class="registration-container success">
                        <div class="success-content">
                            <div class="success-icon">✅</div>
                            <h3>${successMessage.title}</h3>
                            <p>${successMessage.message}</p>
                            <button type="button" class="btn-submit" onclick="window.ChatbotRegistrationForm.closeForm()">
                                ${successMessage.button}
                            </button>
                        </div>
                    </div>
                `;
                
                // Auto-close after 3 seconds
                setTimeout(() => {
                    this.closeForm();
                }, 3000);
            }
        },

        showError: function(message) {
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            const formContent = document.querySelector('.form-content');
            if (formContent) {
                formContent.insertBefore(errorDiv, formContent.firstChild);
            }
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        },

        cancelRegistration: function() {
            const confirmMessage = this.currentLanguage === 'sv'
                ? 'Är du säker på att du vill avbryta registreringen?'
                : 'Are you sure you want to cancel registration?';
                
            if (confirm(confirmMessage)) {
                this.closeForm();
            }
        },

        closeForm: function() {
            const overlay = document.getElementById('registration-form-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            // Reset form data
            this.formData = {};
            
            // Send welcome message
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                setTimeout(() => {
                    const welcomeMessage = this.currentLanguage === 'sv'
                        ? 'Välkommen till Fooodis! Hur kan jag hjälpa dig idag?'
                        : 'Welcome to Fooodis! How can I help you today?';
                    window.FoodisChatbot.addMessage(welcomeMessage, 'assistant');
                }, 500);
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
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                    border-radius: 12px;
                }
                
                .registration-container {
                    background: #f5f5f5;
                    border-radius: 20px;
                    padding: 0;
                    max-width: 320px;
                    width: 95%;
                    max-height: 480px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                
                .language-tabs {
                    display: flex;
                    background: #e8e8e8;
                    border-radius: 20px 20px 0 0;
                    overflow: hidden;
                }
                
                .language-tab {
                    flex: 1;
                    padding: 15px 20px;
                    border: none;
                    background: transparent;
                    color: #666;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .language-tab.active {
                    color: #333;
                    background: #f5f5f5;
                }
                
                .language-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #e8f24c;
                }
                
                .form-content {
                    padding: 30px 25px;
                    background: #f5f5f5;
                }
                
                .language-content h2 {
                    color: #333;
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    font-weight: bold;
                    text-align: center;
                }
                
                .language-content p {
                    color: #666;
                    margin: 0 0 25px 0;
                    font-size: 14px;
                    text-align: center;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: #666;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px 15px;
                    border: none;
                    border-radius: 8px;
                    background: white;
                    font-size: 14px;
                    color: #333;
                    box-sizing: border-box;
                    outline: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .form-group input:focus,
                .form-group select:focus {
                    box-shadow: 0 2px 8px rgba(232, 242, 76, 0.3);
                }
                
                .form-group input.error,
                .form-group select.error {
                    border: 2px solid #ff4444;
                }
                
                .select-wrapper {
                    position: relative;
                }
                
                .select-wrapper::after {
                    content: '▼';
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                    pointer-events: none;
                    font-size: 12px;
                }
                
                .form-group select {
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    padding-right: 40px;
                    background: white;
                    cursor: pointer;
                }
                
                .form-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 25px;
                }
                
                .btn-submit,
                .btn-cancel {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                }
                
                .btn-submit {
                    background: #e8f24c;
                    color: #333;
                    order: 1;
                }
                
                .btn-submit:hover:not(:disabled) {
                    background: #d4e547;
                    transform: translateY(-1px);
                }
                
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .btn-cancel {
                    background: transparent;
                    color: #666;
                    order: 2;
                    font-size: 14px;
                    padding: 8px 16px;
                }
                
                .btn-cancel:hover {
                    color: #333;
                }
                
                .success-content {
                    text-align: center;
                    padding: 40px 25px;
                }
                
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .success-content h3 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 24px;
                }
                
                .success-content p {
                    color: #666;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                
                .error-message {
                    background: #ffebee;
                    color: #c62828;
                    padding: 10px 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    text-align: center;
                }
                
                /* Hide elements based on language */
                [data-lang]:not([data-lang=""]) {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .registration-container {
                        width: 98%;
                        max-height: 500px;
                    }
                    
                    .form-content {
                        padding: 25px 20px;
                    }
                }
            `;
            
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
