// Footer Loader Script - Final Version
document.addEventListener('DOMContentLoaded', function() {
    // Only run once to prevent duplicate execution
    if (window.footerLoaded) return;
    window.footerLoaded = true;
    
    // Add footer styles to match reference exactly
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Fooodis Footer Styles - Final Version */
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
            margin-bottom: 40px; /* Increased bottom margin */
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
            padding: 1rem;
            background: #1e2127;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
            width: 100%;
        }
        
        /* Desktop styles - Horizontal layout */
        @media (min-width: 769px) {
            .footer-container {
                padding: 0.75rem 1rem;
            }
            
            .footer-top {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-bottom: 10px;
                width: 100%;
                text-align: center;
                position: relative;
                left: 10px; /* Move menu items 10px to the right */
            }
            
            .footer-logo {
                display: none; /* Hide logo on desktop as per reference */
                margin-bottom: 5px;
            }
            
            .footer-nav {
                width: 100%;
                display: flex;
                justify-content: center;
                margin: 5px 0;
            }
            
            .footer-nav-list {
                display: flex;
                list-style: none;
                padding: 0;
                margin: 0;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 5px; /* Reduced gap between menu items */
            }
            
            .footer-nav-item {
                margin: 0 5px; /* Reduced margin between menu items */
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
                width: 50%; /* Even shorter line to match reference */
                margin-left: auto;
                margin-right: auto;
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
                white-space: nowrap; /* Prevent text wrapping */
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
        }
        
        /* Mobile styles - Compact vertical spacing */
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
                display: none; /* Hide logo on mobile as per reference */
            }
            
            .footer-nav {
                width: 100%;
                overflow-x: auto; /* Allow horizontal scrolling if needed */
                white-space: nowrap; /* Prevent wrapping */
                margin: 5px 0;
            }
            
            .footer-nav-list {
                display: flex;
                flex-direction: row !important; /* Force horizontal layout */
                flex-wrap: nowrap !important; /* Prevent wrapping to next line */
                justify-content: center !important;
                list-style: none;
                padding: 0;
                margin: 0;
                align-items: center;
                width: 100%;
                gap: 0 !important; /* Remove gap */
            }
            
            .footer-nav-item {
                margin: 0 !important;
                padding: 0 !important;
                width: auto !important; /* Allow items to take natural width */
                text-align: center;
                display: inline-block !important;
            }
            
            .footer-nav-item a {
                color: #ffffff;
                text-decoration: none;
                font-size: 14px !important;
                font-weight: 500;
                transition: color 0.3s;
                display: inline-block;
                padding: 3px 5px !important; /* Reduce vertical padding */
                white-space: nowrap;
            }
            
            .footer-bottom {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding-top: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin-top: 10px;
                width: 80%; /* Match the reference line width */
                gap: 10px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .footer-powered-by {
                width: 100%;
                display: flex;
                justify-content: center;
                margin-bottom: 5px;
            }
            
            .logoland-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 5px;
            }
            
            .logoland-logo {
                height: 40px;
                max-width: 180px;
                margin-bottom: 5px;
            }
            
            .footer-powered-by p {
                margin: 0;
                font-size: 14px;
                color: #fff;
                text-align: center;
                white-space: nowrap; /* Prevent text wrapping */
            }
            
            .footer-powered-by p a {
                color: #fff;
                text-decoration: none;
            }
            
            .footer-social {
                display: flex;
                justify-content: center;
                gap: 15px;
                width: 100%;
                align-items: center;
                margin-top: 5px;
            }
        }
        
        .footer-nav-item a:hover, .footer-nav-item a.active {
            color: #e8f24c;
        }
        
        .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: #252830;
            border-radius: 50%;
            transition: background-color 0.3s ease;
        }
        
        .social-link:hover {
            background-color: #e8f24c;
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
        
        /* Wave animation styles - Exact match to reference */
        .wave-animation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: #aabd36; /* Yellow-green color from reference */
            z-index: 0;
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
    `;
    document.head.appendChild(styleElement);
    
    // Create SVG filter for bubble effect
    const svgFilter = document.createElement('div');
    svgFilter.className = 'svg-filters';
    svgFilter.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation"><defs><filter id="blob" aria-hidden="true"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob"></feColorMatrix></filter><clipPath id="wave-path"><path d="M0,40 C100,70 300,0 500,40 C700,80 900,10 1100,50 C1300,90 1500,20 1700,60 L1700,100 L0,100 Z"></path></clipPath></defs></svg>';
    document.body.appendChild(svgFilter);
    
    // Create wave animation HTML - Matching reference
    const waveHTML = `
        <div class="wave-animation">
            <div class="wave-bottom"></div>
        </div>
    `;
    
    // Create footer HTML - Visual match to reference
    const footerHTML = `
        <footer class="fooodis-footer">
            <div class="bubbles"></div>
            <div class="footer-container">
                <div class="footer-top">
                    <div class="footer-logo">
                        <a href="https://fooodis.com/">
                            <img src="assets/Artboard 17 copy 9.svg" alt="Fooodis Logo" class="fooodis-logo-footer" style="max-width: 120px; height: auto;">
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
                            <p data-lang-en="Powered by LogoLand with ❤️" data-lang-sv="Drivs av LogoLand med ❤️" style="white-space: nowrap;">Powered by <a href="https://logoland.se/" target="_blank" rel="noopener">LogoLand</a> with ❤️</p>
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
    
    // Append wave and footer to body
    document.body.appendChild(waveContainer);
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
    
    // Create yellow-green wave effect to match reference
    const createWaveEffect = function() {
        const waveAnimation = document.querySelector('.wave-animation');
        if (waveAnimation) {
            // Set the wave animation background color to match reference
            waveAnimation.style.backgroundColor = '#aabd36'; // Yellow-green color from reference
            
            // Force the wave to be visible
            waveAnimation.style.display = 'block';
            waveAnimation.style.visibility = 'visible';
            waveAnimation.style.opacity = '1';
            
            // Adjust wave height based on screen size
            if (window.innerWidth <= 768) {
                waveAnimation.style.height = '80px';
            } else {
                waveAnimation.style.height = '100px';
            }
        }
    };
    
    // Run on load and on resize
    createWaveEffect();
    window.addEventListener('resize', createWaveEffect);
    
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
        
        const waveAnimation = document.querySelector('.wave-animation');
        if (waveAnimation) {
            waveAnimation.style.display = 'block';
            waveAnimation.style.visibility = 'visible';
            waveAnimation.style.opacity = '1';
        }
    };
    
    // Run on load and on resize
    ensureWaveVisibility();
    window.addEventListener('resize', ensureWaveVisibility);
    
    // Apply final adjustments
    const applyFinalAdjustments = function() {
        // Add increased bottom margin to footer
        const footer = document.querySelector('.fooodis-footer');
        if (footer) {
            footer.style.marginBottom = '40px'; // Increased bottom margin
        }
        
        // Fix heart icon wrapping and make LogoLand text clickable
        const footerPoweredByText = document.querySelector('.footer-powered-by p');
        if (footerPoweredByText) {
            footerPoweredByText.style.whiteSpace = 'nowrap'; // Prevent text wrapping
            
            // Make sure LogoLand text is clickable
            const logolandLink = footerPoweredByText.querySelector('a');
            if (logolandLink) {
                logolandLink.href = 'https://logoland.se/';
                logolandLink.target = '_blank';
                logolandLink.rel = 'noopener';
            }
        }
        
        // Adjust desktop menu spacing and position
        if (window.innerWidth > 768) {
            const footerTop = document.querySelector('.footer-top');
            if (footerTop) {
                footerTop.style.position = 'relative';
                footerTop.style.left = '10px'; // Move menu items 10px to the right
            }
            
            const footerNavList = document.querySelector('.footer-nav-list');
            if (footerNavList) {
                footerNavList.style.gap = '5px'; // Reduced gap between menu items
            }
            
            document.querySelectorAll('.footer-nav-item').forEach(item => {
                item.style.margin = '0 5px'; // Reduced margin between menu items
            });
        }
    };
    
    // Run on load and on resize
    applyFinalAdjustments();
    window.addEventListener('resize', applyFinalAdjustments);
});
