/**
 * Shared Widgets - Chatbot, Back to Top & Cookie Consent
 * Shows on all pages
 */

// Load Cookie Consent
function loadCookieConsent() {
    // Load CSS
    if (!document.querySelector('link[href*="cookie-consent.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/cookie-consent.css';
        document.head.appendChild(link);
    }
    
    // Load JS
    if (!document.querySelector('script[src*="cookie-consent.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/cookie-consent.js';
        document.head.appendChild(script);
    }
}

// Load Analytics Tracker
function loadAnalyticsTracker() {
    if (!document.querySelector('script[src*="analytics-tracker.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/analytics-tracker.js';
        script.defer = true;
        document.head.appendChild(script);
    }
}

// Load Image Optimizer
function loadImageOptimizer() {
    if (!document.querySelector('script[src*="image-optimizer.js"]')) {
        const script = document.createElement('script');
        script.src = 'assets/image-optimizer.js';
        script.defer = true;
        document.head.appendChild(script);
    }
}

// Load chatbot scripts dynamically
function loadChatbotScripts() {
    const chatbotScripts = [
        'js/chatbot-management.js',
        'js/chatbot-message-enhancer.js',
        'js/chatbot-widget.js',
        'js/chatbot-integration-fixes.js',
        'js/chatbot-integration-patch.js'
    ];
    
    let loaded = 0;
    chatbotScripts.forEach(function(src) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            loaded++;
            if (loaded === chatbotScripts.length) {
                initializeChatbot();
            }
        };
        script.onerror = function() {
            loaded++;
        };
        document.head.appendChild(script);
    });
}

// Initialize chatbot after scripts loaded
function initializeChatbot() {
    setTimeout(function() {
        if (typeof window.FoodisChatbot !== 'undefined') {
            try {
                window.FoodisChatbot.init({
                    apiEndpoint: window.location.origin + '/api/chatbot',
                    position: 'bottom-right'
                });
                console.log('Chatbot initialized on this page');
            } catch (e) {
                console.log('Chatbot init error:', e);
            }
        }
    }, 500);
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Load Cookie Consent Banner (shows on all pages)
    loadCookieConsent();
    
    // Load Analytics Tracker (shows on all pages)
    loadAnalyticsTracker();
    
    // Load Image Optimizer (lazy loading + WebP)
    loadImageOptimizer();
    
    // Load chatbot scripts if not already loaded
    if (typeof window.FoodisChatbot === 'undefined' && !document.querySelector('#fooodis-chatbot')) {
        loadChatbotScripts();
    }
    
    // Add CSS for widgets
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        /* Chatbot Button */
        .chatbot-widget {
            position: fixed !important;
            bottom: 90px !important;
            right: 25px !important;
            z-index: 999999 !important;
        }
        
        .chatbot-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e8f24c !important;
            border: none;
            cursor: pointer;
            display: flex !important;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
        }
        
        .chatbot-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        
        .chatbot-button svg {
            width: 30px;
            height: 30px;
            fill: #1e2127;
        }
        
        .chatbot-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4757;
            color: white;
            font-size: 12px;
            font-weight: bold;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Back to Top Button */
        .back-to-top,
        .u-back-to-top,
        [class*="back-to-top"] {
            position: fixed !important;
            bottom: 20px !important;
            right: 25px !important;
            z-index: 999998 !important;
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            max-width: 50px !important;
            min-height: 50px !important;
            max-height: 50px !important;
            border-radius: 50% !important;
            background: transparent !important;
            border: 2px solid #e8f24c !important;
            cursor: pointer;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
            padding: 0 !important;
        }
        
        .back-to-top.visible {
            opacity: 0.85;
            visibility: visible;
        }
        
        .back-to-top:hover {
            opacity: 1;
            transform: scale(1.1);
        }
        
        .back-to-top svg {
            width: 24px;
            height: 24px;
            stroke: #e8f24c;
            fill: none;
            stroke-width: 2;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .chatbot-widget {
                bottom: 80px !important;
                right: 15px !important;
            }
            
            .chatbot-button {
                width: 50px;
                height: 50px;
            }
            
            .chatbot-button svg {
                width: 24px;
                height: 24px;
            }
            
            .back-to-top {
                bottom: 15px !important;
                right: 15px !important;
                width: 45px;
                height: 45px;
            }
            
            .back-to-top svg {
                width: 20px;
                height: 20px;
            }
        }
    `;
    document.head.appendChild(widgetStyles);
    
    // Create Chatbot Button (if not exists)
    if (!document.querySelector('.chatbot-widget') && !document.querySelector('#fooodis-chatbot')) {
        const chatbotWidget = document.createElement('div');
        chatbotWidget.className = 'chatbot-widget';
        chatbotWidget.innerHTML = `
            <button class="chatbot-button" title="Chat with us" id="shared-chatbot-btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/>
                </svg>
                <span class="chatbot-badge">1</span>
            </button>
        `;
        document.body.appendChild(chatbotWidget);
        
        // Add click handler
        document.getElementById('shared-chatbot-btn').addEventListener('click', function() {
            // Check if FoodisChatbot exists and toggle it
            if (typeof window.FoodisChatbot !== 'undefined') {
                if (window.FoodisChatbot.toggle) {
                    window.FoodisChatbot.toggle();
                } else if (window.FoodisChatbot.open) {
                    window.FoodisChatbot.open();
                }
            } else {
                // Try to find and click existing chatbot button
                const existingBtn = document.querySelector('#fooodis-chatbot .chatbot-toggle, .chatbot-toggle-btn');
                if (existingBtn) {
                    existingBtn.click();
                }
            }
        });
    }
    
    // Create Back to Top Button (if not exists) - check multiple selectors
    const existingBackToTop = document.querySelector('.back-to-top, .u-back-to-top, [class*="back-to-top"]');
    if (!existingBackToTop) {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.title = 'Back to top';
        backToTop.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(backToTop);
        
        // Show/hide back to top based on scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
    }
});
