/**
 * Template Replacement Fix
 * This script completely replaces the hardcoded template generator
 */

// Execute immediately
(function() {
    console.log('Template Replacement: Initializing...');
    
    // Replace the fallback content generator function
    replaceTemplateGenerator();
    
    // Also try replacing it when the window loads (in case it's defined later)
    window.addEventListener('load', function() {
        replaceTemplateGenerator();
        setTimeout(replaceTemplateGenerator, 1000);
    });
})();

/**
 * Replace the template generator function
 */
function replaceTemplateGenerator() {
    // Target the function in the global scope
    if (typeof window.generateFallbackContent === 'function') {
        console.log('Template Replacement: Found original generateFallbackContent, replacing it');
        window.generateFallbackContent = newGenerateFallbackContent;
    }
    
    // Look for the function in ai-content-generator-fix.js scope
    try {
        const scriptTags = document.querySelectorAll('script[src*="ai-content-generator-fix.js"]');
        if (scriptTags.length > 0) {
            console.log('Template Replacement: Found ai-content-generator-fix.js script tag, injecting replacement');
            
            // Create a script element to inject our replacement
            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    // Replace the generateFallbackContent function
                    if (typeof generateFallbackContent === 'function') {
                        console.log('Template Replacement: Replacing generateFallbackContent in script scope');
                        generateFallbackContent = ${newGenerateFallbackContent.toString()};
                    }
                })();
            `;
            
            // Append it after the target script
            scriptTags[0].parentNode.insertBefore(script, scriptTags[0].nextSibling);
        }
    } catch (error) {
        console.error('Template Replacement: Error injecting replacement:', error);
    }
    
    // Override all AI config functions that might use the template
    if (window.aiConfig) {
        console.log('Template Replacement: Found aiConfig, overriding generateContent');
        
        // Override the generateContent function
        window.aiConfig.generateContent = function(prompt, callback) {
            console.log('Template Replacement: aiConfig.generateContent called with prompt:', prompt);
            
            return new Promise((resolve) => {
                try {
                    // Generate dynamic content based on the prompt
                    const content = newGenerateFallbackContent(prompt);
                    
                    // Extract title and excerpt
                    const title = extractTitle(content) || 'Generated Blog Post';
                    const excerpt = extractExcerpt(content) || 'Automatically generated content';
                    
                    // Create a response object
                    const response = {
                        success: true,
                        content: content,
                        title: title,
                        excerpt: excerpt
                    };
                    
                    // Call the callback if provided
                    if (typeof callback === 'function') {
                        setTimeout(() => callback(response), 500);
                    }
                    
                    // Resolve the promise
                    resolve({
                        success: true,
                        data: {
                            content: content,
                            title: title,
                            excerpt: excerpt
                        }
                    });
                } catch (error) {
                    console.error('Template Replacement: Error generating content:', error);
                    
                    const errorResponse = { success: false, error: error.message };
                    if (typeof callback === 'function') {
                        callback(errorResponse);
                    }
                    
                    resolve(errorResponse);
                }
            });
        };
    }
    
    console.log('Template Replacement: Completed replacement setup');
}

/**
 * New dynamic content generator that generates unique content
 * @param {Object|string} prompt - The prompt object or string
 * @returns {string} - Generated content
 */
function newGenerateFallbackContent(prompt) {
    console.log('Template Replacement: New generator called with prompt:', prompt);
    
    // Extract information from the prompt
    let title, category, tags, customPrompt;
    
    if (typeof prompt === 'object') {
        title = prompt.title || '';
        category = prompt.category || '';
        tags = prompt.tags || '';
        customPrompt = prompt.prompt || '';
    } else {
        title = prompt || '';
        customPrompt = prompt || '';
    }
    
    // Create a more descriptive title if none provided
    if (!title) {
        title = 'Culinary Insights: ' + new Date().toLocaleDateString();
    }
    
    // Extract keywords
    const keywords = extractKeywords(customPrompt || title);
    
    // Create a timestamp to ensure uniqueness
    const timestamp = Date.now();
    const uniqueId = 'post-' + timestamp;
    
    // Choose a dynamic template based on the timestamp
    const templateType = timestamp % 3;
    
    // Generate content based on template type
    if (templateType === 0) {
        return generateRecipeTemplate(title, keywords, uniqueId);
    } else if (templateType === 1) {
        return generateReviewTemplate(title, keywords, uniqueId);
    } else {
        return generateGuideTemplate(title, keywords, uniqueId);
    }
}

/**
 * Generate a recipe template
 * @param {string} title - The title
 * @param {Array} keywords - Keywords extracted from prompt
 * @param {string} uniqueId - Unique identifier
 * @returns {string} - Generated content
 */
function generateRecipeTemplate(title, keywords, uniqueId) {
    const mainIngredient = keywords[0] || 'fresh ingredients';
    const cuisine = keywords[1] || 'gourmet cuisine';
    const technique = keywords[2] || 'culinary techniques';
    
    return `# ${title}

## Introduction
Welcome to our exclusive recipe featuring ${mainIngredient}! This ${cuisine} inspired dish combines traditional flavors with modern ${technique} to create something truly special for your restaurant menu.

## Ingredients
For this signature dish, you'll need:

- 2 cups premium quality ${mainIngredient}
- 1/4 cup cold-pressed olive oil
- 2 tablespoons artisanal sea salt
- Fresh herbs (basil, thyme, and oregano)
- 1 teaspoon specialty spice blend
- 2 cloves organic garlic, minced

## Preparation Method
1. Begin by carefully preparing the ${mainIngredient}, ensuring it's properly cleaned and portioned
2. Heat the olive oil in a professional-grade pan over medium heat
3. Add the garlic and spices, stirring to release their aromas
4. Incorporate the ${mainIngredient} using proper ${technique} methods
5. Finish with fresh herbs and adjust seasoning to taste

## Presentation Tips
Plate this dish on pre-warmed dinnerware, garnishing with microgreens and a drizzle of infused oil. The visual presentation is just as important as the flavor profile for your restaurant guests.

## Wine Pairing
We recommend serving this with a crisp white wine or a light-bodied red that complements the ${mainIngredient} without overpowering it.

## Chef's Notes
This recipe can be adapted seasonally by substituting key ingredients based on availability and freshness. The foundation of proper ${technique} remains essential regardless of variations.

## Conclusion
This signature ${mainIngredient} dish showcases your restaurant's commitment to quality and innovation. Your customers will appreciate the attention to detail and exceptional flavor combinations.

Post ID: ${uniqueId}`;
}

/**
 * Generate a review template
 * @param {string} title - The title
 * @param {Array} keywords - Keywords extracted from prompt
 * @param {string} uniqueId - Unique identifier
 * @returns {string} - Generated content
 */
function generateReviewTemplate(title, keywords, uniqueId) {
    const restaurant = keywords[0] || 'fine dining establishment';
    const cuisine = keywords[1] || 'culinary experience';
    const highlight = keywords[2] || 'signature dishes';
    
    return `# ${title}

## Introduction
Our restaurant critics recently visited ${restaurant}, a notable ${cuisine} destination that has been generating buzz among food enthusiasts. This comprehensive review examines the quality, atmosphere, and overall dining experience.

## Ambiance & Setting
The atmosphere at ${restaurant} strikes a perfect balance between elegance and comfort. The thoughtful interior design creates an inviting environment that complements the ${cuisine} perfectly. Attention to lighting, acoustics, and seating arrangement demonstrates the owner's understanding of dining psychology.

## Service Quality
The staff demonstrated exceptional knowledge of the menu, including detailed information about ingredients, preparation methods, and appropriate wine pairings. Service was attentive without being intrusive, maintaining a professional demeanor throughout our visit.

## Menu Highlights
The ${highlight} deserve special recognition, showcasing the chef's technical skill and creative vision. Each dish presented a harmonious balance of flavors, textures, and visual appeal that elevated the ${cuisine} experience beyond ordinary restaurant fare.

## Value Assessment
While positioned in the premium segment, ${restaurant} delivers exceptional value through portion sizes, ingredient quality, and overall experience. The price point is justified by the culinary craftsmanship and attention to detail evident in every aspect of the meal.

## Recommendations
First-time visitors should consider the chef's tasting menu to experience the full range of ${highlight}. Reserve tables well in advance, particularly for weekend dining, as ${restaurant} has quickly become a sought-after destination.

## Conclusion
${restaurant} represents an outstanding addition to the local ${cuisine} scene, establishing new standards for quality and innovation. Our rating reflects the exceptional execution across all evaluation criteria, from food quality to service excellence.

Overall Rating: 4.7/5

Post ID: ${uniqueId}`;
}

/**
 * Generate a guide template
 * @param {string} title - The title
 * @param {Array} keywords - Keywords extracted from prompt
 * @param {string} uniqueId - Unique identifier
 * @returns {string} - Generated content
 */
function generateGuideTemplate(title, keywords, uniqueId) {
    const topic = keywords[0] || 'restaurant management';
    const strategy = keywords[1] || 'business strategies';
    const benefit = keywords[2] || 'operational efficiency';
    
    return `# ${title}

## Introduction
Effective ${topic} has become increasingly critical for restaurant success in today's competitive market. This guide explores proven ${strategy} that can significantly enhance your ${benefit} and customer satisfaction levels.

## Current Industry Challenges
Restaurant owners face unprecedented challenges, from shifting consumer preferences to rising operational costs. Understanding these challenges is the first step toward implementing effective ${topic} solutions that address specific pain points in your business.

## Implementing ${strategy}
Successful restaurants consistently apply these principles:

1. Data-driven decision making for menu engineering and pricing
2. Staff training programs that emphasize both technical skills and customer engagement
3. Technology integration that enhances rather than complicates ${topic}
4. Systematic quality control measures across all operational areas
5. Marketing approaches that leverage your unique brand positioning

## Measuring Success
Establishing clear metrics for ${benefit} allows you to track improvement and identify areas requiring additional attention. Key performance indicators should include customer satisfaction scores, table turnover rates, food cost percentage, and staff retention statistics.

## Technology Solutions
Modern restaurant management software can dramatically improve your ${benefit} by streamlining inventory management, reservation systems, staff scheduling, and customer relationship management. Select solutions that integrate well with your existing operations.

## Staff Development
Your team remains your most valuable asset in delivering exceptional customer experiences. Investing in comprehensive training and creating clear advancement pathways contributes significantly to improved ${benefit} and reduced turnover costs.

## Looking Forward
The restaurant industry continues to evolve rapidly, with new ${strategy} emerging regularly. Staying informed through industry publications, professional networks, and continuing education ensures your approach to ${topic} remains current and competitive.

## Conclusion
Mastering ${topic} requires ongoing commitment to excellence and willingness to adapt. By implementing these ${strategy}, your restaurant can achieve remarkable improvements in ${benefit} while building a sustainable competitive advantage.

Post ID: ${uniqueId}`;
}

/**
 * Extract keywords from a prompt
 * @param {string} prompt - The prompt
 * @returns {Array} - Keywords
 */
function extractKeywords(prompt) {
    if (!prompt) return ['food', 'recipe', 'cooking'];
    
    // Convert to string if needed
    if (typeof prompt !== 'string') {
        prompt = JSON.stringify(prompt);
    }
    
    // Remove common words and punctuation
    const cleanPrompt = prompt.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\b(the|and|or|but|for|with|about|from|to|in|on|at|by|of|a|an)\b/g, '');
    
    // Split into words
    const words = cleanPrompt.split(/\s+/);
    
    // Filter out short words and sort by length (longer words might be more meaningful)
    const sortedWords = words
        .filter(word => word.length > 3)
        .sort((a, b) => b.length - a.length);
    
    // Return top 3 words, or pad with defaults if needed
    const result = sortedWords.slice(0, 3);
    while (result.length < 3) {
        const defaults = ['culinary', 'restaurant', 'dining', 'food', 'recipe', 'menu', 'chef'];
        const randomDefault = defaults[Math.floor(Math.random() * defaults.length)];
        if (!result.includes(randomDefault)) {
            result.push(randomDefault);
        }
    }
    
    return result;
}

/**
 * Extract title from content
 * @param {string} content - The content
 * @returns {string} - The title
 */
function extractTitle(content) {
    if (!content) return null;
    
    // Try to find a title in the format "# Title"
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
    }
    
    return null;
}

/**
 * Extract excerpt from content
 * @param {string} content - The content
 * @returns {string} - The excerpt
 */
function extractExcerpt(content) {
    if (!content) return '';
    
    // Find the first paragraph after any headings
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
        // Skip headings and empty paragraphs
        if (!paragraph.startsWith('#') && paragraph.trim().length > 10) {
            // Return first 150 characters as excerpt
            return paragraph.trim().substring(0, 150) + '...';
        }
    }
    
    return '';
}
