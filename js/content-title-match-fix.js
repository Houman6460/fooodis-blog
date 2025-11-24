/**
 * Content-Title Match Fix
 * Ensures blog post content matches the title theme
 */

// Execute immediately when loaded
(function() {
    console.log('Content-Title Match Fix: Initializing...');
    
    // Apply the fix immediately
    applyContentTitleMatchFix();
    
    // Also apply on window load
    window.addEventListener('load', function() {
        applyContentTitleMatchFix();
        // Apply again after a delay to catch any late initializations
        setTimeout(applyContentTitleMatchFix, 1000);
        setTimeout(applyContentTitleMatchFix, 2000);
    });
})();

/**
 * Apply the content-title match fix
 */
function applyContentTitleMatchFix() {
    console.log('Content-Title Match Fix: Applying fix to content generation');
    
    // Keep track of original functions if they exist
    const originalNewGenerateFallbackContent = window.newGenerateFallbackContent;
    
    // Create theme categories and keywords for content matching
    const contentThemes = {
        business: [
            'business', 'management', 'growth', 'strategy', 'success', 'entrepreneur', 
            'leadership', 'culture', 'excellence', 'ordering', 'online', 'digital', 
            'operations', 'staff', 'training', 'efficiency', 'improvement', 'profit',
            'revenue', 'sales', 'marketing', 'promotion', 'customer', 'service',
            'expansion', 'franchise', 'brand'
        ],
        food: [
            'recipe', 'food', 'dish', 'cuisine', 'culinary', 'flavor', 'taste', 
            'ingredient', 'cooking', 'chef', 'kitchen', 'meal', 'menu', 'dining',
            'restaurant', 'appetizer', 'entree', 'dessert', 'beverage', 'drink',
            'cocktail', 'wine', 'beer', 'coffee', 'tea', 'breakfast', 'lunch', 'dinner'
        ],
        technology: [
            'technology', 'system', 'app', 'application', 'software', 'platform', 
            'digital', 'online', 'website', 'mobile', 'device', 'cloud', 'data',
            'analytics', 'ai', 'artificial intelligence', 'machine learning', 'automation',
            'integration', 'solution', 'innovation', 'tool', 'interface', 'experience',
            'user', 'customer', 'order', 'delivery', 'payment', 'reservation', 'booking'
        ]
    };
    
    // Override the newGenerateFallbackContent function
    window.newGenerateFallbackContent = function(prompt) {
        console.log('Content-Title Match Fix: Processing content with matched theme');
        
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
            title = 'Restaurant Insights: ' + new Date().toLocaleDateString();
        }
        
        // Determine the theme of the title
        const titleTheme = determineContentTheme(title);
        console.log('Content-Title Match Fix: Detected theme:', titleTheme);
        
        // Extract keywords
        const keywords = extractKeywords(customPrompt || title);
        
        // Create a timestamp to ensure uniqueness
        const timestamp = Date.now();
        const uniqueId = 'post-' + timestamp;
        
        // Generate content based on the title theme
        return generateThemeMatchedContent(title, keywords, uniqueId, titleTheme);
    };
    
    /**
     * Generate content that matches the theme of the title
     */
    function generateThemeMatchedContent(title, keywords, uniqueId, theme) {
        switch(theme) {
            case 'business':
                return generateBusinessTemplate(title, keywords, uniqueId);
            case 'technology':
                return generateTechnologyTemplate(title, keywords, uniqueId);
            case 'food':
                return generateFoodTemplate(title, keywords, uniqueId);
            default:
                return generateGeneralTemplate(title, keywords, uniqueId);
        }
    }
    
    /**
     * Determine the theme of the content based on the title
     */
    function determineContentTheme(title) {
        title = title.toLowerCase();
        
        // Calculate theme scores
        let scores = {
            business: 0,
            food: 0,
            technology: 0
        };
        
        // Calculate scores for each theme
        Object.keys(contentThemes).forEach(theme => {
            contentThemes[theme].forEach(keyword => {
                if (title.includes(keyword.toLowerCase())) {
                    scores[theme] += 1;
                    
                    // Give extra weight to multi-word matches
                    if (keyword.includes(' ') && title.includes(keyword)) {
                        scores[theme] += 2;
                    }
                }
            });
        });
        
        // Get the theme with the highest score
        let maxScore = 0;
        let matchedTheme = 'general';
        
        Object.keys(scores).forEach(theme => {
            if (scores[theme] > maxScore) {
                maxScore = scores[theme];
                matchedTheme = theme;
            }
        });
        
        return matchedTheme;
    }
    
    /**
     * Extract keywords from title or prompt
     */
    function extractKeywords(text) {
        if (!text) return ['restaurant', 'food', 'service'];
        
        // Convert to lowercase and remove special characters
        const cleanText = text.toLowerCase().replace(/[^\w\s]/gi, '');
        
        // Split into words
        const words = cleanText.split(/\s+/);
        
        // Filter out common stop words
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as', 'of'];
        const filteredWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
        
        // Return top keywords or defaults if none found
        return filteredWords.length > 0 ? filteredWords.slice(0, 5) : ['restaurant', 'food', 'service'];
    }
    
    /**
     * Generate a business-themed template (for business, management, operations titles)
     */
    function generateBusinessTemplate(title, keywords, uniqueId) {
        const mainConcept = keywords[0] || 'business strategy';
        const secondaryConcept = keywords[1] || 'operational excellence';
        const tertiaryTerm = keywords[2] || 'customer experience';
        
        return `# ${title}

## Introduction
In today's competitive restaurant industry, implementing effective ${mainConcept} strategies can significantly impact your bottom line. This article explores how developing a culture of ${secondaryConcept} creates measurable benefits across your operation.

## Why ${mainConcept.charAt(0).toUpperCase() + mainConcept.slice(1)} Matters
Restaurant businesses that focus on improving their ${mainConcept} processes see an average increase in customer satisfaction and operational efficiency. By establishing clear protocols and systems, you create a foundation for sustainable growth.

- Creates consistency across customer touchpoints
- Reduces operational friction and staff confusion
- Establishes measurable standards for performance
- Drives increased revenue through improved efficiency
- Helps identify opportunities for continuous improvement

## Key Components of ${secondaryConcept.charAt(0).toUpperCase() + secondaryConcept.slice(1)}
Implementing ${secondaryConcept} requires a systematic approach that addresses multiple aspects of your restaurant operation:

1. **Staff Training and Development**: Create comprehensive training programs that ensure all team members understand the importance of ${mainConcept}.
2. **Technology Integration**: Leverage the right tools and platforms to streamline ${mainConcept} processes.
3. **Performance Metrics**: Establish clear KPIs to measure success and identify areas for improvement.
4. **Customer Feedback**: Implement systems to collect and act on customer insights related to your ${mainConcept}.
5. **Continuous Improvement**: Regularly review and refine your approach to ${mainConcept}.

## Implementation Strategy
Start by conducting a thorough assessment of your current ${mainConcept} processes. Identify pain points and opportunities for improvement. Develop a phased implementation plan that focuses on quick wins while building toward long-term excellence.

### Phase 1: Assessment and Planning
- Audit existing ${mainConcept} systems
- Gather feedback from staff and customers
- Set clear goals and KPIs
- Develop a detailed implementation timeline

### Phase 2: Systems Development
- Create or refine standard operating procedures
- Select and implement supporting technologies
- Develop training materials and resources
- Establish monitoring and reporting processes

### Phase 3: Training and Deployment
- Conduct comprehensive staff training
- Deploy new processes gradually
- Collect feedback and make adjustments
- Celebrate early successes to build momentum

## Measuring Success
To ensure your ${mainConcept} initiative delivers results, establish clear metrics for success:

- ${tertiaryTerm} scores
- Operational efficiency metrics
- Staff productivity and satisfaction
- Revenue and profitability impact
- Customer retention and loyalty

## Case Study: Success in Action
A mid-sized restaurant group implemented a focused ${mainConcept} strategy and saw a 27% increase in order accuracy, 18% reduction in wait times, and 22% improvement in customer satisfaction scores within just three months.

## Conclusion
Building excellence in ${mainConcept} isn't just about processes and systems—it's about creating a culture where every team member understands their role in delivering exceptional experiences. By focusing on ${secondaryConcept} and measuring the right metrics, your restaurant can achieve sustainable growth and profitability in today's competitive market.

Post ID: ${uniqueId}`;
    }
    
    /**
     * Generate a technology-themed template (for tech, systems, digital titles)
     */
    function generateTechnologyTemplate(title, keywords, uniqueId) {
        const mainTech = keywords[0] || 'digital systems';
        const secondaryTech = keywords[1] || 'restaurant technology';
        const tertiaryTerm = keywords[2] || 'customer experience';
        
        return `# ${title}

## Introduction
In the rapidly evolving restaurant industry, leveraging ${mainTech} effectively can create significant competitive advantages. This guide explores how implementing the right ${secondaryTech} solutions can transform your operations and enhance your customer experience.

## The Evolution of ${mainTech.charAt(0).toUpperCase() + mainTech.slice(1)} in Restaurants
The restaurant industry has seen tremendous technological advancement in recent years. From basic POS systems to comprehensive digital ecosystems, ${mainTech} has become increasingly sophisticated and integrated:

- **Early Adoption**: Basic computerized systems for order processing
- **Digital Transformation**: Integration of multi-channel ordering and kitchen management
- **Current Innovation**: AI-powered solutions that optimize operations and personalize customer experiences
- **Future Trajectory**: Predictive systems that anticipate needs and automate decision-making

## Key Benefits of Advanced ${secondaryTech.charAt(0).toUpperCase() + secondaryTech.slice(1)}
Implementing comprehensive ${secondaryTech} solutions provides numerous advantages for restaurant operators:

1. **Operational Efficiency**: Streamline processes and reduce manual tasks
2. **Enhanced Customer Experience**: Provide seamless, personalized interactions across all touchpoints
3. **Data-Driven Insights**: Gather actionable intelligence to inform business decisions
4. **Increased Revenue**: Open new sales channels and optimize existing ones
5. **Competitive Differentiation**: Stand out in a crowded market with innovative experiences

## Essential ${mainTech.charAt(0).toUpperCase() + mainTech.slice(1)} Components
A comprehensive restaurant technology stack should include these critical elements:

### Order Management
- Multi-channel order capture (in-person, online, mobile, third-party)
- Intelligent order routing and prioritization
- Real-time status updates and notifications

### Kitchen Operations
- Digital kitchen display systems
- Inventory management and waste reduction tools
- Production timing and coordination systems

### Customer Engagement
- Personalized marketing automation
- Loyalty programs and incentives
- Feedback collection and response mechanisms

### Business Intelligence
- Performance analytics and reporting
- Demand forecasting and planning tools
- Competitive analysis capabilities

## Implementation Roadmap
Successfully deploying ${mainTech} requires a structured approach:

1. **Assessment**: Evaluate current systems and identify gaps
2. **Strategy Development**: Create a phased implementation plan
3. **Vendor Selection**: Choose partners that align with your needs
4. **Pilot Testing**: Start with limited deployment to validate approach
5. **Full Implementation**: Roll out across all locations
6. **Continuous Optimization**: Regularly review and refine your technology stack

## Overcoming Common Challenges
Restaurants often face obstacles when implementing new ${secondaryTech}:

- **Integration Issues**: Ensure new systems work with existing infrastructure
- **Staff Adoption**: Provide comprehensive training and demonstrate benefits
- **ROI Concerns**: Start with high-impact areas that show quick returns
- **Technology Overwhelm**: Take a phased approach rather than changing everything at once

## Measuring Technology Success
Establish clear metrics to evaluate the impact of your ${mainTech} initiatives:

- Reduced order processing time
- Improved order accuracy
- Increased average check size
- Enhanced ${tertiaryTerm}
- Improved staff productivity

## Future Trends in Restaurant ${secondaryTech.charAt(0).toUpperCase() + secondaryTech.slice(1)}
Stay ahead of these emerging developments:

- Voice-activated ordering systems
- Predictive analytics for inventory and staffing
- Augmented reality menu experiences
- Robotics and automation for routine tasks
- Blockchain for supply chain transparency

## Conclusion
Investing in the right ${mainTech} isn't just about keeping up with trends—it's about creating sustainable competitive advantages. By thoughtfully implementing ${secondaryTech} solutions that align with your business goals, you can enhance operational efficiency, improve the customer experience, and position your restaurant for long-term success.

Post ID: ${uniqueId}`;
    }
    
    /**
     * Generate a food-themed template (for recipe, menu, cuisine titles)
     */
    function generateFoodTemplate(title, keywords, uniqueId) {
        const mainIngredient = keywords[0] || 'signature dish';
        const cuisine = keywords[1] || 'culinary tradition';
        const technique = keywords[2] || 'preparation method';
        
        return `# ${title}

## Introduction
Welcome to our exclusive culinary exploration featuring ${mainIngredient}! This ${cuisine}-inspired approach combines traditional flavors with modern ${technique} to create something truly special for your restaurant menu.

## Ingredients
For this signature creation, you'll need:

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
     * Generate a general template for posts that don't fit other categories
     */
    function generateGeneralTemplate(title, keywords, uniqueId) {
        const mainTopic = keywords[0] || 'restaurant management';
        const secondaryTopic = keywords[1] || 'customer experience';
        const tertiaryTopic = keywords[2] || 'culinary excellence';
        
        return `# ${title}

## Introduction
Today's restaurant industry requires a balanced approach to ${mainTopic}, with careful attention to both operational details and the broader ${secondaryTopic}. This article explores strategies for excellence in this critical area.

## Understanding The Importance
Successful restaurants recognize that ${mainTopic} directly impacts every aspect of their business:

- Customer satisfaction and loyalty
- Operational efficiency and profitability 
- Staff engagement and retention
- Brand reputation and market position
- Long-term business sustainability

## Key Strategies for Success
Implementing effective ${mainTopic} practices requires a multifaceted approach:

### 1. Establish Clear Standards
Define what excellence means specifically for your restaurant. Document standards, train consistently, and ensure everybody understands expectations around ${secondaryTopic}.

### 2. Invest in Your Team
Your staff represents the frontline of your ${mainTopic} efforts. Provide comprehensive training, create growth opportunities, and recognize outstanding performance related to ${secondaryTopic}.

### 3. Leverage Technology Appropriately
Implement systems that support your ${mainTopic} goals without complicating operations. Focus on tools that enhance the ${secondaryTopic} while making processes more efficient.

### 4. Listen to Customer Feedback
Develop systematic ways to gather, analyze, and act on guest input about your ${mainTopic}. Use this information to drive continuous improvement in your ${secondaryTopic}.

### 5. Analyze Performance Metrics
Track key indicators of ${mainTopic} success. Establish benchmarks, monitor trends, and make data-driven decisions about your ${secondaryTopic} initiatives.

## Implementation Framework
Follow this step-by-step approach to elevate your restaurant's ${mainTopic}:

1. **Assessment**: Evaluate your current ${mainTopic} practices
2. **Planning**: Develop clear goals and strategies
3. **Implementation**: Roll out initiatives systematically
4. **Monitoring**: Track results against KPIs
5. **Refinement**: Make ongoing adjustments based on data

## Case Study: Excellence in Action
A family-owned restaurant implemented a focused ${mainTopic} program that resulted in a 23% increase in customer satisfaction scores, 15% reduction in operational costs, and 18% improvement in staff retention over just six months.

## The Role of ${tertiaryTopic.charAt(0).toUpperCase() + tertiaryTopic.slice(1)}
No discussion of restaurant ${mainTopic} would be complete without addressing ${tertiaryTopic}. This fundamental aspect intertwines with your overall approach by:

- Reinforcing your brand identity
- Creating memorable customer experiences
- Differentiating from competitors
- Building team pride and engagement
- Establishing value perception

## Conclusion
Excellence in ${mainTopic} doesn't happen by accident—it requires intentional strategy, consistent execution, and ongoing commitment. By focusing on ${secondaryTopic} and implementing the practices outlined here, your restaurant can achieve sustainable success in today's competitive marketplace.

Post ID: ${uniqueId}`;
    }
    
    console.log('Content-Title Match Fix: Successfully overrode content generation function');
}
