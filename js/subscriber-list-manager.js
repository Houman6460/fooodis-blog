/**
 * Subscriber List Manager for Fooodis Blog System
 * Manages the display and interaction with the email subscriber list
 */

class SubscriberListManager {
    constructor() {
        this.subscribers = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.init();
    }
    
    async init() {
        await this.loadSubscribers();
        this.renderSubscriberList();
        this.updateSubscriberCount();
        this.bindEvents();
        this.setupBroadcastChannel();
        
        // Set up auto-refresh to check for new subscribers every 10 seconds
        this.refreshInterval = setInterval(async () => {
            await this.loadSubscribers();
            this.renderSubscriberList();
            this.updateSubscriberCount();
        }, 10000);
        
        // Log initialization success for troubleshooting
        console.log('Subscriber List Manager initialized');
        console.log('Current subscribers:', this.subscribers.length);
    }
    
    async loadSubscribers() {
        try {
            // Load from API (cloud-based)
            const response = await fetch('/api/subscribers');
            if (response.ok) {
                const data = await response.json();
                this.subscribers = (data.subscribers || []).map(sub => ({
                    email: sub.email,
                    date: new Date(sub.subscribed_at).toISOString(),
                    status: sub.status || 'active',
                    source: sub.source || 'popup',
                    id: sub.id
                }));
                
                // Sort by date, newest first
                this.subscribers.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                
                // Calculate total pages
                this.totalPages = Math.max(1, Math.ceil(this.subscribers.length / this.itemsPerPage));
                
                // Ensure current page is valid
                if (this.currentPage > this.totalPages) {
                    this.currentPage = this.totalPages;
                }
                
                // Update stats display
                if (data.stats) {
                    const countEl = document.querySelector('.email-subscriber-count');
                    if (countEl) {
                        countEl.textContent = `${data.stats.active} Active Subscribers`;
                    }
                }
                
                console.log('Loaded', this.subscribers.length, 'subscribers from API');
            }
        } catch (error) {
            console.error('Error loading subscribers from API:', error);
            this.subscribers = [];
        }
    }
    
    renderSubscriberList() {
        const listContainer = document.querySelector('.email-list');
        if (!listContainer) return;
        
        // Clear existing content
        listContainer.innerHTML = '';
        
        if (this.subscribers.length === 0) {
            // Show no subscribers message
            listContainer.innerHTML = '<div class="no-subscribers">No subscribers found</div>';
            return;
        }
        
        // Calculate start and end index for current page
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.subscribers.length);
        
        // Create subscriber items
        for (let i = startIndex; i < endIndex; i++) {
            const subscriber = this.subscribers[i];
            const item = this.createSubscriberItem(subscriber, i);
            listContainer.appendChild(item);
        }
        
        // Update pagination display
        this.updatePagination();
    }
    
    createSubscriberItem(subscriber, index) {
        const item = document.createElement('div');
        item.className = 'email-list-item';
        item.dataset.index = index;
        
        // Format date
        const signupDate = new Date(subscriber.date);
        const formattedDate = signupDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        item.innerHTML = `
            <span class="email-address">${subscriber.email}</span>
            <span class="signup-date">${formattedDate}</span>
            <span class="status ${subscriber.status}">${subscriber.status}</span>
            <div class="actions">
                <button class="action-btn toggle-status" title="${subscriber.status === 'active' ? 'Deactivate' : 'Activate'} subscriber">
                    <i class="fas fa-${subscriber.status === 'active' ? 'toggle-on' : 'toggle-off'}"></i>
                </button>
                <button class="action-btn delete-subscriber" title="Delete subscriber">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        return item;
    }
    
    updateSubscriberCount() {
        const countElement = document.querySelector('.email-subscriber-count');
        if (!countElement) return;
        
        const activeCount = this.subscribers.filter(s => s.status === 'active').length;
        countElement.textContent = `${activeCount} Active Subscriber${activeCount !== 1 ? 's' : ''}`;
    }
    
    updatePagination() {
        const paginationElement = document.querySelector('.email-pagination span');
        if (!paginationElement) return;
        
        paginationElement.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        
        // Update pagination buttons state
        const prevButton = document.querySelector('.pagination-btn.prev-page');
        const nextButton = document.querySelector('.pagination-btn.next-page');
        
        if (prevButton) {
            prevButton.disabled = this.currentPage <= 1;
            prevButton.classList.toggle('disabled', this.currentPage <= 1);
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentPage >= this.totalPages;
            nextButton.classList.toggle('disabled', this.currentPage >= this.totalPages);
        }
    }
    
    bindEvents() {
        // Pagination
        const prevButton = document.querySelector('.pagination-btn.prev-page');
        const nextButton = document.querySelector('.pagination-btn.next-page');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderSubscriberList();
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderSubscriberList();
                }
            });
        }
        
        // Export subscribers
        const exportButton = document.querySelector('.export-btn');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportSubscribers();
            });
        }
        
        // Import subscribers
        const importButton = document.querySelector('.import-btn');
        const importFile = document.getElementById('importFile');
        
        if (importButton && importFile) {
            importButton.addEventListener('click', () => {
                importFile.click();
            });
            
            importFile.addEventListener('change', (e) => {
                this.importSubscribers(e.target.files[0]);
            });
        }
        
        // Delegate events for subscriber items (toggle status, delete)
        const listContainer = document.querySelector('.email-list');
        if (listContainer) {
            listContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.action-btn');
                if (!target) return;
                
                const item = target.closest('.email-list-item');
                if (!item) return;
                
                const index = parseInt(item.dataset.index);
                
                if (target.classList.contains('toggle-status')) {
                    this.toggleSubscriberStatus(index);
                } else if (target.classList.contains('delete-subscriber')) {
                    this.deleteSubscriber(index);
                }
            });
        }
    }
    
    toggleSubscriberStatus(index) {
        const subscriber = this.subscribers[index];
        if (!subscriber) return;
        
        subscriber.status = subscriber.status === 'active' ? 'inactive' : 'active';
        
        // Save changes
        this.saveSubscribers();
        
        // Update UI
        this.renderSubscriberList();
        this.updateSubscriberCount();
    }
    
    deleteSubscriber(index) {
        if (confirm('Are you sure you want to delete this subscriber?')) {
            this.subscribers.splice(index, 1);
            
            // Save changes
            this.saveSubscribers();
            
            // Update UI
            this.renderSubscriberList();
            this.updateSubscriberCount();
        }
    }
    
    saveSubscribers() {
        try {
            localStorage.setItem('subscriber-emails', JSON.stringify(this.subscribers));
        } catch (error) {
            console.error('Error saving subscribers:', error);
        }
    }
    
    exportSubscribers() {
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Email Address,Signup Date,Status\n';
        
        this.subscribers.forEach(subscriber => {
            const row = [
                subscriber.email,
                new Date(subscriber.date).toISOString(),
                subscriber.status
            ].join(',');
            csvContent += row + '\n';
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `fooodis-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }
    
    importSubscribers(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const rows = content.split('\n');
            
            // Skip header row
            rows.shift();
            
            const newSubscribers = [];
            rows.forEach(row => {
                if (!row.trim()) return;
                
                const [email, date, status] = row.split(',');
                if (email) {
                    newSubscribers.push({
                        email: email.trim(),
                        date: date ? date.trim() : new Date().toISOString(),
                        status: status ? status.trim() : 'active'
                    });
                }
            });
            
            if (newSubscribers.length > 0) {
                // Merge with existing subscribers (avoid duplicates)
                const emailSet = new Set(this.subscribers.map(s => s.email));
                
                newSubscribers.forEach(subscriber => {
                    if (!emailSet.has(subscriber.email)) {
                        this.subscribers.push(subscriber);
                        emailSet.add(subscriber.email);
                    }
                });
                
                // Save changes
                this.saveSubscribers();
                
                // Update UI
                this.renderSubscriberList();
                this.updateSubscriberCount();
                
                alert(`Successfully imported ${newSubscribers.length} subscribers.`);
            } else {
                alert('No valid subscribers found in the file.');
            }
        };
        
        reader.readAsText(file);
    }
    
    // Set up the BroadcastChannel for real-time updates between tabs
    setupBroadcastChannel() {
        if (window.BroadcastChannel) {
            try {
                this.broadcastChannel = new BroadcastChannel('fooodis-subscribers');
                this.broadcastChannel.onmessage = (event) => {
                    console.log('Received broadcast message:', event.data);
                    
                    if (event.data.action === 'new-subscriber') {
                        // Force an immediate refresh when a new subscriber is added in another tab
                        this.loadSubscribers();
                        this.renderSubscriberList();
                        this.updateSubscriberCount();
                        
                        // Show an alert notification
                        this.showNotification(`New subscriber added: ${event.data.email}`);
                    }
                };
                console.log('BroadcastChannel setup complete');
            } catch (e) {
                console.error('Error setting up BroadcastChannel:', e);
            }
        }
    }
    
    // Show notification alert
    showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.subscriber-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'subscriber-notification';
            document.body.appendChild(notification);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .subscriber-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: var(--primary-color, #e8f24c);
                    color: var(--secondary-color, #1e2127);
                    padding: 12px 20px;
                    border-radius: 4px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                    z-index: 9999;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                    font-size: 14px;
                    font-weight: 500;
                }
                .subscriber-notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message
        notification.textContent = message;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Method to add a subscriber programmatically (for testing)
    addSubscriber(email) {
        if (!email || !email.includes('@')) return false;
        
        // Check if email already exists
        if (this.subscribers.some(s => s.email === email)) {
            return false;
        }
        
        // Add new subscriber
        this.subscribers.push({
            email: email,
            date: new Date().toISOString(),
            status: 'active'
        });
        
        // Save changes
        this.saveSubscribers();
        
        // Update UI
        this.renderSubscriberList();
        this.updateSubscriberCount();
        
        // Broadcast the change if channel is available
        if (this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage({
                    action: 'new-subscriber',
                    email: email
                });
            } catch (e) {
                console.error('Error broadcasting new subscriber:', e);
            }
        }
        
        return true;
    }
}

// Initialize the subscriber list manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the dashboard page and the email management section exists
    if (document.querySelector('.email-management-container')) {
        window.subscriberListManager = new SubscriberListManager();
        
        // Add test subscriber method to window for debugging
        window.addTestSubscriber = (email) => {
            return window.subscriberListManager.addSubscriber(email);
        };
    }
});
