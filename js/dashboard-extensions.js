
/**
 * Dashboard Extensions for Fooodis Blog System
 * Provides additional functionality and UI enhancements
 */

// Global dashboard state
window.dashboardState = {
    currentUser: null,
    stats: {
        totalPosts: 0,
        totalViews: 0,
        totalComments: 0,
        automationTasks: 0
    },
    initialized: false
};

/**
 * Initialize Dashboard Extensions
 */
function initializeDashboardExtensions() {
    console.log('Dashboard Extensions: Initializing...');
    
    // Check authentication
    checkDashboardAuth();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup event listeners
    setupDashboardEventListeners();
    
    // Initialize modules
    initializeDashboardModules();
    
    window.dashboardState.initialized = true;
    console.log('Dashboard Extensions: Initialized successfully');
}

/**
 * Check dashboard authentication
 */
function checkDashboardAuth() {
    const token = localStorage.getItem('fooodis-auth-token');
    const userStr = localStorage.getItem('fooodis-auth-user');
    
    if (!token || !userStr) {
        console.log('Dashboard Extensions: No authentication found, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        window.dashboardState.currentUser = JSON.parse(userStr);
        console.log('Dashboard Extensions: User authenticated:', window.dashboardState.currentUser.email);
        
        // Update user info in UI
        updateUserInfo();
    } catch (error) {
        console.error('Dashboard Extensions: Error parsing user data:', error);
        window.location.href = 'login.html';
    }
}

/**
 * Update user info in dashboard
 */
function updateUserInfo() {
    const user = window.dashboardState.currentUser;
    if (!user) return;
    
    // Update user name displays
    const userNameElements = document.querySelectorAll('.user-name, #userName');
    userNameElements.forEach(element => {
        element.textContent = user.name || user.email;
    });
    
    // Update user email displays
    const userEmailElements = document.querySelectorAll('.user-email, #userEmail');
    userEmailElements.forEach(element => {
        element.textContent = user.email;
    });
    
    // Update user avatar if exists
    const avatarElements = document.querySelectorAll('.user-avatar, #userAvatar');
    avatarElements.forEach(element => {
        if (user.avatar) {
            element.src = user.avatar;
        } else {
            // Set default avatar based on user's initials
            element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=007bff&color=fff`;
        }
    });
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
    try {
        // Load blog posts
        const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        window.dashboardState.stats.totalPosts = blogPosts.length;
        
        // Load automation paths
        const automationPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
        window.dashboardState.stats.automationTasks = automationPaths.length;
        
        // Calculate total views (mock data for now)
        window.dashboardState.stats.totalViews = blogPosts.reduce((total, post) => {
            return total + (post.views || Math.floor(Math.random() * 1000));
        }, 0);
        
        // Calculate total comments (mock data for now)
        window.dashboardState.stats.totalComments = blogPosts.reduce((total, post) => {
            return total + (post.comments || Math.floor(Math.random() * 50));
        }, 0);
        
        // Update stats display
        updateStatsDisplay();
        
        console.log('Dashboard Extensions: Loaded dashboard data');
    } catch (error) {
        console.error('Dashboard Extensions: Error loading dashboard data:', error);
    }
}

/**
 * Update stats display
 */
function updateStatsDisplay() {
    const stats = window.dashboardState.stats;
    
    // Update stat cards
    const totalPostsElement = document.getElementById('totalPosts') || document.querySelector('.stat-posts .stat-number');
    if (totalPostsElement) {
        totalPostsElement.textContent = stats.totalPosts;
    }
    
    const totalViewsElement = document.getElementById('totalViews') || document.querySelector('.stat-views .stat-number');
    if (totalViewsElement) {
        totalViewsElement.textContent = stats.totalViews.toLocaleString();
    }
    
    const totalCommentsElement = document.getElementById('totalComments') || document.querySelector('.stat-comments .stat-number');
    if (totalCommentsElement) {
        totalCommentsElement.textContent = stats.totalComments;
    }
    
    const automationTasksElement = document.getElementById('automationTasks') || document.querySelector('.stat-automation .stat-number');
    if (automationTasksElement) {
        automationTasksElement.textContent = stats.automationTasks;
    }
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Sidebar navigation
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Refresh dashboard button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }
    
    // Search functionality
    const searchInput = document.getElementById('dashboardSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (window.AuthManager) {
        window.AuthManager.logout();
    } else {
        // Fallback logout
        localStorage.removeItem('fooodis-auth-token');
        localStorage.removeItem('fooodis-auth-user');
        localStorage.removeItem('fooodis-auth-session');
        window.location.href = 'login.html';
    }
}

/**
 * Handle navigation
 */
function handleNavigation(event) {
    const target = event.target.closest('a');
    if (!target) return;
    
    const href = target.getAttribute('href');
    if (href && href.startsWith('#')) {
        event.preventDefault();
        
        // Handle section switching
        const sectionId = href.substring(1);
        showDashboardSection(sectionId);
    }
}

/**
 * Show dashboard section
 */
function showDashboardSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section, .content-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    console.log('Dashboard Extensions: Switched to section:', sectionId);
}

/**
 * Refresh dashboard
 */
function refreshDashboard() {
    console.log('Dashboard Extensions: Refreshing dashboard...');
    
    // Reload data
    loadDashboardData();
    
    // Reload automation paths if function exists
    if (typeof loadAutomationPaths === 'function') {
        loadAutomationPaths();
    }
    
    // Reload AI config if function exists
    if (typeof loadSavedConfig === 'function') {
        loadSavedConfig();
    }
    
    // Show refresh confirmation
    showNotification('Dashboard refreshed successfully!', 'success');
}

/**
 * Handle search
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    // Search in posts, automation paths, etc.
    const searchableElements = document.querySelectorAll('.searchable, .post-item, .automation-path-item');
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} dashboard-notification`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Initialize dashboard modules
 */
function initializeDashboardModules() {
    // Initialize AI automation if available
    if (typeof initializeAIAutomation === 'function') {
        initializeAIAutomation();
    }
    
    // Initialize AI config if available
    if (typeof initializeAIConfig === 'function') {
        initializeAIConfig();
    }
    
    // Initialize storage manager if available
    if (typeof initializeStorageManager === 'function') {
        initializeStorageManager();
    }
}

/**
 * Get dashboard state
 */
function getDashboardState() {
    return window.dashboardState;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeDashboardExtensions);

// Export functions for global access
window.initializeDashboardExtensions = initializeDashboardExtensions;
window.loadDashboardData = loadDashboardData;
window.refreshDashboard = refreshDashboard;
window.showDashboardSection = showDashboardSection;
window.showNotification = showNotification;
window.getDashboardState = getDashboardState;
