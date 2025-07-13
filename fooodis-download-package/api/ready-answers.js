
/**
 * Ready Answers API - Manages pre-defined chatbot responses
 */

const express = require('express');
const router = express.Router();

// Store for ready answers (in production, use a proper database)
const readyAnswers = new Map();

// Load existing ready answers from storage
function loadReadyAnswersFromStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const answersPath = path.join(__dirname, '../chatbot-ready-answers.json');

        if (fs.existsSync(answersPath)) {
            const data = fs.readFileSync(answersPath, 'utf8');
            const savedAnswers = JSON.parse(data);

            savedAnswers.forEach(answer => {
                readyAnswers.set(answer.id, answer);
            });

            console.log(`Loaded ${savedAnswers.length} ready answers from storage`);
        } else {
            // Create default ready answers
            createDefaultReadyAnswers();
        }
    } catch (error) {
        console.error('Error loading ready answers from storage:', error);
        createDefaultReadyAnswers();
    }
}

// Save ready answers to storage
function saveReadyAnswersToStorage() {
    try {
        const fs = require('fs');
        const path = require('path');
        const answersPath = path.join(__dirname, '../chatbot-ready-answers.json');

        const answersArray = Array.from(readyAnswers.values());
        fs.writeFileSync(answersPath, JSON.stringify(answersArray, null, 2));

        console.log(`Saved ${answersArray.length} ready answers to storage`);
    } catch (error) {
        console.error('Error saving ready answers to storage:', error);
    }
}

// Create default ready answers
function createDefaultReadyAnswers() {
    const defaultAnswers = [
        {
            id: 'btn_menu',
            label_en: 'Menu',
            label_sv: 'Meny',
            reply_en: 'You can view our full menu at [fooodis.com/menu](https://fooodis.com/menu). We offer a variety of delicious dishes made with fresh ingredients!',
            reply_sv: 'Du kan se vår fullständiga meny på [fooodis.com/menu](https://fooodis.com/menu). Vi erbjuder ett varierat utbud av läckra rätter gjorda med färska ingredienser!',
            visible: true,
            scenario_ids: ['default', 'welcome'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 'btn_hours',
            label_en: 'Hours',
            label_sv: 'Öppettider',
            reply_en: 'We are open Monday-Sunday from 10:00 AM to 10:00 PM. We also offer 24/7 online ordering through our platform!',
            reply_sv: 'Vi har öppet måndag-söndag från 10:00 till 22:00. Vi erbjuder även 24/7 onlinebeställning genom vår plattform!',
            visible: true,
            scenario_ids: ['default', 'welcome'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 'btn_location',
            label_en: 'Location',
            label_sv: 'Plats',
            reply_en: 'We are conveniently located in the heart of the city. You can find us through our restaurant locator at [fooodis.com/locations](https://fooodis.com/locations).',
            reply_sv: 'Vi ligger bekvämt i hjärtat av staden. Du kan hitta oss genom vår restauranglokaliserare på [fooodis.com/locations](https://fooodis.com/locations).',
            visible: true,
            scenario_ids: ['default', 'welcome'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 'btn_contact',
            label_en: 'Contact',
            label_sv: 'Kontakt',
            reply_en: 'You can reach us at info@fooodis.com or call us at +46 8 123 456 78. We\'re here to help with any questions!',
            reply_sv: 'Du kan nå oss på info@fooodis.com eller ring oss på +46 8 123 456 78. Vi är här för att hjälpa till med alla frågor!',
            visible: true,
            scenario_ids: ['default', 'welcome'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 'btn_delivery',
            label_en: 'Delivery',
            label_sv: 'Leverans',
            reply_en: 'We offer delivery daily between 11:00 AM - 9:30 PM. Delivery time is typically 30-45 minutes depending on your location.',
            reply_sv: 'Vi erbjuder leverans dagligen mellan 11:00 - 21:30. Leveranstiden är vanligtvis 30-45 minuter beroende på din plats.',
            visible: true,
            scenario_ids: ['default', 'delivery'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        },
        {
            id: 'btn_pricing',
            label_en: 'Pricing',
            label_sv: 'Priser',
            reply_en: 'Our pricing is competitive and transparent. You can see all prices on our menu. We also offer special deals and discounts for regular customers!',
            reply_sv: 'Våra priser är konkurrenskraftiga och transparenta. Du kan se alla priser på vår meny. Vi erbjuder även specialerbjudanden och rabatter för stamkunder!',
            visible: true,
            scenario_ids: ['default', 'pricing'],
            createdBy: 'system',
            createdAt: new Date().toISOString()
        }
    ];

    defaultAnswers.forEach(answer => {
        readyAnswers.set(answer.id, answer);
    });

    saveReadyAnswersToStorage();
    console.log('Created default ready answers');
}

// Load ready answers on startup
loadReadyAnswersFromStorage();

// Get all ready answers
router.get('/', (req, res) => {
    try {
        const answersArray = Array.from(readyAnswers.values());
        res.json({
            success: true,
            answers: answersArray
        });
    } catch (error) {
        console.error('Error fetching ready answers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ready answers'
        });
    }
});

// Get ready answers by scenario
router.get('/scenario/:scenarioId', (req, res) => {
    try {
        const scenarioId = req.params.scenarioId;
        const answersArray = Array.from(readyAnswers.values())
            .filter(answer => answer.visible && answer.scenario_ids.includes(scenarioId));

        res.json({
            success: true,
            answers: answersArray,
            scenario: scenarioId
        });
    } catch (error) {
        console.error('Error fetching ready answers by scenario:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ready answers'
        });
    }
});

// Create new ready answer
router.post('/', (req, res) => {
    try {
        const {
            label_en,
            label_sv,
            reply_en,
            reply_sv,
            scenario_ids = ['default'],
            visible = true
        } = req.body;

        if (!label_en || !label_sv || !reply_en || !reply_sv) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: label_en, label_sv, reply_en, reply_sv'
            });
        }

        const answerId = 'btn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const newAnswer = {
            id: answerId,
            label_en,
            label_sv,
            reply_en,
            reply_sv,
            visible,
            scenario_ids,
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        readyAnswers.set(answerId, newAnswer);
        saveReadyAnswersToStorage();

        res.json({
            success: true,
            message: 'Ready answer created successfully',
            answer: newAnswer
        });
    } catch (error) {
        console.error('Error creating ready answer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create ready answer'
        });
    }
});

// Update ready answer
router.put('/:answerId', (req, res) => {
    try {
        const answerId = req.params.answerId;
        
        if (!readyAnswers.has(answerId)) {
            return res.status(404).json({
                success: false,
                error: 'Ready answer not found'
            });
        }

        const existingAnswer = readyAnswers.get(answerId);
        const updatedAnswer = {
            ...existingAnswer,
            ...req.body,
            id: answerId, // Prevent ID changes
            updatedAt: new Date().toISOString()
        };

        readyAnswers.set(answerId, updatedAnswer);
        saveReadyAnswersToStorage();

        res.json({
            success: true,
            message: 'Ready answer updated successfully',
            answer: updatedAnswer
        });
    } catch (error) {
        console.error('Error updating ready answer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update ready answer'
        });
    }
});

// Delete ready answer
router.delete('/:answerId', (req, res) => {
    try {
        const answerId = req.params.answerId;
        
        if (!readyAnswers.has(answerId)) {
            return res.status(404).json({
                success: false,
                error: 'Ready answer not found'
            });
        }

        readyAnswers.delete(answerId);
        saveReadyAnswersToStorage();

        res.json({
            success: true,
            message: 'Ready answer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting ready answer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete ready answer'
        });
    }
});

// AI suggestion endpoint
router.post('/suggest', async (req, res) => {
    try {
        const { prompt, language = 'en' } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        // Get AI suggestion (mock implementation - replace with actual AI call)
        const suggestion = await generateAISuggestion(prompt, language);

        res.json({
            success: true,
            suggestion
        });
    } catch (error) {
        console.error('Error generating AI suggestion:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate AI suggestion'
        });
    }
});

// Mock AI suggestion function (replace with actual OpenAI integration)
async function generateAISuggestion(prompt, language) {
    // This would integrate with OpenAI API using existing configuration
    const suggestions = {
        'delivery info': {
            label_en: 'Delivery',
            label_sv: 'Leverans',
            reply_en: 'We deliver daily between 10AM–9PM with an average delivery time of 30-45 minutes.',
            reply_sv: 'Vi levererar dagligen mellan 10–21 med en genomsnittlig leveranstid på 30-45 minuter.'
        },
        'payment methods': {
            label_en: 'Payment',
            label_sv: 'Betalning',
            reply_en: 'We accept all major credit cards, mobile payments, and cash on delivery.',
            reply_sv: 'Vi accepterar alla större kreditkort, mobilbetalningar och kontant vid leverans.'
        },
        'allergies': {
            label_en: 'Allergies',
            label_sv: 'Allergier',
            reply_en: 'Please inform us of any allergies when ordering. We can accommodate most dietary restrictions.',
            reply_sv: 'Vänligen informera oss om eventuella allergier när du beställer. Vi kan tillgodose de flesta kostbegränsningar.'
        }
    };

    const lowerPrompt = prompt.toLowerCase();
    for (const [key, suggestion] of Object.entries(suggestions)) {
        if (lowerPrompt.includes(key.toLowerCase())) {
            return suggestion;
        }
    }

    // Default suggestion
    return {
        label_en: 'Help',
        label_sv: 'Hjälp',
        reply_en: 'I\'m here to help you with any questions about our services.',
        reply_sv: 'Jag är här för att hjälpa dig med alla frågor om våra tjänster.'
    };
}

module.exports = router;
