/**
 * Secure Authentication Manager for Fooodis Blog System
 * Uses backend API for all authentication operations
 * NO hardcoded credentials - all auth is server-side
 */

const AuthManager = {
    // Current user information
    currentUser: null,
    
    // Authentication state
    isAuthenticated: false,
    
    // Auth token
    authToken: null,
    
    // API endpoint
    apiEndpoint: '/api/admin/auth',
    
    /**
     * Initialize the authentication manager
     */
    init: async function() {
        console.log('AuthManager: Initializing secure authentication...');
        
        // Check for existing session
        await this.checkSession();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('AuthManager: Initialized, authenticated:', this.isAuthenticated);
    },
    
    /**
     * Set up event listeners for auth-related elements
     */
    setupEventListeners: function() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.login();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                await this.logout();
            });
        }
        
        // Profile form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.updateProfile();
            });
        }
        
        // Password change form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                await this.changePassword();
            });
        }
    },
    
    /**
     * Check if user has a valid session
     */
    checkSession: async function() {
        try {
            // Get token from localStorage
            this.authToken = localStorage.getItem('fooodis-admin-token');
            
            if (!this.authToken) {
                console.log('AuthManager: No token found');
                this.handleUnauthenticated();
                return false;
            }
            
            // Validate token with backend
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                console.log('AuthManager: Session valid for:', this.currentUser.email);
                this.updateAuthUI();
                return true;
            } else {
                console.log('AuthManager: Session invalid or expired');
                this.clearLocalSession();
                this.handleUnauthenticated();
                return false;
            }
            
        } catch (error) {
            console.error('AuthManager: Session check error:', error);
            this.handleUnauthenticated();
            return false;
        }
    },
    
    /**
     * Handle unauthenticated state
     */
    handleUnauthenticated: function() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.authToken = null;
        
        // Check if we're on a protected page
        if (this.isProtectedPage()) {
            this.redirectToLogin();
        }
    },
    
    /**
     * Log in the user via backend API
     */
    login: async function() {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.getElementById('rememberMe');
        const turnstileInput = document.getElementById('turnstileToken');
        const errorElement = document.getElementById('login-error');
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        const username = usernameInput?.value.trim();
        const password = passwordInput?.value;
        const rememberMe = rememberMeInput?.checked || false;
        const turnstileToken = turnstileInput?.value || '';
        
        // Reset error message
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        
        // Validate input
        if (!username || !password) {
            this.showError(errorElement, 'Please enter both email and password.');
            return;
        }
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        }
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: username,
                    password: password,
                    rememberMe: rememberMe,
                    turnstileToken: turnstileToken
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token
                this.authToken = data.token;
                localStorage.setItem('fooodis-admin-token', data.token);
                
                // Set user data
                this.currentUser = data.user;
                this.isAuthenticated = true;
                
                console.log('AuthManager: Login successful for:', data.user.email);
                
                // Redirect to dashboard or intended page
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect') || 'admin-dashboard.html';
                window.location.href = redirectUrl;
            } else {
                this.showError(errorElement, data.error || 'Login failed. Please try again.');
            }
            
        } catch (error) {
            console.error('AuthManager: Login error:', error);
            this.showError(errorElement, 'Connection error. Please try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        }
    },
    
    /**
     * Log out the user
     */
    logout: async function() {
        try {
            await fetch(this.apiEndpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('AuthManager: Logout error:', error);
        }
        
        // Clear local session
        this.clearLocalSession();
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
    },
    
    /**
     * Clear local session data
     */
    clearLocalSession: function() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authToken = null;
        localStorage.removeItem('fooodis-admin-token');
        localStorage.removeItem('fooodis-auth-session'); // Clean up old session format
    },
    
    /**
     * Change user password
     */
    changePassword: async function() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const statusElement = document.getElementById('passwordStatus');
        
        // Reset status
        if (statusElement) {
            statusElement.style.display = 'none';
        }
        
        // Validate
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showStatus(statusElement, 'All fields are required.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showStatus(statusElement, 'New passwords do not match.', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showStatus(statusElement, 'New password must be at least 8 characters.', 'error');
            return;
        }
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showStatus(statusElement, 'Password changed successfully!', 'success');
                
                // Clear form
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                this.showStatus(statusElement, data.error || 'Failed to change password.', 'error');
            }
            
        } catch (error) {
            console.error('AuthManager: Password change error:', error);
            this.showStatus(statusElement, 'Connection error. Please try again.', 'error');
        }
    },
    
    /**
     * Update the UI based on authentication state
     */
    updateAuthUI: function() {
        const authNavItems = document.querySelectorAll('.auth-nav-item');
        const userNavItems = document.querySelectorAll('.user-nav-item');
        const userDisplayName = document.querySelector('.user-display-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (this.isAuthenticated && this.currentUser) {
            // Show user items, hide auth items
            authNavItems.forEach(item => item.style.display = 'none');
            userNavItems.forEach(item => item.style.display = 'block');
            
            // Update user display name
            if (userDisplayName) {
                userDisplayName.textContent = this.currentUser.name;
            }
            
            // Update user avatar
            if (userAvatar) {
                if (this.currentUser.avatar) {
                    userAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">`;
                } else {
                    const initials = this.getInitials(this.currentUser.name);
                    userAvatar.innerHTML = initials;
                }
            }
            
            // Update profile page if we're on it
            this.updateProfilePage();
        } else {
            // Show auth items, hide user items
            authNavItems.forEach(item => item.style.display = 'block');
            userNavItems.forEach(item => item.style.display = 'none');
        }
    },
    
    /**
     * Update the profile page with user data
     */
    updateProfilePage: function() {
        if (!this.currentUser) return;
        
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const roleDisplay = document.getElementById('profileRole');
        
        if (nameInput) nameInput.value = this.currentUser.name || '';
        if (emailInput) emailInput.value = this.currentUser.email || '';
        if (roleDisplay) roleDisplay.textContent = this.currentUser.role || 'User';
    },
    
    /**
     * Check if current page is a protected page
     */
    isProtectedPage: function() {
        const protectedPages = [
            'admin-dashboard.html',
            'profile.html',
            'settings.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return protectedPages.includes(currentPage);
    },
    
    /**
     * Redirect to login page
     */
    redirectToLogin: function() {
        const currentUrl = window.location.href;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
    },
    
    /**
     * Get user initials from name
     */
    getInitials: function(name) {
        if (!name) return '?';
        const nameParts = name.split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    },
    
    /**
     * Show error message
     */
    showError: function(element, message) {
        if (element) {
            element.textContent = message;
            element.className = 'alert alert-danger';
            element.style.display = 'block';
        }
    },
    
    /**
     * Show status message
     */
    showStatus: function(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
            element.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }
    },
    
    /**
     * Get current auth token for API calls
     */
    getToken: function() {
        return this.authToken || localStorage.getItem('fooodis-admin-token');
    },
    
    /**
     * Make authenticated API request
     */
    authenticatedFetch: async function(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include'
        });
        
        // If unauthorized, redirect to login
        if (response.status === 401) {
            this.clearLocalSession();
            this.redirectToLogin();
            throw new Error('Session expired');
        }
        
        return response;
    }
};

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
