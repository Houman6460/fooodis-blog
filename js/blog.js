
/**
 * Blog functionality for Fooodis Blog
 */

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog.js: Initializing blog functionality...');
    
    // Load blog posts
    loadBlogPosts();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize language switching
    initializeLanguageSwitching();
});

function loadBlogPosts() {
    console.log('Loading blog posts...');
    
    // This function will be implemented with blog post loading logic
    const blogGrid = document.getElementById('blogPostsGrid');
    if (blogGrid) {
        blogGrid.innerHTML = '<p>Loading blog posts...</p>';
    }
}

function initializeMobileMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeBtn = document.querySelector('.mobile-nav-close');

    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', function() {
            mobileNav.classList.add('show');
        });
    }

    if (closeBtn && mobileNav) {
        closeBtn.addEventListener('click', function() {
            mobileNav.classList.remove('show');
        });
    }
}

function initializeLanguageSwitching() {
    const flagLinks = document.querySelectorAll('.flag-link');
    
    flagLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
}

function switchLanguage(lang) {
    console.log('Switching to language:', lang);
    
    // Update language-specific elements
    const langElements = document.querySelectorAll('[data-lang-en], [data-lang-sv]');
    langElements.forEach(element => {
        const content = element.getAttribute(`data-lang-${lang}`);
        if (content) {
            element.textContent = content;
        }
    });
    
    // Store language preference
    localStorage.setItem('fooodis-language', lang);
}

// Export functions for global access
window.loadBlogPosts = loadBlogPosts;
window.switchLanguage = switchLanguage;
