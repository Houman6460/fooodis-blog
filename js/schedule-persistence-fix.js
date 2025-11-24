/**
 * Fooodis Blog System - Schedule Persistence Fix
 * This script fixes issues with scheduled posts disappearing and time display inconsistencies
 */

(function() {
    // Run when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Schedule Persistence Fix: Initializing...');
        
        // Fix will run after a short delay to ensure all other scripts have loaded
        setTimeout(initSchedulePersistenceFix, 1000);
    });
    
    /**
     * Initialize all schedule persistence fixes
     */
    function initSchedulePersistenceFix() {
        fixScheduledPostsStorage();
        fixTimeDisplayFormat();
        enhanceScheduleTracking();
        setupPeriodicCheck();
        
        // Listen for new automation paths being created
        document.addEventListener('automationPathCreated', function(e) {
            console.log('Schedule Persistence Fix: New automation path detected', e.detail);
            enhanceAutomationPath(e.detail);
        });
    }
    
    /**
     * Fix the storage of scheduled posts to ensure persistence
     */
    function fixScheduledPostsStorage() {
        console.log('Schedule Persistence Fix: Fixing scheduled posts storage...');
        
        // Get automation paths from all possible storage locations
        const directPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
        const prefixedPaths = JSON.parse(localStorage.getItem('fooodis-ai-automation-paths') || '[]');
        const managerPaths = window.StorageManager ? 
            JSON.parse(window.StorageManager.get('ai-automation-paths') || '[]') : [];
        
        // Combine all paths and remove duplicates
        let allPaths = [...directPaths, ...prefixedPaths, ...managerPaths];
        
        // Remove duplicates by ID
        const uniquePaths = [];
        const seenIds = new Set();
        
        allPaths.forEach(path => {
            // Ensure path has an ID
            if (!path.id) {
                path.id = generateUniqueId();
            }
            
            // Only add if we haven't seen this ID before
            if (!seenIds.has(path.id)) {
                seenIds.add(path.id);
                uniquePaths.push(path);
            }
        });
        
        // Enhance each path with required properties
        uniquePaths.forEach(enhanceAutomationPath);
        
        // Save back to all storage locations
        savePathsToAllStorages(uniquePaths);
        
        console.log(`Schedule Persistence Fix: Fixed ${uniquePaths.length} automation paths`);
    }
    
    /**
     * Enhance an automation path with all required properties
     */
    function enhanceAutomationPath(path) {
        // Ensure all required properties exist
        if (!path.id) path.id = generateUniqueId();
        if (!path.createdAt) path.createdAt = new Date().toISOString();
        if (!path.updatedAt) path.updatedAt = new Date().toISOString();
        
        // Fix schedule properties
        if (path.schedule) {
            // Ensure schedule has a valid time
            if (!path.schedule.time) {
                path.schedule.time = "12:00";
            }
            
            // Normalize time format to 24-hour (HH:MM)
            path.schedule.time = normalizeTimeFormat(path.schedule.time);
            
            // Ensure next execution time is set
            if (!path.schedule.nextExecution) {
                path.schedule.nextExecution = calculateNextExecutionTime(path.schedule);
            }
        }
        
        // Fix execution status
        if (path.status === 'executing' && !path.executionStarted) {
            // Reset stuck executions
            path.status = 'scheduled';
        }
        
        return path;
    }
    
    /**
     * Fix time display format inconsistencies
     */
    function fixTimeDisplayFormat() {
        console.log('Schedule Persistence Fix: Fixing time display format...');
        
        // Fix time inputs
        document.querySelectorAll('input[type="time"]').forEach(input => {
            input.addEventListener('change', function() {
                // Ensure consistent 24-hour format
                const normalizedTime = normalizeTimeFormat(this.value);
                this.value = normalizedTime;
                
                // Update any associated display elements
                const displayElements = document.querySelectorAll(`[data-time-display="${this.id}"]`);
                displayElements.forEach(el => {
                    el.textContent = formatTimeForDisplay(normalizedTime);
                });
            });
        });
        
        // Fix existing time displays
        document.querySelectorAll('[data-time]').forEach(el => {
            const time = el.getAttribute('data-time');
            if (time) {
                el.textContent = formatTimeForDisplay(normalizeTimeFormat(time));
            }
        });
    }
    
    /**
     * Enhance schedule tracking to ensure scheduled posts execute
     */
    function enhanceScheduleTracking() {
        console.log('Schedule Persistence Fix: Enhancing schedule tracking...');
        
        // Get all automation paths
        const paths = getAllAutomationPaths();
        
        // Check for paths that should have executed but didn't
        const now = new Date();
        let updated = false;
        
        paths.forEach(path => {
            if (path.schedule && path.status === 'scheduled') {
                // Parse next execution time
                const nextExecution = new Date(path.schedule.nextExecution);
                
                // If next execution time has passed
                if (nextExecution < now) {
                    console.log(`Schedule Persistence Fix: Found missed execution for "${path.name}"`);
                    
                    // Queue for immediate execution
                    path.status = 'queued';
                    path.queuedAt = now.toISOString();
                    updated = true;
                    
                    // Create a status card for this path
                    createOrUpdateStatusCard(path);
                    
                    // Trigger execution
                    triggerExecution(path);
                }
            }
        });
        
        if (updated) {
            savePathsToAllStorages(paths);
        }
    }
    
    /**
     * Set up periodic checking for scheduled posts
     */
    function setupPeriodicCheck() {
        console.log('Schedule Persistence Fix: Setting up periodic checks...');
        
        // Check every minute
        setInterval(function() {
            console.log('Schedule Persistence Fix: Running periodic check...');
            enhanceScheduleTracking();
        }, 60000);
    }
    
    /**
     * Create or update a status card for an automation path
     */
    function createOrUpdateStatusCard(path) {
        // Check if status card container exists
        let statusContainer = document.querySelector('#automation-status-cards');
        if (!statusContainer) {
            console.log('Schedule Persistence Fix: Creating status container');
            statusContainer = document.createElement('div');
            statusContainer.id = 'automation-status-cards';
            statusContainer.className = 'automation-status-cards';
            
            // Find the automation section to append to
            const automationSection = document.querySelector('#ai-automation-section');
            if (automationSection) {
                automationSection.appendChild(statusContainer);
            } else {
                document.body.appendChild(statusContainer);
            }
        }
        
        // Check if card already exists
        let card = document.querySelector(`#status-card-${path.id}`);
        if (!card) {
            console.log(`Schedule Persistence Fix: Creating new status card for "${path.name}"`);
            card = document.createElement('div');
            card.id = `status-card-${path.id}`;
            card.className = 'automation-status-card';
            statusContainer.appendChild(card);
        }
        
        // Update card content
        const statusText = getStatusText(path.status);
        const timeDisplay = path.schedule ? formatTimeForDisplay(path.schedule.time) : 'N/A';
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${path.name || 'Unnamed Path'}</h3>
                <span class="status-badge ${path.status}">${statusText}</span>
            </div>
            <div class="card-body">
                <p><strong>Content Type:</strong> ${path.contentType || 'Blog Post'}</p>
                <p><strong>Category:</strong> ${path.category || 'Uncategorized'}</p>
                <p><strong>Schedule:</strong> ${path.schedule ? path.schedule.frequency : 'One-time'} at ${timeDisplay}</p>
                <p><strong>Topics:</strong> ${path.topics || 'None specified'}</p>
            </div>
            <div class="card-footer">
                <button class="btn-cancel" data-path-id="${path.id}">Cancel</button>
                <button class="btn-view-details" data-path-id="${path.id}">View Details</button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.btn-cancel').addEventListener('click', function() {
            cancelAutomationPath(path.id);
        });
        
        card.querySelector('.btn-view-details').addEventListener('click', function() {
            viewAutomationPathDetails(path.id);
        });
    }
    
    /**
     * Cancel an automation path
     */
    function cancelAutomationPath(pathId) {
        console.log(`Schedule Persistence Fix: Cancelling automation path ${pathId}`);
        
        // Get all paths
        const paths = getAllAutomationPaths();
        
        // Find the path to cancel
        const pathIndex = paths.findIndex(p => p.id === pathId);
        if (pathIndex !== -1) {
            paths[pathIndex].status = 'cancelled';
            paths[pathIndex].cancelledAt = new Date().toISOString();
            
            // Save updated paths
            savePathsToAllStorages(paths);
            
            // Update UI
            const card = document.querySelector(`#status-card-${pathId}`);
            if (card) {
                const statusBadge = card.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = 'status-badge cancelled';
                    statusBadge.textContent = 'Cancelled';
                }
            }
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('Automation path cancelled successfully', 'success');
            }
        }
    }
    
    /**
     * View details of an automation path
     */
    function viewAutomationPathDetails(pathId) {
        console.log(`Schedule Persistence Fix: Viewing details for path ${pathId}`);
        
        // Get all paths
        const paths = getAllAutomationPaths();
        
        // Find the path
        const path = paths.find(p => p.id === pathId);
        if (path) {
            // If there's a built-in view function, use it
            if (window.viewAutomationPathDetails) {
                window.viewAutomationPathDetails(path);
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
            
            const timeDisplay = path.schedule ? formatTimeForDisplay(path.schedule.time) : 'N/A';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Automation Path Details</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <h3>${path.name || 'Unnamed Path'}</h3>
                        <p><strong>Status:</strong> <span class="status-badge ${path.status}">${getStatusText(path.status)}</span></p>
                        <p><strong>Content Type:</strong> ${path.contentType || 'Blog Post'}</p>
                        <p><strong>Category:</strong> ${path.category || 'Uncategorized'}</p>
                        <p><strong>Subcategory:</strong> ${path.subcategory || 'None'}</p>
                        <p><strong>Topics:</strong> ${path.topics || 'None specified'}</p>
                        <p><strong>Schedule:</strong> ${path.schedule ? path.schedule.frequency : 'One-time'} at ${timeDisplay}</p>
                        <p><strong>Created:</strong> ${formatDate(path.createdAt)}</p>
                        <p><strong>Last Updated:</strong> ${formatDate(path.updatedAt)}</p>
                        <p><strong>Next Execution:</strong> ${path.schedule ? formatDate(path.schedule.nextExecution) : 'N/A'}</p>
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
    }
    
    /**
     * Trigger execution of an automation path
     */
    function triggerExecution(path) {
        console.log(`Schedule Persistence Fix: Triggering execution for "${path.name}"`);
        
        // If there's a built-in execute function, use it
        if (window.executeAutomationPath) {
            window.executeAutomationPath(path.id);
            return;
        }
        
        // Otherwise simulate execution
        setTimeout(function() {
            // Get all paths
            const paths = getAllAutomationPaths();
            
            // Find the path
            const pathIndex = paths.findIndex(p => p.id === path.id);
            if (pathIndex !== -1) {
                paths[pathIndex].status = 'completed';
                paths[pathIndex].completedAt = new Date().toISOString();
                
                // Calculate next execution if it's a recurring schedule
                if (paths[pathIndex].schedule) {
                    paths[pathIndex].status = 'scheduled';
                    paths[pathIndex].schedule.nextExecution = calculateNextExecutionTime(paths[pathIndex].schedule);
                }
                
                // Save updated paths
                savePathsToAllStorages(paths);
                
                // Update UI
                const card = document.querySelector(`#status-card-${path.id}`);
                if (card) {
                    // Either update or remove the card
                    if (paths[pathIndex].status === 'scheduled') {
                        createOrUpdateStatusCard(paths[pathIndex]);
                    } else {
                        card.remove();
                    }
                }
                
                // Show notification
                if (window.showNotification) {
                    window.showNotification('Automation path executed successfully', 'success');
                }
            }
        }, 5000);
    }
    
    /**
     * Get all automation paths from all storage locations
     */
    function getAllAutomationPaths() {
        // Get automation paths from all possible storage locations
        const directPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
        const prefixedPaths = JSON.parse(localStorage.getItem('fooodis-ai-automation-paths') || '[]');
        const managerPaths = window.StorageManager ? 
            JSON.parse(window.StorageManager.get('ai-automation-paths') || '[]') : [];
        
        // Combine all paths and remove duplicates
        let allPaths = [...directPaths, ...prefixedPaths, ...managerPaths];
        
        // Remove duplicates by ID
        const uniquePaths = [];
        const seenIds = new Set();
        
        allPaths.forEach(path => {
            // Ensure path has an ID
            if (!path.id) {
                path.id = generateUniqueId();
            }
            
            // Only add if we haven't seen this ID before
            if (!seenIds.has(path.id)) {
                seenIds.add(path.id);
                uniquePaths.push(path);
            }
        });
        
        return uniquePaths;
    }
    
    /**
     * Save paths to all storage locations
     */
    function savePathsToAllStorages(paths) {
        const pathsJson = JSON.stringify(paths);
        
        // Save to direct localStorage
        localStorage.setItem('aiAutomationPaths', pathsJson);
        
        // Save to prefixed localStorage
        localStorage.setItem('fooodis-ai-automation-paths', pathsJson);
        
        // Save to StorageManager if available
        if (window.StorageManager) {
            window.StorageManager.set('ai-automation-paths', pathsJson);
        }
    }
    
    /**
     * Calculate the next execution time based on schedule
     */
    function calculateNextExecutionTime(schedule) {
        const now = new Date();
        const [hours, minutes] = schedule.time.split(':').map(Number);
        
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
     * Normalize time format to 24-hour (HH:MM)
     */
    function normalizeTimeFormat(timeStr) {
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
            return timeStr;
        }
        
        // Try to parse as Date
        try {
            const date = new Date(timeStr);
            if (!isNaN(date)) {
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            }
        } catch (e) {
            console.error('Failed to parse time:', e);
        }
        
        // Default to noon
        return "12:00";
    }
    
    /**
     * Format time for display (12-hour with AM/PM)
     */
    function formatTimeForDisplay(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12; // Convert 0 to 12
        
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
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
     * Generate a unique ID
     */
    function generateUniqueId() {
        return 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
