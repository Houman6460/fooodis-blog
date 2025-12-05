/**
 * Universal header injection script for Fooodis website
 * 
 * This script:
 * 1. Loads the central header.html file
 * 2. Adjusts paths based on the current page location
 * 3. Injects the header at the beginning of the body
 * 4. Initializes header functionality (language switching, mobile menu)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Determine relative path to root based on current page location
    const pathToRoot = document.body.getAttribute('data-path-to-root') || '';
    
    // Fetch the header template
    fetch(pathToRoot + 'assets/header.html')
        .then(response => response.text())
        .then(data => {
            // Replace ROOT_PATH placeholder with the actual path to root
            data = data.replace(/ROOT_PATH\//g, pathToRoot);
            
            // Create a container for the header
            const headerContainer = document.createElement('div');
            headerContainer.innerHTML = data;
            
            // Insert at the beginning of the body
            document.body.insertBefore(headerContainer, document.body.firstChild);
            
            // Initialize header functionality
            initializeHeader();
        })
        .catch(error => console.error('Error loading header:', error));
});

/**
 * Initialize header functionality
 */
function initializeHeader() {
    // Header shadow and transparency on scroll
    const header = document.querySelector('.fooodis-header');
    if (header) {
        function handleScroll() {
            if (window.scrollY > 50) {
                // When scrolled, make header semi-transparent with blur effect
                header.style.backgroundColor = 'rgba(30, 33, 39, 0.7)';
                header.style.backdropFilter = 'blur(10px)';
                header.style.WebkitBackdropFilter = 'blur(10px)';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                // When at top, restore original background
                header.style.backgroundColor = '#1e2127';
                header.style.backdropFilter = '';
                header.style.WebkitBackdropFilter = '';
                header.style.boxShadow = '';
            }
        }
        
        // Initial check and add scroll listener
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Mobile menu toggle
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav-close');
    const hamSvg = document.querySelector('.hamburger-menu .ham');
    
    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', function() {
            mobileNav.classList.toggle('show');
            if (hamSvg) hamSvg.classList.toggle('active'); // Toggle animation state
            document.body.style.overflow = mobileNav.classList.contains('show') ? 'hidden' : ''; // Toggle scrolling
        });
    }
    
    if (closeBtn && mobileNav) {
        closeBtn.addEventListener('click', function() {
            mobileNav.classList.remove('show');
            if (hamSvg) hamSvg.classList.remove('active'); // Remove active state
            document.body.style.overflow = ''; // Re-enable scrolling
        });
    }
    
    // Language switching functionality
    const translations = {
        'en': {
            'Service': 'Service',
            'Contact': 'Contact',
            'Blog': 'Blog',
            'Price': 'Price',
            'Registrar': 'Registrar',
            'Demo': 'Demo',
            'Login': 'Login'
        },
        'sv': {
            'Service': 'Tjänst',
            'Contact': 'Kontakt',
            'Blog': 'Blogg',
            'Price': 'Pris',
            'Registrar': 'Registrera',
            'Demo': 'Demo',
            'Login': 'Logga in'
        }
    };
    
    // Function to update all text elements with translations
    function updateLanguage(lang) {
        // Update menu items in header
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
            if (lang) {
                updateLanguage(lang);
                // Update URL if needed
                handleLanguageRedirect(lang);
            }
        });
    });
    
    // Handle language-specific redirects
    function handleLanguageRedirect(lang) {
        const currentPath = window.location.pathname;
        const isSvPage = currentPath.includes('/sv/');
        const pathToRoot = document.body.getAttribute('data-path-to-root') || '';
        
        // Only redirect if necessary
        if (lang === 'sv' && !isSvPage) {
            // Get the current page filename
            const pageName = currentPath.split('/').pop();
            window.location.href = pathToRoot + 'sv/' + pageName;
        } else if (lang === 'en' && isSvPage) {
            // Get the current page filename
            const pageName = currentPath.split('/').pop();
            // Go up one level (out of sv folder)
            window.location.href = pathToRoot + '../' + pageName;
        }
    }
    
    // Check if there's a stored language preference
    const storedLang = localStorage.getItem('fooodis_language');
    if (storedLang) {
        updateLanguage(storedLang);
    }
}
