/**
 * Shared Navigation - Header and Footer with Admin Login
 * Injects consistent header/footer across all pages
 */

const SharedNavigation = {
    // Navigation items (English)
    navItemsEN: [
        { href: "https://logoland.se", text: "Service", external: true },
        { href: "Contact.html", text: "Contact" },
        { href: "Support.html", text: "Support" },
        { href: "FEBlog.html", text: "Blog" },
        { href: "Blog.html", text: "F.E.Blog" },
        { href: "index.html#limited-time-offer-en", text: "Price" },
        { href: "https://fooodis.com/new/restaurant/register", text: "Register", external: true },
        { href: "https://demo.fooodis.com/home", text: "Demo", external: true },
        { href: "https://fooodis.com/new/restaurant/login", text: "Login", external: true }
    ],
    
    // Navigation items (Swedish)
    navItemsSV: [
        { href: "https://logoland.se", text: "Tjänst", external: true },
        { href: "Contact.html", text: "Kontakt" },
        { href: "Support.html", text: "Support" },
        { href: "FEBlog.html", text: "Blogg" },
        { href: "Blog.html", text: "F.E.Blogg" },
        { href: "index.html#limited-time-offer-sv", text: "Pris" },
        { href: "https://fooodis.com/new/restaurant/register", text: "Registrera", external: true },
        { href: "https://demo.fooodis.com/home", text: "Demo", external: true },
        { href: "https://fooodis.com/new/restaurant/login", text: "Logga in", external: true }
    ],
    
    // Footer extra items
    footerExtraItems: [
        { href: "Impressum.html", textEN: "Impressum", textSV: "Impressum" },
        { href: "Policy.html", textEN: "Privacy Policy", textSV: "Integritetspolicy" },
        { href: "login.html", textEN: "Admin", textSV: "Admin", class: "admin-link" }
    ],

    /**
     * Get current language
     */
    getCurrentLanguage: function() {
        return localStorage.getItem('fooodis_preferred_language') || 
               localStorage.getItem('preferredLanguage') || 
               document.documentElement.lang || 'en';
    },

    /**
     * Generate header HTML
     */
    generateHeader: function(basePath = '') {
        const lang = this.getCurrentLanguage();
        const navItems = lang === 'sv' ? this.navItemsSV : this.navItemsEN;
        
        return `
        <header class="fooodis-header" style="padding: 20px 0;">
            <div class="header-container">
                <a href="https://fooodis.com/" class="logo-container">
                    <img src="${basePath}images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo">
                </a>
                
                <div class="header-right">
                    <!-- Language flags -->
                    <div class="language-selector">
                        <a href="#" class="flag-link" data-lang="en"><img src="${basePath}assets/flags/uk-flag.svg" alt="English" class="flag-icon"></a>
                        <a href="#" class="flag-link" data-lang="sv"><img src="${basePath}assets/flags/sweden-flag.svg" alt="Swedish" class="flag-icon"></a>
                    </div>
                    
                    <!-- Navigation for desktop -->
                    <nav class="main-nav">
                        <ul class="nav-list">
                            ${navItems.map(item => `
                                <li class="nav-item">
                                    <a href="${item.href}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>${item.text}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </nav>
                    
                    <!-- Hamburger menu for mobile -->
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
        
        <!-- Mobile navigation menu -->
        <div class="mobile-nav">
            <div class="mobile-nav-logo">
                <a href="https://fooodis.com/">
                    <img src="${basePath}images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo-mobile">
                </a>
            </div>
            <ul class="mobile-nav-list">
                ${navItems.map(item => `
                    <li class="mobile-nav-item">
                        <a href="${item.href}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>${item.text.toUpperCase()}</a>
                    </li>
                `).join('')}
            </ul>
        </div>`;
    },

    /**
     * Generate footer HTML with Admin link
     */
    generateFooter: function(basePath = '') {
        const lang = this.getCurrentLanguage();
        const navItems = lang === 'sv' ? this.navItemsSV : this.navItemsEN;
        
        return `
        <footer class="fooodis-footer">
            <!-- Bubbles animation container -->
            <div class="bubbles" id="footer-bubbles"></div>
            
            <div class="footer-container">
                <div class="footer-top">
                    <div class="footer-logo">
                        <a href="https://fooodis.com/">
                            <img src="${basePath}images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo-footer" style="max-width: 120px; height: auto;">
                        </a>
                    </div>
                    <nav class="footer-nav">
                        <ul class="footer-nav-list">
                            ${navItems.map(item => `
                                <li class="footer-nav-item">
                                    <a href="${item.href}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>${item.text}</a>
                                </li>
                            `).join('')}
                            ${this.footerExtraItems.map(item => `
                                <li class="footer-nav-item ${item.class || ''}">
                                    <a href="${basePath}${item.href}">${lang === 'sv' ? item.textSV : item.textEN}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </nav>
                </div>
                
                <div class="footer-bottom">
                    <div class="footer-powered-by">
                        <div class="logoland-container">
                            <a href="https://logoland.se/" target="_blank" rel="noopener">
                                <img src="${basePath}images/Artboard1.svg" alt="LogoLand" class="logoland-logo">
                            </a>
                            <p>Powered by LogoLand with ❤️</p>
                        </div>
                    </div>
                    <div class="footer-social" style="position: relative; z-index: 15;">
                        <a href="https://www.linkedin.com/company/102443279/" target="_blank" rel="noopener noreferrer" class="social-link linkedin" title="LinkedIn">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61552797450099" target="_blank" rel="noopener noreferrer" class="social-link facebook" title="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.instagram.com/fooodis.se/" target="_blank" rel="noopener noreferrer" class="social-link instagram" title="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="https://x.com/Fooodis" target="_blank" rel="noopener noreferrer" class="social-link twitter" title="X (Twitter)">
                            <img src="${basePath}assets/icons8-x-logo.svg" alt="X" class="x-logo" width="18" height="18">
                        </a>
                        <a href="https://www.youtube.com/@Fooodis" target="_blank" rel="noopener noreferrer" class="social-link youtube" title="YouTube">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
        
        <!-- Back to top button -->
        <a href="#" class="u-back-to-top u-border-2 u-custom-color-2 u-icon-circle u-opacity u-opacity-85 u-text-white" title="Back to top">
            <img src="${basePath}images/e923cce1.png" alt="Back to top">
        </a>
        
        <!-- SVG Filter for bubble effect -->
        <svg class="svg-filters" aria-hidden="true" focusable="false" role="presentation">
            <defs>
                <filter id="blob" aria-hidden="true">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob"></feColorMatrix>
                </filter>
            </defs>
        </svg>`;
    },

    /**
     * Initialize mobile menu functionality
     */
    initMobileMenu: function() {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (hamburgerMenu && mobileNav) {
            hamburgerMenu.addEventListener('click', function() {
                this.querySelector('.ham').classList.toggle('active');
                mobileNav.classList.toggle('show');
                document.body.style.overflow = mobileNav.classList.contains('show') ? 'hidden' : '';
            });
            
            // Close on link click
            document.querySelectorAll('.mobile-nav-list a').forEach(link => {
                link.addEventListener('click', function() {
                    mobileNav.classList.remove('show');
                    document.body.style.overflow = '';
                    hamburgerMenu.querySelector('.ham')?.classList.remove('active');
                });
            });
        }
    },

    /**
     * Initialize footer bubbles animation
     */
    initFooterBubbles: function() {
        const bubblesContainer = document.getElementById('footer-bubbles');
        if (!bubblesContainer || bubblesContainer.children.length > 0) return;
        
        for (let i = 0; i < 128; i++) {
            const size = 2 + Math.random() * 4;
            const distance = 6 + Math.random() * 4;
            const position = -5 + Math.random() * 110;
            const time = 2 + Math.random() * 2;
            const delay = -1 * (2 + Math.random() * 2);
            
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.style.cssText = `--size:${size}rem; --distance:${distance}rem; --position:${position}%; --time:${time}s; --delay:${delay}s;`;
            bubblesContainer.appendChild(bubble);
        }
    },

    /**
     * Initialize language switching
     */
    initLanguageSwitcher: function() {
        const flagLinks = document.querySelectorAll('.flag-link');
        
        flagLinks.forEach(flag => {
            flag.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = flag.getAttribute('data-lang');
                localStorage.setItem('fooodis_preferred_language', lang);
                localStorage.setItem('preferredLanguage', lang);
                document.documentElement.lang = lang;
                
                // Reload to apply language change
                window.location.reload();
            });
        });
    },

    /**
     * Initialize all navigation functionality
     */
    init: function() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initMobileMenu();
            this.initFooterBubbles();
            this.initLanguageSwitcher();
        });
    }
};

// Auto-initialize
SharedNavigation.init();
