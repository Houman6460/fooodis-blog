
/**
 * Chatbot Registration Data Management
 * Handles storage, retrieval, and processing of user registration data
 */

(function() {
    'use strict';

    const RegistrationDataManager = {
        
        // Get all registrations
        getAllRegistrations() {
            try {
                return JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]');
            } catch (error) {
                console.error('Error loading registrations:', error);
                return [];
            }
        },

        // Get current user from session
        getCurrentUser() {
            try {
                const userData = sessionStorage.getItem('fooodis-current-user');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.error('Error loading current user:', error);
                return null;
            }
        },

        // Get registrations by date range
        getRegistrationsByDateRange(startDate, endDate) {
            const registrations = this.getAllRegistrations();
            return registrations.filter(reg => {
                const regDate = new Date(reg.timestamp);
                return regDate >= startDate && regDate <= endDate;
            });
        },

        // Get registrations by lead score
        getRegistrationsByLeadScore(minScore = 0) {
            const registrations = this.getAllRegistrations();
            return registrations.filter(reg => (reg.leadScore || 0) >= minScore)
                .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
        },

        // Get registrations by system usage type
        getRegistrationsByUsageType(usageType) {
            const registrations = this.getAllRegistrations();
            return registrations.filter(reg => reg.systemUsage === usageType);
        },

        // Get registration statistics
        getRegistrationStats() {
            const registrations = this.getAllRegistrations();
            const total = registrations.length;
            
            if (total === 0) {
                return {
                    total: 0,
                    byUsageType: {},
                    byLanguage: {},
                    averageLeadScore: 0,
                    todayCount: 0,
                    weekCount: 0
                };
            }

            // Count by usage type
            const byUsageType = {};
            registrations.forEach(reg => {
                byUsageType[reg.systemUsage] = (byUsageType[reg.systemUsage] || 0) + 1;
            });

            // Count by language
            const byLanguage = {};
            registrations.forEach(reg => {
                byLanguage[reg.language] = (byLanguage[reg.language] || 0) + 1;
            });

            // Calculate average lead score
            const totalLeadScore = registrations.reduce((sum, reg) => sum + (reg.leadScore || 0), 0);
            const averageLeadScore = Math.round(totalLeadScore / total);

            // Count recent registrations
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            const todayCount = registrations.filter(reg => 
                new Date(reg.timestamp) >= today
            ).length;

            const weekCount = registrations.filter(reg => 
                new Date(reg.timestamp) >= weekAgo
            ).length;

            return {
                total,
                byUsageType,
                byLanguage,
                averageLeadScore,
                todayCount,
                weekCount
            };
        },

        // Export registration data
        exportRegistrations(format = 'json') {
            const registrations = this.getAllRegistrations();
            
            if (format === 'csv') {
                return this.convertToCSV(registrations);
            }
            
            return JSON.stringify(registrations, null, 2);
        },

        // Convert to CSV format
        convertToCSV(registrations) {
            if (registrations.length === 0) return '';
            
            const headers = ['Name', 'Email', 'Phone', 'Company', 'Usage Type', 'Language', 'Lead Score', 'Date'];
            const csvRows = [headers.join(',')];
            
            registrations.forEach(reg => {
                const row = [
                    `"${reg.fullName || ''}"`,
                    `"${reg.email || ''}"`,
                    `"${reg.phone || ''}"`,
                    `"${reg.company || ''}"`,
                    `"${reg.systemUsage || ''}"`,
                    `"${reg.language || ''}"`,
                    reg.leadScore || 0,
                    `"${new Date(reg.timestamp).toLocaleDateString()}"`
                ];
                csvRows.push(row.join(','));
            });
            
            return csvRows.join('\n');
        },

        // Clear all registration data
        clearAllRegistrations() {
            if (confirm('Are you sure you want to clear all registration data? This action cannot be undone.')) {
                localStorage.removeItem('fooodis-chatbot-registrations');
                sessionStorage.removeItem('fooodis-current-user');
                console.log('All registration data cleared');
                return true;
            }
            return false;
        },

        // Update registration data
        updateRegistration(email, updates) {
            try {
                const registrations = this.getAllRegistrations();
                const index = registrations.findIndex(reg => reg.email === email);
                
                if (index !== -1) {
                    registrations[index] = { ...registrations[index], ...updates };
                    localStorage.setItem('fooodis-chatbot-registrations', JSON.stringify(registrations));
                    
                    // Update current user if it's the same user
                    const currentUser = this.getCurrentUser();
                    if (currentUser && currentUser.email === email) {
                        sessionStorage.setItem('fooodis-current-user', JSON.stringify(registrations[index]));
                    }
                    
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Error updating registration:', error);
                return false;
            }
        },

        // Generate registration report for dashboard
        generateDashboardReport() {
            const stats = this.getRegistrationStats();
            const highValueLeads = this.getRegistrationsByLeadScore(80);
            const recentRegistrations = this.getRegistrationsByDateRange(
                new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                new Date()
            );

            return {
                summary: {
                    totalRegistrations: stats.total,
                    todayRegistrations: stats.todayCount,
                    weekRegistrations: stats.weekCount,
                    averageLeadScore: stats.averageLeadScore
                },
                usageBreakdown: stats.byUsageType,
                languageBreakdown: stats.byLanguage,
                highValueLeads: highValueLeads.slice(0, 10), // Top 10
                recentActivity: recentRegistrations.slice(0, 5) // Last 5
            };
        }
    };

    // Expose globally for dashboard use
    window.FoodisRegistrationData = RegistrationDataManager;

    // Initialize and log current stats
    console.log('📊 Registration Data Manager initialized');
    const stats = RegistrationDataManager.getRegistrationStats();
    if (stats.total > 0) {
        console.log(`📈 Total registrations: ${stats.total}, Today: ${stats.todayCount}, Week: ${stats.weekCount}`);
    }

})();
