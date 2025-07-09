/**
 * Email Marketing Studio Tab Navigation
 * Simple, dependency-free tab navigation for the email marketing section
 */
document.addEventListener('DOMContentLoaded', function() {
  // Email Marketing Tabs functionality
  const initEmailTabs = function() {
    const emailMarketingSection = document.getElementById('email-marketing-section');
    if (!emailMarketingSection) return;
    
    const tabs = emailMarketingSection.querySelectorAll('.email-tab');
    const contents = emailMarketingSection.querySelectorAll('.email-marketing-tab-content');
    
    // Add click handlers to tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Add active class to selected tab and content
        this.classList.add('active');
        const activeContent = document.getElementById(tabName + '-tab');
        if (activeContent) {
          activeContent.classList.add('active');
        }
      });
    });
  };
  
  // Preview & Test button functionality
  const initPreviewButton = function() {
    const previewButton = document.querySelector('.email-studio-actions .btn-primary');
    if (previewButton) {
      previewButton.addEventListener('click', function() {
        alert('Email preview mode activated. Your campaign would be displayed as it will appear in recipients\' inboxes.');
      });
    }
    
    // Save draft button
    const saveButton = document.querySelector('.email-studio-actions .btn-secondary');
    if (saveButton) {
      saveButton.addEventListener('click', function() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
          statusIndicator.textContent = "Changes saved";
          statusIndicator.style.color = "#4CAF50";
          setTimeout(() => {
            statusIndicator.style.color = "";
          }, 2000);
        }
      });
    }
    
    // Recipients button
    const recipientsButton = document.querySelector('.email-studio-actions .btn-success');
    if (recipientsButton) {
      recipientsButton.addEventListener('click', function() {
        // Switch to campaigns tab
        const campaignsTab = document.querySelector('.email-tab[data-tab="campaigns"]');
        if (campaignsTab) {
          campaignsTab.click();
        }
      });
    }
  };
  
  // Initialize all functionality
  initEmailTabs();
  initPreviewButton();
  
  // Campaign name editing
  const campaignNameInput = document.getElementById('campaign-name');
  const editLabel = document.querySelector('.edit-label');
  
  if (campaignNameInput && editLabel) {
    editLabel.addEventListener('click', function() {
      campaignNameInput.focus();
      campaignNameInput.select();
    });
  }
});
