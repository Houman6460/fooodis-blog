
/**
 * Database abstraction layer for Fooodis Blog System
 * Supports both localStorage (development) and future database implementations
 */

class DatabaseManager {
    constructor() {
        this.storage = 'localStorage'; // Can be switched to 'mongodb', 'postgresql', etc.
        this.connected = false;
    }

    async connect() {
        switch (this.storage) {
            case 'localStorage':
                this.connected = true;
                console.log('📦 Using localStorage for data persistence');
                break;
            
            case 'mongodb':
                // Future MongoDB implementation
                break;
                
            case 'postgresql':
                // Future PostgreSQL implementation
                break;
                
            default:
                throw new Error(`Unsupported storage type: ${this.storage}`);
        }
    }

    async getPosts(limit = 50, offset = 0) {
        if (this.storage === 'localStorage') {
            const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
            return posts.slice(offset, offset + limit);
        }
        // Add database queries for other storage types
    }

    async savePost(postData) {
        if (this.storage === 'localStorage') {
            const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
            posts.unshift(postData);
            localStorage.setItem('fooodis-blog-posts', JSON.stringify(posts));
            return postData;
        }
        // Add database operations for other storage types
    }

    async getCategories() {
        if (this.storage === 'localStorage') {
            return JSON.parse(localStorage.getItem('fooodis-blog-categories') || '[]');
        }
    }

    async saveCategory(categoryData) {
        if (this.storage === 'localStorage') {
            const categories = this.getCategories();
            categories.push(categoryData);
            localStorage.setItem('fooodis-blog-categories', JSON.stringify(categories));
            return categoryData;
        }
    }

    async getAnalytics() {
        if (this.storage === 'localStorage') {
            return JSON.parse(localStorage.getItem('fooodis-blog-analytics') || '{}');
        }
    }

    async updateAnalytics(analyticsData) {
        if (this.storage === 'localStorage') {
            localStorage.setItem('fooodis-blog-analytics', JSON.stringify(analyticsData));
            return analyticsData;
        }
    }
}

module.exports = new DatabaseManager();
