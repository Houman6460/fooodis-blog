
/**
 * AI Config Backup Fix
 * Ensures AI configuration works properly with custom assistants
 */

(function() {
    'use strict';
    
    console.log('AI Config Backup Fix: Initializing');
    
    // Wait for DOM and other scripts to load
    function initAIConfigFix() {
        const aiConfigSection = document.getElementById('ai-config-section');
        if (!aiConfigSection) {
            setTimeout(initAIConfigFix, 100);
            return;
        }
        
        // Find the assistant type dropdown
        const assistantSelect = document.getElementById('assistant-type') || 
                              document.querySelector('select[name="assistant-type"]') ||
                              document.querySelector('#ai-config-section select');
        
        if (assistantSelect) {
            // Ensure Custom Assistant option exists
            const hasCustomOption = Array.from(assistantSelect.options).some(option => 
                option.value === 'custom' || option.textContent.toLowerCase().includes('custom')
            );
            
            if (!hasCustomOption) {
                const customOption = document.createElement('option');
                customOption.value = 'custom';
                customOption.textContent = 'Custom Assistant';
                assistantSelect.appendChild(customOption);
                console.log('AI Config Fix: Added Custom Assistant option');
            }
            
            // Add change event listener
            assistantSelect.addEventListener('change', function() {
                const customIdField = document.getElementById('custom-assistant-id') ||
                                    document.querySelector('input[name="custom-assistant-id"]');
                
                if (this.value === 'custom') {
                    // Show custom assistant ID field
                    if (customIdField) {
                        customIdField.style.display = 'block';
                        const label = document.querySelector('label[for="custom-assistant-id"]');
                        if (label) label.style.display = 'block';
                    } else {
                        // Create the field if it doesn't exist
                        createCustomAssistantField();
                    }
                } else {
                    // Hide custom assistant ID field
                    if (customIdField) {
                        customIdField.style.display = 'none';
                        const label = document.querySelector('label[for="custom-assistant-id"]');
                        if (label) label.style.display = 'none';
                    }
                }
            });
            
            console.log('AI Config Fix: Assistant type dropdown configured');
        }
        
        function createCustomAssistantField() {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.innerHTML = `
                <label for="custom-assistant-id">Custom Assistant ID:</label>
                <input type="text" id="custom-assistant-id" name="custom-assistant-id" 
                       placeholder="Enter your custom assistant ID" style="display: none;">
            `;
            
            // Insert after the assistant type field
            const assistantFormGroup = assistantSelect.closest('.form-group');
            if (assistantFormGroup && assistantFormGroup.nextSibling) {
                assistantFormGroup.parentNode.insertBefore(formGroup, assistantFormGroup.nextSibling);
            } else if (assistantFormGroup) {
                assistantFormGroup.parentNode.appendChild(formGroup);
            }
            
            console.log('AI Config Fix: Created custom assistant ID field');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIConfigFix);
    } else {
        initAIConfigFix();
    }
    
    console.log('AI Config Backup Fix: Setup complete');
})();
