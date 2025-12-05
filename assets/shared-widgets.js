/**
 * Shared Widgets - Chatbot Button & Back to Top
 * Shows on all pages
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Add CSS for widgets
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
        /* Chatbot Button */
        .chatbot-widget {
            position: fixed;
            bottom: 100px;
            right: 20px;
            z-index: 9999;
        }
        
        .chatbot-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e8f24c;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
        .back-to-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9998;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: transparent;
            border: 2px solid #e8f24c;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
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
    `;
    document.head.appendChild(widgetStyles);
    
    // Create Chatbot Button (if not exists)
    if (!document.querySelector('.chatbot-widget')) {
        const chatbotWidget = document.createElement('div');
        chatbotWidget.className = 'chatbot-widget';
        chatbotWidget.innerHTML = `
            <button class="chatbot-button" title="Chat with us" onclick="window.open('https://fooodis.com/chat', '_blank')">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/>
                </svg>
                <span class="chatbot-badge">1</span>
            </button>
        `;
        document.body.appendChild(chatbotWidget);
    }
    
    // Create Back to Top Button (if not exists)
    if (!document.querySelector('.back-to-top')) {
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
