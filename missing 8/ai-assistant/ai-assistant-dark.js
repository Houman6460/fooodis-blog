/**
 * AI Content Assistant Dark Theme Functionality
 * This script handles the AI content generation functionality
 * with proper dark theme implementation
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const aiPrompt = document.getElementById('aiPrompt');
    const contentTone = document.getElementById('contentTone');
    const contentLength = document.getElementById('contentLength');
    const generateContentBtn = document.getElementById('generateContentBtn');
    const aiGeneratedContent = document.getElementById('aiGeneratedContent');
    const useGeneratedContent = document.getElementById('useGeneratedContent');
    
    // Event Listeners
    generateContentBtn.addEventListener('click', generateContent);
    useGeneratedContent.addEventListener('click', useContent);
    
    // Initially disable the "Use This Content" button
    useGeneratedContent.disabled = true;
    useGeneratedContent.style.opacity = '0.5';
    useGeneratedContent.style.cursor = 'not-allowed';
    
    /**
     * Generate AI content based on user input
     */
    function generateContent() {
        const prompt = aiPrompt.value.trim();
        const tone = contentTone.value;
        const length = contentLength.value;
        
        if (!prompt) {
            showNotification('Please enter a topic to write about', 'error');
            return;
        }
        
        // Show loading state
        aiGeneratedContent.innerHTML = '<p class="loading-text">Generating content...</p>';
        generateContentBtn.disabled = true;
        generateContentBtn.textContent = 'Generating...';
        
        // Simulate API call with setTimeout (replace with actual API call in production)
        setTimeout(() => {
            const content = simulateAIContent(prompt, tone, length);
            aiGeneratedContent.innerHTML = content;
            
            // Enable the "Use This Content" button
            useGeneratedContent.disabled = false;
            useGeneratedContent.style.opacity = '1';
            useGeneratedContent.style.cursor = 'pointer';
            
            // Reset generate button
            generateContentBtn.disabled = false;
            generateContentBtn.textContent = 'Generate Content';
            
            showNotification('Content generated successfully', 'success');
        }, 2000);
    }
    
    /**
     * Use the generated content in the post editor
     */
    function useContent() {
        const content = aiGeneratedContent.innerHTML;
        
        // Get the post content editor
        const postContentEditor = document.getElementById('postContent');
        
        if (postContentEditor) {
            // Insert the generated content into the post editor
            postContentEditor.value = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
            
            // Show notification
            showNotification('Content added to post editor', 'success');
            
            // Switch to the Create Post section
            const createPostSection = document.getElementById('create-post-section');
            const aiAssistantSection = document.getElementById('ai-assistant-section');
            
            if (createPostSection && aiAssistantSection) {
                // Remove active class from all sections
                document.querySelectorAll('.dashboard-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Add active class to Create Post section
                createPostSection.classList.add('active');
                
                // Update sidebar active item
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                document.querySelector('.nav-item[data-section="create-post-section"]')?.classList.add('active');
            }
        } else {
            showNotification('Post editor not found', 'error');
        }
    }
    
    /**
     * Simulate AI content generation (replace with actual API call in production)
     */
    function simulateAIContent(prompt, tone, length) {
        // Sample templates based on tone and length
        const templates = {
            professional: {
                short: `<h2>${prompt}</h2><p>In the competitive restaurant industry, implementing effective strategies is essential for success. This article explores key insights and practical approaches to help restaurant owners and managers enhance their operations.</p><p>By focusing on customer-centric solutions and leveraging modern technology, restaurants can significantly improve their service quality and operational efficiency.</p>`,
                
                medium: `<h2>${prompt}</h2><p>In today's competitive restaurant landscape, implementing effective strategies is essential for sustainable success. This comprehensive guide explores key insights and practical approaches to help restaurant owners and managers enhance their operations and customer experience.</p><p>The restaurant industry continues to evolve rapidly, with changing consumer preferences and technological advancements reshaping how establishments operate. By focusing on customer-centric solutions and leveraging modern technology, restaurants can significantly improve their service quality and operational efficiency.</p><p>Research indicates that restaurants implementing these best practices typically see a 15-20% increase in customer satisfaction and a corresponding boost in repeat business. Additionally, operational improvements often lead to reduced costs and increased profit margins.</p><p>Industry experts recommend a systematic approach to implementation, starting with a thorough assessment of current operations followed by targeted improvements in key areas. This methodical strategy ensures sustainable growth and positions your establishment for long-term success in an increasingly competitive market.</p>`,
                
                long: `<h2>${prompt}</h2><p>In today's highly competitive restaurant landscape, implementing effective strategies is essential for sustainable success and growth. This comprehensive guide explores key insights and practical approaches to help restaurant owners and managers enhance their operations, improve customer experience, and ultimately drive profitability.</p><p>The restaurant industry continues to evolve at an unprecedented pace, with changing consumer preferences, technological advancements, and economic fluctuations reshaping how establishments operate. By focusing on customer-centric solutions and leveraging modern technology, restaurants can significantly improve their service quality and operational efficiency.</p><p>Research conducted by the National Restaurant Association indicates that establishments implementing these best practices typically see a 15-20% increase in customer satisfaction scores and a corresponding boost in repeat business. Additionally, operational improvements often lead to reduced costs and increased profit margins, sometimes by as much as 25% within the first year of implementation.</p><p>Industry experts unanimously recommend a systematic approach to implementation, starting with a thorough assessment of current operations followed by targeted improvements in key areas. This methodical strategy ensures sustainable growth and positions your establishment for long-term success in an increasingly competitive market.</p><p>It's worth noting that successful implementation requires commitment from all levels of staff, from management to front-line employees. Creating a culture of continuous improvement and customer focus is often cited as the most critical factor in achieving lasting results. Regular training programs, performance incentives, and clear communication channels all contribute to building this culture.</p><p>As you begin implementing these strategies, remember that consistency is key. Customers value reliability in their dining experiences, and delivering consistent quality is essential for building loyalty and encouraging word-of-mouth recommendations, which remain among the most powerful marketing tools available to restaurants.</p><p>By embracing these principles and committing to excellence in all aspects of your operation, your restaurant can thrive even in challenging market conditions, building a loyal customer base and a reputation for exceptional quality and service.</p>`
            },
            casual: {
                short: `<h2>${prompt}</h2><p>Hey there, restaurant folks! Looking to step up your game? You're in the right place! Let's talk about some awesome ways to make your restaurant stand out from the crowd.</p><p>The restaurant world is always changing, and staying ahead means trying new things and listening to what your customers want. Let's dive into some cool ideas that can really make a difference!</p>`,
                
                medium: `<h2>${prompt}</h2><p>Hey there, restaurant folks! Looking to step up your game? You're in the right place! Let's talk about some awesome ways to make your restaurant stand out from the crowd and keep those customers coming back for more.</p><p>The restaurant world is always changing, and staying ahead means trying new things and listening to what your customers want. Whether you're running a cozy café or a busy dinner spot, these tips can help you create amazing experiences that people will love to talk about.</p><p>Did you know that restaurants that make these kinds of improvements usually see about 15-20% more happy customers? That means more repeat visits and more people telling their friends about you! Plus, when your operation runs smoother, you'll likely save money and increase your profits too.</p><p>The best way to get started is to take a good look at how things are working now, then pick a few areas where you can make the biggest impact. This step-by-step approach helps ensure you'll see real results that last, helping your restaurant thrive even when competition is fierce.</p>`,
                
                long: `<h2>${prompt}</h2><p>Hey there, restaurant folks! Looking to step up your game? You're in the right place! Let's talk about some awesome ways to make your restaurant stand out from the crowd and keep those customers coming back for more.</p><p>The restaurant world is always changing, and staying ahead means trying new things and listening to what your customers want. Whether you're running a cozy café or a busy dinner spot, these tips can help you create amazing experiences that people will love to talk about.</p><p>Did you know that restaurants that make these kinds of improvements usually see about 15-20% more happy customers? That means more repeat visits and more people telling their friends about you! Plus, when your operation runs smoother, you'll likely save money and increase your profits too – sometimes as much as 25% in the first year alone!</p><p>The best way to get started is to take a good look at how things are working now, then pick a few areas where you can make the biggest impact. This step-by-step approach helps ensure you'll see real results that last, helping your restaurant thrive even when competition is fierce.</p><p>Here's the thing – everyone on your team needs to be on board for this to really work. From managers to servers to kitchen staff, creating a vibe where everyone cares about making things better and putting customers first is super important. Regular training, rewards for good performance, and making sure everyone can share their ideas all help build this positive culture.</p><p>As you start making these changes, remember that being consistent is super important. Customers love knowing what to expect when they visit your restaurant, and delivering the same great experience every time is key to building loyalty. When people know they can count on you for a great meal and awesome service, they'll not only come back – they'll tell all their friends too!</p><p>So, ready to shake things up and take your restaurant to the next level? With these ideas and a commitment to being awesome in everything you do, your place can become the go-to spot that everyone's talking about. Let's make it happen!</p>`
            },
            enthusiastic: {
                short: `<h2>${prompt}</h2><p>Wow! Are you ready to TRANSFORM your restaurant experience?! We're about to dive into some AMAZING strategies that will absolutely REVOLUTIONIZE how you connect with customers!</p><p>The restaurant industry is CONSTANTLY evolving, and it's time to embrace EXCITING new approaches that will set your establishment apart from the competition! Let's get started on this INCREDIBLE journey together!</p>`,
                
                medium: `<h2>${prompt}</h2><p>Wow! Are you ready to TRANSFORM your restaurant experience?! We're about to dive into some AMAZING strategies that will absolutely REVOLUTIONIZE how you connect with customers and run your restaurant!</p><p>The restaurant industry is CONSTANTLY evolving, and it's time to embrace EXCITING new approaches that will set your establishment apart from the competition! These GAME-CHANGING ideas will help you create UNFORGETTABLE experiences that will have customers RAVING about your restaurant!</p><p>It's INCREDIBLE to think that restaurants implementing these strategies typically see a MASSIVE 15-20% increase in customer satisfaction! That means more repeat business and an EXPLOSION of word-of-mouth recommendations! Plus, you'll likely see DRAMATIC improvements in operational efficiency, leading to SUBSTANTIAL cost savings and BOOSTED profit margins!</p><p>The path to success starts with a THOROUGH assessment of your current operations, followed by TARGETED improvements in key areas! This STRATEGIC approach ensures SUSTAINABLE growth and positions your restaurant for LONG-TERM success in today's ULTRA-competitive market!</p>`,
                
                long: `<h2>${prompt}</h2><p>Wow! Are you ready to TRANSFORM your restaurant experience?! We're about to dive into some AMAZING strategies that will absolutely REVOLUTIONIZE how you connect with customers and run your restaurant!</p><p>The restaurant industry is CONSTANTLY evolving, and it's time to embrace EXCITING new approaches that will set your establishment apart from the competition! These GAME-CHANGING ideas will help you create UNFORGETTABLE experiences that will have customers RAVING about your restaurant!</p><p>It's INCREDIBLE to think that restaurants implementing these strategies typically see a MASSIVE 15-20% increase in customer satisfaction! That means more repeat business and an EXPLOSION of word-of-mouth recommendations! Plus, you'll likely see DRAMATIC improvements in operational efficiency, leading to SUBSTANTIAL cost savings and BOOSTED profit margins – sometimes as much as 25% in the FIRST YEAR alone!</p><p>The path to success starts with a THOROUGH assessment of your current operations, followed by TARGETED improvements in key areas! This STRATEGIC approach ensures SUSTAINABLE growth and positions your restaurant for LONG-TERM success in today's ULTRA-competitive market!</p><p>Here's the CRUCIAL part – success requires TOTAL commitment from your ENTIRE team! Creating a VIBRANT culture focused on CONTINUOUS improvement and EXCEPTIONAL customer experiences is the SECRET INGREDIENT to achieving LASTING results! Regular training programs, MOTIVATING performance incentives, and CRYSTAL-CLEAR communication channels all contribute to building this POWERFUL culture of excellence!</p><p>As you implement these FANTASTIC strategies, remember that CONSISTENCY is ABSOLUTELY ESSENTIAL! Customers CRAVE reliability in their dining experiences, and delivering CONSISTENTLY OUTSTANDING quality is the KEY to building UNSHAKEABLE loyalty! When people can COUNT ON you for an AMAZING meal and STELLAR service every single time, they become your most PASSIONATE advocates!</p><p>Are you EXCITED to take your restaurant to UNPRECEDENTED heights?! By embracing these REVOLUTIONARY principles and committing to EXCELLENCE in EVERY aspect of your operation, your restaurant will not just survive – it will THRIVE SPECTACULARLY even in the most challenging market conditions! Let's make your restaurant the TALK OF THE TOWN!</p>`
            }
        };
        
        return templates[tone][length];
    }
    
    /**
     * Show notification message
     */
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification notification-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
