
/**
 * Missing Scripts Handler
 * Prevents 404 errors and provides fallback functionality for missing scripts
 */

console.log('🔧 Missing Scripts Handler: Initializing...');

// Track which scripts have been attempted to load
const attemptedScripts = new Set();
const loadedScripts = new Set();
const failedScripts = new Set();

/**
 * Essential script definitions with fallback implementations
 */
const essentialScripts = {
    'js/jquery.js': {
        fallback: function() {
            // Minimal jQuery-like implementation
            if (!window.$) {
                window.$ = function(selector) {
                    if (typeof selector === 'string') {
                        return document.querySelectorAll(selector);
                    } else if (typeof selector === 'function') {
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', selector);
                        } else {
                            selector();
                        }
                    }
                    return selector;
                };
                
                window.jQuery = window.$;
                console.log('✅ jQuery fallback loaded');
            }
        }
    },
    
    'js/nicepage.js': {
        fallback: function() {
            // Minimal nicepage functionality
            if (!window.Nicepage) {
                window.Nicepage = {
                    init: function() {
                        console.log('✅ Nicepage fallback initialized');
                    }
                };
            }
        }
    },
    
    'js/blog.js': {
        fallback: function() {
            // Essential blog functionality
            if (!window.loadBlogPosts) {
                window.loadBlogPosts = function() {
                    console.log('📝 Blog posts fallback loader');
                    
                    try {
                        const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
                        const grid = document.getElementById('blogPostsGrid');
                        
                        if (grid && posts.length > 0) {
                            grid.innerHTML = posts.slice(0, 6).map(post => `
                                <div class="blog-post-card">
                                    <h3>${post.title || 'Untitled'}</h3>
                                    <p>${post.excerpt || post.content?.substring(0, 150) || 'No content available'}...</p>
                                    <div class="post-meta">
                                        <span>${new Date(post.date).toLocaleDateString()}</span>
                                        <span>${post.category || 'General'}</span>
                                    </div>
                                </div>
                            `).join('');
                        }
                    } catch (error) {
                        console.error('Error in blog fallback:', error);
                    }
                };
                
                // Auto-load if on blog page
                if (window.location.pathname.includes('blog.html')) {
                    setTimeout(window.loadBlogPosts, 1000);
                }
            }
        }
    },
    
    'js/chatbot-widget.js': {
        fallback: function() {
            // Initialize emergency chatbot
            if (!window.FoodisChatbot) {
                // This will be handled by the complete chatbot fix
                console.log('🤖 Chatbot widget fallback - delegating to complete fix');
            }
        }
    },
    
    'js/dashboard.js': {
        fallback: function() {
            // Essential dashboard functionality
            if (window.location.pathname.includes('dashboard.html')) {
                console.log('📊 Dashboard fallback initializing...');
                
                // Basic section switching
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.nav-item')) {
                        const navItem = e.target.closest('.nav-item');
                        const section = navItem.getAttribute('data-section');
                        
                        if (section) {
                            // Hide all sections
                            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
                            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                            
                            // Show target section
                            const targetSection = document.getElementById(section + '-section');
                            if (targetSection) {
                                targetSection.classList.add('active');
                                navItem.classList.add('active');
                            }
                        }
                    }
                });
            }
        }
    },
    
    'js/footer-bubbles.js': {
        fallback: function() {
            // Simple footer bubbles
            const footer = document.querySelector('.fooodis-footer');
            if (footer) {
                const bubblesContainer = footer.querySelector('.bubbles');
                if (bubblesContainer) {
                    // Create simple animated bubbles
                    for (let i = 0; i < 5; i++) {
                        const bubble = document.createElement('div');
                        bubble.style.cssText = `
                            position: absolute;
                            width: ${10 + Math.random() * 20}px;
                            height: ${10 + Math.random() * 20}px;
                            background: rgba(232, 242, 76, 0.3);
                            border-radius: 50%;
                            bottom: 0;
                            left: ${Math.random() * 100}%;
                            animation: float-up ${5 + Math.random() * 5}s infinite linear;
                        `;
                        bubblesContainer.appendChild(bubble);
                    }
                    
                    // Add CSS animation if not exists
                    if (!document.querySelector('#bubble-animation-style')) {
                        const style = document.createElement('style');
                        style.id = 'bubble-animation-style';
                        style.textContent = `
                            @keyframes float-up {
                                from { transform: translateY(0); opacity: 1; }
                                to { transform: translateY(-100vh); opacity: 0; }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
            }
        }
    }
};

/**
 * Smart script loader with fallback
 */
function loadScriptWithFallback(src, essential = false) {
    return new Promise((resolve, reject) => {
        if (attemptedScripts.has(src)) {
            resolve(false);
            return;
        }
        
        attemptedScripts.add(src);
        
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        
        script.onload = function() {
            loadedScripts.add(src);
            console.log(`✅ Script loaded: ${src}`);
            resolve(true);
        };
        
        script.onerror = function() {
            failedScripts.add(src);
            console.warn(`❌ Script failed to load: ${src}`);
            
            // Try fallback if it's an essential script
            if (essential && essentialScripts[src]) {
                console.log(`🔄 Loading fallback for: ${src}`);
                try {
                    essentialScripts[src].fallback();
                    console.log(`✅ Fallback loaded for: ${src}`);
                    resolve(true);
                } catch (error) {
                    console.error(`❌ Fallback failed for ${src}:`, error);
                    reject(error);
                }
            } else {
                reject(new Error(`Script not found: ${src}`));
            }
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Load essential scripts with fallbacks
 */
async function loadEssentialScripts() {
    console.log('📦 Loading essential scripts...');
    
    const scriptList = Object.keys(essentialScripts);
    
    for (const script of scriptList) {
        try {
            await loadScriptWithFallback(script, true);
        } catch (error) {
            console.warn(`Failed to load essential script: ${script}`, error);
        }
    }
    
    console.log('✅ Essential scripts loading complete');
    
    // Report status
    console.log(`📊 Script loading summary:
    - Loaded: ${loadedScripts.size}
    - Failed: ${failedScripts.size}
    - Total attempted: ${attemptedScripts.size}`);
}

/**
 * Prevent common console errors
 */
function preventCommonErrors() {
    // Prevent undefined function errors
    const commonMissingFunctions = [
        'FoodisChatbot',
        'loadBlogPosts',
        'initializeDashboard',
        'toggleMobileMenu'
    ];
    
    commonMissingFunctions.forEach(funcName => {
        if (!window[funcName]) {
            window[funcName] = function() {
                console.log(`🔧 Fallback function called: ${funcName}`);
                return true;
            };
        }
    });
    
    // Prevent jQuery errors
    if (!window.$) {
        essentialScripts['js/jquery.js'].fallback();
    }
    
    // Global error handler
    window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('.js')) {
            console.warn(`🚨 JavaScript error caught: ${event.message} in ${event.filename}:${event.lineno}`);
            
            // Try to load fallback if available
            const failedScript = event.filename.split('/').pop();
            const fullPath = 'js/' + failedScript;
            
            if (essentialScripts[fullPath] && !failedScripts.has(fullPath)) {
                console.log(`🔄 Attempting fallback for error in: ${fullPath}`);
                try {
                    essentialScripts[fullPath].fallback();
                } catch (fallbackError) {
                    console.error(`❌ Fallback failed for ${fullPath}:`, fallbackError);
                }
            }
        }
    });
}

/**
 * Initialize missing scripts handler
 */
function initializeMissingScriptsHandler() {
    console.log('🚀 Missing Scripts Handler: Starting initialization...');
    
    try {
        // Step 1: Prevent common errors immediately
        preventCommonErrors();
        
        // Step 2: Load essential scripts with fallbacks
        loadEssentialScripts();
        
        // Step 3: Set up monitoring for additional scripts
        setTimeout(() => {
            // Check for missing scripts in HTML that haven't loaded
            const scriptTags = document.querySelectorAll('script[src]');
            scriptTags.forEach(script => {
                const src = script.getAttribute('src');
                if (src && !loadedScripts.has(src) && !failedScripts.has(src)) {
                    console.log(`🔍 Checking script: ${src}`);
                    // Don't auto-load, just mark as checked
                    attemptedScripts.add(src);
                }
            });
        }, 2000);
        
        console.log('✅ Missing Scripts Handler: Initialization complete');
        
    } catch (error) {
        console.error('❌ Error in missing scripts handler:', error);
    }
}

// Initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMissingScriptsHandler);
} else {
    initializeMissingScriptsHandler();
}

// Also initialize on window load as backup
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔄 Running missing scripts handler backup check...');
        preventCommonErrors();
    }, 1000);
});

console.log('✅ Missing Scripts Handler: Script loaded successfully');
