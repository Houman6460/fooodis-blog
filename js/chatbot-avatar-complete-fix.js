
/**
 * Chatbot Avatar Complete Fix
 * Comprehensive solution for chatbot avatar display issues on Replit
 */

console.log('🔧 Chatbot Avatar Complete Fix: Initializing comprehensive solution...');

// Emergency avatar data with base64 encoded SVGs
const EMERGENCY_AVATARS = {
    'default': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNlOGYyNGMiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iOCIgZmlsbD0iIzFlMjEyNyIvPgo8cGF0aCBkPSJNIDM1IDM1IFEgNDAgMzggNDUgMzUiIHN0cm9rZT0iIzFlMjEyNyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0gMjggNTUgUSA0MCA2NSA1MiA1NSIgZmlsbD0iI2U3NGMzYyIvPgo8cmVjdCB4PSIzNSIgeT0iNDUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzJDM0U1MCIvPgo8dGV4dCB4PSI0MCIgeT0iNzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkpvZTwvdGV4dD4KPC9zdmc+',
    'alex': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0Yzc5ZjIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iOCIgZmlsbD0iIzFlMjEyNyIvPgo8cGF0aCBkPSJNIDM1IDM1IFEgNDAgMzggNDUgMzUiIHN0cm9rZT0iIzFlMjEyNyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0gMjggNTUgUSA0MCA2NSA1MiA1NSIgZmlsbD0iI2Y3NGM3NCIvPgo8cmVjdCB4PSIzNSIgeT0iNDUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzJDM0U1MCIvPgo8dGV4dCB4PSI0MCIgeT0iNzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFsZXg8L3RleHQ+Cjwvc3ZnPg==',
    'sarah': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNmMjRjOWMiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iOCIgZmlsbD0iIzFlMjEyNyIvPgo8cGF0aCBkPSJNIDM1IDM1IFEgNDAgMzggNDUgMzUiIHN0cm9rZT0iIzFlMjEyNyIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0gMjggNTUgUSA0MCA2NSA1MiA1NSIgZmlsbD0iI2Y3NGM3NCIvPgo8cmVjdCB4PSIzNSIgeT0iNDUiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzJDM0U1MCIvPgo8dGV4dCB4PSI0MCIgeT0iNzIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlNhcmFoPC90ZXh0Pgo8L3N2Zz4='
};

// Global fix state
window.CHATBOT_AVATAR_FIX_ACTIVE = true;

/**
 * Emergency chatbot initialization
 */
function emergencyInitializeChatbot() {
    console.log('🚨 Emergency Chatbot Init: Starting...');
    
    // Check if chatbot container exists
    let chatbotContainer = document.getElementById('fooodis-chatbot');
    
    if (!chatbotContainer) {
        console.log('🚨 Creating emergency chatbot container...');
        chatbotContainer = document.createElement('div');
        chatbotContainer.id = 'fooodis-chatbot';
        chatbotContainer.className = 'bottom-right';
        document.body.appendChild(chatbotContainer);
    }
    
    // Force create chatbot button with avatar
    createEmergencyChatbotButton(chatbotContainer);
    
    // Initialize minimal chatbot functionality
    initializeMinimalChatbot();
}

/**
 * Create emergency chatbot button with working avatar
 */
function createEmergencyChatbotButton(container) {
    console.log('🔄 Creating emergency chatbot button...');
    
    // Clear existing content
    container.innerHTML = '';
    
    // Get random avatar
    const avatarKeys = Object.keys(EMERGENCY_AVATARS);
    const randomAvatar = EMERGENCY_AVATARS[avatarKeys[Math.floor(Math.random() * avatarKeys.length)]];
    
    // Create button HTML
    const buttonHTML = `
        <div class="chatbot-button" id="chatbot-button">
            <div class="chatbot-avatar">
                <img src="${randomAvatar}" 
                     alt="Fooodis Assistant Avatar" 
                     style="display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;"
                     onload="console.log('✅ Avatar loaded successfully')"
                     onerror="console.error('❌ Avatar failed to load')">
            </div>
            <div class="notification-badge" id="notification-badge" style="display: none;">1</div>
        </div>
    `;
    
    container.innerHTML = buttonHTML;
    
    // Apply emergency styles
    applyEmergencyStyles(container);
    
    // Add click functionality
    const button = container.querySelector('.chatbot-button');
    if (button) {
        button.addEventListener('click', function() {
            console.log('🎯 Chatbot button clicked');
            toggleChatbotWindow();
        });
    }
    
    console.log('✅ Emergency chatbot button created successfully');
}

/**
 * Apply emergency styles to ensure visibility
 */
function applyEmergencyStyles(container) {
    // Container styles
    Object.assign(container.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '999999',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    
    // Button styles
    const button = container.querySelector('.chatbot-button');
    if (button) {
        Object.assign(button.style, {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#e8f24c',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            position: 'relative',
            border: 'none',
            outline: 'none'
        });
        
        // Hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Avatar container styles
    const avatarContainer = container.querySelector('.chatbot-avatar');
    if (avatarContainer) {
        Object.assign(avatarContainer.style, {
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
    }
}

/**
 * Initialize minimal chatbot functionality
 */
function initializeMinimalChatbot() {
    console.log('🔧 Initializing minimal chatbot functionality...');
    
    // Create minimal chat window if it doesn't exist
    if (!document.getElementById('chatbot-window')) {
        createMinimalChatWindow();
    }
    
    // Override any existing FoodisChatbot object
    window.FoodisChatbot = {
        init: function(config) {
            console.log('✅ FoodisChatbot.init called with config:', config);
            emergencyInitializeChatbot();
        },
        
        show: function() {
            console.log('📱 FoodisChatbot.show called');
            showChatbotWindow();
        },
        
        hide: function() {
            console.log('🫥 FoodisChatbot.hide called');
            hideChatbotWindow();
        },
        
        toggle: function() {
            console.log('🔄 FoodisChatbot.toggle called');
            toggleChatbotWindow();
        }
    };
    
    console.log('✅ Minimal chatbot functionality initialized');
}

/**
 * Create minimal chat window
 */
function createMinimalChatWindow() {
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 999998;
        display: none;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    
    chatWindow.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #eee; background: #e8f24c; border-radius: 12px 12px 0 0;">
            <h3 style="margin: 0; color: #1e2127; font-size: 16px;">Fooodis Assistant</h3>
            <button onclick="hideChatbotWindow()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #1e2127;">×</button>
        </div>
        <div style="flex: 1; padding: 20px; overflow-y: auto;">
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong>🇬🇧 English:</strong> Hello! I'm your Fooodis assistant. How can I help you today?
            </div>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
                <strong>🇸🇪 Svenska:</strong> Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?
            </div>
        </div>
        <div style="padding: 15px; border-top: 1px solid #eee;">
            <input type="text" placeholder="Type your message..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
        </div>
    `;
    
    document.body.appendChild(chatWindow);
}

/**
 * Chat window controls
 */
function toggleChatbotWindow() {
    const window = document.getElementById('chatbot-window');
    if (window) {
        if (window.style.display === 'none' || !window.style.display) {
            showChatbotWindow();
        } else {
            hideChatbotWindow();
        }
    }
}

function showChatbotWindow() {
    const window = document.getElementById('chatbot-window');
    if (window) {
        window.style.display = 'flex';
    }
}

function hideChatbotWindow() {
    const window = document.getElementById('chatbot-window');
    if (window) {
        window.style.display = 'none';
    }
}

// Make functions globally available
window.toggleChatbotWindow = toggleChatbotWindow;
window.showChatbotWindow = showChatbotWindow;
window.hideChatbotWindow = hideChatbotWindow;

/**
 * Fix existing chatbot buttons
 */
function fixExistingChatbotButtons() {
    console.log('🔍 Searching for existing chatbot buttons to fix...');
    
    // Find all existing chatbot buttons
    const existingButtons = document.querySelectorAll('.chatbot-button, #chatbot-button');
    
    existingButtons.forEach((button, index) => {
        console.log(`🔧 Fixing existing button ${index + 1}...`);
        
        // Find avatar image
        const avatarImg = button.querySelector('img, .chatbot-avatar img');
        if (avatarImg) {
            // Get a random working avatar
            const avatarKeys = Object.keys(EMERGENCY_AVATARS);
            const randomAvatar = EMERGENCY_AVATARS[avatarKeys[Math.floor(Math.random() * avatarKeys.length)]];
            
            // Replace the src
            avatarImg.src = randomAvatar;
            avatarImg.style.cssText = 'display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;';
            
            console.log(`✅ Fixed avatar for button ${index + 1}`);
        }
        
        // Ensure button has click functionality
        if (!button.onclick && !button.getAttribute('data-click-added')) {
            button.addEventListener('click', toggleChatbotWindow);
            button.setAttribute('data-click-added', 'true');
            console.log(`✅ Added click handler to button ${index + 1}`);
        }
    });
}

/**
 * Monitor for dynamically added chatbot elements
 */
function startChatbotMonitoring() {
    console.log('👀 Starting chatbot element monitoring...');
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if it's a chatbot button or contains one
                        if (node.classList && (node.classList.contains('chatbot-button') || node.id === 'chatbot-button')) {
                            console.log('🆕 New chatbot button detected, fixing...');
                            setTimeout(() => fixExistingChatbotButtons(), 100);
                        }
                        
                        // Check for chatbot buttons inside the added node
                        const innerButtons = node.querySelectorAll && node.querySelectorAll('.chatbot-button, #chatbot-button');
                        if (innerButtons && innerButtons.length > 0) {
                            console.log(`🆕 ${innerButtons.length} new chatbot buttons detected inside added node, fixing...`);
                            setTimeout(() => fixExistingChatbotButtons(), 100);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Chatbot monitoring started');
}

/**
 * Force avatar refresh periodically
 */
function startPeriodicAvatarCheck() {
    console.log('⏰ Starting periodic avatar check...');
    
    setInterval(function() {
        const avatarImages = document.querySelectorAll('.chatbot-avatar img, .chatbot-button img');
        
        avatarImages.forEach(function(img, index) {
            // Check if image failed to load or has placeholder/broken src
            if (!img.complete || img.naturalWidth === 0 || img.src.includes('placeholder') || img.src === '') {
                console.log(`🔄 Refreshing broken avatar ${index + 1}...`);
                
                // Get a random working avatar
                const avatarKeys = Object.keys(EMERGENCY_AVATARS);
                const randomAvatar = EMERGENCY_AVATARS[avatarKeys[Math.floor(Math.random() * avatarKeys.length)]];
                
                img.src = randomAvatar;
                img.style.cssText = 'display: block; object-fit: cover; width: 100%; height: 100%; border-radius: 50%; background-color: #e8f24c;';
            }
        });
    }, 10000); // Check every 10 seconds
}

/**
 * Main initialization function
 */
function initializeChatbotAvatarCompleteFix() {
    console.log('🚀 Chatbot Avatar Complete Fix: Starting initialization...');
    
    try {
        // Step 1: Emergency chatbot initialization
        emergencyInitializeChatbot();
        
        // Step 2: Fix any existing chatbot buttons
        setTimeout(() => {
            fixExistingChatbotButtons();
        }, 500);
        
        // Step 3: Start monitoring for new elements
        startChatbotMonitoring();
        
        // Step 4: Start periodic avatar checks
        startPeriodicAvatarCheck();
        
        // Step 5: Final comprehensive check after everything loads
        setTimeout(() => {
            console.log('🔍 Running final comprehensive chatbot check...');
            
            // Ensure at least one working chatbot exists
            const existingChatbots = document.querySelectorAll('#fooodis-chatbot, .chatbot-button, #chatbot-button');
            
            if (existingChatbots.length === 0) {
                console.log('🚨 No chatbot found, creating emergency chatbot...');
                emergencyInitializeChatbot();
            } else {
                console.log(`✅ Found ${existingChatbots.length} chatbot element(s), ensuring they work...`);
                fixExistingChatbotButtons();
            }
        }, 2000);
        
        console.log('✅ Chatbot Avatar Complete Fix: Initialization complete');
        
    } catch (error) {
        console.error('❌ Error in chatbot avatar fix:', error);
        
        // Fallback: try again after a delay
        setTimeout(() => {
            console.log('🔄 Retrying chatbot avatar fix...');
            emergencyInitializeChatbot();
        }, 3000);
    }
}

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbotAvatarCompleteFix);
} else {
    initializeChatbotAvatarCompleteFix();
}

// Also run on window load as backup
window.addEventListener('load', function() {
    console.log('🔄 Window loaded, running chatbot avatar fix backup...');
    setTimeout(initializeChatbotAvatarCompleteFix, 1000);
});

console.log('✅ Chatbot Avatar Complete Fix: Script loaded successfully');
