/**
 * 🎨 FOOODIS CHATBOT MESSAGE ENHANCER
 * Enhanced message rendering with interactive links, copy buttons, and rich formatting
 */

window.ChatbotMessageEnhancer = {
    
    // 🎯 Main processing function - enhances message content with interactive features
    processMessageContent: function(content) {
        if (!content || typeof content !== 'string') {
            return content;
        }
        
        let processedContent = content;
        
        // 1. 🔗 Smart Link Buttons - Convert URLs to labeled buttons
        processedContent = this.processSmartLinks(processedContent);
        
        // 2. 📋 Copy Code Buttons - Convert discount codes to copy buttons
        processedContent = this.processDiscountCodes(processedContent);
        
        // 3. 🎨 Rich Text Formatting - Bold titles and colored sections
        processedContent = this.processRichTextFormatting(processedContent);
        
        return processedContent;
    },
    
    // Process smart links: Convert URLs to labeled buttons
    processSmartLinks: function(content) {
        // Enhanced URL regex that properly handles trailing punctuation
        const urlRegex = /https?:\/\/[^\s<>"]+/gi;
        let linkCount = 0;
        
        return content.replace(urlRegex, (matchedUrl) => {
            linkCount++;
            
            // Clean URL by removing trailing special characters
            const cleanUrl = this.cleanUrl(matchedUrl);
            const smartLabel = this.getSmartLinkLabel(cleanUrl);
            const smartIcon = this.getSmartLinkIcon(cleanUrl);
            const numberPrefix = linkCount > 1 ? `${linkCount}. ` : '';
            
            return `<button class="chatbot-link-btn" onclick="window.open('${cleanUrl}', '_blank')" title="${cleanUrl}">
                <span class="material-icons-outlined">${smartIcon}</span> ${numberPrefix}${smartLabel}
            </button>`;
        });
    },
    
    // Clean URL by removing trailing special characters
    cleanUrl: function(url) {
        // Remove trailing punctuation that might be captured by regex
        return url.replace(/[.,;:!?()\[\]{}"']+$/, '');
    },
    
    // Get smart icon for URL based on content type
    getSmartLinkIcon: function(url) {
        const iconPatterns = {
            '/pos': 'point_of_sale',
            '/pricing': 'attach_money',
            '/payment': 'payment',
            '/features': 'star',
            '/demo': 'play_circle',
            '/contact': 'contact_support',
            '/support': 'help_center',
            '/docs': 'description',
            '/documentation': 'description',
            '/blog': 'article',
            '/about': 'info',
            '/dashboard': 'dashboard',
            '/login': 'login',
            '/signup': 'person_add',
            '/register': 'person_add',
            '/settings': 'settings',
            '/profile': 'account_circle',
            '/download': 'download',
            '/upload': 'upload'
        };
        
        // Check for known patterns
        for (const [pattern, icon] of Object.entries(iconPatterns)) {
            if (url.toLowerCase().includes(pattern)) {
                return icon;
            }
        }
        
        // Default link icon
        return 'link';
    },
    
    // Get smart label for URL
    getSmartLinkLabel: function(url) {
        const urlPatterns = {
            // 🏪 POS & Business
            '/pos': '🏪 POS System',
            '/point-of-sale': '🏪 POS System',
            '/payment': '💳 Payment Settings',
            '/billing': '💰 Billing',
            '/invoice': '🧾 Invoicing',
            
            // 📊 Business Features
            '/pricing': '💰 Pricing Plans',
            '/features': '⭐ Features',
            '/dashboard': '📊 Dashboard',
            '/analytics': '📈 Analytics',
            '/reports': '📋 Reports',
            
            // 🎯 Marketing & Demo
            '/demo': '🎬 Live Demo',
            '/trial': '🎯 Free Trial',
            '/signup': '👤 Sign Up',
            '/register': '📝 Register',
            '/login': '🔐 Login',
            
            // 📞 Support & Info
            '/contact': '📞 Contact Us',
            '/support': '🆘 Support',
            '/help': '❓ Help Center',
            '/docs': '📚 Documentation',
            '/documentation': '📚 Documentation',
            '/api': '🔧 API Docs',
            
            // 📝 Content
            '/blog': '📝 Blog',
            '/news': '📰 News',
            '/about': 'ℹ️ About Us',
            '/company': '🏢 Company Info',
            
            // ⚙️ Account & Settings
            '/settings': '⚙️ Settings',
            '/profile': '👤 Profile',
            '/account': '🏠 Account',
            '/download': '⬇️ Download',
            '/upload': '⬆️ Upload'
        };
        
        // Check for known patterns
        for (const [pattern, label] of Object.entries(urlPatterns)) {
            if (url.toLowerCase().includes(pattern)) {
                return label;
            }
        }
        
        // Extract domain name as fallback
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
            return 'Visit Link';
        }
    },
    
    // Process discount codes: Convert codes to copy buttons
    processDiscountCodes: function(content) {
        // Match discount code patterns (SAVE20, DISCOUNT50, 20OFF, etc.)
        const codeRegex = /\b([A-Z0-9]{4,}(?:OFF|SAVE|DISCOUNT)?\d*)\b(?=\s|$|[.,!?])/gi;
        let codeCount = 0;
        
        return content.replace(codeRegex, (match, code) => {
            // Only process if it looks like a discount code
            if (this.isDiscountCode(code)) {
                codeCount++;
                const numberPrefix = codeCount > 1 ? `${codeCount}. ` : '';
                return `<button class="chatbot-copy-btn" onclick="window.ChatbotMessageEnhancer.copyToClipboard('${code}')" title="Click to copy ${code}">
                    <span class="material-icons-outlined">content_copy</span> ${numberPrefix}${code}
                </button>`;
            }
            return match;
        });
    },
    
    // Check if text looks like a discount code
    isDiscountCode: function(text) {
        const discountPatterns = [
            /^(SAVE|DISCOUNT|OFF|GET)\d+$/i,
            /^\d+(OFF|SAVE|DISCOUNT)$/i,
            /^[A-Z]{2,}\d{2,}$/,
            /^(WELCOME|NEW|FIRST|SPECIAL)\d+$/i,
            /^(FOOODIS|FOOD|RESTAURANT)\d+$/i
        ];
        
        return discountPatterns.some(pattern => pattern.test(text)) && text.length >= 4;
    },
    
    // Process rich text formatting: Bold titles and colored sections
    processRichTextFormatting: function(content) {
        let processedContent = content;
        
        // Bold titles (lines starting with # or **)
        processedContent = processedContent.replace(/^#{1,3}\s*(.+)$/gm, '<h3 class="chatbot-title">$1</h3>');
        processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong class="chatbot-bold">$1</strong>');
        
        // Colored sections based on content
        const colorPatterns = {
            'Features': 'color-features',
            'Pricing': 'color-pricing', 
            'Support': 'color-support',
            'Benefits': 'color-benefits',
            'Important': 'color-important',
            'Note': 'color-note',
            'POS': 'color-pos',
            'Restaurant': 'color-restaurant'
        };
        
        for (const [keyword, colorClass] of Object.entries(colorPatterns)) {
            const regex = new RegExp(`(${keyword}:?\\s*)`, 'gi');
            processedContent = processedContent.replace(regex, `<span class="${colorClass}">$1</span>`);
        }
        
        // Line breaks for better formatting
        processedContent = processedContent.replace(/\n/g, '<br>');
        
        return processedContent;
    },
    
    // Copy text to clipboard utility
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showCopyFeedback(`✅ Copied: ${text}`);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyFeedback(`✅ Copied: ${text}`);
        });
    },
    
    // Show copy success feedback
    showCopyFeedback: function(message) {
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
};

// 🎨 Enhanced CSS Styles for Interactive Message Elements
const enhancedStyles = `
<style>
/* Import Material Design Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined');

/* 🔗 Smart Link Buttons */
.chatbot-link-btn {
    background: linear-gradient(135deg, #e8f24c 0%, #d4e635 100%);
    color: #2c3e50;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    margin: 6px 8px 6px 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(232, 242, 76, 0.3);
    border: 1px solid rgba(232, 242, 76, 0.5);
}

.chatbot-link-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(232, 242, 76, 0.4);
    background: linear-gradient(135deg, #f0f74f 0%, #e8f24c 100%);
}

.chatbot-link-btn .material-icons-outlined {
    font-size: 18px;
    color: #2c3e50;
}

/* 📋 Copy Code Buttons */
.chatbot-copy-btn {
    background: linear-gradient(135deg, #e8f24c 0%, #d4e635 100%);
    color: #2c3e50;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    margin: 6px 8px 6px 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(232, 242, 76, 0.3);
    border: 1px solid rgba(232, 242, 76, 0.6);
    font-family: 'Courier New', monospace;
}

.chatbot-copy-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(232, 242, 76, 0.4);
    background: linear-gradient(135deg, #f0f74f 0%, #e8f24c 100%);
}

.chatbot-copy-btn .material-icons-outlined {
    font-size: 16px;
    color: #2c3e50;
}

/* 🎨 Rich Text Formatting */
.chatbot-title {
    color: #2c3e50;
    font-weight: 700;
    margin: 12px 0 8px 0;
    font-size: 16px;
    border-left: 4px solid #3498db;
    padding-left: 12px;
}

.chatbot-bold {
    font-weight: 700;
    color: #2c3e50;
}

/* 🌈 Colored Sections */
.color-features { color: #3498db; font-weight: 600; }
.color-pricing { color: #e74c3c; font-weight: 600; }
.color-support { color: #f39c12; font-weight: 600; }
.color-benefits { color: #27ae60; font-weight: 600; }
.color-important { color: #e74c3c; font-weight: 700; background: #ffeaa7; padding: 2px 6px; border-radius: 4px; }
.color-note { color: #8e44ad; font-weight: 600; }
.color-pos { color: #00b894; font-weight: 600; }
.color-restaurant { color: #d63031; font-weight: 600; }

/* ✅ Copy Feedback Animation */
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.copy-feedback {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
`;

// Inject enhanced styles into the document
if (!document.getElementById('chatbot-enhanced-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'chatbot-enhanced-styles';
    styleElement.innerHTML = enhancedStyles;
    document.head.appendChild(styleElement);
}

console.log('🎨 Chatbot Message Enhancer loaded successfully!');
