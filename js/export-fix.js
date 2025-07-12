/**
 * Export Fix - Enhanced CSV Export with Error Handling
 * Fixes CSV download issues and provides better error reporting
 */

class ExportManager {
    constructor() {
        this.isExporting = false;
        this.exportQueue = [];
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    /**
     * Export data to CSV with enhanced error handling
     */
    async exportToCSV(data, filename = 'export.csv', options = {}) {
        if (this.isExporting) {
            console.log('Export already in progress, queuing request');
            return new Promise((resolve, reject) => {
                this.exportQueue.push({ data, filename, options, resolve, reject });
            });
        }

        this.isExporting = true;

        try {
            // Validate input data
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid or empty data provided for export');
            }

            console.log('Starting CSV export:', { filename, dataLength: data.length });

            // Convert data to CSV format
            const csvContent = this.convertToCSV(data, options);

            // Create and trigger download
            const success = await this.downloadCSV(csvContent, filename);

            if (success) {
                console.log('✅ CSV export completed successfully');
                this.showSuccessNotification(`${filename} downloaded successfully`);
                return true;
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            this.showErrorNotification(`Export failed: ${error.message}`);
            throw error;
        } finally {
            this.isExporting = false;
            this.processQueue();
        }
    }

    /**
     * Convert data array to CSV format
     */
    convertToCSV(data, options = {}) {
        const {
            delimiter = ',',
            includeHeaders = true,
            customHeaders = null,
            escapeQuotes = true
        } = options;

        if (!data || data.length === 0) {
            return '';
        }

        // Get headers
        let headers = [];
        if (customHeaders) {
            headers = customHeaders;
        } else if (includeHeaders && data[0]) {
            headers = Object.keys(data[0]);
        }

        // Build CSV content
        let csvContent = '';

        // Add headers if needed
        if (includeHeaders && headers.length > 0) {
            csvContent += headers.map(header => this.escapeCSVValue(header, delimiter, escapeQuotes)).join(delimiter) + '\n';
        }

        // Add data rows
        data.forEach(row => {
            const values = headers.length > 0 ? headers.map(header => row[header] || '') : Object.values(row);
            csvContent += values.map(value => this.escapeCSVValue(value, delimiter, escapeQuotes)).join(delimiter) + '\n';
        });

        return csvContent;
    }

    /**
     * Escape CSV values to handle special characters
     */
    escapeCSVValue(value, delimiter = ',', escapeQuotes = true) {
        if (value === null || value === undefined) {
            return '';
        }

        let stringValue = String(value);

        // Check if escaping is needed
        const needsEscaping = stringValue.includes(delimiter) || 
                             stringValue.includes('\n') || 
                             stringValue.includes('\r') || 
                             stringValue.includes('"');

        if (needsEscaping) {
            if (escapeQuotes) {
                stringValue = stringValue.replace(/"/g, '""');
            }
            stringValue = `"${stringValue}"`;
        }

        return stringValue;
    }

    /**
     * Download CSV content as file with multiple fallback methods
     */
    async downloadCSV(csvContent, filename) {
        try {
            console.log(`Attempting to download ${filename} (${csvContent.length} characters)`);
            
            // Validate CSV content
            if (!csvContent || csvContent.trim().length === 0) {
                throw new Error('CSV content is empty');
            }

            // Method 1: Standard blob download
            console.log('Trying blob download...');
            if (this.tryBlobDownload(csvContent, filename)) {
                console.log('✅ Blob download successful');
                return true;
            }

            // Method 2: Data URL fallback
            console.log('Trying data URL download...');
            if (this.tryDataURLDownload(csvContent, filename)) {
                console.log('✅ Data URL download successful');
                return true;
            }

            // Method 3: Copy to clipboard as fallback
            console.log('Trying clipboard copy...');
            const clipboardResult = await this.tryCopyToClipboard(csvContent, filename);
            if (clipboardResult) {
                console.log('✅ Content copied to clipboard');
                return true;
            }

            // Method 4: Force download with user interaction
            console.log('Trying force download...');
            if (this.tryForceDownload(csvContent, filename)) {
                console.log('✅ Force download initiated');
                return true;
            }

            throw new Error('All download methods failed - please check browser permissions');
        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showErrorNotification(`Download failed: ${error.message}. Try allowing downloads in your browser settings.`);
            return false;
        }
    }

    /**
     * Try copying content to clipboard as fallback
     */
    async tryCopyToClipboard(csvContent, filename) {
        try {
            console.log('Attempting clipboard copy...');

            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                console.warn('Clipboard API not available');
                return false;
            }

            const BOM = '\uFEFF';
            await navigator.clipboard.writeText(BOM + csvContent);

            this.showSuccessNotification(`CSV content copied to clipboard! You can paste it into a text editor and save as ${filename}`);
            return true;

        } catch (error) {
            console.error('Clipboard copy failed:', error);
            return false;
        }
    }

    /**
     * Try blob download method
     */
    tryBlobDownload(csvContent, filename) {
        try {
            // Create blob with BOM for better Excel compatibility
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { 
                type: 'text/csv;charset=utf-8;' 
            });

            // Check if blob was created successfully
            if (!blob || blob.size === 0) {
                throw new Error('Failed to create CSV blob');
            }

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Set download attributes
            link.href = url;
            link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
            link.style.display = 'none';

            // Add to DOM temporarily
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Cleanup
            setTimeout(() => {
                try {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } catch (e) {
                    console.warn('Cleanup warning:', e);
                }
            }, 100);

            return true;
        } catch (error) {
            console.error('Blob download failed:', error);
            return false;
        }
    }

    /**
     * Try data URL download method
     */
    tryDataURLDownload(csvContent, filename) {
        try {
            const BOM = '\uFEFF';
            const dataURL = 'data:text/csv;charset=utf-8,' + encodeURIComponent(BOM + csvContent);

            const link = document.createElement('a');
            link.href = dataURL;
            link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                try {
                    document.body.removeChild(link);
                } catch (e) {
                    console.warn('Cleanup warning:', e);
                }
            }, 100);

            return true;
        } catch (error) {
            console.error('Data URL download failed:', error);
            return false;
        }
    }

    /**
     * Try force download with user interaction
     */
    tryForceDownload(csvContent, filename) {
        try {
            // Open in new window as last resort
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>CSV Export</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .download-btn { 
                                    background: #007bff; 
                                    color: white; 
                                    border: none; 
                                    padding: 10px 20px; 
                                    border-radius: 4px; 
                                    cursor: pointer; 
                                    font-size: 16px;
                                    margin: 10px 0;
                                }
                                .download-btn:hover { background: #0056b3; }
                                textarea { width: 100%; height: 300px; font-family: monospace; }
                            </style>
                        </head>
                        <body>
                            <h2>CSV Export</h2>
                            <p>Click the button below to download your CSV file:</p>
                            <button class="download-btn" onclick="downloadCSV()">Download ${filename}</button>
                            <p>Or copy the content below:</p>
                            <textarea readonly>${csvContent}</textarea>
                            <script>
                                function downloadCSV() {
                                    const blob = new Blob([${JSON.stringify('\uFEFF' + csvContent)}], { type: 'text/csv;charset=utf-8;' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = '${filename}';
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                }
                            </script>
                        </body>
                    </html>
                `);
                newWindow.document.close();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Force download failed:', error);
            return false;
        }
    }

    /**
     * Process queued export requests
     */
    async processQueue() {
        if (this.exportQueue.length === 0) return;

        const { data, filename, options, resolve, reject } = this.exportQueue.shift();

        try {
            const result = await this.exportToCSV(data, filename, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.className = `export-notification export-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            ${type === 'success' ? 'background-color: #28a745;' : ''}
            ${type === 'error' ? 'background-color: #dc3545;' : ''}
            ${type === 'info' ? 'background-color: #17a2b8;' : ''}
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Create global instance
window.ExportManager = new ExportManager();

// Export functions for different data types
window.exportChatbotData = async function() {
    try {
        const conversations = JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
        const users = JSON.parse(localStorage.getItem('chatbot-users') || '[]');
        const ratings = JSON.parse(localStorage.getItem('chatbot-ratings') || '[]');

        // Prepare data for export
        const exportData = [];

        conversations.forEach(conv => {
            conv.messages.forEach(msg => {
                exportData.push({
                    conversation_id: conv.id,
                    timestamp: msg.timestamp,
                    role: msg.role,
                    content: msg.content,
                    user_id: conv.userId || 'anonymous'
                });
            });
        });

        if (exportData.length === 0) {
            window.ExportManager.showErrorNotification('No chatbot data to export');
            return;
        }

        await window.ExportManager.exportToCSV(exportData, 'chatbot-conversations.csv');
    } catch (error) {
        console.error('Failed to export chatbot data:', error);
        window.ExportManager.showErrorNotification('Failed to export chatbot data');
    }
};

// Export leads function - specifically for leads/prospects
window.exportLeads = async function() {
    try {
        console.log('Starting leads export...');
        
        // Get all possible lead sources
        const conversations = JSON.parse(localStorage.getItem('chatbot-conversations') || '[]');
        const users = JSON.parse(localStorage.getItem('chatbot-users') || '[]');
        const registrations = JSON.parse(localStorage.getItem('chatbot-registration-data') || '[]');
        const subscribers = JSON.parse(localStorage.getItem('email-subscribers') || '[]');
        
        console.log('Found data sources:', {
            conversations: conversations.length,
            users: users.length,
            registrations: registrations.length,
            subscribers: subscribers.length
        });

        const leadsData = [];
        const processedEmails = new Set();

        // Process email subscribers
        subscribers.forEach(subscriber => {
            if (subscriber.email && !processedEmails.has(subscriber.email)) {
                leadsData.push({
                    email: subscriber.email,
                    name: subscriber.name || 'Unknown',
                    source: 'Email Subscription',
                    date_captured: subscriber.timestamp || subscriber.date || new Date().toISOString(),
                    status: 'Subscribed',
                    phone: subscriber.phone || '',
                    company: subscriber.company || '',
                    notes: subscriber.interests || ''
                });
                processedEmails.add(subscriber.email);
            }
        });

        // Process chatbot registrations
        registrations.forEach(reg => {
            if (reg.email && !processedEmails.has(reg.email)) {
                leadsData.push({
                    email: reg.email,
                    name: reg.name || reg.fullName || 'Unknown',
                    source: 'Chatbot Registration',
                    date_captured: reg.timestamp || new Date().toISOString(),
                    status: 'Registered',
                    phone: reg.phone || '',
                    company: reg.company || '',
                    notes: reg.preferences || reg.message || ''
                });
                processedEmails.add(reg.email);
            }
        });

        // Process chatbot users
        users.forEach(user => {
            if (user.email && !processedEmails.has(user.email)) {
                leadsData.push({
                    email: user.email,
                    name: user.name || 'Unknown',
                    source: 'Chatbot Interaction',
                    date_captured: user.timestamp || user.createdAt || new Date().toISOString(),
                    status: 'Active',
                    phone: user.phone || '',
                    company: user.company || '',
                    notes: user.lastMessage || ''
                });
                processedEmails.add(user.email);
            }
        });

        // Process conversations for potential leads (users who provided contact info)
        conversations.forEach(conv => {
            const userMessages = conv.messages.filter(msg => msg.role === 'user');
            let email = null;
            let name = null;
            let phone = null;

            // Extract contact information from messages
            userMessages.forEach(msg => {
                const emailMatch = msg.content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
                const phoneMatch = msg.content.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
                const nameMatch = msg.content.match(/(?:my name is|i'm|i am)\s+([a-zA-Z\s]+)/i);

                if (emailMatch) email = emailMatch[0];
                if (phoneMatch) phone = phoneMatch[0];
                if (nameMatch) name = nameMatch[1].trim();
            });

            if (email && !processedEmails.has(email)) {
                leadsData.push({
                    email: email,
                    name: name || conv.userName || 'Unknown',
                    source: 'Conversation',
                    date_captured: conv.timestamp || conv.createdAt || new Date().toISOString(),
                    status: 'Prospect',
                    phone: phone || '',
                    company: '',
                    notes: `From conversation ${conv.id}`
                });
                processedEmails.add(email);
            }
        });

        console.log('Processed leads data:', leadsData.length);

        if (leadsData.length === 0) {
            window.ExportManager.showErrorNotification('No leads found to export. Leads are contacts who have provided email addresses through chatbot interactions, subscriptions, or registrations.');
            return;
        }

        // Sort by date captured (newest first)
        leadsData.sort((a, b) => new Date(b.date_captured) - new Date(a.date_captured));

        await window.ExportManager.exportToCSV(leadsData, 'leads-export.csv', {
            customHeaders: ['email', 'name', 'source', 'date_captured', 'status', 'phone', 'company', 'notes']
        });

        console.log('✅ Leads export completed successfully');
    } catch (error) {
        console.error('❌ Failed to export leads:', error);
        window.ExportManager.showErrorNotification(`Failed to export leads: ${error.message}`);
    }
};

window.exportBlogData = async function() {
    try {
        const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');

        if (posts.length === 0) {
            window.ExportManager.showErrorNotification('No blog posts to export');
            return;
        }

        // Format posts for CSV
        const exportData = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            author: post.author,
            created_date: post.date,
            status: post.status || 'published',
            views: post.views || 0,
            likes: post.likes || 0
        }));

        await window.ExportManager.exportToCSV(exportData, 'blog-posts.csv');
    } catch (error) {
        console.error('Failed to export blog data:', error);
        window.ExportManager.showErrorNotification('Failed to export blog data');
    }
};

window.exportAutomationData = async function() {
    try {
        const automationPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');

        if (automationPaths.length === 0) {
            window.ExportManager.showErrorNotification('No automation data to export');
            return;
        }

        // Format automation data for CSV
        const exportData = automationPaths.map(path => ({
            id: path.id,
            title: path.title,
            category: path.category,
            content_type: path.contentType,
            scheduled_time: path.scheduledTime,
            status: path.status || 'pending',
            created_date: path.createdDate,
            execution_count: path.executionCount || 0
        }));

        await window.ExportManager.exportToCSV(exportData, 'automation-paths.csv');
    } catch (error) {
        console.error('Failed to export automation data:', error);
        window.ExportManager.showErrorNotification('Failed to export automation data');
    }
};

// Initialize export buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add export buttons to relevant sections
    setTimeout(() => {
        addExportButtons();
    }, 2000);
});

function addExportButtons() {
    // Add export button to chatbot section
    const chatbotSection = document.getElementById('chatbot-management-section');
    if (chatbotSection && !chatbotSection.querySelector('.export-btn')) {
        const exportBtn = createExportButton('Export Chatbot Data', 'exportChatbotData');
        const leadsBtn = createExportButton('Export Leads', 'exportLeads');
        leadsBtn.style.marginLeft = '5px';
        leadsBtn.style.backgroundColor = '#28a745';
        leadsBtn.style.borderColor = '#28a745';
        
        const header = chatbotSection.querySelector('.section-header, h2, h3');
        if (header) {
            header.appendChild(exportBtn);
            header.appendChild(leadsBtn);
        }
    }

    // Add export button to blog section
    const blogSection = document.getElementById('blog-management-section');
    if (blogSection && !blogSection.querySelector('.export-btn')) {
        const exportBtn = createExportButton('Export Blog Posts', 'exportBlogData');
        const header = blogSection.querySelector('.section-header, h2, h3');
        if (header) {
            header.appendChild(exportBtn);
        }
    }

    // Add export button to automation section
    const automationSection = document.getElementById('ai-automation-section');
    if (automationSection && !automationSection.querySelector('.export-btn')) {
        const exportBtn = createExportButton('Export Automation Data', 'exportAutomationData');
        const header = automationSection.querySelector('.section-header, h2, h3');
        if (header) {
            header.appendChild(exportBtn);
        }
    }

    // Add export button to email subscribers section if it exists
    const emailSection = document.getElementById('email-management-section') || document.querySelector('[data-section="email-management"]');
    if (emailSection && !emailSection.querySelector('.export-leads-btn')) {
        const leadsBtn = createExportButton('Export Leads', 'exportLeads');
        leadsBtn.className += ' export-leads-btn';
        leadsBtn.style.backgroundColor = '#28a745';
        leadsBtn.style.borderColor = '#28a745';
        
        const header = emailSection.querySelector('.section-header, h2, h3');
        if (header) {
            header.appendChild(leadsBtn);
        }
    }
}

function createExportButton(text, functionName) {
    const button = document.createElement('button');
    button.className = 'export-btn btn btn-outline-primary btn-sm';
    button.style.cssText = `
        margin-left: 10px;
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 4px;
        cursor: pointer;
    `;
    button.textContent = text;
    button.onclick = () => {
        if (window[functionName]) {
            window[functionName]();
        }
    };
    return button;
}

console.log('✅ Export Fix loaded successfully with enhanced download methods');