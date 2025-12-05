// Header transparent blur effect on scroll
document.addEventListener('DOMContentLoaded', function() {
    // Get the header element
    const header = document.querySelector('header');
    
    if (!header) return; // Exit if no header found
    
    // Function to handle scroll effect
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
});
