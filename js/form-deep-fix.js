/**
 * Form Deep Fix
 * A dedicated solution to fix all form validation issues on the dashboard
 */

(function() {
    // Run immediately on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also ensure it runs after all resources are loaded
    window.addEventListener('load', init);
    
    let initialized = false;
    const fixedElements = new Set();
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Form Deep Fix: Initializing');
        
        // First pass: make a comprehensive inventory of all form elements and their issues
        const formElements = document.querySelectorAll('input, select, textarea, button');
        const formElementsArray = Array.from(formElements);
        
        // Fix missing IDs, names, and autocomplete attributes
        fixMissingAttributes(formElementsArray);
        
        // Fix duplicate IDs
        fixDuplicateIds(formElementsArray);
        
        // Fix label-form element connections
        fixLabelAssociations();
        
        // Add missing labels
        addMissingLabels();
        
        // Fix specific validation issues shown in console
        fixSpecificIssues();
        
        // Set up observer for future elements
        setupMutationObserver();
        
        console.log('Form Deep Fix: Initialization complete');
    }
    
    function fixMissingAttributes(elements) {
        console.log('Form Deep Fix: Fixing missing attributes');
        
        // Process each form element
        elements.forEach((element, index) => {
            // Skip if already fixed
            if (fixedElements.has(element)) return;
            fixedElements.add(element);
            
            // Add ID if missing
            if (!element.id || element.id.trim() === '') {
                const newId = `${element.tagName.toLowerCase()}-${Date.now()}-${index}`;
                element.id = newId;
                console.log(`Form Deep Fix: Added ID "${newId}" to ${element.tagName.toLowerCase()}`);
            }
            
            // Add name if missing (for form elements that should have names)
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) && 
                (!element.name || element.name.trim() === '')) {
                element.name = element.id;
                console.log(`Form Deep Fix: Added name "${element.id}" to ${element.tagName.toLowerCase()}`);
            }
            
            // Add autocomplete attribute if missing
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) && 
                !element.hasAttribute('autocomplete') &&
                !element.hasAttribute('type') || 
                !['hidden', 'submit', 'button', 'reset'].includes(element.getAttribute('type'))) {
                
                // Determine appropriate autocomplete value
                let autocompleteValue = 'off';
                if (element.id && (
                    element.id.toLowerCase().includes('email') || 
                    element.name && element.name.toLowerCase().includes('email'))) {
                    autocompleteValue = 'email';
                } else if (element.id && (
                    element.id.toLowerCase().includes('name') || 
                    element.name && element.name.toLowerCase().includes('name'))) {
                    autocompleteValue = 'name';
                }
                
                element.setAttribute('autocomplete', autocompleteValue);
                console.log(`Form Deep Fix: Added autocomplete="${autocompleteValue}" to ${element.tagName.toLowerCase()} #${element.id}`);
            }
        });
    }
    
    function fixDuplicateIds(elements) {
        console.log('Form Deep Fix: Fixing duplicate IDs');
        
        // Build ID map to find duplicates
        const idMap = {};
        elements.forEach(element => {
            if (element.id && element.id.trim() !== '') {
                if (!idMap[element.id]) {
                    idMap[element.id] = [];
                }
                idMap[element.id].push(element);
            }
        });
        
        // Fix elements with duplicate IDs
        for (const [id, elements] of Object.entries(idMap)) {
            if (elements.length > 1) {
                // Keep the first occurrence, fix all others
                for (let i = 1; i < elements.length; i++) {
                    const element = elements[i];
                    const newId = `${id}-unique-${Date.now()}-${i}`;
                    
                    // Check if there are labels pointing to this element
                    const relatedLabels = document.querySelectorAll(`label[for="${id}"]`);
                    relatedLabels.forEach(label => {
                        // Only update the label if it's closest to this element (simple proximity check)
                        if (isClosestElementByPosition(label, element, elements[0])) {
                            label.setAttribute('for', newId);
                            console.log(`Form Deep Fix: Updated label to reference new ID "${newId}"`);
                        }
                    });
                    
                    // Update the element's ID
                    console.log(`Form Deep Fix: Fixed duplicate ID "${id}" -> "${newId}"`);
                    element.id = newId;
                    
                    // If name was same as old ID, update that too
                    if (element.name === id) {
                        element.name = newId;
                    }
                }
            }
        }
    }
    
    function fixLabelAssociations() {
        console.log('Form Deep Fix: Fixing label associations');
        
        // Find all labels with 'for' attributes
        const labels = document.querySelectorAll('label[for]');
        
        labels.forEach(label => {
            const forAttr = label.getAttribute('for');
            if (!forAttr) return;
            
            const targetElement = document.getElementById(forAttr);
            
            if (!targetElement) {
                // Try to find the closest form element
                const closestInput = findClosestFormElement(label);
                
                if (closestInput) {
                    // Update label to point to this input
                    label.setAttribute('for', closestInput.id);
                    console.log(`Form Deep Fix: Updated orphaned label to point to ID "${closestInput.id}"`);
                } else {
                    // No suitable element found, remove the for attribute
                    console.log(`Form Deep Fix: Removed invalid 'for' attribute "${forAttr}"`);
                    label.removeAttribute('for');
                }
            }
        });
    }
    
    function addMissingLabels() {
        console.log('Form Deep Fix: Adding missing labels');
        
        // Add screen reader CSS if needed
        addScreenReaderStyles();
        
        // Find all form inputs that need labels
        const formInputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea');
        
        formInputs.forEach(input => {
            // Skip if inside a label
            if (input.closest('label')) {
                return;
            }
            
            // Skip if already has a label pointing to it
            if (input.id && document.querySelector(`label[for="${input.id}"]`)) {
                return;
            }
            
            // Create a visually hidden label
            const label = document.createElement('label');
            label.setAttribute('for', input.id);
            label.className = 'sr-only';
            
            // Generate appropriate label text
            if (input.placeholder) {
                label.textContent = input.placeholder;
            } else if (input.name) {
                // Format name for readability
                label.textContent = input.name
                    .replace(/([A-Z])/g, ' $1') // Add space before capitals
                    .replace(/[-_]/g, ' ')     // Replace hyphens/underscores with spaces
                    .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
            } else {
                // Use ID as fallback
                label.textContent = input.id
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/[-_]/g, ' ')
                    .replace(/^\w/, c => c.toUpperCase());
            }
            
            // Insert label before the input
            input.parentNode.insertBefore(label, input);
            console.log(`Form Deep Fix: Added screen reader label for #${input.id}: "${label.textContent}"`);
        });
    }
    
    function fixSpecificIssues() {
        // Target and fix specific issues reported in the console
        
        // Look for all search inputs without IDs
        document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]').forEach((searchInput, index) => {
            if (!searchInput.id || searchInput.id === '') {
                searchInput.id = `search-input-${Date.now()}-${index}`;
                searchInput.name = searchInput.id;
                searchInput.setAttribute('autocomplete', 'off');
                
                // Add a visually hidden label
                const label = document.createElement('label');
                label.setAttribute('for', searchInput.id);
                label.className = 'sr-only';
                label.textContent = 'Search';
                searchInput.parentNode.insertBefore(label, searchInput);
                
                console.log(`Form Deep Fix: Fixed search input #${searchInput.id}`);
            }
        });
        
        // Add names to form fields that have IDs but no names
        document.querySelectorAll('input[id]:not([name]), select[id]:not([name]), textarea[id]:not([name])').forEach(field => {
            field.name = field.id;
            console.log(`Form Deep Fix: Added name attribute to match ID: ${field.id}`);
        });
        
        // Fix duplicate form controls in the same form
        const forms = document.querySelectorAll('form');
        forms.forEach((form, formIndex) => {
            // Check for duplicate control names within this form
            const controlNames = {};
            form.querySelectorAll('input, select, textarea').forEach((control, controlIndex) => {
                if (control.name) {
                    if (!controlNames[control.name]) {
                        controlNames[control.name] = [];
                    }
                    controlNames[control.name].push(control);
                }
            });
            
            // Fix duplicates
            for (const [name, controls] of Object.entries(controlNames)) {
                if (controls.length > 1) {
                    // Keep the first, rename others
                    for (let i = 1; i < controls.length; i++) {
                        const newName = `${name}-${formIndex}-${i}`;
                        controls[i].name = newName;
                        if (controls[i].id === name) {
                            controls[i].id = newName;
                            
                            // Update any labels
                            const labels = document.querySelectorAll(`label[for="${name}"]`);
                            labels.forEach(label => {
                                if (isClosestElementByPosition(label, controls[i], controls[0])) {
                                    label.setAttribute('for', newName);
                                }
                            });
                        }
                        console.log(`Form Deep Fix: Fixed duplicate form control name "${name}" -> "${newName}"`);
                    }
                }
            }
        });
    }
    
    function setupMutationObserver() {
        // Create a mutation observer to watch for new form elements
        const observer = new MutationObserver(mutations => {
            let newFormElements = [];
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // If this is a form element itself
                            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'LABEL'].includes(node.tagName)) {
                                newFormElements.push(node);
                            }
                            
                            // Check for nested form elements
                            if (node.querySelectorAll) {
                                const nestedElements = node.querySelectorAll('input, select, textarea, button, label');
                                newFormElements = newFormElements.concat(Array.from(nestedElements));
                            }
                        }
                    });
                }
            });
            
            // If new form elements were added, fix them
            if (newFormElements.length > 0) {
                fixMissingAttributes(newFormElements);
                fixDuplicateIds(newFormElements);
                fixLabelAssociations();
                addMissingLabels();
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Form Deep Fix: Now monitoring for new form elements');
    }
    
    // Utility Functions
    
    function findClosestFormElement(label) {
        // Try next element sibling
        let sibling = label.nextElementSibling;
        while (sibling) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(sibling.tagName)) {
                return sibling;
            }
            sibling = sibling.nextElementSibling;
        }
        
        // Try previous element sibling
        sibling = label.previousElementSibling;
        while (sibling) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(sibling.tagName)) {
                return sibling;
            }
            sibling = sibling.previousElementSibling;
        }
        
        // Try parent's other children
        const parent = label.parentElement;
        if (parent) {
            const inputs = Array.from(parent.querySelectorAll('input, select, textarea, button'))
                .filter(el => el !== label);
            
            if (inputs.length > 0) {
                return inputs[0];
            }
        }
        
        // Try to match with label text
        const labelText = label.textContent.trim().toLowerCase();
        const allInputs = document.querySelectorAll('input, select, textarea, button');
        
        // First look for placeholders that match
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            if (input.placeholder && input.placeholder.toLowerCase().includes(labelText)) {
                return input;
            }
        }
        
        // Then look at names and IDs
        for (let i = 0; i < allInputs.length; i++) {
            const input = allInputs[i];
            if ((input.name && input.name.toLowerCase().includes(labelText)) ||
                (input.id && input.id.toLowerCase().includes(labelText))) {
                return input;
            }
        }
        
        // No suitable match found
        return null;
    }
    
    function isClosestElementByPosition(label, element1, element2) {
        if (!label || !element1 || !element2) return false;
        
        try {
            // Get positions
            const labelRect = label.getBoundingClientRect();
            const element1Rect = element1.getBoundingClientRect();
            const element2Rect = element2.getBoundingClientRect();
            
            // Calculate center points
            const labelCenter = {
                x: labelRect.left + labelRect.width / 2,
                y: labelRect.top + labelRect.height / 2
            };
            
            const element1Center = {
                x: element1Rect.left + element1Rect.width / 2,
                y: element1Rect.top + element1Rect.height / 2
            };
            
            const element2Center = {
                x: element2Rect.left + element2Rect.width / 2,
                y: element2Rect.top + element2Rect.height / 2
            };
            
            // Calculate distances
            const distance1 = Math.sqrt(
                Math.pow(labelCenter.x - element1Center.x, 2) +
                Math.pow(labelCenter.y - element1Center.y, 2)
            );
            
            const distance2 = Math.sqrt(
                Math.pow(labelCenter.x - element2Center.x, 2) +
                Math.pow(labelCenter.y - element2Center.y, 2)
            );
            
            // Return true if element1 is closer to the label
            return distance1 < distance2;
        } catch (e) {
            console.error('Error calculating position:', e);
            return false;
        }
    }
    
    function addScreenReaderStyles() {
        // Add CSS for screen-reader-only elements if not already present
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
            console.log('Form Deep Fix: Added screen reader styles');
        }
    }
})();
