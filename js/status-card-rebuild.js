
// Status Card Rebuild - Manages execution status cards display and updates
(function() {
    'use strict';
    
    console.log('Status Card Rebuild: Initializing');
    
    function rebuildStatusCards() {
        const statusContainer = document.getElementById('execution-status-cards') || 
                               document.querySelector('.execution-status-cards') ||
                               document.querySelector('.status-cards-container');
        
        if (!statusContainer) {
            console.log('Status Card Rebuild: No status container found');
            return;
        }
        
        // Clear existing cards
        statusContainer.innerHTML = '';
        
        // Get automation paths from storage
        let automationPaths = [];
        try {
            const stored = localStorage.getItem('aiAutomationPaths') || 
                          localStorage.getItem('fooodis-ai-automation-paths');
            if (stored) {
                automationPaths = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Status Card Rebuild: Error loading automation paths:', e);
        }
        
        // Rebuild cards for each automation path
        automationPaths.forEach((path, index) => {
            if (path && typeof path === 'object') {
                createStatusCard(path, index, statusContainer);
            }
        });
        
        console.log(`Status Card Rebuild: Rebuilt ${automationPaths.length} status cards`);
    }
    
    function createStatusCard(path, index, container) {
        const card = document.createElement('div');
        card.className = 'execution-status-card';
        card.id = `status-card-${path.id || index}`;
        
        const status = path.status || 'pending';
        const title = path.title || `Automation ${index + 1}`;
        const scheduledTime = path.scheduledTime || 'Not scheduled';
        
        card.innerHTML = `
            <div class="card-header">
                <h4>${title}</h4>
                <span class="status-badge status-${status}">${status.toUpperCase()}</span>
            </div>
            <div class="card-body">
                <p><strong>Scheduled:</strong> ${scheduledTime}</p>
                <p><strong>Category:</strong> ${path.category || 'General'}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${getProgressWidth(status)}%"></div>
                </div>
            </div>
            <div class="card-actions">
                <button onclick="cancelAutomation('${path.id || index}')" class="btn btn-sm btn-danger">Cancel</button>
                <button onclick="viewAutomation('${path.id || index}')" class="btn btn-sm btn-info">View</button>
            </div>
        `;
        
        container.appendChild(card);
    }
    
    function getProgressWidth(status) {
        switch (status) {
            case 'pending': return 10;
            case 'running': return 50;
            case 'completed': return 100;
            case 'failed': return 0;
            default: return 0;
        }
    }
    
    function updateStatusCard(pathId, newStatus) {
        const card = document.getElementById(`status-card-${pathId}`);
        if (card) {
            const statusBadge = card.querySelector('.status-badge');
            const progressFill = card.querySelector('.progress-fill');
            
            if (statusBadge) {
                statusBadge.textContent = newStatus.toUpperCase();
                statusBadge.className = `status-badge status-${newStatus}`;
            }
            
            if (progressFill) {
                progressFill.style.width = getProgressWidth(newStatus) + '%';
            }
        }
    }
    
    // Global functions for card actions
    window.cancelAutomation = function(pathId) {
        if (confirm('Are you sure you want to cancel this automation?')) {
            updateStatusCard(pathId, 'cancelled');
            console.log('Status Card Rebuild: Cancelled automation', pathId);
        }
    };
    
    window.viewAutomation = function(pathId) {
        console.log('Status Card Rebuild: Viewing automation', pathId);
        // You can add modal or navigation logic here
    };
    
    // Auto-rebuild on storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'aiAutomationPaths' || e.key === 'fooodis-ai-automation-paths') {
            rebuildStatusCards();
        }
    });
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rebuildStatusCards);
    } else {
        rebuildStatusCards();
    }
    
    // Rebuild every 30 seconds
    setInterval(rebuildStatusCards, 30000);
    
    // Export function globally
    window.rebuildStatusCards = rebuildStatusCards;
    window.updateStatusCard = updateStatusCard;
    
    console.log('Status Card Rebuild: Initialized successfully');
})();
