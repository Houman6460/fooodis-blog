// Footer Loader Script - No Header Logo Version
document.addEventListener('DOMContentLoaded', function() {
    // Only run once to prevent duplicate execution
    if (window.footerLoaded) return;
    window.footerLoaded = true;
    
    // Add footer styles directly to the head
    function addFooterStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
/* Fooodis Footer Styles */
.fooodis-footer {
    z-index: 1;
    --footer-background: #1d2029;
    display: grid;
    position: relative;
    min-height: 12rem;
    background-color: #1d2029;
    padding: 2rem 0;
}

.bubbles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1rem;
    background: #1d2029;
    filter: url("#blob");
    z-index: 1;
}

.bubble {
    position: absolute;
    left: var(--position, 50%);
    background: #1d2029;
    border-radius: 100%;
    animation: bubble-size var(--time, 4s) ease-in infinite var(--delay, 0s),
        bubble-move var(--time, 4s) ease-in infinite var(--delay, 0s);
    transform: translate(-50%, 100%);
}

.footer-container {
    z-index: 15;
    position: relative;
    padding: 2rem;
    background: #1d2029;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
}

.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.footer-logo {
    display: flex;
    align-items: center;
}

.fooodis-logo-footer {
    width: 180px;
    height: auto;
}

.footer-nav {
    display: flex;
}

.footer-nav-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-nav-item {
    margin-right: 1.5rem;
}

.footer-nav-item:last-child {
    margin-right: 0;
}

.footer-nav-item a {
    color: #ffffff;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    transition: color 0.3s;
}

.footer-nav-item a:hover {
    color: #e8f24c;
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-powered-by {
    display: flex;
    align-items: center;
}

.logoland-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.logoland-logo {
    width: 180px;
    height: auto;
    margin-bottom: 0.5rem;
}

.footer-powered-by p {
    margin: 0;
    font-size: 14px;
    color: #fff;
}

.footer-social {
    display: flex;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #252830;
    border-radius: 50%;
    margin-right: 1rem;
    transition: background-color 0.3s ease;
}

.social-link:last-child {
    margin-right: 0;
}

.social-link:hover {
    background-color: #e8f24c;
}

.social-link i {
    font-size: 18px;
    color: #fff;
}

.social-link:hover i {
    color: #1d2029;
}

.back-to-top-button {
    height: 50px;
    width: 50px;
    right: 20px;
    bottom: 20px;
    padding: 12px;
    background-color: #1d2029;
    border: 2px solid #e8f24c;
    border-radius: 50%;
    position: fixed;
    z-index: 100;
    display: none;
    cursor: pointer;
    transition: background-color 0.3s, opacity 0.3s;
    text-decoration: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    align-items: center;
    justify-content: center;
    opacity: 0.85;
}

.back-to-top-button.visible {
    display: flex;
}

.back-to-top-button:hover {
    background-color: #2a2d36;
    opacity: 1;
}

.back-to-top-button img {
    width: 24px;
    height: 24px;
}

@keyframes bubble-size {
    0%, 75% {
        width: var(--size, 4rem);
        height: var(--size, 4rem);
    }
    100% {
        width: 0rem;
        height: 0rem;
    }
}

@keyframes bubble-move {
    0% {
        bottom: -4rem;
    }
    100% {
        bottom: var(--distance, 10rem);
    }
}

/* Mobile styles */
@media (max-width: 768px) {
    .footer-container {
        padding: 1rem;
    }
    
    .footer-top {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .footer-logo {
        margin-bottom: 1rem;
    }
    
    .footer-nav {
        margin-bottom: 1rem;
    }
    
    .footer-nav-list {
        flex-direction: column;
        align-items: center;
    }
    
    .footer-nav-item {
        margin-right: 0;
        margin-bottom: 0.5rem;
    }
    
    .footer-bottom {
        flex-direction: column;
    }
    
    .footer-powered-by {
        margin-bottom: 1rem;
    }
    
    .logoland-container {
        align-items: center;
    }
    
    /* Bottom section with logo and social icons */
    .footer-bottom {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    /* LogoLand section */
    .footer-powered-by {
        margin-bottom: 1.5rem;
    }
    
    .logoland-container {
        align-items: center;
        text-align: center;
    }
    
    .logoland-logo {
        width: 240px; /* Larger logo to match source */
        margin-bottom: 0.75rem;
    }
    
    /* Social icons */
    .footer-social {
        justify-content: center;
    }
}

/* SVG filter for blob effect */
.svg-filters {
    position: fixed;
    top: 100vh;
    left: 0;
    z-index: -1;
}

/* Wave animation styles */
.wave-animation {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: #aabd36; /* Yellow-green color from source */
    z-index: 0;
}

.wave-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: #1d2029;
    z-index: 1;
    clip-path: url(#wave-path);
}
        `;
        document.head.appendChild(styleElement);
    }
    
    // Function to load the footer
    function loadFooter() {
        // Add footer styles
        addFooterStyles();
        
        // Create SVG filter for bubble effect
        const svgFilter = document.createElement('div');
        svgFilter.className = 'svg-filters';
        svgFilter.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation"><defs><filter id="blob" aria-hidden="true"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob"></feColorMatrix></filter><clipPath id="wave-path"><path d="M0,40 C100,70 300,0 500,40 C700,80 900,10 1100,50 C1300,90 1500,20 1700,60 L1700,100 L0,100 Z"></path></clipPath></defs></svg>';
        document.body.appendChild(svgFilter);
        
        // Create wave animation HTML
        const waveHTML = `
            <div class="wave-animation">
                <div class="wave-bottom"></div>
            </div>
        `;
        
        // Create footer HTML
        const footerHTML = `
            <footer class="fooodis-footer">
                <div class="bubbles"></div>
                <div class="footer-container">
                    <div class="footer-top">
                        <div class="footer-logo">
                            <a href="https://fooodis.com/">
                                <img src="assets/Artboard 17 copy 9.svg" alt="Fooodis Logo" class="fooodis-logo-footer">
                            </a>
                        </div>
                        <nav class="footer-nav">
                            <ul class="footer-nav-list">
                                <li class="footer-nav-item"><a href="https://logoland.se" target="_blank" rel="noopener" data-lang-en="Service" data-lang-sv="Tjänst">Service</a></li>
                                <li class="footer-nav-item"><a href="Contact.html" data-lang-en="Contact" data-lang-sv="Kontakt">Contact</a></li>
                                <li class="footer-nav-item"><a href="Blog.html" data-lang-en="Blog" data-lang-sv="Blogg">Blog</a></li>
                                <li class="footer-nav-item"><a href="Prices.html" data-lang-en="Price" data-lang-sv="Pris">Price</a></li>
                                <li class="footer-nav-item"><a href="https://fooodis.com/new/restaurant/register" target="_blank" rel="noopener" data-lang-en="Registrar" data-lang-sv="Registrera">Registrar</a></li>
                                <li class="footer-nav-item"><a href="https://demo.fooodis.com/home" target="_blank" rel="noopener" data-lang-en="Demo" data-lang-sv="Demo">Demo</a></li>
                                <li class="footer-nav-item"><a href="https://fooodis.com/login" target="_blank" rel="noopener" data-lang-en="Login" data-lang-sv="Logga in">Login</a></li>
                            </ul>
                        </nav>
                    </div>
                    <div class="footer-bottom">
                        <div class="footer-powered-by">
                            <div class="logoland-container">
                                <a href="https://logoland.se/" target="_blank" rel="noopener">
                                    <img src="images/Artboard1.svg" alt="LogoLand" class="logoland-logo">
                                </a>
                                <p data-lang-en="Powered by LogoLand with ❤️" data-lang-sv="Drivs av LogoLand med ❤️">Powered by LogoLand with ❤️</p>
                            </div>
                        </div>
                        <div class="footer-social">
                            <a href="https://www.linkedin.com/company/102443279/admin/dashboard/" target="_blank" rel="noopener noreferrer" class="social-link linkedin" title="Visit Fooodis on LinkedIn">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61552797450099" target="_blank" rel="noopener noreferrer" class="social-link facebook" title="Visit Fooodis on Facebook">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://www.instagram.com/fooodis.se/" target="_blank" rel="noopener noreferrer" class="social-link instagram" title="Visit Fooodis on Instagram">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="https://x.com/Fooodis" target="_blank" rel="noopener noreferrer" class="social-link twitter" title="Visit Fooodis on X (Twitter)">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://www.youtube.com/@Fooodis" target="_blank" rel="noopener noreferrer" class="social-link youtube" title="Visit Fooodis on YouTube">
                                <i class="fab fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
            <a href="#" class="back-to-top-button" title="Back to top of page">
                <img src="images/e923cce1.png" alt="Back to top">
            </a>
        `;
        
        // Create wave container
        const waveContainer = document.createElement('div');
        waveContainer.innerHTML = waveHTML;
        
        // Create footer container
        const footerContainer = document.createElement('div');
        footerContainer.innerHTML = footerHTML;
        
        // Remove old footer if exists
        const oldFooter = document.querySelector('footer');
        if (oldFooter) {
            oldFooter.remove();
        }
        
        // Remove any existing header logo (if it was added previously)
        const oldHeaderLogo = document.querySelector('.header-fooodis-logo');
        if (oldHeaderLogo) {
            oldHeaderLogo.remove();
        }
        
        // Append wave and footer to body
        document.body.appendChild(waveContainer);
        document.body.appendChild(footerContainer);
        
        // Add bubbles to the container
        const bubblesContainer = document.querySelector('.bubbles');
        if (bubblesContainer) {
            for (let i = 0; i < 128; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                
                // Randomize bubble properties
                const size = 2 + Math.random() * 4;
                const distance = 6 + Math.random() * 4;
                const position = -5 + Math.random() * 110;
                const time = 2 + Math.random() * 2;
                const delay = -1 * (2 + Math.random() * 2);
                
                // Set bubble styles
                bubble.style.setProperty('--size', `${size}rem`);
                bubble.style.setProperty('--distance', `${distance}rem`);
                bubble.style.setProperty('--position', `${position}%`);
                bubble.style.setProperty('--time', `${time}s`);
                bubble.style.setProperty('--delay', `${delay}s`);
                
                bubblesContainer.appendChild(bubble);
            }
        }
        
        // Initialize the back-to-top button functionality
        const backToTopButton = document.querySelector('.back-to-top-button');
        if (backToTopButton) {
            // Show button when user scrolls down
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            });
            
            // Scroll to top when button is clicked
            backToTopButton.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    // Function to check if mobile view and apply appropriate styles
    function checkMobile() {
        const isMobile = window.innerWidth <= 768;
        
        // Get footer elements
        const footerNav = document.querySelector('.footer-nav');
        const footerNavList = document.querySelector('.footer-nav-list');
        const footerNavItems = document.querySelectorAll('.footer-nav-item');
        const footerBottom = document.querySelector('.footer-bottom');
        const footerPoweredBy = document.querySelector('.footer-powered-by');
        const footerSocial = document.querySelector('.footer-social');
        
        if (isMobile) {
            // Mobile view
            if (footerNav) {
                footerNav.style.width = '100%';
                footerNav.style.display = 'flex';
                footerNav.style.justifyContent = 'center';
                footerNav.style.margin = '10px 0';
                footerNav.style.overflowX = 'auto';
                footerNav.style.whiteSpace = 'nowrap';
            }
            
            if (footerNavList) {
                footerNavList.style.display = 'flex';
                footerNavList.style.flexDirection = 'row';
                footerNavList.style.flexWrap = 'nowrap';
                footerNavList.style.justifyContent = 'center';
                footerNavList.style.width = '100%';
                footerNavList.style.textAlign = 'center';
            }
            
            footerNavItems.forEach(item => {
                item.style.display = 'inline-block';
                item.style.width = 'auto';
                item.style.margin = '0';
                item.style.padding = '0';
                item.style.textAlign = 'center';
                
                const link = item.querySelector('a');
                if (link) {
                    link.style.fontSize = '14px';
                    link.style.padding = '3px 5px';
                    link.style.whiteSpace = 'nowrap';
                    link.style.display = 'inline-block';
                    link.style.textAlign = 'center';
                }
            });
            
            if (footerBottom) {
                footerBottom.style.flexDirection = 'column';
                footerBottom.style.alignItems = 'center';
                footerBottom.style.gap = '10px';
                footerBottom.style.width = '80%';
                footerBottom.style.margin = '10px auto 0';
            }
            
            if (footerPoweredBy) {
                footerPoweredBy.style.width = '100%';
                footerPoweredBy.style.display = 'flex';
                footerPoweredBy.style.justifyContent = 'center';
                footerPoweredBy.style.marginBottom = '5px';
                
                const poweredByText = footerPoweredBy.querySelector('p');
                if (poweredByText) {
                    poweredByText.style.whiteSpace = 'nowrap'; // Prevent text wrapping
                    poweredByText.style.textAlign = 'center';
                }
            }
            
            if (footerSocial) {
                footerSocial.style.display = 'flex';
                footerSocial.style.justifyContent = 'center';
                footerSocial.style.width = '100%';
                footerSocial.style.marginTop = '5px';
            }
        } else {
            // Desktop view
            if (footerNav) {
                footerNav.style.width = 'auto';
                footerNav.style.display = 'flex';
                footerNav.style.justifyContent = 'flex-end';
                footerNav.style.margin = '0';
                footerNav.style.overflowX = 'visible';
                footerNav.style.whiteSpace = 'normal';
            }
            
            if (footerNavList) {
                footerNavList.style.display = 'flex';
                footerNavList.style.flexDirection = 'row';
                footerNavList.style.flexWrap = 'wrap';
                footerNavList.style.justifyContent = 'flex-end';
                footerNavList.style.width = 'auto';
                footerNavList.style.textAlign = 'right';
            }
            
            footerNavItems.forEach(item => {
                item.style.display = 'block';
                item.style.width = 'auto';
                item.style.margin = '0 0 0 1.5rem';
                item.style.padding = '0';
                item.style.textAlign = 'right';
                
                const link = item.querySelector('a');
                if (link) {
                    link.style.fontSize = '16px';
                    link.style.padding = '0';
                    link.style.whiteSpace = 'normal';
                    link.style.display = 'block';
                    link.style.textAlign = 'right';
                }
            });
            
            if (footerBottom) {
                footerBottom.style.flexDirection = 'row';
                footerBottom.style.justifyContent = 'space-between';
                footerBottom.style.alignItems = 'center';
                footerBottom.style.gap = '0';
                footerBottom.style.width = '100%';
                footerBottom.style.margin = '10px 0 0';
            }
            
            if (footerPoweredBy) {
                footerPoweredBy.style.width = 'auto';
                footerPoweredBy.style.display = 'flex';
                footerPoweredBy.style.justifyContent = 'flex-start';
                footerPoweredBy.style.marginBottom = '0';
                
                const poweredByText = footerPoweredBy.querySelector('p');
                if (poweredByText) {
                    poweredByText.style.whiteSpace = 'nowrap'; // Prevent text wrapping
                    poweredByText.style.textAlign = 'left';
                }
            }
            
            if (footerSocial) {
                footerSocial.style.display = 'flex';
                footerSocial.style.justifyContent = 'flex-end';
                footerSocial.style.width = 'auto';
                footerSocial.style.marginTop = '0';
            }
        }
    }
    
    // Run on load and on resize
    loadFooter();
    checkMobile();
    window.addEventListener('resize', checkMobile);
});
