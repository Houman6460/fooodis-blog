// Add Fooodis logo to header
document.addEventListener('DOMContentLoaded', function() {
    // Create header logo HTML with correct path
    const headerLogoHTML = `
        <div class="header-fooodis-logo">
            <a href="https://fooodis.com/">
                <img src="assets/Artboard 17 copy 9.svg" alt="Fooodis Logo">
            </a>
        </div>
    `;
    
    // Create header logo container
    const headerLogoContainer = document.createElement('div');
    headerLogoContainer.innerHTML = headerLogoHTML;
    
    // Remove old header logo if exists
    const oldHeaderLogo = document.querySelector('.header-fooodis-logo');
    if (oldHeaderLogo) {
        oldHeaderLogo.remove();
    }
    
    // Add styles for header logo
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Header logo styles */
        .header-fooodis-logo {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            margin: 15px 20px;
            z-index: 1000;
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
    document.head.appendChild(styleElement);
    
    // Append header logo to body
    document.body.appendChild(headerLogoContainer);
});
