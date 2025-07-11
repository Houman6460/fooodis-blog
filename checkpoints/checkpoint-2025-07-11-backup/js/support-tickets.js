/**
 * Support Tickets Dashboard Management
 * Handles ticket listing, filtering, preview, and management functionality
 */

class SupportTicketsManager {
    constructor() {
        this.tickets = [];
        this.filteredTickets = [];
        this.selectedTicket = null;
        this.currentTab = 'salon';
        this.filters = {
            status: 'all',
            priority: 'all',
            search: ''
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTickets();
        this.updateTicketCounts();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Filters
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchInput = document.getElementById('ticketSearch');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value;
                this.applyFilters();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => {
                this.filters.priority = priorityFilter.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filters.search = searchInput.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Create ticket button
        const createTicketBtn = document.getElementById('createTicketBtn');
        if (createTicketBtn) {
            createTicketBtn.addEventListener('click', () => {
                this.showCreateTicketModal();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshTickets');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadTickets();
            });
        }

        // Ticket actions
        const assignBtn = document.getElementById('assignTicket');
        const tagBtn = document.getElementById('tagTicket');
        const printBtn = document.getElementById('printTicket');

        if (assignBtn) assignBtn.addEventListener('click', () => this.assignTicket());
        if (tagBtn) tagBtn.addEventListener('click', () => this.tagTicket());
        if (printBtn) printBtn.addEventListener('click', () => this.printTicket());
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        this.applyFilters();
    }

    async loadTickets() {
        try {
            const response = await fetch('/api/tickets');
            const result = await response.json();
            
            if (result.success) {
                this.tickets = result.data.tickets;
                this.applyFilters();
                this.updateTicketCounts();
            } else {
                throw new Error(result.error || 'Failed to load tickets');
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
            this.showNotification('Failed to load tickets', 'error');
            // Fallback to mock data if API fails
            this.tickets = this.getMockTickets();
            this.applyFilters();
            this.updateTicketCounts();
        }
    }

    getMockTickets() {
        return [
            {
                id: 'TKT-001',
                subject: 'Payment Processing Issue',
                description: 'Customer experiencing issues with payment processing during checkout.',
                status: 'open',
                priority: 'high',
                category: 'salon',
                customer: 'John Smith',
                email: 'john.smith@email.com',
                assignee: null,
                created: new Date('2024-01-15T10:30:00'),
                updated: new Date('2024-01-15T10:30:00'),
                tags: ['payment', 'urgent'],
                messages: [
                    {
                        id: 1,
                        author: 'John Smith',
                        content: 'I cannot complete my booking payment. The system keeps showing an error.',
                        timestamp: new Date('2024-01-15T10:30:00'),
                        type: 'customer'
                    }
                ]
            },
            {
                id: 'TKT-002',
                subject: 'Inventory Management Question',
                description: 'Need help setting up automated inventory alerts.',
                status: 'in-progress',
                priority: 'medium',
                category: 'supplier',
                customer: 'Sarah Johnson',
                email: 'sarah.j@company.com',
                assignee: 'Admin Team',
                created: new Date('2024-01-14T14:20:00'),
                updated: new Date('2024-01-15T09:15:00'),
                tags: ['inventory', 'setup'],
                messages: [
                    {
                        id: 1,
                        author: 'Sarah Johnson',
                        content: 'Could someone help me configure the inventory alert system?',
                        timestamp: new Date('2024-01-14T14:20:00'),
                        type: 'customer'
                    },
                    {
                        id: 2,
                        author: 'Support Team',
                        content: 'Hi Sarah, I can help you with that. Let me send you the setup guide.',
                        timestamp: new Date('2024-01-15T09:15:00'),
                        type: 'admin'
                    }
                ]
            },
            {
                id: 'TKT-003',
                subject: 'Feature Request: Mobile App',
                description: 'Request for mobile application development.',
                status: 'resolved',
                priority: 'low',
                category: 'salon',
                customer: 'Mike Wilson',
                email: 'mike.w@salon.com',
                assignee: 'Development Team',
                created: new Date('2024-01-10T16:45:00'),
                updated: new Date('2024-01-13T11:30:00'),
                tags: ['feature-request', 'mobile'],
                messages: [
                    {
                        id: 1,
                        author: 'Mike Wilson',
                        content: 'Would love to see a mobile app for easier booking management.',
                        timestamp: new Date('2024-01-10T16:45:00'),
                        type: 'customer'
                    },
                    {
                        id: 2,
                        author: 'Product Team',
                        content: 'Thanks for the suggestion! We\'ve added this to our roadmap.',
                        timestamp: new Date('2024-01-13T11:30:00'),
                        type: 'admin'
                    }
                ]
            }
        ];
    }

    applyFilters() {
        let filtered = [...this.tickets];

        // Filter by tab/category
        if (this.currentTab !== 'all') {
            filtered = filtered.filter(ticket => ticket.category === this.currentTab);
        }

        // Filter by status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === this.filters.status);
        }

        // Filter by priority
        if (this.filters.priority !== 'all') {
            filtered = filtered.filter(ticket => ticket.priority === this.filters.priority);
        }

        // Filter by search
        if (this.filters.search) {
            filtered = filtered.filter(ticket => 
                ticket.subject.toLowerCase().includes(this.filters.search) ||
                ticket.customer.toLowerCase().includes(this.filters.search) ||
                ticket.email.toLowerCase().includes(this.filters.search) ||
                ticket.description.toLowerCase().includes(this.filters.search)
            );
        }

        this.filteredTickets = filtered;
        this.renderTicketList();
    }

    renderTicketList() {
        const ticketList = document.getElementById('ticketList');
        if (!ticketList) return;

        if (this.filteredTickets.length === 0) {
            ticketList.innerHTML = `
                <div class="no-tickets-message">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tickets found</p>
                    <p class="sub-text">Create a new ticket or adjust your filters</p>
                </div>
            `;
            return;
        }

        const ticketsHtml = this.filteredTickets.map(ticket => this.renderTicketItem(ticket)).join('');
        ticketList.innerHTML = ticketsHtml;

        // Add click listeners to ticket items
        ticketList.querySelectorAll('.ticket-item').forEach(item => {
            item.addEventListener('click', () => {
                const ticketId = item.dataset.ticketId;
                this.selectTicket(ticketId);
            });
        });
    }

    renderTicketItem(ticket) {
        const timeAgo = this.getTimeAgo(ticket.updated);
        
        return `
            <div class="ticket-item" data-ticket-id="${ticket.id}">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-status ${ticket.status}">${ticket.status}</span>
                </div>
                <div class="ticket-subject">${ticket.subject}</div>
                <div class="ticket-meta">
                    <div class="ticket-customer">${ticket.customer}</div>
                    <div class="ticket-priority">
                        <span class="priority-indicator ${ticket.priority}"></span>
                        ${ticket.priority}
                    </div>
                </div>
                <div class="ticket-meta">
                    <span class="ticket-time">${timeAgo}</span>
                    <span class="ticket-category">${ticket.category}</span>
                </div>
            </div>
        `;
    }

    selectTicket(ticketId) {
        // Update selected state
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.ticketId === ticketId) {
                item.classList.add('selected');
            }
        });

        this.selectedTicket = this.tickets.find(ticket => ticket.id === ticketId);
        this.renderTicketPreview();
    }

    renderTicketPreview() {
        const previewContent = document.getElementById('ticketPreview');
        if (!previewContent || !this.selectedTicket) return;

        const ticket = this.selectedTicket;
        const createdDate = this.formatDate(ticket.created);
        const updatedDate = this.formatDate(ticket.updated);

        previewContent.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-details-header">
                    <div>
                        <div class="ticket-title">${ticket.subject}</div>
                        <div class="ticket-id">${ticket.id}</div>
                    </div>
                    <span class="ticket-status ${ticket.status}">${ticket.status}</span>
                </div>

                <div class="ticket-info">
                    <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">${ticket.customer}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${ticket.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Priority</div>
                        <div class="info-value">
                            <span class="priority-indicator ${ticket.priority}"></span>
                            ${ticket.priority}
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Category</div>
                        <div class="info-value">${ticket.category}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Created</div>
                        <div class="info-value">${createdDate}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Updated</div>
                        <div class="info-value">${updatedDate}</div>
                    </div>
                </div>

                ${ticket.tags && ticket.tags.length > 0 ? `
                    <div class="ticket-tags">
                        ${ticket.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="ticket-description">
                    <h4>Description</h4>
                    <p>${ticket.description}</p>
                </div>

                <div class="ticket-conversation">
                    <h4>Conversation</h4>
                    ${ticket.messages.map(message => this.renderMessage(message)).join('')}
                </div>

                <div class="reply-form">
                    <textarea class="reply-textarea" placeholder="Type your reply..."></textarea>
                    <div class="reply-actions">
                        <div class="reply-options">
                            <label class="checkbox-group">
                                <input type="checkbox" id="closeTicket"> Close ticket after reply
                            </label>
                        </div>
                        <button class="btn btn-primary" onclick="supportTickets.sendReply('${ticket.id}')">
                            Send Reply
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderMessage(message) {
        const timeStr = this.formatDate(message.timestamp);
        const isAdmin = message.type === 'admin';
        
        return `
            <div class="conversation-message ${isAdmin ? 'admin-message' : 'customer-message'}">
                <div class="message-header">
                    <span class="message-author">${message.author}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-content">${message.content}</div>
            </div>
        `;
    }

    updateTicketCounts() {
        const salonCount = this.tickets.filter(t => t.category === 'salon').length;
        const supplierCount = this.tickets.filter(t => t.category === 'supplier').length;
        const totalCount = this.tickets.length;

        const salonCountEl = document.getElementById('salon-count');
        const supplierCountEl = document.getElementById('supplier-count');
        const allCountEl = document.getElementById('all-count');

        if (salonCountEl) salonCountEl.textContent = salonCount;
        if (supplierCountEl) supplierCountEl.textContent = supplierCount;
        if (allCountEl) allCountEl.textContent = totalCount;
    }

    showCreateTicketModal() {
        // Create modal HTML
        const modalHtml = `
            <div class="ticket-modal" id="createTicketModal">
                <div class="ticket-modal-content">
                    <div class="ticket-modal-header">
                        <h3 class="ticket-modal-title">Create New Ticket</h3>
                        <button class="close-modal" onclick="supportTickets.closeCreateTicketModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="ticket-modal-body">
                        <form class="ticket-form" id="createTicketForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="ticketCategory">Category</label>
                                    <select id="ticketCategory" required>
                                        <option value="">Select category</option>
                                        <option value="salon">Salon</option>
                                        <option value="supplier">Supplier</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="ticketPriority">Priority</label>
                                    <select id="ticketPriority" required>
                                        <option value="">Select priority</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customerName">Customer Name</label>
                                    <input type="text" id="customerName" required>
                                </div>
                                <div class="form-group">
                                    <label for="customerEmail">Customer Email</label>
                                    <input type="email" id="customerEmail" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="ticketSubject">Subject</label>
                                <input type="text" id="ticketSubject" required>
                            </div>
                            <div class="form-group">
                                <label for="ticketDescription">Description</label>
                                <textarea id="ticketDescription" rows="4" required></textarea>
                            </div>
                            <div class="form-group">
                                <label for="ticketTags">Tags (comma separated)</label>
                                <input type="text" id="ticketTags" placeholder="e.g. payment, urgent, bug">
                            </div>
                        </form>
                    </div>
                    <div class="ticket-modal-footer">
                        <button class="btn btn-secondary" onclick="supportTickets.closeCreateTicketModal()">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="supportTickets.createTicket()">
                            Create Ticket
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('createTicketModal').classList.add('show');
    }

    closeCreateTicketModal() {
        const modal = document.getElementById('createTicketModal');
        if (modal) {
            modal.remove();
        }
    }

    async createTicket() {
        const form = document.getElementById('createTicketForm');
        
        const category = document.getElementById('ticketCategory').value;
        const priority = document.getElementById('ticketPriority').value;
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const subject = document.getElementById('ticketSubject').value;
        const description = document.getElementById('ticketDescription').value;
        const tags = document.getElementById('ticketTags').value;

        if (!category || !priority || !customerName || !customerEmail || !subject || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const ticketData = {
            subject,
            description,
            priority,
            category,
            customer: customerName,
            email: customerEmail,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });

            const result = await response.json();

            if (result.success) {
                this.closeCreateTicketModal();
                this.showNotification('Ticket created successfully', 'success');
                this.loadTickets(); // Reload tickets from server
            } else {
                this.showNotification(result.error || 'Failed to create ticket', 'error');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            this.showNotification('Failed to create ticket', 'error');
        }
    }

    async sendReply(ticketId) {
        const textarea = document.querySelector('.reply-textarea');
        const closeTicketCheckbox = document.getElementById('closeTicket');
        
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('Please enter a reply message', 'error');
            return;
        }

        const messageData = {
            author: 'Support Team',
            content: textarea.value.trim(),
            type: 'admin',
            closeTicket: closeTicketCheckbox && closeTicketCheckbox.checked
        };

        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            const result = await response.json();

            if (result.success) {
                textarea.value = '';
                if (closeTicketCheckbox) closeTicketCheckbox.checked = false;
                
                // Reload the ticket data to get the updated messages and status
                await this.loadTickets();
                
                // Reselect the same ticket to refresh the preview
                this.selectTicket(ticketId);
                
                this.showNotification('Reply sent successfully', 'success');
            } else {
                this.showNotification(result.error || 'Failed to send reply', 'error');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showNotification('Failed to send reply', 'error');
        }
    }

    async assignTicket() {
        if (!this.selectedTicket) {
            this.showNotification('Please select a ticket first', 'error');
            return;
        }
        
        const assignee = prompt('Enter assignee name:');
        if (assignee) {
            try {
                const response = await fetch(`/api/tickets/${this.selectedTicket.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ assignee })
                });

                const result = await response.json();

                if (result.success) {
                    await this.loadTickets();
                    this.selectTicket(this.selectedTicket.id);
                    this.showNotification('Ticket assigned successfully', 'success');
                } else {
                    this.showNotification(result.error || 'Failed to assign ticket', 'error');
                }
            } catch (error) {
                console.error('Error assigning ticket:', error);
                this.showNotification('Failed to assign ticket', 'error');
            }
        }
    }

    async tagTicket() {
        if (!this.selectedTicket) {
            this.showNotification('Please select a ticket first', 'error');
            return;
        }
        
        const tags = prompt('Enter tags (comma separated):');
        if (tags) {
            try {
                const tagArray = tags.split(',').map(tag => tag.trim());
                const response = await fetch(`/api/tickets/${this.selectedTicket.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tags: tagArray })
                });

                const result = await response.json();

                if (result.success) {
                    await this.loadTickets();
                    this.selectTicket(this.selectedTicket.id);
                    this.showNotification('Tags updated successfully', 'success');
                } else {
                    this.showNotification(result.error || 'Failed to update tags', 'error');
                }
            } catch (error) {
                console.error('Error updating tags:', error);
                this.showNotification('Failed to update tags', 'error');
            }
        }
    }

    printTicket() {
        if (!this.selectedTicket) {
            this.showNotification('Please select a ticket first', 'error');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const ticket = this.selectedTicket;
        
        const printContent = `
            <html>
                <head>
                    <title>Ticket ${ticket.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
                        .message { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Support Ticket ${ticket.id}</h1>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                    </div>
                    <div class="info-grid">
                        <div><strong>Customer:</strong> ${ticket.customer}</div>
                        <div><strong>Email:</strong> ${ticket.email}</div>
                        <div><strong>Status:</strong> ${ticket.status}</div>
                        <div><strong>Priority:</strong> ${ticket.priority}</div>
                        <div><strong>Category:</strong> ${ticket.category}</div>
                        <div><strong>Created:</strong> ${this.formatDate(ticket.created)}</div>
                    </div>
                    <div>
                        <h3>Description</h3>
                        <p>${ticket.description}</p>
                    </div>
                    <div>
                        <h3>Conversation</h3>
                        ${ticket.messages.map(msg => `
                            <div class="message">
                                <strong>${msg.author}</strong> - ${this.formatDate(msg.timestamp)}
                                <p>${msg.content}</p>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4d4f' : type === 'success' ? '#52c41a' : '#1890ff'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1100;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
}

// Initialize Support Tickets Manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('support-tickets-section')) {
        window.supportTickets = new SupportTicketsManager();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .tag {
        background: var(--primary-color);
        color: var(--secondary-color);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 5px;
        display: inline-block;
        margin-bottom: 3px;
    }
    .ticket-tags {
        margin: 15px 0;
    }
    .admin-message {
        border-left: 3px solid var(--primary-color);
    }
    .customer-message {
        border-left: 3px solid #52c41a;
    }
`;
document.head.appendChild(style);
