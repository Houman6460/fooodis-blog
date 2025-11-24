/**
 * Automatic loader for the modern email builder
 * This script ensures the modern email builder template is loaded properly
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in the email marketing section
    const emailMarketingSection = document.getElementById('email-marketing-section');
    if (!emailMarketingSection) return;
    
    console.log('Modern Email Builder Loader: Initializing...');
    
    // Create a function to load the email builder tab
    function loadEmailBuilderTab() {
        // Get the tabs container
        const tabsContainer = document.getElementById('email-marketing-tabs');
        if (!tabsContainer) return;
        
        // Find or create the builder tab
        let builderTab = tabsContainer.querySelector('[data-tab="builder"]');
        if (!builderTab) {
            builderTab = document.createElement('div');
            builderTab.className = 'email-tab';
            builderTab.setAttribute('data-tab', 'builder');
            builderTab.textContent = 'Build & Design';
            tabsContainer.appendChild(builderTab);
        }
        
        // Fetch the modern email builder template
        fetch('templates/email-builder-tab.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Create or get the builder tab content
                const contentContainer = document.getElementById('email-marketing-content');
                if (!contentContainer) return;
                
                let builderTabContent = document.getElementById('builder-tab');
                if (!builderTabContent) {
                    builderTabContent = document.createElement('div');
                    builderTabContent.id = 'builder-tab';
                    builderTabContent.className = 'email-marketing-tab-content';
                    contentContainer.appendChild(builderTabContent);
                }
                
                // Insert the template HTML
                builderTabContent.innerHTML = html;
                console.log('Modern Email Builder: Template loaded successfully');
                
                // Make the builder tab active if it was previously selected
                const activeTab = tabsContainer.querySelector('.active');
                if (activeTab && activeTab.getAttribute('data-tab') === 'builder') {
                    builderTabContent.classList.add('active');
                }
                
                // Add event listener to the builder tab
                builderTab.addEventListener('click', function() {
                    // Remove active class from all tabs and content
                    const tabs = tabsContainer.querySelectorAll('.email-tab');
                    tabs.forEach(tab => tab.classList.remove('active'));
                    
                    // Add active class to this tab
                    builderTab.classList.add('active');
                    
                    // Remove active class from all content
                    const contents = contentContainer.querySelectorAll('.email-marketing-tab-content');
                    contents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to this content
                    builderTabContent.classList.add('active');
                });
            })
            .catch(error => {
                console.error('Error loading email builder template:', error);
            });
    }
    
    // If the dashboard navigation exists, add a click handler for the Email Marketing item
    const emailMarketingNavItem = document.querySelector('a[href="#email-marketing-section"]');
    if (emailMarketingNavItem) {
        emailMarketingNavItem.addEventListener('click', function() {
            // Short delay to ensure the section is visible
            setTimeout(loadEmailBuilderTab, 300);
        });
    }
    
    // Also attempt to load it immediately if we're already on that section
    if (emailMarketingSection.classList.contains('active')) {
        loadEmailBuilderTab();
    }
    
    // Create a button to manually load the modern template if needed
    const emailMarketingHeader = emailMarketingSection.querySelector('.section-header');
    if (emailMarketingHeader) {
        const loadButton = document.createElement('button');
        loadButton.className = 'btn btn-secondary load-builder-btn';
        loadButton.innerHTML = '<i class="fas fa-sync-alt"></i> Load Modern Template';
        loadButton.style.marginLeft = '10px';
        loadButton.addEventListener('click', loadEmailBuilderTab);
        
        const sectionTitle = emailMarketingHeader.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.parentNode.insertBefore(loadButton, sectionTitle.nextSibling);
        }
    }
});
