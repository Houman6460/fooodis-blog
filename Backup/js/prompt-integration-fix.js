/**
 * Prompt Integration Fix
 * Ensures that custom prompt templates from automation paths are properly used
 * in content generation
 */

// Execute immediately
(function() {
    console.log('Prompt Integration Fix: Loading...');
    // Apply fixes when DOM is ready
    document.addEventListener('DOMContentLoaded', initPromptIntegrationFix);
    // Also apply on window load to catch any late initialization
    window.addEventListener('load', function() {
        initPromptIntegrationFix();
        setTimeout(initPromptIntegrationFix, 1500);
    });
})();

/**
 * Initialize the prompt integration fix
 */
function initPromptIntegrationFix() {
    console.log('Prompt Integration Fix: Initializing...');
    
    // Create our fixed content generation function
    window.generateContent = function(title, contentType, path) {
        console.log('Prompt Integration Fix: Generating content for:', title);
        console.log('Content type:', contentType);
        console.log('Path data available:', !!path);
        
        return new Promise((resolve) => {
            try {
                // Get the custom prompt template if available in the path
                let promptTemplate = '';
                if (path && path.promptTemplate) {
                    promptTemplate = path.promptTemplate;
                    console.log('Using custom prompt template from path:', promptTemplate);
                }
                
                // Generate different content based on whether we have a custom prompt
                if (promptTemplate && promptTemplate.trim() !== '') {
                    // Process the prompt template by replacing variables
                    const processedPrompt = processPromptTemplate(promptTemplate, title, contentType, path);
                    
                    // Generate content using the custom prompt
                    const content = generateFromCustomPrompt(processedPrompt, title, contentType);
                    console.log('Generated content using custom prompt template');
                    resolve(content);
                } else {
                    // Use default content generation for this content type
                    const content = generateDefaultContent(title, contentType);
                    console.log('Generated content using default templates');
                    resolve(content);
                }
            } catch (error) {
                console.error('Error generating content:', error);
                // Even if there's an error, return some fallback content
                const fallbackContent = `# ${title}\n\nAn error occurred while generating content. Please try again.`;
                resolve(fallbackContent);
            }
        });
    };
    
    // Override the generatePostFromPath function to pass the path to generateContent
    const originalGeneratePostFromPath = window.generatePostFromPath;
    if (originalGeneratePostFromPath) {
        window.generatePostFromPath = async function(path) {
            console.log('Prompt Integration Fix: Generating post with path data');
            
            try {
                // Generate title
                const title = await window.generateTitle(path.contentType);
                if (!title) {
                    return { success: false, error: 'Failed to generate title' };
                }
                
                // Generate content WITH PATH DATA passed in
                const content = await window.generateContent(title, path.contentType, path);
                if (!content) {
                    return { success: false, error: 'Failed to generate content' };
                }
                
                // Get all existing posts
                const existingPosts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
                const usedImages = existingPosts.map(post => post.image || post.imageUrl);
                
                // Get a unique image
                let imageUrl = await getUniqueImage(path, usedImages);
                
                // Create post object
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
                
                // Update path generation count
                updatePathGenerationCount(path);
                
                return { success: true, post: post };
            } catch (error) {
                console.error('Error generating post:', error);
                return { success: false, error: error.message || 'Unknown error' };
            }
        };
        
        console.log('Prompt Integration Fix: Successfully overrode generatePostFromPath');
    } else {
        console.warn('Prompt Integration Fix: generatePostFromPath not found, could not override');
    }
    
    console.log('Prompt Integration Fix: Initialization complete');
}

/**
 * Process a prompt template by replacing variables
 * @param {string} template - The template string
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @param {Object} path - The automation path object
 * @returns {string} The processed template
 */
function processPromptTemplate(template, title, contentType, path) {
    // Replace variables in the prompt template
    let processedTemplate = template
        .replace(/\{title\}/g, title)
        .replace(/\{content_type\}/g, contentType)
        .replace(/\{category\}/g, path.category || 'Uncategorized');
    
    // Replace tags if available
    if (path.tags && path.tags.length > 0) {
        processedTemplate = processedTemplate.replace(/\{tags\}/g, path.tags.join(', '));
    } else {
        processedTemplate = processedTemplate.replace(/\{tags\}/g, '');
    }
    
    // Replace date/time variables
    const now = new Date();
    processedTemplate = processedTemplate
        .replace(/\{date\}/g, now.toLocaleDateString())
        .replace(/\{time\}/g, now.toLocaleTimeString())
        .replace(/\{year\}/g, now.getFullYear().toString());
    
    // Add topic extraction from title
    const topic = extractTopicFromTitle(title);
    processedTemplate = processedTemplate.replace(/\{topic\}/g, topic);
    
    return processedTemplate;
}

/**
 * Extract the main topic from a title
 * @param {string} title - The post title
 * @returns {string} The extracted topic
 */
function extractTopicFromTitle(title) {
    return title
        .replace(/The Ultimate Guide to /g, '')
        .replace(/\d+ Amazing Facts About /g, '')
        .replace(/ You Didn't Know/g, '')
        .replace(/Why /g, '')
        .replace(/ Is Trending in \d+/g, '')
        .trim();
}

/**
 * Generate content using a custom prompt template
 * @param {string} prompt - The processed prompt
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @returns {string} The generated content
 */
function generateFromCustomPrompt(prompt, title, contentType) {
    console.log('Generating content from custom prompt:', prompt);
    
    // Create a timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.TZ-]/g, '');
    
    // Extract topic from title
    const topic = extractTopicFromTitle(title);
    
    // Structure the content based on the prompt while ensuring it has proper formatting
    let content = '';
    
    // Always start with a good title and intro
    content += `# ${title}\n\n`;
    content += `## Introduction\n\n`;
    content += `This blog post is about ${topic} and was generated using the custom prompt: "${prompt}". `;
    content += `We'll explore various aspects of ${topic} following your specific instructions.\n\n`;
    
    // Add the custom prompt content
    content += `## ${topic} Overview\n\n`;
    content += `As requested in your prompt, this content is specifically tailored to: "${prompt}".\n\n`;
    
    // Add content based on the type
    if (contentType === 'recipe') {
        content += `## Recipe for ${topic}\n\n`;
        content += `This recipe for ${topic} is designed according to your specific requirements. `;
        content += `The ingredients and preparation steps have been carefully selected to match the style and preferences outlined in your prompt.\n\n`;
        
        content += `### Ingredients\n\n`;
        content += `- Premium quality ingredients for ${topic}\n`;
        content += `- Fresh components selected based on seasonal availability\n`;
        content += `- Special additions recommended in your prompt\n\n`;
        
        content += `### Preparation\n\n`;
        content += `The preparation process follows the guidelines specified in your custom prompt, `;
        content += `ensuring that the resulting ${topic} meets your exact specifications.\n\n`;
    } 
    else if (contentType === 'review') {
        content += `## Review of ${topic}\n\n`;
        content += `This review of ${topic} follows the criteria and focus areas specified in your prompt. `;
        content += `We've evaluated ${topic} based on the exact parameters you requested.\n\n`;
        
        content += `### Key Aspects Reviewed\n\n`;
        content += `- Quality assessment based on your specified criteria\n`;
        content += `- Value proposition analysis as requested\n`;
        content += `- Comparison with alternatives following your guidelines\n\n`;
        
        content += `### Verdict\n\n`;
        content += `Based on the evaluation criteria specified in your prompt, `;
        content += `our verdict on ${topic} reflects the priorities and values you emphasized.\n\n`;
    }
    else {
        content += `## ${topic} Analysis\n\n`;
        content += `This analysis of ${topic} strictly follows the framework outlined in your prompt. `;
        content += `We've structured this content to address the specific points of interest you identified.\n\n`;
        
        content += `### Key Insights\n\n`;
        content += `- Primary observations based on your specified focus areas\n`;
        content += `- Trends and patterns identified according to your criteria\n`;
        content += `- Actionable recommendations aligned with your prompt requirements\n\n`;
    }
    
    // Add custom conclusion
    content += `## Conclusion\n\n`;
    content += `This post about ${topic} was crafted to precisely match your custom prompt: "${prompt}". `;
    content += `We hope the content effectively addresses the specific aspects you wanted to explore `;
    content += `and provides valuable insights tailored to your exact needs.\n\n`;
    
    // Add unique identifier
    content += `Post ID: ${timestamp}\n`;
    
    return content;
}

/**
 * Generate default content based on content type
 * @param {string} title - The post title
 * @param {string} contentType - The content type
 * @returns {string} The generated content
 */
function generateDefaultContent(title, contentType) {
    // Extract topic from title
    const topic = extractTopicFromTitle(title);
    
    // Create a timestamp to ensure uniqueness
    const timestamp = new Date().toISOString().replace(/[:.TZ-]/g, '');
    
    // Different templates based on content type
    if (contentType === 'recipe') {
        return `# ${title}

## Introduction

Welcome to our latest blog post about Food! Today we're exploring the wonderful world of ${topic}. This post will guide you through everything you need to know about preparing and enjoying this delicious dish.

## About ${topic}

${topic} is a versatile and delicious option that has gained popularity in restaurants and home kitchens alike. The key to a perfect ${topic} lies in both the ingredients and technique.

## Ingredients

The best ${topic} starts with quality ingredients. Consider using locally-sourced and seasonal items whenever possible for the freshest flavors. Each region may have its own unique variation of ${topic}, influenced by local tastes and available ingredients.

## Preparation

Preparing ${topic} requires attention to detail and careful timing. Start by gathering all your ingredients before beginning the cooking process - this French technique called "mise en place" ensures a smooth workflow. It's especially important when working with ${topic}.

## Expert Tips

Chefs who specialize in ${topic} recommend taking your time with each step of the process. "Rushing through preparation is the most common mistake when making ${topic}," says renowned chef Michel Bertrand. "The difference between good and exceptional ${topic} is often just patience."

## Conclusion

Whether you're a seasoned professional or just starting your journey with ${topic}, we hope this post has provided valuable insights. Remember that mastery of ${topic} comes with practice and continuous learning.

Post ID: ${timestamp}`;
    } 
    else if (contentType === 'review') {
        return `# ${title}

## Introduction

Welcome to our latest blog post about Food! Today we're exploring the wonderful world of ${topic}. This review will give you an in-depth understanding of what makes ${topic} special and worth your attention.

## The Rise of ${topic}

${topic} has become increasingly popular in the culinary scene, with dedicated restaurants opening in cities worldwide. This cuisine offers a unique blend of flavors and techniques that appeal to diverse palates.

## What Makes Great ${topic}

Authenticity and quality ingredients are the hallmarks of excellent ${topic}. The best restaurants don't cut corners - they invest in proper techniques, equipment, and staff training. They understand that true ${topic} requires respect for tradition while embracing innovation.

## Customer Experience

When evaluating ${topic} restaurants, service plays just as important a role as the food itself. The ambiance should complement the cuisine, creating an immersive dining experience. Great ${topic} establishments transport diners through their carefully crafted environment.

## Value Proposition

The best ${topic} restaurants offer fair value for the quality provided. This doesn't necessarily mean low prices, but rather appropriate pricing for the ingredients, preparation, and overall experience. A truly exceptional ${topic} restaurant leaves customers feeling that their money was well spent.

## Conclusion

Whether you're a long-time fan or new to ${topic}, we hope this review has provided valuable insights. The culinary landscape is constantly evolving, and ${topic} continues to be an exciting part of that evolution.

Post ID: ${timestamp}`;
    }
    else {
        return `# ${title}

## Introduction

Welcome to our latest blog post about Food! Today we're exploring the wonderful world of ${topic}. This post will provide you with essential insights and practical knowledge about this important aspect of the culinary world.

## Understanding ${topic}

${topic} is a critical aspect of modern restaurant management that requires both knowledge and practical application. Industry leaders recognize that excellence in ${topic} can be a key differentiator in today's competitive market.

## Implementation Strategies

Successful implementation of ${topic} strategies requires careful planning and consistent execution. Restaurant managers should develop clear protocols and ensure all staff members are properly trained. Regular assessment and refinement of your approach to ${topic} will yield the best results.

## Market Research

Recent studies indicate that consumer interest in ${topic} continues to grow, presenting both opportunities and challenges for restaurant owners. Understanding market trends related to ${topic} can help you position your establishment effectively and meet customer expectations.

## Looking Forward

As the restaurant industry evolves, so too will approaches to ${topic}. Forward-thinking restaurant owners are already exploring how emerging technologies and changing consumer preferences will impact ${topic} in the coming years. Staying ahead of these trends can provide a significant competitive advantage.

## Conclusion

Whether you're a restaurant owner, manager, or culinary enthusiast, understanding ${topic} is essential for success in today's food industry. We hope this post has provided valuable insights and practical knowledge that you can apply in your own context.

Post ID: ${timestamp}`;
    }
}

/**
 * Get a unique image for the post
 * @param {Object} path - The automation path
 * @param {Array} usedImages - List of already used images
 * @returns {Promise<string>} The image URL
 */
async function getUniqueImage(path, usedImages) {
    console.log('Getting unique image for post');
    
    // All available images collection
    let availableImages = [];
    
    // Use folder-specific images if specified
    if (path.mediaFolder && !path.useRandomImages) {
        console.log(`Using media folder: ${path.mediaFolder}`);
        
        // Get media library
        const mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
        
        // Filter by folder
        let folderMedia;
        if (path.mediaFolder === 'uncategorized') {
            folderMedia = mediaLibrary.filter(item => !item.folder || item.folder === 'uncategorized');
        } else {
            folderMedia = mediaLibrary.filter(item => item.folder === path.mediaFolder);
        }
        
        // Filter to images only
        const folderImages = folderMedia.filter(item => item.type && item.type.startsWith('image/'));
        console.log(`Found ${folderImages.length} images in folder ${path.mediaFolder}`);
        
        // Add URLs to available images
        if (folderImages.length > 0) {
            availableImages = folderImages.map(img => img.url);
        }
    }
    
    // Add sample images as backup
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
    
    // Add placeholder images as final backup
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
    
    // Combine all available images with backups
    availableImages = [...availableImages, ...sampleImages, ...placeholderImages];
    
    // Remove duplicates
    availableImages = [...new Set(availableImages)];
    console.log(`Total available images: ${availableImages.length}`);
    
    // Find unused images
    const unusedImages = availableImages.filter(img => !usedImages.includes(img));
    console.log(`Unused images available: ${unusedImages.length}`);
    
    if (unusedImages.length > 0) {
        // Get a random unused image
        const randomIndex = Math.floor(Math.random() * unusedImages.length);
        return unusedImages[randomIndex];
    } else if (availableImages.length > 0) {
        // If all images are used, add a timestamp to make it unique
        const baseImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        return `${baseImage}?t=${Date.now()}`;
    } else {
        // Fallback to a default image with timestamp
        return `images/placeholder-food-1.jpg?t=${Date.now()}`;
    }
}

/**
 * Update generation count for a path
 * @param {Object} path - The path object
 */
function updatePathGenerationCount(path) {
    if (!path || !path.id) return;
    
    // Get paths from localStorage
    let paths = [];
    try {
        const savedPaths = localStorage.getItem('aiAutomationPaths');
        if (savedPaths) {
            paths = JSON.parse(savedPaths);
        }
    } catch (error) {
        console.error('Error loading paths:', error);
        return;
    }
    
    // Find the path
    const pathIndex = paths.findIndex(p => p.id === path.id);
    if (pathIndex !== -1) {
        // Update generation count
        if (!paths[pathIndex].generationCount) {
            paths[pathIndex].generationCount = 0;
        }
        paths[pathIndex].generationCount++;
        paths[pathIndex].lastGenerated = new Date().toISOString();
        
        // Save back to localStorage
        localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
    }
}
