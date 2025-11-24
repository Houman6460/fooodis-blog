/**
 * Debug Tool for Fooodis Blog System
 * This script helps diagnose module loading issues and UI initialization problems
 */

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Debug Tool: Starting diagnostics...');
    
    // Create debug overlay
    const debugOverlay = document.createElement('div');
    debugOverlay.id = 'debug-overlay';
    debugOverlay.style.position = 'fixed';
    debugOverlay.style.bottom = '0';
    debugOverlay.style.right = '0';
    debugOverlay.style.width = '300px';
    debugOverlay.style.maxHeight = '400px';
    debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugOverlay.style.color = '#fff';
    debugOverlay.style.padding = '10px';
    debugOverlay.style.fontSize = '12px';
    debugOverlay.style.fontFamily = 'monospace';
    debugOverlay.style.zIndex = '9999';
    debugOverlay.style.overflow = 'auto';
    debugOverlay.style.borderTopLeftRadius = '5px';
    
    // Add header with controls
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '5px';
    header.style.borderBottom = '1px solid #555';
    header.style.paddingBottom = '5px';
    
    const title = document.createElement('div');
    title.textContent = '🛠️ Fooodis Debug';
    title.style.fontWeight = 'bold';
    
    const controls = document.createElement('div');
    
    const minimizeBtn = document.createElement('span');
    minimizeBtn.textContent = '−';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.style.marginRight = '10px';
    minimizeBtn.onclick = function() {
        const content = document.getElementById('debug-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeBtn.textContent = '−';
        } else {
            content.style.display = 'none';
            minimizeBtn.textContent = '+';
        }
    };
    
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        document.body.removeChild(debugOverlay);
    };
    
    controls.appendChild(minimizeBtn);
    controls.appendChild(closeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    debugOverlay.appendChild(header);
    
    // Content area
    const content = document.createElement('div');
    content.id = 'debug-content';
    debugOverlay.appendChild(content);
    
    // Add to body
    document.body.appendChild(debugOverlay);
    
    // Log function
    function logDebug(message, type = 'info') {
        const log = document.createElement('div');
        log.style.marginBottom = '3px';
        log.style.borderLeft = '3px solid ' + (type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3');
        log.style.paddingLeft = '5px';
        log.textContent = message;
        
        content.appendChild(log);
        content.scrollTop = content.scrollHeight;
        
        // Also log to console
        if (type === 'error') {
            console.error(message);
        } else if (type === 'warning') {
            console.warn(message);
        } else {
            console.log(message);
        }
    }
    
    // Check modules
    function checkModules() {
        const moduleNames = [
            'module-loader',
            'storage-manager', 
            'api-service', 
            'execution-manager',
            'scheduler-manager',
            'automation-time-fix'
        ];
        
        logDebug('Checking modules...');
        
        let loadedCount = 0;
        
        moduleNames.forEach(moduleName => {
            const camelCaseName = moduleName.replace(/-([a-z])/g, g => g[1].toUpperCase());
            
            if (window[camelCaseName]) {
                logDebug(`✅ ${moduleName}.js loaded successfully`);
                loadedCount++;
            } else {
                logDebug(`❌ ${moduleName}.js not found or not properly loaded`, 'error');
                
                // Create fix button for module
                const fixBtn = document.createElement('button');
                fixBtn.textContent = `Fix ${moduleName}`;
                fixBtn.style.marginTop = '5px';
                fixBtn.style.marginBottom = '10px';
                fixBtn.style.padding = '3px 8px';
                fixBtn.style.backgroundColor = '#4CAF50';
                fixBtn.style.border = 'none';
                fixBtn.style.borderRadius = '3px';
                fixBtn.style.cursor = 'pointer';
                
                fixBtn.onclick = function() {
                    // Attempt to load module directly
                    const script = document.createElement('script');
                    script.src = `js/modules/${moduleName}.js?t=${Date.now()}`;
                    script.onload = function() {
                        logDebug(`Module ${moduleName} manually loaded!`, 'info');
                        checkModules(); // Re-check modules
                    };
                    script.onerror = function() {
                        logDebug(`Failed to load ${moduleName} manually`, 'error');
                    };
                    document.head.appendChild(script);
                };
                
                content.appendChild(fixBtn);
            }
        });
        
        logDebug(`${loadedCount}/${moduleNames.length} modules loaded`);
        
        // Check global functions
        if (window.showToast) {
            logDebug('✅ showToast function available');
        } else {
            logDebug('❌ showToast function not available', 'error');
        }
        
        if (window.log) {
            logDebug('✅ log function available');
        } else {
            logDebug('❌ log function not available', 'error');
        }
        
        // Check API connectivity
        fetch('/api/system-health')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(`API returned ${response.status}`);
            })
            .then(data => {
                logDebug('✅ API connection successful');
                logDebug(`System status: ${data.status}`);
            })
            .catch(error => {
                logDebug(`❌ API connection failed: ${error.message}`, 'error');
                
                // Create fix button for API
                const fixBtn = document.createElement('button');
                fixBtn.textContent = 'Restart API Connection';
                fixBtn.style.marginTop = '5px';
                fixBtn.style.marginBottom = '10px';
                fixBtn.style.padding = '3px 8px';
                fixBtn.style.backgroundColor = '#2196F3';
                fixBtn.style.border = 'none';
                fixBtn.style.borderRadius = '3px';
                fixBtn.style.cursor = 'pointer';
                
                fixBtn.onclick = function() {
                    // Reload the page to restart connections
                    window.location.reload();
                };
                
                content.appendChild(fixBtn);
            });
        
        // Check local storage
        try {
            localStorage.setItem('debug_test', 'test');
            const test = localStorage.getItem('debug_test');
            
            if (test === 'test') {
                logDebug('✅ LocalStorage working correctly');
                localStorage.removeItem('debug_test');
            } else {
                logDebug('❌ LocalStorage not working correctly', 'error');
            }
        } catch (e) {
            logDebug(`❌ LocalStorage error: ${e.message}`, 'error');
        }
        
        // Check UI components
        checkUIComponents();
    }
    
    // Check UI components
    function checkUIComponents() {
        logDebug('Checking UI components...');
        
        const components = [
            { name: 'AI Automation', selector: '#ai-automation-section' },
            { name: 'AI Configuration', selector: '#ai-config-section' },
            { name: 'AI Assistant', selector: '#ai-assistant-section' },
            { name: 'Scheduled Posts', selector: '#scheduled-posts-section' },
            { name: 'Blog Statistics', selector: '#blog-stats-section' }
        ];
        
        components.forEach(component => {
            const el = document.querySelector(component.selector);
            if (el) {
                logDebug(`✅ ${component.name} UI component found`);
                
                // Check if component has been initialized
                if (el.classList.contains('initialized') || el.querySelector('.initialized')) {
                    logDebug(`  ✅ ${component.name} initialized`);
                } else {
                    logDebug(`  ⚠️ ${component.name} found but not initialized`, 'warning');
                }
            } else {
                logDebug(`❌ ${component.name} UI component not found`, 'error');
            }
        });
    }
    
    // Add manual initialization button
    const initBtn = document.createElement('button');
    initBtn.textContent = 'Force Initialize All Components';
    initBtn.style.marginTop = '10px';
    initBtn.style.marginBottom = '10px';
    initBtn.style.padding = '5px 10px';
    initBtn.style.backgroundColor = '#ff9800';
    initBtn.style.border = 'none';
    initBtn.style.borderRadius = '3px';
    initBtn.style.width = '100%';
    initBtn.style.cursor = 'pointer';
    
    initBtn.onclick = function() {
        logDebug('🔄 Forcing initialization of all components...');
        
        // Load initialization script
        const script = document.createElement('script');
        script.src = `js/module-initialization.js?t=${Date.now()}`;
        document.head.appendChild(script);
        
        // Mark components as initialized
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.add('initialized');
        });
        
        setTimeout(checkModules, 1000);
    };
    
    content.appendChild(initBtn);
    
    // Start checks
    setTimeout(checkModules, 500);
});
