
console.log('=== CHATBOT DEBUG INFO ===');
console.log('Registration Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-registrations') || '[]'));
console.log('Conversation Data:', JSON.parse(localStorage.getItem('fooodis-chatbot-conversations') || '[]'));
console.log('Current User:', JSON.parse(localStorage.getItem('chatbot-current-user') || 'null'));
console.log('All Users:', JSON.parse(localStorage.getItem('chatbot-users') || '[]'));

// Clear all chatbot registration data
console.log('=== CLEARING CHATBOT DATA ===');
localStorage.removeItem('fooodis-chatbot-registrations');
localStorage.removeItem('fooodis-chatbot-conversations');
localStorage.removeItem('chatbot-current-user');
localStorage.removeItem('chatbot-users');
localStorage.removeItem('chatbot-user'); // Remove old format too
localStorage.removeItem('chatbot-registrations'); // Alternative key

console.log('✅ Chatbot data cleared - you are now a new user');
console.log('=== END DEBUG INFO ===');
