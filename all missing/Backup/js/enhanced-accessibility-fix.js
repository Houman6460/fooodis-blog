/**
 * Enhanced Accessibility Fix
 * 
 * This script fixes multiple accessibility issues:
 * 1. Resolves label associations for form fields
 * 2. Ensures Test folder is removed from all media selectors
 * 3. Fixes other HTML validation errors
 */

(function() {
    // Initialize immediately and on DOMContentLoaded
    initAccessibilityFix();
    document.addEventListener('DOMContentLoaded', initAccessibilityFix);
    
    // Also set timeout as a fallback
    setTimeout(initAccessibilityFix, 1000);
    
    /**
     * Initialize all accessibility fixes
     */
    function initAccessibilityFix() {
        console.log('Enhanced Accessibility Fix: Initializing...');
        
        // Fix form field accessibility
        fixFormFieldLabels();
        
        // Remove test folder
        removeTestFolder();
        
        // Set up observers for dynamic content
        setupObservers();
        
        // Set intervals for periodic checks
        setInterval(fixFormFieldLabels, 3000);
        setInterval(removeTestFolder, 2000);
    }
    
    /**
     * Fix form field labels and associations
     */
    function fixFormFieldLabels() {
        console.log('Enhanced Accessibility Fix: Fixing form field labels');
        
        // 1. Find all labels that have 'for' attribute but no matching field
        document.querySelectorAll('label[for]').forEach(label => {
            const forAttr = label.getAttribute('for');
            if (!forAttr) return;
            
            // Check if there's a matching input
            const matchingInput = document.getElementById(forAttr);
            if (!matchingInput) {
                console.log(`Enhanced Accessibility Fix: Label points to non-existent ID: ${forAttr}`);
                
                // Look for a nearby input that might be the intended target
                const parentElement = label.parentElement;
                if (parentElement) {
                    const nearbyInput = parentElement.querySelector('input, select, textarea');
                    if (nearbyInput) {
                        // If nearby input has no ID, give it the ID from the label's 'for'
                        if (!nearbyInput.id) {
                            nearbyInput.id = forAttr;
                            console.log(`Enhanced Accessibility Fix: Assigned ID ${forAttr} to nearby input`);
                        } else {
                            // Update the label's 'for' to match the input's ID
                            label.setAttribute('for', nearbyInput.id);
                            console.log(`Enhanced Accessibility Fix: Updated label to point to ${nearbyInput.id}`);
                        }
                    }
                }
            }
        });
        
        // 2. Find all form fields that have no associated label
        document.querySelectorAll('input, select, textarea').forEach(field => {
            // Skip hidden, submit, button inputs
            if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') {
                return;
            }
            
            // Check if the field has an ID
            if (!field.id) {
                // Generate a unique ID
                const newId = 'field_' + Math.random().toString(36).substr(2, 9);
                field.id = newId;
                console.log(`Enhanced Accessibility Fix: Assigned new ID ${newId} to form field`);
            }
            
            // Look for an associated label
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (!label) {
                // Check if the field is already inside a label
                if (!field.closest('label')) {
                    // Look for a preceding text element that might be intended as a label
                    let previous = field.previousElementSibling;
                    if (previous && previous.tagName !== 'LABEL' && 
                        !previous.querySelector('input, select, textarea')) {
                        // Create a new label
                        const newLabel = document.createElement('label');
                        newLabel.setAttribute('for', field.id);
                        
                        // Move the previous element's content to the label
                        while (previous.firstChild) {
                            newLabel.appendChild(previous.firstChild);
                        }
                        
                        // Replace the previous element with the new label
                        previous.parentNode.replaceChild(newLabel, previous);
                        console.log(`Enhanced Accessibility Fix: Created label for ${field.id}`);
                    } else {
                        // Look for a parent with a class that suggests it's a form group
                        const formGroup = field.closest('.form-group, .form-field, .input-group');
                        if (formGroup) {
                            const possibleLabels = formGroup.querySelectorAll('.field-label, .form-label, .input-label');
                            if (possibleLabels.length > 0) {
                                // Convert the first one to a proper label
                                const firstLabel = possibleLabels[0];
                                if (firstLabel.tagName !== 'LABEL') {
                                    const newLabel = document.createElement('label');
                                    newLabel.setAttribute('for', field.id);
                                    newLabel.className = firstLabel.className;
                                    
                                    // Copy content
                                    newLabel.innerHTML = firstLabel.innerHTML;
                                    
                                    // Replace
                                    firstLabel.parentNode.replaceChild(newLabel, firstLabel);
                                    console.log(`Enhanced Accessibility Fix: Converted ${firstLabel.className} to label for ${field.id}`);
                                } else {
                                    // It's already a label, just add the 'for' attribute
                                    firstLabel.setAttribute('for', field.id);
                                    console.log(`Enhanced Accessibility Fix: Updated existing label for ${field.id}`);
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Remove the Test folder from all media selectors
     */
    function removeTestFolder() {
        // Check if we're in the right context (media section is visible)
        const mediaSection = document.querySelector('.media-library-section, .media-section, .email-management-section, .email-popup-section');
        if (!mediaSection) return;
        
        console.log('Enhanced Accessibility Fix: Removing Test folder from media selectors');
        
        // 1. Direct removal of Test folder elements
        document.querySelectorAll('.folder[data-folder="test"], .media-folder[data-folder="test"]').forEach(folder => {
            console.log('Enhanced Accessibility Fix: Removing Test folder element', folder);
            folder.remove();
        });
        
        // 2. Remove from DOM based on text content
        document.querySelectorAll('.folder, .media-folder').forEach(folder => {
            const text = folder.textContent.toLowerCase();
            if (text.includes('test')) {
                // Check for specific test folder patterns
                const iconElement = folder.querySelector('i.fas.fa-vial, i.test-icon');
                const textElement = folder.querySelector('.folder-name, .media-folder-name');
                
                if (iconElement || (textElement && textElement.textContent.toLowerCase().includes('test'))) {
                    console.log('Enhanced Accessibility Fix: Removing Test folder by text content', folder);
                    folder.remove();
                }
            }
        });
        
        // 3. Check specifically for the media selector interface
        document.querySelectorAll('.folders-list, .folder-list, .media-folders').forEach(folderList => {
            const testFolders = Array.from(folderList.children).filter(child => {
                return child.textContent.toLowerCase().includes('test');
            });
            
            testFolders.forEach(folder => {
                console.log('Enhanced Accessibility Fix: Removing Test folder from list', folder);
                folder.remove();
            });
        });
        
        // 4. Handle any Test folder items in media grid
        document.querySelectorAll('[data-folder="test"]').forEach(item => {
            console.log('Enhanced Accessibility Fix: Removing media item with Test folder', item);
            item.remove();
        });
    }
    
    /**
     * Set up observers for dynamic content
     */
    function setupObservers() {
        if (!window.MutationObserver) return;
        
        // Observer for form field changes
        const formObserver = new MutationObserver(mutations => {
            let shouldFixForms = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check if any form elements were added
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            const formElements = node.querySelectorAll('input, select, textarea, label');
                            if (formElements.length > 0) {
                                shouldFixForms = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldFixForms) {
                fixFormFieldLabels();
            }
        });
        
        // Observer for media selector changes
        const mediaObserver = new MutationObserver(mutations => {
            let shouldCheckFolders = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check if any media elements were added
                    Array.from(mutation.addedNodes).forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && 
                                (node.classList.contains('media-selection-modal') || 
                                 node.classList.contains('media-modal') || 
                                 node.querySelector('.folder-list, .media-folder'))) {
                                shouldCheckFolders = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheckFolders) {
                removeTestFolder();
            }
        });
        
        // Observe the entire document
        formObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        mediaObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
