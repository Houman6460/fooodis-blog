// Direct, aggressive fix for hamburger menu
window.addEventListener('load', function() {
    // Wait for everything to load
    setTimeout(function() {
        console.log('Direct menu fix script loaded and active');
        
        // Get elements
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const mobileNavPanel = document.querySelector('.mobile-nav');
        const closeButton = document.querySelector('.mobile-nav-close');
        
        // Track menu state
        let isMenuOpen = false;
        
        if (hamburgerButton && mobileNavPanel) {
            // Force clean initial state
            mobileNavPanel.style.left = '-100%';
            mobileNavPanel.classList.remove('show');
            document.body.style.overflow = '';
            
            // Remove any existing event listeners by cloning and replacing
            const newHamburger = hamburgerButton.cloneNode(true);
            hamburgerButton.parentNode.replaceChild(newHamburger, hamburgerButton);
            
            // Add direct inline styles to the mobile nav to ensure visibility when open
            newHamburger.addEventListener('click', function(e) {
                console.log('Hamburger clicked - direct fix');
                e.stopPropagation();
                e.preventDefault();
                
                if (!isMenuOpen) {
                    // Open menu
                    mobileNavPanel.style.left = '0';
                    mobileNavPanel.style.display = 'block';
                    mobileNavPanel.style.opacity = '1';
                    mobileNavPanel.style.visibility = 'visible';
                    mobileNavPanel.classList.add('show');
                    document.body.style.overflow = 'hidden';
                    isMenuOpen = true;
                    console.log('Menu opened');
                } else {
                    // Close menu
                    mobileNavPanel.style.left = '-100%';
                    mobileNavPanel.classList.remove('show');
                    document.body.style.overflow = '';
                    isMenuOpen = false;
                    console.log('Menu closed');
                }
            });
            
            // Ensure close button works
            if (closeButton) {
                const newCloseBtn = closeButton.cloneNode(true);
                closeButton.parentNode.replaceChild(newCloseBtn, closeButton);
                
                newCloseBtn.addEventListener('click', function() {
                    mobileNavPanel.style.left = '-100%';
                    mobileNavPanel.classList.remove('show');
                    document.body.style.overflow = '';
                    isMenuOpen = false;
                    console.log('Menu closed via close button');
                });
            }
        }
    }, 500); // Delay to ensure all other scripts have run
});
