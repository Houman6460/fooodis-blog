/**
 * Auto Hashtags
 * Automatically adds relevant hashtags to the end of each blog post
 */

// Execute immediately when loaded
(function() {
    console.log('Auto Hashtags: Initializing...');
    
    // Apply the hashtag generator to blog content
    document.addEventListener('DOMContentLoaded', function() {
        applyAutoHashtags();
    });
    
    // Also apply on window load
    window.addEventListener('load', function() {
        applyAutoHashtags();
        // Apply again after a delay to catch any late initializations
        setTimeout(applyAutoHashtags, 1000);
    });
})();

/**
 * Apply automatic hashtags to blog content
 */
function applyAutoHashtags() {
    console.log('Auto Hashtags: Applying hashtags to blog content');
    
    // Override the openBlogPostModal function to add hashtags
    if (typeof window.openBlogPostModal === 'function') {
        console.log('Auto Hashtags: Found openBlogPostModal function');
        
        // Store the original function
        const originalOpenModal = window.openBlogPostModal;
        
        // Replace with our enhanced version
        window.openBlogPostModal = function(postId) {
            console.log('Auto Hashtags: Enhanced openBlogPostModal called for post', postId);
            
            // Call the original function first
            originalOpenModal(postId);
            
            // Add hashtags after a short delay to ensure content is loaded
            setTimeout(function() {
                addHashtagsToModal(postId);
            }, 150);
        };
        
        console.log('Auto Hashtags: Successfully overrode openBlogPostModal function');
    }
    
    // If the renderMarkdown function exists, enhance it to add hashtags to rendered content
    if (typeof window.renderMarkdown === 'function') {
        console.log('Auto Hashtags: Found renderMarkdown function');
        
        // Store the original function
        const originalRenderMarkdown = window.renderMarkdown;
        
        // Replace with our enhanced version
        window.renderMarkdown = function(content) {
            // Add hashtags to the content if they don't already exist
            if (!hasHashtags(content)) {
                content = addHashtagsToContent(content);
            }
            
            // Call the original function with the enhanced content
            return originalRenderMarkdown(content);
        };
        
        console.log('Auto Hashtags: Successfully enhanced renderMarkdown function');
    }
    
    // Override newGenerateFallbackContent to add hashtags to newly generated content
    if (typeof window.newGenerateFallbackContent === 'function') {
        console.log('Auto Hashtags: Found newGenerateFallbackContent function');
        
        // Store the original function
        const originalGenerate = window.newGenerateFallbackContent;
        
        // Replace with our enhanced version
        window.newGenerateFallbackContent = function(prompt) {
            // Call the original function first
            let content = originalGenerate(prompt);
            
            // Add hashtags to the content if they don't already exist
            if (!hasHashtags(content)) {
                content = addHashtagsToContent(content, prompt);
            }
            
            return content;
        };
        
        console.log('Auto Hashtags: Successfully enhanced newGenerateFallbackContent function');
    }
    
    // Override original blog content if needed for featured posts on main page
    enhanceExistingPosts();
}

/**
 * Add hashtags to the modal content
 */
function addHashtagsToModal(postId) {
    // Find the blog posts data
    const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
    const post = blogPosts.find(post => post.id === postId);
    
    if (!post) {
        console.error('Auto Hashtags: Post not found');
        return;
    }
    
    // Find the modal content element
    const modalContentText = document.querySelector('.modal-content-text');
    if (!modalContentText) {
        console.error('Auto Hashtags: Modal content element not found');
        return;
    }
    
    // Get the content
    let content = modalContentText.innerHTML;
    
    // Remove any existing plain text hashtags section from the content (## Hashtags)
    const hashtagSectionRegex = /<h2[^>]*>\s*Hashtags\s*<\/h2>\s*<p>([^<]*)<\/p>/i;
    if (hashtagSectionRegex.test(content)) {
        console.log('Auto Hashtags: Removing plain text hashtags section');
        content = content.replace(hashtagSectionRegex, '');
    }
    
    // Also check for heading without paragraph
    const hashtagHeadingRegex = /<h2[^>]*>\s*Hashtags\s*<\/h2>/i;
    if (hashtagHeadingRegex.test(content)) {
        console.log('Auto Hashtags: Removing hashtags heading');
        content = content.replace(hashtagHeadingRegex, '');
    }
    
    // Check if styled hashtags already exist
    if (content.includes('<div class="post-hashtags">')) {
        console.log('Auto Hashtags: Styled hashtags already exist in the modal');
        // Update the content with the plain text section removed
        modalContentText.innerHTML = content;
        return;
    }
    
    // Generate hashtags based on post title, category, and content
    const hashtags = generateHashtags(post.title, post.category, post.content);
    
    // Add hashtags section
    const hashtagsHTML = createHashtagsHTML(hashtags);
    modalContentText.innerHTML = content + hashtagsHTML;
    
    console.log('Auto Hashtags: Added hashtags to modal content');
}

/**
 * Check if content already has hashtags
 */
function hasHashtags(content) {
    return content.includes('## Hashtags') || 
           content.includes('<div class="post-hashtags">') ||
           content.includes('#hashtag');
}

/**
 * Add hashtags to content
 */
function addHashtagsToContent(content, prompt) {
    // Extract title and other metadata from content
    let title = '';
    let category = '';
    
    // Try to extract title from content
    const titleMatch = content.match(/# (.+?)(\r?\n|$)/);
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
    }
    
    // Try to extract title from prompt if available
    if (prompt && typeof prompt === 'object' && prompt.title) {
        title = prompt.title;
    }
    
    // Try to extract category from prompt
    if (prompt && typeof prompt === 'object' && prompt.category) {
        category = prompt.category;
    }
    
    // Generate hashtags
    const hashtags = generateHashtags(title, category, content);
    
    // Format hashtags in markdown - but don't actually add them as they'll be shown in the styled section
    const hashtagsMarkdown = '';
    
    // Add hashtags to content
    return content + hashtagsMarkdown;
}

/**
 * Generate relevant hashtags based on post content
 */
function generateHashtags(title, category, content) {
    // Set of common restaurant/food related hashtags
    const commonHashtags = [
        'restaurant', 'food', 'foodie', 'dining', 'chef', 'cuisine', 'culinary',
        'delicious', 'fooodis', 'hospitality', 'foodservice', 'restaurantlife'
    ];
    
    // Create set to avoid duplicates
    const hashtagSet = new Set();
    
    // Always include fooodis hashtag
    hashtagSet.add('fooodis');
    
    // Add category based hashtags
    if (category) {
        const formattedCategory = formatAsHashtag(category);
        hashtagSet.add(formattedCategory);
        
        // Add variations
        if (formattedCategory !== 'restaurant') {
            hashtagSet.add(formattedCategory + 'tips');
        }
    }
    
    // Add hashtags based on title
    if (title) {
        // Extract key terms from title
        const words = title.toLowerCase().split(/\s+/);
        const stopWords = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'and', 'or', 'but'];
        
        // Process key terms from title
        words.forEach(word => {
            if (word.length > 3 && !stopWords.includes(word)) {
                if (word === 'restaurant' || word === 'restaurants') {
                    hashtagSet.add('restaurant');
                } else if (word === 'food' || word === 'foods') {
                    hashtagSet.add('food');
                } else if (word === 'chef' || word === 'chefs') {
                    hashtagSet.add('chef');
                } else if (word.length <= 15) { // Avoid excessively long hashtags
                    hashtagSet.add(formatAsHashtag(word));
                }
            }
        });
        
        // Process multi-word hashtags for important concepts
        const keyPhrases = extractKeyPhrases(title);
        keyPhrases.forEach(phrase => {
            if (phrase.length <= 20) { // Reasonable length for hashtags
                hashtagSet.add(formatAsHashtag(phrase));
            }
        });
    }
    
    // Extract topics from content
    extractTopicsFromContent(content).forEach(topic => {
        hashtagSet.add(topic);
    });
    
    // Add common hashtags if we don't have enough yet
    if (hashtagSet.size < 6) {
        // Shuffle and take some common hashtags
        const shuffledCommon = commonHashtags.sort(() => 0.5 - Math.random());
        let i = 0;
        while (hashtagSet.size < 8 && i < shuffledCommon.length) {
            hashtagSet.add(shuffledCommon[i]);
            i++;
        }
    }
    
    // Limit to a reasonable number of hashtags (8-12)
    return Array.from(hashtagSet).slice(0, 10);
}

/**
 * Extract key phrases from text for multi-word hashtags
 */
function extractKeyPhrases(text) {
    const phrases = [];
    
    // Look for key business concepts
    const businessConcepts = [
        'online ordering', 'food delivery', 'customer service', 'restaurant management',
        'menu design', 'staff training', 'inventory management', 'cost control',
        'food safety', 'restaurant marketing', 'customer loyalty', 'restaurant technology',
        'social media', 'digital marketing', 'restaurant operations', 'restaurant success',
        'food trends', 'kitchen efficiency', 'culinary innovation', 'dining experience'
    ];
    
    businessConcepts.forEach(concept => {
        if (text.toLowerCase().includes(concept)) {
            phrases.push(concept);
        }
    });
    
    return phrases;
}

/**
 * Extract relevant topics from post content
 */
function extractTopicsFromContent(content) {
    const topics = [];
    
    // Define topic categories and related keywords
    const topicCategories = {
        'restaurantmanagement': ['manage', 'management', 'operations', 'staff', 'team', 'training', 'leadership'],
        'foodservice': ['service', 'serving', 'waitstaff', 'front-of-house', 'customer experience'],
        'culinary': ['cooking', 'recipe', 'ingredients', 'chef', 'kitchen', 'food', 'dish', 'menu'],
        'businesstips': ['business', 'strategy', 'growth', 'profit', 'revenue', 'success', 'improvement'],
        'marketing': ['marketing', 'promotion', 'advertis', 'social media', 'customers', 'audience'],
        'technology': ['tech', 'technology', 'digital', 'software', 'app', 'online', 'system'],
        'sustainability': ['sustainable', 'green', 'eco', 'environment', 'waste', 'recycle'],
        'foodtrends': ['trend', 'popular', 'emerging', 'new', 'innovative', 'creative']
    };
    
    // Normalize content for searching
    const normalizedContent = content.toLowerCase();
    
    // Check each topic category
    Object.entries(topicCategories).forEach(([category, keywords]) => {
        // Check if any keywords from this category appear in the content
        const hasKeywords = keywords.some(keyword => normalizedContent.includes(keyword));
        
        if (hasKeywords) {
            topics.push(category);
        }
    });
    
    return topics;
}

/**
 * Format text as a hashtag (remove spaces, special chars)
 */
function formatAsHashtag(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, '') // Remove spaces
        .trim();
}

/**
 * Create HTML for hashtags section
 */
function createHashtagsHTML(hashtags) {
    const hashtagsHTML = `
        <div class="post-hashtags">
            <div class="hashtags-title">Hashtags</div>
            <div class="hashtags-container">
                ${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
            </div>
        </div>
    `;
    
    // Also inject the CSS if not already present
    injectHashtagsCSS();
    
    return hashtagsHTML;
}

/**
 * Inject CSS for hashtags styling
 */
function injectHashtagsCSS() {
    if (!document.getElementById('hashtags-css')) {
        const style = document.createElement('style');
        style.id = 'hashtags-css';
        style.textContent = `
            .post-hashtags {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .hashtags-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 10px;
                color: #fff;
            }
            
            .hashtags-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .hashtag {
                display: inline-block;
                background-color: rgba(232, 242, 76, 0.15);
                color: #e8f24c;
                border: 1px solid rgba(232, 242, 76, 0.3);
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }
            
            .hashtag:hover {
                background-color: rgba(232, 242, 76, 0.25);
                border-color: rgba(232, 242, 76, 0.5);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
        console.log('Auto Hashtags: Injected hashtags CSS');
    }
}

/**
 * Enhance existing posts with hashtags in localStorage
 */
function enhanceExistingPosts() {
    try {
        // Get existing posts
        const blogPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        let modified = false;
        
        // Add hashtags to each post that doesn't have them
        blogPosts.forEach(post => {
            if (post.content && !hasHashtags(post.content)) {
                post.content = addHashtagsToContent(post.content, { title: post.title, category: post.category });
                modified = true;
            }
        });
        
        // Save back to localStorage if modified
        if (modified) {
            localStorage.setItem('fooodis-blog-posts', JSON.stringify(blogPosts));
            console.log('Auto Hashtags: Enhanced existing posts with hashtags');
        }
    } catch (error) {
        console.error('Auto Hashtags: Error enhancing existing posts', error);
    }
}
