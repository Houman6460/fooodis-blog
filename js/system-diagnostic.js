
// System Diagnostic Tool - Comprehensive system health check
(function() {
    'use strict';
    
    console.log('System Diagnostic: Initializing comprehensive system check');
    
    window.runSystemDiagnostic = function() {
        console.log('=== FOOODIS SYSTEM DIAGNOSTIC REPORT ===');
        
        const report = {
            timestamp: new Date().toISOString(),
            authentication: checkAuthentication(),
            coreObjects: checkCoreObjects(),
            fileStatus: checkFileStatus(),
            localStorage: checkLocalStorage(),
            networkStatus: checkNetworkStatus(),
            errors: getRecentErrors(),
            recommendations: []
        };
        
        // Generate recommendations
        generateRecommendations(report);
        
        // Display report
        displayDiagnosticReport(report);
        
        return report;
    };
    
    function checkAuthentication() {
        const authStatus = {
            isLoggedIn: !!window.currentUser,
            hasToken: !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken')),
            userInfo: window.currentUser || null,
            loginFunctions: {
                loginUser: typeof window.loginUser === 'function',
                logoutUser: typeof window.logoutUser === 'function'
            }
        };
        
        console.log('Auth Status:', authStatus);
        return authStatus;
    }
    
    function checkCoreObjects() {
        const objects = {
            FoodisChatbot: {
                exists: !!window.FoodisChatbot,
                hasApi: !!(window.FoodisChatbot && window.FoodisChatbot.api),
                methods: window.FoodisChatbot?.api ? Object.keys(window.FoodisChatbot.api) : []
            },
            FoodisAutomation: {
                exists: !!window.FoodisAutomation,
                hasScheduler: !!(window.FoodisAutomation && window.FoodisAutomation.scheduler),
                methods: window.FoodisAutomation?.scheduler ? Object.keys(window.FoodisAutomation.scheduler) : []
            },
            FoodisConfig: {
                exists: !!window.FoodisConfig,
                hasAI: !!(window.FoodisConfig && window.FoodisConfig.ai),
                isConfigured: window.FoodisConfig?.ai?.isConfigured?.() || false
            },
            MediaManager: {
                exists: !!window.MediaManager,
                methods: window.MediaManager ? Object.keys(window.MediaManager) : []
            },
            DashboardManager: {
                exists: !!window.DashboardManager,
                initialized: window.DashboardManager?.initialized || false
            }
        };
        
        console.log('Core Objects:', objects);
        return objects;
    }
    
    function checkFileStatus() {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const loadedScripts = scripts.map(script => ({
            src: script.src,
            loaded: !script.hasAttribute('data-error')
        }));
        
        console.log('Loaded Scripts:', loadedScripts);
        return { scripts: loadedScripts, total: scripts.length };
    }
    
    function checkLocalStorage() {
        const storageData = {};
        const keys = [
            'authToken', 'userInfo', 'openai_api_key', 'aiConfig',
            'aiAutomationPaths', 'chatConversations', 'scheduledTasks',
            'mediaFiles'
        ];
        
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            storageData[key] = {
                exists: !!value,
                size: value ? value.length : 0,
                type: value ? (value.startsWith('{') || value.startsWith('[') ? 'JSON' : 'String') : null
            };
        });
        
        console.log('LocalStorage Data:', storageData);
        return storageData;
    }
    
    function checkNetworkStatus() {
        return {
            online: navigator.onLine,
            userAgent: navigator.userAgent,
            location: window.location.href
        };
    }
    
    function getRecentErrors() {
        if (window.errorTracker) {
            return {
                totalErrors: window.errorTracker.errors.length,
                recentErrors: window.errorTracker.errors.slice(-5),
                commonPatterns: Array.from(window.errorTracker.patterns.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
            };
        }
        return { message: 'Error tracker not available' };
    }
    
    function generateRecommendations(report) {
        const recommendations = [];
        
        // Authentication recommendations
        if (!report.authentication.isLoggedIn) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Authentication',
                issue: 'User not logged in',
                solution: 'Navigate to login.html and enter credentials (try: admin/admin123)'
            });
        }
        
        // Core objects recommendations
        if (!report.coreObjects.FoodisChatbot.exists) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Core System',
                issue: 'FoodisChatbot object missing',
                solution: 'Load missing-functionality-fix.js to restore chatbot functionality'
            });
        }
        
        // Configuration recommendations
        if (!report.coreObjects.FoodisConfig.isConfigured) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Configuration',
                issue: 'AI system not configured',
                solution: 'Add OpenAI API key in AI configuration section'
            });
        }
        
        // Storage recommendations
        if (!report.localStorage.authToken.exists) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Authentication',
                issue: 'No auth token in storage',
                solution: 'Login required to establish session'
            });
        }
        
        report.recommendations = recommendations;
    }
    
    function displayDiagnosticReport(report) {
        console.log('\n=== DIAGNOSTIC SUMMARY ===');
        console.log('Authentication:', report.authentication.isLoggedIn ? '✅ Logged In' : '❌ Not Logged In');
        console.log('Core Objects:', Object.values(report.coreObjects).every(obj => obj.exists) ? '✅ All Present' : '⚠️ Some Missing');
        console.log('Local Storage:', Object.values(report.localStorage).some(item => item.exists) ? '✅ Data Present' : '❌ No Data');
        
        if (report.recommendations.length > 0) {
            console.log('\n=== RECOMMENDATIONS ===');
            report.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
                console.log(`   Solution: ${rec.solution}`);
            });
        }
        
        console.log('\n=== QUICK FIXES ===');
        console.log('1. Login: window.loginUser("admin", "admin123")');
        console.log('2. Run diagnostic: window.runSystemDiagnostic()');
        console.log('3. Clear storage: localStorage.clear()');
        console.log('4. Reload page: location.reload()');
    }
    
    // Auto-run diagnostic on load (delayed)
    setTimeout(() => {
        console.log('System Diagnostic: Running automatic system check...');
        window.runSystemDiagnostic();
    }, 3000);
    
    // Keyboard shortcut for manual diagnostic
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            window.runSystemDiagnostic();
        }
    });
    
    console.log('System Diagnostic: Tool initialized. Press Ctrl+Shift+D for manual check.');
})();
