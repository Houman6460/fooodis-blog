/**
 * Direct Status Card Fix
 * A standalone solution that directly manages status cards without relying on other scripts
 */

(function() {
    // Store status cards in this variable
    let statusCards = [];
    
    // Run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Direct Status Fix: Initializing...');
        
        // Load status cards from storage
        loadStatusCards();
        
        // Wait for DOM to be fully ready
        setTimeout(function() {
            // Create status cards container if it doesn't exist
            ensureStatusCardsContainer();
            
            // Restore status cards
            restoreStatusCards();
            
            // Set up mutation observer to detect when cards are added or removed
            setupMutationObserver();
            
            // Set up periodic check for scheduled tasks
            setupPeriodicCheck();
        }, 2000);
    });
    
    /**
     * Load status cards from storage
     */
    function loadStatusCards() {
        try {
            // Try to load from localStorage
            const storedCards = localStorage.getItem('directStatusCards');
            if (storedCards) {
                statusCards = JSON.parse(storedCards);
                console.log('Direct Status Fix: Loaded status cards from storage', statusCards.length);
            }
        } catch (e) {
            console.error('Direct Status Fix: Error loading status cards', e);
            statusCards = [];
        }
    }
    
    /**
     * Save status cards to storage
     */
    function saveStatusCards() {
        try {
            localStorage.setItem('directStatusCards', JSON.stringify(statusCards));
            console.log('Direct Status Fix: Saved status cards to storage', statusCards.length);
        } catch (e) {
            console.error('Direct Status Fix: Error saving status cards', e);
        }
    }
    
    /**
     * Ensure the status cards container exists
     */
    function ensureStatusCardsContainer() {
        let container = document.querySelector('#automation-status-cards');
        if (!container) {
            console.log('Direct Status Fix: Creating status cards container');
            container = document.createElement('div');
            container.id = 'automation-status-cards';
            container.className = 'automation-status-cards';
            
            // Find the automation section to append to
            const automationSection = document.querySelector('#ai-automation-section');
            if (automationSection) {
                // Try to find a good insertion point
                const insertAfter = automationSection.querySelector('.automation-paths') || 
                                   automationSection.querySelector('.section-header') ||
                                   automationSection.firstElementChild;
                
                if (insertAfter && insertAfter.nextElementSibling) {
                    automationSection.insertBefore(container, insertAfter.nextElementSibling);
                } else {
                    automationSection.appendChild(container);
                }
                
                console.log('Direct Status Fix: Added status cards container to automation section');
            } else {
                // If automation section not found, add to body
                document.body.appendChild(container);
                console.log('Direct Status Fix: Added status cards container to body');
            }
        }
        return container;
    }
    
    /**
     * Restore status cards from storage
     */
    function restoreStatusCards() {
        const container = ensureStatusCardsContainer();
        
        // Clear existing cards
        container.innerHTML = '';
        
        // Create cards for each stored card
        statusCards.forEach(function(card) {
            createStatusCardElement(card, container);
        });
        
        console.log('Direct Status Fix: Restored status cards', statusCards.length);
    }
    
    /**
     * Create a status card element
     */
    function createStatusCardElement(card, container) {
        // Create card element
        const cardElement = document.createElement('div');
        cardElement.className = 'automation-status-card';
        cardElement.dataset.pathId = card.pathId;
        
        // Create card content
        cardElement.innerHTML = `
            <div class="card-header">
                <h3>${card.name || 'Unnamed Path'}</h3>
                <span class="status-badge ${card.status}">${getStatusText(card.status)}</span>
            </div>
            <div class="card-body">
                <p><strong>Content Type:</strong> ${card.contentType || 'Blog Post'}</p>
                <p><strong>Category:</strong> ${card.category || 'Uncategorized'}</p>
                <p><strong>Schedule:</strong> ${card.scheduleText || 'Unknown'}</p>
                <p><strong>Topics:</strong> ${card.topics || 'None specified'}</p>
            </div>
            <div class="card-footer">
                <button class="btn-cancel" data-path-id="${card.pathId}">Cancel</button>
                <button class="btn-view-details" data-path-id="${card.pathId}">View Details</button>
            </div>
        `;
        
        // Add event listeners
        cardElement.querySelector('.btn-cancel').addEventListener('click', function() {
            cancelAutomationPath(card.pathId);
        });
        
        cardElement.querySelector('.btn-view-details').addEventListener('click', function() {
            viewAutomationPathDetails(card.pathId);
        });
        
        // Add to container
        container.appendChild(cardElement);
        
        return cardElement;
    }
    
    /**
     * Set up mutation observer to detect when cards are added or removed
     */
    function setupMutationObserver() {
        // Create a mutation observer to watch for changes to the status cards container
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // If cards were added
                    if (mutation.addedNodes.length > 0) {
                        Array.from(mutation.addedNodes).forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                node.classList.contains('automation-status-card')) {
                                // Extract card data
                                const cardData = extractCardData(node);
                                if (cardData) {
                                    // Add to our status cards if not already there
                                    const existingIndex = statusCards.findIndex(c => c.pathId === cardData.pathId);
                                    if (existingIndex !== -1) {
                                        statusCards[existingIndex] = cardData;
                                    } else {
                                        statusCards.push(cardData);
                                    }
                                    saveStatusCards();
                                }
                            }
                        });
                    }
                    
                    // If cards were removed
                    if (mutation.removedNodes.length > 0) {
                        Array.from(mutation.removedNodes).forEach(function(node) {
                            if (node.nodeType === Node.ELEMENT_NODE && 
                                node.classList.contains('automation-status-card')) {
                                // Get the path ID
                                const pathId = node.dataset.pathId;
                                if (pathId) {
                                    // Remove from our status cards
                                    const existingIndex = statusCards.findIndex(c => c.pathId === pathId);
                                    if (existingIndex !== -1) {
                                        // Only remove if status is 'completed' or 'cancelled'
                                        const status = statusCards[existingIndex].status;
                                        if (status === 'completed' || status === 'cancelled') {
                                            statusCards.splice(existingIndex, 1);
                                            saveStatusCards();
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        });
        
        // Start observing
        const container = ensureStatusCardsContainer();
        observer.observe(container, { childList: true, subtree: true });
        
        console.log('Direct Status Fix: Set up mutation observer');
    }
    
    /**
     * Extract card data from a card element
     */
    function extractCardData(cardElement) {
        try {
            const pathId = cardElement.dataset.pathId;
            if (!pathId) return null;
            
            const header = cardElement.querySelector('.card-header');
            const statusBadge = header ? header.querySelector('.status-badge') : null;
            const cardBody = cardElement.querySelector('.card-body');
            
            return {
                pathId: pathId,
                name: header ? header.querySelector('h3').textContent : 'Unnamed Path',
                status: statusBadge ? statusBadge.className.replace('status-badge', '').trim() : 'unknown',
                contentType: getCardBodyValue(cardBody, 'Content Type'),
                category: getCardBodyValue(cardBody, 'Category'),
                scheduleText: getCardBodyValue(cardBody, 'Schedule'),
                topics: getCardBodyValue(cardBody, 'Topics'),
                timestamp: new Date().toISOString()
            };
        } catch (e) {
            console.error('Direct Status Fix: Error extracting card data', e);
            return null;
        }
    }
    
    /**
     * Get a value from a card body element
     */
    function getCardBodyValue(cardBody, label) {
        if (!cardBody) return '';
        
        const paragraphs = cardBody.querySelectorAll('p');
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const strong = p.querySelector('strong');
            if (strong && strong.textContent.includes(label)) {
                return p.textContent.replace(strong.textContent, '').trim();
            }
        }
        
        return '';
    }
    
    /**
     * Set up periodic check for scheduled tasks
     */
    function setupPeriodicCheck() {
        // Check every minute
        setInterval(function() {
            console.log('Direct Status Fix: Running periodic check');
            checkAutomationPaths();
        }, 60000);
        
        // Run an initial check
        setTimeout(checkAutomationPaths, 5000);
    }
    
    /**
     * Check automation paths for scheduled tasks
     */
    function checkAutomationPaths() {
        try {
            // Get automation paths from storage
            let paths = [];
            try {
                paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
            } catch (e) {
                console.error('Direct Status Fix: Error parsing paths', e);
                return;
            }
            
            // Check each path
            const now = new Date();
            
            paths.forEach(function(path) {
                // Skip paths that are not scheduled or active
                if (!path.schedule || path.status !== 'scheduled' || path.active === false) {
                    return;
                }
                
                // Ensure the path has a next execution time
                if (!path.schedule.nextExecution) {
                    // Calculate next execution time
                    path.schedule.nextExecution = calculateNextExecutionTime(path.schedule);
                }
                
                // Check if it's time to execute
                const nextExecution = new Date(path.schedule.nextExecution);
                if (nextExecution <= now) {
                    console.log(`Direct Status Fix: Time to execute path ${path.id}`);
                    
                    // Create a status card for this path
                    createStatusCard(path);
                    
                    // Try to execute the path
                    if (typeof window.executeAutomationPath === 'function') {
                        window.executeAutomationPath(path.id);
                    }
                }
            });
        } catch (e) {
            console.error('Direct Status Fix: Error checking automation paths', e);
        }
    }
    
    /**
     * Create a status card for a path
     */
    function createStatusCard(path) {
        // Check if a card already exists for this path
        const existingIndex = statusCards.findIndex(c => c.pathId === path.id);
        if (existingIndex !== -1) {
            // Update existing card
            statusCards[existingIndex].status = path.status || 'executing';
            statusCards[existingIndex].timestamp = new Date().toISOString();
        } else {
            // Create new card
            statusCards.push({
                pathId: path.id,
                name: path.name || 'Unnamed Path',
                status: path.status || 'executing',
                contentType: path.contentType || 'Blog Post',
                category: path.category || 'Uncategorized',
                scheduleText: getScheduleText(path.schedule),
                topics: path.topics || 'None specified',
                timestamp: new Date().toISOString()
            });
        }
        
        // Save status cards
        saveStatusCards();
        
        // Restore status cards to update the UI
        restoreStatusCards();
    }
    
    /**
     * Get schedule text for a schedule object
     */
    function getScheduleText(schedule) {
        if (!schedule) return 'One-time';
        
        let frequencyText = 'Unknown';
        switch (schedule.frequency) {
            case 'daily':
                frequencyText = 'Daily';
                break;
            case 'every2days':
                frequencyText = 'Every 2 Days';
                break;
            case 'weekly':
                frequencyText = 'Weekly';
                break;
            case 'biweekly':
                frequencyText = 'Bi-Weekly';
                break;
            case 'monthly':
                frequencyText = 'Monthly';
                break;
            default:
                frequencyText = schedule.frequency || 'One-time';
        }
        
        const timeText = schedule.time ? formatTimeForDisplay(schedule.time) : '12:00 PM';
        
        return `${frequencyText} at ${timeText}`;
    }
    
    /**
     * Format time for display (12-hour with AM/PM)
     */
    function formatTimeForDisplay(timeStr) {
        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert 0 to 12
            
            return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
        } catch (e) {
            console.error('Direct Status Fix: Error formatting time', e);
            return timeStr;
        }
    }
    
    /**
     * Calculate the next execution time based on schedule
     */
    function calculateNextExecutionTime(schedule) {
        const now = new Date();
        let [hours, minutes] = [12, 0]; // Default to noon
        
        // Parse time if available
        if (schedule.time) {
            const timeParts = schedule.time.split(':').map(Number);
            if (timeParts.length === 2) {
                [hours, minutes] = timeParts;
            }
        }
        
        // Set time to the specified hours and minutes
        const nextExecution = new Date(now);
        nextExecution.setHours(hours, minutes, 0, 0);
        
        // If the time has already passed today, move to the next occurrence
        if (nextExecution <= now) {
            switch (schedule.frequency) {
                case 'daily':
                    // Move to tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 1);
                    break;
                    
                case 'every2days':
                    // Move to day after tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 2);
                    break;
                    
                case 'weekly':
                    // Move to next week
                    nextExecution.setDate(nextExecution.getDate() + 7);
                    break;
                    
                case 'biweekly':
                    // Move to two weeks later
                    nextExecution.setDate(nextExecution.getDate() + 14);
                    break;
                    
                case 'monthly':
                    // Move to next month
                    nextExecution.setMonth(nextExecution.getMonth() + 1);
                    break;
                    
                default:
                    // Default to tomorrow
                    nextExecution.setDate(nextExecution.getDate() + 1);
            }
        }
        
        return nextExecution.toISOString();
    }
    
    /**
     * Cancel an automation path
     */
    function cancelAutomationPath(pathId) {
        console.log(`Direct Status Fix: Cancelling automation path ${pathId}`);
        
        // Update the status card
        const existingIndex = statusCards.findIndex(c => c.pathId === pathId);
        if (existingIndex !== -1) {
            statusCards[existingIndex].status = 'cancelled';
            statusCards[existingIndex].timestamp = new Date().toISOString();
            saveStatusCards();
        }
        
        // Restore status cards to update the UI
        restoreStatusCards();
        
        // Try to cancel the path in the main system
        try {
            // Get automation paths from storage
            let paths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
            
            // Find the path
            const pathIndex = paths.findIndex(p => p.id === pathId);
            if (pathIndex !== -1) {
                // Update the path
                paths[pathIndex].status = 'cancelled';
                paths[pathIndex].active = false;
                
                // Save back to storage
                localStorage.setItem('aiAutomationPaths', JSON.stringify(paths));
                
                // Update the global automationPaths variable if it exists
                if (typeof window.automationPaths !== 'undefined') {
                    window.automationPaths = paths;
                }
            }
        } catch (e) {
            console.error('Direct Status Fix: Error cancelling path in main system', e);
        }
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('Automation path cancelled successfully', 'success');
        }
    }
    
    /**
     * View details of an automation path
     */
    function viewAutomationPathDetails(pathId) {
        console.log(`Direct Status Fix: Viewing details for path ${pathId}`);
        
        // Find the card
        const card = statusCards.find(c => c.pathId === pathId);
        if (!card) {
            console.error(`Direct Status Fix: Card not found for path ${pathId}`);
            return;
        }
        
        // If there's a built-in view function, use it
        if (typeof window.viewAutomationPathDetails === 'function') {
            window.viewAutomationPathDetails(pathId);
            return;
        }
        
        // Otherwise create a simple modal
        let modal = document.querySelector('#path-details-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'path-details-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Automation Path Details</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <h3>${card.name}</h3>
                    <p><strong>Status:</strong> <span class="status-badge ${card.status}">${getStatusText(card.status)}</span></p>
                    <p><strong>Content Type:</strong> ${card.contentType}</p>
                    <p><strong>Category:</strong> ${card.category}</p>
                    <p><strong>Schedule:</strong> ${card.scheduleText}</p>
                    <p><strong>Topics:</strong> ${card.topics}</p>
                    <p><strong>Last Updated:</strong> ${formatDate(card.timestamp)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-close">Close</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.btn-close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Show the modal
        modal.style.display = 'block';
    }
    
    /**
     * Get human-readable status text
     */
    function getStatusText(status) {
        switch (status) {
            case 'scheduled': return 'Scheduled';
            case 'queued': return 'Queued';
            case 'executing': return 'Executing';
            case 'completed': return 'Completed';
            case 'failed': return 'Failed';
            case 'cancelled': return 'Cancelled';
            default: return 'Unknown';
        }
    }
    
    /**
     * Format date for display
     */
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        try {
            const date = new Date(dateStr);
            return date.toLocaleString();
        } catch (e) {
            return dateStr;
        }
    }
    
    // Add some basic styles for the status cards
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .automation-status-cards {
                margin-top: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
            }
            
            .automation-status-card {
                background-color: #2a2a2a;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .automation-status-card .card-header {
                background-color: #333;
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .automation-status-card .card-header h3 {
                margin: 0;
                font-size: 16px;
                color: #fff;
            }
            
            .automation-status-card .card-body {
                padding: 15px;
                color: #ccc;
            }
            
            .automation-status-card .card-body p {
                margin: 8px 0;
                font-size: 14px;
            }
            
            .automation-status-card .card-footer {
                padding: 12px 15px;
                background-color: #333;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .automation-status-card .btn-cancel,
            .automation-status-card .btn-view-details {
                padding: 6px 12px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-size: 14px;
            }
            
            .automation-status-card .btn-cancel {
                background-color: #d32f2f;
                color: white;
            }
            
            .automation-status-card .btn-view-details {
                background-color: #2196f3;
                color: white;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }
            
            .status-badge.scheduled {
                background-color: #2196f3;
            }
            
            .status-badge.queued {
                background-color: #ff9800;
            }
            
            .status-badge.executing {
                background-color: #9c27b0;
            }
            
            .status-badge.completed {
                background-color: #4caf50;
            }
            
            .status-badge.failed {
                background-color: #f44336;
            }
            
            .status-badge.cancelled {
                background-color: #9e9e9e;
            }
            
            /* Modal styles */
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 1000;
            }
            
            .modal-content {
                background-color: #2a2a2a;
                margin: 10% auto;
                padding: 0;
                width: 80%;
                max-width: 600px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                padding: 15px;
                background-color: #333;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 18px;
            }
            
            .modal-body {
                padding: 20px;
                color: #ccc;
            }
            
            .modal-footer {
                padding: 15px;
                background-color: #333;
                display: flex;
                justify-content: flex-end;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
            
            .close-btn {
                color: white;
                background: transparent;
                border: none;
                font-size: 20px;
                cursor: pointer;
            }
            
            .btn-close {
                padding: 8px 16px;
                background-color: #2196f3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Add styles when the script loads
    addStyles();
})();
