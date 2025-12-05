// Cookie Consent Banner Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('fooodis_cookies_accepted');
    
    if (!cookiesAccepted) {
        // Create banner element if it doesn't exist yet
        if (!document.querySelector('.cookie-consent-banner')) {
            createCookieBanner();
        }
        
        // Show the banner with a slight delay
        setTimeout(() => {
            document.querySelector('.cookie-consent-banner').classList.add('show');
        }, 1000);
    }
    
    // Function to create the cookie consent banner
    function createCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        
        // Get current language or default to English
        const currentLang = document.body.classList.contains('lang-sv') ? 'sv' : 'en';
        
        // Banner content
        banner.innerHTML = `
            <div class="cookie-consent-text">
                <p class="lang-en cookie-content">We use cookies to enhance your experience on our website. By continuing to browse, you agree to our <a href="Policy.html" class="cookie-consent-link">Cookie Policy</a>.</p>
                <p class="lang-sv cookie-content">Vi använder cookies för att förbättra din upplevelse på vår webbplats. Genom att fortsätta bläddra godkänner du vår <a href="Policy.html" class="cookie-consent-link">Cookiepolicy</a>.</p>
            </div>
            <div class="cookie-consent-actions">
                <a href="Policy.html" class="cookie-consent-link">
                    <span class="lang-en cookie-content">Learn more</span>
                    <span class="lang-sv cookie-content">Läs mer</span>
                </a>
                <button type="button" class="cookie-consent-accept">
                    <span class="lang-en cookie-content">Accept</span>
                    <span class="lang-sv cookie-content">Godkänn</span>
                </button>
            </div>
        `;
        
        // Append banner to body
        document.body.appendChild(banner);
        
        // Show only content for current language
        document.body.classList.add(`lang-${currentLang}`);
        
        // Add click event to accept button
        const acceptButton = banner.querySelector('.cookie-consent-accept');
        acceptButton.addEventListener('click', function() {
            acceptCookies();
        });
    }
    
    // Function to handle cookie acceptance
    function acceptCookies() {
        // Save acceptance to localStorage
        localStorage.setItem('fooodis_cookies_accepted', 'true');
        
        // Hide the banner with animation
        const banner = document.querySelector('.cookie-consent-banner');
        banner.classList.remove('show');
        
        // Remove banner after animation completes
        setTimeout(() => {
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 500); // Match the CSS transition time
    }
    
    // Listen for language changes to update cookie banner language
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class' && 
                (document.body.classList.contains('lang-en') || 
                 document.body.classList.contains('lang-sv'))) {
                
                // Update cookie banner language if it exists
                const banner = document.querySelector('.cookie-consent-banner');
                if (banner) {
                    // No need to do anything as CSS will handle the visibility
                }
            }
        });
    });
    
    // Start observing body class changes
    observer.observe(document.body, { attributes: true });
});
