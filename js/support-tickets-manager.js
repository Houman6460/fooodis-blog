/**
 * Support Tickets Manager
 * Central manager for support tickets with D1/R2 backend integration
 * 
 * For Admin Dashboard - manages all ticket operations
 * 
 * Integrates with:
 * - Support Tickets dashboard section
 * - Blog Statistics (ticket counts)
 * - Email system (ticket notifications)
 */

class SupportTicketsManager {
    constructor() {
        this.tickets = [];
        this.filteredTickets = [];
        this.selectedTicket = null;
        this.stats = { total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 };
        this.filters = { status: 'all', priority: 'all', category: 'all', search: '' };
        this.pagination = { total: 0, limit: 20, offset: 0 };
        this.categories = [];
        this.initialized = false;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.initialized) return;
        console.log('SupportTicketsManager: Initializing...');
        
        // Load data
        await this.loadTickets();
        await this.loadCategories();
        
        // Setup UI and events
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('SupportTicketsManager: Initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('supportTicketsReady', {
            detail: { tickets: this.tickets, stats: this.stats }
        }));
    }
    
    // ========================================
    // DATA LOADING
    // ========================================
    
    async loadTickets(options = {}) {
        const { status, priority, category, search, limit, offset } = {
            status: this.filters.status,
            priority: this.filters.priority,
            category: this.filters.category,
            search: this.filters.search,
            limit: this.pagination.limit,
            offset: options.offset !== undefined ? options.offset : this.pagination.offset,
            ...options
        };
        
        try {
            let url = `/api/tickets?limit=${limit}&offset=${offset}`;
            if (status && status !== 'all') url += `&status=${status}`;
            if (priority && priority !== 'all') url += `&priority=${priority}`;
            if (category && category !== 'all') url += `&category=${category}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.tickets = result.data.tickets || [];
                    this.stats = result.data.stats || this.stats;
                    this.pagination = result.data.pagination || { total: 0, limit, offset };
                    
                    // Update filters
                    this.filters = { status, priority, category, search };
                    
                    // Cache in localStorage
                    localStorage.setItem('support_tickets_cache', JSON.stringify({
                        tickets: this.tickets,
                        stats: this.stats,
                        timestamp: Date.now()
                    }));
                    
                    console.log(`SupportTicketsManager: Loaded ${this.tickets.length} tickets`);
                    
                    // Update UI
                    this.updateUI();
                    
                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('ticketsLoaded', {
                        detail: { tickets: this.tickets, stats: this.stats }
                    }));
                    
                    return this.tickets;
                }
            }
        } catch (error) {
            console.error('SupportTicketsManager: Error loading tickets', error);
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem('support_tickets_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.tickets = data.tickets || [];
                this.stats = data.stats || this.stats;
                this.updateUI();
            }
        } catch (e) {
            this.tickets = [];
        }
        
        return this.tickets;
    }
    
    async loadTicket(ticketId) {
        try {
            const response = await fetch(`/api/tickets/${ticketId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data;
                }
            }
        } catch (error) {
            console.error('SupportTicketsManager: Error loading ticket', error);
        }
        return null;
    }
    
    async loadCategories() {
        try {
            const response = await fetch('/api/tickets/categories');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.categories = result.data.categories || [];
                    return this.categories;
                }
            }
        } catch (error) {
            console.error('SupportTicketsManager: Error loading categories', error);
        }
        
        // Default categories
        this.categories = [
            { id: 'general', name: 'General', color: '#478ac9' },
            { id: 'technical', name: 'Technical', color: '#e74c3c' },
            { id: 'billing', name: 'Billing', color: '#27ae60' },
            { id: 'feature', name: 'Feature Request', color: '#9b59b6' },
            { id: 'feedback', name: 'Feedback', color: '#f39c12' }
        ];
        
        return this.categories;
    }
    
    // ========================================
    // TICKET OPERATIONS
    // ========================================
    
    async createTicket(ticketData) {
        console.log('SupportTicketsManager: Creating ticket', ticketData);
        
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Refresh tickets
                    await this.loadTickets({ offset: 0 });
                    
                    document.dispatchEvent(new CustomEvent('ticketCreated', {
                        detail: result.data
                    }));
                    
                    this.showNotification(`Ticket #${result.data.ticket_number} created`, 'success');
                    return result.data;
                }
            }
            
            const error = await response.json();
            throw new Error(error.error || 'Failed to create ticket');
        } catch (error) {
            console.error('SupportTicketsManager: Error creating ticket', error);
            this.showNotification('Error creating ticket: ' + error.message, 'error');
            throw error;
        }
    }
    
    async updateTicket(ticketId, updates) {
        console.log('SupportTicketsManager: Updating ticket', ticketId, updates);
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Update local array
                    const index = this.tickets.findIndex(t => t.id === ticketId || t.ticket_number === ticketId);
                    if (index !== -1) {
                        this.tickets[index] = { ...this.tickets[index], ...result.data.ticket };
                    }
                    
                    // Update selected ticket if same
                    if (this.selectedTicket?.id === ticketId) {
                        this.selectedTicket = result.data.ticket;
                    }
                    
                    this.updateUI();
                    
                    document.dispatchEvent(new CustomEvent('ticketUpdated', {
                        detail: result.data.ticket
                    }));
                    
                    this.showNotification('Ticket updated', 'success');
                    return result.data.ticket;
                }
            }
            
            const error = await response.json();
            throw new Error(error.error || 'Failed to update ticket');
        } catch (error) {
            console.error('SupportTicketsManager: Error updating ticket', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    async deleteTicket(ticketId) {
        console.log('SupportTicketsManager: Deleting ticket', ticketId);
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                this.tickets = this.tickets.filter(t => t.id !== ticketId && t.ticket_number !== ticketId);
                
                // Clear selected if same
                if (this.selectedTicket?.id === ticketId) {
                    this.selectedTicket = null;
                }
                
                this.updateUI();
                
                document.dispatchEvent(new CustomEvent('ticketDeleted', { detail: { id: ticketId } }));
                
                this.showNotification('Ticket deleted', 'success');
                return true;
            }
            
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete ticket');
        } catch (error) {
            console.error('SupportTicketsManager: Error deleting ticket', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // MESSAGE OPERATIONS
    // ========================================
    
    async sendReply(ticketId, content, options = {}) {
        console.log('SupportTicketsManager: Sending reply to', ticketId);
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    author_type: 'admin',
                    author_name: options.author_name || 'Support Team',
                    is_internal: options.is_internal || false,
                    update_status: options.close_ticket ? 'closed' : options.resolve_ticket ? 'resolved' : null
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Reload ticket to get updated messages
                    if (this.selectedTicket?.id === ticketId || this.selectedTicket?.ticket_number === ticketId) {
                        const ticketData = await this.loadTicket(ticketId);
                        if (ticketData) {
                            this.selectedTicket = ticketData.ticket;
                            this.renderTicketPreview(ticketData);
                        }
                    }
                    
                    // Refresh tickets list for updated counts
                    await this.loadTickets();
                    
                    document.dispatchEvent(new CustomEvent('ticketReplied', {
                        detail: { ticketId, message: result.data.message }
                    }));
                    
                    this.showNotification('Reply sent', 'success');
                    return result.data.message;
                }
            }
            
            const error = await response.json();
            throw new Error(error.error || 'Failed to send reply');
        } catch (error) {
            console.error('SupportTicketsManager: Error sending reply', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // UI METHODS
    // ========================================
    
    updateUI() {
        this.updateStatsDisplay();
        this.renderTicketList();
        this.updatePagination();
    }
    
    updateStatsDisplay() {
        // Update stat counters
        this.setElementText('tickets-total', this.stats.total || 0);
        this.setElementText('tickets-open', this.stats.open || 0);
        this.setElementText('tickets-in-progress', this.stats.in_progress || 0);
        this.setElementText('tickets-resolved', this.stats.resolved || 0);
        this.setElementText('tickets-closed', this.stats.closed || 0);
        
        // Update tab badges
        document.querySelectorAll('.tab-btn[data-tab]').forEach(tab => {
            const status = tab.dataset.tab;
            const badge = tab.querySelector('.tab-badge');
            if (badge && this.stats[status] !== undefined) {
                badge.textContent = this.stats[status];
            }
        });
    }
    
    renderTicketList() {
        const listContainer = document.getElementById('ticketList');
        if (!listContainer) return;
        
        if (this.tickets.length === 0) {
            listContainer.innerHTML = `
                <div class="no-tickets-message">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tickets found</p>
                    <p class="sub-text">Create a new ticket or adjust your filters</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = this.tickets.map(ticket => `
            <div class="ticket-item ${this.selectedTicket?.id === ticket.id ? 'selected' : ''}" 
                 data-ticket-id="${ticket.id}" data-ticket-number="${ticket.ticket_number}">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.ticket_number}</span>
                    <span class="ticket-status ${ticket.status}">${ticket.status}</span>
                </div>
                <div class="ticket-subject">${ticket.subject}</div>
                <div class="ticket-meta">
                    <div class="ticket-customer">${ticket.customer_name}</div>
                    <div class="ticket-priority">
                        <span class="priority-indicator ${ticket.priority}"></span>
                        ${ticket.priority}
                    </div>
                </div>
                <div class="ticket-meta">
                    <span class="ticket-time">${this.getTimeAgo(ticket.updated_at || ticket.created_at)}</span>
                    <span class="ticket-category">${ticket.category}</span>
                </div>
            </div>
        `).join('');
        
        // Attach click listeners
        listContainer.querySelectorAll('.ticket-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectTicket(item.dataset.ticketId);
            });
        });
    }
    
    async selectTicket(ticketId) {
        // Update selected state in list
        document.querySelectorAll('.ticket-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.ticketId === ticketId);
        });
        
        // Load full ticket details
        const ticketData = await this.loadTicket(ticketId);
        if (ticketData) {
            this.selectedTicket = ticketData.ticket;
            this.renderTicketPreview(ticketData);
        }
    }
    
    renderTicketPreview(ticketData) {
        const previewContainer = document.getElementById('ticketPreview');
        if (!previewContainer || !ticketData) return;
        
        const { ticket, messages, attachments } = ticketData;
        
        previewContainer.innerHTML = `
            <div class="ticket-details">
                <div class="ticket-details-header">
                    <div>
                        <div class="ticket-title">${ticket.subject}</div>
                        <div class="ticket-id">${ticket.ticket_number}</div>
                    </div>
                    <div class="ticket-actions-header">
                        <select class="status-select" data-ticket-id="${ticket.id}">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                        </select>
                    </div>
                </div>

                <div class="ticket-info">
                    <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">${ticket.customer_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${ticket.customer_email}</div>
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
                        <div class="info-value">${this.formatDate(ticket.created_at)}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Updated</div>
                        <div class="info-value">${this.formatDate(ticket.updated_at)}</div>
                    </div>
                </div>

                ${ticket.tags && ticket.tags.length > 0 ? `
                    <div class="ticket-tags">
                        ${ticket.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="ticket-conversation">
                    <h4>Conversation (${messages?.length || 0})</h4>
                    ${messages?.map(msg => this.renderMessage(msg)).join('') || '<p class="no-messages">No messages yet</p>'}
                </div>

                ${attachments && attachments.length > 0 ? `
                    <div class="ticket-attachments">
                        <h4>Attachments (${attachments.length})</h4>
                        <div class="attachments-list">
                            ${attachments.map(att => `
                                <a href="${att.r2_url}" target="_blank" class="attachment-item">
                                    <i class="fas fa-paperclip"></i>
                                    ${att.original_filename || att.filename}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="reply-form">
                    <textarea class="reply-textarea" id="replyContent" placeholder="Type your reply..."></textarea>
                    <div class="reply-actions">
                        <div class="reply-options">
                            <label class="checkbox-group">
                                <input type="checkbox" id="closeAfterReply"> Close after reply
                            </label>
                        </div>
                        <button class="btn btn-primary send-reply-btn" data-ticket-id="${ticket.id}">
                            <i class="fas fa-paper-plane"></i> Send Reply
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.attachPreviewListeners();
    }
    
    renderMessage(message) {
        const isAdmin = message.author_type === 'admin';
        return `
            <div class="conversation-message ${isAdmin ? 'admin-message' : 'customer-message'}">
                <div class="message-header">
                    <span class="message-author">
                        ${isAdmin ? '<i class="fas fa-user-shield"></i>' : '<i class="fas fa-user"></i>'}
                        ${message.author_name}
                    </span>
                    <span class="message-time">${this.formatDate(message.created_at)}</span>
                </div>
                <div class="message-content">${message.content}</div>
                ${message.is_internal ? '<span class="internal-badge">Internal Note</span>' : ''}
            </div>
        `;
    }
    
    attachPreviewListeners() {
        // Status change
        const statusSelect = document.querySelector('.status-select');
        if (statusSelect) {
            statusSelect.addEventListener('change', async (e) => {
                await this.updateTicket(e.target.dataset.ticketId, { status: e.target.value });
            });
        }
        
        // Send reply
        const replyBtn = document.querySelector('.send-reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', async () => {
                const content = document.getElementById('replyContent')?.value;
                const closeAfter = document.getElementById('closeAfterReply')?.checked;
                
                if (!content?.trim()) {
                    this.showNotification('Please enter a reply', 'warning');
                    return;
                }
                
                await this.sendReply(replyBtn.dataset.ticketId, content, {
                    close_ticket: closeAfter
                });
                
                // Clear textarea
                document.getElementById('replyContent').value = '';
            });
        }
    }
    
    updatePagination() {
        const paginationEl = document.querySelector('.tickets-pagination span');
        if (paginationEl) {
            const currentPage = Math.floor(this.pagination.offset / this.pagination.limit) + 1;
            const totalPages = Math.ceil(this.pagination.total / this.pagination.limit) || 1;
            paginationEl.textContent = `Page ${currentPage} of ${totalPages}`;
        }
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filters.status = statusFilter.value;
                this.loadTickets({ offset: 0 });
            });
        }
        
        // Priority filter
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => {
                this.filters.priority = priorityFilter.value;
                this.loadTickets({ offset: 0 });
            });
        }
        
        // Search
        const searchInput = document.getElementById('ticketSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = searchInput.value;
                    this.loadTickets({ offset: 0 });
                }, 300);
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshTickets');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTickets());
        }
        
        // Create ticket button
        const createBtn = document.getElementById('createTicketBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreateTicketModal());
        }
        
        // Tab switching
        document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tab = btn.dataset.tab;
                if (tab === 'all') {
                    this.filters.status = 'all';
                } else {
                    this.filters.status = tab;
                }
                this.loadTickets({ offset: 0 });
            });
        });
    }
    
    showCreateTicketModal() {
        // Create modal for new ticket
        const modal = document.createElement('div');
        modal.className = 'modal ticket-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Support Ticket</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="createTicketForm" class="modal-body">
                    <div class="form-group">
                        <label>Customer Email *</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Customer Name</label>
                        <input type="text" name="customer">
                    </div>
                    <div class="form-group">
                        <label>Subject *</label>
                        <input type="text" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label>Description *</label>
                        <textarea name="description" rows="4" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Category</label>
                            <select name="category">
                                ${this.categories.map(c => `<option value="${c.name?.toLowerCase() || c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Priority</label>
                            <select name="priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Ticket</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Submit handler
        modal.querySelector('#createTicketForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            await this.createTicket({
                email: formData.get('email'),
                customer: formData.get('customer'),
                subject: formData.get('subject'),
                description: formData.get('description'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                source: 'admin'
            });
            
            modal.remove();
        });
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    setElementText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    getTimeAgo(timestamp) {
        if (!timestamp) return '-';
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return this.formatDate(timestamp);
    }
    
    formatDate(timestamp) {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    // Public getters
    getTickets() { return this.tickets; }
    getStats() { return this.stats; }
    getSelectedTicket() { return this.selectedTicket; }
    getCategories() { return this.categories; }
}

// Initialize and expose globally
window.supportTicketsManager = new SupportTicketsManager();
window.SupportTicketsManager = SupportTicketsManager;
