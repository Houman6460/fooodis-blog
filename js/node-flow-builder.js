/**
 * Fooodis Node Flow Builder System
 * Visual chatbot flow builder to replace static Q&A scenarios
 */

class NodeFlowBuilder {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.nodes = [];
        this.connections = [];
        this.selectedNode = null;
        this.draggedNode = null;
        this.currentLanguage = 'en';
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        this.isConnecting = false;
        this.connectionStart = null;
        this.tempConnectionStart = null;
        this.masterTemplate = this.getMasterTemplate();
        this.autoSaveTimeout = null;
        this.isInitialized = false;
        this.eventListenersAdded = false;
        this.lastNodeAddTime = 0;

        // Sync with ChatbotManager if available
        this.syncWithChatbotManager();

        // Load saved flow data from localStorage
        this.loadFlow();

        this.init();

        // Start periodic health monitoring
        this.startHealthMonitoring();
    }

    getMasterTemplate() {
        return {
            departments: [
                {
                    id: 'customer-support',
                    name: 'Customer Support',
                    description: 'General inquiries, platform assistance',
                    color: '#3498db',
                    agents: ['general-support']
                },
                {
                    id: 'sales',
                    name: 'Sales',
                    description: 'Plan selection, pricing, feature explanations',
                    color: '#e74c3c',
                    agents: ['sales-agent']
                },
                {
                    id: 'billing',
                    name: 'Billing',
                    description: 'Payment issues, subscription management, invoicing',
                    color: '#f39c12',
                    agents: ['billing-agent']
                },
                {
                    id: 'technical-support',
                    name: 'Technical Support',
                    description: 'Integration help, API issues, troubleshooting',
                    color: '#9b59b6',
                    agents: ['tech-support']
                },
                {
                    id: 'delivery',
                    name: 'Delivery',
                    description: 'Order status, delivery coordination',
                    color: '#2ecc71',
                    agents: ['delivery-agent']
                },
                {
                    id: 'general-inquiries',
                    name: 'General Inquiries',
                    description: 'Initial routing, basic information',
                    color: '#34495e',
                    agents: ['general-agent']
                }
            ],
            intents: [
                {
                    category: 'Menu Management',
                    intents: ['menu-creation', 'qr-codes', 'menu-customization', 'allergens', 'multilingual-menus']
                },
                {
                    category: 'Order Processing',
                    intents: ['pos-system', 'local-orders', 'whatsapp-ordering', 'payment-processing']
                },
                {
                    category: 'Kitchen Operations',
                    intents: ['kitchen-display', 'preparation-time', 'staff-management', 'order-tracking']
                },
                {
                    category: 'Customer Engagement',
                    intents: ['loyalty-programs', 'coupons', 'tips', 'social-profiles', 'reviews']
                },
                {
                    category: 'System Features',
                    intents: ['themes', 'timezone-settings', 'multi-language', 'customization']
                },
                {
                    category: 'Business Tools',
                    intents: ['receipt-printing', 'settings-cloner', 'webhooks', 'inventory', 'analytics']
                },
                {
                    category: 'Account Management',
                    intents: ['customer-accounts', 'staff-access', 'compliance', 'data-management']
                },
                {
                    category: 'Pricing & Plans',
                    intents: ['plan-comparison', 'billing-cycles', 'discounts', 'trials', 'upgrades']
                }
            ],
            languages: ['swedish', 'english']
        };
    }

    syncWithChatbotManager() {
        // Get departments from ChatbotManager if available
        if (window.chatbotManager && typeof window.chatbotManager.getAgentDepartments === 'function') {
            const agentDepartments = window.chatbotManager.getAgentDepartments();
            if (agentDepartments && agentDepartments.length > 0) {
                console.log('🔄 Syncing Node Flow Builder with ChatbotManager departments:', agentDepartments);
                this.masterTemplate.departments = agentDepartments;
                this.showToast('Departments synced with agent settings', 'success');
            }
        } else {
            console.log('⚠️ ChatbotManager not available, using default departments');
        }
    }

    updateDepartments() {
        // Method to refresh departments from ChatbotManager
        this.syncWithChatbotManager();
        this.showToast('Department list updated', 'info');
    }

    init() {
        // Ensure DOM is ready before initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.delayedInit());
        } else {
            this.delayedInit();
        }
    }

    delayedInit() {
        try {
            this.setupCanvas();
            this.setupEventListeners();
            this.setupToolbar();
            
            // Small delay to ensure all DOM elements are properly rendered
            setTimeout(() => {
                this.createDefaultFlow();
                this.isInitialized = true;
                console.log('✅ Node Flow Builder initialized successfully');
            }, 100);
        } catch (error) {
            console.error('❌ Node Flow Builder initialization failed:', error);
            this.showToast('Failed to initialize flow builder', 'error');
        }
    }

    setupCanvas() {
        const flowContainer = document.getElementById('node-flow-container');
        if (!flowContainer) return;

        // Create canvas
        this.canvas = document.createElement('div');
        this.canvas.className = 'node-flow-canvas';
        // Ensure proper positioning context for disconnect buttons
        this.canvas.style.position = 'relative';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.innerHTML = `
            <div class="flow-background">
                <div class="flow-grid"></div>
            </div>
            <div class="flow-nodes" id="flow-nodes"></div>
            <div class="flow-connections" id="flow-connections"></div>
            <div class="canvas-zoom-controls">
                <button class="canvas-zoom-btn" id="canvas-zoom-out" title="Zoom Out">
                    <i class="fas fa-search-minus"></i>
                </button>
                <span class="canvas-zoom-level">100%</span>
                <button class="canvas-zoom-btn" id="canvas-zoom-in" title="Zoom In">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="canvas-zoom-btn" id="canvas-zoom-reset" title="Reset Zoom">
                    <i class="fas fa-expand-arrows-alt"></i>
                </button>
            </div>
        `;

        flowContainer.appendChild(this.canvas);

        // Initialize zoom functionality with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            // Get mouse position relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate zoom point in world coordinates
            const worldX = (mouseX - this.panOffset.x) / this.zoom;
            const worldY = (mouseY - this.panOffset.y) / this.zoom;

            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const oldZoom = this.zoom;
            this.zoom += delta;
            this.zoom = Math.max(0.1, Math.min(this.zoom, 2));

            // Adjust pan to zoom towards mouse position
            const zoomChange = this.zoom / oldZoom;
            this.panOffset.x = mouseX - worldX * this.zoom;
            this.panOffset.y = mouseY - worldY * this.zoom;

            this.updateCanvasTransform();
        });

        // Setup canvas panning functionality
        this.canvas.addEventListener('mousedown', (e) => {
            // Handle node dragging first
            this.handleMouseDown(e);
            // Then handle canvas interactions
            this.handleCanvasMouseDown(e);
        });
        
        document.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        document.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Prevent context menu on right-click for panning
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupToolbar() {
        const toolbar = document.getElementById('node-flow-toolbar');
        if (!toolbar) return;

        toolbar.innerHTML = `
            <div class="toolbar-section">
                <button class="toolbar-btn" id="add-welcome-node" title="Add Welcome Node">
                    <i class="fas fa-home"></i> Welcome
                </button>
                <button class="toolbar-btn" id="add-intent-node" title="Add Intent Node">
                    <i class="fas fa-lightbulb"></i> Intent
                </button>
                <button class="toolbar-btn" id="add-handoff-node" title="Add Handoff Node">
                    <i class="fas fa-user-tie"></i> Handoff
                </button>
                <button class="toolbar-btn" id="add-condition-node" title="Add Condition Node">
                    <i class="fas fa-code-branch"></i> Condition
                </button>
                <button class="toolbar-btn" id="add-message-node" title="Add Message Node">
                    <i class="fas fa-comment"></i> Message
                </button>
            </div>
            <div class="toolbar-section">
                <button class="toolbar-btn" id="save-flow-btn" title="Manual Save">
                    <i class="fas fa-save"></i> Save
                </button>
                <span class="auto-save-status" id="auto-save-status">
                    <i class="fas fa-check-circle"></i> Auto-Save Active
                </span>
                <button class="toolbar-btn" id="test-flow-btn" title="Test Flow">
                    <i class="fas fa-play"></i> Test
                </button>
                <button class="toolbar-btn" id="clear-flow-btn" title="Clear All">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
            
        `;
    }

    setupEventListeners() {
        // Prevent duplicate event listeners
        if (this.eventListenersAdded) {
            return;
        }
        this.eventListenersAdded = true;

        // Canvas zoom controls with error handling
        document.addEventListener('click', (e) => {
            try {
                if (e.target.id === 'canvas-zoom-in') {
                    this.zoomIn();
                } else if (e.target.id === 'canvas-zoom-out') {
                    this.zoomOut();
                } else if (e.target.id === 'canvas-zoom-reset') {
                    this.resetZoom();
                }
            } catch (error) {
                console.error('❌ Zoom control error:', error);
            }
        });

        // 🔧 FIX: Add missing toolbar button event listeners
        document.addEventListener('click', (e) => {
            // Node creation buttons
            if (e.target.id === 'add-welcome-node' || e.target.closest('#add-welcome-node')) {
                this.addNode('welcome');
            } else if (e.target.id === 'add-intent-node' || e.target.closest('#add-intent-node')) {
                this.addNode('intent');
            } else if (e.target.id === 'add-handoff-node' || e.target.closest('#add-handoff-node')) {
                this.addNode('handoff');
            } else if (e.target.id === 'add-condition-node' || e.target.closest('#add-condition-node')) {
                this.addNode('condition');
            } else if (e.target.id === 'add-message-node' || e.target.closest('#add-message-node')) {
                this.addNode('message');
            }
            // Flow control buttons
            else if (e.target.id === 'save-flow-btn' || e.target.closest('#save-flow-btn')) {
                this.saveFlow();
            } else if (e.target.id === 'test-flow-btn' || e.target.closest('#test-flow-btn')) {
                this.testFlow();
            } else if (e.target.id === 'clear-flow-btn' || e.target.closest('#clear-flow-btn')) {
                this.clearFlow();
            }
        });

        // Node interaction events
        document.addEventListener('click', (e) => this.handleClick(e));

        // Remove language selector - workflow is now multilingual
    }

    handleMouseDown(e) {
        // Only handle node dragging, not canvas interactions
        const nodeElement = e.target.closest('.flow-node');
        if (nodeElement && !e.target.closest('.node-controls') && !e.target.closest('.connection-point')) {
            const nodeId = nodeElement.dataset.nodeId;
            const node = this.nodes.find(n => n.id === nodeId);
            if (node && e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                
                // Prevent canvas panning when dragging a node
                this.isPanning = false;
                this.draggedNode = node;
                
                const canvasRect = this.canvas.getBoundingClientRect();

                // Calculate drag offset in world coordinates
                const worldX = (e.clientX - canvasRect.left - this.panOffset.x) / this.zoom;
                const worldY = (e.clientY - canvasRect.top - this.panOffset.y) / this.zoom;

                this.draggedNode.dragOffset = {
                    x: worldX - node.position.x,
                    y: worldY - node.position.y
                };

                // Change cursor to indicate dragging
                this.canvas.style.cursor = 'move';
                
                // Mark node as selected
                document.querySelectorAll('.flow-node.selected').forEach(n => n.classList.remove('selected'));
                nodeElement.classList.add('selected');
                this.selectedNode = node;
            }
        }
    }

    handleClick(e) {
        const target = e.target;

        // Handle connection points
        if (target.classList.contains('connection-point')) {
            this.handleConnectionPoint(target, e);
            e.stopPropagation();
            return;
        }

        // Handle node edit button
        if (target.classList.contains('node-edit-btn') || target.closest('.node-edit-btn')) {
            const nodeElement = target.closest('.flow-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                const node = this.nodes.find(n => n.id === nodeId);
                if (node) {
                    this.editNode(node);
                }
            }
            e.stopPropagation();
            return;
        }

        // Handle node duplicate button
        if (target.classList.contains('node-duplicate-btn') || target.closest('.node-duplicate-btn') || 
            target.classList.contains('fa-copy') || target.closest('.fa-copy')) {
            const nodeElement = target.closest('.flow-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                const node = this.nodes.find(n => n.id === nodeId);
                if (node) {
                    this.duplicateNode(node);
                }
            }
            e.stopPropagation();
            return;
        }

        // Handle node delete button
        if (target.classList.contains('node-delete-btn') || target.closest('.node-delete-btn') || 
            target.classList.contains('fa-trash') || target.closest('.fa-trash')) {
            const nodeElement = target.closest('.flow-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                if (confirm('Are you sure you want to delete this node?')) {
                    this.deleteNode(nodeId);
                }
            }
            e.stopPropagation();
            return;
        }

        // Handle toolbar buttons
        if (target.closest('.toolbar-btn')) {
            const btn = target.closest('.toolbar-btn');
            const action = btn.dataset.action;

            switch(action) {
                case 'add-welcome':
                    this.addNode('welcome');
                    break;
                case 'add-intent':
                    this.addNode('intent');
                    break;
                case 'add-handoff':
                    this.addNode('handoff');
                    break;
                case 'add-condition':
                    this.addNode('condition');
                    break;
                case 'add-message':
                    this.addNode('message');
                    break;
                case 'save':
                    this.saveFlow();
                    break;
                case 'test':
                    this.testFlow();
                    break;
                case 'clear':
                    this.clearFlow();
                    break;
            }
            e.stopPropagation();
            return;
        }

        // Handle modal closing
        if (target.classList.contains('modal-close') || target.classList.contains('modal-overlay')) {
            this.closeModal();
        }
    }

    handleConnectionPoint(connectionPoint, e) {
        const nodeElement = connectionPoint.closest('.flow-node');
        const nodeId = nodeElement.dataset.nodeId;
        const connectionType = connectionPoint.dataset.type;

        if (!this.isConnecting) {
            // Start connection
            this.isConnecting = true;
            this.connectionStart = {
                nodeId: nodeId,
                type: connectionType,
                element: connectionPoint
            };
            connectionPoint.classList.add('connecting');
            this.showToast('Drag to target connection point', 'info');

            // Create temporary connection line that follows mouse
            this.createTempConnectionLine(connectionPoint);
        } else {
            // Complete connection
            if (this.connectionStart.nodeId !== nodeId) {
                // Create connection
                const connection = {
                    id: 'conn-' + Date.now(),
                    from: this.connectionStart.nodeId,
                    to: nodeId,
                    fromType: this.connectionStart.type,
                    toType: connectionType
                };

                // Validate connection (output to input only)
                if (this.connectionStart.type === 'output' && connectionType === 'input') {
                    this.connections.push(connection);
                    this.renderConnections();
                    this.showToast('Connection created', 'success');
                    this.autoSave(); // 🔧 FIX 3: Auto-save when creating connection
                } else {
                    this.showToast('Invalid connection: connect output to input only', 'error');
                }
            }

            // Reset connection state and remove temp line
            this.clearTempConnectionLine();
            this.isConnecting = false;
            this.connectionStart.element.classList.remove('connecting');
            this.connectionStart = null;
        }
    }

    createTempConnectionLine(startPoint) {
        // Remove any existing temp line
        this.clearTempConnectionLine();

        const connectionsContainer = document.getElementById('flow-connections');
        if (!connectionsContainer) return;

        // Create SVG for temp line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'temp-connection-line');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '10';

        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', 'temp-connection-path');
        path.setAttribute('stroke', '#00d4aa');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-dasharray', '8,4');

        svg.appendChild(path);
        connectionsContainer.appendChild(svg);

        // Store start position for mouse movement
        const nodeElement = startPoint.closest('.flow-node');
        const canvasRect = this.canvas.getBoundingClientRect();
        const nodeRect = nodeElement.getBoundingClientRect();

        this.tempConnectionStart = {
            x: nodeRect.left - canvasRect.left + (startPoint.dataset.type === 'output' ? 150 : 0),
            y: nodeRect.top - canvasRect.top + 25
        };
    }

    updateTempConnectionLine(mouseX, mouseY) {
        const tempPath = document.getElementById('temp-connection-path');
        if (!tempPath || !this.tempConnectionStart) return;

        const canvasRect = this.canvas.getBoundingClientRect();
        const endX = mouseX - canvasRect.left;
        const endY = mouseY - canvasRect.top;

        // Create curved path from start to mouse position
        const startX = this.tempConnectionStart.x;
        const startY = this.tempConnectionStart.y;

        const controlPoint1X = startX + (endX - startX) * 0.5;
        const controlPoint1Y = startY;
        const controlPoint2X = endX - (endX - startX) * 0.5;
        const controlPoint2Y = endY;

        const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
        tempPath.setAttribute('d', pathData);
    }

    clearTempConnectionLine() {
        const tempLine = document.getElementById('temp-connection-line');
        if (tempLine) {
            tempLine.remove();
        }
        this.tempConnectionStart = null;
    }

    createDefaultFlow() {
        // Only create default flow if no saved flow exists
        if (this.nodes.length === 0) {
            // Create welcome node
            const welcomeNode = this.createNode({
                type: 'welcome',
                position: { x: 100, y: 100 },
                data: {
                    title: 'Welcome Message',
                    messages: {
                        english: "🇬🇧 English: Hello! I'm your Fooodis assistant. How can I help you today?",
                        swedish: "🇸🇪 Svenska: Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?",
                        bilingual: "🇬🇧 English: Hello! I'm your Fooodis assistant. How can I help you today?\n\n🇸🇪 Svenska: Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?"
                    }
                }
            });

            // Create intent detection node with comprehensive intents
            const intentNode = this.createNode({
                type: 'intent',
                position: { x: 400, y: 100 },
                data: {
                    title: 'Intent Detection',
                    intents: [
                        'menu-creation', 'qr-codes', 'menu-customization', 'allergens',
                        'pos-system', 'local-orders', 'whatsapp-ordering', 'payment-processing',
                        'kitchen-display', 'preparation-time', 'staff-management', 'order-tracking',
                        'loyalty-programs', 'coupons', 'tips', 'social-profiles', 'reviews',
                        'themes', 'timezone-settings', 'multi-language', 'customization',
                        'plan-comparison', 'billing-cycles', 'discounts', 'trials', 'upgrades'
                    ],
                    description: 'Detects user intent and routes to appropriate department'
                }
            });

            // Create department routing nodes
            this.masterTemplate.departments.forEach((dept, index) => {
                const handoffNode = this.createNode({
                    type: 'handoff',
                    position: { x: 700, y: 50 + (index * 120) },
                    data: {
                        title: dept.name,
                        department: dept.id,
                        agents: dept.agents,
                        color: dept.color,
                        handoffMessage: `Transferring you to our ${dept.name} team...`
                    }
                });
            });

            // Create condition nodes for language routing
            const languageCondition = this.createNode({
                type: 'condition',
                position: { x: 250, y: 300 },
                data: {
                    title: 'Language Detection',
                    condition: 'user.language === "swedish"',
                    description: 'Routes based on detected or selected language'
                }
            });

            console.log('Created default flow with', this.nodes.length, 'nodes');
        }

        this.renderNodes();
    }

    createNode(config) {
        const node = {
            id: 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: config.type,
            position: config.position,
            data: config.data,
            connections: {
                inputs: [],
                outputs: []
            }
        };

        this.nodes.push(node);
        return node;
    }

    renderNodes() {
        const nodesContainer = document.getElementById('flow-nodes');
        if (!nodesContainer) return;

        nodesContainer.innerHTML = '';

        this.nodes.forEach(node => {
            const nodeElement = this.createNodeElement(node);
            nodesContainer.appendChild(nodeElement);
        });
    }

    createNodeElement(node) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `flow-node flow-node-${node.type}`;
        nodeDiv.dataset.nodeId = node.id;
        nodeDiv.style.left = node.position.x + 'px';
        nodeDiv.style.top = node.position.y + 'px';

        if (node.data.color) {
            nodeDiv.style.borderColor = node.data.color;
        }

        nodeDiv.innerHTML = this.getNodeHTML(node);

        // Make draggable
        nodeDiv.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        return nodeDiv;
    }

    getNodeHTML(node) {
        const commonHTML = `
            <div class="node-header">
                <span class="node-title">${node.data.title}</span>
                <div class="node-controls">
                    <button class="node-btn node-edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="node-btn node-duplicate-btn" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="node-btn node-delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        switch (node.type) {
            case 'welcome':
                // Show bilingual content or auto-detect
                const welcomeMessage = node.data.messages.bilingual || 
                    `🇬🇧 ${node.data.messages.english || 'Hello! How can I help you?'}\n🇸🇪 ${node.data.messages.swedish || 'Hej! Hur kan jag hjälpa dig?'}`;
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-message multilingual">${welcomeMessage.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="node-connections">
                        <div class="connection-point output" data-type="output"></div>
                    </div>
                `;

            case 'intent':
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-intents">
                            ${node.data.intents.map(intent => `<span class="intent-tag">${intent}</span>`).join('')}
                        </div>
                    </div>
                    <div class="node-connections">
                        <div class="connection-point input" data-type="input"></div>
                        <div class="connection-point output" data-type="output"></div>
                    </div>
                `;

            case 'handoff':
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-department">${node.data.department}</div>
                        <div class="node-agents">
                            ${node.data.agents.map(agent => `<span class="agent-tag">${agent}</span>`).join('')}
                        </div>
                    </div>
                    <div class="node-connections">
                        <div class="connection-point input" data-type="input"></div>
                    </div>
                `;

            case 'condition':
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-condition">${node.data.condition}</div>
                    </div>
                    <div class="node-connections">
                        <div class="connection-point input" data-type="input"></div>
                        <div class="connection-point output true" data-type="output" data-condition="true">True</div>
                        <div class="connection-point output false" data-type="output" data-condition="false">False</div>
                    </div>
                `;

            case 'message':
                let messageContent = '';
                if (node.data.aiMode && node.data.selectedAssistant) {
                    // Show AI assistant info
                    const assistants = this.getAvailableAIAssistants();
                    const selectedAssistant = assistants.find(a => a.id === node.data.selectedAssistant);
                    const assistantName = selectedAssistant ? selectedAssistant.name : 'AI Assistant';

                    messageContent = `
                        <div class="ai-indicator">AI</div>
                        <div class="ai-assistant-info">${assistantName}</div>
                        ${node.data.aiPrompt ? `<div class="ai-prompt-preview">${node.data.aiPrompt.substring(0, 50)}...</div>` : ''}
                    `;
                } else {
                    // Show multilingual message preview
                    const englishMsg = node.data.messages?.english || '';
                    const swedishMsg = node.data.messages?.swedish || '';
                    
                    if (englishMsg && swedishMsg) {
                        messageContent = `<div class="node-message multilingual">🇬🇧 ${englishMsg.substring(0, 50)}${englishMsg.length > 50 ? '...' : ''}<br>🇸🇪 ${swedishMsg.substring(0, 50)}${swedishMsg.length > 50 ? '...' : ''}</div>`;
                    } else {
                        const message = englishMsg || swedishMsg || 'No message set';
                        messageContent = `<div class="node-message">${message.substring(0, 100)}${message.length > 100 ? '...' : ''}</div>`;
                    }
                }

                return commonHTML + `
                    <div class="node-content">
                        ${messageContent}
                    </div>
                    <div class="node-connections">
                        <div class="connection-point input" data-type="input"></div>
                        <div class="connection-point output" data-type="output"></div>
                    </div>
                `;
        }
    }

    renderConnections() {
        const connectionsContainer = document.getElementById('flow-connections');
        if (!connectionsContainer) {
            console.warn('⚠️ Connections container not found');
            return;
        }

        try {
            // Clear existing connections and buttons safely
            connectionsContainer.innerHTML = '';
            
            // Remove disconnect buttons more reliably
            const existingButtons = document.querySelectorAll('.disconnect-btn');
            existingButtons.forEach(btn => {
                try {
                    btn.remove();
                } catch (e) {
                    console.warn('Failed to remove disconnect button:', e);
                }
            });

        // Create main SVG container that follows canvas transformations
        const mainSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        mainSvg.setAttribute('id', 'main-connections-svg');
        mainSvg.style.position = 'absolute';
        mainSvg.style.top = '0';
        mainSvg.style.left = '0';
        mainSvg.style.width = '100%';
        mainSvg.style.height = '100%';
        mainSvg.style.pointerEvents = 'none';
        mainSvg.style.zIndex = '1';
        mainSvg.style.overflow = 'visible';

        connectionsContainer.appendChild(mainSvg);

        // Render each connection
        this.connections.forEach(connection => {
            const pathElement = this.createConnectionPath(connection);
            if (pathElement) {
                mainSvg.appendChild(pathElement);
            }
        });

        // Create disconnect buttons after all connections are rendered
        this.createDisconnectButtons();
    }

    createConnectionPath(connection) {
        const fromNode = this.nodes.find(node => node.id === connection.from);
        const toNode = this.nodes.find(node => node.id === connection.to);

        if (!fromNode || !toNode) return null;

        // Calculate connection points using node positions directly
        const fromX = fromNode.position.x + 200; // Node width (output point)
        const fromY = fromNode.position.y + 50;  // Node height center
        const toX = toNode.position.x;           // Input point (left side)
        const toY = toNode.position.y + 50;      // Node height center

        // Create curved path with proper control points
        const controlPoint1X = fromX + (toX - fromX) * 0.5;
        const controlPoint1Y = fromY;
        const controlPoint2X = toX - (toX - fromX) * 0.5;
        const controlPoint2Y = toY;

        const pathData = `M ${fromX} ${fromY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toX} ${toY}`;

        // Create main visible path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#6272a4');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('data-connection-id', connection.id);
        path.style.cursor = 'pointer';
        path.style.pointerEvents = 'stroke';

        // Create invisible wider path for easier clicking
        const invisiblePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        invisiblePath.setAttribute('d', pathData);
        invisiblePath.setAttribute('stroke', 'transparent');
        invisiblePath.setAttribute('stroke-width', '12');
        invisiblePath.setAttribute('fill', 'none');
        invisiblePath.setAttribute('data-connection-id', connection.id);
        invisiblePath.style.cursor = 'pointer';
        invisiblePath.style.pointerEvents = 'stroke';

        // Add hover effects
        const handleMouseEnter = () => {
            path.setAttribute('stroke', '#ff6b6b');
            path.setAttribute('stroke-width', '3');
        };

        const handleMouseLeave = () => {
            path.setAttribute('stroke', '#6272a4');
            path.setAttribute('stroke-width', '2');
        };

        const handleConnectionClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showConnectionRemovalDialog(connection.id, fromNode, toNode);
        };

        // Add event listeners        path.addEventListener('mouseenter', handleMouseEnter);
        path.addEventListener('mouseleave', handleMouseLeave);
        path.addEventListener('click', handleConnectionClick);
        invisiblePath.addEventListener('mouseenter', handleMouseEnter);
        invisiblePath.addEventListener('mouseleave', handleMouseLeave);
        invisiblePath.addEventListener('click', handleConnectionClick);

        // Create group to contain both paths
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.appendChild(invisiblePath);
        group.appendChild(path);

        return group;
    }

    // Create all disconnect buttons after connections are rendered
    createDisconnectButtons() {
        console.log('Creating disconnect buttons for', this.connections.length, 'connections');

        this.connections.forEach(connection => {
            const fromNode = this.nodes.find(n => n.id === connection.from);
            const toNode = this.nodes.find(n => n.id === connection.to);

            if (!fromNode || !toNode) {
                console.log('Cannot find nodes for connection:', connection.id);
                return;
            }

            // Calculate precise connection points (same as in createConnectionPath)
            const startX = fromNode.position.x + 200; // Output connection point
            const startY = fromNode.position.y + 50;  // Node center height
            const endX = toNode.position.x;           // Input connection point
            const endY = toNode.position.y + 50;      // Node center height

            // Calculate the exact midpoint of the connection line
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            console.log(`Connection ${connection.id}: from (${startX}, ${startY}) to (${endX}, ${endY}), mid (${midX}, ${midY})`);

            // Create disconnect button
            const btn = document.createElement('div');
            btn.className = 'disconnect-btn';
            btn.innerHTML = '×';
            btn.dataset.connectionId = connection.id;

            // Apply styles with proper positioning that follows canvas transformations
            btn.style.position = 'absolute';
            btn.style.left = midX + 'px';
            btn.style.top = midY + 'px';
            btn.style.width = '20px';
            btn.style.height = '20px';
            btn.style.backgroundColor = '#ff4757';
            btn.style.color = 'white';
            btn.style.borderRadius = '50%';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = 'bold';
            btn.style.zIndex = '5'; // Lower z-index so nodes stay above
            btn.style.border = '2px solid white';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            btn.style.pointerEvents = 'auto';
            btn.style.transition = 'all 0.2s ease';
            btn.style.transformOrigin = 'center';

            // Set initial transform with counter-scaling
            const counterScale = 1 / this.zoom;
            btn.style.transform = `translate(-50%, -50%) scale(${counterScale})`;

            // Add hover effect with proper zoom scaling
            btn.addEventListener('mouseenter', () => {
                btn.style.backgroundColor = '#ff3742';
                const currentCounterScale = 1 / this.zoom;
                btn.style.transform = `translate(-50%, -50%) scale(${currentCounterScale * 1.2})`;
                btn.style.zIndex = '15'; // Temporarily raise z-index on hover
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.backgroundColor = '#ff4757';
                const currentCounterScale = 1 / this.zoom;
                btn.style.transform = `translate(-50%, -50%) scale(${currentCounterScale})`;
                btn.style.zIndex = '5'; // Reset z-index
            });

            // Enhanced click handler with better event handling
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Disconnect button clicked for:', connection.id);
                
                // Show confirmation dialog
                if (confirm('Are you sure you want to remove this connection?')) {
                    this.removeConnection(connection.id);
                }
            });

            // Prevent other events from interfering
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            // Add to the flow-nodes container so it follows canvas transformations
            const nodesContainer = document.getElementById('flow-nodes');
            if (nodesContainer) {
                nodesContainer.appendChild(btn);
                console.log('Added disconnect button to nodes container for connection:', connection.id);
            }
        });
    }

    // Show dialog to confirm connection removal
    showConnectionRemovalDialog(connectionId, fromNode, toNode) {
        console.log('showConnectionRemovalDialog called with:', {
            connectionId,
            fromNode: fromNode ? fromNode.id : 'null',
            toNode: toNode ? toNode.id : 'null'
        });

        const modal = document.createElement('div');
        modal.className = 'node-modal connection-removal-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Remove Connection</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to disconnect these nodes?</p>
                    <div class="connection-info">
                        <div class="node-info">
                            <strong>From:</strong> ${fromNode.data.title}
                        </div>
                        <div class="connection-arrow">→</div>
                        <div class="node-info">
                            <strong>To:</strong> ${toNode.data.title}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-danger modal-remove" data-connection-id="${connectionId}">Remove Connection</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Remove connection handler
        modal.querySelector('.modal-remove').addEventListener('click', (e) => {
            const connectionId = e.target.getAttribute('data-connection-id');
            this.removeConnection(connectionId);
            closeModal();
        });
    }

    // Remove a connection between nodes
    removeConnection(connectionId) {
        console.log('removeConnection called with ID:', connectionId);
        console.log('Current connections:', this.connections);

        const connectionIndex = this.connections.findIndex(c => c.id === connectionId);
        console.log('Found connection index:', connectionIndex);

        if (connectionIndex === -1) {
            console.error('Connection not found with ID:', connectionId);
            this.showToast('Connection not found', 'error');
            return;
        }

        const connection = this.connections[connectionIndex];
        console.log('Removing connection:', connection);

        this.connections.splice(connectionIndex, 1);

        // Re-render connections
        this.renderConnections();

        // Show success message
        this.showToast('Connection removed successfully', 'success');

        // Auto-save the updated flow
        this.autoSave();

        console.log(`Connection removed: ${connection.from} -> ${connection.to}`);
        console.log('Remaining connections:', this.connections);
    }

    // Show dialog to disconnect connections
    showDisconnectDialog() {
        if (this.connections.length === 0) {
            this.showToast('No connections to disconnect', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'node-modal disconnect-modal';

        const connectionsHtml = this.connections.map(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);
            const fromTitle = fromNode ? fromNode.data.title : 'Unknown';
            const toTitle = toNode ? toNode.data.title : 'Unknown';

            return `
                <div class="connection-item" data-connection-id="${conn.id}">
                    <div class="connection-info">
                        <span class="from-node">${fromTitle}</span>
                        <span class="connection-arrow">→</span>
                        <span class="to-node">${toTitle}</span>
                    </div>
                    <button class="btn btn-danger btn-sm disconnect-connection" data-connection-id="${conn.id}">
                        <i class="fas fa-unlink"></i> Remove
                    </button>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Disconnect Connections</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Select connections to remove:</p>
                    <div class="connections-list">
                        ${connectionsHtml}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Disconnect connection handlers
        modal.querySelectorAll('.disconnect-connection').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const connectionId = e.target.closest('.disconnect-connection').getAttribute('data-connection-id');
                console.log('Disconnect button clicked for connection:', connectionId);

                if (connectionId) {
                    this.removeConnection(connectionId);
                    // Remove the connection item from the dialog
                    const connectionItem = modal.querySelector(`[data-connection-id="${connectionId}"]`);
                    if (connectionItem) {
                        connectionItem.remove();
                    }

                    // Close modal if no more connections
                    if (this.connections.length === 0) {
                        closeModal();
                        this.showToast('All connections removed', 'success');
                    }
                }
            });
        });
    }

    showAddNodeModal() {
        const modal = document.createElement('div');
        modal.className = 'node-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Node</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Node Type</label>
                        <select id="node-type-select" class="form-select">
                            <option value="message">Message Node</option>
                            <option value="intent">Intent Detection</option>
                            <option value="condition">Condition Check</option>
                            <option value="handoff">Agent Handoff</option>
                            <option value="response">Response Collection</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Node Title</label>
                        <input type="text" id="node-title-input" class="form-control" placeholder="Enter node title">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.node-modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="nodeFlowBuilder.addNodeFromModal()">Add Node</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
    }

    addNodeFromModal() {
        const nodeType = document.getElementById('node-type-select').value;
        const nodeTitle = document.getElementById('node-title-input').value;

        if (!nodeTitle.trim()) {
            alert('Please enter a node title');
            return;
        }

        const newNode = this.createNode({
            type: nodeType,
            position: { x: 200, y: 200 },
            data: {
                title: nodeTitle,
                // Add default data based on type
                ...(nodeType === 'intent' && { intents: [] }),
                ...(nodeType === 'handoff' && { department: '', agents: [] }),
                ...(nodeType === 'message' && { messages: { english: '', swedish: '' } }),
                ...(nodeType === 'condition' && { condition: '' })
            }
        });

        this.renderNodes();
        document.querySelector('.node-modal').remove();
        this.autoSave(); // 🔧 FIX 3: Auto-save when adding node from modal
    }

    saveFlow() {
        const autoSaveStatus = document.getElementById('auto-save-status');
        if (autoSaveStatus) {
            autoSaveStatus.classList.add('saving');
            autoSaveStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }

        const flowData = {
            nodes: this.nodes,
            connections: this.connections,
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                multilingual: true
            }
        };

        // Save to localStorage
        localStorage.setItem('fooodis-node-flow', JSON.stringify(flowData));

        // Also save to chatbot manager to integrate with existing system
        if (window.chatbotManager) {
            window.chatbotManager.updateNodeFlow(flowData);
        }

        // Reset auto-save status
        setTimeout(() => {
            if (autoSaveStatus) {
                autoSaveStatus.classList.remove('saving');
                autoSaveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Auto-Save Active';
            }
        }, 500);

        this.showToast('Flow saved successfully', 'success');
    }

    loadFlow() {
        const savedFlow = localStorage.getItem('fooodis-node-flow');
        if (savedFlow) {
            try {
                const flowData = JSON.parse(savedFlow);
                this.nodes = flowData.nodes || [];
                this.connections = flowData.connections || [];

                // Flow is now multilingual by default

                this.renderNodes();
                this.renderConnections();
                this.showToast('Flow loaded from saved state', 'info');
                console.log('Loaded flow with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
            } catch (error) {
                console.error('Error loading saved flow:', error);
                this.showToast('Error loading saved flow', 'error');
            }
        } else {
            console.log('No saved flow found, starting with default nodes');
        }
    }

    testFlow() {
        // Open a test preview modal
        const modal = document.createElement('div');
        modal.className = 'test-flow-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.zIndex = '10000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        modal.innerHTML = `
            <div class="modal-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);"></div>
            <div class="modal-content large" style="
                position: relative; 
                background: #2a2a2a; 
                border-radius: 8px; 
                width: 90vw; 
                max-width: 1000px; 
                height: 80vh; 
                max-height: 700px; 
                min-height: 500px;
                display: flex; 
                flex-direction: column;
                border: 1px solid #444;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                margin: 0 auto;
                top: auto;
                left: auto;
                right: auto;
                bottom: auto;
            ">
                <div class="modal-header" style="
                    padding: 20px; 
                    border-bottom: 1px solid #444; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    background: #333;
                    border-radius: 8px 8px 0 0;
                ">
                    <h3 style="margin: 0; color: #fff; font-size: 18px;">Test Flow Preview</h3>
                    <button class="modal-close" style="
                        background: #555; 
                        border: none; 
                        color: #fff; 
                        font-size: 20px; 
                        width: 30px; 
                        height: 30px; 
                        border-radius: 4px; 
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                <div class="modal-body" style="
                    flex: 1; 
                    padding: 20px; 
                    display: flex; 
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <div class="test-chat-container" style="
                        display: flex; 
                        flex-direction: column; 
                        height: 100%;
                        background: #1a1a1a;
                        border-radius: 8px;
                        border: 1px solid #333;
                    ">
                        <div class="test-chat-messages" id="test-chat-messages" style="
                            flex: 1; 
                            padding: 20px; 
                            overflow-y: auto; 
                            background: #1a1a1a;
                            border-radius: 8px 8px 0 0;
                        "></div>
                        <div class="test-chat-input" style="
                            padding: 15px; 
                            border-top: 1px solid #333; 
                            display: flex; 
                            gap: 10px;
                            background: #2a2a2a;
                            border-radius: 0 0 8px 8px;
                        ">
                            <input type="text" id="test-message-input" placeholder="Type a message to test the flow..." style="
                                flex: 1; 
                                padding: 10px; 
                                border: 1px solid #555; 
                                border-radius: 4px; 
                                background: #333; 
                                color: #fff;
                                outline: none;
                            ">
                            <button id="test-send-btn" style="
                                padding: 10px 20px; 
                                background: #e8f24c; 
                                color: #000; 
                                border: none; 
                                border-radius: 4px; 
                                cursor: pointer;
                                font-weight: 500;
                            ">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.initializeTestFlow();

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

        // Send button handler
        modal.querySelector('#test-send-btn').addEventListener('click', () => this.sendTestMessage());

        // Enter key handler for input
        modal.querySelector('#test-message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTestMessage();
            }
        });

        // Focus the input
        setTimeout(() => {
            modal.querySelector('#test-message-input').focus();
        }, 100);
    }

    initializeTestFlow() {
        const messagesContainer = document.getElementById('test-chat-messages');
        const welcomeNode = this.nodes.find(node => node.type === 'welcome');

        if (welcomeNode) {
            // Use bilingual message or detect language dynamically
            const message = welcomeNode.data.messages.bilingual || 
                           welcomeNode.data.messages.english || 
                           "🇬🇧 Hello! I'm your Fooodis assistant. How can I help you today?\n\n🇸🇪 Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?";

            messagesContainer.innerHTML = `
                <div class="test-message bot" style="
                    margin-bottom: 15px; 
                    display: flex; 
                    justify-content: flex-start;
                ">
                    <div class="message-content" style="
                        background: #4a4a4a; 
                        color: white; 
                        padding: 12px 16px; 
                        border-radius: 18px 18px 18px 4px; 
                        max-width: 70%;
                        word-wrap: break-word;
                        line-height: 1.4;
                        white-space: pre-line;
                    ">${message}</div>
                </div>
            `;
        } else {
            messagesContainer.innerHTML = `
                <div class="test-message bot" style="
                    margin-bottom: 15px; 
                    display: flex; 
                    justify-content: flex-start;
                ">
                    <div class="message-content" style="
                        background: #4a4a4a; 
                        color: white; 
                        padding: 12px 16px; 
                        border-radius: 18px 18px 18px 4px; 
                        max-width: 70%;
                        word-wrap: break-word;
                        line-height: 1.4;
                    ">🇬🇧 Hello! I'm your Fooodis assistant. How can I help you today?<br><br>🇸🇪 Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?</div>
                </div>
            `;
        }
    }

    sendTestMessage() {
        const input = document.getElementById('test-message-input');
        const message = input.value.trim();

        if (!message) return;

        const messagesContainer = document.getElementById('test-chat-messages');

        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'test-message user';
        userMessage.style.cssText = `
            margin-bottom: 15px; 
            display: flex; 
            justify-content: flex-end;
        `;
        userMessage.innerHTML = `
            <div class="message-content" style="
                background: #444; 
                color: white; 
                padding: 12px 16px; 
                border-radius: 18px 18px 4px 18px; 
                max-width: 70%;
                word-wrap: break-word;
                line-height: 1.4;
            ">${message}</div>
        `;
        messagesContainer.appendChild(userMessage);

        // Clear input and scroll
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'test-message bot typing';
        typingIndicator.style.cssText = `
            margin-bottom: 15px; 
            display: flex; 
            justify-content: flex-start;
        `;
        typingIndicator.innerHTML = `
            <div class="message-content" style="
                background: #4a4a4a; 
                color: white; 
                padding: 12px 16px; 
                border-radius: 18px 18px 18px 4px; 
                max-width: 70%;
                word-wrap: break-word;
                line-height: 1.4;
                opacity: 0.7;
            ">Typing...</div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simulate bot response based on flow
        setTimeout(() => {
            typingIndicator.remove();
            const botResponse = this.processTestMessage(message);
            const botMessage = document.createElement('div');
            botMessage.className = 'test-message bot';
            botMessage.style.cssText = `
                margin-bottom: 15px; 
                display: flex; 
                justify-content: flex-start;
            `;
            botMessage.innerHTML = `
                <div class="message-content" style="
                    background: #4a4a4a; 
                    color: white; 
                    padding: 12px 16px; 
                    border-radius: 18px 18px 18px 4px; 
                    max-width: 70%;
                    word-wrap: break-word;
                    line-height: 1.4;
                ">${botResponse}</div>
            `;
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    }

    processTestMessage(message) {
        // Simple intent matching for testing
        const lowerMessage = message.toLowerCase();

        // Detect language based on Swedish keywords or previous context
        const isSwedish = this.detectSwedish(message);

        const messages = {
            menu: {
                english: "I'll connect you with our Menu Management specialist to help with your menu questions.",
                swedish: "Jag kopplar dig till vår Menyhanteringsspecialist för att hjälpa dig med dina menyfrågor."
            },
            billing: {
                english: "Let me transfer you to our Billing department to assist with payment-related inquiries.",
                swedish: "Låt mig överföra dig till vår Faktureringsavdelning för att hjälpa till med betalningsrelaterade frågor."
            },
            technical: {
                english: "I'll connect you with our Technical Support team for assistance with technical issues.",
                swedish: "Jag kopplar dig till vårt Tekniska Support-team för hjälp med tekniska problem."
            },
            delivery: {
                english: "I'll transfer you to our Delivery team to help with order-related questions.",
                swedish: "Jag överför dig till vårt Leveransteam för att hjälpa till med orderrelaterade frågor."
            },
            sales: {
                english: "Let me connect you with our Sales team to discuss plans and pricing options.",
                swedish: "Låt mig koppla dig till vårt Säljteam för att diskutera planer och prisalternativ."
            },
            general: {
                english: "I understand you need help. Let me connect you with our Customer Support team for general assistance.",
                swedish: "Jag förstår att du behöver hjälp. Låt mig koppla dig till vårt Kundsupportteam för allmän assistans."
            }
        };

        const lang = isSwedish ? 'swedish' : 'english';

        if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('meny') || lowerMessage.includes('mat')) {
            return messages.menu[lang];
        } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('faktur') || lowerMessage.includes('betalning')) {
            return messages.billing[lang];
        } else if (lowerMessage.includes('technical') || lowerMessage.includes('api') || lowerMessage.includes('integration') || lowerMessage.includes('teknisk') || lowerMessage.includes('teknik')) {
            return messages.technical[lang];
        } else if (lowerMessage.includes('order') || lowerMessage.includes('delivery') || lowerMessage.includes('beställ') || lowerMessage.includes('lever')) {
            return messages.delivery[lang];
        } else if (lowerMessage.includes('sales') || lowerMessage.includes('plan') || lowerMessage.includes('pricing') || lowerMessage.includes('försäljning') || lowerMessage.includes('pris')) {
            return messages.sales[lang];
        }

        return messages.general[lang];
    }

    detectSwedish(message) {
        // Check for Swedish keywords and patterns
        const swedishKeywords = ['hej', 'tack', 'ja', 'nej', 'kan', 'vill', 'behöver', 'hjälp', 'hur', 'vad', 'när', 'var', 'varför', 'vilken', 'svenska'];
        const lowerMessage = message.toLowerCase();

        // Check for Swedish keywords
        for (const keyword of swedishKeywords) {
            if (lowerMessage.includes(keyword)) {
                return true;
            }
        }

        // Check if window.chatbotCurrentLanguage is set to Swedish
        if (typeof window !== 'undefined' && window.chatbotCurrentLanguage === 'swedish') {
            return true;
        }

        return false;
    }

    clearFlow() {
        if (confirm('Are you sure you want to clear the entire flow? This action cannot be undone.')) {
            this.nodes = [];
            this.connections = [];
            this.renderNodes();
            this.showToast('Flow cleared', 'info');
            this.autoSave(); // 🔧 FIX 3: Auto-save when clearing flow
        }
    }

    switchLanguage(language) {
        // Update node displays for the selected language
        this.renderNodes();
        this.showToast(`Switched to ${language} flow`, 'info');
    }

    editNode(node) {
        this.showEditNodeModal(node);
    }

    showEditNodeModal(node) {
        const modal = document.createElement('div');
        modal.className = 'node-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Node: ${node.data.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-node-form" data-node-id="${node.id}">
                        ${this.getEditFormHTML(node)}
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                    <button type="button" class="btn btn-primary modal-update" data-node-id="${node.id}">
                        <i class="fas fa-save"></i> ${node.type === 'intent' ? 'Save Settings' : 'Update Node'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Update node handler
        modal.querySelector('.modal-update').addEventListener('click', (e) => {
            const nodeId = e.target.getAttribute('data-node-id');
            this.updateNodeFromModal(nodeId);

            // Force immediate save after modal update
            setTimeout(() => {
                this.saveFlow();
                this.showToast('Changes saved successfully', 'success');
            }, 100);
        });

        // AI mode toggle handler
        const aiModeCheckbox = modal.querySelector('#edit-ai-mode');
        if (aiModeCheckbox) {
            aiModeCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const assistantSelector = modal.querySelector('.assistant-selector');
                const aiPromptGroup = modal.querySelector('.ai-prompt-group');
                const manualMessageGroup = modal.querySelector('.manual-message-group');
                const aiPreviewSection = modal.querySelector('.ai-preview-section');

                if (assistantSelector) assistantSelector.style.display = isChecked ? 'block' : 'none';
                if (aiPromptGroup) aiPromptGroup.style.display = isChecked ? 'block' : 'none';
                if (manualMessageGroup) manualMessageGroup.style.display = isChecked ? 'none' : 'block';
                if (aiPreviewSection) aiPreviewSection.style.display = isChecked ? 'block' : 'none';
            });
        }

        // AI preview handler
        const previewBtn = modal.querySelector('#preview-ai-response');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewAIResponse(node);
            });
        }

        // Handle department change for handoff nodes
        const departmentSelect = modal.querySelector('#edit-department');
        if (departmentSelect) {
            departmentSelect.addEventListener('change', () => this.updateAgentsList(departmentSelect.value));
                }

        // Add auto-save functionality for form changes
        const form = modal.querySelector('#edit-node-form');
        if (form) {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.scheduleAutoSave();
                });
                input.addEventListener('change', () => {
                    this.scheduleAutoSave();
                });
            });

            // Special handling for checkboxes in intent categories with immediate save
            const checkboxes = form.querySelectorAll('.intent-checkboxes input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    console.log('Checkbox changed:', checkbox.value, checkbox.checked);

                    // Immediate auto-save for checkbox changes
                    const nodeId = form.getAttribute('data-node-id');
                    const node = this.nodes.find(n => n.id === nodeId);

                    if (node && node.type === 'intent') {
                        // Update intents immediately
                        const currentCheckedIntents = Array.from(form.querySelectorAll('.intent-checkboxes input[type="checkbox"]:checked'))
                            .map(input => input.value);

                        node.data.intents = currentCheckedIntents;

                        // Save immediately
                        this.autoSave();

                        console.log('Immediately saved intent changes:', currentCheckedIntents);
                    }
                });
            });
        }
    }

    // Update agent list based on selected department
    updateAgentsList(departmentId) {
        const agentSelect = document.querySelector('#edit-agent');
        if (!agentSelect) return;

        const availableAgents = this.getAvailableAgents();
        const departmentAgents = availableAgents.filter(agent => 
            !departmentId || agent.department === departmentId
        );

        agentSelect.innerHTML = '<option value="">Any Available Agent</option>' + 
            departmentAgents.map(agent => 
                `<option value="${agent.id}">${agent.name} (${agent.department})</option>`
            ).join('');
    }

    getEditFormHTML(node) {
        let formHTML = `
            <div class="form-group">
                <label>Node Title</label>
                <input type="text" id="edit-node-title" class="form-control" value="${node.data.title}">
            </div>
        `;

        switch (node.type) {
            case 'welcome':
                formHTML += `
                    <div class="form-group">
                        <label>English Message</label>
                        <textarea id="edit-message-en" class="form-control" rows="3">${node.data.messages.english}</textarea>
                    </div>
                    <div classiv class="form-group">
                        <label>Swedish Message</label>
                        <textarea id="edit-message-sv" class="form-control" rows="3">${node.data.messages.swedish || ''}</textarea>
                    </div>
                `;
                break;

            case 'handoff':
                const availableAgents = this.getAvailableAgents();
                const departmentAgents = this.getAgentsByDepartment();

                formHTML += `
                    <div class="form-group">
                        <label>Department</label>
                        <select id="edit-department" class="form-control" onchange="this.updateAgentsList()">
                            ${this.masterTemplate.departments.map(dept => 
                                `<option value="${dept.id}" ${dept.id === node.data.department ? 'selected' : ''}>${dept.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Agent (Optional)</label>
                        <select id="edit-agent" class="form-control">
                            <option value="">Any Available Agent</option>
                            ${availableAgents.map(agent => 
                                `<option value="${agent.id}" ${agent.id === node.data.selectedAgent ? 'selected' : ''}>${agent.name} (${agent.department})</option>`
                            ).join('')}
                        </select>
                        <small class="form-text text-muted">Leave empty to auto-assign based on department availability</small>
                    </div>
                    <div class="form-group">
                        <label>Handoff Message</label>
                        <textarea id="edit-handoff-message" class="form-control" rows="2" placeholder="Message to show when transferring to agent...">${node.data.handoffMessage || 'Transferring you to a human agent...'}</textarea>
                    </div>
                `;
                break;

            case 'intent':
                formHTML += `
                    <div class="form-group">
                        <label>Intent Categories</label>
                        <div class="intent-checkboxes">
                            ${this.masterTemplate.intents.map(category => `
                                <div class="intent-category">
                                    <h5>${category.category}</h5>
                                    ${category.intents.map(intent => `
                                        <label class="checkbox-label">
                                            <input type="checkbox" value="${intent}" ${node.data.intents && node.data.intents.includes(intent) ? 'checked' : ''}>
                                            <span class="checkmark"></span>
                                            ${intent}
                                        </label>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-intent-description">Description (Optional)</label>
                        <textarea id="edit-intent-description" class="form-control" rows="3" placeholder="Describe what this intent detection handles...">${node.data.description || ''}</textarea>
                    </div>
                `;
                break;

            case 'condition':
                formHTML += `
                    <div class="form-group">
                        <label for="edit-condition">Condition Expression</label>
                        <input type="text" id="edit-condition" class="form-control" value="${node.data.condition || ''}" placeholder="e.g., user.language === 'swedish'">
                        <small class="form-text text-muted">Enter a JavaScript-like condition expression</small>
                    </div>
                    <div class="form-group">
                        <label for="edit-condition-description">Description</label>
                        <textarea id="edit-condition-description" class="form-control" rows="2" placeholder="Describe when this condition should be true...">${node.data.description || ''}</textarea>
                    </div>
                `;
                break;

            case 'message':
                 // Determine visibility based on AI mode
                const aiMode = node.data.aiMode === true;
                const assistantDisplay = aiMode ? 'block' : 'none';
                const aiPromptDisplay = aiMode ? 'block' : 'none';
                const manualMessageDisplay = aiMode ? 'none' : 'block';
                const aiPreviewDisplay = aiMode ? 'block' : 'none';

                formHTML += `
                    <div class="form-group">
                        <label>AI Mode</label>
                        <div class="ai-mode-toggle">
                            <input type="checkbox" id="edit-ai-mode" ${aiMode ? 'checked' : ''}>
                            <label for="edit-ai-mode">Enable AI Assistant</label>
                        </div>
                    </div>

                    <div class="assistant-selector" style="display: ${assistantDisplay};">
                        <div class="form-group">
                            <label for="edit-assistant">Select Assistant</label>
                            <select id="edit-assistant" class="form-control">
                                ${this.getAvailableAIAssistants().map(assistant => `
                                    <option value="${assistant.id}" ${node.data.selectedAssistant === assistant.id ? 'selected' : ''}>${assistant.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="ai-prompt-group" style="display: ${aiPromptDisplay};">
                        <div class="form-group">
                            <label for="edit-ai-prompt">AI Prompt</label>
                            <textarea id="edit-ai-prompt" class="form-control" rows="4" placeholder="Enter the prompt for the AI assistant...">${node.data.aiPrompt || ''}</textarea>
                        </div>
                        <div class="ai-preview-section" style="display: ${aiPreviewDisplay};">
                            <button type="button" class="btn btn-info btn-sm" id="preview-ai-response">Preview AI Response</button>
                            <div id="ai-preview-content"></div>
                        </div>
                    </div>

                    <div class="manual-message-group" style="display: ${manualMessageDisplay};">
                        <div class="form-group">
                            <label for="edit-message-en">English Message</label>
                            <textarea id="edit-message-en" class="form-control" rows="4" placeholder="Enter the English message to display...">${node.data.messages?.english || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-message-sv">Swedish Message</label>
                            <textarea id="edit-message-sv" class="form-control" rows="4" placeholder="Enter the Swedish message to display...">${node.data.messages?.swedish || ''}</textarea>
                        </div>
                    </div>
                `;
                break;
        }

        return formHTML;
    }

    updateNodeFromModal(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Update common fields
        const titleInput = document.getElementById('edit-node-title');
        if (titleInput) {
            node.data.title = titleInput.value;
        }

        // Update type-specific fields
        switch (node.type) {
            case 'message':
                const aiModeCheckbox = document.getElementById('edit-ai-mode');
                const aiMode = aiModeCheckbox ? aiModeCheckbox.checked : false;

                node.data.aiMode = aiMode;

                if (aiMode) {
                    // AI mode - store assistant and prompt
                    const assistantSelect = document.getElementById('edit-assistant');
                    const aiPromptTextarea = document.getElementById('edit-ai-prompt');

                    node.data.selectedAssistant = assistantSelect ? assistantSelect.value : '';
                    node.data.aiPrompt = aiPromptTextarea ? aiPromptTextarea.value : '';
                } else {
                    // Manual mode - store messages
                    const englishMsg = document.getElementById('edit-message-en');
                    const swedishMsg = document.getElementById('edit-message-sv');

                    if (!node.data.messages) node.data.messages = {};
                    node.data.messages.english = englishMsg ? englishMsg.value : '';
                    node.data.messages.swedish = swedishMsg ? swedishMsg.value : '';
                }
                break;

            case 'welcome':
                const messageEn = document.getElementById('edit-message-en');
                const messageSv = document.getElementById('edit-message-sv');
                if (messageEn) node.data.messages.english = messageEn.value;
                if (messageSv) node.data.messages.swedish = messageSv.value;
                break;

            case 'handoff':
                const selectedDept = document.getElementById('edit-department');
                const selectedAgent = document.getElementById('edit-agent');
                const handoffMessage = document.getElementById('edit-handoff-message');

                if (selectedDept) {
                    const dept = this.masterTemplate.departments.find(d => d.id === selectedDept.value);
                    node.data.department = selectedDept.value;
                    node.data.agents = dept ? dept.agents : [];
                    node.data.color = dept ? dept.color : '#34495e';
                }
                if (selectedAgent) node.data.selectedAgent = selectedAgent.value;
                if (handoffMessage) node.data.handoffMessage = handoffMessage.value || 'Transferring you to a human agent...';

                // Validate and serialize node data properly
                node.data = this.validateNodeData(node.type, node.data);
                break;

            case 'intent':
                // Get all checkboxes from the intent categories section
                const intentModal = document.querySelector('.node-modal');
                const checkedIntents = [];

                if (intentModal) {
                    const checkboxes = intentModal.querySelectorAll('.intent-checkboxes input[type="checkbox"]');
                    checkboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            checkedIntents.push(checkbox.value);
                        }
                    });
                }

                const intentDescription = document.getElementById('edit-intent-description');

                // Update node data
                node.data.intents = checkedIntents;
                if (intentDescription) {
                    node.data.description = intentDescription.value;
                }

                console.log('Updated intent node with intents:', checkedIntents);
                console.log('Updated intent node description:', node.data.description);

                // Validate that intents array is properly set
                if (!Array.isArray(node.data.intents)) {
                    node.data.intents = [];
                }

                break;

            case 'condition':
                const conditionInput = document.getElementById('edit-condition');
                if (conditionInput) {
                    node.data.condition = conditionInput.value;
                }
                break;
        }

        this.renderNodes();
        this.renderConnections();

        // Close modal
        const modal = document.querySelector('.node-modal');
        if (modal) {
            modal.remove();
        }

        this.showToast('Node updated successfully', 'success');
        this.autoSave(); // Auto-save when updating node
    }

    duplicateNode(originalNode) {
        // Create a proper deep copy of the node data
        const duplicatedData = JSON.parse(JSON.stringify(originalNode.data));

        // Modify the title to indicate it's a copy
        if (duplicatedData.title) {
            duplicatedData.title = duplicatedData.title + ' (Copy)';
        }

        // Validate and ensure all node properties are properly copied
        if (originalNode.type === 'intent' && !Array.isArray(duplicatedData.intents)) {
            duplicatedData.intents = originalNode.data.intents || [];
        }
        if (originalNode.type === 'handoff') {
            duplicatedData.department = originalNode.data.department || '';
            duplicatedData.agents = originalNode.data.agents || [];
            duplicatedData.color = originalNode.data.color || '#34495e';
        }
        if (originalNode.type === 'message') {
            duplicatedData.messages = duplicatedData.messages || { english: '', swedish: '' };
            duplicatedData.aiMode = originalNode.data.aiMode || false;
            duplicatedData.selectedAssistant = originalNode.data.selectedAssistant || '';
            duplicatedData.aiPrompt = originalNode.data.aiPrompt || '';
        }

        // Generate a truly unique ID for the duplicated node
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const uniqueId = `node-${timestamp}-${randomId}`;

        // Create the duplicated node with better positioning offset
        const duplicatedNode = {
            id: uniqueId,
            type: originalNode.type,
            position: { 
                x: originalNode.position.x + 30, 
                y: originalNode.position.y + 30 
            },
            data: duplicatedData,
            connections: {
                inputs: [],
                outputs: []
            }
        };

        // Add to nodes array
        this.nodes.push(duplicatedNode);

        // Ensure clean re-render without DOM conflicts
        setTimeout(() => {
            this.renderNodes();
            this.renderConnections();
        }, 50);

        this.showToast('Node duplicated successfully', 'success');

        // Auto-save with validation
        this.autoSave();

        console.log('Duplicated node created:', duplicatedNode.id, 'from:', originalNode.id);
    }

    deleteNode(nodeId) {
        if (confirm('Are you sure you want to delete this node?')) {
            this.nodes = this.nodes.filter(n => n.id !== nodeId);
            this.connections = this.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
            this.renderNodes();
            this.renderConnections();
            this.showToast('Node deleted', 'success');
            this.autoSave(); // 🔧 FIX 3: Auto-save when deleting node
        }
    }

    // Helper method to get available agents from ChatbotManager
    getAvailableAgents() {
        if (window.chatbotManager && window.chatbotManager.settings && window.chatbotManager.settings.agents) {
            return window.chatbotManager.settings.agents.filter(agent => agent.active !== false);
        }
        return [];
    }

    // Helper method to get agents grouped by department
    getAgentsByDepartment() {
        if (window.chatbotManager && typeof window.chatbotManager.getAgentsByDepartment === 'function') {
            return window.chatbotManager.getAgentsByDepartment();
        }
        return {};
    }

    // Validate and ensure proper serialization of node data
    validateNodeData(nodeType, data) {
        const validatedData = { ...data };

        switch (nodeType) {
            case 'message':
                validatedData.messages = validatedData.messages || { english: '', swedish: '' };
                break;
            case 'handoff':
                validatedData.department = validatedData.department || '';
                validatedData.selectedAgent = validatedData.selectedAgent || '';
                validatedData.handoffMessage = validatedData.handoffMessage || 'Transferring you to a human agent...';
                validatedData.agents = validatedData.agents || [];
                validatedData.color = validatedData.color || '#34495e';
                break;
            case 'intent':
                validatedData.intents = validatedData.intents || [];
                break;
        }

        return validatedData;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    handleCanvasMouseMove(e) {
        // Handle canvas panning - highest priority when panning is active
        if (this.isPanning) {
            e.preventDefault();
            const deltaX = e.clientX - this.lastPanPoint.x;
            const deltaY = e.clientY - this.lastPanPoint.y;

            this.panOffset.x += deltaX;
            this.panOffset.y += deltaY;

            this.lastPanPoint.x = e.clientX;
            this.lastPanPoint.y = e.clientY;

            this.updateCanvasTransform();
            return; // Exit early when panning
        }

        // Handle individual node dragging - only when not panning
        if (this.draggedNode && !this.isPanning) {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            
            // Calculate world coordinates accounting for zoom and pan
            const worldX = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
            const worldY = (e.clientY - rect.top - this.panOffset.y) / this.zoom;

            // Update node position
            this.draggedNode.position.x = worldX - this.draggedNode.dragOffset.x;
            this.draggedNode.position.y = worldY - this.draggedNode.dragOffset.y;

            // Update visual position immediately
            const nodeElement = document.querySelector(`[data-node-id="${this.draggedNode.id}"]`);
            if (nodeElement) {
                nodeElement.style.left = this.draggedNode.position.x + 'px';
                nodeElement.style.top = this.draggedNode.position.y + 'px';
            }

            // Update connections when nodes move
            this.renderConnections();
            return; // Exit early when dragging
        }

        // Update temp connection line
        if (this.isConnecting && this.tempConnectionStart) {
            this.updateTempConnectionLine(e.clientX, e.clientY);
        }
    }

    handleCanvasMouseUp(e) {
        // Reset panning state
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        }

        // Reset node dragging state
        if (this.draggedNode) {
            this.draggedNode = null;
            this.canvas.style.cursor = 'default';
            this.autoSave(); // Auto-save when node moved
        }
    }

    handleCanvasClick(e) {
        // Cancel connection if clicking outside of connection points
        if (this.isConnecting && !e.target.classList.contains('connection-point')) {
            this.clearTempConnectionLine();
            this.isConnecting = false;
            if (this.connectionStart) {
                this.connectionStart.element.classList.remove('connecting');
                this.connectionStart = null;
            }
            this.showToast('Connection cancelled', 'info');
        }

        // 🔧 FIX 2: Handle connection deletion by clicking on connection lines
        if (e.target.classList.contains('connection-line') || e.target.closest('.connection-line')) {
            const connectionLine = e.target.classList.contains('connection-line') ? e.target : e.target.closest('.connection-line');
            const connectionId = connectionLine.dataset.connectionId;
            if (connectionId && confirm('Delete this connection?')) {
                this.deleteConnection(connectionId);
            }
            return;
        }

        // Deselect any selected nodes when clicking empty canvas
        if (e.target === this.canvas || e.target.classList.contains('flow-background')) {
            this.selectedNode = null;
            document.querySelectorAll('.flow-node.selected').forEach(node => {
                node.classList.remove('selected');
            });
        }
    }

    deleteConnection(connectionId) {
        this.connections = this.connections.filter(conn => conn.id !== connectionId);
        this.renderConnections();
        this.autoSave(); // Auto-save after deletion
        this.showToast('Connection deleted', 'success');
    }

    addNode(type) {
        // Enhanced prevention of ghost duplicates
        if (this.isAddingNode || !this.isInitialized) {
            console.log('Node addition blocked: isAddingNode=', this.isAddingNode, 'isInitialized=', this.isInitialized);
            return;
        }

        // Debounce rapid clicks
        const now = Date.now();
        if (this.lastNodeAddTime && (now - this.lastNodeAddTime) < 500) {
            console.log('Node addition blocked: too rapid');
            return;
        }
        this.lastNodeAddTime = now;

        this.isAddingNode = true;

        // Calculate a good position for the new node (center of visible area)
        const centerX = (-this.panOffset.x / this.zoom) + (window.innerWidth / (2 * this.zoom));
        const centerY = (-this.panOffset.y / this.zoom) + (window.innerHeight / (2 * this.zoom));
        
        const randomOffset = Math.random() * 50 - 25; // -25 to +25
        const newNode = this.createNode({
            type,
            position: { 
                x: centerX + randomOffset, 
                y: centerY + randomOffset 
            },
            data: this.getDefaultNodeData(type)
        });

        // Re-render all nodes to ensure clean state
        this.renderNodes();
        this.renderConnections();

        this.autoSave(); // Auto-save when adding node
        this.showToast(`${type} node added`, 'success');

        // Reset the flag after a short delay
        setTimeout(() => {
            this.isAddingNode = false;
        }, 100);
    }

    getDefaultNodeData(type) {
        switch (type) {
            case 'welcome':
                return {
                    title: 'Welcome Message',
                    messages: {
                        english: "🇬🇧 English: Hello! I'm your Fooodis assistant. How can I help you today?",
                        swedish: "🇸🇪 Svenska: Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?",
                        bilingual: "🇬🇧 English: Hello! I'm your Fooodis assistant. How can I help you today?\n\n🇸🇪 Svenska: Hej! Jag är din Fooodis-assistent. Hur kan jag hjälpa dig idag?"
                    }
                };
            case 'intent':
                return {
                    title: 'Intent Detection',
                    intents: ['menu-help', 'ordering-help', 'technical-support', 'billing-question']
                };
            case 'handoff':
                return {
                    title: 'Agent Handoff',
                    department: '',
                    agents: [],
                    color: '#34495e'
                };
            case 'condition':
                return {
                    title: 'Condition Check',
                    condition: ''
                };
            default:
                return {
                    title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Node`
                };
        }
    }

    updateCanvasTransform() {
        const flowNodes = document.getElementById('flow-nodes');
        const flowConnections = document.getElementById('flow-connections');

        if (flowNodes) {
            flowNodes.style.transform = `scale(${this.zoom}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
            flowNodes.style.pointerEvents = 'auto';
            flowNodes.style.zIndex = '10'; // Ensure nodes are above connections
        }
        if (flowConnections) {
            flowConnections.style.transform = `scale(${this.zoom}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
            flowConnections.style.pointerEvents = 'none';
            flowConnections.style.zIndex = '1'; // Keep connections below nodes
        }

        // Update zoom level display
        const zoomLevel = document.querySelector('.canvas-zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }

        // Update disconnect button scaling to counter the canvas transform
        document.querySelectorAll('.disconnect-btn').forEach(btn => {
            const counterScale = 1 / this.zoom;
            btn.style.transform = `translate(-50%, -50%) scale(${counterScale})`;
            btn.style.pointerEvents = 'auto';
            btn.style.zIndex = '5'; // Keep disconnect buttons below nodes but above connections
        });

        // Ensure all nodes have proper pointer events and z-index
        document.querySelectorAll('.flow-node').forEach(node => {
            node.style.pointerEvents = 'auto';
            node.style.zIndex = '20'; // Nodes should be on top
            node.style.position = 'absolute';
        });

        // Update zoom controls z-index to stay on top
        const zoomControls = document.querySelector('.canvas-zoom-controls');
        if (zoomControls) {
            zoomControls.style.zIndex = '1000';
        }
    }

    handleCanvasMouseDown(e) {
        // Enhanced interaction filtering with better error handling
        try {
            // Ignore if clicking on UI elements like buttons or connection points
            if (e.target.closest('.node-controls') || 
                e.target.closest('.connection-point') || 
                e.target.closest('.disconnect-btn') ||
                e.target.closest('.toolbar-btn') ||
                e.target.closest('.canvas-zoom-controls') ||
                e.target.closest('.modal') ||
                e.target.closest('.toast')) {
                return;
            }

            // Additional safety check for disabled state
            if (!this.isInitialized || this.isAddingNode) {
                return;
            }
        } catch (error) {
            console.error('❌ Canvas interaction error:', error);
            return;
        }

        // Handle canvas panning with middle mouse button or Shift+click
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            e.preventDefault();
            this.isPanning = true;
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Handle panning with right mouse button
        if (e.button === 2) {
            e.preventDefault();
            this.isPanning = true;
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Click on empty canvas - clear selection and enable panning
        if (!e.target.closest('.flow-node') && e.button === 0) {
            this.selectedNode = null;
            document.querySelectorAll('.flow-node.selected').forEach(node => {
                node.classList.remove('selected');
            });
            
            // Enable panning on left click on empty canvas
            this.isPanning = true;
            this.lastPanPoint = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    updateZoom(delta) {
        this.zoom += delta;
        this.zoom = Math.max(0.1, Math.min(this.zoom, 2));
        this.updateCanvasTransform();
    }

    updateDisconnectButtonScaling() {
        const disconnectButtons = document.querySelectorAll('.disconnect-btn');
        disconnectButtons.forEach(btn => {
            // Counter-scale the buttons to maintain visual size at all zoom levels
            const counterScale = 1 / this.zoom;
            btn.style.transform = `translate(-50%, -50%) scale(${counterScale})`;

            // Maintain consistent visual size
            btn.style.width = '20px';
            btn.style.height = '20px';
            btn.style.fontSize = '14px';
            btn.style.borderWidth = '2px';
        });
    }

    zoomIn() {
        this.updateZoom(0.1);
    }

    zoomOut() {
        this.updateZoom(-0.1);
    }

    resetZoom() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.updateCanvasTransform();
        document.querySelector('.canvas-zoom-level').textContent = `${Math.round(this.zoom * 100)}%`;
    }

    autoSave() {
        try {
            // Debounce auto-save to prevent excessive saves
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }

            this.autoSaveTimeout = setTimeout(() => {
                try {
                    this.saveFlow();
                    console.log('Auto-saved flow with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
                } catch (error) {
                    console.error('❌ Auto-save failed:', error);
                    this.showToast('Auto-save failed', 'error');
                }
            }, 500); // Save after 500ms of inactivity
        } catch (error) {
            console.error('❌ Auto-save setup failed:', error);
        }
    }

    // Health check and recovery mechanism
    performHealthCheck() {
        try {
            const issues = [];
            
            // Check for missing DOM elements
            if (!document.getElementById('flow-nodes')) {
                issues.push('Missing flow-nodes container');
            }
            if (!document.getElementById('flow-connections')) {
                issues.push('Missing flow-connections container');
            }
            
            // Check for orphaned nodes
            const nodeElements = document.querySelectorAll('.flow-node');
            if (nodeElements.length !== this.nodes.length) {
                issues.push(`DOM/data mismatch: ${nodeElements.length} elements vs ${this.nodes.length} nodes`);
            }
            
            if (issues.length > 0) {
                console.warn('⚠️ Health check issues found:', issues);
                this.attemptRecovery();
            }
            
            return issues.length === 0;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }

    attemptRecovery() {
        console.log('🔄 Attempting system recovery...');
        try {
            // Re-render everything
            this.renderNodes();
            this.renderConnections();
            this.showToast('System recovered', 'info');
        } catch (error) {
            console.error('❌ Recovery failed:', error);
            this.showToast('Recovery failed - please refresh page', 'error');
        }
    }

    scheduleAutoSave() {
        // Clear existing timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Set new timeout for 2 seconds
        this.autoSaveTimeout = setTimeout(() => {
            this.saveFlow();
        }, 2000);
    }

    startHealthMonitoring() {
        // Perform periodic health checks every 30 seconds
        setInterval(() => {
            if (this.isInitialized) {
                this.performHealthCheck();
            }
        }, 30000);

        // Also check when window regains focus
        window.addEventListener('focus', () => {
            if (this.isInitialized) {
                setTimeout(() => this.performHealthCheck(), 1000);
            }
        });
    }

    previewAIResponse(node) {
        const previewContent = document.getElementById('ai-preview-content');
        const assistantSelect = document.getElementById('edit-assistant');
        const promptTextarea = document.getElementById('edit-ai-prompt');

        if (!previewContent) return;

        const selectedAssistantId = assistantSelect ? assistantSelect.value : node.data.selectedAssistant;
        const customPrompt = promptTextarea ? promptTextarea.value : node.data.aiPrompt;

        if (!selectedAssistantId) {
            previewContent.innerHTML = '<div class="ai-preview-error">Please select an AI assistant first</div>';
            return;
        }

        // Show loading state
        previewContent.innerHTML = '<div class="ai-preview-loading">Generating preview...</div>';

        // Get the selected assistant details
        const assistants = this.getAvailableAIAssistants();
        const selectedAssistant = assistants.find(a => a.id === selectedAssistantId);

        // Simulate AI response for preview (in real implementation, this would call the actual AI)
        setTimeout(() => {
            const sampleMessage = this.generateSampleAIResponse(selectedAssistant, customPrompt);
            previewContent.innerHTML = `
                <div class="ai-preview-success">
                    <div class="preview-message">
                        <strong>Sample Response:</strong>
                        <p>${sampleMessage}</p>
                    </div>
                    <div class="preview-note" style="font-size: 11px; color: #666; margin-top: 8px;">
                        This is a preview. Actual responses will be generated in real-time during conversations.
                    </div>
                </div>
            `;
        }, 1500);
    }

    generateSampleAIResponse(assistant, customPrompt) {
        const assistantName = assistant ? assistant.name : 'AI Assistant';
        const department = assistant ? assistant.department : 'General';

        const samples = {
            'Sales': `Hello! I'm ${assistantName} from our Sales team. I'd be happy to help you learn about our pricing plans and features. What specific information are you looking for?`,
            'Billing': `Hi there! I'm ${assistantName} from Billing support. I can assist you with payment questions, subscription management, and invoicing. How can I help you today?`,
            'Technical Support': `Hello! I'm ${assistantName} from Technical Support. I can help you with integration issues, API questions, and troubleshooting. What technical challenge can I assist you with?`,
            'Delivery': `Hi! I'm ${assistantName} from our Delivery team. I can help you track orders, update delivery information, and resolve delivery-related questions. What do you need help with?`,
            'General': `Hello! I'm ${assistantName}, your Fooodis assistant. I'm here to help you with any questions about our platform. How can I assist you today?`
        };

        let response = samples[department] || samples['General'];

        if (customPrompt) {
            response += `\n\nNote: This response will be customized based on your specific prompt: "${customPrompt.substring(0, 100)}${customPrompt.length > 100 ? '...' : ''}"`;
        }

        return response;
    }

    // Dummy function for now, replace with actual implementation
    getAvailableAIAssistants() {
        return [
            { id: 'marcus-chen', name: 'Marcus Chen - Sales', department: 'Sales' },
            { id: 'elena-rodriguez', name: 'Elena Rodriguez - Billing', department: 'Billing' },
            { id: 'david-kim', name: 'David Kim - Technical Support', department: 'Technical Support' },
            { id: 'anya-singh', name: 'Anya Singh - Delivery', department: 'Delivery' },
            { id: 'general-ai', name: 'Fooodis AI Assistant', department: 'General' }
        ];
    }
}

// Initialize the node flow builder
let nodeFlowBuilder;

// Export for global access
if (typeof window !== 'undefined') {
    window.NodeFlowBuilder = NodeFlowBuilder;
}