// Mobile Menu Fix - Center Alignment
document.addEventListener('DOMContentLoaded', function() {
    // Function to center the mobile menu items
    function centerMobileMenu() {
        if (window.innerWidth <= 768) {
            // Get footer elements
            const footerNav = document.querySelector('.footer-nav');
            const footerNavList = document.querySelector('.footer-nav-list');
            const footerNavItems = document.querySelectorAll('.footer-nav-item');
            
            // Center the menu container
            if (footerNav) {
                footerNav.style.width = '100%';
                footerNav.style.display = 'flex';
                footerNav.style.justifyContent = 'center';
                footerNav.style.margin = '5px 0';
                footerNav.style.overflowX = 'auto';
                footerNav.style.whiteSpace = 'nowrap';
                footerNav.style.textAlign = 'center';
            }
            
            // Center the menu list
            if (footerNavList) {
                footerNavList.style.display = 'flex';
                footerNavList.style.flexDirection = 'row';
                footerNavList.style.flexWrap = 'nowrap';
                footerNavList.style.justifyContent = 'center';
                footerNavList.style.width = 'auto';
                footerNavList.style.margin = '0 auto';
                footerNavList.style.textAlign = 'center';
            }
            
            // Style each menu item
            footerNavItems.forEach(item => {
                item.style.display = 'inline-block';
                item.style.width = 'auto';
                item.style.margin = '0 3px';
                item.style.padding = '0';
                item.style.textAlign = 'center';
                
                const link = item.querySelector('a');
                if (link) {
                    link.style.fontSize = '12px';
                    link.style.padding = '2px 4px';
                    link.style.whiteSpace = 'nowrap';
                    link.style.display = 'inline-block';
                    link.style.textAlign = 'center';
                }
            });
        }
    }
    
    // Run on load and on resize
    centerMobileMenu();
    window.addEventListener('resize', centerMobileMenu);
    
    // Run again after a short delay to ensure everything is applied
    setTimeout(centerMobileMenu, 100);
});
