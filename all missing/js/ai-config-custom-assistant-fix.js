
/**
 * Direct Fix for Custom Assistant Functionality
 * Ensures the custom OpenAI assistant selection and form works properly
 */

console.log('Custom Assistant Fix: Initializing...');

document.addEventListener('DOMContentLoaded', function() {
    initCustomAssistantFix();
});

// Also run after a delay to ensure all elements are loaded
setTimeout(initCustomAssistantFix, 1000);

function initCustomAssistantFix() {
    console.log('Custom Assistant Fix: Setting up handlers...');
    
    // Find all assistant option elements
    const assistantOptions = document.querySelectorAll('.assistant-option');
    
    if (assistantOptions.length === 0) {
        console.log('Custom Assistant Fix: No assistant options found, retrying...');
        setTimeout(initCustomAssistantFix, 500);
        return;
    }
    
    console.log(`Custom Assistant Fix: Found ${assistantOptions.length} assistant options`);
    
    // Add click handlers to assistant options
    assistantOptions.forEach(option => {
        // Remove existing listeners
        option.removeEventListener('click', handleAssistantClick);
        
        // Add new listener
        option.addEventListener('click', handleAssistantClick);
        
        console.log(`Custom Assistant Fix: Added handler to ${option.dataset.assistant} assistant`);
    });
    
    // Check if custom assistant is already selected and show form
    const selectedCustom = document.querySelector('.assistant-option[data-assistant="custom"].selected');
    if (selectedCustom) {
        showCustomAssistantForm();
    }
}

function handleAssistantClick(event) {
    const assistantOption = event.currentTarget;
    const assistantType = assistantOption.dataset.assistant;
    
    console.log(`Custom Assistant Fix: ${assistantType} assistant clicked`);
    
    // Remove selected class from all options
    document.querySelectorAll('.assistant-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    assistantOption.classList.add('selected');
    
    // Show/hide custom assistant form
    if (assistantType === 'custom') {
        showCustomAssistantForm();
    } else {
        hideCustomAssistantForm();
    }
}

function showCustomAssistantForm() {
    const customForm = document.querySelector('.custom-assistant-form');
    if (customForm) {
        customForm.style.display = 'block';
        customForm.classList.add('visible');
        console.log('Custom Assistant Fix: Custom form shown');
        
        // Focus on the first input
        const firstInput = customForm.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        console.error('Custom Assistant Fix: Custom form not found');
    }
}

function hideCustomAssistantForm() {
    const customForm = document.querySelector('.custom-assistant-form');
    if (customForm) {
        customForm.style.display = 'none';
        customForm.classList.remove('visible');
        console.log('Custom Assistant Fix: Custom form hidden');
    }
}

// Export functions for global access
window.customAssistantFix = {
    showCustomAssistantForm,
    hideCustomAssistantForm,
    handleAssistantClick
};

console.log('Custom Assistant Fix: Loaded successfully');
