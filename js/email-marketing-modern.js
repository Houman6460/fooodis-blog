/**
 * Email Marketing Studio - Modern Version
 * Manages the Email Marketing Studio section in the Fooodis Blog dashboard
 * Modern theme version with direct HTML template loading
 */

const EmailMarketingStudio = {
    // Initialize the Email Marketing Studio
    init() {
        console.log('Initializing Modern Email Marketing Studio...');
        this.setupTabNavigation();
        this.setupCampaignsTable();
        this.loadEmailBuilder();
        
        // Initialize the Email Builder if it exists
        if (typeof EmailBuilder !== 'undefined') {
            EmailBuilder.init();
        }
    },
    
    // Load the email builder template from HTML file
    loadEmailBuilder() {
        console.log('Loading modern email builder template...');
        const emailMarketingTabsContainer = document.getElementById('email-marketing-tabs');
        const emailMarketingContentContainer = document.getElementById('email-marketing-content');
        
        if (!emailMarketingTabsContainer || !emailMarketingContentContainer) {
            console.error('Email marketing containers not found');
            return;
        }
        
        // Create Builder tab if not exists
        this.createTabIfNotExists(
            'builder',
            'Build & Design',
            emailMarketingTabsContainer
        );
        
        // Create an AJAX request to load the template
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'templates/email-builder-tab.html', true);
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                // Create the content container if it doesn't exist
                let builderTabContent = document.getElementById('builder-tab');
                if (!builderTabContent) {
                    builderTabContent = document.createElement('div');
                    builderTabContent.id = 'builder-tab';
                    builderTabContent.className = 'email-marketing-tab-content';
                    emailMarketingContentContainer.appendChild(builderTabContent);
                }
                
                // Insert the template content
                builderTabContent.innerHTML = xhr.responseText;
                
                console.log('Email builder template loaded successfully');
            } else {
                console.error('Failed to load email builder template:', xhr.status);
            }
        };
        
        xhr.onerror = () => {
            console.error('Error loading email builder template');
        };
        
        xhr.send();
    },
    
    // Helper function to create a tab if it doesn't exist
    createTabIfNotExists(tabId, content, container) {
        // Check if tab already exists
        const existingTab = container.querySelector(`[data-tab="${tabId}"]`);
        if (existingTab) return;
        
        // Create new tab
        const newTab = document.createElement('div');
        newTab.className = 'email-tab';
        newTab.setAttribute('data-tab', tabId);
        newTab.textContent = content;
        
        container.appendChild(newTab);
        console.log(`Tab "${tabId}" created`);
    },
    
    // Set up the tab navigation for the email marketing section
    setupTabNavigation() {
        const emailMarketingSection = document.getElementById('email-marketing-section');
        if (!emailMarketingSection) return;
        
        const tabs = emailMarketingSection.querySelectorAll('.email-tab');
        const tabContents = emailMarketingSection.querySelectorAll('.email-marketing-tab-content');
        
        // Add click event to each tab
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.setActiveTab(tabName, tabs, tabContents);
            });
        });
    },
    
    // Set the active tab
    setActiveTab(tabName, tabs, tabContents) {
        // Remove active class from all tabs and content
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const selectedTab = Array.from(tabs).find(tab => tab.getAttribute('data-tab') === tabName);
        const selectedContent = Array.from(tabContents).find(content => content.id === `${tabName}-tab`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    },
    
    // Set up the campaigns table
    setupCampaignsTable() {
        const campaignsTable = document.getElementById('campaignsTable');
        if (!campaignsTable) return;
        
        // Add click event to edit buttons
        const editButtons = campaignsTable.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const row = button.closest('tr');
                const campaignName = row.querySelector('td:first-child').textContent;
                this.editCampaign(campaignName, row);
            });
        });
        
        // Add click event to duplicate buttons
        const duplicateButtons = campaignsTable.querySelectorAll('.btn-duplicate');
        duplicateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const row = button.closest('tr');
                const campaignName = row.querySelector('td:first-child').textContent;
                this.duplicateCampaign(campaignName, row);
            });
        });
        
        // Add click event to delete buttons
        const deleteButtons = campaignsTable.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const row = button.closest('tr');
                const campaignName = row.querySelector('td:first-child').textContent;
                this.deleteCampaign(campaignName, row);
            });
        });
        
        // Add click event to new campaign button
        const newCampaignButton = document.getElementById('newCampaignBtn');
        if (newCampaignButton) {
            newCampaignButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.createNewCampaign();
            });
        }
    },
    
    // Edit a campaign
    editCampaign(campaignName, row) {
        console.log(`Editing campaign: ${campaignName}`);
        // Set the active tab to builder
        const emailMarketingSection = document.getElementById('email-marketing-section');
        if (emailMarketingSection) {
            const tabs = emailMarketingSection.querySelectorAll('.email-tab');
            const tabContents = emailMarketingSection.querySelectorAll('.email-marketing-tab-content');
            this.setActiveTab('builder', tabs, tabContents);
            
            // Set the campaign name in the builder
            const campaignNameInput = document.getElementById('campaign-name');
            if (campaignNameInput) {
                campaignNameInput.value = campaignName;
            }
        }
    },
    
    // Duplicate a campaign
    duplicateCampaign(campaignName, row) {
        console.log(`Duplicating campaign: ${campaignName}`);
        // Create a duplicate row in the table
        const newRow = row.cloneNode(true);
        const newCampaignName = `${campaignName} (Copy)`;
        newRow.querySelector('td:first-child').textContent = newCampaignName;
        
        // Update the status to "Draft"
        const statusCell = newRow.querySelector('td:nth-child(2)');
        if (statusCell) {
            statusCell.innerHTML = '<span class="status-badge status-draft">Draft</span>';
        }
        
        // Update the date to today
        const dateCell = newRow.querySelector('td:nth-child(3)');
        if (dateCell) {
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            dateCell.textContent = formattedDate;
        }
        
        // Add event listeners to the new buttons
        const editButton = newRow.querySelector('.btn-edit');
        if (editButton) {
            editButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.editCampaign(newCampaignName, newRow);
            });
        }
        
        const duplicateButton = newRow.querySelector('.btn-duplicate');
        if (duplicateButton) {
            duplicateButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.duplicateCampaign(newCampaignName, newRow);
            });
        }
        
        const deleteButton = newRow.querySelector('.btn-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteCampaign(newCampaignName, newRow);
            });
        }
        
        // Add the new row to the table
        row.parentNode.appendChild(newRow);
    },
    
    // Delete a campaign
    deleteCampaign(campaignName, row) {
        console.log(`Deleting campaign: ${campaignName}`);
        // Confirm deletion
        if (confirm(`Are you sure you want to delete the campaign "${campaignName}"?`)) {
            row.parentNode.removeChild(row);
        }
    },
    
    // Create a new campaign
    createNewCampaign() {
        console.log('Creating new campaign');
        // Set the active tab to builder
        const emailMarketingSection = document.getElementById('email-marketing-section');
        if (emailMarketingSection) {
            const tabs = emailMarketingSection.querySelectorAll('.email-tab');
            const tabContents = emailMarketingSection.querySelectorAll('.email-marketing-tab-content');
            this.setActiveTab('builder', tabs, tabContents);
            
            // Set the campaign name in the builder
            const campaignNameInput = document.getElementById('campaign-name');
            if (campaignNameInput) {
                campaignNameInput.value = 'New Campaign';
            }
        }
    }
};

// Initialize the Email Marketing Studio when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the email marketing section
    const emailMarketingSection = document.getElementById('email-marketing-section');
    if (emailMarketingSection) {
        EmailMarketingStudio.init();
    }
});
