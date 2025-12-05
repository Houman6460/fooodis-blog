// Script to include the header.html file in all pages
document.addEventListener('DOMContentLoaded', function() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load header.html');
                }
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
                // Initialize header functionality after inserting the header
                initializeHeader();
            })
            .catch(error => {
                console.error('Error loading header:', error);
                headerPlaceholder.innerHTML = '<p>Error loading header. Please refresh the page.</p>';
            });
    }
    
    // Function to initialize header functionality
    function initializeHeader() {
        // Header shadow on scroll
        const header = document.querySelector('.fooodis-header');
        
        function handleScroll() {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Initial check and add scroll listener
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Mobile menu toggle
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (hamburgerMenu && mobileNav) {
            hamburgerMenu.addEventListener('click', function(e) {
                // Stop event propagation
                e.preventDefault();
                e.stopPropagation();
                
                // Force the mobile navigation panel to toggle using direct style manipulation
                // This bypasses any potential CSS conflicts
                const currentLeft = window.getComputedStyle(mobileNav).left;
                
                if (currentLeft === '0px') {
                    // Menu is open, close it
                    mobileNav.style.left = '-100%';
                    mobileNav.classList.remove('show');
                    document.body.style.overflow = ''; // Re-enable scrolling
                    console.log('Menu closed from header-include.js');
                } else {
                    // Menu is closed, open it
                    mobileNav.style.left = '0';
                    mobileNav.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
                    console.log('Menu opened from header-include.js');
                }
            });
        }
        
        // Close button removed - hamburger menu now serves as both open and close button
        
        // Language switching functionality
        const flagLinks = document.querySelectorAll('.flag-link');
        flagLinks.forEach(flag => {
            flag.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                if (lang) {
                    // Store the selected language in localStorage
                    localStorage.setItem('fooodis-language', lang);
                    
                    // If there's a language switcher function defined elsewhere, call it
                    if (typeof updateLanguage === 'function') {
                        updateLanguage(lang);
                    }
                    
                    // Trigger a custom event for other scripts that might need to know about language changes
                    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
                    document.dispatchEvent(event);
                }
            });
        });
    }
});
