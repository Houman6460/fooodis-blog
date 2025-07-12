const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;

// Configure express to trust proxy for proper IP detection (more secure setting)
app.set('trust proxy', 1);

// Rate limiting with proper proxy support (relaxed for development testing)
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes (reduced window)
    max: 5000, // limit each IP to 5000 requests per windowMs (increased for testing)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: false, // Disable trust proxy for rate limiter to avoid security issues
});

app.use(limiter);

// Enhanced CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Import API routes with error handling
let chatbotAPI, systemHealthAPI, databaseAPI, recoveryAPI;

try {
    chatbotAPI = require('./api/chatbot');
} catch (error) {
    console.warn('Warning: Failed to load chatbot API:', error.message);
    chatbotAPI = require('express').Router();
}

try {
    systemHealthAPI = require('./api/system-health');
} catch (error) {
    console.warn('Warning: Failed to load system-health API:', error.message);
    systemHealthAPI = require('express').Router();
}

try {
    databaseAPI = require('./api/database');
} catch (error) {
    console.warn('Warning: Failed to load database API:', error.message);
    databaseAPI = require('express').Router();
}

try {
    recoveryAPI = require('./api/recovery');
} catch (error) {
    console.warn('Warning: Failed to load recovery API:', error.message);
    recoveryAPI = require('express').Router();
}

// API routes - only mount if they are valid router functions
if (typeof chatbotAPI === 'function' || (chatbotAPI && typeof chatbotAPI.handle === 'function')) {
    app.use('/api/chatbot', chatbotAPI);
}

if (typeof systemHealthAPI === 'function' || (systemHealthAPI && typeof systemHealthAPI.handle === 'function')) {
    app.use('/api/system-health', systemHealthAPI);
}

if (typeof databaseAPI === 'function' || (databaseAPI && typeof databaseAPI.handle === 'function')) {
    app.use('/api/database', databaseAPI);
}

if (typeof recoveryAPI === 'function' || (recoveryAPI && typeof recoveryAPI.handle === 'function')) {
    app.use('/api/recovery', recoveryAPI);
}

// Serve static files from the current directory
// Note: Static serving is now handled by express.static('.') above

// Start the server
app.listen(PORT, () => {
  console.log(`Fooodis Blog System server running on http://localhost:${PORT}`);
  console.log(`- Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`- Login: http://localhost:${PORT}/login.html`);
  console.log(`- Profile: http://localhost:${PORT}/profile.html`);
  console.log(`- API Health: http://localhost:${PORT}/api/system-health`);
});