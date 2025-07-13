
/**
 * Standalone V2 Section Manager
 * Handles independent V2 chatbot sections and components
 */

class StandaloneV2Section {
    constructor() {
        this.components = new Map();
        this.initialized = false;
        this.init();
    }

    init() {
        console.log('🔧 Standalone V2: Initializing...');
        this.setupStandaloneSections();
        this.initializeComponents();
        this.setupEventHandlers();
        this.initialized = true;
    }

    setupStandaloneSections() {
        // Node Flow Builder Canvas
        this.registerComponent('node-flow-canvas', {
            type: 'canvas',
            requires: ['NodeFlowBuilder'],
            initialize: this.initNodeFlowCanvas.bind(this)
        });

        // Chatbot Scenarios Panel
        this.registerComponent('chatbot-scenarios-standalone', {
            type: 'panel',
            requires: [],
            initialize: this.initScenariosPanel.bind(this)
        });

        // Visual Flow Toolbar
        this.registerComponent('flow-toolbar-standalone', {
            type: 'toolbar',
            requires: ['NodeFlowBuilder'],
            initialize: this.initFlowToolbar.bind(this)
        });

        // Agent Management Section
        this.registerComponent('agent-management-standalone', {
            type: 'management',
            requires: ['ChatbotManager'],
            initialize: this.initAgentManagement.bind(this)
        });
    }

    registerComponent(id, config) {
        this.components.set(id, {
            ...config,
            element: null,
            initialized: false
        });
    }

    initializeComponents() {
        this.components.forEach((component, id) => {
            const element = document.getElementById(id);
            if (element) {
                component.element = element;
                this.initializeComponent(id, component);
            }
        });
    }

    initializeComponent(id, component) {
        if (component.initialized) return;

        // Check if all requirements are met
        const requirementsMet = component.requires.every(req => {
            return typeof window[req] !== 'undefined';
        });

        if (requirementsMet) {
            try {
                component.initialize(component.element);
                component.initialized = true;
                console.log(`✅ Standalone V2: Component ${id} initialized`);
            } catch (error) {
                console.error(`❌ Standalone V2: Error initializing ${id}:`, error);
            }
        } else {
            console.log(`⏳ Standalone V2: Waiting for requirements for ${id}:`, component.requires);
        }
    }

    initNodeFlowCanvas(element) {
        // Create a standalone node flow canvas
        element.innerHTML = `
            <div class="standalone-flow-header">
                <h3>Visual Conversation Flow</h3>
                <div class="flow-actions">
                    <button class="btn btn-primary" id="standalone-save-flow">
                        <i class="fas fa-save"></i> Save Flow
                    </button>
                    <button class="btn btn-secondary" id="standalone-test-flow">
                        <i class="fas fa-play"></i> Test
                    </button>
                </div>
            </div>
            <div class="standalone-flow-canvas" id="standalone-canvas"></div>
        `;

        // Initialize node flow builder in standalone mode
        if (typeof NodeFlowBuilder !== 'undefined') {
            const flowBuilder = new NodeFlowBuilder('standalone-canvas');
            
            // Setup standalone event handlers
            document.getElementById('standalone-save-flow')?.addEventListener('click', () => {
                flowBuilder.saveFlow();
            });
            
            document.getElementById('standalone-test-flow')?.addEventListener('click', () => {
                flowBuilder.testFlow();
            });
        }
    }

    initScenariosPanel(element) {
        // Create standalone scenarios management panel
        element.innerHTML = `
            <div class="standalone-scenarios-header">
                <h3>Chatbot Scenarios</h3>
                <button class="btn btn-primary" id="create-new-scenario">
                    <i class="fas fa-plus"></i> New Scenario
                </button>
            </div>
            <div class="scenarios-grid" id="standalone-scenarios-grid">
                <!-- Scenarios will be loaded here -->
            </div>
        `;

        this.loadStandaloneScenarios();
    }

    initFlowToolbar(element) {
        // Create standalone flow toolbar
        element.innerHTML = `
            <div class="standalone-toolbar">
                <div class="toolbar-group">
                    <span class="toolbar-label">Add Nodes:</span>
                    <button class="toolbar-btn" data-node-type="welcome">
                        <i class="fas fa-home"></i> Welcome
                    </button>
                    <button class="toolbar-btn" data-node-type="intent">
                        <i class="fas fa-lightbulb"></i> Intent
                    </button>
                    <button class="toolbar-btn" data-node-type="handoff">
                        <i class="fas fa-user-tie"></i> Handoff
                    </button>
                    <button class="toolbar-btn" data-node-type="condition">
                        <i class="fas fa-code-branch"></i> Condition
                    </button>
                </div>
                <div class="toolbar-group">
                    <span class="toolbar-label">Language:</span>
                    <select id="standalone-language-selector">
                        <option value="en">English</option>
                        <option value="sv">Swedish</option>
                    </select>
                </div>
            </div>
        `;

        // Setup toolbar event handlers
        element.querySelectorAll('[data-node-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeType = e.target.closest('[data-node-type]').dataset.nodeType;
                this.addNodeToFlow(nodeType);
            });
        });
    }

    initAgentManagement(element) {
        // Create standalone agent management interface
        element.innerHTML = `
            <div class="standalone-agents-header">
                <h3>AI Agents</h3>
                <button class="btn btn-primary" id="add-new-agent">
                    <i class="fas fa-robot"></i> Add Agent
                </button>
            </div>
            <div class="agents-grid" id="standalone-agents-grid">
                <!-- Agents will be loaded here -->
            </div>
        `;

        this.loadStandaloneAgents();
    }

    loadStandaloneScenarios() {
        // Load scenarios from localStorage or default
        const savedScenarios = localStorage.getItem('fooodis-chatbot-scenarios');
        let scenarios = [];
        
        if (savedScenarios) {
            try {
                scenarios = JSON.parse(savedScenarios);
            } catch (error) {
                console.error('Error loading scenarios:', error);
            }
        }

        if (scenarios.length === 0) {
            scenarios = this.getDefaultScenarios();
        }

        this.renderScenarios(scenarios);
    }

    loadStandaloneAgents() {
        // Load agents from chatbot manager or defaults
        let agents = [];
        
        if (window.chatbotManager && window.chatbotManager.settings.agents) {
            agents = window.chatbotManager.settings.agents;
        } else {
            agents = this.getDefaultAgents();
        }

        this.renderAgents(agents);
    }

    renderScenarios(scenarios) {
        const grid = document.getElementById('standalone-scenarios-grid');
        if (!grid) return;

        grid.innerHTML = scenarios.map(scenario => `
            <div class="scenario-card" data-scenario-id="${scenario.id}">
                <div class="scenario-header">
                    <h4>${scenario.name}</h4>
                    <span class="scenario-status ${scenario.active ? 'active' : 'inactive'}">
                        ${scenario.active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p class="scenario-description">${scenario.description}</p>
                <div class="scenario-actions">
                    <button class="btn btn-sm btn-secondary" onclick="standaloneV2Section.editScenario('${scenario.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="standaloneV2Section.toggleScenario('${scenario.id}')">
                        <i class="fas fa-power-off"></i> ${scenario.active ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAgents(agents) {
        const grid = document.getElementById('standalone-agents-grid');
        if (!grid) return;

        grid.innerHTML = agents.map(agent => `
            <div class="agent-card" data-agent-id="${agent.id}">
                <div class="agent-header">
                    <div class="agent-avatar">
                        ${agent.avatar ? `<img src="${agent.avatar}" alt="${agent.name}">` : `<i class="fas fa-robot"></i>`}
                    </div>
                    <h4>${agent.name}</h4>
                </div>
                <p class="agent-personality">${agent.personality}</p>
                <div class="agent-actions">
                    <button class="btn btn-sm btn-secondary" onclick="standaloneV2Section.editAgent('${agent.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="standaloneV2Section.testAgent('${agent.id}')">
                        <i class="fas fa-play"></i> Test
                    </button>
                </div>
            </div>
        `).join('');
    }

    addNodeToFlow(nodeType) {
        if (window.nodeFlowBuilder) {
            window.nodeFlowBuilder.addNode(nodeType);
        }
    }

    getDefaultScenarios() {
        return [
            {
                id: 'welcome-' + Date.now(),
                name: 'Welcome Flow',
                description: 'Initial welcome and user routing',
                active: true,
                language: 'en'
            }
        ];
    }

    getDefaultAgents() {
        return [
            {
                id: 'default-agent',
                name: 'Fooodis Assistant',
                personality: 'Friendly and helpful restaurant assistant',
                avatar: null
            }
        ];
    }

    setupEventHandlers() {
        // Global event handlers for standalone components
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-new-scenario') {
                this.createNewScenario();
            } else if (e.target.id === 'add-new-agent') {
                this.createNewAgent();
            }
        });
    }

    createNewScenario() {
        // Implementation for creating new scenario
        console.log('Creating new scenario...');
    }

    createNewAgent() {
        // Implementation for creating new agent
        console.log('Creating new agent...');
    }

    editScenario(scenarioId) {
        console.log('Editing scenario:', scenarioId);
    }

    editAgent(agentId) {
        console.log('Editing agent:', agentId);
    }

    toggleScenario(scenarioId) {
        console.log('Toggling scenario:', scenarioId);
    }

    testAgent(agentId) {
        console.log('Testing agent:', agentId);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.standaloneV2Section = new StandaloneV2Section();
    });
} else {
    window.standaloneV2Section = new StandaloneV2Section();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandaloneV2Section;
}
