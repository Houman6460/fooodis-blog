/**
 * Chatbot Integration Fixes
 * Direct fixes for user-reported issues
 */

// Override addMessage to include department tag and conversation flow
(function() {
    if (typeof window !== 'undefined' && window.ChatbotWidget) {
        const originalAddMessage = window.ChatbotWidget.prototype.addMessage;
        
        window.ChatbotWidget.prototype.addMessage = function(content, sender, isHandoff = false) {
            // Call original function
            const result = originalAddMessage.call(this, content, sender, isHandoff);
            
            // INTEGRATION FIX: Department tag and conversation flow for assistant messages
            if (sender === 'assistant') {
                setTimeout(() => {
                    try {
                        if (this.showDepartmentTag) {
                            this.showDepartmentTag();
                        }
                        if (this.handleIntelligentConversationFlow) {
                            this.handleIntelligentConversationFlow(content);
                        }
                    } catch (error) {
                        console.error('Error in assistant message integration:', error);
                    }
                }, 200);
            }
            
            return result;
        };
        
        console.log('✅ Chatbot integration fixes applied');
    }
})();

// Enhanced department tag display for agent header with dynamic styling
window.addDepartmentTag = function(agent) {
    if (agent && agent.department) {
        // Try to find the chatbot header elements
        const chatbotWidget = document.querySelector('.chatbot-widget');
        const chatbotHeader = document.querySelector('.chatbot-header');
        const agentInfo = document.querySelector('.agent-info');
        
        if (chatbotWidget || chatbotHeader || agentInfo) {
            let departmentTag = document.querySelector('.department-tag');
            if (!departmentTag) {
                departmentTag = document.createElement('div');
                departmentTag.className = 'department-tag';
                
                // Try multiple insertion points for the department tag
                const insertionPoints = [
                    chatbotHeader?.querySelector('.agent-name'),
                    chatbotHeader,
                    agentInfo,
                    chatbotWidget?.querySelector('.chatbot-title'),
                    chatbotWidget?.querySelector('.agent-header'),
                    chatbotWidget
                ];
                
                for (const point of insertionPoints) {
                    if (point) {
                        point.appendChild(departmentTag);
                        break;
                    }
                }
            }
            
            // Get department-specific styling
            const departmentStyle = getDepartmentTagStyle(agent.department);
            const departmentEmoji = getDepartmentEmoji(agent.department);
            
            departmentTag.textContent = `${departmentEmoji} ${agent.department}`;
            departmentTag.style.cssText = `
                display: inline-block;
                background: ${departmentStyle.gradient};
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                margin: 6px 8px;
                box-shadow: ${departmentStyle.shadow};
                animation: departmentTagSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                text-transform: uppercase;
                letter-spacing: 0.8px;
                position: relative;
                z-index: 1000;
                border: 2px solid ${departmentStyle.border};
                transition: all 0.3s ease;
            `;
            
            // Add hover effect
            departmentTag.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) translateY(-1px)';
                this.style.boxShadow = departmentStyle.hoverShadow;
            });
            
            departmentTag.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) translateY(0)';
                this.style.boxShadow = departmentStyle.shadow;
            });
            
            console.log('🏷️ Enhanced department tag added:', agent.department, departmentEmoji);
        }
    }
};

// Get department-specific emoji
function getDepartmentEmoji(department) {
    const emojiMap = {
        'sales': '💼',
        'support': '🛠️',
        'technical': '⚙️',
        'billing': '💳',
        'general': '💬',
        'customer service': '🤝',
        'marketing': '🎯',
        'product': '📦',
        'development': '💻',
        'design': '🎨'
    };
    
    const key = department.toLowerCase();
    return emojiMap[key] || emojiMap['general'] || '📋';
}

// Get department-specific styling
function getDepartmentTagStyle(department) {
    const styleMap = {
        'sales': {
            gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            shadow: '0 3px 12px rgba(255,107,107,0.4)',
            hoverShadow: '0 5px 20px rgba(255,107,107,0.6)',
            border: 'rgba(255,255,255,0.3)'
        },
        'support': {
            gradient: 'linear-gradient(135deg, #4834d4, #686de0)',
            shadow: '0 3px 12px rgba(72,52,212,0.4)',
            hoverShadow: '0 5px 20px rgba(72,52,212,0.6)',
            border: 'rgba(255,255,255,0.3)'
        },
        'technical': {
            gradient: 'linear-gradient(135deg, #00d2d3, #54a0ff)',
            shadow: '0 3px 12px rgba(0,210,211,0.4)',
            hoverShadow: '0 5px 20px rgba(0,210,211,0.6)',
            border: 'rgba(255,255,255,0.3)'
        },
        'billing': {
            gradient: 'linear-gradient(135deg, #5f27cd, #341f97)',
            shadow: '0 3px 12px rgba(95,39,205,0.4)',
            hoverShadow: '0 5px 20px rgba(95,39,205,0.6)',
            border: 'rgba(255,255,255,0.3)'
        },
        'general': {
            gradient: 'linear-gradient(135deg, #28a745, #20c997)',
            shadow: '0 3px 12px rgba(40,167,69,0.4)',
            hoverShadow: '0 5px 20px rgba(40,167,69,0.6)',
            border: 'rgba(255,255,255,0.3)'
        }
    };
    
    const key = department.toLowerCase();
    return styleMap[key] || styleMap['general'];
}

// Enhanced department tag injection for all agent message contexts
function injectDepartmentTagForAllAgents() {
    // Monitor for agent changes and inject department tags
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's an agent message or header
                        if (node.querySelector && (node.querySelector('.agent-name') || node.classList?.contains('chatbot-header'))) {
                            // Try to get current agent info and add department tag
                            if (window.chatbotWidget?.currentAgent) {
                                window.addDepartmentTag(window.chatbotWidget.currentAgent);
                            }
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

injectDepartmentTagForAllAgents();

// Fix link buttons and rendering
function fixLinkButtons() {
    const linkButtons = document.querySelectorAll('.chatbot-link-button');
    linkButtons.forEach(button => {
        // Fix button text to show custom labels instead of long URLs
        let url = button.getAttribute('data-url');
        
        // CRITICAL FIX: Remove trailing parentheses from URLs
        if (url && url.endsWith(')')) {
            url = url.slice(0, -1);
            button.setAttribute('data-url', url);
        }
        
        if (url && button.textContent.includes('http')) {
            // Extract custom label from URL with enhanced parsing
            if (url.includes('Pos.html') || url.toLowerCase().includes('pos')) {
                button.textContent = '🏪 POS System';
            } else if (url.includes('Payment-setting.html') || url.includes('payment')) {
                button.textContent = '💳 Payment Settings';
            } else if (url.includes('Support.html') || url.includes('support')) {
                button.textContent = '🛠️ Support Center';
            } else if (url.includes('pricing') || url.includes('plan')) {
                button.textContent = '💰 Plan Comparison';
            } else if (url.includes('tax') || url.includes('Tax')) {
                button.textContent = '📊 Tax Configuration';
            } else if (url.includes('fooodis.com')) {
                button.textContent = '🌐 Fooodis Platform';
            } else {
                // Generic link button
                const urlObj = new URL(url);
                const filename = urlObj.pathname.split('/').pop();
                button.textContent = filename ? `🔗 ${filename.replace('.html', '')}` : '🔗 Link';
            }
        }
        
        // Fix button click to open in new tab with cleaned URL
        button.onclick = function(e) {
            e.preventDefault();
            let cleanUrl = this.getAttribute('data-url');
            // Remove any trailing parentheses if still present
            if (cleanUrl && cleanUrl.endsWith(')')) {
                cleanUrl = cleanUrl.slice(0, -1);
            }
            if (cleanUrl) {
                console.log('🔗 Opening clean URL:', cleanUrl);
                window.open(cleanUrl, '_blank');
            }
        };
    });
    
    // Also fix any existing text-based links in messages
    const messages = document.querySelectorAll('.chatbot-message');
    messages.forEach(msg => {
        if (msg.innerHTML && msg.innerHTML.includes('http')) {
            // Fix URLs in message text by removing trailing punctuation
            msg.innerHTML = msg.innerHTML.replace(/https?:\/\/[^\s<>"]+[)\]}.,;!?]/gi, (url) => {
                return url.slice(0, -1);
            });
        }
    });
};

// Enhanced Swedish Language Detection and Routing
window.fixLanguageDetection = function() {
    // Override the detectLanguage function in chatbot widget
    if (window.chatbotWidget && window.chatbotWidget.detectLanguage) {
        const originalDetectLanguage = window.chatbotWidget.detectLanguage;
        
        window.chatbotWidget.detectLanguage = function(message) {
            if (!message) return this.currentLanguage || 'english';
            
            const detection = analyzeLanguageAdvanced(message);
            
            if (detection.language === 'swedish' && detection.confidence > 0.6) {
                this.currentLanguage = 'swedish';
                this.config.language = 'sv';
                this.languageDetected = true;
                localStorage.setItem('fooodis-language', 'swedish');
                localStorage.setItem('fooodis-language-confidence', detection.confidence.toString());
                console.log(`🇸🇪 Swedish detected with ${Math.round(detection.confidence * 100)}% confidence:`, message.substring(0, 50));
                
                // Trigger Swedish routing enhancement
                enhanceSwedishRouting();
                return 'swedish';
            } else if (detection.language === 'english' || detection.confidence < 0.4) {
                this.currentLanguage = 'english';
                this.config.language = 'en';
                this.languageDetected = true;
                localStorage.setItem('fooodis-language', 'english');
                console.log(`🇺🇸 English detected with ${Math.round(detection.confidence * 100)}% confidence`);
                return 'english';
            }
            
            // Fallback to original detection for edge cases
            return originalDetectLanguage.call(this, message);
        };
    }
    
    // Enhanced message processing with language routing
    if (window.chatbotWidget && window.chatbotWidget.processMessage) {
        const originalProcessMessage = window.chatbotWidget.processMessage;
        
        window.chatbotWidget.processMessage = function(message) {
            // Advanced language detection before processing
            const detectedLang = this.detectLanguage(message);
            
            // Apply language-specific processing enhancements
            if (detectedLang === 'swedish') {
                message = preprocessSwedishMessage(message);
            }
            
            return originalProcessMessage.call(this, message);
        };
    }
};

// Advanced language analysis with confidence scoring
function analyzeLanguageAdvanced(text) {
    const textLower = text.toLowerCase().trim();
    let swedishScore = 0;
    let englishScore = 0;
    
    // Enhanced Swedish vocabulary with weights
    const swedishIndicators = {
        // High confidence Swedish words
        high: {
            words: ['hej', 'hejsan', 'tjena', 'morsning', 'adjö', 'hej då', 'svenska', 'svensk', 'sverige', 'kanske', 'säkert', 'också', 'eller', 'eftersom', 'därför', 'förstår', 'naturligtvis', 'självklart'],
            weight: 3
        },
        // Medium confidence Swedish words
        medium: {
            words: ['vad', 'hur', 'när', 'var', 'vem', 'varför', 'vilket', 'vilken', 'hjälp', 'hjälpa', 'hjälper', 'tack', 'snälla', 'ursäkta', 'beklagar'],
            weight: 2
        },
        // Common Swedish words (lower weight due to potential overlap)
        low: {
            words: ['och', 'att', 'det', 'den', 'denna', 'detta', 'är', 'har', 'hade', 'kommer', 'skulle', 'kunde', 'måste', 'vill', 'kan', 'ska', 'skall'],
            weight: 1
        }
    };
    
    // Check Swedish indicators
    Object.values(swedishIndicators).forEach(category => {
        category.words.forEach(word => {
            if (textLower.includes(word)) {
                swedishScore += category.weight;
            }
        });
    });
    
    // Swedish character bonus (high confidence)
    const swedishChars = (text.match(/[åäöÅÄÖ]/g) || []).length;
    swedishScore += swedishChars * 2;
    
    // Swedish sentence patterns
    const swedishPatterns = [
        /\bär\s+det\b/i,      // "är det"
        /\bkan\s+du\b/i,     // "kan du"
        /\bvad\s+är\b/i,     // "vad är"
        /\bhur\s+fungerar\b/i, // "hur fungerar"
        /\bjag\s+vill\b/i,   // "jag vill"
        /\bdet\s+är\b/i      // "det är"
    ];
    
    swedishPatterns.forEach(pattern => {
        if (pattern.test(text)) {
            swedishScore += 2;
        }
    });
    
    // English indicators for comparison
    const englishWords = ['hello', 'hi', 'help', 'please', 'thank', 'thanks', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'would', 'should', 'will', 'want', 'need'];
    englishWords.forEach(word => {
        if (textLower.includes(word)) {
            englishScore += 1;
        }
    });
    
    // Calculate confidence
    const totalScore = swedishScore + englishScore;
    const confidence = totalScore > 0 ? swedishScore / totalScore : 0;
    
    return {
        language: confidence > 0.5 ? 'swedish' : 'english',
        confidence: confidence,
        swedishScore: swedishScore,
        englishScore: englishScore,
        details: {
            swedishChars: swedishChars,
            totalWords: textLower.split(' ').length
        }
    };
}

// Preprocess Swedish messages for better understanding
function preprocessSwedishMessage(message) {
    // Common Swedish abbreviations and variations
    const swedishReplacements = {
        'å': 'å', 'ä': 'ä', 'ö': 'ö', // Normalize characters
        'tja': 'hej',
        'tjena': 'hej',
        'morsning': 'god morgon',
        'morsan': 'god morgon',
        'hejsan': 'hej',
        'hej då': 'adjö',
        'vi ses': 'adjö'
    };
    
    let processed = message.toLowerCase();
    
    Object.entries(swedishReplacements).forEach(([from, to]) => {
        processed = processed.replace(new RegExp(from, 'gi'), to);
    });
    
    return processed;
}

// Enhance routing for Swedish users
function enhanceSwedishRouting() {
    // Set Swedish-specific routing preferences
    if (window.chatbotWidget) {
        // Prefer Swedish-speaking agents if available
        const swedishAgentPreference = {
            language: 'sv',
            preferredAgents: ['swedish_support', 'multilingual'],
            fallbackMessage: {
                swedish: 'Jag kopplar dig till vår svensktalande support.',
                english: 'Connecting you to our Swedish-speaking support.'
            }
        };
        
        // Store routing preference
        sessionStorage.setItem('routing-preference', JSON.stringify(swedishAgentPreference));
        
        console.log('🔄 Enhanced Swedish routing activated');
    }
    
    // Also apply when widget is initialized
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'DOMContentLoaded' || type === 'load') {
            originalAddEventListener.call(this, type, function(e) {
                listener(e);
                // Apply language detection fix after page load
                setTimeout(() => {
                    if (window.chatbotWidget) {
                        window.fixLanguageDetection();
                        console.log('🇸🇪 Swedish language detection fix applied on page load');
                    }
                }, 1000);
            }, options);
        } else {
            originalAddEventListener.call(this, type, listener, options);
        }
    };
}

// Enhanced bilingual welcome message with dynamic content and animations
window.generateBilingualWelcome = function(agentName = 'Fooodis Assistant') {
    const timeOfDay = getTimeBasedGreeting();
    
    return `
        <div class="bilingual-welcome">
            <div class="welcome-header">
                <div class="welcome-icon">🤖</div>
                <div class="welcome-title">Fooodis AI Assistant</div>
            </div>
            
            <div class="welcome-content">
                <div class="welcome-en">
                    <div class="greeting-line">
                        <span class="emoji">👋</span>
                        <strong>${timeOfDay.english} Welcome to Fooodis!</strong>
                    </div>
                    <div class="help-text">
                        I'm your AI restaurant assistant. How can I help you today?
                    </div>
                    <div class="features-hint">
                        💡 I can help with POS systems, payments, orders, and more!
                    </div>
                </div>
                
                <div class="language-divider"></div>
                
                <div class="welcome-sv">
                    <div class="greeting-line">
                        <span class="emoji">👋</span>
                        <strong>${timeOfDay.swedish} Välkommen till Fooodis!</strong>
                    </div>
                    <div class="help-text">
                        Jag är din AI-restaurangassistent. Hur kan jag hjälpa dig idag?
                    </div>
                    <div class="features-hint">
                        💡 Jag kan hjälpa med POS-system, betalningar, beställningar och mer!
                    </div>
                </div>
            </div>
            
            <div class="welcome-footer">
                <div class="language-selection">
                    <button class="lang-btn active" data-lang="en">🇺🇸 English</button>
                    <button class="lang-btn" data-lang="sv">🇸🇪 Svenska</button>
                </div>
            </div>
        </div>
    `;
};

// Get time-based greeting
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
        return {
            english: 'Good morning!',
            swedish: 'God morgon!'
        };
    } else if (hour >= 12 && hour < 17) {
        return {
            english: 'Good afternoon!',
            swedish: 'God eftermiddag!'
        };
    } else if (hour >= 17 && hour < 22) {
        return {
            english: 'Good evening!',
            swedish: 'God kväll!'
        };
    } else {
        return {
            english: 'Hello!',
            swedish: 'Hej!'
        };
    }
}

// Fix agent pronouns in responses
window.fixAgentPronouns = function(message) {
    if (typeof message === 'string') {
        return message
            .replace(/your website/gi, 'our website')
            .replace(/your platform/gi, 'our platform')
            .replace(/your service/gi, 'our service')
            .replace(/your solution/gi, 'our solution')
            .replace(/your team/gi, 'our team')
            .replace(/your support/gi, 'our support')
            .replace(/\byour\b(?=\s+(fooodis|pos|system|tool))/gi, 'our');
    }
    return message;
};

// Add enhanced CSS styling for bilingual welcome message
function addBilingualWelcomeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .bilingual-welcome {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 0;
            margin: 12px 0;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
            animation: welcomeSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        }
        
        .bilingual-welcome::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            pointer-events: none;
        }
        
        .welcome-header {
            background: rgba(255,255,255,0.15);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            backdrop-filter: blur(10px);
        }
        
        .welcome-icon {
            font-size: 28px;
            animation: pulse 2s infinite;
        }
        
        .welcome-title {
            color: white;
            font-size: 18px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .welcome-content {
            padding: 20px;
        }
        
        .welcome-en, .welcome-sv {
            color: white;
            margin: 16px 0;
            animation: textSlideIn 1s ease-out;
        }
        
        .greeting-line {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .greeting-line .emoji {
            font-size: 20px;
            animation: wave 1.5s ease-in-out infinite;
        }
        
        .help-text {
            font-size: 14px;
            opacity: 0.95;
            margin-bottom: 8px;
            line-height: 1.5;
        }
        
        .features-hint {
            font-size: 12px;
            opacity: 0.8;
            background: rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 8px;
            margin-top: 8px;
        }
        
        .language-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
            margin: 16px 0;
        }
        
        .welcome-footer {
            padding: 16px 20px;
            background: rgba(0,0,0,0.1);
        }
        
        .language-selection {
            display: flex;
            gap: 8px;
            justify-content: center;
        }
        
        .lang-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .lang-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .lang-btn.active {
            background: rgba(255,255,255,0.9);
            color: #667eea;
            font-weight: 600;
        }
        
        @keyframes welcomeSlideIn {
            0% {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes textSlideIn {
            0% {
                opacity: 0;
                transform: translateX(-10px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
            .bilingual-welcome {
                margin: 8px 0;
            }
            
            .welcome-header {
                padding: 12px 16px;
            }
            
            .welcome-content {
                padding: 16px;
            }
            
            .welcome-title {
                font-size: 16px;
            }
            
            .greeting-line {
                font-size: 14px;
            }
            
            .language-selection {
                flex-direction: column;
                align-items: center;
            }
            
            .lang-btn {
                width: 120px;
            }
        }
        
        /* Department tag styling enhancements */
        .department-tag {
            animation: slideInFromTop 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
            from {
                transform: translateY(-10px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Note: Inactivity detection and rating system is handled by chatbot-rating-system.js
// This implementation was removed to avoid conflicts

function showThankYouAndRating() {
    if (ratingPopupShown) return;
    
    const userLang = localStorage.getItem('chatbot_user_language') || 'en';
    const thankYouMessage = userLang === 'sv' 
        ? "Tack för att du använder Fooodis! Hur var din upplevelse?" 
        : "Thank you for using Fooodis! How was your experience?";
    
    // Add thank you message
    if (window.chatbotWidget && window.chatbotWidget.addMessage) {
        window.chatbotWidget.addMessage(thankYouMessage, 'bot');
    }
    
    // Show rating popup
    setTimeout(() => {
        if (window.chatbotWidget && window.chatbotWidget.showRatingPopup) {
            window.chatbotWidget.showRatingPopup();
        } else {
            // Fallback: create simple rating popup
            createFallbackRatingPopup(userLang);
        }
    }, 1000);
    
    ratingPopupShown = true;
    console.log('⭐ Thank you and rating popup shown');
}

function createFallbackRatingPopup(lang) {
    const popup = document.createElement('div');
    popup.className = 'rating-popup-fallback';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        max-width: 300px;
    `;
    
    const title = lang === 'sv' ? 'Betygsätt din upplevelse' : 'Rate your experience';
    const stars = '⭐⭐⭐⭐⭐';
    
    popup.innerHTML = `
        <h3>${title}</h3>
        <div style="font-size: 24px; margin: 10px 0;">${stars}</div>
        <button onclick="this.parentElement.remove()" style="
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        ">${lang === 'sv' ? 'Stäng' : 'Close'}</button>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 10000);
}

// Enhanced message monitoring for inactivity detection
function initializeInactivityMonitoring() {
    // Monitor user messages
    const originalAddMessage = window.chatbotWidget?.addMessage;
    if (originalAddMessage) {
        window.chatbotWidget.addMessage = function(message, sender, ...args) {
            if (sender === 'user') {
                resetInactivityTimer();
                console.log('👤 User activity detected, resetting timers');
            }
            return originalAddMessage.call(this, message, sender, ...args);
        };
    }
    
    // Monitor input field activity
    const chatInput = document.querySelector('#chatbot-input, .chatbot-input, input[type="text"]');
    if (chatInput) {
        chatInput.addEventListener('keydown', resetInactivityTimer);
        chatInput.addEventListener('focus', resetInactivityTimer);
    }
    
    // Start initial timer
    resetInactivityTimer();
    console.log(' Inactivity monitoring initialized');
}

// Apply all fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addBilingualWelcomeStyles();
        window.fixLanguageDetection();

        console.log('🔧 Chatbot integration fixes initialized');
        setTimeout(initializeInactivityMonitoring, 2000);
    });
} else {
    addBilingualWelcomeStyles();
    window.fixLanguageDetection();
    console.log('🔧 Chatbot integration fixes initialized');
    setTimeout(initializeInactivityMonitoring, 2000);
}

// Periodically apply link button fixes and check for chat initialization
setInterval(() => {
    if (document.querySelector('.chatbot-link-button')) {
        window.fixLinkButtons();
    }
}, 2000);

// Inactivity Follow-up and Multilingual Rating Flow
window.initInactivitySystem = function() {
    let inactivityTimer = null;
    let lastActivity = Date.now();
    let inactivityFollowUpShown = false;
    let ratingFlowActive = false;
    
    const INACTIVITY_TIMEOUT = 30000; // 30 seconds
    const RATING_TIMEOUT = 60000; // 60 seconds after inactivity
    
    // Reset inactivity timer
    function resetInactivityTimer() {
        lastActivity = Date.now();
        inactivityFollowUpShown = false;
        
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        
        inactivityTimer = setTimeout(() => {
            showInactivityFollowUp();
        }, INACTIVITY_TIMEOUT);
    }
    
    // Show inactivity follow-up message
    function showInactivityFollowUp() {
        if (inactivityFollowUpShown || ratingFlowActive) return;
        
        const currentLang = getCurrentLanguage();
        const followUpMessage = getInactivityMessage(currentLang);
        
        // Insert follow-up message into chat
        insertSystemMessage(followUpMessage, currentLang);
        inactivityFollowUpShown = true;
        
        // Start rating flow timer
        setTimeout(() => {
            if (!ratingFlowActive && inactivityFollowUpShown) {
                showMultilingualRatingFlow();
            }
        }, RATING_TIMEOUT);
    }
    
    // Show multilingual rating flow
    function showMultilingualRatingFlow() {
        if (ratingFlowActive) return;
        
        ratingFlowActive = true;
        const currentLang = getCurrentLanguage();
        const ratingMessage = getRatingMessage(currentLang);
        
        insertRatingWidget(ratingMessage, currentLang);
        
        console.log(`📊 Multilingual rating flow activated (${currentLang})`);
    }
    
    // Get current language
    function getCurrentLanguage() {
        const storedLang = localStorage.getItem('fooodis-language');
        if (storedLang === 'swedish') return 'swedish';
        if (window.chatbotWidget && window.chatbotWidget.currentLanguage) {
            return window.chatbotWidget.currentLanguage;
        }
        return 'english';
    }
    
    // Get inactivity message based on language
    function getInactivityMessage(language) {
        const messages = {
            swedish: {
                text: "👋 Hej! Jag märkte att du har varit tyst ett tag. Behöver du fortfarande hjälp?",
                buttons: [
                    { text: "Ja, jag behöver hjälp", action: "continue" },
                    { text: "Nej tack, jag är klar", action: "end" }
                ]
            },
            english: {
                text: "👋 Hi! I noticed you've been quiet for a while. Do you still need help?",
                buttons: [
                    { text: "Yes, I need help", action: "continue" },
                    { text: "No thanks, I'm done", action: "end" }
                ]
            }
        };
        
        return messages[language] || messages.english;
    }
    
    // Get rating message based on language
    function getRatingMessage(language) {
        const messages = {
            swedish: {
                title: "⭐ Betygsätt din upplevelse",
                text: "Hur nöjd var du med vår service idag?",
                ratingLabels: {
                    1: "Mycket missnöjd",
                    2: "Missnöjd",
                    3: "Neutral",
                    4: "Nöjd",
                    5: "Mycket nöjd"
                },
                commentPlaceholder: "Berätta mer om din upplevelse (valfritt)",
                submitButton: "Skicka betyg",
                skipButton: "Hoppa över"
            },
            english: {
                title: "⭐ Rate your experience",
                text: "How satisfied were you with our service today?",
                ratingLabels: {
                    1: "Very dissatisfied",
                    2: "Dissatisfied",
                    3: "Neutral",
                    4: "Satisfied",
                    5: "Very satisfied"
                },
                commentPlaceholder: "Tell us more about your experience (optional)",
                submitButton: "Submit rating",
                skipButton: "Skip"
            }
        };
        
        return messages[language] || messages.english;
    }
    
    // Insert system message into chat
    function insertSystemMessage(messageData, language) {
        const chatContainer = document.querySelector('.chatbot-messages') || 
                             document.querySelector('.chat-messages') ||
                             document.querySelector('#chatbot-messages');
        
        if (!chatContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chatbot-message system-message inactivity-followup';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="system-message-text">${messageData.text}</div>
                <div class="system-message-buttons">
                    ${messageData.buttons.map(btn => 
                        `<button class="system-button" data-action="${btn.action}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        messageElement.querySelectorAll('.system-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                handleInactivityAction(action, language);
                messageElement.style.opacity = '0.5';
                button.disabled = true;
            });
        });
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add animation
        setTimeout(() => {
            messageElement.style.animation = 'slideInUp 0.3s ease-out';
        }, 100);
    }
    
    // Insert rating widget
    function insertRatingWidget(ratingData, language) {
        const chatContainer = document.querySelector('.chatbot-messages') || 
                             document.querySelector('.chat-messages') ||
                             document.querySelector('#chatbot-messages');
        
        if (!chatContainer) return;
        
        const ratingElement = document.createElement('div');
        ratingElement.className = 'chatbot-message system-message rating-widget';
        ratingElement.innerHTML = `
            <div class="rating-content">
                <div class="rating-header">
                    <h4>${ratingData.title}</h4>
                    <p>${ratingData.text}</p>
                </div>
                <div class="rating-stars">
                    ${[1,2,3,4,5].map(star => 
                        `<span class="rating-star" data-rating="${star}" title="${ratingData.ratingLabels[star]}">
                            ⭐
                        </span>`
                    ).join('')}
                </div>
                <div class="rating-comment">
                    <textarea placeholder="${ratingData.commentPlaceholder}" rows="3"></textarea>
                </div>
                <div class="rating-buttons">
                    <button class="rating-submit" disabled>${ratingData.submitButton}</button>
                    <button class="rating-skip">${ratingData.skipButton}</button>
                </div>
            </div>
        `;
        
        // Add star rating functionality
        const stars = ratingElement.querySelectorAll('.rating-star');
        const submitBtn = ratingElement.querySelector('.rating-submit');
        const skipBtn = ratingElement.querySelector('.rating-skip');
        const commentArea = ratingElement.querySelector('textarea');
        let selectedRating = 0;
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                updateStarDisplay(stars, selectedRating);
                submitBtn.disabled = false;
            });
            
            star.addEventListener('mouseover', () => {
                updateStarDisplay(stars, index + 1, true);
            });
        });
        
        ratingElement.addEventListener('mouseleave', () => {
            updateStarDisplay(stars, selectedRating);
        });
        
        submitBtn.addEventListener('click', () => {
            const comment = commentArea.value.trim();
            submitRating(selectedRating, comment, language);
            ratingElement.style.opacity = '0.5';
            submitBtn.disabled = true;
            skipBtn.disabled = true;
        });
        
        skipBtn.addEventListener('click', () => {
            handleRatingSkip(language);
            ratingElement.style.opacity = '0.5';
            submitBtn.disabled = true;
            skipBtn.disabled = true;
        });
        
        chatContainer.appendChild(ratingElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add animation
        setTimeout(() => {
            ratingElement.style.animation = 'fadeInUp 0.4s ease-out';
        }, 100);
    }
    
    // Update star display
    function updateStarDisplay(stars, rating, isHover = false) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.opacity = '1';
                star.style.transform = 'scale(1.2)';
                star.style.filter = isHover ? 'brightness(1.2)' : 'none';
            } else {
                star.style.opacity = '0.3';
                star.style.transform = 'scale(1)';
                star.style.filter = 'none';
            }
        });
    }
    
    // Handle inactivity action
    function handleInactivityAction(action, language) {
        if (action === 'continue') {
            resetInactivityTimer();
            const continueMsg = language === 'swedish' ? 
                "Bra! Jag är här för att hjälpa dig. Vad kan jag göra för dig?" :
                "Great! I'm here to help you. What can I do for you?";
            insertSimpleSystemMessage(continueMsg);
        } else if (action === 'end') {
            const endMsg = language === 'swedish' ? 
                "Tack för att du använde vår service! Ha en bra dag! 👋" :
                "Thank you for using our service! Have a great day! 👋";
            insertSimpleSystemMessage(endMsg);
            ratingFlowActive = false;
        }
    }
    
    // Submit rating
    function submitRating(rating, comment, language) {
        const ratingData = {
            rating: rating,
            comment: comment,
            language: language,
            timestamp: new Date().toISOString(),
            sessionId: window.chatbotWidget?.sessionId || 'unknown'
        };
        
        // Store rating locally
        const existingRatings = JSON.parse(localStorage.getItem('fooodis-ratings') || '[]');
        existingRatings.push(ratingData);
        localStorage.setItem('fooodis-ratings', JSON.stringify(existingRatings));
        
        // Send to analytics if available
        if (window.chatbotWidget && window.chatbotWidget.sendAnalytics) {
            window.chatbotWidget.sendAnalytics('rating_submitted', ratingData);
        }
        
        const thankYouMsg = language === 'swedish' ? 
            `Tack för ditt betyg på ${rating} stjärnor! Din feedback hjälper oss att förbättra vår service. ⭐` :
            `Thank you for your ${rating}-star rating! Your feedback helps us improve our service. ⭐`;
        
        insertSimpleSystemMessage(thankYouMsg);
        ratingFlowActive = false;
        
        console.log('📊 Rating submitted:', ratingData);
    }
    
    // Handle rating skip
    function handleRatingSkip(language) {
        const skipMsg = language === 'swedish' ? 
            "Inget problem! Tack för att du använde vår service." :
            "No problem! Thank you for using our service.";
        
        insertSimpleSystemMessage(skipMsg);
        ratingFlowActive = false;
        
        console.log('📊 Rating skipped');
    }
    
    // Insert simple system message
    function insertSimpleSystemMessage(text) {
        const chatContainer = document.querySelector('.chatbot-messages') || 
                             document.querySelector('.chat-messages') ||
                             document.querySelector('#chatbot-messages');
        
        if (!chatContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chatbot-message system-message simple-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="system-message-text">${text}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Add animation
        setTimeout(() => {
            messageElement.style.animation = 'fadeIn 0.3s ease-out';
        }, 100);
    }
    
    // Activity tracking
    function trackActivity() {
        resetInactivityTimer();
    }
    
    // Event listeners for activity tracking
    const activityEvents = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Chat-specific activity tracking
    const chatInputs = document.querySelectorAll('input[type="text"], textarea');
    chatInputs.forEach(input => {
        input.addEventListener('input', trackActivity);
    });
    
    // Initialize inactivity timer
    resetInactivityTimer();
    
    console.log('⏰ Inactivity system initialized with 30s timeout');
};

// CSS for inactivity and rating system
const inactivityStyles = `
    .inactivity-followup {
        background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
        border-left: 4px solid #2196f3;
        animation: slideInUp 0.3s ease-out;
    }
    
    .rating-widget {
        background: linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%);
        border-left: 4px solid #ff9800;
        animation: fadeInUp 0.4s ease-out;
    }
    
    .system-message-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .system-button {
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: linear-gradient(135deg, #2196f3, #21cbf3);
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .system-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
    }
    
    .system-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
    
    .rating-content {
        padding: 10px;
    }
    
    .rating-header h4 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 16px;
    }
    
    .rating-header p {
        margin: 0 0 15px 0;
        color: #666;
        font-size: 14px;
    }
    
    .rating-stars {
        display: flex;
        gap: 5px;
        margin-bottom: 15px;
        justify-content: center;
    }
    
    .rating-star {
        font-size: 24px;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.3;
    }
    
    .rating-star:hover {
        transform: scale(1.2);
    }
    
    .rating-comment textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
        margin-bottom: 15px;
    }
    
    .rating-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .rating-submit, .rating-skip {
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
    }
    
    .rating-submit {
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
    }
    
    .rating-submit:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    .rating-skip {
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
    }
    
    .rating-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
    }
    
    .rating-skip:hover {
        background: #f5f5f5;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;

// Inject inactivity styles
if (!document.getElementById('inactivity-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'inactivity-styles';
    styleSheet.textContent = inactivityStyles;
    document.head.appendChild(styleSheet);
}

// Initialize inactivity system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initInactivitySystem);
} else {
    window.initInactivitySystem();
}
