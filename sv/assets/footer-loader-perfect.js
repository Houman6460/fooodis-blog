// Footer Loader Script - Perfect Match to Reference Design
document.addEventListener('DOMContentLoaded', function() {
    // Only run once to prevent duplicate execution
    if (window.footerLoaded) return;
    window.footerLoaded = true;
    
    // Add footer styles to match reference exactly
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Fooodis Footer Styles - Perfect Match to Reference */
        .fooodis-footer {
            z-index: 1;
            --footer-background: #1e2127;
            display: grid;
            position: relative;
            min-height: 12rem;
            background-color: #1e2127;
            width: 100%;
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
        
        .footer-container {
            z-index: 15;
            position: relative;
            padding: 2rem;
            background: #1e2127;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
            width: 100%;
        }
        
        .footer-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            width: 100%;
        }
        
        .footer-logo a {
            display: block;
        }
        
        .fooodis-logo-footer {
            height: 30px;
            width: auto;
            vertical-align: middle;
        }
        
        .footer-nav {
            display: block;
        }
        
        .footer-nav-list {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }
        
        .footer-nav-item {
            margin: 0 15px;
        }
        
        .footer-nav-item a {
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .footer-nav-item a:hover, .footer-nav-item a.active {
            color: #e8f24c;
        }
        
        .footer-bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 20px;
            width: 100%;
        }
        
        .footer-powered-by {
            display: flex;
            align-items: center;
        }
        
        .logoland-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .logoland-logo {
            height: 40px;
            max-width: 180px;
            object-fit: contain;
            object-position: left;
            margin-bottom: 8px;
        }
        
        .footer-powered-by p {
            margin: 0;
            font-size: 14px;
            color: #fff;
            text-align: left;
        }
        
        .footer-social {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: #333;
            border-radius: 50%;
            transition: background-color 0.3s ease;
        }
        
        .social-link:hover {
            background-color: #ffcc00;
        }
        
        .social-link i {
            font-size: 18px;
            color: #fff;
        }
        
        .social-link:hover i {
            color: #1e2127;
        }
        
        .x-logo {
            width: 18px;
            height: 18px;
        }
        
        .u-back-to-top {
            height: 50px;
            width: 50px;
            right: 20px;
            bottom: 20px;
            padding: 12px;
            background-color: #1e2127;
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
        
        .u-back-to-top.visible {
            display: flex;
        }
        
        .u-back-to-top:hover {
            background-color: #2a2d36;
            opacity: 1 !important;
        }
        
        .u-back-to-top img {
            width: 24px;
            height: 24px;
        }
        
        /* Mobile styles - Exact match to reference */
        @media (max-width: 768px) {
            .footer-top {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .footer-logo {
                display: none; /* Hide logo on mobile as per reference */
            }
            
            .footer-nav-list {
                flex-direction: column;
                justify-content: center;
                width: 100%;
            }
            
            .footer-nav-item {
                margin: 5px 0;
                width: 100%;
                text-align: center;
            }
            
            .footer-nav-item a {
                font-size: 16px;
                display: inline-block;
                padding: 5px 0;
            }
            
            .footer-bottom {
                flex-direction: column;
                gap: 20px;
            }
            
            .footer-powered-by {
                width: 100%;
                justify-content: center;
            }
            
            .logoland-container {
                align-items: center;
            }
            
            .footer-powered-by p {
                text-align: center;
            }
            
            .footer-social {
                justify-content: center;
                width: 100%;
                margin-top: 0;
            }
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
        
        /* SVG filter for blob effect */
        .svg-filters {
            position: fixed;
            top: 100vh;
            left: 0;
            z-index: -1;
        }
    `;
    document.head.appendChild(styleElement);
    
    // Create SVG filter for bubble effect
    const svgFilter = document.createElement('div');
    svgFilter.className = 'svg-filters';
    svgFilter.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation"><defs><filter id="blob" aria-hidden="true"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob"></feColorMatrix></filter></defs></svg>';
    document.body.appendChild(svgFilter);
    
    // Create footer HTML - Perfect match to reference
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
        <a href="#" class="u-back-to-top" title="Back to top of page">
            <img src="images/e923cce1.png" alt="Back to top">
        </a>
    `;
    
    // Create footer container
    const footerContainer = document.createElement('div');
    footerContainer.innerHTML = footerHTML;
    
    // Remove old footer if exists
    const oldFooter = document.querySelector('footer');
    if (oldFooter) {
        oldFooter.remove();
    }
    
    // Append footer to body
    document.body.appendChild(footerContainer);
    
    // Add bubbles to the container - ensure they work on mobile
    const bubblesContainer = document.querySelector('.bubbles');
    if (bubblesContainer) {
        // Force the bubbles container to be visible
        bubblesContainer.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; height: 1rem; background: #1e2127; filter: url("#blob"); z-index: 1; display: block !important; visibility: visible !important; opacity: 1 !important;';
        
        // Create bubbles - exactly 128 as in reference
        for (let i = 0; i < 128; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // Randomize bubble properties - matched to reference
            const size = 2 + Math.random() * 4;
            const distance = 6 + Math.random() * 4;
            const position = -5 + Math.random() * 110;
            const time = 2 + Math.random() * 2;
            const delay = -1 * (2 + Math.random() * 2);
            
            // Set bubble styles with inline styles to ensure they work on all devices
            bubble.style.cssText = `
                position: absolute !important;
                left: ${position}% !important;
                background: #1e2127 !important;
                border-radius: 100% !important;
                width: ${size}rem !important;
                height: ${size}rem !important;
                animation: bubble-size ${time}s ease-in infinite ${delay}s, bubble-move ${time}s ease-in infinite ${delay}s !important;
                transform: translate(-50%, 100%) !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 10 !important;
            `;
            
            bubblesContainer.appendChild(bubble);
        }
    }
    
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
    
    // Ensure the wave animation is visible on mobile
    const ensureWaveVisibility = function() {
        const bubbles = document.querySelector('.bubbles');
        if (bubbles) {
            bubbles.style.display = 'block';
            bubbles.style.visibility = 'visible';
            bubbles.style.opacity = '1';
            bubbles.style.zIndex = '1';
        }
        
        const allBubbles = document.querySelectorAll('.bubble');
        allBubbles.forEach(bubble => {
            bubble.style.display = 'block';
            bubble.style.visibility = 'visible';
            bubble.style.opacity = '1';
            bubble.style.zIndex = '10';
        });
    };
    
    // Run on load and on resize
    ensureWaveVisibility();
    window.addEventListener('resize', ensureWaveVisibility);
    
    // Additional fix for mobile layout
    const fixMobileLayout = function() {
        if (window.innerWidth <= 768) {
            // Hide the logo on mobile
            const footerLogo = document.querySelector('.footer-logo');
            if (footerLogo) {
                footerLogo.style.display = 'none';
            }
            
            // Center the navigation items
            const footerNavItems = document.querySelectorAll('.footer-nav-item');
            footerNavItems.forEach(item => {
                item.style.textAlign = 'center';
                item.style.width = '100%';
                item.style.margin = '5px 0';
            });
            
            // Center the LogoLand container
            const logolandContainer = document.querySelector('.logoland-container');
            if (logolandContainer) {
                logolandContainer.style.alignItems = 'center';
            }
            
            // Center the powered by text
            const poweredByText = document.querySelector('.footer-powered-by p');
            if (poweredByText) {
                poweredByText.style.textAlign = 'center';
            }
        } else {
            // Show the logo on desktop
            const footerLogo = document.querySelector('.footer-logo');
            if (footerLogo) {
                footerLogo.style.display = 'block';
            }
        }
    };
    
    // Run on load and on resize
    fixMobileLayout();
    window.addEventListener('resize', fixMobileLayout);
});
