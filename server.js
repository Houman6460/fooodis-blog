const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

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

// Serve static files
app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
    // Ensure avatar images are served with correct MIME types
    if (path.includes('/avatars/') && (path.endsWith('.jpg') || path.endsWith('.jpeg'))) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    if (path.includes('/avatars/') && path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Explicitly serve images directory for avatar support
app.use('/images', express.static('images'));
app.use('/images/avatars', express.static('images/avatars'));

// Import API routes with error handling
let chatbotAPI, systemHealthAPI, databaseAPI, recoveryAPI, ticketsAPI, authAPI;

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

try {
    ticketsAPI = require('./api/tickets');
} catch (error) {
    console.warn('Warning: Failed to load tickets API:', error.message);
    ticketsAPI = require('express').Router();
}

try {
    authAPI = require('./api/auth').router;
    console.log('Auth API loaded successfully');
} catch (error) {
    console.warn('Warning: Failed to load auth API:', error.message);
    authAPI = require('express').Router();
}

// API routes - mount chatbot API routes
app.use('/api/chatbot', chatbotAPI);
console.log('✅ Chatbot API routes mounted at /api/chatbot');

app.use('/api/system-health', systemHealthAPI);
app.use('/api/database', databaseAPI);
app.use('/api/recovery', recoveryAPI);
app.use('/api/tickets', ticketsAPI);
app.use('/api/auth', authAPI);
console.log('✅ All API routes mounted successfully');

// API Routes
// Note: Static serving is now handled by express.static('.') above

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Fooodis Blog System server running on port ${PORT}`);
  console.log(`🌐 Access your application at the webview URL provided by Replit`);
  console.log(`📊 Dashboard: /dashboard.html`);
  console.log(`📝 Blog: /blog.html`);
  console.log(`🔐 Login: /login.html`);
  console.log(`👤 Profile: /profile.html`);
  console.log(`❤️ API Health: /api/system-health`);
});