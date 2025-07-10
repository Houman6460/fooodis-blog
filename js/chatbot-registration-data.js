
/**
 * 📊 CHATBOT REGISTRATION DATA MANAGER
 * Manages user registration data and persistence
 */

(function() {
    'use strict';

    window.ChatbotRegistrationData = {
        init: function() {
            console.log('📊 Registration Data Manager initialized');
            this.migrateOldData();
        },

        // Get current user
        getCurrentUser: function() {
            try {
                const userData = localStorage.getItem('chatbot-current-user');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.error('Error getting current user:', error);
                return null;
            }
        },

        // Get all registered users
        getAllUsers: function() {
            try {
                const users = localStorage.getItem('chatbot-users');
                return users ? JSON.parse(users) : [];
            } catch (error) {
                console.error('Error getting all users:', error);
                return [];
            }
        },

        // Save user data
        saveUser: function(userData) {
            try {
                // Save current user
                localStorage.setItem('chatbot-current-user', JSON.stringify(userData));
                
                // Add to users list
                const users = this.getAllUsers();
                const existingIndex = users.findIndex(u => u.email === userData.email);
                
                if (existingIndex >= 0) {
                    users[existingIndex] = userData;
                } else {
                    users.push(userData);
                }
                
                localStorage.setItem('chatbot-users', JSON.stringify(users));
                
                console.log('✅ User data saved successfully');
                return true;
            } catch (error) {
                console.error('Error saving user data:', error);
                return false;
            }
        },

        // Check if user is registered
        isUserRegistered: function(email) {
            const users = this.getAllUsers();
            return users.some(user => user.email === email);
        },

        // Update user data
        updateUser: function(updates) {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;
            
            const updatedUser = { ...currentUser, ...updates };
            return this.saveUser(updatedUser);
        },

        // Get user preferences
        getUserPreferences: function() {
            const currentUser = this.getCurrentUser();
            return currentUser ? currentUser.preferences : {
                language: 'en',
                notifications: false
            };
        },

        // Migrate old data format
        migrateOldData: function() {
            // Check for old format data and migrate if needed
            const oldUser = localStorage.getItem('chatbot-user');
            if (oldUser && !this.getCurrentUser()) {
                try {
                    const userData = JSON.parse(oldUser);
                    // Convert to new format
                    const newUserData = {
                        id: userData.id || 'user_' + Date.now(),
                        name: userData.name || 'User',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        restaurant: userData.restaurant || {},
                        preferences: userData.preferences || { language: 'en', notifications: false },
                        registrationDate: userData.registrationDate || new Date().toISOString(),
                        status: 'active'
                    };
                    
                    this.saveUser(newUserData);
                    localStorage.removeItem('chatbot-user'); // Remove old format
                    console.log('✅ User data migrated to new format');
                } catch (error) {
                    console.error('Error migrating old user data:', error);
                }
            }
        },

        // Export user data
        exportUserData: function() {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return null;
            
            return {
                user: currentUser,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        },

        // Clear all user data
        clearUserData: function() {
            localStorage.removeItem('chatbot-current-user');
            localStorage.removeItem('chatbot-users');
            localStorage.removeItem('chatbot-user'); // Remove old format too
            console.log('🧹 User data cleared');
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        window.ChatbotRegistrationData.init();
    });

})();
