// Unified Footer Loader Script - For both English and Swedish versions
// Function to initialize the footer
function initFooter() {
    console.log('Initializing unified footer');
    // Only run once to prevent duplicate execution
    if (window.footerLoaded) {
        console.log('Footer already loaded, skipping');
        return;
    }
    window.footerLoaded = true;
    console.log('Setting up footer loader');
    
    // Detect language and path based on HTML lang attribute and URL
    const htmlLang = document.documentElement.lang || 'en';
    const isSvDir = htmlLang === 'sv' || window.location.pathname.includes('/sv/');
    const basePath = isSvDir ? '../' : '';
    
    // Add footer styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Fooodis Footer Styles */
        .fooodis-footer {
            z-index: 1;
            --footer-background: #1e2127;
            display: grid;
            position: relative;
            min-height: 12rem;
            background-color: #1e2127;
            width: 100%;
            margin: 0;
            padding: 0;
            margin-bottom: 40px;
        }
        
        .bubbles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1rem;
            background: #1e2127;
            filter: url("#blob");
            z-index: 1;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        .bubble {
            position: absolute;
            left: var(--position, 50%);
            background: #1e2127;
            border-radius: 100%;
            animation: bubble-size var(--time, 4s) ease-in infinite var(--delay, 0s),
                bubble-move var(--time, 4s) ease-in infinite var(--delay, 0s);
            transform: translate(-50%, 100%);
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        @keyframes bubble-size {
            0%, 75% {
                width: var(--size, 4rem);
                height: var(--size, 4rem);
            }
            100% {
                width: 0;
                height: 0;
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
        
        .footer-container {
            z-index: 15;
            position: relative;
            padding: 1rem;
            background: #1e2127;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
            width: 100%;
        }
        
        /* Desktop styles */
        @media (min-width: 769px) {
            .footer-container {
                padding: 0.75rem 1rem;
            }
            
            .footer-top {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                margin-bottom: 10px;
                width: 100%;
                text-align: left;
                padding-left: 25%;
            }
            
            .footer-logo {
                display: none;
                margin-bottom: 5px;
            }
            
            .footer-nav {
                width: 100%;
                display: flex;
                justify-content: flex-start;
                margin: 5px 0;
            }
            
            .footer-nav-list {
                display: flex;
                list-style: none;
                padding: 0;
                margin: 0;
                flex-wrap: wrap;
                justify-content: flex-start;
                align-items: center;
                gap: 5px;
            }
            
            .footer-nav-item {
                margin: 0 5px 0 0;
            }
            
            .footer-nav-item a {
                color: #ffffff;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                transition: color 0.3s;
                padding: 3px 5px;
            }
            
            .footer-bottom {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 10px;
                width: 50%;
                margin-left: auto;
                margin-right: auto;
            }
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
            .footer-container {
                padding: 0.5rem 1rem;
            }
            
            .footer-top {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                margin-bottom: 10px;
                width: 100%;
            }
            
            .footer-logo {
                display: none;
            }
            
            .footer-nav {
                width: 100%;
                overflow-x: auto;
                white-space: nowrap;
                margin: 5px 0;
            }
            
            .footer-nav-list {
                display: flex;
                list-style: none;
                padding: 0;
                margin: 0;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .footer-nav-item {
                margin: 0 3px;
            }
            
            .footer-nav-item a {
                color: #ffffff;
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
                transition: color 0.3s;
                padding: 3px;
            }
            
            .footer-bottom {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 10px;
                width: 100%;
            }
            
            .footer-powered-by {
                margin-bottom: 10px;
                text-align: center;
            }
            
            .logoland-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
        }
        
        .footer-powered-by {
            display: flex;
            justify-content: flex-start;
            align-items: center;
        }
        
        .logoland-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            gap: 5px;
        }
        
        .logoland-logo {
            height: 40px;
            max-width: 180px;
            object-fit: contain;
            margin-bottom: 5px;
        }
        
        .footer-powered-by p {
            margin: 0;
            font-size: 14px;
            color: #fff;
            text-align: left;
            white-space: nowrap;
        }
        
        .footer-powered-by p a {
            color: #fff;
            text-decoration: none;
        }
        
        .footer-social {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            align-items: center;
        }
        
        .social-link {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .social-link:hover {
            background-color: #aabd36;
            transform: translateY(-2px);
        }
        
        .social-link i {
            font-size: 14px;
        }
        
        .wave-animation {
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            height: 50px;
            overflow: hidden;
        }
        
        .wave-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: #1e2127;
            z-index: 1;
            clip-path: url(#wave-path);
        }
        
        .u-back-to-top {
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 50px;
            height: 50px;
            background-color: #aabd36;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            text-decoration: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
        }
        
        .u-back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .u-back-to-top img {
            width: 24px;
            height: 24px;
        }
        
        .x-logo {
            width: 18px;
            height: 18px;
            filter: brightness(0) invert(1);
        }
    `;
    document.head.appendChild(styleElement);
    
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
    
    // Pre-compute image paths with fallbacks
    const fooodisLogoPath = basePath + 'images/Artboard17copy9.svg';
    const logolandLogoPath = basePath + 'images/Artboard1.svg';
    const backToTopPath = basePath + 'images/e923cce1.png';
    const xLogoPath = basePath + 'assets/icons8-x-logo.svg';
    
    // Create footer HTML
    const footerHTML = `
        <footer class="fooodis-footer">
            <div class="bubbles"></div>
            <div class="footer-container">
                <div class="footer-top">
                    <div class="footer-logo">
                        <a href="https://fooodis.com/">
                            <img src="${fooodisLogoPath}" alt="Fooodis Logo" class="fooodis-logo-footer" style="max-width: 120px; height: auto;">
                        </a>
                    </div>
                    <nav class="footer-nav">
                        <ul class="footer-nav-list">
                            <li class="footer-nav-item"><a href="https://logoland.se" target="_blank" rel="noopener" data-lang-en="Service" data-lang-sv="Tjänst">Service</a></li>
                            <li class="footer-nav-item"><a href="${basePath}Contact.html" data-lang-en="Contact" data-lang-sv="Kontakt">Contact</a></li>
                            <li class="footer-nav-item"><a href="${basePath}Blog.html" data-lang-en="Blog" data-lang-sv="Blogg">Blog</a></li>
                            <li class="footer-nav-item"><a href="${basePath}Prices.html" data-lang-en="Price" data-lang-sv="Pris">Price</a></li>
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
                                <img src="${logolandLogoPath}" alt="LogoLand" class="logoland-logo">
                            </a>
                            <p data-lang-en="Powered by LogoLand with ❤️" data-lang-sv="Drivs av LogoLand med ❤️">Powered by <a href="https://logoland.se/" target="_blank" rel="noopener">LogoLand</a> with ❤️</p>
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
        <a href="#" class="u-back-to-top" title="Back to top of page">
            <img src="${backToTopPath}" alt="Back to top">
        </a>
    `;
    
    // Create wave container
    const waveContainer = document.createElement('div');
    waveContainer.innerHTML = waveHTML;
    
    // Create footer container
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = footerHTML;
    
    // Remove old footers
    const oldFooters = document.querySelectorAll('footer, .fooodis-footer, .u-footer');
    oldFooters.forEach(footer => {
        if (footer) {
            footer.remove();
        }
    });
    
    // We should NOT remove these sections on blog/gallery pages as they're part of the content
    // Only remove footer sections on non-blog/gallery pages
    const isBlogPage = window.location.pathname.includes('Blog.html') || document.querySelector('#sec-a448');
    
    if (!isBlogPage) {
        // Only remove these sections if we're not on a blog/gallery page
        const possibleFooterSections = document.querySelectorAll('section#sec-cc83, section#sec-2b12, section#sec-61a5');
        possibleFooterSections.forEach(section => {
            if (section) {
                section.remove();
            }
        });
    }
    
    // Append wave and footer to body
    document.body.appendChild(waveContainer);
    document.body.appendChild(footerContainer);
    
    // Add FontAwesome if not already present
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }
    
    // Apply language based on current page
    const currentLang = htmlLang || 'en';
    const footerElements = document.querySelectorAll('[data-lang-en], [data-lang-sv]');
    
    footerElements.forEach(el => {
        if (currentLang === 'sv' && el.hasAttribute('data-lang-sv')) {
            el.textContent = el.getAttribute('data-lang-sv');
        } else if (el.hasAttribute('data-lang-en')) {
            el.textContent = el.getAttribute('data-lang-en');
        }
    });
    
    // Add bubbles to the container
    const bubblesContainer = document.querySelector('.bubbles');
    if (bubblesContainer) {
        // Create bubbles
        for (let i = 0; i < 128; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // Randomize bubble properties
            const size = 2 + Math.random() * 4;
            const distance = 6 + Math.random() * 4;
            const position = -5 + Math.random() * 110;
            const time = 2 + Math.random() * 2;
            const delay = -1 * (2 + Math.random() * 2);
            
            // Set bubble properties using CSS variables
            bubble.style.setProperty('--size', size + 'rem');
            bubble.style.setProperty('--distance', distance + 'rem');
            bubble.style.setProperty('--position', position + '%');
            bubble.style.setProperty('--time', time + 's');
            bubble.style.setProperty('--delay', delay + 's');
            
            bubblesContainer.appendChild(bubble);
        }
    }
    
    // Create wave effect
    const createWaveEffect = function() {
        const waveAnimation = document.querySelector('.wave-animation');
        if (waveAnimation) {
            // Set wave properties
            waveAnimation.style.backgroundColor = '#1e2127';
            
            // Adjust wave height based on screen size
            if (window.innerWidth <= 768) {
                waveAnimation.style.height = '40px';
            } else {
                waveAnimation.style.height = '50px';
            }
        }
    };
    
    // Initialize back-to-top button
    const backToTopButton = document.querySelector('.u-back-to-top');
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
    
    // Run on load and on resize
    createWaveEffect();
    window.addEventListener('resize', createWaveEffect);
}

// Initialize the footer on both DOMContentLoaded and window.onload for better compatibility
document.addEventListener('DOMContentLoaded', initFooter);

// Backup initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initFooter, 100);
}
