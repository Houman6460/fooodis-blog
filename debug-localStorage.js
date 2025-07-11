
console.log('=== CHATBOT DEBUG INFO ===');
console.log('Registration Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]'));
console.log('Conversation Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]'));
console.log('Current User:', JSON.parse(localStorage.getItem('chatbot-current-user') || 'null'));
console.log('All Users:', JSON.parse(localStorage.getItem('chatbot-users') || '[]'));

// Clear all chatbot registration data
console.log('=== CLEARING CHATBOT DATA ===');
localStorage.removeItem('fooodis-chatbot-registrations');
localStorage.removeItem('fooodis-chatbot-conversations');


// Test registration form
function testRegistrationForm() {
    console.log('🧪 Testing registration form...');
    
    // Clear user data to simulate new user
    localStorage.removeItem('chatbot-current-user');
    localStorage.removeItem('chatbot-user-data');
    localStorage.removeItem('chatbot-registrations');
    
    console.log('🧹 Cleared user data');
    
    // Force show registration form
    if (window.ChatbotRegistrationForm) {
        console.log('📋 Showing registration form...');
        window.ChatbotRegistrationForm.showRegistrationForm();
    } else {
        console.error('❌ ChatbotRegistrationForm not available');
    }
}

// Make it globally accessible
window.testRegistrationForm = testRegistrationForm;
console.log('🧪 Run testRegistrationForm() to manually show the registration form');

localStorage.removeItem('chatbot-current-user');
localStorage.removeItem('chatbot-users');
localStorage.removeItem('chatbot-user'); // Remove old format too
localStorage.removeItem('chatbot-registrations'); // Alternative key

console.log('✅ Chatbot data cleared - you are now a new user');
console.log('=== END DEBUG INFO ===');
