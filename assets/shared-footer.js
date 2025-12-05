/**
 * Shared Footer with Bubble Effect
 * Same footer on all pages - matching homepage
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if footer already exists
    if (document.querySelector('.fooodis-footer')) {
        return;
    }
    
    // Footer HTML
    const footerHTML = `
    <footer class="fooodis-footer">
        <div class="bubbles"></div>
        
        <div class="footer-container">
            <div class="footer-top">
                <div class="footer-logo">
                    <a href="https://fooodis.com/">
                        <img src="images/Artboard17.svg" alt="Fooodis Logo" class="fooodis-logo-footer" style="max-width: 120px; height: auto;">
                    </a>
                </div>
                <nav class="footer-nav">
                    <ul class="footer-nav-list">
                        <li class="footer-nav-item"><a href="https://logoland.se" target="_blank" rel="noopener">Service</a></li>
                        <li class="footer-nav-item"><a href="Contact.html">Contact</a></li>
                        <li class="footer-nav-item"><a href="Support.html">Support</a></li>
                        <li class="footer-nav-item"><a href="blog.html">Blog</a></li>
                        <li class="footer-nav-item"><a href="FEBlog.html">F.E.Blog</a></li>
                        <li class="footer-nav-item"><a href="index.html#limited-time-offer-en">Price</a></li>
                        <li class="footer-nav-item"><a href="https://fooodis.com/new/restaurant/register" target="_blank" rel="noopener">Registrar</a></li>
                        <li class="footer-nav-item"><a href="https://demo.fooodis.com/home" target="_blank" rel="noopener">Demo</a></li>
                        <li class="footer-nav-item"><a href="https://fooodis.com/new/restaurant/login" target="_blank" rel="noopener">Login</a></li>
                        <li class="footer-nav-item"><a href="admin-login.html">Admin</a></li>
                    </ul>
                </nav>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-powered-by">
                    <div class="logoland-container">
                        <a href="https://logoland.se/" target="_blank" rel="noopener">
                            <img src="images/Artboard1.svg" alt="LogoLand" class="logoland-logo">
                        </a>
                        <p>Powered by LogoLand with ❤️</p>
                    </div>
                </div>
                <div class="footer-social">
                    <a href="https://www.linkedin.com/company/102443279/" target="_blank" rel="noopener noreferrer" class="social-link linkedin"><i class="fab fa-linkedin-in"></i></a>
                    <a href="https://www.facebook.com/profile.php?id=61552797450099" target="_blank" rel="noopener noreferrer" class="social-link facebook"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/fooodis.se/" target="_blank" rel="noopener noreferrer" class="social-link instagram"><i class="fab fa-instagram"></i></a>
                    <a href="https://x.com/Fooodis" target="_blank" rel="noopener noreferrer" class="social-link twitter"><img src="assets/icons8-x-logo.svg" alt="X" width="18" height="18"></a>
                    <a href="https://www.youtube.com/@Fooodis" target="_blank" rel="noopener noreferrer" class="social-link youtube"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
        </div>
    </footer>
    
    <svg class="svg-filters" aria-hidden="true" focusable="false" role="presentation">
        <defs>
            <filter id="blob" aria-hidden="true">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob"></feColorMatrix>
            </filter>
        </defs>
    </svg>
    `;
    
    // Insert footer before closing body tag
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    
    // Generate bubbles
    const bubblesContainer = document.querySelector('.bubbles');
    if (bubblesContainer) {
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
    }
});
