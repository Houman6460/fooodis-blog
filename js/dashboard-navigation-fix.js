
/**
 * Dashboard Navigation Fix
 * Fixes the left sidebar menu navigation issue
 */

(function() {
    'use strict';

    console.log('Dashboard Navigation Fix: Initializing...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigationFix);
    } else {
        initNavigationFix();
    }

    function initNavigationFix() {
        console.log('Dashboard Navigation Fix: Setting up navigation...');

        // Remove any existing event listeners to prevent conflicts
        removeExistingListeners();

        // Set up the navigation system
        setupNavigation();

        // Ensure the first section is active by default
        setDefaultActiveSection();

        console.log('Dashboard Navigation Fix: Navigation setup complete');
    }

    function removeExistingListeners() {
        // Remove any existing click listeners on nav items
        const navItems = document.querySelectorAll('.nav-item, .sidebar-nav li, [data-section]');
        navItems.forEach(item => {
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
        });
    }

    function setupNavigation() {
        // Get all navigation items
        const navItems = document.querySelectorAll('.nav-item, .sidebar-nav li, [data-section]');
        
        console.log(`Dashboard Navigation Fix: Found ${navItems.length} navigation items`);

        navItems.forEach(navItem => {
            navItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get the section ID from data-section attribute
                let sectionId = this.getAttribute('data-section');
                
                // If no data-section, try to extract from other attributes or text
                if (!sectionId) {
                    // Try href attribute
                    const href = this.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        sectionId = href.substring(1).replace('-section', '');
                    }
                    
                    // Try to get from text content as fallback
                    if (!sectionId) {
                        const text = this.textContent.trim().toLowerCase();
                        sectionId = mapTextToSectionId(text);
                    }
                }

                if (sectionId) {
                    console.log(`Dashboard Navigation Fix: Switching to section: ${sectionId}`);
                    switchToSection(sectionId);
                } else {
                    console.warn('Dashboard Navigation Fix: Could not determine section ID for nav item:', this);
                }
            });
        });
    }

    function mapTextToSectionId(text) {
        const textMap = {
            'create post': 'create-post',
            'manage posts': 'manage-posts',
            'ai configuration': 'ai-config',
            'ai automation': 'ai-automation',
            'ai assistant': 'ai-assistant',
            'scheduled posts': 'scheduled-posts',
            'categories': 'categories',
            'media library': 'media-library',
            'blog statistics': 'blog-stats',
            'advertising banners': 'ad-management',
            'advertising': 'advertising',
            'profile': 'profile',
            'email subscribers': 'email-management',
            'ai chatbot': 'chatbot-management',
            'support tickets': 'support-tickets',
            'settings': 'settings'
        };

        return textMap[text] || null;
    }

    function switchToSection(sectionId) {
        // Remove active class from all sections
        const allSections = document.querySelectorAll('.dashboard-section');
        allSections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('.nav-item, .sidebar-nav li');
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            console.log(`Dashboard Navigation Fix: Activated section: ${sectionId}`);
        } else {
            console.error(`Dashboard Navigation Fix: Section not found: ${sectionId}-section`);
            return;
        }

        // Add active class to clicked nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
            console.log(`Dashboard Navigation Fix: Activated nav item: ${sectionId}`);
        }

        // Trigger any section-specific initialization
        initializeSectionFeatures(sectionId);
    }

    function setDefaultActiveSection() {
        // Check if any section is already active
        const activeSection = document.querySelector('.dashboard-section.active');
        
        if (!activeSection) {
            // Default to create-post section
            console.log('Dashboard Navigation Fix: Setting default active section');
            switchToSection('create-post');
        }
    }

    function initializeSectionFeatures(sectionId) {
        // Initialize section-specific features
        switch (sectionId) {
            case 'media-library':
                // Reinitialize media library if the function exists
                if (typeof initializeMediaLibrary === 'function') {
                    setTimeout(initializeMediaLibrary, 100);
                }
                break;
            
            case 'blog-stats':
                // Refresh blog stats if the function exists
                if (typeof BlogStatsDashboard !== 'undefined' && typeof BlogStatsDashboard.forceRefresh === 'function') {
                    setTimeout(() => BlogStatsDashboard.forceRefresh(), 100);
                }
                break;
            
            case 'ai-automation':
                // Load automation paths if the function exists
                if (typeof loadAutomationPaths === 'function') {
                    setTimeout(loadAutomationPaths, 100);
                }
                break;
            
            case 'categories':
                // Initialize category management if the function exists
                if (typeof initializeCategoryManagement === 'function') {
                    setTimeout(initializeCategoryManagement, 100);
                }
                break;
        }
    }

    // Global function to switch sections programmatically
    window.switchDashboardSection = switchToSection;

    // Also add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Alt + number keys to switch sections
        if (e.altKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const sectionIndex = parseInt(e.key) - 1;
            const navItems = document.querySelectorAll('[data-section]');
            
            if (navItems[sectionIndex]) {
                const sectionId = navItems[sectionIndex].getAttribute('data-section');
                if (sectionId) {
                    switchToSection(sectionId);
                }
            }
        }
    });

    console.log('Dashboard Navigation Fix: Initialization complete');
})();
