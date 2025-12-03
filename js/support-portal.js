/**
 * Support Portal - Customer-facing ticket management
 */
class SupportPortal {
    constructor() {
        this.currentUser = null;
        this.customerTickets = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Public ticket form submission
        const publicTicketForm = document.getElementById('publicTicketForm');
        if (publicTicketForm) {
            publicTicketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitPublicTicket();
            });
        }

        // Main ticket form (for authenticated users)
        const ticketForm = document.getElementById('ticketForm');
        if (ticketForm) {
            ticketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAuthenticatedTicket(ticketForm);
            });
        }

        // Customer login form
        const loginForm = document.getElementById('customerLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Modal close events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeTicketModal();
            }
        });

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTicketModal();
            }
        });

        // File attachment handler
        const fileInput = document.getElementById('replyAttachments');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
        }
    }

    checkAuthStatus() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('supportPortalUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.showUserDashboard();
                this.loadUserTickets();
                this.updateUserStats();
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('supportPortalUser');
                this.showAuthRequired();
            }
        } else {
            this.showAuthRequired();
        }
    }

    getAuthToken() {
        // Try both possible storage keys for compatibility
        return localStorage.getItem('customer_token') || localStorage.getItem('supportPortalToken');
    }

    showAuthRequired() {
        // Show authentication required section, hide dashboard and ticket form
        const authSection = document.getElementById('authRequiredSection');
        const userDashboard = document.getElementById('userDashboard');
        const ticketCreation = document.getElementById('ticketCreation');
        
        if (authSection) authSection.style.display = 'block';
        if (userDashboard) userDashboard.classList.add('hidden');
        if (ticketCreation) ticketCreation.classList.add('hidden');
    }

    showUserDashboard() {
        // Hide auth required section, show user dashboard
        const authSection = document.getElementById('authRequiredSection');
        const userDashboard = document.getElementById('userDashboard');
        const ticketCreation = document.getElementById('ticketCreation');
        
        if (authSection) authSection.style.display = 'none';
        if (userDashboard) {
            userDashboard.classList.remove('hidden');
            // Update user name in dashboard
            const userName = document.getElementById('userName');
            if (userName && this.currentUser) {
                userName.textContent = this.currentUser.name || this.currentUser.email;
            }
        }
        
        // Move ticket form to dashboard if not already there
        this.moveTicketFormToDashboard();
    }

    moveTicketFormToDashboard() {
        const ticketForm = document.getElementById('ticketForm');
        const dashboardFormContainer = document.getElementById('dashboardTicketForm');
        
        if (ticketForm && dashboardFormContainer && !dashboardFormContainer.hasChildNodes()) {
            // Clone the form to the dashboard
            const formClone = ticketForm.cloneNode(true);
            formClone.id = 'dashboardTicketFormClone';
            
            // Update all field IDs to be unique for dashboard form
            const fieldsToUpdate = {
                'ticketCategory': 'dashboardTicketCategory',
                'ticketPriority': 'dashboardTicketPriority', 
                'ticketSubject': 'dashboardTicketSubject',
                'ticketDescription': 'dashboardTicketDescription'
            };
            
            // Update field IDs and corresponding labels
            Object.keys(fieldsToUpdate).forEach(oldId => {
                const field = formClone.querySelector(`#${oldId}`);
                const label = formClone.querySelector(`label[for="${oldId}"]`);
                const newId = fieldsToUpdate[oldId];
                
                if (field) {
                    field.id = newId;
                }
                if (label) {
                    label.setAttribute('for', newId);
                }
            });
            
            dashboardFormContainer.appendChild(formClone);
            
            // Add event listener to the cloned form
            formClone.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAuthenticatedTicket(formClone);
            });
        }
    }

    async submitAuthenticatedTicket(form) {
        const formData = new FormData(form);
        
        // Debug: Check if currentUser is set
        console.log('Current user state:', this.currentUser);
        
        // If currentUser is not set, try to reload from localStorage
        if (!this.currentUser) {
            const savedUser = localStorage.getItem('supportPortalUser');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    console.log('Restored user from localStorage:', this.currentUser);
                } catch (error) {
                    console.error('Error parsing saved user:', error);
                }
            }
        }
        
        // If still no currentUser, show error and return
        if (!this.currentUser) {
            this.showNotification('Please log in to submit a ticket', 'error');
            return;
        }
        
        const ticketData = {
            subject: formData.get('subject'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            customer: this.currentUser.name,
            email: this.currentUser.email,
            userId: this.currentUser.id,
            tags: ['authenticated-user']
        };

        // Validate required fields
        if (!ticketData.subject || !ticketData.description || !ticketData.priority || !ticketData.category) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.setFormLoading(form, true);
            
            console.log('Submitting ticket with data:', ticketData);
            console.log('Auth token:', this.getAuthToken());
            
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(ticketData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const result = await response.json();
            console.log('Response data:', result);

            if (result.success) {
                const ticketNum = result.data?.ticket_number || result.data?.id || 'new';
                this.showNotification(
                    `Ticket #${ticketNum} created successfully! We'll respond within 24 hours.`,
                    'success'
                );
                form.reset();
                // Refresh user tickets and stats
                await this.loadUserTickets();
                this.updateUserStats();
                // Switch to My Tickets tab
                showTab('myTickets');
            } else {
                console.error('API returned error:', result);
                throw new Error(result.error || result.message || 'Failed to create ticket');
            }
        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error stack:', error.stack);
            this.showNotification(`Error creating ticket: ${error.message}. Please try again.`, 'error');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    async loadUserTickets() {
        if (!this.currentUser) {
            console.log('No current user - cannot load tickets');
            return;
        }

        try {
            console.log('Loading tickets for user:', this.currentUser.email);
            const response = await fetch(`/api/tickets?customer=${encodeURIComponent(this.currentUser.email)}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            console.log('User tickets response status:', response.status);
            const result = await response.json();
            console.log('User tickets response data:', result);
            
            if (result.success) {
                // Fix: API returns result.data.tickets, not result.tickets
                this.customerTickets = result.data.tickets || [];
                console.log('Loaded customer tickets:', this.customerTickets.length, 'tickets');
                this.displayUserTickets();
                this.updateUserStats();
            } else {
                console.error('API returned error:', result);
                this.showNotification('Error loading tickets', 'error');
            }
        } catch (error) {
            console.error('Error loading user tickets:', error);
            this.showNotification('Error loading tickets', 'error');
        }
    }

    displayUserTickets() {
        const ticketsList = document.getElementById('userTicketsList');
        if (!ticketsList) return;

        if (this.customerTickets.length === 0) {
            ticketsList.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-inbox"></i>
                    <h3>No tickets found</h3>
                    <p>You haven't submitted any support tickets yet.</p>
                    <button class="btn-primary" onclick="showTab('createTicket')">
                        <i class="fas fa-plus"></i> Create Your First Ticket
                    </button>
                </div>
            `;
            return;
        }

        const ticketsHtml = this.customerTickets.map(ticket => {
            const statusClass = this.getStatusClass(ticket.status);
            const priorityClass = this.getPriorityClass(ticket.priority);
            // Support both camelCase and snake_case field names from API
            const createdAt = ticket.createdAt || ticket.created_at;
            const updatedAt = ticket.updatedAt || ticket.updated_at;
            const ticketNumber = ticket.ticket_number || ticket.id;
            const createdDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
            const lastUpdate = updatedAt ? new Date(updatedAt).toLocaleDateString() : 'N/A';
            
            return `
                <div class="ticket-card" data-ticket-id="${ticket.id}">
                    <div class="ticket-header">
                        <div class="ticket-id">#${ticketNumber}</div>
                        <div class="ticket-subject">${ticket.subject}</div>
                    </div>
                    
                    <div class="ticket-meta">
                        <span class="ticket-status ${statusClass}">${ticket.status}</span>
                        <span class="ticket-priority ${priorityClass}">${ticket.priority}</span>
                        <span class="ticket-category">${ticket.category}</span>
                    </div>
                    
                    <div class="ticket-description">
                        ${ticket.description.length > 150 ? ticket.description.substring(0, 150) + '...' : ticket.description}
                    </div>
                    
                    <div class="ticket-footer">
                        <div class="ticket-dates">
                            <span>Created: ${createdDate}</span>
                            <span>Updated: ${lastUpdate}</span>
                        </div>
                        <div class="ticket-actions">
                            <button class="btn-secondary view-details-btn" data-ticket-id="${ticket.id}">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            ${ticket.status !== 'closed' ? `
                                <button class="btn-primary reply-btn" data-ticket-id="${ticket.id}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        ticketsList.innerHTML = ticketsHtml;
        
        // Add event listeners for ticket action buttons
        this.attachTicketEventListeners();
    }

    attachTicketEventListeners() {
        // Add event listeners for View Details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const ticketId = button.getAttribute('data-ticket-id');
                console.log('View Details clicked for ticket:', ticketId);
                this.viewTicketDetails(ticketId);
            });
        });
        
        // Add event listeners for Reply buttons
        document.querySelectorAll('.reply-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const ticketId = button.getAttribute('data-ticket-id');
                console.log('Reply clicked for ticket:', ticketId);
                this.replyToTicket(ticketId);
            });
        });
    }

    updateUserStats() {
        if (!this.customerTickets) return;

        const totalTickets = this.customerTickets.length;
        const openTickets = this.customerTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
        const resolvedTickets = this.customerTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

        const totalElement = document.getElementById('totalTickets');
        const openElement = document.getElementById('openTickets');
        const resolvedElement = document.getElementById('resolvedTickets');

        if (totalElement) totalElement.textContent = totalTickets;
        if (openElement) openElement.textContent = openTickets;
        if (resolvedElement) resolvedElement.textContent = resolvedTickets;
    }

    filterUserTickets() {
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
        
        let filteredTickets = [...this.customerTickets];
        
        if (statusFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
        }
        
        if (categoryFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.category === categoryFilter);
        }
        
        // Temporarily store original tickets and display filtered
        const originalTickets = this.customerTickets;
        this.customerTickets = filteredTickets;
        this.displayUserTickets();
        this.customerTickets = originalTickets;
    }

    viewTicketDetails(ticketId) {
        console.log('viewTicketDetails called with ticketId:', ticketId);
        const ticket = this.customerTickets.find(t => t.id === ticketId);
        console.log('Found ticket:', ticket);
        if (!ticket) {
            console.error('Ticket not found:', ticketId);
            return;
        }

        this.loadTicketIntoSplitView(ticket);
    }

    loadTicketIntoSplitView(ticket) {
        console.log('loadTicketIntoSplitView called with ticket:', ticket);
        
        // Hide no-ticket-selected message
        const noTicketSelected = document.getElementById('noTicketSelected');
        const selectedTicketContent = document.getElementById('selectedTicketContent');
        
        console.log('DOM elements found:', { noTicketSelected, selectedTicketContent });
        
        if (noTicketSelected) {
            console.log('Hiding noTicketSelected');
            noTicketSelected.classList.add('hidden');
        } else {
            console.error('noTicketSelected element not found');
        }
        
        if (selectedTicketContent) {
            console.log('Showing selectedTicketContent');
            selectedTicketContent.classList.remove('hidden');
        } else {
            console.error('selectedTicketContent element not found');
        }

        // Populate ticket header info
        this.populateTicketHeader(ticket);
        
        // Load conversation history
        this.loadConversationHistory(ticket);
        
        // Setup reply form for this ticket
        this.setupReplyForm(ticket);
        
        // Store current ticket for reply functionality
        this.currentSelectedTicket = ticket;
    }

    populateTicketHeader(ticket) {
        // Update ticket subject
        const subjectEl = document.getElementById('selectedTicketSubject');
        if (subjectEl) subjectEl.textContent = ticket.subject;
        
        // Update status badge
        const statusEl = document.getElementById('selectedTicketStatus');
        if (statusEl) {
            statusEl.textContent = ticket.status;
            statusEl.className = `ticket-status-badge ${this.getStatusClass(ticket.status)}`;
        }
        
        // Update meta information
        const ticketIdEl = document.getElementById('selectedTicketId');
        if (ticketIdEl) ticketIdEl.textContent = `#${ticket.id}`;
        
        const priorityEl = document.getElementById('selectedTicketPriority');
        if (priorityEl) priorityEl.textContent = ticket.priority;
        
        const categoryEl = document.getElementById('selectedTicketCategory');
        if (categoryEl) categoryEl.textContent = ticket.category;
        
        const createdEl = document.getElementById('selectedTicketCreated');
        if (createdEl) createdEl.textContent = new Date(ticket.createdAt).toLocaleString();
        
        // Update description
        const descriptionEl = document.getElementById('selectedTicketDescription');
        if (descriptionEl) descriptionEl.innerHTML = this.escapeHtml(ticket.description);
    }
    
    loadConversationHistory(ticket) {
        const conversationEl = document.getElementById('conversationHistory');
        if (!conversationEl) return;
        
        let conversationHTML = '';
        
        if (ticket.replies && ticket.replies.length > 0) {
            conversationHTML = ticket.replies.map(reply => `
                <div class="conversation-message ${reply.isAdmin ? 'admin-message' : 'customer-message'}">
                    <div class="message-header">
                        <span class="message-sender">${reply.isAdmin ? 'Support Team' : 'You'}</span>
                        <span class="message-timestamp">${new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="message-content">${this.escapeHtml(reply.message)}</div>
                    ${reply.attachments && reply.attachments.length > 0 ? `
                        <div class="message-attachments">
                            ${reply.attachments.map(att => `
                                <a href="${att.url}" target="_blank" class="attachment-link">
                                    <i class="fas fa-paperclip"></i> ${att.filename}
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            conversationHTML = '<div class="no-replies">No replies yet. Be the first to reply!</div>';
        }
        
        conversationEl.innerHTML = conversationHTML;
    }
    
    setupReplyForm(ticket) {
        const replyForm = document.getElementById('replyForm');
        const replySection = document.getElementById('replySection');
        
        // Show/hide reply section based on ticket status
        if (ticket.status === 'closed') {
            if (replySection) replySection.classList.add('hidden');
        } else {
            if (replySection) replySection.classList.remove('hidden');
        }
        
        // Clear previous form data
        const replyMessage = document.getElementById('replyMessage');
        if (replyMessage) replyMessage.value = '';
        
        // Clear file list and reset file input
        this.clearFileList();
        const fileInput = document.getElementById('replyAttachments');
        if (fileInput) fileInput.value = '';
        
        // Setup form submission
        if (replyForm) {
            replyForm.onsubmit = (e) => {
                e.preventDefault();
                this.submitTicketReply(ticket.id);
            };
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // File attachment methods
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        const validFiles = [];
        
        for (const file of files) {
            if (file.size > maxSize) {
                this.showNotification(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length > 0) {
            this.addFilesToList(validFiles);
        }
        
        // Clear the input to allow re-selecting the same file
        event.target.value = '';
    }
    
    addFilesToList(files) {
        const filesList = document.getElementById('selectedFilesList');
        if (!filesList) return;
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'selected-file-item';
            
            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            
            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('span');
            fileSize.className = 'file-size';
            fileSize.textContent = this.formatFileSize(file.size);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-file-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => this.removeFileFromList(fileItem, file);
            
            fileInfo.appendChild(fileName);
            fileInfo.appendChild(fileSize);
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(removeBtn);
            
            // Store file reference
            fileItem._file = file;
            
            filesList.appendChild(fileItem);
        });
        
        this.updateFileListVisibility();
    }
    
    removeFileFromList(fileItem, file) {
        fileItem.remove();
        this.updateFileListVisibility();
    }
    
    clearFileList() {
        const filesList = document.getElementById('selectedFilesList');
        if (filesList) {
            filesList.innerHTML = '';
        }
        this.updateFileListVisibility();
    }
    
    updateFileListVisibility() {
        const filesList = document.getElementById('selectedFilesList');
        const container = document.getElementById('selectedFilesContainer');
        
        if (filesList && container) {
            const hasFiles = filesList.children.length > 0;
            container.style.display = hasFiles ? 'block' : 'none';
        }
    }
    
    getSelectedFiles() {
        const filesList = document.getElementById('selectedFilesList');
        if (!filesList) return [];
        
        return Array.from(filesList.children).map(item => item._file).filter(file => file);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    replyToTicket(ticketId) {
        const ticket = this.customerTickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Create and show reply modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content reply-modal">
                <div class="modal-header">
                    <h3>Reply to Ticket #${ticket.id}</h3>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="ticket-info">
                        <h4>${ticket.subject}</h4>
                        <p><strong>Status:</strong> ${ticket.status} | <strong>Priority:</strong> ${ticket.priority}</p>
                    </div>
                    <form id="replyForm">
                        <div class="form-group">
                            <label for="replyMessage">Your Reply:</label>
                            <textarea id="replyMessage" name="message" rows="6" required 
                                     placeholder="Type your reply here..."></textarea>
                        </div>
                        <input type="hidden" name="ticketId" value="${ticketId}">
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="submitReply(${ticketId})">
                        <i class="fas fa-paper-plane"></i> Send Reply
                    </button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async submitReply(ticketId) {
        const replyMessage = document.getElementById('replyMessage')?.value;
        if (!replyMessage || !replyMessage.trim()) {
            this.showNotification('Please enter a reply message', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    content: replyMessage.trim(),
                    author_type: 'customer',
                    author_email: this.currentUser.email,
                    author_name: this.currentUser.name || this.currentUser.email
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Reply sent successfully', 'success');
                // Close modal
                document.querySelector('.reply-modal')?.parentElement?.remove();
                // Refresh tickets
                this.loadUserTickets();
            } else {
                throw new Error(result.message || 'Failed to send reply');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showNotification('Error sending reply. Please try again.', 'error');
        }
    }

    handleLogout() {
        // Clear user data
        localStorage.removeItem('supportPortalUser');
        localStorage.removeItem('supportPortalToken');
        
        // Reset current user
        this.currentUser = null;
        this.customerTickets = [];
        
        // Show auth required section
        this.showAuthRequired();
        
        this.showNotification('Logged out successfully', 'success');
    }

    async submitPublicTicket() {
        const form = document.getElementById('publicTicketForm');
        const formData = new FormData(form);
        
        const ticketData = {
            subject: formData.get('subject'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            customer: formData.get('customerName'),
            email: formData.get('customerEmail'),
            tags: ['customer-portal']
        };

        // Validate required fields
        if (!ticketData.subject || !ticketData.description || !ticketData.priority || 
            !ticketData.category || !ticketData.customer || !ticketData.email) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            this.setFormLoading(form, true);
            
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(
                    `Ticket created successfully! Your ticket ID is: ${result.data.id}. We'll contact you via email.`, 
                    'success'
                );
                form.reset();
                
                // Optionally show login prompt
                setTimeout(() => {
                    this.showNotification(
                        'Want to track your tickets? Click "Login" to view your ticket history.', 
                        'info'
                    );
                }, 3000);
            } else {
                this.showNotification(result.error || 'Failed to create ticket', 'error');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            this.showNotification('Failed to create ticket. Please try again.', 'error');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Please enter both email and password', 'error');
            return;
        }

        try {
            // For demo purposes, we'll use a simple email-based auth
            // In production, this would be proper authentication
            const user = {
                email: email,
                name: email.split('@')[0],
                authenticated: true,
                loginTime: new Date().toISOString()
            };

            this.currentUser = user;
            localStorage.setItem('supportPortalUser', JSON.stringify(user));
            
            this.showNotification('Login successful!', 'success');
            this.showTicketHistory();
            this.loadCustomerTickets();
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async loadCustomerTickets() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/tickets?customer=${encodeURIComponent(this.currentUser.email)}`);
            const result = await response.json();

            if (result.success) {
                this.customerTickets = result.data.tickets.filter(ticket => 
                    ticket.email === this.currentUser.email
                );
                this.renderCustomerTickets();
            } else {
                this.showNotification('Failed to load your tickets', 'error');
            }
        } catch (error) {
            console.error('Error loading customer tickets:', error);
            this.showNotification('Failed to load tickets', 'error');
        }
    }

    renderCustomerTickets() {
        const grid = document.getElementById('customerTicketsGrid');
        if (!grid) return;

        if (this.customerTickets.length === 0) {
            grid.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-inbox"></i>
                    <h3>No tickets found</h3>
                    <p>You haven't submitted any support tickets yet.</p>
                    <button class="btn-primary" onclick="supportPortal.showTicketCreation()">
                        <i class="fas fa-plus"></i> Create Your First Ticket
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.customerTickets.map(ticket => `
            <div class="customer-ticket-card" onclick="supportPortal.viewTicketDetails('${ticket.id}')">
                <div class="ticket-card-header">
                    <div>
                        <div class="ticket-card-title">${this.escapeHtml(ticket.subject)}</div>
                        <div class="ticket-card-id">${ticket.id}</div>
                    </div>
                    <span class="ticket-card-status status-${ticket.status}">${ticket.status}</span>
                </div>
                <div class="ticket-card-meta">
                    <span class="ticket-card-priority priority-${ticket.priority}">${ticket.priority}</span>
                    <span>Created: ${this.formatDate(ticket.created)}</span>
                </div>
            </div>
        `).join('');
    }

    async viewTicketDetails(ticketId) {
        try {
            const response = await fetch(`/api/tickets/${ticketId}`);
            const result = await response.json();

            if (result.success) {
                this.showTicketModal(result.data);
            } else {
                this.showNotification('Failed to load ticket details', 'error');
            }
        } catch (error) {
            console.error('Error loading ticket details:', error);
            this.showNotification('Failed to load ticket details', 'error');
        }
    }

    showTicketModal(ticket) {
        const modal = document.getElementById('ticketDetailModal');
        const title = document.getElementById('modalTicketTitle');
        const content = document.getElementById('modalTicketContent');

        title.textContent = `${ticket.id} - ${ticket.subject}`;
        
        content.innerHTML = `
            <div class="ticket-detail">
                <div class="ticket-header">
                    <div class="ticket-meta">
                        <span class="status-badge status-${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                        <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                        <span class="category-badge">${ticket.category}</span>
                    </div>
                    <div class="ticket-dates">
                        <div><i class="fas fa-calendar-plus"></i> Created: ${this.formatDate(ticket.created)}</div>
                        <div><i class="fas fa-calendar-edit"></i> Updated: ${this.formatDate(ticket.updated)}</div>
                    </div>
                </div>
                
                <div class="ticket-description">
                    <h4><i class="fas fa-file-alt"></i> Description:</h4>
                    <p>${this.escapeHtml(ticket.description)}</p>
                </div>
                
                <div class="ticket-messages">
                    <h4><i class="fas fa-comments"></i> Conversation History:</h4>
                    <div class="messages-list">
                        ${ticket.messages.map(message => `
                            <div class="message ${message.type}">
                                <div class="message-header">
                                    <div class="message-author">
                                        <i class="fas ${message.type === 'admin' ? 'fa-user-shield' : 'fa-user'}"></i>
                                        <strong>${this.escapeHtml(message.author)}</strong>
                                        ${message.type === 'admin' ? '<span class="admin-badge">Support Team</span>' : ''}
                                    </div>
                                    <span class="message-time">${this.formatDate(message.timestamp)}</span>
                                </div>
                                <div class="message-content">${this.escapeHtml(message.content)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${ticket.status !== 'closed' ? `
                    <div class="customer-reply-section">
                        <h4><i class="fas fa-reply"></i> Add Follow-up Message:</h4>
                        <form class="reply-form" onsubmit="return false;">
                            <textarea class="reply-input" placeholder="Type your follow-up message here..." rows="3"></textarea>
                            <button type="button" class="btn btn-primary reply-btn" onclick="supportPortal.addCustomerReply('${ticket.id}')">
                                <i class="fas fa-paper-plane"></i> Send Reply
                            </button>
                        </form>
                    </div>
                ` : '<div class="ticket-closed-notice"><i class="fas fa-lock"></i> This ticket has been closed and no longer accepts replies.</div>'}
                
                ${ticket.assignee ? `
                    <div class="ticket-assignee">
                        <h4><i class="fas fa-user-tie"></i> Assigned to:</h4>
                        <p>${this.escapeHtml(ticket.assignee)}</p>
                    </div>
                ` : ''}
                
                ${ticket.tags && ticket.tags.length > 0 ? `
                    <div class="ticket-tags">
                        <h4><i class="fas fa-tags"></i> Tags:</h4>
                        <div class="tags-list">
                            ${ticket.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        modal.style.display = 'block';
    }

    closeTicketModal() {
        const modal = document.getElementById('ticketDetailModal');
        modal.style.display = 'none';
    }

    showLogin() {
        document.getElementById('ticketCreation').style.display = 'none';
        document.getElementById('ticketHistory').style.display = 'none';
        document.getElementById('loginSection').style.display = 'block';
    }

    showTicketCreation() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('ticketHistory').style.display = 'none';
        document.getElementById('ticketCreation').style.display = 'block';
    }

    showTicketHistory() {
        document.getElementById('ticketCreation').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('ticketHistory').style.display = 'block';
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('supportPortalUser');
        this.showNotification('Logged out successfully', 'info');
        this.showTicketCreation();
        
        // Clear login form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    }

    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Ticket';
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    async addCustomerReply(ticketId) {
        const modal = document.getElementById('ticketDetailModal');
        const replyInput = modal.querySelector('.reply-input');
        const replyBtn = modal.querySelector('.reply-btn');
        
        const message = replyInput.value.trim();
        if (!message) {
            alert('Please enter a message before sending.');
            return;
        }
        
        // Disable button during submission
        replyBtn.disabled = true;
        replyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: message,
                    author_type: 'customer',
                    author_email: this.currentUser.email,
                    author_name: this.currentUser.name || this.currentUser.email
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Clear the input
                replyInput.value = '';
                
                // Show success message
                this.showMessage('Reply sent successfully!', 'success');
                
                // Refresh the ticket details
                setTimeout(() => {
                    this.showTicketDetails(ticketId);
                    this.loadTickets(); // Refresh the ticket list
                }, 1000);
                
            } else {
                throw new Error('Failed to send reply');
            }
            
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showMessage('Failed to send reply. Please try again.', 'error');
        } finally {
            // Re-enable button
            replyBtn.disabled = false;
            replyBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reply';
        }
    }

    showMessage(message, type = 'info') {
        // Create and show a temporary message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    async submitTicketReply(ticketId) {
        const replyMessage = document.getElementById('replyMessage');
        const submitBtn = document.querySelector('#replyForm button[type="submit"]');
        
        if (!replyMessage || !replyMessage.value.trim()) {
            this.showNotification('Please enter a reply message', 'error');
            return;
        }
        
        // Get selected files
        const selectedFiles = this.getSelectedFiles();
        
        // Disable form during submission
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            const formData = new FormData();
            formData.append('ticketId', ticketId);
            formData.append('message', replyMessage.value.trim());
            formData.append('customerEmail', this.currentUser.email);
            
            // Add files to FormData
            selectedFiles.forEach((file, index) => {
                formData.append(`attachments`, file);
            });
            
            const response = await fetch(`/api/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: replyMessage.value.trim(),
                    author_type: 'customer',
                    author_email: this.currentUser.email,
                    author_name: this.currentUser.name || this.currentUser.email
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Clear the form
                replyMessage.value = '';
                this.clearFileList();
                
                // Show success message
                this.showNotification('Reply sent successfully!', 'success');
                
                // Refresh ticket data and conversation
                await this.loadCustomerTickets();
                
                // Reload the current ticket in split view
                if (this.currentSelectedTicket) {
                    const updatedTicket = this.customerTickets.find(t => t.id === ticketId);
                    if (updatedTicket) {
                        this.loadTicketIntoSplitView(updatedTicket);
                    }
                }
                
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to send reply');
            }
            
        } catch (error) {
            console.error('Error sending reply:', error);
            this.showNotification(error.message || 'Failed to send reply. Please try again.', 'error');
        } finally {
            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for HTML onclick handlers
function showLogin() {
    supportPortal.showLogin();
}

function showTicketCreation() {
    supportPortal.showTicketCreation();
}

function logout() {
    supportPortal.logout();
}

function closeTicketModal() {
    supportPortal.closeTicketModal();
}

// Authentication Functions
function showLoginModal() {
    const authModal = document.getElementById('authModal');
    const authModalTitle = document.getElementById('authModalTitle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    authModalTitle.textContent = 'Login to Your Account';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authModal.style.display = 'block';
}

function showRegisterForm() {
    const authModalTitle = document.getElementById('authModalTitle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    authModalTitle.textContent = 'Create Your Account';
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
}

function hideLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.classList.add('hidden');
    }
}

function hideRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.classList.add('hidden');
    }
}

function showLoginForm() {
    const authModalTitle = document.getElementById('authModalTitle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    authModalTitle.textContent = 'Login to Your Account';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.style.display = 'none';
    
    // Clear form data
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

async function handleLogin(event) {
    console.log('handleLogin called', event);
    event.preventDefault();
    
    // Try both login form IDs (modal and main form)
    const emailElement = document.getElementById('modalLoginEmail') || document.getElementById('loginEmail');
    const passwordElement = document.getElementById('modalLoginPassword') || document.getElementById('loginPassword');
    
    const email = emailElement?.value;
    const password = passwordElement?.value;
    
    console.log('Login form values:', { email, password, emailElement, passwordElement });
    
    if (!email || !password) {
        console.error('Missing email or password');
        if (window.supportPortal) {
            window.supportPortal.showNotification('Please enter both email and password', 'error');
        }
        return false;
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/customers/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // API returns result.data.token and result.data.customer
            const token = result.data?.token || result.token;
            const customer = result.data?.customer || result.user;
            
            // Store user data with consistent keys
            localStorage.setItem('supportPortalToken', token);
            localStorage.setItem('customer_token', token); // Also store for compatibility
            localStorage.setItem('supportPortalUser', JSON.stringify(customer));
            
            // Update the support portal instance
            if (window.supportPortal) {
                window.supportPortal.currentUser = customer;
                window.supportPortal.showNotification('Successfully logged in!', 'success');
                window.supportPortal.showUserDashboard();
                window.supportPortal.loadUserTickets();
                window.supportPortal.updateUserStats();
            }
            
            closeAuthModal();
            
        } else {
            if (window.supportPortal) {
                window.supportPortal.showNotification(result.message || 'Login failed. Please try again.', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (window.supportPortal) {
            window.supportPortal.showNotification('Login failed. Please check your connection.', 'error');
        }
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
    
    return false;
}

async function handleRegister(event) {
    console.log('handleRegister called', event);
    event.preventDefault();
    
    const nameElement = document.getElementById('registerName');
    const emailElement = document.getElementById('registerEmail');
    const passwordElement = document.getElementById('registerPassword');
    const confirmPasswordElement = document.getElementById('confirmPassword');
    
    const name = nameElement?.value;
    const email = emailElement?.value;
    const password = passwordElement?.value;
    const confirmPassword = confirmPasswordElement?.value;
    
    console.log('Register form values:', { name, email, password, confirmPassword, nameElement, emailElement, passwordElement, confirmPasswordElement });
    
    if (!name || !email || !password || !confirmPassword) {
        console.error('Missing required fields');
        if (window.supportPortal) {
            window.supportPortal.showNotification('Please fill in all required fields', 'error');
        }
        return false;
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return false;
    }
    
    // Show loading state
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // API returns result.data.token and result.data.customer
            const token = result.data?.token || result.token;
            const customer = result.data?.customer || result.user;
            
            // Store user data with consistent keys
            localStorage.setItem('supportPortalToken', token);
            localStorage.setItem('customer_token', token);
            localStorage.setItem('supportPortalUser', JSON.stringify(customer));
            
            // Update the support portal instance
            if (window.supportPortal) {
                window.supportPortal.currentUser = customer;
                window.supportPortal.showNotification('Account created successfully!', 'success');
                window.supportPortal.showUserDashboard();
                window.supportPortal.loadUserTickets();
            }
            
            closeAuthModal();
            
        } else {
            if (window.supportPortal) {
                window.supportPortal.showNotification(result.error || result.message || 'Registration failed. Please try again.', 'error');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (window.supportPortal) {
            window.supportPortal.showNotification('Registration failed. Please check your connection.', 'error');
        }
    } finally {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
    
    return false;
}

// Utility methods for ticket styling
SupportPortal.prototype.getStatusClass = function(status) {
    const statusMap = {
        'open': 'status-open',
        'in-progress': 'status-progress', 
        'resolved': 'status-resolved',
        'closed': 'status-closed',
        'pending': 'status-pending'
    };
    return statusMap[status] || 'status-default';
};

SupportPortal.prototype.getPriorityClass = function(priority) {
    const priorityMap = {
        'low': 'priority-low',
        'medium': 'priority-medium', 
        'high': 'priority-high',
        'urgent': 'priority-urgent',
        'critical': 'priority-critical'
    };
    return priorityMap[priority] || 'priority-default';
};

SupportPortal.prototype.formatDate = function(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
};

SupportPortal.prototype.escapeHtml = function(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
};

function handleLogout() {
    if (window.supportPortal) {
        window.supportPortal.handleLogout();
    }
}

// Global function for logout button
function logout() {
    handleLogout();
}

// Global function for tab switching
function showTab(tabName) {
    // Remove active class from all tabs and tab panes
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to clicked tab
    const activeButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeButton) activeButton.classList.add('active');
    
    // Show corresponding tab pane
    if (tabName === 'createTicket') {
        document.getElementById('createTicketTab')?.classList.add('active');
    } else if (tabName === 'myTickets') {
        document.getElementById('myTicketsTab')?.classList.add('active');
        // Refresh tickets when switching to My Tickets tab
        if (window.supportPortal) {
            window.supportPortal.loadUserTickets();
        }
    }
}

// Global function for filtering user tickets
function filterUserTickets() {
    if (window.supportPortal) {
        window.supportPortal.filterUserTickets();
    }
}

// Global function for viewing ticket details
function viewTicketDetails(ticketId) {
    if (window.supportPortal) {
        window.supportPortal.viewTicketDetails(ticketId);
    }
}

// Global function for replying to ticket
function replyToTicket(ticketId) {
    if (window.supportPortal) {
        window.supportPortal.replyToTicket(ticketId);
    }
}

// Global function for submitting reply
function submitReply(ticketId) {
    if (window.supportPortal) {
        window.supportPortal.submitReply(ticketId);
    }
}

// Global functions for modal handling
function showRegisterModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
    showRegisterForm();
}

function showLoginModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
    showLoginForm();
}

function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
    hideLoginForm();
    hideRegisterForm();
}

// Clear form functions
function clearLoginForm() {
    document.getElementById('modalLoginEmail').value = '';
    document.getElementById('modalLoginPassword').value = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

function clearRegisterForm() {
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function updateAuthUI(user) {
    const navLinks = document.querySelector('.nav-links');
    
    if (user) {
        // User is logged in
        navLinks.innerHTML = `
            <span class="user-greeting">Welcome, ${user.name}!</span>
            <a href="#" onclick="showTicketHistory()">My Tickets</a>
            <a href="#" onclick="handleLogout()">Logout</a>
        `;
        
        // Auto-populate forms with user data
        const customerNameInput = document.getElementById('customerName');
        const customerEmailInput = document.getElementById('customerEmail');
        if (customerNameInput) customerNameInput.value = user.name;
        if (customerEmailInput) customerEmailInput.value = user.email;
        
    } else {
        // User is logged out
        navLinks.innerHTML = `
            <a href="index.html">Home</a>
            <a href="#" onclick="showLoginModal()">Login</a>
        `;
    }
}

function showTicketHistory() {
    const token = localStorage.getItem('customer_token');
    if (!token) {
        showNotification('Please log in to view your tickets.', 'warning');
        showLoginModal();
        return;
    }
    
    window.supportPortal.showTicketHistory();
}

function getCurrentUser() {
    const userStr = localStorage.getItem('customer_user');
    return userStr ? JSON.parse(userStr) : null;
}

function getAuthToken() {
    return localStorage.getItem('customer_token');
}

// Initialize support portal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.supportPortal = new SupportPortal();
    
    // Check for existing authentication
    const user = getCurrentUser();
    if (user) {
        updateAuthUI(user);
    }
});
