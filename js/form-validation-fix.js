/**
 * Form Validation Fix
 * A dedicated solution to fix form validation issues across the dashboard
 */

(function() {
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    let initialized = false;
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Form Validation Fix: Initializing');
        
        // Fix all forms immediately
        fixAllForms();
        
        // Set up a mutation observer to fix dynamically added forms
        observeNewForms();
    }
    
    function fixAllForms() {
        // Fix missing IDs and names on inputs
        fixMissingAttributes();
        
        // Fix duplicate IDs
        fixDuplicateIds();
        
        // Fix label associations
        fixLabelAssociations();
        
        // Add missing labels
        addMissingLabels();
        
        console.log('Form Validation Fix: All forms processed');
    }
    
    function fixMissingAttributes() {
        // Find all form elements without ID or name attributes
        const formElements = document.querySelectorAll('input, select, textarea, button');
        
        formElements.forEach((element, index) => {
            const hasId = element.hasAttribute('id') && element.id.trim() !== '';
            const hasName = element.hasAttribute('name') && element.name.trim() !== '';
            
            if (!hasId && !hasName) {
                // Generate a unique ID based on element type and index
                const type = element.tagName.toLowerCase();
                const uniqueId = `${type}-${Date.now()}-${index}`;
                element.id = uniqueId;
                
                // If it's an input-like element, also add a name
                if (type === 'input' || type === 'select' || type === 'textarea') {
                    element.name = uniqueId;
                }
                
                console.log(`Form Validation Fix: Added ID "${uniqueId}" to ${type} element`);
            }
            
            // Ensure autocomplete attribute is present on appropriate elements
            if ((element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') && 
                !element.hasAttribute('autocomplete')) {
                element.setAttribute('autocomplete', 'off');
            }
        });
    }
    
    function fixDuplicateIds() {
        // Find all elements with IDs
        const elementsWithId = document.querySelectorAll('[id]');
        const idMap = {};
        
        // First, identify duplicate IDs
        elementsWithId.forEach(element => {
            const id = element.getAttribute('id');
            if (!idMap[id]) {
                idMap[id] = [];
            }
            idMap[id].push(element);
        });
        
        // Fix elements with duplicate IDs
        for (const [id, elements] of Object.entries(idMap)) {
            if (elements.length > 1) {
                // Keep the first occurrence unchanged, fix all others
                for (let i = 1; i < elements.length; i++) {
                    const newId = `${id}-unique-${i}`;
                    const element = elements[i];
                    
                    // Update related labels if they exist
                    const relatedLabels = document.querySelectorAll(`label[for="${id}"]`);
                    relatedLabels.forEach((label, labelIndex) => {
                        // Only update labels that are closest to this element
                        if (isClosestElement(label, element)) {
                            label.setAttribute('for', newId);
                            console.log(`Form Validation Fix: Updated label to point to new ID "${newId}"`);
                        }
                    });
                    
                    // Update the element's ID
                    element.id = newId;
                    console.log(`Form Validation Fix: Fixed duplicate ID "${id}" -> "${newId}"`);
                    
                    // If it has a name attribute that's the same as the old ID, update that too
                    if (element.hasAttribute('name') && element.getAttribute('name') === id) {
                        element.setAttribute('name', newId);
                    }
                }
            }
        }
    }
    
    function fixLabelAssociations() {
        // Find all labels with 'for' attributes
        const labels = document.querySelectorAll('label[for]');
        
        labels.forEach(label => {
            const forAttr = label.getAttribute('for');
            const targetElement = document.getElementById(forAttr);
            
            if (!targetElement) {
                // The referenced element doesn't exist, find a nearby input to associate with
                let associatedInput = findNearestFormElement(label);
                
                if (associatedInput) {
                    // Ensure the input has an ID
                    if (!associatedInput.id || associatedInput.id.trim() === '') {
                        associatedInput.id = `form-element-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                    }
                    
                    // Update the label's 'for' attribute
                    label.setAttribute('for', associatedInput.id);
                    console.log(`Form Validation Fix: Updated label to point to ID "${associatedInput.id}"`);
                } else {
                    // If we can't find an input to associate with, remove the 'for' attribute
                    label.removeAttribute('for');
                    console.log('Form Validation Fix: Removed invalid label association');
                }
            }
        });
    }
    
    function addMissingLabels() {
        // Find all form elements that should have labels
        const formElements = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea');
        
        formElements.forEach(element => {
            // Skip if element has no ID or is already associated with a label
            if (!element.id || document.querySelector(`label[for="${element.id}"]`)) {
                return;
            }
            
            // Skip if element is inside a label (implicit association)
            if (element.closest('label')) {
                return;
            }
            
            // Create a label for the element
            const label = document.createElement('label');
            label.setAttribute('for', element.id);
            
            // Determine label text
            let labelText = '';
            if (element.hasAttribute('placeholder')) {
                labelText = element.getAttribute('placeholder');
            } else if (element.hasAttribute('name')) {
                labelText = element.getAttribute('name').replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
            } else {
                labelText = element.id.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
            }
            
            // Set label text and make it visually hidden if appropriate
            label.textContent = labelText;
            label.classList.add('sr-only');
            
            // Insert the label before the element
            element.parentNode.insertBefore(label, element);
            console.log(`Form Validation Fix: Added hidden label for "${element.id}"`);
        });
        
        // Add necessary CSS for screen-reader-only labels if it doesn't exist
        if (!document.querySelector('#sr-only-styles')) {
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
    
    function findNearestFormElement(label) {
        // Look for siblings
        let sibling = label.nextElementSibling;
        while (sibling) {
            if (isFormElement(sibling)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
        
        // Look for elements inside the label's parent
        const parent = label.parentElement;
        if (parent) {
            const formElements = parent.querySelectorAll('input, select, textarea');
            if (formElements.length > 0) {
                return formElements[0];
            }
        }
        
        // Look for elements with similar name/id pattern
        const forAttr = label.getAttribute('for');
        if (forAttr) {
            const possibleMatches = document.querySelectorAll(`input[name="${forAttr}"], select[name="${forAttr}"], textarea[name="${forAttr}"]`);
            if (possibleMatches.length > 0) {
                return possibleMatches[0];
            }
            
            // Try fuzzy matching on name or id containing the 'for' value
            const fuzzyMatches = document.querySelectorAll('input, select, textarea');
            for (let i = 0; i < fuzzyMatches.length; i++) {
                const el = fuzzyMatches[i];
                if ((el.id && el.id.includes(forAttr)) || (el.name && el.name.includes(forAttr))) {
                    return el;
                }
            }
        }
        
        return null;
    }
    
    function isFormElement(element) {
        const tag = element.tagName.toLowerCase();
        return tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button';
    }
    
    function isClosestElement(label, element) {
        // Check if this label is the closest to the element
        // This is a simple heuristic - for complex forms, a more sophisticated approach may be needed
        const labelRect = label.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate distance between centers
        const labelCenterX = labelRect.left + labelRect.width / 2;
        const labelCenterY = labelRect.top + labelRect.height / 2;
        const elementCenterX = elementRect.left + elementRect.width / 2;
        const elementCenterY = elementRect.top + elementRect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(labelCenterX - elementCenterX, 2) + 
            Math.pow(labelCenterY - elementCenterY, 2)
        );
        
        // A threshold of 100 pixels is arbitrary - adjust as needed
        return distance < 100;
    }
    
    function observeNewForms() {
        // Create mutation observer to watch for new form elements
        const observer = new MutationObserver(mutations => {
            let needsFix = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        
                        // Check if this is an element node and is or contains form elements
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (isFormElement(node) || node.querySelector('input, select, textarea, button, label')) {
                                needsFix = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (needsFix) {
                fixAllForms();
            }
        });
        
        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Form Validation Fix: Now monitoring for new form elements');
    }
})();
