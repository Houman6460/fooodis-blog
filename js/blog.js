
/**
 * Blog functionality for Fooodis Blog
 */

// Prevent multiple initializations
let blogInitialized = false;

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (blogInitialized) {
        console.log('Blog.js: Already initialized, skipping...');
        return;
    }
    
    console.log('Blog.js: Initializing blog functionality...');
    blogInitialized = true;
    
    // Load blog posts
    loadBlogPosts();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize language switching
    initializeLanguageSwitching();
});

function loadBlogPosts() {
    console.log('Loading blog posts...');
    
    try {
        // Get stored blog posts
        const storedPosts = localStorage.getItem('fooodis-blog-posts');
        const blogGrid = document.getElementById('blogPostsGrid');
        
        if (!blogGrid) {
            console.warn('Blog grid element not found');
            return;
        }

        if (storedPosts) {
            const posts = JSON.parse(storedPosts);
            if (posts && posts.length > 0) {
                displayBlogPosts(posts);
            } else {
                blogGrid.innerHTML = '<p>No blog posts available yet.</p>';
            }
        } else {
            blogGrid.innerHTML = '<p>No blog posts available yet.</p>';
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        const blogGrid = document.getElementById('blogPostsGrid');
        if (blogGrid) {
            blogGrid.innerHTML = '<p>Error loading blog posts.</p>';
        }
    }
}

function displayBlogPosts(posts) {
    const blogGrid = document.getElementById('blogPostsGrid');
    if (!blogGrid) return;

    blogGrid.innerHTML = '';
    
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'blog-post-card';
        postElement.setAttribute('data-post-id', post.id || `post-${index}`);
        
        postElement.innerHTML = `
            <div class="post-image">
                <img src="${post.image || 'images/posts/default-blog-image.jpg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt || post.content?.substring(0, 150) + '...' || ''}</p>
                <div class="post-meta">
                    <span class="post-date">${new Date(post.publishDate || post.createdAt).toLocaleDateString()}</span>
                    <span class="post-category">${post.category || 'General'}</span>
                </div>
            </div>
        `;
        
        postElement.addEventListener('click', () => openPostModal(post));
        blogGrid.appendChild(postElement);
    });
}

function openPostModal(post) {
    const modal = document.getElementById('blogPostModal');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span>Published: ${new Date(post.publishDate || post.createdAt).toLocaleDateString()}</span>
                <span>Category: ${post.category || 'General'}</span>
            </div>
            <div class="post-content">
                ${post.content || post.description || ''}
            </div>
        `;
        modal.style.display = 'block';
        
        // Add close functionality
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
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
