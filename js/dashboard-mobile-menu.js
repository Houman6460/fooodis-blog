/**
 * Dashboard Mobile Menu Handler
 * Controls the slide-out sidebar on mobile devices
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', initMobileMenu);
    
    function initMobileMenu() {
        const menuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.dashboard-sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (!menuToggle || !sidebar) {
            console.log('Mobile menu elements not found');
            return;
        }
        
        // Toggle sidebar when menu button is clicked
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Close sidebar when overlay is clicked
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                closeSidebar();
            });
        }
        
        // Close sidebar when a nav item is clicked (on mobile)
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 576) {
                    // Small delay to allow the section change to happen
                    setTimeout(closeSidebar, 100);
                }
            });
        });
        
        // Close sidebar on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // Close mobile sidebar if resized to larger screen
                if (window.innerWidth > 576 && sidebar.classList.contains('open')) {
                    closeSidebar();
                }
            }, 250);
        });
        
        // Prevent body scroll when sidebar is open
        function preventBodyScroll(prevent) {
            if (prevent) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        function toggleSidebar() {
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
        
        function openSidebar() {
            sidebar.classList.add('open');
            if (overlay) {
                overlay.classList.add('active');
            }
            menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            menuToggle.setAttribute('aria-expanded', 'true');
            preventBodyScroll(true);
        }
        
        function closeSidebar() {
            sidebar.classList.remove('open');
            if (overlay) {
                overlay.classList.remove('active');
            }
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            menuToggle.setAttribute('aria-expanded', 'false');
            preventBodyScroll(false);
        }
        
        // Export functions for external use
        window.dashboardMobileMenu = {
            open: openSidebar,
            close: closeSidebar,
            toggle: toggleSidebar
        };
        
        console.log('Dashboard mobile menu initialized');
    }
})();
