/**
 * Nicepage JS - Basic functionality for Fooodis Blog System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeComponents();
});

/**
 * Initialize all components on the page
 */
function initializeComponents() {
    // Initialize responsive navigation
    initializeNavigation();
    
    // Initialize modals
    initializeModals();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize dropdowns
    initializeDropdowns();
    
    // Initialize tabs
    initializeTabs();
    
    // Initialize accordions
    initializeAccordions();
    
    // Initialize form validation
    initializeFormValidation();
}

/**
 * Initialize responsive navigation
 */
function initializeNavigation() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (mobileNavToggle && mobileNav) {
        mobileNavToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileNavToggle.classList.toggle('active');
            
            // Toggle aria-expanded attribute
            const expanded = mobileNavToggle.getAttribute('aria-expanded') === 'true' || false;
            mobileNavToggle.setAttribute('aria-expanded', !expanded);
        });
    }
    
    // Handle submenu toggles
    const submenuToggles = document.querySelectorAll('.has-submenu > a');
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                e.preventDefault();
                const parent = this.parentElement;
                parent.classList.toggle('submenu-active');
            }
        });
    });
    
    // Close mobile nav when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileNav && mobileNav.classList.contains('active')) {
            if (!mobileNav.contains(e.target) && e.target !== mobileNavToggle) {
                mobileNav.classList.remove('active');
                mobileNavToggle.classList.remove('active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

/**
 * Initialize modal functionality
 */
function initializeModals() {
    // Modal open buttons
    const modalOpenButtons = document.querySelectorAll('[data-modal-target]');
    
    modalOpenButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

/**
 * Open a modal
 * @param {HTMLElement} modal - The modal element to open
 */
function openModal(modal) {
    if (!modal) return;
    
    // Add active class
    modal.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Set focus to the first focusable element
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    if (focusableElements.length) {
        focusableElements[0].focus();
    }
    
    // Trigger custom event
    modal.dispatchEvent(new CustomEvent('modal:open'));
}

/**
 * Close a modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
    if (!modal) return;
    
    // Remove active class
    modal.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Trigger custom event
    modal.dispatchEvent(new CustomEvent('modal:close'));
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        
        // Add tooltip to element
        element.appendChild(tooltip);
        
        // Position tooltip on hover
        element.addEventListener('mouseenter', function() {
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            tooltip.style.top = `-${tooltipRect.height + 10}px`;
            tooltip.style.left = `${(rect.width / 2) - (tooltipRect.width / 2)}px`;
            tooltip.classList.add('active');
        });
        
        // Hide tooltip on mouse leave
        element.addEventListener('mouseleave', function() {
            tooltip.classList.remove('active');
        });
    });
}

/**
 * Initialize dropdowns
 */
function initializeDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            
            const dropdown = this.nextElementSibling;
            
            if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                dropdown.classList.toggle('active');
                
                // Toggle aria-expanded attribute
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const activeDropdowns = document.querySelectorAll('.dropdown-menu.active');
        
        activeDropdowns.forEach(dropdown => {
            const toggle = dropdown.previousElementSibling;
            
            if (!dropdown.contains(e.target) && e.target !== toggle) {
                dropdown.classList.remove('active');
                
                if (toggle && toggle.classList.contains('dropdown-toggle')) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
}

/**
 * Initialize tabs
 */
function initializeTabs() {
    const tabLinks = document.querySelectorAll('[data-tab-target]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab-target');
            const tabContent = document.getElementById(tabId);
            
            if (tabContent) {
                // Hide all tab content
                const allTabContents = document.querySelectorAll('.tab-content');
                allTabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // Remove active class from all tab links
                const allTabLinks = document.querySelectorAll('[data-tab-target]');
                allTabLinks.forEach(tabLink => {
                    tabLink.classList.remove('active');
                });
                
                // Activate current tab and link
                tabContent.classList.add('active');
                this.classList.add('active');
            }
        });
    });
}

/**
 * Initialize accordions
 */
function initializeAccordions() {
    const accordionToggles = document.querySelectorAll('.accordion-toggle');
    
    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const accordionContent = this.nextElementSibling;
            
            if (accordionItem && accordionContent) {
                // Toggle current accordion item
                accordionItem.classList.toggle('active');
                
                // Toggle aria-expanded attribute
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
                
                // Toggle content height
                if (accordionItem.classList.contains('active')) {
                    accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
                } else {
                    accordionContent.style.maxHeight = '0';
                }
            }
        });
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Get all required inputs
            const requiredInputs = form.querySelectorAll('[required]');
            
            requiredInputs.forEach(input => {
                // Remove previous error messages
                const existingError = input.parentElement.querySelector('.form-error');
                if (existingError) {
                    existingError.remove();
                }
                
                // Check if input is empty
                if (!input.value.trim()) {
                    isValid = false;
                    
                    // Add error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-error';
                    errorMessage.textContent = 'This field is required';
                    
                    input.parentElement.appendChild(errorMessage);
                }
                
                // Check email format
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        
                        // Add error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'form-error';
                        errorMessage.textContent = 'Please enter a valid email address';
                        
                        input.parentElement.appendChild(errorMessage);
                    }
                }
            });
            
            // Prevent form submission if not valid
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

// Make functions available globally
window.nicepage = {
    openModal: openModal,
    closeModal: closeModal
};
