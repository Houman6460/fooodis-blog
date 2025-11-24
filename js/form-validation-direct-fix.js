/**
 * Form Validation Direct Fix
 * Directly addresses the specific form validation issues reported in the console
 */

(function() {
    // Run as soon as possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run when the page is fully loaded
    window.addEventListener('load', init);
    
    // Specific elements that need fixing (based on console errors)
    const specificViolations = [
        { selector: 'input:not([id]):not([name])', issue: 'missing-id-name' },
        { selector: 'label[for]', issue: 'incorrect-label-for' },
        { selector: 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not(.sr-only)', issue: 'no-label' }
    ];
    
    function init() {
        console.log('Form Validation Direct Fix: Running');
        
        // Add screen reader styles
        addScreenReaderStyles();
        
        // Fix all form issues
        fixAllFormIssues();
        
        // Watch for future changes
        observeDOMChanges();
    }
    
    function fixAllFormIssues() {
        // 1. Fix missing IDs and names
        document.querySelectorAll('input:not([id]), input:not([name]), select:not([id]), select:not([name]), textarea:not([id]), textarea:not([name])').forEach(function(element, index) {
            // Generate a unique ID if missing
            if (!element.id || element.id.trim() === '') {
                const newId = `field-${Date.now()}-${index}`;
                element.id = newId;
            }
            
            // Add name attribute if missing
            if (!element.name || element.name.trim() === '') {
                element.name = element.id;
            }
            
            console.log(`Form Fix: Added ID/name "${element.id}" to ${element.tagName}`);
        });
        
        // 2. Fix incorrect label associations
        document.querySelectorAll('label[for]').forEach(function(label) {
            const forAttr = label.getAttribute('for');
            
            // Skip if empty
            if (!forAttr || forAttr.trim() === '') return;
            
            // Check if target element exists
            const targetElement = document.getElementById(forAttr);
            if (!targetElement) {
                // Find closest input
                const nearbyInputs = findNearbyInputs(label);
                if (nearbyInputs.length > 0) {
                    // Use the first input
                    label.setAttribute('for', nearbyInputs[0].id);
                    console.log(`Form Fix: Fixed label with text "${label.textContent.trim()}" to point to ${nearbyInputs[0].id}`);
                } else {
                    // Remove the for attribute if no suitable input found
                    label.removeAttribute('for');
                    console.log(`Form Fix: Removed invalid for attribute from label "${label.textContent.trim()}"`);
                }
            }
        });
        
        // 3. Add missing labels
        document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').forEach(function(input) {
            // Skip if already has a label
            if (input.closest('label') || document.querySelector(`label[for="${input.id}"]`)) {
                return;
            }
            
            // Create a visually hidden label
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'sr-only';
            
            // Set label text
            if (input.placeholder) {
                label.textContent = input.placeholder;
            } else if (input.name) {
                label.textContent = formatLabelText(input.name);
            } else {
                label.textContent = formatLabelText(input.id);
            }
            
            // Insert before the input
            input.parentNode.insertBefore(label, input);
            console.log(`Form Fix: Added screen reader label for #${input.id}`);
        });
    }
    
    function findNearbyInputs(label) {
        const results = [];
        
        // Try next sibling
        let sibling = label.nextElementSibling;
        if (sibling && isFormField(sibling)) {
            results.push(sibling);
        }
        
        // Try previous sibling
        sibling = label.previousElementSibling;
        if (sibling && isFormField(sibling)) {
            results.push(sibling);
        }
        
        // Try parent's children
        const parent = label.parentElement;
        if (parent) {
            const inputs = Array.from(parent.querySelectorAll('input, select, textarea'))
                .filter(el => el !== label && !results.includes(el));
            results.push(...inputs);
        }
        
        return results;
    }
    
    function isFormField(element) {
        if (!element || !element.tagName) return false;
        return ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName.toUpperCase());
    }
    
    function formatLabelText(text) {
        return text
            .replace(/([A-Z])/g, ' $1') // Add space before capitals
            .replace(/[-_]/g, ' ')      // Replace dashes/underscores with spaces
            .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
    }
    
    function addScreenReaderStyles() {
        if (!document.getElementById('sr-only-styles')) {
            const style = document.createElement('style');
            style.id = 'sr-only-styles';
            style.textContent = `
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function observeDOMChanges() {
        // Create mutation observer
        const observer = new MutationObserver(function(mutations) {
            let needsFixing = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if node is or contains form elements
                            if (isFormField(node) || 
                                node.tagName === 'LABEL' || 
                                node.querySelector && node.querySelector('input, select, textarea, label')) {
                                needsFixing = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (needsFixing) {
                fixAllFormIssues();
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
