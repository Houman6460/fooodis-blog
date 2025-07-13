console.log('=== CHATBOT DEBUG INFO ===');
console.log('Registration Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]'));
console.log('Conversation Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]'));
console.log('Current User:', JSON.parse(localStorage.getItem('chatbot-current-user') || 'null'));
console.log('All Users:', JSON.parse(localStorage.getItem('chatbot-users') || '[]'));

// Clear all chatbot registration data
console.log('=== CLEARING CHATBOT DATA ===');
localStorage.removeItem('fooodis-chatbot-registrations');
localStorage.removeItem('fooodis-chatbot-conversations');


function completeReset() {
    console.log('🧹 COMPLETE CHATBOT RESET - Clearing all data...');

    // Clear ALL possible user data keys
    const keysToRemove = [
        'chatbot-current-user',
        'chatbot-user-data',
        'chatbot-users',
        'chatbot-registrations',
        'chatbot-user',
        'fooodis-chatbot-registrations',
        'fooodis-chatbot-conversations', 
        'fooodis-user-name',
        'fooodis-restaurant-name',
        'fooodis-language',
        'fooodis-user-email',
        'chatbot-session-id',
        'chatbot-device-id',
        'user-leads',
        'last-user-identity',
        'current-user-identity',
        'chatbot-widget-avatar',
        'chatbot-avatar-settings'
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    // Reset window objects
    if (window.FoodisChatbot) {
        window.FoodisChatbot.userRegistered = false;
        window.FoodisChatbot.userInfo = null;
        window.FoodisChatbot.userName = null;
        window.FoodisChatbot.restaurantName = null;
        window.FoodisChatbot.conversationPhase = 'welcome';
        console.log('🔄 Reset chatbot widget state');
    }

    // Clear global identity data
    window.currentUserIdentity = null;

    console.log('✅ Complete reset finished - you are now a completely new user');

    // Force show registration form after a short delay
    setTimeout(() => {
        if (window.ChatbotRegistrationForm) {
            console.log('📋 Force showing registration form...');
            window.ChatbotRegistrationForm.showRegistrationForm();
        } else {
            console.warn('⚠️ Registration form system not available');
        }
    }, 1000);
}

function testRegistrationForm() {
    console.log('🧪 Testing registration form...');
    completeReset();
}

// Make functions globally accessible
window.testRegistrationForm = testRegistrationForm;
window.completeReset = completeReset;

console.log('🧪 Run completeReset() or testRegistrationForm() in console to show the registration form');
console.log('✅ Chatbot debug tools loaded');