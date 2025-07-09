
// AI Automation V2 - Enhanced automation system
class AIAutomationV2 {
    constructor() {
        this.automations = [];
        this.isInitialized = false;
        this.initializeSystem();
    }

    initializeSystem() {
        if (this.isInitialized) return;
        
        console.log('AI Automation V2: Initializing system...');
        this.loadAutomations();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('AI Automation V2: System initialized successfully');
    }

    loadAutomations() {
        try {
            const saved = localStorage.getItem('aiAutomationV2Paths');
            if (saved) {
                this.automations = JSON.parse(saved);
                console.log('AI Automation V2: Loaded', this.automations.length, 'automations');
            }
        } catch (error) {
            console.error('AI Automation V2: Error loading automations:', error);
            this.automations = [];
        }
    }

    saveAutomations() {
        try {
            localStorage.setItem('aiAutomationV2Paths', JSON.stringify(this.automations));
            console.log('AI Automation V2: Automations saved successfully');
        } catch (error) {
            console.error('AI Automation V2: Error saving automations:', error);
        }
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
        });
    }

    initializeUI() {
        const container = document.getElementById('ai-automation-v2-container');
        if (container) {
            this.renderAutomations(container);
        }
    }

    renderAutomations(container) {
        container.innerHTML = '';
        this.automations.forEach(automation => {
            const element = this.createAutomationElement(automation);
            container.appendChild(element);
        });
    }

    createAutomationElement(automation) {
        const div = document.createElement('div');
        div.className = 'automation-v2-item';
        div.innerHTML = `
            <h4>${automation.name || 'Unnamed Automation'}</h4>
            <p>Status: ${automation.status || 'Ready'}</p>
            <button onclick="aiAutomationV2.executeAutomation('${automation.id}')">Execute</button>
        `;
        return div;
    }

    executeAutomation(id) {
        const automation = this.automations.find(a => a.id === id);
        if (automation) {
            console.log('AI Automation V2: Executing automation:', automation.name);
            automation.status = 'Running';
            this.saveAutomations();
        }
    }
}

// Initialize global instance
window.aiAutomationV2 = new AIAutomationV2();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAutomationV2;
}
