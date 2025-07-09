
// Icon Stabilizer - Prevents icon flickering and loading issues
(function() {
    'use strict';
    
    console.log('Icon Stabilizer: Initializing');
    
    function stabilizeIcons() {
        // Fix icon paths
        const icons = document.querySelectorAll('i[class*="fa-"], .icon, [class*="icon-"]');
        
        icons.forEach(icon => {
            // Ensure FontAwesome icons load properly
            if (icon.classList.contains('fa') || icon.className.includes('fa-')) {
                icon.style.fontFamily = 'Font Awesome 5 Free, Font Awesome 5 Pro, FontAwesome';
                icon.style.fontWeight = '900';
            }
            
            // Prevent icon flickering
            icon.style.transition = 'none';
            icon.style.visibility = 'visible';
        });
        
        // Fix automation status icons
        const statusIcons = document.querySelectorAll('.status-icon, .automation-icon');
        statusIcons.forEach(icon => {
            icon.style.display = 'inline-block';
            icon.style.visibility = 'visible';
        });
        
        // Ensure icons in buttons are visible
        const buttonIcons = document.querySelectorAll('button i, .btn i');
        buttonIcons.forEach(icon => {
            icon.style.display = 'inline-block';
            icon.style.marginRight = '5px';
        });
    }
    
    function loadFontAwesome() {
        // Ensure FontAwesome is loaded
        if (!document.querySelector('link[href*="fontawesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    // Initialize
    loadFontAwesome();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', stabilizeIcons);
    } else {
        stabilizeIcons();
    }
    
    // Monitor for new icons
    const observer = new MutationObserver(() => {
        stabilizeIcons();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Icon Stabilizer: Initialized successfully');
})();
