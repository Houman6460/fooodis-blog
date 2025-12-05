/**
 * Shared Header Loader
 * Loads the exact header from homepage for consistency across all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    // Header HTML - exact copy from homepage
    const headerHTML = `
    <header class="fooodis-header">
        <div class="header-container">
            <a href="https://fooodis.com/" class="logo-container">
                <img src="images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo">
            </a>
            
            <div class="header-right">
                <div class="language-selector">
                    <a href="#" class="flag-link" data-lang="en"><img src="assets/flags/uk-flag.svg" alt="English" class="flag-icon"></a>
                    <a href="#" class="flag-link" data-lang="sv"><img src="assets/flags/sweden-flag.svg" alt="Swedish" class="flag-icon"></a>
                </div>
                
                <nav class="main-nav">
                    <ul class="nav-list">
                        <li class="nav-item"><a href="https://logoland.se" target="_blank" rel="noopener">Service</a></li>
                        <li class="nav-item"><a href="Contact.html">Contact</a></li>
                        <li class="nav-item"><a href="Support.html">Support</a></li>
                        <li class="nav-item"><a href="blog.html">Blog</a></li>
                        <li class="nav-item"><a href="FEBlog.html">F.E.Blog</a></li>
                        <li class="nav-item"><a href="index.html#limited-time-offer-en">Price</a></li>
                        <li class="nav-item"><a href="https://fooodis.com/new/restaurant/register" target="_blank" rel="noopener">Registrar</a></li>
                        <li class="nav-item"><a href="https://demo.fooodis.com/home" target="_blank" rel="noopener">Demo</a></li>
                        <li class="nav-item"><a href="https://fooodis.com/new/restaurant/login" target="_blank" rel="noopener">Login</a></li>
                    </ul>
                </nav>
                
                <button aria-label="Toggle menu" class="hamburger-menu" id="hamburger-button">
                    <svg class="ham hamRotate ham1" viewBox="0 0 100 100">
                        <path class="line top" d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40" />
                        <path class="line middle" d="m 30,50 h 40" />
                        <path class="line bottom" d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40" />
                    </svg>
                </button>
            </div>
        </div>
    </header>
    
    <div class="mobile-nav">
        <div class="mobile-nav-logo">
            <a href="https://fooodis.com/">
                <img src="images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo-mobile">
            </a>
        </div>
        <ul class="mobile-nav-list">
            <li class="mobile-nav-item"><a href="https://logoland.se" target="_blank" rel="noopener">SERVICE</a></li>
            <li class="mobile-nav-item"><a href="Contact.html">CONTACT</a></li>
            <li class="mobile-nav-item"><a href="Support.html">SUPPORT</a></li>
            <li class="mobile-nav-item"><a href="blog.html">BLOG</a></li>
            <li class="mobile-nav-item"><a href="FEBlog.html">F.E.BLOG</a></li>
            <li class="mobile-nav-item"><a href="index.html#limited-time-offer-en">PRICE</a></li>
            <li class="mobile-nav-item"><a href="https://fooodis.com/new/restaurant/register" target="_blank" rel="noopener">REGISTRAR</a></li>
            <li class="mobile-nav-item"><a href="https://demo.fooodis.com/home" target="_blank" rel="noopener">DEMO</a></li>
            <li class="mobile-nav-item"><a href="https://fooodis.com/new/restaurant/login" target="_blank" rel="noopener">LOGIN</a></li>
        </ul>
    </div>
    `;
    
    // Find existing header and replace it, or insert at beginning of body
    const existingHeader = document.querySelector('.fooodis-header');
    const existingMobileNav = document.querySelector('.mobile-nav');
    
    if (existingHeader) {
        existingHeader.remove();
    }
    if (existingMobileNav) {
        existingMobileNav.remove();
    }
    
    // Insert header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Initialize hamburger menu
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', function() {
            const ham = this.querySelector('.ham');
            if (ham) ham.classList.toggle('active');
            mobileNav.classList.toggle('show');
            document.body.style.overflow = mobileNav.classList.contains('show') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav-list a').forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('show');
            document.body.style.overflow = '';
            const ham = document.querySelector('.hamburger-menu .ham');
            if (ham) ham.classList.remove('active');
        });
    });
});
