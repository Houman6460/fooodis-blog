
/**
 * Fooodis Blog System - Core System
 * Consolidated core functionality to replace scattered fix files
 */

class FoodisBlogCore {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
        this.eventHandlers = new Map();
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Fooodis Blog System Core');
        
        // Initialize storage first
        await this.initializeStorage();
        
        // Initialize authentication
        await this.initializeAuth();
        
        // Initialize UI components
        await this.initializeUI();
        
        // Initialize automation system
        await this.initializeAutomation();
        
        this.initialized = true;
        console.log('✅ Fooodis Blog System Core initialized successfully');
    }

    async initializeStorage() {
        if (!window.StorageManager) {
            console.error('❌ StorageManager not found');
            return;
        }
        
        // Ensure storage is ready
        await new Promise(resolve => {
            if (window.StorageManager.initialized) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.StorageManager.initialized) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
        
        console.log('✅ Storage system initialized');
    }

    async initializeAuth() {
        if (window.AuthManager) {
            // Auth manager handles its own initialization
            console.log('✅ Authentication system ready');
        }
    }

    async initializeUI() {
        // Initialize dashboard sections
        this.initializeDashboardSections();
        
        // Initialize media components
        this.initializeMediaComponents();
        
        // Initialize form handlers
        this.initializeFormHandlers();
        
        console.log('✅ UI components initialized');
    }

    async initializeAutomation() {
        // Initialize AI automation system
        if (window.aiAutomation) {
            console.log('✅ AI automation system ready');
        }
        
        // Initialize scheduler
        if (window.SchedulerManager) {
            console.log('✅ Scheduler system ready');
        }
    }

    initializeDashboardSections() {
        // Handle section navigation
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.dashboard-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.dataset.section;
                this.showSection(targetSection);
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active class to clicked nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }
    }

    initializeMediaComponents() {
        // Initialize media selector for all forms
        const mediaSelectors = document.querySelectorAll('.media-select-button');
        mediaSelectors.forEach(button => {
            button.addEventListener('click', this.handleMediaSelection.bind(this));
        });
    }

    handleMediaSelection(event) {
        const targetInput = event.target.dataset.targetInput;
        if (targetInput) {
            // Open media library modal
            this.openMediaLibrary(targetInput);
        }
    }

    openMediaLibrary(targetInputId) {
        // Implementation for media library modal
        console.log(`Opening media library for input: ${targetInputId}`);
    }

    initializeFormHandlers() {
        // Post form submission
        const postForm = document.getElementById('postForm');
        if (postForm) {
            postForm.addEventListener('submit', this.handlePostSubmission.bind(this));
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', this.handleSettingsSubmission.bind(this));
        }
    }

    async handlePostSubmission(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const postData = {
            id: Date.now().toString(),
            title: formData.get('postTitle'),
            category: formData.get('postCategory'),
            subcategory: formData.get('postSubcategory'),
            content: document.getElementById('postContent').value,
            excerpt: formData.get('postExcerpt'),
            imageUrl: formData.get('postImageUrl'),
            tags: formData.get('postTags'),
            featured: formData.has('postFeatured'),
            scheduleDate: formData.get('postScheduleDate'),
            date: new Date().toISOString(),
            status: 'published'
        };

        try {
            await this.savePost(postData);
            this.showNotification('Post published successfully!', 'success');
            event.target.reset();
        } catch (error) {
            console.error('Error saving post:', error);
            this.showNotification('Error publishing post', 'error');
        }
    }

    async savePost(postData) {
        const posts = window.StorageManager.getData('fooodis-blog-posts') || [];
        posts.unshift(postData);
        window.StorageManager.saveData('fooodis-blog-posts', posts);
        
        // Update UI if needed
        this.refreshPostsList();
    }

    refreshPostsList() {
        // Refresh the posts management section
        if (typeof refreshPostsTable === 'function') {
            refreshPostsTable();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Utility method to clean up legacy fix files
    cleanupLegacyFixes() {
        console.log('🧹 Cleaning up legacy fix implementations...');
        // This would help identify which fix files are no longer needed
    }
}

// Initialize the core system
window.FoodisBlogCore = new FoodisBlogCore();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FoodisBlogCore.initialize();
    });
} else {
    window.FoodisBlogCore.initialize();
}
