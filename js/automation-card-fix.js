
// Automation Card Fix - Ensures proper display and functionality of automation cards
class AutomationCardFix {
    constructor() {
        this.cards = new Map();
        this.initialize();
    }

    initialize() {
        console.log('Automation Card Fix: Initializing...');
        this.fixExistingCards();
        this.setupCardObserver();
        this.setupEventListeners();
    }

    fixExistingCards() {
        const cards = document.querySelectorAll('.automation-card, .execution-status-card');
        cards.forEach(card => this.fixCard(card));
    }

    fixCard(card) {
        if (!card || !card.nodeType === Node.ELEMENT_NODE) return;

        // Fix card styling
        this.ensureCardStyling(card);
        
        // Fix card functionality
        this.ensureCardFunctionality(card);
        
        // Register card
        const cardId = card.dataset.cardId || this.generateCardId();
        card.dataset.cardId = cardId;
        this.cards.set(cardId, card);
        
        console.log('Automation Card Fix: Fixed card', cardId);
    }

    ensureCardStyling(card) {
        if (!card.classList.contains('automation-card-fixed')) {
            card.classList.add('automation-card-fixed');
            
            // Ensure proper display
            if (card.style.display === 'none') {
                card.style.display = 'block';
            }
        }
    }

    ensureCardFunctionality(card) {
        // Fix missing event listeners
        const buttons = card.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.hasAttribute('data-listener-attached')) {
                this.attachButtonListeners(button);
                button.setAttribute('data-listener-attached', 'true');
            }
        });
    }

    attachButtonListeners(button) {
        if (button.textContent.includes('Cancel')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleCancelAction(button);
            });
        } else if (button.textContent.includes('Execute')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleExecuteAction(button);
            });
        }
    }

    handleCancelAction(button) {
        const card = button.closest('.automation-card, .execution-status-card');
        if (card) {
            card.remove();
            this.cards.delete(card.dataset.cardId);
            console.log('Automation Card Fix: Card cancelled and removed');
        }
    }

    handleExecuteAction(button) {
        const card = button.closest('.automation-card, .execution-status-card');
        if (card) {
            console.log('Automation Card Fix: Executing automation from card');
            // Trigger automation execution
            this.executeAutomationFromCard(card);
        }
    }

    executeAutomationFromCard(card) {
        const pathId = card.dataset.pathId;
        if (pathId && window.aiAutomation) {
            window.aiAutomation.executeAutomationPath(pathId);
        }
    }

    setupCardObserver() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && (node.classList.contains('automation-card') || 
                            node.classList.contains('execution-status-card'))) {
                            this.fixCard(node);
                        }
                        
                        // Check for cards within added nodes
                        const nestedCards = node.querySelectorAll && 
                            node.querySelectorAll('.automation-card, .execution-status-card');
                        if (nestedCards) {
                            nestedCards.forEach(card => this.fixCard(card));
                        }
                    }
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.fixExistingCards();
        });
    }

    generateCardId() {
        return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCard(cardId) {
        return this.cards.get(cardId);
    }

    removeCard(cardId) {
        const card = this.cards.get(cardId);
        if (card) {
            card.remove();
            this.cards.delete(cardId);
        }
    }
}

// Initialize automation card fix
window.automationCardFix = new AutomationCardFix();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationCardFix;
}
