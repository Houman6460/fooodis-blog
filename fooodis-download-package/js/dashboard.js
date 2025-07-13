// Export functionality with comprehensive error handling
window.exportData = function(type, data, filename) {
    try {
        console.log('Export: Starting export for type:', type);

        let exportData;
        let mimeType;
        let fileExtension;

        switch(type) {
            case 'subscribers':
            case 'leads':
            case 'conversations':
            case 'tickets':
                // CSV export for tabular data
                exportData = convertToCSV(data);
                mimeType = 'text/csv';
                fileExtension = '.csv';
                break;

            case 'automation-paths':
            case 'chatbot-config':
            case 'settings':
                // JSON export for configuration data
                exportData = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                fileExtension = '.json';
                break;

            default:
                throw new Error('Unsupported export type: ' + type);
        }

        // Create filename with timestamp if none provided
        if (!filename) {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            filename = `${type}-export-${timestamp}${fileExtension}`;
        }

        // Create and trigger download
        const blob = new Blob([exportData], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 100);

        console.log('Export: Successfully exported', filename);
        showNotification('Export completed successfully', 'success');

        return true;

    } catch (error) {
        console.error('Export: Failed to export data:', error);
        showNotification('Export failed: ' + error.message, 'error');
        return false;
    }
};

// Helper function to convert data to CSV format
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data to export');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => {
                let value = row[header] || '';
                // Escape commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    // Try to use existing notification system first
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }

    // Fallback notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}