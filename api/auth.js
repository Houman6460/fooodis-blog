/**
 * Authentication API for Customer Portal
 * Handles user registration, login, and session management
 */

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// In-memory user store (in production, use a proper database)
let users = [];
let userIdCounter = 1;

// Initialize with default admin user
async function initializeDefaultUser() {
    const defaultAdmin = {
        id: userIdCounter++,
        name: 'Logoland Admin',
        email: 'info@logoland.se',
        password: await hashPassword('Ejimineh1236460'),
        createdAt: new Date().toISOString(),
        isActive: true,
        isAdmin: true
    };
    users.push(defaultAdmin);
    console.log('Default admin user initialized: info@logoland.se');
}

// Initialize default user on startup
initializeDefaultUser().catch(console.error);

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'fooodis-customer-portal-secret-key';

/**
 * Generate JWT token for user
 */
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            name: user.name 
        }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
    );
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify password using bcrypt
 */
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Middleware to verify JWT token
 */
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

/**
 * Register new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ 
                message: 'An account with this email already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create new user
        const newUser = {
            id: userIdCounter++,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        users.push(newUser);
        
        // Generate token
        const token = generateToken(newUser);
        
        // Return user data (without password)
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
        
        res.status(201).json({
            message: 'Account created successfully',
            user: userResponse,
            token: token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed. Please try again.' 
        });
    }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account is inactive. Please contact support.' 
            });
        }
        
        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Return user data (without password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        
        res.json({
            message: 'Login successful',
            user: userResponse,
            token: token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed. Please try again.' 
        });
    }
});

/**
 * Get current user profile
 */
router.get('/profile', verifyToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        
        res.json({ user: userResponse });
        
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch profile' 
        });
    }
});

/**
 * Update user profile
 */
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        
        const user = users.find(u => u.id === req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update name if provided
        if (name && name.trim() !== user.name) {
            user.name = name.trim();
        }
        
        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ 
                    message: 'Current password is required to set new password' 
                });
            }
            
            const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ 
                    message: 'Current password is incorrect' 
                });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    message: 'New password must be at least 6 characters long' 
                });
            }
            
            user.password = await hashPassword(newPassword);
        }
        
        user.updatedAt = new Date().toISOString();
        
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            message: 'Failed to update profile' 
        });
    }
});

/**
 * Verify token endpoint
 */
router.post('/verify', verifyToken, (req, res) => {
    res.json({ 
        message: 'Token is valid',
        user: req.user 
    });
});

/**
 * Get all users (for admin purposes - in production, add admin auth)
 */
router.get('/users', (req, res) => {
    const userList = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        isActive: user.isActive
    }));
    
    res.json({ users: userList });
});

// Export the router and middleware
module.exports = {
    router,
    verifyToken,
    findUserByEmail
};
