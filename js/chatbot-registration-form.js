
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
            
            // Show first step
            this.showStep(1);
        },

        createFormOverlay: function() {
            const overlay = document.createElement('div');
            overlay.id = 'registration-form-overlay';
            overlay.className = 'registration-overlay';
            
            overlay.innerHTML = `
                <div class="registration-container">
                    <div class="registration-header">
                        <h3>Welcome to Fooodis!</h3>
                        <p>Let's get you set up in just a few steps</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 33%"></div>
                        </div>
                        <span class="step-indicator">Step 1 of 3</span>
                    </div>
                    
                    <div class="registration-content">
                        <!-- Step 1: Basic Information -->
                        <div class="form-step" id="step-1">
                            <h4>Basic Information</h4>
                            <div class="form-group">
                                <label for="reg-name">Full Name *</label>
                                <input type="text" id="reg-name" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-email">Email Address *</label>
                                <input type="email" id="reg-email" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-phone">Phone Number</label>
                                <input type="tel" id="reg-phone">
                            </div>
                        </div>

                        <!-- Step 2: Restaurant Information -->
                        <div class="form-step" id="step-2" style="display: none;">
                            <h4>Restaurant Information</h4>
                            <div class="form-group">
                                <label for="reg-restaurant-name">Restaurant Name *</label>
                                <input type="text" id="reg-restaurant-name" required>
                            </div>
                            <div class="form-group">
                                <label for="reg-restaurant-type">Restaurant Type</label>
                                <select id="reg-restaurant-type">
                                    <option value="">Select type...</option>
                                    <option value="fast-food">Fast Food</option>
                                    <option value="casual-dining">Casual Dining</option>
                                    <option value="fine-dining">Fine Dining</option>
                                    <option value="cafe">Cafe</option>
                                    <option value="bakery">Bakery</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="reg-location">Location</label>
                                <input type="text" id="reg-location" placeholder="City, Country">
                            </div>
                        </div>

                        <!-- Step 3: Preferences -->
                        <div class="form-step" id="step-3" style="display: none;">
                            <h4>Preferences</h4>
                            <div class="form-group">
                                <label for="reg-language">Preferred Language</label>
                                <select id="reg-language">
                                    <option value="en">English</option>
                                    <option value="sv">Swedish</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="reg-notifications">
                                    Send me updates and notifications
                                </label>
                            </div>
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="reg-terms" required>
                                    I agree to the Terms of Service and Privacy Policy *
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="registration-actions">
                        <button type="button" class="btn-secondary" id="prev-step" style="display: none;">Previous</button>
                        <button type="button" class="btn-primary" id="next-step">Next</button>
                        <button type="button" class="btn-primary" id="submit-registration" style="display: none;">Complete Registration</button>
                        <button type="button" class="btn-cancel" id="cancel-registration">Cancel</button>
                    </div>
                </div>
            `;
            
            return overlay;
        },

        showStep: function(stepNumber) {
            // Hide all steps
            document.querySelectorAll('.form-step').forEach(step => {
                step.style.display = 'none';
            });
            
            // Show current step
            const currentStep = document.getElementById(`step-${stepNumber}`);
            if (currentStep) {
                currentStep.style.display = 'block';
            }
            
            // Update progress
            const progressFill = document.querySelector('.progress-fill');
            const stepIndicator = document.querySelector('.step-indicator');
            
            if (progressFill) {
                progressFill.style.width = `${(stepNumber / this.totalSteps) * 100}%`;
            }
            
            if (stepIndicator) {
                stepIndicator.textContent = `Step ${stepNumber} of ${this.totalSteps}`;
            }
            
            // Update buttons
            const prevBtn = document.getElementById('prev-step');
            const nextBtn = document.getElementById('next-step');
            const submitBtn = document.getElementById('submit-registration');
            
            if (prevBtn) {
                prevBtn.style.display = stepNumber > 1 ? 'inline-block' : 'none';
            }
            
            if (nextBtn) {
                nextBtn.style.display = stepNumber < this.totalSteps ? 'inline-block' : 'none';
            }
            
            if (submitBtn) {
                submitBtn.style.display = stepNumber === this.totalSteps ? 'inline-block' : 'none';
            }
            
            this.currentStep = stepNumber;
        },

        setupEventListeners: function() {
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
            if (this.validateCurrentStep()) {
                this.saveCurrentStepData();
                if (this.currentStep < this.totalSteps) {
                    this.showStep(this.currentStep + 1);
                }
            }
        },

        prevStep: function() {
            if (this.currentStep > 1) {
                this.showStep(this.currentStep - 1);
            }
        },

        validateCurrentStep: function() {
            const currentStepElement = document.getElementById(`step-${this.currentStep}`);
            const requiredFields = currentStepElement.querySelectorAll('[required]');
            
            let isValid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                this.showError('Please fill in all required fields');
            }
            
            return isValid;
        },

        saveCurrentStepData: function() {
            const currentStepElement = document.getElementById(`step-${this.currentStep}`);
            const inputs = currentStepElement.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    this.formData[input.id] = input.checked;
                } else {
                    this.formData[input.id] = input.value;
                }
            });
        },

        submitRegistration: function() {
            if (!this.validateCurrentStep()) {
                return;
            }
            
            this.saveCurrentStepData();
            
            // Show loading state
            const submitBtn = document.getElementById('submit-registration');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
            }
            
            // Process registration
            this.processRegistration();
        },

        processRegistration: function() {
            // Create user object
            const userData = {
                id: 'user_' + Date.now(),
                name: this.formData['reg-name'],
                email: this.formData['reg-email'],
                phone: this.formData['reg-phone'],
                restaurant: {
                    name: this.formData['reg-restaurant-name'],
                    type: this.formData['reg-restaurant-type'],
                    location: this.formData['reg-location']
                },
                preferences: {
                    language: this.formData['reg-language'] || 'en',
                    notifications: this.formData['reg-notifications'] || false
                },
                registrationDate: new Date().toISOString(),
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
                this.showError('Registration failed. Please try again.');
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
                overlay.innerHTML = `
                    <div class="registration-container">
                        <div class="success-message">
                            <div class="success-icon">✅</div>
                            <h3>Welcome to Fooodis!</h3>
                            <p>Your registration is complete. You can now enjoy all our features.</p>
                            <button type="button" class="btn-primary" onclick="window.ChatbotRegistrationForm.closeForm()">
                                Start Chatting
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
            
            const header = document.querySelector('.registration-header');
            if (header) {
                header.appendChild(errorDiv);
            }
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        },

        cancelRegistration: function() {
            if (confirm('Are you sure you want to cancel registration?')) {
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
            this.currentStep = 1;
            
            // Send welcome message
            if (window.FoodisChatbot && window.FoodisChatbot.addMessage) {
                setTimeout(() => {
                    window.FoodisChatbot.addMessage('Welcome to Fooodis! How can I help you today?', 'assistant');
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
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                    border-radius: 12px;
                }
                
                .registration-container {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    max-width: 320px;
                    width: 95%;
                    max-height: 450px;
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                
                .registration-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .registration-header h3 {
                    color: #26282f;
                    margin-bottom: 10px;
                    font-size: 24px;
                }
                
                .registration-header p {
                    color: #666;
                    margin-bottom: 20px;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 6px;
                    background: #e0e0e0;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(45deg, #e8f24c, #d4e547);
                    transition: width 0.3s ease;
                }
                
                .step-indicator {
                    font-size: 12px;
                    color: #666;
                }
                
                .form-step h4 {
                    color: #26282f;
                    margin-bottom: 20px;
                    font-size: 18px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #26282f;
                    font-weight: 500;
                }
                
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }
                
                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #e8f24c;
                }
                
                .form-group input.error {
                    border-color: #ff4444;
                }
                
                .checkbox-label {
                    display: flex !important;
                    align-items: center;
                    cursor: pointer;
                }
                
                .checkbox-label input[type="checkbox"] {
                    width: auto !important;
                    margin-right: 10px;
                }
                
                .registration-actions {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    gap: 10px;
                }
                
                .btn-primary,
                .btn-secondary,
                .btn-cancel {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn-primary {
                    background: #e8f24c;
                    color: #26282f;
                }
                
                .btn-primary:hover {
                    background: #d4e547;
                    transform: translateY(-1px);
                }
                
                .btn-secondary {
                    background: #f0f0f0;
                    color: #26282f;
                }
                
                .btn-secondary:hover {
                    background: #e0e0e0;
                }
                
                .btn-cancel {
                    background: #ff4444;
                    color: white;
                }
                
                .btn-cancel:hover {
                    background: #cc3333;
                }
                
                .success-message {
                    text-align: center;
                    padding: 40px 20px;
                }
                
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .success-message h3 {
                    color: #26282f;
                    margin-bottom: 15px;
                }
                
                .success-message p {
                    color: #666;
                    margin-bottom: 30px;
                }
                
                .error-message {
                    background: #ffebee;
                    color: #c62828;
                    padding: 10px;
                    border-radius: 6px;
                    margin-top: 10px;
                    font-size: 14px;
                }
                
                @media (max-width: 768px) {
                    .registration-container {
                        padding: 20px;
                        width: 95%;
                    }
                    
                    .registration-actions {
                        flex-direction: column;
                    }
                    
                    .btn-primary,
                    .btn-secondary,
                    .btn-cancel {
                        width: 100%;
                        margin-bottom: 10px;
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
