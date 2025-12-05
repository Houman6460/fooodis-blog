// Direct logo injection - will be added to footer-loader.js
document.addEventListener('DOMContentLoaded', function() {
    // Create logo element with absolute positioning
    const logoDiv = document.createElement('div');
    logoDiv.style.cssText = 'position: fixed; top: 0; right: 0; margin: 15px 20px; z-index: 9999;';
    
    // Create link and image
    const logoLink = document.createElement('a');
    logoLink.href = 'https://fooodis.com/';
    logoLink.target = '_blank';
    
    const logoImg = document.createElement('img');
    logoImg.src = 'assets/Artboard 17 copy 9.svg';
    logoImg.alt = 'Fooodis Logo';
    logoImg.style.cssText = 'height: 40px; width: auto;';
    
    // Assemble the elements
    logoLink.appendChild(logoImg);
    logoDiv.appendChild(logoLink);
    
    // Add to document body
    document.body.appendChild(logoDiv);
    
    // Add responsive styles
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleMediaChange = (e) => {
        if (e.matches) {
            logoDiv.style.margin = '10px 15px';
            logoImg.style.height = '30px';
        } else {
            logoDiv.style.margin = '15px 20px';
            logoImg.style.height = '40px';
        }
    };
    
    // Initial check
    handleMediaChange(mediaQuery);
    
    // Add listener for screen size changes
    mediaQuery.addEventListener('change', handleMediaChange);
});
