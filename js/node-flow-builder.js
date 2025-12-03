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
        this.isDragging = false;
        this.isConnecting = false;
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.panStartOffset = { x: 0, y: 0 };
        this.connectionStart = null;
        this.tempConnectionStart = null;
        this.masterTemplate = this.getMasterTemplate();
        this.autoSaveTimeout = null;
        
        // Multi-language flow storage
        this.flowsByLanguage = { en: null, sv: null };
        
        // Undo/Redo history
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Configured agents from ChatbotManager
        this.configuredAgents = [];
        
        // Sync with ChatbotManager if available
        this.syncWithChatbotManager();
        
        // Load saved flow data from cloud then localStorage
        this.loadFlowFromCloud();
        
        this.init();
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
                    id: 'salon',
                    name: 'Salon',
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
            }
        }
        
        // Get configured agents from ChatbotManager
        if (window.chatbotManager && window.chatbotManager.settings?.agents) {
            this.configuredAgents = window.chatbotManager.settings.agents;
            console.log('🔄 Loaded configured agents:', this.configuredAgents.length);
        }
        
        // Get AI assistants from ChatbotManager
        if (window.chatbotManager && window.chatbotManager.assistants) {
            this.assistants = window.chatbotManager.assistants;
            console.log('🔄 Loaded AI assistants:', this.assistants.length);
        }
    }

    updateDepartments() {
        // Method to refresh departments from ChatbotManager
        this.syncWithChatbotManager();
        this.showToast('Settings synced', 'info');
    }
    
    /**
     * Get available agents for handoff nodes
     */
    getAvailableAgents() {
        if (this.configuredAgents && this.configuredAgents.length > 0) {
            return this.configuredAgents.map(agent => ({
                id: agent.id,
                name: agent.name,
                department: agent.department,
                avatar: agent.avatar,
                assignedAssistantId: agent.assignedAssistantId
            }));
        }
        // Fallback to department-based agents
        return this.masterTemplate.departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            department: dept.name,
            color: dept.color
        }));
    }

    init() {
        console.log('🚀 NodeFlowBuilder init() called');
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.createDefaultFlow();
        console.log('✅ NodeFlowBuilder initialization complete');
    }

    setupCanvas() {
        console.log('📐 setupCanvas() called');
        const flowContainer = document.getElementById('node-flow-container');
        if (!flowContainer) {
            console.error('❌ node-flow-container not found!');
            return;
        }
        console.log('📐 flowContainer found:', flowContainer);

        // Create canvas
        this.canvas = document.createElement('div');
        this.canvas.className = 'node-flow-canvas';
        // Ensure proper positioning context for disconnect buttons
        this.canvas.style.position = 'relative';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.innerHTML = `
            <div class="flow-workspace" id="flow-workspace">
                <div class="flow-background">
                    <div class="flow-grid"></div>
                </div>
                <div class="flow-nodes" id="flow-nodes"></div>
                <div class="flow-connections" id="flow-connections"></div>
            </div>
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
        
        // Store reference to workspace for zoom transforms
        this.workspace = document.getElementById('flow-workspace');
        
        // Initialize zoom functionality with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.updateZoom(delta);
        });
        
        // Setup node dragging functionality using document-level event delegation
        // This ensures events work even with transformed elements
        document.addEventListener('mousedown', (e) => {
            // Only handle if within our canvas
            if (this.canvas && this.canvas.contains(e.target)) {
                this.handleMouseDown(e);
            }
        });
        document.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
        document.addEventListener('click', (e) => {
            // Only handle if within our canvas
            if (this.canvas && this.canvas.contains(e.target)) {
                this.handleCanvasClick(e);
            }
        });
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
                <button class="toolbar-btn" id="undo-btn" title="Undo (Ctrl+Z)">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="toolbar-btn" id="redo-btn" title="Redo (Ctrl+Y)">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
            <div class="toolbar-section">
                <button class="toolbar-btn" id="save-flow-btn" title="Save Flow">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="toolbar-btn" id="test-flow-btn" title="Test Flow">
                    <i class="fas fa-play"></i> Test
                </button>
                <button class="toolbar-btn" id="clear-flow-btn" title="Clear All">
                    <i class="fas fa-trash"></i> Clear
                </button>
            </div>
            <div class="toolbar-section">
                <select id="nodeLanguageSelector" class="form-select">
                    <option value="en">English Flow</option>
                    <option value="sv">Swedish Flow</option>
                </select>
            </div>
        `;
    }

    setupEventListeners() {
        // Canvas zoom controls - handle clicks on icon inside button too
        document.addEventListener('click', (e) => {
            if (e.target.id === 'canvas-zoom-in' || e.target.closest('#canvas-zoom-in')) {
                this.zoomIn();
            } else if (e.target.id === 'canvas-zoom-out' || e.target.closest('#canvas-zoom-out')) {
                this.zoomOut();
            } else if (e.target.id === 'canvas-zoom-reset' || e.target.closest('#canvas-zoom-reset')) {
                this.resetZoom();
            }
        });

        // 🔧 FIX: Add missing toolbar button event listeners
        document.addEventListener('click', (e) => {
            // Node creation buttons
            if (e.target.id === 'add-welcome-node' || e.target.closest('#add-welcome-node')) {
                console.log('🏠 Add Welcome Node clicked');
                this.addNode('welcome');
            } else if (e.target.id === 'add-intent-node' || e.target.closest('#add-intent-node')) {
                console.log('💡 Add Intent Node clicked');
                this.addNode('intent');
            } else if (e.target.id === 'add-handoff-node' || e.target.closest('#add-handoff-node')) {
                console.log('👔 Add Handoff Node clicked');
                this.addNode('handoff');
            } else if (e.target.id === 'add-condition-node' || e.target.closest('#add-condition-node')) {
                console.log('🔀 Add Condition Node clicked');
                this.addNode('condition');
            } else if (e.target.id === 'add-message-node' || e.target.closest('#add-message-node')) {
                console.log('💬 Add Message Node clicked');
                this.addNode('message');
            }
            // Flow control buttons
            else if (e.target.id === 'save-flow-btn' || e.target.closest('#save-flow-btn')) {
                console.log('💾 Save Flow clicked');
                this.saveFlow();
            } else if (e.target.id === 'test-flow-btn' || e.target.closest('#test-flow-btn')) {
                console.log('▶️ Test Flow clicked');
                this.testFlow();
            } else if (e.target.id === 'clear-flow-btn' || e.target.closest('#clear-flow-btn')) {
                console.log('🗑️ Clear Flow clicked');
                this.clearFlow();
            }
        });

        // Node interaction events
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Undo/Redo buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'undo-btn' || e.target.closest('#undo-btn')) {
                this.undo();
            } else if (e.target.id === 'redo-btn' || e.target.closest('#redo-btn')) {
                this.redo();
            }
        });
        
        // Keyboard shortcuts for undo/redo
        document.addEventListener('keydown', (e) => {
            // Only handle if flow builder is visible
            const flowContainer = document.getElementById('node-flow-container');
            if (!flowContainer || flowContainer.offsetParent === null) return;
            
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                } else if (e.key === 's') {
                    e.preventDefault();
                    this.saveFlow();
                }
            }
        });
        
        // Language selector - now switches flow
        const languageSelector = document.getElementById('nodeLanguageSelector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }
    }

    handleMouseDown(e) {
        console.log('🖱️ handleMouseDown triggered', e.target.className, e.target.tagName);
        
        // Handle node dragging
        const nodeElement = e.target.closest('.flow-node');
        console.log('🎯 nodeElement found:', nodeElement ? nodeElement.dataset.nodeId : 'none');
        
        if (nodeElement && !e.target.closest('.node-controls') && !e.target.closest('.disconnect-btn')) {
            const nodeId = nodeElement.dataset.nodeId;
            const node = this.nodes.find(n => n.id === nodeId);
            console.log('📦 node found:', node ? node.id : 'none');
            
            if (node) {
                console.log('✅ Starting drag for node:', nodeId);
                this.draggedNode = node;
                this.draggedNodeElement = nodeElement;
                const canvasRect = this.canvas.getBoundingClientRect();
                
                this.draggedNode.dragOffset = {
                    x: (e.clientX - canvasRect.left - this.panOffset.x) / this.zoom - node.position.x,
                    y: (e.clientY - canvasRect.top - this.panOffset.y) / this.zoom - node.position.y
                };
                
                // Add dragging class
                nodeElement.classList.add('dragging');
                
                e.preventDefault();
                return;
            }
        }
        
        // Handle canvas panning (if not clicking on node)
        if (e.button === 1) {
            // Middle mouse button for panning
            e.preventDefault();
            this.startPanning(e);
        } else if (e.button === 0 && !nodeElement) {
            // Left click on empty canvas for panning (only if not on a node)
            this.startPanning(e);
        }
    }

    handleClick(e) {
        const target = e.target;
        console.log('🔘 handleClick triggered', target.className, target.tagName);
        
        // Handle connection points
        if (target.classList.contains('connection-point')) {
            console.log('📌 Connection point clicked');
            this.handleConnectionPoint(target, e);
            e.stopPropagation();
            return;
        }
        
        // Handle node edit button (check for icon inside button too)
        const editBtn = target.closest('.node-edit-btn');
        if (editBtn || target.classList.contains('fa-edit')) {
            console.log('✏️ Edit button clicked');
            const nodeElement = target.closest('.flow-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                const node = this.nodes.find(n => n.id === nodeId);
                if (node) {
                    console.log('✏️ Editing node:', nodeId);
                    this.editNode(node);
                }
            }
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        
        // Handle node delete button (check for icon inside button too)
        const deleteBtn = target.closest('.node-delete-btn');
        if (deleteBtn || target.classList.contains('fa-trash')) {
            console.log('🗑️ Delete button clicked');
            const nodeElement = target.closest('.flow-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                if (confirm('Are you sure you want to delete this node?')) {
                    this.deleteNode(nodeId);
                }
            }
            e.stopPropagation();
            e.preventDefault();
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

        // Create intent detection node
        const intentNode = this.createNode({
            type: 'intent',
            position: { x: 400, y: 100 },
            data: {
                title: 'Intent Detection',
                intents: ['menu-help', 'ordering-help', 'technical-support', 'billing-question']
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
                    color: dept.color
                }
            });
        });

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
        // Don't re-render while dragging to prevent ghost nodes
        if (this.draggedNode) return;
        
        const nodesContainer = document.getElementById('flow-nodes');
        if (!nodesContainer) return;

        // Clear ALL existing nodes to prevent duplicates
        nodesContainer.innerHTML = '';

        this.nodes.forEach(node => {
            const nodeElement = this.createNodeElement(node);
            nodesContainer.appendChild(nodeElement);
        });
    }
    
    /**
     * Clear any duplicate node elements (ghost cleanup)
     */
    cleanupDuplicateNodes() {
        const nodeIds = new Set();
        document.querySelectorAll('.flow-node').forEach(el => {
            const nodeId = el.dataset.nodeId;
            if (nodeIds.has(nodeId)) {
                el.remove(); // Remove duplicate
            } else {
                nodeIds.add(nodeId);
            }
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

        // Direct mousedown handler for dragging
        nodeDiv.addEventListener('mousedown', (e) => {
            // Skip if clicking on controls or buttons
            if (e.target.closest('.node-controls') || e.target.closest('.disconnect-btn')) {
                return;
            }
            
            console.log('🎯 Node mousedown:', node.id);
            this.draggedNode = node;
            this.draggedNodeElement = nodeDiv;
            const canvasRect = this.canvas.getBoundingClientRect();
            
            this.draggedNode.dragOffset = {
                x: (e.clientX - canvasRect.left - this.panOffset.x) / this.zoom - node.position.x,
                y: (e.clientY - canvasRect.top - this.panOffset.y) / this.zoom - node.position.y
            };
            
            nodeDiv.classList.add('dragging');
            e.preventDefault();
        });

        return nodeDiv;
    }

    getNodeHTML(node) {
        const commonHTML = `
            <div class="node-header">
                <span class="node-title">${node.data.title}</span>
                <div class="node-controls">
                    <button class="node-btn node-edit-btn" title="Edit" onclick="event.stopPropagation(); nodeFlowBuilder.editNodeById('${node.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="node-btn node-delete-btn" title="Delete" onclick="event.stopPropagation(); nodeFlowBuilder.deleteNodeById('${node.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        switch (node.type) {
            case 'welcome':
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-message">${node.data.messages.english}</div>
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

            default:
                return commonHTML + `
                    <div class="node-content">
                        <div class="node-data">${JSON.stringify(node.data)}</div>
                    </div>
                    <div class="node-connections">
                        <div class="connection-point input" data-type="input"></div>
                        <div class="connection-point output" data-type="output"></div>
                    </div>
                `;
        }
    }

    renderConnections() {
        const svg = document.getElementById('flow-connections');
        if (!svg) return;
        
        svg.innerHTML = ''; // Clear existing connections
        
        // Remove ALL existing disconnect buttons from everywhere
        document.querySelectorAll('.disconnect-btn').forEach(btn => btn.remove());
        
        this.connections.forEach(connection => {
            const connectionElement = this.createConnectionElement(connection);
            svg.appendChild(connectionElement);
        });
        
        // Create disconnect buttons after all connections are rendered
        this.createDisconnectButtons();
    }

    createConnectionElement(connection) {
        const fromNode = this.nodes.find(node => node.id === connection.from);
        const toNode = this.nodes.find(node => node.id === connection.to);

        if (!fromNode || !toNode) return document.createElement('div');

        // Create SVG connection line
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'connection-line');
        svg.style.position = 'absolute';
        svg.style.pointerEvents = 'auto'; // 🔧 FIX 1: Enable pointer events on connection lines
        svg.style.zIndex = '1';

        // Calculate connection points
        const fromX = fromNode.position.x + 150; // Node width/2
        const fromY = fromNode.position.y + 50;  // Node height/2
        const toX = toNode.position.x;
        const toY = toNode.position.y + 50;

        // Set SVG dimensions and position
        const minX = Math.min(fromX, toX);
        const minY = Math.min(fromY, toY);
        const width = Math.abs(toX - fromX) + 20;
        const height = Math.abs(toY - fromY) + 20;

        svg.style.left = (minX - 10) + 'px';
        svg.style.top = (minY - 10) + 'px';
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);

        // Create curved path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = fromX - minX + 10;
        const startY = fromY - minY + 10;
        const endX = toX - minX + 10;
        const endY = toY - minY + 10;

        const controlPoint1X = startX + (endX - startX) * 0.5;
        const controlPoint1Y = startY;
        const controlPoint2X = endX - (endX - startX) * 0.5;
        const controlPoint2Y = endY;

        const pathData = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#6272a4');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.classList.add('connection-line');
        path.style.cursor = 'pointer';
        path.setAttribute('data-connection-id', connection.id);
        
        // Add invisible wider path for easier clicking
        const invisiblePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        invisiblePath.setAttribute('d', pathData);
        invisiblePath.setAttribute('stroke', 'transparent');
        invisiblePath.setAttribute('stroke-width', '12');
        invisiblePath.setAttribute('fill', 'none');
        invisiblePath.classList.add('connection-line');
        invisiblePath.style.cursor = 'pointer';
        invisiblePath.setAttribute('data-connection-id', connection.id);
        
        // Add hover effect and click handler to both paths
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
            console.log('Connection clicked! Event target:', e.target);
            console.log('Connection ID from path:', path.getAttribute('data-connection-id'));
            console.log('Connection ID from invisible:', invisiblePath.getAttribute('data-connection-id'));
            
            const connectionId = connection.id;
            console.log('Using connection ID:', connectionId, 'from:', fromNode.id, 'to:', toNode.id);
            
            if (connectionId) {
                this.showConnectionRemovalDialog(connectionId, fromNode, toNode);
            } else {
                console.error('No connection ID found');
            }
        };
        
        // Add event listeners to both paths
        path.addEventListener('mouseenter', handleMouseEnter);
        path.addEventListener('mouseleave', handleMouseLeave);
        path.addEventListener('click', handleConnectionClick);
        
        invisiblePath.addEventListener('mouseenter', handleMouseEnter);
        invisiblePath.addEventListener('mouseleave', handleMouseLeave);
        invisiblePath.addEventListener('click', handleConnectionClick);

        svg.appendChild(invisiblePath); // Add invisible clickable area first
        svg.appendChild(path); // Add visible path on top

        return svg;
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
            
            // Calculate midpoint of connection line (matches createConnectionElement)
            const startX = fromNode.position.x + 150; // Right side of from node
            const startY = fromNode.position.y + 50;
            const endX = toNode.position.x; // Left side of to node
            const endY = toNode.position.y + 50;
            
            // Position at midpoint of the connection line
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            console.log(`Connection ${connection.id}: from (${startX}, ${startY}) to (${endX}, ${endY}), mid (${midX}, ${midY})`);
            
            // Create simple red button
            const btn = document.createElement('div');
            btn.className = 'disconnect-btn';
            btn.innerHTML = '×';
            btn.dataset.connectionId = connection.id;
            
            // Apply styles directly for reliable positioning
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
            btn.style.zIndex = '10000';
            btn.style.transform = 'translate(-50%, -50%)';
            btn.style.border = '2px solid white';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            btn.style.pointerEvents = 'auto'; // Ensure clickable
            
            // Add click handler
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Disconnect button clicked for:', connection.id);
                this.removeConnection(connection.id);
            };
            
            // Add to flow-nodes container (same level as nodes, inside workspace)
            const nodesContainer = document.getElementById('flow-nodes');
            if (nodesContainer) {
                nodesContainer.appendChild(btn);
            } else if (this.workspace) {
                this.workspace.appendChild(btn);
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
        const language = document.getElementById('nodeLanguageSelector')?.value || this.currentLanguage;
        
        const flowData = {
            nodes: this.nodes,
            connections: this.connections,
            language: language,
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                language: language
            }
        };

        // Save to multi-language storage
        this.flowsByLanguage[language] = flowData;
        
        // Save to localStorage (with language key)
        localStorage.setItem(`fooodis-node-flow-${language}`, JSON.stringify(flowData));
        localStorage.setItem('fooodis-node-flow', JSON.stringify(flowData)); // Keep for backwards compat

        // Also save to chatbot manager to integrate with existing system
        if (window.chatbotManager) {
            window.chatbotManager.updateNodeFlow(flowData);
        }
        
        // Save to cloud
        this.saveFlowToCloud(flowData);
        
        // Add to undo history
        this.addToHistory();

        this.showToast(`Flow saved (${language.toUpperCase()})`, 'success');
    }
    
    /**
     * Save flow to cloud storage
     */
    async saveFlowToCloud(flowData) {
        console.log('☁️ saveFlowToCloud called with:', flowData.nodes?.length, 'nodes,', flowData.connections?.length, 'connections');
        try {
            const payload = {
                language: flowData.language || this.currentLanguage,
                name: `${(flowData.language || 'en').toUpperCase()} Flow`,
                nodes: flowData.nodes,
                connections: flowData.connections,
                isActive: true
            };
            console.log('☁️ Sending to /api/chatbot/flows:', payload);
            
            const response = await fetch('/api/chatbot/flows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            console.log('☁️ Response from server:', result);
            
            if (response.ok && result.success) {
                console.log('✅ Flow saved to cloud successfully');
                this.showToast('Flow saved to cloud!', 'success');
            } else {
                console.warn('⚠️ Failed to save flow to cloud:', result.error);
                this.showToast('Cloud save failed: ' + (result.error || 'Unknown error'), 'warning');
            }
        } catch (error) {
            console.error('❌ Error saving flow to cloud:', error);
            this.showToast('Cloud save error: ' + error.message, 'error');
        }
    }
    
    /**
     * Load flow from cloud storage
     */
    async loadFlowFromCloud() {
        try {
            const response = await fetch('/api/chatbot/flows');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.flowsByLanguage) {
                    // Store all language flows
                    if (result.flowsByLanguage.en) {
                        this.flowsByLanguage.en = result.flowsByLanguage.en;
                    }
                    if (result.flowsByLanguage.sv) {
                        this.flowsByLanguage.sv = result.flowsByLanguage.sv;
                    }
                    
                    // Load current language flow
                    const currentFlow = this.flowsByLanguage[this.currentLanguage];
                    if (currentFlow) {
                        this.nodes = currentFlow.nodes || [];
                        this.connections = currentFlow.connections || [];
                        console.log('✅ Flow loaded from cloud:', this.nodes.length, 'nodes');
                        return true;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load from cloud, using localStorage:', error.message);
        }
        
        // Fallback to localStorage
        this.loadFlow();
        return false;
    }

    loadFlow() {
        const language = this.currentLanguage;
        let savedFlow = localStorage.getItem(`fooodis-node-flow-${language}`);
        
        // Fallback to default key
        if (!savedFlow) {
            savedFlow = localStorage.getItem('fooodis-node-flow');
        }
        
        if (savedFlow) {
            try {
                const flowData = JSON.parse(savedFlow);
                this.nodes = flowData.nodes || [];
                this.connections = flowData.connections || [];
                
                // Store in language-specific storage
                this.flowsByLanguage[language] = flowData;
                
                // Set language if language selector exists
                const languageSelector = document.getElementById('nodeLanguageSelector');
                if (languageSelector && flowData.metadata && flowData.metadata.language) {
                    languageSelector.value = flowData.metadata.language;
                }
                
                this.renderNodes();
                this.renderConnections();
                console.log('Loaded flow with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
            } catch (error) {
                console.error('Error loading saved flow:', error);
            }
        } else {
            console.log('No saved flow found, starting with default nodes');
        }
    }
    
    /**
     * Switch language and load appropriate flow
     */
    switchLanguage(language) {
        // Save current flow first
        const currentLanguage = this.currentLanguage;
        this.flowsByLanguage[currentLanguage] = {
            nodes: this.nodes,
            connections: this.connections,
            language: currentLanguage
        };
        
        // Switch to new language
        this.currentLanguage = language;
        
        // Load the flow for new language
        const newFlow = this.flowsByLanguage[language];
        if (newFlow) {
            this.nodes = newFlow.nodes || [];
            this.connections = newFlow.connections || [];
        } else {
            // Create empty flow for this language
            this.nodes = [];
            this.connections = [];
            this.createDefaultFlow();
        }
        
        this.renderNodes();
        this.renderConnections();
        this.showToast(`Switched to ${language.toUpperCase()} flow`, 'info');
    }
    
    /**
     * Add current state to undo history
     */
    addToHistory() {
        // Remove any future states if we're in the middle of history
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add current state
        this.history.push({
            nodes: JSON.parse(JSON.stringify(this.nodes)),
            connections: JSON.parse(JSON.stringify(this.connections))
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        
        this.historyIndex = this.history.length - 1;
    }
    
    /**
     * Undo last action
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.nodes = JSON.parse(JSON.stringify(state.nodes));
            this.connections = JSON.parse(JSON.stringify(state.connections));
            this.renderNodes();
            this.renderConnections();
            this.showToast('Undo', 'info');
        }
    }
    
    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.nodes = JSON.parse(JSON.stringify(state.nodes));
            this.connections = JSON.parse(JSON.stringify(state.connections));
            this.renderNodes();
            this.renderConnections();
            this.showToast('Redo', 'info');
        }
    }

    testFlow() {
        // Open a test preview modal
        const modal = document.createElement('div');
        modal.className = 'test-flow-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Test Flow Preview</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="test-chat-container">
                        <div class="test-chat-messages" id="test-chat-messages"></div>
                        <div class="test-chat-input">
                            <input type="text" id="test-message-input" placeholder="Type a message to test the flow...">
                            <button onclick="nodeFlowBuilder.sendTestMessage()">Send</button>
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
    }

    initializeTestFlow() {
        const messagesContainer = document.getElementById('test-chat-messages');
        const welcomeNode = this.nodes.find(node => node.type === 'welcome');
        
        if (welcomeNode) {
            const language = document.getElementById('nodeLanguageSelector').value;
            const message = welcomeNode.data.messages[language] || welcomeNode.data.messages.english;
            
            messagesContainer.innerHTML = `
                <div class="test-message bot">
                    <div class="message-content">${message}</div>
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
        userMessage.innerHTML = `<div class="message-content">${message}</div>`;
        messagesContainer.appendChild(userMessage);

        // Simulate bot response based on flow
        setTimeout(() => {
            const botResponse = this.processTestMessage(message);
            const botMessage = document.createElement('div');
            botMessage.className = 'test-message bot';
            botMessage.innerHTML = `<div class="message-content">${botResponse}</div>`;
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);

        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    
    // Helper method for onclick handlers
    editNodeById(nodeId) {
        console.log('✏️ editNodeById called:', nodeId);
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            this.editNode(node);
        } else {
            console.error('Node not found:', nodeId);
        }
    }
    
    // Helper method for onclick handlers
    deleteNodeById(nodeId) {
        console.log('🗑️ deleteNodeById called:', nodeId);
        if (confirm('Are you sure you want to delete this node?')) {
            this.deleteNode(nodeId);
        }
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
                    <button type="button" class="btn btn-primary modal-update" data-node-id="${node.id}">Update Node</button>
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
        });
        
        // Handle department change for handoff nodes
        const departmentSelect = modal.querySelector('#edit-department');
        if (departmentSelect) {
            departmentSelect.addEventListener('change', () => this.updateAgentsList(departmentSelect.value));
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
                    <div class="form-group">
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
                                            <input type="checkbox" value="${intent}" ${node.data.intents.includes(intent) ? 'checked' : ''}>
                                            ${intent}
                                        </label>
                                    `).join('')}
                                </div>
                            `).join('')}
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
        node.data.title = document.getElementById('edit-node-title').value;

        // Update type-specific fields
        switch (node.type) {
            case 'welcome':
                node.data.messages.english = document.getElementById('edit-message-en').value;
                node.data.messages.swedish = document.getElementById('edit-message-sv').value;
                break;
                
            case 'handoff':
                const selectedDept = document.getElementById('edit-department').value;
                const selectedAgent = document.getElementById('edit-agent').value;
                const handoffMessage = document.getElementById('edit-handoff-message').value;
                const dept = this.masterTemplate.departments.find(d => d.id === selectedDept);
                
                node.data.department = selectedDept;
                node.data.selectedAgent = selectedAgent;
                node.data.handoffMessage = handoffMessage || 'Transferring you to a human agent...';
                node.data.agents = dept ? dept.agents : [];
                node.data.color = dept ? dept.color : '#34495e';
                
                // Validate and serialize node data properly
                node.data = this.validateNodeData(node.type, node.data);
                break;
                
            case 'intent':
                const checkedIntents = Array.from(document.querySelectorAll('.intent-checkboxes input:checked'))
                    .map(input => input.value);
                node.data.intents = checkedIntents;
                break;
        }

        this.renderNodes();
        document.querySelector('.node-modal').remove();
        this.showToast('Node updated successfully', 'success');
        this.autoSave(); // 🔧 FIX 3: Auto-save when updating node
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
        // Handle canvas panning (middle mouse or space+drag)
        if (this.isPanning) {
            const dx = e.clientX - this.panStart.x;
            const dy = e.clientY - this.panStart.y;
            
            this.panOffset.x = this.panStartOffset.x + dx;
            this.panOffset.y = this.panStartOffset.y + dy;
            
            this.updateWorkspaceTransform();
        }
        
        // Handle node dragging
        if (this.draggedNode) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panOffset.x) / this.zoom;
            const y = (e.clientY - rect.top - this.panOffset.y) / this.zoom;
            
            this.draggedNode.position.x = x - this.draggedNode.dragOffset.x;
            this.draggedNode.position.y = y - this.draggedNode.dragOffset.y;
            
            // Clear any duplicate node elements before updating position
            const allNodeElements = document.querySelectorAll(`[data-node-id="${this.draggedNode.id}"]`);
            if (allNodeElements.length > 1) {
                // Remove all but the first element
                for (let i = 1; i < allNodeElements.length; i++) {
                    allNodeElements[i].remove();
                }
            }
            
            // Update only the dragged node's position
            const nodeElement = document.querySelector(`[data-node-id="${this.draggedNode.id}"]`);
            if (nodeElement) {
                nodeElement.style.left = this.draggedNode.position.x + 'px';
                nodeElement.style.top = this.draggedNode.position.y + 'px';
            }
            
            this.renderConnections(); // Update connections when nodes move
        }
        
        // Update temp connection line
        if (this.isConnecting) {
            this.updateTempConnectionLine(e.clientX, e.clientY);
        }
    }

    handleCanvasMouseUp(e) {
        // Stop panning
        if (this.isPanning) {
            this.stopPanning();
        }
        
        this.isDragging = false;
        if (this.draggedNode) {
            // Remove dragging class
            if (this.draggedNodeElement) {
                this.draggedNodeElement.classList.remove('dragging');
            }
            
            this.draggedNode = null;
            this.draggedNodeElement = null;
            
            // Clean up any ghost/duplicate nodes
            this.cleanupDuplicateNodes();
            
            // Re-render to ensure clean state
            this.renderNodes();
            this.renderConnections();
            
            this.autoSave();
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
        const newNode = this.createNode({
            type,
            position: { x: 200, y: 200 },
            data: this.getDefaultNodeData(type)
        });
        
        this.nodes.push(newNode);
        
        // Force a complete re-render to avoid DOM inconsistencies
        // This ensures header-added nodes behave the same as template nodes
        this.renderNodes();
        
        this.autoSave(); // Auto-save when adding node
        this.showToast(`${type} node added`, 'success');
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

    updateZoom(delta) {
        this.zoom += delta;
        this.zoom = Math.max(0.25, Math.min(this.zoom, 2));
        
        this.updateWorkspaceTransform();
        
        const zoomLevel = document.querySelector('.canvas-zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }
    
    /**
     * Update workspace transform with current zoom and pan
     */
    updateWorkspaceTransform() {
        if (this.workspace) {
            this.workspace.style.transform = `translate(${this.panOffset.x}px, ${this.panOffset.y}px) scale(${this.zoom})`;
            this.workspace.style.transformOrigin = '0 0';
        }
    }

    handleCanvasMouseDown(e) {
        // Middle mouse button for panning
        if (e.button === 1) {
            e.preventDefault();
            this.startPanning(e);
        }
        // Left click on empty canvas for panning (not on nodes)
        if (e.button === 0 && e.target.classList.contains('node-flow-canvas')) {
            this.startPanning(e);
        }
    }
    
    /**
     * Start panning the canvas
     */
    startPanning(e) {
        this.isPanning = true;
        this.panStart = { x: e.clientX, y: e.clientY };
        this.panStartOffset = { x: this.panOffset.x, y: this.panOffset.y };
        this.canvas.classList.add('panning');
    }
    
    /**
     * Stop panning the canvas
     */
    stopPanning() {
        this.isPanning = false;
        this.canvas?.classList.remove('panning');
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
        
        this.updateWorkspaceTransform();
        
        const zoomLevel = document.querySelector('.canvas-zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = '100%';
        }
    }

    autoSave() {
        // Debounce auto-save to prevent excessive saves
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.saveFlow();
            console.log('Auto-saved flow with', this.nodes.length, 'nodes and', this.connections.length, 'connections');
        }, 500); // Save after 500ms of inactivity
    }
}

// Initialize the node flow builder
let nodeFlowBuilder;

// Export for global access
if (typeof window !== 'undefined') {
    window.NodeFlowBuilder = NodeFlowBuilder;
}
