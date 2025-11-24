/**
 * Final Custom Assistant Fix
 * This file will definitively fix the custom assistant dropdown and form display
 */

console.log('🔧 Custom Assistant Final Fix: Starting...');

// Wait for DOM and all other scripts to load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initFinalCustomAssistantFix, 2000);
});

window.addEventListener('load', function() {
    setTimeout(initFinalCustomAssistantFix, 3000);
});

function initFinalCustomAssistantFix() {
    console.log('🔧 Final Fix: Initializing custom assistant functionality...');

    // Find the assistant dropdown (select element)
    const assistantDropdown = document.querySelector('select#assistant-type');

    if (!assistantDropdown) {
        console.log('🔧 Final Fix: Assistant dropdown not found, retrying in 1 second...');
        setTimeout(initFinalCustomAssistantFix, 1000);
        return;
    }

    console.log('🔧 Final Fix: Found assistant dropdown');

    // Remove any existing event listeners
    assistantDropdown.removeEventListener('change', handleAssistantDropdownChange);

    // Add our definitive change handler
    assistantDropdown.addEventListener('change', handleAssistantDropdownChange);

    // Check current selection and show form if custom is selected
    if (assistantDropdown.value === 'custom') {
        console.log('🔧 Final Fix: Custom assistant already selected, showing form...');
        showCustomAssistantFormFinal();
    }

    console.log('🔧 Final Fix: Setup complete!');
}

function handleAssistantDropdownChange(event) {
    const selectedValue = event.target.value;
    console.log('🔧 Final Fix: Assistant dropdown changed to:', selectedValue);

    if (selectedValue === 'custom') {
        console.log('🔧 Final Fix: Custom assistant selected - showing form...');
        showCustomAssistantFormFinal();
    } else {
        console.log('🔧 Final Fix: Non-custom assistant selected - hiding form...');
        hideCustomAssistantFormFinal();
    }
}

function showCustomAssistantFormFinal() {
    console.log('🔧 Final Fix: Forcing custom assistant form to show...');

    // Find the assistant ID group that should be hidden/shown
    let assistantIdGroup = document.querySelector('.assistant-id-group');

    if (!assistantIdGroup) {
        console.log('🔧 Final Fix: Assistant ID group not found, creating it...');
        createAssistantIdGroup();
        assistantIdGroup = document.querySelector('.assistant-id-group');
    }

    if (assistantIdGroup) {
        // Nuclear option: Force display with absolute priority
        assistantIdGroup.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            max-height: 1000px !important;
            height: auto !important;
            overflow: visible !important;
            position: relative !important;
            z-index: 999 !important;
            margin-top: 15px !important;
            width: 100% !important;
            box-sizing: border-box !important;
        `;

        // Force reflow
        assistantIdGroup.offsetHeight;

        // Focus on the assistant ID input
        setTimeout(() => {
            const assistantIdInput = assistantIdGroup.querySelector('#assistant-id');
            if (assistantIdInput) {
                assistantIdInput.focus();
                console.log('🔧 Final Fix: Focused on Assistant ID input');
            }
        }, 100);

        console.log('✅ Final Fix: Custom assistant form is now visible!');
    } else {
        console.error('❌ Final Fix: Could not find or create assistant ID group');
    }
}

function hideCustomAssistantFormFinal() {
    const assistantIdGroup = document.querySelector('.assistant-id-group');
    if (assistantIdGroup) {
        assistantIdGroup.style.display = 'none';
        assistantIdGroup.style.visibility = 'hidden';
        console.log('🔧 Final Fix: Custom assistant form hidden');
    }
}

function createAssistantIdGroup() {
    console.log('🔧 Final Fix: Creating assistant ID group...');

    // Find the assistant type dropdown's parent form group
    const assistantDropdown = document.querySelector('select#assistant-type');
    if (!assistantDropdown) {
        console.error('🔧 Final Fix: Assistant dropdown not found for creating group');
        return;
    }

    // Find the parent form or container
    let insertionPoint = assistantDropdown.closest('.form-group');
    if (!insertionPoint) {
        insertionPoint = assistantDropdown.parentElement;
    }

    if (!insertionPoint) {
        console.error('🔧 Final Fix: Could not find insertion point for assistant ID group');
        return;
    }

    // Create the assistant ID group
    const assistantIdGroup = document.createElement('div');
    assistantIdGroup.className = 'form-group assistant-id-group';
    assistantIdGroup.innerHTML = `
        <label for="assistant-id">Assistant ID</label>
        <input type="text" id="assistant-id" placeholder="Enter OpenAI Assistant ID">
        <p class="help-text">Find this in your OpenAI dashboard</p>
    `;

    // Insert after the assistant type form group
    insertionPoint.parentNode.insertBefore(assistantIdGroup, insertionPoint.nextSibling);

    console.log('🔧 Final Fix: Assistant ID group created');
}

// Override any other custom assistant handlers
window.showCustomAssistantForm = showCustomAssistantFormFinal;
window.hideCustomAssistantForm = hideCustomAssistantFormFinal;

// Export for global access
window.customAssistantFinalFix = {
    showCustomAssistantFormFinal,
    hideCustomAssistantFormFinal,
    initFinalCustomAssistantFix,
    handleAssistantDropdownChange
};

console.log('🔧 Custom Assistant Final Fix: Loaded and ready!');