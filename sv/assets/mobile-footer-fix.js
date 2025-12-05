// Mobile Footer Fix Script
// This script fixes the mobile navigation in the Fooodis footer
(function() {
    // Function to create and add mobile navigation if it doesn't exist
    function createMobileNavigation() {
        // Check if we're on mobile
        if (window.innerWidth > 768) return;
        
        // Check if footer exists
        const footer = document.querySelector('.fooodis-footer');
        if (!footer) {
            // Footer not loaded yet, try again in 500ms
            setTimeout(createMobileNavigation, 500);
            return;
        }
        
        // Check if mobile menu container exists, if not create it
        let mobileMenuContainer = footer.querySelector('.mobile-menu-container');
        if (!mobileMenuContainer) {
            mobileMenuContainer = document.createElement('div');
            mobileMenuContainer.className = 'mobile-menu-container';
            
            // Get the footer container
            const footerContainer = footer.querySelector('.footer-container');
            if (footerContainer) {
                // Insert mobile menu container at the beginning of footer container
                footerContainer.insertBefore(mobileMenuContainer, footerContainer.firstChild);
            } else {
                // If no footer container, add to footer
                footer.appendChild(mobileMenuContainer);
            }
        }
        
        // Check if mobile nav exists, if not create it
        let mobileNav = mobileMenuContainer.querySelector('.mobile-nav');
        if (!mobileNav) {
            // Get the desktop navigation to copy its items
            const desktopNav = footer.querySelector('.footer-nav');
            if (!desktopNav) {
                // No desktop nav found, try again later
                setTimeout(createMobileNavigation, 500);
                return;
            }
            
            // Create mobile navigation
            mobileNav = document.createElement('nav');
            mobileNav.className = 'footer-nav mobile-nav';
            
            // Copy the navigation list from desktop
            const desktopNavList = desktopNav.querySelector('.footer-nav-list');
            if (desktopNavList) {
                mobileNav.innerHTML = desktopNavList.outerHTML;
                mobileMenuContainer.appendChild(mobileNav);
            }
        }
        
        // Apply styles to mobile navigation
        applyMobileStyles();
    }
    
    // Function to apply mobile styles
    function applyMobileStyles() {
        // Only apply on mobile devices
        if (window.innerWidth > 768) return;
        
        // Add CSS styles directly to the head
        const styleElement = document.createElement('style');
        styleElement.textContent = \`
            @media (max-width: 768px) {
                /* Mobile navigation container */
                .mobile-menu-container {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                }
                
                /* Mobile navigation */
                .mobile-nav {
                    display: block !important;
                    width: 100% !important;
                    margin-bottom: 30px !important;
                }
                
                /* Navigation list */
                .mobile-nav .footer-nav-list {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    width: 100% !important;
                    gap: 25px !important;
                    padding: 0 !important;
                    margin: 0 0 30px 0 !important;
                }
                
                /* Navigation items */
                .mobile-nav .footer-nav-item {
                    display: block !important;
                    width: 100% !important;
                    text-align: center !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                /* Navigation links */
                .mobile-nav .footer-nav-item a {
                    font-size: 20px !important;
                    font-weight: 400 !important;
                    color: #fff !important;
                    text-decoration: none !important;
                    padding: 5px 0 !important;
                    display: inline-block !important;
                    letter-spacing: 0.5px !important;
                    opacity: 0.9 !important;
                }
                
                /* Active/hover state */
                .mobile-nav .footer-nav-item a.active,
                .mobile-nav .footer-nav-item a:hover {
                    color: #e3c878 !important;
                    opacity: 1 !important;
                }
                
                /* Hide desktop navigation */
                .footer-top {
                    display: none !important;
                }
                
                /* Back to top button styling */
                .back-to-top-button {
                    position: fixed !important;
                    bottom: 20px !important;
                    right: 20px !important;
                    width: 50px !important;
                    height: 50px !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background-color: #1d2029 !important;
                    border: 2px solid #e3c878 !important;
                    z-index: 100 !important;
                }
                
                .back-to-top-button img {
                    width: 20px !important;
                    height: 20px !important;
                    filter: invert(48%) sepia(80%) saturate(2476%) hue-rotate(190deg) brightness(90%) contrast(95%) !important;
                }
            }
        \`;
        
        // Check if our style element already exists
        const existingStyle = document.getElementById('mobile-footer-fix-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Add ID to our style element
        styleElement.id = 'mobile-footer-fix-styles';
        document.head.appendChild(styleElement);
        
        // Force display of mobile navigation elements
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            mobileNav.style.cssText = 'display: block !important; width: 100% !important;';
            
            const navList = mobileNav.querySelector('.footer-nav-list');
            if (navList) {
                navList.style.cssText = 'display: flex !important; flex-direction: column !important; width: 100% !important; align-items: center !important; gap: 25px !important;';
            }
            
            const navItems = mobileNav.querySelectorAll('.footer-nav-item');
            navItems.forEach(item => {
                item.style.cssText = 'display: block !important; width: 100% !important; text-align: center !important; margin: 0 !important; padding: 0 !important;';
                
                const link = item.querySelector('a');
                if (link) {
                    link.style.cssText = 'font-size: 20px !important; font-weight: 400 !important; padding: 5px 0 !important; display: inline-block !important; color: #fff !important;';
                }
            });
        }
        
        // Hide desktop navigation
        const desktopNav = document.querySelector('.footer-top');
        if (desktopNav) {
            desktopNav.style.display = 'none';
        }
    }

    // Initialize the mobile navigation fix
    function init() {
        // Run immediately
        createMobileNavigation();
        
        // Run again after a short delay to ensure it applies after any other scripts
        setTimeout(createMobileNavigation, 500);
        setTimeout(createMobileNavigation, 1000);
        
        // Add event listener for window resize
        window.addEventListener('resize', function() {
            // Only run on mobile devices
            if (window.innerWidth <= 768) {
                createMobileNavigation();
            }
        });
    }
    
    // Check if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
