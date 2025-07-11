
#!/usr/bin/env node

/**
 * Reset script for testing as a new user
 * Clears all stored data and restarts server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 RESETTING SERVER FOR NEW USER TESTING...\n');

// 1. Clear JSON data files
const dataFiles = [
    'chatbot-conversations.json',
    'chatbot-users.json', 
    'chatbot-ratings.json',
    'chatbot-conversations-corrupted.json',
    'data/tickets.json'
];

dataFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        try {
            if (file.includes('tickets')) {
                fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            } else {
                fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            }
            console.log(`✅ Cleared ${file}`);
        } catch (error) {
            console.log(`⚠️ Could not clear ${file}:`, error.message);
        }
    }
});

// 2. Reset chatbot config to default state
const defaultChatbotConfig = {
    "enabled": false,
    "openaiApiKey": "",
    "defaultModel": "gpt-4",
    "chatbotName": "Fooodis Assistant",
    "welcomeMessage": "Hello! I'm your Fooodis assistant. How can I help you today?",
    "assistants": []
};

try {
    fs.writeFileSync('chatbot-config.json', JSON.stringify(defaultChatbotConfig, null, 2));
    console.log('✅ Reset chatbot-config.json');
} catch (error) {
    console.log('⚠️ Could not reset chatbot config:', error.message);
}

// 3. Create localStorage clearing script for frontend
const frontendResetScript = `
// Frontend data reset script
console.log('🧹 Clearing all frontend localStorage data...');

// Clear all chatbot-related localStorage keys
const keysToRemove = [
    'chatbot-current-user',
    'chatbot-registrations', 
    'chatbot-conversations',
    'chatbot-session-id',
    'chatbot-device-id',
    'fooodis-user-name',
    'fooodis-user-email',
    'fooodis-restaurant-name',
    'fooodis-language',
    'fooodis-chatbot-conversations',
    'fooodis-chatbot-settings',
    'fooodis-chatbot-assistants',
    'fooodis-chatbot-scenarios',
    'fooodis-chatbot-analytics',
    'user-leads',
    'openai-api-key',
    'OPENAI_API_KEY',
    'aiConfig',
    'fooodis-aiConfig'
];

let clearedCount = 0;
keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log('🗑️ Removed:', key);
    }
});

// Clear all keys that start with 'fooodis-' or 'chatbot-'
for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('fooodis-') || key.startsWith('chatbot-'))) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log('🗑️ Removed pattern match:', key);
    }
}

console.log(\`✅ Cleared \${clearedCount} localStorage items\`);
console.log('🔄 Please refresh the page to complete reset');

// Also clear sessionStorage
sessionStorage.clear();
console.log('✅ Cleared sessionStorage');
`;

fs.writeFileSync('clear-frontend-data.js', frontendResetScript);
console.log('✅ Created frontend reset script');

// 4. Kill any running node processes and restart
console.log('\n🔄 Restarting server...');

try {
    // Kill existing node processes
    execSync('pkill -f "node server.js" || true', { stdio: 'inherit' });
    console.log('✅ Stopped existing server');
    
    // Wait a moment
    setTimeout(() => {
        console.log('🚀 Server reset complete!');
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Run: node server.js');
        console.log('2. Open browser and run: node clear-frontend-data.js');
        console.log('3. Refresh the page');
        console.log('4. Test as a new user - registration form should appear');
        console.log('\n🎯 The system is now reset for new user testing!');
    }, 1000);
    
} catch (error) {
    console.log('⚠️ Could not restart server automatically:', error.message);
    console.log('📋 Manual steps:');
    console.log('1. Stop the current server (Ctrl+C)');
    console.log('2. Run: node server.js');
    console.log('3. Clear frontend data as instructed above');
}
