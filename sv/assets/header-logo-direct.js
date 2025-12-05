// Fooodis Header Logo - Direct Injection
document.addEventListener('DOMContentLoaded', function() {
    // Create the logo element
    const logoDiv = document.createElement('div');
    logoDiv.className = 'header-fooodis-logo';
    logoDiv.innerHTML = '<a href="https://fooodis.com/"><img src="assets/Artboard 17 copy 9.svg" alt="Fooodis Logo"></a>';
    
    // Add styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .header-fooodis-logo {
            display: block;
            position: fixed;
            top: 0;
            right: 0;
            margin: 15px 20px;
            z-index: 9999;
        }
        
        .header-fooodis-logo img {
            height: 40px;
            width: auto;
        }
        
        @media (max-width: 768px) {
            .header-fooodis-logo {
                margin: 10px 15px;
            }
            
            .header-fooodis-logo img {
                height: 30px;
            }
        }
    `;
    
    // Remove existing logo if any
    const existingLogo = document.querySelector('.header-fooodis-logo');
    if (existingLogo) {
        existingLogo.remove();
    }
    
    // Append style and logo
    document.head.appendChild(styleElement);
    document.body.appendChild(logoDiv);
});
