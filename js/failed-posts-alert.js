/**
 * Failed Posts Alert System
 * Shows alerts and popups for failed automation posts
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFailedPostsAlert();
    
    // Listen for real-time failed post events
    window.addEventListener('automationPostFailed', handleFailedPostEvent);
});

/**
 * Initialize the failed posts alert system
 */
async function initFailedPostsAlert() {
    // Check for pending failed posts on load
    await checkForFailedPosts();
    
    // Check periodically (every 5 minutes)
    setInterval(checkForFailedPosts, 5 * 60 * 1000);
}

/**
 * Check for pending failed posts from API
 */
async function checkForFailedPosts() {
    try {
        const response = await fetch('/api/automation/failed-posts?status=pending');
        if (!response.ok) return;
        
        const data = await response.json();
        const pendingCount = data.pendingCount || 0;
        
        // Update badge on dashboard
        updateFailedPostsBadge(pendingCount);
        
        // Show popup if there are new failures
        if (pendingCount > 0 && data.failedPosts?.length > 0) {
            // Check if we've already shown alert for these
            const lastAlertTime = localStorage.getItem('lastFailedPostAlertTime') || 0;
            const latestFailure = data.failedPosts[0]?.created_at || 0;
            
            if (latestFailure > lastAlertTime) {
                showFailedPostsPopup(data.failedPosts);
                localStorage.setItem('lastFailedPostAlertTime', Date.now().toString());
            }
        }
    } catch (error) {
        console.error('Error checking failed posts:', error);
    }
}

/**
 * Handle real-time failed post events
 */
function handleFailedPostEvent(event) {
    const { pathId, pathName, reason, details } = event.detail;
    
    // Show immediate notification
    showFailedPostNotification(pathName, reason);
    
    // Update badge
    checkForFailedPosts();
}

/**
 * Update the failed posts badge count
 */
function updateFailedPostsBadge(count) {
    // Try to find or create badge element
    let badge = document.getElementById('failed-posts-badge');
    
    if (!badge) {
        // Try to add badge to Scheduled Posts section header
        const scheduledHeader = document.querySelector('#scheduled-posts-section h3, .scheduled-posts-header');
        if (scheduledHeader) {
            badge = document.createElement('span');
            badge.id = 'failed-posts-badge';
            badge.className = 'failed-posts-badge';
            badge.style.cssText = `
                background: #e74c3c;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin-left: 10px;
                display: ${count > 0 ? 'inline-block' : 'none'};
            `;
            scheduledHeader.appendChild(badge);
        }
    }
    
    if (badge) {
        badge.textContent = count > 0 ? `${count} Failed` : '';
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

/**
 * Show a quick notification for a failed post
 */
function showFailedPostNotification(pathName, reason) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'failed-post-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e2127;
            border: 1px solid #e74c3c;
            border-left: 4px solid #e74c3c;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: start; gap: 12px;">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 20px; margin-top: 2px;"></i>
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #e74c3c; font-size: 14px;">Post Publication Failed</h4>
                    <p style="margin: 0 0 5px 0; color: #fff; font-size: 13px;"><strong>${pathName}</strong></p>
                    <p style="margin: 0; color: #aaa; font-size: 12px;">${reason}</p>
                </div>
                <button onclick="this.closest('.failed-post-notification').remove()" style="
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 0;
                    margin-left: auto;
                ">&times;</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        notification.remove();
    }, 10000);
}

/**
 * Show popup with all failed posts
 */
function showFailedPostsPopup(failedPosts) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('failed-posts-popup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'failed-posts-popup';
    popup.innerHTML = `
        <div class="failed-posts-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div class="failed-posts-modal" style="
                background: #1e2127;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            ">
                <div style="
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                ">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: white;"></i>
                    <div>
                        <h3 style="margin: 0; color: white; font-size: 18px;">Failed Automation Posts</h3>
                        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">
                            ${failedPosts.length} post(s) failed to publish
                        </p>
                    </div>
                    <button onclick="document.getElementById('failed-posts-popup').remove()" style="
                        margin-left: auto;
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">&times;</button>
                </div>
                
                <div style="padding: 20px; overflow-y: auto; max-height: 50vh;">
                    ${failedPosts.map(post => `
                        <div style="
                            background: #2a2e36;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 12px;
                            border-left: 3px solid #e74c3c;
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                <h4 style="margin: 0; color: #e8f24c; font-size: 14px;">${post.path_name || 'Unknown Path'}</h4>
                                <span style="color: #888; font-size: 11px;">
                                    ${new Date(post.created_at).toLocaleDateString()} ${new Date(post.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                            <p style="margin: 0 0 8px 0; color: #fff; font-size: 13px;">
                                <i class="fas fa-exclamation-triangle" style="color: #e74c3c; margin-right: 6px;"></i>
                                ${post.reason}
                            </p>
                            ${post.details ? `
                                <p style="margin: 0; color: #888; font-size: 12px; font-style: italic;">
                                    ${post.details}
                                </p>
                            ` : ''}
                            <div style="margin-top: 10px; display: flex; gap: 8px;">
                                <button onclick="dismissFailedPost('${post.id}')" style="
                                    background: #3a3f48;
                                    border: none;
                                    color: #aaa;
                                    padding: 6px 12px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">Dismiss</button>
                                <button onclick="resolveFailedPost('${post.id}')" style="
                                    background: #27ae60;
                                    border: none;
                                    color: white;
                                    padding: 6px 12px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 12px;
                                ">Mark Resolved</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="padding: 15px 20px; background: #2a2e36; border-top: 1px solid #3a3f48;">
                    <p style="margin: 0; color: #888; font-size: 12px;">
                        <i class="fas fa-info-circle" style="margin-right: 6px;"></i>
                        To fix: Upload more images to the media library or the selected folder.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

/**
 * Dismiss a failed post alert
 */
async function dismissFailedPost(postId) {
    try {
        await fetch(`/api/automation/failed-posts?id=${postId}&action=dismiss`, {
            method: 'DELETE'
        });
        
        // Refresh the popup
        const response = await fetch('/api/automation/failed-posts?status=pending');
        const data = await response.json();
        
        if (data.pendingCount > 0) {
            showFailedPostsPopup(data.failedPosts);
        } else {
            document.getElementById('failed-posts-popup')?.remove();
        }
        
        updateFailedPostsBadge(data.pendingCount);
    } catch (error) {
        console.error('Error dismissing failed post:', error);
    }
}

/**
 * Mark a failed post as resolved
 */
async function resolveFailedPost(postId) {
    try {
        await fetch(`/api/automation/failed-posts?id=${postId}&action=resolve`, {
            method: 'DELETE'
        });
        
        // Refresh the popup
        const response = await fetch('/api/automation/failed-posts?status=pending');
        const data = await response.json();
        
        if (data.pendingCount > 0) {
            showFailedPostsPopup(data.failedPosts);
        } else {
            document.getElementById('failed-posts-popup')?.remove();
        }
        
        updateFailedPostsBadge(data.pendingCount);
    } catch (error) {
        console.error('Error resolving failed post:', error);
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.failedPostsAlert = {
    checkForFailedPosts,
    showFailedPostsPopup,
    dismissFailedPost,
    resolveFailedPost
};
