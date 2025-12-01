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
     * Generate AI content based on user input using OpenAI API
     */
    async function generateContent() {
        const prompt = aiPrompt.value.trim();
        const tone = contentTone.value;
        const length = contentLength.value;
        
        if (!prompt) {
            showNotification('Please enter a topic to write about', 'error');
            return;
        }
        
        // Check if AI config is available
        if (!window.aiConfig || !window.aiConfig.getConfig) {
            showNotification('AI configuration not loaded. Please configure OpenAI API key first.', 'error');
            return;
        }
        
        const config = window.aiConfig.getConfig();
        if (!config || !config.apiKey) {
            showNotification('OpenAI API key not configured. Please add your API key in AI Configuration.', 'error');
            return;
        }
        
        // Show loading state
        aiGeneratedContent.innerHTML = '<p class="loading-text">Generating content with AI...</p>';
        generateContentBtn.disabled = true;
        generateContentBtn.textContent = 'Generating...';
        
        try {
            // Build the system message based on tone
            let toneInstructions = '';
            switch (tone) {
                case 'professional':
                    toneInstructions = 'Write in a professional, authoritative tone suitable for business audiences.';
                    break;
                case 'casual':
                    toneInstructions = 'Write in a casual, friendly tone that feels approachable and conversational.';
                    break;
                case 'enthusiastic':
                    toneInstructions = 'Write in an enthusiastic, energetic tone that excites and motivates readers.';
                    break;
            }
            
            // Determine word count based on length
            let wordCount = 300;
            switch (length) {
                case 'short': wordCount = 150; break;
                case 'medium': wordCount = 300; break;
                case 'long': wordCount = 500; break;
            }
            
            // Use the existing generateContent function from ai-config-dark.js
            const contentOptions = {
                title: prompt,
                prompt: `Write a blog post about: "${prompt}". ${toneInstructions} The content should be approximately ${wordCount} words. Include a compelling headline (as <h2>) and well-structured paragraphs. Format with HTML tags for proper display.`,
                category: 'general',
                language: 'english'
            };
            
            window.aiConfig.generateContent(contentOptions, function(result) {
                if (result.success) {
                    aiGeneratedContent.innerHTML = result.content;
                    
                    // Enable the "Use This Content" button
                    useGeneratedContent.disabled = false;
                    useGeneratedContent.style.opacity = '1';
                    useGeneratedContent.style.cursor = 'pointer';
                    
                    showNotification('Content generated successfully!', 'success');
                    
                    // Log the generation
                    logAIGeneration(prompt, 'completed');
                } else {
                    aiGeneratedContent.innerHTML = '<p class="error-text">Failed to generate content. Please try again.</p>';
                    showNotification('Failed to generate content: ' + (result.error || 'Unknown error'), 'error');
                    
                    // Log the failure
                    logAIGeneration(prompt, 'failed', result.error);
                }
                
                // Reset generate button
                generateContentBtn.disabled = false;
                generateContentBtn.textContent = 'Generate Content';
            });
            
        } catch (error) {
            console.error('Error generating content:', error);
            aiGeneratedContent.innerHTML = '<p class="error-text">Error generating content. Please check your API key and try again.</p>';
            showNotification('Error: ' + error.message, 'error');
            
            // Reset generate button
            generateContentBtn.disabled = false;
            generateContentBtn.textContent = 'Generate Content';
            
            // Log the error
            logAIGeneration(prompt, 'failed', error.message);
        }
    }
    
    /**
     * Log AI content generation to the backend
     */
    async function logAIGeneration(prompt, status, errorMessage = null) {
        try {
            await fetch('/api/automation/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path_name: 'AI Content Assistant',
                    status: status,
                    content_type: 'assistant',
                    prompt_used: prompt,
                    error_message: errorMessage,
                    started_at: Date.now()
                })
            });
        } catch (e) {
            console.warn('Failed to log AI generation:', e);
        }
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
