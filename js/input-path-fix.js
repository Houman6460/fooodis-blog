/**
 * Input Path Fix
 * 
 * This script specifically targets input fields that may contain css/images paths
 * and replaces them with the correct paths.
 */

(function() {
    // Run immediately and after DOM content loads
    document.addEventListener('DOMContentLoaded', fixInputPaths);
    window.addEventListener('load', fixInputPaths);
    setTimeout(fixInputPaths, 500);
    setTimeout(fixInputPaths, 1000);
    setTimeout(fixInputPaths, 2000);
    
    function fixInputPaths() {
        console.log("Input Path Fix: Checking for input fields with css/images paths");
        
        // Fix all input fields with css/images paths
        document.querySelectorAll('input[type="text"], input:not([type])').forEach(input => {
            const value = input.value || '';
            if (value.includes('css/images/')) {
                console.log("Input Path Fix: Found input with css/images path:", value);
                const newValue = value.replace('css/images/', 'images/');
                input.value = newValue;
                console.log("Input Path Fix: Corrected to:", newValue);
                
                // Trigger change event to ensure other scripts know the value changed
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
        
        // Also check for text areas
        document.querySelectorAll('textarea').forEach(textarea => {
            const value = textarea.value || '';
            if (value.includes('css/images/')) {
                console.log("Input Path Fix: Found textarea with css/images path:", value);
                const newValue = value.replace('css/images/', 'images/');
                textarea.value = newValue;
                console.log("Input Path Fix: Corrected to:", newValue);
                
                // Trigger change event to ensure other scripts know the value changed
                const event = new Event('change', { bubbles: true });
                textarea.dispatchEvent(event);
            }
        });
        
        // Override the select image functionality
        patchSelectImageFunctionality();
        
        // Set up observer for new inputs
        setupInputObserver();
    }
    
    function patchSelectImageFunctionality() {
        // Patch any image selection functions
        const possibleFunctions = [
            'selectImage',
            'openMediaLibrary',
            'chooseImage',
            'selectBackgroundImage',
            'selectMedia'
        ];
        
        possibleFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                const originalFunc = window[funcName];
                window[funcName] = function() {
                    // Call original function first
                    const result = originalFunc.apply(this, arguments);
                    
                    // Apply fix after a delay to let any UI update
                    setTimeout(fixInputPaths, 500);
                    
                    return result;
                };
                console.log(`Input Path Fix: Patched ${funcName} function`);
            }
        });
        
        // Add click handlers to all media selection buttons
        document.querySelectorAll('[data-action="media"], .select-image-btn, .media-button, [onclick*="selectImage"], [onclick*="openMediaLibrary"]').forEach(btn => {
            // Remove any existing click handlers
            const oldOnClick = btn.getAttribute('onclick');
            if (oldOnClick) {
                btn.removeAttribute('onclick');
                
                // Add our own handler that runs the original code plus our fix
                btn.addEventListener('click', e => {
                    try {
                        // Execute the original onclick code
                        eval(oldOnClick);
                    } catch (err) {
                        console.warn('Error executing original click handler:', err);
                    }
                    
                    // Apply our fix after a delay
                    setTimeout(fixInputPaths, 500);
                    setTimeout(fixInputPaths, 1000);
                });
                
                console.log("Input Path Fix: Added click handler to button");
            } else {
                // If no onclick attribute, just add our handler
                btn.addEventListener('click', () => {
                    setTimeout(fixInputPaths, 500);
                    setTimeout(fixInputPaths, 1000);
                });
            }
        });
    }
    
    function setupInputObserver() {
        // Don't set up observer if already done
        if (window._inputObserverSetup) return;
        window._inputObserverSetup = true;
        
        if (!document.body) return;
        
        try {
            const observer = new MutationObserver(mutations => {
                let needsFix = false;
                
                mutations.forEach(mutation => {
                    if (mutation.addedNodes && mutation.addedNodes.length) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if this is an input with a css/images path
                                if ((node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') && 
                                    node.value && node.value.includes('css/images/')) {
                                    needsFix = true;
                                }
                                
                                // Or if it contains inputs with css/images paths
                                if (node.querySelectorAll) {
                                    const inputs = node.querySelectorAll('input[type="text"], input:not([type]), textarea');
                                    for (let j = 0; j < inputs.length; j++) {
                                        if (inputs[j].value && inputs[j].value.includes('css/images/')) {
                                            needsFix = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                
                if (needsFix) {
                    fixInputPaths();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['value']
            });
            
            console.log("Input Path Fix: Observer setup complete");
        } catch (e) {
            console.error("Input Path Fix: Error setting up observer:", e);
        }
    }
})();
