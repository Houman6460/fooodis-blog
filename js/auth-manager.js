/**
 * Authentication Manager for Fooodis Blog System
 * Handles user authentication, profile management, and session control
 */

// Initialize the AuthManager object
const AuthManager = {
    // Current user information
    currentUser: null,
    
    // Authentication state
    isAuthenticated: false,
    
    // Auto-login setting (can be toggled)
    autoLoginEnabled: true,
    
    // Hardcoded credentials (in a real app, this would be server-side)
    credentials: {
        "info@logoland.se": {
            password: "Ejimineh1236460",
            name: "Admin User",
            role: "admin",
            avatar: null
        }
    },
    
    /**
     * Initialize the authentication manager
     */
    init: function() {
        console.log('AuthManager: Initializing...');
        
        // Load auto-login setting
        this.loadAutoLoginSetting();
        
        // Check for existing session
        this.checkSession();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('AuthManager: Initialized');
    },
    
    /**
     * Set up event listeners for auth-related elements
     */
    setupEventListeners: function() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                AuthManager.login();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(event) {
                event.preventDefault();
                AuthManager.logout();
            });
        }
        
        // Profile form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', function(event) {
                event.preventDefault();
                AuthManager.updateProfile();
            });
        }
        
        // Password change form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(event) {
                event.preventDefault();
                AuthManager.changePassword();
            });
        }
        
        // Avatar upload
        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput) {
            avatarInput.addEventListener('change', function() {
                AuthManager.handleAvatarUpload(this);
            });
        }
    },
    
    /**
     * Check if user is already logged in
     */
    checkSession: function() {
        try {
            // First try direct localStorage
            let sessionData = localStorage.getItem('fooodis-auth-session');
            
            if (sessionData) {
                try {
                    const session = JSON.parse(sessionData);
                    if (session && session.user && session.expiry > Date.now()) {
                        this.currentUser = session.user;
                        this.isAuthenticated = true;
                        console.log('AuthManager: User already logged in:', this.currentUser.email);
                        
                        // Update session expiry
                        this.refreshSession();
                        
                        // Update UI
                        this.updateAuthUI();
                        
                        return true;
                    }
                } catch (parseError) {
                    console.error('AuthManager: Error parsing session data:', parseError);
                }
            }
            
            // If direct localStorage didn't work, try StorageManager
            if (window.StorageManager && typeof window.StorageManager.load === 'function') {
                const managerSession = window.StorageManager.load('auth-session', {
                    defaultValue: null
                });
                
                if (managerSession && managerSession.user && managerSession.expiry > Date.now()) {
                    this.currentUser = managerSession.user;
                    this.isAuthenticated = true;
                    console.log('AuthManager: User already logged in via StorageManager:', this.currentUser.email);
                    
                    // Update session expiry
                    this.refreshSession();
                    
                    // Update UI
                    this.updateAuthUI();
                    
                    return true;
                }
            }
            
            // No valid session found - attempt auto-login if enabled
            if (this.autoLoginEnabled) {
                console.log('AuthManager: No valid session found, attempting auto-login');
                if (this.attemptAutoLogin()) {
                    return true;
                }
            } else {
                console.log('AuthManager: Auto-login is disabled');
            }
            
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // Check if we're on a protected page
            if (this.isProtectedPage()) {
                this.redirectToLogin();
            }
            
            return false;
        } catch (error) {
            console.error('AuthManager: Error checking session:', error);
            return false;
        }
    },
    
    /**
     * Attempt auto-login with default credentials
     */
    attemptAutoLogin: function() {
        try {
            console.log('AuthManager: Attempting auto-login...');
            
            // Use the default admin credentials for auto-login
            const defaultEmail = "info@logoland.se";
            const defaultPassword = "Ejimineh1236460";
            
            // Check if default credentials exist
            if (this.credentials[defaultEmail] && this.credentials[defaultEmail].password === defaultPassword) {
                // Create user object (excluding password)
                const user = {
                    email: defaultEmail,
                    name: this.credentials[defaultEmail].name,
                    role: this.credentials[defaultEmail].role,
                    avatar: this.credentials[defaultEmail].avatar
                };
                
                // Set current user
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Create session with remember me enabled for auto-login
                this.createSession(user, true);
                
                console.log('AuthManager: Auto-login successful for:', defaultEmail);
                
                // Update UI
                this.updateAuthUI();
                
                return true;
            }
            
            console.log('AuthManager: Auto-login failed - credentials not found');
            return false;
        } catch (error) {
            console.error('AuthManager: Error during auto-login:', error);
            return false;
        }
    },
    
    /**
     * Log in the user
     */
    login: function() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const errorElement = document.getElementById('login-error');
        
        // Reset error message
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
        
        // Validate input
        if (!username || !password) {
            if (errorElement) {
                errorElement.textContent = 'Please enter both email and password.';
                errorElement.style.display = 'block';
            }
            return;
        }
        
        // Check credentials (in a real app, this would be a server request)
        if (this.credentials[username] && this.credentials[username].password === password) {
            // Create user object (excluding password)
            const user = {
                email: username,
                name: this.credentials[username].name,
                role: this.credentials[username].role,
                avatar: this.credentials[username].avatar
            };
            
            // Set current user
            this.currentUser = user;
            this.isAuthenticated = true;
            
            // Create session
            this.createSession(user, rememberMe);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error
            if (errorElement) {
                errorElement.textContent = 'Invalid email or password.';
                errorElement.style.display = 'block';
            }
        }
    },
    
    /**
     * Log out the user
     */
    logout: function() {
        // Clear session
        this.clearSession();
        
        // Reset state
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Redirect to login page
        window.location.href = 'login.html';
    },
    
    /**
     * Create a new session
     */
    createSession: function(user, rememberMe) {
        // Calculate expiry time (24 hours or 30 days if remember me)
        const expiryHours = rememberMe ? 24 * 30 : 24;
        const expiry = Date.now() + (expiryHours * 60 * 60 * 1000);
        
        // Create session object
        const session = {
            user: user,
            expiry: expiry,
            created: Date.now()
        };
        
        // Save to localStorage
        try {
            localStorage.setItem('fooodis-auth-session', JSON.stringify(session));
            console.log('AuthManager: Session saved to localStorage');
        } catch (error) {
            console.error('AuthManager: Error saving session to localStorage:', error);
        }
        
        // Also save using StorageManager if available
        if (window.StorageManager && typeof window.StorageManager.save === 'function') {
            try {
                window.StorageManager.save('auth-session', session);
                console.log('AuthManager: Session also saved via StorageManager');
            } catch (error) {
                console.error('AuthManager: Error saving session via StorageManager:', error);
            }
        }
    },
    
    /**
     * Refresh the current session
     */
    refreshSession: function() {
        if (!this.currentUser) return;
        
        // Get existing session
        let session = null;
        try {
            const sessionData = localStorage.getItem('fooodis-auth-session');
            if (sessionData) {
                session = JSON.parse(sessionData);
            }
        } catch (error) {
            console.error('AuthManager: Error getting session for refresh:', error);
        }
        
        // If no session found, try StorageManager
        if (!session && window.StorageManager && typeof window.StorageManager.load === 'function') {
            session = window.StorageManager.load('auth-session', {
                defaultValue: null
            });
        }
        
        // If session found, update expiry
        if (session) {
            // Check if it's a "remember me" session (longer than 24 hours)
            const isLongSession = (session.expiry - session.created) > (24 * 60 * 60 * 1000);
            
            // Calculate new expiry
            const expiryHours = isLongSession ? 24 * 30 : 24;
            session.expiry = Date.now() + (expiryHours * 60 * 60 * 1000);
            
            // Save updated session
            try {
                localStorage.setItem('fooodis-auth-session', JSON.stringify(session));
            } catch (error) {
                console.error('AuthManager: Error refreshing session in localStorage:', error);
            }
            
            // Also save using StorageManager if available
            if (window.StorageManager && typeof window.StorageManager.save === 'function') {
                try {
                    window.StorageManager.save('auth-session', session);
                } catch (error) {
                    console.error('AuthManager: Error refreshing session via StorageManager:', error);
                }
            }
        }
    },
    
    /**
     * Clear the current session
     */
    clearSession: function() {
        // Remove from localStorage
        try {
            localStorage.removeItem('fooodis-auth-session');
        } catch (error) {
            console.error('AuthManager: Error clearing session from localStorage:', error);
        }
        
        // Also remove using StorageManager if available
        if (window.StorageManager && typeof window.StorageManager.save === 'function') {
            try {
                window.StorageManager.remove('auth-session');
            } catch (error) {
                console.error('AuthManager: Error clearing session via StorageManager:', error);
            }
        }
    },
    
    /**
     * Update the UI based on authentication state
     */
    updateAuthUI: function() {
        // Update navbar
        const authNavItems = document.querySelectorAll('.auth-nav-item');
        const userNavItems = document.querySelectorAll('.user-nav-item');
        const userDisplayName = document.querySelector('.user-display-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (this.isAuthenticated) {
            // Show user items, hide auth items
            authNavItems.forEach(item => item.style.display = 'none');
            userNavItems.forEach(item => item.style.display = 'block');
            
            // Update user display name
            if (userDisplayName && this.currentUser) {
                userDisplayName.textContent = this.currentUser.name;
            }
            
            // Update user avatar
            if (userAvatar && this.currentUser) {
                if (this.currentUser.avatar) {
                    userAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">`;
                } else {
                    // Show initials if no avatar
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
        
        // Profile form
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const roleDisplay = document.getElementById('profileRole');
        
        if (nameInput) nameInput.value = this.currentUser.name || '';
        if (emailInput) emailInput.value = this.currentUser.email || '';
        if (roleDisplay) roleDisplay.textContent = this.currentUser.role || 'User';
        
        // Avatar
        const avatarDisplay = document.querySelector('.profile-avatar');
        if (avatarDisplay) {
            if (this.currentUser.avatar) {
                avatarDisplay.innerHTML = `<img src="${this.currentUser.avatar}" alt="${this.currentUser.name}">`;
            } else {
                // Show initials if no avatar
                const initials = this.getInitials(this.currentUser.name);
                avatarDisplay.innerHTML = initials;
            }
        }
    },
    
    /**
     * Update user profile
     */
    updateProfile: function() {
        if (!this.currentUser) return;
        
        const nameInput = document.getElementById('profileName');
        const statusElement = document.getElementById('profileStatus');
        
        if (!nameInput) return;
        
        const newName = nameInput.value.trim();
        
        // Validate
        if (!newName) {
            if (statusElement) {
                statusElement.textContent = 'Name cannot be empty.';
                statusElement.className = 'alert alert-danger';
                statusElement.style.display = 'block';
            }
            return;
        }
        
        // Update user object
        this.currentUser.name = newName;
        
        // Update credentials (in a real app, this would be a server request)
        if (this.credentials[this.currentUser.email]) {
            this.credentials[this.currentUser.email].name = newName;
        }
        
        // Update session
        this.refreshSession();
        
        // Update UI
        this.updateAuthUI();
        
        // Show success message
        if (statusElement) {
            statusElement.textContent = 'Profile updated successfully!';
            statusElement.className = 'alert alert-success';
            statusElement.style.display = 'block';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    },
    
    /**
     * Change user password
     */
    changePassword: function() {
        if (!this.currentUser) return;
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const statusElement = document.getElementById('passwordStatus');
        
        // Reset status
        if (statusElement) {
            statusElement.style.display = 'none';
        }
        
        // Validate
        if (!currentPassword || !newPassword || !confirmPassword) {
            if (statusElement) {
                statusElement.textContent = 'All fields are required.';
                statusElement.className = 'alert alert-danger';
                statusElement.style.display = 'block';
            }
            return;
        }
        
        if (newPassword !== confirmPassword) {
            if (statusElement) {
                statusElement.textContent = 'New passwords do not match.';
                statusElement.className = 'alert alert-danger';
                statusElement.style.display = 'block';
            }
            return;
        }
        
        // Check current password (in a real app, this would be a server request)
        if (!this.credentials[this.currentUser.email] || 
            this.credentials[this.currentUser.email].password !== currentPassword) {
            if (statusElement) {
                statusElement.textContent = 'Current password is incorrect.';
                statusElement.className = 'alert alert-danger';
                statusElement.style.display = 'block';
            }
            return;
        }
        
        // Update password (in a real app, this would be a server request)
        this.credentials[this.currentUser.email].password = newPassword;
        
        // Show success message
        if (statusElement) {
            statusElement.textContent = 'Password changed successfully!';
            statusElement.className = 'alert alert-success';
            statusElement.style.display = 'block';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    },
    
    /**
     * Handle avatar upload
     */
    handleAvatarUpload: function(input) {
        if (!input.files || !input.files[0]) return;
        
        const file = input.files[0];
        
        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }
        
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB.');
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update user avatar
            this.currentUser.avatar = e.target.result;
            
            // Update credentials (in a real app, this would be a server request)
            if (this.credentials[this.currentUser.email]) {
                this.credentials[this.currentUser.email].avatar = e.target.result;
            }
            
            // Update session
            this.refreshSession();
            
            // Update UI
            this.updateAuthUI();
        };
        
        reader.readAsDataURL(file);
    },
    
    /**
     * Check if current page is a protected page
     */
    isProtectedPage: function() {
        // List of pages that require authentication
        const protectedPages = [
            'dashboard.html',
            'profile.html',
            'settings.html'
        ];
        
        // Get current page filename
        const currentPage = window.location.pathname.split('/').pop();
        
        // Check if current page is in the protected pages list
        return protectedPages.includes(currentPage);
    },
    
    /**
     * Redirect to login page
     */
    redirectToLogin: function() {
        // Get current page URL
        const currentUrl = window.location.href;
        
        // Redirect to login page with redirect parameter
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
    },
    
    /**
     * Get user initials from name
     */
    getInitials: function(name) {
        if (!name) return '';
        
        const nameParts = name.split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        } else {
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
    },
    
    /**
     * Toggle auto-login feature
     */
    toggleAutoLogin: function(enabled) {
        this.autoLoginEnabled = enabled;
        
        // Save setting to localStorage
        try {
            localStorage.setItem('fooodis-auto-login-enabled', JSON.stringify(enabled));
            console.log('AuthManager: Auto-login setting saved:', enabled);
        } catch (error) {
            console.error('AuthManager: Error saving auto-login setting:', error);
        }
        
        // Also save using StorageManager if available
        if (window.StorageManager && typeof window.StorageManager.save === 'function') {
            try {
                window.StorageManager.save('auto-login-enabled', enabled);
            } catch (error) {
                console.error('AuthManager: Error saving auto-login setting via StorageManager:', error);
            }
        }
    },
    
    /**
     * Load auto-login setting
     */
    loadAutoLoginSetting: function() {
        try {
            // Try localStorage first
            const savedSetting = localStorage.getItem('fooodis-auto-login-enabled');
            if (savedSetting !== null) {
                this.autoLoginEnabled = JSON.parse(savedSetting);
                console.log('AuthManager: Auto-login setting loaded from localStorage:', this.autoLoginEnabled);
                return;
            }
            
            // Try StorageManager
            if (window.StorageManager && typeof window.StorageManager.load === 'function') {
                const managerSetting = window.StorageManager.load('auto-login-enabled', {
                    defaultValue: true
                });
                this.autoLoginEnabled = managerSetting;
                console.log('AuthManager: Auto-login setting loaded from StorageManager:', this.autoLoginEnabled);
                return;
            }
            
            // Default to enabled
            this.autoLoginEnabled = true;
            console.log('AuthManager: Using default auto-login setting:', this.autoLoginEnabled);
        } catch (error) {
            console.error('AuthManager: Error loading auto-login setting:', error);
            this.autoLoginEnabled = true;
        }
    }
};

// Initialize AuthManager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AuthManager.init();
});