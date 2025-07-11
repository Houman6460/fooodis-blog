/**
 * Support Tickets API
 * Handles CRUD operations for support tickets
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// In-memory storage for tickets (in production, use a proper database)
let tickets = [];
let ticketCounter = 1;

// Data file path for persistence
const TICKETS_FILE = path.join(__dirname, '../data/tickets.json');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load tickets from file on startup
function loadTickets() {
    try {
        if (fs.existsSync(TICKETS_FILE)) {
            const data = fs.readFileSync(TICKETS_FILE, 'utf8');
            const parsedData = JSON.parse(data);
            tickets = parsedData.tickets || [];
            ticketCounter = parsedData.counter || 1;
            
            // Convert date strings back to Date objects
            tickets.forEach(ticket => {
                ticket.created = new Date(ticket.created);
                ticket.updated = new Date(ticket.updated);
                ticket.messages.forEach(msg => {
                    msg.timestamp = new Date(msg.timestamp);
                });
            });
            
            console.log(`Loaded ${tickets.length} tickets from storage`);
        } else {
            // Initialize with sample data
            initializeWithSampleData();
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        initializeWithSampleData();
    }
}

// Save tickets to file
function saveTickets() {
    try {
        const data = {
            tickets: tickets,
            counter: ticketCounter
        };
        fs.writeFileSync(TICKETS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving tickets:', error);
    }
}

// Initialize with sample data
function initializeWithSampleData() {
    tickets = [
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
    ticketCounter = 4;
    saveTickets();
}

// Utility functions
function generateTicketId() {
    return `TKT-${String(ticketCounter++).padStart(3, '0')}`;
}

function validateTicketData(data) {
    const required = ['subject', 'description', 'category', 'customer', 'email', 'priority'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
        return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
    }
    
    const validCategories = ['sales', 'billing', 'technical-support', 'delivery', 'general-inquiries'];
    if (!validCategories.includes(data.category)) {
        return { valid: false, error: 'Invalid category. Must be sales, billing, technical-support, delivery, or general-inquiries.' };
    }
    
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(data.priority)) {
        return { valid: false, error: 'Invalid priority. Must be low, medium, high, or urgent.' };
    }
    
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (data.status && !validStatuses.includes(data.status)) {
        return { valid: false, error: 'Invalid status. Must be open, in-progress, resolved, or closed.' };
    }
    
    return { valid: true };
}

// API Routes

// GET /api/tickets - Get all tickets with optional filtering
router.get('/', (req, res) => {
    try {
        let filteredTickets = [...tickets];
        
        // Apply filters
        const { category, status, priority, customer, search, page = 1, limit = 50 } = req.query;
        
        if (category && category !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
        }
        
        if (status && status !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
        }
        
        if (priority && priority !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
        }
        
        if (customer) {
            filteredTickets = filteredTickets.filter(ticket => ticket.email === customer);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.customer.toLowerCase().includes(searchLower) ||
                ticket.email.toLowerCase().includes(searchLower) ||
                ticket.description.toLowerCase().includes(searchLower) ||
                ticket.id.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort by updated date (newest first)
        filteredTickets.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                tickets: paginatedTickets,
                total: filteredTickets.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(filteredTickets.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets'
        });
    }
});

// GET /api/tickets/stats - Get ticket statistics
router.get('/stats', (req, res) => {
    try {
        const stats = {
            total: tickets.length,
            byCategory: {
                salon: tickets.filter(t => t.category === 'salon').length,
                supplier: tickets.filter(t => t.category === 'supplier').length
            },
            byStatus: {
                open: tickets.filter(t => t.status === 'open').length,
                'in-progress': tickets.filter(t => t.status === 'in-progress').length,
                resolved: tickets.filter(t => t.status === 'resolved').length,
                closed: tickets.filter(t => t.status === 'closed').length
            },
            byPriority: {
                low: tickets.filter(t => t.priority === 'low').length,
                medium: tickets.filter(t => t.priority === 'medium').length,
                high: tickets.filter(t => t.priority === 'high').length,
                urgent: tickets.filter(t => t.priority === 'urgent').length
            }
        };
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket statistics'
        });
    }
});

// GET /api/tickets/:id - Get specific ticket
router.get('/:id', (req, res) => {
    try {
        const ticket = tickets.find(t => t.id === req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }
        
        res.json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket'
        });
    }
});

// POST /api/tickets - Create new ticket
router.post('/', (req, res) => {
    try {
        const validation = validateTicketData(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        
        const newTicket = {
            id: generateTicketId(),
            subject: req.body.subject,
            description: req.body.description,
            status: req.body.status || 'open',
            priority: req.body.priority,
            category: req.body.category,
            customer: req.body.customer,
            email: req.body.email,
            assignee: req.body.assignee || null,
            created: new Date(),
            updated: new Date(),
            tags: req.body.tags || [],
            messages: [
                {
                    id: 1,
                    author: req.body.customer,
                    content: req.body.description,
                    timestamp: new Date(),
                    type: 'customer'
                }
            ]
        };
        
        tickets.unshift(newTicket);
        saveTickets();
        
        res.status(201).json({
            success: true,
            data: newTicket,
            message: 'Ticket created successfully'
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create ticket'
        });
    }
});

// PUT /api/tickets/:id - Update ticket
router.put('/:id', (req, res) => {
    try {
        const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
        
        if (ticketIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }
        
        const ticket = tickets[ticketIndex];
        const updatedFields = {};
        
        // Update allowed fields
        const allowedFields = ['subject', 'description', 'status', 'priority', 'assignee', 'tags'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updatedFields[field] = req.body[field];
                ticket[field] = req.body[field];
            }
        });
        
        ticket.updated = new Date();
        saveTickets();
        
        res.json({
            success: true,
            data: ticket,
            message: 'Ticket updated successfully'
        });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update ticket'
        });
    }
});

// POST /api/tickets/:id/messages - Add message to ticket
router.post('/:id/messages', (req, res) => {
    try {
        const ticket = tickets.find(t => t.id === req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }
        
        if (!req.body.content || !req.body.author) {
            return res.status(400).json({
                success: false,
                error: 'Message content and author are required'
            });
        }
        
        const newMessage = {
            id: ticket.messages.length + 1,
            author: req.body.author,
            content: req.body.content,
            timestamp: new Date(),
            type: req.body.type || 'admin'
        };
        
        ticket.messages.push(newMessage);
        ticket.updated = new Date();
        
        // Auto-close ticket if requested
        if (req.body.closeTicket) {
            ticket.status = 'closed';
        }
        
        saveTickets();
        
        res.json({
            success: true,
            data: newMessage,
            message: 'Reply sent successfully'
        });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add message'
        });
    }
});

// Add reply to ticket (Admin)
router.post('/reply', (req, res) => {
    try {
        const { ticketId, message, author } = req.body;
        
        if (!ticketId || !message || !author) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const tickets = loadTickets();
        const ticket = tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Add the reply
        ticket.messages.push({
            id: Date.now().toString(),
            type: 'admin',
            author: author,
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Update the ticket's updated timestamp
        ticket.updated = new Date().toISOString();
        
        // Save tickets
        saveTickets(tickets);
        
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add customer reply to ticket
router.post('/customer-reply', (req, res) => {
    try {
        const { ticketId, message, customerEmail } = req.body;
        
        if (!ticketId || !message || !customerEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const tickets = loadTickets();
        const ticket = tickets.find(t => t.id === ticketId);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Verify customer owns this ticket
        if (ticket.customerEmail !== customerEmail) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Check if ticket is closed
        if (ticket.status === 'closed') {
            return res.status(400).json({ error: 'Cannot reply to closed tickets' });
        }
        
        // Add the customer reply
        ticket.messages.push({
            id: Date.now().toString(),
            type: 'customer',
            author: ticket.customerName || customerEmail,
            content: message,
            timestamp: new Date().toISOString()
        });
        
        // Update ticket status and timestamp
        if (ticket.status === 'resolved') {
            ticket.status = 'in-progress'; // Reopen if customer replies to resolved ticket
        }
        ticket.updated = new Date().toISOString();
        
        // Save tickets
        saveTickets(tickets);
        
        res.json({ success: true, message: 'Reply added successfully', ticket });
    } catch (error) {
        console.error('Error adding customer reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/tickets/:id - Delete ticket (soft delete by changing status)
router.delete('/:id', (req, res) => {
    try {
        const ticket = tickets.find(t => t.id === req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }
        
        ticket.status = 'archived';
        ticket.updated = new Date();
        saveTickets();
        
        res.json({
            success: true,
            message: 'Ticket archived successfully'
        });
    } catch (error) {
        console.error('Error archiving ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to archive ticket'
        });
    }
});

// Initialize data on module load
loadTickets();

module.exports = router;
