/**
 * Email Marketing Studio - Tab Navigation and Functionality
 * Manages the Email Marketing Studio section in the Fooodis Blog dashboard
 * Modern theme version
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
    
    // Create all tabs (without using fetch to avoid CORS issues)
    createBuilderTab() {
        try {
            // Get the email marketing content container
            const emailMarketingContent = document.querySelector('.email-marketing-content');
            if (!emailMarketingContent) {
                console.error('Email marketing content container not found');
                return false;
            }
            
            // Create tabs if they don't exist
            this.createTabIfNotExists('builder-tab', this.getBuilderTabContent(), emailMarketingContent);
            this.createTabIfNotExists('automation-tab', this.getAutomationTabContent(), emailMarketingContent);
            this.createTabIfNotExists('forms-tab', this.getFormsTabContent(), emailMarketingContent);
            this.createTabIfNotExists('analytics-tab', this.getAnalyticsTabContent(), emailMarketingContent);
            this.createTabIfNotExists('settings-tab', this.getSettingsTabContent(), emailMarketingContent);
            
            console.log('All email marketing tabs created successfully');
            return true;
        } catch (error) {
            console.error('Error creating email marketing tabs:', error);
            return false;
        }
    },
    
    // Helper function to create a tab if it doesn't exist
    createTabIfNotExists(tabId, content, container) {
        if (!document.getElementById(tabId)) {
            const tab = document.createElement('div');
            tab.className = 'email-marketing-tab-content';
            tab.id = tabId;
            tab.innerHTML = content;
            container.appendChild(tab);
        }
    },
    
    // Get Email Builder Tab content
    getBuilderTabContent() {
        // Use fetch to load the modern email builder template
        return fetch('templates/email-builder-tab.html')
            .then(response => response.text())
            .catch(error => {
                console.error('Error loading email builder template:', error);
                return `<div class="email-builder-container">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load email builder. Please refresh the page or contact support.</p>
                    </div>
                </div>`;
            });
    },
    
    // Create Builder Tab with modern template
    async createBuilderTab() {
        const emailMarketingTabsContainer = document.getElementById('email-marketing-tabs');
        const emailMarketingContentContainer = document.getElementById('email-marketing-content');
        
        if (!emailMarketingTabsContainer || !emailMarketingContentContainer) return;
        
        // Create Builder tab if not exists
        this.createTabIfNotExists(
            'builder',
            'Build & Design',
            emailMarketingTabsContainer
        );
        
        try {
            // Fetch the template content
            const builderContent = await this.getBuilderTabContent();
            
            // Create the content container if it doesn't exist
            let builderTabContent = document.getElementById('builder-tab');
            if (!builderTabContent) {
                builderTabContent = document.createElement('div');
                builderTabContent.id = 'builder-tab';
                builderTabContent.className = 'email-marketing-tab-content';
                emailMarketingContentContainer.appendChild(builderTabContent);
            }
            
            // Insert the template content
            builderTabContent.innerHTML = builderContent;
            
            console.log('Builder tab created/updated with modern template');
        } catch (error) {
            console.error('Error creating builder tab:', error);
        }
                    </div>
                    <div class="email-canvas-wrapper">
                        <div class="email-canvas" id="email-canvas">
                            <div class="canvas-message">
                                <i class="fas fa-arrow-left"></i>
                                <h3>Start by dragging elements from the sidebar</h3>
                                <p>Or choose a template below</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="builder-settings">
                    <div class="settings-panel">
                        <h3>Settings</h3>
                        <div class="settings-group">
                            <h4>Options</h4>
                            <div class="form-group">
                                <button class="btn btn-primary btn-block">Apply Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Automation Tab content
    getAutomationTabContent() {
        return `
            <div class="automation-container">
                <div class="automation-header">
                    <h3>Email Automation</h3>
                    <button class="btn btn-primary"><i class="fas fa-plus"></i> Create Workflow</button>
                </div>
                <div class="automation-workflows">
                    <div class="workflow-card">
                        <div class="workflow-header">
                            <h4>Welcome Series</h4>
                            <div class="workflow-status active">Active</div>
                        </div>
                        <div class="workflow-stats">
                            <div class="stat">
                                <span class="stat-value">143</span>
                                <span class="stat-label">Recipients</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">89%</span>
                                <span class="stat-label">Open Rate</span>
                            </div>
                        </div>
                        <div class="workflow-actions">
                            <button class="action-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn"><i class="fas fa-copy"></i></button>
                            <button class="action-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="workflow-card">
                        <div class="workflow-header">
                            <h4>Abandoned Cart</h4>
                            <div class="workflow-status draft">Draft</div>
                        </div>
                        <div class="workflow-description">
                            <p>Recover lost sales with automated emails to customers who left items in their cart.</p>
                        </div>
                        <div class="workflow-actions">
                            <button class="action-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Forms Tab content
    getFormsTabContent() {
        return `
            <div class="forms-container">
                <div class="forms-header">
                    <h3>Signup Forms</h3>
                    <button class="btn btn-primary"><i class="fas fa-plus"></i> Create Form</button>
                </div>
                <div class="forms-gallery">
                    <div class="form-card">
                        <div class="form-preview">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        <div class="form-details">
                            <h4>Food Newsletter</h4>
                            <p>Pop-up form with 2 fields</p>
                            <span class="form-stats">128 signups</span>
                        </div>
                        <div class="form-actions">
                            <button class="action-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn"><i class="fas fa-copy"></i></button>
                            <button class="action-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="form-card">
                        <div class="form-preview">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="form-details">
                            <h4>Recipe Updates</h4>
                            <p>Embedded form with 3 fields</p>
                            <span class="form-stats">93 signups</span>
                        </div>
                        <div class="form-actions">
                            <button class="action-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn"><i class="fas fa-copy"></i></button>
                            <button class="action-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Analytics Tab content
    getAnalyticsTabContent() {
        return `
            <div class="analytics-container">
                <div class="analytics-header">
                    <h3>Email Analytics</h3>
                    <div class="date-filter">
                        <label>Period:</label>
                        <select>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                        </select>
                    </div>
                </div>
                <div class="analytics-overview">
                    <div class="metric-card">
                        <div class="metric-value">23,457</div>
                        <div class="metric-label">Emails Sent</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">42.8%</div>
                        <div class="metric-label">Open Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">7.3%</div>
                        <div class="metric-label">Click Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">1.2%</div>
                        <div class="metric-label">Unsubscribe Rate</div>
                    </div>
                </div>
                <div class="analytics-charts">
                    <div class="chart-container">
                        <h4>Email Performance Over Time</h4>
                        <div class="chart-placeholder">
                            <i class="fas fa-chart-line"></i>
                            <span>Performance data visualization</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Settings Tab content
    getSettingsTabContent() {
        return `
            <div class="settings-container">
                <div class="settings-header">
                    <h3>Email Settings</h3>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h4>Sender Information</h4>
                        <div class="form-group">
                            <label>Sender Name</label>
                            <input type="text" value="Fooodis Blog" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Reply-To Email</label>
                            <input type="email" value="newsletter@fooodis.com" class="form-control">
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Default Email Template</h4>
                        <div class="form-group">
                            <label>Template</label>
                            <select class="form-control">
                                <option>Standard Template</option>
                                <option>Minimal Template</option>
                                <option>Food Blog Template</option>
                            </select>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Email Sending Options</h4>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" checked> Track Email Opens
                            </label>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox" checked> Track Link Clicks
                            </label>
                        </div>
                        <div class="form-group checkbox-group">
                            <label>
                                <input type="checkbox"> Add Unsubscribe Link
                            </label>
                        </div>
                    </div>
                    <button class="btn btn-primary">Save Settings</button>
                </div>
            </div>
        `;
    },
    
    // Apply dark theme to the Email Marketing Studio
    applyDarkTheme() {
        try {
            // Apply dark theme to specific elements
            const emailMarketingSection = document.getElementById('email-marketing-section');
            if (!emailMarketingSection) return;
            
            // Add dark theme class to the section
            emailMarketingSection.classList.add('dark-theme');
            
            // Style the tabs
            const tabs = emailMarketingSection.querySelectorAll('.email-marketing-tabs .tab');
            tabs.forEach(tab => {
                tab.style.backgroundColor = '#2b2b40';
                tab.style.color = '#a2a3b7';
                tab.style.borderBottom = '3px solid transparent';
            });
            
            // Style the active tab
            const activeTab = emailMarketingSection.querySelector('.email-marketing-tabs .tab.active');
            if (activeTab) {
                activeTab.style.backgroundColor = '#323248';
                activeTab.style.color = '#00c89b';
                activeTab.style.borderBottom = '3px solid #00c89b';
            }
            
            // Style the campaigns table
            const campaignsTable = emailMarketingSection.querySelector('.campaigns-table');
            if (campaignsTable) {
                campaignsTable.style.backgroundColor = '#2b2b40';
                campaignsTable.style.color = '#e5e5f0';
                
                // Style table headers
                const tableHeaders = campaignsTable.querySelectorAll('th');
                tableHeaders.forEach(th => {
                    th.style.backgroundColor = '#323248';
                    th.style.color = '#e5e5f0';
                });
                
                // Style table cells
                const tableCells = campaignsTable.querySelectorAll('td');
                tableCells.forEach(td => {
                    td.style.borderTop = '1px solid #3f3f5f';
                    td.style.color = '#e5e5f0';
                });
            }
            
            // Style the email builder container
            const builderContainer = emailMarketingSection.querySelector('.email-builder-container');
            if (builderContainer) {
                builderContainer.style.backgroundColor = '#1e1e2d';
                builderContainer.style.color = '#e5e5f0';
            }
            
            console.log('Dark theme applied to Email Marketing Studio');
        } catch (error) {
            console.error('Error applying dark theme:', error);
        }
    },
    
    // Set up the tab navigation for the email marketing section
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.email-marketing-tabs .tab');
        const tabContents = document.querySelectorAll('.email-marketing-tab-content');
        
        // Load previously active tab from localStorage or default to 'campaigns'
        const savedActiveTab = localStorage.getItem('activeEmailMarketingTab') || 'campaigns';
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Get the tab name
                const tabName = tab.getAttribute('data-tab');
                console.log(`Tab clicked: ${tabName}`);
                
                // Remove active class from all tabs and content
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to current tab
                tab.classList.add('active');
                
                // Show the corresponding content
                const tabContent = document.getElementById(`${tabName}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                    console.log(`Activated tab content: ${tabName}-tab`);
                } else {
                    console.error(`Tab content not found: ${tabName}-tab`);
                }
            });
        });
        
        // Ensure a tab is active at start
        const currentActiveTab = document.querySelector('.email-marketing-tabs .tab.active');
        if (currentActiveTab) {
            // Trigger a click to show the active tab content
            currentActiveTab.click();
        } else if (tabs.length > 0) {
            // Set the first tab as active if none is active
            // Find the tab with data-tab matching savedActiveTab, or default to first tab
            const tabToActivate = Array.from(tabs).find(t => t.getAttribute('data-tab') === savedActiveTab) || tabs[0];
            tabToActivate.click();
        }
    },
    
    // Set the active tab
    setActiveTab(tabName, tabs, tabContents) {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const activeTab = document.querySelector(`.email-marketing-tabs .tab[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        // If builder tab is activated, ensure the email builder canvas is properly sized
        if (tabName === 'builder' && typeof EmailBuilder !== 'undefined') {
            EmailBuilder.setupPreviewControls();
        }
    },
    
    // Set up the campaigns table
    setupCampaignsTable() {
        // Add click event listeners to campaign action buttons
        const actionButtons = document.querySelectorAll('.campaign-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('title').toLowerCase();
                const campaignRow = button.closest('tr');
                const campaignName = campaignRow.querySelector('td:first-child').textContent;
                
                switch (action) {
                    case 'edit':
                        this.editCampaign(campaignName, campaignRow);
                        break;
                    case 'duplicate':
                        this.duplicateCampaign(campaignName, campaignRow);
                        break;
                    case 'delete':
                        this.deleteCampaign(campaignName, campaignRow);
                        break;
                }
            });
        });
        
        // Add click event listener to create campaign button
        const createCampaignBtn = document.getElementById('create-campaign-btn');
        if (createCampaignBtn) {
            createCampaignBtn.addEventListener('click', () => {
                this.createNewCampaign();
            });
        }
    },
    
    // Edit a campaign
    editCampaign(campaignName, row) {
        console.log(`Editing campaign: ${campaignName}`);
        // Switch to builder tab and load campaign template
        const tabs = document.querySelectorAll('.email-marketing-tabs .tab');
        const tabContents = document.querySelectorAll('.email-marketing-tab-content');
        this.setActiveTab('builder', tabs, tabContents);
        
        // TODO: Load campaign template into builder
    },
    
    // Duplicate a campaign
    duplicateCampaign(campaignName, row) {
        console.log(`Duplicating campaign: ${campaignName}`);
        // Create a duplicate entry in the table
        const newName = `${campaignName} (Copy)`;
        const tableBody = document.querySelector('.campaigns-table tbody');
        const newRow = row.cloneNode(true);
        newRow.querySelector('td:first-child').textContent = newName;
        newRow.querySelector('.campaign-status').className = 'campaign-status status-draft';
        newRow.querySelector('.campaign-status').textContent = 'Draft';
        
        // Reinitialize action buttons
        newRow.querySelectorAll('.campaign-action').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.getAttribute('title').toLowerCase();
                const campaignRow = button.closest('tr');
                const campaignName = campaignRow.querySelector('td:first-child').textContent;
                
                switch (action) {
                    case 'edit':
                        this.editCampaign(campaignName, campaignRow);
                        break;
                    case 'duplicate':
                        this.duplicateCampaign(campaignName, campaignRow);
                        break;
                    case 'delete':
                        this.deleteCampaign(campaignName, campaignRow);
                        break;
                }
            });
        });
        
        tableBody.appendChild(newRow);
    },
    
    // Delete a campaign
    deleteCampaign(campaignName, row) {
        if (confirm(`Are you sure you want to delete the campaign "${campaignName}"?`)) {
            row.remove();
            console.log(`Deleted campaign: ${campaignName}`);
        }
    },
    
    // Create a new campaign
    createNewCampaign() {
        console.log('Creating new campaign');
        // Switch to builder tab
        const tabs = document.querySelectorAll('.email-marketing-tabs .tab');
        const tabContents = document.querySelectorAll('.email-marketing-tab-content');
        this.setActiveTab('builder', tabs, tabContents);
        
        // TODO: Reset builder to empty template
    }
};

// Initialize the Email Marketing Studio when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the email marketing section
    if (document.getElementById('email-marketing-section')) {
        EmailMarketingStudio.init();
    }
});
