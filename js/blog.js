/**
 * Fooodis Blog System - Client-side JavaScript
 * Handles blog post display, filtering, and modal functionality
 */

// Global variables - ensure they're always available
// Store on window to prevent duplicate declaration errors
window.blogPostsInitialized = true;
window.blogPosts = window.blogPosts || [];
window.blogCategories = window.blogCategories || [];
window.blogSubcategories = window.blogSubcategories || [];
window.blogTags = window.blogTags || [];
window.blogFeaturedPosts = window.blogFeaturedPosts || [];
window.currentPage = window.currentPage || 1;
window.postsPerPage = window.postsPerPage || 6;
window.totalPages = window.totalPages || 1;
window.filteredPosts = window.filteredPosts || null;

// Create local references for convenience
var blogPosts = window.blogPosts;
var categories = window.blogCategories;
var subcategories = window.blogSubcategories;
var tags = window.blogTags;
var featuredPosts = window.blogFeaturedPosts;
var currentPage = window.currentPage;
var postsPerPage = window.postsPerPage;
var totalPages = window.totalPages;
var filteredPosts = window.filteredPosts;

// DOM Elements
let blogPostsGrid, categoryList, subcategoryList, tagsContainer, bannerContainer;
let blogPostModal, modalBody, modalCloseBtn, paginationContainer, paginationNumbers;
let prevPageBtn, nextPageBtn;

// Initialize DOM elements after the document is loaded
function initializeDOMElements() {
    blogPostsGrid = document.getElementById('blogPostsGrid');
    categoryList = document.getElementById('categoryList');
    subcategoryList = document.getElementById('subcategoryList');
    tagsContainer = document.getElementById('tagsContainer');
    bannerContainer = document.querySelector('.blog-banner-container');
    blogPostModal = document.getElementById('blogPostModal');
    modalBody = document.getElementById('modalBody');
    modalCloseBtn = document.querySelector('.close-modal');
    paginationContainer = document.getElementById('blogPagination');
    paginationNumbers = document.getElementById('paginationNumbers');
    prevPageBtn = document.getElementById('prevPageBtn');
    nextPageBtn = document.getElementById('nextPageBtn');
}

// Helper function to get a valid image URL (defined early so it's available everywhere)
function getValidImageUrl(imageUrl) {
    const fallback = 'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg';
    
    // Check if imageUrl is valid
    if (!imageUrl || 
        imageUrl === 'undefined' || 
        imageUrl === 'null' || 
        imageUrl === '' ||
        imageUrl.startsWith('data:image') || // Skip base64 images - too large
        imageUrl.trim() === '') {
        return fallback;
    }
    
    return imageUrl;
}

// Initialize the blog system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Blog.js v2 - Starting initialization');
    initializeDOMElements();
    console.log('📦 Loading blog data from API...');
    await loadBlogData();
    console.log('📊 blogPosts loaded:', window.blogPosts.length, 'posts');
    console.log('🎨 Rendering posts...');
    renderBlogPosts();
    console.log('✅ Blog initialization complete');
    renderCategories();
    renderSubcategories();
    renderTags();
    renderBanners();
    setupEventListeners();
    
    // Initialize advertising banner if the function exists
    if (typeof window.injectAdIntoBlogPage === 'function') {
        window.injectAdIntoBlogPage();
    }
    
    // Set a flag to prevent automatic post opening on refresh
    window.preventAutoPostOpen = true;
    localStorage.setItem('fooodis-prevent-auto-open', 'true');
});

// Load blog data from API (cloud database) instead of localStorage
async function loadBlogData() {
    try {
        // Fetch posts from API
        const postsResponse = await fetch('/api/blog/posts?status=published');
        if (postsResponse.ok) {
            const data = await postsResponse.json();
            const posts = data.posts || [];
            // Update both local and window references
            blogPosts = posts;
            window.blogPosts = posts;
            console.log('Loaded', blogPosts.length, 'posts from API');
        } else {
            console.error('Failed to load posts from API:', postsResponse.status);
            blogPosts = [];
            window.blogPosts = [];
        }
        
        // Always extract categories/subcategories/tags from posts to get accurate counts
        // This ensures counts are always correct based on actual posts
        categories = extractCategories(blogPosts);
        subcategories = extractSubcategories(blogPosts);
        tags = extractTags(blogPosts);
        
        console.log('Extracted', categories.length, 'categories,', subcategories.length, 'subcategories,', tags.length, 'tags from posts');
        
        // Extract featured posts from loaded data
        featuredPosts = blogPosts.filter(post => post.featured).map(post => post.id);
        
    } catch (error) {
        console.error('Error loading blog data from API:', error);
        blogPosts = [];
        window.blogPosts = [];
        categories = [];
        window.blogCategories = [];
        subcategories = [];
        window.blogSubcategories = [];
        tags = [];
        window.blogTags = [];
        featuredPosts = [];
        window.blogFeaturedPosts = [];
    }
}

// Extract unique categories from blog posts
function extractCategories(posts) {
    const categoryMap = {};
    
    posts.forEach(post => {
        if (post.category) {
            if (!categoryMap[post.category]) {
                categoryMap[post.category] = 1;
            } else {
                categoryMap[post.category]++;
            }
        }
    });
    
    return Object.keys(categoryMap).map(category => ({
        name: category,
        count: categoryMap[category]
    }));
}

// Extract unique subcategories from blog posts
function extractSubcategories(posts) {
    const subcategoryMap = {};
    
    posts.forEach(post => {
        if (post.subcategory) {
            if (!subcategoryMap[post.subcategory]) {
                subcategoryMap[post.subcategory] = 1;
            } else {
                subcategoryMap[post.subcategory]++;
            }
        }
    });
    
    return Object.keys(subcategoryMap).map(subcategory => ({
        name: subcategory,
        count: subcategoryMap[subcategory]
    }));
}

// Extract unique tags from blog posts
function extractTags(posts) {
    const tagSet = new Set();
    
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                // Handle both string tags and object tags
                const tagName = typeof tag === 'object' ? (tag.name || tag.slug || String(tag)) : tag;
                if (tagName && tagName !== '[object Object]') {
                    tagSet.add(tagName);
                }
            });
        }
    });
    
    return Array.from(tagSet);
}

// Render blog posts to the grid with pagination
function renderBlogPosts(customPosts = null) {
    // Set filtered posts globally if provided
    if (customPosts !== null) {
        filteredPosts = customPosts;
    }
    
    // Determine which posts to use (filtered or all)
    const posts = filteredPosts || blogPosts;
    
    // Calculate total pages
    totalPages = Math.ceil(posts.length / postsPerPage);
    
    // Ensure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, posts.length);
    
    // Get posts for current page
    const currentPosts = posts.slice(startIndex, endIndex);
    
    // Clear grid before adding new posts
    blogPostsGrid.innerHTML = '';
    
    // Ensure all FontAwesome styles are loaded
    if (document.querySelector('link[href*="font-awesome"]') === null) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }
    
    // Show message if no posts
    if (posts.length === 0) {
        blogPostsGrid.innerHTML = '<div class="no-posts-message">No blog posts found.</div>';
        paginationContainer.style.display = 'none';
        return;
    }
    
    // Show pagination if we have posts
    paginationContainer.style.display = 'flex';
    
    // Create a helper function to standardize the card creation
    function createBlogPostCard(post) {
        // Create a standalone card with consistent structure
        const card = document.createElement('div');
        card.className = 'blog-post-card';
        card.dataset.id = post.id;
        
        // Create the image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'blog-post-image';
        
        // Create the image element with validated URL
        const img = document.createElement('img');
        const validImageUrl = getValidImageUrl(post.imageUrl);
        img.src = validImageUrl;
        img.alt = post.title;
        img.onerror = function() {
            this.src = 'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg';
            this.onerror = null;
        };
        imageContainer.appendChild(img);
        
        // Create the content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'blog-post-content';
        
        // Add category
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'blog-post-category';
        categoryDiv.textContent = `${post.category || 'UNDEFINED'}${post.subcategory ? ` / ${post.subcategory}` : ''}`;
        contentContainer.appendChild(categoryDiv);
        
        // Add title
        const title = document.createElement('h3');
        title.className = 'blog-post-title';
        title.textContent = post.title;
        contentContainer.appendChild(title);
        
        // Add excerpt - clean up content
        const excerpt = document.createElement('p');
        excerpt.className = 'blog-post-excerpt';
        let excerptText = post.excerpt || (post.content && post.content.substring(0, 150)) || '';
        // Clean up excerpt text - remove markdown headings, READ MORE, and HTML tags
        excerptText = excerptText
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/^#+\s*.+$/gm, '') // Remove markdown headings
            .replace(/READ MORE/gi, '')
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
        // Truncate if too long
        if (excerptText.length > 120) {
            excerptText = excerptText.substring(0, 120) + '...';
        }
        excerpt.textContent = excerptText || 'Click to read more...';
        contentContainer.appendChild(excerpt);
        
        // Create the share container for read more and social icons
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-container';
        
        // Add read more link
        const readMore = document.createElement('a');
        readMore.className = 'read-more';
        readMore.href = '#';
        readMore.dataset.id = post.id;
        readMore.textContent = 'READ MORE';
        shareContainer.appendChild(readMore);
        
        // Add social icons
        const socialIcons = document.createElement('div');
        socialIcons.className = 'social-icons';
        
        // Facebook icon
        const fbLink = document.createElement('a');
        fbLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href + '?post=' + post.id)}`;
        fbLink.target = '_blank';
        fbLink.rel = 'noopener noreferrer';
        fbLink.setAttribute('aria-label', 'Share on Facebook');
        const fbIcon = document.createElement('i');
        fbIcon.className = 'fab fa-facebook-f';
        fbLink.appendChild(fbIcon);
        socialIcons.appendChild(fbLink);
        
        // Twitter icon
        const twitterLink = document.createElement('a');
        twitterLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href + '?post=' + post.id)}`;
        twitterLink.target = '_blank';
        twitterLink.rel = 'noopener noreferrer';
        twitterLink.setAttribute('aria-label', 'Share on Twitter');
        const twitterIcon = document.createElement('i');
        twitterIcon.className = 'fab fa-twitter';
        twitterLink.appendChild(twitterIcon);
        socialIcons.appendChild(twitterLink);
        
        // LinkedIn icon
        const linkedinLink = document.createElement('a');
        linkedinLink.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href + '?post=' + post.id)}&title=${encodeURIComponent(post.title)}`;
        linkedinLink.target = '_blank';
        linkedinLink.rel = 'noopener noreferrer';
        linkedinLink.setAttribute('aria-label', 'Share on LinkedIn');
        const linkedinIcon = document.createElement('i');
        linkedinIcon.className = 'fab fa-linkedin-in';
        linkedinLink.appendChild(linkedinIcon);
        socialIcons.appendChild(linkedinLink);
        
        // Email icon
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent((post.excerpt || post.title) + '\n\n' + window.location.href + '?post=' + post.id)}`;
        emailLink.setAttribute('aria-label', 'Share via Email');
        const emailIcon = document.createElement('i');
        emailIcon.className = 'fas fa-envelope';
        emailLink.appendChild(emailIcon);
        socialIcons.appendChild(emailLink);
        
        // Add social icons to share container
        shareContainer.appendChild(socialIcons);
        
        // Add share container to content
        contentContainer.appendChild(shareContainer);
        
        // Assemble the card
        card.appendChild(imageContainer);
        card.appendChild(contentContainer);
        
        return card;
    }
    
    // Render each post with the standardized card creation function
    currentPosts.forEach(post => {
        const postCard = createBlogPostCard(post);
        blogPostsGrid.appendChild(postCard);
    });
    
    // Render pagination
    renderPagination();
    
    // Add click event to all "Read More" links
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-id');
            openBlogPostModal(postId);
        });
    });
    
    // Add click events to all blog post cards - using the new standardized DOM structure
    document.querySelectorAll('.blog-post-card').forEach(card => {
        // Add click event to the card itself (for opening the modal)
        card.addEventListener('click', function(e) {
            // Don't open modal if clicking on read-more or social icons
            if (!e.target.closest('.read-more') && !e.target.closest('.social-icons')) {
                const postId = this.dataset.id;
                openBlogPostModal(postId);
            }
        });
    });
    
    // Add click events to all read more links
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.dataset.id;
            openBlogPostModal(postId);
        });
    });
}

// Render pagination controls
function renderPagination() {
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Clear pagination numbers
    paginationNumbers.innerHTML = '';
    
    // Determine range of page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Adjust if we're near the end
    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Add first page if not in range
    if (startPage > 1) {
        addPageNumber(1);
        if (startPage > 2) {
            addEllipsis();
        }
    }
    
    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
    }
    
    // Add last page if not in range
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addEllipsis();
        }
        addPageNumber(totalPages);
    }
}

// Add a page number to pagination
function addPageNumber(pageNum) {
    const pageEl = document.createElement('div');
    pageEl.className = 'page-number' + (pageNum === currentPage ? ' active' : '');
    pageEl.textContent = pageNum;
    pageEl.addEventListener('click', () => goToPage(pageNum));
    paginationNumbers.appendChild(pageEl);
}

// Add ellipsis to pagination
function addEllipsis() {
    const ellipsis = document.createElement('div');
    ellipsis.className = 'page-ellipsis';
    ellipsis.textContent = '...';
    paginationNumbers.appendChild(ellipsis);
}

// Go to specific page
function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) {
        return;
    }
    
    currentPage = pageNum;
    renderBlogPosts();
    
    // Scroll to top of blog posts
    blogPostsGrid.scrollIntoView({ behavior: 'smooth' });
}

// Render categories to the sidebar
function renderCategories() {
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" data-category="${category.name}">
                ${category.name}
                <span class="category-count">${category.count}</span>
            </a>
        `;
        categoryList.appendChild(li);
    });
    
    // Add click event to category links
    document.querySelectorAll('#categoryList a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterPostsByCategory(category);
        });
    });
}

// Render subcategories to the sidebar
function renderSubcategories() {
    subcategoryList.innerHTML = '';
    
    subcategories.forEach(subcategory => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" data-subcategory="${subcategory.name}">
                ${subcategory.name}
                <span class="subcategory-count">${subcategory.count}</span>
            </a>
        `;
        subcategoryList.appendChild(li);
    });
    
    // Add click event to subcategory links
    document.querySelectorAll('#subcategoryList a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const subcategory = this.getAttribute('data-subcategory');
            filterPostsBySubcategory(subcategory);
        });
    });
}

// Render tags to the sidebar
function renderTags() {
    tagsContainer.innerHTML = '';
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        // Handle both string tags and object tags (from API)
        const tagName = typeof tag === 'object' ? (tag.name || tag.slug || String(tag)) : tag;
        tagElement.textContent = tagName;
        tagElement.dataset.tag = tagName;
        tagsContainer.appendChild(tagElement);
    });
    
    // Add click event to tags
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagName = this.dataset.tag;
            filterPostsByTag(tagName);
        });
    });
}

// Render featured posts as banners
function renderBanners() {
    bannerContainer.innerHTML = '';
    
    const featuredPostsData = blogPosts.filter(post => featuredPosts.includes(post.id));
    
    if (featuredPostsData.length === 0) {
        // Create a default banner if no featured posts
        const defaultBanner = document.createElement('div');
        defaultBanner.className = 'blog-banner';
        defaultBanner.innerHTML = `
            <img src="images/New images/restaurant-interior-2022-11-11-02-07-29-utc.jpg" alt="Fooodis Blog">
            <div class="blog-banner-overlay">
                <h2 class="blog-banner-title">Welcome to Fooodis Blog</h2>
                <p class="blog-banner-description">Discover the latest restaurant management tips, industry insights, and Fooodis platform updates.</p>
            </div>
        `;
        bannerContainer.appendChild(defaultBanner);
        return;
    }
    
    featuredPostsData.forEach(post => {
        const banner = document.createElement('div');
        banner.className = 'blog-banner';
        banner.dataset.id = post.id;
        
        // Use validated image URL
        const imageUrl = getValidImageUrl(post.imageUrl);
        const fallbackImage = 'images/New images/image-placeholder.jpg';
        
        banner.innerHTML = `
            <img src="${imageUrl}" alt="${post.title}" onerror="this.onerror=null; this.src='${fallbackImage}';">
            <div class="blog-banner-overlay">
                <h2 class="blog-banner-title">${post.title}</h2>
                <p class="blog-banner-description">${post.excerpt || post.content.substring(0, 150) + '...'}</p>
            </div>
        `;
        
        bannerContainer.appendChild(banner);
    });
    
    // Add click event to banners
    document.querySelectorAll('.blog-banner').forEach(banner => {
        banner.addEventListener('click', function() {
            const postId = this.dataset.id;
            openBlogPostModal(postId);
        });
    });
    
    // Add CSS to fix banner styling
    const style = document.createElement('style');
    style.textContent = `
        .blog-banner {
            position: relative;
            height: 400px;
            overflow: hidden;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .blog-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .blog-banner:hover img {
            transform: scale(1.05);
        }
        
        .blog-banner-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
            color: white;
        }
        
        .blog-banner-title {
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .blog-banner-description {
            font-size: 16px;
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
}

// Filter posts by category
function filterPostsByCategory(category) {
    const filtered = blogPosts.filter(post => post.category === category);
    currentPage = 1; // Reset to first page when filtering
    renderBlogPosts(filtered);
    
    // Update active class on category links
    document.querySelectorAll('#categoryList a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        }
    });
}

// Filter posts by subcategory
function filterPostsBySubcategory(subcategory) {
    const filtered = blogPosts.filter(post => post.subcategory === subcategory);
    currentPage = 1; // Reset to first page when filtering
    renderBlogPosts(filtered);
    
    // Update active class on subcategory links
    document.querySelectorAll('#subcategoryList a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-subcategory') === subcategory) {
            link.classList.add('active');
        }
    });
}

// Filter posts by tag
function filterPostsByTag(tag) {
    const filtered = blogPosts.filter(post => {
        if (post.tags && Array.isArray(post.tags)) {
            // Handle both string tags and object tags
            return post.tags.some(t => {
                const tagName = typeof t === 'object' ? (t.name || t.slug || String(t)) : t;
                return tagName === tag;
            });
        }
        return false;
    });
    
    currentPage = 1; // Reset to first page when filtering
    renderBlogPosts(filtered);
    
    // Update active class on tag links
    document.querySelectorAll('#tagsContainer .tag').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tag') === tag) {
            link.classList.add('active');
        }
    });
}

// Open blog post modal
function openBlogPostModal(postId) {
    const post = blogPosts.find(post => post.id === postId);
    
    if (!post) {
        console.error('Post not found');
        return;
    }
    
    // Track page view for this post
    trackPostView(postId);
    
    // Get a valid image URL for the post
    const imageUrl = getValidImageUrl(post.imageUrl);
    const fallbackImage = 'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg';
    
    modalBody.innerHTML = `
        <div class="modal-image">
            <img src="${imageUrl}" alt="${post.title}" onerror="this.src='${fallbackImage}'; this.onerror=null;">
        </div>
        <div class="modal-header">
            <div class="modal-category">${post.category}${post.subcategory ? ` / ${post.subcategory}` : ''}</div>
            <div class="modal-share">
                <span class="modal-share-label">Share: </span>
                <div class="modal-share-buttons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href + '?post=' + post.id)}" target="_blank" rel="noopener noreferrer" class="modal-share-button facebook" aria-label="Share on Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href + '?post=' + post.id)}" target="_blank" rel="noopener noreferrer" class="modal-share-button twitter" aria-label="Share on Twitter">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href + '?post=' + post.id)}&title=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer" class="modal-share-button linkedin" aria-label="Share on LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                    <a href="mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(post.excerpt + '\n\n' + window.location.href + '?post=' + post.id)}" class="modal-share-button email" aria-label="Share via Email">
                        <i class="fas fa-envelope"></i>
                    </a>
                </div>
            </div>
        </div>
        <h2 class="modal-title">${post.title}</h2>
        <div class="modal-content-text">
            ${typeof window.renderMarkdown === 'function' ? window.renderMarkdown(post.content) : post.content}
        </div>
        ${post.tags && post.tags.length > 0 ? `
            <div class="modal-tags">
                ${post.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    blogPostModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Close blog post modal
function closeBlogPostModal() {
    blogPostModal.classList.remove('show');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking the close button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            closeBlogPostModal();
        });
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(e) {
        if (e.target === blogPostModal) {
            closeBlogPostModal();
        }
    });
    
    // Toggle share dropdowns in blog post cards
    document.addEventListener('click', function(e) {
        // Close all share dropdowns first
        if (!e.target.closest('.blog-post-share')) {
            document.querySelectorAll('.share-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
        
        // Toggle clicked dropdown
        if (e.target.closest('.share-btn')) {
            e.preventDefault();
            const shareBtn = e.target.closest('.share-btn');
            const dropdown = shareBtn.nextElementSibling;
            dropdown.classList.toggle('active');
            e.stopPropagation();
        }
    });
    
    // Check URL parameters for direct post opening
    checkUrlForPostId();
    
    // Close modal when pressing the Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogPostModal.style.display === 'block') {
            closeBlogPostModal();
        }
    });
    
    // Pagination button events with improved handling
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
    }
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            filteredPosts = null;
            currentPage = 1;
            
            // Remove active class from all filter links
            document.querySelectorAll('#categoryList a, #subcategoryList a, #tagsContainer .tag').forEach(link => {
                link.classList.remove('active');
            });
            
            renderBlogPosts();
        });
    }
    
    // Add global function for language switching
    window.updateLanguage = function(lang) {
        // Get all elements with data-lang-en and data-lang-sv attributes
        const elements = document.querySelectorAll('[data-lang-en][data-lang-sv]');
        
        elements.forEach(el => {
            // Set the text content based on the selected language
            if (lang === 'en') {
                el.textContent = el.getAttribute('data-lang-en');
            } else if (lang === 'sv') {
                el.textContent = el.getAttribute('data-lang-sv');
            }
        });
        
        // Store the selected language in localStorage
        localStorage.setItem('fooodis-language', lang);
    };
    
    // Add click event listeners to language flags
    const flagLinks = document.querySelectorAll('.flag-link');
    flagLinks.forEach(flag => {
        flag.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            window.updateLanguage(lang);
        });
    });
    
    // Set initial language based on localStorage or default to English
    const savedLanguage = localStorage.getItem('fooodis-language') || 'en';
    window.updateLanguage(savedLanguage);
}

// Check URL parameters for direct post opening
function checkUrlForPostId() {
    // Check if we should prevent automatic opening (on page refresh)
    if (window.preventAutoPostOpen || localStorage.getItem('fooodis-prevent-auto-open') === 'true') {
        // Reset the flag after checking once
        window.preventAutoPostOpen = false;
        localStorage.removeItem('fooodis-prevent-auto-open');
        console.log('Prevented automatic post opening on page load/refresh');
        return;
    }
    
    // Only proceed if we're coming from a direct link
    const referrer = document.referrer;
    if (referrer && referrer.includes(window.location.hostname)) {
        // If we're navigating within the same site, don't auto-open
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    // Only open a post if explicitly requested via URL parameter from an external site
    if (postId && postId.trim() !== '') {
        // Find the post with the matching ID
        const post = blogPosts.find(post => post.id === postId);
        if (post) {
            // Open the modal with this post
            setTimeout(() => openBlogPostModal(postId), 500);
        }
    }
}

// Sample blog posts for initial data
function getSampleBlogPosts() {
    return [
        {
            id: '1',
            title: 'Maximizing Restaurant Efficiency with Fooodis POS',
            excerpt: 'Discover how the Fooodis POS system can streamline your restaurant operations and boost efficiency.',
            content: `
                <p>In today's competitive restaurant industry, efficiency is key to success. The Fooodis POS system offers a comprehensive solution to streamline your operations and maximize productivity.</p>
                
                <p>With features like real-time order management, inventory tracking, and staff performance monitoring, Fooodis POS helps restaurant owners and managers make data-driven decisions that can significantly impact their bottom line.</p>
                
                <p>One of the standout features of the Fooodis POS system is its intuitive interface, which minimizes training time and reduces errors. Staff can quickly learn to navigate the system, taking orders and processing payments with ease.</p>
                
                <p>The system also integrates seamlessly with kitchen displays, ensuring that orders are communicated clearly and promptly to the kitchen staff. This reduces wait times and improves the overall dining experience for customers.</p>
                
                <p>Furthermore, Fooodis POS offers comprehensive reporting tools that provide valuable insights into your restaurant's performance. From sales trends to inventory levels, these reports help you identify areas for improvement and make informed business decisions.</p>
                
                <p>By implementing the Fooodis POS system, restaurant owners can expect to see improvements in order accuracy, table turnover rates, and overall customer satisfaction. The system's efficiency-boosting features translate directly into increased revenue and profitability.</p>
            `,
            imageUrl: 'images/pos-system.jpg',
            category: 'Technology',
            subcategory: 'POS Systems',
            tags: ['POS', 'Efficiency', 'Restaurant Management'],
            featured: true
        },
        {
            id: '2',
            title: 'The Benefits of Online Ordering for Restaurants',
            excerpt: 'Learn how implementing an online ordering system can increase your restaurant\'s revenue and customer base.',
            content: `
                <p>Online ordering has revolutionized the restaurant industry, offering unprecedented convenience for customers and new revenue streams for restaurant owners. Implementing an online ordering system through Fooodis can transform your business in several key ways.</p>
                
                <p>First and foremost, online ordering expands your restaurant's reach beyond its physical location. Customers who might not have the time to dine in can now enjoy your food from the comfort of their homes or offices. This expanded customer base can significantly increase your overall sales volume.</p>
                
                <p>Additionally, online ordering systems typically result in larger average order values. When customers order online, they have more time to browse your menu and are more likely to add appetizers, desserts, or beverages to their orders. The absence of perceived time pressure or social considerations often leads to more indulgent ordering behavior.</p>
                
                <p>From an operational standpoint, online ordering systems streamline the order-taking process. Orders are automatically captured and transmitted to your kitchen, reducing the potential for human error and freeing up your staff to focus on food preparation and customer service.</p>
                
                <p>The data collected through online ordering systems also provides valuable insights into customer preferences and ordering patterns. This information can help you optimize your menu, pricing, and marketing strategies to better meet customer needs and maximize profitability.</p>
                
                <p>Finally, online ordering systems can help you build customer loyalty through features like saved favorite orders, personalized recommendations, and loyalty programs. These elements enhance the customer experience and encourage repeat business.</p>
            `,
            imageUrl: 'images/online-ordering.jpg',
            category: 'Digital Solutions',
            subcategory: 'Online Ordering',
            tags: ['Online Ordering', 'Revenue Growth', 'Customer Experience'],
            featured: true
        },
        {
            id: '3',
            title: 'Effective Inventory Management for Restaurants',
            excerpt: 'Tips and strategies for optimizing your restaurant\'s inventory management to reduce waste and costs.',
            content: `
                <p>Effective inventory management is a critical component of running a profitable restaurant. With food costs representing a significant portion of your expenses, optimizing inventory can have a direct impact on your bottom line.</p>
                
                <p>The Fooodis inventory management system offers a comprehensive solution for tracking and managing your restaurant's inventory. By implementing this system, you can reduce waste, control costs, and ensure that you always have the ingredients you need to serve your customers.</p>
                
                <p>One of the key benefits of the Fooodis inventory management system is real-time tracking. You'll always know exactly what you have on hand, what's running low, and what needs to be ordered. This prevents both stockouts and overstocking, both of which can be costly for your business.</p>
                
                <p>The system also helps you identify patterns in your inventory usage, allowing you to make more accurate forecasts and place more efficient orders. By analyzing historical data, you can predict busy periods and adjust your inventory accordingly.</p>
                
                <p>Another advantage of the Fooodis inventory management system is its ability to track waste. By monitoring what's being thrown away, you can identify areas where you're losing money and make adjustments to your purchasing, storage, or preparation methods.</p>
                
                <p>Finally, the system integrates seamlessly with your POS system, automatically updating inventory levels as items are sold. This saves time and reduces the potential for human error in your inventory tracking.</p>
            `,
            imageUrl: 'images/inventory-management.jpg',
            category: 'Operations',
            subcategory: 'Inventory',
            tags: ['Inventory', 'Cost Control', 'Waste Reduction'],
            featured: false
        },
        {
            id: '4',
            title: 'Leveraging Customer Data for Restaurant Marketing',
            excerpt: 'How to use customer data from your Fooodis system to create targeted marketing campaigns.',
            content: `
                <p>In today's digital age, data is one of the most valuable assets for any business, including restaurants. The Fooodis system collects a wealth of customer data that can be leveraged to create highly effective marketing campaigns.</p>
                
                <p>Customer data provides insights into ordering patterns, preferences, and behaviors that can help you tailor your marketing messages to resonate with your target audience. By understanding what your customers want, you can create offers and promotions that are more likely to drive sales.</p>
                
                <p>One effective way to use customer data is through segmentation. By dividing your customer base into groups based on factors like ordering frequency, average spend, or menu preferences, you can create targeted campaigns that speak directly to each segment's interests and needs.</p>
                
                <p>For example, you might send a special offer on vegetarian dishes to customers who frequently order vegetarian options, or a promotion for your happy hour to customers who typically visit during the early evening hours.</p>
                
                <p>Customer data can also help you identify opportunities for upselling and cross-selling. If you notice that customers who order a particular entrée rarely order dessert, you might create a special bundle offer to encourage them to try your dessert menu.</p>
                
                <p>Finally, customer data can inform your loyalty program strategy. By analyzing spending patterns and visit frequency, you can design rewards that incentivize the behaviors you want to encourage, such as visiting during off-peak hours or trying new menu items.</p>
            `,
            imageUrl: 'images/customer-data.jpg',
            category: 'Marketing',
            subcategory: 'Data Analytics',
            tags: ['Marketing', 'Customer Data', 'Targeting'],
            featured: false
        },
        {
            id: '5',
            title: 'Designing an Effective Restaurant Menu with Fooodis',
            excerpt: 'Tips for creating a menu that maximizes profitability and enhances the dining experience.',
            content: `
                <p>Your restaurant's menu is more than just a list of dishes—it's a powerful marketing tool that can significantly impact your profitability. With Fooodis menu management tools, you can design and optimize your menu to drive sales and enhance the dining experience.</p>
                
                <p>Menu engineering is the process of analyzing and strategically designing your menu to maximize profitability. By categorizing menu items based on their popularity and profitability, you can make informed decisions about item placement, pricing, and promotion.</p>
                
                <p>The Fooodis system provides valuable data on which menu items are selling well and which are generating the highest profit margins. This information allows you to highlight your most profitable items through strategic placement, descriptive language, and visual cues.</p>
                
                <p>When designing your menu, consider the psychology of menu reading. Most customers scan menus in a predictable pattern, often focusing on the top right corner first. Placing high-margin items in these "hot spots" can increase their sales.</p>
                
                <p>Descriptive language is another powerful tool in menu design. Vivid, sensory descriptions can make dishes more appealing and justify premium pricing. The Fooodis menu management system allows you to easily update and test different item descriptions to see what resonates with your customers.</p>
                
                <p>Finally, consider the overall organization and readability of your menu. A cluttered, confusing menu can overwhelm customers and slow down the ordering process. The Fooodis system offers customizable menu templates that are designed for clarity and ease of navigation.</p>
            `,
            imageUrl: 'images/menu-design.jpg',
            category: 'Operations',
            subcategory: 'Menu Management',
            tags: ['Menu Design', 'Profitability', 'Customer Experience'],
            featured: false
        },
        {
            id: '6',
            title: 'Implementing a Successful Loyalty Program with Fooodis',
            excerpt: 'How to create and manage a loyalty program that keeps customers coming back.',
            content: `
                <p>In the competitive restaurant industry, customer loyalty is invaluable. A well-designed loyalty program can encourage repeat visits, increase average spend, and create brand advocates. The Fooodis loyalty program module offers a comprehensive solution for implementing and managing a successful loyalty program.</p>
                
                <p>The first step in creating an effective loyalty program is defining your objectives. Are you looking to increase visit frequency, boost average spend, or encourage customers to try new menu items? Your goals will shape the structure and rewards of your program.</p>
                
                <p>The Fooodis loyalty program module offers flexible options for program structure, including points-based systems, tiered rewards, and visit-based incentives. You can choose the approach that best aligns with your business goals and customer preferences.</p>
                
                <p>When designing your rewards, consider offering a mix of monetary incentives (like discounts or free items) and experiential benefits (like priority seating or exclusive events). This creates a more compelling value proposition and differentiates your program from competitors.</p>
                
                <p>Communication is key to a successful loyalty program. The Fooodis system enables automated communications to keep members informed about their status, available rewards, and special promotions. Regular engagement helps keep your restaurant top-of-mind and drives program participation.</p>
                
                <p>Finally, the analytics capabilities of the Fooodis loyalty program module allow you to track program performance and member behavior. This data helps you refine your program over time, optimizing for maximum impact on your business objectives.</p>
            `,
            imageUrl: 'images/loyalty-program.jpg',
            category: 'Marketing',
            subcategory: 'Loyalty Programs',
            tags: ['Loyalty', 'Customer Retention', 'Rewards'],
            featured: false
        }
    ];
}

/**
 * Track post view - sends to both stats API and blog posts API
 */
async function trackPostView(postId) {
    if (!postId) return;
    
    try {
        // Track via statistics API (records in page_views and post_stats tables)
        if (window.blogStatisticsManager && typeof window.blogStatisticsManager.trackPageView === 'function') {
            window.blogStatisticsManager.trackPageView(postId, window.location.href);
        } else {
            // Direct API call as fallback
            fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'page_view',
                    post_id: postId,
                    page_url: window.location.href,
                    referrer: document.referrer
                })
            }).catch(e => console.warn('Stats tracking error:', e));
        }
        
        // Also increment view count on the blog post itself
        if (window.blogDataManager && typeof window.blogDataManager.incrementViews === 'function') {
            window.blogDataManager.incrementViews(postId);
        } else {
            // Direct API call as fallback
            fetch(`/api/blog/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ increment: 'views' })
            }).catch(e => console.warn('View increment error:', e));
        }
        
        console.log('Post view tracked:', postId);
    } catch (error) {
        console.error('Error tracking post view:', error);
    }
}

// Expose for external use
window.trackPostView = trackPostView;
