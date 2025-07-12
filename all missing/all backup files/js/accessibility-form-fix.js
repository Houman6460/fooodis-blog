/**
 * Accessibility Form Fix
 * 
 * This script fixes accessibility issues in forms throughout the application:
 * 1. Adds missing ID or name attributes to form fields
 * 2. Fixes label elements with incorrect "for" attributes
 * 3. Associates labels with form fields properly
 */

(function() {
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initAccessibilityFix);
    window.addEventListener('load', initAccessibilityFix);
    
    // Also set a timeout as a fallback
    setTimeout(initAccessibilityFix, 1500);
    
    // Store initialization state
    let initialized = false;
    
    // Run the fix
    function initAccessibilityFix() {
        if (initialized) return;
        initialized = true;
        
        console.log('Accessibility Form Fix: Initializing');
        
        // Fix form fields without IDs or names
        fixFormFieldsWithoutIdentifiers();
        
        // Fix labels with incorrect 'for' attributes
        fixIncorrectLabelReferences();
        
        // Associate labels with form fields
        associateLabelsWithFields();
        
        // Set up observer to catch dynamically added elements
        observeDynamicFormElements();
        
        console.log('Accessibility Form Fix: Completed initial fixes');
    }
    
    /**
     * Fix form fields without ID or name attributes
     */
    function fixFormFieldsWithoutIdentifiers() {
        console.log('Accessibility Form Fix: Fixing form fields without identifiers');
        
        // Find all form fields without ID or name attributes
        const formFields = document.querySelectorAll('input, select, textarea');
        
        formFields.forEach((field, index) => {
            // Skip if already has an ID or name
            if (field.id || field.name) return;
            
            // Generate a unique ID based on field type and index
            const fieldType = field.getAttribute('type') || field.tagName.toLowerCase();
            const uniqueId = `${fieldType}-field-${Date.now()}-${index}`;
            
            // Set ID and name
            field.id = uniqueId;
            
            // For checkboxes and radios, only set name if they don't have one
            // to preserve proper grouping
            if (!field.name && fieldType !== 'radio' && fieldType !== 'checkbox') {
                field.name = uniqueId;
            }
            
            console.log(`Accessibility Form Fix: Added ID "${uniqueId}" to form field`);
            
            // Look for a possible label next to this field
            const possibleLabel = field.previousElementSibling;
            if (possibleLabel && possibleLabel.tagName === 'LABEL' && !possibleLabel.getAttribute('for')) {
                possibleLabel.setAttribute('for', uniqueId);
                console.log(`Accessibility Form Fix: Associated nearby label with field ID "${uniqueId}"`);
            }
        });
    }
    
    /**
     * Fix labels with incorrect 'for' attributes
     */
    function fixIncorrectLabelReferences() {
        console.log('Accessibility Form Fix: Fixing incorrect label references');
        
        // Find all labels with 'for' attributes
        const labels = document.querySelectorAll('label[for]');
        
        labels.forEach(label => {
            const forAttribute = label.getAttribute('for');
            
            // Check if the referenced element exists
            const referencedElement = document.getElementById(forAttribute);
            
            if (!referencedElement) {
                console.log(`Accessibility Form Fix: Label references non-existent ID "${forAttribute}"`);
                
                // Try to find a nearby form field to associate with
                const nearbyField = findNearbyFormField(label);
                
                if (nearbyField) {
                    // If the nearby field doesn't have an ID, add one
                    if (!nearbyField.id) {
                        const fieldType = nearbyField.getAttribute('type') || nearbyField.tagName.toLowerCase();
                        const uniqueId = `${fieldType}-field-${Date.now()}-${labels.indexOf(label)}`;
                        nearbyField.id = uniqueId;
                    }
                    
                    // Update the label's 'for' attribute
                    label.setAttribute('for', nearbyField.id);
                    console.log(`Accessibility Form Fix: Updated label to reference ID "${nearbyField.id}"`);
                } else {
                    // If we can't find a nearby field, remove the incorrect 'for' attribute
                    // to prevent accessibility errors
                    console.log(`Accessibility Form Fix: Removing incorrect 'for' attribute "${forAttribute}"`);
                    label.removeAttribute('for');
                }
            }
        });
    }
    
    /**
     * Associate labels with form fields
     */
    function associateLabelsWithFields() {
        console.log('Accessibility Form Fix: Associating labels with form fields');
        
        // Find all form fields that could benefit from labels
        const formFields = document.querySelectorAll('input, select, textarea');
        
        formFields.forEach(field => {
            // Skip if already has an associated label
            if (document.querySelector(`label[for="${field.id}"]`)) return;
            
            // Look for nearby text that might be a label
            const nearbyText = findNearbyLabelText(field);
            
            if (nearbyText) {
                // Ensure the field has an ID
                if (!field.id) {
                    const fieldType = field.getAttribute('type') || field.tagName.toLowerCase();
                    const uniqueId = `${fieldType}-field-${Date.now()}-${Array.from(formFields).indexOf(field)}`;
                    field.id = uniqueId;
                }
                
                // Convert text to label or update existing label
                if (nearbyText.tagName === 'LABEL') {
                    nearbyText.setAttribute('for', field.id);
                } else {
                    // Create a new label element
                    const newLabel = document.createElement('label');
                    newLabel.setAttribute('for', field.id);
                    newLabel.textContent = nearbyText.textContent;
                    
                    // Replace the text element with the label
                    nearbyText.parentNode.replaceChild(newLabel, nearbyText);
                }
                
                console.log(`Accessibility Form Fix: Created/updated label for field ID "${field.id}"`);
            }
        });
        
        // Also check for special cases like media selectors
        fixMediaSelectorFields();
    }
    
    /**
     * Find a nearby form field to associate with a label
     */
    function findNearbyFormField(label) {
        // Check next sibling first
        let nextElement = label.nextElementSibling;
        if (nextElement && isFormField(nextElement)) {
            return nextElement;
        }
        
        // Check previous sibling
        let prevElement = label.previousElementSibling;
        if (prevElement && isFormField(prevElement)) {
            return prevElement;
        }
        
        // Check parent's children
        if (label.parentNode) {
            const siblings = Array.from(label.parentNode.children);
            for (const sibling of siblings) {
                if (sibling !== label && isFormField(sibling)) {
                    return sibling;
                }
            }
        }
        
        // Check for fields inside the label (nested inputs)
        const nestedField = label.querySelector('input, select, textarea');
        if (nestedField) {
            return nestedField;
        }
        
        // Look for nearby form fields in general
        const nearbyFields = document.querySelectorAll('input, select, textarea');
        for (const field of nearbyFields) {
            const fieldRect = field.getBoundingClientRect();
            const labelRect = label.getBoundingClientRect();
            
            // Check if the field is near the label (within 100px)
            const horizontalDistance = Math.abs(fieldRect.left - labelRect.left);
            const verticalDistance = Math.abs(fieldRect.top - labelRect.top);
            
            if (horizontalDistance < 100 && verticalDistance < 100) {
                return field;
            }
        }
        
        return null;
    }
    
    /**
     * Find nearby text that might be a label
     */
    function findNearbyLabelText(field) {
        // Check if there's a label or text element nearby
        let prevElement = field.previousElementSibling;
        if (prevElement && (prevElement.tagName === 'LABEL' || isTextElement(prevElement))) {
            return prevElement;
        }
        
        // Check parent for label-like text
        if (field.parentNode) {
            const siblings = Array.from(field.parentNode.children);
            for (const sibling of siblings) {
                if (sibling !== field && (sibling.tagName === 'LABEL' || isTextElement(sibling))) {
                    return sibling;
                }
            }
        }
        
        // Check for label in a parent container (common in form-group patterns)
        const formGroup = field.closest('.form-group, .input-group, .field-container');
        if (formGroup) {
            const possibleLabel = formGroup.querySelector('.field-label, .input-label, .label, .option-label');
            if (possibleLabel) {
                return possibleLabel;
            }
        }
        
        return null;
    }
    
    /**
     * Fix special case of media selector fields
     */
    function fixMediaSelectorFields() {
        // Find all media selector buttons
        const mediaSelectorButtons = document.querySelectorAll('.media-library-button, .email-media-select-button, .media-select-btn');
        
        mediaSelectorButtons.forEach(button => {
            const targetInputId = button.getAttribute('data-target-input') || button.getAttribute('data-target');
            
            if (targetInputId) {
                const targetInput = document.getElementById(targetInputId);
                
                if (targetInput) {
                    // Ensure target input has a name
                    if (!targetInput.name) {
                        targetInput.name = targetInputId;
                    }
                    
                    // Look for a label for this field
                    if (!document.querySelector(`label[for="${targetInputId}"]`)) {
                        // Look for a nearby label-like element
                        const container = targetInput.closest('.form-group, .input-group, .customization-option');
                        if (container) {
                            const possibleLabel = container.querySelector('.option-label, .field-label, .form-label');
                            
                            if (possibleLabel && !possibleLabel.getAttribute('for')) {
                                possibleLabel.setAttribute('for', targetInputId);
                                console.log(`Accessibility Form Fix: Associated label with media field ID "${targetInputId}"`);
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Check if an element is a form field
     */
    function isFormField(element) {
        const fieldTags = ['INPUT', 'SELECT', 'TEXTAREA'];
        return fieldTags.includes(element.tagName);
    }
    
    /**
     * Check if an element is a text element that could be a label
     */
    function isTextElement(element) {
        // Common text element containers
        const textTags = ['SPAN', 'DIV', 'P', 'STRONG', 'B'];
        
        if (textTags.includes(element.tagName)) {
            // Check if it's not a container with other elements
            if (element.children.length === 0) {
                return true;
            }
            
            // Or if it only contains text formatting
            if (Array.from(element.children).every(child => ['SPAN', 'B', 'I', 'EM', 'STRONG'].includes(child.tagName))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Set up observer for dynamically added form elements
     */
    function observeDynamicFormElements() {
        // Check if the browser supports MutationObserver
        if (!window.MutationObserver) return;
        
        // Create an observer to watch for added nodes
        const observer = new MutationObserver(mutations => {
            let shouldFixForms = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check if any added nodes are forms or form elements
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'FORM' || 
                                node.tagName === 'INPUT' || 
                                node.tagName === 'SELECT' || 
                                node.tagName === 'TEXTAREA' || 
                                node.tagName === 'LABEL' ||
                                node.querySelector('form, input, select, textarea, label')) {
                                shouldFixForms = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldFixForms) {
                // Fix the new elements
                fixFormFieldsWithoutIdentifiers();
                fixIncorrectLabelReferences();
                associateLabelsWithFields();
            }
        });
        
        // Start observing the entire document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Accessibility Form Fix: Set up observer for dynamic form elements');
    }
})();
