const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// File paths
const CONVERSATIONS_FILE = path.join(__dirname, '../chatbot-conversations.json');
const RATINGS_FILE = path.join(__dirname, '../chatbot-ratings.json');
const USERS_FILE = path.join(__dirname, '../chatbot-users.json');

// Helper function to read JSON file
async function readJSONFile(filePath, defaultValue = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(`File ${filePath} not found or invalid, using default value`);
        return defaultValue;
    }
}

// Helper function to write JSON file
async function writeJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        return false;
    }
}

// Get all conversations
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await readJSONFile(CONVERSATIONS_FILE, []);
        res.json({
            success: true,
            conversations: conversations
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversations'
        });
    }
});

// Save conversation
router.post('/conversations', async (req, res) => {
    try {
        const { conversation } = req.body;

        if (!conversation || !conversation.id) {
            return res.status(400).json({
                success: false,
                error: 'Invalid conversation data'
            });
        }

        const conversations = await readJSONFile(CONVERSATIONS_FILE, []);

        // Find existing conversation or add new one
        const existingIndex = conversations.findIndex(c => c.id === conversation.id);

        if (existingIndex !== -1) {
            conversations[existingIndex] = {
                ...conversations[existingIndex],
                ...conversation,
                updated: new Date().toISOString()
            };
        } else {
            conversations.push({
                ...conversation,
                created: new Date().toISOString()
            });
        }

        const success = await writeJSONFile(CONVERSATIONS_FILE, conversations);

        if (success) {
            res.json({
                success: true,
                message: 'Conversation saved successfully'
            });
        } else {
            throw new Error('Failed to write conversation file');
        }
    } catch (error) {
        console.error('Error saving conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save conversation'
        });
    }
});

// Get conversation by ID
router.get('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conversations = await readJSONFile(CONVERSATIONS_FILE, []);

        const conversation = conversations.find(c => c.id.toString() === id);

        if (conversation) {
            res.json({
                success: true,
                conversation: conversation
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversation'
        });
    }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conversations = await readJSONFile(CONVERSATIONS_FILE, []);

        const filteredConversations = conversations.filter(c => c.id.toString() !== id);

        if (filteredConversations.length < conversations.length) {
            const success = await writeJSONFile(CONVERSATIONS_FILE, filteredConversations);

            if (success) {
                res.json({
                    success: true,
                    message: 'Conversation deleted successfully'
                });
            } else {
                throw new Error('Failed to write conversation file');
            }
        } else {
            res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete conversation'
        });
    }
});

// Get chatbot statistics
router.get('/stats', async (req, res) => {
    try {
        const conversations = await readJSONFile(CONVERSATIONS_FILE, []);
        const ratings = await readJSONFile(RATINGS_FILE, []);

        const stats = {
            totalConversations: conversations.length,
            totalMessages: conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0),
            averageRating: ratings.length > 0 ? 
                ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0,
            totalRatings: ratings.length,
            conversationsToday: conversations.filter(conv => {
                const today = new Date().toDateString();
                const convDate = new Date(conv.created).toDateString();
                return today === convDate;
            }).length
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Save rating
router.post('/ratings', async (req, res) => {
    try {
        const { conversationId, rating, feedback } = req.body;

        if (!conversationId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const ratings = await readJSONFile(RATINGS_FILE, []);

        const newRating = {
            id: Date.now(),
            conversationId,
            rating: parseInt(rating),
            feedback: feedback || '',
            created: new Date().toISOString()
        };

        ratings.push(newRating);

        const success = await writeJSONFile(RATINGS_FILE, ratings);

        if (success) {
            res.json({
                success: true,
                message: 'Rating saved successfully'
            });
        } else {
            throw new Error('Failed to write ratings file');
        }
    } catch (error) {
        console.error('Error saving rating:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save rating'
        });
    }
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationId, assistantId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // This would integrate with OpenAI or other AI service
        // For now, return a simple response
        const responses = [
            "Thank you for your message. A customer service representative will be with you shortly.",
            "I understand your concern. Let me help you with that.",
            "That's a great question! Let me find the best answer for you.",
            "I'd be happy to assist you with that request."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        res.json({
            success: true,
            response: randomResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process chat message'
        });
    }
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Chatbot API is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;