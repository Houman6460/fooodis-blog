/**
 * Accessibility fixes for Fooodis website
 * Adds proper ARIA labels and titles to navigation elements
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fix gallery navigation links without discernible text
    const prevButtons = document.querySelectorAll('.u-gallery-nav-prev');
    const nextButtons = document.querySelectorAll('.u-gallery-nav-next');
    
    prevButtons.forEach(button => {
        button.setAttribute('aria-label', 'Previous slide');
        button.setAttribute('title', 'Previous slide');
        const srOnly = button.querySelector('.sr-only');
        if (srOnly) {
            srOnly.textContent = 'Previous slide';
        }
    });
    
    nextButtons.forEach(button => {
        button.setAttribute('aria-label', 'Next slide');
        button.setAttribute('title', 'Next slide');
        const srOnly = button.querySelector('.sr-only');
        if (srOnly) {
            srOnly.textContent = 'Next slide';
        }
    });
    
    // Add rel="noopener" to external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        if (!link.getAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
            const currentRel = link.getAttribute('rel') || '';
            link.setAttribute('rel', currentRel ? `${currentRel} noopener` : 'noopener');
        }
    });
});
