
/**
 * Export functionality fix
 * Provides immediate export capabilities for all dashboard sections
 */

console.log('Export Fix: Loading export functionality...');

// Immediate export setup
(function() {
    'use strict';
    
    // Bind export functions to existing buttons
    function bindExportButtons() {
        console.log('Export Fix: Binding export buttons');
        
        // Email subscribers export
        const emailExportBtn = document.querySelector('.export-btn');
        if (emailExportBtn && !emailExportBtn.hasAttribute('data-export-bound')) {
            emailExportBtn.setAttribute('data-export-bound', 'true');
            emailExportBtn.addEventListener('click', function(e) {
                e.preventDefault();
                exportEmailSubscribers();
            });
        }
        
        // Chatbot leads export  
        const leadsExportBtn = document.getElementById('exportLeadsBtn');
        if (leadsExportBtn && !leadsExportBtn.hasAttribute('data-export-bound')) {
            leadsExportBtn.setAttribute('data-export-bound', 'true');
            leadsExportBtn.addEventListener('click', function(e) {
                e.preventDefault();
                exportChatbotLeads();
            });
        }
        
        // Look for any other export buttons
        document.querySelectorAll('[id*="export"], [class*="export"]').forEach(btn => {
            if (btn.tagName === 'BUTTON' && !btn.hasAttribute('data-export-bound')) {
                btn.setAttribute('data-export-bound', 'true');
                btn.addEventListener('click', function(e) {
                    const btnId = btn.id || btn.className;
                    console.log('Export Fix: Generic export button clicked:', btnId);
                    
                    if (btnId.includes('lead')) {
                        exportChatbotLeads();
                    } else if (btnId.includes('subscriber')) {
                        exportEmailSubscribers();
                    } else {
                        console.log('Export Fix: Unknown export type, using generic export');
                    }
                });
            }
        });
    }
    
    // Export email subscribers
    function exportEmailSubscribers() {
        try {
            console.log('Export Fix: Exporting email subscribers');
            
            const subscribers = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');
            
            if (subscribers.length === 0) {
                alert('No subscribers to export');
                return;
            }
            
            const csvData = convertArrayToCSV(subscribers);
            downloadCSV(csvData, 'email-subscribers.csv');
            
        } catch (error) {
            console.error('Export Fix: Failed to export subscribers:', error);
            alert('Failed to export subscribers: ' + error.message);
        }
    }
    
    // Export chatbot leads
    function exportChatbotLeads() {
        try {
            console.log('Export Fix: Exporting chatbot leads');
            
            const users = JSON.parse(localStorage.getItem('chatbot_users') || '[]');
            
            if (users.length === 0) {
                alert('No leads to export');
                return;
            }
            
            const csvData = convertArrayToCSV(users);
            downloadCSV(csvData, 'chatbot-leads.csv');
            
        } catch (error) {
            console.error('Export Fix: Failed to export leads:', error);
            alert('Failed to export leads: ' + error.message);
        }
    }
    
    // Convert array to CSV
    function convertArrayToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No data to convert');
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let value = row[header] || '';
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        value = '"' + value.replace(/"/g, '""') + '"';
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
    
    // Download CSV file
    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        
        console.log('Export Fix: Successfully downloaded', filename);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindExportButtons);
    } else {
        bindExportButtons();
    }
    
    // Also try after a short delay for dynamic content
    setTimeout(bindExportButtons, 2000);
    
})();

console.log('Export Fix: Export functionality loaded successfully');
