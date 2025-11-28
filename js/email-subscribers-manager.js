/**
 * Email Subscribers Manager
 * Central manager for email subscribers with D1 backend integration
 * 
 * Provides:
 * - Subscriber CRUD operations
 * - Import/Export functionality
 * - Popup configuration management
 * - Statistics and analytics
 * 
 * Integrates with:
 * - Email Subscribers dashboard section
 * - Email popup on blog frontend
 * - Email Marketing campaigns
 * - Blog Statistics
 */

class EmailSubscribersManager {
    constructor() {
        this.subscribers = [];
        this.stats = { total: 0, active: 0, unsubscribed: 0, bounced: 0 };
        this.popupConfig = null;
        this.pagination = { total: 0, limit: 20, offset: 0 };
        this.currentFilter = { status: null, search: '' };
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
        console.log('EmailSubscribersManager: Initializing...');
        
        // Load data from API
        await this.loadSubscribers();
        await this.loadPopupConfig();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('EmailSubscribersManager: Initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('emailSubscribersReady', {
            detail: { subscribers: this.subscribers, stats: this.stats }
        }));
    }
    
    // ========================================
    // SUBSCRIBER OPERATIONS
    // ========================================
    
    /**
     * Load subscribers from D1 API
     */
    async loadSubscribers(options = {}) {
        const status = options.status || this.currentFilter.status;
        const search = options.search !== undefined ? options.search : this.currentFilter.search;
        const limit = options.limit || this.pagination.limit;
        const offset = options.offset !== undefined ? options.offset : this.pagination.offset;
        
        try {
            let url = `/api/subscribers?limit=${limit}&offset=${offset}`;
            if (status) url += `&status=${status}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                this.subscribers = data.subscribers || [];
                this.stats = data.stats || this.stats;
                this.pagination = data.pagination || { total: 0, limit, offset };
                
                // Update current filter
                this.currentFilter = { status, search };
                
                // Cache in localStorage
                localStorage.setItem('email_subscribers_cache', JSON.stringify({
                    subscribers: this.subscribers,
                    stats: this.stats,
                    timestamp: Date.now()
                }));
                
                console.log(`EmailSubscribersManager: Loaded ${this.subscribers.length} subscribers`);
                
                // Update UI
                this.updateUI();
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('subscribersLoaded', {
                    detail: { subscribers: this.subscribers, stats: this.stats, pagination: this.pagination }
                }));
                
                return this.subscribers;
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error loading subscribers', error);
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem('email_subscribers_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.subscribers = data.subscribers || [];
                this.stats = data.stats || this.stats;
                this.updateUI();
            }
        } catch (e) {
            this.subscribers = [];
        }
        
        return this.subscribers;
    }
    
    /**
     * Add a new subscriber
     */
    async addSubscriber(email, options = {}) {
        console.log('EmailSubscribersManager: Adding subscriber', email);
        
        try {
            const response = await fetch('/api/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    name: options.name,
                    source: options.source || 'manual',
                    tags: options.tags,
                    preferences: options.preferences
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (!result.existing && !result.reactivated) {
                    // Add to local array
                    if (result.subscriber) {
                        this.subscribers.unshift(result.subscriber);
                        this.stats.total++;
                        this.stats.active++;
                    }
                }
                
                // Refresh data
                await this.loadSubscribers();
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('subscriberAdded', {
                    detail: result
                }));
                
                this.showNotification(result.message || 'Subscriber added successfully', 'success');
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add subscriber');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error adding subscriber', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Update subscriber
     */
    async updateSubscriber(id, updates) {
        console.log('EmailSubscribersManager: Updating subscriber', id);
        
        try {
            const response = await fetch(`/api/subscribers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.subscribers.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.subscribers[index] = result.subscriber;
                }
                
                this.updateUI();
                
                document.dispatchEvent(new CustomEvent('subscriberUpdated', {
                    detail: { subscriber: result.subscriber }
                }));
                
                this.showNotification('Subscriber updated', 'success');
                return result.subscriber;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update subscriber');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error updating subscriber', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Delete subscriber
     */
    async deleteSubscriber(id) {
        console.log('EmailSubscribersManager: Deleting subscriber', id);
        
        try {
            const response = await fetch(`/api/subscribers/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                const subscriber = this.subscribers.find(s => s.id === id);
                this.subscribers = this.subscribers.filter(s => s.id !== id);
                
                // Update stats
                this.stats.total--;
                if (subscriber?.status === 'active') this.stats.active--;
                if (subscriber?.status === 'unsubscribed') this.stats.unsubscribed--;
                
                this.updateUI();
                
                document.dispatchEvent(new CustomEvent('subscriberDeleted', {
                    detail: { id }
                }));
                
                this.showNotification('Subscriber deleted', 'success');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete subscriber');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error deleting subscriber', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Unsubscribe
     */
    async unsubscribe(id) {
        return await this.updateSubscriber(id, { status: 'unsubscribed' });
    }
    
    /**
     * Resubscribe
     */
    async resubscribe(id) {
        return await this.updateSubscriber(id, { status: 'active' });
    }
    
    // ========================================
    // IMPORT/EXPORT
    // ========================================
    
    /**
     * Export subscribers to CSV
     */
    async exportSubscribers(status = null) {
        console.log('EmailSubscribersManager: Exporting subscribers');
        
        try {
            let url = '/api/subscribers/import';
            if (status) url += `?status=${status}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                const filename = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
                
                // Download file
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
                
                this.showNotification('Export completed', 'success');
                return true;
            } else {
                throw new Error('Export failed');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Export error', error);
            this.showNotification('Error exporting subscribers', 'error');
            throw error;
        }
    }
    
    /**
     * Import subscribers from CSV file
     */
    async importSubscribers(file) {
        console.log('EmailSubscribersManager: Importing subscribers');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/subscribers/import', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Refresh subscribers
                await this.loadSubscribers();
                
                document.dispatchEvent(new CustomEvent('subscribersImported', {
                    detail: result.results
                }));
                
                this.showNotification(
                    `Imported ${result.results.imported} of ${result.results.total} subscribers`,
                    result.results.errors.length > 0 ? 'warning' : 'success'
                );
                
                return result.results;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Import failed');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Import error', error);
            this.showNotification('Error importing subscribers: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // POPUP CONFIG
    // ========================================
    
    /**
     * Load popup configuration
     */
    async loadPopupConfig() {
        try {
            const response = await fetch('/api/subscribers/popup-config');
            if (response.ok) {
                this.popupConfig = await response.json();
                
                // Cache in localStorage
                localStorage.setItem('email_popup_config', JSON.stringify(this.popupConfig));
                
                // Update popup config form
                this.updatePopupConfigForm();
                
                return this.popupConfig;
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error loading popup config', error);
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem('email_popup_config');
            if (cached) {
                this.popupConfig = JSON.parse(cached);
            }
        } catch (e) {
            this.popupConfig = this.getDefaultPopupConfig();
        }
        
        return this.popupConfig;
    }
    
    /**
     * Save popup configuration
     */
    async savePopupConfig(config) {
        console.log('EmailSubscribersManager: Saving popup config');
        
        try {
            const response = await fetch('/api/subscribers/popup-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.popupConfig = result.config;
                
                // Update localStorage
                localStorage.setItem('email_popup_config', JSON.stringify(this.popupConfig));
                
                document.dispatchEvent(new CustomEvent('popupConfigUpdated', {
                    detail: { config: this.popupConfig }
                }));
                
                this.showNotification('Popup configuration saved', 'success');
                return this.popupConfig;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save popup config');
            }
        } catch (error) {
            console.error('EmailSubscribersManager: Error saving popup config', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Get default popup config
     */
    getDefaultPopupConfig() {
        return {
            enabled: true,
            title: 'Subscribe to Our Newsletter',
            description: 'Get the latest food news and recipes delivered to your inbox!',
            button_text: 'Subscribe',
            placeholder_text: 'Enter your email address',
            success_message: 'Thank you for subscribing!',
            trigger_type: 'time',
            trigger_delay: 5,
            trigger_scroll_percent: 50,
            show_once: true,
            show_every_days: 7
        };
    }
    
    // ========================================
    // UI UPDATES
    // ========================================
    
    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateStatsDisplay();
        this.updateSubscribersList();
        this.updatePagination();
    }
    
    /**
     * Update stats display
     */
    updateStatsDisplay() {
        const countEl = document.querySelector('.email-subscriber-count');
        if (countEl) {
            countEl.textContent = `${this.stats.active} Active Subscribers`;
        }
        
        // Update individual stat elements if they exist
        this.setElementText('subscribers-total', this.stats.total);
        this.setElementText('subscribers-active', this.stats.active);
        this.setElementText('subscribers-unsubscribed', this.stats.unsubscribed);
        this.setElementText('subscribers-bounced', this.stats.bounced);
    }
    
    /**
     * Update subscribers list
     */
    updateSubscribersList() {
        const listContainer = document.querySelector('.email-list');
        if (!listContainer) return;
        
        if (this.subscribers.length === 0) {
            listContainer.innerHTML = `
                <div class="no-subscribers">
                    <i class="fas fa-inbox"></i>
                    <p>No subscribers found</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = this.subscribers.map(sub => `
            <div class="email-list-item" data-id="${sub.id}">
                <span class="subscriber-email">${sub.email}</span>
                <span class="subscriber-date">${this.formatDate(sub.subscribed_at)}</span>
                <span class="subscriber-status status-${sub.status}">${sub.status}</span>
                <div class="subscriber-actions">
                    ${sub.status === 'active' 
                        ? `<button class="action-btn unsubscribe-btn" title="Unsubscribe"><i class="fas fa-user-slash"></i></button>`
                        : `<button class="action-btn resubscribe-btn" title="Resubscribe"><i class="fas fa-user-check"></i></button>`
                    }
                    <button class="action-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        
        // Attach event listeners
        this.attachListEventListeners();
    }
    
    /**
     * Attach event listeners to list items
     */
    attachListEventListeners() {
        document.querySelectorAll('.email-list-item .unsubscribe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.email-list-item').dataset.id;
                if (confirm('Unsubscribe this email?')) {
                    this.unsubscribe(id);
                }
            });
        });
        
        document.querySelectorAll('.email-list-item .resubscribe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.email-list-item').dataset.id;
                this.resubscribe(id);
            });
        });
        
        document.querySelectorAll('.email-list-item .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.email-list-item').dataset.id;
                if (confirm('Delete this subscriber permanently?')) {
                    this.deleteSubscriber(id);
                }
            });
        });
    }
    
    /**
     * Update pagination display
     */
    updatePagination() {
        const paginationEl = document.querySelector('.email-pagination span');
        if (paginationEl) {
            const currentPage = Math.floor(this.pagination.offset / this.pagination.limit) + 1;
            const totalPages = Math.ceil(this.pagination.total / this.pagination.limit) || 1;
            paginationEl.textContent = `Page ${currentPage} of ${totalPages}`;
        }
        
        // Enable/disable pagination buttons
        const prevBtn = document.querySelector('.prev-page');
        const nextBtn = document.querySelector('.next-page');
        
        if (prevBtn) {
            prevBtn.disabled = this.pagination.offset === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = !this.pagination.hasMore;
        }
    }
    
    /**
     * Update popup config form
     */
    updatePopupConfigForm() {
        if (!this.popupConfig) return;
        
        this.setCheckboxValue('popupEnabled', this.popupConfig.enabled);
        this.setInputValue('popupTitle', this.popupConfig.title);
        this.setInputValue('buttonText', this.popupConfig.button_text);
        this.setInputValue('placeholderText', this.popupConfig.placeholder_text);
        this.setInputValue('successMessage', this.popupConfig.success_message);
        this.setInputValue('popupDelay', this.popupConfig.trigger_delay);
        this.setInputValue('timeDelay', this.popupConfig.trigger_delay);
        this.setInputValue('scrollPercentage', this.popupConfig.trigger_scroll_percent);
        this.setCheckboxValue('showOnce', this.popupConfig.show_once);
        this.setInputValue('showEveryDays', this.popupConfig.show_every_days);
        
        // Set active trigger type
        const triggerType = this.popupConfig.trigger_type;
        document.querySelectorAll('.trigger-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.trigger === triggerType);
        });
        
        const triggerInput = document.getElementById('triggerType');
        if (triggerInput) triggerInput.value = triggerType;
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Export button
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSubscribers());
        }
        
        // Import button
        const importBtn = document.querySelector('.import-btn');
        const importFile = document.getElementById('importFile');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importSubscribers(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }
        
        // Pagination
        const prevBtn = document.querySelector('.prev-page');
        const nextBtn = document.querySelector('.next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.pagination.offset > 0) {
                    this.loadSubscribers({ offset: this.pagination.offset - this.pagination.limit });
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.pagination.hasMore) {
                    this.loadSubscribers({ offset: this.pagination.offset + this.pagination.limit });
                }
            });
        }
        
        // Popup config form
        const configForm = document.getElementById('popupConfigForm');
        if (configForm) {
            configForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePopupConfigSave();
            });
        }
        
        // Trigger type selection
        document.querySelectorAll('.trigger-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.trigger-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                
                const triggerType = opt.dataset.trigger;
                const triggerInput = document.getElementById('triggerType');
                if (triggerInput) triggerInput.value = triggerType;
                
                // Show/hide parameters
                document.querySelectorAll('.trigger-parameter').forEach(p => p.style.display = 'none');
                const paramEl = document.querySelector(`.${triggerType}-parameter`);
                if (paramEl) paramEl.style.display = 'block';
            });
        });
        
        // Listen for external subscription events
        document.addEventListener('emailSubscribed', async (e) => {
            await this.loadSubscribers();
        });
    }
    
    /**
     * Handle popup config save
     */
    async handlePopupConfigSave() {
        const config = {
            enabled: document.getElementById('popupEnabled')?.checked || false,
            title: document.getElementById('popupTitle')?.value || '',
            button_text: document.getElementById('buttonText')?.value || 'Subscribe',
            placeholder_text: document.getElementById('placeholderText')?.value || '',
            success_message: document.getElementById('successMessage')?.value || '',
            trigger_type: document.getElementById('triggerType')?.value || 'time',
            trigger_delay: parseInt(document.getElementById('timeDelay')?.value) || 5,
            trigger_scroll_percent: parseInt(document.getElementById('scrollPercentage')?.value) || 50,
            show_once: document.getElementById('showOnce')?.checked || false,
            show_every_days: parseInt(document.getElementById('showEveryDays')?.value) || 7
        };
        
        await this.savePopupConfig(config);
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    setElementText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    setInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    }
    
    setCheckboxValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.checked = !!value;
    }
    
    formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    /**
     * Get subscribers
     */
    getSubscribers() {
        return this.subscribers;
    }
    
    /**
     * Get stats
     */
    getStats() {
        return this.stats;
    }
    
    /**
     * Get popup config
     */
    getPopupConfig() {
        return this.popupConfig;
    }
    
    /**
     * Filter by status
     */
    async filterByStatus(status) {
        await this.loadSubscribers({ status, offset: 0 });
    }
    
    /**
     * Search subscribers
     */
    async search(query) {
        await this.loadSubscribers({ search: query, offset: 0 });
    }
}

// Initialize and expose globally
window.emailSubscribersManager = new EmailSubscribersManager();
window.EmailSubscribersManager = EmailSubscribersManager;
