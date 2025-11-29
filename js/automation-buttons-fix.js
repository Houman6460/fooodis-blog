/**
 * Automation Buttons Fix
 * Ensures edit and delete buttons work on automation paths
 */
(function() {
    console.log('Automation Buttons Fix: Loading...');
    
    // Wait for DOM to be ready
    function init() {
        console.log('Automation Buttons Fix: Initializing...');
        
        // Set up click handler using event delegation on document
        document.addEventListener('click', handleButtonClick, true);
        
        // Also set up a mutation observer to handle dynamically added buttons
        setupMutationObserver();
        
        console.log('Automation Buttons Fix: Initialized');
    }
    
    function handleButtonClick(event) {
        const target = event.target;
        
        // Check if clicked on edit button or its icon
        const editBtn = target.closest('.edit-btn');
        if (editBtn) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const pathElement = editBtn.closest('.automation-path');
            if (pathElement) {
                const index = parseInt(pathElement.dataset.index, 10);
                console.log('Automation Buttons Fix: Edit clicked, index:', index);
                
                if (!isNaN(index)) {
                    doEdit(index);
                }
            }
            return false;
        }
        
        // Check if clicked on delete button or its icon
        const deleteBtn = target.closest('.delete-btn');
        if (deleteBtn) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            const pathElement = deleteBtn.closest('.automation-path');
            if (pathElement) {
                const index = parseInt(pathElement.dataset.index, 10);
                console.log('Automation Buttons Fix: Delete clicked, index:', index);
                
                if (!isNaN(index)) {
                    doDelete(index);
                }
            }
            return false;
        }
    }
    
    function doEdit(index) {
        console.log('Automation Buttons Fix: Executing edit for index', index);
        
        // Try multiple ways to call edit
        if (window.editAutomationPath) {
            window.editAutomationPath(index);
        } else if (window.aiAutomation && window.aiAutomation.editAutomationPath) {
            window.aiAutomation.editAutomationPath(index);
        } else {
            // Fallback: call the function directly if available
            try {
                editAutomationPath(index);
            } catch (e) {
                console.error('Automation Buttons Fix: Could not find editAutomationPath function');
                alert('Edit function not available. Please refresh the page.');
            }
        }
    }
    
    function doDelete(index) {
        console.log('Automation Buttons Fix: Executing delete for index', index);
        
        // Try multiple ways to call delete
        if (window.deleteAutomationPath) {
            window.deleteAutomationPath(index);
        } else if (window.aiAutomation && window.aiAutomation.deleteAutomationPath) {
            window.aiAutomation.deleteAutomationPath(index);
        } else {
            // Fallback: direct API call
            if (confirm('Are you sure you want to delete this automation path?')) {
                deletePathDirectly(index);
            }
        }
    }
    
    async function deletePathDirectly(index) {
        console.log('Automation Buttons Fix: Direct delete for index', index);
        
        // Get automation paths from window or fetch from API
        let paths = window.automationPaths || [];
        
        if (paths.length === 0) {
            // Try to get from API
            try {
                const response = await fetch('/api/automation/paths');
                if (response.ok) {
                    const data = await response.json();
                    paths = data.paths || data || [];
                }
            } catch (e) {
                console.error('Failed to fetch paths:', e);
            }
        }
        
        if (paths[index] && paths[index].id) {
            try {
                const response = await fetch(`/api/automation/paths/${paths[index].id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log('Automation Buttons Fix: Path deleted successfully');
                    alert('Path deleted successfully!');
                    window.location.reload();
                } else {
                    throw new Error('Delete failed');
                }
            } catch (e) {
                console.error('Delete error:', e);
                alert('Failed to delete path: ' + e.message);
            }
        } else {
            alert('Could not find path to delete. Please refresh and try again.');
        }
    }
    
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            // Check if it's an automation path element
                            if (node.classList && node.classList.contains('automation-path')) {
                                attachButtonHandlers(node);
                            }
                            // Check children
                            const paths = node.querySelectorAll ? node.querySelectorAll('.automation-path') : [];
                            paths.forEach(attachButtonHandlers);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function attachButtonHandlers(pathElement) {
        const index = parseInt(pathElement.dataset.index, 10);
        if (isNaN(index)) return;
        
        const editBtn = pathElement.querySelector('.edit-btn');
        const deleteBtn = pathElement.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Automation Buttons Fix: Edit button onclick, index:', index);
                doEdit(index);
                return false;
            };
        }
        
        if (deleteBtn) {
            deleteBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Automation Buttons Fix: Delete button onclick, index:', index);
                doDelete(index);
                return false;
            };
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run after a delay to catch late-loaded content
    setTimeout(function() {
        const paths = document.querySelectorAll('.automation-path');
        console.log('Automation Buttons Fix: Found', paths.length, 'automation paths');
        paths.forEach(attachButtonHandlers);
    }, 2000);
    
    // Expose for debugging
    window.automationButtonsFix = {
        doEdit: doEdit,
        doDelete: doDelete,
        attachButtonHandlers: attachButtonHandlers
    };
})();
