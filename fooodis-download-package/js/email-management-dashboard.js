exportBtn.addEventListener('click', function() {
            try {
                console.log('Email Management: Starting subscriber export');

                const subscribers = JSON.parse(localStorage.getItem('emailSubscribers') || '[]');

                if (subscribers.length === 0) {
                    showNotification('No subscribers to export', 'warning');
                    return;
                }

                // Format data for CSV export
                const exportData = subscribers.map(subscriber => ({
                    email: subscriber.email || '',
                    signup_date: subscriber.signupDate || '',
                    status: subscriber.status || 'active',
                    source: subscriber.source || 'website'
                }));

                // Use the global export function
                if (typeof window.exportData === 'function') {
                    window.exportData('subscribers', exportData, 'email-subscribers.csv');
                } else {
                    console.error('Export function not available');
                    showNotification('Export function not available', 'error');
                }

            } catch (error) {
                console.error('Email Management: Export failed:', error);
                showNotification('Failed to export subscribers: ' + error.message, 'error');
            }
        });