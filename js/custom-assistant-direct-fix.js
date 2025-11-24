
/**
 * Direct Fix for Custom Assistant Form
 * Ensures the custom assistant form is always accessible and functional
 */

console.log('Custom Assistant Direct Fix: Initializing...');

// Run immediately when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCustomAssistantDirectFix();
});

// Also run on window load as backup
window.addEventListener('load', function() {
    setTimeout(initCustomAssistantDirectFix, 1000);
});

function initCustomAssistantDirectFix() {
    console.log('Custom Assistant Direct Fix: Setting up...');
    
    // Find all assistant options
    const assistantOptions = document.querySelectorAll('.assistant-option');
    
    if (assistantOptions.length === 0) {
        console.log('Custom Assistant Direct Fix: No assistant options found, retrying...');
        setTimeout(initCustomAssistantDirectFix, 500);
        return;
    }
    
    // Add click handlers
    assistantOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const assistantType = this.getAttribute('data-assistant');
            console.log('Custom Assistant Direct Fix: Assistant clicked:', assistantType);
            
            // Remove selected from all
            assistantOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected to clicked
            this.classList.add('selected');
            
            // Handle custom assistant form
            const customForm = document.querySelector('.custom-assistant-form');
            if (customForm) {
                if (assistantType === 'custom') {
                    showCustomForm(customForm);
                } else {
                    hideCustomForm(customForm);
                }
            }
        });
    });
    
    // Check if custom is already selected
    const selectedCustom = document.querySelector('.assistant-option[data-assistant="custom"].selected');
    if (selectedCustom) {
        const customForm = document.querySelector('.custom-assistant-form');
        if (customForm) {
            showCustomForm(customForm);
        }
    }
    
    console.log('Custom Assistant Direct Fix: Setup complete');
}

function showCustomForm(form) {
    console.log('Custom Assistant Direct Fix: Showing custom form');
    
    // Clear any existing styles first
    form.removeAttribute('style');
    
    // Force show with multiple methods
    form.style.setProperty('display', 'block', 'important');
    form.style.setProperty('opacity', '1', 'important');
    form.style.setProperty('max-height', '1000px', 'important');
    form.style.setProperty('overflow', 'visible', 'important');
    form.style.setProperty('visibility', 'visible', 'important');
    form.style.setProperty('transform', 'translateY(0)', 'important');
    form.style.setProperty('transition', 'all 0.3s ease', 'important');
    
    // Add classes
    form.classList.add('visible', 'ai-config-custom-form', 'show');
    form.classList.remove('hidden', 'hide');
    
    // Also ensure the parent AI config section is visible
    const aiConfigSection = form.closest('#ai-config-section');
    if (aiConfigSection && aiConfigSection.style.display === 'none') {
        aiConfigSection.style.display = 'block';
    }
    
    // Focus on Assistant ID input
    setTimeout(() => {
        const assistantIdInput = form.querySelector('#custom-assistant-id');
        if (assistantIdInput) {
            assistantIdInput.focus();
            assistantIdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('Custom Assistant Direct Fix: Focused on Assistant ID input');
        } else {
            console.error('Custom Assistant Direct Fix: Assistant ID input not found');
            // Try alternative selectors
            const altInput = form.querySelector('input[id*="assistant-id"]') || 
                           form.querySelector('input[placeholder*="Assistant"]') ||
                           form.querySelector('input[type="text"]');
            if (altInput) {
                altInput.focus();
                console.log('Custom Assistant Direct Fix: Focused on alternative input');
            }
        }
    }, 100);
    
    // Verify the form is actually visible
    setTimeout(() => {
        const computed = window.getComputedStyle(form);
        const isVisible = computed.display !== 'none' && computed.visibility !== 'hidden';
        console.log('Custom Assistant Direct Fix: Form visibility verified:', isVisible);
        
        if (!isVisible) {
            // Last resort: inline styles with highest priority
            form.setAttribute('style', `
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                max-height: 1000px !important;
                overflow: visible !important;
                position: relative !important;
                z-index: 10 !important;
                transform: translateY(0) !important;
            `);
            console.log('Custom Assistant Direct Fix: Applied last resort styles');
        }
    }, 200);
}

function hideCustomForm(form) {
    console.log('Custom Assistant Direct Fix: Hiding custom form');
    
    form.style.display = 'none';
    form.style.visibility = 'hidden';
    form.classList.remove('visible', 'ai-config-custom-form');
}

// Export for global access
window.customAssistantDirectFix = {
    showCustomForm,
    hideCustomForm,
    initCustomAssistantDirectFix
};

console.log('Custom Assistant Direct Fix: Loaded');
