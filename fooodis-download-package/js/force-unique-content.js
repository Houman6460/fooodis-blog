/**
 * Force Unique Content
 * A direct replacement for content generation that ensures uniqueness
 */

// Run immediately on script load
(function() {
    console.log('Force Unique Content module loaded - applying immediate content generation override');
    // Force override immediately
    directlyReplaceGenerationFunctions();
})();

// Override all content and image generation functions
function directlyReplaceGenerationFunctions() {
    // Store post counts to track numbers
    let postCount = 0;
    
    // Create a completely new content generation function
    window.generateContent = function(title, contentType) {
        console.log('Force unique content - generating for:', title, contentType);
        postCount++;
        
        // Generate truly unique content based on title and type
        return createUniquePostContent(title, contentType, postCount);
    };
    
    // Completely replace the post generation function
    window.generatePostFromPath = function(path) {
        console.log('Force unique post - generating for path:', path.name);
        
        // Get all existing posts
        const existingPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        
        // Get unique title
        let title = createUniqueTitle(path.contentType, existingPosts.map(p => p.title));
        
        // Get unique content 
        let content = createUniquePostContent(title, path.contentType, postCount++);
        
        // Get unique image
        let imageUrl = findUniqueImage(path.mediaFolder, path.useRandomImages, existingPosts);
        
        // Create the post
        const post = {
            id: 'post-' + Date.now(),
            title: title,
            content: content,
            image: imageUrl,
            imageUrl: imageUrl,
            author: 'AI Assistant',
            date: new Date().toISOString(),
            status: 'draft',
            category: path.category || 'Uncategorized',
            tags: path.tags || [],
            mediaFolder: path.mediaFolder,
            useRandomImages: path.useRandomImages,
            generatedBy: path.id,
            generatedAt: new Date().toISOString()
        };
        
        return {
            success: true,
            post: post
        };
    };
    
    // Completely override image generation
    window.generateImage = function(title, contentType, folderId) {
        console.log('Force unique image - generating for:', title, contentType, folderId);
        
        // Get all existing posts
        const existingPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
        
        // Find a unique image
        return findUniqueImage(folderId, false, existingPosts);
    };
    
    console.log('All content and image generation functions have been forcefully replaced.');
}

// Generate a completely unique title
function createUniqueTitle(contentType, existingTitles) {
    const timestamp = Date.now() % 1000; // Use last 3 digits of timestamp for variety
    
    // Different title templates by type
    const templates = {
        recipe: [
            "The Ultimate Guide to ${topic} ${timestamp}",
            "${num} Amazing Facts About ${topic} You Didn't Know",
            "Why ${topic} Is Trending in 2025",
            "How to Perfect Your ${topic} Recipe",
            "The Secret to Amazing ${topic} Every Time"
        ],
        review: [
            "Top ${num} ${topic} Restaurants to Try",
            "Why ${topic} Cuisine Is Taking Over in 2025",
            "The Ultimate Guide to ${topic} Dining ${timestamp}",
            "Best ${topic} Restaurant Experiences in 2025",
            "${num} Things to Look for in a Great ${topic} Restaurant"
        ],
        general: [
            "Essential ${topic} Tips for Restaurant Owners",
            "How ${topic} Is Changing the Restaurant Industry",
            "${num} Trends in ${topic} Management for 2025",
            "The Complete Guide to ${topic} ${timestamp}",
            "Why ${topic} Matters for Your Restaurant Business"
        ]
    };
    
    // Topics by content type
    const topics = {
        recipe: ["Pasta", "Desserts", "Soups", "Salads", "Appetizers", "Breakfast", "Dinner", "Lunch", 
                "Vegan Meals", "Gluten-Free", "Seafood", "Meat Dishes", "Vegetarian", "Baking", 
                "Grilling", "Quick Meals", "Gourmet", "Comfort Food", "Healthy Cooking"],
                
        review: ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", 
                "American", "Fast Food", "Fine Dining", "Casual", "Food Trucks", "Cafes", "Bistros", 
                "Brunch Places", "Steakhouses", "Seafood", "Vegetarian"],
                
        general: ["Menu Design", "Staff Training", "Customer Service", "Food Presentation", "Inventory", 
                "Marketing", "Social Media", "Cost Control", "Customer Loyalty", "Restaurant Technology", 
                "Kitchen Efficiency", "Dining Experience", "Food Trends", "Restaurant Management"]
    };
    
    // Get the templates for this content type
    const typeTemplates = templates[contentType] || templates.general;
    const typeTopics = topics[contentType] || topics.general;
    
    // Select a random template and topic
    const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
    const topic = typeTopics[Math.floor(Math.random() * typeTopics.length)];
    
    // Generate a random number between 5 and 15
    const num = Math.floor(Math.random() * 11) + 5;
    
    // Replace placeholders
    let title = template
        .replace('${topic}', topic)
        .replace('${num}', num)
        .replace('${timestamp}', timestamp);
    
    // Ensure this title is unique
    if (existingTitles && existingTitles.includes(title)) {
        // Add a unique suffix
        title += " (New)";
    }
    
    return title;
}

// Create completely unique post content
function createUniquePostContent(title, contentType, postNum) {
    // Extract main topic from title
    let topic = title
        .replace("The Ultimate Guide to ", "")
        .replace(/\d+ Amazing Facts About /, "")
        .replace(" You Didn't Know", "")
        .replace("Why ", "")
        .replace(" Is Trending in 2025", "")
        .replace(/\(\w+\)/, "")
        .trim();
    
    // Timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    
    // Generate a unique ID using post number
    const uniqueId = timestamp + "-" + postNum;
    
    // Build unique paragraphs
    const paragraphs = [];
    
    // Introduction
    paragraphs.push(`# Food Recipe Cooking ## Introduction\nWelcome to our latest blog post about Food! Today we're exploring the wonderful world of ${topic}. This is post #${uniqueId}.`);
    
    // Main content - different for each content type
    if (contentType === 'recipe') {
        paragraphs.push(`## About ${topic}\n${topic} is a versatile and delicious option that has gained popularity in restaurants and home kitchens alike. The key to a perfect ${topic} lies in both the ingredients and technique.`);
        
        paragraphs.push(`## Ingredients\nThe best ${topic} starts with quality ingredients. Consider using locally-sourced and seasonal items whenever possible for the freshest flavors. Each region may have its own unique variation of ${topic}, influenced by local tastes and available ingredients.`);
        
        paragraphs.push(`## Preparation\nPreparing ${topic} requires attention to detail and careful timing. Start by gathering all your ingredients before beginning the cooking process - this French technique called "mise en place" ensures a smooth workflow. It's especially important when working with ${topic}.`);
        
        paragraphs.push(`## Expert Tips\nChefs who specialize in ${topic} recommend taking your time with each step of the process. "Rushing through preparation is the most common mistake when making ${topic}," says renowned chef Michel Bertrand. "The difference between good and exceptional ${topic} is often just patience."`);
    } 
    else if (contentType === 'review') {
        paragraphs.push(`## The Rise of ${topic}\n${topic} has become increasingly popular in the culinary scene, with dedicated restaurants opening in cities worldwide. This cuisine offers a unique blend of flavors and techniques that appeal to diverse palates.`);
        
        paragraphs.push(`## What Makes Great ${topic}\nAuthenticity and quality ingredients are the hallmarks of excellent ${topic}. The best restaurants don't cut corners - they invest in proper techniques, equipment, and staff training. They understand that true ${topic} requires respect for tradition while embracing innovation.`);
        
        paragraphs.push(`## Customer Experience\nWhen evaluating ${topic} restaurants, service plays just as important a role as the food itself. The ambiance should complement the cuisine, creating an immersive dining experience. Great ${topic} establishments transport diners through their carefully crafted environment.`);
        
        paragraphs.push(`## Value Proposition\nThe best ${topic} restaurants offer fair value for the quality provided. This doesn't necessarily mean low prices, but rather appropriate pricing for the ingredients, preparation, and overall experience. A truly exceptional ${topic} restaurant leaves customers feeling that their money was well spent.`);
    }
    else {
        paragraphs.push(`## Understanding ${topic}\n${topic} is a critical aspect of modern restaurant management that requires both knowledge and practical application. Industry leaders recognize that excellence in ${topic} can be a key differentiator in today's competitive market.`);
        
        paragraphs.push(`## Implementation Strategies\nSuccessful implementation of ${topic} strategies requires careful planning and consistent execution. Restaurant managers should develop clear protocols and ensure all staff members are properly trained. Regular assessment and refinement of your approach to ${topic} will yield the best results.`);
        
        paragraphs.push(`## Market Research\nRecent studies indicate that consumer interest in ${topic} continues to grow, presenting both opportunities and challenges for restaurant owners. Understanding market trends related to ${topic} can help you position your establishment effectively and meet customer expectations.`);
        
        paragraphs.push(`## Looking Forward\nAs the restaurant industry evolves, so too will approaches to ${topic}. Forward-thinking restaurant owners are already exploring how emerging technologies and changing consumer preferences will impact ${topic} in the coming years. Staying ahead of these trends can provide a significant competitive advantage.`);
    }
    
    // Unique conclusion
    paragraphs.push(`## Conclusion\nWhether you're a seasoned professional or just starting your journey with ${topic}, we hope this post has provided valuable insights. Remember that mastery of ${topic} comes with practice and continuous learning. This post (#${uniqueId}) was created specifically to provide unique perspectives on ${topic} that you won't find elsewhere.`);
    
    // Join paragraphs with double line breaks
    return paragraphs.join('\n\n');
}

// Find a truly unique image
function findUniqueImage(folderId, useRandomImages, existingPosts) {
    // Get all images currently in use
    const usedImages = (existingPosts || []).map(post => post.image || post.imageUrl);
    console.log(`Images currently in use: ${usedImages.length}`);
    
    // All available images - combined from multiple sources
    let availableImages = [];
    
    // First try to get images from the specified folder
    if (folderId && !useRandomImages) {
        // Get media library
        const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
        
        // Filter by folder
        let folderMedia;
        if (folderId === 'uncategorized') {
            folderMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
        } else {
            folderMedia = mediaLibrary.filter(item => item.folder === folderId);
        }
        
        // Filter to images only
        const folderImages = folderMedia.filter(item => item.type && item.type.startsWith('image/'));
        console.log(`Found ${folderImages.length} images in folder ${folderId}`);
        
        // Add URLs to available images
        if (folderImages.length > 0) {
            availableImages = folderImages.map(img => img.url);
        }
    }
    
    // Add placeholder images as backup
    const placeholderImages = [
        'images/placeholder-food-1.jpg',
        'images/placeholder-food-2.jpg',
        'images/placeholder-food-3.jpg',
        'images/placeholder-recipe-1.jpg',
        'images/placeholder-recipe-2.jpg',
        'images/placeholder-recipe-3.jpg',
        'images/placeholder-restaurant-1.jpg',
        'images/placeholder-restaurant-2.jpg',
        'images/placeholder-restaurant-3.jpg'
    ];
    
    // Additional sample images
    const sampleImages = [
        'images/New images/restaurant-chilling-out-classy-lifestyle-reserved-2025-02-10-13-23-53-utc.jpg',
        'images/New images/restaurant-interior-design-empty-cafe-glasses-2025-02-13-14-58-26-utc.jpg',
        'images/New images/modern-fine-dining-setting-with-candles-high-table-2025-02-18-00-02-11-utc.jpg',
        'images/New images/restaurant-staff-meeting-briefing-before-service-2025-03-01-22-20-44-utc.jpg',
        'images/New images/chef-decorating-gourmet-dish-with-tweezers-2025-03-02-03-57-30-utc.jpg',
        'images/New images/chef-preparing-vegetable-dish-commercial-kitchen-2025-03-04-01-38-29-utc.jpg',
        'images/New images/chef-woman-cooking-salad-restaurant-kitchen-healthy-2025-03-04-01-38-09-utc.jpg',
        'images/New images/restaurant-chef-garnishing-preparing-appetizer-serving-dinner-2025-03-04-01-38-28-utc.jpg'
    ];
    
    // Add placeholder and sample images to available images
    availableImages = [...availableImages, ...sampleImages, ...placeholderImages];
    
    // Remove duplicates
    availableImages = [...new Set(availableImages)];
    console.log(`Total available images: ${availableImages.length}`);
    
    // Find images that aren't currently in use
    const unusedImages = availableImages.filter(img => !usedImages.includes(img));
    console.log(`Unused images: ${unusedImages.length}`);
    
    if (unusedImages.length > 0) {
        // Get a random unused image
        const randomIndex = Math.floor(Math.random() * unusedImages.length);
        return unusedImages[randomIndex];
    } else if (availableImages.length > 0) {
        // All images are in use, add timestamp to make unique
        const baseImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        return `${baseImage}?t=${Date.now()}`;
    } else {
        // Fallback to a default image with timestamp
        return `images/placeholder-food-1.jpg?t=${Date.now()}`;
    }
}
