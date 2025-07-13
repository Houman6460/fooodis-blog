
/**
 * Authentication Manager for Fooodis Blog System
 * Handles login, logout, and session management
 */

class AuthManager {
    constructor() {
        this.apiBase = window.location.origin + '/api/auth';
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for existing session on page load
        this.checkExistingSession();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form handler
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button handler
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                this.logout();
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const loginError = document.getElementById('login-error');
        
        if (loginError) {
            loginError.style.display = 'none';
        }
        
        if (!username || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        try {
            console.log('🔐 AuthManager: Attempting login for:', username);
            
            // Show loading state
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: username,
                    password: password
                })
            });
            
            console.log('📡 AuthManager: Response status:', response.status);

            const data = await response.json();

            if (response.ok) {
                console.log('✅ AuthManager: Login successful');
                // Store user data and token
                localStorage.setItem('fooodis-auth-token', data.token);
                localStorage.setItem('fooodis-auth-user', JSON.stringify(data.user));
                localStorage.setItem('fooodis-auth-session', JSON.stringify({
                    user: data.user,
                    token: data.token,
                    timestamp: Date.now()
                }));

                this.currentUser = data.user;
                
                console.log('🔄 AuthManager: Redirecting to dashboard');
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                console.log('❌ AuthManager: Login failed:', data.message);
                this.showError(data.message || 'Login failed. Please check your credentials.');
            }

            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Network error. Please try again.');
            
            // Restore button state
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            submitBtn.disabled = false;
        }
    }

    showError(message) {
        const loginError = document.getElementById('login-error');
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        } else {
            alert(message);
        }
    }

    checkExistingSession() {
        const token = localStorage.getItem('fooodis-auth-token');
        const userStr = localStorage.getItem('fooodis-auth-user');
        
        if (token && userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
                
                // If on login page and already logged in, redirect to dashboard
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                this.logout();
            }
        } else {
            // If not on login page and not logged in, redirect to login
            if (!window.location.pathname.includes('login.html') && 
                !window.location.pathname.includes('index.html') &&
                window.location.pathname !== '/') {
                window.location.href = 'login.html';
            }
        }
    }

    logout() {
        // Clear stored data
        localStorage.removeItem('fooodis-auth-token');
        localStorage.removeItem('fooodis-auth-user');
        localStorage.removeItem('fooodis-auth-session');
        localStorage.removeItem('supportPortalUser');
        localStorage.removeItem('customer_token');
        
        this.currentUser = null;
        
        // Redirect to login
        window.location.href = 'login.html';
    }

    isLoggedIn() {
        return this.currentUser !== null && localStorage.getItem('fooodis-auth-token') !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return localStorage.getItem('fooodis-auth-token');
    }
}

// Initialize Auth Manager
window.AuthManager = new AuthManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
