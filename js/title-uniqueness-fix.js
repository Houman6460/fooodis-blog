/**
 * Title Uniqueness Fix
 * Ensures each post gets a completely unique title
 */

// Execute immediately
(function() {
    console.log('Title Uniqueness Fix: Initializing...');
    
    // Track titles we've seen
    window.usedTitles = window.usedTitles || [];
    
    // Apply fixes when DOM is ready and after window load
    applyTitleFixes();
    window.addEventListener('load', function() {
        applyTitleFixes();
        setTimeout(applyTitleFixes, 1000);
    });
})();

/**
 * Apply title generation fixes
 */
function applyTitleFixes() {
    // Replace the generateTitle function if it exists
    if (typeof window.generateTitle === 'function') {
        console.log('Title Uniqueness Fix: Found global generateTitle function, replacing it');
        const originalGenerateTitle = window.generateTitle;
        
        window.generateTitle = function() {
            console.log('Title Uniqueness Fix: Intercepted generateTitle call');
            
            // Call the original function
            const originalResult = originalGenerateTitle.apply(this, arguments);
            
            // If the result is a promise, handle it
            if (originalResult && typeof originalResult.then === 'function') {
                return originalResult.then(title => {
                    return makeUniqueTitle(title);
                });
            }
            
            // Otherwise, make the title unique directly
            return makeUniqueTitle(originalResult);
        };
    }
    
    // Override AI Automation title generation functions
    overrideAutomationTitleFunctions();
    
    // Create a backup method
    window.getUniqueTitle = function(baseTitle, contentType) {
        return createCompletelyNewTitle(contentType, window.usedTitles);
    };
    
    console.log('Title Uniqueness Fix: Initialization complete');
}

/**
 * Override all title generation functions in the AI Automation system
 */
function overrideAutomationTitleFunctions() {
    // Find the main AI Automation script
    const aiAutomationScript = document.querySelector('script[src*="ai-automation.js"]');
    
    if (aiAutomationScript) {
        console.log('Title Uniqueness Fix: Found AI Automation script, injecting overrides');
        
        // Create a script to inject our overrides
        const script = document.createElement('script');
        script.textContent = `
            // Override all title generation functions
            (function() {
                // Fix the title function available in automation
                if (typeof generateTitle === 'function') {
                    console.log('Title Uniqueness Fix: Overriding automation generateTitle');
                    const originalGenerateTitle = generateTitle;
                    
                    generateTitle = function(contentType, topics) {
                        console.log('Title Uniqueness Fix: Called automation generateTitle');
                        
                        // Generate a completely new title
                        const uniqueTitle = createCompletelyNewTitle(contentType, window.usedTitles || []);
                        console.log('Title Uniqueness Fix: Generated unique title:', uniqueTitle);
                        
                        // Track this title
                        if (!window.usedTitles) window.usedTitles = [];
                        window.usedTitles.push(uniqueTitle);
                        
                        return uniqueTitle;
                    };
                }
            })();
        `;
        
        // Append it after the AI Automation script
        aiAutomationScript.parentNode.insertBefore(script, aiAutomationScript.nextSibling);
    }
}

/**
 * Make a title unique by checking against previously used titles
 * @param {string} title - The original title
 * @returns {string} - A unique title
 */
function makeUniqueTitle(title) {
    if (!title) {
        return createCompletelyNewTitle('general', window.usedTitles);
    }
    
    // Initialize the used titles array if it doesn't exist
    if (!window.usedTitles) {
        window.usedTitles = [];
    }
    
    // Check if this title has been used before
    if (window.usedTitles.includes(title)) {
        console.log('Title Uniqueness Fix: Detected duplicate title, creating unique version');
        
        // Add a timestamp to make it unique
        const timestamp = new Date().toISOString().slice(11, 16).replace(':', '');
        const uniqueTitle = `${title} (${timestamp})`;
        
        // Track this title
        window.usedTitles.push(uniqueTitle);
        
        return uniqueTitle;
    }
    
    // Track this title
    window.usedTitles.push(title);
    
    return title;
}

/**
 * Create a completely new title from scratch
 * @param {string} contentType - The content type
 * @param {Array} existingTitles - List of existing titles
 * @returns {string} - A unique title
 */
function createCompletelyNewTitle(contentType, existingTitles) {
    // Different title templates by type
    const templates = {
        recipe: [
            "The Ultimate Guide to ${topic} ${timestamp}",
            "${num} Amazing Facts About ${topic} You Didn't Know",
            "Why ${topic} Is Trending in 2025",
            "How to Perfect Your ${topic} Recipe",
            "The Secret to Amazing ${topic} Every Time",
            "Essential ${topic} Techniques for Professional Results",
            "Mastering ${topic}: A Chef's Perspective",
            "Seasonal ${topic} Variations to Try This Month",
            "${topic} Around the World: Global Inspirations",
            "Reinventing Classic ${topic} for Modern Tastes"
        ],
        review: [
            "Top ${num} ${topic} Restaurants to Try",
            "Why ${topic} Cuisine Is Taking Over in 2025",
            "The Ultimate Guide to ${topic} Dining ${timestamp}",
            "Best ${topic} Restaurant Experiences in 2025",
            "${num} Things to Look for in a Great ${topic} Restaurant",
            "Inside the Kitchens of Leading ${topic} Restaurants",
            "The Evolution of ${topic} Cuisine: Traditional to Modern",
            "Authentic ${topic} Dining: What Makes It Special",
            "The Rising Stars of ${topic} Cuisine in 2025",
            "${topic} Restaurant Awards: This Year's Winners"
        ],
        general: [
            "Essential ${topic} Tips for Restaurant Owners",
            "How ${topic} Is Changing the Restaurant Industry",
            "${num} Trends in ${topic} Management for 2025",
            "The Complete Guide to ${topic} ${timestamp}",
            "Why ${topic} Matters for Your Restaurant Business",
            "Innovative Approaches to ${topic} in Modern Restaurants",
            "Solving Common ${topic} Challenges in Restaurants",
            "The Future of ${topic}: Predictions for 2025 and Beyond",
            "Building a Culture of Excellence in ${topic}",
            "Strategic ${topic} Planning for Restaurant Success"
        ]
    };
    
    // Topics by content type
    const topics = {
        recipe: ["Pasta", "Desserts", "Soups", "Salads", "Appetizers", "Breakfast", "Dinner", "Lunch", 
                "Vegan Meals", "Gluten-Free", "Seafood", "Meat Dishes", "Vegetarian", "Baking", 
                "Grilling", "Quick Meals", "Gourmet", "Comfort Food", "Healthy Cooking", "Mediterranean",
                "Asian Fusion", "Latin American", "French Classics", "Italian Favorites", "Spicy Dishes",
                "Seasonal Cooking", "Farm-to-Table", "Sous Vide", "Fermentation", "Molecular Gastronomy"],
                
        review: ["Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Mediterranean", 
                "American", "Fast Food", "Fine Dining", "Casual", "Food Trucks", "Cafes", "Bistros", 
                "Brunch Places", "Steakhouses", "Seafood", "Vegetarian", "Fusion", "Korean", "Vietnamese",
                "Greek", "Spanish", "German", "Brazilian", "Caribbean", "Middle Eastern", "African",
                "Scandinavian"],
                
        general: ["Menu Design", "Staff Training", "Customer Service", "Food Presentation", "Inventory", 
                "Marketing", "Social Media", "Cost Control", "Customer Loyalty", "Restaurant Technology", 
                "Kitchen Efficiency", "Dining Experience", "Food Trends", "Restaurant Management",
                "Sustainable Practices", "Local Sourcing", "Online Ordering", "Delivery Services",
                "Health Regulations", "Safety Protocols", "Equipment Maintenance", "Restaurant Analytics",
                "Pricing Strategies", "Seasonal Menus", "Food Photography", "Customer Feedback",
                "Staff Retention", "Restaurant Automation", "Waste Reduction", "Energy Efficiency"]
    };
    
    // Get the templates for this content type
    const typeTemplates = templates[contentType] || templates.general;
    const typeTopics = topics[contentType] || topics.general;
    
    // Keep trying until we get a unique title
    let title;
    let attempts = 0;
    
    do {
        // Select a random template and topic
        const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
        const topic = typeTopics[Math.floor(Math.random() * typeTopics.length)];
        
        // Generate a random number between 5 and 15
        const num = Math.floor(Math.random() * 11) + 5;
        
        // Create timestamp-based unique identifier (last 3 digits of timestamp)
        const timestamp = Date.now() % 1000;
        
        // Replace placeholders
        title = template
            .replace('${topic}', topic)
            .replace('${num}', num)
            .replace('${timestamp}', timestamp);
        
        attempts++;
    } while (existingTitles.includes(title) && attempts < 5);
    
    // If we still have a duplicate after multiple attempts, add a truly unique timestamp
    if (existingTitles.includes(title)) {
        title += ` (${Date.now()})`;
    }
    
    // Track this title
    window.usedTitles.push(title);
    
    return title;
}
