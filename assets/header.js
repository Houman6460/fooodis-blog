// Header functionality for Fooodis - Optimized version
document.addEventListener('DOMContentLoaded', function() {
    // Header shadow on scroll
    const header = document.querySelector('.fooodis-header');
    
    function handleScroll() {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Initial check and add scroll listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Mobile menu toggle - using event delegation for better performance
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburgerMenu && mobileNav) {
        // Get the SVG hamburger icon element
        const hamburgerIcon = hamburgerMenu.querySelector('.ham');
        
        hamburgerMenu.addEventListener('click', function(e) {
            // Stop event propagation
            e.preventDefault();
            e.stopPropagation();
            
            // Force the mobile navigation panel to toggle using direct style manipulation
            // This bypasses any potential CSS conflicts
            const currentLeft = window.getComputedStyle(mobileNav).left;
            
            if (currentLeft === '0px') {
                // Menu is open, close it
                mobileNav.style.left = '-100%';
                mobileNav.classList.remove('show');
                document.body.style.overflow = ''; // Re-enable scrolling
                
                // Remove active class from hamburger icon for animation
                if (hamburgerIcon) hamburgerIcon.classList.remove('active');
                console.log('Menu closed');
            } else {
                // Menu is closed, open it
                mobileNav.style.left = '0';
                mobileNav.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
                
                // Add active class to hamburger icon for animation
                if (hamburgerIcon) hamburgerIcon.classList.add('active');
                console.log('Menu opened');
            }
        });
    }
    
    // Close button removed - hamburger menu now serves as both open and close button
    
    // Language switching functionality
    const translations = {
        'en': {
            'Service': 'Service',
            'Contact': 'Contact',
            'Blog': 'Blog',
            'Price': 'Price',
            'Registrar': 'Registrar',
            'Demo': 'Demo',
            'Login': 'Login',
            'currency': '€'
        },
        'sv': {
            'Service': 'Tjänst',
            'Contact': 'Kontakt',
            'Blog': 'Blogg',
            'Price': 'Pris',
            'Registrar': 'Registrera',
            'Demo': 'Demo',
            'Login': 'Logga in',
            'currency': 'kr'
        }
    };
    
    // Function to update all text elements with translations
    function updateLanguage(lang) {
        // Update menu items in header
        document.querySelectorAll('.nav-item a').forEach(item => {
            const key = item.textContent;
            if (translations[lang][key]) {
                item.textContent = translations[lang][key];
            }
        });
        
        // Update menu items in footer
        document.querySelectorAll('.footer-nav-item a').forEach(item => {
            const key = item.textContent;
            if (translations[lang][key]) {
                item.textContent = translations[lang][key];
            }
        });
        
        // Update menu items in mobile nav
        document.querySelectorAll('.mobile-nav-item a').forEach(item => {
            const key = item.textContent.toLowerCase();
            const upperKey = key.charAt(0).toUpperCase() + key.slice(1);
            if (translations[lang][upperKey]) {
                item.textContent = translations[lang][upperKey].toUpperCase();
            }
        });
        
        // Update currency symbols in pricing
        const currencyElements = document.querySelectorAll('.currency-symbol');
        if (currencyElements.length > 0) {
            currencyElements.forEach(el => {
                el.textContent = translations[lang]['currency'];
            });
        }
        
        // Update price amounts based on currency
        document.querySelectorAll('.price-amount').forEach(el => {
            const priceKey = lang === 'en' ? 'data-price-usd' : 'data-price-sek';
            if (el.hasAttribute(priceKey)) {
                const priceValue = el.getAttribute(priceKey);
                // Remove any existing currency symbol from the text content
                let currentText = el.textContent.replace(/[€$kr\d,.\s]+/g, '').trim();
                // Set the new price with the appropriate currency symbol
                const currencySymbol = translations[lang]['currency'];
                el.textContent = '';
                
                // Add the currency symbol span if it doesn't exist
                let currencySpan = el.querySelector('.currency-symbol');
                if (!currencySpan) {
                    currencySpan = document.createElement('span');
                    currencySpan.className = 'currency-symbol';
                    el.appendChild(currencySpan);
                }
                
                // Set the currency symbol
                currencySpan.textContent = currencySymbol;
                
                // Add the price value
                const priceText = document.createTextNode(priceValue);
                el.appendChild(priceText);
            }
        });
        
        // Update original prices based on currency
        document.querySelectorAll('.original-price').forEach(el => {
            const priceKey = lang === 'en' ? 'data-original-price-usd' : 'data-original-price-sek';
            if (el.hasAttribute(priceKey)) {
                const priceValue = el.getAttribute(priceKey);
                // Get the label element
                const label = el.querySelector('.price-label');
                if (label) {
                    // Update the label text if needed
                    if (translations[lang][label.textContent]) {
                        label.textContent = translations[lang][label.textContent];
                    }
                }
                
                // Update the price text (excluding the label)
                const priceText = Array.from(el.childNodes).find(node => 
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
                if (priceText) {
                    // Set the new price with the appropriate currency symbol
                    const currencySymbol = translations[lang]['currency'];
                    priceText.textContent = ` ${currencySymbol}${priceValue}`;
                } else {
                    // If no text node exists, create one
                    const newPriceText = document.createTextNode(` ${translations[lang]['currency']}${priceValue}`);
                    el.appendChild(newPriceText);
                }
            }
        });
        
        // Update any elements with data-lang attributes
        document.querySelectorAll('[data-lang-en], [data-lang-sv]').forEach(el => {
            const langAttr = `data-lang-${lang}`;
            if (el.hasAttribute(langAttr)) {
                el.textContent = el.getAttribute(langAttr);
            }
        });
        
        // Store the selected language in localStorage
        localStorage.setItem('fooodis_language', lang);
    }
    
    // Add click event listeners to language flags
    const flagLinks = document.querySelectorAll('.flag-link');
    flagLinks.forEach(flag => {
        flag.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            updateLanguage(lang);
            
            // Handle URL redirection with the correct path
            setTimeout(() => {
                const currentPath = window.location.pathname;
                const currentPageName = currentPath.split('/').pop();
                
                if (lang === 'sv' && !currentPath.includes('/sv/')) {
                    // English to Swedish
                    window.location.href = 'sv/' + currentPageName;
                } else if (lang === 'en' && currentPath.includes('/sv/')) {
                    // Swedish to English - go up one directory
                    window.location.href = '../' + currentPageName;
                }
            }, 100); // Short delay for translation to apply
        });
    });
    
    // Check if there's a stored language preference
    const storedLang = localStorage.getItem('fooodis_language');
    if (storedLang) {
        updateLanguage(storedLang);
    }
    
    // Find all price elements that need currency symbols
    function addCurrencySymbols() {
        // Find all price elements
        const priceElements = document.querySelectorAll('.price-amount, .price-value, .price-number');
        
        // Get current language or default to English
        const currentLang = localStorage.getItem('fooodis_language') || 'en';
        const currencySymbol = translations[currentLang]['currency'];
        
        priceElements.forEach(el => {
            // Check if the element already has a currency symbol
            if (!el.querySelector('.currency-symbol')) {
                // Create a span for the currency symbol
                const currencySpan = document.createElement('span');
                currencySpan.className = 'currency-symbol';
                currencySpan.textContent = currencySymbol; // Use the correct currency symbol based on language
                
                // Insert the currency symbol before the price
                el.insertBefore(currencySpan, el.firstChild);
            }
        });
    }
    
    // Run once on page load
    addCurrencySymbols();
    
    // Back to top button functionality
    const backToTopBtn = document.querySelector('.u-back-to-top');
    
    if (backToTopBtn) {
        // Initially hide the button
        backToTopBtn.style.display = 'none';
        
        // Show button when scrolling down
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        }, { passive: true }); // Using passive event for better scroll performance
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
