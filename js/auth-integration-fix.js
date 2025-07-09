
// Authentication Integration Fix - Connects login system with dashboard
(function() {
    'use strict';
    
    console.log('Auth Integration Fix: Initializing authentication system');
    
    // Initialize authentication system
    function initializeAuth() {
        // Check if user is logged in
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        
        if (token && userInfo) {
            console.log('Auth Integration Fix: User is logged in');
            window.currentUser = JSON.parse(userInfo);
            window.authToken = token;
            return true;
        }
        
        return false;
    }
    
    // Login function with enhanced debouncing
    let loginInProgress = false;
    let lastLoginAttempt = 0;
    window.loginUser = function(username, password) {
        const now = Date.now();
        
        // Prevent rapid login attempts
        if (now - lastLoginAttempt < 2000) {
            console.log('Auth Integration Fix: Login attempt too soon, ignoring');
            return false;
        }
        
        if (loginInProgress) {
            console.log('Auth Integration Fix: Login already in progress, ignoring');
            return false;
        }
        
        loginInProgress = true;
        lastLoginAttempt = now;
        console.log('Auth Integration Fix: Attempting login for:', username);
        
        // Simple authentication for now (replace with real API call)
        const validCredentials = [
            { username: 'admin', password: 'admin123', name: 'Administrator' },
            { username: 'user', password: 'user123', name: 'User' },
            { username: 'demo', password: 'demo', name: 'Demo User' }
        ];
        
        const user = validCredentials.find(u => u.username === username && u.password === password);
        
        if (user) {
            const token = 'auth_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const userInfo = {
                username: user.username,
                name: user.name,
                loginTime: new Date().toISOString()
            };
            
            // Store authentication data
            localStorage.setItem('authToken', token);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            window.currentUser = userInfo;
            window.authToken = token;
            
            console.log('Auth Integration Fix: Login successful for:', user.name);
            
            // Clear any redirect tracking
            sessionStorage.removeItem('authRedirectCount');
            
            // Delay before redirect to ensure storage is written and prevent loops
            setTimeout(() => {
                loginInProgress = false;
                window.location.href = 'dashboard.html';
            }, 1000);
            
            return true;
        } else {
            console.log('Auth Integration Fix: Login failed - invalid credentials');
            alert('Invalid username or password');
            loginInProgress = false;
            return false;
        }
        
        // Reset login flag after a delay
        setTimeout(() => {
            loginInProgress = false;
        }, 1000);
    };
    
    // Logout function
    window.logoutUser = function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userInfo');
        
        delete window.currentUser;
        delete window.authToken;
        
        window.location.href = 'login.html';
    };
    
    // Check authentication on page load
    function checkAuthOnLoad() {
        const currentPage = window.location.pathname;
        
        // Pages that don't require authentication
        const publicPages = ['/login.html', '/index.html', '/', '/blog.html'];
        
        // Prevent redirect loops by checking if we're already redirecting
        if (window.location.search.includes('redirecting=true')) {
            console.log('Auth Integration Fix: Redirect loop detected, stopping');
            return;
        }
        
        // Add session-based redirect prevention
        const redirectCount = parseInt(sessionStorage.getItem('authRedirectCount') || '0');
        const pageLoadCount = parseInt(sessionStorage.getItem('pageLoadCount') || '0');
        
        // Enhanced protection against redirect loops
        if (redirectCount > 1 || pageLoadCount > 3) {
            console.log('Auth Integration Fix: Too many redirects detected, stopping all authentication checks to prevent loops');
            sessionStorage.removeItem('authRedirectCount');
            return;
        }
        
        const authResult = initializeAuth();
        
        // DISABLED: Automatic redirects to prevent loops
        // Instead, just log the authentication status
        if (currentPage.endsWith('login.html') && authResult) {
            console.log('Auth Integration Fix: User is authenticated but on login page - no automatic redirect');
            return;
        }
        
        if (!publicPages.some(page => currentPage.endsWith(page)) && !authResult) {
            console.log('Auth Integration Fix: User not authenticated on protected page - no automatic redirect');
            return;
        }
        
        // Reset redirect count on successful auth check
        if (authResult) {
            sessionStorage.removeItem('authRedirectCount');
        }
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthOnLoad);
    } else {
        checkAuthOnLoad();
    }
    
    // Add login form handler if on login page
    function setupLoginForm() {
        const loginForm = document.getElementById('loginForm') || document.querySelector('form');
        if (loginForm && window.location.pathname.endsWith('login.html')) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username')?.value || 
                               document.querySelector('input[type="text"], input[name="username"]')?.value;
                const password = document.getElementById('password')?.value || 
                               document.querySelector('input[type="password"], input[name="password"]')?.value;
                
                if (username && password) {
                    window.loginUser(username, password);
                } else {
                    alert('Please enter both username and password');
                }
            });
            
            console.log('Auth Integration Fix: Login form handler attached');
        }
    }
    
    // Setup login form
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLoginForm);
    } else {
        setupLoginForm();
    }
    
    console.log('Auth Integration Fix: Authentication system initialized');
})();
